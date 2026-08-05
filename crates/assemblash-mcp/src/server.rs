//! The protocol shell: MCP tools over [`crate::backend::Backend`].
//!
//! Everything here is translation. Arguments in, a backend call, data out —
//! no decisions, no document logic. That is what makes "MCP is a transport"
//! something you can check by reading one file rather than trusting a claim.
//!
//! # Standard output is protocol, and nothing else
//!
//! A stdio MCP server shares its standard output with the protocol. One stray
//! `println!` anywhere in the process corrupts the frame stream, and the
//! failure looks like a client bug rather than a server one. Nothing in this
//! crate writes to stdout; diagnostics go to stderr. There is a test that
//! runs the real binary and checks the whole conversation parses.

use rmcp::handler::server::wrapper::{Json, Parameters};
use rmcp::model::{
    CallToolResult, ContentBlock, ErrorData, ProtocolVersion, ServerCapabilities, ServerInfo,
};
use rmcp::{tool, tool_handler, tool_router, ServerHandler};
use schemars::JsonSchema;
use serde::Deserialize;

use crate::backend::{
    Backend, DocumentState, HistoryReport, LayerList, LayerSummary, ProjectList, ValidationReport,
};

/// Which project a tool is about.
///
/// Optional because a server started with `--project` holds exactly one, and
/// making a client pass a name it cannot get wrong would be ceremony. When the
/// server holds a workspace, leaving it out is a typed error that says to call
/// `list_projects` first.
#[derive(Debug, Clone, Default, Deserialize, JsonSchema)]
pub struct ProjectArgs {
    /// Project to read, as reported by `list_projects`. Omit when this server
    /// was started for a single project.
    #[serde(default)]
    pub project: Option<String>,
}

/// Which layer, in which project.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
pub struct LayerArgs {
    /// Project to read. Omit when this server holds a single project.
    #[serde(default)]
    pub project: Option<String>,
    /// Layer id, as reported by `list_layers`.
    pub layer_id: String,
}

/// A preview request.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
pub struct PreviewArgs {
    /// Project to render. Omit when this server holds a single project.
    #[serde(default)]
    pub project: Option<String>,
    /// Multiplier on the canvas size. 1 renders at the document's own size.
    #[serde(default)]
    pub scale: Option<f32>,
}

/// The MCP server.
///
/// No router is stored: `#[tool_handler]` builds one from the static the
/// `#[tool_router]` macro generates, and keeping a second copy in a field only
/// makes it possible for the two to disagree.
#[derive(Debug, Clone)]
pub struct AssemblashMcp {
    backend: Backend,
}

/// Turns a shared engine error into an MCP tool error carrying the same
/// machine-readable code the HTTP API reports.
fn to_error(error: assemblash_server::ApiError) -> ErrorData {
    ErrorData::invalid_request(
        error.message().to_owned(),
        Some(serde_json::json!({
            "code": error.code(),
            "details": error.details(),
        })),
    )
}

#[tool_router]
impl AssemblashMcp {
    /// Wraps a backend.
    pub fn new(backend: Backend) -> Self {
        Self { backend }
    }

    /// Lists the projects this server can read.
    #[tool(
        description = "List the Assemblash projects this server can read. Call this first: \
                       the other tools take a project name from here."
    )]
    async fn list_projects(&self) -> Result<Json<ProjectList>, ErrorData> {
        self.backend.list_projects().map(Json).map_err(to_error)
    }

    /// The whole document.
    #[tool(
        description = "Read a project's whole document: canvas, assets, and the nested layer \
                       tree, plus the version number a later mutation must quote."
    )]
    async fn get_document_state(
        &self,
        Parameters(args): Parameters<ProjectArgs>,
    ) -> Result<Json<DocumentState>, ErrorData> {
        self.backend
            .document_state(args.project.as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// Every layer, flattened.
    #[tool(
        description = "List every layer in a project, flattened, with its box, flags, and \
                       position in the tree. Layers marked protected or readOnly cannot be \
                       changed by any tool."
    )]
    async fn list_layers(
        &self,
        Parameters(args): Parameters<ProjectArgs>,
    ) -> Result<Json<LayerList>, ErrorData> {
        self.backend
            .list_layers(args.project.as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// One layer.
    #[tool(description = "Read one layer of a project by its id.")]
    async fn get_layer(
        &self,
        Parameters(args): Parameters<LayerArgs>,
    ) -> Result<Json<LayerSummary>, ErrorData> {
        self.backend
            .get_layer(args.project.as_deref(), &args.layer_id)
            .map(Json)
            .map_err(to_error)
    }

    /// The validation report.
    #[tool(
        description = "Check a project's document and report every problem in one pass. \
                       Answers rather than failing when the document is invalid."
    )]
    async fn validate_document(
        &self,
        Parameters(args): Parameters<ProjectArgs>,
    ) -> Result<Json<ValidationReport>, ErrorData> {
        self.backend
            .validate(args.project.as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// The journal.
    #[tool(
        description = "Read a project's history: what was done, by whom, and where the \
                       document currently sits in it."
    )]
    async fn get_history(
        &self,
        Parameters(args): Parameters<ProjectArgs>,
    ) -> Result<Json<HistoryReport>, ErrorData> {
        self.backend
            .history(args.project.as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// A rendered PNG.
    #[tool(
        description = "Render a project's canvas to a PNG image. Fonts come from the local \
                       font store; a font that is not installed is an error rather than a \
                       substitution, so the image is what the document says."
    )]
    async fn get_canvas_preview(
        &self,
        Parameters(args): Parameters<PreviewArgs>,
    ) -> Result<CallToolResult, ErrorData> {
        let scale = args.scale.unwrap_or(1.0);
        let preview = self
            .backend
            .preview(args.project.as_deref(), scale)
            .map_err(to_error)?;

        Ok(CallToolResult::success(vec![
            ContentBlock::text(format!("{}x{} PNG", preview.width, preview.height)),
            ContentBlock::image(base64(&preview.png), "image/png".to_owned()),
        ]))
    }
}

#[tool_handler]
impl ServerHandler for AssemblashMcp {
    fn get_info(&self) -> ServerInfo {
        let scope = if self.backend.needs_project_argument() {
            "This server holds a workspace of projects. Call list_projects first, then pass \
             the project name to the other tools."
        } else {
            "This server holds a single project, so the project argument may be omitted."
        };
        let instructions = format!(
            "Assemblash is a deterministic visual document engine. A document is a canvas \
             and a nested tree of text, image, SVG, and group layers.\n\n\
             {scope}\n\n\
             These tools are read-only: nothing here changes a document. Layers marked \
             `protected` or `readOnly` are never mutable by an agent. Selection is yours \
             to keep — there is none stored here, and tools take explicit layer ids."
        );

        let mut info = ServerInfo::default();
        info.protocol_version = ProtocolVersion::V_2025_06_18;
        info.capabilities = ServerCapabilities::builder().enable_tools().build();
        info.server_info.name = "assemblash".to_owned();
        info.server_info.version = env!("CARGO_PKG_VERSION").to_owned();
        info.instructions = Some(instructions);
        info
    }
}

const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/// Standard base64 with padding.
///
/// Hand-rolled for the same reason the rest of this project hand-rolls it:
/// every crate added to a single-binary product has to be licence-audited and
/// shipped (R8), and this is four lines of arithmetic.
fn base64(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let b0 = u32::from(chunk[0]);
        let b1 = chunk.get(1).copied().map_or(0, u32::from);
        let b2 = chunk.get(2).copied().map_or(0, u32::from);
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHABET[(triple >> 18) as usize & 0x3F] as char);
        out.push(ALPHABET[(triple >> 12) as usize & 0x3F] as char);
        out.push(if chunk.len() > 1 {
            ALPHABET[(triple >> 6) as usize & 0x3F] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            ALPHABET[triple as usize & 0x3F] as char
        } else {
            '='
        });
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64_matches_the_standard_vectors() {
        // RFC 4648 section 10.
        assert_eq!(base64(b""), "");
        assert_eq!(base64(b"f"), "Zg==");
        assert_eq!(base64(b"foobar"), "Zm9vYmFy");
    }
}
