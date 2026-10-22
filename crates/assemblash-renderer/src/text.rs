//! Full-layer text layout with exact faces and source-indexed outlines.
//!
//! Raw runs remain unchanged. Layout performs no font or filesystem I/O.
//! Structural core acceptance does not guarantee that loaded fonts permit a shaping boundary.
//! A shaping cluster requires compatible effective styles, resolved faces, and variation coordinates.
//! Unknown JSON properties do not change compatibility. Layout returns an indexed error for incompatible boundaries.
//! Applied letter spacing must leave a positive cluster advance. Connected scripts and final clusters skip spacing.
//! Naturally zero-advance marks remain present. Ordinary writes preserve raw runs without font-dependent validation.

use assemblash_core::{Color, Layer, LayerKind};
use resvg::tiny_skia::{NonZeroRect, Path, Transform};

use crate::{FontFaceData, FontSet, RenderError};

mod shaping;
pub(crate) mod svg;

/// Machine-readable reason for an indexed layout refusal.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TextFailureKind {
    /// Loaded font bytes are required.
    FontDataUnavailable,
    /// Exact loaded font data cannot provide the requested information.
    InvalidFontData,
    /// The exact selected face has no requested glyph.
    MissingGlyph,
    /// A shaping cluster crosses incompatible effective styles.
    IncompatibleCluster,
    /// Applied letter spacing makes a cluster advance nonpositive.
    InvalidSpacing,
    /// Layout geometry exceeds finite render coordinates.
    InvalidGeometry,
}

/// A styled text consumer cannot interpret or shape the requested values.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum TextLayoutError {
    /// A stored raw run has unsupported known values or inconsistent text.
    #[error(transparent)]
    InvalidRuns(#[from] assemblash_core::TextRunError),
    /// Exact shaping rejects a boundary or geometry at the original source position.
    #[error("run {run_index} at character {character_index} (byte {byte_index}): {reason}")]
    Unsupported {
        /// Machine-readable refusal category.
        kind: TextFailureKind,
        /// Original run index.
        run_index: usize,
        /// Original Unicode scalar index.
        character_index: usize,
        /// Original UTF-8 byte index.
        byte_index: usize,
        /// Specific refusal reason.
        reason: String,
    },
}

/// One measured line in the layer's local coordinate space.
#[derive(Debug, Clone, PartialEq)]
pub struct TextLine {
    /// Original line text after wrapping.
    pub text: String,
    /// Advance width in pixels. Name-only legacy font sets return `None`.
    pub width: Option<f64>,
    /// Local horizontal position. Name-only legacy font sets return `None`.
    pub x: Option<f64>,
    /// Local baseline, including vertical alignment.
    pub baseline: f64,
    /// Ascent of the tallest face on this line.
    pub ascent: f64,
    /// Descent of the deepest face on this line.
    pub descent: f64,
}

/// One exact glyph retained from its selected shaping cluster.
#[derive(Debug, Clone)]
pub struct TextGlyph {
    /// Glyph id within the selected face.
    pub glyph_id: u32,
    /// Original run index.
    pub run_index: usize,
    /// Original Unicode scalar index.
    pub character_index: usize,
    /// Original UTF-8 byte index.
    pub byte_index: usize,
    /// Font size used by shaping and outlining.
    pub font_size: f32,
    /// Local glyph origin.
    pub x: f32,
    /// Local glyph baseline after shaping offsets.
    pub y: f32,
    /// Font-unit advance. Zero-advance marks remain present.
    pub source_advance: i32,
    pub(crate) face: FontFaceData,
    pub(crate) coordinates: Vec<i16>,
    pub(crate) outline: Option<Path>,
    pub(crate) font_outline: Option<Path>,
    pub(crate) placement: [f32; 6],
    pub(crate) line_index: usize,
    pub(crate) paint: Option<Color>,
    pub(crate) paint_span: usize,
}

impl TextGlyph {
    /// Immutable exact face bytes and collection index.
    pub fn face(&self) -> &FontFaceData {
        &self.face
    }
    /// Normalized variation coordinates in axis order, encoded as F2Dot14 bits.
    pub fn variation_coordinates(&self) -> &[i16] {
        &self.coordinates
    }
    /// Actual pixel-space outline. Spaces can have no outline.
    pub fn outline(&self) -> Option<&Path> {
        self.outline.as_ref()
    }

    pub(crate) fn emitted_outline(
        &self,
        layer: &Layer,
        emission: &TextEmission,
    ) -> Result<Option<Path>, RenderError> {
        let Some(path) = self.font_outline.clone() else {
            return Ok(None);
        };
        let [_, _, cluster, offset_x, offset_y, scale] = self.placement;
        let line = &emission.lines[self.line_index];
        let transform = line
            .span
            .pre_translate(cluster, line.dy)
            .pre_scale(scale, scale)
            .pre_translate(offset_x, offset_y)
            .pre_scale(1.0, -1.0);
        path.transform(transform)
            .map(Some)
            .ok_or_else(|| RenderError::TextLayout {
                layer: layer.id.clone(),
                source: TextLayoutError::Unsupported {
                    kind: TextFailureKind::InvalidGeometry,
                    run_index: self.run_index,
                    character_index: self.character_index,
                    byte_index: self.byte_index,
                    reason: "emitted glyph exceeds finite render coordinates".into(),
                },
            })
    }
}

/// Retained SVG arithmetic. Public measurements stay in local coordinates.
#[derive(Debug, Clone, Default)]
pub(crate) struct TextEmission {
    pub(crate) lines: Vec<TextEmissionLine>,
    pub(crate) metric_bounds: Option<NonZeroRect>,
}

#[derive(Debug, Clone)]
pub(crate) struct TextEmissionLine {
    pub(crate) span: Transform,
    pub(crate) dy: f32,
}

/// The layout used by styled rendering and full-layer measurement.
#[derive(Debug, Clone)]
pub struct TextLayerLayout {
    /// Wrapped lines and their local positions.
    pub lines: Vec<TextLine>,
    /// Complete metric block height, including overlapping and empty lines.
    pub height: f64,
    /// A word exceeds the box and requires a cluster boundary break.
    pub broke_mid_word: bool,
    /// The metric block or a line extends beyond the box.
    pub overflow: bool,
    pub(crate) glyphs: Vec<TextGlyph>,
    pub(crate) metric_bounds: Option<(f32, f32, f32, f32)>,
    pub(crate) emission: TextEmission,
}

impl TextLayerLayout {
    /// Immutable retained glyphs with original source and selected-face provenance.
    pub fn glyphs(&self) -> &[TextGlyph] {
        &self.glyphs
    }
    /// Whole-parent text metric bounds in local coordinates, used by gradient paints.
    pub fn metric_bounds(&self) -> Option<(f32, f32, f32, f32)> {
        self.metric_bounds
    }
}

/// Measure a text layer at a requested width without reading font files.
/// Empty runs retain the existing `layout_text` behavior and name-only font support.
/// Styled runs require exact loaded bytes. Unsupported styles receive indexed errors.
pub fn layout_text_layer(
    layer: &Layer,
    width: f64,
    fonts: &FontSet,
) -> Result<TextLayerLayout, RenderError> {
    let LayerKind::Text(text) = &layer.kind else {
        return Err(RenderError::NotTextLayer {
            layer: layer.id.clone(),
        });
    };
    if !width.is_finite() || width <= 0.0 {
        return Err(RenderError::InvalidTextWidth {
            layer: layer.id.clone(),
            width,
        });
    }
    if text.runs.is_empty() {
        let crate::svg::PlainTextLayout {
            layout: legacy,
            paragraph_starts,
            ..
        } = crate::svg::layout_plain_text(layer, text, width, fonts)?;
        let ascent = text.font_size * fonts.ascent_ratio(&text.font_family);
        let descent = text.font_size * fonts.descent_ratio(&text.font_family);
        let free = layer.transform.height - legacy.height;
        let shift = match text.vertical_align {
            assemblash_core::VerticalAlign::Top => 0.0,
            assemblash_core::VerticalAlign::Middle => free / 2.0,
            assemblash_core::VerticalAlign::Bottom => free,
        };
        let lines: Vec<TextLine> = legacy
            .lines
            .into_iter()
            .enumerate()
            .map(|(index, text_line)| {
                let measured =
                    fonts
                        .text_advance_ratio(&text.font_family, &text_line)
                        .map(|advance| {
                            advance * text.font_size
                                + text.letter_spacing
                                    * text_line.chars().count().saturating_sub(1) as f64
                        });
                let x = measured.map(|measured| match text.align {
                    assemblash_core::TextAlign::Left => 0.0,
                    assemblash_core::TextAlign::Center => (width - measured) / 2.0,
                    assemblash_core::TextAlign::Right => width - measured,
                });
                TextLine {
                    text: text_line,
                    width: measured,
                    x,
                    baseline: shift
                        + ascent
                        + index as f64 * text.font_size * text.line_height
                        + paragraph_starts.partition_point(|start| *start <= index) as f64
                            * text.paragraph_spacing,
                    ascent,
                    descent,
                }
            })
            .collect();
        let overflow = legacy.height > layer.transform.height
            || lines
                .iter()
                .any(|line| line.width.is_some_and(|advance| advance > width));
        return Ok(TextLayerLayout {
            lines,
            height: legacy.height,
            broke_mid_word: legacy.broke_mid_word,
            overflow,
            glyphs: Vec::new(),
            metric_bounds: None,
            emission: TextEmission::default(),
        });
    }
    shaping::layout(layer, text, width, fonts)
}

/// One exact face required by a document text layer.
#[derive(Debug, Clone)]
pub struct TextFontRequirement {
    /// Layer that consumes the face.
    pub layer: assemblash_core::LayerId,
    /// Requested family name.
    pub family: String,
    /// Requested weight.
    pub weight: u16,
    /// Requested style.
    pub style: assemblash_core::FontStyle,
}

/// Interpret text font requirements without reading font files.
pub fn text_font_requirements(
    document: &assemblash_core::Document,
) -> Result<Vec<TextFontRequirement>, RenderError> {
    let mut requirements = Vec::new();
    let mut failure = None;
    document.walk_layers(&mut |layer| {
        if failure.is_some() {
            return;
        }
        let LayerKind::Text(text) = &layer.kind else {
            return;
        };
        requirements.push(TextFontRequirement {
            layer: layer.id.clone(),
            family: text.font_family.clone(),
            weight: text.font_weight,
            style: text.font_style,
        });
        if !text.runs.is_empty() {
            match text.interpreted_runs() {
                Ok(runs) => {
                    requirements.extend(runs.into_iter().filter(|run| !run.text.is_empty()).map(
                        |run| TextFontRequirement {
                            layer: layer.id.clone(),
                            family: run.font_family.into(),
                            weight: run.font_weight,
                            style: run.font_style,
                        },
                    ))
                }
                Err(error) => {
                    failure = Some(RenderError::TextLayout {
                        layer: layer.id.clone(),
                        source: error.into(),
                    })
                }
            }
        }
    });
    if let Some(error) = failure {
        return Err(error);
    }
    Ok(requirements)
}

/// Every interpreted text family, sorted and deduplicated.
pub fn text_font_families(
    document: &assemblash_core::Document,
) -> Result<Vec<String>, RenderError> {
    Ok(text_font_requirements(document)?
        .into_iter()
        .map(|face| face.family)
        .collect::<std::collections::BTreeSet<_>>()
        .into_iter()
        .collect())
}

/// Refuse missing exact faces with the consuming layer's identity.
pub fn check_text_fonts(
    document: &assemblash_core::Document,
    fonts: &FontSet,
) -> Result<(), RenderError> {
    for face in text_font_requirements(document)? {
        if !fonts.contains_face(&face.family, face.weight, face.style) {
            return Err(RenderError::MissingFont {
                layer: face.layer,
                family: face.family,
                weight: face.weight,
                style: face.style.as_str(),
            });
        }
    }
    Ok(())
}
