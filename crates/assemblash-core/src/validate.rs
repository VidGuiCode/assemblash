//! Document validation.
//!
//! Validation is separate from parsing on purpose: parsing accepts anything
//! shaped like a document (including keys from future versions), and
//! validation then says precisely what is wrong with it.

use std::collections::HashSet;

use crate::document::{Color, Document, Effect, Layer, LayerKind};
use crate::error::{ValidationError, ValidationErrors};
use crate::ids::AssetId;
use crate::SCHEMA_VERSION;

/// Checks a document and reports every problem found.
///
/// The schema version is checked first and, if unsupported, is reported alone:
/// field-level complaints about a document from a future version would be
/// noise.
pub fn validate(document: &Document) -> Result<(), ValidationErrors> {
    if document.schema_version != SCHEMA_VERSION {
        return Err(ValidationErrors::new(vec![
            ValidationError::UnsupportedSchemaVersion {
                found: document.schema_version,
                supported: SCHEMA_VERSION,
            },
        ]));
    }

    let mut errors = Vec::new();

    if !document.id.is_well_formed() {
        errors.push(ValidationError::MalformedId {
            id: document.id.to_string(),
            expected: "doc",
        });
    }

    check_canvas(document, &mut errors);
    check_assets(document, &mut errors);
    check_presets(document, &mut errors);

    let known_assets: HashSet<&AssetId> = document.assets.iter().map(|a| &a.id).collect();
    let mut seen_layers = HashSet::new();
    document.walk_layers(&mut |layer| {
        check_layer(layer, &known_assets, &mut errors);
        if !seen_layers.insert(layer.id.clone()) {
            errors.push(ValidationError::DuplicateLayerId {
                id: layer.id.clone(),
            });
        }
    });

    if errors.is_empty() {
        Ok(())
    } else {
        Err(ValidationErrors::new(errors))
    }
}

fn check_canvas(document: &Document, errors: &mut Vec<ValidationError>) {
    for (dimension, value) in [
        ("width", document.canvas.width),
        ("height", document.canvas.height),
    ] {
        if !value.is_finite() || value <= 0.0 {
            errors.push(ValidationError::InvalidCanvasDimension { dimension, value });
        }
    }

    if let Some(background) = &document.canvas.background {
        check_color(background, "canvas background", errors);
    }
}

fn check_assets(document: &Document, errors: &mut Vec<ValidationError>) {
    let mut seen = HashSet::new();
    for asset in &document.assets {
        if !asset.id.is_well_formed() {
            errors.push(ValidationError::MalformedId {
                id: asset.id.to_string(),
                expected: "asset",
            });
        }
        if !seen.insert(asset.id.clone()) {
            errors.push(ValidationError::DuplicateAssetId {
                id: asset.id.clone(),
            });
        }
        if !is_safe_relative_path(&asset.path) {
            errors.push(ValidationError::InvalidAssetPath {
                asset: asset.id.clone(),
                path: asset.path.clone(),
            });
        }
        if !is_sha256(&asset.hash) {
            errors.push(ValidationError::InvalidAssetHash {
                asset: asset.id.clone(),
                hash: asset.hash.clone(),
            });
        }
    }
}

/// Checks the document's presets.
///
/// Only what makes a preset *unusable* is an error: a duplicate name means one
/// of them can never be applied. The properties themselves are checked by the
/// operation that stores one, and again by the update it compiles to, so a
/// preset cannot carry a style the engine would refuse to draw.
fn check_presets(document: &Document, errors: &mut Vec<ValidationError>) {
    let mut seen = HashSet::new();
    for preset in &document.presets {
        if !seen.insert(preset.name.as_str()) {
            errors.push(ValidationError::DuplicatePreset {
                name: preset.name.clone(),
            });
        }
    }
}

fn check_layer(layer: &Layer, known_assets: &HashSet<&AssetId>, errors: &mut Vec<ValidationError>) {
    if !layer.id.is_well_formed() {
        errors.push(ValidationError::MalformedId {
            id: layer.id.to_string(),
            expected: "layer",
        });
    }

    let t = &layer.transform;
    for (field, value) in [("x", t.x), ("y", t.y), ("rotation", t.rotation)] {
        if !value.is_finite() {
            errors.push(ValidationError::InvalidTransform {
                layer: layer.id.clone(),
                field,
                value,
            });
        }
    }
    for (field, value) in [("width", t.width), ("height", t.height)] {
        if !value.is_finite() || value < 0.0 {
            errors.push(ValidationError::InvalidTransform {
                layer: layer.id.clone(),
                field,
                value,
            });
        }
    }

    if !layer.opacity.is_finite() || !(0.0..=1.0).contains(&layer.opacity) {
        errors.push(ValidationError::InvalidOpacity {
            layer: layer.id.clone(),
            value: layer.opacity,
        });
    }

    check_effects(layer, errors);

    match &layer.kind {
        LayerKind::Text(text) => {
            if !text.font_size.is_finite() || text.font_size <= 0.0 {
                errors.push(ValidationError::InvalidFontSize {
                    layer: layer.id.clone(),
                    value: text.font_size,
                });
            }
            if !text.line_height.is_finite() || text.line_height <= 0.0 {
                errors.push(ValidationError::InvalidLineHeight {
                    layer: layer.id.clone(),
                    value: text.line_height,
                });
            }
            check_color(&text.color, &format!("layer {}", layer.id), errors);
        }
        LayerKind::Image(image) => {
            if !known_assets.contains(&image.asset) {
                errors.push(ValidationError::DanglingAssetRef {
                    layer: layer.id.clone(),
                    asset: image.asset.clone(),
                });
            }
        }
        LayerKind::Svg(svg) => {
            if !known_assets.contains(&svg.asset) {
                errors.push(ValidationError::DanglingAssetRef {
                    layer: layer.id.clone(),
                    asset: svg.asset.clone(),
                });
            }
        }
        // Children are visited by the caller's walk; nothing group-specific
        // to check beyond what every layer gets.
        LayerKind::Group(_) => {}
    }
}

/// Checks a layer's effect stack.
///
/// An effect this build does not know is *not* an error here: preserving it is
/// the point, and a document full of a newer build's effects should still
/// validate, list, and inspect. It is refused where it actually matters —
/// when something tries to draw it.
fn check_effects(layer: &Layer, errors: &mut Vec<ValidationError>) {
    for effect in &layer.effects {
        let mut bad = |field: &'static str, expected: &'static str, value: f64| {
            errors.push(ValidationError::InvalidEffect {
                layer: layer.id.clone(),
                effect: effect.type_name().to_owned(),
                field,
                expected,
                value,
            });
        };
        match effect {
            // No upper bound: brightness 4 on a dark photograph is a real
            // thing to want, and the renderer clamps at white anyway.
            Effect::Brightness { amount }
            | Effect::Contrast { amount }
            | Effect::Saturation { amount } => {
                if !amount.is_finite() || *amount < 0.0 {
                    bad("amount", "a finite number of 0 or more", *amount);
                }
            }
            Effect::Blur { radius } => {
                if !radius.is_finite() || *radius < 0.0 {
                    bad("radius", "a finite number of 0 or more", *radius);
                }
            }
            Effect::Grain {
                amount,
                seed: _,
                scale,
            } => {
                // Grain is a swing either side of unchanged, so more than 1
                // would mean "darker than black", which is not a stronger
                // effect — it is a meaningless one.
                if !amount.is_finite() || !(0.0..=1.0).contains(amount) {
                    bad("amount", "between 0 and 1", *amount);
                }
                if !scale.is_finite() || *scale <= 0.0 {
                    bad("scale", "a finite number greater than 0", *scale);
                }
            }
            Effect::Other(_) => {}
        }
    }
}

fn check_color(color: &Color, context: &str, errors: &mut Vec<ValidationError>) {
    if !color.is_valid() {
        errors.push(ValidationError::InvalidColor {
            context: context.to_owned(),
            value: color.as_str().to_owned(),
        });
    }
}

/// Asset paths stay inside `assets/` — the filesystem boundary (PRD §10.1)
/// starts in the document model, not only at the API edge.
fn is_safe_relative_path(path: &str) -> bool {
    if path.is_empty() || path.starts_with('/') || path.starts_with('\\') {
        return false;
    }
    // A Windows drive letter or UNC path is absolute even without a leading
    // separator.
    if path.len() >= 2 && path.as_bytes()[1] == b':' {
        return false;
    }
    !path
        .split(['/', '\\'])
        .any(|segment| segment == ".." || segment.is_empty())
}

fn is_sha256(hash: &str) -> bool {
    match hash.strip_prefix("sha256:") {
        Some(hex) => hex.len() == 64 && hex.bytes().all(|b| b.is_ascii_hexdigit()),
        None => false,
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;
    use crate::document::{Asset, Extras, ImageFit, ImageLayer, Transform};
    use crate::ids::{LayerId, SequentialIdSource};

    fn document() -> Document {
        Document::new(&mut SequentialIdSource::new(), 100.0, 50.0)
    }

    fn image_layer(asset: &str) -> Layer {
        Layer::new(
            LayerId::new("layer_1"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Image(ImageLayer {
                asset: AssetId::new(asset),
                fit: ImageFit::Fill,
                extra: Extras::new(),
            }),
        )
    }

    fn asset(id: &str, path: &str) -> Asset {
        Asset {
            id: AssetId::new(id),
            path: path.to_owned(),
            hash: format!("sha256:{}", "a".repeat(64)),
            media_type: "image/png".to_owned(),
            width: None,
            height: None,
            extra: Extras::new(),
        }
    }

    fn errors(document: &Document) -> Vec<ValidationError> {
        validate(document).unwrap_err().into_inner()
    }

    #[test]
    fn a_fresh_document_is_valid() {
        assert!(validate(&document()).is_ok());
    }

    #[test]
    fn future_schema_version_is_reported_alone() {
        let mut doc = document();
        doc.schema_version = 99;
        doc.canvas.width = -1.0;
        assert_eq!(
            errors(&doc),
            vec![ValidationError::UnsupportedSchemaVersion {
                found: 99,
                supported: SCHEMA_VERSION,
            }]
        );
    }

    #[test]
    fn zero_and_nan_canvas_dimensions_are_rejected() {
        let mut doc = document();
        doc.canvas.width = 0.0;
        doc.canvas.height = f64::NAN;
        assert_eq!(errors(&doc).len(), 2);
    }

    #[test]
    fn dangling_asset_reference_is_rejected() {
        let mut doc = document();
        doc.layers.push(image_layer("asset_missing"));
        assert!(matches!(
            errors(&doc).as_slice(),
            [ValidationError::DanglingAssetRef { .. }]
        ));

        doc.assets.push(asset("asset_missing", "img/a.png"));
        assert!(validate(&doc).is_ok());
    }

    #[test]
    fn duplicate_layer_ids_are_rejected_across_nesting() {
        use crate::document::GroupLayer;
        let mut doc = document();
        doc.assets.push(asset("asset_1", "a.png"));
        let group = Layer::new(
            LayerId::new("layer_1"),
            Transform::default(),
            LayerKind::Group(GroupLayer {
                children: vec![image_layer("asset_1")],
                extra: Extras::new(),
            }),
        );
        doc.layers.push(group);
        assert!(matches!(
            errors(&doc).as_slice(),
            [ValidationError::DuplicateLayerId { .. }]
        ));
    }

    #[test]
    fn asset_paths_may_not_escape_the_assets_directory() {
        for bad in [
            "",
            "/etc/passwd",
            "../secrets.png",
            "C:\\keys.png",
            "a//b.png",
        ] {
            let mut doc = document();
            doc.assets.push(asset("asset_1", bad));
            assert!(
                errors(&doc)
                    .iter()
                    .any(|e| matches!(e, ValidationError::InvalidAssetPath { .. })),
                "path {bad:?} should be rejected"
            );
        }

        let mut doc = document();
        doc.assets.push(asset("asset_1", "nested/dir/a.png"));
        assert!(validate(&doc).is_ok());
    }

    #[test]
    fn bad_hashes_opacity_and_colors_are_reported_together() {
        use crate::document::{TextAlign, TextLayer};
        let mut doc = document();
        let mut layer = Layer::new(
            LayerId::new("layer_1"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Text(TextLayer {
                text: "x".into(),
                font_family: "Inter".into(),
                font_size: 0.0,
                color: Color::new("nope"),
                align: TextAlign::Left,
                line_height: 1.2,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        );
        layer.opacity = 1.5;
        doc.layers.push(layer);
        doc.assets.push(Asset {
            hash: "md5:abc".to_owned(),
            ..asset("asset_1", "a.png")
        });

        let found = errors(&doc);
        assert_eq!(found.len(), 4, "{found:?}");
    }
}
