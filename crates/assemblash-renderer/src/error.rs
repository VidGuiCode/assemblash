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

    /// A text layer asks for a font family the caller did not provide.
    #[error("layer {layer}: font family {family:?} is not available")]
    MissingFont {
        /// The layer at fault.
        layer: LayerId,
        /// The family it asked for.
        family: String,
    },

    /// An image layer's asset has no href.
    #[error("layer {layer}: asset {asset} was not resolved to a source")]
    UnresolvedAsset {
        /// The layer at fault.
        layer: LayerId,
        /// The asset it referenced.
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
