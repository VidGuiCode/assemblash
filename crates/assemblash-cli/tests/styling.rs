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

/// A tiny PNG to import, so an image layer can be made without a fixture file.
fn write_test_png(path: &Path) {
    let file = std::fs::File::create(path).unwrap();
    let mut encoder = png::Encoder::new(std::io::BufWriter::new(file), 2, 2);
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    let mut writer = encoder.write_header().unwrap();
    writer
        .write_image_data(&[
            255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
        ])
        .unwrap();
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

/// `set` is the one command that reaches every updatable property, and it
/// spends one operation doing it however many flags were given.
#[test]
fn set_changes_every_updatable_property_in_one_transaction() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    let before_document = std::fs::read(project.join("document.json")).unwrap();
    let entries_before = run(&["history", project_arg]).lines().count();

    let changed = run(&[
        "set",
        project_arg,
        "--layer",
        &layer,
        "--name",
        "Headline",
        "--x",
        "5",
        "--y",
        "6",
        "--width",
        "150",
        "--height",
        "40",
        "--rotation",
        "12",
        "--opacity",
        "0.5",
        "--visible",
        "true",
        "--locked",
        "false",
        "--blend",
        "multiply",
        "--effects",
        r#"[{"type":"blur","radius":2}]"#,
        "--text",
        "Reset",
        "--font",
        "Noto Sans",
        "--size",
        "18",
        "--color",
        "#112233",
        "--align",
        "center",
        "--line-height",
        "1.5",
    ]);
    assert_eq!(changed.trim(), layer, "set names the layer it changed");

    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    let stored = &document["layers"][0];
    assert_eq!(stored["name"], "Headline", "{stored}");
    assert_eq!(stored["transform"]["x"], 5.0, "{stored}");
    assert_eq!(stored["transform"]["y"], 6.0, "{stored}");
    assert_eq!(stored["transform"]["width"], 150.0, "{stored}");
    assert_eq!(stored["transform"]["height"], 40.0, "{stored}");
    assert_eq!(stored["transform"]["rotation"], 12.0, "{stored}");
    assert_eq!(stored["opacity"], 0.5, "{stored}");
    assert_eq!(stored["visible"], true, "{stored}");
    assert_eq!(stored["locked"], false, "{stored}");
    assert_eq!(stored["blendMode"], "multiply", "{stored}");
    assert_eq!(stored["effects"][0]["type"], "blur", "{stored}");
    assert_eq!(stored["text"], "Reset", "{stored}");
    assert_eq!(stored["fontFamily"], "Noto Sans", "{stored}");
    assert_eq!(stored["fontSize"], 18.0, "{stored}");
    assert_eq!(stored["color"], "#112233", "{stored}");
    assert_eq!(stored["align"], "center", "{stored}");
    assert_eq!(stored["lineHeight"], 1.5, "{stored}");

    // Whatever the combination of flags, it is one operation: journalled once,
    // undone once.
    let history = run(&["history", project_arg]);
    assert_eq!(
        history.lines().count(),
        entries_before + 1,
        "set should be one journalled entry: {history}"
    );

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before_document,
        "one undo did not restore the document byte for byte"
    );
}

/// A transform flag left out keeps the value the layer already had, rather
/// than resetting it to a default nobody asked for.
#[test]
fn set_moves_a_layer_without_resizing_it() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    run(&["set", project_arg, "--layer", &layer, "--x", "42"]);

    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    let transform = &document["layers"][0]["transform"];
    assert_eq!(transform["x"], 42.0, "{transform}");
    assert_eq!(transform["y"], 10.0, "{transform}");
    assert_eq!(transform["width"], 180.0, "{transform}");
    assert_eq!(transform["height"], 60.0, "{transform}");
}

/// The CLI adds no checks of its own: a text property on an image layer is
/// refused by the operation layer, which names the property.
#[test]
fn set_refuses_a_text_property_on_an_image_layer() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, _layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    let source = scratch.path().join("swatch.png");
    write_test_png(&source);
    let image = run(&[
        "add-image",
        project_arg,
        "--file",
        source.to_str().unwrap(),
        "--x",
        "0",
        "--y",
        "0",
        "--width",
        "50",
        "--height",
        "50",
    ])
    .trim()
    .to_owned();

    let refused = run_failing(&["set", project_arg, "--layer", &image, "--size", "20"]);
    assert!(refused.contains("fontSize"), "{refused}");
    assert!(refused.contains("image"), "{refused}");

    // `fit` is an image property, so the same command shape goes through.
    run(&["set", project_arg, "--layer", &image, "--fit", "cover"]);
    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    assert_eq!(document["layers"][1]["fit"], "cover", "{shown}");
}

/// `style` is kept, and is `set` under another name: the same builder, so the
/// two cannot drift apart.
#[test]
fn style_and_set_write_the_same_update() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, _store, layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    run(&[
        "style",
        project_arg,
        "--layer",
        &layer,
        "--blend",
        "screen",
        "--effects",
        r#"[{"type":"blur","radius":2}]"#,
    ]);
    let styled = std::fs::read_to_string(project.join("document.json")).unwrap();

    run(&["undo", project_arg]);
    run(&[
        "set",
        project_arg,
        "--layer",
        &layer,
        "--blend",
        "screen",
        "--effects",
        r#"[{"type":"blur","radius":2}]"#,
    ]);
    let via_set = std::fs::read_to_string(project.join("document.json")).unwrap();

    let styled: serde_json::Value = serde_json::from_str(&styled).unwrap();
    let via_set: serde_json::Value = serde_json::from_str(&via_set).unwrap();
    assert_eq!(
        styled["layers"], via_set["layers"],
        "style and set disagree"
    );
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
