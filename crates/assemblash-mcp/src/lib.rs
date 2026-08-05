//! The Assemblash MCP server: an adapter over the public API (PRD FR-13).
//!
//! The third transport over one operation layer, after the command line and
//! the HTTP API. It shares the HTTP API's open-project registry and its
//! machine-readable error codes rather than growing its own, because two lock
//! policies or two vocabularies for the same failure would be two ways to be
//! wrong.
//!
//! # Reading and writing
//!
//! FR-13 divides MCP capabilities into read-only and mutating and orders them:
//! the read tools shipped in 0.7.0, the mutating ones in 0.8.0. Every mutating
//! tool carries all four safeguards FR-13 asks for — a dry run, an expected
//! document version, protected-layer checks, and an undo transaction id — and
//! they are implemented once, in [`Backend::apply`], because twenty tools each
//! remembering four things is twenty chances to forget one.
//!
//! # Standard output is protocol
//!
//! Over stdio the protocol owns standard output. Anything else written there
//! corrupts the frame stream, and it fails in a way that looks like a client
//! bug. Nothing in this crate prints to stdout; diagnostics go to stderr.

pub mod backend;
pub mod server;
pub mod write_tools;
pub mod writes;

pub use backend::Backend;
pub use server::AssemblashMcp;

use rmcp::transport::stdio;
use rmcp::ServiceExt;

/// Something that stopped the server.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum McpError {
    /// The stdio transport could not be established.
    #[error("starting the MCP server: {0}")]
    Start(String),

    /// The server stopped with an error.
    #[error("the MCP server stopped: {0}")]
    Serving(String),
}

/// Serves MCP over stdio until the client closes the connection.
///
/// The client owns the lifetime: an MCP server is spawned by the agent and
/// exits when its standard input closes.
pub async fn serve(backend: Backend) -> Result<(), McpError> {
    let service = AssemblashMcp::new(backend)
        .serve(stdio())
        .await
        .map_err(|error| McpError::Start(error.to_string()))?;
    service
        .waiting()
        .await
        .map_err(|error| McpError::Serving(error.to_string()))?;
    Ok(())
}
