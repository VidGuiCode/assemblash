//! A local font store: a directory, pinned by content hash.
//!
//! The document has been reproducible since v0.1.0, but a document is only
//! half the input to a render — the font files are the other half. A font that
//! is replaced underneath a project changes the pixels without changing
//! anything the document records. The store closes that gap the same way
//! `assets/` does for images:
//!
//! ```text
//! fonts/
//!   index.json
//!   3f8a…c1.ttf
//! ```
//!
//! Every file is named by the hash of its own bytes, and `index.json` records
//! which family each one provides, where it came from, and under what licence.
//! [`FontStore::verify`] re-hashes everything and says exactly which file
//! changed.
//!
//! Nothing here reaches the network and nothing here is on the render path.
//! Installing fonts is a separate, explicit act ([`crate::install`]).

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use resvg::usvg::fontdb;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::RenderError;
use crate::raster::LoadedFonts;

/// Index file at the root of a store.
pub const INDEX_FILE: &str = "index.json";

/// Format version of `index.json`.
///
/// Independent of both the release version and the document `schemaVersion`:
/// the store is a cache of files the user can rebuild by re-importing, so it
/// versions itself.
pub const INDEX_VERSION: u32 = 1;

/// Something that went wrong reading, writing, or using a font store.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum FontStoreError {
    /// A file could not be read or written.
    #[error("{operation} {path}: {source}")]
    Io {
        /// What was being attempted, e.g. `reading`.
        operation: &'static str,
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },

    /// `index.json` is not readable as an index.
    #[error("{path} is not a readable font index: {source}")]
    MalformedIndex {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: serde_json::Error,
    },

    /// The index was written by a newer build.
    #[error("font store at {path} uses index version {found}, this build understands {supported}")]
    UnsupportedIndexVersion {
        /// Store involved.
        path: PathBuf,
        /// Version found in the file.
        found: u32,
        /// Version this build writes.
        supported: u32,
    },

    /// A file offered for import is not a font this build can read.
    #[error("{path} is not a font file this build can read")]
    NotAFont {
        /// The file that was offered.
        path: PathBuf,
    },

    /// A compressed web font could not be decompressed.
    #[error("{path} is a {format} file that could not be decompressed")]
    Undecompressable {
        /// The file that was offered.
        path: PathBuf,
        /// `WOFF` or `WOFF2`.
        format: &'static str,
    },

    /// A stored font file no longer hashes to what the index records.
    #[error("font {file} changed on disk: recorded {expected}, found {actual}")]
    HashMismatch {
        /// File in the store.
        file: String,
        /// Hash the index records.
        expected: String,
        /// Hash of the file as it is now.
        actual: String,
    },

    /// The index names a file that is not there.
    #[error("font {file} is missing from the store at {path}")]
    MissingFile {
        /// File the index names.
        file: String,
        /// Store involved.
        path: PathBuf,
    },

    /// A render asked for a family the store does not have.
    ///
    /// The one error the exit test for this milestone turns on: a font that is
    /// not installed is refused, never quietly replaced with something else.
    #[error("font family {family:?} is not in the font store at {path}")]
    UnknownFamily {
        /// The family that was asked for.
        family: String,
        /// Store involved.
        path: PathBuf,
    },
}

impl FontStoreError {
    fn io(operation: &'static str, path: impl Into<PathBuf>, source: std::io::Error) -> Self {
        Self::Io {
            operation,
            path: path.into(),
            source,
        }
    }
}

/// One face held by a store.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontRecord {
    /// Family name, as the document must spell it.
    pub family: String,
    /// `normal`, `italic`, or `oblique`.
    pub style: String,
    /// CSS weight, 100–900.
    pub weight: u16,
    /// File name inside the store, `<hex>.<extension>`.
    pub file: String,
    /// Content hash of that file, `sha256:<hex>`.
    pub hash: String,
    /// Which face inside the file this record describes; 0 unless a collection.
    pub face_index: u32,
    /// Where the file came from, for a human reading the index later.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    /// Licence the file is distributed under, when it is known.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub license: Option<String>,
}

/// The contents of `index.json`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontIndex {
    /// Format version of this file.
    pub version: u32,
    /// Every face in the store, sorted.
    #[serde(default)]
    pub fonts: Vec<FontRecord>,
}

impl Default for FontIndex {
    fn default() -> Self {
        Self {
            version: INDEX_VERSION,
            fonts: Vec::new(),
        }
    }
}

/// A directory of hash-pinned font files.
#[derive(Debug, Clone)]
pub struct FontStore {
    directory: PathBuf,
    index: FontIndex,
}

impl FontStore {
    /// Opens a store, creating an empty one if the directory has no index yet.
    pub fn open(directory: impl Into<PathBuf>) -> Result<Self, FontStoreError> {
        let directory = directory.into();
        let index_path = directory.join(INDEX_FILE);

        if !index_path.is_file() {
            return Ok(Self {
                directory,
                index: FontIndex::default(),
            });
        }

        let json = std::fs::read_to_string(&index_path)
            .map_err(|e| FontStoreError::io("reading", &index_path, e))?;
        let index: FontIndex =
            serde_json::from_str(&json).map_err(|source| FontStoreError::MalformedIndex {
                path: index_path.clone(),
                source,
            })?;
        if index.version > INDEX_VERSION {
            return Err(FontStoreError::UnsupportedIndexVersion {
                path: directory,
                found: index.version,
                supported: INDEX_VERSION,
            });
        }

        Ok(Self { directory, index })
    }

    /// The directory this store lives in.
    pub fn directory(&self) -> &Path {
        &self.directory
    }

    /// Every face in the store, sorted by family, then style, then weight.
    pub fn records(&self) -> &[FontRecord] {
        &self.index.fonts
    }

    /// The family names available, sorted and without duplicates.
    pub fn families(&self) -> Vec<String> {
        self.index
            .fonts
            .iter()
            .map(|record| record.family.clone())
            .collect::<BTreeSet<_>>()
            .into_iter()
            .collect()
    }

    /// Whether the store can supply a family.
    pub fn has_family(&self, family: &str) -> bool {
        self.index
            .fonts
            .iter()
            .any(|record| record.family == family)
    }

    /// Absolute path of a stored file.
    pub fn file_path(&self, file: &str) -> PathBuf {
        self.directory.join(file)
    }

    /// Imports a font file, returning the faces it added.
    ///
    /// A WOFF or WOFF2 file is decompressed first and the *decompressed* bytes
    /// are what get stored and hashed — the same rule SVG import follows, so
    /// the hash always describes what is actually on disk, and nothing has to
    /// decompress anything at render time.
    ///
    /// Re-importing identical bytes replaces an identical file rather than
    /// accumulating copies, and does not duplicate index entries.
    pub fn import_file(
        &mut self,
        path: &Path,
        source: Option<String>,
        license: Option<String>,
    ) -> Result<Vec<FontRecord>, FontStoreError> {
        let bytes = std::fs::read(path).map_err(|e| FontStoreError::io("reading", path, e))?;
        self.import_bytes(
            &bytes,
            path,
            source.or_else(|| {
                path.file_name()
                    .map(|name| name.to_string_lossy().into_owned())
            }),
            license,
        )
    }

    /// Imports font bytes. `origin` is only used to describe errors.
    pub fn import_bytes(
        &mut self,
        bytes: &[u8],
        origin: &Path,
        source: Option<String>,
        license: Option<String>,
    ) -> Result<Vec<FontRecord>, FontStoreError> {
        let bytes = decompress_web_font(bytes, origin)?;

        // Parsed with the same database the renderer uses, so a file that
        // imports cleanly is a file that will resolve at render time. Anything
        // it cannot read is refused here rather than becoming a mysterious
        // missing family later.
        let mut database = fontdb::Database::new();
        database.load_font_data(bytes.clone());
        if database.is_empty() {
            return Err(FontStoreError::NotAFont {
                path: origin.to_path_buf(),
            });
        }

        let hash = hash_bytes(&bytes);
        let extension = font_extension(&bytes);
        let file = format!("{}.{extension}", hash.trim_start_matches("sha256:"));

        std::fs::create_dir_all(&self.directory)
            .map_err(|e| FontStoreError::io("creating", &self.directory, e))?;
        let destination = self.directory.join(&file);
        std::fs::write(&destination, &bytes)
            .map_err(|e| FontStoreError::io("writing", &destination, e))?;

        let mut added = Vec::new();
        for face in database.faces() {
            for (family, _) in &face.families {
                let record = FontRecord {
                    family: family.clone(),
                    style: match face.style {
                        fontdb::Style::Normal => "normal",
                        fontdb::Style::Italic => "italic",
                        fontdb::Style::Oblique => "oblique",
                    }
                    .to_owned(),
                    weight: face.weight.0,
                    file: file.clone(),
                    hash: hash.clone(),
                    face_index: face.index,
                    source: source.clone(),
                    license: license.clone(),
                };
                if !self.index.fonts.contains(&record) {
                    self.index.fonts.push(record.clone());
                }
                added.push(record);
            }
        }

        self.write_index()?;
        Ok(added)
    }

    /// Removes every face a family provides, and any file left unreferenced.
    ///
    /// Returns the number of index entries removed.
    pub fn remove_family(&mut self, family: &str) -> Result<usize, FontStoreError> {
        let before = self.index.fonts.len();
        self.index.fonts.retain(|record| record.family != family);
        let removed = before - self.index.fonts.len();
        if removed == 0 {
            return Ok(0);
        }

        let still_used: BTreeSet<&str> = self
            .index
            .fonts
            .iter()
            .map(|record| record.file.as_str())
            .collect();
        for file in std::fs::read_dir(&self.directory)
            .map_err(|e| FontStoreError::io("reading", &self.directory, e))?
        {
            let entry = file.map_err(|e| FontStoreError::io("reading", &self.directory, e))?;
            let name = entry.file_name().to_string_lossy().into_owned();
            if name != INDEX_FILE && !still_used.contains(name.as_str()) {
                std::fs::remove_file(entry.path())
                    .map_err(|e| FontStoreError::io("removing", entry.path(), e))?;
            }
        }

        self.write_index()?;
        Ok(removed)
    }

    /// Re-hashes every stored file and reports the first that no longer
    /// matches the index.
    ///
    /// A font edited or swapped behind the engine's back would change rendered
    /// output without changing any document — precisely the surprise
    /// determinism exists to rule out.
    pub fn verify(&self) -> Result<(), FontStoreError> {
        let mut checked: BTreeMap<&str, ()> = BTreeMap::new();
        for record in &self.index.fonts {
            if checked.insert(record.file.as_str(), ()).is_some() {
                continue;
            }
            let path = self.file_path(&record.file);
            if !path.is_file() {
                return Err(FontStoreError::MissingFile {
                    file: record.file.clone(),
                    path: self.directory.clone(),
                });
            }
            let bytes =
                std::fs::read(&path).map_err(|e| FontStoreError::io("reading", &path, e))?;
            let actual = hash_bytes(&bytes);
            if actual != record.hash {
                return Err(FontStoreError::HashMismatch {
                    file: record.file.clone(),
                    expected: record.hash.clone(),
                    actual,
                });
            }
        }
        Ok(())
    }

    /// Loads every font in the store.
    pub fn load_all(&self) -> Result<LoadedFonts, RenderError> {
        let mut files: Vec<PathBuf> = self
            .index
            .fonts
            .iter()
            .map(|record| self.file_path(&record.file))
            .collect();
        files.sort();
        files.dedup();
        LoadedFonts::from_files(files)
    }

    /// Loads exactly the families named, refusing any the store does not have.
    ///
    /// Loading only what a document asks for keeps a render independent of
    /// whatever else happens to be installed: adding an unrelated family to
    /// the store must not change an existing document's pixels.
    pub fn load_families<I, S>(&self, families: I) -> Result<LoadedFonts, FontStoreError>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        let mut files: Vec<PathBuf> = Vec::new();
        for family in families {
            let family = family.as_ref();
            let mut found = false;
            for record in &self.index.fonts {
                if record.family == family {
                    found = true;
                    files.push(self.file_path(&record.file));
                }
            }
            if !found {
                return Err(FontStoreError::UnknownFamily {
                    family: family.to_owned(),
                    path: self.directory.clone(),
                });
            }
        }
        // Sorted and deduplicated, so two callers naming the same families in
        // different orders load the same files in the same order.
        files.sort();
        files.dedup();
        LoadedFonts::from_files(files).map_err(|error| match error {
            RenderError::FontFile { path, source } => FontStoreError::Io {
                operation: "reading",
                path,
                source,
            },
            other => FontStoreError::Io {
                operation: "loading",
                path: self.directory.clone(),
                source: std::io::Error::other(other.to_string()),
            },
        })
    }

    /// Writes `index.json`, sorted and with a trailing newline.
    fn write_index(&mut self) -> Result<(), FontStoreError> {
        self.index.fonts.sort_by(|a, b| {
            (&a.family, &a.style, a.weight, &a.file, a.face_index).cmp(&(
                &b.family,
                &b.style,
                b.weight,
                &b.file,
                b.face_index,
            ))
        });
        self.index.fonts.dedup();
        self.index.version = INDEX_VERSION;

        std::fs::create_dir_all(&self.directory)
            .map_err(|e| FontStoreError::io("creating", &self.directory, e))?;
        let path = self.directory.join(INDEX_FILE);
        let mut json = serde_json::to_string_pretty(&self.index).map_err(|source| {
            FontStoreError::MalformedIndex {
                path: path.clone(),
                source,
            }
        })?;
        json.push('\n');

        // Written to a temporary file and renamed, so an interrupted write
        // leaves the previous index intact rather than a half-written one.
        let temporary = self.directory.join(format!("{INDEX_FILE}.tmp"));
        std::fs::write(&temporary, json)
            .map_err(|e| FontStoreError::io("writing", &temporary, e))?;
        std::fs::rename(&temporary, &path)
            .map_err(|e| FontStoreError::io("replacing", &path, e))?;
        Ok(())
    }
}

/// Turns WOFF/WOFF2 bytes into plain OpenType bytes, passing anything else
/// through untouched.
fn decompress_web_font(bytes: &[u8], origin: &Path) -> Result<Vec<u8>, FontStoreError> {
    match bytes.get(..4) {
        Some(b"wOFF") => {
            wuff::decompress_woff1(bytes).map_err(|_| FontStoreError::Undecompressable {
                path: origin.to_path_buf(),
                format: "WOFF",
            })
        }
        Some(b"wOF2") => {
            wuff::decompress_woff2(bytes).map_err(|_| FontStoreError::Undecompressable {
                path: origin.to_path_buf(),
                format: "WOFF2",
            })
        }
        _ => Ok(bytes.to_vec()),
    }
}

/// The extension a stored file gets, from what its bytes actually are.
///
/// The name a font arrived under is not evidence — an `.otf` that is really a
/// TrueType outline is common — so the sfnt tag decides.
fn font_extension(bytes: &[u8]) -> &'static str {
    match bytes.get(..4) {
        Some(b"ttcf") => "ttc",
        Some(b"OTTO") => "otf",
        _ => "ttf",
    }
}

/// Hashes bytes into the `sha256:<hex>` form the index records.
///
/// The same form `assemblash-core` uses for assets, so a person reading either
/// file sees the same kind of value.
pub fn hash_bytes(bytes: &[u8]) -> String {
    use std::fmt::Write as _;
    let digest = Sha256::digest(bytes);
    let mut out = String::with_capacity(7 + digest.len() * 2);
    out.push_str("sha256:");
    for byte in digest {
        let _ = write!(out, "{byte:02x}");
    }
    out
}
