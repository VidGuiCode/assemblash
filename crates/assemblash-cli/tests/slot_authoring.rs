//! The v0.17.0 exit test, through the binary: a template is authored, filled,
//! and undone — with no hand edit of `document.json` anywhere.
//!
//! Before this milestone, `slots` had no operation that set it, so authoring
//! meant editing the file: the only workflow in the product with no journal,
//! no undo, and no audit trail. This proves that is gone.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::Command;

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

fn font_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../assemblash-renderer/tests/fonts")
}

#[track_caller]
fn run(args: &[&str]) -> String {
    let output = Command::new(binary())
        .args(args)
        .output()
        .expect("the binary runs");
    assert!(
        output.status.success(),
        "assemblash {args:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8(output.stdout).expect("stdout is UTF-8")
}

#[track_caller]
fn run_failing(args: &[&str]) -> String {
    let output = Command::new(binary())
        .args(args)
        .output()
        .expect("the binary runs");
    assert!(
        !output.status.success(),
        "assemblash {args:?} should have been refused"
    );
    String::from_utf8_lossy(&output.stderr).into_owned()
}

/// A project with a headline and a line of protected chrome, built entirely
/// through the binary.
fn project(scratch: &Path) -> (PathBuf, PathBuf, String, String) {
    let store = scratch.join("fonts");
    run(&[
        "font",
        "add",
        font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
        "--license",
        "OFL-1.1",
        "--font-store",
        store.to_str().unwrap(),
    ]);

    let project = scratch.join("flyer");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "400",
        "--height",
        "200",
        "--background",
        "#ffffff",
    ]);

    let text = |body: &str, y: &str| {
        run(&[
            "add-text",
            project.to_str().unwrap(),
            "--text",
            body,
            "--font",
            "Noto Sans",
            "--size",
            "28",
            "--x",
            "20",
            "--y",
            y,
            "--width",
            "360",
            "--height",
            "50",
            "--font-store",
            store.to_str().unwrap(),
        ])
        .trim()
        .to_owned()
    };
    let headline = text("placeholder", "20");
    let chrome = text("(c) the client", "140");
    (project, store, headline, chrome)
}

/// Marks a layer protected.
///
/// Still a hand edit, because `protected` has no operation either — which is
/// correct: a flag that an agent could clear would not be a protection. It is
/// a property a downstream application writes.
fn protect(project: &Path, layer: &str) {
    let path = project.join("document.json");
    let mut document: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    for entry in document["layers"].as_array_mut().unwrap() {
        if entry["id"] == layer {
            entry["protected"] = serde_json::Value::Bool(true);
        }
    }
    std::fs::write(&path, serde_json::to_string_pretty(&document).unwrap()).unwrap();
}

#[test]
fn a_template_is_authored_filled_and_undone_without_touching_the_file() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, store, headline, _chrome) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    let before_slots = std::fs::read(project.join("document.json")).unwrap();

    run(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "headline",
        "--layer",
        &headline,
        "--kind",
        "text",
        "--description",
        "The big line",
        "--required",
    ]);

    // It is a template now, and `slots` says so.
    let listed = run(&["slots", project_arg]);
    assert!(listed.contains("headline"), "{listed}");
    assert!(listed.contains("The big line"), "{listed}");
    assert!(listed.contains("required"), "{listed}");

    // And it fills, which is the point of having authored it.
    let values = scratch.path().join("values.json");
    std::fs::write(
        &values,
        r#"[{"name":"one","values":{"headline":"Spring"}},
            {"name":"two","values":{"headline":"Summer"}}]"#,
    )
    .unwrap();
    let printed = run(&[
        "variants",
        project_arg,
        "--values",
        values.to_str().unwrap(),
        "--font-store",
        store.to_str().unwrap(),
    ]);
    let hashes: Vec<&str> = printed
        .lines()
        .filter_map(|line| line.split('\t').nth(2))
        .collect();
    assert_eq!(hashes.len(), 2, "{printed}");
    assert_ne!(hashes[0], hashes[1], "both variants rendered the same");

    // Defining a slot is one journalled operation, and undo takes it back
    // byte for byte — which is exactly what a hand edit could never offer.
    let history = run(&["history", project_arg]);
    assert!(
        history.contains("defineSlot") || history.contains("applied"),
        "{history}"
    );

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before_slots,
        "undoing the slot definition did not restore the document"
    );
    assert_eq!(run(&["slots", project_arg]).trim(), "");

    // Redo puts it back, so the journal runs both ways.
    run(&["redo", project_arg]);
    assert!(run(&["slots", project_arg]).contains("headline"));
}

#[test]
fn a_slot_may_not_be_offered_on_protected_chrome() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, _headline, chrome) = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    protect(&project, &chrome);

    let refused = run_failing(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "sneaky",
        "--layer",
        &chrome,
    ]);
    assert!(refused.contains("protected"), "{refused}");
    assert_eq!(run(&["slots", project_arg]).trim(), "");
}

#[test]
fn a_slot_is_checked_against_the_layer_it_names() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, headline, _chrome) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    // A layer that is not there.
    let refused = run_failing(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "ghost",
        "--layer",
        "layer_nope",
    ]);
    assert!(refused.contains("layer_nope"), "{refused}");

    // An image slot on a text layer.
    let refused = run_failing(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "wrong",
        "--layer",
        &headline,
        "--kind",
        "image",
    ]);
    assert!(
        refused.contains("image") && refused.contains("text"),
        "{refused}"
    );

    // Two slots with the same name.
    run(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "headline",
        "--layer",
        &headline,
    ]);
    let refused = run_failing(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "headline",
        "--layer",
        &headline,
    ]);
    assert!(refused.contains("already"), "{refused}");
}

#[test]
fn a_layer_a_slot_offers_cannot_be_deleted_until_the_slot_is_removed() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, headline, _chrome) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    run(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "headline",
        "--layer",
        &headline,
    ]);

    // There is no `delete` command on the CLI, so this goes through the
    // operation the interface and MCP both send. Refused, and it says which
    // slot is in the way.
    let mut session = assemblash_core::Session::open(&project, None).expect("the project opens");
    let error = session
        .apply(
            &assemblash_core::Operation::Delete {
                id: assemblash_core::LayerId::new(headline.clone()),
            },
            &assemblash_core::Actor::new(assemblash_core::ActorKind::Script),
            None,
            None,
            &mut assemblash_core::ids::UlidIdSource,
        )
        .expect_err("deleting a slot's layer must be refused");
    assert!(error.to_string().contains("headline"), "{error}");
    drop(session);

    // Removing the slot first is the whole fix.
    run(&["slot", "remove", project_arg, "headline"]);
    assert_eq!(run(&["slots", project_arg]).trim(), "");
}

#[test]
fn updating_a_slot_keeps_what_was_not_named() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, headline, _chrome) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    run(&[
        "slot",
        "define",
        project_arg,
        "--name",
        "headline",
        "--layer",
        &headline,
        "--description",
        "The big line",
        "--required",
    ]);

    // Renaming only. An update that silently cleared the description because
    // it was not repeated would be a trap.
    run(&[
        "slot",
        "update",
        project_arg,
        "headline",
        "--rename",
        "title",
    ]);
    let listed = run(&["slots", project_arg]);
    assert!(listed.contains("title"), "{listed}");
    assert!(listed.contains("The big line"), "{listed}");
    assert!(listed.contains("required"), "{listed}");
}
