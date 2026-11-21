//! `setLayerMeta`: structured metadata in a layer's payload extras map.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{Extras, ShapeKind, TextAlign, Transform};
use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::ops::{
    apply, check_properties, CreateLayer, LayerPosition, NewLayerKind, OpError, Operation,
    LAYER_META_MAX_BYTES,
};
use assemblash_core::storage::DOCUMENT_FILE;
use assemblash_core::{Color, Document, LayerKind, Session};
use serde_json::json;

fn text_kind() -> NewLayerKind {
    NewLayerKind::Text {
        text: "x".to_owned(),
        font_family: "Inter".to_owned(),
        font_size: 12.0,
        color: Some(Color::new("#000000")),
        align: TextAlign::Left,
        line_height: 1.2,
        paragraph_spacing: 0.0,
        font_weight: 400,
        font_style: assemblash_core::FontStyle::Normal,
        letter_spacing: 0.0,
        stroke: None,
        vertical_align: assemblash_core::VerticalAlign::Top,
        runs: Vec::new(),
    }
}

fn create(kind: NewLayerKind) -> Operation {
    Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform::new(0.0, 0.0, 10.0, 10.0),
        name: None,
        kind,
    })
}

fn meta(id: &LayerId, key: &str, value: Option<serde_json::Value>) -> Operation {
    Operation::SetLayerMeta {
        id: id.clone(),
        key: key.to_owned(),
        value,
        allow_locked: false,
    }
}

fn extra_of(document: &Document, id: &LayerId) -> Extras {
    match &document.find_layer(id).unwrap().kind {
        LayerKind::Text(payload) => payload.extra.clone(),
        LayerKind::Image(payload) => payload.extra.clone(),
        LayerKind::Group(payload) => payload.extra.clone(),
        LayerKind::Svg(payload) => payload.extra.clone(),
        LayerKind::Shape(payload) => payload.extra.clone(),
    }
}

/// The shape stays at the root after the text is grouped, so the tests that
/// flip its flags find it there.
fn root_layer_mut<'a>(document: &'a mut Document, id: &LayerId) -> &'a mut assemblash_core::Layer {
    document
        .layers
        .iter_mut()
        .find(|layer| &layer.id == id)
        .unwrap()
}

fn document_with_layers() -> (Document, SequentialIdSource, Vec<LayerId>) {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 100.0, 100.0);
    let mut created = Vec::new();
    for kind in [
        text_kind(),
        NewLayerKind::Shape {
            shape: ShapeKind::Rect {
                corner_radius: 0.0,
                extra: Extras::new(),
            },
            fill: None,
            stroke: None,
        },
    ] {
        let outcome = apply(&mut document, &create(kind), &mut ids).unwrap();
        created.extend(outcome.created);
    }
    let outcome = apply(
        &mut document,
        &Operation::Group {
            ids: vec![created[0].clone()],
            name: None,
        },
        &mut ids,
    )
    .unwrap();
    created.extend(outcome.created);
    (document, ids, created)
}

#[test]
fn metadata_is_written_into_the_payload_extras_map_of_each_kind() {
    let (mut document, mut ids, layers) = document_with_layers();
    for id in &layers {
        let value = json!({ "spec": { "type": "bar" } });
        let outcome = apply(
            &mut document,
            &meta(id, "assemblash.chart", Some(value.clone())),
            &mut ids,
        )
        .unwrap();
        assert_eq!(outcome.changed, vec![id.clone()]);
        assert_eq!(
            extra_of(&document, id).get("assemblash.chart"),
            Some(&value)
        );
    }

    // The key sits next to the payload's own fields in the JSON, which is
    // where every build since 1.0.0 keeps unknown keys.
    let text = serde_json::to_value(document.find_layer(&layers[0]).unwrap()).unwrap();
    assert_eq!(text["assemblash.chart"]["spec"]["type"], "bar");
    let reread: Document =
        serde_json::from_str(&serde_json::to_string(&document).unwrap()).unwrap();
    assert_eq!(reread, document);
}

#[test]
fn null_or_absent_value_removes_the_key_and_removing_nothing_is_refused() {
    let (mut document, mut ids, layers) = document_with_layers();
    let id = &layers[0];
    apply(
        &mut document,
        &meta(id, "assemblash.qr", Some(json!({"a": 1}))),
        &mut ids,
    )
    .unwrap();
    apply(
        &mut document,
        &meta(id, "assemblash.qr", Some(json!(null))),
        &mut ids,
    )
    .unwrap();
    assert!(extra_of(&document, id).is_empty());

    let error = apply(&mut document, &meta(id, "assemblash.qr", None), &mut ids).unwrap_err();
    assert_eq!(
        error,
        OpError::NothingToDo {
            operation: "setLayerMeta"
        }
    );
}

#[test]
fn a_key_outside_the_reserved_prefix_is_refused() {
    let (mut document, mut ids, layers) = document_with_layers();
    for key in [
        "chart",
        "fontFamily",
        "assemblash.",
        "assemblash..chart",
        "assemblash.chart spec",
        "assemblash.chärt",
    ] {
        let error = apply(
            &mut document,
            &meta(&layers[0], key, Some(json!(1))),
            &mut ids,
        )
        .unwrap_err();
        assert_eq!(
            error,
            OpError::InvalidMetaKey {
                key: key.to_owned()
            },
            "{key}"
        );
    }
}

#[test]
fn a_value_over_the_limit_is_refused() {
    let (mut document, mut ids, layers) = document_with_layers();
    let big = "x".repeat(LAYER_META_MAX_BYTES);
    let error = apply(
        &mut document,
        &meta(&layers[0], "assemblash.chart", Some(json!(big))),
        &mut ids,
    )
    .unwrap_err();
    assert!(
        matches!(error, OpError::MetaValueTooLarge { .. }),
        "{error:?}"
    );
}

#[test]
fn protected_read_only_and_locked_layers_are_refused() {
    let (mut document, mut ids, layers) = document_with_layers();
    let id = &layers[1];

    root_layer_mut(&mut document, id).locked = true;
    let error = apply(
        &mut document,
        &meta(id, "assemblash.chart", Some(json!(1))),
        &mut ids,
    )
    .unwrap_err();
    assert_eq!(error, OpError::LayerLocked { id: id.clone() });
    let mut override_lock = meta(id, "assemblash.chart", Some(json!(1)));
    if let Operation::SetLayerMeta { allow_locked, .. } = &mut override_lock {
        *allow_locked = true;
    }
    apply(&mut document, &override_lock, &mut ids).unwrap();

    root_layer_mut(&mut document, id).protected = true;
    let error = apply(&mut document, &override_lock, &mut ids).unwrap_err();
    assert_eq!(error, OpError::LayerProtected { id: id.clone() });

    let layer = root_layer_mut(&mut document, id);
    layer.protected = false;
    layer.read_only = true;
    let error = apply(&mut document, &override_lock, &mut ids).unwrap_err();
    assert_eq!(error, OpError::LayerReadOnly { id: id.clone() });
}

#[test]
fn the_operation_round_trips_and_passes_the_property_check() {
    let operation = meta(
        &LayerId::new("layer_one"),
        "assemblash.chart",
        Some(json!({"spec": {}})),
    );
    let value = serde_json::to_value(&operation).unwrap();
    assert_eq!(
        value,
        json!({
            "op": "setLayerMeta",
            "id": "layer_one",
            "key": "assemblash.chart",
            "value": {"spec": {}}
        })
    );
    assert_eq!(check_properties(&value), Ok(()));
    let back: Operation = serde_json::from_value(value).unwrap();
    assert_eq!(back, operation);

    let stray =
        json!({"op": "setLayerMeta", "id": "layer_one", "key": "assemblash.x", "values": 1});
    assert!(matches!(
        check_properties(&stray),
        Err(OpError::UnknownProperty { .. })
    ));
}

#[test]
fn undo_and_redo_are_byte_identical() {
    let dir = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();
    let document = Document::new(&mut ids, 100.0, 100.0);
    let mut session = Session::create(dir.path(), document, Some(1)).unwrap();
    let actor = Actor::named(ActorKind::Human, "test");
    let created = session
        .apply(&create(text_kind()), &actor, Some(1), None, &mut ids)
        .unwrap()
        .0
        .created;
    let bytes = || std::fs::read(dir.path().join(DOCUMENT_FILE)).unwrap();
    let before = bytes();

    session
        .apply(
            &meta(
                &created[0],
                "assemblash.table",
                Some(json!({"rows": [["a"]]})),
            ),
            &actor,
            Some(2),
            None,
            &mut ids,
        )
        .unwrap();
    let after = bytes();
    assert_ne!(after, before);

    session.undo(&actor, Some(3), &mut ids).unwrap();
    assert_eq!(bytes(), before);
    session.redo(&actor, Some(4), &mut ids).unwrap();
    assert_eq!(bytes(), after);
}
