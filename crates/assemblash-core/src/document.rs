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
