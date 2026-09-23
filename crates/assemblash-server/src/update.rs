//! The update check as the serve transport sees it (decision D28).
//!
//! Two things live here and nowhere else:
//!
//! - [`startup_check`] — the one passive check `serve` may run. It is gated
//!   by the config's `updateCheck` consent, costs at most one `GET` every
//!   24 hours, caches its answer in the workspace, and never retries: a
//!   failure is one typed log line and `serve` continues.
//! - The two routes the interface uses. `GET /api/update-status` is
//!   read-only and answers from the workspace like every other `GET`;
//!   `POST /api/update-consent` records the one-time answer.
//!
//! MCP never reaches this module: the MCP transport does not call
//! [`startup_check`] and does not mount the routes, so an agent session
//! cannot cause a fetch. The render path does not either.

use std::path::Path;

use axum::extract::State;
use axum::Json;
use serde::Serialize;

use assemblash_core::workspace::{UpdateCheck, Workspace};
use assemblash_renderer::update::{self, ReleaseFetcher, UpdateError, UpdateInfo};

use crate::error::ApiError;
use crate::state::AppState;

/// What `GET /api/update-status` answers.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStatus {
    /// The version of this build.
    pub current: String,
    /// The version the last check named, when one has run.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latest: Option<String>,
    /// Whether `latest` is newer than `current`.
    pub newer: bool,
    /// The release-notes page of `latest`, when known.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes_url: Option<String>,
    /// The recorded consent: `"notify"`, `"off"`, or `null` while the
    /// one-time question has no answer yet.
    pub consent: Option<UpdateCheck>,
}

/// The body of `POST /api/update-consent`.
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentRequest {
    /// The consent to record.
    pub update_check: UpdateCheck,
}

/// Reads the update status from the workspace. No network, ever.
///
/// The config is read from disk rather than from the state captured at
/// start-up, so an answer written by `POST /api/update-consent` (or by a
/// hand edit of `config.toml`) is what the next read sees.
pub fn status_of(root: &Path, current: &str) -> UpdateStatus {
    let consent = Workspace::open_or_create(root)
        .ok()
        .and_then(|workspace| workspace.config().update_check);
    match update::read_cache(root) {
        Some(cache) => {
            let info = update::info_for(current, &cache.latest, cache.notes_url);
            UpdateStatus {
                current: current.to_owned(),
                latest: Some(info.remote),
                newer: info.newer,
                notes_url: info.notes_url,
                consent,
            }
        }
        None => UpdateStatus {
            current: current.to_owned(),
            latest: None,
            newer: false,
            notes_url: None,
            consent,
        },
    }
}

/// `GET /api/update-status`. Read-only; behind the same access check as the
/// other routes.
pub async fn get_update_status(State(state): State<AppState>) -> Json<UpdateStatus> {
    let root = state.workspace().root().to_path_buf();
    Json(status_of(&root, env!("CARGO_PKG_VERSION")))
}

/// `POST /api/update-consent`. Records the one-time answer in
/// `config.toml` and answers the new status.
pub async fn post_update_consent(
    State(state): State<AppState>,
    Json(request): Json<ConsentRequest>,
) -> Result<Json<UpdateStatus>, ApiError> {
    let root = state.workspace().root().to_path_buf();
    let mut workspace = Workspace::open_or_create(&root)?;
    let mut config = workspace.config().clone();
    config.update_check = Some(request.update_check);
    workspace.set_config(config)?;
    Ok(Json(status_of(&root, env!("CARGO_PKG_VERSION"))))
}

/// The one passive check `serve` may run (decision D28, U1 + U2).
///
/// Answers `Ok(None)` when nothing is known: the consent is off or
/// unanswered and no cache exists. A cached answer — fresh or stale — is
/// returned without a fetch. Consented and due, it makes exactly one
/// attempt — no retry loop — and either writes a fresh cache or returns the
/// typed error for the caller to log once.
pub fn startup_check(
    root: &Path,
    endpoint: &str,
    local_version: &str,
    fetcher: &dyn ReleaseFetcher,
    now_ms: u64,
) -> Result<Option<UpdateInfo>, UpdateError> {
    let consent = Workspace::open_or_create(root)
        .ok()
        .and_then(|workspace| workspace.config().update_check);
    let cache = update::read_cache(root);
    if !update::should_check(consent, cache.as_ref(), now_ms) {
        return Ok(
            cache.map(|cache| update::info_for(local_version, &cache.latest, cache.notes_url))
        );
    }
    update::check_with_cache(root, endpoint, local_version, fetcher, now_ms).map(Some)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;
    use assemblash_core::workspace::Workspace;
    use assemblash_renderer::update::{HttpReleaseFetcher, UpdateCache, CHECK_INTERVAL};
    use std::io::{Read, Write};
    use std::net::{TcpListener, TcpStream};
    use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
    use std::sync::Arc;

    const LOCAL: &str = env!("CARGO_PKG_VERSION");

    fn temp_root(tag: &str) -> std::path::PathBuf {
        let root = std::env::temp_dir().join(format!(
            "assemblash-server-update-{tag}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(&root).unwrap();
        root
    }

    fn atom(titles: &[&str]) -> String {
        let mut feed = String::from("<?xml version=\"1.0\"?><feed>");
        for title in titles {
            feed.push_str(&format!("<entry><id>x</id><title>{title}</title></entry>"));
        }
        feed.push_str("</feed>");
        feed
    }

    /// A local HTTP server that counts its requests, so the tests can assert
    /// that a gated check costs nothing and a due check costs exactly one.
    struct CountingServer {
        base: String,
        requests: Arc<AtomicUsize>,
        shutdown: Arc<AtomicBool>,
        handle: Option<std::thread::JoinHandle<()>>,
    }

    impl CountingServer {
        fn start(body: String) -> Self {
            let listener = TcpListener::bind("127.0.0.1:0").unwrap();
            let base = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
            let requests = Arc::new(AtomicUsize::new(0));
            let shutdown = Arc::new(AtomicBool::new(false));
            let handle = {
                let requests = Arc::clone(&requests);
                let shutdown = Arc::clone(&shutdown);
                std::thread::spawn(move || {
                    for stream in listener.incoming() {
                        if shutdown.load(Ordering::SeqCst) {
                            return;
                        }
                        let Ok(mut stream) = stream else { return };
                        requests.fetch_add(1, Ordering::SeqCst);
                        let mut buffer = [0u8; 4096];
                        let _ = stream.read(&mut buffer);
                        let head = format!(
                            "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                            body.len()
                        );
                        let _ = stream.write_all(head.as_bytes());
                        let _ = stream.write_all(body.as_bytes());
                    }
                })
            };
            Self {
                base,
                requests,
                shutdown,
                handle: Some(handle),
            }
        }

        fn count(&self) -> usize {
            self.requests.load(Ordering::SeqCst)
        }
    }

    impl Drop for CountingServer {
        fn drop(&mut self) {
            self.shutdown.store(true, Ordering::SeqCst);
            if let Ok(stream) = TcpStream::connect(self.base.trim_start_matches("http://")) {
                drop(stream);
            }
            if let Some(handle) = self.handle.take() {
                let _ = handle.join();
            }
        }
    }

    fn set_consent(root: &Path, consent: Option<UpdateCheck>) {
        let mut workspace = Workspace::open_or_create(root).unwrap();
        let mut config = workspace.config().clone();
        config.update_check = consent;
        workspace.set_config(config).unwrap();
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }

    /// Exit test 1: check off (or unanswered), `serve` makes no request.
    #[test]
    fn a_gated_check_costs_zero_requests() {
        let server = CountingServer::start(atom(&["v9.9.9"]));
        let endpoint = format!("{}/releases.atom", server.base);
        let root = temp_root("gated");
        for consent in [None, Some(UpdateCheck::Off)] {
            set_consent(&root, consent);
            let answered =
                startup_check(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now()).unwrap();
            assert!(answered.is_none());
        }
        assert_eq!(
            server.count(),
            0,
            "a gated check must not touch the network"
        );
    }

    /// Exit test 2: consented but offline, the check is one typed failure
    /// with no retry — and `serve` continues, which is the caller's part.
    #[test]
    fn an_offline_check_fails_once_and_does_not_retry() {
        let root = temp_root("offline");
        set_consent(&root, Some(UpdateCheck::Notify));
        // Port 1 on loopback is closed by construction.
        let endpoint = "http://127.0.0.1:1/releases.atom";
        let first = startup_check(&root, endpoint, LOCAL, &HttpReleaseFetcher, now());
        assert!(matches!(first, Err(UpdateError::Fetch { .. })), "{first:?}");
        // Called again, it is still exactly one attempt per call, and the
        // failure is the same typed one — the check never spins.
        let second = startup_check(&root, endpoint, LOCAL, &HttpReleaseFetcher, now());
        assert!(matches!(second, Err(UpdateError::Fetch { .. })));
    }

    /// Exit test 2, the success side: consented and online, one request,
    /// and the cache answers the due-window question for the next 24 hours.
    #[test]
    fn a_due_check_costs_one_request_and_then_the_cache_answers() {
        let server = CountingServer::start(atom(&["v1.10.1"]));
        let endpoint = format!("{}/releases.atom", server.base);
        let root = temp_root("due");
        set_consent(&root, Some(UpdateCheck::Notify));

        let answered = startup_check(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now())
            .unwrap()
            .unwrap();
        assert_eq!(answered.remote, "1.10.1");
        assert!(answered.newer);
        assert_eq!(server.count(), 1);

        // Inside the window: again nothing is fetched.
        let cached = startup_check(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now() + 60_000)
            .unwrap()
            .unwrap();
        assert_eq!(cached.remote, "1.10.1");
        assert_eq!(server.count(), 1, "the 24-hour cache must answer");

        // Past the window the one request is allowed again.
        let later = startup_check(
            &root,
            &endpoint,
            LOCAL,
            &HttpReleaseFetcher,
            now() + CHECK_INTERVAL.as_millis() as u64 + 1,
        )
        .unwrap()
        .unwrap();
        assert_eq!(later.remote, "1.10.1");
        assert_eq!(server.count(), 2);
    }

    /// The status route's data: consent and a cached newer version, without
    /// any fetch happening on read.
    #[test]
    fn status_reads_consent_and_cache_without_fetching() {
        let server = CountingServer::start(atom(&["v1.10.1"]));
        let endpoint = format!("{}/releases.atom", server.base);
        let root = temp_root("status");
        set_consent(&root, Some(UpdateCheck::Notify));
        let none = status_of(&root, LOCAL);
        assert_eq!(none.consent, Some(UpdateCheck::Notify));
        assert_eq!(none.latest, None);
        assert!(!none.newer);

        startup_check(&root, &endpoint, LOCAL, &HttpReleaseFetcher, now()).unwrap();
        let status = status_of(&root, LOCAL);
        assert_eq!(status.latest.as_deref(), Some("1.10.1"));
        assert!(status.newer);
        assert_eq!(server.count(), 1, "reading the status must not fetch");

        // An unanswered consent reads as `null` on the wire.
        let fresh = temp_root("status-fresh");
        let unanswered = status_of(&fresh, LOCAL);
        assert_eq!(unanswered.consent, None);
    }

    /// The consent answer is recorded in `config.toml` and read back.
    #[test]
    fn a_recorded_consent_survives_a_reopen() {
        let root = temp_root("consent");
        set_consent(&root, Some(UpdateCheck::Off));
        set_consent(&root, Some(UpdateCheck::Notify));
        let workspace = Workspace::open_or_create(&root).unwrap();
        assert_eq!(workspace.config().update_check, Some(UpdateCheck::Notify));
        // The spelling on disk is the decided one.
        let text = std::fs::read_to_string(root.join("config.toml")).unwrap();
        assert!(text.contains("updateCheck = \"notify\""), "{text}");
    }

    /// The cache file shape the status route reads back (round trip).
    #[test]
    fn a_cache_round_trips_through_the_workspace() {
        let root = temp_root("cache-shape");
        let cache = UpdateCache {
            version: 1,
            latest: "1.10.1".to_owned(),
            notes_url: Some("https://example.com/tag/v1.10.1".to_owned()),
            checked_at_ms: now(),
        };
        std::fs::write(
            root.join("update-cache.json"),
            serde_json::to_string(&cache).unwrap(),
        )
        .unwrap();
        let status = status_of(&root, LOCAL);
        assert_eq!(status.latest.as_deref(), Some("1.10.1"));
        assert!(status.newer);
        assert_eq!(
            status.notes_url.as_deref(),
            Some("https://example.com/tag/v1.10.1")
        );
    }
}
