//! What callers send: the typed request for each operation.
//!
//! These are the wire shapes. They are deliberately explicit — `Option` means
//! "not specified", not "null" — so that an agent updating one property
//! cannot accidentally clear the others by omitting them.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::{
    Color, Document, Extras, GroupLayer, ImageFit, ImageLayer, Layer, LayerKind, TextAlign,
    TextLayer, Transform,
};
use crate::ids::{AssetId, IdSource, LayerId};
use crate::ops::error::OpError;

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
        /// Fill colour.
        #[serde(default)]
        color: Color,
        /// Horizontal alignment in the box.
        #[serde(default)]
        align: TextAlign,
        /// Line height as a multiple of the font size.
        #[serde(default = "default_line_height", alias = "line_height")]
        line_height: f64,
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
}

fn default_line_height() -> f64 {
    1.2
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
            } => LayerKind::Text(TextLayer {
                text: text.clone(),
                font_family: font_family.clone(),
                font_size: *font_size,
                color: color.clone(),
                align: *align,
                line_height: *line_height,
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

    /// Text layers: new text.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// Text layers: new font family.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// Text layers: new font size.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    /// Text layers: new colour.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,
    /// Text layers: new alignment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub align: Option<TextAlign>,
    /// Text layers: new line height.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line_height: Option<f64>,

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
            text: None,
            font_family: None,
            font_size: None,
            color: None,
            align: None,
            line_height: None,
            fit: None,
            asset: None,
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

        let kind_name = kind_name(&layer.kind);
        match &mut layer.kind {
            LayerKind::Text(text) => {
                if self.fit.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fit"));
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
            }
            LayerKind::Image(image) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(value) = self.fit {
                    image.fit = value;
                }
                if let Some(asset) = &self.asset {
                    image.asset = asset.clone();
                }
            }
            LayerKind::Svg(svg) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if let Some(value) = self.fit {
                    svg.fit = value;
                }
                if let Some(asset) = &self.asset {
                    svg.asset = asset.clone();
                }
            }
            LayerKind::Group(_) => {
                if let Some(property) = self.first_text_property() {
                    return Err(wrong_kind(&layer.id, kind_name, property));
                }
                if self.fit.is_some() {
                    return Err(wrong_kind(&layer.id, kind_name, "fit"));
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
    }
}

fn wrong_kind(id: &LayerId, actual: &'static str, property: &'static str) -> OpError {
    OpError::WrongLayerKind {
        id: id.clone(),
        actual,
        property,
    }
}
