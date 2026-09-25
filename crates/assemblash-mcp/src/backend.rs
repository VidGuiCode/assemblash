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

use assemblash_core::ids::UlidIdSource;
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Color, Document, Layer, LayerId, LayerKind};
use assemblash_renderer::raster::PngMetadata;
use assemblash_renderer::{document_to_png, ExportWarning, LoadedFonts};
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

/// A flag that asks work in flight to give up.
///
/// The stdio relay sets it when the local target must make way for the
/// editor: a render that is running keeps going, but the request waiting for
/// it is answered with a typed refusal instead of holding the switch back.
/// One request = one transaction still holds — the flag is checked between
/// phases, never inside a write, so a cancelled request applies nothing.
#[derive(Debug, Clone, Default)]
pub(crate) struct CancelToken(std::sync::Arc<std::sync::atomic::AtomicBool>);

impl CancelToken {
    pub(crate) fn cancel(&self) {
        self.0.store(true, std::sync::atomic::Ordering::Relaxed);
    }

    pub(crate) fn reset(&self) {
        self.0.store(false, std::sync::atomic::Ordering::Relaxed);
    }

    pub(crate) fn is_cancelled(&self) -> bool {
        self.0.load(std::sync::atomic::Ordering::Relaxed)
    }
}

/// The error a cancelled request is answered with.
pub(crate) fn cancelled() -> ApiError {
    ApiError::new(
        assemblash_server::StatusCode::CONFLICT,
        "requestCancelled",
        "the request was cancelled: the MCP target changed while it was in progress; \
         send it again",
    )
}

/// The read-only engine behind the MCP tools.
#[derive(Debug, Clone)]
pub struct Backend {
    root: Root,
    /// Sessions opened in single-project mode.
    ///
    /// Owned by the backend rather than kept in a `static`: a static is never
    /// dropped, so the lock a session holds would outlive the process and
    /// leave the project unopenable until someone ran `assemblash unlock`.
    /// [`Backend::close`] is what releases them.
    single: std::sync::Arc<
        std::sync::Mutex<
            std::collections::BTreeMap<PathBuf, assemblash_server::state::OpenProject>,
        >,
    >,
    /// Whether opening a project may clear a lock left by a dead process on
    /// this machine. Off unless the client asked for it.
    reclaim_stale_locks: bool,
    /// A lock cleared in single-project mode, not yet reported.
    ///
    /// Workspace mode keeps this in the [`AppState`], which already has
    /// somewhere to put it; single-project mode has no such state, and there
    /// is only ever one project, so one slot is the whole story.
    single_reclaimed:
        std::sync::Arc<std::sync::Mutex<Option<assemblash_server::state::ReclaimEvent>>>,
    /// Whether the projects belong to someone else: the editor process this
    /// backend is hosted in.
    ///
    /// A hosted backend never releases them. [`Backend::close`] on an owned
    /// workspace drops every open session; on the editor's state that would
    /// close every project the person has open the moment one agent
    /// disconnected.
    hosted: bool,
    /// Set when the caller needs in-flight work to stop; see [`CancelToken`].
    cancel: CancelToken,
}

/// Milliseconds since the Unix epoch, for the audit trail.
///
/// Read in the transport and passed down, like every other transport does.
/// Nothing in core reads a clock.
pub(crate) fn now_millis() -> Option<u64> {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_millis() as u64)
}

/// The shape of a [`FontRecord`](assemblash_renderer::store::FontRecord), for
/// the tool output schema.
///
/// The store's record derives `Serialize` but not `JsonSchema`; this exists
/// for the schema the way `ExportWarningShape` does for warnings.
#[derive(Debug, Clone, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct FontRecordShape {
    /// Family name, as the document must spell it.
    pub family: String,
    /// `normal`, `italic`, or `oblique`.
    pub style: String,
    /// CSS weight, 100-900.
    pub weight: u16,
    /// File name inside the store.
    pub file: String,
    /// Content hash of that file, `sha256:<hex>`.
    pub hash: String,
    /// Which face inside the file this record describes.
    pub face_index: u32,
    /// Where the file came from, when it is known.
    pub source: Option<String>,
    /// Licence the file is distributed under, when it is known.
    pub license: Option<String>,
}

/// The font store as it stands: the families, and the faces behind them.
///
/// The same listing `GET /api/fonts` serves and the interface's font panel
/// draws.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FontStoreListing {
    /// Family names a text layer may name, sorted.
    pub families: Vec<String>,
    /// Every face the store holds.
    #[schemars(with = "Vec<FontRecordShape>")]
    pub faces: Vec<assemblash_renderer::store::FontRecord>,
}

/// What installing a pack installed.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FontInstallReport {
    /// The faces the pack added, or the ones already there.
    #[schemars(with = "Vec<FontRecordShape>")]
    pub installed: Vec<assemblash_renderer::store::FontRecord>,
    /// Every family the store holds now.
    pub families: Vec<String>,
}

/// What removing a family removed.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FontRemovalReport {
    /// How many stored files the removal took.
    pub removed: usize,
    /// Every family the store holds now.
    pub families: Vec<String>,
}

/// What a successful delete says.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDeleted {
    /// The project that was deleted.
    pub project: String,
}

/// What a successful rename says.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ProjectRenamed {
    /// The name every later call passes as `project`.
    pub project: String,
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
    /// `text`, `image`, `svg`, `group`, or `shape`.
    pub kind: &'static str,
    /// The geometry name for a shape: `rect`, `ellipse`, `line`, or the
    /// preserved name of a shape kind this build does not know.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shape: Option<String>,
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

/// What a template offers to be filled.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SlotList {
    /// Whether this document offers any slots at all.
    pub is_template: bool,
    /// The slots, in the order the document lists them.
    pub slots: Vec<assemblash_core::Slot>,
}

/// The named style bundles a document offers.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PresetList {
    /// The presets, in the order the document lists them.
    pub presets: Vec<assemblash_core::Preset>,
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

/// A document rendered to SVG source.
///
/// The same render the PNG is rasterized from, one step earlier, so what a
/// client takes away is what an export would have drawn.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SvgRender {
    /// The SVG source, as text.
    pub svg: String,
    /// Canvas width in pixels.
    pub width: u32,
    /// Canvas height in pixels.
    pub height: u32,
}

/// Which layers sit on top of one another.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct OverlapReport {
    /// Every overlapping pair, each reported once, in the order the layers
    /// were given.
    pub pairs: Vec<(LayerId, LayerId)>,
}

/// A document, where it lives, and exactly the fonts it names.
///
/// The three things every render needs, gathered once. Resolving them
/// separately per render is how a preview and an export come to disagree —
/// and how a project ends up locked twice for one answer.
pub(crate) struct Loaded {
    /// The document as it is on disk.
    pub document: Document,
    /// The project directory, which assets are resolved against.
    pub directory: PathBuf,
    /// Exactly the families the document names, and nothing else.
    pub fonts: LoadedFonts,
}

impl Loaded {
    /// The canvas as a PNG.
    ///
    /// The render runs on its own thread, and `cancel` is watched while it
    /// runs: when the flag goes up, the caller is refused at once and the
    /// render is left to finish on its own into a result nobody reads. This
    /// is what keeps a target switch from waiting out a long export.
    pub(crate) fn preview(&self, scale: f32, cancel: &CancelToken) -> Result<Preview, ApiError> {
        let hrefs = assemblash_renderer::data_uris(&self.document, &self.directory)?;
        let render = {
            let document = self.document.clone();
            let fonts = self.fonts.clone();
            let hrefs = hrefs.clone();
            std::thread::spawn(move || {
                document_to_png(
                    &document,
                    &fonts,
                    &hrefs,
                    scale,
                    // No timestamp: two previews of an unchanged document are
                    // identical, which is what makes a client's cache
                    // trustworthy.
                    &PngMetadata::for_document(&document),
                )
            })
        };
        while !render.is_finished() {
            if cancel.is_cancelled() {
                return Err(cancelled());
            }
            std::thread::sleep(std::time::Duration::from_millis(10));
        }
        let png = render.join().map_err(|_| {
            ApiError::new(
                assemblash_server::StatusCode::INTERNAL_SERVER_ERROR,
                "renderFailed",
                "the renderer stopped while it was drawing the canvas",
            )
        })??;
        let width = (f64::from(scale) * self.document.canvas.width).round() as u32;
        let height = (f64::from(scale) * self.document.canvas.height).round() as u32;
        Ok(Preview { png, width, height })
    }

    /// What an export of this document would want to say (FR-11).
    ///
    /// Produced here rather than taken from a response type, because the three
    /// export paths — the command line's, the HTTP API's, and this one — each
    /// write their own file and would otherwise each notice different things.
    pub(crate) fn warnings(&self) -> Vec<ExportWarning> {
        assemblash_renderer::export_warnings(&self.document, self.fonts.font_set(), &self.directory)
    }
}

impl Backend {
    /// Serves a workspace.
    pub fn workspace(workspace: Workspace) -> Self {
        Self::workspace_with(workspace, false)
    }

    /// Serves a workspace, saying whether a stale lock may be reclaimed.
    ///
    /// `true` clears a lock only when it names this machine and the process it
    /// names is provably gone; anything else is still the conflict it has
    /// always been. `false` is [`Backend::workspace`] exactly.
    pub fn workspace_with(workspace: Workspace, reclaim_stale_locks: bool) -> Self {
        Self {
            root: Root::Workspace(Box::new(AppState::with_reclaim(
                workspace,
                reclaim_stale_locks,
            ))),
            single: Default::default(),
            reclaim_stale_locks,
            single_reclaimed: Default::default(),
            hosted: false,
            cancel: Default::default(),
        }
    }

    /// Serves the projects of a running editor, over its own state.
    ///
    /// The MCP tools then use the same open sessions — and the same locks —
    /// as the HTTP API, so an agent and a person work on one project with one
    /// writer. The state's reclaim policy is the editor's. [`Backend::close`]
    /// does nothing on this backend: the editor owns the projects.
    pub fn from_state(state: AppState) -> Self {
        let reclaim_stale_locks = state.reclaims_stale_locks();
        Self {
            root: Root::Workspace(Box::new(state)),
            single: Default::default(),
            reclaim_stale_locks,
            single_reclaimed: Default::default(),
            hosted: true,
            cancel: Default::default(),
        }
    }

    /// Whether this backend is hosted by an editor rather than owning its
    /// projects.
    pub fn is_hosted(&self) -> bool {
        self.hosted
    }

    /// The flag that asks in-flight work to give up; see [`CancelToken`].
    pub(crate) fn cancel_token(&self) -> &CancelToken {
        &self.cancel
    }

    /// Asks every request in flight to stop where it safely can.
    ///
    /// The relay calls this when the local target must make way for the
    /// editor. [`Backend::reset_cancel`] arms the flag again for the next
    /// local server.
    pub(crate) fn cancel_pending(&self) {
        self.cancel.cancel();
    }

    /// Clears the flag, for a fresh local server over the same backend.
    pub(crate) fn reset_cancel(&self) {
        self.cancel.reset();
    }

    /// Serves a single project directory.
    pub fn single_project(directory: PathBuf) -> Self {
        Self::single_project_with(directory, false)
    }

    /// Serves a single project directory, saying whether a stale lock may be
    /// reclaimed.
    pub fn single_project_with(directory: PathBuf, reclaim_stale_locks: bool) -> Self {
        let name = directory
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| "project".to_owned());
        Self {
            root: Root::SingleProject { directory, name },
            single: Default::default(),
            reclaim_stale_locks,
            single_reclaimed: Default::default(),
            hosted: false,
            cancel: Default::default(),
        }
    }

    /// Takes the pending reclaim notice for a project, if there is one.
    ///
    /// Taken rather than read: `open_project` reports it once, the way the
    /// HTTP project summary does, so a client is told what happened without
    /// being told again on every later call.
    ///
    /// A hosted backend reads the notice and leaves it: it belongs to the
    /// person's editor, whose project summary delivers it once. An agent that
    /// opened the project first must not take it away from the person.
    pub fn take_reclaim_note(&self, project: Option<&str>) -> Option<String> {
        let event = match &self.root {
            Root::Workspace(state) if self.hosted => {
                state.reclaim_event(project.unwrap_or_default())?
            }
            Root::Workspace(state) => state.take_reclaim_event(project.unwrap_or_default())?,
            Root::SingleProject { .. } => self.single_reclaimed.lock().ok()?.take()?,
        };
        Some(format!(
            "the lock on this project was left behind by process {} on {}, \
             which is no longer running; it was cleared and the project reopened",
            event.pid, event.host
        ))
    }

    /// Releases every project this server holds.
    ///
    /// Called when the client closes the connection. A `Session` releases its
    /// lock file on drop, and dropping it here rather than relying on process
    /// teardown is the difference between a project that reopens cleanly and
    /// one that needs `assemblash unlock` first.
    ///
    /// A hosted backend ([`Backend::from_state`]) releases nothing: its
    /// projects are the editor's, and they stay open when an agent leaves.
    pub fn close(&self) {
        if self.hosted {
            return;
        }
        if let Root::Workspace(state) = &self.root {
            state.close_all();
        }
        if let Ok(mut single) = self.single.lock() {
            single.clear();
        }
    }

    /// [`Backend::close`], then waits until a request that is still running
    /// has dropped its session too, so every lock file is really gone.
    ///
    /// For a caller that hands the projects to another process next: the
    /// stdio relay, when it moves to the editor. Returns `false` when
    /// `timeout` passed first. A hosted backend releases nothing and returns
    /// `true` at once.
    pub fn close_and_wait(&self, timeout: std::time::Duration) -> bool {
        if self.hosted {
            return true;
        }
        let deadline = std::time::Instant::now() + timeout;
        let workspace_released = match &self.root {
            Root::Workspace(state) => state.close_all_and_wait(timeout),
            Root::SingleProject { .. } => true,
        };
        let lock = match &self.root {
            Root::SingleProject { directory, .. } => {
                Some(directory.join(assemblash_core::session::LOCK_FILE))
            }
            Root::Workspace(_) => None,
        };
        let single: Vec<_> = match self.single.lock() {
            Ok(mut single) => {
                let handles = single.values().map(std::sync::Arc::downgrade).collect();
                single.clear();
                handles
            }
            Err(_) => Vec::new(),
        };
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if !workspace_released || !assemblash_server::state::wait_until_dropped(&single, remaining)
        {
            return false;
        }
        // The session can be gone a moment before its lock file is, so the
        // file is waited for too. The workspace path does the same inside
        // its own close.
        let Some(lock) = lock else {
            return true;
        };
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        assemblash_server::state::wait_until_locks_released(std::slice::from_ref(&lock), remaining)
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
    /// Fonts are resolved by [`Backend::loaded`], which is where the promise
    /// that a missing family is an error rather than a substitution lives.
    pub fn preview(&self, project: Option<&str>, scale: f32) -> Result<Preview, ApiError> {
        self.loaded(project)?.preview(scale, &self.cancel)
    }

    /// The canvas as SVG source.
    ///
    /// The render one step before rasterization, through the same function
    /// `GET /api/projects/{id}/preview.svg` serves, so the two surfaces cannot
    /// hand out different pictures of the same document.
    pub fn svg(&self, project: Option<&str>) -> Result<SvgRender, ApiError> {
        let loaded = self.loaded(project)?;
        let rendered = assemblash_server::render::svg_for_loaded(
            &loaded.document,
            &loaded.directory,
            &loaded.fonts,
        )?;
        // The writer built a `String` and the shared type carries bytes; this
        // cannot fail, and saying so beats a lossy conversion that would hide
        // it if it ever did.
        let svg = String::from_utf8(rendered.bytes).map_err(|_| {
            ApiError::new(
                axum_status_internal(),
                "renderFailed",
                "the renderer produced SVG that is not text",
            )
        })?;
        Ok(SvgRender {
            svg,
            width: rendered.width,
            height: rendered.height,
        })
    }

    /// Which of a document's layers sit on top of one another.
    ///
    /// The same question `assemblash overlaps` and
    /// `GET /api/projects/{id}/overlaps` answer, over the same
    /// [`layout::find_overlaps`](assemblash_core::layout::find_overlaps), so
    /// the three surfaces cannot report different pairs or a different order.
    /// An empty list of layers means the whole document; a layer that is not
    /// there is a refused operation rather than an empty answer, because
    /// silently ignoring a typo would report "nothing overlaps" about layers
    /// nobody looked at.
    pub fn overlaps(
        &self,
        project: Option<&str>,
        layers: &[String],
    ) -> Result<OverlapReport, ApiError> {
        let (_, document) = self.read(project)?;
        let ids = if layers.is_empty() {
            assemblash_core::layout::all_layer_ids(&document)
        } else {
            layers.iter().map(LayerId::new).collect()
        };
        let pairs = assemblash_core::layout::find_overlaps(&document, &ids)
            .map_err(assemblash_core::ops::OpError::from)
            .map_err(assemblash_core::session::SessionError::from)?;
        Ok(OverlapReport { pairs })
    }

    /// Creates a project in the workspace and registers it for later calls.
    ///
    /// What `POST /api/projects` does, and the one tool here with no operation
    /// behind it: a document that does not exist yet has no version to quote
    /// and nothing to undo to. A server holding a single directory has no
    /// workspace to put a project in, so it says so rather than inventing one
    /// beside the folder it was pointed at.
    pub fn create_project(
        &self,
        project: &str,
        width: f64,
        height: f64,
        background: Option<&str>,
        name: Option<&str>,
    ) -> Result<ProjectSummary, ApiError> {
        let state = match &self.root {
            Root::Workspace(state) => state,
            Root::SingleProject { name, .. } => {
                return Err(ApiError::new(
                    assemblash_server::StatusCode::BAD_REQUEST,
                    "noWorkspace",
                    format!(
                        "this server holds only {name:?}, so there is no workspace to \
                         create a project in: start it with --workspace"
                    ),
                ))
            }
        };

        let id = ProjectId::new(project)?;
        let directory = state.workspace().create_project_dir(&id)?;

        let mut document = Document::new(&mut UlidIdSource, width, height);
        document.name = name.map(ToOwned::to_owned);
        document.canvas.background = background.map(Color::new);

        let session = assemblash_core::Session::create(&directory, document, now_millis())?;
        let summary = summarise(id.as_str(), session.document());
        // Adopted rather than reopened: the session already holds the lock,
        // and a second open would have to wait for a lock this call owns.
        state.adopt(&id, session)?;
        Ok(summary)
    }

    /// The font store this server renders with.
    pub(crate) fn font_store(&self) -> Result<assemblash_renderer::FontStore, ApiError> {
        self.fonts()
    }

    /// Every family and face the font store holds.
    ///
    /// What `GET /api/fonts` serves, and what the interface's font panel
    /// draws — the families a text layer may name, and the faces behind
    /// them.
    pub fn list_fonts(&self) -> Result<FontStoreListing, ApiError> {
        let store = self.fonts()?;
        Ok(FontStoreListing {
            families: store.families(),
            faces: store.records().to_vec(),
        })
    }

    /// Installs a pack from the compiled-in manifest.
    ///
    /// What `POST /api/fonts/install` does. This is the one operation here
    /// that reaches the network, and it reaches it only when this call is
    /// made; a failed download leaves the store exactly as it was.
    pub fn install_font_pack(&self, pack: &str) -> Result<FontInstallReport, ApiError> {
        let state = self.workspace_state("install_font_pack")?;
        let manifest = state.font_manifest()?;
        let _writing = state.lock_font_writes()?;
        let mut store = state.font_store()?;
        let installed = assemblash_renderer::install::install_pack_atomically(
            &mut store,
            &manifest,
            pack,
            state.font_fetcher(),
        )?;
        state.clear_font_cache();
        Ok(FontInstallReport {
            installed,
            families: store.families(),
        })
    }

    /// Removes every face a family provides.
    ///
    /// What `DELETE /api/fonts/{family}` does. A family the store does not
    /// have is a typed `unknownFontFamily` refusal, not a silent success.
    pub fn remove_font_family(&self, family: &str) -> Result<FontRemovalReport, ApiError> {
        let state = self.workspace_state("remove_font_family")?;
        let _writing = state.lock_font_writes()?;
        let mut store = state.font_store()?;
        let removed = store.remove_family(family)?;
        if removed == 0 {
            return Err(ApiError::new(
                assemblash_server::StatusCode::NOT_FOUND,
                "unknownFontFamily",
                format!("no font family named {family:?} is in the font store"),
            )
            .with_details(serde_json::json!({ "family": family })));
        }
        state.clear_font_cache();
        Ok(FontRemovalReport {
            removed,
            families: store.families(),
        })
    }

    /// Deletes a project: directory and all. See `AppState::delete_project`.
    pub fn delete_project(&self, project: &str) -> Result<ProjectDeleted, ApiError> {
        let state = self.workspace_state("delete_project")?;
        let id = ProjectId::new(project)?;
        state.delete_project(&id)?;
        Ok(ProjectDeleted {
            project: id.as_str().to_owned(),
        })
    }

    /// Renames a project. See `AppState::rename_project`.
    pub fn rename_project(&self, project: &str, to: &str) -> Result<ProjectRenamed, ApiError> {
        let state = self.workspace_state("rename_project")?;
        let id = ProjectId::new(project)?;
        let new = ProjectId::new(to)?;
        state.rename_project(&id, &new)?;
        Ok(ProjectRenamed {
            project: new.as_str().to_owned(),
        })
    }

    /// The workspace state, or the typed refusal a tool gives when this
    /// server holds a single project and there is no workspace to act on.
    fn workspace_state(&self, what: &str) -> Result<&AppState, ApiError> {
        match &self.root {
            Root::Workspace(state) => Ok(state),
            Root::SingleProject { name, .. } => Err(ApiError::new(
                assemblash_server::StatusCode::BAD_REQUEST,
                "noWorkspace",
                format!(
                    "{what} needs a workspace, and this server holds only {name:?}: \
                     start it with --workspace"
                ),
            )),
        }
    }

    /// Exactly the fonts a document names, through the editor's cache when
    /// this backend is hosted by one.
    pub(crate) fn fonts_for(&self, document: &Document) -> Result<LoadedFonts, ApiError> {
        if let Root::Workspace(state) = &self.root {
            return state.fonts_for(document);
        }
        let families = families_used(document);
        if families.is_empty() {
            return Ok(LoadedFonts::from_bytes([]));
        }
        Ok(self.fonts()?.load_families(&families)?)
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
        // Cached the same way the workspace case is, so the session — and its
        // lock — is taken once for the life of the connection rather than per
        // call, and released by `close` when the client goes away.
        let mut cache = self.single.lock().map_err(|_| {
            ApiError::new(
                axum_status_internal(),
                "poisoned",
                "a previous call failed while holding this project; restart the server",
            )
        })?;
        if let Some(existing) = cache.get(directory) {
            return Ok(std::sync::Arc::clone(existing));
        }
        let now = now_millis();
        let opened = if self.reclaim_stale_locks {
            let (session, reclaim) = assemblash_core::Session::open_reclaiming(directory, now)?;
            if let assemblash_core::session::Reclaim::Reclaimed { pid, host } = reclaim {
                // Standard output belongs to the protocol; standard error is
                // the only place this server may say anything.
                eprintln!(
                    "reclaimed the lock on {}: process {pid} on {host} is gone",
                    directory.display()
                );
                if let Ok(mut slot) = self.single_reclaimed.lock() {
                    *slot = Some(assemblash_server::state::ReclaimEvent {
                        project: self.project_name(None),
                        pid,
                        host,
                        at: now.unwrap_or_default(),
                    });
                }
            }
            session
        } else {
            assemblash_core::Session::open(directory, now)?
        };
        let session = std::sync::Arc::new(std::sync::Mutex::new(opened));
        cache.insert(directory.to_path_buf(), std::sync::Arc::clone(&session));
        Ok(session)
    }

    /// Everything a render needs, with the lock held only for the read.
    ///
    /// Fonts come from the store and only the families the document names are
    /// loaded, so installing something unrelated cannot change what an
    /// existing document renders as. A family the store lacks is a structured
    /// error, never a substitution.
    pub(crate) fn loaded(&self, project: Option<&str>) -> Result<Loaded, ApiError> {
        let opened = self.open(project)?;
        let session = lock_project(&opened)?;
        let document = session.document().clone();
        let directory = session.project_dir().to_path_buf();
        drop(session);

        let families = families_used(&document);
        let fonts = if families.is_empty() {
            LoadedFonts::from_bytes([])
        } else {
            self.fonts()?.load_families(&families)?
        };
        Ok(Loaded {
            document,
            directory,
            fonts,
        })
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
        let (kind, text, font_family, children, shape) = match &layer.kind {
            LayerKind::Text(text) => (
                "text",
                Some(text.text.clone()),
                Some(text.font_family.clone()),
                None,
                None,
            ),
            LayerKind::Image(_) => ("image", None, None, None, None),
            LayerKind::Svg(_) => ("svg", None, None, None, None),
            LayerKind::Shape(shape) => (
                "shape",
                None,
                None,
                None,
                Some(shape.shape.kind_name().to_owned()),
            ),
            LayerKind::Group(group) => ("group", None, None, Some(group.children.len()), None),
        };
        out.push(LayerSummary {
            id: layer.id.to_string(),
            name: layer.name.clone(),
            kind,
            shape,
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
