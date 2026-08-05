//! Knowing whether a server is already running, and stopping the one that is.
//!
//! Both exist for the same promise: someone who has never opened a terminal
//! double-clicks the binary, uses it, and closes it. Two things follow.
//!
//! A second double-click must not start a rival server on another port and
//! leave two windows editing the same projects. It should find the one that is
//! already there and open that. A file in the workspace records where it is.
//!
//! And stopping has to be possible from the page, because there is no console
//! to press Ctrl-C in. That is a shutdown endpoint — but only for a server
//! that was started by a double-click. A service manager or a container owns
//! its own lifetime, and a web page must not be able to take it away.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// File in the workspace naming the server that is running.
pub const INSTANCE_FILE: &str = "running.json";

/// What a running server records about itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Running {
    /// Process id, so a stale file is recognisable.
    pub pid: u32,
    /// The address it bound, as a URL.
    pub url: String,
    /// Version of the binary serving.
    pub version: String,
}

/// Whether this server may be shut down by a request.
///
/// A page cannot be allowed to stop a service somebody else is managing, so
/// this is off unless the binary started itself for a person.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum Shutdown {
    /// Only the process owner stops this server.
    #[default]
    Refused,
    /// The interface may stop it: nobody else is managing this process.
    Allowed,
}

/// Records that this process is serving, replacing a stale claim.
pub fn record(workspace_root: &Path, url: &str) -> std::io::Result<()> {
    let running = Running {
        pid: std::process::id(),
        url: url.to_owned(),
        version: env!("CARGO_PKG_VERSION").to_owned(),
    };
    let mut json = serde_json::to_string_pretty(&running).unwrap_or_default();
    json.push('\n');
    std::fs::write(workspace_root.join(INSTANCE_FILE), json)
}

/// Removes this process's claim.
pub fn clear(workspace_root: &Path) {
    let path = workspace_root.join(INSTANCE_FILE);
    // Only if it is still ours: a server that crashed and was replaced should
    // not have its successor's claim deleted by a late tidy-up.
    if let Ok(running) = read(workspace_root) {
        if running.is_some_and(|running| running.pid == std::process::id()) {
            let _ = std::fs::remove_file(path);
        }
    }
}

/// Reads the claim, if there is one.
pub fn read(workspace_root: &Path) -> std::io::Result<Option<Running>> {
    let path = workspace_root.join(INSTANCE_FILE);
    match std::fs::read_to_string(&path) {
        Ok(text) => Ok(serde_json::from_str(&text).ok()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error),
    }
}

/// The URL of a server that is running and answering, if one is.
///
/// A recorded claim is not proof: the process may be gone, or the file may be
/// left over from a crash. The check is whether something answers on that
/// address and says it is Assemblash — which is also what makes replacing a
/// stale claim safe.
pub fn running_url(workspace_root: &Path) -> Option<String> {
    let running = read(workspace_root).ok().flatten()?;
    answers(&running.url).then_some(running.url)
}

/// Whether an Assemblash server answers at a URL.
fn answers(url: &str) -> bool {
    use std::io::{Read as _, Write as _};

    let Some(authority) = url.strip_prefix("http://") else {
        return false;
    };
    let Ok(address) = authority
        .trim_end_matches('/')
        .parse::<std::net::SocketAddr>()
    else {
        return false;
    };
    // Short timeouts throughout: this runs before a person sees anything, and
    // a server that does not answer promptly is one this launch should replace
    // rather than wait for.
    let timeout = std::time::Duration::from_millis(700);
    let Ok(mut stream) = std::net::TcpStream::connect_timeout(&address, timeout) else {
        return false;
    };
    let _ = stream.set_read_timeout(Some(timeout));
    let _ = stream.set_write_timeout(Some(timeout));

    let request =
        format!("GET /api/version HTTP/1.1\r\nHost: {authority}\r\nConnection: close\r\n\r\n");
    if stream.write_all(request.as_bytes()).is_err() {
        return false;
    }
    let mut response = String::new();
    let _ = stream.take(4096).read_to_string(&mut response);
    response.contains("\"name\":\"assemblash\"")
}

/// Opens a URL in the user's browser.
///
/// Best effort by design: the URL is printed as well, so a machine with no
/// browser, or a desktop that refuses, leaves the person with something they
/// can still use rather than an error about a thing they did not ask for.
pub fn open_browser(url: &str) -> bool {
    let launched = if cfg!(target_os = "windows") {
        // Through cmd's `start`, whose first quoted argument is the window
        // title — hence the empty one. The URL comes from this process, not
        // from a request.
        std::process::Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
    } else if cfg!(target_os = "macos") {
        std::process::Command::new("open").arg(url).spawn()
    } else {
        std::process::Command::new("xdg-open").arg(url).spawn()
    };
    launched.is_ok()
}

/// Where the instance file for a workspace is.
pub fn instance_path(workspace_root: &Path) -> PathBuf {
    workspace_root.join(INSTANCE_FILE)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn a_claim_round_trips_and_clears() {
        let dir = tempfile::tempdir().unwrap();
        assert!(read(dir.path()).unwrap().is_none());

        record(dir.path(), "http://127.0.0.1:8787").unwrap();
        let running = read(dir.path()).unwrap().unwrap();
        assert_eq!(running.pid, std::process::id());
        assert_eq!(running.url, "http://127.0.0.1:8787");
        assert_eq!(running.version, env!("CARGO_PKG_VERSION"));

        clear(dir.path());
        assert!(read(dir.path()).unwrap().is_none());
    }

    #[test]
    fn a_claim_by_another_process_is_not_cleared() {
        let dir = tempfile::tempdir().unwrap();
        let other = Running {
            pid: std::process::id().wrapping_add(1),
            url: "http://127.0.0.1:1".to_owned(),
            version: "0.0.0".to_owned(),
        };
        std::fs::write(
            instance_path(dir.path()),
            serde_json::to_string(&other).unwrap(),
        )
        .unwrap();

        clear(dir.path());
        assert_eq!(read(dir.path()).unwrap(), Some(other));
    }

    #[test]
    fn a_claim_nothing_answers_is_not_believed() {
        let dir = tempfile::tempdir().unwrap();
        // Port 1 on loopback: nothing is listening, so the claim is stale and
        // this launch should start its own server rather than wait.
        record(dir.path(), "http://127.0.0.1:1").unwrap();
        assert_eq!(running_url(dir.path()), None);
    }

    #[test]
    fn a_claim_that_is_not_a_loopback_url_is_not_believed() {
        let dir = tempfile::tempdir().unwrap();
        for nonsense in ["", "not a url", "https://example.com", "http://"] {
            std::fs::write(
                instance_path(dir.path()),
                serde_json::to_string(&Running {
                    pid: 1,
                    url: nonsense.to_owned(),
                    version: "0".to_owned(),
                })
                .unwrap(),
            )
            .unwrap();
            assert_eq!(running_url(dir.path()), None, "{nonsense:?}");
        }
    }
}
