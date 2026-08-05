//! The local HTTP API.
//!
//! A transport over `assemblash-core`, not a second engine (PRD §7.2). Every
//! mutation this crate performs is an
//! [`Operation`](assemblash_core::Operation) handed to
//! [`Session::apply`](assemblash_core::Session::apply); the MCP server in v0.7
//! will be another transport over exactly the same calls.
//!
//! # It listens on the loopback interface only
//!
//! [`Server::bind`] resolves its address itself and always to `127.0.0.1`.
//! There is no configuration key for the address, because "make it reachable
//! from the network" is a decision with an authentication question attached
//! (PRD §16.14, still open) and a setting is how such a decision gets made by
//! accident.

pub mod api;
pub mod error;
pub mod instance;
pub mod render;
pub mod state;
pub mod ui;

use std::net::{Ipv4Addr, SocketAddr};

use assemblash_core::workspace::Workspace;
use axum::Router;

pub use error::ApiError;
pub use instance::Shutdown;
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

    /// Binds, saying whether the interface may stop this server.
    ///
    /// Only a server this binary started for a person may be stopped from the
    /// page. A service manager or a container owns its own lifetime, and a web
    /// page must not be able to take it away.
    pub async fn bind_with(
        workspace: Workspace,
        port: u16,
        ui: UiSource,
        shutdown: Shutdown,
    ) -> Result<Self, ServeError> {
        let (send, receive) = tokio::sync::watch::channel(false);
        let router = api::router(AppState::new(workspace), ui, shutdown, send);

        let mut last = None;
        for candidate in [port, 0] {
            let address = SocketAddr::from((Ipv4Addr::LOCALHOST, candidate));
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
    pub fn url(&self) -> String {
        format!("http://{}", self.address)
    }

    /// Serves until the process is stopped, or the interface asks it to stop.
    ///
    /// A graceful shutdown: in-flight requests finish, and every open session
    /// is dropped — which releases its lock file — before this returns.
    pub async fn serve(self) -> Result<(), ServeError> {
        let mut stopping = self.stopping;
        axum::serve(self.listener, self.router)
            .with_graceful_shutdown(async move {
                // `changed()` only returns once someone sets it, which is the
                // shutdown endpoint.
                let _ = stopping.changed().await;
            })
            .await
            .map_err(|source| ServeError::Serving { source })
    }
}
