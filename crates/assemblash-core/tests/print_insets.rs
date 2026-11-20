//! Bleed and margins: the load rule and the operation rule.
//!
//! Releases before 1.14.0 keep `bleed` and `margins` as unknown canvas
//! fields, and they can resize a canvas below its margins. Such a project
//! must still open. The checks belong to the operation that sets the values:
//! `updateCanvas`.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::SequentialIdSource;
use assemblash_core::ops::{OpError, Operation, UpdateCanvas};
use assemblash_core::{Color, Document, Insets, Session, SessionError, ValidationError};

fn human() -> Actor {
    Actor::named(ActorKind::Human, "test")
}

/// A project whose 100 x 100 canvas has margins of 80 on each side, as an
/// older build leaves it after it resized the canvas.
fn oversized() -> (tempfile::TempDir, std::path::PathBuf) {
    let directory = tempfile::tempdir().unwrap();
    let project = directory.path().join("project");
    let document = Document::new(&mut SequentialIdSource::new(), 400.0, 400.0);
    drop(Session::create(&project, document, Some(1)).unwrap());

    let path = project.join(assemblash_core::storage::DOCUMENT_FILE);
    let mut json: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    json["canvas"]["width"] = 100.0.into();
    json["canvas"]["height"] = 100.0.into();
    json["canvas"]["margins"] =
        serde_json::json!({ "top": 80, "right": 80, "bottom": 80, "left": 80 });
    json["canvas"]["bleed"] = serde_json::json!({ "top": -1, "right": 0, "bottom": 0, "left": 0 });
    std::fs::write(&path, serde_json::to_string_pretty(&json).unwrap()).unwrap();
    (directory, project)
}

fn canvas(request: UpdateCanvas) -> Operation {
    Operation::UpdateCanvas(request)
}

fn refused(error: SessionError) -> Vec<ValidationError> {
    match error {
        SessionError::Operation(OpError::Invalid(errors)) => errors.into_inner(),
        other => panic!("expected a validation refusal, got {other}"),
    }
}

#[test]
fn a_document_with_margins_larger_than_the_canvas_loads_and_can_be_fixed() {
    let (_directory, project) = oversized();
    let mut session = Session::open(&project, Some(2)).expect("the project opens");
    let mut ids = SequentialIdSource::new();

    // An unrelated change still works on the document as it is.
    session
        .apply(
            &canvas(UpdateCanvas {
                background: Some(Some(Color::new("#ffffff"))),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(3),
            None,
            &mut ids,
        )
        .expect("a background change is not a margins change");

    // A resize that still leaves no safe area is refused.
    let error = session
        .apply(
            &canvas(UpdateCanvas {
                width: Some(150.0),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(4),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(matches!(
        refused(error).as_slice(),
        [ValidationError::CanvasMarginsTooLarge { .. }, ..]
    ));

    // updateCanvas fixes both fields.
    session
        .apply(
            &canvas(UpdateCanvas {
                margins: Some(Some(Insets::uniform(10.0))),
                bleed: Some(None),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(5),
            None,
            &mut ids,
        )
        .expect("smaller margins fit");
    let fixed = &session.document().canvas;
    assert_eq!(fixed.margins, Some(Insets::uniform(10.0)));
    assert_eq!(fixed.bleed, None);

    // Undo goes back to the document as it was loaded.
    session.undo(&human(), Some(6), &mut ids).unwrap();
    assert_eq!(
        session.document().canvas.margins,
        Some(Insets::uniform(80.0))
    );
}

#[test]
fn update_canvas_refuses_bad_insets_and_a_resize_under_the_margins() {
    let directory = tempfile::tempdir().unwrap();
    let project = directory.path().join("project");
    let document = Document::new(&mut SequentialIdSource::new(), 100.0, 100.0);
    let mut session = Session::create(&project, document, Some(1)).unwrap();
    let mut ids = SequentialIdSource::new();

    let error = session
        .apply(
            &canvas(UpdateCanvas {
                bleed: Some(Some(Insets {
                    left: -1.0,
                    ..Insets::default()
                })),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(2),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(matches!(
        refused(error).as_slice(),
        [ValidationError::InvalidCanvasInset { field: "bleed", .. }]
    ));

    session
        .apply(
            &canvas(UpdateCanvas {
                margins: Some(Some(Insets::uniform(30.0))),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(3),
            None,
            &mut ids,
        )
        .unwrap();
    let error = session
        .apply(
            &canvas(UpdateCanvas {
                width: Some(60.0),
                ..UpdateCanvas::default()
            }),
            &human(),
            Some(4),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(matches!(
        refused(error).as_slice(),
        [ValidationError::CanvasMarginsTooLarge {
            dimension: "width",
            ..
        }]
    ));
    assert_eq!(session.document().canvas.width, 100.0);
}
