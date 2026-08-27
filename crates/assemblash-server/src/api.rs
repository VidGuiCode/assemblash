//! The routes.
//!
//! Every handler that changes anything does it by building an
//! [`Operation`](assemblash_core::Operation) and handing it to
//! [`Session::apply`](assemblash_core::Session::apply). There is deliberately
//! no handler that edits `document.layers`: validation, history, protection,
//! and version checks all sit at that one choke point (PRD §7.2), and a
//! transport that reached around it would quietly lose every one of them.

use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::{IdSource, UlidIdSource};
use assemblash_core::ops::{CreateLayer, LayerPosition, NewLayerKind, OpOutcome, UpdateLayer};
use assemblash_core::storage;
use assemblash_core::workspace::ProjectId;
use assemblash_core::{Color, Document, Layer, LayerKind, Operation, SessionError};
use axum::extract::{Path, Query, State};
use axum::http::{header, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

use crate::error::{ApiError, ApiJson};
use crate::render;
use crate::state::{lock_project, AppState};

/// Milliseconds since the Unix epoch, for the audit trail.
///
/// Read here, in the transport, and passed down. Nothing in the core reads a
/// clock — that is what lets a test produce the same journal twice.
fn now_millis() -> Option<u64> {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_millis() as u64)
}

/// The API routes and the reference interface, over shared state.
pub fn router(
    state: AppState,
    ui: crate::UiSource,
    shutdown: crate::Shutdown,
    stop: tokio::sync::watch::Sender<bool>,
    access: crate::Access,
) -> Router {
    Router::new()
        // The interface, at the root. Everything under /api is the engine;
        // everything else is one of a fixed list of files (see `crate::ui`).
        .route("/", get(serve_ui_root))
        .route("/{*path}", get(serve_ui))
        .route("/api/shutdown", post(shutdown_server))
        .route("/api/version", get(version))
        .route("/api/schema/document", get(document_schema))
        .route("/api/schema/operation", get(operation_schema))
        .route("/api/fonts", get(fonts))
        .route("/api/projects", get(list_projects).post(create_project))
        .route("/api/projects/recent", get(recent_projects))
        .route("/api/projects/{id}", get(project_summary))
        .route("/api/projects/{id}/document", get(get_document))
        .route(
            "/api/projects/{id}/recover-lock",
            post(recover_project_lock),
        )
        .route("/api/projects/{id}/history", get(get_history))
        .route("/api/projects/{id}/validate", get(validate_project))
        .route("/api/projects/{id}/operations", post(apply_operation))
        .route(
            "/api/projects/{id}/operation-batches",
            post(apply_operation_batch),
        )
        .route("/api/projects/{id}/undo", post(undo))
        .route("/api/projects/{id}/redo", post(redo))
        .route("/api/projects/{id}/assets", post(upload_asset))
        .route("/api/projects/{id}/thumbnail.png", get(thumbnail))
        .route("/api/projects/{id}/preview.png", get(preview))
        .route("/api/projects/{id}/preview.svg", get(preview_svg))
        .route("/api/projects/{id}/text-layout", get(text_layout))
        .route("/api/projects/{id}/export", post(export_document))
        .route("/api/projects/{id}/exports/{file}", get(get_export))
        .route("/api/projects/{id}/presets", get(get_presets))
        .route("/api/projects/{id}/slots", get(get_slots))
        .route("/api/projects/{id}/variants", post(render_variants))
        // Layers last: `layer` applies to the routes added before it, so
        // anything added afterwards would silently not see these.
        // Authentication wraps everything, including the interface's own
        // files: a page that loaded and then failed every call would be a
        // worse way to learn a token is needed than not loading at all.
        .layer(axum::middleware::from_fn_with_state(
            access.clone(),
            require_access,
        ))
        .layer(axum::Extension(ui))
        .layer(axum::Extension(shutdown))
        .layer(axum::Extension(access))
        .layer(axum::Extension(std::sync::Arc::new(stop)))
        .with_state(state)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Version {
    name: &'static str,
    version: &'static str,
    schema_version: u32,
    /// Whether this server may be stopped from the interface.
    ///
    /// Reported rather than discovered, so the page offers the button only
    /// when it would work. Nobody should be shown a control that does nothing.
    can_shutdown: bool,
}

/// Refuses a request that does not present the token, when one is required.
///
/// One place, wrapping every route, because an authentication check each
/// handler has to remember is one a new handler will forget.
async fn require_access(
    axum::extract::State(access): axum::extract::State<crate::Access>,
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    // The login page is the one thing reachable without a token: it is how
    // somebody with a token gets it into the browser, and it says nothing a
    // stranger does not already know from the 401.
    if request.uri().path() == "/login.html" || request.uri().path() == "/login.js" {
        return next.run(request).await;
    }
    match access.check(request.headers()) {
        Ok(()) => next.run(request).await,
        Err(error) => error.into_response(),
    }
}

async fn serve_ui_root(
    axum::Extension(ui): axum::Extension<crate::UiSource>,
) -> axum::response::Response {
    ui.serve("index.html")
}

async fn serve_ui(
    axum::Extension(ui): axum::Extension<crate::UiSource>,
    Path(path): Path<String>,
) -> axum::response::Response {
    ui.serve(&path)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ShutdownResponse {
    stopping: bool,
}

/// Stops the server, when this one is a server a person started.
///
/// The whole point of the no-terminal promise's second half: there is no
/// console to press Ctrl-C in, so the page has to be able to say stop. It is
/// refused for a server under a service manager or in a container, which owns
/// its own lifetime — and the API is loopback-only either way, so the reach of
/// this is one machine's own browser.
async fn shutdown_server(
    axum::Extension(policy): axum::Extension<crate::Shutdown>,
    axum::Extension(stop): axum::Extension<std::sync::Arc<tokio::sync::watch::Sender<bool>>>,
) -> Result<Json<ShutdownResponse>, ApiError> {
    if policy != crate::Shutdown::Allowed {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "shutdownRefused",
            "this server is managed by whoever started it; stop it there",
        ));
    }
    // Sending is what `serve` is waiting on. In-flight requests — including
    // this one — finish first, and every open session is dropped, which
    // releases its lock file.
    let _ = stop.send(true);
    Ok(Json(ShutdownResponse { stopping: true }))
}

async fn version(axum::Extension(policy): axum::Extension<crate::Shutdown>) -> Json<Version> {
    Json(Version {
        name: "assemblash",
        version: env!("CARGO_PKG_VERSION"),
        schema_version: assemblash_core::SCHEMA_VERSION,
        can_shutdown: policy == crate::Shutdown::Allowed,
    })
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecoverLockRequest {
    expected_pid: u32,
}

#[derive(Debug, Serialize)]
struct RecoverLockResponse {
    unlocked: bool,
}

/// Recovers from a process that exited without dropping its project session.
///
/// This remains an explicit human decision. The expected PID makes the
/// request compare-and-remove: it cannot erase a different process's newer
/// claim after the client has shown the warning.
async fn recover_project_lock(
    State(state): State<AppState>,
    Path(id): Path<String>,
    ApiJson(request): ApiJson<RecoverLockRequest>,
) -> Result<Json<RecoverLockResponse>, ApiError> {
    let id = ProjectId::new(id)?;
    let unlocked = state.recover_project_lock(&id, request.expected_pid)?;
    Ok(Json(RecoverLockResponse { unlocked }))
}

/// The document JSON Schema, served from the same generator that writes the
/// committed copy — so what a client fetches cannot drift from what the engine
/// accepts.
async fn document_schema() -> impl IntoResponse {
    (
        [(header::CONTENT_TYPE, "application/schema+json")],
        assemblash_core::schema::document_schema_json(),
    )
}

async fn operation_schema() -> impl IntoResponse {
    (
        [(header::CONTENT_TYPE, "application/schema+json")],
        assemblash_core::schema::operation_schema_json(),
    )
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FontsResponse {
    families: Vec<String>,
}

async fn fonts(State(state): State<AppState>) -> Result<Json<FontsResponse>, ApiError> {
    Ok(Json(FontsResponse {
        families: state.font_store()?.families(),
    }))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectSummary {
    id: ProjectId,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    document_id: String,
    version: u64,
    layers: usize,
}

fn summarise(id: &ProjectId, document: &Document) -> ProjectSummary {
    let mut layers = 0;
    document.walk_layers(&mut |_| layers += 1);
    ProjectSummary {
        id: id.clone(),
        name: document.name.clone(),
        document_id: document.id.to_string(),
        version: document.version,
        layers,
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectList {
    projects: Vec<ProjectSummary>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectQuery {
    /// Substring to match against a project's id or name.
    #[serde(default)]
    query: Option<String>,
    /// How many to return. The cache is there so a big workspace stays
    /// usable; an unbounded listing would give that back.
    #[serde(default)]
    limit: Option<usize>,
}

/// How many projects a listing returns when the caller does not say.
const DEFAULT_LIMIT: usize = 200;

fn summarise_indexed(project: &assemblash_core::index::IndexedProject) -> ProjectSummary {
    ProjectSummary {
        id: project.id.clone(),
        name: project.name.clone(),
        document_id: project.document_id.clone(),
        version: project.version,
        layers: project.layers,
    }
}

/// The most recently modified projects.
///
/// Answered from the cache, which is the only reason it can be answered at all
/// without opening every document to read a timestamp. Without a cache there
/// is no order to report, so it falls back to the ordinary listing.
async fn recent_projects(
    State(state): State<AppState>,
    Query(query): Query<ProjectQuery>,
) -> Result<Json<ProjectList>, ApiError> {
    let limit = query.limit.unwrap_or(12).min(DEFAULT_LIMIT);
    state.refresh_index();
    if let Some(projects) = state.with_index(|index| index.recents(limit)) {
        return Ok(Json(ProjectList {
            projects: projects.iter().map(summarise_indexed).collect(),
        }));
    }
    list_projects(
        State(state),
        Query(ProjectQuery {
            query: None,
            limit: Some(limit),
        }),
    )
    .await
}

async fn list_projects(
    State(state): State<AppState>,
    Query(query): Query<ProjectQuery>,
) -> Result<Json<ProjectList>, ApiError> {
    let limit = query.limit.unwrap_or(DEFAULT_LIMIT);
    let wanted = query.query.unwrap_or_default();

    // Refreshed when the list is asked for rather than after every mutation:
    // a project whose document.json has not changed costs one `stat` and one
    // indexed lookup, so this stays cheap, and the alternative would put that
    // cost on every edit instead of on the one request that needs it.
    state.refresh_index();

    // The cache answers a search without opening a single document, which is
    // the difference between a workspace of two hundred projects being usable
    // and not.
    if let Some(projects) = state.with_index(|index| {
        if wanted.is_empty() {
            index.recents(limit)
        } else {
            index.search(&wanted, limit)
        }
    }) {
        if !projects.is_empty() || !wanted.is_empty() {
            return Ok(Json(ProjectList {
                projects: projects.iter().map(summarise_indexed).collect(),
            }));
        }
        // An empty cache and no query: fall through and scan, so a workspace
        // whose cache has not been refreshed yet still lists.
    }

    let mut projects = Vec::new();
    for id in state.workspace().projects()? {
        // Read from disk rather than opening a session: listing must not take
        // a lock on every project in the workspace.
        let directory = state.workspace().project_dir(&id);
        match storage::load(&directory) {
            Ok(document) => projects.push(summarise(&id, &document)),
            // A directory that no longer reads as a project is left out of the
            // list rather than failing the whole request; the project's own
            // endpoint still reports exactly what is wrong with it.
            Err(_) => continue,
        }
    }
    if !wanted.is_empty() {
        let needle = wanted.to_lowercase();
        projects.retain(|project| {
            project.id.as_str().to_lowercase().contains(&needle)
                || project
                    .name
                    .as_deref()
                    .is_some_and(|name| name.to_lowercase().contains(&needle))
        });
    }
    projects.truncate(limit);
    Ok(Json(ProjectList { projects }))
}

/// Width a thumbnail is rendered at.
///
/// Small on purpose: a project browser showing two hundred of these should
/// move a few hundred kilobytes, not a few hundred megabytes.
const THUMBNAIL_WIDTH: f64 = 240.0;

/// A small preview of a project, cached against the version it was made from.
///
/// Rendered here rather than in the cache because rendering needs the
/// renderer, and a stale thumbnail is impossible rather than merely unlikely:
/// the cache only returns one whose version matches the document's.
async fn thumbnail(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let project_id = ProjectId::new(id.clone())?;
    let (document, directory) = read_for_render(&state, id)?;
    let version = document.version;

    if let Some(cached) = state
        .with_index(|index| index.thumbnail(&project_id, version))
        .flatten()
    {
        return Ok(png_response(cached));
    }

    let scale = (THUMBNAIL_WIDTH / document.canvas.width.max(1.0)).min(1.0) as f32;
    let fonts = state.fonts_for(&document)?;
    let rendered = render::png_for_loaded(&document, &directory, &fonts, scale)?;
    state.with_index(|index| index.set_thumbnail(&project_id, version, &rendered.bytes));
    Ok(png_response(rendered.bytes))
}

fn png_response(bytes: Vec<u8>) -> axum::response::Response {
    (
        [
            (header::CONTENT_TYPE, "image/png"),
            // Keyed by document version in the cache, not in the URL, so a
            // browser must not hold its own copy.
            (header::CACHE_CONTROL, "no-store"),
        ],
        bytes,
    )
        .into_response()
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NewProject {
    id: ProjectId,
    width: f64,
    height: f64,
    #[serde(default)]
    background: Option<String>,
    #[serde(default)]
    name: Option<String>,
}

async fn create_project(
    State(state): State<AppState>,
    ApiJson(request): ApiJson<NewProject>,
) -> Result<(StatusCode, Json<ProjectSummary>), ApiError> {
    let directory = state.workspace().create_project_dir(&request.id)?;

    let mut document = Document::new(&mut UlidIdSource, request.width, request.height);
    document.name = request.name;
    document.canvas.background = request.background.map(Color::new);

    let session = assemblash_core::Session::create(&directory, document, now_millis())?;
    let summary = summarise(&request.id, session.document());
    state.adopt(&request.id, session)?;
    Ok((StatusCode::CREATED, Json(summary)))
}

async fn project_summary(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProjectSummary>, ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    Ok(Json(summarise(&id, session.document())))
}

async fn get_document(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Document>, ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    Ok(Json(session.document().clone()))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryResponse {
    position: u64,
    head: u64,
    entries: Vec<assemblash_core::history::JournalEntry>,
}

async fn get_history(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<HistoryResponse>, ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    Ok(Json(HistoryResponse {
        position: session.history().position(),
        head: session.history().head(),
        entries: session.history().entries().to_vec(),
    }))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidationResponse {
    valid: bool,
    errors: Vec<String>,
}

async fn validate_project(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ValidationResponse>, ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    // An invalid document is reported, not refused: "tell me what is wrong
    // with this" has to answer rather than error.
    Ok(Json(match assemblash_core::validate(session.document()) {
        Ok(()) => ValidationResponse {
            valid: true,
            errors: Vec::new(),
        },
        Err(errors) => ValidationResponse {
            valid: false,
            errors: errors.errors().iter().map(ToString::to_string).collect(),
        },
    }))
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ActorRequest {
    #[serde(default)]
    kind: Option<String>,
    #[serde(default)]
    name: Option<String>,
}

impl ActorRequest {
    /// The actor a request claims to be.
    ///
    /// An unrecognised kind is refused rather than folded into `human`: the
    /// audit trail is only worth having if "an agent did this" cannot be
    /// produced by a typo, in either direction.
    fn actor(&self) -> Result<Actor, ApiError> {
        let kind = match self.kind.as_deref().unwrap_or("agent") {
            "human" => ActorKind::Human,
            "agent" => ActorKind::Agent,
            "script" => ActorKind::Script,
            "adapter" => ActorKind::Adapter,
            other => {
                return Err(ApiError::bad_request(format!(
                    "unknown actor kind {other:?}: expected human, agent, script, or adapter"
                )))
            }
        };
        Ok(match &self.name {
            Some(name) => Actor::named(kind, name),
            None => Actor::new(kind),
        })
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OperationRequest {
    operation: Operation,
    #[serde(default)]
    actor: ActorRequest,
    #[serde(default)]
    expected_version: Option<u64>,
    #[serde(default)]
    dry_run: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OperationResponse {
    version: u64,
    dry_run: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    transaction: Option<String>,
    #[serde(flatten)]
    outcome: OpOutcome,
}

async fn apply_operation(
    State(state): State<AppState>,
    Path(id): Path<String>,
    ApiJson(request): ApiJson<OperationRequest>,
) -> Result<Json<OperationResponse>, ApiError> {
    let id = ProjectId::new(id)?;
    let actor = request.actor.actor()?;
    let project = state.project(&id, now_millis())?;
    let mut session = lock_project(&project)?;

    if request.dry_run {
        let outcome = session.dry_run(
            &request.operation,
            request.expected_version,
            &mut UlidIdSource,
        )?;
        return Ok(Json(OperationResponse {
            version: session.version(),
            dry_run: true,
            transaction: None,
            outcome,
        }));
    }

    let (outcome, transaction) = session.apply(
        &request.operation,
        &actor,
        now_millis(),
        request.expected_version,
        &mut UlidIdSource,
    )?;
    Ok(Json(OperationResponse {
        version: session.version(),
        dry_run: false,
        transaction: Some(transaction.to_string()),
        outcome,
    }))
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum OperationBatchCommand {
    Operation(Box<Operation>),
    Macro(OperationBatchMacro),
}

#[derive(Debug, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase", rename_all_fields = "camelCase")]
enum OperationBatchMacro {
    InsertLayerTree {
        source_project: String,
        layers: Vec<Layer>,
        #[serde(default)]
        position: LayerPosition,
        #[serde(default)]
        offset_x: f64,
        #[serde(default)]
        offset_y: f64,
    },
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OperationBatchRequest {
    expected_version: u64,
    label: String,
    commands: Vec<OperationBatchCommand>,
    #[serde(default)]
    actor: ActorRequest,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OperationBatchResponse {
    version: u64,
    transaction_id: String,
    #[serde(flatten)]
    outcome: OpOutcome,
}

/// Applies several existing operations as one reversible UI command.
///
/// The clipboard macro is transport sugar only. It is expanded against a
/// cloned document into ordinary create/update operations, then the exact
/// expanded sequence is validated again, journalled, and saved atomically by
/// `Session::apply_batch`.
async fn apply_operation_batch(
    State(state): State<AppState>,
    Path(id): Path<String>,
    ApiJson(request): ApiJson<OperationBatchRequest>,
) -> Result<Json<OperationBatchResponse>, ApiError> {
    if request.commands.is_empty() {
        return Err(ApiError::bad_request(
            "an operation batch needs at least one command",
        ));
    }
    if request.commands.len() > 500 {
        return Err(ApiError::bad_request(
            "an operation batch may contain at most 500 commands",
        ));
    }
    let label = request.label.trim();
    if label.is_empty() || label.len() > 120 {
        return Err(ApiError::bad_request(
            "an operation batch label must contain 1 to 120 characters",
        ));
    }

    let id = ProjectId::new(id)?;
    let actor = request.actor.actor()?;
    let project = state.project(&id, now_millis())?;
    let mut session = lock_project(&project)?;
    if request.expected_version != session.version() {
        return Err(SessionError::VersionConflict {
            expected: request.expected_version,
            actual: session.version(),
        }
        .into());
    }

    let mut candidate = session.document().clone();
    let mut compiled = Vec::new();
    let mut generated = RecordingIds::default();
    for command in request.commands {
        match command {
            OperationBatchCommand::Operation(operation) => {
                apply_compiled(&mut candidate, *operation, &mut compiled, &mut generated)?;
            }
            OperationBatchCommand::Macro(OperationBatchMacro::InsertLayerTree {
                source_project,
                layers,
                position,
                offset_x,
                offset_y,
            }) => {
                if source_project != id.as_str() {
                    return Err(ApiError::bad_request(
                        "insertLayerTree is restricted to the current project",
                    ));
                }
                if layers.is_empty() {
                    return Err(ApiError::bad_request(
                        "insertLayerTree needs at least one layer",
                    ));
                }
                insert_layer_tree(
                    &mut candidate,
                    &layers,
                    &position,
                    offset_x,
                    offset_y,
                    &mut compiled,
                    &mut generated,
                )?;
            }
        }
    }

    let mut replay = ReplayThenUlid::new(generated.raws);
    let (outcome, transaction) = session.apply_batch(
        label,
        &compiled,
        &actor,
        now_millis(),
        Some(request.expected_version),
        &mut replay,
    )?;
    Ok(Json(OperationBatchResponse {
        version: session.version(),
        transaction_id: transaction.to_string(),
        outcome,
    }))
}

#[derive(Debug, Default)]
struct RecordingIds {
    raws: Vec<String>,
}

impl IdSource for RecordingIds {
    fn next_raw(&mut self) -> String {
        let raw = UlidIdSource.next_raw();
        self.raws.push(raw.clone());
        raw
    }
}

#[derive(Debug)]
struct ReplayThenUlid {
    raws: std::collections::VecDeque<String>,
}

impl ReplayThenUlid {
    fn new(raws: Vec<String>) -> Self {
        Self { raws: raws.into() }
    }
}

impl IdSource for ReplayThenUlid {
    fn next_raw(&mut self) -> String {
        self.raws
            .pop_front()
            .unwrap_or_else(|| UlidIdSource.next_raw())
    }
}

fn apply_compiled(
    document: &mut Document,
    operation: Operation,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, ApiError> {
    let outcome = assemblash_core::apply(document, &operation, ids)
        .map_err(|error| ApiError::from(SessionError::Operation(error)))?;
    compiled.push(operation);
    Ok(outcome)
}

fn insert_layer_tree(
    document: &mut Document,
    layers: &[Layer],
    position: &LayerPosition,
    offset_x: f64,
    offset_y: f64,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<(), ApiError> {
    for (index, layer) in layers.iter().enumerate() {
        let position = indexed_position(position, index);
        insert_layer(document, layer, position, offset_x, offset_y, compiled, ids)?;
    }
    Ok(())
}

fn indexed_position(position: &LayerPosition, offset: usize) -> LayerPosition {
    match position {
        LayerPosition::Root { index } => LayerPosition::Root {
            index: index.map(|index| index + offset),
        },
        LayerPosition::In { parent, index } => LayerPosition::In {
            parent: parent.clone(),
            index: index.map(|index| index + offset),
        },
    }
}

fn insert_layer(
    document: &mut Document,
    layer: &Layer,
    position: LayerPosition,
    offset_x: f64,
    offset_y: f64,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<(), ApiError> {
    let mut transform = layer.transform.clone();
    transform.x += offset_x;
    transform.y += offset_y;
    let kind = match &layer.kind {
        LayerKind::Text(text) => NewLayerKind::Text {
            text: text.text.clone(),
            font_family: text.font_family.clone(),
            font_size: text.font_size,
            color: text.color.clone(),
            align: text.align,
            line_height: text.line_height,
        },
        LayerKind::Image(image) => NewLayerKind::Image {
            asset: image.asset.clone(),
            fit: image.fit,
        },
        LayerKind::Svg(svg) => NewLayerKind::Svg {
            asset: svg.asset.clone(),
            fit: svg.fit,
        },
        LayerKind::Group(_) => NewLayerKind::Group,
    };
    let created = apply_compiled(
        document,
        Operation::Create(CreateLayer {
            position,
            transform,
            name: layer.name.clone(),
            kind,
        }),
        compiled,
        ids,
    )?;
    let id = created
        .created
        .first()
        .cloned()
        .ok_or_else(|| ApiError::bad_request("insertLayerTree failed to create a layer"))?;

    if let LayerKind::Group(group) = &layer.kind {
        for (index, child) in group.children.iter().enumerate() {
            insert_layer(
                document,
                child,
                LayerPosition::In {
                    parent: id.clone(),
                    index: Some(index),
                },
                0.0,
                0.0,
                compiled,
                ids,
            )?;
        }
    }

    let mut update = UpdateLayer::new(id.clone());
    update.opacity = (layer.opacity != 1.0).then_some(layer.opacity);
    update.blend_mode = (layer.blend_mode != Default::default()).then(|| layer.blend_mode.clone());
    update.effects = (!layer.effects.is_empty()).then(|| layer.effects.clone());
    if update.opacity.is_some() || update.blend_mode.is_some() || update.effects.is_some() {
        apply_compiled(document, Operation::Update(update), compiled, ids)?;
    }
    if !layer.visible {
        apply_compiled(
            document,
            Operation::SetVisible {
                id: id.clone(),
                visible: false,
            },
            compiled,
            ids,
        )?;
    }
    if layer.locked {
        apply_compiled(
            document,
            Operation::SetLocked { id, locked: true },
            compiled,
            ids,
        )?;
    }
    Ok(())
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HistoryStepRequest {
    #[serde(default)]
    actor: ActorRequest,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryStepResponse {
    transaction: String,
    version: u64,
}

async fn undo(
    State(state): State<AppState>,
    Path(id): Path<String>,
    body: axum::body::Bytes,
) -> Result<Json<HistoryStepResponse>, ApiError> {
    history_step(state, id, &body, true).await
}

async fn redo(
    State(state): State<AppState>,
    Path(id): Path<String>,
    body: axum::body::Bytes,
) -> Result<Json<HistoryStepResponse>, ApiError> {
    history_step(state, id, &body, false).await
}

async fn history_step(
    state: AppState,
    id: String,
    body: &[u8],
    undoing: bool,
) -> Result<Json<HistoryStepResponse>, ApiError> {
    let id = ProjectId::new(id)?;
    // Undo takes no arguments beyond who is asking, so an empty body is the
    // ordinary case rather than a malformed request.
    let request: HistoryStepRequest = if body.iter().all(u8::is_ascii_whitespace) {
        HistoryStepRequest::default()
    } else {
        serde_json::from_slice(body).map_err(|source| ApiError::bad_request(source.to_string()))?
    };
    let actor = request.actor.actor()?;
    let project = state.project(&id, now_millis())?;
    let mut session = lock_project(&project)?;

    let transaction = if undoing {
        session.undo(&actor, now_millis(), &mut UlidIdSource)?
    } else {
        session.redo(&actor, now_millis(), &mut UlidIdSource)?
    };
    Ok(Json(HistoryStepResponse {
        transaction: transaction.to_string(),
        version: session.version(),
    }))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AssetUpload {
    /// Name the file arrived under. Only its extension is used.
    filename: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AssetResponse {
    asset: assemblash_core::Asset,
    version: u64,
}

/// Imports an uploaded file into a project's `assets/` directory.
///
/// The client's filename contributes **only its extension**. The stored name
/// is the content hash, exactly as `import_asset` has always produced it, so
/// there is no path in this handler that a caller can influence — which is the
/// only reliable way to keep an upload inside the project root (PRD §10.1).
async fn upload_asset(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(upload): Query<AssetUpload>,
    body: axum::body::Bytes,
) -> Result<(StatusCode, Json<AssetResponse>), ApiError> {
    let id = ProjectId::new(id)?;
    let extension = extension_of(&upload.filename)?;

    let project = state.project(&id, now_millis())?;
    let mut session = lock_project(&project)?;

    // Written to a scratch file inside the project so the importer — which
    // sanitises SVGs and hashes what it stores — is the same code path the CLI
    // uses. The scratch name is ours, not the caller's.
    let scratch = session
        .project_dir()
        .join(format!("upload.{extension}.tmp"));
    std::fs::write(&scratch, &body).map_err(|source| {
        ApiError::from(assemblash_core::storage::StorageError::Io {
            operation: "writing",
            path: scratch.clone(),
            source,
        })
    })?;
    // The importer takes the extension from the file name, so the scratch file
    // is renamed to one carrying only the extension we accepted.
    let named = session.project_dir().join(format!("upload.{extension}"));
    let import = std::fs::rename(&scratch, &named)
        .map_err(|source| {
            ApiError::from(assemblash_core::storage::StorageError::Io {
                operation: "replacing",
                path: named.clone(),
                source,
            })
        })
        .and_then(|()| {
            storage::import_asset(session.project_dir(), &named, &mut UlidIdSource)
                .map_err(ApiError::from)
        });
    let _ = std::fs::remove_file(&named);
    let _ = std::fs::remove_file(&scratch);

    let asset = import?;
    session.register_asset(asset.clone())?;
    Ok((
        StatusCode::CREATED,
        Json(AssetResponse {
            asset,
            version: session.version(),
        }),
    ))
}

/// The extension of an uploaded name, with anything path-shaped refused.
///
/// Not "the last dot in the string": a name like `../../evil.png` has a
/// perfectly good extension and must still be refused, because accepting the
/// name at all is the mistake.
fn extension_of(filename: &str) -> Result<String, ApiError> {
    if filename.contains('/')
        || filename.contains('\\')
        || filename.contains("..")
        || filename.contains('\0')
        || filename.starts_with('.')
    {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalidFilename",
            format!("{filename:?} is not a plain file name"),
        ));
    }
    let extension = filename
        .rsplit_once('.')
        .map(|(_, extension)| extension.to_ascii_lowercase())
        .filter(|extension| {
            !extension.is_empty()
                && extension.len() <= 8
                && extension.chars().all(|c| c.is_ascii_alphanumeric())
        })
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::BAD_REQUEST,
                "unknownAssetType",
                format!("{filename:?} has no usable file extension"),
            )
        })?;
    Ok(extension)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PreviewQuery {
    #[serde(default = "one")]
    scale: f32,
    /// Render just these layers (and the groups that contain them) on a
    /// transparent canvas. Used by the editor's local drag compositor.
    #[serde(default)]
    only: Option<String>,
    /// Render the canvas with these layers omitted. Paired with `only` so a
    /// dragged layer can move immediately without leaving a ghost behind.
    #[serde(default)]
    exclude: Option<String>,
}

fn one() -> f32 {
    1.0
}

/// Renders a project to PNG.
///
/// Fonts come from the workspace store and only the families the document
/// names are loaded, so installing something unrelated cannot change what an
/// existing document renders as. A family the store does not have is a
/// structured error, never a substitution.
async fn preview(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<PreviewQuery>,
) -> Result<impl IntoResponse, ApiError> {
    let (document, directory) = read_for_render(&state, id)?;
    let document = filtered_preview(document, query.only.as_deref(), query.exclude.as_deref())?;
    let fonts = state.fonts_for(&document)?;
    let rendered = render::png_for_loaded(&document, &directory, &fonts, query.scale)?;
    Ok((
        [
            (header::CONTENT_TYPE, "image/png"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        rendered.bytes,
    ))
}

fn filtered_preview(
    mut document: Document,
    only: Option<&str>,
    exclude: Option<&str>,
) -> Result<Document, ApiError> {
    if only.is_some() && exclude.is_some() {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalidPreviewFilter",
            "only and exclude cannot be used together",
        ));
    }
    let Some(raw) = only.or(exclude) else {
        return Ok(document);
    };
    let ids = raw
        .split(',')
        .filter(|id| !id.is_empty())
        .map(str::to_owned)
        .collect::<std::collections::BTreeSet<_>>();
    if ids.is_empty() || ids.len() > 100 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalidPreviewFilter",
            "a preview filter must name between 1 and 100 layers",
        ));
    }
    let mut known = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        known.insert(layer.id.to_string());
    });
    if let Some(unknown) = ids.iter().find(|id| !known.contains(*id)) {
        return Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "layerNotFound",
            format!("layer {unknown} does not exist"),
        ));
    }

    if only.is_some() {
        document.canvas.background = None;
        for layer in &mut document.layers {
            keep_only_preview_layer(layer, &ids, false);
        }
    } else {
        for layer in &mut document.layers {
            exclude_preview_layer(layer, &ids);
        }
    }
    Ok(document)
}

/// Returns whether this subtree contains a requested layer. Ancestor groups
/// stay present because their transforms, opacity, and effects are part of a
/// nested layer's appearance; unrelated siblings are hidden.
fn keep_only_preview_layer(
    layer: &mut Layer,
    ids: &std::collections::BTreeSet<String>,
    ancestor_selected: bool,
) -> bool {
    let selected = ids.contains(&layer.id.to_string());
    if ancestor_selected || selected {
        return true;
    }
    let contains = if let LayerKind::Group(group) = &mut layer.kind {
        let mut found = false;
        for child in &mut group.children {
            found |= keep_only_preview_layer(child, ids, false);
        }
        found
    } else {
        false
    };
    if !contains {
        layer.visible = false;
    }
    contains
}

fn exclude_preview_layer(layer: &mut Layer, ids: &std::collections::BTreeSet<String>) {
    if ids.contains(&layer.id.to_string()) {
        layer.visible = false;
        return;
    }
    if let LayerKind::Group(group) = &mut layer.kind {
        for child in &mut group.children {
            exclude_preview_layer(child, ids);
        }
    }
}

/// Renders a project to SVG.
///
/// The same render one step before rasterization. Useful to take away; not
/// what the reference interface displays, because a browser would re-render it
/// with its own fonts rather than the pinned files in the store.
async fn preview_svg(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let (document, directory) = read_for_render(&state, id)?;
    let fonts = state.fonts_for(&document)?;
    let rendered = render::svg_for_loaded(&document, &directory, &fonts)?;
    Ok((
        [
            (header::CONTENT_TYPE, "image/svg+xml"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        rendered.bytes,
    ))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TextLayoutQuery {
    id: String,
    width: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TextLayoutResponse {
    line_count: usize,
    height: f64,
}

/// Measures a text layer with the renderer's pinned font metrics. This is a
/// read-only layout aid for horizontal resize handles; the eventual resize is
/// still one ordinary operation batch and one journal transaction.
async fn text_layout(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<TextLayoutQuery>,
) -> Result<Json<TextLayoutResponse>, ApiError> {
    if !query.width.is_finite() || query.width <= 0.0 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalidTextWidth",
            "text width must be a finite positive number",
        ));
    }
    let (document, _) = read_for_render(&state, id)?;
    let layer_id = assemblash_core::LayerId::new(query.id.clone());
    let layer = document.find_layer(&layer_id).ok_or_else(|| {
        ApiError::new(
            StatusCode::NOT_FOUND,
            "layerNotFound",
            format!("layer {} does not exist", query.id),
        )
    })?;
    let LayerKind::Text(text) = &layer.kind else {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "notTextLayer",
            format!("layer {} is not text", query.id),
        ));
    };
    let fonts = state.fonts_for(&document)?;
    let layout = assemblash_renderer::layout_text(
        &text.text,
        query.width,
        text.font_size,
        text.line_height,
        &text.font_family,
        fonts.font_set(),
    );
    Ok(Json(TextLayoutResponse {
        line_count: layout.lines.len(),
        height: layout.height,
    }))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportRequest {
    /// File name stem, without an extension. The directory is not the
    /// caller's to choose.
    #[serde(default)]
    name: Option<String>,
    /// Multiplier on the canvas size.
    #[serde(default = "one")]
    scale: f32,
}

/// Writes a PNG into the project's own `exports/` directory.
async fn export_document(
    State(state): State<AppState>,
    Path(id): Path<String>,
    ApiJson(request): ApiJson<ExportRequest>,
) -> Result<Json<render::Exported>, ApiError> {
    let (document, directory) = read_for_render(&state, id)?;
    let fonts = state.fonts_for(&document)?;
    Ok(Json(render::export_into_project_loaded(
        &document,
        &directory,
        &fonts,
        request.scale,
        request.name.as_deref(),
    )?))
}

/// Reads back a PNG the engine wrote into a project's `exports/`.
///
/// Needed because a batch of variants leaves its results on disk and the page
/// has no other way to show what it just made. The caller supplies a *file
/// name*, never a path: the stem goes through the same [`render::safe_stem`]
/// that named it in the first place, and the extension is not the caller's to
/// choose. So the only files reachable here are ones this engine wrote, in the
/// one directory it writes them to (PRD §10.1, FR-13).
async fn get_export(
    State(state): State<AppState>,
    Path((id, file)): Path<(String, String)>,
) -> Result<impl IntoResponse, ApiError> {
    let stem = file.strip_suffix(".png").ok_or_else(|| {
        ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalidExportName",
            format!("{file:?} is not a PNG this engine writes"),
        )
    })?;
    let stem = render::safe_stem(stem)?;

    let directory = project_directory(&state, id)?;
    let path = directory
        .join(render::EXPORTS_DIR)
        .join(format!("{stem}.png"));
    let bytes = std::fs::read(&path).map_err(|_| {
        ApiError::new(
            StatusCode::NOT_FOUND,
            "noSuchExport",
            format!("this project has no export named {stem:?}"),
        )
    })?;
    Ok((
        [
            (header::CONTENT_TYPE, "image/png"),
            // An export is rewritten in place under the same name, so a cached
            // copy would show the previous batch's picture.
            (header::CACHE_CONTROL, "no-store"),
        ],
        bytes,
    ))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PresetsResponse {
    /// The presets, in the order the document lists them.
    presets: Vec<assemblash_core::Preset>,
}

/// The named style bundles a document offers.
///
/// Read-only: defining, deleting, and applying one are ordinary operations and
/// go through the operation endpoint like every other mutation. A second way
/// to change a document is a second place for the version check, the journal,
/// and the protected-layer rule to be forgotten.
async fn get_presets(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<PresetsResponse>, ApiError> {
    let (document, _) = read_for_render(&state, id)?;
    Ok(Json(PresetsResponse {
        presets: document.presets.clone(),
    }))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SlotsResponse {
    /// Whether this document offers any slots at all.
    is_template: bool,
    /// The slots, in the order the document lists them.
    slots: Vec<assemblash_core::Slot>,
}

/// What a template offers to be filled.
async fn get_slots(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<SlotsResponse>, ApiError> {
    let (document, _) = read_for_render(&state, id)?;
    Ok(Json(SlotsResponse {
        is_template: !document.slots.is_empty(),
        slots: document.slots.clone(),
    }))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VariantsRequest {
    /// One entry per variant to render.
    variants: Vec<render::Variant>,
    /// Multiplier on the canvas size.
    #[serde(default = "one")]
    scale: f32,
}

/// Renders a template once per set of slot values (PRD use case C).
///
/// The template is not modified: each variant is filled on a copy, so a batch
/// leaves the project exactly as it found it.
async fn render_variants(
    State(state): State<AppState>,
    Path(id): Path<String>,
    ApiJson(request): ApiJson<VariantsRequest>,
) -> Result<Json<render::RenderedVariants>, ApiError> {
    let (document, directory) = read_for_render(&state, id)?;
    let fonts = state.fonts_for(&document)?;
    Ok(Json(render::render_variants_loaded(
        &document,
        &directory,
        &fonts,
        request.scale,
        &request.variants,
    )?))
}

/// A project's directory, with the lock held only long enough to find it.
///
/// Going through the session rather than joining a path onto the workspace is
/// what keeps the project id validated in one place.
fn project_directory(state: &AppState, id: String) -> Result<std::path::PathBuf, ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    Ok(session.project_dir().to_path_buf())
}

/// The document and its directory, with the lock held only for the read.
fn read_for_render(
    state: &AppState,
    id: String,
) -> Result<(Document, std::path::PathBuf), ApiError> {
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    Ok((
        session.document().clone(),
        session.project_dir().to_path_buf(),
    ))
}
