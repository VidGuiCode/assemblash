//! MCP served by the editor process, over the editor's own state.
//!
//! The editor is the host and the agent is a guest. A person starts
//! Assemblash, and an agent on the same machine connects to `/mcp` on the
//! same server. Both use one [`AppState`]: one registry of open projects, one
//! lock per project, one writer. Two processes that each opened the project
//! would lock one of them out.
//!
//! # Security
//!
//! The service is mounted with
//! [`Server::with_service`](assemblash_server::Server::with_service), which
//! applies the same access check as every HTTP route. A token the workspace
//! requires is required here too.
//!
//! On a loopback bind, rmcp's `Host` check stays on with its loopback
//! defaults. That is the defence against DNS rebinding: a web page that makes
//! its own name resolve to 127.0.0.1 still sends its own name as `Host`. The
//! `Origin` check allows only this server's own origins. A request with no
//! `Origin` — every real MCP client — passes.
//!
//! With a token, or on a wider bind, both checks are off and the token does
//! the work: a web page cannot know it. The server applies the same rule to
//! every route (`assemblash_server::site`), and a reverse proxy name in
//! `allowed-hosts` is accepted here as there.

use assemblash_server::AppState;
use rmcp::transport::streamable_http_server::session::local::LocalSessionManager;
use rmcp::transport::{StreamableHttpServerConfig, StreamableHttpService};

use crate::{AssemblashMcp, Backend};

/// The path the hosted endpoint is mounted at.
pub const MCP_PATH: &str = "/mcp";

/// Where the hosted endpoint lives, and when it must stop.
#[derive(Debug, Clone)]
pub struct Hosting {
    /// The server's base URL, as [`Server::url`](assemblash_server::Server::url)
    /// reports it.
    pub url: String,
    /// The port actually bound.
    pub port: u16,
    /// Whether the server applies the `Host` and `Origin` checks: a loopback
    /// bind with no token (see `assemblash_server::site`).
    pub local_only: bool,
    /// Further `Host` names accepted, from `allowed-hosts` in the workspace
    /// configuration.
    pub extra_hosts: Vec<String>,
    /// Changes when the server is asked to stop, from
    /// [`Server::stop_signal`](assemblash_server::Server::stop_signal).
    pub stopping: tokio::sync::watch::Receiver<bool>,
    /// How long an MCP session may stay idle before the server ends it.
    ///
    /// `None` keeps rmcp's default (five minutes). A client that is idle
    /// longer starts a new session; the stdio relay does this by itself.
    pub session_idle: Option<std::time::Duration>,
}

/// The MCP endpoint as an HTTP service, over an editor's state.
///
/// One [`AssemblashMcp`] per MCP session, so the project `open_project`
/// selects stays per conversation. Every session shares one
/// [`Backend::from_state`], which never closes the editor's projects.
///
/// Call this inside the runtime that serves: it starts a task that watches
/// the stop signal.
/// How many MCP sessions the hosted endpoint holds.
///
/// The editor shows this, so a person can see that an agent is connected.
/// Reading it never waits: when the session list is busy, the last count is
/// used, and the next read is a moment later.
#[derive(Debug, Clone)]
pub struct AgentSessions {
    sessions: std::sync::Arc<LocalSessionManager>,
    last: std::sync::Arc<std::sync::atomic::AtomicUsize>,
}

impl AgentSessions {
    /// How many agents are connected.
    pub fn count(&self) -> usize {
        match self.sessions.sessions.try_read() {
            Ok(sessions) => {
                let count = sessions.len();
                self.last.store(count, std::sync::atomic::Ordering::Relaxed);
                count
            }
            Err(_) => self.last.load(std::sync::atomic::Ordering::Relaxed),
        }
    }
}

/// [`http_service`], and a handle that counts the sessions it holds.
pub fn http_service_with_sessions(
    state: AppState,
    hosting: Hosting,
) -> (
    StreamableHttpService<AssemblashMcp, LocalSessionManager>,
    AgentSessions,
) {
    let (service, sessions) = build_service(state, hosting);
    let counter = AgentSessions {
        sessions,
        last: std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(0)),
    };
    (service, counter)
}

pub fn http_service(
    state: AppState,
    hosting: Hosting,
) -> StreamableHttpService<AssemblashMcp, LocalSessionManager> {
    build_service(state, hosting).0
}

fn build_service(
    state: AppState,
    hosting: Hosting,
) -> (
    StreamableHttpService<AssemblashMcp, LocalSessionManager>,
    std::sync::Arc<LocalSessionManager>,
) {
    let backend = Backend::from_state(state);
    let config = config_for(&hosting);

    // Open event streams would hold a graceful shutdown forever. Cancel them
    // when the server stops, or when the server is gone (the sender dropped).
    let cancel = config.cancellation_token.clone();
    let mut stopping = hosting.stopping.clone();
    tokio::spawn(async move {
        while stopping.changed().await.is_ok() {
            if *stopping.borrow() {
                break;
            }
        }
        cancel.cancel();
    });

    let mut sessions = LocalSessionManager::default();
    if let Some(idle) = hosting.session_idle {
        sessions.session_config.keep_alive = Some(idle);
    }
    let sessions = std::sync::Arc::new(sessions);

    (
        StreamableHttpService::new(
            move || Ok(AssemblashMcp::new(backend.clone())),
            sessions.clone(),
            config,
        ),
        sessions,
    )
}

/// The rmcp configuration a bind calls for. Separate so it can be tested
/// without a socket.
fn config_for(hosting: &Hosting) -> StreamableHttpServerConfig {
    let config = StreamableHttpServerConfig::default()
        .with_cancellation_token(tokio_util::sync::CancellationToken::new());
    if hosting.local_only {
        // The same rule as every other route: the loopback names, plus the
        // names the workspace allows for a reverse proxy.
        let mut hosts = vec![
            "localhost".to_owned(),
            "127.0.0.1".to_owned(),
            "::1".to_owned(),
        ];
        hosts.extend(hosting.extra_hosts.iter().cloned());
        let config = config.with_allowed_hosts(hosts);
        let port = hosting.port;
        let mut origins = vec![
            format!("http://127.0.0.1:{port}"),
            format!("http://localhost:{port}"),
            format!("http://[::1]:{port}"),
        ];
        let own = hosting.url.trim_end_matches('/').to_owned();
        if !origins.contains(&own) {
            origins.push(own);
        }
        for host in &hosting.extra_hosts {
            origins.push(format!("http://{host}"));
            origins.push(format!("https://{host}"));
        }
        config.with_allowed_origins(origins)
    } else {
        config.disable_allowed_hosts().disable_allowed_origins()
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    fn hosting(local_only: bool) -> Hosting {
        let (_send, stopping) = tokio::sync::watch::channel(false);
        Hosting {
            url: "http://127.0.0.1:8787".to_owned(),
            port: 8787,
            local_only,
            extra_hosts: Vec::new(),
            stopping,
            session_idle: None,
        }
    }

    #[test]
    fn a_loopback_bind_keeps_the_host_check_and_allows_only_its_own_origins() {
        let config = config_for(&hosting(true));
        assert_eq!(config.allowed_hosts, ["localhost", "127.0.0.1", "::1"]);
        assert!(config
            .allowed_origins
            .contains(&"http://127.0.0.1:8787".to_owned()));
        assert!(config
            .allowed_origins
            .contains(&"http://localhost:8787".to_owned()));
        assert!(config
            .allowed_origins
            .iter()
            .all(|origin| origin.ends_with(":8787")));
    }

    #[test]
    fn a_wide_bind_relies_on_the_token() {
        let config = config_for(&hosting(false));
        assert!(config.allowed_hosts.is_empty());
        assert!(config.allowed_origins.is_empty());
    }
}
