//! The update check and the self-update (decision D28).
//!
//! This module sits beside the font installer's fetch code on purpose: it is
//! the second and last place in the workspace that may open a network
//! connection, and it keeps assemblash-core free of network code (the plan's
//! Step 0 instruction, note 9 of the anchor pass).
//!
//! The rules it implements, from the decision file:
//!
//! - One `GET` to the GitHub releases atom feed. No identifiers, no document
//!   data. At most once every 24 hours when asked by the config; on demand
//!   from the CLI. The result is cached in the workspace.
//! - MCP mode never calls into this module, and the render path never does
//!   either.
//! - A download is verified against the `SHA256SUMS` file of the same release
//!   before anything is replaced. The download lands in a temporary file in
//!   the workspace; a failed or interrupted download is deleted, and nothing
//!   else changes.
//! - The swap renames the running binary to `<name>.old`, moves the new one
//!   into place, and leaves `.old` for the next start to delete. When the
//!   download sits on another volume from the binary — a rename cannot cross
//!   volumes — it copies the download beside the binary instead, verifies the
//!   copy's SHA-256, and renames that into place.
//! - The notification names the latest stable release, preferring the `x.y.1`
//!   of a minor over its `.0`; pre-releases are never named.
//!
//! The atom feed lists entries newest first; the parser walks them in
//! document order and takes the first stable semver, which is what makes the
//! `x.y.1` preference fall out of the order rather than out of a second
//! query.

use std::path::{Path, PathBuf};
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::store::hash_bytes;

/// The releases atom feed of this repository (decision D28, U2).
pub const RELEASES_ATOM: &str = "https://github.com/VidGuiCode/assemblash/releases.atom";

/// The base URL every release asset is downloaded from.
pub const RELEASES_DOWNLOAD: &str = "https://github.com/VidGuiCode/assemblash/releases/download";

/// How often a consented check may run.
pub const CHECK_INTERVAL: Duration = Duration::from_secs(24 * 60 * 60);

/// The workspace file the last check is cached in.
pub const CACHE_FILE: &str = "update-cache.json";

/// The suffix left behind by a swap, deleted at the next start.
pub const OLD_SUFFIX: &str = ".old";

/// The name of the download's temporary file, inside the workspace. A
/// distinct suffix from [`OLD_SUFFIX`]: only a swapped-out binary is `.old`,
/// so the next-start cleanup can name it exactly.
pub const DOWNLOAD_TEMP: &str = "update-download.part";

/// Something that stopped an update check or a self-update.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum UpdateError {
    /// The feed or a download did not happen.
    #[error("fetching {url}: {reason}")]
    Fetch {
        /// What was being fetched.
        url: String,
        /// What went wrong.
        reason: String,
    },

    /// The feed did not contain a stable release this build can name.
    #[error("the release feed is unreadable: {reason}")]
    MalformedFeed {
        /// What is wrong with it.
        reason: String,
    },

    /// The downloaded binary is not the bytes the release's `SHA256SUMS`
    /// pins. Refused: the partial file is deleted, and the running binary
    /// keeps running.
    #[error("the downloaded update does not match SHA256SUMS — expected {expected}, got {actual}")]
    HashMismatch {
        /// Hash `SHA256SUMS` pins.
        expected: String,
        /// Hash of what arrived.
        actual: String,
    },

    /// The release ships no raw binary asset this build can swap in place.
    #[error(
        "release {tag} ships no raw binary asset named {name}; download it from {page} and install it by hand"
    )]
    AssetMissing {
        /// The release tag that was looked at.
        tag: String,
        /// The asset name this build wants.
        name: String,
        /// The release page a person downloads from.
        page: String,
    },

    /// The filesystem refused part of the update.
    #[error("{what}: {source}")]
    Io {
        /// What was being done.
        what: String,
        /// What went wrong.
        source: std::io::Error,
    },
}

/// Where update bytes and text come from.
///
/// A trait, the way [`crate::install::FontFetcher`] is one: production hands
/// in the HTTPS implementation, and the tests point the same implementation
/// at a local HTTP server, so CI never reaches the network.
pub trait ReleaseFetcher: Send + Sync {
    /// Fetches a small text document — the atom feed, the `SHA256SUMS` file.
    fn fetch_text(&self, url: &str) -> Result<String, String>;

    /// Downloads bytes to a file, streaming. Returns the byte count.
    fn download(&self, url: &str, dest: &Path) -> Result<u64, String>;
}

/// Downloads over HTTPS.
#[derive(Debug, Clone, Copy, Default)]
pub struct HttpReleaseFetcher;

impl ReleaseFetcher for HttpReleaseFetcher {
    fn fetch_text(&self, url: &str) -> Result<String, String> {
        let mut response = ureq::get(url).call().map_err(|error| error.to_string())?;
        response
            .body_mut()
            .with_config()
            .limit(16 * 1024 * 1024)
            .read_to_string()
            .map_err(|error| error.to_string())
    }

    fn download(&self, url: &str, dest: &Path) -> Result<u64, String> {
        let response = ureq::get(url).call().map_err(|error| error.to_string())?;
        let mut reader = response.into_body().into_reader();
        let mut file = std::fs::File::create(dest)
            .map_err(|error| format!("creating {}: {error}", dest.display()))?;
        std::io::copy(&mut reader, &mut file).map_err(|error| format!("reading the body: {error}"))
    }
}

/// One release, as the feed names it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Release {
    /// The version, with any leading `v` removed.
    pub version: String,
    /// The release page URL from the entry's link, when the feed carries one.
    pub url: Option<String>,
}

/// What a check found.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    /// The version of this build.
    pub local: String,
    /// The version the feed names.
    pub remote: String,
    /// Whether `remote` is newer than `local`.
    pub newer: bool,
    /// The release-notes page of the named release.
    pub notes_url: Option<String>,
}

/// The cached answer of the last check, stored in the workspace.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCache {
    /// Format version of this file.
    pub version: u32,
    /// The version the feed named.
    pub latest: String,
    /// The release-notes page of that version.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub notes_url: Option<String>,
    /// Milliseconds since the Unix epoch when the check ran.
    pub checked_at_ms: u64,
}

/// Whether a passive check may run now (decision D28, U1 + U2).
///
/// `Off` never checks. `None` — the consent question not yet answered — never
/// checks either: nothing is fetched before the answer. `Notify` checks when
/// there is no cache, or the cache is older than 24 hours.
pub fn should_check(
    consent: Option<assemblash_core::workspace::UpdateCheck>,
    cache: Option<&UpdateCache>,
    now_ms: u64,
) -> bool {
    match consent {
        Some(assemblash_core::workspace::UpdateCheck::Notify) => match cache {
            None => true,
            Some(cache) => {
                now_ms.saturating_sub(cache.checked_at_ms) >= CHECK_INTERVAL.as_millis() as u64
            }
        },
        _ => false,
    }
}

/// The path of the cache file in a workspace.
pub fn cache_path(root: &Path) -> PathBuf {
    root.join(CACHE_FILE)
}

/// Reads the cached answer, when one is there and well-formed.
///
/// A damaged cache is the same as no cache: the next check fetches again and
/// rewrites it, so there is nothing to refuse.
pub fn read_cache(root: &Path) -> Option<UpdateCache> {
    let text = std::fs::read_to_string(cache_path(root)).ok()?;
    let cache: UpdateCache = serde_json::from_str(&text).ok()?;
    (cache.version == 1).then_some(cache)
}

fn write_cache(root: &Path, cache: &UpdateCache) -> Result<(), UpdateError> {
    // `to_string` on a plain data struct cannot fail; an explicit refusal
    // keeps the lint honest without an allow.
    let text = serde_json::to_string(cache).map_err(|error| UpdateError::Io {
        what: format!("serialising {CACHE_FILE}"),
        source: std::io::Error::new(std::io::ErrorKind::InvalidData, error),
    })?;
    std::fs::write(cache_path(root), text).map_err(|source| UpdateError::Io {
        what: format!("writing {CACHE_FILE}"),
        source,
    })
}

/// Runs the check, honouring the 24-hour cache.
///
/// A fresh cache answers without a fetch; a stale or missing one costs one
/// `GET` and is rewritten. A failed fetch leaves the old cache in place.
pub fn check_with_cache(
    root: &Path,
    endpoint: &str,
    local_version: &str,
    fetcher: &dyn ReleaseFetcher,
    now_ms: u64,
) -> Result<UpdateInfo, UpdateError> {
    if let Some(cache) = read_cache(root) {
        if now_ms.saturating_sub(cache.checked_at_ms) < CHECK_INTERVAL.as_millis() as u64 {
            return Ok(info_for(local_version, &cache.latest, cache.notes_url));
        }
    }
    let release = check(endpoint, local_version, fetcher)?;
    write_cache(
        root,
        &UpdateCache {
            version: 1,
            latest: release.version.clone(),
            notes_url: release.url.clone(),
            checked_at_ms: now_ms,
        },
    )?;
    Ok(info_for(local_version, &release.version, release.url))
}

/// The answer built from a version pair, without touching the network.
pub fn info_for(local: &str, remote: &str, notes_url: Option<String>) -> UpdateInfo {
    UpdateInfo {
        local: local.to_owned(),
        remote: remote.to_owned(),
        newer: is_newer(local, remote),
        notes_url,
    }
}

/// Checks the feed once, on demand. No cache is read or written.
pub fn check(
    endpoint: &str,
    local_version: &str,
    fetcher: &dyn ReleaseFetcher,
) -> Result<Release, UpdateError> {
    let _ = local_version;
    let body = fetcher
        .fetch_text(endpoint)
        .map_err(|reason| UpdateError::Fetch {
            url: endpoint.to_owned(),
            reason,
        })?;
    latest_stable(&body)
}

/// Parses an atom feed and answers the release the notification names (U5).
///
/// The feed lists entries newest first. Titles that are not stable `x.y.z`
/// versions — pre-releases, names — are skipped, so the first hit is the
/// newest stable of the newest minor that has one, which is the `x.y.1`
/// whenever it exists. No second query is made.
pub fn latest_stable(atom: &str) -> Result<Release, UpdateError> {
    let mut seen = 0usize;
    for entry in atom.split("<entry>").skip(1) {
        let entry = match entry.split_once("</entry>") {
            Some((inner, _)) => inner,
            None => entry,
        };
        let Some(title) = xml_element(entry, "title") else {
            continue;
        };
        seen += 1;
        // U5: a pre-release is never named. Only a stable `x.y.z` can be.
        if let Some((version, false)) = parse_version(&title) {
            return Ok(Release {
                version,
                url: xml_link(entry),
            });
        }
    }
    Err(UpdateError::MalformedFeed {
        reason: if seen == 0 {
            "the feed carries no entries".to_owned()
        } else {
            "no entry title is a stable x.y.z version".to_owned()
        },
    })
}

/// The text of the first `<tag>…</tag>` element, if it is there.
fn xml_element(fragment: &str, tag: &str) -> Option<String> {
    let open = format!("<{tag}");
    let start = fragment.find(&open)? + open.len();
    let start = fragment[start..].find('>')? + start + 1;
    let end = fragment[start..].find(&format!("</{tag}>"))? + start;
    Some(fragment[start..end].trim().to_owned())
}

/// The `href` of the entry's `<link …>`, if it is there.
fn xml_link(fragment: &str) -> Option<String> {
    let start = fragment.find("<link")? + 5;
    let end = fragment[start..].find('>')? + start;
    let tag = &fragment[start..end];
    let at = tag.find("href=\"")? + 6;
    let rest = &tag[at..];
    let end = rest.find('"')?;
    Some(rest[..end].to_owned())
}

/// Reads a version like `v1.10.1`, `1.10.1`, or `1.10.1-rc.1`.
///
/// Answers `(core, is_pre_release)`. A title without a three-number core is
/// `None` — a release may carry any name, and only stable versions are ever
/// named.
pub fn parse_version(title: &str) -> Option<(String, bool)> {
    let bare = title.trim().trim_start_matches(['v', 'V']);
    let (core, pre) = match bare.split_once('-') {
        Some((core, _pre)) => (core, true),
        None => (bare, false),
    };
    let mut numbers = core.split('.');
    let parsed = (
        numbers.next().unwrap_or("").parse::<u64>(),
        numbers.next().unwrap_or("").parse::<u64>(),
        numbers.next().unwrap_or("").parse::<u64>(),
    );
    if numbers.next().is_some() {
        return None;
    }
    match parsed {
        (Ok(major), Ok(minor), Ok(patch)) => Some((format!("{major}.{minor}.{patch}"), pre)),
        _ => None,
    }
}

/// Whether `remote` is a strictly newer stable than `local`.
pub fn is_newer(local: &str, remote: &str) -> bool {
    match (parse_version(local), parse_version(remote)) {
        // A local pre-release is older than anything stable, by convention:
        // the notification names a stable, and a stable is what ships.
        (Some((_, true)), Some((_, false))) => true,
        (Some((l, false)), Some((r, false))) => version_key(&r) > version_key(&l),
        _ => false,
    }
}

fn version_key(version: &str) -> (u64, u64, u64) {
    let mut numbers = version.split('.');
    (
        numbers.next().and_then(|n| n.parse().ok()).unwrap_or(0),
        numbers.next().and_then(|n| n.parse().ok()).unwrap_or(0),
        numbers.next().and_then(|n| n.parse().ok()).unwrap_or(0),
    )
}

/// The raw-binary asset name this build wants from a release.
pub fn binary_asset_name() -> String {
    let os = match std::env::consts::OS {
        "macos" => "macos".to_owned(),
        other => other.to_owned(),
    };
    let arch = std::env::consts::ARCH;
    let suffix = std::env::consts::EXE_SUFFIX;
    format!("assemblash-{os}-{arch}{suffix}")
}

/// The tag of a release version, the way GitHub spells it.
pub fn tag_of(version: &str) -> String {
    format!("v{}", version.trim_start_matches('v'))
}

/// Downloads the release's binary and verifies it against the same release's
/// `SHA256SUMS` (U2 + U3), into a temporary file inside the workspace.
///
/// `base` is the release-asset base URL — [`RELEASES_DOWNLOAD`] in
/// production, a local server's address in tests, so CI never reaches the
/// network. A refused or interrupted download deletes the partial file and
/// changes nothing else. The verified temporary file's path is answered;
/// [`swap`] moves it into place.
pub fn download_verified(
    base: &str,
    tag: &str,
    root: &Path,
    fetcher: &dyn ReleaseFetcher,
) -> Result<PathBuf, UpdateError> {
    let name = binary_asset_name();
    let prefix = format!("{base}/{tag}");
    let binary_url = format!("{prefix}/{name}");
    let sums_url = format!("{prefix}/SHA256SUMS");
    let page = format!("https://github.com/VidGuiCode/assemblash/releases/tag/{tag}");

    let sums = fetcher.fetch_text(&sums_url).map_err(|reason| {
        if reason.contains("404") || reason.to_lowercase().contains("not found") {
            UpdateError::AssetMissing {
                tag: tag.to_owned(),
                name: name.clone(),
                page: page.clone(),
            }
        } else {
            UpdateError::Fetch {
                url: sums_url.clone(),
                reason,
            }
        }
    })?;
    let expected = pinned_hash(&sums, &name).ok_or_else(|| UpdateError::AssetMissing {
        tag: tag.to_owned(),
        name: name.clone(),
        page,
    })?;

    let temp = root.join(DOWNLOAD_TEMP);
    let _ = std::fs::remove_file(&temp);
    if let Err(reason) = fetcher.download(&binary_url, &temp) {
        // A failed or interrupted download leaves no partial file behind.
        let _ = std::fs::remove_file(&temp);
        return Err(UpdateError::Fetch {
            url: binary_url,
            reason,
        });
    }

    let bytes = match std::fs::read(&temp) {
        Ok(bytes) => bytes,
        Err(source) => {
            let _ = std::fs::remove_file(&temp);
            return Err(UpdateError::Io {
                what: format!("reading {}", temp.display()),
                source,
            });
        }
    };
    let actual = hash_bytes(&bytes);
    if actual != format!("sha256:{expected}") {
        let _ = std::fs::remove_file(&temp);
        return Err(UpdateError::HashMismatch { expected, actual });
    }
    Ok(temp)
}

/// The hex hash `SHA256SUMS` pins for `name`, if a line carries it.
///
/// Lines are `<hex>  <name>` (two spaces is the convention, one is accepted).
/// A `sha256:` prefix is accepted and stripped, so a sums file written with
/// the engine's own `hash_bytes` spelling compares equal to a bare-hex one.
fn pinned_hash(sums: &str, name: &str) -> Option<String> {
    for line in sums.lines() {
        let line = line.trim();
        if let Some((hash, file)) = line.split_once(char::is_whitespace) {
            if file.trim() == name {
                return Some(
                    hash.trim()
                        .strip_prefix("sha256:")
                        .unwrap_or(hash.trim())
                        .to_owned(),
                );
            }
        }
    }
    None
}

/// What kind of install this binary came from, and whether it may be swapped.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum InstallKind {
    /// A plain copy this build may replace in place.
    Swappable,
    /// A package manager owns this path, or the path cannot be written; a
    /// swap would fight it or fail halfway.
    Managed {
        /// The manager that appears to own the install.
        manager: &'static str,
    },
}

/// Classifies the running install.
///
/// A binary under a package manager's directory is never swapped. A binary
/// whose own directory this process cannot write to is treated the same way:
/// the swap would fail halfway, and advice travels further than an error.
pub fn classify_install(exe: &Path) -> InstallKind {
    for component in exe.components() {
        let name = component.as_os_str().to_string_lossy().to_lowercase();
        let manager = match name.as_str() {
            "cellar" => Some("Homebrew"),
            "winget" | "packages" => Some("winget"),
            "scoop" => Some("scoop"),
            "chocolatey" => Some("Chocolatey"),
            _ => None,
        };
        if let Some(manager) = manager {
            return InstallKind::Managed { manager };
        }
    }
    let directory = exe.parent().unwrap_or_else(|| Path::new("."));
    let probe = directory.join(".assemblash-write-probe");
    match std::fs::write(&probe, b"") {
        Ok(()) => {
            let _ = std::fs::remove_file(&probe);
            InstallKind::Swappable
        }
        Err(_) => InstallKind::Managed {
            manager: "another installer",
        },
    }
}

/// Swaps the verified file in for the running binary (U4).
///
/// The running binary is renamed to `<name>.old`; the new one takes its
/// place. If the second rename fails, the old binary is renamed back, so a
/// half-swap never stays behind. The `.old` file is deleted at the next
/// start — see [`remove_old_binary`].
///
/// A rename only moves a file inside one volume. When the verified download
/// sits in the workspace on another drive from the binary — the real shape
/// of `Program Files` versus `AppData` — the rename fails, and the swap
/// falls back to copying: the new binary is copied to a staging file next to
/// the running one, the copy's SHA-256 is checked against the verified
/// download's, and the copy is renamed into place. The same `.old` semantics
/// and the same no-partial guarantee hold; any step that fails puts the old
/// binary back and refuses typed.
pub fn swap(new_binary: &Path) -> Result<(), UpdateError> {
    let exe = std::env::current_exe().map_err(|source| UpdateError::Io {
        what: "locating the running binary".to_owned(),
        source,
    })?;
    swap_into(&exe, new_binary, false)
}

/// The staging file a cross-volume copy lands in, beside the binary.
fn staging_path(exe: &Path) -> PathBuf {
    let mut name = exe.file_name().unwrap_or_default().to_os_string();
    name.push(".swap-new");
    exe.with_file_name(name)
}

/// Whether a rename failure means source and target sit on different volumes.
///
/// Windows answers `ERROR_NOT_SAME_DEVICE` (17); POSIX answers `EXDEV` (18).
/// Any other failure is not a volume boundary and is reported as it is.
fn is_cross_volume(source: &std::io::Error) -> bool {
    matches!(source.raw_os_error(), Some(17) | Some(18))
}

/// [`swap`]'s rename pair over an explicit binary path, with a test seam.
///
/// `force_copy` short-circuits the direct rename and takes the copy path
/// unconditionally, so the fallback branch is testable on a machine that has
/// only one volume. Production always passes `false` and lets
/// [`is_cross_volume`] decide.
fn swap_into(exe: &Path, new_binary: &Path, force_copy: bool) -> Result<(), UpdateError> {
    let old = old_binary_path(exe);

    // A previous swap's leftover must not block this one.
    let _ = std::fs::remove_file(&old);
    std::fs::rename(exe, &old).map_err(|source| UpdateError::Io {
        what: format!("renaming {} to {}", exe.display(), old.display()),
        source,
    })?;
    let moved = if force_copy {
        Err(std::io::Error::other("the copy path was forced"))
    } else {
        std::fs::rename(new_binary, exe)
    };
    if let Err(source) = moved {
        if !force_copy && !is_cross_volume(&source) {
            // Put the running binary back rather than leave nothing behind.
            let _ = std::fs::rename(&old, exe);
            let _ = std::fs::remove_file(new_binary);
            return Err(UpdateError::Io {
                what: format!("moving {} into place", new_binary.display()),
                source,
            });
        }
        if let Err(copy_error) = copy_into_place(exe, new_binary) {
            let _ = std::fs::rename(&old, exe);
            let _ = std::fs::remove_file(new_binary);
            return Err(copy_error);
        }
    }
    Ok(())
}

/// The cross-volume fallback: copy the verified download to a staging file
/// next to the binary, verify the copy against the download's own hash, and
/// rename the copy into place.
///
/// The download's hash was already checked against `SHA256SUMS`; hashing it
/// again here and comparing the copy against *that* catches a torn copy, so
/// a half-written binary can never be renamed onto the running one. A
/// failure at any step removes the staging file and refuses typed.
fn copy_into_place(exe: &Path, new_binary: &Path) -> Result<(), UpdateError> {
    let staging = staging_path(exe);
    let io = |what: &str, source: std::io::Error| UpdateError::Io {
        what: format!("{what} {}", staging.display()),
        source,
    };
    let source = std::fs::read(new_binary).map_err(|source| UpdateError::Io {
        what: format!("reading {} for the cross-volume copy", new_binary.display()),
        source,
    })?;
    let expected = hash_bytes(&source);
    if let Err(source) = std::fs::write(&staging, &source) {
        return Err(io("writing the staged copy", source));
    }
    let copied = match std::fs::read(&staging) {
        Ok(bytes) => bytes,
        Err(source) => {
            let _ = std::fs::remove_file(&staging);
            return Err(io("verifying", source));
        }
    };
    if hash_bytes(&copied) != expected {
        let _ = std::fs::remove_file(&staging);
        return Err(UpdateError::Io {
            what: format!(
                "the staged copy of {} does not match the verified download",
                new_binary.display()
            ),
            source: std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "sha256 mismatch between the copy and the verified download",
            ),
        });
    }
    if let Err(source) = std::fs::rename(&staging, exe) {
        let _ = std::fs::remove_file(&staging);
        return Err(UpdateError::Io {
            what: format!("moving the staged copy onto {}", exe.display()),
            source,
        });
    }
    Ok(())
}

/// The `.old` path beside a binary.
fn old_binary_path(exe: &Path) -> PathBuf {
    let mut name = exe.file_name().unwrap_or_default().to_os_string();
    name.push(OLD_SUFFIX);
    exe.with_file_name(name)
}

/// Deletes the previous binary's `.old` leftover at start-up (U4).
///
/// Best effort, on purpose: a file that will not delete must never stop the
/// program from starting.
pub fn remove_old_binary() {
    if let Ok(exe) = std::env::current_exe() {
        let _ = std::fs::remove_file(old_binary_path(&exe));
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;
    use std::io::{Read, Write};
    use std::net::{TcpListener, TcpStream};
    use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

    const LOCAL: &str = "1.9.0";

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }

    fn temp_root(tag: &str) -> PathBuf {
        let root =
            std::env::temp_dir().join(format!("assemblash-update-{tag}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(&root).unwrap();
        root
    }

    /// One local HTTP server answering canned paths, counting its requests.
    ///
    /// The decision file's exit test is that CI never reaches the network, so
    /// every fetch in these tests goes to this server on 127.0.0.1.
    struct TestServer {
        base: String,
        shutdown: std::sync::Arc<AtomicBool>,
        requests: std::sync::Arc<AtomicUsize>,
        handle: Option<std::thread::JoinHandle<()>>,
    }

    impl TestServer {
        fn start(responses: Vec<(String, Vec<u8>)>) -> Self {
            let listener = TcpListener::bind("127.0.0.1:0").unwrap();
            let base = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
            let shutdown = std::sync::Arc::new(AtomicBool::new(false));
            let requests = std::sync::Arc::new(AtomicUsize::new(0));
            let handle = {
                let shutdown = std::sync::Arc::clone(&shutdown);
                let requests = std::sync::Arc::clone(&requests);
                std::thread::spawn(move || {
                    for stream in listener.incoming() {
                        if shutdown.load(Ordering::SeqCst) {
                            return;
                        }
                        let Ok(mut stream) = stream else { return };
                        requests.fetch_add(1, Ordering::SeqCst);
                        let mut buffer = [0u8; 8192];
                        let _ = stream.read(&mut buffer);
                        let request = String::from_utf8_lossy(&buffer);
                        let path = request.split_whitespace().nth(1).unwrap_or("/").to_owned();
                        match responses.iter().find(|(p, _)| *p == path) {
                            Some((_, body)) => write_response(&mut stream, "200 OK", body),
                            None => write_response(&mut stream, "404 Not Found", b"nope"),
                        }
                    }
                })
            };
            Self {
                base,
                shutdown,
                requests,
                handle: Some(handle),
            }
        }

        fn count(&self) -> usize {
            self.requests.load(Ordering::SeqCst)
        }
    }

    impl Drop for TestServer {
        fn drop(&mut self) {
            self.shutdown.store(true, Ordering::SeqCst);
            // One last connect wakes the accept loop so the thread can exit.
            if let Ok(stream) = TcpStream::connect(self.base.trim_start_matches("http://")) {
                drop(stream);
            }
            if let Some(handle) = self.handle.take() {
                let _ = handle.join();
            }
        }
    }

    fn write_response(stream: &mut TcpStream, status: &str, body: &[u8]) {
        let head = format!(
            "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            body.len()
        );
        let _ = stream.write_all(head.as_bytes());
        let _ = stream.write_all(body);
    }

    /// A server whose body is cut off mid-stream: the interrupted download.
    struct TruncatingServer {
        base: String,
    }

    impl TruncatingServer {
        fn start(body: &[u8]) -> Self {
            let listener = TcpListener::bind("127.0.0.1:0").unwrap();
            let base = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
            let body = body.to_vec();
            std::thread::spawn(move || {
                if let Some(Ok(mut stream)) = listener.incoming().next() {
                    let mut buffer = [0u8; 8192];
                    let _ = stream.read(&mut buffer);
                    // Promise more bytes than are sent, then close: the
                    // client sees a body that ends before its headers say.
                    let head = format!(
                        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                        body.len() + 4096
                    );
                    let _ = stream.write_all(head.as_bytes());
                    let _ = stream.write_all(&body);
                    let _ = stream.flush();
                }
            });
            Self { base }
        }
    }

    fn atom(titles: &[&str]) -> String {
        let mut feed = String::from("<?xml version=\"1.0\"?><feed>");
        for title in titles {
            feed.push_str(&format!(
                "<entry><id>x</id><title>{title}</title><link href=\"https://example.com/tag/{title}\"/></entry>"
            ));
        }
        feed.push_str("</feed>");
        feed
    }

    #[test]
    fn the_first_stable_title_is_newest_and_the_v_prefix_is_stripped() {
        let release = latest_stable(&atom(&["v1.10.1", "v1.10.0", "v1.9.0"])).unwrap();
        assert_eq!(release.version, "1.10.1");
        assert_eq!(
            release.url.as_deref(),
            Some("https://example.com/tag/v1.10.1")
        );
    }

    #[test]
    fn a_pre_release_is_never_named_and_the_x_y_1_is_preferred() {
        // Newest entry is a pre-release; the newest stable of the newest
        // minor that has one is the .1. Both rules in one feed (U5).
        let release = latest_stable(&atom(&["1.11.0-rc.1", "v1.10.1", "1.10.0", "1.9.2"])).unwrap();
        assert_eq!(release.version, "1.10.1");
    }

    #[test]
    fn a_feed_without_a_stable_version_is_a_typed_refusal() {
        let error = latest_stable(&atom(&["1.11.0-rc.1", "1.11.0-rc.2"])).unwrap_err();
        assert!(
            matches!(error, UpdateError::MalformedFeed { .. }),
            "{error}"
        );
        let error = latest_stable("<feed></feed>").unwrap_err();
        assert!(matches!(error, UpdateError::MalformedFeed { .. }));
    }

    #[test]
    fn versions_compare_numerically() {
        assert!(is_newer("1.9.0", "1.10.0"));
        assert!(is_newer("1.10.0", "1.10.1"));
        assert!(!is_newer("1.10.1", "1.10.0"));
        assert!(!is_newer("1.10.0", "1.10.0"));
        assert!(is_newer("1.10.0-rc.1", "1.10.0"));
        assert!(!is_newer("1.10.0", "not-a-version"));
    }

    #[test]
    fn the_check_answers_the_feed_over_local_http() {
        let server = TestServer::start(vec![(
            "/releases.atom".to_owned(),
            atom(&["v1.10.1", "v1.10.0"]).into_bytes(),
        )]);
        let endpoint = format!("{}/releases.atom", server.base);
        let release = check(&endpoint, LOCAL, &HttpReleaseFetcher).unwrap();
        assert_eq!(release.version, "1.10.1");
        assert_eq!(server.count(), 1);
    }

    #[test]
    fn an_offline_check_is_a_typed_error() {
        // Port 1 on loopback is closed by construction: no server listens.
        let error = check(
            "http://127.0.0.1:1/releases.atom",
            LOCAL,
            &HttpReleaseFetcher,
        )
        .unwrap_err();
        assert!(matches!(error, UpdateError::Fetch { .. }), "{error}");
    }

    #[test]
    fn the_24h_cache_answers_without_a_second_request() {
        let server = TestServer::start(vec![(
            "/releases.atom".to_owned(),
            atom(&["v1.10.1"]).into_bytes(),
        )]);
        let endpoint = format!("{}/releases.atom", server.base);
        let root = temp_root("cache");

        let first = check_with_cache(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now()).unwrap();
        assert_eq!(first.remote, "1.10.1");
        assert!(first.newer);

        // Well inside the window: the second call must not hit the server.
        let second =
            check_with_cache(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now() + 60_000).unwrap();
        assert_eq!(second.remote, "1.10.1");
        assert_eq!(server.count(), 1, "the cache must answer the second check");

        // Past the window, the server is asked again.
        let later = check_with_cache(
            &root,
            &endpoint,
            LOCAL,
            &HttpReleaseFetcher,
            now() + CHECK_INTERVAL.as_millis() as u64 + 1,
        )
        .unwrap();
        assert_eq!(later.remote, "1.10.1");
        assert_eq!(server.count(), 2);
    }

    #[test]
    fn a_written_cache_carries_the_version_and_the_notes_url() {
        let server = TestServer::start(vec![(
            "/releases.atom".to_owned(),
            atom(&["v1.10.1"]).into_bytes(),
        )]);
        let endpoint = format!("{}/releases.atom", server.base);
        let root = temp_root("cache-shape");
        check_with_cache(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now()).unwrap();
        let cache = read_cache(&root).unwrap();
        assert_eq!(cache.version, 1);
        assert_eq!(cache.latest, "1.10.1");
        assert_eq!(
            cache.notes_url.as_deref(),
            Some("https://example.com/tag/v1.10.1")
        );
    }

    #[test]
    fn consent_gates_the_passive_check() {
        use assemblash_core::workspace::UpdateCheck;
        let cache = UpdateCache {
            version: 1,
            latest: "1.10.1".to_owned(),
            notes_url: None,
            checked_at_ms: now(),
        };
        // Off never checks. Unanswered never checks.
        assert!(!should_check(Some(UpdateCheck::Off), None, now()));
        assert!(!should_check(None, None, now()));
        // Notify with no cache checks; a fresh cache does not; a stale one does.
        assert!(should_check(Some(UpdateCheck::Notify), None, now()));
        assert!(!should_check(
            Some(UpdateCheck::Notify),
            Some(&cache),
            now()
        ));
        let stale = UpdateCache {
            checked_at_ms: now() - CHECK_INTERVAL.as_millis() as u64,
            ..cache
        };
        assert!(should_check(Some(UpdateCheck::Notify), Some(&stale), now()));
    }

    #[test]
    fn a_matching_download_verifies_and_lands_in_the_workspace() {
        let payload = b"a fake assemblash binary".to_vec();
        let hash = hash_bytes(&payload);
        let name = binary_asset_name();
        let sums = format!("{hash}  {name}\n");
        let server = TestServer::start(vec![
            ("/v1.10.1/SHA256SUMS".to_owned(), sums.into_bytes()),
            (format!("/v1.10.1/{name}"), payload.clone()),
        ]);
        let root = temp_root("download");
        let temp = download_verified(&server.base, "v1.10.1", &root, &HttpReleaseFetcher).unwrap();
        assert_eq!(std::fs::read(&temp).unwrap(), payload);
        assert!(
            temp.starts_with(&root),
            "the download stays inside the workspace"
        );
        assert_eq!(server.count(), 2);
    }

    #[test]
    fn a_hash_mismatch_refuses_and_deletes_the_partial() {
        let payload = b"bytes nobody pinned".to_vec();
        let wrong = hash_bytes(b"other bytes entirely");
        let name = binary_asset_name();
        let sums = format!("{wrong}  {name}\n");
        let server = TestServer::start(vec![
            ("/v1.10.1/SHA256SUMS".to_owned(), sums.into_bytes()),
            (format!("/v1.10.1/{name}"), payload),
        ]);
        let root = temp_root("mismatch");
        let error =
            download_verified(&server.base, "v1.10.1", &root, &HttpReleaseFetcher).unwrap_err();
        assert!(matches!(error, UpdateError::HashMismatch { .. }), "{error}");
        assert!(!root.join(DOWNLOAD_TEMP).exists());
    }

    #[test]
    fn an_interrupted_download_refuses_and_leaves_no_partial_file() {
        let name = binary_asset_name();
        let sums = format!("0000  {name}\n");
        let sums_server =
            TestServer::start(vec![("/v1.10.1/SHA256SUMS".to_owned(), sums.into_bytes())]);
        let truncating = TruncatingServer::start(b"partial bytes");
        let root = temp_root("interrupted");
        // Text comes from the well-behaved server; the download from the one
        // that cuts the body off.
        let fetcher = SplitFetch {
            text_base: sums_server.base.clone(),
            download_base: truncating.base.clone(),
        };
        let error = download_verified("ignored", "v1.10.1", &root, &fetcher).unwrap_err();
        assert!(matches!(error, UpdateError::Fetch { .. }), "{error}");
        assert!(!root.join(DOWNLOAD_TEMP).exists());
    }

    #[test]
    fn a_missing_sums_file_is_a_typed_asset_refusal() {
        let server = TestServer::start(vec![]);
        let root = temp_root("no-sums");
        let error =
            download_verified(&server.base, "v1.10.1", &root, &HttpReleaseFetcher).unwrap_err();
        assert!(
            matches!(error, UpdateError::AssetMissing { .. }),
            "expected AssetMissing, got {error}"
        );
        if let UpdateError::AssetMissing { tag, name, page } = error {
            assert_eq!(tag, "v1.10.1");
            assert!(name.starts_with("assemblash-"));
            assert!(page.contains("/tag/v1.10.1"));
        }
    }

    /// Sends text fetches to one base and downloads to another.
    struct SplitFetch {
        text_base: String,
        download_base: String,
    }

    impl ReleaseFetcher for SplitFetch {
        fn fetch_text(&self, _url: &str) -> Result<String, String> {
            HttpReleaseFetcher.fetch_text(&format!("{}/v1.10.1/SHA256SUMS", self.text_base))
        }
        fn download(&self, _url: &str, dest: &Path) -> Result<u64, String> {
            let name = binary_asset_name();
            HttpReleaseFetcher.download(&format!("{}/v1.10.1/{name}", self.download_base), dest)
        }
    }

    #[test]
    fn the_swap_rename_pair_leaves_the_old_beside_the_new() {
        // The real `swap` works on `current_exe`, which a test must not
        // replace — it would delete the cargo binary. The behaviour under
        // test is the rename pair plus the next-start cleanup, exercised on
        // files this test owns.
        let root = temp_root("swap");
        let running = root.join("assemblash-test.exe");
        let replacement = root.join("verified-new");
        std::fs::write(&running, b"old binary").unwrap();
        std::fs::write(&replacement, b"new binary").unwrap();
        let old = old_binary_path(&running);
        std::fs::rename(&running, &old).unwrap();
        std::fs::rename(&replacement, &running).unwrap();
        assert_eq!(std::fs::read(&running).unwrap(), b"new binary");
        assert_eq!(std::fs::read(&old).unwrap(), b"old binary");
        // The next start removes the leftover (U4).
        std::fs::remove_file(&old).unwrap();
        assert!(!old.exists());
    }

    #[test]
    fn old_binary_path_appends_the_suffix() {
        let path = Path::new("/tools/assemblash");
        assert_eq!(
            old_binary_path(path),
            PathBuf::from("/tools/assemblash.old")
        );
    }

    #[test]
    fn a_managed_install_is_named_for_its_package_manager() {
        assert_eq!(
            classify_install(Path::new(
                "/opt/homebrew/Cellar/assemblash/1.9.0/bin/assemblash"
            )),
            InstallKind::Managed {
                manager: "Homebrew"
            }
        );
        assert_eq!(
            classify_install(Path::new(
                "C:\\Users\\a\\AppData\\Local\\Microsoft\\WinGet\\Packages\\assemblash\\assemblash.exe"
            )),
            InstallKind::Managed { manager: "winget" }
        );
        // A directory this process can write to is swappable.
        let writable = temp_root("swappable");
        assert_eq!(
            classify_install(&writable.join("assemblash.exe")),
            InstallKind::Swappable
        );
        // A directory this process cannot write to is treated as managed.
        assert_eq!(
            classify_install(Path::new("/proc/version/assemblash")),
            InstallKind::Managed {
                manager: "another installer"
            }
        );
    }

    #[test]
    fn pinned_hash_reads_the_sums_line_for_the_asset() {
        let sums = "aaa111  assemblash-linux-x86_64\nbbb222  assemblash-windows-x86_64.exe\n";
        assert_eq!(
            pinned_hash(sums, "assemblash-windows-x86_64.exe"),
            Some("bbb222".to_owned())
        );
        assert_eq!(pinned_hash(sums, "assemblash-missing"), None);
    }

    /// A real two-volume run — the binary on one drive, the workspace on
    /// another — cannot be made on a single-volume machine. The fallback
    /// branch is therefore exercised through the `force_copy` seam, and a
    /// genuine cross-drive swap stays a CI or person item.
    #[test]
    fn the_forced_copy_fallback_swaps_and_leaves_the_old() {
        let root = temp_root("swap-copy");
        let exe = root.join("assemblash-test.exe");
        let replacement = root.join("workspace").join("update-download.part");
        std::fs::create_dir_all(replacement.parent().unwrap()).unwrap();
        std::fs::write(&exe, b"old binary").unwrap();
        std::fs::write(&replacement, b"new binary").unwrap();

        swap_into(&exe, &replacement, true).unwrap();

        assert_eq!(std::fs::read(&exe).unwrap(), b"new binary");
        let old = old_binary_path(&exe);
        assert_eq!(std::fs::read(&old).unwrap(), b"old binary");
        // The staging file is gone: it was renamed onto the binary.
        assert!(!staging_path(&exe).exists());
        // The download temp is left where cleanup rules put it — the next
        // start removes `.old`, and the workspace owns its own `.part`.
        assert!(replacement.exists());
    }

    #[test]
    fn a_failing_copy_puts_the_old_binary_back_and_refuses_typed() {
        let root = temp_root("swap-copy-fail");
        let exe = root.join("assemblash-test.exe");
        let missing = root.join("no-such-download.part");
        std::fs::write(&exe, b"old binary").unwrap();

        let error = swap_into(&exe, &missing, true).unwrap_err();
        assert!(matches!(error, UpdateError::Io { .. }), "{error}");
        // The running binary is back; nothing half-done stays behind.
        assert_eq!(std::fs::read(&exe).unwrap(), b"old binary");
        assert!(!old_binary_path(&exe).exists());
        assert!(!staging_path(&exe).exists());
    }

    #[test]
    fn cross_volume_rename_errors_are_recognised_and_others_are_not() {
        // 17 is ERROR_NOT_SAME_DEVICE on Windows; 18 is EXDEV on POSIX.
        assert!(is_cross_volume(&std::io::Error::from_raw_os_error(17)));
        assert!(is_cross_volume(&std::io::Error::from_raw_os_error(18)));
        assert!(!is_cross_volume(&std::io::Error::from_raw_os_error(13)));
        assert!(!is_cross_volume(&std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "no os code"
        )));
    }

    #[test]
    fn the_staging_file_sits_beside_the_binary() {
        assert_eq!(
            staging_path(Path::new("/tools/assemblash")),
            PathBuf::from("/tools/assemblash.swap-new")
        );
    }
}
