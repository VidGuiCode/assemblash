//! What an export noticed and did not refuse (FR-11).
//!
//! A warning is not a failure. Each one names something the picture does that
//! its author probably did not ask for — a word split down the middle, text
//! running past the bottom of its box, an imported vector asset whose `<text>`
//! will draw as nothing — and the export still writes its file and still
//! succeeds. Refusing here would be worse: the file is correct, deterministic,
//! and exactly what the document says; it is the document that is surprising.
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
use crate::svg::{layout_text, number};

/// A word was wider than its box and was split at a character boundary.
pub const WORD_BROKEN_MID_WORD: &str = "wordBrokenMidWord";

/// A text layer's wrapped text is taller than the layer's own box.
pub const TEXT_OVERFLOWS_BOX: &str = "textOverflowsBox";

/// An imported SVG asset draws text in a family this render did not load.
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
        LayerKind::Image(_) | LayerKind::Group(_) => {}
    });
    warnings
}

/// The DEF-2 symptom, made loud.
///
/// Fonts are loaded for the families **text layers** name, never for the ones
/// an imported asset names, so a `<text>` inside an SVG asset draws as nothing
/// and the export still exits successfully. This does not fix that — loading
/// those families is gated on D7 — it says it is happening.
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
    if families.is_empty() || families.iter().any(|family| fonts.contains(family)) {
        return None;
    }

    let wanted = families
        .iter()
        .map(|family| {
            if family.is_empty() {
                // A `<text>` naming no family at all. Nothing can satisfy it,
                // which is why it always warns.
                "no font family".to_owned()
            } else {
                format!("{family:?}")
            }
        })
        .collect::<Vec<_>>()
        .join(", ");
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
