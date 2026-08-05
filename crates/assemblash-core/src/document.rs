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
    /// Reserved (v0.5): only `normal` is rendered today; other values
    /// round-trip but do not yet change output.
    #[serde(default)]
    pub blend_mode: BlendMode,
    /// Reserved (v1.x effect stack): preserved verbatim, never interpreted.
    #[serde(default)]
    pub effects: Vec<serde_json::Value>,
    /// Reserved (layout constraints): preserved verbatim, never interpreted.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub constraints: Option<serde_json::Value>,
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
    /// Fill colour.
    #[serde(default)]
    pub color: Color,
    /// Horizontal alignment within the layer box.
    #[serde(default)]
    pub align: TextAlign,
    /// Line height as a multiple of the font size.
    #[serde(default = "default_line_height")]
    pub line_height: f64,
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
    /// Keys this build does not know about, preserved verbatim. See
    /// [`TextLayer::extra`].
    #[serde(flatten)]
    pub extra: Extras,
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

/// How a layer composites onto what is beneath it.
///
/// `normal`, `multiply`, and `screen` are rendered. The remaining CSS blend
/// modes arrive in v1.x; until then a document that names one keeps the name
/// verbatim — [`BlendMode::Other`] — and renders as `Normal`. Losing the value
/// would mean a document written by a newer build came back damaged, which is
/// the one thing the schema's round-trip promise rules out.
#[derive(Debug, Clone, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum BlendMode {
    /// Plain source-over compositing.
    #[default]
    Normal,
    /// Darkens: multiplies the two colours.
    Multiply,
    /// Lightens: the inverse of multiplying the inverses.
    Screen,
    /// A mode this build does not render, preserved as written.
    #[serde(untagged)]
    Other(String),
}

impl BlendMode {
    /// Whether this build composites with this mode rather than ignoring it.
    pub fn is_rendered(&self) -> bool {
        matches!(self, Self::Normal | Self::Multiply | Self::Screen)
    }

    /// The mode as it is written in the document.
    pub fn as_str(&self) -> &str {
        match self {
            Self::Normal => "normal",
            Self::Multiply => "multiply",
            Self::Screen => "screen",
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
    #![allow(clippy::unwrap_used)]

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
                color: Color::default(),
                align: TextAlign::Left,
                line_height: 1.2,
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
    fn colors_parse_to_rgba() {
        assert_eq!(Color::new("#ff8000").to_rgba(), Some([255, 128, 0, 255]));
        assert_eq!(Color::new("#00000080").to_rgba(), Some([0, 0, 0, 128]));
        assert_eq!(Color::new("#fff").to_rgba(), None);
        assert_eq!(Color::new("ff8000").to_rgba(), None);
        assert_eq!(Color::new("#gggggg").to_rgba(), None);
    }
}
