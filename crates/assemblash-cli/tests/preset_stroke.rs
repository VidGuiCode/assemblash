//! Preset round-trips for the 1.10.0 stroke fields.
//!
//! `PresetProperties` carries the whole `Stroke`, so the new dash/cap/join
//! fields are asserted to flow through define/apply untouched — and the Line
//! markers, which live in the shape payload rather than the stroke, are
//! asserted *not* to be preset-carried (Contents A6; the comment beside
//! `ShapeKind::Line` is the promise, this test is the check).

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{
    Extras, LineCap, LineJoin, LineMarker, ShapeKind, Stroke, Transform,
};
use assemblash_core::ids::SequentialIdSource;
use assemblash_core::ops::Operation;
use assemblash_core::presets::{Preset, PresetProperties};
use assemblash_core::{Color, Document, Layer, LayerKind, ShapeLayer};

/// A shape layer with the given geometry, in a fresh document.
fn shape(document: &mut Document, id: &str, shape: ShapeKind, stroke: Option<Stroke>) -> String {
    let layer = Layer::new(
        assemblash_core::LayerId::new(id),
        Transform::new(0.0, 0.0, 100.0, 100.0),
        LayerKind::Shape(ShapeLayer {
            shape,
            fill: None,
            stroke,
            extra: Extras::new(),
        }),
    );
    document.layers.push(layer);
    id.to_owned()
}

fn dashed_stroke() -> Stroke {
    Stroke {
        color: Color::new("#112233"),
        width: 2.5,
        dash_array: Some(vec![4.0, 2.0]),
        line_cap: Some(LineCap::Round),
        line_join: Some(LineJoin::Bevel),
        extra: Extras::new(),
    }
}

#[test]
fn a_preset_round_trips_a_dashed_stroke() {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 400.0, 200.0);
    let source = shape(
        &mut document,
        "layer_source",
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some(dashed_stroke()),
    );
    let target = shape(
        &mut document,
        "layer_target",
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        None,
    );

    // Define the preset from the source layer's own stroke, the way every
    // surface does: the whole `Stroke` struct goes into the properties, so
    // the dash pattern and the cap/join go with it or not at all.
    let stroke = match &document
        .find_layer(&assemblash_core::LayerId::new(&source))
        .unwrap()
        .kind
    {
        LayerKind::Shape(shape) => shape.stroke.clone().unwrap(),
        _ => unreachable!("test builds shapes only"),
    };
    let properties = PresetProperties {
        stroke: Some(stroke),
        ..PresetProperties::default()
    };
    assert!(!properties.is_empty());

    let operations = [
        Operation::DefinePreset {
            preset: Preset {
                name: "dashed".to_owned(),
                description: None,
                properties: properties.clone(),
                extra: Extras::new(),
            },
        },
        Operation::ApplyPreset {
            id: assemblash_core::LayerId::new(&target),
            preset: "dashed".to_owned(),
            allow_locked: false,
        },
    ];
    for operation in &operations {
        assemblash_core::apply(&mut document, operation, &mut ids).unwrap();
    }

    let applied = match &document
        .find_layer(&assemblash_core::LayerId::new(&target))
        .unwrap()
        .kind
    {
        LayerKind::Shape(shape) => shape.stroke.clone().unwrap(),
        _ => unreachable!("test builds shapes only"),
    };
    assert_eq!(applied, dashed_stroke());
    assert_eq!(applied.dash_array, Some(vec![4.0, 2.0]));
    assert_eq!(applied.line_cap, Some(LineCap::Round));
    assert_eq!(applied.line_join, Some(LineJoin::Bevel));

    // And the preset survives a save/reload with the pattern intact, because
    // the properties are document payload.
    let stored = serde_json::to_string(&document).unwrap();
    assert!(stored.contains("dashArray"), "{stored}");
    assert!(stored.contains("lineCap"), "{stored}");
    let reloaded: Document = serde_json::from_str(&stored).unwrap();
    let preset = reloaded
        .presets
        .iter()
        .find(|preset| preset.name == "dashed")
        .unwrap();
    assert_eq!(
        preset.properties.stroke.as_ref().unwrap().dash_array,
        Some(vec![4.0, 2.0])
    );
}

#[test]
fn markers_are_payload_and_never_preset_carried() {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 400.0, 200.0);
    let marked = shape(
        &mut document,
        "layer_marked",
        ShapeKind::Line {
            marker_start: Some(LineMarker::Circle),
            marker_end: Some(LineMarker::Arrow),
            extra: Extras::new(),
        },
        Some(dashed_stroke()),
    );
    let plain = shape(
        &mut document,
        "layer_plain",
        ShapeKind::Line {
            marker_start: None,
            marker_end: None,
            extra: Extras::new(),
        },
        None,
    );

    // There is no field a preset could carry the markers in: the properties
    // have fill, stroke, effects — nothing of the Line payload. Assert the
    // structural fact, then the behaviour.
    let properties = PresetProperties {
        stroke: Some(dashed_stroke()),
        ..PresetProperties::default()
    };
    let serialized = serde_json::to_value(&properties).unwrap();
    assert!(
        serialized.get("markerStart").is_none() && serialized.get("markerEnd").is_none(),
        "{serialized}"
    );

    let operations = [
        Operation::DefinePreset {
            preset: Preset {
                name: "lined".to_owned(),
                description: None,
                properties,
                extra: Extras::new(),
            },
        },
        Operation::ApplyPreset {
            id: assemblash_core::LayerId::new(&plain),
            preset: "lined".to_owned(),
            allow_locked: false,
        },
    ];
    for operation in &operations {
        assemblash_core::apply(&mut document, operation, &mut ids).unwrap();
    }

    // The target line took the stroke and kept its own (absent) markers; the
    // source line's markers did not move to it.
    let kind = |document: &Document, id: &str| match &document
        .find_layer(&assemblash_core::LayerId::new(id))
        .unwrap()
        .kind
    {
        LayerKind::Shape(shape) => shape.shape.clone(),
        _ => unreachable!("test builds shapes only"),
    };
    // The source line still has its markers, and the target took only the
    // stroke: the markers did not move with the style.
    match kind(&document, &marked) {
        ShapeKind::Line {
            marker_start,
            marker_end,
            ..
        } => {
            assert_eq!(marker_start, Some(LineMarker::Circle));
            assert_eq!(marker_end, Some(LineMarker::Arrow));
        }
        other => panic!("expected a line, got {other:?}"),
    }
    let target = kind(&document, &plain);
    match target {
        ShapeKind::Line {
            marker_start,
            marker_end,
            ..
        } => {
            assert!(marker_start.is_none());
            assert!(marker_end.is_none());
        }
        other => panic!("expected a line, got {other:?}"),
    }
}
