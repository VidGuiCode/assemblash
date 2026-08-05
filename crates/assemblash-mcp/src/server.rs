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
#[serde(rename_all = "camelCase")]
pub struct ProjectArgs {
    /// Project to read, as reported by `list_projects`. Omit when this server
    /// was started for a single project.
    #[serde(default)]
    pub project: Option<String>,
}

/// Which layer, in which project.
///
/// camelCase like every other argument in this server — 0.7.0 shipped this one
/// as `layer_id` by omission, so that spelling is still accepted.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerArgs {
    /// Project to read. Omit when this server holds a single project.
    #[serde(default)]
    pub project: Option<String>,
    /// Layer id, as reported by `list_layers`.
    #[serde(alias = "layer_id")]
    pub layer_id: String,
}

/// A preview request.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
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
/// No router is stored: the two `#[tool_router]` blocks generate statics
/// that [`AssemblashMcp::all_tools`] merges per request. Keeping a copy in a
/// field only makes it possible for the two to disagree.
#[derive(Debug, Clone)]
pub struct AssemblashMcp {
    backend: Backend,
    /// The project `open_project` selected, if any.
    ///
    /// The one piece of state this server keeps. It exists so a conversation
    /// does not have to repeat the project name on every call; every tool
    /// still accepts an explicit `project`, which wins.
    current: std::sync::Arc<std::sync::Mutex<Option<String>>>,
}

impl AssemblashMcp {
    /// The engine behind the tools.
    pub(crate) fn backend(&self) -> &Backend {
        &self.backend
    }

    /// The project a call means: the one it named, else the one in use.
    pub(crate) fn resolve_project(&self, named: Option<String>) -> Option<String> {
        named.or_else(|| self.current.lock().ok().and_then(|current| current.clone()))
    }

    /// Remembers the project later calls should assume.
    pub(crate) fn set_current_project(&self, project: &str) {
        if let Ok(mut current) = self.current.lock() {
            *current = Some(project.to_owned());
        }
    }

    /// An envelope with the project filled in from `open_project` when the
    /// caller did not name one.
    ///
    /// Every mutating tool goes through this, including undo and redo. A tool
    /// that took the envelope raw would work in a workspace only if the client
    /// repeated the project name, which is exactly the papercut
    /// `open_project` exists to remove.
    pub(crate) fn resolved(
        &self,
        envelope: &crate::writes::WriteEnvelope,
    ) -> crate::writes::WriteEnvelope {
        let mut envelope = envelope.clone();
        envelope.project = self.resolve_project(envelope.project);
        envelope
    }

    /// Applies an operation through the one choke point.
    pub(crate) fn write(
        &self,
        envelope: &crate::writes::WriteEnvelope,
        operation: assemblash_core::Operation,
    ) -> Result<Json<crate::writes::WriteOutcome>, ErrorData> {
        self.backend
            .apply(&self.resolved(envelope), operation)
            .map(Json)
            .map_err(to_error)
    }

    /// The project argument a read tool should use.
    fn read_project(&self, named: Option<String>) -> Option<String> {
        self.resolve_project(named)
    }

    /// Every tool this server offers, read and write.
    ///
    /// Two `#[tool_router]` blocks — one per module — merged here, so the read
    /// tools and the mutating ones stay in separate files without the server
    /// advertising two disjoint sets.
    fn all_tools(&self) -> rmcp::handler::server::router::tool::ToolRouter<Self> {
        Self::tool_router() + Self::write_tool_router()
    }
}

/// Turns a shared engine error into an MCP tool error carrying the same
/// machine-readable code the HTTP API reports.
pub(crate) fn to_error(error: assemblash_server::ApiError) -> ErrorData {
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
        Self {
            backend,
            current: std::sync::Arc::new(std::sync::Mutex::new(None)),
        }
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
            .document_state(self.read_project(args.project).as_deref())
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
            .list_layers(self.read_project(args.project).as_deref())
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
            .get_layer(self.read_project(args.project).as_deref(), &args.layer_id)
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
            .validate(self.read_project(args.project).as_deref())
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
            .history(self.read_project(args.project).as_deref())
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
            .preview(self.read_project(args.project).as_deref(), scale)
            .map_err(to_error)?;

        Ok(CallToolResult::success(vec![
            ContentBlock::text(format!("{}x{} PNG", preview.width, preview.height)),
            ContentBlock::image(base64(&preview.png), "image/png".to_owned()),
        ]))
    }
}

#[tool_handler(router = self.all_tools())]
impl ServerHandler for AssemblashMcp {
    fn get_info(&self) -> ServerInfo {
        let scope = if self.backend.needs_project_argument() {
            "This server holds a workspace of projects. Call list_projects first, then pass \
             the project name to the other tools."
        } else {
            "This server holds a single project, so the project argument may be omitted."
        };
        let instructions = format!(
            "Assemblash is a deterministic visual document engine. A document is a canvas              and a nested tree of text, image, SVG, and group layers.

             {scope}

             Every tool that changes something takes `expectedVersion` (pass the version              `get_document_state` reported, and the change is refused if the document has              moved on) and `dryRun` (report what would happen and change nothing). Each one              returns a transaction id, and `undo` restores the document exactly.

             Layers marked `protected` or `readOnly` are refused for every change, and no              tool can clear those flags. `locked` layers refuse ordinary changes;              `set_layer_locked` is the way to unlock one. `list_layers` reports all three              flags, so check before planning an edit.

             Selection is yours to keep — there is none stored here, and tools take              explicit layer ids. Fonts are never substituted: a family the font store does              not have is an error, not a fallback."
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
