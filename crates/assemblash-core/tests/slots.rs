//! The v0.17.0 operations: a template can be authored rather than hand-edited.
//!
//! Every refusal here happens at **definition** time. That is the whole reason
//! these are operations: filling a slot was already refused on protected
//! chrome, because a fill is an `Update`, but defining one is not a fill.
//! Without these checks a template could advertise an opening that always
//! fails — the author would think they had offered something, and every
//! variant would refuse.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{Extras, ImageFit, ImageLayer, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource, UlidIdSource};
use assemblash_core::ops::{apply, OpError, Operation};
use assemblash_core::{validate, Asset, Color, Document, Layer, LayerKind, Slot, SlotKind};

/// A document with a headline, a logo, and a line of protected chrome.
fn document() -> Document {
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 220.0);
    document.assets.push(Asset {
        id: AssetId::new("asset_1"),
        path: "logo.png".to_owned(),
        hash: format!("sha256:{}", "0".repeat(64)),
        media_type: "image/png".to_owned(),
        width: Some(4),
        height: Some(4),
        extra: Extras::new(),
    });

    let text = |id: &str, y: f64, body: &str| {
        Layer::new(
            LayerId::new(id),
            Transform::new(10.0, y, 380.0, 50.0),
            LayerKind::Text(TextLayer {
                text: body.to_owned(),
                font_family: "Noto Sans".to_owned(),
                font_size: 24.0,
                color: Color::new("#101820"),
                align: TextAlign::Left,
                line_height: 1.2,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        )
    };

    document
        .layers
        .push(text("layer_headline", 10.0, "headline"));
    document.layers.push(Layer::new(
        LayerId::new("layer_logo"),
        Transform::new(10.0, 70.0, 60.0, 60.0),
        LayerKind::Image(ImageLayer {
            asset: AssetId::new("asset_1"),
            fit: ImageFit::Contain,
            extra: Extras::new(),
        }),
    ));

    let mut chrome = text("layer_chrome", 150.0, "© the client");
    chrome.protected = true;
    document.layers.push(chrome);

    let mut legal = text("layer_legal", 190.0, "terms apply");
    legal.read_only = true;
    document.layers.push(legal);

    document
}

fn slot(name: &str, layer: &str, kind: SlotKind) -> Slot {
    Slot {
        name: name.to_owned(),
        layer: LayerId::new(layer),
        kind,
        description: None,
        required: false,
        extra: Extras::new(),
    }
}

fn define(document: &mut Document, slot: Slot) -> Result<(), OpError> {
    apply(document, &Operation::DefineSlot { slot }, &mut UlidIdSource).map(|_| ())
}

#[test]
fn defining_a_slot_makes_a_document_a_template() {
    let mut document = document();
    assert!(document.slots.is_empty());

    define(
        &mut document,
        Slot {
            description: Some("The big line".to_owned()),
            required: true,
            ..slot("headline", "layer_headline", SlotKind::Text)
        },
    )
    .unwrap();
    define(&mut document, slot("logo", "layer_logo", SlotKind::Image)).unwrap();
    // A colour slot points at a text layer: it fills the text's colour.
    define(
        &mut document,
        slot("tint", "layer_headline", SlotKind::Color),
    )
    .unwrap();

    assert_eq!(
        assemblash_core::templates::slot_names(&document),
        vec!["headline", "logo", "tint"]
    );
    assert!(validate(&document).is_ok());
    assert!(assemblash_core::templates::validate_slots(&document).is_ok());
}

#[test]
fn a_slot_may_not_be_aimed_at_chrome() {
    // The refusal this milestone exists for. Filling protected chrome was
    // already impossible; offering it was not, and an opening that always
    // refuses is worse than no opening because it looks like a promise.
    let mut document = document();

    let error = define(
        &mut document,
        slot("sneaky", "layer_chrome", SlotKind::Text),
    )
    .unwrap_err();
    assert!(
        matches!(&error, OpError::LayerProtected { id } if id.as_str() == "layer_chrome"),
        "{error:?}"
    );

    let error = define(&mut document, slot("legal", "layer_legal", SlotKind::Text)).unwrap_err();
    assert!(
        matches!(&error, OpError::LayerReadOnly { id } if id.as_str() == "layer_legal"),
        "{error:?}"
    );

    assert!(document.slots.is_empty(), "a refusal left something behind");
}

#[test]
fn a_slot_must_name_a_layer_that_exists_and_match_its_kind() {
    let mut document = document();

    let error = define(&mut document, slot("ghost", "layer_gone", SlotKind::Text)).unwrap_err();
    assert!(matches!(error, OpError::NoSuchLayer { .. }), "{error:?}");

    // An image slot on a text layer could never be filled with anything
    // sensible, so it is refused where it is written rather than reported
    // later by validation.
    let error = define(
        &mut document,
        slot("wrong", "layer_headline", SlotKind::Image),
    )
    .unwrap_err();
    let OpError::SlotKindMismatch {
        name, wants, found, ..
    } = &error
    else {
        panic!("{error:?}");
    };
    assert_eq!((name.as_str(), *wants, *found), ("wrong", "image", "text"));

    assert!(document.slots.is_empty());
}

#[test]
fn two_slots_may_not_share_a_name() {
    let mut document = document();
    define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Text),
    )
    .unwrap();

    let error = define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Color),
    )
    .unwrap_err();
    assert!(
        matches!(&error, OpError::InvalidSlot { reason, .. } if reason.contains("already")),
        "{error:?}"
    );
    assert_eq!(document.slots.len(), 1);

    let error = define(&mut document, slot("  ", "layer_headline", SlotKind::Text)).unwrap_err();
    assert!(
        matches!(&error, OpError::InvalidSlot { reason, .. } if reason.contains("needs a name")),
        "{error:?}"
    );
}

#[test]
fn updating_a_slot_faces_the_checks_a_definition_faces() {
    let mut document = document();
    define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Text),
    )
    .unwrap();

    // Renaming and re-describing.
    apply(
        &mut document,
        &Operation::UpdateSlot {
            name: "headline".to_owned(),
            slot: Slot {
                description: Some("now with a description".to_owned()),
                required: true,
                ..slot("title", "layer_headline", SlotKind::Text)
            },
        },
        &mut UlidIdSource,
    )
    .unwrap();
    assert_eq!(assemblash_core::templates::slot_names(&document), ["title"]);
    assert!(document.slots[0].required);

    // An update must not be able to produce a slot a definition would have
    // refused, or the check is only a suggestion.
    let error = apply(
        &mut document,
        &Operation::UpdateSlot {
            name: "title".to_owned(),
            slot: slot("title", "layer_chrome", SlotKind::Text),
        },
        &mut UlidIdSource,
    )
    .unwrap_err();
    assert!(matches!(error, OpError::LayerProtected { .. }), "{error:?}");

    // And updating one that is not there says what is.
    let error = apply(
        &mut document,
        &Operation::UpdateSlot {
            name: "nope".to_owned(),
            slot: slot("nope", "layer_headline", SlotKind::Text),
        },
        &mut UlidIdSource,
    )
    .unwrap_err();
    let OpError::NoSuchSlot { available, .. } = &error else {
        panic!("{error:?}");
    };
    assert!(available.contains("title"), "{available}");
}

#[test]
fn removing_a_slot_leaves_the_layer_alone() {
    let mut document = document();
    define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Text),
    )
    .unwrap();
    let layer_before = document.layers[0].clone();

    apply(
        &mut document,
        &Operation::RemoveSlot {
            name: "headline".to_owned(),
        },
        &mut UlidIdSource,
    )
    .unwrap();

    assert!(document.slots.is_empty());
    assert_eq!(document.layers[0], layer_before, "the layer was touched");

    let error = apply(
        &mut document,
        &Operation::RemoveSlot {
            name: "headline".to_owned(),
        },
        &mut UlidIdSource,
    )
    .unwrap_err();
    assert!(matches!(error, OpError::NoSuchSlot { .. }), "{error:?}");
}

#[test]
fn a_layer_a_slot_offers_cannot_be_deleted_out_from_under_it() {
    // Refused rather than cascading: an agent deleting a layer must not
    // silently break a contract other callers are filling. A dangling slot
    // would also make the document invalid, so doing nothing is not an option.
    let mut document = document();
    define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Text),
    )
    .unwrap();

    let error = apply(
        &mut document,
        &Operation::Delete {
            id: LayerId::new("layer_headline"),
        },
        &mut UlidIdSource,
    )
    .unwrap_err();
    let OpError::LayerIsSlotTarget { id, slots } = &error else {
        panic!("{error:?}");
    };
    assert_eq!(id.as_str(), "layer_headline");
    assert_eq!(slots, "headline");
    assert_eq!(document.layers.len(), 4, "the refusal deleted something");

    // Removing the slot first is the whole fix, and the error said so.
    apply(
        &mut document,
        &Operation::RemoveSlot {
            name: "headline".to_owned(),
        },
        &mut UlidIdSource,
    )
    .unwrap();
    apply(
        &mut document,
        &Operation::Delete {
            id: LayerId::new("layer_headline"),
        },
        &mut UlidIdSource,
    )
    .unwrap();
    assert_eq!(document.layers.len(), 3);
    assert!(validate(&document).is_ok());
}

#[test]
fn a_group_holding_a_slot_target_cannot_be_deleted_either() {
    // The group case is the one that would be easy to miss: the slot points at
    // a child, and deleting the group takes the child with it.
    let mut document = Document::new(&mut SequentialIdSource::new(), 200.0, 200.0);
    let child = Layer::new(
        LayerId::new("layer_child"),
        Transform::new(0.0, 0.0, 50.0, 20.0),
        LayerKind::Text(TextLayer {
            text: "inside".to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 12.0,
            color: Color::new("#000000"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    );
    document.layers.push(Layer::new(
        LayerId::new("layer_group"),
        Transform::new(10.0, 10.0, 100.0, 100.0),
        LayerKind::Group(assemblash_core::document::GroupLayer {
            children: vec![child],
            extra: Extras::new(),
        }),
    ));
    define(&mut document, slot("inner", "layer_child", SlotKind::Text)).unwrap();

    let error = apply(
        &mut document,
        &Operation::Delete {
            id: LayerId::new("layer_group"),
        },
        &mut UlidIdSource,
    )
    .unwrap_err();
    assert!(
        matches!(&error, OpError::LayerIsSlotTarget { slots, .. } if slots == "inner"),
        "{error:?}"
    );
}

#[test]
fn a_refused_definition_changes_nothing_at_all() {
    // Operations are transactional, and a slot definition is an operation: a
    // refusal must leave the document exactly as it was, byte for byte.
    let mut document = document();
    define(
        &mut document,
        slot("headline", "layer_headline", SlotKind::Text),
    )
    .unwrap();
    let before = serde_json::to_string(&document).unwrap();

    for refused in [
        slot("headline", "layer_headline", SlotKind::Text),
        slot("chrome", "layer_chrome", SlotKind::Text),
        slot("ghost", "layer_missing", SlotKind::Text),
        slot("wrong", "layer_headline", SlotKind::Image),
    ] {
        let mut copy = document.clone();
        assert!(define(&mut copy, refused).is_err());
        assert_eq!(serde_json::to_string(&copy).unwrap(), before);
    }
}
