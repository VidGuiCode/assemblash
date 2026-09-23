//! Mounting a service on the router.
//!
//! `Server::with_service` is how the MCP endpoint joins the server the
//! command line starts. A path that is not a valid route, or is already
//! taken, is a startup misconfiguration: it comes back as a typed error, so
//! the binary reports it and stops, instead of panicking (NFR-4).

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::task::{Context, Poll};

use assemblash_core::workspace::Workspace;
use assemblash_server::Server;
use axum::extract::Request;
use axum::response::IntoResponse;

/// A minimal service that answers 200, in the shape `with_service` mounts.
#[derive(Clone)]
struct OkService;

impl tower_service::Service<Request> for OkService {
    type Response = axum::response::Response;
    type Error = std::convert::Infallible;
    type Future = std::future::Ready<Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _request: Request) -> Self::Future {
        std::future::ready(Ok(axum::http::StatusCode::OK.into_response()))
    }
}

#[test]
fn mounting_two_services_at_one_path_is_a_typed_error() {
    let directory = tempfile::tempdir().unwrap();
    let root = directory.path().join("workspace");
    let workspace = Workspace::open_or_create(&root).unwrap();
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();
    runtime.block_on(async {
        let server = Server::bind(workspace, 0, Default::default())
            .await
            .unwrap();

        // The first mount at a free path is fine.
        let mounted = server.with_service("/mcp", OkService);
        assert!(mounted.is_ok(), "the first mount at /mcp must succeed");
        let server = mounted.unwrap();

        // The second one is a typed error, not a panic.
        let error = server
            .with_service("/mcp", OkService)
            .expect_err("a second service at /mcp must be refused");
        assert_eq!(error.code(), "routeConflict", "{error:?}");
        assert_eq!(
            error.status(),
            assemblash_server::StatusCode::INTERNAL_SERVER_ERROR
        );
        assert!(error.message().contains("/mcp"), "{error:?}");
    });
}
