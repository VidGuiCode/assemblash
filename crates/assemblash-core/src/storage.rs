//! Project persistence: a directory, not a database.
//!
//! A project is a plain directory (FR-9):
//!
//! ```text
//! my-project/
//!   document.json
//!   assets/
//!     3f8a…c1.png
//! ```
//!
//! Everything is a readable file the user owns. Assets are *copied* in and
//! named by content hash, so importing the same file twice costs one copy and
//! a document can never point at something outside the project (PRD §10.1).

use std::path::{Path, PathBuf};

use sha2::{Digest, Sha256};

use crate::document::{Asset, Document, Extras, LayerKind};
use crate::error::ValidationErrors;
use crate::ids::{AssetId, IdSource};
use crate::validate::validate;
use crate::SCHEMA_VERSION;

/// File holding the document, at the root of a project directory.
pub const DOCUMENT_FILE: &str = "document.json";

/// Directory holding imported assets, at the root of a project directory.
pub const ASSETS_DIR: &str = "assets";

/// Something that went wrong reading or writing a project.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum StorageError {
    /// The directory has no `document.json`.
    #[error("{path} is not an Assemblash project: no {DOCUMENT_FILE}")]
    NotAProject {
        /// Directory that was opened.
        path: PathBuf,
    },

    /// A file could not be read or written.
    #[error("{operation} {path}: {source}")]
    Io {
        /// What was being attempted, e.g. `reading` or `writing`.
        operation: &'static str,
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },

    /// `document.json` is not valid JSON, or does not match the schema.
    #[error("{path} is not a readable document: {source}")]
    MalformedDocument {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: serde_json::Error,
    },

    /// The document parsed, but is not valid.
    #[error("{path}: {source}")]
    InvalidDocument {
        /// File involved.
        path: PathBuf,
        /// What was wrong.
        source: ValidationErrors,
    },

    /// An asset entry has no file behind it.
    #[error("asset {asset} is missing its file at {path}")]
    MissingAssetFile {
        /// Asset entry that dangles.
        asset: AssetId,
        /// Where the file should have been.
        path: PathBuf,
    },

    /// An asset file's contents no longer match the hash recorded for it.
    #[error("asset {asset} changed on disk: recorded {expected}, found {actual}")]
    AssetHashMismatch {
        /// Asset entry involved.
        asset: AssetId,
        /// Hash recorded in the document.
        expected: String,
        /// Hash of the file as it is now.
        actual: String,
    },

    /// An import source has no usable file extension.
    #[error("cannot import {path}: a file extension is required to record the media type")]
    UnknownAssetType {
        /// The file that was to be imported.
        path: PathBuf,
    },
}

impl StorageError {
    fn io(operation: &'static str, path: impl Into<PathBuf>, source: std::io::Error) -> Self {
        Self::Io {
            operation,
            path: path.into(),
            source,
        }
    }
}

/// Writes a document to a project directory, creating it if needed.
///
/// The write goes to a temporary file and is then renamed over the old one:
/// an interrupted save leaves the previous document intact rather than a
/// half-written file.
pub fn save(document: &Document, project_dir: &Path) -> Result<(), StorageError> {
    let document_path = project_dir.join(DOCUMENT_FILE);
    validate(document).map_err(|source| StorageError::InvalidDocument {
        path: document_path.clone(),
        source,
    })?;

    std::fs::create_dir_all(project_dir.join(ASSETS_DIR))
        .map_err(|e| StorageError::io("creating", project_dir.join(ASSETS_DIR), e))?;

    let mut json = serde_json::to_string_pretty(document).map_err(|source| {
        StorageError::MalformedDocument {
            path: document_path.clone(),
            source,
        }
    })?;
    json.push('\n');

    let temporary = project_dir.join(format!("{DOCUMENT_FILE}.tmp"));
    std::fs::write(&temporary, json).map_err(|e| StorageError::io("writing", &temporary, e))?;
    std::fs::rename(&temporary, &document_path)
        .map_err(|e| StorageError::io("replacing", &document_path, e))?;

    Ok(())
}

/// Reads a document from a project directory.
///
/// Checks, in order: the file exists, it parses, it is valid (which includes
/// the `schemaVersion` check), and every asset entry has a file. Asset
/// contents are not hashed here — that is [`verify_assets`], which costs a
/// full read of every asset.
pub fn load(project_dir: &Path) -> Result<Document, StorageError> {
    let document_path = project_dir.join(DOCUMENT_FILE);
    if !document_path.is_file() {
        return Err(StorageError::NotAProject {
            path: project_dir.to_path_buf(),
        });
    }

    let json = std::fs::read_to_string(&document_path)
        .map_err(|e| StorageError::io("reading", &document_path, e))?;

    let document: Document =
        serde_json::from_str(&json).map_err(|source| StorageError::MalformedDocument {
            path: document_path.clone(),
            source,
        })?;

    validate(&document).map_err(|source| StorageError::InvalidDocument {
        path: document_path.clone(),
        source,
    })?;

    for asset in &document.assets {
        let path = asset_path(project_dir, asset);
        if !path.is_file() {
            return Err(StorageError::MissingAssetFile {
                asset: asset.id.clone(),
                path,
            });
        }
    }

    Ok(document)
}

/// Re-hashes every asset file and reports the first that no longer matches
/// the document.
///
/// Silent edits to an asset would change rendered output without changing the
/// document, which is exactly the class of surprise determinism is supposed to
/// rule out.
pub fn verify_assets(document: &Document, project_dir: &Path) -> Result<(), StorageError> {
    for asset in &document.assets {
        let path = asset_path(project_dir, asset);
        let bytes =
            std::fs::read(&path).map_err(|e| StorageError::io("reading", path.clone(), e))?;
        let actual = hash_bytes(&bytes);
        if actual != asset.hash {
            return Err(StorageError::AssetHashMismatch {
                asset: asset.id.clone(),
                expected: asset.hash.clone(),
                actual,
            });
        }
    }
    Ok(())
}

/// Copies a file into the project's `assets/` directory and returns the entry
/// to add to the document.
///
/// The stored name is the content hash, so re-importing identical bytes
/// overwrites an identical file instead of accumulating copies.
pub fn import_asset(
    project_dir: &Path,
    source_file: &Path,
    ids: &mut dyn IdSource,
) -> Result<Asset, StorageError> {
    let bytes =
        std::fs::read(source_file).map_err(|e| StorageError::io("reading", source_file, e))?;
    let hash = hash_bytes(&bytes);

    let extension = source_file
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
        .filter(|e| !e.is_empty())
        .ok_or_else(|| StorageError::UnknownAssetType {
            path: source_file.to_path_buf(),
        })?;

    let hex = hash.trim_start_matches("sha256:");
    let relative = format!("{hex}.{extension}");
    let assets_dir = project_dir.join(ASSETS_DIR);
    std::fs::create_dir_all(&assets_dir)
        .map_err(|e| StorageError::io("creating", &assets_dir, e))?;
    let destination = assets_dir.join(&relative);
    std::fs::write(&destination, &bytes)
        .map_err(|e| StorageError::io("writing", &destination, e))?;

    Ok(Asset {
        id: AssetId::generate(ids),
        path: relative,
        hash,
        media_type: media_type_for(&extension).to_owned(),
        width: None,
        height: None,
        extra: Extras::new(),
    })
}

/// Removes asset files under `assets/` that no image layer refers to.
///
/// Returns the paths removed. Assets are copied in, so an orphan is a real
/// waste of disk rather than someone else's file.
pub fn prune_unused_assets(
    document: &Document,
    project_dir: &Path,
) -> Result<Vec<PathBuf>, StorageError> {
    let mut referenced = Vec::new();
    document.walk_layers(&mut |layer| {
        if let LayerKind::Image(image) = &layer.kind {
            referenced.push(image.asset.clone());
        }
    });

    let mut removed = Vec::new();
    for asset in &document.assets {
        if !referenced.contains(&asset.id) {
            let path = asset_path(project_dir, asset);
            if path.is_file() {
                std::fs::remove_file(&path)
                    .map_err(|e| StorageError::io("removing", path.clone(), e))?;
                removed.push(path);
            }
        }
    }
    Ok(removed)
}

/// Absolute path of an asset's file inside a project.
pub fn asset_path(project_dir: &Path, asset: &Asset) -> PathBuf {
    let mut path = project_dir.join(ASSETS_DIR);
    // Asset paths are stored `/`-separated regardless of platform; validation
    // has already rejected anything that could escape the directory.
    for segment in asset.path.split('/') {
        path.push(segment);
    }
    path
}

/// Hashes bytes into the `sha256:<hex>` form the document records.
pub fn hash_bytes(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut out = String::with_capacity(7 + digest.len() * 2);
    out.push_str("sha256:");
    for byte in digest {
        use std::fmt::Write as _;
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn media_type_for(extension: &str) -> &'static str {
    match extension {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        _ => "application/octet-stream",
    }
}

/// The schema version this build writes, exposed for callers reporting it.
pub const WRITTEN_SCHEMA_VERSION: u32 = SCHEMA_VERSION;

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;
    use crate::document::{ImageFit, ImageLayer, Layer, Transform};
    use crate::ids::{LayerId, SequentialIdSource};

    fn project() -> (tempfile::TempDir, Document) {
        let dir = tempfile::tempdir().unwrap();
        let document = Document::new(&mut SequentialIdSource::new(), 640.0, 480.0);
        (dir, document)
    }

    fn write_source_image(dir: &Path, name: &str, bytes: &[u8]) -> PathBuf {
        let path = dir.join(name);
        std::fs::write(&path, bytes).unwrap();
        path
    }

    #[test]
    fn save_then_load_returns_the_same_document() {
        let (dir, mut document) = project();
        document.name = Some("poster".to_owned());
        save(&document, dir.path()).unwrap();
        assert_eq!(load(dir.path()).unwrap(), document);
    }

    #[test]
    fn saving_twice_writes_identical_bytes() {
        let (dir, document) = project();
        save(&document, dir.path()).unwrap();
        let first = std::fs::read(dir.path().join(DOCUMENT_FILE)).unwrap();
        save(&document, dir.path()).unwrap();
        let second = std::fs::read(dir.path().join(DOCUMENT_FILE)).unwrap();
        assert_eq!(first, second);
    }

    #[test]
    fn opening_a_directory_without_a_document_is_a_typed_error() {
        let dir = tempfile::tempdir().unwrap();
        assert!(matches!(
            load(dir.path()),
            Err(StorageError::NotAProject { .. })
        ));
    }

    #[test]
    fn corrupt_json_is_a_typed_error() {
        let (dir, document) = project();
        save(&document, dir.path()).unwrap();
        std::fs::write(dir.path().join(DOCUMENT_FILE), "{ not json").unwrap();
        assert!(matches!(
            load(dir.path()),
            Err(StorageError::MalformedDocument { .. })
        ));
    }

    #[test]
    fn a_future_schema_version_is_a_typed_error() {
        let (dir, document) = project();
        save(&document, dir.path()).unwrap();
        let path = dir.path().join(DOCUMENT_FILE);
        let json = std::fs::read_to_string(&path)
            .unwrap()
            .replace("\"schemaVersion\": 1", "\"schemaVersion\": 999");
        std::fs::write(&path, json).unwrap();

        let error = load(dir.path()).unwrap_err();
        let StorageError::InvalidDocument { source, .. } = &error else {
            panic!("expected InvalidDocument, got {error:?}");
        };
        assert!(matches!(
            source.errors(),
            [crate::error::ValidationError::UnsupportedSchemaVersion { found: 999, .. }]
        ));
    }

    #[test]
    fn importing_copies_the_file_and_records_its_hash() {
        let (dir, mut document) = project();
        let source_dir = tempfile::tempdir().unwrap();
        let source = write_source_image(source_dir.path(), "logo.PNG", b"pretend png");

        let mut ids = SequentialIdSource::new();
        let asset = import_asset(dir.path(), &source, &mut ids).unwrap();

        assert_eq!(asset.media_type, "image/png");
        assert_eq!(asset.hash, hash_bytes(b"pretend png"));
        assert!(asset_path(dir.path(), &asset).is_file());

        document.layers.push(Layer::new(
            LayerId::new("layer_1"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Image(ImageLayer {
                asset: asset.id.clone(),
                fit: ImageFit::Contain,
                extra: Extras::new(),
            }),
        ));
        document.assets.push(asset);

        save(&document, dir.path()).unwrap();
        let reloaded = load(dir.path()).unwrap();
        assert_eq!(reloaded, document);
        verify_assets(&reloaded, dir.path()).unwrap();
    }

    #[test]
    fn importing_the_same_bytes_twice_reuses_one_file() {
        let dir = tempfile::tempdir().unwrap();
        let source_dir = tempfile::tempdir().unwrap();
        let a = write_source_image(source_dir.path(), "a.png", b"same");
        let b = write_source_image(source_dir.path(), "b.png", b"same");

        let mut ids = SequentialIdSource::new();
        let first = import_asset(dir.path(), &a, &mut ids).unwrap();
        let second = import_asset(dir.path(), &b, &mut ids).unwrap();

        assert_eq!(first.path, second.path);
        assert_ne!(first.id, second.id);
        let files = std::fs::read_dir(dir.path().join(ASSETS_DIR))
            .unwrap()
            .count();
        assert_eq!(files, 1);
    }

    #[test]
    fn a_missing_asset_file_is_a_typed_error() {
        let (dir, mut document) = project();
        let source_dir = tempfile::tempdir().unwrap();
        let source = write_source_image(source_dir.path(), "a.png", b"bytes");
        let asset = import_asset(dir.path(), &source, &mut SequentialIdSource::new()).unwrap();
        let file = asset_path(dir.path(), &asset);
        document.assets.push(asset);
        save(&document, dir.path()).unwrap();

        std::fs::remove_file(&file).unwrap();
        assert!(matches!(
            load(dir.path()),
            Err(StorageError::MissingAssetFile { .. })
        ));
    }

    #[test]
    fn an_edited_asset_file_is_detected_by_hash() {
        let (dir, mut document) = project();
        let source_dir = tempfile::tempdir().unwrap();
        let source = write_source_image(source_dir.path(), "a.png", b"original");
        let asset = import_asset(dir.path(), &source, &mut SequentialIdSource::new()).unwrap();
        let file = asset_path(dir.path(), &asset);
        document.assets.push(asset);
        save(&document, dir.path()).unwrap();

        std::fs::write(&file, b"tampered").unwrap();
        // Loading still succeeds: the file is there. Verification is what
        // notices, and it says exactly which asset changed.
        let reloaded = load(dir.path()).unwrap();
        assert!(matches!(
            verify_assets(&reloaded, dir.path()),
            Err(StorageError::AssetHashMismatch { .. })
        ));
    }

    #[test]
    fn an_invalid_document_is_never_written() {
        let (dir, mut document) = project();
        document.canvas.width = 0.0;
        assert!(matches!(
            save(&document, dir.path()),
            Err(StorageError::InvalidDocument { .. })
        ));
        assert!(!dir.path().join(DOCUMENT_FILE).exists());
    }

    #[test]
    fn extensionless_imports_are_rejected() {
        let dir = tempfile::tempdir().unwrap();
        let source_dir = tempfile::tempdir().unwrap();
        let source = write_source_image(source_dir.path(), "noextension", b"x");
        assert!(matches!(
            import_asset(dir.path(), &source, &mut SequentialIdSource::new()),
            Err(StorageError::UnknownAssetType { .. })
        ));
    }

    #[test]
    fn pruning_removes_only_unreferenced_assets() {
        let (dir, mut document) = project();
        let source_dir = tempfile::tempdir().unwrap();
        let used = write_source_image(source_dir.path(), "used.png", b"used");
        let unused = write_source_image(source_dir.path(), "unused.png", b"unused");
        let mut ids = SequentialIdSource::new();
        let used_asset = import_asset(dir.path(), &used, &mut ids).unwrap();
        let unused_asset = import_asset(dir.path(), &unused, &mut ids).unwrap();

        document.layers.push(Layer::new(
            LayerId::new("layer_1"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Image(ImageLayer {
                asset: used_asset.id.clone(),
                fit: ImageFit::Fill,
                extra: Extras::new(),
            }),
        ));
        let used_file = asset_path(dir.path(), &used_asset);
        document.assets.push(used_asset);
        document.assets.push(unused_asset);

        let removed = prune_unused_assets(&document, dir.path()).unwrap();
        assert_eq!(removed.len(), 1);
        assert!(used_file.is_file());
    }
}
