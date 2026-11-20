//! Print proofing: three warnings about a document meant for print.
//!
//! The warnings use the same channel as the other export warnings. They say
//! something about the document, not about the file format, so a PNG export
//! reports them too. They come only from a document that has print geometry:
//! `canvas.bleed` or `canvas.margins`. A document without either field gets
//! the same warnings as before these were added.
//!
//! The canvas is the trim box. Bleed goes outward from its edges and margins
//! go inward. Every comparison uses the six decimal places the SVG writer
//! rounds to, so the answer is the same on all six released targets.

use assemblash_core::document::{ImageFit, Insets, LayerKind};
use assemblash_core::layout::{layer_bounds, Rect};
use assemblash_core::{Document, Layer};

use crate::svg::number;
use crate::warnings::ExportWarning;

/// An image has fewer source pixels than the output pixels it covers.
pub const ASSET_BELOW_TARGET_RESOLUTION: &str = "assetBelowTargetResolution";

/// Content crosses into the margin area, outside the safe area.
pub const CONTENT_OUTSIDE_MARGINS: &str = "contentOutsideMargins";

/// Content goes to or past a trim edge but stops before the bleed edge.
pub const CONTENT_INSIDE_BLEED: &str = "contentInsideBleed";

/// The print-proofing warnings for an export at `scale`.
///
/// Empty when the document has neither `bleed` nor `margins`. Layers are
/// visited depth first, in document order. A hidden layer and every layer
/// inside a hidden group are not checked, because they do not print.
pub fn print_warnings(document: &Document, scale: f32) -> Vec<ExportWarning> {
    let canvas = &document.canvas;
    if canvas.bleed.is_none() && canvas.margins.is_none() {
        return Vec::new();
    }
    let mut leaves = Vec::new();
    visible_leaves(&document.layers, &mut leaves);

    let mut warnings = Vec::new();
    for layer in leaves {
        let Ok(bounds) = layer_bounds(document, &layer.id) else {
            continue;
        };
        if bounds.width <= 0.0 || bounds.height <= 0.0 {
            continue;
        }
        if let Some(margins) = &canvas.margins {
            if let Some(warning) = outside_margins(document, layer, &bounds, margins) {
                warnings.push(warning);
            }
        }
        if let Some(bleed) = &canvas.bleed {
            if let Some(warning) = inside_bleed(document, layer, &bounds, bleed) {
                warnings.push(warning);
            }
        }
        if let Some(warning) = below_resolution(document, layer, scale) {
            warnings.push(warning);
        }
    }
    warnings
}

fn visible_leaves<'a>(layers: &'a [Layer], out: &mut Vec<&'a Layer>) {
    for layer in layers {
        if !layer.visible || layer.opacity <= 0.0 {
            continue;
        }
        match &layer.kind {
            LayerKind::Group(group) => visible_leaves(&group.children, out),
            _ => out.push(layer),
        }
    }
}

fn rounded(value: f64) -> f64 {
    (value * 1_000_000.0).round() / 1_000_000.0
}

/// The four edges of a box, in the order top, right, bottom, left, each as
/// a distance outward from the matching canvas edge. A positive value is
/// outside the canvas; a negative value is inside it.
fn outward(document: &Document, bounds: &Rect) -> [(&'static str, f64); 4] {
    let canvas = &document.canvas;
    [
        ("top", rounded(-bounds.y)),
        ("right", rounded(bounds.right() - canvas.width)),
        ("bottom", rounded(bounds.bottom() - canvas.height)),
        ("left", rounded(-bounds.x)),
    ]
}

fn side_list(sides: &[&str]) -> String {
    sides.join(", ")
}

/// Text that leaves the safe area on any side, and any other content that
/// crosses a margin line but does not reach the trim edge on that side.
///
/// A shape or an image that reaches the trim edge is art that runs to the
/// edge on purpose; [`inside_bleed`] checks it. Text is never meant to be cut,
/// so text past the margin line is reported even when it reaches the trim.
fn outside_margins(
    document: &Document,
    layer: &Layer,
    bounds: &Rect,
    margins: &Insets,
) -> Option<ExportWarning> {
    let is_text = matches!(layer.kind, LayerKind::Text(_));
    let margin = [margins.top, margins.right, margins.bottom, margins.left];
    let sides: Vec<&str> = outward(document, bounds)
        .iter()
        .zip(margin)
        .filter(|((_, out), margin)| {
            // `out` is the distance outward from the trim edge; the margin
            // line is `margin` inward from it.
            let crosses_margin = *out > rounded(-margin);
            let reaches_trim = *out >= 0.0;
            *margin > 0.0 && crosses_margin && (is_text || !reaches_trim)
        })
        .map(|((side, _), _)| *side)
        .collect();
    if sides.is_empty() {
        return None;
    }
    Some(ExportWarning {
        code: CONTENT_OUTSIDE_MARGINS,
        message: format!(
            "layer {}: its box crosses the {} margin, outside the safe area; \
             it can be cut or look too near the edge when printed",
            layer.id,
            side_list(&sides)
        ),
        layer_id: Some(layer.id.clone()),
        project: None,
    })
}

/// Content that touches or crosses a trim edge but does not reach the bleed
/// edge on that side. After the cut, a thin line of paper can show there.
fn inside_bleed(
    document: &Document,
    layer: &Layer,
    bounds: &Rect,
    bleed: &Insets,
) -> Option<ExportWarning> {
    let widths = [bleed.top, bleed.right, bleed.bottom, bleed.left];
    let sides: Vec<&str> = outward(document, bounds)
        .iter()
        .zip(widths)
        .filter(|((_, out), width)| *width > 0.0 && *out >= 0.0 && *out < rounded(*width))
        .map(|((side, _), _)| *side)
        .collect();
    if sides.is_empty() {
        return None;
    }
    Some(ExportWarning {
        code: CONTENT_INSIDE_BLEED,
        message: format!(
            "layer {}: it reaches the {} trim edge but stops before the bleed edge; \
             extend it to the bleed edge, or keep it inside the trim",
            layer.id,
            side_list(&sides)
        ),
        layer_id: Some(layer.id.clone()),
        project: None,
    })
}

/// An image whose source pixels, after its crop, are fewer than the output
/// pixels it is drawn on at `scale`. The target is one source pixel for each
/// output pixel. An asset with no recorded size is not checked.
fn below_resolution(document: &Document, layer: &Layer, scale: f32) -> Option<ExportWarning> {
    let LayerKind::Image(image) = &layer.kind else {
        return None;
    };
    let asset = document
        .assets
        .iter()
        .find(|asset| asset.id == image.asset)?;
    let (full_width, full_height) = (f64::from(asset.width?), f64::from(asset.height?));
    let (source_width, source_height) = match &image.crop {
        Some(crop) => (
            (crop.x + crop.width).min(full_width) - crop.x.max(0.0),
            (crop.y + crop.height).min(full_height) - crop.y.max(0.0),
        ),
        None => (full_width, full_height),
    };
    if source_width <= 0.0 || source_height <= 0.0 {
        return None;
    }
    let scale = f64::from(scale);
    let box_width = layer.transform.width * scale;
    let box_height = layer.transform.height * scale;
    let (drawn_width, drawn_height) = match image.fit {
        ImageFit::Fill => (box_width, box_height),
        ImageFit::Contain | ImageFit::Cover => {
            let x = box_width / source_width;
            let y = box_height / source_height;
            let k = if image.fit == ImageFit::Contain {
                x.min(y)
            } else {
                x.max(y)
            };
            (source_width * k, source_height * k)
        }
    };
    let ratio = (drawn_width / source_width).max(drawn_height / source_height);
    if rounded(ratio) <= 1.0 {
        return None;
    }
    Some(ExportWarning {
        code: ASSET_BELOW_TARGET_RESOLUTION,
        message: format!(
            "layer {}: the image has {} x {} source pixels and is drawn on {} x {} output \
             pixels, so each source pixel covers {} output pixels across; use a larger image",
            layer.id,
            number(source_width),
            number(source_height),
            number(drawn_width.round()),
            number(drawn_height.round()),
            number((ratio * 100.0).round() / 100.0)
        ),
        layer_id: Some(layer.id.clone()),
        project: None,
    })
}
