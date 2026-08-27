//! Which font families a render may use, and how tall they are.
//!
//! Fonts are never discovered from the operating system: the same document
//! rendered on two machines must use the same font files, so the caller says
//! explicitly what is available (NFR-1, and the font store in [`crate::store`]).
//!
//! A [`FontSet`] carries vertical metrics alongside the family names, because
//! placing the first baseline correctly needs the font's own ascent. Reading
//! those metrics is the only thing that keeps `doc_to_svg` a pure function:
//! the numbers are measured once, by whoever loaded the files, and passed in.

use std::collections::BTreeMap;

/// Vertical metrics of a face, in the font's own units.
///
/// Kept unscaled so a change of `fontSize` is a multiplication rather than a
/// re-measurement, and so the values are exactly what the font file says.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct FontMetrics {
    /// Design units per em; the denominator for every other field here.
    pub units_per_em: f64,
    /// Distance from the baseline to the top of the em box, positive upwards.
    pub ascender: f64,
    /// Distance from the baseline to the bottom, negative in most fonts.
    pub descender: f64,
    /// Extra leading the designer asks for between lines.
    pub line_gap: f64,
}

impl FontMetrics {
    /// Ascent as a multiple of the font size.
    ///
    /// This is where the first baseline goes, measured down from the top of
    /// the layer box. Zero or nonsense units fall back to 1, which is the rule
    /// v0.1.0 used everywhere.
    pub fn ascent_ratio(&self) -> f64 {
        if self.units_per_em > 0.0 && self.ascender.is_finite() {
            self.ascender / self.units_per_em
        } else {
            1.0
        }
    }

    /// Descent below the baseline as a positive multiple of font size.
    pub fn descent_ratio(&self) -> f64 {
        if self.units_per_em > 0.0 && self.descender.is_finite() {
            (-self.descender / self.units_per_em).max(0.0)
        } else {
            0.2
        }
    }
}

/// The ascent used when nothing has measured the font: one whole font size.
///
/// Only reachable through [`FontSet::unchecked`] and name-only sets, which
/// exist for callers inspecting a document's structure rather than rendering
/// it for real. Every render that goes through [`crate::raster::LoadedFonts`]
/// has real metrics.
pub const UNMEASURED_ASCENT_RATIO: f64 = 1.0;

/// The font families available to a render, with their metrics when known.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct FontSet {
    families: BTreeMap<String, Option<FontMetrics>>,
    advances: BTreeMap<String, FontAdvances>,
    accept_any: bool,
}

/// Horizontal advances for the default face of one family, expressed as
/// multiples of the font size. These are measured from the same pinned font
/// file that usvg rasterizes, so line breaking is deterministic too.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct FontAdvances {
    average: f64,
    characters: BTreeMap<char, f64>,
}

impl FontSet {
    /// A set containing exactly the given families, with no metrics.
    pub fn new<I, S>(families: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        Self {
            families: families
                .into_iter()
                .map(|family| (family.into(), None))
                .collect(),
            advances: BTreeMap::new(),
            accept_any: false,
        }
    }

    /// A set built from measured faces.
    ///
    /// A face whose metrics could not be read still contributes its family
    /// name — the family exists, so a document naming it is not a missing
    /// font; only its baseline falls back.
    ///
    /// When two faces name the same family — a regular and a bold from the
    /// same file set — the first one wins, so the result depends only on the
    /// order the caller loaded the files in, not on a hash map's iteration
    /// order.
    pub fn measured<I, S>(faces: I) -> Self
    where
        I: IntoIterator<Item = (S, Option<FontMetrics>)>,
        S: Into<String>,
    {
        let mut families: BTreeMap<String, Option<FontMetrics>> = BTreeMap::new();
        for (family, metrics) in faces {
            families.entry(family.into()).or_insert(metrics);
        }
        Self {
            families,
            advances: BTreeMap::new(),
            accept_any: false,
        }
    }

    /// A measured set including the horizontal metrics used for wrapping.
    pub(crate) fn measured_with_advances<I, S>(faces: I) -> Self
    where
        I: IntoIterator<Item = (S, Option<FontMetrics>, Option<FontAdvances>)>,
        S: Into<String>,
    {
        let mut families = BTreeMap::new();
        let mut advances = BTreeMap::new();
        for (family, metrics, widths) in faces {
            let family = family.into();
            families.entry(family.clone()).or_insert(metrics);
            if let Some(widths) = widths {
                advances.entry(family).or_insert(widths);
            }
        }
        Self {
            families,
            advances,
            accept_any: false,
        }
    }

    /// A set that accepts any family name.
    ///
    /// For callers that have not resolved fonts yet — a preview of a document
    /// whose fonts are checked elsewhere. Rasterization still needs real font
    /// files; this only turns off the up-front check, and text placed through
    /// it uses [`UNMEASURED_ASCENT_RATIO`] rather than the font's own ascent.
    pub fn unchecked() -> Self {
        Self {
            families: BTreeMap::new(),
            advances: BTreeMap::new(),
            accept_any: true,
        }
    }

    /// Whether a family may be used.
    pub fn contains(&self, family: &str) -> bool {
        self.accept_any || self.families.contains_key(family)
    }

    /// The metrics measured for a family, if any were.
    pub fn metrics(&self, family: &str) -> Option<&FontMetrics> {
        self.families.get(family).and_then(Option::as_ref)
    }

    /// Where a family's first baseline sits, as a multiple of the font size.
    pub fn ascent_ratio(&self, family: &str) -> f64 {
        self.metrics(family)
            .map_or(UNMEASURED_ASCENT_RATIO, FontMetrics::ascent_ratio)
    }

    /// How far glyphs may extend below the baseline, in em units.
    pub fn descent_ratio(&self, family: &str) -> f64 {
        self.metrics(family).map_or(0.2, FontMetrics::descent_ratio)
    }

    /// Measures a string in em units using the pinned face's glyph advances.
    ///
    /// This deliberately returns `None` for name-only font sets. Structural
    /// SVG callers keep the pre-wrapping behaviour; real preview/export paths
    /// always load font files and therefore always have exact source metrics.
    pub(crate) fn text_advance_ratio(&self, family: &str, text: &str) -> Option<f64> {
        let advances = self.advances.get(family)?;
        Some(
            text.chars()
                .map(|character| {
                    advances
                        .characters
                        .get(&character)
                        .copied()
                        .unwrap_or(advances.average)
                })
                .sum(),
        )
    }

    /// The families in the set, sorted.
    pub fn families(&self) -> impl Iterator<Item = &str> {
        self.families.keys().map(String::as_str)
    }

    /// Whether the set names no families at all.
    pub fn is_empty(&self) -> bool {
        !self.accept_any && self.families.is_empty()
    }
}

/// Reads the vertical metrics of one face in a font file.
///
/// `index` selects a face inside a collection (`.ttc`); it is 0 for a plain
/// font file. Returns `None` for bytes this build cannot parse, which the
/// caller reports rather than guessing at.
pub fn read_metrics(data: &[u8], index: u32) -> Option<FontMetrics> {
    use skrifa::MetadataProvider as _;

    let font = skrifa::FontRef::from_index(data, index).ok()?;
    let metrics = font.metrics(
        skrifa::instance::Size::unscaled(),
        skrifa::instance::LocationRef::default(),
    );
    Some(FontMetrics {
        units_per_em: f64::from(metrics.units_per_em),
        ascender: f64::from(metrics.ascent),
        descender: f64::from(metrics.descent),
        line_gap: f64::from(metrics.leading),
    })
}

/// Reads every Unicode character advance from one face.
pub(crate) fn read_advances(data: &[u8], index: u32) -> Option<FontAdvances> {
    use skrifa::MetadataProvider as _;

    let font = skrifa::FontRef::from_index(data, index).ok()?;
    let location = skrifa::instance::LocationRef::default();
    let global = font.metrics(skrifa::instance::Size::unscaled(), location);
    let units = f64::from(global.units_per_em);
    if units <= 0.0 {
        return None;
    }
    let glyphs = font.glyph_metrics(skrifa::instance::Size::unscaled(), location);
    let mut characters = BTreeMap::new();
    for (codepoint, glyph) in font.charmap().mappings() {
        let Some(character) = char::from_u32(codepoint) else {
            continue;
        };
        if let Some(advance) = glyphs.advance_width(glyph) {
            characters.insert(character, f64::from(advance) / units);
        }
    }
    let average = global
        .average_width
        .map(|width| f64::from(width) / units)
        .filter(|width| width.is_finite() && *width > 0.0)
        .unwrap_or(0.5);
    Some(FontAdvances {
        average,
        characters,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn metrics(units: f64, ascender: f64) -> FontMetrics {
        FontMetrics {
            units_per_em: units,
            ascender,
            descender: -units / 5.0,
            line_gap: 0.0,
        }
    }

    #[test]
    fn membership_is_exact_unless_unchecked() {
        let set = FontSet::new(["Inter", "Noto Sans"]);
        assert!(set.contains("Inter"));
        assert!(!set.contains("inter"));
        assert!(!set.contains("Comic Sans MS"));
        assert!(FontSet::unchecked().contains("anything"));
    }

    #[test]
    fn families_are_sorted() {
        let set = FontSet::new(["Zed", "Alpha"]);
        assert_eq!(set.families().collect::<Vec<_>>(), ["Alpha", "Zed"]);
    }

    #[test]
    fn ascent_comes_from_metrics_when_measured() {
        let set = FontSet::measured([("Inter", Some(metrics(1000.0, 800.0)))]);
        assert!((set.ascent_ratio("Inter") - 0.8).abs() < 1e-12);
        // A family nobody measured, and the unchecked set, both fall back.
        assert_eq!(set.ascent_ratio("Other"), UNMEASURED_ASCENT_RATIO);
        assert_eq!(
            FontSet::unchecked().ascent_ratio("anything"),
            UNMEASURED_ASCENT_RATIO
        );
    }

    #[test]
    fn the_first_face_of_a_family_is_the_one_measured() {
        let set = FontSet::measured([
            ("Inter", Some(metrics(1000.0, 800.0))),
            ("Inter", Some(metrics(1000.0, 950.0))),
        ]);
        assert!((set.ascent_ratio("Inter") - 0.8).abs() < 1e-12);
    }

    #[test]
    fn nonsense_units_do_not_produce_a_nonsense_baseline() {
        let set = FontSet::measured([("Broken", Some(metrics(0.0, 800.0)))]);
        assert_eq!(set.ascent_ratio("Broken"), 1.0);
    }

    #[test]
    fn an_unmeasurable_face_still_provides_its_family() {
        let set = FontSet::measured([("Odd", None)]);
        assert!(set.contains("Odd"));
        assert_eq!(set.ascent_ratio("Odd"), UNMEASURED_ASCENT_RATIO);
    }
}
