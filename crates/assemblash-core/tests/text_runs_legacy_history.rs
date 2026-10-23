//! Replay fixtures produced by the released 1.11.0 binary.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
};

use assemblash_core::{
    history::{HistoryError, HISTORY_DIR, JOURNAL_FILE, STYLED_RUNS_SEMANTICS},
    ops::Operation,
    storage::DOCUMENT_FILE,
    Actor, ActorKind, Document, LayerKind, SequentialIdSource, Session, SessionError,
};
use serde_json::{json, Value};

fn fixtures() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/styled-runs-legacy-1.11.0")
}

fn copy_tree(source: &Path, target: &Path) {
    fs::create_dir_all(target).unwrap();
    for entry in fs::read_dir(source).unwrap() {
        let entry = entry.unwrap();
        if entry.file_type().unwrap().is_dir() {
            copy_tree(&entry.path(), &target.join(entry.file_name()));
        } else {
            fs::copy(entry.path(), target.join(entry.file_name())).unwrap();
        }
    }
}

fn fixture(name: &str) -> tempfile::TempDir {
    let directory = tempfile::tempdir().unwrap();
    copy_tree(&fixtures().join(name), directory.path());
    directory
}

fn bytes(root: &Path) -> BTreeMap<PathBuf, Vec<u8>> {
    fn visit(root: &Path, directory: &Path, output: &mut BTreeMap<PathBuf, Vec<u8>>) {
        for entry in fs::read_dir(directory).unwrap() {
            let entry = entry.unwrap();
            if entry.file_type().unwrap().is_dir() {
                visit(root, &entry.path(), output);
            } else {
                output.insert(
                    entry.path().strip_prefix(root).unwrap().to_owned(),
                    fs::read(entry.path()).unwrap(),
                );
            }
        }
    }
    let mut output = BTreeMap::new();
    visit(root, root, &mut output);
    output
}

fn expected(name: &str) -> Vec<u8> {
    fs::read(fixtures().join(name)).unwrap()
}
fn document_bytes(root: &Path) -> Vec<u8> {
    fs::read(root.join(DOCUMENT_FILE)).unwrap()
}
fn journal(root: &Path) -> PathBuf {
    root.join(HISTORY_DIR).join(JOURNAL_FILE)
}
fn actor() -> Actor {
    Actor::new(ActorKind::Human)
}
fn raw(document: &Document) -> Value {
    match &document.layers[0].kind {
        LayerKind::Text(text) => json!(text.runs),
        _ => panic!("text fixture"),
    }
}

#[test]
fn actual_legacy_applied_entries_preserve_raw_runs_in_undo_redo_and_reopen() {
    let directory = fixture("project");
    let old_journal = fs::read(journal(directory.path())).unwrap();
    let mut session = Session::open(directory.path(), Some(1)).unwrap();
    let original_runs = raw(session.document());
    let mut ids = SequentialIdSource::new();
    session.undo(&actor(), Some(2), &mut ids).unwrap();
    assert_eq!(
        document_bytes(directory.path()),
        expected("old-text-position2.json")
    );
    assert_eq!(raw(session.document()), original_runs);
    session.redo(&actor(), Some(3), &mut ids).unwrap();
    assert_eq!(
        document_bytes(directory.path()),
        expected("old-text-position3.json")
    );
    drop(session);
    let session = Session::open(directory.path(), Some(4)).unwrap();
    assert_eq!(raw(session.document()), original_runs);
    assert!(fs::read(journal(directory.path()))
        .unwrap()
        .starts_with(&old_journal));
}

#[test]
fn actual_legacy_redo_tail_replays_with_legacy_semantics() {
    let directory = fixture("redo-tail");
    let mut session = Session::open(directory.path(), Some(1)).unwrap();
    assert_eq!(
        document_bytes(directory.path()),
        expected("old-text-position2.json")
    );
    session
        .redo(&actor(), Some(2), &mut SequentialIdSource::new())
        .unwrap();
    assert_eq!(
        document_bytes(directory.path()),
        expected("old-text-position3.json")
    );
}

#[test]
fn actual_legacy_batches_and_template_fills_preserve_raw_values_during_replay() {
    for (name, earlier, later, steps) in [
        (
            "batch",
            "old-batch-position2.json",
            "old-batch-position3.json",
            1,
        ),
        (
            "slots",
            "old-slots-first-fill.json",
            "old-slots-second-fill.json",
            2,
        ),
    ] {
        let directory = fixture(name);
        let old_journal = fs::read(journal(directory.path())).unwrap();
        let mut session = Session::open(directory.path(), Some(1)).unwrap();
        let original = raw(session.document());
        let mut ids = SequentialIdSource::new();
        for _ in 0..steps {
            session.undo(&actor(), Some(2), &mut ids).unwrap();
        }
        assert_eq!(document_bytes(directory.path()), expected(earlier));
        assert_eq!(raw(session.document()), original);
        for _ in 0..steps {
            session.redo(&actor(), Some(3), &mut ids).unwrap();
        }
        assert_eq!(document_bytes(directory.path()), expected(later));
        assert!(fs::read(journal(directory.path()))
            .unwrap()
            .starts_with(&old_journal));
    }
}

#[test]
fn legacy_crash_recovery_preserves_runs_and_read_only_open_preserves_all_bytes() {
    for (name, earlier, later) in [
        (
            "project",
            "old-text-position2.json",
            "old-text-position3.json",
        ),
        (
            "batch",
            "old-batch-position2.json",
            "old-batch-position3.json",
        ),
        (
            "slots",
            "old-slots-first-fill.json",
            "old-slots-second-fill.json",
        ),
    ] {
        let directory = fixture(name);
        fs::write(directory.path().join(DOCUMENT_FILE), expected(earlier)).unwrap();
        let before = bytes(directory.path());
        let session = Session::open_read_only(directory.path()).unwrap();
        assert!(session.recovered_from_interrupted_write());
        let expected_document: Document = serde_json::from_slice(&expected(later)).unwrap();
        assert_eq!(session.document(), &expected_document);
        drop(session);
        assert_eq!(
            bytes(directory.path()),
            before,
            "read-only recovery changes no project file"
        );
        let session = Session::open(directory.path(), Some(2)).unwrap();
        assert!(session.recovered_from_interrupted_write());
        assert_eq!(document_bytes(directory.path()), expected(later));
        assert_eq!(
            fs::read(journal(directory.path())).unwrap(),
            before[&PathBuf::from(HISTORY_DIR).join(JOURNAL_FILE)]
        );
    }
}

#[test]
fn new_applied_and_batch_entries_mark_current_clearing_semantics() {
    for batch in [false, true] {
        let directory = fixture("project");
        let old_journal = fs::read(journal(directory.path())).unwrap();
        let mut session = Session::open(directory.path(), Some(1)).unwrap();
        let original = raw(session.document());
        let operation: Operation = serde_json::from_value(json!({"op":"update",
            "id":session.document().layers[0].id,"text":"third"}))
        .unwrap();
        let mut ids = SequentialIdSource::new();
        if batch {
            session
                .apply_batch("new write", &[operation], &actor(), Some(2), None, &mut ids)
                .unwrap();
        } else {
            session
                .apply(&operation, &actor(), Some(2), None, &mut ids)
                .unwrap();
        }
        assert_eq!(raw(session.document()), json!([]));
        let encoded = fs::read(journal(directory.path())).unwrap();
        assert!(encoded.starts_with(&old_journal));
        let entry: Value = serde_json::from_slice(
            encoded
                .split(|byte| *byte == b'\n')
                .rfind(|line| !line.is_empty())
                .unwrap(),
        )
        .unwrap();
        assert_eq!(entry["operationSemantics"], STYLED_RUNS_SEMANTICS);
        session.undo(&actor(), Some(3), &mut ids).unwrap();
        assert_eq!(raw(session.document()), original);
        session.redo(&actor(), Some(4), &mut ids).unwrap();
        assert_eq!(raw(session.document()), json!([]));
    }
}

#[test]
fn marked_branch_entries_keep_current_semantics_after_reopen_and_redo() {
    for batch in [false, true] {
        let directory = fixture("project");
        let mut session = Session::open(directory.path(), Some(1)).unwrap();
        let original = raw(session.document());
        let mut ids = SequentialIdSource::new();
        session.undo(&actor(), Some(2), &mut ids).unwrap();
        let operation: Operation = serde_json::from_value(json!({"op":"update",
            "id":session.document().layers[0].id,"text":"second"}))
        .unwrap();
        if batch {
            session
                .apply_batch("branch", &[operation], &actor(), Some(3), None, &mut ids)
                .unwrap();
        } else {
            session
                .apply(&operation, &actor(), Some(3), None, &mut ids)
                .unwrap();
        }
        assert_eq!(raw(session.document()), json!([]));
        session.undo(&actor(), Some(4), &mut ids).unwrap();
        assert_eq!(raw(session.document()), original);
        drop(session);
        let mut session = Session::open(directory.path(), Some(5)).unwrap();
        session.redo(&actor(), Some(6), &mut ids).unwrap();
        assert_eq!(raw(session.document()), json!([]));
    }
}

#[test]
fn unknown_semantics_are_typed_errors_even_when_snapshots_cover_the_entry() {
    for marker in [
        json!("future"),
        Value::Null,
        json!(7),
        json!(true),
        json!({"future":1}),
        json!([1]),
    ] {
        for read_only in [true, false] {
            let directory = fixture("snapshot-covered");
            let path = journal(directory.path());
            let mut entries: Vec<Value> = fs::read_to_string(&path)
                .unwrap()
                .lines()
                .map(|line| serde_json::from_str(line).unwrap())
                .collect();
            entries[1]["operationSemantics"] = marker.clone();
            let encoded = entries
                .iter()
                .map(|entry| serde_json::to_string(entry).unwrap() + "\n")
                .collect::<String>();
            fs::write(&path, encoded).unwrap();
            let before = bytes(directory.path());
            let error = if read_only {
                Session::open_read_only(directory.path())
            } else {
                Session::open(directory.path(), Some(2))
            }
            .unwrap_err();
            assert!(matches!(
                error,
                SessionError::History(HistoryError::UnsupportedOperationSemantics { .. })
            ));
            assert_eq!(bytes(directory.path()), before);
        }
    }
}

#[test]
fn complete_unknown_marker_at_unterminated_tail_is_not_dropped_as_a_partial_line() {
    let directory = fixture("project");
    let path = journal(directory.path());
    let mut entries: Vec<Value> = fs::read_to_string(&path)
        .unwrap()
        .lines()
        .map(|line| serde_json::from_str(line).unwrap())
        .collect();
    entries.last_mut().unwrap()["operationSemantics"] = json!("future");
    fs::write(
        &path,
        entries
            .iter()
            .map(|entry| serde_json::to_string(entry).unwrap())
            .collect::<Vec<_>>()
            .join("\n"),
    )
    .unwrap();
    let before = bytes(directory.path());
    assert!(matches!(
        Session::open_read_only(directory.path()),
        Err(SessionError::History(
            HistoryError::UnsupportedOperationSemantics { .. }
        ))
    ));
    assert_eq!(bytes(directory.path()), before);
}

#[test]
fn unknown_semantics_precede_unsupported_operation_parsing_at_a_complete_tail() {
    for marker in [
        json!("future"),
        Value::Null,
        json!(9),
        json!({"future":true}),
    ] {
        let directory = fixture("project");
        let path = journal(directory.path());
        let mut entries: Vec<Value> = fs::read_to_string(&path)
            .unwrap()
            .lines()
            .map(|line| serde_json::from_str(line).unwrap())
            .collect();
        let entry = entries.last_mut().unwrap();
        entry["operationSemantics"] = marker;
        entry["operation"]["op"] = json!("futureOperation");
        fs::write(
            &path,
            entries
                .iter()
                .map(|entry| serde_json::to_string(entry).unwrap())
                .collect::<Vec<_>>()
                .join("\n"),
        )
        .unwrap();
        let before = bytes(directory.path());
        assert!(matches!(
            Session::open_read_only(directory.path()),
            Err(SessionError::History(
                HistoryError::UnsupportedOperationSemantics { .. }
            ))
        ));
        assert_eq!(bytes(directory.path()), before);
    }
}
