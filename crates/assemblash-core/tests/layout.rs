//! v0.4.0 exit test: the layout operations are deterministic and
//! property-tested.
//!
//! These are the operations agents lean on hardest — an agent cannot look at
//! a canvas and see that something is 3 pixels off, so "align these" has to
//! be exactly right every time (R2).
//!
//! Every operation here takes an explicit list of ids. None of them refer to
//! a selection.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{Extras, GroupLayer, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::layout::{self, Rect};
use assemblash_core::ops::{
    apply, AlignEdge, Axis, CreateLayer, LayerPosition, NewLayerKind, OpError, Operation,
    SnapTarget,
};
use assemblash_core::{validate, Color, Document, Layer, LayerKind};
use proptest::prelude::*;

const CANVAS: f64 = 1000.0;

struct Canvas {
    document: Document,
    ids: SequentialIdSource,
}

impl Canvas {
    fn new() -> Self {
        let mut ids = SequentialIdSource::new();
        let document = Document::new(&mut ids, CANVAS, CANVAS);
        Self { document, ids }
    }

    fn add(&mut self, x: f64, y: f64, width: f64, height: f64) -> LayerId {
        self.add_rotated(x, y, width, height, 0.0)
    }

    fn add_rotated(&mut self, x: f64, y: f64, width: f64, height: f64, rotation: f64) -> LayerId {
        let operation = Operation::Create(CreateLayer {
            position: LayerPosition::Root { index: None },
            transform: Transform {
                rotation,
                ..Transform::new(x, y, width, height)
            },
            name: None,
            kind: NewLayerKind::Text {
                text: "x".to_owned(),
                font_family: "Inter".to_owned(),
                font_size: 12.0,
                color: Color::new("#000000"),
                align: TextAlign::Left,
                line_height: 1.2,
            },
        });
        apply(&mut self.document, &operation, &mut self.ids)
            .unwrap()
            .created[0]
            .clone()
    }

    fn run(&mut self, operation: Operation) {
        apply(&mut self.document, &operation, &mut self.ids).unwrap();
    }

    fn try_run(&mut self, operation: Operation) -> Result<(), OpError> {
        apply(&mut self.document, &operation, &mut self.ids).map(|_| ())
    }

    fn bounds(&self, id: &LayerId) -> Rect {
        layout::layer_bounds(&self.document, id).unwrap()
    }
}

fn close(a: f64, b: f64) -> bool {
    (a - b).abs() < 1e-9
}

#[test]
fn aligning_left_puts_every_layer_on_the_same_edge() {
    let mut canvas = Canvas::new();
    let ids = vec![
        canvas.add(100.0, 10.0, 50.0, 20.0),
        canvas.add(30.0, 50.0, 80.0, 20.0),
        canvas.add(200.0, 90.0, 10.0, 20.0),
    ];

    canvas.run(Operation::Align {
        ids: ids.clone(),
        edge: AlignEdge::Left,
    });

    // The leftmost layer defines the edge, so nothing moves right of where
    // the set already started.
    for id in &ids {
        assert!(close(canvas.bounds(id).x, 30.0), "{:?}", canvas.bounds(id));
    }
}

#[test]
fn aligning_handles_every_edge_and_never_resizes() {
    for (edge, check) in [
        (AlignEdge::Left, "left"),
        (AlignEdge::Right, "right"),
        (AlignEdge::Top, "top"),
        (AlignEdge::Bottom, "bottom"),
        (AlignEdge::CenterHorizontal, "center-x"),
        (AlignEdge::CenterVertical, "center-y"),
    ] {
        let mut canvas = Canvas::new();
        let ids = vec![
            canvas.add(100.0, 10.0, 50.0, 20.0),
            canvas.add(30.0, 50.0, 80.0, 40.0),
            canvas.add(200.0, 90.0, 10.0, 60.0),
        ];
        let sizes: Vec<(f64, f64)> = ids
            .iter()
            .map(|id| {
                let bounds = canvas.bounds(id);
                (bounds.width, bounds.height)
            })
            .collect();

        canvas.run(Operation::Align {
            ids: ids.clone(),
            edge,
        });

        let boxes: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();
        let value = |rect: &Rect| match edge {
            AlignEdge::Left => rect.x,
            AlignEdge::Right => rect.right(),
            AlignEdge::Top => rect.y,
            AlignEdge::Bottom => rect.bottom(),
            AlignEdge::CenterHorizontal => rect.center_x(),
            AlignEdge::CenterVertical => rect.center_y(),
        };
        let first = value(&boxes[0]);
        for rect in &boxes {
            assert!(close(value(rect), first), "{check}: {boxes:?}");
        }

        // Alignment moves; it never resizes.
        for (rect, (width, height)) in boxes.iter().zip(sizes) {
            assert!(close(rect.width, width), "{check} changed a width");
            assert!(close(rect.height, height), "{check} changed a height");
        }
    }
}

#[test]
fn centring_on_the_canvas_keeps_the_layers_relative_positions() {
    let mut canvas = Canvas::new();
    let a = canvas.add(10.0, 10.0, 100.0, 50.0);
    let b = canvas.add(150.0, 30.0, 50.0, 50.0);
    let gap_before = canvas.bounds(&b).x - canvas.bounds(&a).x;

    canvas.run(Operation::CenterOnCanvas {
        ids: vec![a.clone(), b.clone()],
        axis: Axis::Both,
    });

    let bounds = layout::bounding_box(&canvas.document, &[a.clone(), b.clone()]).unwrap();
    assert!(close(bounds.center_x(), CANVAS / 2.0), "{bounds:?}");
    assert!(close(bounds.center_y(), CANVAS / 2.0), "{bounds:?}");
    assert!(
        close(canvas.bounds(&b).x - canvas.bounds(&a).x, gap_before),
        "the set must move as a unit"
    );
}

#[test]
fn centring_on_one_axis_leaves_the_other_alone() {
    let mut canvas = Canvas::new();
    let id = canvas.add(10.0, 10.0, 100.0, 50.0);

    canvas.run(Operation::CenterOnCanvas {
        ids: vec![id.clone()],
        axis: Axis::Horizontal,
    });

    let bounds = canvas.bounds(&id);
    assert!(close(bounds.center_x(), CANVAS / 2.0), "{bounds:?}");
    assert!(close(bounds.y, 10.0), "{bounds:?}");
}

#[test]
fn distributing_leaves_equal_gaps() {
    let mut canvas = Canvas::new();
    let ids = vec![
        canvas.add(0.0, 0.0, 40.0, 10.0),
        canvas.add(50.0, 0.0, 20.0, 10.0),
        canvas.add(60.0, 0.0, 30.0, 10.0),
        canvas.add(400.0, 0.0, 10.0, 10.0),
    ];

    canvas.run(Operation::Distribute {
        ids: ids.clone(),
        axis: Axis::Horizontal,
    });

    let mut boxes: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();
    boxes.sort_by(|a, b| a.x.partial_cmp(&b.x).unwrap());
    let gaps: Vec<f64> = boxes
        .windows(2)
        .map(|pair| pair[1].x - pair[0].right())
        .collect();
    for gap in &gaps {
        assert!(close(*gap, gaps[0]), "{gaps:?}");
    }

    // The outermost two define the span and do not move.
    assert!(close(boxes[0].x, 0.0), "{boxes:?}");
    assert!(close(boxes[3].right(), 410.0), "{boxes:?}");
}

#[test]
fn distributing_fewer_than_three_layers_does_nothing() {
    let mut canvas = Canvas::new();
    let ids = vec![
        canvas.add(0.0, 0.0, 10.0, 10.0),
        canvas.add(90.0, 0.0, 10.0, 10.0),
    ];
    let before: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();

    canvas.run(Operation::Distribute {
        ids: ids.clone(),
        axis: Axis::Horizontal,
    });

    let after: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();
    assert_eq!(before, after);
}

#[test]
fn snapping_puts_a_layer_against_another_layers_edge() {
    let mut canvas = Canvas::new();
    let anchor = canvas.add(300.0, 300.0, 100.0, 100.0);
    let mover = canvas.add(0.0, 0.0, 40.0, 40.0);

    canvas.run(Operation::SnapTo {
        id: mover.clone(),
        target: SnapTarget::Layer {
            id: anchor.clone(),
            edge: AlignEdge::Left,
        },
    });

    let moved = canvas.bounds(&mover);
    assert!(close(moved.right(), 300.0), "{moved:?}");
    // Snapping to the left edge moves horizontally only.
    assert!(close(moved.y, 0.0), "{moved:?}");
}

#[test]
fn snapping_to_a_canvas_edge_lands_on_it() {
    let mut canvas = Canvas::new();
    let id = canvas.add(123.0, 456.0, 40.0, 40.0);

    canvas.run(Operation::SnapTo {
        id: id.clone(),
        target: SnapTarget::Canvas {
            edge: AlignEdge::Bottom,
        },
    });

    let bounds = canvas.bounds(&id);
    assert!(close(bounds.bottom(), CANVAS), "{bounds:?}");
}

#[test]
fn layout_operations_respect_protection_and_locks() {
    let mut canvas = Canvas::new();
    let a = canvas.add(0.0, 0.0, 10.0, 10.0);
    let b = canvas.add(50.0, 50.0, 10.0, 10.0);

    // Locked.
    canvas.run(Operation::SetLocked {
        id: b.clone(),
        locked: true,
    });
    let error = canvas
        .try_run(Operation::Align {
            ids: vec![a.clone(), b.clone()],
            edge: AlignEdge::Left,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::LayerLocked { .. }), "{error:?}");
    canvas.run(Operation::SetLocked {
        id: b.clone(),
        locked: false,
    });

    // Protected.
    if let Some(layer) = canvas.document.layers.iter_mut().find(|l| l.id == b) {
        layer.protected = true;
    }
    let error = canvas
        .try_run(Operation::CenterOnCanvas {
            ids: vec![a, b],
            axis: Axis::Both,
        })
        .unwrap_err();
    assert!(matches!(error, OpError::LayerProtected { .. }), "{error:?}");
}

#[test]
fn a_layer_inside_a_rotated_group_is_refused_rather_than_misplaced() {
    let mut canvas = Canvas::new();
    let child = Layer::new(
        LayerId::new("layer_child"),
        Transform::new(5.0, 5.0, 10.0, 10.0),
        LayerKind::Text(TextLayer {
            text: "x".to_owned(),
            font_family: "Inter".to_owned(),
            font_size: 12.0,
            color: Color::new("#000000"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    );
    canvas.document.layers.push(Layer::new(
        LayerId::new("layer_tilted_group"),
        Transform {
            rotation: 20.0,
            ..Transform::new(0.0, 0.0, 100.0, 100.0)
        },
        LayerKind::Group(GroupLayer {
            children: vec![child],
            extra: Extras::new(),
        }),
    ));

    let error = layout::layer_bounds(&canvas.document, &LayerId::new("layer_child")).unwrap_err();
    assert!(
        matches!(error, layout::LayoutError::RotatedAncestor { .. }),
        "{error:?}"
    );
}

#[test]
fn overlaps_are_found_symmetrically_and_never_against_self() {
    let mut canvas = Canvas::new();
    let a = canvas.add(0.0, 0.0, 100.0, 100.0);
    let b = canvas.add(50.0, 50.0, 100.0, 100.0);
    let c = canvas.add(500.0, 500.0, 10.0, 10.0);

    let overlaps =
        layout::find_overlaps(&canvas.document, &[a.clone(), b.clone(), c.clone()]).unwrap();
    assert_eq!(overlaps, vec![(a.clone(), b.clone())]);

    // Order of the ids does not change the answer, only the order of the pair.
    let reversed = layout::find_overlaps(&canvas.document, &[b.clone(), a.clone(), c]).unwrap();
    assert_eq!(reversed, vec![(b, a)]);
}

#[test]
fn a_rotated_layer_is_boxed_by_what_it_actually_covers() {
    let mut canvas = Canvas::new();
    let id = canvas.add_rotated(0.0, 0.0, 100.0, 20.0, 90.0);
    let bounds = canvas.bounds(&id);
    assert!(close(bounds.width, 20.0), "{bounds:?}");
    assert!(close(bounds.height, 100.0), "{bounds:?}");
}

// ---------------------------------------------------------------------------
// Properties — the exit test
// ---------------------------------------------------------------------------

fn boxes() -> impl Strategy<Value = Vec<(f64, f64, f64, f64)>> {
    prop::collection::vec(
        (0.0f64..800.0, 0.0f64..800.0, 1.0f64..150.0, 1.0f64..150.0),
        1..6,
    )
}

fn edges() -> impl Strategy<Value = AlignEdge> {
    prop_oneof![
        Just(AlignEdge::Left),
        Just(AlignEdge::Right),
        Just(AlignEdge::Top),
        Just(AlignEdge::Bottom),
        Just(AlignEdge::CenterHorizontal),
        Just(AlignEdge::CenterVertical),
    ]
}

fn build(boxes: &[(f64, f64, f64, f64)]) -> (Canvas, Vec<LayerId>) {
    let mut canvas = Canvas::new();
    let ids = boxes
        .iter()
        .map(|(x, y, width, height)| canvas.add(*x, *y, *width, *height))
        .collect();
    (canvas, ids)
}

proptest! {
    /// Aligning twice is the same as aligning once — the operation settles.
    #[test]
    fn aligning_is_idempotent(boxes in boxes(), edge in edges()) {
        let (mut canvas, ids) = build(&boxes);
        canvas.run(Operation::Align { ids: ids.clone(), edge });
        let once: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();

        canvas.run(Operation::Align { ids: ids.clone(), edge });
        let twice: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();

        prop_assert_eq!(once, twice);
    }

    /// The same document and the same ids give the same numbers, every time.
    #[test]
    fn layout_is_deterministic(boxes in boxes(), edge in edges()) {
        let (mut first, first_ids) = build(&boxes);
        let (mut second, second_ids) = build(&boxes);

        first.run(Operation::Align { ids: first_ids.clone(), edge });
        second.run(Operation::Align { ids: second_ids.clone(), edge });

        let a: Vec<Rect> = first_ids.iter().map(|id| first.bounds(id)).collect();
        let b: Vec<Rect> = second_ids.iter().map(|id| second.bounds(id)).collect();
        prop_assert_eq!(a, b);
    }

    /// No layout operation ever changes a size or a rotation.
    #[test]
    fn layout_never_resizes_or_rotates(boxes in boxes(), edge in edges()) {
        let (mut canvas, ids) = build(&boxes);
        let before: Vec<(f64, f64, f64)> = ids
            .iter()
            .map(|id| {
                let layer = canvas.document.find_layer(id).unwrap();
                (layer.transform.width, layer.transform.height, layer.transform.rotation)
            })
            .collect();

        canvas.run(Operation::Align { ids: ids.clone(), edge });
        canvas.run(Operation::CenterOnCanvas { ids: ids.clone(), axis: Axis::Both });
        canvas.run(Operation::Distribute { ids: ids.clone(), axis: Axis::Horizontal });

        let after: Vec<(f64, f64, f64)> = ids
            .iter()
            .map(|id| {
                let layer = canvas.document.find_layer(id).unwrap();
                (layer.transform.width, layer.transform.height, layer.transform.rotation)
            })
            .collect();
        prop_assert_eq!(before, after);
        prop_assert!(validate(&canvas.document).is_ok());
    }

    /// Centring lands the set's bounding box on the canvas centre.
    #[test]
    fn centring_hits_the_middle(boxes in boxes()) {
        let (mut canvas, ids) = build(&boxes);
        canvas.run(Operation::CenterOnCanvas { ids: ids.clone(), axis: Axis::Both });

        let bounds = layout::bounding_box(&canvas.document, &ids).unwrap();
        prop_assert!((bounds.center_x() - CANVAS / 2.0).abs() < 1e-9);
        prop_assert!((bounds.center_y() - CANVAS / 2.0).abs() < 1e-9);
    }

    /// Distributing leaves equal gaps, whatever order the ids arrive in.
    #[test]
    fn distributing_evens_the_gaps(boxes in prop::collection::vec(
        (0.0f64..800.0, 1.0f64..80.0), 3..6
    )) {
        let mut canvas = Canvas::new();
        let ids: Vec<LayerId> = boxes
            .iter()
            .map(|(x, width)| canvas.add(*x, 0.0, *width, 10.0))
            .collect();

        canvas.run(Operation::Distribute { ids: ids.clone(), axis: Axis::Horizontal });

        let mut rects: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();
        rects.sort_by(|a, b| a.x.partial_cmp(&b.x).unwrap());
        let gaps: Vec<f64> = rects.windows(2).map(|pair| pair[1].x - pair[0].right()).collect();
        for gap in &gaps {
            // Layers wider than the span they must fit in produce negative
            // gaps — overlapping, but still evenly so.
            prop_assert!((gap - gaps[0]).abs() < 1e-6, "{:?}", gaps);
        }
    }

    /// The bounding box really is the union of what it contains.
    #[test]
    fn the_bounding_box_contains_everything(boxes in boxes()) {
        let (canvas, ids) = build(&boxes);
        let bounds = layout::bounding_box(&canvas.document, &ids).unwrap();
        for id in &ids {
            let rect = canvas.bounds(id);
            prop_assert!(rect.x >= bounds.x - 1e-9);
            prop_assert!(rect.y >= bounds.y - 1e-9);
            prop_assert!(rect.right() <= bounds.right() + 1e-9);
            prop_assert!(rect.bottom() <= bounds.bottom() + 1e-9);
        }
    }

    /// Overlap detection agrees with a brute-force check of the same boxes.
    #[test]
    fn overlaps_agree_with_brute_force(boxes in boxes()) {
        let (canvas, ids) = build(&boxes);
        let found = layout::find_overlaps(&canvas.document, &ids).unwrap();

        let rects: Vec<Rect> = ids.iter().map(|id| canvas.bounds(id)).collect();
        let mut expected = Vec::new();
        for (i, first) in rects.iter().enumerate() {
            for (j, second) in rects.iter().enumerate().skip(i + 1) {
                let touching_only = first.right() <= second.x
                    || second.right() <= first.x
                    || first.bottom() <= second.y
                    || second.bottom() <= first.y;
                if !touching_only {
                    expected.push((ids[i].clone(), ids[j].clone()));
                }
            }
        }
        prop_assert_eq!(found, expected);
    }
}
