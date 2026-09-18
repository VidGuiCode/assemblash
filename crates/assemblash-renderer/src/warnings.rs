//! What an export noticed and did not refuse (FR-11).
//!
//! A warning is not a failure. Each one names something the picture does that
//! its author probably did not ask for — a word split down the middle, text
//! running past the bottom of its box — and the export still writes its file
//! and still succeeds. Refusing here would be worse: the file is correct,
//! deterministic, and exactly what the document says; it is the document that
//! is surprising.
//!
//! The line between a warning and a refusal is whether the file still says
//! what the document says. An imported asset whose `<text>` has no font warned
//! here in 1.3.0 and refuses in the renderer now, because that file did *not*:
//! the words were simply gone, and an export that loses content and returns
//! success is the one thing this module must not be used to excuse.
//!
//! This lives in the renderer rather than beside any one response type
//! because there are three export paths — the CLI's own, the HTTP API's, and
//! the MCP server's — and a warning produced in one of them is a warning two
//! surfaces would not have. Everything here is derived from the same
//! measurements the render itself uses, so an export and its warnings cannot
//! disagree.

use std::path::Path;

use assemblash_core::document::LayerKind;
use assemblash_core::ids::LayerId;
use assemblash_core::{storage, svg_import, Document};

use crate::fonts::FontSet;
use crate::svg::{families_in, layout_text, number};

/// A word was wider than its box and was split at a character boundary.
pub const WORD_BROKEN_MID_WORD: &str = "wordBrokenMidWord";

/// A text layer's wrapped text is taller than the layer's own box.
pub const TEXT_OVERFLOWS_BOX: &str = "textOverflowsBox";

/// A text layer sits under an opaque layer that is drawn over it.
///
/// The picture is exactly what the document says; the text is simply not
/// visible in it. An agent cannot see its own render, so this is the one
/// mistake it makes that nothing else would report.
pub const TEXT_COVERED_BY_LAYER: &str = "textCoveredByLayer";

/// An imported SVG asset draws text in a family this render did not load.
///
/// **Superseded in 1.5.0, and no longer reachable from any export.** This was
/// the 1.3.0 answer to DEF-2: report the hole and write the file anyway. It
/// was the wrong answer — the export still "succeeded" while a chart lost its
/// labels — so the render refuses that document now
/// ([`RenderError::SvgAssetTextWithoutFont`](crate::RenderError::SvgAssetTextWithoutFont))
/// and an export that gets far enough to collect warnings cannot be one this
/// would fire on. The code stays defined because a warning code is public API
/// and deleting one is a breaking change; a caller switching on it keeps
/// compiling and simply never sees it.
pub const SVG_ASSET_TEXT_WITHOUT_FONT: &str = "svgAssetTextWithoutFont";

/// One thing an export noticed.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportWarning {
    /// Stable machine-readable code — one of the three constants in this
    /// module. A caller switches on this; the message is for a person.
    pub code: &'static str,
    /// What happened, in the voice the operation layer refuses in.
    pub message: String,
    /// The layer it happened on, when one layer is responsible.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub layer_id: Option<LayerId>,
}

/// Everything an export of this document would want to say.
///
/// Deterministic and order-stable: layers are visited in the order a
/// depth-first walk finds them, and every number is compared at the same six
/// decimal places the SVG writer rounds to, so the answer is identical on all
/// six released targets.
///
/// `project_dir` is needed only for the SVG-asset check, which reads the
/// stored asset — the same directory [`crate::data_uris`] reads. An asset that
/// cannot be read produces no warning rather than a wrong one; the render
/// itself has already failed on it by then.
pub fn export_warnings(
    document: &Document,
    fonts: &FontSet,
    project_dir: &Path,
) -> Vec<ExportWarning> {
    let mut warnings = Vec::new();
    document.walk_layers(&mut |layer| match &layer.kind {
        LayerKind::Text(text) => {
            let layout = layout_text(
                &text.text,
                layer.transform.width,
                text.font_size,
                text.line_height,
                text.letter_spacing,
                &text.font_family,
                fonts,
            );
            if layout.broke_mid_word {
                warnings.push(ExportWarning {
                    code: WORD_BROKEN_MID_WORD,
                    message: format!(
                        "layer {}: a word is wider than the {} pixel box and was split mid-word",
                        layer.id,
                        number(layer.transform.width)
                    ),
                    layer_id: Some(layer.id.clone()),
                });
            }
            if rounded(layout.height) > rounded(layer.transform.height) {
                warnings.push(ExportWarning {
                    code: TEXT_OVERFLOWS_BOX,
                    message: format!(
                        "layer {}: the text needs {} pixels of height and its box is {}, \
                         so it spills past the bottom",
                        layer.id,
                        number(layout.height),
                        number(layer.transform.height)
                    ),
                    layer_id: Some(layer.id.clone()),
                });
            }
        }
        LayerKind::Svg(svg) => {
            if let Some(warning) =
                svg_asset_warning(document, layer, &svg.asset, fonts, project_dir)
            {
                warnings.push(warning);
            }
        }
        // Every warning here is about text fitting or an imported asset; a
        // shape draws itself into its own box and has neither.
        LayerKind::Image(_) | LayerKind::Group(_) | LayerKind::Shape(_) => {}
    });
    warnings.extend(covered_text_warnings(&document.layers));
    warnings
}

/// How much of a text layer another layer must cover before it is worth
/// saying. Below this, an overlapping corner is usually the design.
const COVERED_ENOUGH: f64 = 0.55;

/// How solid a layer must be before it hides what is under it.
const OPAQUE_ENOUGH: f64 = 0.85;

/// Text that a later sibling covers, everywhere in the tree.
///
/// Siblings only: they share one coordinate space and one drawing order, so
/// "drawn over" is exactly "later in this list". Comparing across groups would
/// need the whole transform stack and would guess more than it knows.
/// Rotation is ignored, so a rotated cover is compared by its upright box.
fn covered_text_warnings(layers: &[assemblash_core::Layer]) -> Vec<ExportWarning> {
    let mut warnings = Vec::new();
    for (index, layer) in layers.iter().enumerate() {
        if let LayerKind::Group(group) = &layer.kind {
            warnings.extend(covered_text_warnings(&group.children));
        }
        if !matches!(layer.kind, LayerKind::Text(_)) || !layer.visible {
            continue;
        }
        let text_area = layer.transform.width * layer.transform.height;
        if text_area <= 0.0 {
            continue;
        }
        for above in layers.iter().skip(index + 1) {
            if !covers(above) {
                continue;
            }
            let share = overlap(&layer.transform, &above.transform) / text_area;
            if share < COVERED_ENOUGH {
                continue;
            }
            warnings.push(ExportWarning {
                code: TEXT_COVERED_BY_LAYER,
                message: format!(
                    "layer {}: layer {} is drawn over it and covers {} percent of its box, \
                     so the text may not be readable",
                    layer.id,
                    above.id,
                    number((share * 100.0).round())
                ),
                layer_id: Some(layer.id.clone()),
            });
            break;
        }
    }
    warnings
}

/// Whether a layer hides what is under it: solid, visible, and something that
/// paints its whole box.
fn covers(layer: &assemblash_core::Layer) -> bool {
    if !layer.visible || layer.opacity < OPAQUE_ENOUGH {
        return false;
    }
    match &layer.kind {
        // A shape with no fill is an outline; it hides nothing.
        LayerKind::Shape(shape) => shape.fill.is_some(),
        LayerKind::Image(_) => true,
        // An SVG, a group, or text can be mostly empty space, and guessing
        // would report designs that are fine.
        LayerKind::Svg(_) | LayerKind::Group(_) | LayerKind::Text(_) => false,
    }
}

/// The area two upright boxes share.
fn overlap(
    a: &assemblash_core::document::Transform,
    b: &assemblash_core::document::Transform,
) -> f64 {
    let width = (a.x + a.width).min(b.x + b.width) - a.x.max(b.x);
    let height = (a.y + a.height).min(b.y + b.height) - a.y.max(b.y);
    if width <= 0.0 || height <= 0.0 {
        0.0
    } else {
        width * height
    }
}

/// The DEF-2 symptom, made loud — and, since 1.5.0, never actually said.
///
/// The render refuses an SVG asset whose `<text>` no loaded font can draw, so
/// by the time anything asks for warnings this condition has already stopped
/// the export. It is kept, and kept using the renderer's own
/// [`families_in`](crate::svg::families_in) so the two cannot disagree, for the
/// one caller shape the refusal cannot see: [`crate::doc_to_svg`] reads the
/// asset out of a `data:` URI, so a caller that resolved its assets to file
/// paths instead gets no check there and this warning here. No shipped surface
/// does that — all three embed assets — which is why this is unreachable in
/// practice rather than merely unused.
fn svg_asset_warning(
    document: &Document,
    layer: &assemblash_core::Layer,
    asset: &assemblash_core::ids::AssetId,
    fonts: &FontSet,
    project_dir: &Path,
) -> Option<ExportWarning> {
    let asset = document.assets.iter().find(|stored| &stored.id == asset)?;
    let source = std::fs::read_to_string(storage::asset_path(project_dir, asset)).ok()?;
    let families = svg_import::text_families(&source).ok()?;
    // Exactly the families the render refuses on: a CSS list is satisfied by
    // any one of its members, and a list of nothing but generic roles names
    // nothing the store could hold.
    let unsatisfied = families
        .iter()
        .filter(|value| {
            let named = families_in(value);
            !named.iter().any(|family| fonts.contains(family))
        })
        .map(|family| {
            if family.is_empty() {
                // A `<text>` naming no family at all. Nothing can satisfy it,
                // which is why it always warns.
                "no font family".to_owned()
            } else {
                format!("{family:?}")
            }
        })
        .collect::<Vec<_>>();
    if unsatisfied.is_empty() {
        return None;
    }
    let wanted = unsatisfied.join(", ");
    Some(ExportWarning {
        code: SVG_ASSET_TEXT_WITHOUT_FONT,
        message: format!(
            "layer {}: the SVG asset draws text in {wanted}, which this render did not load, \
             so that text is invisible",
            layer.id
        ),
        layer_id: Some(layer.id.clone()),
    })
}

/// A length at the six decimal places the SVG writer rounds to.
///
/// Comparing rounded integers rather than floats is what keeps "does this
/// overflow?" the same answer on every target: a difference in the last bit
/// of a `f64` must not become a warning on one platform and silence on
/// another.
fn rounded(value: f64) -> i64 {
    if value.is_finite() {
        (value * 1_000_000.0).round() as i64
    } else {
        0
    }
}

#[cfg(test)]
mod covered_tests {
    #![allow(clippy::unwrap_used)]

    use super::*;
    use assemblash_core::document::{
        Extras, ShapeKind, ShapeLayer, TextAlign, TextLayer, Transform,
    };
    use assemblash_core::{Color, Layer};

    fn text(id: &str, transform: Transform) -> Layer {
        Layer::new(
            LayerId::new(id),
            transform,
            LayerKind::Text(TextLayer {
                text: "A COZY ESCAPE".to_owned(),
                font_family: "Noto Sans".to_owned(),
                font_size: 24.0,
                color: Some(Color::new("#101820")),
                align: TextAlign::Center,
                line_height: 1.2,
                font_weight: 400,
                font_style: assemblash_core::FontStyle::Normal,
                letter_spacing: 0.0,
                stroke: None,
                vertical_align: assemblash_core::VerticalAlign::Top,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        )
    }

    fn disc(id: &str, transform: Transform, fill: Option<Color>) -> Layer {
        Layer::new(
            LayerId::new(id),
            transform,
            LayerKind::Shape(ShapeLayer {
                shape: ShapeKind::Ellipse,
                fill,
                stroke: None,
                extra: Extras::new(),
            }),
        )
    }

    /// The mistake an agent cannot see: a sun drawn over the subtitle.
    #[test]
    fn a_solid_layer_over_text_is_reported_once() {
        let layers = vec![
            text("layer_text", Transform::new(100.0, 100.0, 200.0, 40.0)),
            disc(
                "layer_sun",
                Transform::new(90.0, 90.0, 220.0, 60.0),
                Some(Color::new("#ffcc00")),
            ),
        ];
        let warnings = covered_text_warnings(&layers);
        assert_eq!(warnings.len(), 1);
        assert_eq!(warnings[0].code, TEXT_COVERED_BY_LAYER);
        assert_eq!(warnings[0].layer_id, Some(LayerId::new("layer_text")));
        assert!(
            warnings[0].message.contains("layer_sun"),
            "{:?}",
            warnings[0]
        );
    }

    #[test]
    fn a_design_that_is_fine_says_nothing() {
        let above = || Transform::new(100.0, 100.0, 200.0, 40.0);
        let cases: Vec<(&str, Vec<Layer>)> = vec![
            (
                "the shape is under the text",
                vec![
                    disc("layer_card", above(), Some(Color::new("#ffffff"))),
                    text("layer_text", above()),
                ],
            ),
            (
                "the shape is an outline",
                vec![
                    text("layer_text", above()),
                    disc("layer_ring", above(), None),
                ],
            ),
            (
                "the shape barely touches",
                vec![
                    text("layer_text", above()),
                    disc(
                        "layer_corner",
                        Transform::new(280.0, 130.0, 60.0, 30.0),
                        Some(Color::new("#ffcc00")),
                    ),
                ],
            ),
        ];
        for (what, layers) in cases {
            assert!(covered_text_warnings(&layers).is_empty(), "{what}");
        }

        // A see-through layer does not hide the text either.
        let mut faint = disc(
            "layer_wash",
            Transform::new(90.0, 90.0, 220.0, 60.0),
            Some(Color::new("#ffcc00")),
        );
        faint.opacity = 0.3;
        let layers = vec![text("layer_text", above()), faint];
        assert!(covered_text_warnings(&layers).is_empty());
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used)]

    use super::*;

    #[test]
    fn a_warning_serialises_camel_case_and_omits_an_absent_layer() {
        let warning = ExportWarning {
            code: TEXT_OVERFLOWS_BOX,
            message: "too tall".to_owned(),
            layer_id: Some(LayerId::new("layer_one")),
        };
        let value = serde_json::to_value(&warning).unwrap();
        assert_eq!(value["code"], "textOverflowsBox");
        assert_eq!(value["layerId"], "layer_one");

        let general = ExportWarning {
            layer_id: None,
            ..warning
        };
        let value = serde_json::to_value(&general).unwrap();
        assert!(value.get("layerId").is_none());
    }

    #[test]
    fn overflow_is_decided_at_six_decimal_places() {
        // A hairline below the rounding threshold is not an overflow, so a
        // box sized exactly to its text does not warn anywhere.
        assert_eq!(rounded(100.000_000_4), rounded(100.0));
        assert!(rounded(100.000_002) > rounded(100.0));
    }
}
