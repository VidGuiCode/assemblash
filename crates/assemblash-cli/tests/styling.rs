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
    // The effect half derives from the enum, so the assertion must too: the
    // match names every `Effect` variant, and a new variant fails to compile
    // until it is listed here — the same guarantee `BlendMode::RENDERED`
    // gives the blend-mode half above.
    use assemblash_core::document::Effect;
    for effect in Effect::rendered_examples() {
        let name = match &effect {
            Effect::Brightness { .. } => "brightness",
            Effect::Contrast { .. } => "contrast",
            Effect::Saturation { .. } => "saturation",
            Effect::Blur { .. } => "blur",
            Effect::Grain { .. } => "grain",
            Effect::DropShadow { .. } => "dropShadow",
            Effect::Other(_) => unreachable!("rendered_examples never holds Other"),
        };
        assert!(listed.contains(name), "{name} missing from: {listed}");
    }
}

#[test]
fn the_styles_json_is_the_canonical_capability_listing() {
    use assemblash_core::document::Effect;

    let listed = run(&["styles", "--json"]);
    let capabilities: serde_json::Value = serde_json::from_str(&listed)
        .unwrap_or_else(|error| panic!("styles --json must print JSON: {error}\n{listed}"));

    // Every rendered blend mode, and nothing that refuses to draw.
    for mode in assemblash_core::BlendMode::RENDERED {
        assert!(
            capabilities["blendModes"]
                .as_array()
                .unwrap()
                .iter()
                .any(|value| value == mode.as_str()),
            "{} missing from the JSON listing",
            mode.as_str()
        );
    }
    assert!(!capabilities["blendModes"]
        .as_array()
        .unwrap()
        .iter()
        .any(|value| value == "color-dodge"));

    // Every Effect variant — a non-wildcard match, so a new variant fails
    // to compile until the canonical listing can name it.
    for effect in Effect::rendered_examples() {
        let name = match &effect {
            Effect::Brightness { .. } => "brightness",
            Effect::Contrast { .. } => "contrast",
            Effect::Saturation { .. } => "saturation",
            Effect::Blur { .. } => "blur",
            Effect::Grain { .. } => "grain",
            Effect::DropShadow { .. } => "dropShadow",
            Effect::Other(_) => unreachable!("rendered_examples never holds Other"),
        };
        assert!(
            capabilities["effects"]
                .as_array()
                .unwrap()
                .iter()
                .any(|value| value["kind"] == name),
            "{name} missing from the JSON listing"
        );
    }
}

#[test]
fn a_shell_typed_backslash_n_in_text_is_stored_verbatim_and_help_says_so() {
    let scratch = tempfile::tempdir().unwrap();
    let (project, store, _layer) = project(scratch.path());
    let project_arg = project.to_str().unwrap();

    // DEF-23: the help must not claim `\n` is a line break, because a
    // backslash-n typed at the shell is stored as the two characters.
    for (command, help) in [
        ("add-text", run(&["add-text", "--help"])),
        ("set", run(&["set", "--help"])),
    ] {
        assert!(
            !help.contains("is a line break"),
            "{command} --help still claims `\\n` is a line break: {help}"
        );
    }
    let set_help = run(&["set", "--help"]);
    assert!(
        set_help.contains("--text-file"),
        "set --help should point at --text-file for real line breaks: {set_help}"
    );

    // And the behaviour matches the wording: the two characters survive.
    let layer = run(&[
        "add-text",
        project_arg,
        "--text",
        "a\\nb",
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
    run(&["set", project_arg, "--layer", &layer, "--text", "a\\nb"]);

    let doc: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(project.join("document.json")).unwrap())
            .unwrap();
    let stored: serde_json::Value = doc["layers"]
        .as_array()
        .unwrap()
        .iter()
        .find(|l| l["id"].as_str() == Some(layer.as_str()))
        .unwrap_or_else(|| panic!("layer {layer} not in the document"))["text"]
        .clone();
    assert_eq!(
        stored, "a\\nb",
        "a shell-typed backslash-n must stay the two characters"
    );
}

/// A font store holding exactly the faces the test names, built by the real
/// `font add` so the store's per-face weight records are in the loop.
fn store_with(bold: bool, scratch: &Path) -> PathBuf {
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
    if bold {
        run(&[
            "font",
            "add",
            font_dir()
                .join("NotoSans-Bold-Subset.ttf")
                .to_str()
                .unwrap(),
            "--license",
            "OFL-1.1",
            "--font-store",
            store.to_str().unwrap(),
        ]);
    }
    store
}

#[track_caller]
fn stdout_and_stderr(args: &[&str]) -> (String, String) {
    let output = Command::new(binary())
        .args(args)
        .output()
        .expect("the binary runs");
    assert!(
        output.status.success(),
        "assemblash {args:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    (
        String::from_utf8(output.stdout).expect("stdout is UTF-8"),
        String::from_utf8_lossy(&output.stderr).into_owned(),
    )
}

/// Exit test 1: with 400 and 700 in the store, `--weight 700` renders the
/// bold face; with only 400 present, the same document is refused typed,
/// naming family, weight and style — never silently drawn with the regular
/// face.
#[test]
fn a_weight_the_store_has_renders_and_one_it_lacks_is_refused_typed() {
    let scratch = tempfile::tempdir().unwrap();
    let bold_store = store_with(true, scratch.path());
    let project = scratch.path().join("weights");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "300",
        "--height",
        "150",
        "--background",
        "#ffffff",
    ]);
    let regular = run(&[
        "add-text",
        project.to_str().unwrap(),
        "--text",
        "Regular",
        "--font",
        "Noto Sans",
        "--font-store",
        bold_store.to_str().unwrap(),
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "280",
        "--height",
        "60",
    ])
    .trim()
    .to_owned();
    let bold = run(&[
        "add-text",
        project.to_str().unwrap(),
        "--text",
        "Bold",
        "--font",
        "Noto Sans",
        "--weight",
        "700",
        "--font-store",
        bold_store.to_str().unwrap(),
        "--x",
        "10",
        "--y",
        "80",
        "--width",
        "280",
        "--height",
        "60",
    ])
    .trim()
    .to_owned();
    assert_ne!(regular, bold, "the two layers must be distinct");

    let regular_png = export(&project, &bold_store, &scratch.path().join("regular.png"));
    run(&[
        "set",
        project.to_str().unwrap(),
        "--layer",
        &regular,
        "--weight",
        "700",
    ]);
    let bold_png = export(&project, &bold_store, &scratch.path().join("bold.png"));
    assert_ne!(
        regular_png, bold_png,
        "weight 700 must render a different picture from the default"
    );

    // The same request against a store that holds only the regular face:
    // refused, naming family, weight and style.
    let thin_store = scratch.path().join("fonts-thin");
    run(&[
        "font",
        "add",
        font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
        "--license",
        "OFL-1.1",
        "--font-store",
        thin_store.to_str().unwrap(),
    ]);
    let refused = run_failing(&[
        "export",
        project.to_str().unwrap(),
        "--out",
        scratch.path().join("refused.png").to_str().unwrap(),
        "--font-store",
        thin_store.to_str().unwrap(),
    ]);
    assert!(
        refused.contains("Noto Sans") && refused.contains("700"),
        "the refusal must name the family and the weight: {refused}"
    );
}

/// Exit test 4, through the CLI: a paragraph that no longer fits its box —
/// here because letter spacing widened it past the wrap width — exports with
/// a `textOverflowsBox` warning.
#[test]
fn letter_spacing_that_overflows_the_box_warns_on_export() {
    let scratch = tempfile::tempdir().unwrap();
    let store = store_with(false, scratch.path());
    let project = scratch.path().join("tracked");
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
        "handgloves",
        "--font",
        "Noto Sans",
        "--letter-spacing",
        "8",
        "--font-store",
        store.to_str().unwrap(),
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "180",
        "--height",
        "30",
    ])
    .trim()
    .to_owned();

    let (_, stderr) = stdout_and_stderr(&[
        "export",
        project.to_str().unwrap(),
        "--out",
        scratch.path().join("tracked.png").to_str().unwrap(),
        "--font-store",
        store.to_str().unwrap(),
    ]);
    assert!(
        stderr.contains("textOverflowsBox"),
        "the export must warn that the tracked text overflows: {stderr}"
    );
    assert!(stderr.contains(&layer), "the warning names its layer");
}
