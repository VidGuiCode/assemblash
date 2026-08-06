//! The v0.14.0 exit test, through the binary: an effect stack and a blend
//! mode are ordinary properties, so setting one is journalled, undoable, and
//! refused exactly where every other mutation is.
//!
//! Everything here runs the real `assemblash` executable. The claims this
//! milestone makes about undo are about *bytes* — both the document and the
//! render — because "it looks the same" is not the promise.

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

/// A project with one text layer, and the layer's id.
fn project(scratch: &Path) -> (PathBuf, PathBuf, String) {
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

    let project = scratch.join("poster");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "200",
        "--height",
        "100",
        "--background",
        "#ffffff",
    ]);
    let layer = run(&[
        "add-text",
        project.to_str().unwrap(),
        "--text",
        "Styled",
        "--font",
        "Noto Sans",
        "--size",
        "28",
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "180",
        "--height",
        "60",
        "--font-store",
        store.to_str().unwrap(),
    ])
    .trim()
    .to_owned();
    (project, store, layer)
}

fn export(project: &Path, store: &Path, out: &Path) -> Vec<u8> {
    run(&[
        "export",
        project.to_str().unwrap(),
        "--out",
        out.to_str().unwrap(),
        "--font-store",
        store.to_str().unwrap(),
    ]);
    std::fs::read(out).unwrap()
}

#[test]
fn setting_an_effect_stack_is_journalled_and_undoes_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    let before_document = std::fs::read(project.join("document.json")).unwrap();
    let before_png = export(&project, &store, &scratch.path().join("before.png"));

    run(&[
        "style",
        project_arg,
        "--layer",
        &layer,
        "--blend",
        "multiply",
        "--effects",
        r#"[{"type":"brightness","amount":1.4},{"type":"grain","amount":0.3,"seed":7,"scale":1}]"#,
    ]);

    // The picture actually changed — otherwise the undo below would prove
    // nothing at all.
    let styled_png = export(&project, &store, &scratch.path().join("styled.png"));
    assert_ne!(styled_png, before_png, "the effects changed nothing");

    // Rendering it again gives the same bytes: seeded grain is part of the
    // document, not of the run (NFR-3).
    let again = export(&project, &store, &scratch.path().join("styled-again.png"));
    assert_eq!(styled_png, again, "the same document rendered differently");

    // It is in the journal like any other change.
    let history = run(&["history", project_arg]);
    assert!(
        history
            .lines()
            .filter(|line| line.contains("update"))
            .count()
            == 1,
        "the restyle should be one journalled update: {history}"
    );

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before_document,
        "undo did not restore the document byte for byte"
    );
    assert_eq!(
        export(&project, &store, &scratch.path().join("undone.png")),
        before_png,
        "undo did not restore the render byte for byte"
    );
}

#[test]
fn a_mode_or_an_effect_this_build_cannot_draw_is_refused() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    let refused = run_failing(&[
        "style",
        project_arg,
        "--layer",
        &layer,
        "--blend",
        "plus-darker",
    ]);
    assert!(refused.contains("plus-darker"), "{refused}");
    assert!(
        refused.contains("multiply") && refused.contains("luminosity"),
        "the refusal should list what would have worked: {refused}"
    );

    let refused = run_failing(&[
        "style",
        project_arg,
        "--layer",
        &layer,
        "--effects",
        r#"[{"type":"vignette","strength":0.5}]"#,
    ]);
    assert!(refused.contains("vignette"), "{refused}");

    // Neither refusal left anything behind.
    let document = std::fs::read_to_string(project.join("document.json")).unwrap();
    assert!(!document.contains("plus-darker"), "{document}");
    assert!(!document.contains("vignette"), "{document}");
}

#[test]
fn styling_a_protected_layer_is_refused_like_any_other_mutation() {
    // The point of doing this as an ordinary `update`: protection is enforced
    // once, at the operation layer, and a new property gets it for free rather
    // than by remembering to ask.
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    // Protection is a document property with no operation that sets it, so it
    // is written the way a downstream application would write it.
    let path = project.join("document.json");
    let mut document: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    document["layers"][0]["protected"] = serde_json::Value::Bool(true);
    std::fs::write(&path, serde_json::to_string_pretty(&document).unwrap()).unwrap();

    let refused = run_failing(&[
        "style",
        project_arg,
        "--layer",
        &layer,
        "--effects",
        r#"[{"type":"blur","radius":2}]"#,
    ]);
    assert!(refused.contains("protected"), "{refused}");

    let after = std::fs::read_to_string(&path).unwrap();
    assert!(!after.contains("blur"), "{after}");
}

#[test]
fn the_styles_command_lists_only_what_this_build_renders() {
    let listed = run(&["styles"]);
    for mode in [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
    ] {
        assert!(listed.contains(mode), "{mode} missing from: {listed}");
    }
    for effect in ["brightness", "contrast", "saturation", "blur", "grain"] {
        assert!(listed.contains(effect), "{effect} missing from: {listed}");
    }
}
