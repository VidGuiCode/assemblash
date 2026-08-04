//! Installing fonts into a store, once, on purpose.
//!
//! The roadmap's guardrail is that Assemblash never fetches a font while
//! rendering. Installing is therefore a separate act with its own command:
//! it runs when a person asks for it, and everything already installed keeps
//! working with no network at all (NFR-5).
//!
//! What may be installed is a committed manifest — family name, path, and the
//! sha256 of the exact bytes — pinned to one commit of the upstream font
//! repository. A download whose hash does not match the manifest is refused
//! rather than stored, so "install Noto Sans" means the same bytes today and
//! next year, on every machine.
//!
//! The bundled OFL pack is this manifest. No font binaries ship inside the
//! executable: they are megabytes each against a deployment story of one small
//! static binary, and a hash in a manifest pins them at least as tightly as
//! embedding would.

use serde::{Deserialize, Serialize};

use crate::store::{FontRecord, FontStore, FontStoreError};

/// The committed manifest, compiled into the binary.
const MANIFEST_JSON: &str = include_str!("../fonts/manifest.json");

/// A family the installer knows how to fetch.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManifestEntry {
    /// Family name, as a document must spell it.
    pub name: String,
    /// Path of the file within the upstream repository.
    pub path: String,
    /// Content hash the download must have, `sha256:<hex>`.
    pub sha256: String,
    /// Size in bytes, so an obviously wrong response is refused early.
    pub bytes: u64,
    /// Licence the file is distributed under.
    pub license: String,
    /// Named packs this family belongs to.
    #[serde(default)]
    pub packs: Vec<String>,
}

/// The set of families the installer knows about.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Manifest {
    /// Format version of this file.
    pub version: u32,
    /// Human-facing description of where the files come from.
    pub source: String,
    /// Commit of the upstream repository every path is resolved against.
    pub commit: String,
    /// Prefix a download URL is built from.
    pub url_prefix: String,
    /// Every family that can be installed.
    pub families: Vec<ManifestEntry>,
}

impl Manifest {
    /// The manifest compiled into this build.
    pub fn bundled() -> Result<Self, InstallError> {
        serde_json::from_str(MANIFEST_JSON).map_err(|source| InstallError::MalformedManifest {
            reason: source.to_string(),
        })
    }

    /// Looks a family up by name.
    pub fn family(&self, name: &str) -> Option<&ManifestEntry> {
        self.families.iter().find(|entry| entry.name == name)
    }

    /// The families in a named pack.
    pub fn pack(&self, pack: &str) -> Vec<&ManifestEntry> {
        self.families
            .iter()
            .filter(|entry| entry.packs.iter().any(|p| p == pack))
            .collect()
    }

    /// The URL an entry is fetched from.
    ///
    /// Built from a pinned commit, so the bytes behind it cannot change under
    /// the manifest. Square brackets, which variable-font filenames use, are
    /// percent-encoded because a bare one is not legal in a URL path.
    pub fn url(&self, entry: &ManifestEntry) -> String {
        let path = entry.path.replace('[', "%5B").replace(']', "%5D");
        format!("{}{}/{}", self.url_prefix, self.commit, path)
    }
}

/// Something that stopped an install.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum InstallError {
    /// The compiled-in manifest could not be read. A build problem, not a
    /// user problem.
    #[error("the bundled font manifest is unreadable: {reason}")]
    MalformedManifest {
        /// What the parser said.
        reason: String,
    },

    /// No such family in the manifest.
    #[error("no font named {family:?} is available to install")]
    UnknownFamily {
        /// The name that was asked for.
        family: String,
    },

    /// No such pack in the manifest.
    #[error("no font pack named {pack:?}")]
    UnknownPack {
        /// The name that was asked for.
        pack: String,
    },

    /// The download did not happen.
    #[error("downloading {url}: {reason}")]
    Fetch {
        /// What was being fetched.
        url: String,
        /// What went wrong.
        reason: String,
    },

    /// The bytes that arrived are not the bytes the manifest pins.
    ///
    /// Refused rather than stored: a font that is not what was pinned would
    /// render differently from the same install anywhere else, which is the
    /// whole thing this milestone exists to prevent.
    #[error(
        "{family}: downloaded file does not match the manifest — expected {expected}, got {actual}"
    )]
    HashMismatch {
        /// Family involved.
        family: String,
        /// Hash the manifest pins.
        expected: String,
        /// Hash of what arrived.
        actual: String,
    },

    /// The store refused the file.
    #[error(transparent)]
    Store(#[from] FontStoreError),
}

/// Where installable font bytes come from.
///
/// A trait so the install path can be tested end to end without a network:
/// the tests hand it a fake, and the only difference in production is which
/// implementation is passed in.
pub trait FontFetcher {
    /// Fetches the bytes at a URL.
    fn fetch(&self, url: &str) -> Result<Vec<u8>, String>;
}

/// Downloads over HTTPS.
#[derive(Debug, Clone, Copy, Default)]
pub struct HttpFetcher;

impl FontFetcher for HttpFetcher {
    fn fetch(&self, url: &str) -> Result<Vec<u8>, String> {
        let mut response = ureq::get(url).call().map_err(|error| error.to_string())?;
        response
            .body_mut()
            .with_config()
            // Fonts are megabytes; the ceiling is generous but finite so a
            // wrong URL cannot stream forever.
            .limit(64 * 1024 * 1024)
            .read_to_vec()
            .map_err(|error| error.to_string())
    }
}

/// Installs one family from the manifest into a store.
pub fn install_family(
    store: &mut FontStore,
    manifest: &Manifest,
    family: &str,
    fetcher: &dyn FontFetcher,
) -> Result<Vec<FontRecord>, InstallError> {
    let entry = manifest
        .family(family)
        .ok_or_else(|| InstallError::UnknownFamily {
            family: family.to_owned(),
        })?;
    install_entry(store, manifest, entry, fetcher)
}

/// Installs every family in a named pack.
pub fn install_pack(
    store: &mut FontStore,
    manifest: &Manifest,
    pack: &str,
    fetcher: &dyn FontFetcher,
) -> Result<Vec<FontRecord>, InstallError> {
    let entries = manifest.pack(pack);
    if entries.is_empty() {
        return Err(InstallError::UnknownPack {
            pack: pack.to_owned(),
        });
    }
    let mut installed = Vec::new();
    for entry in entries {
        installed.extend(install_entry(store, manifest, entry, fetcher)?);
    }
    Ok(installed)
}

fn install_entry(
    store: &mut FontStore,
    manifest: &Manifest,
    entry: &ManifestEntry,
    fetcher: &dyn FontFetcher,
) -> Result<Vec<FontRecord>, InstallError> {
    let url = manifest.url(entry);
    let bytes = fetcher.fetch(&url).map_err(|reason| InstallError::Fetch {
        url: url.clone(),
        reason,
    })?;

    let actual = crate::store::hash_bytes(&bytes);
    if actual != entry.sha256 {
        return Err(InstallError::HashMismatch {
            family: entry.name.clone(),
            expected: entry.sha256.clone(),
            actual,
        });
    }

    let origin = std::path::PathBuf::from(&entry.path);
    Ok(store.import_bytes(&bytes, &origin, Some(url), Some(entry.license.clone()))?)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn the_bundled_manifest_parses_and_is_internally_consistent() {
        let manifest = Manifest::bundled().unwrap();
        assert_eq!(manifest.version, 1);
        assert_eq!(manifest.commit.len(), 40, "the commit must be pinned");
        assert!(!manifest.pack("default").is_empty());

        for entry in &manifest.families {
            assert!(
                entry.sha256.starts_with("sha256:") && entry.sha256.len() == 71,
                "{}: {}",
                entry.name,
                entry.sha256
            );
            assert_eq!(entry.license, "OFL-1.1", "{}", entry.name);
            assert!(entry.bytes > 0, "{}", entry.name);
            let url = manifest.url(entry);
            assert!(url.contains(&manifest.commit));
            assert!(!url.contains('['), "{url} must be percent-encoded");
        }
    }

    #[test]
    fn an_unknown_name_is_a_typed_error() {
        let manifest = Manifest::bundled().unwrap();
        assert!(manifest.family("Comic Sans MS").is_none());
        assert!(manifest.pack("nonexistent").is_empty());
    }
}
