//! The routes.
//!
//! Every handler that changes anything does it by building an
//! [`Operation`](assemblash_core::Operation) and handing it to
//! [`Session::apply`](assemblash_core::Session::apply). There is deliberately
//! no handler that edits `document.layers`: validation, history, protection,
//! and version checks all sit at that one choke point (PRD §7.2), and a
//! transport that reached around it would quietly lose every one of them.

use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::UlidIdSource;
use assemblash_core::ops::OpOutcome;
use assemblash_core::storage;
use assemblash_core::workspace::ProjectId;
use assemblash_core::{Color, Document, Operation};
use assemblash_renderer::raster::PngMetadata;
use assemblash_renderer::{document_to_png, LoadedFonts};
use axum::extract::{Path, Query, State};
use axum::http::{header, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

use crate::error::{ApiError, ApiJson};
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

/// The API routes, over shared state.
pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/version", get(version))
        .route("/api/schema/document", get(document_schema))
        .route("/api/schema/operation", get(operation_schema))
        .route("/api/fonts", get(fonts))
        .route("/api/projects", get(list_projects).post(create_project))
        .route("/api/projects/{id}", get(project_summary))
        .route("/api/projects/{id}/document", get(get_document))
        .route("/api/projects/{id}/history", get(get_history))
        .route("/api/projects/{id}/validate", get(validate_project))
        .route("/api/projects/{id}/operations", post(apply_operation))
        .route("/api/projects/{id}/undo", post(undo))
        .route("/api/projects/{id}/redo", post(redo))
        .route("/api/projects/{id}/assets", post(upload_asset))
        .route("/api/projects/{id}/preview.png", get(preview))
        .with_state(state)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Version {
    name: &'static str,
    version: &'static str,
    schema_version: u32,
}

async fn version() -> Json<Version> {
    Json(Version {
        name: "assemblash",
        version: env!("CARGO_PKG_VERSION"),
        schema_version: assemblash_core::SCHEMA_VERSION,
    })
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

async fn list_projects(State(state): State<AppState>) -> Result<Json<ProjectList>, ApiError> {
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
    Ok(Json(ProjectList { projects }))
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
    let id = ProjectId::new(id)?;
    let project = state.project(&id, now_millis())?;
    let session = lock_project(&project)?;
    let document = session.document().clone();
    let directory = session.project_dir().to_path_buf();
    drop(session);

    let hrefs = assemblash_renderer::data_uris(&document, &directory)?;
    let families = families_used(&document);
    let fonts = if families.is_empty() {
        LoadedFonts::from_bytes([])
    } else {
        state.font_store()?.load_families(&families)?
    };

    let png = document_to_png(
        &document,
        &fonts,
        &hrefs,
        query.scale,
        // No timestamp: two previews of an unchanged document are identical,
        // which is what makes a client's cache trustworthy.
        &PngMetadata::for_document(&document),
    )?;

    Ok((
        [
            (header::CONTENT_TYPE, "image/png"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        png,
    ))
}

fn families_used(document: &Document) -> Vec<String> {
    let mut families = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        if let assemblash_core::LayerKind::Text(text) = &layer.kind {
            families.insert(text.font_family.clone());
        }
    });
    families.into_iter().collect()
}
