//! Assemblash rendering: document to SVG (pure), SVG to PNG (rasterized).
//!
//! The document-to-SVG step performs no I/O; fonts and assets are resolved by
//! the caller. That purity is what makes deterministic output testable
//! (NFR-1).

pub mod error;
pub mod fonts;
pub mod raster;
pub mod svg;

pub use error::RenderError;
pub use fonts::FontSet;
pub use raster::{document_to_png, pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata};
pub use svg::{doc_to_svg, AssetHrefs};

/// Version of the rendering pipeline, recorded in exported image metadata
/// (FR-11) so a rendered file can be traced back to the code that produced it.
pub const RENDERER_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renderer_version_is_not_empty() {
        assert!(!RENDERER_VERSION.is_empty());
    }
}
