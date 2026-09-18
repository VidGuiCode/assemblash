//! The local HTTP API.
//!
//! A transport over `assemblash-core`, not a second engine (PRD §7.2). Every
//! mutation this crate performs is an
//! [`Operation`](assemblash_core::Operation) handed to
//! [`Session::apply`](assemblash_core::Session::apply); the MCP server in v0.7
//! will be another transport over exactly the same calls.
//!
//! # Where it listens, and who may talk to it
//!
//! The default is `127.0.0.1` with no token and nothing to configure. Binding
//! anywhere else is possible and **refuses to start without an access token**
//! (PRD §16.1, decision 14) — see [`crate::auth`], which is the one place that
//! rule lives.

pub mod api;
pub mod auth;
pub mod error;
pub mod instance;
pub mod render;
pub mod site;
pub mod state;
pub mod ui;

use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use assemblash_core::workspace::Workspace;
use axum::Router;

pub use auth::{Access, AccessError};
pub use error::ApiError;
pub use instance::Shutdown;
pub use site::SiteGuard;
pub use state::AppState;
pub use ui::UiSource;

/// Re-exported so another transport can build an [`ApiError`] without taking
/// its own dependency on axum. MCP has no status codes; it uses the shared
/// error type for its machine-readable codes, and the status rides along.
pub use axum::http::StatusCode;

/// Something that stopped the server starting.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum ServeError {
    /// No port could be bound.
    #[error("cannot listen on 127.0.0.1: {source}")]
    Bind {
        /// Underlying cause.
        source: std::io::Error,
    },

    /// The server stopped with an error.
    #[error("the server stopped: {source}")]
    Serving {
        /// Underlying cause.
        source: std::io::Error,
    },

    /// The requested address is not one this server will serve.
    #[error(transparent)]
    Access {
        /// What was wrong.
        source: AccessError,
    },
}

/// A bound listener, before anything is served on it.
///
/// Binding and serving are separate so a caller can learn the real port —
/// which is not the requested one when the requested one was taken — and
/// print or open it before the first request arrives.
#[derive(Debug)]
pub struct Server {
    listener: tokio::net::TcpListener,
    router: Router,
    address: SocketAddr,
    /// Flipped when the interface asks the server to stop.
    stopping: tokio::sync::watch::Receiver<bool>,
    /// The state the routes share, so another transport mounted on this
    /// server works on the same open projects rather than a second registry.
    state: AppState,
    /// Who may talk to this server, applied to mounted services as well.
    access: Access,
    /// Which web pages may use it, applied to every route when it serves.
    site: SiteGuard,
    /// Asks this server to stop, the way the interface's button does.
    stop: std::sync::Arc<tokio::sync::watch::Sender<bool>>,
}

impl Server {
    /// Binds the API for a workspace.
    ///
    /// Tries `port`, then falls back to a port the operating system picks. A
    /// taken port is the ordinary case for a second launch, not an error worth
    /// stopping for — and the fallback is what makes the no-terminal launch in
    /// v0.10 possible.
    pub async fn bind(workspace: Workspace, port: u16, ui: UiSource) -> Result<Self, ServeError> {
        Self::bind_with(workspace, port, ui, Shutdown::Refused).await
    }

    /// Binds loopback with a shutdown policy, the way tests and friendly mode
    /// have always done.
    pub async fn bind_with(
        workspace: Workspace,
        port: u16,
        ui: UiSource,
        shutdown: Shutdown,
    ) -> Result<Self, ServeError> {
        Self::bind_to(
            workspace,
            IpAddr::V4(Ipv4Addr::LOCALHOST),
            port,
            ui,
            shutdown,
        )
        .await
    }

    /// Binds an explicit address, refusing a wide one with no token.
    ///
    /// The refusal is the point: a server that bound a network and went on
    /// serving would publish the workspace to it, and the flag that did so
    /// would not have looked like it was going to.
    ///
    /// The token comes from the workspace configuration, so the only way to
    /// get one is `assemblash token rotate` — deliberately not a command-line
    /// argument, which would put it in shell history and process listings.
    pub async fn bind_to(
        workspace: Workspace,
        address: IpAddr,
        port: u16,
        ui: UiSource,
        shutdown: Shutdown,
    ) -> Result<Self, ServeError> {
        Self::bind_to_reclaiming(workspace, address, port, ui, shutdown, false).await
    }

    /// [`Server::bind_to`], plus whether a lock left by a dead process on this
    /// machine may be cleared when a project is opened.
    ///
    /// A separate constructor rather than another argument on every `bind*`
    /// because the answer is almost always "no": a server a service manager
    /// started shares its machine, and a lock it did not write is not
    /// obviously its business. The friendly launch — one person's editor, on
    /// their own desktop, most likely restarted because the last one crashed —
    /// is the case that wants "yes".
    pub async fn bind_to_reclaiming(
        workspace: Workspace,
        address: IpAddr,
        port: u16,
        ui: UiSource,
        shutdown: Shutdown,
        reclaim_stale_locks: bool,
    ) -> Result<Self, ServeError> {
        let access = auth::policy_for(address, workspace.config().token.as_deref())
            .map_err(|source| ServeError::Access { source })?;
        let site = SiteGuard::for_bind(address, &access, &workspace.config().allowed_hosts);

        let (send, receive) = tokio::sync::watch::channel(false);
        let stop = std::sync::Arc::new(send);
        let state = AppState::with_reclaim(workspace, reclaim_stale_locks);
        let router = api::router(state.clone(), ui, shutdown, stop.clone(), access.clone());

        // Port 0 as a fallback only for loopback: a server meant to be
        // reachable at a known address that quietly moved to another port
        // would be worse than one that says it could not start.
        let candidates: &[u16] = if auth::is_loopback(address) {
            &[port, 0]
        } else {
            &[port]
        };

        let mut last = None;
        for candidate in candidates.iter().copied() {
            let address = SocketAddr::from((address, candidate));
            match tokio::net::TcpListener::bind(address).await {
                Ok(listener) => {
                    let address = listener
                        .local_addr()
                        .map_err(|source| ServeError::Bind { source })?;
                    return Ok(Self {
                        listener,
                        router,
                        address,
                        stopping: receive,
                        state,
                        access,
                        site: site.clone(),
                        stop: stop.clone(),
                    });
                }
                Err(source) => last = Some(source),
            }
        }
        Err(ServeError::Bind {
            source: last.unwrap_or_else(|| std::io::Error::other("no address was tried")),
        })
    }

    /// The address actually bound, loopback and a real port.
    pub fn address(&self) -> SocketAddr {
        self.address
    }

    /// The base URL a browser or client should use.
    ///
    /// A wildcard bind has no useful address to print, so it becomes loopback:
    /// that is where the person who started it is.
    pub fn url(&self) -> String {
        if self.address.ip().is_unspecified() {
            return format!("http://127.0.0.1:{}", self.address.port());
        }
        format!("http://{}", self.address)
    }

    /// The shared state behind every route.
    ///
    /// A clone over the same open projects, not a copy: a transport built from
    /// it — the hosted MCP endpoint — reads and writes the sessions the HTTP
    /// API holds, under the same lock.
    pub fn state(&self) -> AppState {
        self.state.clone()
    }

    /// Whether requests to this server need a token.
    pub fn needs_token(&self) -> bool {
        self.access.needs_token()
    }

    /// Whether the bound address reaches only this machine.
    pub fn is_loopback(&self) -> bool {
        auth::is_loopback(self.address.ip())
    }

    /// The `Host` and `Origin` checks this server applies to every route.
    pub fn site_guard(&self) -> &SiteGuard {
        &self.site
    }

    /// A handle that asks this server to stop, as `POST /api/shutdown` does.
    ///
    /// For a caller that must stop it from outside a request: the command
    /// line, when the person presses Ctrl-C. Sending `true` starts the same
    /// graceful shutdown, so in-flight requests finish and every open project
    /// is released.
    pub fn stop_handle(&self) -> std::sync::Arc<tokio::sync::watch::Sender<bool>> {
        self.stop.clone()
    }

    /// Adds `GET /api/agent-sessions`: how many AI agents are connected.
    ///
    /// The count comes from the mounted MCP endpoint, which the server crate
    /// cannot see, so the caller that mounts it passes a way to ask.
    pub fn with_agent_sessions(
        mut self,
        count: impl Fn() -> usize + Send + Sync + 'static,
    ) -> Self {
        let count = std::sync::Arc::new(count);
        let route = Router::new()
            .route(
                "/api/agent-sessions",
                axum::routing::get(move || {
                    let count = count.clone();
                    async move { axum::Json(api::AgentSessions { count: count() }) }
                }),
            )
            .layer(axum::middleware::from_fn_with_state(
                self.access.clone(),
                api::require_access,
            ));
        self.router = self.router.merge(route);
        self
    }

    /// A receiver that changes when this server is asked to stop.
    ///
    /// A mounted service that holds connections open — an event stream —
    /// watches this to close them, so a graceful shutdown does not wait for
    /// clients that will never disconnect.
    pub fn stop_signal(&self) -> tokio::sync::watch::Receiver<bool> {
        self.stopping.clone()
    }

    /// Mounts another service at a fixed path, behind the same access check
    /// as every route.
    ///
    /// The server crate cannot depend on the transports built over it, so
    /// the caller that knows both does the wiring. The access check is
    /// applied here and not left to the caller: a mounted service that
    /// skipped it would be a way around the token.
    ///
    /// # Panics
    ///
    /// When `path` is not a valid route or is already taken — a programming
    /// error in the caller, found the first time the binary starts.
    pub fn with_service<S>(mut self, path: &str, service: S) -> Self
    where
        S: tower_service::Service<axum::extract::Request, Error = std::convert::Infallible>
            + Clone
            + Send
            + Sync
            + 'static,
        S::Response: axum::response::IntoResponse,
        S::Future: Send + 'static,
    {
        let guarded =
            Router::new()
                .route_service(path, service)
                .layer(axum::middleware::from_fn_with_state(
                    self.access.clone(),
                    api::require_access,
                ));
        self.router = self.router.merge(guarded);
        self
    }

    /// Adds `GET /api/agent-access`: what an AI agent needs to connect to the
    /// MCP endpoint mounted at `mcp_path`.
    ///
    /// Added by the caller that mounts the endpoint, so a server without one
    /// never advertises it. The answer is local information for a local page
    /// — the executable path and the workspace — and it sits behind the same
    /// access check as every route. It never contains the token.
    pub fn with_agent_access(mut self, mcp_path: &str) -> Self {
        let access = api::AgentAccess {
            mcp_url: format!("{}{mcp_path}", self.url()),
            executable: std::env::current_exe()
                .map(|path| path.to_string_lossy().into_owned())
                .unwrap_or_default(),
            workspace: self.state.workspace().root().to_string_lossy().into_owned(),
            token_required: self.access.needs_token(),
        };
        let route = Router::new()
            .route(
                "/api/agent-access",
                axum::routing::get(move || {
                    let access = access.clone();
                    async move { axum::Json(access) }
                }),
            )
            .layer(axum::middleware::from_fn_with_state(
                self.access.clone(),
                api::require_access,
            ));
        self.router = self.router.merge(route);
        self
    }

    /// Serves until the process is stopped, or the interface asks it to stop.
    ///
    /// A graceful shutdown: in-flight requests finish, and every open session
    /// is dropped — which releases its lock file — before this returns.
    pub async fn serve(self) -> Result<(), ServeError> {
        let mut stopping = self.stopping;
        // Applied here, to the finished router, so that routes and services
        // mounted after the bind are covered too.
        let router = self.router.layer(axum::middleware::from_fn_with_state(
            self.site,
            api::require_same_site,
        ));
        axum::serve(self.listener, router)
            .with_graceful_shutdown(async move {
                // `changed()` only returns once someone sets it, which is the
                // shutdown endpoint.
                let _ = stopping.changed().await;
            })
            .await
            .map_err(|source| ServeError::Serving { source })
    }
}
