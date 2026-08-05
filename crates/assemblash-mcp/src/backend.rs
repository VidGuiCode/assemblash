//! What the tools actually do, with no protocol anywhere near it.
//!
//! Every tool is a method here returning plain data or an [`ApiError`]. The
//! MCP layer in [`crate::server`] is a shell over this: it turns arguments
//! into calls and results into content blocks, and it makes no decisions.
//!
//! Two things follow from that split. The tools are testable without speaking
//! a protocol, and there is no place where a handler could quietly reach past
//! the operation layer — because the handlers are here, and here has no access
//! to anything but `Session` and the reading helpers core already exposes.

use std::path::PathBuf;

use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Document, Layer, LayerKind};
use assemblash_renderer::raster::PngMetadata;
use assemblash_renderer::{document_to_png, LoadedFonts};
use assemblash_server::state::{lock_project, AppState};
use assemblash_server::ApiError;
use schemars::JsonSchema;
use serde::Serialize;

/// Where this server takes its work from.
#[derive(Debug, Clone)]
pub enum Root {
    /// A workspace: tools name a project, and `list_projects` enumerates them.
    Workspace(Box<AppState>),
    /// One project directory, opened directly.
    ///
    /// The headless and home-lab flow the workspace decision promised would
    /// keep working: a folder anywhere, with no workspace involved. Tools that
    /// take a project name ignore it, because there is only one.
    SingleProject {
        /// Where it is.
        directory: PathBuf,
        /// What it is called, for reporting.
        name: String,
    },
}

/// The read-only engine behind the MCP tools.
#[derive(Debug, Clone)]
pub struct Backend {
    root: Root,
}

/// Milliseconds since the Unix epoch, for the audit trail.
///
/// Read in the transport and passed down, like every other transport does.
/// Nothing in core reads a clock.
fn now_millis() -> Option<u64> {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_millis() as u64)
}

/// One project in a listing.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummary {
    /// Name to pass back as `project`.
    pub id: String,
    /// Human-facing document name, when it has one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Document id.
    pub document_id: String,
    /// Document version.
    pub version: u64,
    /// How many layers, groups included.
    pub layers: usize,
}

/// One layer in a listing.
///
/// Flat rather than nested: an agent asking "what is in this document" wants a
/// list it can scan, and `parent` plus `depth` keep the tree recoverable.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerSummary {
    /// Layer id, to pass to any tool that takes ids.
    pub id: String,
    /// Human-facing name, when it has one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// `text`, `image`, `svg`, or `group`.
    pub kind: &'static str,
    /// Group this layer sits in, if any.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent: Option<String>,
    /// How deep in the tree; 0 at the top level.
    pub depth: usize,
    /// Left edge, in the parent's coordinate space.
    pub x: f64,
    /// Top edge.
    pub y: f64,
    /// Box width.
    pub width: f64,
    /// Box height.
    pub height: f64,
    /// Clockwise rotation in degrees.
    pub rotation: f64,
    /// Opacity, 0 to 1.
    pub opacity: f64,
    /// Whether it is drawn.
    pub visible: bool,
    /// Whether editing tools should refuse to move it.
    pub locked: bool,
    /// Whether agents may change it at all. A protected layer is refused for
    /// every mutation, whoever asks.
    pub protected: bool,
    /// Whether it is inspectable but never mutable through the API.
    pub read_only: bool,
    /// The text, for a text layer.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// The font family, for a text layer.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// How many children, for a group.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<usize>,
}

/// What a document looks like right now.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DocumentState {
    /// Project the document came from.
    pub project: String,
    /// The version to send back with a mutation, once mutations exist.
    pub version: u64,
    /// The document itself.
    pub document: Document,
}

/// The result of checking a document.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ValidationReport {
    /// Whether it is valid.
    pub valid: bool,
    /// Every problem, in one pass.
    pub errors: Vec<String>,
}

/// A project's history.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct HistoryReport {
    /// Where in the history the document currently sits.
    pub position: u64,
    /// The furthest point reached, so `head > position` means redo is possible.
    pub head: u64,
    /// Every entry, oldest first.
    pub entries: Vec<assemblash_core::history::JournalEntry>,
}

/// A list of projects.
///
/// Wrapped in an object rather than returned as a bare array because MCP
/// requires a tool's output schema to describe an object. It also leaves room
/// to say more about a listing later without changing its shape.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ProjectList {
    /// The projects, sorted by name.
    pub projects: Vec<ProjectSummary>,
}

/// A document's layers, flattened.
///
/// An object for the same reason [`ProjectList`] is.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerList {
    /// Every layer, depth first, groups before their children.
    pub layers: Vec<LayerSummary>,
}

/// A rendered preview.
#[derive(Debug, Clone)]
pub struct Preview {
    /// PNG bytes.
    pub png: Vec<u8>,
    /// Pixel width.
    pub width: u32,
    /// Pixel height.
    pub height: u32,
}

impl Backend {
    /// Serves a workspace.
    pub fn workspace(workspace: Workspace) -> Self {
        Self {
            root: Root::Workspace(Box::new(AppState::new(workspace))),
        }
    }

    /// Serves a single project directory.
    pub fn single_project(directory: PathBuf) -> Self {
        let name = directory
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| "project".to_owned());
        Self {
            root: Root::SingleProject { directory, name },
        }
    }

    /// Whether tools need to be told which project they mean.
    pub fn needs_project_argument(&self) -> bool {
        matches!(self.root, Root::Workspace(_))
    }

    /// Every project this server can see.
    pub fn list_projects(&self) -> Result<ProjectList, ApiError> {
        match &self.root {
            Root::Workspace(state) => {
                let mut projects = Vec::new();
                for id in state.workspace().projects()? {
                    // Read from disk rather than opening a session: listing
                    // must not take a lock on every project in the workspace.
                    let directory = state.workspace().project_dir(&id);
                    if let Ok(document) = assemblash_core::storage::load(&directory) {
                        projects.push(summarise(id.as_str(), &document));
                    }
                }
                Ok(ProjectList { projects })
            }
            Root::SingleProject { directory, name } => {
                let document = assemblash_core::storage::load(directory)?;
                Ok(ProjectList {
                    projects: vec![summarise(name, &document)],
                })
            }
        }
    }

    /// The document a project holds.
    pub fn document_state(&self, project: Option<&str>) -> Result<DocumentState, ApiError> {
        let (name, document) = self.read(project)?;
        Ok(DocumentState {
            project: name,
            version: document.version,
            document,
        })
    }

    /// Every layer, flattened.
    pub fn list_layers(&self, project: Option<&str>) -> Result<LayerList, ApiError> {
        let (_, document) = self.read(project)?;
        let mut layers = Vec::new();
        collect(&document.layers, None, 0, &mut layers);
        Ok(LayerList { layers })
    }

    /// One layer, by id.
    pub fn get_layer(&self, project: Option<&str>, id: &str) -> Result<LayerSummary, ApiError> {
        self.list_layers(project)?
            .layers
            .into_iter()
            .find(|layer| layer.id == id)
            .ok_or_else(|| {
                ApiError::new(
                    axum_status_not_found(),
                    "noSuchLayer",
                    format!("no layer {id:?} in this document"),
                )
                .with_details(serde_json::json!({ "id": id }))
            })
    }

    /// What is wrong with a document, if anything.
    pub fn validate(&self, project: Option<&str>) -> Result<ValidationReport, ApiError> {
        let (_, document) = self.read(project)?;
        // An invalid document is reported, not refused: "tell me what is wrong
        // with this" has to answer rather than error.
        Ok(match assemblash_core::validate(&document) {
            Ok(()) => ValidationReport {
                valid: true,
                errors: Vec::new(),
            },
            Err(errors) => ValidationReport {
                valid: false,
                errors: errors.errors().iter().map(ToString::to_string).collect(),
            },
        })
    }

    /// What has been done to a project.
    pub fn history(&self, project: Option<&str>) -> Result<HistoryReport, ApiError> {
        let opened = self.open(project)?;
        let session = lock_project(&opened)?;
        Ok(HistoryReport {
            position: session.history().position(),
            head: session.history().head(),
            entries: session.history().entries().to_vec(),
        })
    }

    /// A rendered PNG of the canvas.
    ///
    /// Fonts come from the store and only the families the document names are
    /// loaded, so installing something unrelated cannot change what an
    /// existing document renders as. A family the store lacks is a structured
    /// error, never a substitution.
    pub fn preview(&self, project: Option<&str>, scale: f32) -> Result<Preview, ApiError> {
        let opened = self.open(project)?;
        let session = lock_project(&opened)?;
        let document = session.document().clone();
        let directory = session.project_dir().to_path_buf();
        drop(session);

        let hrefs = assemblash_renderer::data_uris(&document, &directory)?;
        let families = families_used(&document);
        let fonts = if families.is_empty() {
            LoadedFonts::from_bytes([])
        } else {
            self.fonts()?.load_families(&families)?
        };

        let png = document_to_png(
            &document,
            &fonts,
            &hrefs,
            scale,
            // No timestamp: two previews of an unchanged document are
            // identical, which is what makes a client's cache trustworthy.
            &PngMetadata::for_document(&document),
        )?;
        let width = (f64::from(scale) * document.canvas.width).round() as u32;
        let height = (f64::from(scale) * document.canvas.height).round() as u32;
        Ok(Preview { png, width, height })
    }

    /// The font store this server renders with.
    fn fonts(&self) -> Result<assemblash_renderer::FontStore, ApiError> {
        match &self.root {
            Root::Workspace(state) => state.font_store(),
            // A single project has no workspace to take fonts from, so it
            // takes them from the one the machine would have used. Rendering
            // still refuses a family that is not installed.
            Root::SingleProject { .. } => {
                let workspace = Workspace::open_default()?;
                Ok(assemblash_renderer::FontStore::open(workspace.fonts_dir())?)
            }
        }
    }

    /// Opens the project a tool named, keeping the session for later calls.
    pub fn open(
        &self,
        project: Option<&str>,
    ) -> Result<assemblash_server::state::OpenProject, ApiError> {
        match &self.root {
            Root::Workspace(state) => {
                let name = project.ok_or_else(|| {
                    ApiError::bad_request(
                        "this server holds a workspace, so say which project: \
                         call list_projects first",
                    )
                })?;
                let id = ProjectId::new(name)?;
                state.project(&id, now_millis())
            }
            Root::SingleProject { directory, name } => {
                // Named a different project than the one this server holds:
                // worth saying so rather than silently answering about
                // something else.
                if let Some(asked) = project {
                    if asked != name {
                        return Err(ApiError::new(
                            axum_status_not_found(),
                            "noSuchProject",
                            format!("this server holds only {name:?}, and was asked for {asked:?}"),
                        )
                        .with_details(serde_json::json!({ "id": asked, "holds": name })));
                    }
                }
                self.single_session(directory)
            }
        }
    }

    /// The name of the project a tool named, for reporting it back.
    pub fn project_name(&self, project: Option<&str>) -> String {
        match &self.root {
            Root::Workspace(_) => project.unwrap_or_default().to_owned(),
            Root::SingleProject { name, .. } => name.clone(),
        }
    }

    fn single_session(
        &self,
        directory: &std::path::Path,
    ) -> Result<assemblash_server::state::OpenProject, ApiError> {
        // Cached on the state the same way the workspace case is, so the
        // session — and its lock — is taken once for the life of the process
        // rather than per call.
        static ONCE: std::sync::OnceLock<
            std::sync::Mutex<
                std::collections::BTreeMap<PathBuf, assemblash_server::state::OpenProject>,
            >,
        > = std::sync::OnceLock::new();
        let cache = ONCE.get_or_init(|| std::sync::Mutex::new(std::collections::BTreeMap::new()));
        let mut cache = cache.lock().map_err(|_| {
            ApiError::new(
                axum_status_internal(),
                "poisoned",
                "a previous call failed while holding this project; restart the server",
            )
        })?;
        if let Some(existing) = cache.get(directory) {
            return Ok(std::sync::Arc::clone(existing));
        }
        let session = std::sync::Arc::new(std::sync::Mutex::new(assemblash_core::Session::open(
            directory,
            now_millis(),
        )?));
        cache.insert(directory.to_path_buf(), std::sync::Arc::clone(&session));
        Ok(session)
    }

    /// Reads a project's document without holding the lock any longer than the
    /// read.
    fn read(&self, project: Option<&str>) -> Result<(String, Document), ApiError> {
        let name = self.project_name(project);
        let opened = self.open(project)?;
        let session = lock_project(&opened)?;
        Ok((name, session.document().clone()))
    }
}

fn summarise(id: &str, document: &Document) -> ProjectSummary {
    let mut layers = 0;
    document.walk_layers(&mut |_| layers += 1);
    ProjectSummary {
        id: id.to_owned(),
        name: document.name.clone(),
        document_id: document.id.to_string(),
        version: document.version,
        layers,
    }
}

fn collect(layers: &[Layer], parent: Option<&str>, depth: usize, out: &mut Vec<LayerSummary>) {
    for layer in layers {
        let (kind, text, font_family, children) = match &layer.kind {
            LayerKind::Text(text) => (
                "text",
                Some(text.text.clone()),
                Some(text.font_family.clone()),
                None,
            ),
            LayerKind::Image(_) => ("image", None, None, None),
            LayerKind::Svg(_) => ("svg", None, None, None),
            LayerKind::Group(group) => ("group", None, None, Some(group.children.len())),
        };
        out.push(LayerSummary {
            id: layer.id.to_string(),
            name: layer.name.clone(),
            kind,
            parent: parent.map(ToOwned::to_owned),
            depth,
            x: layer.transform.x,
            y: layer.transform.y,
            width: layer.transform.width,
            height: layer.transform.height,
            rotation: layer.transform.rotation,
            opacity: layer.opacity,
            visible: layer.visible,
            locked: layer.locked,
            protected: layer.protected,
            read_only: layer.read_only,
            text,
            font_family,
            children,
        });
        if let LayerKind::Group(group) = &layer.kind {
            let id = layer.id.to_string();
            collect(&group.children, Some(&id), depth + 1, out);
        }
    }
}

fn families_used(document: &Document) -> Vec<String> {
    let mut families = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        if let LayerKind::Text(text) = &layer.kind {
            families.insert(text.font_family.clone());
        }
    });
    families.into_iter().collect()
}

/// The statuses `ApiError` is built from.
///
/// MCP has no status codes; these exist only so the shared error type keeps
/// one code per situation across both transports.
fn axum_status_not_found() -> assemblash_server::StatusCode {
    assemblash_server::StatusCode::NOT_FOUND
}

fn axum_status_internal() -> assemblash_server::StatusCode {
    assemblash_server::StatusCode::INTERNAL_SERVER_ERROR
}
