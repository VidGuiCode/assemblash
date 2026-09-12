//! v0.2.0 exit test, part one: every FR-7 operation, exercised.
//!
//! The property tests at the bottom are the ones that matter most: the
//! tree-shaped operations are where a document can be corrupted into
//! something that still deserializes but is no longer a tree.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{
    Extras, GroupLayer, ShapeKind, ShapeLayer, Stroke, TextAlign, Transform,
};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::ops::{
    apply, CreateLayer, LayerPosition, NewLayerKind, OpError, OpOutcome, Operation, UpdateLayer,
};
use assemblash_core::{validate, Color, Document, Layer, LayerKind};
use proptest::prelude::*;

fn document() -> Document {
    Document::new(&mut SequentialIdSource::new(), 500.0, 500.0)
}

fn text_kind() -> NewLayerKind {
    NewLayerKind::Text {
        text: "x".to_owned(),
        font_family: "Inter".to_owned(),
        font_size: 12.0,
        color: Some(Color::new("#000000")),
        align: TextAlign::Left,
        line_height: 1.2,
        font_weight: 400,
        font_style: assemblash_core::FontStyle::Normal,
        letter_spacing: 0.0,
        stroke: None,
        vertical_align: assemblash_core::VerticalAlign::Top,
    }
}

fn create_at(x: f64, y: f64, width: f64, height: f64) -> Operation {
    Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform::new(x, y, width, height),
        name: None,
        kind: text_kind(),
    })
}

/// Applies an operation with a fresh deterministic id source.
struct Editor {
    document: Document,
    ids: SequentialIdSource,
}

impl Editor {
    fn new() -> Self {
        Self {
            document: document(),
            ids: SequentialIdSource::new(),
        }
    }

    fn apply(&mut self, operation: Operation) -> OpOutcome {
        apply(&mut self.document, &operation, &mut self.ids).expect("operation should succeed")
    }

    fn try_apply(&mut self, operation: Operation) -> Result<OpOutcome, OpError> {
        apply(&mut self.document, &operation, &mut self.ids)
    }

    fn add(&mut self, x: f64, y: f64, w: f64, h: f64) -> LayerId {
        self.apply(create_at(x, y, w, h)).created[0].clone()
    }

    fn layer(&self, id: &LayerId) -> &Layer {
        self.document.find_layer(id).expect("layer exists")
    }
}

#[test]
fn move_shifts_by_a_distance() {
    let mut editor = Editor::new();
    let id = editor.add(10.0, 20.0, 30.0, 40.0);
    editor.apply(Operation::Move {
        id: id.clone(),
        dx: 5.0,
        dy: -5.0,
    });
    let transform = &editor.layer(&id).transform;
    assert_eq!((transform.x, transform.y), (15.0, 15.0));
    assert_eq!((transform.width, transform.height), (30.0, 40.0));
}

#[test]
fn resize_and_rotate_set_absolute_values() {
    let mut editor = Editor::new();
    let id = editor.add(0.0, 0.0, 10.0, 10.0);
    editor.apply(Operation::Resize {
        id: id.clone(),
        width: 100.0,
        height: 50.0,
    });
    editor.apply(Operation::Rotate {
        id: id.clone(),
        degrees: 45.0,
    });
    let transform = &editor.layer(&id).transform;
    assert_eq!((transform.width, transform.height), (100.0, 50.0));
    assert_eq!(transform.rotation, 45.0);

    // Rotating again replaces the angle rather than adding to it.
    editor.apply(Operation::Rotate {
        id: id.clone(),
        degrees: 90.0,
    });
    assert_eq!(editor.layer(&id).transform.rotation, 90.0);
}

#[test]
fn a_negative_size_is_refused_and_changes_nothing() {
    let mut editor = Editor::new();
    let id = editor.add(0.0, 0.0, 10.0, 10.0);
    let before = editor.document.clone();
    let error = editor
        .try_apply(Operation::Resize {
            id,
            width: -5.0,
            height: 10.0,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::Invalid(_)), "{error:?}");
    assert_eq!(editor.document, before);
}

#[test]
fn duplicate_copies_the_subtree_with_new_ids() {
    let mut editor = Editor::new();
    let child = editor.add(5.0, 5.0, 10.0, 10.0);
    let outer = editor
        .apply(Operation::Group {
            ids: vec![child.clone()],
            name: Some("Pair".to_owned()),
        })
        .created[0]
        .clone();

    let outcome = editor.apply(Operation::Duplicate { id: outer.clone() });
    assert_eq!(outcome.created.len(), 2, "group plus its child");
    assert!(!outcome.created.contains(&outer));
    assert!(!outcome.created.contains(&child));

    // The copy sits directly above the original.
    let positions: Vec<&LayerId> = editor.document.layers.iter().map(|l| &l.id).collect();
    assert_eq!(positions, vec![&outer, &outcome.created[0]]);
    assert_eq!(
        editor.layer(&outcome.created[0]).name.as_deref(),
        Some("Pair")
    );
    validate(&editor.document).unwrap();
}

#[test]
fn reorder_changes_z_order_and_reparents() {
    let mut editor = Editor::new();
    let bottom = editor.add(0.0, 0.0, 10.0, 10.0);
    let top = editor.add(0.0, 0.0, 10.0, 10.0);

    editor.apply(Operation::Reorder {
        id: top.clone(),
        to: LayerPosition::Root { index: Some(0) },
    });
    assert_eq!(editor.document.layers[0].id, top);

    let group = editor
        .apply(Operation::Create(CreateLayer {
            position: LayerPosition::Root { index: None },
            transform: Transform::new(0.0, 0.0, 100.0, 100.0),
            name: None,
            kind: NewLayerKind::Group,
        }))
        .created[0]
        .clone();

    editor.apply(Operation::Reorder {
        id: bottom.clone(),
        to: LayerPosition::In {
            parent: group.clone(),
            index: None,
        },
    });

    assert!(editor.document.layers.iter().all(|l| l.id != bottom));
    assert!(editor.document.find_layer(&bottom).is_some());
    validate(&editor.document).unwrap();
}

#[test]
fn a_group_cannot_be_moved_inside_itself() {
    let mut editor = Editor::new();
    let child = editor.add(0.0, 0.0, 10.0, 10.0);
    let group = editor
        .apply(Operation::Group {
            ids: vec![child.clone()],
            name: None,
        })
        .created[0]
        .clone();

    for target in [group.clone(), child.clone()] {
        let before = editor.document.clone();
        let error = editor
            .try_apply(Operation::Reorder {
                id: group.clone(),
                to: LayerPosition::In {
                    parent: target,
                    index: None,
                },
            })
            .unwrap_err();
        assert!(matches!(error, OpError::WouldCycle { .. }), "{error:?}");
        assert_eq!(editor.document, before);
    }
}

#[test]
fn grouping_keeps_the_picture_where_it_was() {
    let mut editor = Editor::new();
    let a = editor.add(20.0, 40.0, 60.0, 20.0);
    let b = editor.add(100.0, 30.0, 40.0, 80.0);

    let group = editor
        .apply(Operation::Group {
            ids: vec![a.clone(), b.clone()],
            name: None,
        })
        .created[0]
        .clone();

    // Bounding box of the two: x 20..140, y 30..110.
    let container = editor.layer(&group).transform.clone();
    assert_eq!((container.x, container.y), (20.0, 30.0));
    assert_eq!((container.width, container.height), (120.0, 80.0));

    // Children are re-based onto the group, so their absolute positions are
    // unchanged.
    let child_a = &editor.layer(&a).transform;
    assert_eq!(
        (container.x + child_a.x, container.y + child_a.y),
        (20.0, 40.0)
    );
    let child_b = &editor.layer(&b).transform;
    assert_eq!(
        (container.x + child_b.x, container.y + child_b.y),
        (100.0, 30.0)
    );
}

#[test]
fn ungroup_puts_the_children_back_where_they_were() {
    let mut editor = Editor::new();
    let a = editor.add(20.0, 40.0, 60.0, 20.0);
    let b = editor.add(100.0, 30.0, 40.0, 80.0);
    let group = editor
        .apply(Operation::Group {
            ids: vec![a.clone(), b.clone()],
            name: None,
        })
        .created[0]
        .clone();

    let outcome = editor.apply(Operation::Ungroup { id: group.clone() });
    assert_eq!(outcome.removed, vec![group]);
    assert_eq!(outcome.changed.len(), 2);

    let transform_a = &editor.layer(&a).transform;
    assert_eq!((transform_a.x, transform_a.y), (20.0, 40.0));
    let transform_b = &editor.layer(&b).transform;
    assert_eq!((transform_b.x, transform_b.y), (100.0, 30.0));
    assert_eq!(editor.document.layers.len(), 2);
}

#[test]
fn ungroup_refuses_when_it_would_change_the_image() {
    for (property, prepare) in [
        (
            "rotation",
            Box::new(|editor: &mut Editor, id: &LayerId| {
                editor.apply(Operation::Rotate {
                    id: id.clone(),
                    degrees: 30.0,
                });
            }) as Box<dyn Fn(&mut Editor, &LayerId)>,
        ),
        (
            "opacity",
            Box::new(|editor: &mut Editor, id: &LayerId| {
                editor.apply(Operation::Update(UpdateLayer {
                    opacity: Some(0.4),
                    ..UpdateLayer::new(id.clone())
                }));
            }),
        ),
    ] {
        let mut editor = Editor::new();
        let child = editor.add(0.0, 0.0, 10.0, 10.0);
        let group = editor
            .apply(Operation::Group {
                ids: vec![child],
                name: None,
            })
            .created[0]
            .clone();
        prepare(&mut editor, &group);

        let error = editor
            .try_apply(Operation::Ungroup { id: group })
            .unwrap_err();
        match error {
            OpError::UngroupWouldChangeAppearance { property: got, .. } => {
                assert_eq!(got, property)
            }
            other => panic!("expected a refusal about {property}, got {other:?}"),
        }
    }
}

#[test]
fn grouping_layers_that_are_not_siblings_is_refused() {
    let mut editor = Editor::new();
    let a = editor.add(0.0, 0.0, 10.0, 10.0);
    let b = editor.add(0.0, 0.0, 10.0, 10.0);
    let group = editor
        .apply(Operation::Group {
            ids: vec![b.clone()],
            name: None,
        })
        .created[0]
        .clone();
    let _ = group;

    let error = editor
        .try_apply(Operation::Group {
            ids: vec![a, b],
            name: None,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::NotSiblings { .. }), "{error:?}");
}

#[test]
fn grouping_nothing_is_refused() {
    let mut editor = Editor::new();
    let error = editor
        .try_apply(Operation::Group {
            ids: Vec::new(),
            name: None,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::NothingToDo { .. }), "{error:?}");
}

#[test]
fn hide_show_lock_unlock_and_rename() {
    let mut editor = Editor::new();
    let id = editor.add(0.0, 0.0, 10.0, 10.0);

    editor.apply(Operation::SetVisible {
        id: id.clone(),
        visible: false,
    });
    assert!(!editor.layer(&id).visible);
    editor.apply(Operation::SetVisible {
        id: id.clone(),
        visible: true,
    });
    assert!(editor.layer(&id).visible);

    editor.apply(Operation::Rename {
        id: id.clone(),
        name: Some("Headline".to_owned()),
    });
    assert_eq!(editor.layer(&id).name.as_deref(), Some("Headline"));
    editor.apply(Operation::Rename {
        id: id.clone(),
        name: None,
    });
    assert_eq!(editor.layer(&id).name, None);

    editor.apply(Operation::SetLocked {
        id: id.clone(),
        locked: true,
    });
    assert!(editor.layer(&id).locked);

    // While locked, ordinary edits refuse.
    let error = editor
        .try_apply(Operation::Move {
            id: id.clone(),
            dx: 1.0,
            dy: 1.0,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::LayerLocked { .. }), "{error:?}");

    // Unlocking works even though the layer is locked — that is the point.
    editor.apply(Operation::SetLocked {
        id: id.clone(),
        locked: false,
    });
    assert!(!editor.layer(&id).locked);
}

#[test]
fn every_operation_refuses_an_unknown_layer_rather_than_panicking() {
    let missing = LayerId::new("layer_missing");
    let operations = [
        Operation::Update(UpdateLayer::new(missing.clone())),
        Operation::Delete {
            id: missing.clone(),
        },
        Operation::Duplicate {
            id: missing.clone(),
        },
        Operation::Move {
            id: missing.clone(),
            dx: 1.0,
            dy: 1.0,
        },
        Operation::Resize {
            id: missing.clone(),
            width: 1.0,
            height: 1.0,
        },
        Operation::Rotate {
            id: missing.clone(),
            degrees: 1.0,
        },
        Operation::Reorder {
            id: missing.clone(),
            to: LayerPosition::Root { index: None },
        },
        Operation::Group {
            ids: vec![missing.clone()],
            name: None,
        },
        Operation::Ungroup {
            id: missing.clone(),
        },
        Operation::SetVisible {
            id: missing.clone(),
            visible: true,
        },
        Operation::SetLocked {
            id: missing.clone(),
            locked: true,
        },
        Operation::Rename {
            id: missing.clone(),
            name: None,
        },
    ];

    for operation in operations {
        let mut editor = Editor::new();
        let before = editor.document.clone();
        let error = editor.try_apply(operation.clone()).unwrap_err();
        assert!(
            matches!(error, OpError::NoSuchLayer { .. }),
            "{operation:?} gave {error:?}"
        );
        assert_eq!(editor.document, before);
    }
}

#[test]
fn every_operation_round_trips_as_json() {
    let id = LayerId::new("layer_1");
    let operations = [
        create_at(0.0, 0.0, 1.0, 1.0),
        Operation::Update(UpdateLayer::new(id.clone())),
        Operation::Delete { id: id.clone() },
        Operation::Duplicate { id: id.clone() },
        Operation::Move {
            id: id.clone(),
            dx: 1.5,
            dy: -2.5,
        },
        Operation::Resize {
            id: id.clone(),
            width: 3.0,
            height: 4.0,
        },
        Operation::Rotate {
            id: id.clone(),
            degrees: 15.0,
        },
        Operation::Reorder {
            id: id.clone(),
            to: LayerPosition::In {
                parent: LayerId::new("layer_2"),
                index: Some(1),
            },
        },
        Operation::Group {
            ids: vec![id.clone()],
            name: Some("g".to_owned()),
        },
        Operation::Ungroup { id: id.clone() },
        Operation::SetVisible {
            id: id.clone(),
            visible: false,
        },
        Operation::SetLocked {
            id: id.clone(),
            locked: true,
        },
        Operation::Rename {
            id,
            name: Some("n".to_owned()),
        },
    ];

    for operation in operations {
        let json = serde_json::to_string(&operation).unwrap();
        let parsed: Operation = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, operation, "{json}");
    }
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

/// Builds a small document and a list of operations to throw at it.
fn scripted_edits() -> impl Strategy<Value = (usize, Vec<u8>)> {
    (1usize..5, prop::collection::vec(any::<u8>(), 0..24))
}

/// Turns a byte into an operation addressed at one of the existing layers.
fn operation_for(byte: u8, ids: &[LayerId]) -> Operation {
    let target = ids[byte as usize % ids.len()].clone();
    match byte % 10 {
        0 => Operation::Move {
            id: target,
            dx: 3.0,
            dy: -3.0,
        },
        1 => Operation::Resize {
            id: target,
            width: 20.0,
            height: 20.0,
        },
        2 => Operation::Rotate {
            id: target,
            degrees: 30.0,
        },
        3 => Operation::Duplicate { id: target },
        4 => Operation::Group {
            ids: vec![target],
            name: None,
        },
        5 => Operation::Ungroup { id: target },
        6 => Operation::Delete { id: target },
        7 => Operation::SetVisible {
            id: target,
            visible: false,
        },
        8 => Operation::Rename {
            id: target,
            name: Some("n".to_owned()),
        },
        _ => Operation::Reorder {
            id: target,
            to: LayerPosition::Root { index: Some(0) },
        },
    }
}

proptest! {
    /// Whatever sequence of operations is applied, the document stays valid:
    /// no duplicate ids, no dangling references, no impossible geometry. An
    /// operation either works or is refused; nothing in between.
    #[test]
    fn documents_stay_valid_under_arbitrary_edits((layer_count, bytes) in scripted_edits()) {
        let mut editor = Editor::new();
        for index in 0..layer_count {
            editor.add(index as f64 * 10.0, 0.0, 10.0, 10.0);
        }

        for byte in bytes {
            let mut ids = Vec::new();
            editor.document.walk_layers(&mut |layer| ids.push(layer.id.clone()));
            if ids.is_empty() {
                break;
            }
            let operation = operation_for(byte, &ids);
            let before = editor.document.clone();
            match editor.try_apply(operation) {
                Ok(_) => prop_assert!(validate(&editor.document).is_ok()),
                Err(_) => prop_assert_eq!(&editor.document, &before),
            }
        }
    }

    /// Grouping then ungrouping puts every layer back where it started.
    ///
    /// "Back" is to floating-point precision, not bit equality: grouping
    /// subtracts the group's origin from each child and ungrouping adds it
    /// again, and `x - b + b` is not always exactly `x`. The error is far
    /// below a millionth of a pixel — below what the renderer even writes out
    /// — and the operation is still deterministic: the same edits always
    /// produce the same numbers.
    #[test]
    fn group_then_ungroup_restores_positions(
        boxes in prop::collection::vec((0.0f64..300.0, 0.0f64..300.0, 1.0f64..100.0, 1.0f64..100.0), 1..4)
    ) {
        let mut editor = Editor::new();
        let ids: Vec<LayerId> = boxes
            .iter()
            .map(|(x, y, w, h)| editor.add(*x, *y, *w, *h))
            .collect();

        let group = editor.apply(Operation::Group { ids: ids.clone(), name: None }).created[0].clone();
        editor.apply(Operation::Ungroup { id: group });

        for (id, (x, y, w, h)) in ids.iter().zip(boxes) {
            let transform = &editor.layer(id).transform;
            prop_assert!((transform.x - x).abs() < 1e-9, "x: {} vs {x}", transform.x);
            prop_assert!((transform.y - y).abs() < 1e-9, "y: {} vs {y}", transform.y);
            // Size is copied, not computed, so it must match exactly.
            prop_assert_eq!((transform.width, transform.height), (w, h));
        }
    }
}

#[test]
fn nested_groups_survive_a_deep_duplicate() {
    let mut editor = Editor::new();
    // Build a group three deep by hand, then duplicate the outermost.
    let inner_child = Layer::new(
        LayerId::new("layer_deep"),
        Transform::new(1.0, 1.0, 2.0, 2.0),
        LayerKind::Group(GroupLayer {
            children: Vec::new(),
            extra: Extras::new(),
        }),
    );
    let middle = Layer::new(
        LayerId::new("layer_middle"),
        Transform::new(1.0, 1.0, 5.0, 5.0),
        LayerKind::Group(GroupLayer {
            children: vec![inner_child],
            extra: Extras::new(),
        }),
    );
    let outer = Layer::new(
        LayerId::new("layer_outer"),
        Transform::new(0.0, 0.0, 10.0, 10.0),
        LayerKind::Group(GroupLayer {
            children: vec![middle],
            extra: Extras::new(),
        }),
    );
    editor.document.layers.push(outer);

    let outcome = editor.apply(Operation::Duplicate {
        id: LayerId::new("layer_outer"),
    });
    assert_eq!(outcome.created.len(), 3);
    validate(&editor.document).unwrap();

    let mut count = 0;
    editor.document.walk_layers(&mut |_| count += 1);
    assert_eq!(count, 6);
}

/// The wire format is camelCase throughout — and the snake_case spellings a
/// journal written before 0.6.0 contains are still read.
///
/// `rename_all` on an enum renames variants, not the fields of a struct
/// variant, so `NewLayerKind::Text` shipped three snake_case names in an
/// otherwise camelCase format. Nothing noticed while the only caller built the
/// value in Rust. The HTTP API is what made it visible.
#[test]
fn create_operations_are_camel_case_and_still_read_the_old_spelling() {
    let camel = serde_json::json!({
        "op": "create",
        "position": { "at": "root" },
        "transform": { "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0 },
        "type": "text",
        "text": "hi",
        "fontFamily": "Inter",
        "fontSize": 12.0,
        "lineHeight": 1.5
    });
    let snake = serde_json::json!({
        "op": "create",
        "position": { "at": "root" },
        "transform": { "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0 },
        "type": "text",
        "text": "hi",
        "font_family": "Inter",
        "font_size": 12.0,
        "line_height": 1.5
    });

    let from_camel: Operation = serde_json::from_value(camel).unwrap();
    let from_snake: Operation = serde_json::from_value(snake).unwrap();
    assert_eq!(from_camel, from_snake);

    // What this build writes is the camelCase spelling.
    let written = serde_json::to_value(&from_camel).unwrap();
    assert_eq!(written["fontFamily"], "Inter");
    assert!(written.get("font_family").is_none());
}

// ---------------------------------------------------------------------------
// 1.6.0 — shapes
// ---------------------------------------------------------------------------

fn create_shape(shape: ShapeKind) -> Operation {
    Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform::new(10.0, 10.0, 60.0, 40.0),
        name: None,
        kind: NewLayerKind::Shape {
            shape,
            fill: Some(Color::new("#3366cc")),
            stroke: Some(Stroke {
                color: Color::new("#112233"),
                width: 2.0,
            }),
        },
    })
}

fn shape_of(document: &Document, index: usize) -> &ShapeLayer {
    match &document.layers[index].kind {
        LayerKind::Shape(shape) => shape,
        other => panic!("expected a shape layer, got {other:?}"),
    }
}

#[test]
fn create_makes_a_rect_an_ellipse_and_a_line() {
    let mut editor = Editor::new();
    for shape in [
        ShapeKind::Rect { corner_radius: 8.0 },
        ShapeKind::Ellipse,
        ShapeKind::Line,
    ] {
        let expected = shape.clone();
        let outcome = editor.apply(create_shape(shape));
        assert_eq!(outcome.created.len(), 1);
        let made = shape_of(&editor.document, editor.document.layers.len() - 1);
        assert_eq!(made.shape, expected);
        assert_eq!(made.fill, Some(Color::new("#3366cc")));
    }
    validate(&editor.document).unwrap();
    assert_eq!(editor.document.layers.len(), 3);
}

#[test]
fn a_shape_may_be_created_with_no_paint_at_all() {
    // The operation layer applies no default fill: "invisible" is something a
    // caller is allowed to ask for, and guessing black would make "no fill"
    // impossible to say. The surfaces people type at supply their own.
    let mut editor = Editor::new();
    editor.apply(Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform::new(0.0, 0.0, 10.0, 10.0),
        name: None,
        kind: NewLayerKind::Shape {
            shape: ShapeKind::Ellipse,
            fill: None,
            stroke: None,
        },
    }));
    let made = shape_of(&editor.document, 0);
    assert_eq!(made.fill, None);
    assert_eq!(made.stroke, None);
    validate(&editor.document).unwrap();
}

#[test]
fn creating_a_shape_this_build_cannot_draw_is_refused() {
    let mut editor = Editor::new();
    let error = editor
        .try_apply(create_shape(ShapeKind::Other(
            serde_json::json!({ "kind": "star", "points": 5 }),
        )))
        .unwrap_err();
    assert_eq!(
        error,
        OpError::UnsupportedShape {
            id: None,
            kind: "star".to_owned(),
        }
    );
    assert!(editor.document.layers.is_empty(), "nothing was created");
    assert_eq!(
        error.to_string(),
        "shape kind \"star\" is not one this build draws"
    );
}

#[test]
fn update_sets_fill_stroke_and_corner_radius() {
    let mut editor = Editor::new();
    editor.apply(create_shape(ShapeKind::Rect { corner_radius: 0.0 }));
    let id = editor.document.layers[0].id.clone();

    editor.apply(Operation::Update(UpdateLayer {
        fill: Some(Some(Color::new("#ff0000"))),
        corner_radius: Some(12.0),
        ..UpdateLayer::new(id)
    }));

    let shape = shape_of(&editor.document, 0);
    assert_eq!(shape.fill, Some(Color::new("#ff0000")));
    assert_eq!(
        shape.shape,
        ShapeKind::Rect {
            corner_radius: 12.0
        }
    );
    assert_eq!(
        shape.stroke,
        Some(Stroke {
            color: Color::new("#112233"),
            width: 2.0,
        }),
        "an update that does not mention the stroke leaves it alone"
    );
}

#[test]
fn null_clears_a_fill_and_a_stroke() {
    // The doubly-optional wire shape: absent leaves it, `null` clears it.
    let mut editor = Editor::new();
    editor.apply(create_shape(ShapeKind::Ellipse));
    let id = editor.document.layers[0].id.clone();

    let clear: UpdateLayer = serde_json::from_value(serde_json::json!({
        "id": id.to_string(),
        "fill": null,
        "stroke": null
    }))
    .unwrap();
    assert_eq!(clear.fill, Some(None));
    assert_eq!(clear.stroke, Some(None));

    editor.apply(Operation::Update(clear));
    let shape = shape_of(&editor.document, 0);
    assert_eq!(shape.fill, None);
    assert_eq!(shape.stroke, None);
    validate(&editor.document).unwrap();
}

#[test]
fn corner_radius_is_refused_on_a_shape_that_has_no_corners() {
    let mut editor = Editor::new();
    editor.apply(create_shape(ShapeKind::Ellipse));
    editor.apply(create_shape(ShapeKind::Line));

    for (index, expected) in [(0usize, "ellipse"), (1, "line")] {
        let id = editor.document.layers[index].id.clone();
        let error = editor
            .try_apply(Operation::Update(UpdateLayer {
                corner_radius: Some(4.0),
                ..UpdateLayer::new(id.clone())
            }))
            .unwrap_err();
        assert_eq!(
            error,
            OpError::WrongLayerKind {
                id,
                actual: expected,
                property: "cornerRadius",
            }
        );
    }
}

#[test]
fn shape_properties_are_refused_on_every_other_layer_kind() {
    let mut editor = Editor::new();
    editor.apply(create_at(0.0, 0.0, 10.0, 10.0));
    let id = editor.document.layers[0].id.clone();
    let error = editor
        .try_apply(Operation::Update(UpdateLayer {
            fill: Some(Some(Color::new("#ff0000"))),
            ..UpdateLayer::new(id.clone())
        }))
        .unwrap_err();
    assert_eq!(
        error,
        OpError::WrongLayerKind {
            id,
            actual: "text",
            property: "fill",
        }
    );
}

#[test]
fn text_properties_are_refused_on_a_shape() {
    let mut editor = Editor::new();
    editor.apply(create_shape(ShapeKind::Rect { corner_radius: 0.0 }));
    let id = editor.document.layers[0].id.clone();
    let error = editor
        .try_apply(Operation::Update(UpdateLayer {
            text: Some("nope".to_owned()),
            ..UpdateLayer::new(id.clone())
        }))
        .unwrap_err();
    assert_eq!(
        error,
        OpError::WrongLayerKind {
            id,
            actual: "shape",
            property: "text",
        }
    );
}

#[test]
fn repainting_a_shape_this_build_cannot_draw_is_refused_by_kind() {
    // The geometry came from a newer build and is preserved. Changing its
    // paint would produce a layer that looks edited and is not, so the
    // refusal names the kind rather than the property.
    let mut editor = Editor::new();
    editor.document.layers.push(Layer::new(
        LayerId::new("layer_future"),
        Transform::new(0.0, 0.0, 10.0, 10.0),
        LayerKind::Shape(ShapeLayer {
            shape: ShapeKind::Other(serde_json::json!({ "kind": "star", "points": 5 })),
            fill: Some(Color::new("#000000")),
            stroke: None,
            extra: Extras::new(),
        }),
    ));

    let id = LayerId::new("layer_future");
    let error = editor
        .try_apply(Operation::Update(UpdateLayer {
            fill: Some(Some(Color::new("#ff0000"))),
            ..UpdateLayer::new(id.clone())
        }))
        .unwrap_err();
    assert_eq!(
        error,
        OpError::UnsupportedShape {
            id: Some(id.clone()),
            kind: "star".to_owned(),
        }
    );
    assert_eq!(
        error.to_string(),
        "layer layer_future: shape kind \"star\" is not one this build draws"
    );

    // An update that touches nothing shape-specific still works: the layer is
    // preserved, not quarantined.
    editor.apply(Operation::Update(UpdateLayer {
        opacity: Some(0.5),
        ..UpdateLayer::new(id)
    }));
    assert_eq!(editor.document.layers[0].opacity, 0.5);
}

#[test]
fn a_shape_create_round_trips_as_camel_case_json() {
    let json = serde_json::json!({
        "op": "create",
        "position": { "at": "root" },
        "transform": { "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0, "rotation": 0.0 },
        "type": "shape",
        "shape": { "kind": "rect", "cornerRadius": 8.0 },
        "fill": "#3366cc",
        "stroke": { "color": "#112233", "width": 3.0 }
    });
    let operation: Operation = serde_json::from_value(json.clone()).unwrap();
    let Operation::Create(create) = &operation else {
        panic!("expected a create, got {operation:?}");
    };
    assert!(matches!(
        &create.kind,
        NewLayerKind::Shape {
            shape: ShapeKind::Rect { corner_radius },
            ..
        } if *corner_radius == 8.0
    ));
    assert_eq!(serde_json::to_value(&operation).unwrap(), json);
}
