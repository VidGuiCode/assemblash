//! What callers send: the typed request for each operation.
//!
//! These are the wire shapes. They are deliberately explicit — `Option` means
//! "not specified", not "null" — so that an agent updating one property
//! cannot accidentally clear the others by omitting them.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::{
    BlendMode, Clip, Color, Crop, Document, Effect, Extras, FontStyle, GroupLayer, ImageFit,
    ImageLayer, Layer, LayerKind, LineMarker, ShapeKind, ShapeLayer, Stroke, TextAlign, TextLayer,
    Transform, VerticalAlign,
};
use crate::ids::{AssetId, IdSource, LayerId};
use crate::ops::error::OpError;

/// The point of the old canvas that stays fixed when its dimensions change.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "kebab-case")]
pub enum CanvasAnchor {
    #[default]
    TopLeft,
    Top,
    TopRight,
    Left,
    Center,
    Right,
    BottomLeft,
    Bottom,
    BottomRight,
}

/// Changes canvas properties without scaling any layer.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCanvas {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub width: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub height: Option<f64>,
    /// Absent preserves the background; null clears it.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub background: Option<Option<Color>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anchor: Option<CanvasAnchor>,
}

fn deserialize_optional_nullable<'de, D, T>(deserializer: D) -> Result<Option<Option<T>>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: Deserialize<'de>,
{
    Option::<T>::deserialize(deserializer).map(Some)
}
/// Where a new layer goes.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "at", rename_all = "camelCase")]
pub enum LayerPosition {
    /// At the top level of the document.
    Root {
        /// Index in the layer list; `None` means on top of everything.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        index: Option<usize>,
    },
    /// Inside a group.
    In {
        /// The group to place it in.
        parent: LayerId,
        /// Index among the group's children; `None` means on top.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        index: Option<usize>,
    },
}

impl Default for LayerPosition {
    fn default() -> Self {
        Self::Root { index: None }
    }
}

/// The kind-specific part of a new layer.
///
/// `rename_all` on an enum renames its *variants*; the fields inside a struct
/// variant need `rename_all_fields`. Without it these three were the only
/// snake_case names in an otherwise camelCase wire format — invisible while
/// the only caller built the value in Rust, and a trap the moment the HTTP API
/// made it something a client writes by hand. The old spellings are still
/// accepted so journals written before 0.6.0 keep replaying.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum NewLayerKind {
    /// A text layer.
    Text {
        /// The text; `\n` starts a new line.
        text: String,
        /// Font family, resolved at render time against the caller's fonts.
        #[serde(alias = "font_family")]
        font_family: String,
        /// Font size in pixels.
        #[serde(alias = "font_size")]
        font_size: f64,
        /// Fill colour, or none for hollow (stroke-only) text. Absent means
        /// the pre-1.7 default of black, as it always did.
        #[serde(default = "crate::document::default_text_color")]
        color: Option<Color>,
        /// Horizontal alignment in the box.
        #[serde(default)]
        align: TextAlign,
        /// Line height as a multiple of the font size.
        #[serde(default = "default_line_height", alias = "line_height")]
        line_height: f64,
        /// Font weight, 100–900; 400 is the regular face.
        #[serde(default = "default_font_weight", alias = "font_weight")]
        font_weight: u16,
        /// Upright or italic.
        #[serde(default)]
        font_style: FontStyle,
        /// Extra space between characters, in pixels.
        #[serde(default, alias = "letter_spacing")]
        letter_spacing: f64,
        /// Glyph stroke, painted centred with `paint-order="stroke"`.
        #[serde(default)]
        stroke: Option<Stroke>,
        /// Where the block sits vertically in the box.
        #[serde(default)]
        vertical_align: VerticalAlign,
    },
    /// An image layer referencing an asset already in the document.
    Image {
        /// The asset to draw.
        asset: AssetId,
        /// How it fills its box.
        #[serde(default)]
        fit: ImageFit,
    },
    /// An empty group.
    Group,
    /// A vector graphic layer referencing an imported SVG asset.
    Svg {
        /// The asset to draw.
        asset: AssetId,
        /// How it fills its box.
        #[serde(default)]
        fit: ImageFit,
    },
    /// A rectangle, an ellipse or a line, drawn from the document.
    ///
    /// No implicit default paint: a caller that sends neither `fill` nor
    /// `stroke` gets an invisible shape, because guessing black here would
    /// make "no fill" impossible to ask for. The surfaces people actually
    /// type at — the CLI, the MCP tools, the interface — apply their own
    /// defaults on top of this.
    Shape {
        /// The geometry. A kind this build does not draw is refused here
        /// rather than stored: creating a layer nothing can render is not a
        /// document a newer build wrote, it is a mistake being made now.
        shape: ShapeKind,
        /// Interior paint, or none.
        #[serde(default)]
        fill: Option<Color>,
        /// Edge paint, or none.
        #[serde(default)]
        stroke: Option<Stroke>,
    },
}

fn default_line_height() -> f64 {
    1.2
}

fn default_font_weight() -> u16 {
    400
}

/// Add a layer to the document.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateLayer {
    /// Where it goes.
    #[serde(default)]
    pub position: LayerPosition,
    /// Its box in the parent's coordinate space.
    pub transform: Transform,
    /// Optional human-facing name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// What kind of layer it is.
    #[serde(flatten)]
    pub kind: NewLayerKind,
}

impl CreateLayer {
    pub(super) fn build(
        &self,
        ids: &mut dyn IdSource,
        document: &Document,
    ) -> Result<Layer, OpError> {
        let kind = match &self.kind {
            NewLayerKind::Text {
                text,
                font_family,
                font_size,
                color,
                align,
                line_height,
                font_weight,
                font_style,
                letter_spacing,
                stroke,
                vertical_align,
            } => LayerKind::Text(TextLayer {
                text: text.clone(),
                font_family: font_family.clone(),
                font_size: *font_size,
                color: color.clone(),
                align: *align,
                line_height: *line_height,
                font_weight: *font_weight,
                font_style: *font_style,
                letter_spacing: *letter_spacing,
                stroke: stroke.clone(),
                vertical_align: *vertical_align,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
            NewLayerKind::Image { asset, fit } => {
                // Checked here rather than left to validation so the error
                // names the asset the caller asked for.
                if !document.assets.iter().any(|a| &a.id == asset) {
                    return Err(OpError::NoSuchAsset {
                        asset: asset.clone(),
                    });
                }
                LayerKind::Image(ImageLayer {
                    asset: asset.clone(),
                    fit: *fit,
                    // Create-side crop stays out of 1.8.0 on purpose: the
                    // ladder's letter is update-side only.
                    crop: None,
                    extra: Extras::new(),
                })
            }
            NewLayerKind::Group => LayerKind::Group(GroupLayer {
                children: Vec::new(),
                extra: Extras::new(),
            }),
            NewLayerKind::Svg { asset, fit } => {
                if !document.assets.iter().any(|a| &a.id == asset) {
                    return Err(OpError::NoSuchAsset {
                        asset: asset.clone(),
                    });
                }
                LayerKind::Svg(crate::document::SvgLayer {
                    asset: asset.clone(),
                    fit: *fit,
                    extra: Extras::new(),
                })
            }
            NewLayerKind::Shape {
                shape,
                fill,
                stroke,
            } => {
                if !shape.is_rendered() {
                    return Err(OpError::UnsupportedShape {
                        id: None,
                        kind: shape.kind_name().to_owned(),
                    });
                }
                // Refused here rather than left to validation, for the same
                // reason `UnsupportedShape` is: the caller should hear the
                // grammar's own complaint — which command, which byte — not
                // a generic "the shape is wrong".
                if let ShapeKind::Path { d, .. } = shape {
                    if let Err(error) = crate::path::validate(d) {
                        return Err(OpError::InvalidPath {
                            id: None,
                            reason: error.to_string(),
                        });
                    }
                }
                LayerKind::Shape(ShapeLayer {
                    shape: shape.clone(),
                    fill: fill.clone(),
                    stroke: stroke.clone(),
                    extra: Extras::new(),
                })
            }
        };

        let mut layer = Layer::new(LayerId::generate(ids), self.transform.clone(), kind);
        layer.name = self.name.clone();
        Ok(layer)
    }
}

/// Change properties of an existing layer.
///
/// Every field is optional and means "leave alone" when absent. `name` is
/// doubly optional: `Some(None)` clears the name, `None` leaves it.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLayer {
    /// The layer to change.
    pub id: LayerId,

    /// New name, or `Some(None)` to remove it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<Option<String>>,
    /// Replace the whole transform.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub transform: Option<Transform>,
    /// New opacity.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub opacity: Option<f64>,
    /// Show or hide.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub visible: Option<bool>,
    /// Lock or unlock.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
    /// How the layer composites onto what is beneath it.
    ///
    /// A mode this build does not render is refused here, so a value that
    /// would fail at render time cannot get into a document through this
    /// build in the first place.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blend_mode: Option<BlendMode>,
    /// Replace the whole effect stack.
    ///
    /// The whole stack rather than one effect at a time: order is part of the
    /// meaning — a blurred thing desaturated is not a desaturated thing
    /// blurred — and an insert-at-index operation would be a second, subtler
    /// way of saying what this already says. Undo restores the previous stack
    /// like any other property.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub effects: Option<Vec<Effect>>,

    /// Text layers: new text.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// Text layers: new font family.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// Text layers: new font size.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    /// Text layers: new colour. Absent leaves it, `null` clears it.
    ///
    /// Doubly optional like `name` and the shape `fill`, and for the same
    /// reason: "no fill" is a real value text can have — a stroke-only layer
    /// is the hollow style — so there has to be a way to say it that is not
    /// "leave it alone".
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub color: Option<Option<Color>>,
    /// Text layers: new alignment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub align: Option<TextAlign>,
    /// Text layers: new line height.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line_height: Option<f64>,
    /// Text layers: new font weight, 100–900.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<u16>,
    /// Text layers: new font style.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_style: Option<FontStyle>,
    /// Text layers: new letter spacing, in pixels.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub letter_spacing: Option<f64>,
    /// Text layers: new vertical alignment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vertical_align: Option<VerticalAlign>,

    /// Image layers: new fit.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fit: Option<ImageFit>,
    /// Image and SVG layers: draw a different asset.
    ///
    /// The asset must already be in the document — importing is not an
    /// operation (it copies a file, which is not reversible), so swapping to
    /// something that was never imported is refused rather than half-done.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub asset: Option<AssetId>,

    /// Shape layers: new interior paint. Absent leaves it, `null` clears it.
    ///
    /// Doubly optional like `name` and the canvas background, and for the
    /// same reason: "no fill" is a real value a shape can have, so there has
    /// to be a way to say it that is not "leave it alone".
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub fill: Option<Option<Color>>,
    /// Shape and text layers: the whole stroke. Absent leaves it, `null`
    /// clears it.
    ///
    /// The whole stroke rather than colour and width separately: a width
    /// without a colour is not a stroke, and letting one be set alone would
    /// mean inventing a colour nobody asked for. On a text layer the stroke
    /// is painted centred on the glyph outline, fill first, so it never eats
    /// the letter.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub stroke: Option<Option<Stroke>>,
    /// Shape layers whose geometry is a rect: new corner radius.
    ///
    /// Not nullable: 0 is the square-cornered value, so there is nothing for
    /// `null` to mean that 0 does not already say.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub corner_radius: Option<f64>,

    /// Shape layers: replace the whole geometry.
    ///
    /// The whole [`ShapeKind`] rather than one knob of it: a rect's corner
    /// radius, a line's markers, and a path's `d` do not intersect, so a
    /// partial geometry would mean inventing defaults nobody asked for. The
    /// paint is left alone, like `transform` leaves the flips alone. A
    /// geometry this build does not draw is refused here, and a path `d`
    /// runs the grammar — the same bargain [`OpError::UnsupportedShape`]
    /// and [`OpError::InvalidPath`] strike at `create`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shape: Option<ShapeKind>,
    /// Line layers: what sits at the start of the segment.
    ///
    /// Markers are part of the Line payload, never preset-carried. On a
    /// shape that is not a line — including one this update has just
    /// replaced with a non-line — the update is refused naming the layer
    /// and the property.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker_start: Option<LineMarker>,
    /// Line layers: what sits at the end of the segment. See
    /// [`Self::marker_start`].
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker_end: Option<LineMarker>,

    /// Any layer: the whole clip. Absent leaves it, `null` clears it.
    ///
    /// Doubly optional like `color` and the shape `fill`: "no clip" is a real
    /// value a layer can have, so there has to be a way to say it that is not
    /// "leave it alone". The clip geometry is the layer's transform box, so
    /// nothing here carries coordinates.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub clip: Option<Option<Clip>>,
    /// Image layers: the source rectangle that fills the box. Absent leaves
    /// it, `null` clears it.
    ///
    /// Doubly optional, for the same reason: a whole-image layer and a cropped
    /// one are two real states, and an update has to be able to say either.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "deserialize_optional_nullable"
    )]
    pub crop: Option<Option<Crop>>,
    /// Any layer: mirror the content left-to-right about the box centre.
    ///
    /// Absent leaves it, present sets it — the `visible` and `locked` shape,
    /// because a flip has a real default and no third state.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub flip_horizontal: Option<bool>,
    /// Any layer: mirror the content top-to-bottom about the box centre.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub flip_vertical: Option<bool>,

    /// Change the layer even though it is locked.
    ///
    /// Needed to unlock a layer at all, and kept explicit so that no ordinary
    /// edit slips past a lock by accident.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub allow_locked: bool,
}

impl UpdateLayer {
    /// An update that changes nothing, to be filled in field by field.
    ///
    /// There is no `Default`: an update without a layer id is not a
    /// meaningful value, and a default id would be a footgun.
    pub fn new(id: LayerId) -> Self {
        Self {
            id,
            name: None,
            transform: None,
            opacity: None,
            visible: None,
            locked: None,
            blend_mode: None,
            effects: None,
            text: None,
            font_family: None,
            font_size: None,
            color: None,
            align: None,
            line_height: None,
            font_weight: None,
            font_style: None,
            letter_spacing: None,
            vertical_align: None,
            fit: None,
            asset: None,
            fill: None,
            stroke: None,
            corner_radius: None,
            shape: None,
            marker_start: None,
            marker_end: None,
            clip: None,
            crop: None,
            flip_horizontal: None,
            flip_vertical: None,
            allow_locked: false,
        }
    }

    pub(super) fn apply_to(&self, layer: &mut Layer) -> Result<(), OpError> {
        if let Some(name) = &self.name {
            layer.name = name.clone();
        }
        if let Some(transform) = &self.transform {
            layer.transform = transform.clone();
        }
        if let Some(opacity) = self.opacity {
            layer.opacity = opacity;
        }
        if let Some(visible) = self.visible {
            layer.visible = visible;
        }
        if let Some(locked) = self.locked {
            layer.locked = locked;
        }
        if let Some(mode) = &self.blend_mode {
            if !mode.is_rendered() {
                return Err(OpError::UnsupportedBlendMode {
                    id: layer.id.clone(),
                    mode: mode.as_str().to_owned(),
                    available: BlendMode::RENDERED
                        .iter()
                        .map(BlendMode::as_str)
                        .collect::<Vec<_>>()
                        .join(", "),
                });
            }
            layer.blend_mode = mode.clone();
        }
        if let Some(effects) = &self.effects {
            // Refused rather than stored: an effect nothing can draw is a
            // document that renders everywhere except where it matters.
            if let Some(unknown) = effects.iter().find(|effect| !effect.is_rendered()) {
                return Err(OpError::UnsupportedEffect {
                    id: layer.id.clone(),
                    effect: unknown.type_name().to_owned(),
                });
            }
            layer.effects = effects.clone();
        }

        // The clip is a layer-level property, so it applies to every kind,
        // like opacity. A clip this build cannot draw is refused on the way in
        // — both when one is being set and when the layer already carries one
        // and this update would replace or clear it: an unknown mask is
        // preserved as written, never edited into something else. A known
        // path clip has its `d` checked against the grammar here, so the
        // refusal names the command and the byte, not "the shape is wrong".
        if let Some(clip) = &self.clip {
            if let Some(existing) = &layer.clip {
                if !existing.is_rendered() {
                    return Err(OpError::UnsupportedClip {
                        id: Some(layer.id.clone()),
                        shape: existing.kind_name().to_owned(),
                    });
                }
            }
            if let Some(new_clip) = clip {
                if let Clip::Path { d, .. } = new_clip {
                    if let Err(error) = crate::path::validate(d) {
                        return Err(OpError::InvalidPath {
                            id: Some(layer.id.clone()),
                            reason: error.to_string(),
                        });
                    }
                }
                if !new_clip.is_rendered() {
                    return Err(OpError::UnsupportedClip {
                        id: Some(layer.id.clone()),
                        shape: new_clip.kind_name().to_owned(),
                    });
                }
            }
            layer.clip = clip.clone();
        }

        // Flips are transform-level, so they apply to every kind too: a mirror
        // means the same thing whatever is being mirrored.
        if let Some(value) = self.flip_horizontal {
            layer.transform.flip_horizontal = value;
        }
        if let Some(value) = self.flip_vertical {
            layer.transform.flip_vertical = value;
        }

        let kind_name = kind_name(&layer.kind);
        match &mut layer.kind {
            LayerKind::Text(text) => {
                if self.fit.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fit"));
                }
                if self.crop.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "crop"));
                }
                // The stroke is now shared with shapes; the rest of the
                // shape-only set is still refused on text.
                if self.fill.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fill"));
                }
                if self.corner_radius.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "cornerRadius"));
                }
                if self.shape.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "shape"));
                }
                if let Some(property) = [
                    self.marker_start.is_some().then_some("markerStart"),
                    self.marker_end.is_some().then_some("markerEnd"),
                ]
                .into_iter()
                .flatten()
                .next()
                {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(value) = &self.text {
                    text.text = value.clone();
                }
                if let Some(value) = &self.font_family {
                    text.font_family = value.clone();
                }
                if let Some(value) = self.font_size {
                    text.font_size = value;
                }
                if let Some(value) = &self.color {
                    text.color = value.clone();
                }
                if let Some(value) = self.align {
                    text.align = value;
                }
                if let Some(value) = self.line_height {
                    text.line_height = value;
                }
                if let Some(value) = self.font_weight {
                    text.font_weight = value;
                }
                if let Some(value) = self.font_style {
                    text.font_style = value;
                }
                if let Some(value) = self.letter_spacing {
                    text.letter_spacing = value;
                }
                if let Some(value) = &self.stroke {
                    text.stroke = value.clone();
                }
                if let Some(value) = self.vertical_align {
                    text.vertical_align = value;
                }
            }
            LayerKind::Image(image) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(property) = self.first_shape_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(value) = self.fit {
                    image.fit = value;
                }
                if let Some(asset) = &self.asset {
                    image.asset = asset.clone();
                }
                if let Some(value) = &self.crop {
                    image.crop = value.clone();
                }
            }
            LayerKind::Svg(svg) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(property) = self.first_shape_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                // No crop on a vector layer: source-pixel space is undefined
                // for an SVG without a viewBox rule to measure against.
                if self.crop.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "crop"));
                }
                if let Some(value) = self.fit {
                    svg.fit = value;
                }
                if let Some(asset) = &self.asset {
                    svg.asset = asset.clone();
                }
            }
            LayerKind::Shape(shape) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if self.fit.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fit"));
                }
                if self.crop.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "crop"));
                }
                if self.asset.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "asset"));
                }
                // A geometry this build does not know is preserved, never
                // edited: repainting a shape whose outline nothing here can
                // draw would produce a layer that looks edited and is not.
                // Refused by kind rather than by property, because the kind
                // is the thing that is wrong. An update that replaces the
                // geometry outright is the one way through: the unknown kind
                // is not being edited, it is being named goodbye to.
                if !shape.shape.is_rendered()
                    && self.shape.is_none()
                    && self.first_shape_property().is_some()
                {
                    return Err(OpError::UnsupportedShape {
                        id: Some(layer.id.clone()),
                        kind: shape.shape.kind_name().to_owned(),
                    });
                }
                if let Some(value) = &self.fill {
                    shape.fill = value.clone();
                }
                if let Some(value) = &self.stroke {
                    shape.stroke = value.clone();
                }
                // The whole geometry is replaced, exactly like `transform`
                // replaces the whole box. Validation comes before anything is
                // written, so a refusal leaves the layer as it stood.
                if let Some(new_shape) = &self.shape {
                    if !new_shape.is_rendered() {
                        return Err(OpError::UnsupportedShape {
                            id: Some(layer.id.clone()),
                            kind: new_shape.kind_name().to_owned(),
                        });
                    }
                    if let ShapeKind::Path { d, .. } = new_shape {
                        if let Err(error) = crate::path::validate(d) {
                            return Err(OpError::InvalidPath {
                                id: Some(layer.id.clone()),
                                reason: error.to_string(),
                            });
                        }
                    }
                    shape.shape = new_shape.clone();
                }
                if let Some(value) = self.corner_radius {
                    if let ShapeKind::Rect { corner_radius, .. } = &mut shape.shape {
                        *corner_radius = value;
                    } else {
                        return Err(wrong_kind(
                            &layer.id,
                            shape_kind_name(&shape.shape),
                            "cornerRadius",
                        ));
                    }
                }
                // Markers are part of the Line payload, never preset-carried
                // and never carried by another geometry: a marker sent to a
                // shape that is not a line — including one this update has
                // just replaced with a non-line — is refused naming the layer
                // and the property, the same wrong-kind shape a rect-only
                // corner radius uses.
                if let Some(value) = self.marker_start.clone() {
                    if !matches!(shape.shape, ShapeKind::Line { .. }) {
                        return Err(wrong_kind(
                            &layer.id,
                            shape_kind_name(&shape.shape),
                            "markerStart",
                        ));
                    }
                    if let ShapeKind::Line { marker_start, .. } = &mut shape.shape {
                        *marker_start = Some(value);
                    }
                }
                if let Some(value) = self.marker_end.clone() {
                    if !matches!(shape.shape, ShapeKind::Line { .. }) {
                        return Err(wrong_kind(
                            &layer.id,
                            shape_kind_name(&shape.shape),
                            "markerEnd",
                        ));
                    }
                    if let ShapeKind::Line { marker_end, .. } = &mut shape.shape {
                        *marker_end = Some(value);
                    }
                }
            }
            LayerKind::Group(_) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(property) = self.first_shape_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if self.fit.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fit"));
                }
                if self.crop.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "crop"));
                }
                if self.asset.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "asset"));
                }
            }
        }
        Ok(())
    }

    fn first_text_property(&self) -> Option<&'static str> {
        [
            self.text.is_some().then_some("text"),
            self.font_family.is_some().then_some("fontFamily"),
            self.font_size.is_some().then_some("fontSize"),
            self.color.is_some().then_some("color"),
            self.align.is_some().then_some("align"),
            self.line_height.is_some().then_some("lineHeight"),
            self.font_weight.is_some().then_some("fontWeight"),
            self.font_style.is_some().then_some("fontStyle"),
            self.letter_spacing.is_some().then_some("letterSpacing"),
            self.vertical_align.is_some().then_some("verticalAlign"),
        ]
        .into_iter()
        .flatten()
        .next()
    }

    /// The first shape-only property this update carries, if any.
    ///
    /// The companion of [`Self::first_text_property`]: on a layer that is not
    /// a shape, the refusal should name the property the caller actually
    /// sent, not the first one this code happens to look at.
    fn first_shape_property(&self) -> Option<&'static str> {
        [
            self.fill.is_some().then_some("fill"),
            self.stroke.is_some().then_some("stroke"),
            self.corner_radius.is_some().then_some("cornerRadius"),
            self.shape.is_some().then_some("shape"),
            self.marker_start.is_some().then_some("markerStart"),
            self.marker_end.is_some().then_some("markerEnd"),
        ]
        .into_iter()
        .flatten()
        .next()
    }
}

fn kind_name(kind: &LayerKind) -> &'static str {
    match kind {
        LayerKind::Text(_) => "text",
        LayerKind::Image(_) => "image",
        LayerKind::Group(_) => "group",
        LayerKind::Svg(_) => "svg",
        LayerKind::Shape(_) => "shape",
    }
}

/// The geometry to blame when a rect-only property lands on a shape that is
/// not a rect.
///
/// Borrowed for `'static` rather than taken from [`ShapeKind::kind_name`],
/// which borrows an unknown kind's name out of the raw JSON. `Other` cannot
/// reach here — an unknown geometry is refused whole, by kind, before any
/// property is looked at — so it falls back to the layer kind's own name.
fn shape_kind_name(kind: &ShapeKind) -> &'static str {
    match kind {
        ShapeKind::Rect { .. } => "rect",
        ShapeKind::Ellipse { .. } => "ellipse",
        ShapeKind::Line { .. } => "line",
        ShapeKind::Path { .. } => "path",
        ShapeKind::Other(_) => "shape",
    }
}

fn wrong_kind(id: &LayerId, actual: &'static str, property: &'static str) -> OpError {
    OpError::WrongLayerKind {
        id: id.clone(),
        actual,
        property,
    }
}
