//! Rendering errors.
//!
//! A render either produces the picture the document describes or says
//! precisely what stopped it. It never substitutes a fallback font or a
//! placeholder image: silently rendering something else would break the
//! promise that the document is what you get.

use assemblash_core::ids::{AssetId, LayerId};
use assemblash_core::ValidationErrors;

/// Something that stopped a render.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum RenderError {
    /// The document is not valid, so there is nothing well-defined to draw.
    #[error("cannot render an invalid document: {0}")]
    InvalidDocument(#[from] ValidationErrors),

    /// A text layer asks for a font face the caller did not provide — a
    /// family with no loaded face at that weight and style.
    #[error("layer {layer}: font {family:?} with weight {weight} {style} is not available")]
    MissingFont {
        /// The layer at fault.
        layer: LayerId,
        /// The family it asked for.
        family: String,
        /// The weight it asked for, as CSS names weights.
        weight: u16,
        /// The style it asked for, `normal` or `italic`.
        style: &'static str,
    },

    /// An image layer's asset has no href.
    #[error("layer {layer}: asset {asset} was not resolved to a source")]
    UnresolvedAsset {
        /// The layer at fault.
        layer: LayerId,
        /// The asset it referenced.
        asset: AssetId,
    },

    /// A layer asks to composite with a mode this build does not render.
    ///
    /// Refused rather than composited as `normal`. A document written by a
    /// newer build keeps its mode when it is loaded and saved here — that is
    /// the round-trip promise — but drawing it as something else would produce
    /// a picture that looks finished and is wrong, which is worse than not
    /// producing one.
    #[error("layer {layer}: blend mode {mode:?} is not one this build renders")]
    UnsupportedBlendMode {
        /// The layer at fault.
        layer: LayerId,
        /// The mode it asked for.
        mode: String,
    },

    /// A layer asks for an effect this build does not render.
    ///
    /// Same bargain as an unknown blend mode: preserved on the way through,
    /// refused when something tries to draw it.
    #[error("layer {layer}: effect {effect:?} is not one this build renders")]
    UnsupportedEffect {
        /// The layer at fault.
        layer: LayerId,
        /// The effect type it asked for.
        effect: String,
    },

    /// A layer asks for a shape geometry this build does not draw.
    ///
    /// Same bargain as an unknown effect: preserved on the way through,
    /// refused when something tries to draw it.
    #[error("layer {layer}: shape kind {kind:?} is not one this build draws")]
    UnsupportedShape {
        /// The layer at fault.
        layer: LayerId,
        /// The shape kind it asked for.
        kind: String,
    },

    /// A layer asks for a clip shape this build does not draw.
    ///
    /// Same bargain as an unknown shape: the clip is preserved in the
    /// document, and refused when something tries to draw it. Drawing the
    /// layer unmasked instead would change which pixels a document shows
    /// without saying so.
    #[error("layer {layer}: clip shape {shape:?} is not one this build draws")]
    UnsupportedClip {
        /// The layer at fault.
        layer: LayerId,
        /// The clip shape it asked for.
        shape: String,
    },

    /// A clip on a box that has no area.
    ///
    /// Validation allows a zero-width or zero-height box, and a clip of it
    /// would draw nothing while reporting success. Refused typed instead,
    /// because an empty export that exits zero is the failure this engine
    /// exists not to make.
    #[error(
        "layer {layer}: a clip on a {width}x{height} box would draw nothing; \
         give the layer a positive width and height"
    )]
    DegenerateClip {
        /// The layer at fault.
        layer: LayerId,
        /// The box width.
        width: f64,
        /// The box height.
        height: f64,
    },

    /// A crop rectangle that shares no area with the source image.
    ///
    /// The crop is clamped to the source, so this is the case where clamping
    /// leaves nothing at all. Refused typed rather than drawn as an empty box.
    #[error(
        "layer {layer}: the crop {x},{y} {width}x{height} is outside the {source_width}x{source_height} source"
    )]
    CropOutsideSource {
        /// The layer at fault.
        layer: LayerId,
        /// Crop left edge.
        x: f64,
        /// Crop top edge.
        y: f64,
        /// Crop width.
        width: f64,
        /// Crop height.
        height: f64,
        /// Source width.
        source_width: u32,
        /// Source height.
        source_height: u32,
    },

    /// A crop was given for an asset that records no pixel size.
    ///
    /// A crop is a rectangle in the source's own pixels, so without the
    /// source's size the numbers mean nothing. The operation layer refuses to
    /// set such a crop; this catches a document written by something else.
    #[error(
        "layer {layer}: asset {asset} has no recorded width and height, so a crop cannot be placed"
    )]
    CropWithoutSourceSize {
        /// The layer at fault.
        layer: LayerId,
        /// The asset whose size is unknown.
        asset: AssetId,
    },

    /// A colour that validation would have rejected reached the renderer.
    #[error("invalid color {0}")]
    InvalidColor(String),

    /// A font file could not be read.
    #[error("reading font {path}: {source}")]
    FontFile {
        /// File involved.
        path: std::path::PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },

    /// An imported SVG asset draws text that no loaded font can draw.
    ///
    /// Fonts are loaded for the families **text layers** name, never for the
    /// ones an imported asset names, so a `<text>` inside an SVG asset used to
    /// draw as nothing while the export exited successfully — silent data loss
    /// that depended on which surface had been used to render (DEF-2). Loading
    /// the families an asset names is a separate change; until it lands, the
    /// honest answer is to stop rather than write a picture with a hole in it.
    ///
    /// Two sentences, because there are two different things to do about it.
    /// A named family that nothing loaded can be installed or named on a text
    /// layer. A `<text>` that names no family at all — or only a generic role
    /// like `sans-serif` — has nothing to install: the store is keyed by the
    /// family name a face declares and never holds the renderer's fallback, so
    /// that text draws nothing no matter what is loaded, and the caller has to
    /// name a family or outline the text.
    #[error("{}", svg_asset_text_message(.asset, .family.as_deref()))]
    SvgAssetTextWithoutFont {
        /// The asset at fault: its path inside the project, or its id when the
        /// document does not record the asset.
        asset: String,
        /// The first family it asked for that nothing loaded, when it named
        /// one at all. `None` when that `<text>` names no family, or only
        /// generic ones — there is nothing to install for it.
        family: Option<String>,
    },

    /// The SVG handed to the rasterizer could not be parsed.
    #[error("the SVG could not be parsed: {0}")]
    MalformedSvg(String),

    /// A render scale that is zero, negative, or not a number.
    #[error("render scale must be a positive finite number, got {0}")]
    InvalidScale(f32),

    /// The requested pixel size cannot be allocated.
    #[error("cannot rasterize {width}x{height} pixels")]
    CanvasTooLarge {
        /// Requested width.
        width: u32,
        /// Requested height.
        height: u32,
    },

    /// The PNG encoder or decoder refused the data.
    #[error("PNG encoding failed: {0}")]
    PngEncoding(String),
}

/// The two sentences [`RenderError::SvgAssetTextWithoutFont`] says.
///
/// A named family is something the caller can go and load; a `<text>` that
/// names none is something the caller has to change in the asset. Telling a
/// person to "add the family" when there is no family in the file would send
/// them looking for a name that is not there.
fn svg_asset_text_message(asset: &str, family: Option<&str>) -> String {
    match family {
        Some(family) => format!(
            "SVG asset {asset:?} draws text but no font is loaded for {family:?}; \
             add the family to the document's fonts or outline the text before importing"
        ),
        None => format!(
            "SVG asset {asset:?} draws text that names no font family; \
             name one the document loads or outline the text before importing"
        ),
    }
}
