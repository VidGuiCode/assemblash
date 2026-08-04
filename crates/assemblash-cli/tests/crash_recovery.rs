//! v0.3.0 exit test, part three: a process killed mid-write recovers cleanly.
//!
//! This kills a real `assemblash` process, on whichever platform the test is
//! running on. `ASSEMBLASH_CRASH_AT` names a point inside the write path and
//! the binary calls `std::process::abort()` there — no unwinding, no
//! destructors, no flushing, exactly what a `kill -9` or a power cut leaves
//! behind. Racing a real timer would be flaky and would prove less.
//!
//! Two moments matter:
//!
//! * **after the journal append, before the document is written** — the
//!   operation happened but `document.json` never caught up;
//! * **after the temporary document file is written, before the rename** —
//!   the atomic save was interrupted at its most dangerous instant.
//!
//! In both cases the project must open again with nothing lost and nothing
//! corrupt.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::Command;

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

#[track_caller]
fn run(args: &[&str]) -> String {
    let output = Command::new(binary()).args(args).output().unwrap();
    assert!(
        output.status.success(),
        "assemblash {args:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8_lossy(&output.stdout).into_owned()
}

/// Runs a command that is expected to be killed part-way through.
#[track_caller]
fn run_crashing(args: &[&str], at: &str) {
    let output = Command::new(binary())
        .args(args)
        .env("ASSEMBLASH_CRASH_AT", at)
        .output()
        .unwrap();
    assert!(
        !output.status.success(),
        "the process was supposed to die at {at}, but it exited cleanly"
    );
    // An abort is not an orderly exit: on Unix it is a signal, on Windows an
    // exception code. Either way there is no exit status of 0 and no chance
    // for anything to have been cleaned up.
    assert_ne!(output.status.code(), Some(0));
}

fn layer_count(project: &Path) -> usize {
    let shown = run(&["show", project.to_str().unwrap()]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    document["layers"].as_array().unwrap().len()
}

fn add_text(project: &Path, text: &str) -> Vec<String> {
    vec![
        "add-text".to_owned(),
        project.to_str().unwrap().to_owned(),
        "--text".to_owned(),
        text.to_owned(),
        "--font".to_owned(),
        "Inter".to_owned(),
    ]
}

fn as_args(owned: &[String]) -> Vec<&str> {
    owned.iter().map(String::as_str).collect()
}

fn new_project() -> (tempfile::TempDir, PathBuf) {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("project");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "200",
        "--height",
        "200",
    ]);
    (workspace, project)
}

/// **Exit test 3a.** Killed after the operation was journalled but before the
/// document was saved: the operation must survive, because the journal is
/// what says it happened.
#[test]
fn a_kill_after_the_journal_append_recovers_the_operation() {
    let (_workspace, project) = new_project();
    let first = add_text(&project, "before");
    run(&as_args(&first));
    assert_eq!(layer_count(&project), 1);

    let second = add_text(&project, "during the crash");
    run_crashing(&as_args(&second), "journal-appended");

    // The killed process could not release its lock, which is exactly what a
    // crashed process leaves behind. Clearing it is a decision, not a
    // timeout, so the operator makes it.
    let unlocked = run(&["unlock", project.to_str().unwrap()]);
    assert!(unlocked.contains("lock removed"), "{unlocked}");

    // Reopening rebuilds the document from history.
    assert_eq!(
        layer_count(&project),
        2,
        "the journalled operation should have been recovered"
    );

    // And the recovered project is fully working: it can still be edited and
    // undone.
    let third = add_text(&project, "after recovery");
    run(&as_args(&third));
    assert_eq!(layer_count(&project), 3);
    run(&["undo", project.to_str().unwrap()]);
    assert_eq!(layer_count(&project), 2);
}

/// **Exit test 3b.** Killed between writing the temporary document file and
/// renaming it into place — the instant an atomic save is meant to protect.
#[test]
fn a_kill_during_the_document_write_leaves_nothing_corrupt() {
    let (_workspace, project) = new_project();
    run(&as_args(&add_text(&project, "before")));

    let second = add_text(&project, "during the crash");
    run_crashing(&as_args(&second), "document-tmp-written");

    run(&["unlock", project.to_str().unwrap()]);

    // document.json is still valid JSON — the half-written file went to a
    // temporary name, which is the entire point of writing it that way.
    let document_path = project.join("document.json");
    let text = std::fs::read_to_string(&document_path).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&text).expect("document.json is intact");
    assert_eq!(parsed["schemaVersion"], 1);

    // The journal recorded the operation, so recovery completes it.
    assert_eq!(layer_count(&project), 2);
}

/// A crash before anything was journalled must leave the project exactly as
/// it was — no half-created project, no lost layer.
#[test]
fn a_kill_during_project_creation_leaves_no_broken_project() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("half-made");
    let output = Command::new(binary())
        .args(["new", project.to_str().unwrap()])
        .env("ASSEMBLASH_CRASH_AT", "document-tmp-written")
        .output()
        .unwrap();
    assert!(!output.status.success());

    // There is no document.json, so opening it fails with the honest error
    // rather than pretending there is a project here.
    let show = Command::new(binary())
        .args(["show", project.to_str().unwrap()])
        .output()
        .unwrap();
    assert!(!show.status.success());
    assert!(
        String::from_utf8_lossy(&show.stderr).contains("is not an Assemblash project"),
        "{}",
        String::from_utf8_lossy(&show.stderr)
    );
}

/// The journal survives a kill with its earlier lines intact and readable —
/// a truncated final line is dropped, not treated as corruption.
#[test]
fn the_journal_is_still_readable_after_a_kill() {
    let (_workspace, project) = new_project();
    run(&as_args(&add_text(&project, "one")));
    run(&as_args(&add_text(&project, "two")));

    run_crashing(&as_args(&add_text(&project, "three")), "journal-appended");
    run(&["unlock", project.to_str().unwrap()]);

    let history = run(&["history", project.to_str().unwrap()]);
    let lines: Vec<&str> = history.lines().collect();
    // Three creates, then the summary line.
    assert_eq!(lines.len(), 4, "{history}");
    assert!(lines[3].starts_with("position 3 of 3"), "{history}");
}

/// Two processes cannot hold one project at once.
#[test]
fn a_locked_project_is_refused_to_a_second_process() {
    let (_workspace, project) = new_project();

    // Hold the lock by hand, the way a live process would.
    std::fs::write(project.join(".assemblash-lock"), "{\"pid\":424242}").unwrap();

    let output = Command::new(binary())
        .args(as_args(&add_text(&project, "blocked")))
        .output()
        .unwrap();
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("424242"), "{stderr}");
    assert!(stderr.contains("another process"), "{stderr}");
}
