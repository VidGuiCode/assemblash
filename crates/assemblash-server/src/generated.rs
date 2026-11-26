//! Generated layers: charts, tables and QR codes.
//!
//! One code path for every transport. The HTTP routes, the MCP tools and the
//! CLI commands all call [`add`] and [`regenerate`], so the same spec gives
//! the same asset bytes and the same document whichever surface asked.
//!
//! A generated layer is an ordinary `svg` layer. The spec it was made from
//! sits in the layer payload's extras map under a reserved key
//! (`assemblash.chart`, `assemblash.table` or `assemblash.qr`), written by
//! the `setLayerMeta` operation. The create (or the asset change) and the
//! metadata write are one transaction, so one undo removes both.

use assemblash_core::ids::UlidIdSource;
use assemblash_core::ops::{CreateLayer, LayerPosition, NewLayerKind, OpOutcome, UpdateLayer};
use assemblash_core::{
    storage, Actor, AssetId, Document, FontStyle, ImageFit, LayerId, LayerKind, Operation, Session,
    SessionError, Transform,
};
use assemblash_export::generate::{ChartType, Face, GenerateError, GeneratedSpec};
use assemblash_renderer::FontSet;
use serde::Serialize;

use crate::batch::{apply_compiled, RecordingIds, ReplayThenUlid};
use crate::error::ApiError;
use crate::StatusCode;

/// The weight of the face labels are drawn with.
const LABEL_WEIGHT: u16 = 400;

/// Where a new generated layer goes.
#[derive(Debug, Clone, Default)]
pub struct Placement {
    /// Where in the tree. The top of the root list when absent.
    pub position: Option<LayerPosition>,
    /// The layer box. When absent: at `origin`, at the generated size.
    pub transform: Option<Transform>,
    /// Where the box starts when `transform` is absent.
    pub origin: (f64, f64),
    /// When `transform` is absent: put the box in the middle of the canvas
    /// instead of at `origin`.
    pub centered: bool,
    /// The layer name. When absent: the chart title, or the kind.
    pub name: Option<String>,
}

/// What a generated-layer write did.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedOutcome {
    /// The generated layer.
    pub layer: LayerId,
    /// The asset it draws.
    pub asset: AssetId,
    /// The sha256 of the asset bytes, `sha256:<hex>`.
    pub asset_hash: String,
    /// The size of the generated graphic, in pixels.
    pub width: f64,
    /// The size of the generated graphic, in pixels.
    pub height: f64,
    /// What the operations did.
    pub outcome: OpOutcome,
    /// The transaction, for undo.
    pub transaction: String,
    /// The document version after the write.
    pub version: u64,
}

/// What to change when a generated layer is made again.
#[derive(Debug, Clone, Default)]
pub struct Regenerate {
    /// A whole new spec. Its kind must match the layer's.
    pub spec: Option<GeneratedSpec>,
    /// A new chart type, for a chart layer. Applied after `spec`.
    pub chart_type: Option<ChartType>,
}

/// The value recorded under the reserved key.
#[derive(Debug, Clone, Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Record {
    spec: GeneratedSpec,
    generator: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    font: Option<FontRecord>,
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct FontRecord {
    family: String,
    sha256: String,
}

/// The families a spec needs loaded. Empty for a QR code.
pub fn families_for(spec: &GeneratedSpec) -> Vec<String> {
    spec.font_family().map(str::to_owned).into_iter().collect()
}

/// Generates the asset, imports it, and adds the layer with its spec, as
/// one transaction.
pub fn add(
    session: &mut Session,
    spec: &GeneratedSpec,
    fonts: &FontSet,
    placement: Placement,
    actor: &Actor,
    expected_version: Option<u64>,
) -> Result<GeneratedOutcome, ApiError> {
    check_version(session, expected_version)?;
    let (made, record) = generate(spec, fonts)?;
    let asset = import(session, made.svg.into_bytes())?;

    let transform = placement.transform.unwrap_or_else(|| {
        let (x, y) = if placement.centered {
            let canvas = &session.document().canvas;
            (
                ((canvas.width - made.width) / 2.0).round(),
                ((canvas.height - made.height) / 2.0).round(),
            )
        } else {
            placement.origin
        };
        Transform::new(x, y, made.width, made.height)
    });
    let name = placement.name.or_else(|| default_name(spec));
    let create = Operation::Create(CreateLayer {
        position: placement
            .position
            .unwrap_or(LayerPosition::Root { index: None }),
        transform,
        name,
        kind: NewLayerKind::Svg {
            asset: asset.id.clone(),
            fit: ImageFit::Contain,
        },
    });

    let mut candidate = session.document().clone();
    let mut compiled = Vec::new();
    let mut ids = RecordingIds::default();
    let created = apply_compiled(&mut candidate, create, &mut compiled, &mut ids)?;
    let layer = created.created.first().cloned().ok_or_else(|| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal",
            "the create made no layer",
        )
    })?;
    let meta = meta_operation(&layer, spec, &record)?;
    apply_compiled(&mut candidate, meta, &mut compiled, &mut ids)?;

    let mut replay = ReplayThenUlid::new(ids.raws);
    let label = format!("add {}", spec.kind());
    let (outcome, transaction) = session.apply_batch(
        &label,
        &compiled,
        actor,
        crate::api::now_millis(),
        expected_version,
        &mut replay,
    )?;
    Ok(GeneratedOutcome {
        layer,
        asset: asset.id,
        asset_hash: asset.hash,
        width: made.width,
        height: made.height,
        outcome,
        transaction: transaction.to_string(),
        version: session.version(),
    })
}

/// Makes a generated layer again from its recorded spec, changed as asked,
/// as one transaction. The layer box stays; the graphic is fitted into it.
pub fn regenerate(
    session: &mut Session,
    layer: &LayerId,
    change: Regenerate,
    fonts: &FontSet,
    actor: &Actor,
    expected_version: Option<u64>,
) -> Result<GeneratedOutcome, ApiError> {
    check_version(session, expected_version)?;
    let spec = changed_spec(session.document(), layer, change)?;
    let (made, record) = generate(&spec, fonts)?;
    let asset = import(session, made.svg.into_bytes())?;

    let mut update = UpdateLayer::new(layer.clone());
    update.asset = Some(asset.id.clone());
    let operations = vec![
        Operation::Update(update),
        meta_operation(layer, &spec, &record)?,
    ];
    let label = format!("regenerate {}", spec.kind());
    let (outcome, transaction) = session.apply_batch(
        &label,
        &operations,
        actor,
        crate::api::now_millis(),
        expected_version,
        &mut UlidIdSource,
    )?;
    Ok(GeneratedOutcome {
        layer: layer.clone(),
        asset: asset.id,
        asset_hash: asset.hash,
        width: made.width,
        height: made.height,
        outcome,
        transaction: transaction.to_string(),
        version: session.version(),
    })
}

/// The spec a generated layer records, or a typed refusal when the layer is
/// not a generated layer.
pub fn recorded_spec(document: &Document, layer: &LayerId) -> Result<GeneratedSpec, ApiError> {
    let found = document.find_layer(layer).ok_or_else(|| {
        ApiError::from(SessionError::Operation(
            assemblash_core::ops::OpError::NoSuchLayer { id: layer.clone() },
        ))
    })?;
    let LayerKind::Svg(svg) = &found.kind else {
        return Err(not_generated(layer));
    };
    for key in ["assemblash.chart", "assemblash.table", "assemblash.qr"] {
        if let Some(value) = svg.extra.get(key) {
            let record: Record = serde_json::from_value(value.clone()).map_err(|error| {
                ApiError::new(
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "invalidGeneratorSpec",
                    format!("layer {layer} has an unreadable {key} record: {error}"),
                )
            })?;
            return Ok(record.spec);
        }
    }
    Err(not_generated(layer))
}

fn changed_spec(
    document: &Document,
    layer: &LayerId,
    change: Regenerate,
) -> Result<GeneratedSpec, ApiError> {
    let recorded = recorded_spec(document, layer)?;
    let mut spec = match change.spec {
        Some(spec) if spec.kind() != recorded.kind() => {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "generatorKindMismatch",
                format!(
                    "layer {layer} is a {} layer; a {} spec cannot replace it",
                    recorded.kind(),
                    spec.kind()
                ),
            ))
        }
        Some(spec) => spec,
        None => recorded,
    };
    if let Some(chart_type) = change.chart_type {
        match &mut spec {
            GeneratedSpec::Chart(chart) => chart.chart_type = chart_type,
            other => {
                return Err(ApiError::new(
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "generatorKindMismatch",
                    format!("layer {layer} is a {} layer, not a chart", other.kind()),
                ))
            }
        }
    }
    Ok(spec)
}

fn not_generated(layer: &LayerId) -> ApiError {
    ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        "notGeneratedLayer",
        format!("layer {layer} is not a chart, table or QR code layer"),
    )
}

fn check_version(session: &Session, expected: Option<u64>) -> Result<(), ApiError> {
    match expected {
        Some(expected) if expected != session.version() => Err(SessionError::VersionConflict {
            expected,
            actual: session.version(),
        }
        .into()),
        _ => Ok(()),
    }
}

fn generate(
    spec: &GeneratedSpec,
    fonts: &FontSet,
) -> Result<(assemblash_export::generate::Generated, Record), ApiError> {
    let face_data = match spec.font_family() {
        Some(family) => Some((
            family,
            fonts
                .face_data(family, LABEL_WEIGHT, FontStyle::Normal)
                .ok_or_else(|| font_missing(family))?,
        )),
        None => None,
    };
    let face = face_data.map(|(family, data)| Face {
        family,
        bytes: data.bytes(),
        index: data.index(),
    });
    let made = spec.to_svg(face.as_ref()).map_err(generate_error)?;
    let record = Record {
        spec: spec.clone(),
        generator: format!("assemblash {}", env!("CARGO_PKG_VERSION")),
        font: face_data.map(|(family, data)| FontRecord {
            family: family.to_owned(),
            sha256: data.sha256().to_owned(),
        }),
    };
    Ok((made, record))
}

fn meta_operation(
    layer: &LayerId,
    spec: &GeneratedSpec,
    record: &Record,
) -> Result<Operation, ApiError> {
    let value = serde_json::to_value(record).map_err(|error| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal",
            error.to_string(),
        )
    })?;
    Ok(Operation::SetLayerMeta {
        id: layer.clone(),
        key: spec.meta_key().to_owned(),
        value: Some(value),
        allow_locked: false,
    })
}

/// Imports the bytes, or reuses the asset that already holds them.
fn import(session: &mut Session, bytes: Vec<u8>) -> Result<assemblash_core::Asset, ApiError> {
    let hash = storage::hash_bytes(&bytes);
    if let Some(existing) = session
        .document()
        .assets
        .iter()
        .find(|asset| asset.hash == hash && asset.media_type == "image/svg+xml")
    {
        return Ok(existing.clone());
    }
    let (asset, report) =
        storage::import_asset_bytes(session.project_dir(), bytes, "svg", &mut UlidIdSource)?;
    // The generator writes only what the sanitiser allows. Anything removed
    // is a defect in the generator, not something to pass on quietly.
    if report.is_some_and(|report| !report.is_clean()) {
        return Err(ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal",
            "the SVG sanitiser removed part of a generated graphic",
        ));
    }
    session.register_asset(asset.clone())?;
    Ok(asset)
}

fn default_name(spec: &GeneratedSpec) -> Option<String> {
    match spec {
        GeneratedSpec::Chart(chart) => chart
            .title
            .clone()
            .filter(|t| !t.trim().is_empty())
            .or_else(|| Some(format!("{} chart", chart.chart_type.as_str()))),
        GeneratedSpec::Table(_) => Some("table".to_owned()),
        GeneratedSpec::Qr(_) => Some("QR code".to_owned()),
    }
}

fn font_missing(family: &str) -> ApiError {
    ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        "generatorFontMissing",
        format!(
            "the labels need the regular (400) face of {family:?}, which is not installed; \
             install it, or name another family in fontFamily"
        ),
    )
    .with_details(serde_json::json!({ "family": family }))
}

/// A generator refusal as an API error. The spec was well formed JSON that
/// the generator declined, so 422.
pub fn generate_error(error: GenerateError) -> ApiError {
    ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        error.code(),
        error.to_string(),
    )
}
