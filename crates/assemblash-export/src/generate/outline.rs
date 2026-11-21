//! Labels as glyph outlines (D7, provisional choice: outline in the
//! generator).
//!
//! The renderer refuses `<text>` inside an SVG asset when no loaded font can
//! draw it. A generated asset therefore writes each label as a `<path>`,
//! made from the face the caller gives. The asset then needs no font when
//! it is drawn.
//!
//! One glyph for each character, placed at the advance width from `hmtx`.
//! There is no kerning and no shaping, so scripts that need shaping (Arabic,
//! Devanagari and others) are not drawn correctly. A character the face has
//! no glyph for is refused, naming the character.

use skrifa::outline::{DrawSettings, OutlinePen};
use skrifa::prelude::{LocationRef, Size};
use skrifa::{FontRef, MetadataProvider};

use super::svg::num;
use super::GenerateError;

/// A font face for labels.
#[derive(Debug, Clone, Copy)]
pub struct Face<'a> {
    /// The family name, for messages.
    pub family: &'a str,
    /// The font file bytes.
    pub bytes: &'a [u8],
    /// The face index inside the file.
    pub index: u32,
}

/// Horizontal anchor of a label.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Anchor {
    Start,
    Middle,
    End,
}

/// A face ready to measure and outline text.
pub(crate) struct Outliner<'a> {
    font: FontRef<'a>,
    family: &'a str,
    units_per_em: f64,
    ascent: f64,
    descent: f64,
}

impl std::fmt::Debug for Outliner<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Outliner")
            .field("family", &self.family)
            .finish_non_exhaustive()
    }
}

impl<'a> Outliner<'a> {
    pub(crate) fn new(face: &Face<'a>) -> Result<Self, GenerateError> {
        let font = FontRef::from_index(face.bytes, face.index).map_err(|e| {
            GenerateError::InvalidFont {
                family: face.family.to_owned(),
                reason: e.to_string(),
            }
        })?;
        let metrics = font.metrics(Size::unscaled(), LocationRef::default());
        let units_per_em = f64::from(metrics.units_per_em);
        if units_per_em <= 0.0 {
            return Err(GenerateError::InvalidFont {
                family: face.family.to_owned(),
                reason: "unitsPerEm is zero".to_owned(),
            });
        }
        Ok(Self {
            font,
            family: face.family,
            units_per_em,
            ascent: f64::from(metrics.ascent),
            descent: f64::from(metrics.descent),
        })
    }

    /// The distance from the baseline to the top of the line box, in pixels
    /// at `size`.
    pub(crate) fn ascent(&self, size: f64) -> f64 {
        self.ascent * size / self.units_per_em
    }

    /// The height of a line box (ascent plus descent), in pixels at `size`.
    pub(crate) fn line_height(&self, size: f64) -> f64 {
        (self.ascent - self.descent) * size / self.units_per_em
    }

    /// The advance width of `text` at `size`, in pixels.
    pub(crate) fn width(&self, text: &str, size: f64, field: &str) -> Result<f64, GenerateError> {
        let charmap = self.font.charmap();
        let metrics = self
            .font
            .glyph_metrics(Size::unscaled(), LocationRef::default());
        let mut units = 0.0;
        for character in text.chars() {
            let glyph = self.glyph(&charmap, character, field)?;
            units += f64::from(metrics.advance_width(glyph).unwrap_or(0.0));
        }
        Ok(units * size / self.units_per_em)
    }

    /// Path data for `text` with its baseline at `y`, anchored at `x`.
    /// Returns an empty string for text with no visible glyph.
    pub(crate) fn path(
        &self,
        text: &str,
        x: f64,
        y: f64,
        size: f64,
        anchor: Anchor,
        field: &str,
    ) -> Result<String, GenerateError> {
        let width = self.width(text, size, field)?;
        let start = match anchor {
            Anchor::Start => x,
            Anchor::Middle => x - width / 2.0,
            Anchor::End => x - width,
        };
        let scale = size / self.units_per_em;
        let charmap = self.font.charmap();
        let metrics = self
            .font
            .glyph_metrics(Size::unscaled(), LocationRef::default());
        let outlines = self.font.outline_glyphs();
        let mut pen = PathPen {
            out: String::new(),
            x: start,
            y,
            scale,
        };
        for character in text.chars() {
            let glyph = self.glyph(&charmap, character, field)?;
            if let Some(outline) = outlines.get(glyph) {
                outline
                    .draw(
                        DrawSettings::unhinted(Size::unscaled(), LocationRef::default()),
                        &mut pen,
                    )
                    .map_err(|e| GenerateError::InvalidFont {
                        family: self.family.to_owned(),
                        reason: e.to_string(),
                    })?;
            }
            pen.x += f64::from(metrics.advance_width(glyph).unwrap_or(0.0)) * scale;
        }
        Ok(pen.out)
    }

    fn glyph(
        &self,
        charmap: &skrifa::charmap::Charmap<'_>,
        character: char,
        field: &str,
    ) -> Result<skrifa::GlyphId, GenerateError> {
        match charmap.map(character) {
            Some(glyph) if glyph.to_u32() != 0 => Ok(glyph),
            // A space or a control character with no glyph still has an
            // advance in most faces; only refuse a character that draws.
            _ if character.is_whitespace() => Ok(skrifa::GlyphId::new(0)),
            _ => Err(GenerateError::MissingGlyph {
                family: self.family.to_owned(),
                character,
                code: u32::from(character),
                field: field.to_owned(),
            }),
        }
    }
}

/// Writes glyph outlines as path data, flipping y (fonts are y-up).
struct PathPen {
    out: String,
    x: f64,
    y: f64,
    scale: f64,
}

impl PathPen {
    fn point(&mut self, x: f32, y: f32) {
        let px = num(self.x + f64::from(x) * self.scale);
        let py = num(self.y - f64::from(y) * self.scale);
        self.out.push_str(&px);
        self.out.push(' ');
        self.out.push_str(&py);
    }
}

impl OutlinePen for PathPen {
    fn move_to(&mut self, x: f32, y: f32) {
        self.out.push('M');
        self.point(x, y);
    }
    fn line_to(&mut self, x: f32, y: f32) {
        self.out.push('L');
        self.point(x, y);
    }
    fn quad_to(&mut self, cx0: f32, cy0: f32, x: f32, y: f32) {
        self.out.push('Q');
        self.point(cx0, cy0);
        self.out.push(' ');
        self.point(x, y);
    }
    fn curve_to(&mut self, cx0: f32, cy0: f32, cx1: f32, cy1: f32, x: f32, y: f32) {
        self.out.push('C');
        self.point(cx0, cy0);
        self.out.push(' ');
        self.point(cx1, cy1);
        self.out.push(' ');
        self.point(x, y);
    }
    fn close(&mut self) {
        self.out.push('Z');
    }
}
