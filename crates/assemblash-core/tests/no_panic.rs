//! v0.2.0 exit test, part two: invalid input produces a typed error, never a
//! panic.
//!
//! The operation layer is reachable from an HTTP request (v0.6) and from an
//! agent (v0.7), so "the caller sent nonsense" is the normal case, not the
//! exceptional one. A panic there is a crashed server, and in a long-running
//! process it is other people's work lost.
//!
//! These tests throw hostile values at every entry point: ids that do not
//! exist, indices past the end, NaN and infinity, enormous numbers, empty
//! strings, and deeply nested structures. The only acceptable outcomes are a
//! valid document or an `Err`.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{ImageFit, TextAlign, Transform};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::ops::{
    apply, dry_run, CreateLayer, LayerPosition, NewLayerKind, Operation, UpdateLayer,
};
use assemblash_core::{svg_import, validate, Color, Document};
use proptest::prelude::*;

fn seed_document() -> Document {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 400.0, 400.0);
    for index in 0..3 {
        apply(
            &mut document,
            &Operation::Create(CreateLayer {
                position: LayerPosition::Root { index: None },
                transform: Transform::new(index as f64 * 10.0, 0.0, 20.0, 20.0),
                name: None,
                kind: NewLayerKind::Text {
                    text: "seed".to_owned(),
                    font_family: "Inter".to_owned(),
                    font_size: 12.0,
                    color: Color::new("#000000"),
                    align: TextAlign::Left,
                    line_height: 1.2,
                },
            }),
            &mut ids,
        )
        .unwrap();
    }
    // One group, so the tree has depth.
    let first = document.layers[0].id.clone();
    apply(
        &mut document,
        &Operation::Group {
            ids: vec![first],
            name: None,
        },
        &mut ids,
    )
    .unwrap();
    document
}

/// Numbers chosen to break things: the non-finite ones, the extremes, and
/// zero.
fn hostile_number() -> impl Strategy<Value = f64> {
    prop_oneof![
        Just(f64::NAN),
        Just(f64::INFINITY),
        Just(f64::NEG_INFINITY),
        Just(0.0),
        Just(-0.0),
        Just(f64::MAX),
        Just(f64::MIN),
        Just(f64::MIN_POSITIVE),
        Just(-1.0),
        -1e12f64..1e12,
    ]
}

/// Ids that mostly do not exist, and are sometimes not even well formed.
fn hostile_id() -> impl Strategy<Value = LayerId> {
    prop_oneof![
        Just(LayerId::new("layer_00000000000000000000000001")),
        Just(LayerId::new("layer_00000000000000000000000004")),
        Just(LayerId::new("")),
        Just(LayerId::new("layer_")),
        Just(LayerId::new("not-an-id")),
        Just(LayerId::new("asset_00000000000000000000000001")),
        "[a-z_]{0,20}".prop_map(LayerId::new),
    ]
}

fn hostile_index() -> impl Strategy<Value = Option<usize>> {
    prop_oneof![
        Just(None),
        Just(Some(0)),
        Just(Some(1)),
        Just(Some(usize::MAX)),
        Just(Some(9_999_999)),
    ]
}

fn hostile_position() -> impl Strategy<Value = LayerPosition> {
    prop_oneof![
        hostile_index().prop_map(|index| LayerPosition::Root { index }),
        (hostile_id(), hostile_index())
            .prop_map(|(parent, index)| LayerPosition::In { parent, index }),
    ]
}

fn hostile_operation() -> impl Strategy<Value = Operation> {
    prop_oneof![
        (
            hostile_position(),
            hostile_number(),
            hostile_number(),
            hostile_number(),
            hostile_number()
        )
            .prop_map(
                |(position, x, y, width, height)| Operation::Create(CreateLayer {
                    position,
                    transform: Transform::new(x, y, width, height),
                    name: None,
                    kind: NewLayerKind::Text {
                        text: String::new(),
                        font_family: String::new(),
                        font_size: width,
                        color: Color::new("not a color"),
                        align: TextAlign::Left,
                        line_height: height,
                    },
                })
            ),
        (hostile_position(), hostile_id()).prop_map(|(position, asset)| Operation::Create(
            CreateLayer {
                position,
                transform: Transform::new(0.0, 0.0, 10.0, 10.0),
                name: None,
                kind: NewLayerKind::Image {
                    asset: AssetId::new(asset.as_str()),
                    fit: ImageFit::Fill,
                },
            }
        )),
        (hostile_id(), hostile_number()).prop_map(|(id, opacity)| Operation::Update(UpdateLayer {
            opacity: Some(opacity),
            text: Some(String::new()),
            font_size: Some(opacity),
            fit: Some(ImageFit::Cover),
            ..UpdateLayer::new(id)
        })),
        hostile_id().prop_map(|id| Operation::Delete { id }),
        hostile_id().prop_map(|id| Operation::Duplicate { id }),
        (hostile_id(), hostile_number(), hostile_number())
            .prop_map(|(id, dx, dy)| Operation::Move { id, dx, dy }),
        (hostile_id(), hostile_number(), hostile_number())
            .prop_map(|(id, width, height)| Operation::Resize { id, width, height }),
        (hostile_id(), hostile_number())
            .prop_map(|(id, degrees)| Operation::Rotate { id, degrees }),
        (hostile_id(), hostile_position()).prop_map(|(id, to)| Operation::Reorder { id, to }),
        (prop::collection::vec(hostile_id(), 0..4))
            .prop_map(|ids| Operation::Group { ids, name: None }),
        hostile_id().prop_map(|id| Operation::Ungroup { id }),
        (hostile_id(), any::<bool>())
            .prop_map(|(id, visible)| Operation::SetVisible { id, visible }),
        (hostile_id(), any::<bool>()).prop_map(|(id, locked)| Operation::SetLocked { id, locked }),
        hostile_id().prop_map(|id| Operation::Rename { id, name: None }),
    ]
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(400))]

    /// One hostile operation against a real document: either it applies and
    /// the document is still valid, or it is refused and the document is
    /// untouched. No third outcome, and no panic.
    #[test]
    fn a_single_hostile_operation_never_panics(operation in hostile_operation()) {
        let mut document = seed_document();
        let before = document.clone();
        let mut ids = SequentialIdSource::new();

        match apply(&mut document, &operation, &mut ids) {
            Ok(_) => prop_assert!(
                validate(&document).is_ok(),
                "operation {:?} produced an invalid document",
                operation
            ),
            Err(_) => prop_assert_eq!(&document, &before),
        }
    }

    /// Long sequences of hostile operations cannot corrupt a document either
    /// — the failure mode to catch is the one that only appears on the
    /// twentieth edit.
    #[test]
    fn sequences_of_hostile_operations_never_panic(
        operations in prop::collection::vec(hostile_operation(), 1..20)
    ) {
        let mut document = seed_document();
        let mut ids = SequentialIdSource::new();

        for operation in operations {
            let before = document.clone();
            match apply(&mut document, &operation, &mut ids) {
                Ok(_) => prop_assert!(validate(&document).is_ok()),
                Err(_) => prop_assert_eq!(&document, &before),
            }
        }
    }

    /// A dry run must never change anything, whatever it is asked to do.
    #[test]
    fn dry_run_never_changes_the_document(operation in hostile_operation()) {
        let document = seed_document();
        let mut ids = SequentialIdSource::new();
        let _ = dry_run(&document, &operation, &mut ids);
        prop_assert_eq!(&document, &seed_document());
    }

    /// The SVG importer takes bytes from anywhere, so it gets the same
    /// treatment: any input at all, no panic.
    #[test]
    fn the_svg_importer_never_panics(source in ".{0,400}") {
        match svg_import::sanitize(&source) {
            // Whatever comes out must itself be clean when run through again:
            // sanitising is a fixed point, not a single pass that might leave
            // something behind.
            Ok((clean, _)) => {
                let (again, report) = svg_import::sanitize(&clean)
                    .expect("sanitised output is importable");
                prop_assert_eq!(clean, again);
                prop_assert!(report.is_clean());
            }
            Err(_) => {}
        }
    }
}

#[test]
fn deeply_nested_svg_is_refused_rather_than_overflowing_the_stack() {
    let depth = 5_000;
    let mut source = String::from(r#"<svg xmlns="http://www.w3.org/2000/svg">"#);
    source.push_str(&"<g>".repeat(depth));
    source.push_str(&"</g>".repeat(depth));
    source.push_str("</svg>");

    // Either the parser refuses it or the depth limit does; what must not
    // happen is a stack overflow, which no error type can report.
    assert!(svg_import::sanitize(&source).is_err());
}

#[test]
fn an_svg_that_is_all_text_or_empty_is_handled() {
    for source in ["", " ", "not xml at all", "<svg", "<svg></svg>", "<svg/>"] {
        // Any outcome except a panic is fine; this is about robustness, not
        // about which error comes back.
        let _ = svg_import::sanitize(source);
    }
}
