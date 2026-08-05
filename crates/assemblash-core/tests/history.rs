//! v0.3.0 exit tests, parts one and two.
//!
//! 1. apply then undo produces a **byte-identical** document;
//! 2. mutating a protected layer is rejected.
//!
//! Part three — surviving a hard kill mid-write — needs a real process to
//! kill, so it lives in the CLI crate's tests.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::Path;

use assemblash_core::document::{TextAlign, Transform};
use assemblash_core::history::{Actor, ActorKind, EntryKind};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::ops::{CreateLayer, LayerPosition, NewLayerKind, OpError, Operation};
use assemblash_core::storage::DOCUMENT_FILE;
use assemblash_core::{Color, Document, Session, SessionError};
use proptest::prelude::*;

fn human() -> Actor {
    Actor::named(ActorKind::Human, "test")
}

fn agent() -> Actor {
    Actor::named(ActorKind::Agent, "test-agent")
}

fn new_text(text: &str) -> Operation {
    Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform::new(10.0, 10.0, 100.0, 40.0),
        name: None,
        kind: NewLayerKind::Text {
            text: text.to_owned(),
            font_family: "Inter".to_owned(),
            font_size: 16.0,
            color: Color::new("#000000"),
            align: TextAlign::Left,
            line_height: 1.2,
        },
    })
}

struct Project {
    _dir: tempfile::TempDir,
    session: Session,
    ids: SequentialIdSource,
}

impl Project {
    fn new() -> Self {
        let dir = tempfile::tempdir().unwrap();
        let mut ids = SequentialIdSource::new();
        let document = Document::new(&mut ids, 400.0, 400.0);
        let session = Session::create(dir.path(), document, Some(1)).unwrap();
        Self {
            _dir: dir,
            session,
            ids,
        }
    }

    fn path(&self) -> &Path {
        self.session.project_dir()
    }

    fn apply(&mut self, operation: Operation) -> Vec<LayerId> {
        self.session
            .apply(&operation, &human(), Some(1), None, &mut self.ids)
            .unwrap()
            .0
            .created
    }

    fn document_bytes(&self) -> Vec<u8> {
        std::fs::read(self.path().join(DOCUMENT_FILE)).unwrap()
    }
}

/// Closes a project, edits the document on disk, and reopens it.
///
/// Needed because a session holds the lock: the old one has to be dropped
/// before a new one can be taken. Returns the temporary directory's guard
/// alive inside the tuple so the project is not deleted early.
fn reopen_with(
    project: Project,
    edit: impl FnOnce(&mut Document),
) -> (std::path::PathBuf, Session, SequentialIdSource) {
    let Project { _dir, session, ids } = project;
    let path = session.project_dir().to_path_buf();
    let mut document = session.document().clone();
    edit(&mut document);
    drop(session);
    assemblash_core::storage::save(&document, &path).unwrap();
    let session = Session::open(&path, Some(9)).unwrap();
    // The temporary directory must outlive the session; leaking its guard is
    // the simplest way to say so in a test process that is about to exit.
    std::mem::forget(_dir);
    (path, session, ids)
}

/// **Exit test 1.** The whole milestone rests on this: if undo cannot put the
/// document back exactly, nothing built on undo can be trusted.
#[test]
fn apply_then_undo_gives_a_byte_identical_document() {
    let mut project = Project::new();
    let before = project.document_bytes();

    project.apply(new_text("hello"));
    assert_ne!(project.document_bytes(), before, "the edit did something");

    project
        .session
        .undo(&human(), Some(2), &mut project.ids)
        .unwrap();

    assert_eq!(
        project.document_bytes(),
        before,
        "undo must restore the file byte for byte"
    );
    assert!(project.session.document().layers.is_empty());
}

#[test]
fn undo_and_redo_walk_the_whole_history() {
    let mut project = Project::new();
    let empty = project.document_bytes();
    project.apply(new_text("one"));
    let after_one = project.document_bytes();
    project.apply(new_text("two"));
    let after_two = project.document_bytes();

    for _ in 0..2 {
        project
            .session
            .undo(&human(), Some(3), &mut project.ids)
            .unwrap();
    }
    assert_eq!(project.document_bytes(), empty);
    assert!(!project.session.history().can_undo());

    project
        .session
        .redo(&human(), Some(4), &mut project.ids)
        .unwrap();
    assert_eq!(project.document_bytes(), after_one);

    project
        .session
        .redo(&human(), Some(5), &mut project.ids)
        .unwrap();
    assert_eq!(project.document_bytes(), after_two);
    assert!(!project.session.history().can_redo());
}

#[test]
fn a_new_operation_after_an_undo_makes_the_redo_tail_unreachable() {
    let mut project = Project::new();
    project.apply(new_text("one"));
    project.apply(new_text("two"));

    project
        .session
        .undo(&human(), Some(3), &mut project.ids)
        .unwrap();
    assert!(project.session.history().can_redo());

    project.apply(new_text("different"));
    assert!(
        !project.session.history().can_redo(),
        "the abandoned branch must not be redoable"
    );

    // But it is still in the journal: the audit trail keeps what happened
    // even when the document no longer reflects it.
    let abandoned = project
        .session
        .history()
        .entries()
        .iter()
        .filter_map(|entry| match &entry.kind {
            EntryKind::Applied { operation, .. } => Some(operation),
            _ => None,
        })
        .filter(|operation| format!("{operation:?}").contains("two"))
        .count();
    assert_eq!(abandoned, 1);
}

#[test]
fn undo_survives_closing_and_reopening_the_project() {
    let dir = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();

    let before = {
        let document = Document::new(&mut ids, 400.0, 400.0);
        let mut session = Session::create(dir.path(), document, Some(1)).unwrap();
        let before = std::fs::read(dir.path().join(DOCUMENT_FILE)).unwrap();
        session
            .apply(&new_text("persisted"), &human(), Some(2), None, &mut ids)
            .unwrap();
        before
    };

    // Reopened in a new session: undo has to work from what is on disk, which
    // is the point of a journal rather than an in-memory stack.
    let mut session = Session::open(dir.path(), Some(3)).unwrap();
    assert!(session.history().can_undo());
    session.undo(&human(), Some(4), &mut ids).unwrap();
    assert_eq!(
        std::fs::read(dir.path().join(DOCUMENT_FILE)).unwrap(),
        before
    );
}

#[test]
fn the_journal_records_who_did_what() {
    let mut project = Project::new();
    let created = project
        .session
        .apply(
            &new_text("audited"),
            &agent(),
            Some(42),
            None,
            &mut project.ids,
        )
        .unwrap();

    let entry = project.session.history().entries().last().unwrap();
    assert_eq!(entry.actor.kind, ActorKind::Agent);
    assert_eq!(entry.actor.detail.as_deref(), Some("test-agent"));
    assert_eq!(entry.recorded_at, Some(42));
    assert_eq!(entry.transaction, created.1);
    match &entry.kind {
        EntryKind::Applied { outcome, .. } => {
            assert_eq!(outcome.created.len(), 1);
        }
        other => panic!("expected an applied entry, got {other:?}"),
    }

    // And it is on disk as one greppable line per operation.
    let journal = std::fs::read_to_string(
        project
            .path()
            .join(assemblash_core::history::HISTORY_DIR)
            .join(assemblash_core::history::JOURNAL_FILE),
    )
    .unwrap();
    assert_eq!(journal.lines().count(), 1);
    assert!(journal.contains("\"kind\":\"applied\""), "{journal}");
    assert!(journal.contains("test-agent"), "{journal}");
}

/// **Exit test 2.** MVP criterion 11: a protected layer cannot be modified
/// through normal tools.
#[test]
fn protected_layers_reject_every_mutation() {
    let mut project = Project::new();
    let id = project.apply(new_text("precious"))[0].clone();

    // Protection is set directly here: it is a property of the document, and
    // v0.3 does not yet expose an operation for it.
    let (path, mut session, mut ids) = reopen_with(project, |document| {
        document.layers[0].protected = true;
    });

    let mutations = [
        Operation::Delete { id: id.clone() },
        Operation::Move {
            id: id.clone(),
            dx: 1.0,
            dy: 1.0,
        },
        Operation::Resize {
            id: id.clone(),
            width: 5.0,
            height: 5.0,
        },
        Operation::Rotate {
            id: id.clone(),
            degrees: 10.0,
        },
        Operation::Rename {
            id: id.clone(),
            name: Some("renamed".to_owned()),
        },
        Operation::SetVisible {
            id: id.clone(),
            visible: false,
        },
        Operation::SetLocked {
            id: id.clone(),
            locked: true,
        },
        Operation::Group {
            ids: vec![id.clone()],
            name: None,
        },
        Operation::Reorder {
            id: id.clone(),
            to: LayerPosition::Root { index: Some(0) },
        },
    ];

    for operation in mutations {
        let before = std::fs::read(path.join(DOCUMENT_FILE)).unwrap();
        let error = session
            .apply(&operation, &agent(), Some(10), None, &mut ids)
            .unwrap_err();
        assert!(
            matches!(
                error,
                SessionError::Operation(OpError::LayerProtected { .. })
            ),
            "{operation:?} was not refused: {error:?}"
        );
        assert_eq!(
            std::fs::read(path.join(DOCUMENT_FILE)).unwrap(),
            before,
            "{operation:?} changed the document despite being refused"
        );
    }
}

#[test]
fn a_protected_child_stops_its_group_being_deleted() {
    let mut project = Project::new();
    let child = project.apply(new_text("precious"))[0].clone();
    let group = project.apply(Operation::Group {
        ids: vec![child.clone()],
        name: None,
    })[0]
        .clone();

    let (_path, mut session, mut ids) = reopen_with(project, |document| {
        if let assemblash_core::LayerKind::Group(inner) = &mut document.layers[0].kind {
            inner.children[0].protected = true;
        }
    });

    let error = session
        .apply(
            &Operation::Delete { id: group },
            &agent(),
            Some(10),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(
        matches!(
            error,
            SessionError::Operation(OpError::LayerProtected { .. })
        ),
        "{error:?}"
    );
}

#[test]
fn a_protected_child_stops_its_group_being_ungrouped() {
    // Ungrouping rebases every child's transform into the parent's coordinate
    // space, so it changes each child. Checking only the group let a protected
    // layer be modified by dissolving the container around it.
    let mut project = Project::new();
    let child = project.apply(new_text("precious"))[0].clone();
    let group = project.apply(Operation::Group {
        ids: vec![child.clone()],
        name: None,
    })[0]
        .clone();

    let (_path, mut session, mut ids) = reopen_with(project, |document| {
        if let assemblash_core::LayerKind::Group(inner) = &mut document.layers[0].kind {
            inner.children[0].protected = true;
        }
    });

    let error = session
        .apply(
            &Operation::Ungroup { id: group },
            &agent(),
            Some(10),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(
        matches!(
            error,
            SessionError::Operation(OpError::LayerProtected { .. })
        ),
        "{error:?}"
    );
}

#[test]
fn a_project_made_by_hand_can_still_be_undone() {
    // A directory someone assembled themselves — document.json and nothing
    // else — has no snapshot to rebuild from, so its very first undo used to
    // fail. Hand-editing is supported (FR-9), so hand-making one is too.
    let directory = tempfile::tempdir().unwrap();
    let document = Document::new(&mut SequentialIdSource::new(), 100.0, 100.0);
    assemblash_core::storage::save(&document, directory.path()).unwrap();
    let before = std::fs::read(directory.path().join("document.json")).unwrap();

    let mut ids = SequentialIdSource::new();
    let mut session = Session::open(directory.path(), Some(1)).unwrap();
    session
        .apply(&new_text("added"), &agent(), Some(2), None, &mut ids)
        .unwrap();
    assert_ne!(
        std::fs::read(directory.path().join("document.json")).unwrap(),
        before
    );

    session.undo(&agent(), Some(3), &mut ids).unwrap();
    assert_eq!(
        std::fs::read(directory.path().join("document.json")).unwrap(),
        before,
        "undo must restore a hand-made project byte for byte"
    );
}

#[test]
fn read_only_layers_reject_mutations_too() {
    let mut project = Project::new();
    let id = project.apply(new_text("frozen"))[0].clone();
    let (_path, mut session, mut ids) = reopen_with(project, |document| {
        document.layers[0].read_only = true;
    });

    let error = session
        .apply(
            &Operation::Move {
                id,
                dx: 1.0,
                dy: 0.0,
            },
            &human(),
            Some(10),
            None,
            &mut ids,
        )
        .unwrap_err();
    assert!(
        matches!(
            error,
            SessionError::Operation(OpError::LayerReadOnly { .. })
        ),
        "{error:?}"
    );
}

#[test]
fn a_stale_expected_version_is_refused() {
    let mut project = Project::new();
    project.apply(new_text("first"));
    assert_eq!(project.session.version(), 1);

    let error = project
        .session
        .apply(
            &new_text("second"),
            &agent(),
            Some(5),
            // The caller thinks it is still working against the empty
            // document it read a moment ago.
            Some(0),
            &mut project.ids,
        )
        .unwrap_err();

    assert!(
        matches!(
            error,
            SessionError::VersionConflict {
                expected: 0,
                actual: 1
            }
        ),
        "{error:?}"
    );

    // The right version is accepted.
    project
        .session
        .apply(
            &new_text("second"),
            &agent(),
            Some(6),
            Some(1),
            &mut project.ids,
        )
        .unwrap();
}

#[test]
fn a_second_process_cannot_open_a_locked_project() {
    let project = Project::new();
    let error = Session::open(project.path(), Some(2)).unwrap_err();
    assert!(matches!(error, SessionError::Locked { .. }), "{error:?}");

    // Read-only access is still possible, and says so by not taking the lock.
    let reader = Session::open_read_only(project.path()).unwrap();
    assert_eq!(reader.document(), project.session.document());
}

#[test]
fn the_lock_is_released_when_the_session_ends() {
    let dir = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();
    {
        let document = Document::new(&mut ids, 100.0, 100.0);
        let _session = Session::create(dir.path(), document, Some(1)).unwrap();
        assert!(dir
            .path()
            .join(assemblash_core::session::LOCK_FILE)
            .exists());
    }
    assert!(!dir
        .path()
        .join(assemblash_core::session::LOCK_FILE)
        .exists());
    // And so the project opens again.
    Session::open(dir.path(), Some(2)).unwrap();
}

#[test]
fn force_unlock_clears_a_lock_left_behind() {
    let dir = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();
    let document = Document::new(&mut ids, 100.0, 100.0);
    Session::create(dir.path(), document, Some(1)).unwrap();
    // Simulate a process that died without releasing.
    std::fs::write(
        dir.path().join(assemblash_core::session::LOCK_FILE),
        "{\"pid\":999999}",
    )
    .unwrap();

    assert!(matches!(
        Session::open(dir.path(), Some(2)),
        Err(SessionError::Locked { .. })
    ));
    assert!(assemblash_core::session::force_unlock(dir.path()).unwrap());
    Session::open(dir.path(), Some(3)).unwrap();
}

/// The v0.3 guarantee has to hold for the operations added in v0.4 too.
#[test]
fn layout_operations_undo_to_a_byte_identical_document() {
    use assemblash_core::ops::{AlignEdge, Axis};

    let mut project = Project::new();
    let a = project.apply(new_text("one"))[0].clone();
    let b = project.apply(new_text("two"))[0].clone();
    project
        .session
        .apply(
            &Operation::Move {
                id: b.clone(),
                dx: 137.0,
                dy: 61.0,
            },
            &human(),
            Some(3),
            None,
            &mut project.ids,
        )
        .unwrap();

    for operation in [
        Operation::Align {
            ids: vec![a.clone(), b.clone()],
            edge: AlignEdge::Left,
        },
        Operation::CenterOnCanvas {
            ids: vec![a.clone(), b.clone()],
            axis: Axis::Both,
        },
        Operation::Distribute {
            ids: vec![a.clone(), b.clone()],
            axis: Axis::Horizontal,
        },
    ] {
        let before = project.document_bytes();
        project
            .session
            .apply(&operation, &human(), Some(4), None, &mut project.ids)
            .unwrap();
        project
            .session
            .undo(&human(), Some(5), &mut project.ids)
            .unwrap();
        assert_eq!(
            project.document_bytes(),
            before,
            "{operation:?} did not undo cleanly"
        );
    }
}

proptest! {
    /// Undo is exact however long the history is, and whatever mix of edits
    /// went into it.
    #[test]
    fn undoing_every_operation_returns_to_the_start(steps in 1usize..8) {
        let mut project = Project::new();
        let start = project.document_bytes();

        let mut checkpoints = vec![start.clone()];
        for step in 0..steps {
            project.apply(new_text(&format!("layer {step}")));
            checkpoints.push(project.document_bytes());
        }

        for expected in checkpoints.iter().rev().skip(1) {
            project
                .session
                .undo(&human(), Some(99), &mut project.ids)
                .unwrap();
            prop_assert_eq!(&project.document_bytes(), expected);
        }
        prop_assert_eq!(project.document_bytes(), start);
    }
}
