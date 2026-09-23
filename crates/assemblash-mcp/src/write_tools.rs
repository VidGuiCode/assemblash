//! The mutating tools.
//!
//! Named tools rather than one generic `apply_operation`: agents are bad at
//! guessing structure (PRD R2), and a typed schema with a description is the
//! whole reason MCP beats handing over a JSON blob. There is deliberately no
//! generic escape hatch — it would let an agent build operations no tool
//! describes, which is the surface the safeguards exist to bound.
//!
//! Every one of these is three lines of translation over
//! [`Backend::apply`](crate::backend::Backend::apply), which is where the dry
//! run, the expected version, the protected-layer refusal, and the transaction
//! id live.

use assemblash_core::document::{
    BlendMode, Clip, Crop, Effect, FontStyle, ImageFit, LineCap, LineJoin, ShapeKind, Stroke,
    TextAlign, Transform, VerticalAlign,
};
use assemblash_core::ops::{
    AlignEdge, Axis, CanvasAnchor, CreateLayer, LayerPosition, NewLayerKind, SnapTarget,
    UpdateCanvas, UpdateLayer,
};
use assemblash_core::{AssetId, Color, LayerId, LineMarker, Operation};
use rmcp::handler::server::wrapper::{Json, Parameters};
use rmcp::model::ErrorData;
use rmcp::{tool, tool_router};
use schemars::JsonSchema;
use serde::{Deserialize, Deserializer};

use crate::backend::{
    FontInstallReport, FontRemovalReport, ProjectDeleted, ProjectRenamed, ProjectSummary,
};
use crate::server::{to_error, AssemblashMcp};
use crate::writes::{ExportResult, OpenedProject, WriteEnvelope, WriteOutcome};

/// A box: where a layer sits and how big it is.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct BoxArgs {
    /// Left edge, in the parent's coordinate space.
    pub x: f64,
    /// Top edge.
    pub y: f64,
    /// Box width.
    pub width: f64,
    /// Box height.
    pub height: f64,
    /// Clockwise rotation in degrees about the box centre.
    #[serde(default)]
    pub rotation: Option<f64>,
}

impl From<&BoxArgs> for Transform {
    fn from(args: &BoxArgs) -> Self {
        Self {
            rotation: args.rotation.unwrap_or(0.0),
            ..Self::new(args.x, args.y, args.width, args.height)
        }
    }
}

/// Where a new layer goes.
#[derive(Debug, Clone, Default, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PlacementArgs {
    /// Group to put it in. Omit for the top level.
    #[serde(default)]
    pub parent: Option<String>,
    /// Index among its siblings. Omit to put it on top.
    #[serde(default)]
    pub index: Option<usize>,
}

impl From<&PlacementArgs> for LayerPosition {
    fn from(args: &PlacementArgs) -> Self {
        match &args.parent {
            Some(parent) => Self::In {
                parent: LayerId::new(parent.clone()),
                index: args.index,
            },
            None => Self::Root { index: args.index },
        }
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddTextArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// The text. A newline starts a new line.
    pub text: String,
    /// Font family, spelled as the font store reports it. A family that is not
    /// installed is an error at render time, never a substitution.
    pub font_family: String,
    /// Font size in pixels.
    pub font_size: f64,
    /// Fill colour, `#rrggbb` or `#rrggbbaa`.
    #[serde(default)]
    pub color: Option<String>,
    /// `left`, `center`, or `right`.
    #[serde(default)]
    pub align: Option<TextAlign>,
    /// Line height as a multiple of the font size.
    #[serde(default)]
    pub line_height: Option<f64>,
    /// Font weight, 100–900; 400 is the regular face. A weight the font
    /// store has no face for is an error at render time, never a
    /// substitution.
    #[serde(default)]
    pub font_weight: Option<u16>,
    /// `normal` or `italic`.
    #[serde(default)]
    pub font_style: Option<FontStyle>,
    /// Extra space between characters, in pixels.
    #[serde(default)]
    pub letter_spacing: Option<f64>,
    /// Glyph stroke, drawn centred on the outline with the fill painted
    /// first (so a stroke never eats the letter).
    #[serde(default)]
    pub stroke: Option<StrokeArgs>,
    /// Where the text block sits vertically in the box: `top`, `middle`,
    /// or `bottom`.
    #[serde(default)]
    pub vertical_align: Option<VerticalAlign>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

/// The primitive geometry a shape layer draws.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ShapeArg {
    /// A rectangle filling its box.
    Rect,
    /// An ellipse inscribed in its box.
    Ellipse,
    /// A horizontal segment across the middle of its box.
    Line,
    /// A closed silhouette drawn from path data, in the engine's conservative
    /// grammar. The `path` argument carries the `d` string, and a `d` that
    /// breaks the grammar is refused with the grammar's own words.
    Path,
}

/// The edge paint for a shape layer.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct StrokeArgs {
    /// Stroke colour, `#rrggbb` or `#rrggbbaa`.
    pub color: String,
    /// Stroke width in document units. Defaults to 1 when omitted.
    #[serde(default)]
    pub width: Option<f64>,
    /// Dash pattern, alternating paint and gap in document units. At most 8
    /// entries, every one finite and greater than 0; a value outside those
    /// limits is refused when the change is applied.
    #[serde(default)]
    pub dash_array: Option<Vec<f64>>,
    /// How the stroke ends: `butt`, `round`, or `square`.
    #[serde(default)]
    pub line_cap: Option<LineCap>,
    /// How two segments meet: `miter`, `round`, or `bevel`.
    #[serde(default)]
    pub line_join: Option<LineJoin>,
}

impl StrokeArgs {
    fn to_stroke(&self) -> Stroke {
        Stroke {
            color: Color::new(self.color.clone()),
            width: self.width.unwrap_or(1.0),
            dash_array: self.dash_array.clone(),
            line_cap: self.line_cap.clone(),
            line_join: self.line_join.clone(),
            extra: assemblash_core::document::Extras::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddShapeArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// Geometry to create: `rect`, `ellipse`, `line`, or `path`.
    pub shape: ShapeArg,
    /// Path data for `shape: "path"`, as written in an SVG `d` attribute:
    /// one leading moveto, straight and cubic segments and arcs only, closed.
    /// Required for a path, refused otherwise.
    #[serde(default)]
    pub path: Option<String>,
    /// Corner radius for a rectangle, in document units. Defaults to 0;
    /// other geometries do not have corners.
    #[serde(default)]
    pub corner_radius: Option<f64>,
    /// Interior paint. Rectangles and ellipses default to `#000000`; lines
    /// default to no fill.
    #[serde(default)]
    pub fill: Option<String>,
    /// Edge paint. Rectangles and ellipses default to no stroke; lines default
    /// to `#000000` at width 1. A supplied width defaults to 1.
    #[serde(default)]
    pub stroke: Option<StrokeArgs>,
    /// What sits at the start of a line segment: `none`, `arrow`, or
    /// `circle`. Lines only; a marker on another geometry is refused.
    #[serde(default)]
    pub marker_start: Option<LineMarker>,
    /// What sits at the end of a line segment: `none`, `arrow`, or `circle`.
    /// See `markerStart`.
    #[serde(default)]
    pub marker_end: Option<LineMarker>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddImageArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// Id of an asset already in the document, as `get_document_state`
    /// reports it. There is no tool that imports a file from a path.
    pub asset: String,
    /// How the image fills its box: `fill`, `contain`, or `cover`.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddSvgArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// Id of an SVG asset already in the document, as `get_document_state`
    /// reports it. There is no tool that imports a file from a path, and none
    /// that takes markup: an asset is sanitised when it is imported, so
    /// everything drawn from one is safe by construction.
    pub asset: String,
    /// How the graphic fills its box: `fill`, `contain`, or `cover`.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to change.
    pub layer_id: String,
    /// New opacity, 0 to 1.
    #[serde(default)]
    pub opacity: Option<f64>,
    /// New text, for a text layer.
    #[serde(default)]
    pub text: Option<String>,
    /// New font family, for a text layer.
    #[serde(default)]
    pub font_family: Option<String>,
    /// New font size, for a text layer.
    #[serde(default)]
    pub font_size: Option<f64>,
    /// New colour, for a text layer.
    #[serde(default)]
    pub color: Option<String>,
    /// New alignment, for a text layer.
    #[serde(default)]
    pub align: Option<TextAlign>,
    /// New line height, as a multiple of the font size, for a text layer.
    #[serde(default)]
    pub line_height: Option<f64>,
    /// New font weight, 100–900, for a text layer.
    #[serde(default)]
    pub font_weight: Option<u16>,
    /// `normal` or `italic`, for a text layer.
    #[serde(default)]
    pub font_style: Option<FontStyle>,
    /// New letter spacing, in pixels, for a text layer.
    #[serde(default)]
    pub letter_spacing: Option<f64>,
    /// Where the text block sits vertically in the box: `top`, `middle`, or
    /// `bottom`, for a text layer.
    #[serde(default)]
    pub vertical_align: Option<VerticalAlign>,
    /// New fill colour for a shape layer, `#rrggbb` or `#rrggbbaa`. Use
    /// `clearFill: true` to remove the fill; a JSON null is treated as omitted.
    #[serde(default)]
    pub fill: Option<String>,
    /// Replace the whole stroke on a shape or text layer. Its width defaults
    /// to 1. Use `clearStroke: true` to remove it; a JSON null is treated as
    /// omitted.
    #[serde(default)]
    pub stroke: Option<StrokeArgs>,
    /// Set true to remove the text layer's colour, leaving a stroke-only
    /// (hollow) layer; cannot be combined with `color`.
    #[serde(default)]
    pub clear_color: Option<bool>,
    /// New corner radius for a rectangular shape, in document units.
    #[serde(default)]
    pub corner_radius: Option<f64>,
    /// Replace the whole geometry of a shape layer: `rect`, `ellipse`,
    /// `line`, or `path`. The paint stays. A `path` needs path data in
    /// `path`; a `d` that breaks the grammar is refused with the grammar's
    /// own words. Text, image, SVG, and group layers refuse it, naming the
    /// layer.
    #[serde(default)]
    pub shape: Option<ShapeArg>,
    /// Path data for `shape: "path"`, as written in an SVG `d` attribute:
    /// one leading moveto, straight and cubic segments and arcs only, closed.
    /// Required for a path, refused otherwise.
    #[serde(default)]
    pub path: Option<String>,
    /// What sits at the start of a line segment: `none`, `arrow`, or
    /// `circle`. Line layers only; a marker on another geometry is refused,
    /// naming the layer.
    #[serde(default)]
    pub marker_start: Option<LineMarker>,
    /// What sits at the end of a line segment: `none`, `arrow`, or `circle`.
    /// See `markerStart`.
    #[serde(default)]
    pub marker_end: Option<LineMarker>,
    /// Set true to remove the fill; cannot be combined with `fill`.
    #[serde(default)]
    pub clear_fill: Option<bool>,
    /// Set true to remove the stroke; cannot be combined with `stroke`.
    #[serde(default)]
    pub clear_stroke: Option<bool>,
    /// New fit, for an image or SVG layer.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// How the layer composites onto what is beneath it: normal, multiply,
    /// screen, overlay, darken, lighten, hard-light, soft-light, difference,
    /// exclusion, hue, saturation, color, luminosity. A mode this build does
    /// not render — including color-dodge and color-burn, which are not
    /// reproducible byte for byte on every target — is refused rather than
    /// drawn as normal.
    #[serde(default)]
    pub blend_mode: Option<BlendMode>,
    /// The whole effect stack, in order, replacing whatever is there:
    /// `[{"type":"brightness","amount":1.2},{"type":"blur","radius":3}]`.
    /// Pass `[]` to clear it. Grain takes a `seed`, so the same document
    /// always produces the same noise.
    #[serde(default)]
    pub effects: Option<Vec<Effect>>,
    /// The mask on the layer: `{"shape":"rect","cornerRadius":12}` or
    /// `{"shape":"ellipse"}`. The geometry is the layer's box. It hides
    /// everything the layer draws outside it, and a shadow the layer carries
    /// follows the clipped shape. Use `clearClip: true` to remove it; a JSON
    /// null is treated as omitted. The mask is fixed to the layer's box in
    /// its parent's space, so a rotated layer is cut to the axis-aligned box.
    #[serde(default)]
    pub clip: Option<Clip>,
    /// The source rectangle an image layer shows, in source pixels:
    /// `{"x":0,"y":0,"width":400,"height":400}`. It composes with `fit`: the
    /// rectangle is placed into the layer's box as if it were the whole
    /// image, so `fill` stretches it and `contain`/`cover` work from its
    /// aspect. Values outside the source clamp to it; a rectangle that shares
    /// no area with the source is refused. Use `clearCrop: true` to remove
    /// it; a JSON null is treated as omitted. Image layers only.
    #[serde(default)]
    pub crop: Option<Crop>,
    /// Set true to remove the clip; cannot be combined with `clip`.
    #[serde(default)]
    pub clear_clip: Option<bool>,
    /// Set true to remove the crop; cannot be combined with `crop`.
    #[serde(default)]
    pub clear_crop: Option<bool>,
    /// Mirror the layer left-to-right about the box centre.
    #[serde(default)]
    pub flip_horizontal: Option<bool>,
    /// Mirror the layer top-to-bottom about the box centre.
    #[serde(default)]
    pub flip_vertical: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerTargetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to act on.
    pub layer_id: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct MoveArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move.
    pub layer_id: String,
    /// Distance along x. Positive is right.
    pub dx: f64,
    /// Distance along y. Positive is down.
    pub dy: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ResizeArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to resize.
    pub layer_id: String,
    /// New width.
    pub width: f64,
    /// New height.
    pub height: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RotateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to rotate.
    pub layer_id: String,
    /// Degrees clockwise to rotate *to*, not by.
    pub degrees: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ReorderArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move in the tree.
    pub layer_id: String,
    #[serde(flatten)]
    pub placement: PlacementArgs,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct GroupArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to wrap. They must currently share a parent.
    pub layer_ids: Vec<String>,
    /// Name for the new group.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FlagArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to change.
    pub layer_id: String,
    /// The value to set.
    pub value: bool,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenameArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to rename.
    pub layer_id: String,
    /// The new name. Omit to clear it.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AlignArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to line up. Explicit ids: there is no stored selection.
    pub layer_ids: Vec<String>,
    /// Which edge or centre line.
    pub edge: AlignEdge,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AxisArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to act on.
    pub layer_ids: Vec<String>,
    /// Which axis.
    pub axis: Axis,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCanvasArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(default)]
    pub width: Option<f64>,
    #[serde(default)]
    pub height: Option<f64>,
    #[serde(default, deserialize_with = "nullable_color")]
    #[schemars(with = "Option<Option<String>>")]
    pub background: Option<Option<Color>>,
    #[serde(default)]
    pub anchor: Option<CanvasAnchor>,
}
fn nullable_color<'de, D>(deserializer: D) -> Result<Option<Option<Color>>, D::Error>
where
    D: Deserializer<'de>,
{
    Ok(Some(Option::<Color>::deserialize(deserializer)?))
}
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SnapArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move.
    pub layer_id: String,
    /// Layer to snap against. Omit to snap to the canvas.
    #[serde(default)]
    pub target_layer_id: Option<String>,
    /// Which edge to snap to.
    pub edge: AlignEdge,
}

/// Where a layer's box goes, in absolute values.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerBoxArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to place.
    pub layer_id: String,
    /// New left edge, in the parent's coordinate space. Omit to keep it.
    #[serde(default)]
    pub x: Option<f64>,
    /// New top edge. Omit to keep it.
    #[serde(default)]
    pub y: Option<f64>,
    /// New box width. Omit to keep it.
    #[serde(default)]
    pub width: Option<f64>,
    /// New box height. Omit to keep it.
    #[serde(default)]
    pub height: Option<f64>,
    /// New clockwise rotation in degrees. Omit to keep it.
    #[serde(default)]
    pub rotation: Option<f64>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExportArgs {
    /// Project to export. Omit to use the one in use.
    #[serde(default)]
    pub project: Option<String>,
    /// Multiplier on the canvas size.
    #[serde(default)]
    pub scale: Option<f32>,
    /// File name stem, without an extension. Letters, digits, hyphens, and
    /// underscores only — the directory is not yours to choose.
    #[serde(default)]
    pub name: Option<String>,
    /// Replace a file of that name if one is already there.
    ///
    /// Off by default: an export that quietly replaced an earlier one would
    /// lose work nobody asked to lose.
    #[serde(default)]
    pub overwrite: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectArgs {
    /// Project to use for later calls, as `list_projects` reports it.
    pub project: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct NewProjectArgs {
    /// Name for the new project, and the name every later call passes as
    /// `project`. Letters, digits, hyphens, and underscores; a name that is
    /// really a path is refused, and so is one already taken.
    pub project: String,
    /// Canvas width in pixels.
    pub width: f64,
    /// Canvas height in pixels.
    pub height: f64,
    /// Canvas background, `#rrggbb` or `#rrggbbaa`. Omit for none, which
    /// exports as transparent.
    #[serde(default)]
    pub background: Option<String>,
    /// Human-facing document name. Not an identifier.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct InsertLayerTreeArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// The layers to insert, as document layer objects — a pasted subtree.
    /// Ids in them are replaced; assets they name must already be in the
    /// document.
    pub layers: Vec<assemblash_core::Layer>,
    /// Group to put the top-level layers in. Omit for the document root.
    #[serde(default)]
    pub parent: Option<String>,
    /// Index among the siblings there. Omit to put them on top.
    #[serde(default)]
    pub index: Option<usize>,
    /// Distance to move the whole tree along x, in document units.
    #[serde(default)]
    pub offset_x: Option<f64>,
    /// Distance to move the whole tree along y, in document units.
    #[serde(default)]
    pub offset_y: Option<f64>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct InstallFontPackArgs {
    /// A pack from the compiled-in manifest, e.g. `default`.
    pub pack: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RemoveFontFamilyArgs {
    /// The family to remove, spelled as `list_fonts` reports it.
    pub family: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DeleteProjectArgs {
    /// Project to delete, as `list_projects` reports it.
    pub project: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenameProjectArgs {
    /// Project to rename, as `list_projects` reports it.
    pub project: String,
    /// The new name. Letters, digits, hyphens, and underscores; a name that
    /// is really a path is refused, and so is one already taken.
    pub name: String,
}

#[tool_router(router = write_tool_router, vis = "pub(crate)")]
impl AssemblashMcp {
    /// Adds a text layer.
    #[tool(
        description = "Add a text layer to a project. Fonts are not substituted: the family \
                       must be one the font store has. Set dryRun to see what would happen \
                       without doing it."
    )]
    async fn add_text_layer(
        &self,
        Parameters(args): Parameters<AddTextArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Text {
                text: args.text.clone(),
                font_family: args.font_family.clone(),
                font_size: args.font_size,
                color: Some(
                    args.color
                        .clone()
                        .map(Color::new)
                        .unwrap_or_else(Color::default),
                ),
                align: args.align.unwrap_or_default(),
                line_height: args.line_height.unwrap_or(1.2),
                font_weight: args.font_weight.unwrap_or(400),
                font_style: args.font_style.unwrap_or_default(),
                letter_spacing: args.letter_spacing.unwrap_or(0.0),
                stroke: args.stroke.as_ref().map(StrokeArgs::to_stroke),
                vertical_align: args.vertical_align.unwrap_or_default(),
            },
        });
        self.write(&args.write, operation)
    }

    /// Adds a rectangle, ellipse, line, or path shape layer.
    #[tool(
        description = "Add a rectangle, ellipse, horizontal line, or closed-path shape layer to a \
                       project. Rectangles and ellipses default to a #000000 fill and no stroke; \
                       lines default to no fill and a #000000 stroke of width 1; a path takes \
                       path data in `path` (one leading moveto, straight/cubic segments and arcs \
                       only, closed - a bad d string is refused naming the command and byte). A \
                       supplied stroke width defaults to 1, and cornerRadius defaults to 0 for \
                       rectangles. The operation is journalled, supports dryRun and \
                       expectedVersion, and refuses invalid paint, boxes, parents, protected \
                       targets, or unsupported values; it never imports files or writes outside \
                       the project."
    )]
    async fn add_shape_layer(
        &self,
        Parameters(args): Parameters<AddShapeArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        if args.corner_radius.is_some() && !matches!(args.shape, ShapeArg::Rect) {
            let kind = match args.shape {
                ShapeArg::Rect => "rect",
                ShapeArg::Ellipse => "ellipse",
                ShapeArg::Line => "line",
                ShapeArg::Path => "path",
            };
            return Err(ErrorData::invalid_request(
                format!("cornerRadius is only valid for rect shapes; got {kind}"),
                None,
            ));
        }
        if args.shape == ShapeArg::Path && args.path.is_none() {
            return Err(ErrorData::invalid_request(
                "shape \"path\" needs path data in the `path` argument",
                None,
            ));
        }
        let shape = match args.shape {
            ShapeArg::Rect => ShapeKind::Rect {
                corner_radius: args.corner_radius.unwrap_or(0.0),
                extra: assemblash_core::document::Extras::new(),
            },
            ShapeArg::Ellipse => ShapeKind::Ellipse {
                extra: assemblash_core::document::Extras::new(),
            },
            ShapeArg::Line => ShapeKind::Line {
                marker_start: args.marker_start.clone(),
                marker_end: args.marker_end.clone(),
                extra: assemblash_core::document::Extras::new(),
            },
            ShapeArg::Path => {
                // Refused above when absent; spelled as a `let else` so no
                // call can panic on a caller's behalf.
                let Some(d) = args.path.clone() else {
                    return Err(ErrorData::invalid_request(
                        "shape \"path\" needs path data in the `path` argument",
                        None,
                    ));
                };
                ShapeKind::Path {
                    d,
                    extra: assemblash_core::document::Extras::new(),
                }
            }
        };
        let fill =
            args.fill.clone().map(Color::new).or_else(|| {
                (!matches!(&shape, ShapeKind::Line { .. })).then(|| Color::new("#000000"))
            });
        let stroke = args.stroke.as_ref().map(StrokeArgs::to_stroke).or_else(|| {
            matches!(&shape, ShapeKind::Line { .. }).then(|| Stroke {
                color: Color::new("#000000"),
                width: 1.0,
                dash_array: None,
                line_cap: None,
                line_join: None,
                extra: assemblash_core::document::Extras::new(),
            })
        });
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Shape {
                shape,
                fill,
                stroke,
            },
        });
        self.write(&args.write, operation)
    }

    /// Adds an image layer for an asset already in the document.
    #[tool(
        description = "Add an image layer for an asset already imported into the project. \
                       There is no tool that imports a file from a path."
    )]
    async fn add_image_layer(
        &self,
        Parameters(args): Parameters<AddImageArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Image {
                asset: AssetId::new(args.asset.clone()),
                fit: args.fit.unwrap_or_default(),
            },
        });
        self.write(&args.write, operation)
    }

    /// Adds an SVG layer for an asset already in the document.
    #[tool(
        description = "Add a vector graphic layer for an SVG asset already imported into the \
                       project. There is no tool that imports a file from a path, and none \
                       that takes markup: an SVG is sanitised on the way in, so a layer can \
                       only ever draw one that already was."
    )]
    async fn add_svg_layer(
        &self,
        Parameters(args): Parameters<AddSvgArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Svg {
                asset: AssetId::new(args.asset.clone()),
                fit: args.fit.unwrap_or_default(),
            },
        });
        self.write(&args.write, operation)
    }

    /// Changes a layer's properties.
    #[tool(
        description = "Change properties of an existing layer. Only the fields you pass are \
                       touched; omitting one leaves it alone. On a shape layer you may also \
                       replace the whole geometry with `shape` (rect, ellipse, line, or path; \
                       a path needs `path` data, and a bad d string is refused naming the \
                       command and byte), or set line markers with markerStart/markerEnd \
                       (none, arrow, or circle - line layers only)."
    )]
    async fn update_layer(
        &self,
        Parameters(args): Parameters<UpdateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let clear_fill = args.clear_fill.unwrap_or(false);
        let clear_stroke = args.clear_stroke.unwrap_or(false);
        if clear_fill && args.fill.is_some() {
            return Err(ErrorData::invalid_request(
                "fill and clearFill cannot be combined; set clearFill to true to remove the fill",
                None,
            ));
        }
        if clear_stroke && args.stroke.is_some() {
            return Err(ErrorData::invalid_request(
                "stroke and clearStroke cannot be combined; set clearStroke to true to remove the stroke",
                None,
            ));
        }
        if args.clear_color.unwrap_or(false) && args.color.is_some() {
            return Err(ErrorData::invalid_request(
                "color and clearColor cannot be combined; set clearColor to true to remove the colour",
                None,
            ));
        }
        if args.clear_clip.unwrap_or(false) && args.clip.is_some() {
            return Err(ErrorData::invalid_request(
                "clip and clearClip cannot be combined; set clearClip to true to remove the clip",
                None,
            ));
        }
        if args.clear_crop.unwrap_or(false) && args.crop.is_some() {
            return Err(ErrorData::invalid_request(
                "crop and clearCrop cannot be combined; set clearCrop to true to remove the crop",
                None,
            ));
        }
        let shape = match args.shape {
            None => None,
            Some(ShapeArg::Rect) => Some(ShapeKind::Rect {
                corner_radius: args.corner_radius.unwrap_or(0.0),
                extra: assemblash_core::document::Extras::new(),
            }),
            Some(ShapeArg::Ellipse) => Some(ShapeKind::Ellipse {
                extra: assemblash_core::document::Extras::new(),
            }),
            Some(ShapeArg::Line) => Some(ShapeKind::Line {
                marker_start: args.marker_start.clone(),
                marker_end: args.marker_end.clone(),
                extra: assemblash_core::document::Extras::new(),
            }),
            Some(ShapeArg::Path) => {
                let Some(d) = args.path.clone() else {
                    return Err(ErrorData::invalid_request(
                        "shape \"path\" needs path data in the `path` argument",
                        None,
                    ));
                };
                Some(ShapeKind::Path {
                    d,
                    extra: assemblash_core::document::Extras::new(),
                })
            }
        };
        let clip = if args.clear_clip.unwrap_or(false) {
            Some(None)
        } else {
            args.clip.clone().map(Some)
        };
        let crop = if args.clear_crop.unwrap_or(false) {
            Some(None)
        } else {
            args.crop.map(Some)
        };
        let fill = if clear_fill {
            Some(None)
        } else {
            args.fill.clone().map(|value| Some(Color::new(value)))
        };
        let stroke = if clear_stroke {
            Some(None)
        } else {
            args.stroke.as_ref().map(|value| Some(value.to_stroke()))
        };
        let color = if args.clear_color.unwrap_or(false) {
            Some(None)
        } else {
            args.color.clone().map(|value| Some(Color::new(value)))
        };
        let operation = Operation::Update(UpdateLayer {
            opacity: args.opacity,
            text: args.text.clone(),
            font_family: args.font_family.clone(),
            font_size: args.font_size,
            color,
            align: args.align,
            line_height: args.line_height,
            font_weight: args.font_weight,
            font_style: args.font_style,
            letter_spacing: args.letter_spacing,
            vertical_align: args.vertical_align,
            fill,
            stroke,
            corner_radius: args.corner_radius,
            shape,
            marker_start: args.marker_start.clone(),
            marker_end: args.marker_end.clone(),
            clip,
            crop,
            flip_horizontal: args.flip_horizontal,
            flip_vertical: args.flip_vertical,
            fit: args.fit,
            blend_mode: args.blend_mode.clone(),
            effects: args.effects.clone(),
            ..UpdateLayer::new(LayerId::new(args.layer_id.clone()))
        });
        self.write(&args.write, operation)
    }

    /// Moves a layer.
    #[tool(description = "Move a layer by a distance, leaving its size and rotation alone.")]
    async fn move_layer(
        &self,
        Parameters(args): Parameters<MoveArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Move {
                id: LayerId::new(args.layer_id.clone()),
                dx: args.dx,
                dy: args.dy,
            },
        )
    }

    /// Places a layer's whole box at once.
    #[tool(
        description = "Set a layer's position, size, and rotation in absolute values, in one \
                       journalled change that one undo reverts. Omitted fields stay as they \
                       are. Use this to make a text box taller or to place a layer exactly; \
                       update_layer changes properties, not the box."
    )]
    async fn set_layer_box(
        &self,
        Parameters(args): Parameters<LayerBoxArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let envelope = self.resolved(&args.write);
        let layer = self
            .backend()
            .get_layer(envelope.project.as_deref(), &args.layer_id)
            .map_err(to_error)?;
        let id = LayerId::new(args.layer_id.clone());

        let mut operations = Vec::new();
        let dx = args.x.map_or(0.0, |x| x - layer.x);
        let dy = args.y.map_or(0.0, |y| y - layer.y);
        if dx != 0.0 || dy != 0.0 {
            operations.push(Operation::Move {
                id: id.clone(),
                dx,
                dy,
            });
        }
        if args.width.is_some() || args.height.is_some() {
            let width = args.width.unwrap_or(layer.width);
            let height = args.height.unwrap_or(layer.height);
            if width != layer.width || height != layer.height {
                operations.push(Operation::Resize {
                    id: id.clone(),
                    width,
                    height,
                });
            }
        }
        if let Some(degrees) = args.rotation {
            if degrees != layer.rotation {
                operations.push(Operation::Rotate { id, degrees });
            }
        }
        if operations.is_empty() {
            return Err(ErrorData::invalid_request(
                "the layer is already where this asks for: give an x, y, width, height, or \
                 rotation that differs from the layer's own"
                    .to_owned(),
                None,
            ));
        }
        self.backend()
            .apply_batch(&envelope, "set layer box", &operations)
            .map(Json)
            .map_err(to_error)
    }

    /// Resizes a layer.
    #[tool(description = "Set a layer's box size, leaving its position and rotation alone.")]
    async fn resize_layer(
        &self,
        Parameters(args): Parameters<ResizeArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Resize {
                id: LayerId::new(args.layer_id.clone()),
                width: args.width,
                height: args.height,
            },
        )
    }

    /// Rotates a layer.
    #[tool(description = "Set a layer's rotation: the angle to rotate to, not by.")]
    async fn rotate_layer(
        &self,
        Parameters(args): Parameters<RotateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Rotate {
                id: LayerId::new(args.layer_id.clone()),
                degrees: args.degrees,
            },
        )
    }

    /// Moves a layer elsewhere in the tree.
    #[tool(
        description = "Move a layer to another parent, another z-order position, or both. \
                       Array order is z-order: later means on top."
    )]
    async fn reorder_layer(
        &self,
        Parameters(args): Parameters<ReorderArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Reorder {
                id: LayerId::new(args.layer_id.clone()),
                to: (&args.placement).into(),
            },
        )
    }

    /// Wraps layers in a group.
    #[tool(
        description = "Wrap sibling layers in a new group without moving the picture. They \
                       must currently share a parent."
    )]
    async fn group_layers(
        &self,
        Parameters(args): Parameters<GroupArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Group {
                ids: layer_ids(&args.layer_ids),
                name: args.name.clone(),
            },
        )
    }

    /// Dissolves a group.
    #[tool(description = "Replace a group with its children, in place.")]
    async fn ungroup_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Ungroup {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Copies a layer.
    #[tool(description = "Copy a layer, and everything inside it, directly above the original.")]
    async fn duplicate_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Duplicate {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Removes a layer.
    #[tool(
        description = "Remove a layer and everything inside it. Reversible: the result carries \
                       a transaction id, and undo restores the document exactly."
    )]
    async fn delete_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Delete {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Shows or hides a layer.
    #[tool(description = "Show or hide a layer.")]
    async fn set_layer_visible(
        &self,
        Parameters(args): Parameters<FlagArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::SetVisible {
                id: LayerId::new(args.layer_id.clone()),
                visible: args.value,
            },
        )
    }

    /// Locks or unlocks a layer.
    #[tool(
        description = "Lock or unlock a layer. A locked layer refuses ordinary changes. This \
                       is not the same as protected, which no tool can turn off."
    )]
    async fn set_layer_locked(
        &self,
        Parameters(args): Parameters<FlagArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::SetLocked {
                id: LayerId::new(args.layer_id.clone()),
                locked: args.value,
            },
        )
    }

    /// Renames a layer.
    #[tool(description = "Rename a layer, or clear its name by omitting the name.")]
    async fn rename_layer(
        &self,
        Parameters(args): Parameters<RenameArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Rename {
                id: LayerId::new(args.layer_id.clone()),
                name: args.name.clone(),
            },
        )
    }

    /// Lines layers up.
    #[tool(
        description = "Line layers up on an edge or centre line. Typed geometry beats \
                       guessing at coordinates."
    )]
    async fn align_layers(
        &self,
        Parameters(args): Parameters<AlignArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Align {
                ids: layer_ids(&args.layer_ids),
                edge: args.edge,
            },
        )
    }

    /// Centres layers on the canvas.
    #[tool(description = "Move layers, as one group, onto the centre of the canvas.")]
    async fn center_on_canvas(
        &self,
        Parameters(args): Parameters<AxisArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::CenterOnCanvas {
                ids: layer_ids(&args.layer_ids),
                axis: args.axis,
            },
        )
    }

    /// Spreads layers out evenly.
    #[tool(description = "Spread layers out along an axis with equal gaps.")]
    async fn distribute_layers(
        &self,
        Parameters(args): Parameters<AxisArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Distribute {
                ids: layer_ids(&args.layer_ids),
                axis: args.axis,
            },
        )
    }

    /// Changes canvas dimensions or background without scaling layers.
    #[tool(
        description = "Update the canvas. Existing root layers translate only according to anchor; they never scale. Omit background to preserve it; pass null to clear it."
    )]
    async fn update_canvas(
        &self,
        Parameters(args): Parameters<UpdateCanvasArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::UpdateCanvas(UpdateCanvas {
                width: args.width,
                height: args.height,
                background: args.background,
                anchor: args.anchor,
            }),
        )
    }
    /// Snaps a layer to an edge.
    #[tool(
        description = "Move a layer so it sits against an edge of another layer, or of the canvas."
    )]
    async fn snap_layer(
        &self,
        Parameters(args): Parameters<SnapArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let target = match &args.target_layer_id {
            Some(id) => SnapTarget::Layer {
                id: LayerId::new(id.clone()),
                edge: args.edge,
            },
            None => SnapTarget::Canvas { edge: args.edge },
        };
        self.write(
            &args.write,
            Operation::SnapTo {
                id: LayerId::new(args.layer_id.clone()),
                target,
            },
        )
    }

    /// Undoes the last change.
    #[tool(
        description = "Undo the last change. The document comes back byte-identical to what \
                       it was, including across restarts."
    )]
    async fn undo(
        &self,
        Parameters(args): Parameters<WriteEnvelope>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.backend()
            .undo(&self.resolved(&args))
            .map(Json)
            .map_err(to_error)
    }

    /// Redoes the change that was last undone.
    #[tool(description = "Redo the change that was last undone.")]
    async fn redo(
        &self,
        Parameters(args): Parameters<WriteEnvelope>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.backend()
            .redo(&self.resolved(&args))
            .map(Json)
            .map_err(to_error)
    }

    /// Exports a PNG into the project.
    #[tool(
        description = "Render the project to a PNG file inside the project's exports \
                       directory and report the path. The directory is not yours to choose."
    )]
    async fn export_document(
        &self,
        Parameters(args): Parameters<ExportArgs>,
    ) -> Result<Json<ExportResult>, ErrorData> {
        let project = self.resolve_project(args.project.clone());
        self.backend()
            .export(
                project.as_deref(),
                args.scale.unwrap_or(1.0),
                args.name.as_deref(),
                args.overwrite.unwrap_or(false),
            )
            .map(Json)
            .map_err(to_error)
    }

    /// Selects the project later calls assume.
    #[tool(
        description = "Choose the project later calls act on, so they need not repeat its \
                       name. Reports the version and layer count it found."
    )]
    async fn open_project(
        &self,
        Parameters(args): Parameters<OpenProjectArgs>,
    ) -> Result<Json<OpenedProject>, ErrorData> {
        let opened = self
            .backend()
            .open_project(&args.project)
            .map_err(to_error)?;
        self.set_current_project(&args.project);
        Ok(Json(opened))
    }

    /// Makes an empty project in the workspace.
    #[tool(
        description = "Create an empty project with the canvas size you give it, and use it \
                       for later calls. Nothing else here creates a document: every other \
                       tool changes one that exists, quoting the version it read. A server \
                       started for a single project has no workspace to put one in and says so."
    )]
    async fn create_project(
        &self,
        Parameters(args): Parameters<NewProjectArgs>,
    ) -> Result<Json<ProjectSummary>, ErrorData> {
        let summary = self
            .backend()
            .create_project(
                &args.project,
                args.width,
                args.height,
                args.background.as_deref(),
                args.name.as_deref(),
            )
            .map_err(to_error)?;
        self.set_current_project(&args.project);
        Ok(Json(summary))
    }

    /// Inserts a layer tree, as the interface's paste does.
    #[tool(
        description = "Insert whole layers - groups included, children under their parents - into \
                       a project, as the editor's paste does. The layers arrive as document layer \
                       objects; ids are regenerated, assets must already be in the document, and \
                       everything lands as one transaction, so one undo restores the document. \
                       Siblings land at the position you give, shifted per layer; offsetX/offsetY \
                       move the whole tree in document units."
    )]
    async fn insert_layer_tree(
        &self,
        Parameters(args): Parameters<InsertLayerTreeArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let position = match &args.parent {
            Some(parent) => LayerPosition::In {
                parent: LayerId::new(parent.clone()),
                index: args.index,
            },
            None => LayerPosition::Root { index: args.index },
        };
        self.backend()
            .insert_layer_tree(
                &self.resolved(&args.write),
                &args.layers,
                &position,
                args.offset_x.unwrap_or(0.0),
                args.offset_y.unwrap_or(0.0),
            )
            .map(Json)
            .map_err(to_error)
    }

    /// Installs a font pack from the compiled-in manifest.
    #[tool(
        description = "Install a named pack of fonts (the manifest's `default` pack is the usual \
                       one) into the workspace font store, downloading from the pinned manifest. \
                       This is the one tool that reaches the network, and only when it is called; \
                       a failed download leaves the store exactly as it was. Needs a server that \
                       holds a workspace."
    )]
    async fn install_font_pack(
        &self,
        Parameters(args): Parameters<InstallFontPackArgs>,
    ) -> Result<Json<FontInstallReport>, ErrorData> {
        self.backend()
            .install_font_pack(&args.pack)
            .map(Json)
            .map_err(to_error)
    }

    /// Removes a font family from the workspace store.
    #[tool(
        description = "Remove a font family - every face of it - from the workspace font store. \
                       Documents that name the family stop rendering until it is installed or \
                       imported again, so check list_layers for text layers using it first. A \
                       family the store does not have is refused by name. Needs a server that \
                       holds a workspace."
    )]
    async fn remove_font_family(
        &self,
        Parameters(args): Parameters<RemoveFontFamilyArgs>,
    ) -> Result<Json<FontRemovalReport>, ErrorData> {
        self.backend()
            .remove_font_family(&args.family)
            .map(Json)
            .map_err(to_error)
    }

    /// Deletes a project.
    #[tool(
        description = "Delete a project from the workspace: directory, document, history, and \
                       assets. There is no undo. A project locked by another process is refused, \
                       never forced; one this server holds is closed on the way in."
    )]
    async fn delete_project(
        &self,
        Parameters(args): Parameters<DeleteProjectArgs>,
    ) -> Result<Json<ProjectDeleted>, ErrorData> {
        let deleted = self
            .backend()
            .delete_project(&args.project)
            .map_err(to_error)?;
        self.forget_current_project(&args.project);
        Ok(Json(deleted))
    }

    /// Renames a project.
    #[tool(
        description = "Rename a project by renaming its directory. The new name follows the same \
                       rules as create_project (letters, digits, hyphens, underscores) and must \
                       not be taken. Every later call passes the new name as `project`. A project \
                       locked by another process is refused, never forced."
    )]
    async fn rename_project(
        &self,
        Parameters(args): Parameters<RenameProjectArgs>,
    ) -> Result<Json<ProjectRenamed>, ErrorData> {
        let renamed = self
            .backend()
            .rename_project(&args.project, &args.name)
            .map_err(to_error)?;
        self.forget_current_project(&args.project);
        Ok(Json(renamed))
    }
}

fn layer_ids(raw: &[String]) -> Vec<LayerId> {
    raw.iter().map(|id| LayerId::new(id.clone())).collect()
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FillTemplateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Slot name to value, as `list_slots` reports the names.
    pub values: std::collections::BTreeMap<String, String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenderVariantsArgs {
    /// Project holding the template. Omit to use the one in use.
    #[serde(default)]
    pub project: Option<String>,
    /// One entry per variant.
    pub variants: Vec<VariantArgs>,
    /// Multiplier on the canvas size.
    #[serde(default)]
    pub scale: Option<f32>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct VariantArgs {
    /// File stem for this variant. Letters, digits, hyphens, underscores.
    pub name: String,
    /// Slot name to value. Slots left out keep the template's own content.
    #[serde(default)]
    pub values: std::collections::BTreeMap<String, String>,
}

#[tool_router(router = template_tool_router, vis = "pub(crate)")]
impl AssemblashMcp {
    /// Fills a template in place.
    #[tool(
        description = "Fill a template's named slots in the project itself, as one recorded \
                       change. Slots that point at protected layers are refused, like every \
                       other route to them. Use render_variants to produce several images \
                       without changing the template."
    )]
    async fn fill_template(
        &self,
        Parameters(args): Parameters<FillTemplateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.fill(&args.write, &args.values)
    }

    /// Renders a template once per set of values.
    #[tool(
        description = "Render a template once for each set of slot values and write the PNGs \
                       into the project's exports directory. The template is not modified, \
                       and the same values always produce the same bytes."
    )]
    async fn render_variants(
        &self,
        Parameters(args): Parameters<RenderVariantsArgs>,
    ) -> Result<Json<assemblash_server::render::RenderedVariants>, ErrorData> {
        let project = self.resolve_project(args.project.clone());
        let variants: Vec<serde_json::Value> = args
            .variants
            .iter()
            .map(|variant| serde_json::json!({ "name": variant.name, "values": variant.values }))
            .collect();
        self.variants(project.as_deref(), args.scale.unwrap_or(1.0), &variants)
    }

    /// What a template offers.
    #[tool(
        description = "List a template's named slots: what each one is called, what it fills, \
                       and whether it must be given a value."
    )]
    async fn list_slots(
        &self,
        Parameters(args): Parameters<crate::server::ProjectArgs>,
    ) -> Result<Json<crate::backend::SlotList>, ErrorData> {
        self.backend()
            .slots(self.resolve_project(args.project).as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// What style bundles a document offers.
    #[tool(
        description = "List the document's named style presets: what each one is called, what                        it is for, and exactly which properties it sets."
    )]
    async fn list_presets(
        &self,
        Parameters(args): Parameters<crate::server::ProjectArgs>,
    ) -> Result<Json<crate::backend::PresetList>, ErrorData> {
        self.backend()
            .presets(self.resolve_project(args.project).as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// Stores a named style bundle.
    #[tool(
        description = "Store a named style bundle in the document, replacing any with the same                        name. A preset sets properties — font, size, colour, alignment, line                        height, opacity, blend mode, effects — and nothing about position."
    )]
    async fn define_preset(
        &self,
        Parameters(args): Parameters<DefinePresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::DefinePreset {
                preset: assemblash_core::Preset {
                    name: args.name.clone(),
                    description: args.description.clone(),
                    properties: args.properties.clone(),
                    extra: Default::default(),
                },
            },
        )
    }

    /// Removes a named style bundle.
    #[tool(
        description = "Remove a named style bundle. Layers styled by it keep their properties:                        applying a preset sets properties rather than creating a link, so this                        cannot change any picture."
    )]
    async fn delete_preset(
        &self,
        Parameters(args): Parameters<DeletePresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::DeletePreset {
                name: args.name.clone(),
            },
        )
    }

    /// Applies a named style bundle to a layer.
    #[tool(
        description = "Apply a named style bundle to a layer. Identical to setting the same                        properties by hand — it compiles to exactly that update — so it is                        journalled, undoable, and refused on a protected layer."
    )]
    async fn apply_preset(
        &self,
        Parameters(args): Parameters<ApplyPresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::ApplyPreset {
                id: LayerId::new(args.layer_id.clone()),
                preset: args.preset.clone(),
                allow_locked: args.allow_locked.unwrap_or(false),
            },
        )
    }

    /// Declares a named opening, making the document a template.
    #[tool(
        description = "Declare a named opening on a layer, making the document a template. \
                       Refused if the name is taken, the layer is missing, the kind does not \
                       match the layer, or the layer is protected or read-only \u{2014} a slot on \
                       chrome would be an opening that always refuses when filled."
    )]
    async fn define_slot(
        &self,
        Parameters(args): Parameters<DefineSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(&args.write, Operation::DefineSlot { slot: args.slot() })
    }

    /// Changes an existing slot.
    #[tool(
        description = "Change an existing slot, by name. Faces exactly the checks a definition \
                       faces, so an update cannot produce a slot that could not have been \
                       defined. Passing a different name renames it."
    )]
    async fn update_slot(
        &self,
        Parameters(args): Parameters<UpdateSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::UpdateSlot {
                name: args.name.clone(),
                slot: args.slot.slot(),
            },
        )
    }

    /// Removes a named opening.
    #[tool(
        description = "Remove a named opening. The layer it pointed at is untouched. Note that \
                       a layer a slot offers cannot be deleted until its slots are removed."
    )]
    async fn remove_slot(
        &self,
        Parameters(args): Parameters<RemoveSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::RemoveSlot {
                name: args.name.clone(),
            },
        )
    }
}

/// The parts of a slot a caller supplies.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SlotFields {
    /// What the slot is called. Unique within the document.
    pub name: String,
    /// The layer it fills.
    pub layer_id: String,
    /// What may be supplied: `text`, `image`, or `color`. Text and colour
    /// slots fill a text layer; an image slot fills an image layer.
    #[serde(default)]
    pub kind: Option<assemblash_core::SlotKind>,
    /// What this slot is for, for whoever fills it later — including an
    /// agent, which is the case that needs it most.
    #[serde(default)]
    pub description: Option<String>,
    /// Whether a variant must supply a value for it.
    #[serde(default)]
    pub required: Option<bool>,
}

impl SlotFields {
    fn slot(&self) -> assemblash_core::Slot {
        assemblash_core::Slot {
            name: self.name.clone(),
            layer: LayerId::new(self.layer_id.clone()),
            kind: self.kind.unwrap_or_default(),
            description: self.description.clone(),
            required: self.required.unwrap_or(false),
            extra: Default::default(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefineSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub fields: SlotFields,
}

impl DefineSlotArgs {
    fn slot(&self) -> assemblash_core::Slot {
        self.fields.slot()
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which slot to change.
    pub name: String,
    /// What it should become. Its `name` may differ, which renames it.
    pub slot: SlotFields,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RemoveSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which slot to remove.
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefinePresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// What the preset is called. Replaces any existing one of that name.
    pub name: String,
    /// What it is for, for whoever chooses between presets later.
    #[serde(default)]
    pub description: Option<String>,
    /// The properties it sets. Anything left out is left alone on apply.
    pub properties: assemblash_core::PresetProperties,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DeletePresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which preset to remove.
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ApplyPresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which preset, as `list_presets` reports the names.
    pub preset: String,
    /// Which layer to restyle.
    pub layer_id: String,
    /// Apply to a locked layer.
    #[serde(default)]
    pub allow_locked: Option<bool>,
}
