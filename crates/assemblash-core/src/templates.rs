//! Templates: named slots over an ordinary document (PRD use case C).
//!
//! A template is not a new kind of file. It is a document that names some of
//! its own layers — "headline", "logo" — so a script or an agent can supply
//! content without knowing which layer id that is this week, and without
//! being able to touch anything that was not offered.
//!
//! # Filling is ordinary operations
//!
//! [`fill_operations`] turns values into the same [`Operation`] values every
//! other surface sends. Nothing here writes to a document. That matters more
//! than it sounds: **a slot pointing at a protected layer is refused by the
//! operation layer**, automatically, because filling it *is* an update and
//! updates check the flags. Templates get the safety property by not being
//! special rather than by remembering to ask.
//!
//! # Additive, so `schemaVersion` stays 1
//!
//! `slots` has a default and is preserved verbatim by builds that do not know
//! it, exactly like `blendMode` and `effects` before it. A document written by
//! 0.11.0 loads here unchanged, and one written here loads there with the
//! slots carried through untouched. Bumping the version would break every
//! reader in exchange for a migration that had nothing to do.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::{Color, Document, LayerKind};
use crate::ids::{AssetId, LayerId};
use crate::ops::{Operation, UpdateLayer};

/// What a slot lets a caller supply.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum SlotKind {
    /// The text of a text layer.
    #[default]
    Text,
    /// The asset an image layer draws.
    Image,
    /// The fill colour of a text layer, or of a shape layer.
    ///
    /// One slot kind for both, resolved by the layer it points at (D8): a
    /// text layer's `color` and a shape layer's `fill` are the same question
    /// asked of two payloads, and a template that wanted a brand colour in
    /// both a headline and the badge behind it should not need two slot
    /// kinds to say so. A shape's *stroke* colour is not slot-able — a stroke
    /// is a colour and a width together, and half of one is not a value.
    Color,
}

/// What a layer of this kind is called, for slot errors and slot checks.
pub(crate) fn layer_kind_name(kind: &LayerKind) -> &'static str {
    match kind {
        LayerKind::Text(_) => "text",
        LayerKind::Image(_) => "image",
        LayerKind::Svg(_) => "svg",
        LayerKind::Group(_) => "group",
        LayerKind::Shape(_) => "shape",
    }
}

/// Whether a slot of this kind may point at a layer of that kind.
///
/// Shared by `validate_slots` here and by `defineSlot` in [`crate::ops`], so
/// that what a slot may be defined against and what it may be filled against
/// cannot drift apart.
pub(crate) fn slot_accepts(kind: SlotKind, layer_kind: &str) -> bool {
    match kind {
        SlotKind::Text => layer_kind == "text",
        SlotKind::Color => layer_kind == "text" || layer_kind == "shape",
        SlotKind::Image => layer_kind == "image",
    }
}

/// What a slot of this kind needs its layer to be, for the error message.
pub(crate) fn slot_wants(kind: SlotKind) -> &'static str {
    match kind {
        SlotKind::Text => "text",
        SlotKind::Color => "text or shape",
        SlotKind::Image => "image",
    }
}

/// A named opening in a template.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Slot {
    /// What a caller names this slot by. Unique within a document.
    pub name: String,
    /// The layer it fills.
    pub layer: LayerId,
    /// What may be supplied for it.
    #[serde(default)]
    pub kind: SlotKind,
    /// What this slot is for, for whoever is filling it — including an agent,
    /// which is the case that needs it most.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Whether a variant must supply it.
    #[serde(default)]
    pub required: bool,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: crate::document::Extras,
}

/// Something wrong with a template or the values offered for it.
#[derive(Debug, thiserror::Error, PartialEq, Eq)]
#[non_exhaustive]
pub enum TemplateError {
    /// The document declares no slots.
    #[error("this document has no slots, so there is nothing to fill")]
    NotATemplate,

    /// A value was supplied for a name no slot has.
    ///
    /// Refused rather than ignored: a typo in a slot name would otherwise
    /// produce a variant that looks right and is missing the thing you meant
    /// to change.
    #[error("no slot named {name:?}; this template has: {available}")]
    NoSuchSlot {
        /// The name that was offered.
        name: String,
        /// What it does have.
        available: String,
    },

    /// A required slot was left out.
    #[error("slot {name:?} is required and was not given a value")]
    MissingRequired {
        /// The slot that was missed.
        name: String,
    },

    /// A slot names a layer that is not in the document.
    #[error("slot {name:?} points at layer {layer}, which is not in this document")]
    DanglingSlot {
        /// The slot at fault.
        name: String,
        /// The layer it names.
        layer: LayerId,
    },

    /// A slot's kind does not match the layer it points at.
    #[error("slot {name:?} is a {kind} slot but layer {layer} is a {found} layer")]
    WrongLayerKind {
        /// The slot at fault.
        name: String,
        /// What the slot claims.
        kind: &'static str,
        /// The layer it names.
        layer: LayerId,
        /// What that layer actually is.
        found: &'static str,
    },

    /// Two slots share a name.
    #[error("two slots are both named {name:?}")]
    DuplicateSlot {
        /// The name in question.
        name: String,
    },
}

/// One variant's worth of values: slot name to what goes in it.
pub type SlotValues = std::collections::BTreeMap<String, String>;

/// Checks that a document's slots make sense against its own layers.
///
/// Called before anything is filled, so a broken template is reported once and
/// clearly rather than as a confusing failure partway through a batch.
pub fn validate_slots(document: &Document) -> Result<(), TemplateError> {
    let mut seen = std::collections::BTreeSet::new();
    for slot in &document.slots {
        if !seen.insert(slot.name.as_str()) {
            return Err(TemplateError::DuplicateSlot {
                name: slot.name.clone(),
            });
        }
        let layer =
            document
                .find_layer(&slot.layer)
                .ok_or_else(|| TemplateError::DanglingSlot {
                    name: slot.name.clone(),
                    layer: slot.layer.clone(),
                })?;
        let found = layer_kind_name(&layer.kind);
        if !slot_accepts(slot.kind, found) {
            return Err(TemplateError::WrongLayerKind {
                name: slot.name.clone(),
                kind: slot_wants(slot.kind),
                layer: slot.layer.clone(),
                found,
            });
        }
    }
    Ok(())
}

/// The operations that fill a template with one set of values.
///
/// Returns operations rather than a document, so they go through
/// [`crate::ops::apply`] like everything else — which is what makes a slot
/// pointing at a protected layer refuse, and what puts a fill in the journal
/// when it is applied to a real project.
pub fn fill_operations(
    document: &Document,
    values: &SlotValues,
) -> Result<Vec<Operation>, TemplateError> {
    if document.slots.is_empty() {
        return Err(TemplateError::NotATemplate);
    }
    validate_slots(document)?;

    // A name nothing matches is a mistake, not a no-op: a typo would produce
    // a variant that looks finished and is missing what you meant to change.
    for name in values.keys() {
        if !document.slots.iter().any(|slot| &slot.name == name) {
            return Err(TemplateError::NoSuchSlot {
                name: name.clone(),
                available: slot_names(document).join(", "),
            });
        }
    }

    let mut operations = Vec::new();
    for slot in &document.slots {
        let Some(value) = values.get(&slot.name) else {
            if slot.required {
                return Err(TemplateError::MissingRequired {
                    name: slot.name.clone(),
                });
            }
            // Not supplied and not required: the template's own content
            // stands, which is how a partial fill keeps its defaults.
            continue;
        };

        let update = match slot.kind {
            SlotKind::Text => UpdateLayer {
                text: Some(value.clone()),
                ..UpdateLayer::new(slot.layer.clone())
            },
            // D8: one colour slot, two properties. Which one it is depends on
            // the layer it points at, not on the slot — a text layer takes
            // `color`, a shape layer takes `fill`. `validate_slots` has
            // already established that the layer exists and is one of the
            // two, so anything else here is a text layer's `color`.
            SlotKind::Color => {
                let is_shape = matches!(
                    document.find_layer(&slot.layer).map(|layer| &layer.kind),
                    Some(LayerKind::Shape(_))
                );
                if is_shape {
                    UpdateLayer {
                        fill: Some(Some(Color::new(value.clone()))),
                        ..UpdateLayer::new(slot.layer.clone())
                    }
                } else {
                    UpdateLayer {
                        color: Some(Color::new(value.clone())),
                        ..UpdateLayer::new(slot.layer.clone())
                    }
                }
            }
            SlotKind::Image => UpdateLayer {
                asset: Some(AssetId::new(value.clone())),
                ..UpdateLayer::new(slot.layer.clone())
            },
        };
        operations.push(Operation::Update(update));
    }
    Ok(operations)
}

/// Every slot name, sorted, for error messages and for listing a template.
pub fn slot_names(document: &Document) -> Vec<String> {
    let mut names: Vec<String> = document
        .slots
        .iter()
        .map(|slot| slot.name.clone())
        .collect();
    names.sort();
    names
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;
    use crate::document::{Extras, ImageFit, ImageLayer, TextAlign, TextLayer, Transform};
    use crate::ids::SequentialIdSource;
    use crate::{Asset, Layer};

    fn template() -> Document {
        let mut document = Document::new(&mut SequentialIdSource::new(), 100.0, 100.0);
        document.layers.push(Layer::new(
            LayerId::new("layer_headline"),
            Transform::new(0.0, 0.0, 100.0, 20.0),
            LayerKind::Text(TextLayer {
                text: "default".to_owned(),
                font_family: "Inter".to_owned(),
                font_size: 12.0,
                color: Color::new("#000000"),
                align: TextAlign::Left,
                line_height: 1.2,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        ));
        document.assets.push(Asset {
            id: AssetId::new("asset_one"),
            path: "one.png".to_owned(),
            hash: format!("sha256:{}", "0".repeat(64)),
            media_type: "image/png".to_owned(),
            width: None,
            height: None,
            extra: Extras::new(),
        });
        document.layers.push(Layer::new(
            LayerId::new("layer_logo"),
            Transform::new(0.0, 30.0, 40.0, 40.0),
            LayerKind::Image(ImageLayer {
                asset: AssetId::new("asset_one"),
                fit: ImageFit::Contain,
                extra: Extras::new(),
            }),
        ));
        document.slots = vec![
            Slot {
                name: "headline".to_owned(),
                layer: LayerId::new("layer_headline"),
                kind: SlotKind::Text,
                description: Some("The big line".to_owned()),
                required: true,
                extra: Extras::new(),
            },
            Slot {
                name: "logo".to_owned(),
                layer: LayerId::new("layer_logo"),
                kind: SlotKind::Image,
                description: None,
                required: false,
                extra: Extras::new(),
            },
        ];
        document
    }

    fn values(pairs: &[(&str, &str)]) -> SlotValues {
        pairs
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect()
    }

    #[test]
    fn filling_produces_ordinary_update_operations() {
        let document = template();
        let operations = fill_operations(&document, &values(&[("headline", "Hello")])).unwrap();
        assert_eq!(operations.len(), 1, "only the slot that was given a value");
        let Operation::Update(update) = &operations[0] else {
            panic!("expected an update, got {:?}", operations[0]);
        };
        assert_eq!(update.id, LayerId::new("layer_headline"));
        assert_eq!(update.text.as_deref(), Some("Hello"));
    }

    #[test]
    fn a_required_slot_must_be_given_a_value() {
        let document = template();
        let error = fill_operations(&document, &values(&[("logo", "asset_one")])).unwrap_err();
        assert_eq!(
            error,
            TemplateError::MissingRequired {
                name: "headline".to_owned()
            }
        );
    }

    #[test]
    fn a_name_no_slot_has_is_refused_rather_than_ignored() {
        // The whole point: a typo must not produce a variant that looks
        // finished and is missing what you meant to change.
        let document = template();
        let error = fill_operations(
            &document,
            &values(&[("headline", "Hi"), ("headlien", "oops")]),
        )
        .unwrap_err();
        let TemplateError::NoSuchSlot { name, available } = &error else {
            panic!("{error:?}");
        };
        assert_eq!(name, "headlien");
        assert!(available.contains("headline"), "{available}");
    }

    #[test]
    fn a_document_with_no_slots_is_not_a_template() {
        let document = Document::new(&mut SequentialIdSource::new(), 10.0, 10.0);
        assert_eq!(
            fill_operations(&document, &SlotValues::new()).unwrap_err(),
            TemplateError::NotATemplate
        );
    }

    #[test]
    fn a_slot_must_match_the_layer_it_points_at() {
        let mut document = template();
        document.slots[0].kind = SlotKind::Image;
        let error = validate_slots(&document).unwrap_err();
        assert!(
            matches!(error, TemplateError::WrongLayerKind { .. }),
            "{error:?}"
        );
    }

    #[test]
    fn a_slot_pointing_nowhere_is_caught_before_anything_is_filled() {
        let mut document = template();
        document.slots[0].layer = LayerId::new("layer_gone");
        let error = validate_slots(&document).unwrap_err();
        assert!(
            matches!(error, TemplateError::DanglingSlot { .. }),
            "{error:?}"
        );
    }

    #[test]
    fn two_slots_may_not_share_a_name() {
        let mut document = template();
        document.slots[1].name = "headline".to_owned();
        document.slots[1].kind = SlotKind::Text;
        document.slots[1].layer = LayerId::new("layer_headline");
        assert_eq!(
            validate_slots(&document).unwrap_err(),
            TemplateError::DuplicateSlot {
                name: "headline".to_owned()
            }
        );
    }

    /// A template whose colour slot points at a shape layer instead of text.
    fn shape_template() -> Document {
        use crate::document::{ShapeKind, ShapeLayer, Stroke};

        let mut document = Document::new(&mut SequentialIdSource::new(), 100.0, 100.0);
        document.layers.push(Layer::new(
            LayerId::new("layer_badge"),
            Transform::new(0.0, 0.0, 60.0, 24.0),
            LayerKind::Shape(ShapeLayer {
                shape: ShapeKind::Rect { corner_radius: 6.0 },
                fill: Some(Color::new("#3366cc")),
                stroke: Some(Stroke {
                    color: Color::new("#112233"),
                    width: 1.0,
                }),
                extra: Extras::new(),
            }),
        ));
        document.slots = vec![Slot {
            name: "brand".to_owned(),
            layer: LayerId::new("layer_badge"),
            kind: SlotKind::Color,
            description: None,
            required: false,
            extra: Extras::new(),
        }];
        document
    }

    #[test]
    fn a_colour_slot_fills_a_text_layers_colour() {
        let mut document = template();
        document.slots[0].kind = SlotKind::Color;
        let operations = fill_operations(&document, &values(&[("headline", "#ff0000")])).unwrap();
        let Operation::Update(update) = &operations[0] else {
            panic!("expected an update, got {:?}", operations[0]);
        };
        assert_eq!(update.color, Some(Color::new("#ff0000")));
        assert_eq!(update.fill, None, "a text layer has no fill");
    }

    #[test]
    fn a_colour_slot_fills_a_shape_layers_fill() {
        // D8: the same slot kind, resolved by the layer it points at.
        let document = shape_template();
        assert!(validate_slots(&document).is_ok());

        let operations = fill_operations(&document, &values(&[("brand", "#ff0000")])).unwrap();
        let Operation::Update(update) = &operations[0] else {
            panic!("expected an update, got {:?}", operations[0]);
        };
        assert_eq!(update.fill, Some(Some(Color::new("#ff0000"))));
        assert_eq!(update.color, None, "a shape layer has no text colour");
    }

    #[test]
    fn a_colour_slot_still_refuses_a_layer_that_is_neither() {
        let mut document = shape_template();
        document.layers[0] = Layer::new(
            LayerId::new("layer_badge"),
            Transform::default(),
            LayerKind::Group(crate::document::GroupLayer {
                children: Vec::new(),
                extra: Extras::new(),
            }),
        );
        let error = validate_slots(&document).unwrap_err();
        let TemplateError::WrongLayerKind { kind, found, .. } = &error else {
            panic!("{error:?}");
        };
        assert_eq!(*kind, "text or shape");
        assert_eq!(*found, "group");
    }

    #[test]
    fn slots_survive_a_round_trip_and_a_build_that_ignores_them() {
        // Additive: `slots` has a default, so a document from before this
        // existed loads unchanged, and one written here keeps its slots
        // through a build that never looks at them.
        let document = template();
        let json = serde_json::to_string(&document).unwrap();
        let back: Document = serde_json::from_str(&json).unwrap();
        assert_eq!(back, document);

        let older = serde_json::json!({
            "schemaVersion": 1,
            "id": "doc_1",
            "canvas": { "width": 10.0, "height": 10.0 },
            "assets": [],
            "layers": []
        });
        let loaded: Document = serde_json::from_value(older).unwrap();
        assert!(loaded.slots.is_empty(), "a document without slots is fine");
    }
}
