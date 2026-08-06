//! The v0.15.0 exit test, through the binary: define a preset, apply it, undo
//! it — and confirm that applying it produced exactly what setting the same
//! properties by hand produces.
//!
//! The pixel comparison is the point. A preset that merely *looked* like a
//! hand-set style would be a second way to compute a style, and two ways to
//! compute the same thing drift.

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

const STYLE: &str = r##"{"fontSize":40,"color":"#a8442a","align":"center","opacity":0.8,
                         "blendMode":"multiply",
                         "effects":[{"type":"grain","amount":0.25,"seed":17,"scale":1.5}]}"##;

/// A project with one text layer, and the layer's id.
fn project(scratch: &Path, name: &str) -> (PathBuf, PathBuf, String) {
    let store = scratch.join("fonts");
    if !store.exists() {
        run(&[
            "font",
            "add",
            font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
            "--license",
            "OFL-1.1",
            "--font-store",
            store.to_str().unwrap(),
        ]);
    }

    let project = scratch.join(name);
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "300",
        "--height",
        "120",
        "--background",
        "#ffffff",
    ]);
    let layer = run(&[
        "add-text",
        project.to_str().unwrap(),
        "--text",
        "Preset",
        "--font",
        "Noto Sans",
        "--size",
        "24",
        "--x",
        "20",
        "--y",
        "20",
        "--width",
        "260",
        "--height",
        "80",
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

/// Pixels only: two projects have different document ids, and the id is
/// written into the PNG's metadata. What is being compared is the picture.
fn pixels(png_bytes: &[u8]) -> Vec<u8> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    buffer
}

#[test]
fn a_preset_applied_is_the_same_picture_as_the_properties_set_by_hand() {
    let scratch = tempfile::tempdir().unwrap();

    // By preset.
    let (by_preset, store, layer) = project(scratch.path(), "by-preset");
    run(&[
        "preset",
        "define",
        by_preset.to_str().unwrap(),
        "--name",
        "headline",
        "--description",
        "The house headline",
        "--properties",
        STYLE,
    ]);
    let listed = run(&["preset", "list", by_preset.to_str().unwrap()]);
    assert!(listed.contains("headline"), "{listed}");
    assert!(listed.contains("The house headline"), "{listed}");

    let before = export(&by_preset, &store, &scratch.path().join("before.png"));
    run(&[
        "preset",
        "apply",
        by_preset.to_str().unwrap(),
        "--preset",
        "headline",
        "--layer",
        &layer,
    ]);
    let applied = export(&by_preset, &store, &scratch.path().join("applied.png"));
    assert_ne!(applied, before, "applying the preset changed nothing");

    // By hand, on an identical project: the same properties, through the
    // ordinary styling commands.
    let (by_hand, _, hand_layer) = project(scratch.path(), "by-hand");
    run(&[
        "style",
        by_hand.to_str().unwrap(),
        "--layer",
        &hand_layer,
        "--blend",
        "multiply",
        "--effects",
        r#"[{"type":"grain","amount":0.25,"seed":17,"scale":1.5}]"#,
    ]);
    // The text properties an update carries but `style` does not: set through
    // the same operation endpoint the preset compiles to.
    let path = by_hand.join("document.json");
    let mut document: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    document["layers"][0]["fontSize"] = serde_json::json!(40.0);
    document["layers"][0]["color"] = serde_json::json!("#a8442a");
    document["layers"][0]["align"] = serde_json::json!("center");
    document["layers"][0]["opacity"] = serde_json::json!(0.8);
    std::fs::write(&path, serde_json::to_string_pretty(&document).unwrap()).unwrap();

    let hand = export(&by_hand, &store, &scratch.path().join("hand.png"));

    // The claim of this milestone, checked in pixels.
    assert_eq!(
        pixels(&applied),
        pixels(&hand),
        "a preset rendered differently from the same properties set by hand"
    );
}

#[test]
fn define_apply_and_undo_return_the_document_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, store, layer) = project(scratch.path(), "poster");
    let project_arg = project.to_str().unwrap();

    let original = std::fs::read(project.join("document.json")).unwrap();
    let before = export(&project, &store, &scratch.path().join("before.png"));

    run(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "headline",
        "--properties",
        STYLE,
    ]);
    let with_preset = std::fs::read(project.join("document.json")).unwrap();
    assert_ne!(with_preset, original, "defining stored nothing");
    // Defining a style is not applying one: the picture must not move.
    assert_eq!(
        export(&project, &store, &scratch.path().join("defined.png")),
        before,
        "defining a preset changed the picture"
    );

    run(&[
        "preset",
        "apply",
        project_arg,
        "--preset",
        "headline",
        "--layer",
        &layer,
    ]);
    assert_ne!(
        export(&project, &store, &scratch.path().join("applied.png")),
        before
    );

    // Undo the apply, then the define.
    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        with_preset,
        "undoing the apply did not restore the document"
    );
    assert_eq!(
        export(&project, &store, &scratch.path().join("undone.png")),
        before,
        "undoing the apply did not restore the picture"
    );

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        original,
        "undoing the define did not restore the document"
    );

    // And redo puts it back, so the journal runs both ways.
    run(&["redo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        with_preset
    );
}

#[test]
fn deleting_a_preset_does_not_change_any_picture() {
    // A preset sets properties; it does not create a link. Deleting one must
    // therefore be safe, and that is worth proving rather than asserting.
    let scratch = tempfile::tempdir().unwrap();
    let (project, store, layer) = project(scratch.path(), "poster");
    let project_arg = project.to_str().unwrap();

    run(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "headline",
        "--properties",
        STYLE,
    ]);
    run(&[
        "preset",
        "apply",
        project_arg,
        "--preset",
        "headline",
        "--layer",
        &layer,
    ]);
    let styled = export(&project, &store, &scratch.path().join("styled.png"));

    run(&["preset", "delete", project_arg, "headline"]);
    assert_eq!(
        run(&["preset", "list", project_arg]).trim(),
        "",
        "the preset is gone"
    );
    assert_eq!(
        export(&project, &store, &scratch.path().join("after-delete.png")),
        styled,
        "deleting a preset changed a layer that had been styled by it"
    );
}

#[test]
fn a_preset_is_refused_where_any_other_mutation_would_be() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path(), "poster");
    let project_arg = project.to_str().unwrap();

    // A preset nothing can draw is refused when it is defined, not when it is
    // finally applied to something.
    let refused = run_failing(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "bad",
        "--properties",
        r#"{"blendMode":"color-dodge"}"#,
    ]);
    assert!(refused.contains("color-dodge"), "{refused}");

    let refused = run_failing(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "empty",
        "--properties",
        "{}",
    ]);
    assert!(refused.contains("would do nothing"), "{refused}");

    // Applying one that does not exist says what does.
    run(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "headline",
        "--properties",
        STYLE,
    ]);
    let refused = run_failing(&[
        "preset",
        "apply",
        project_arg,
        "--preset",
        "headliner",
        "--layer",
        &layer,
    ]);
    assert!(refused.contains("headliner"), "{refused}");
    assert!(refused.contains("headline"), "{refused}");

    // And a protected layer refuses at the same choke point everything else
    // does — there is no preset-specific permission check anywhere.
    let path = project.join("document.json");
    let mut document: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    document["layers"][0]["protected"] = serde_json::Value::Bool(true);
    std::fs::write(&path, serde_json::to_string_pretty(&document).unwrap()).unwrap();

    let refused = run_failing(&[
        "preset",
        "apply",
        project_arg,
        "--preset",
        "headline",
        "--layer",
        &layer,
    ]);
    assert!(refused.contains("protected"), "{refused}");
    // The layer is untouched. (The document still mentions grain — the
    // preset's own definition says so — which is exactly why this looks at
    // the layer rather than grepping the file.)
    let after: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    assert_eq!(
        after["layers"][0]["effects"],
        serde_json::json!([]),
        "the refusal left an effect behind"
    );
    assert_eq!(after["layers"][0]["fontSize"], 24.0);
    assert_eq!(after["layers"][0]["blendMode"], "normal");
}
