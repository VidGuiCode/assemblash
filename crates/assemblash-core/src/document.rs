//! The document model — schema version 1.
//!
//! Two properties matter more than convenience here:
//!
//! * **Round-trip fidelity.** Unknown JSON keys are captured in `extra` maps
//!   and written back untouched, so a document written by a newer build does
//!   not lose data when an older build opens it.
//! * **Reserved slots.** `blendMode`, `effects`, `constraints`, and text
//!   `runs` exist in the schema now, with defaults, even though nothing reads
//!   them yet. Adding them later would be a breaking schema change; adding
//!   them now costs nothing. Fields documented as reserved are stored as raw
//!   JSON on purpose: this build preserves them, it does not interpret them.

use std::collections::BTreeMap;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::ids::{AssetId, DocumentId, IdSource, LayerId};
use crate::SCHEMA_VERSION;

/// Unknown-but-preserved JSON keys.
///
/// Sorted, so serialization order is deterministic regardless of how the keys
/// arrived.
pub type Extras = BTreeMap<String, serde_json::Value>;

/// A whole document: canvas, imported assets, and the layer stack.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    /// Schema version of this document, independent of the release version.
    pub schema_version: u32,
    /// Stable id, `doc_<ULID>`.
    pub id: DocumentId,
    /// How many mutations this document has had.
    ///
    /// A caller that read the document at version 7 sends 7 back with its
    /// next mutation; if the document has moved on, the mutation is refused
    /// rather than silently overwriting someone else's work (PRD §10.3).
    #[serde(default)]
    pub version: u64,
    /// Human-facing name. Not an identifier.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Canvas the layers are composed on.
    pub canvas: Canvas,
    /// Assets imported into the project, referenced by image layers.
    #[serde(default)]
    pub assets: Vec<Asset>,
    /// Layers, bottom first: array order is z-order.
    #[serde(default)]
    pub layers: Vec<Layer>,
    /// Named style bundles this document offers.
    ///
    /// In the document rather than beside the workspace, so that a project
    /// directory stays portable and the same document cannot render
    /// differently depending on what else is installed next to it — see
    /// [`crate::presets`]. Additive with a default, like every field added
    /// since schema version 1.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub presets: Vec<crate::presets::Preset>,
    /// Named openings a caller may fill, making this document a template
    /// (PRD use case C). Empty for an ordinary document.
    ///
    /// Additive with a default, like every other field added since schema
    /// version 1: a build that does not know about slots preserves them, and
    /// a document without them loads here unchanged.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub slots: Vec<crate::templates::Slot>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

impl Document {
    /// Creates an empty document with the given canvas size.
    pub fn new(source: &mut dyn IdSource, width: f64, height: f64) -> Self {
        Self {
            schema_version: SCHEMA_VERSION,
            id: DocumentId::generate(source),
            version: 0,
            name: None,
            canvas: Canvas {
                width,
                height,
                background: None,
                extra: Extras::new(),
            },
            assets: Vec::new(),
            layers: Vec::new(),
            presets: Vec::new(),
            slots: Vec::new(),
            extra: Extras::new(),
        }
    }

    /// Visits every layer in the document, depth first, groups before their
    /// children.
    pub fn walk_layers(&self, visit: &mut dyn FnMut(&Layer)) {
        fn walk(layers: &[Layer], visit: &mut dyn FnMut(&Layer)) {
            for layer in layers {
                visit(layer);
                if let LayerKind::Group(group) = &layer.kind {
                    walk(&group.children, visit);
                }
            }
        }
        walk(&self.layers, visit);
    }

    /// Finds a layer anywhere in the tree by id.
    pub fn find_layer(&self, id: &LayerId) -> Option<&Layer> {
        fn find<'a>(layers: &'a [Layer], id: &LayerId) -> Option<&'a Layer> {
            for layer in layers {
                if &layer.id == id {
                    return Some(layer);
                }
                if let LayerKind::Group(group) = &layer.kind {
                    if let Some(found) = find(&group.children, id) {
                        return Some(found);
                    }
                }
            }
            None
        }
        find(&self.layers, id)
    }
}

/// The fixed-size surface layers are composed on.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Canvas {
    /// Width in pixels; must be positive and finite.
    pub width: f64,
    /// Height in pixels; must be positive and finite.
    pub height: f64,
    /// Background fill. `None` means transparent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<Color>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

/// An imported file living under the project's `assets/` directory.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Asset {
    /// Stable id, `asset_<ULID>`.
    pub id: AssetId,
    /// Path relative to the project's `assets/` directory, `/`-separated.
    pub path: String,
    /// Content hash of the file, `sha256:<hex>`. Detects silent edits.
    pub hash: String,
    /// Media type, e.g. `image/png`.
    pub media_type: String,
    /// Pixel width, when known.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub width: Option<u32>,
    /// Pixel height, when known.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub height: Option<u32>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

/// Position, size, and rotation of a layer in its parent's coordinate space.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    /// Left edge.
    pub x: f64,
    /// Top edge.
    pub y: f64,
    /// Box width; must be finite and not negative.
    pub width: f64,
    /// Box height; must be finite and not negative.
    pub height: f64,
    /// Clockwise rotation in degrees about the box centre.
    #[serde(default)]
    pub rotation: f64,
    /// Whether the content mirrors left-to-right about the box centre.
    ///
    /// Written only when set, so no document from before 1.8.0 changes a
    /// byte. A flip is a mirror, never a negative size: validation forbids
    /// negative box sizes, and a negative size would be a second way of
    /// saying where the layer's edges are.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub flip_horizontal: bool,
    /// Whether the content mirrors top-to-bottom about the box centre.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub flip_vertical: bool,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

impl Transform {
    /// A transform at the origin with the given size and no rotation.
    pub fn new(x: f64, y: f64, width: f64, height: f64) -> Self {
        Self {
            x,
            y,
            width,
            height,
            rotation: 0.0,
            flip_horizontal: false,
            flip_vertical: false,
            extra: Extras::new(),
        }
    }
}

impl Default for Transform {
    fn default() -> Self {
        Self::new(0.0, 0.0, 0.0, 0.0)
    }
}

/// One layer: the properties every layer has, plus its kind-specific payload.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Layer {
    /// Stable id, `layer_<ULID>`.
    pub id: LayerId,
    /// Human-facing name. Not an identifier.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Placement in the parent's coordinate space.
    pub transform: Transform,
    /// Opacity from 0 (invisible) to 1 (opaque).
    #[serde(default = "default_opacity")]
    pub opacity: f64,
    /// Whether the layer is rendered at all.
    #[serde(default = "default_true")]
    pub visible: bool,
    /// Whether editing tools should refuse to move this layer.
    ///
    /// The user-facing "don't let me nudge this by accident" flag. An
    /// explicit override can still change it (PRD §10.2).
    #[serde(default)]
    pub locked: bool,
    /// Whether AI adapters and agents may change this layer at all.
    ///
    /// Unlike `locked`, there is no override: a protected layer is refused
    /// for every mutation, whoever asks (PRD §10.2, MVP criterion 11).
    #[serde(default)]
    pub protected: bool,
    /// Whether the layer is inspectable but never mutable through the API.
    #[serde(default)]
    pub read_only: bool,
    /// How this layer composites with what is underneath it.
    ///
    /// Fourteen modes are drawn. `color-dodge` and `color-burn` are
    /// deliberately not among them: they are not bit-identical on every
    /// target, and a mode that breaks determinism on one machine is worse
    /// than a mode that says no. Those two, and any mode a newer build
    /// writes, round-trip as written and are refused when something tries to
    /// draw them, rather than being silently composited as `normal`.
    #[serde(default)]
    pub blend_mode: BlendMode,
    /// Adjustments applied to this layer when it is drawn, in order.
    ///
    /// **Never baked.** The document keeps the numbers and the pixels are
    /// derived from them every render, so an effect is as reversible as any
    /// other property and a layer under three effects is still the layer.
    ///
    /// Always written, even when empty, exactly as it has been since schema
    /// version 1: omitting it would change the bytes of every document that
    /// has one, for no gain.
    #[serde(default)]
    pub effects: Vec<Effect>,
    /// Reserved (layout constraints): preserved verbatim, never interpreted.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub constraints: Option<serde_json::Value>,
    /// The mask that hides everything the layer draws outside its box.
    ///
    /// The clip geometry is the layer's transform box in its parent's
    /// coordinate space, at rest: rotation and flips apply to the *clipped*
    /// result, so a shadow carried by the layer follows the clipped
    /// silhouette (the 1.8.0 composition spike measured this — the clip must
    /// sit inside the filter, not beside it). `None` draws everything, as
    /// every build before 1.8.0 did.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub clip: Option<Clip>,
    /// What kind of layer this is, and its payload. Flattened: the payload's
    /// fields sit next to the common ones, tagged by `"type"`.
    #[serde(flatten)]
    pub kind: LayerKind,
}

impl Layer {
    /// Creates a layer of the given kind with sensible defaults.
    pub fn new(id: LayerId, transform: Transform, kind: LayerKind) -> Self {
        Self {
            id,
            name: None,
            transform,
            opacity: default_opacity(),
            visible: true,
            locked: false,
            blend_mode: BlendMode::default(),
            effects: Vec::new(),
            constraints: None,
            clip: None,
            protected: false,
            read_only: false,
            kind,
        }
    }
}

fn default_opacity() -> f64 {
    1.0
}

fn default_true() -> bool {
    true
}

/// Kind-specific payload of a layer, tagged by `"type"` in JSON.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum LayerKind {
    /// A run of text in a single style.
    Text(TextLayer),
    /// An imported image.
    Image(ImageLayer),
    /// A container transforming its children as a unit.
    Group(GroupLayer),
    /// An imported vector graphic, drawn into the layer box.
    Svg(SvgLayer),
    /// A rectangle, an ellipse or a line, drawn from the document itself.
    Shape(ShapeLayer),
}

/// Text content and its single style. Per-run styling arrives in v2.0.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct TextLayer {
    /// The text. `\n` starts a new line.
    pub text: String,
    /// Font family name, resolved against the caller's font set.
    pub font_family: String,
    /// Font size in pixels; must be positive and finite.
    pub font_size: f64,
    /// Fill colour. `None` means no fill — SVG's `fill="none"`, the same
    /// bargain as a shape's. A stroke-only text layer is the hollow style.
    ///
    /// `None` serializes as `null`, never as an omitted key: a round trip
    /// through a build that omits the key has to come back as the same
    /// layer, and an absent key means the pre-1.7 default of black.
    #[serde(default = "default_text_color")]
    pub color: Option<Color>,
    /// Horizontal alignment within the layer box.
    #[serde(default)]
    pub align: TextAlign,
    /// Line height as a multiple of the font size.
    #[serde(default = "default_line_height")]
    pub line_height: f64,
    /// Font weight, 100 to 900 as CSS names them.
    ///
    /// Resolved against the caller's font set by exact face: a family whose
    /// bold face is not loaded is a typed refusal at render time, not a
    /// silent nearest match. 400 is the regular face.
    #[serde(
        default = "default_font_weight",
        skip_serializing_if = "is_default_font_weight"
    )]
    pub font_weight: u16,
    /// Upright or italic, resolved with the weight.
    #[serde(default, skip_serializing_if = "FontStyle::is_normal")]
    pub font_style: FontStyle,
    /// Extra space between characters, in pixels.
    ///
    /// Part of measurement, not just of drawing: wrapping, the text-layout
    /// endpoint and the export all add it per gap, so a line measured here is
    /// the line that renders.
    #[serde(default, skip_serializing_if = "is_zero")]
    pub letter_spacing: f64,
    /// Glyph stroke, painted centred on the outline with
    /// `paint-order="stroke"` — the fill goes down first, so a stroke never
    /// eats the letter (D5, text half). `None` means no stroke.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub stroke: Option<Stroke>,
    /// Where the text block sits vertically in the layer box.
    ///
    /// `top` is the only behaviour every earlier build had — the baseline
    /// fixed one ascent below the box top — so it is the default and existing
    /// documents render pixel-identically (D19).
    #[serde(default, skip_serializing_if = "VerticalAlign::is_top")]
    pub vertical_align: VerticalAlign,
    /// Reserved (v2.0 styled runs): preserved verbatim, never interpreted.
    #[serde(default)]
    pub runs: Vec<serde_json::Value>,
    /// Keys this build does not know about, preserved verbatim.
    ///
    /// The capture map lives on the payload rather than on [`Layer`] because
    /// serde cannot combine a flattened enum with a flattened catch-all map in
    /// the same struct. Unknown keys anywhere on the layer land here.
    #[serde(flatten)]
    pub extra: Extras,
}

pub(crate) fn default_text_color() -> Option<Color> {
    Some(Color::default())
}

fn default_font_weight() -> u16 {
    400
}

fn is_default_font_weight(weight: &u16) -> bool {
    *weight == 400
}

fn is_zero(value: &f64) -> bool {
    *value == 0.0
}

/// Whether glyphs stand upright or slant.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "kebab-case")]
pub enum FontStyle {
    /// The upright face.
    #[default]
    Normal,
    /// The italic face (an oblique stands in when the family has no true
    /// italic — the font set still keys it as italic).
    Italic,
}

impl FontStyle {
    /// Whether this is the default, which need not be written.
    pub fn is_normal(&self) -> bool {
        matches!(self, Self::Normal)
    }

    /// The name as it is written in the document.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Normal => "normal",
            Self::Italic => "italic",
        }
    }
}

/// Where the text block sits vertically in the layer box.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "kebab-case")]
pub enum VerticalAlign {
    /// The first baseline one ascent below the box top — the behaviour every
    /// build up to 1.6 had, and the default so nothing moves.
    #[default]
    Top,
    /// The block centred in the box's height.
    Middle,
    /// The block's last line resting on the box bottom.
    Bottom,
}

impl VerticalAlign {
    /// Whether this is the default, which need not be written.
    pub fn is_top(&self) -> bool {
        matches!(self, Self::Top)
    }

    /// The name as it is written in the document.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Top => "top",
            Self::Middle => "middle",
            Self::Bottom => "bottom",
        }
    }
}

fn default_line_height() -> f64 {
    1.2
}

/// A reference to an imported asset, drawn into the layer box.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ImageLayer {
    /// Id of an asset in the document's `assets` list.
    pub asset: AssetId,
    /// How the image fills its box.
    #[serde(default)]
    pub fit: ImageFit,
    /// The sub-rectangle of the source image that fills the box, in source
    /// pixels — a crop is a rectangle, not a fit mode (v1.8.0).
    ///
    /// It composes with [`ImageLayer::fit`]: the sub-rectangle is placed into
    /// the box as if it were the whole image, so `fill` stretches it and
    /// `contain`/`cover` work from its aspect. `None` uses the whole image,
    /// as every build before 1.8.0 did. Out-of-bounds rectangles clamp to the
    /// source when drawn; a crop with no intersection with the source is a
    /// typed render refusal, never zero ink.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub crop: Option<Crop>,
    /// Keys this build does not know about, preserved verbatim. See
    /// [`TextLayer::extra`].
    #[serde(flatten)]
    pub extra: Extras,
}

/// A rectangle in an image's source pixel space.
///
/// A document type of its own, not [`crate::layout::Rect`]: that one is an
/// internal `Copy` type in absolute canvas space, and a crop is none of
/// those things — it serialises, and it is relative to the asset.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Crop {
    /// Left edge in source pixels.
    pub x: f64,
    /// Top edge in source pixels.
    pub y: f64,
    /// Width in source pixels; must be positive and finite.
    pub width: f64,
    /// Height in source pixels; must be positive and finite.
    pub height: f64,
}

/// The mask shape of a layer's [`Layer::clip`], tagged by `"shape"` in JSON.
///
/// The geometry always is the layer's transform box, so the variants carry no
/// coordinates — only what the box alone does not say. [`Clip::Other`] is an
/// untagged catch-all (D21): a clip written by a newer build is preserved as
/// written, refused when an update touches it, and refused at render time —
/// the same bargain as [`ShapeKind::Other`] (and, like it, never flattened
/// into its parent, so the catch-all's reach stays with the clip).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(
    tag = "shape",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Clip {
    /// A rounded rectangle filling the transform box.
    Rect {
        /// Corner radius in document units; 0 is a square corner.
        ///
        /// Clamped to half the shorter side when it is drawn, exactly like a
        /// shape rect's radius — a large radius makes a stadium, not an
        /// error.
        #[serde(default)]
        corner_radius: f64,
    },
    /// An ellipse inscribed in the transform box — the circle avatar.
    Ellipse,
    /// A clip this build does not know, preserved as written, refused when an
    /// update touches it, and refused when something tries to draw it (D21).
    #[serde(untagged)]
    Other(serde_json::Value),
}

impl Clip {
    /// What this clip is called in the document.
    pub fn kind_name(&self) -> &str {
        match self {
            Self::Rect { .. } => "rect",
            Self::Ellipse => "ellipse",
            Self::Other(raw) => raw
                .get("shape")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("(untyped)"),
        }
    }

    /// Whether this build draws this clip rather than refusing it.
    pub fn is_rendered(&self) -> bool {
        !matches!(self, Self::Other(_))
    }
}

/// A reference to an imported SVG asset, drawn into the layer box.
///
/// Separate from [`ImageLayer`] because an SVG is vector: it scales without
/// loss, and it went through the import sanitiser (`crate::svg_import`) before
/// it was stored. Nothing in a project's `assets/` directory carries scripts
/// or external references.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SvgLayer {
    /// Id of an asset in the document's `assets` list.
    pub asset: AssetId,
    /// How the graphic fills its box.
    #[serde(default)]
    pub fit: ImageFit,
    /// Keys this build does not know about, preserved verbatim. See
    /// [`TextLayer::extra`].
    #[serde(flatten)]
    pub extra: Extras,
}

/// A group of layers, transformed as a unit.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct GroupLayer {
    /// Children, bottom first, positioned relative to the group.
    #[serde(default)]
    pub children: Vec<Layer>,
    /// Keys this build does not know about, preserved verbatim. See
    /// [`TextLayer::extra`].
    #[serde(flatten)]
    pub extra: Extras,
}

/// A primitive drawn from the document rather than from an imported file.
///
/// The transform box *is* the geometry: a rect fills it, an ellipse is
/// inscribed in it, a line runs across its middle. Nothing here carries
/// coordinates of its own, so `move`, `resize` and `rotate` mean for a shape
/// exactly what they already mean for every other layer, and layout bounds
/// stay the box (D5).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ShapeLayer {
    /// The geometry, a nested object tagged by `kind`.
    ///
    /// Nested rather than flattened on purpose. [`ShapeKind::Other`] is an
    /// untagged catch-all, and an untagged variant flattened into this struct
    /// would swallow `fill`, `stroke` and every unknown sibling key on its way
    /// past — the layer would round-trip, but the paint would have moved
    /// inside the geometry. One level of nesting keeps the catch-all's reach
    /// to the thing it is a catch-all for.
    pub shape: ShapeKind,
    /// Interior paint. `None` means no fill at all — SVG's `fill="none"`,
    /// not black.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fill: Option<Color>,
    /// Edge paint. `None` means no stroke.
    ///
    /// A shape with neither fill nor stroke is a valid document. Invisible is
    /// allowed here for the same reason `opacity: 0` is, and refusing it would
    /// mean an editor could not clear one paint before choosing the other.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub stroke: Option<Stroke>,
    /// Keys this build does not know about, preserved verbatim. See
    /// [`TextLayer::extra`].
    #[serde(flatten)]
    pub extra: Extras,
}

/// The geometry of a [`ShapeLayer`], tagged by `"kind"` in JSON.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum ShapeKind {
    /// A rectangle filling the transform box.
    Rect {
        /// Corner radius in document units; 0 is a square corner.
        ///
        /// Clamped to half the shorter side when it is drawn, so a radius
        /// larger than the box makes a stadium rather than a refusal.
        #[serde(default)]
        corner_radius: f64,
    },
    /// An ellipse inscribed in the transform box.
    Ellipse,
    /// A straight segment across the middle of the transform box, from the
    /// left edge to the right.
    ///
    /// The box *is* the line: `width` is its length, `rotation` is its angle,
    /// and `height` is layout only — nothing is drawn above or below the
    /// middle. A second endpoint in the payload would be a second way of
    /// saying where a layer is, and `move`, `resize` and `rotate` would then
    /// have to mean something different for this layer kind than for the
    /// other four (maintainer's decision, 2026-09-09).
    Line,
    /// A geometry this build does not know, preserved as written and refused
    /// when something tries to change or draw it — the same bargain as
    /// [`Effect::Other`] and [`BlendMode::Other`] (D21).
    #[serde(untagged)]
    Other(serde_json::Value),
}

impl ShapeKind {
    /// What this geometry is called in the document.
    pub fn kind_name(&self) -> &str {
        match self {
            Self::Rect { .. } => "rect",
            Self::Ellipse => "ellipse",
            Self::Line => "line",
            Self::Other(raw) => raw
                .get("kind")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("(untyped)"),
        }
    }

    /// Whether this build draws this geometry rather than refusing it.
    pub fn is_rendered(&self) -> bool {
        !matches!(self, Self::Other(_))
    }
}

/// A shape's edge paint.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Stroke {
    /// Edge colour.
    pub color: Color,
    /// Width in document units; must be finite and 0 or more.
    ///
    /// **Painted inset** on a rect and an ellipse (D5): the stroke grows
    /// inward from the transform box, so the box is the visual box and
    /// nothing that reasons about layout has to know whether a shape is
    /// stroked. A line has no interior, so its stroke is centred on the
    /// segment instead — half of it falls either side of the box's middle.
    ///
    /// One caveat, measured rather than assumed: a width below one device
    /// pixel is drawn as a *hairline* centred on the geometric edge, and a
    /// hairline occupies a whole pixel row. A 0.5-wide stroke therefore
    /// spills up to half a pixel outside the box on each side. It is
    /// deterministic and identical on every target, so it is documented here
    /// rather than refused — but at that width the box is not quite the
    /// visual box.
    pub width: f64,
}

/// One adjustment in a layer's effect stack.
///
/// Tagged by `type`, so the JSON reads as what it is. [`Effect::Other`] keeps
/// an effect written by a newer build verbatim and refuses to render it —
/// the same bargain as [`BlendMode::Other`]: never lose it, never guess at it.
///
/// The amounts are multipliers where 1 means "unchanged", which is what
/// `filter: brightness(1.2)` means everywhere else, so a number copied from a
/// CSS example does what it looks like it does.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Effect {
    /// Scales each channel. 1 is unchanged, 0 is black.
    Brightness {
        /// The multiplier.
        amount: f64,
    },
    /// Pushes each channel away from mid grey. 1 is unchanged, 0 is flat grey.
    Contrast {
        /// The multiplier.
        amount: f64,
    },
    /// Scales colourfulness. 1 is unchanged, 0 is greyscale.
    Saturation {
        /// The multiplier.
        amount: f64,
    },
    /// A Gaussian blur.
    Blur {
        /// Standard deviation, in document units. 0 does nothing.
        radius: f64,
    },
    /// Seeded monochrome noise, multiplied over the layer.
    ///
    /// The seed is part of the document, not the run: the same document
    /// produces the same grain on every machine and in every render (NFR-3).
    /// Grain from a clock or a random number generator would quietly break
    /// the one property this project is built on.
    Grain {
        /// How far the noise swings either side of unchanged, 0 to 1.
        amount: f64,
        /// The noise seed.
        seed: u32,
        /// Size of the noise features; 1 is fine grain, larger is coarser.
        #[serde(default = "default_grain_scale")]
        scale: f64,
    },
    /// A soft offset copy of the layer's alpha, drawn beneath it.
    ///
    /// A glow is this with `dx` and `dy` at 0, and Lift is this with a small
    /// offset and a soft blur. There is no second primitive for either: a
    /// centred shadow *is* a glow, and two names for one filter would be two
    /// things to keep bit-identical for no gain.
    DropShadow {
        /// Horizontal offset in document units.
        ///
        /// A fractional offset is resampled by the filter and reads slightly
        /// softer; whole numbers give the crispest edge.
        dx: f64,
        /// Vertical offset in document units. See `dx`.
        dy: f64,
        /// Standard deviation of the blur, 0 or more. 0 is a hard-edged
        /// offset copy.
        blur: f64,
        /// Shadow colour. An `#rrggbbaa` alpha becomes the flood opacity, so
        /// a shadow's strength is written where every other colour writes it.
        color: Color,
    },
    /// An effect this build does not know, preserved as written and refused
    /// when something tries to draw it.
    #[serde(untagged)]
    Other(serde_json::Value),
}

fn default_grain_scale() -> f64 {
    1.0
}

impl Effect {
    /// What this effect is called in the document.
    pub fn type_name(&self) -> &str {
        match self {
            Self::Brightness { .. } => "brightness",
            Self::Contrast { .. } => "contrast",
            Self::Saturation { .. } => "saturation",
            Self::Blur { .. } => "blur",
            Self::Grain { .. } => "grain",
            Self::DropShadow { .. } => "dropShadow",
            Self::Other(raw) => raw
                .get("type")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("(untyped)"),
        }
    }

    /// Whether this build draws this effect rather than refusing it.
    pub fn is_rendered(&self) -> bool {
        !matches!(self, Self::Other(_))
    }

    /// The example document fragment `styles` and the capability listing
    /// show for this effect. `None` for [`Effect::Other`], which this build
    /// does not render and so does not advertise.
    ///
    /// The match names every variant, so a new `Effect` fails to compile
    /// until it is given a line here — the same guarantee
    /// [`BlendMode::RENDERED`] gives the blend-mode half of the listing.
    pub fn styles_example(&self) -> Option<&'static str> {
        match self {
            Self::Brightness { .. } => Some(r#"{"type":"brightness","amount":1.2}"#),
            Self::Contrast { .. } => Some(r#"{"type":"contrast","amount":1.4}"#),
            Self::Saturation { .. } => Some(r#"{"type":"saturation","amount":0}"#),
            Self::Blur { .. } => Some(r#"{"type":"blur","radius":3}"#),
            Self::Grain { .. } => Some(r#"{"type":"grain","amount":0.2,"seed":7,"scale":1}"#),
            Self::DropShadow { .. } => {
                Some(r##"{"type":"dropShadow","dx":0,"dy":6,"blur":12,"color":"#00000055"}"##)
            }
            Self::Other(_) => None,
        }
    }

    /// The short notes that accompany the example — where the `dropShadow`
    /// fields (`dx`, `dy`, `blur`, `color`), the dx/dy-at-0 glow and the
    /// `#rrggbbaa` flood opacity are documented for discovery.
    pub fn styles_notes(&self) -> &'static [&'static str] {
        match self {
            Self::Brightness { .. } => &["1 is unchanged"],
            Self::Contrast { .. } => &["1 is unchanged"],
            Self::Saturation { .. } => &["1 is unchanged, 0 is greyscale"],
            Self::Blur { .. } => &["0 is unchanged"],
            Self::Grain { .. } => &["seeded, so the same document grains the same way"],
            Self::DropShadow { .. } => &[
                "fields dx, dy, blur, color; dx/dy at 0 is a glow,",
                "#rrggbbaa alpha sets flood opacity",
            ],
            Self::Other(_) => &[],
        }
    }

    /// The line `assemblash styles` prints for this effect: the example and
    /// its notes laid out in the listing's two-column shape.
    pub fn styles_line(&self) -> Option<String> {
        let example = self.styles_example()?;
        let notes = self.styles_notes();
        let mut line = format!("  {example}");
        match notes.split_first() {
            None => {}
            Some((first, rest)) => {
                if example.len() <= 38 {
                    // The note column starts at character 40.
                    line.push_str(&" ".repeat(40 - 2 - example.len()));
                    line.push_str(first);
                } else {
                    line.push('\n');
                    line.push_str(&" ".repeat(39));
                    line.push_str(first);
                }
                for note in rest {
                    line.push('\n');
                    line.push_str(&" ".repeat(39));
                    line.push_str(note);
                }
            }
        }
        Some(line)
    }

    /// One rendered instance per effect variant, in `styles` order — the
    /// listing the CLI's `styles` command iterates, so discovery cannot
    /// drift from this enum the way it did in 1.6.0, where `dropShadow`
    /// rendered but was never advertised.
    pub fn rendered_examples() -> Vec<Self> {
        vec![
            Self::Brightness { amount: 1.2 },
            Self::Contrast { amount: 1.4 },
            Self::Saturation { amount: 0.0 },
            Self::Blur { radius: 3.0 },
            Self::Grain {
                amount: 0.2,
                seed: 7,
                scale: 1.0,
            },
            Self::DropShadow {
                dx: 0.0,
                dy: 6.0,
                blur: 12.0,
                color: Color::new("#00000055"),
            },
        ]
    }
}

/// How a layer composites onto what is beneath it.
///
/// The whole CSS separable-and-non-separable set, every one of which was
/// checked to rasterize before it was named here — a mode that only
/// round-trips would be a promise the pixels do not keep.
///
/// [`BlendMode::Other`] is what a mode written by some newer build becomes:
/// preserved verbatim, because losing it would mean a document came back
/// damaged, but **refused at render time** rather than quietly composited as
/// `normal`. Silently drawing the wrong thing is the worse failure: it looks
/// like it worked.
#[derive(Debug, Clone, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "kebab-case")]
pub enum BlendMode {
    /// Plain source-over compositing.
    #[default]
    Normal,
    /// Darkens: multiplies the two colours.
    Multiply,
    /// Lightens: the inverse of multiplying the inverses.
    Screen,
    /// Multiplies or screens, depending on the backdrop.
    Overlay,
    /// Keeps the darker of the two.
    Darken,
    /// Keeps the lighter of the two.
    Lighten,
    /// Brightens the backdrop to reflect the source.
    ColorDodge,
    /// Darkens the backdrop to reflect the source.
    ColorBurn,
    /// `Overlay` with the layers swapped.
    HardLight,
    /// A softer `HardLight`.
    SoftLight,
    /// The absolute difference of the two.
    Difference,
    /// Like `Difference`, with less contrast.
    Exclusion,
    /// The source's hue, the backdrop's saturation and luminosity.
    Hue,
    /// The source's saturation, the backdrop's hue and luminosity.
    Saturation,
    /// The source's hue and saturation, the backdrop's luminosity.
    Color,
    /// The source's luminosity, the backdrop's hue and saturation.
    Luminosity,
    /// A mode this build does not render, preserved as written and refused
    /// when something tries to draw it.
    #[serde(untagged)]
    Other(String),
}

impl BlendMode {
    /// Every mode this build renders, in a stable order.
    ///
    /// One list, used by the renderer, the operation layer's validation, and
    /// the interface's picker — so "what can I set" and "what will draw"
    /// cannot drift apart.
    ///
    /// **`color-dodge` and `color-burn` are deliberately absent.** They
    /// rasterize, and they look right; they are not *bit-identical across
    /// targets*, which is a different and stricter question. Both are built on
    /// a division that saturates near zero, and the x86_64 macOS runner
    /// produced different bytes from the other five targets for the same
    /// document and fonts. NFR-1 — same document, same fonts, same pixels
    /// everywhere — is the promise the rest of this engine is built on, and a
    /// mode that quietly breaks it on one machine is worse than a mode that
    /// says no. They round-trip like any other value and are refused when
    /// something tries to draw them, exactly like a mode from a future build.
    pub const RENDERED: &'static [Self] = &[
        Self::Normal,
        Self::Multiply,
        Self::Screen,
        Self::Overlay,
        Self::Darken,
        Self::Lighten,
        Self::HardLight,
        Self::SoftLight,
        Self::Difference,
        Self::Exclusion,
        Self::Hue,
        Self::Saturation,
        Self::Color,
        Self::Luminosity,
    ];

    /// Whether this build composites with this mode rather than refusing it.
    pub fn is_rendered(&self) -> bool {
        Self::RENDERED.contains(self)
    }

    /// Whether this mode needs a `mix-blend-mode` in the output at all.
    ///
    /// `normal` is the default everywhere, so emitting it would only make
    /// every existing document's SVG longer.
    pub fn is_default(&self) -> bool {
        matches!(self, Self::Normal)
    }

    /// The mode as it is written in the document, and in CSS.
    pub fn as_str(&self) -> &str {
        match self {
            Self::Normal => "normal",
            Self::Multiply => "multiply",
            Self::Screen => "screen",
            Self::Overlay => "overlay",
            Self::Darken => "darken",
            Self::Lighten => "lighten",
            Self::ColorDodge => "color-dodge",
            Self::ColorBurn => "color-burn",
            Self::HardLight => "hard-light",
            Self::SoftLight => "soft-light",
            Self::Difference => "difference",
            Self::Exclusion => "exclusion",
            Self::Hue => "hue",
            Self::Saturation => "saturation",
            Self::Color => "color",
            Self::Luminosity => "luminosity",
            Self::Other(raw) => raw,
        }
    }
}

/// Horizontal text alignment inside the layer box.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum TextAlign {
    /// Aligned to the left edge.
    #[default]
    Left,
    /// Centred horizontally.
    Center,
    /// Aligned to the right edge.
    Right,
}

/// How an image is scaled into its box.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum ImageFit {
    /// Stretch to the box, ignoring aspect ratio.
    #[default]
    Fill,
    /// Scale down to fit inside the box, keeping aspect ratio.
    Contain,
    /// Scale to cover the box, keeping aspect ratio, cropping the overflow.
    Cover,
}

/// An sRGB colour, `#rrggbb` or `#rrggbbaa`.
///
/// Stored as written so a document round-trips exactly; validation checks the
/// shape and [`Color::to_rgba`] parses it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(transparent)]
pub struct Color(String);

impl Color {
    /// Wraps a colour string without checking it.
    pub fn new(raw: impl Into<String>) -> Self {
        Self(raw.into())
    }

    /// The colour as written.
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Parses the colour into 8-bit RGBA components, or `None` if malformed.
    pub fn to_rgba(&self) -> Option<[u8; 4]> {
        let hex = self.0.strip_prefix('#')?;
        if !hex.bytes().all(|b| b.is_ascii_hexdigit()) {
            return None;
        }
        let byte = |i: usize| u8::from_str_radix(hex.get(i..i + 2)?, 16).ok();
        match hex.len() {
            6 => Some([byte(0)?, byte(2)?, byte(4)?, 255]),
            8 => Some([byte(0)?, byte(2)?, byte(4)?, byte(6)?]),
            _ => None,
        }
    }

    /// Whether the colour has a shape this build understands.
    pub fn is_valid(&self) -> bool {
        self.to_rgba().is_some()
    }
}

impl Default for Color {
    fn default() -> Self {
        Self::new("#000000")
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::panic)]

    use super::*;
    use crate::ids::SequentialIdSource;

    fn text_layer(id: &str) -> Layer {
        Layer::new(
            LayerId::new(id),
            Transform::new(0.0, 0.0, 100.0, 20.0),
            LayerKind::Text(TextLayer {
                text: "hello".into(),
                font_family: "Inter".into(),
                font_size: 16.0,
                color: Some(Color::default()),
                align: TextAlign::Left,
                line_height: 1.2,
                font_weight: 400,
                font_style: FontStyle::Normal,
                letter_spacing: 0.0,
                stroke: None,
                vertical_align: VerticalAlign::Top,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        )
    }

    #[test]
    fn new_document_has_current_schema_version() {
        let doc = Document::new(&mut SequentialIdSource::new(), 800.0, 600.0);
        assert_eq!(doc.schema_version, SCHEMA_VERSION);
        assert_eq!(doc.id.as_str(), "doc_00000000000000000000000001");
    }

    #[test]
    fn layer_kind_is_tagged_by_type() {
        let json = serde_json::to_value(text_layer("layer_1")).unwrap();
        assert_eq!(json["type"], "text");
        assert_eq!(json["text"], "hello");
        // Reserved slots are present, not omitted.
        assert_eq!(json["blendMode"], "normal");
        assert!(json["effects"].is_array());
        assert!(json["runs"].is_array());
    }

    #[test]
    fn unknown_keys_survive_a_round_trip() {
        let json = serde_json::json!({
            "schemaVersion": 1,
            "id": "doc_1",
            "canvas": { "width": 10.0, "height": 10.0, "futureField": [1, 2] },
            "assets": [],
            "layers": [{
                "id": "layer_1",
                "transform": { "x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0 },
                "type": "text",
                "text": "hi",
                "fontFamily": "Inter",
                "fontSize": 12.0,
                "somethingNewer": { "nested": true }
            }],
            "topLevelUnknown": "keep me"
        });

        let doc: Document = serde_json::from_value(json).unwrap();
        let back = serde_json::to_value(&doc).unwrap();

        assert_eq!(back["topLevelUnknown"], "keep me");
        assert_eq!(back["canvas"]["futureField"], serde_json::json!([1, 2]));
        assert_eq!(back["layers"][0]["somethingNewer"]["nested"], true);
    }

    #[test]
    fn find_layer_searches_inside_groups() {
        let mut doc = Document::new(&mut SequentialIdSource::new(), 10.0, 10.0);
        let group = Layer::new(
            LayerId::new("layer_group"),
            Transform::default(),
            LayerKind::Group(GroupLayer {
                children: vec![text_layer("layer_child")],
                extra: Extras::new(),
            }),
        );
        doc.layers.push(group);

        assert!(doc.find_layer(&LayerId::new("layer_child")).is_some());
        assert!(doc.find_layer(&LayerId::new("layer_missing")).is_none());

        let mut seen = 0;
        doc.walk_layers(&mut |_| seen += 1);
        assert_eq!(seen, 2);
    }

    #[test]
    fn a_shape_layer_round_trips_with_every_field_set() {
        let mut layer = Layer::new(
            LayerId::new("layer_shape"),
            Transform::new(1.5, 2.5, 60.0, 40.0),
            LayerKind::Shape(ShapeLayer {
                shape: ShapeKind::Rect { corner_radius: 8.0 },
                fill: Some(Color::new("#3366cc")),
                stroke: Some(Stroke {
                    color: Color::new("#112233"),
                    width: 3.0,
                }),
                extra: Extras::new(),
            }),
        );
        layer.effects = vec![Effect::DropShadow {
            dx: 4.0,
            dy: 4.0,
            blur: 1.5,
            color: Color::new("#00000080"),
        }];

        let json = serde_json::to_value(&layer).unwrap();
        assert_eq!(json["type"], "shape");
        assert_eq!(json["shape"]["kind"], "rect");
        assert_eq!(json["shape"]["cornerRadius"], 8.0);
        assert_eq!(json["fill"], "#3366cc");
        assert_eq!(json["stroke"]["color"], "#112233");
        assert_eq!(json["stroke"]["width"], 3.0);
        assert_eq!(json["effects"][0]["type"], "dropShadow");

        let back: Layer = serde_json::from_value(json).unwrap();
        assert_eq!(back, layer);
    }

    #[test]
    fn a_shape_without_paint_omits_both_keys() {
        let layer = Layer::new(
            LayerId::new("layer_shape"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Shape(ShapeLayer {
                shape: ShapeKind::Ellipse,
                fill: None,
                stroke: None,
                extra: Extras::new(),
            }),
        );
        let json = serde_json::to_value(&layer).unwrap();
        assert_eq!(json["shape"], serde_json::json!({ "kind": "ellipse" }));
        assert!(json.get("fill").is_none(), "{json}");
        assert!(json.get("stroke").is_none(), "{json}");
    }

    #[test]
    fn an_unknown_shape_kind_comes_back_byte_identical() {
        // The reason `shape` is a nested object rather than a flattened one:
        // an untagged catch-all next to `fill` and `stroke` would swallow
        // them, and the layer would round-trip with the paint in the wrong
        // place. A sibling key this build has never heard of has to survive
        // alongside it.
        let json = serde_json::json!({
            "id": "layer_1",
            "transform": { "x": 0.0, "y": 0.0, "width": 4.0, "height": 4.0, "rotation": 0.0 },
            "opacity": 1.0,
            "visible": true,
            "locked": false,
            "protected": false,
            "readOnly": false,
            "blendMode": "normal",
            "effects": [],
            "type": "shape",
            "shape": { "kind": "star", "points": 5, "innerRadius": 0.5 },
            "fill": "#ff0000",
            "stroke": { "color": "#00ff00", "width": 2.0 },
            "somethingNewer": { "nested": true }
        });

        let layer: Layer = serde_json::from_value(json.clone()).unwrap();
        let LayerKind::Shape(shape) = &layer.kind else {
            panic!("expected a shape layer, got {:?}", layer.kind);
        };
        assert!(!shape.shape.is_rendered());
        assert_eq!(shape.shape.kind_name(), "star");
        assert_eq!(shape.fill, Some(Color::new("#ff0000")));
        assert_eq!(shape.extra["somethingNewer"]["nested"], true);

        assert_eq!(serde_json::to_value(&layer).unwrap(), json);
    }

    #[test]
    fn shape_kinds_and_the_shadow_name_themselves() {
        assert_eq!(ShapeKind::Rect { corner_radius: 0.0 }.kind_name(), "rect");
        assert_eq!(ShapeKind::Ellipse.kind_name(), "ellipse");
        assert_eq!(ShapeKind::Line.kind_name(), "line");
        assert!(ShapeKind::Line.is_rendered());
        assert_eq!(
            ShapeKind::Other(serde_json::json!({ "notKind": 1 })).kind_name(),
            "(untyped)"
        );
        assert_eq!(
            Effect::DropShadow {
                dx: 0.0,
                dy: 0.0,
                blur: 4.0,
                color: Color::default(),
            }
            .type_name(),
            "dropShadow"
        );
    }

    #[test]
    fn colors_parse_to_rgba() {
        assert_eq!(Color::new("#ff8000").to_rgba(), Some([255, 128, 0, 255]));
        assert_eq!(Color::new("#00000080").to_rgba(), Some([0, 0, 0, 128]));
        assert_eq!(Color::new("#fff").to_rgba(), None);
        assert_eq!(Color::new("ff8000").to_rgba(), None);
        assert_eq!(Color::new("#gggggg").to_rgba(), None);
    }
}
