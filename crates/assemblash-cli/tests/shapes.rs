//! CLI coverage for the 1.6.0 shape layer commands and paint updates.

#![allow(clippy::expect_used, clippy::panic, clippy::unwrap_used)]

use std::path::{Path, PathBuf};
use std::process::Command;

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
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

fn project(scratch: &Path) -> PathBuf {
    let project = scratch.join("shapes");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "200",
        "--height",
        "120",
    ]);
    project
}

fn shown(project: &Path) -> serde_json::Value {
    serde_json::from_str(&run(&["show", project.to_str().unwrap()])).unwrap()
}

fn history_entries(project: &Path) -> usize {
    run(&["history", project.to_str().unwrap()])
        .lines()
        .filter(|line| !line.starts_with("position "))
        .count()
}

#[test]
fn add_rect_creates_one_journalled_shape_and_undoes_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    let before = std::fs::read(project.join("document.json")).unwrap();

    let layer = run(&[
        "add-rect",
        project_arg,
        "--x",
        "10",
        "--y",
        "12",
        "--width",
        "80",
        "--height",
        "40",
        "--corner-radius",
        "6",
        "--layer-name",
        "Card",
    ])
    .trim()
    .to_owned();
    assert!(layer.starts_with("layer_"), "{layer}");
    assert_eq!(history_entries(&project), 1);

    let layer = &shown(&project)["layers"][0];
    assert_eq!(layer["type"], "shape", "{layer}");
    assert_eq!(layer["shape"]["kind"], "rect", "{layer}");
    assert_eq!(layer["shape"]["cornerRadius"], 6.0, "{layer}");
    assert_eq!(layer["fill"], "#000000", "{layer}");
    assert!(layer["stroke"].is_null(), "{layer}");

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore the document byte for byte"
    );
}

#[test]
fn add_ellipse_creates_one_journalled_shape_and_undoes_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    let before = std::fs::read(project.join("document.json")).unwrap();

    let layer = run(&[
        "add-ellipse",
        project_arg,
        "--fill",
        "none",
        "--stroke",
        "#112233",
        "--stroke-width",
        "2.5",
        "--x",
        "20",
        "--y",
        "10",
        "--width",
        "100",
        "--height",
        "60",
    ])
    .trim()
    .to_owned();
    assert!(layer.starts_with("layer_"), "{layer}");
    assert_eq!(history_entries(&project), 1);

    let layer = &shown(&project)["layers"][0];
    assert_eq!(layer["type"], "shape", "{layer}");
    assert_eq!(layer["shape"]["kind"], "ellipse", "{layer}");
    assert!(layer["fill"].is_null(), "{layer}");
    assert_eq!(layer["stroke"]["color"], "#112233", "{layer}");
    assert_eq!(layer["stroke"]["width"], 2.5, "{layer}");

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore the document byte for byte"
    );
}

#[test]
fn add_line_creates_one_journalled_shape_and_undoes_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    let before = std::fs::read(project.join("document.json")).unwrap();

    let layer = run(&[
        "add-line",
        project_arg,
        "--x",
        "15",
        "--y",
        "20",
        "--width",
        "140",
        "--height",
        "30",
        "--rotation",
        "17.5",
    ])
    .trim()
    .to_owned();
    assert!(layer.starts_with("layer_"), "{layer}");
    assert_eq!(history_entries(&project), 1);

    let layer = &shown(&project)["layers"][0];
    assert_eq!(layer["type"], "shape", "{layer}");
    assert_eq!(layer["shape"]["kind"], "line", "{layer}");
    assert!(layer["fill"].is_null(), "{layer}");
    assert_eq!(layer["stroke"]["color"], "#000000", "{layer}");
    assert_eq!(layer["stroke"]["width"], 1.0, "{layer}");
    assert_eq!(layer["transform"]["rotation"], 17.5, "{layer}");

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore the document byte for byte"
    );
}

#[test]
fn set_shape_paint_merges_stroke_and_undoes_byte_for_byte() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    let layer = run(&["add-rect", project_arg]).trim().to_owned();
    let before = std::fs::read(project.join("document.json")).unwrap();

    run(&["set", project_arg, "--layer", &layer, "--fill", "none"]);
    let stored = &shown(&project)["layers"][0];
    assert!(stored["fill"].is_null(), "{stored}");
    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore clearing the fill"
    );

    run(&[
        "set",
        project_arg,
        "--layer",
        &layer,
        "--stroke",
        "#ff0000",
        "--stroke-width",
        "3",
    ]);
    let stored = &shown(&project)["layers"][0];
    assert_eq!(stored["stroke"]["color"], "#ff0000", "{stored}");
    assert_eq!(stored["stroke"]["width"], 3.0, "{stored}");

    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore setting the stroke"
    );

    // Set a stroke again so the width-only merge has an existing stroke to
    // read, then undo each of those operations independently.
    run(&[
        "set",
        project_arg,
        "--layer",
        &layer,
        "--stroke",
        "#ff0000",
        "--stroke-width",
        "3",
    ]);
    let with_stroke = std::fs::read(project.join("document.json")).unwrap();

    // A width by itself preserves the current colour.
    run(&["set", project_arg, "--layer", &layer, "--stroke-width", "5"]);
    let stored = &shown(&project)["layers"][0];
    assert_eq!(stored["stroke"]["color"], "#ff0000", "{stored}");
    assert_eq!(stored["stroke"]["width"], 5.0, "{stored}");
    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        with_stroke,
        "undo did not restore the previous stroke"
    );
    run(&["undo", project_arg]);
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "undo did not restore the document byte for byte"
    );

    let refused = run_failing(&["set", project_arg, "--layer", &layer, "--stroke-width", "5"]);
    assert!(refused.contains("a stroke colour is needed"), "{refused}");
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "the typed CLI refusal changed the document"
    );
}

#[test]
fn set_reports_core_wrong_kind_messages_for_shape_mismatches() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    let rect = run(&["add-rect", project_arg]).trim().to_owned();
    let ellipse = run(&["add-ellipse", project_arg]).trim().to_owned();

    let before = std::fs::read(project.join("document.json")).unwrap();
    let refused = run_failing(&[
        "set",
        project_arg,
        "--layer",
        &ellipse,
        "--corner-radius",
        "4",
    ]);
    assert!(refused.contains("ellipse"), "{refused}");
    assert!(refused.contains("cornerRadius cannot be set"), "{refused}");
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "wrong corner-radius kind changed the document"
    );

    let refused = run_failing(&["set", project_arg, "--layer", &rect, "--text", "hi"]);
    assert!(refused.contains("shape"), "{refused}");
    assert!(refused.contains("text cannot be set"), "{refused}");
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "wrong text kind changed the document"
    );
}

#[test]
fn help_lists_shape_commands_and_set_paint_flags() {
    let help = run(&["--help"]);
    for command in ["add-rect", "add-ellipse", "add-line"] {
        assert!(help.contains(command), "{command} missing from: {help}");
    }

    let set_help = run(&["set", "--help"]);
    for flag in ["--fill", "--stroke", "--stroke-width", "--corner-radius"] {
        assert!(set_help.contains(flag), "{flag} missing from: {set_help}");
    }
}

#[test]
fn export_of_a_rect_project_succeeds() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project(scratch.path());
    let project_arg = project.to_str().unwrap();
    run(&["add-rect", project_arg, "--fill", "#3366cc"]);

    let output = scratch.path().join("rect.png");
    run(&["export", project_arg, "--out", output.to_str().unwrap()]);
    let bytes = std::fs::read(output).unwrap();
    assert_eq!(&bytes[1..4], b"PNG");
}
