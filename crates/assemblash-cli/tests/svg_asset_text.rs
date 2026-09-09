//! D12(a) on the command line: an SVG asset whose text nothing can draw stops
//! the export, on every way of naming fonts.
//!
//! This is the surface where DEF-2 was hardest to see. `--font-dir` loads every
//! file in the directory, so the text in an imported asset happened to render;
//! `--font-store` loads only the families **text layers** name, so the very same
//! document exported successfully with a hole in it. Two commands, two
//! pictures, no error either way.
//!
//! The document here has **no text layers at all**, which is what makes the two
//! spellings diverge: with nothing for the store to resolve, `--font-store`
//! loads nothing.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::Command;

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

fn font_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../assemblash-renderer/tests/fonts")
}

fn fixture(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/svg_assets")
        .join(name)
}

/// Runs the binary, with the font-store environment variable cleared.
///
/// `--font-store` reads `ASSEMBLASH_FONT_STORE`, so a developer who has one
/// configured would otherwise get a different answer from CI.
fn output(args: &[&str]) -> std::process::Output {
    Command::new(binary())
        .env_remove("ASSEMBLASH_FONT_STORE")
        .args(args)
        .output()
        .expect("the binary runs")
}

#[track_caller]
fn run(args: &[&str]) -> String {
    let out = output(args);
    assert!(
        out.status.success(),
        "assemblash {args:?} failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    String::from_utf8(out.stdout).expect("stdout is UTF-8")
}

#[track_caller]
fn run_failing(args: &[&str]) -> String {
    let out = output(args);
    assert!(
        !out.status.success(),
        "assemblash {args:?} should have failed: {}",
        String::from_utf8_lossy(&out.stdout)
    );
    String::from_utf8_lossy(&out.stderr).into_owned()
}

/// The id of the project's only asset, read back from `document.json`.
fn only_asset_id(project: &Path) -> String {
    let json: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(project.join("document.json")).unwrap())
            .unwrap();
    let assets = json["assets"].as_array().unwrap();
    assert_eq!(assets.len(), 1, "{assets:#?}");
    assets[0]["id"].as_str().unwrap().to_owned()
}

/// A project whose only layer is an imported SVG that draws text in Noto Sans.
fn project_with_svg_text(root: &Path) -> PathBuf {
    let project = root.join("poster");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "100"]);
    run(&[
        "add-svg",
        project_arg,
        fixture("named_family.svg").to_str().unwrap(),
        "--x",
        "0",
        "--y",
        "0",
        "--width",
        "200",
        "--height",
        "100",
    ]);
    project
}

#[test]
fn a_font_store_that_loads_nothing_refuses_the_export_and_names_the_asset() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project_with_svg_text(scratch.path());
    let project_arg = project.to_str().unwrap();
    let asset = only_asset_id(&project);

    // An empty store: no index, nothing installed. The document names no text
    // family, so there is nothing for the store to resolve and no font is
    // loaded — which is exactly the shape DEF-2 hid in.
    let store = scratch.path().join("fonts");
    std::fs::create_dir_all(&store).unwrap();
    let out = scratch.path().join("poster.png");

    let stderr = run_failing(&[
        "export",
        project_arg,
        out.to_str().unwrap(),
        "--font-store",
        store.to_str().unwrap(),
    ]);
    assert!(
        stderr.contains(&asset),
        "the failure must name the asset {asset}: {stderr}"
    );
    assert!(
        stderr.contains("Noto Sans"),
        "and the family that is missing: {stderr}"
    );
    assert!(
        !out.exists(),
        "a refused export writes no file: {}",
        out.display()
    );
}

#[test]
fn the_same_document_exports_when_the_family_is_loaded() {
    let scratch = tempfile::tempdir().unwrap();
    let project = project_with_svg_text(scratch.path());
    let project_arg = project.to_str().unwrap();
    let out = scratch.path().join("poster.png");

    // `--font-dir` loads every file in the directory, Noto Sans among them, so
    // the asset's `<text>` has a face and the export goes through — the
    // behaviour that always worked here and nowhere else.
    let printed = run(&[
        "export",
        project_arg,
        out.to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(printed.contains("sha256:"), "{printed}");
    assert!(out.is_file());

    // Naming the one file it needs works the same way.
    let single = scratch.path().join("named.png");
    run(&[
        "export",
        project_arg,
        single.to_str().unwrap(),
        "--font",
        font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
    ]);
    assert!(single.is_file());
}

#[test]
fn text_that_names_no_family_is_refused_even_with_every_font_loaded() {
    // `--font-dir` is the spelling that loaded everything and hid DEF-2 here.
    // It cannot save this document: the `<text>` names no family, the store is
    // keyed by the family a face declares, and no number of loaded faces makes
    // that text appear. It exported successfully and blank until now.
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("poster");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "100"]);
    run(&[
        "add-svg",
        project_arg,
        fixture("no_family.svg").to_str().unwrap(),
        "--x",
        "0",
        "--y",
        "0",
        "--width",
        "200",
        "--height",
        "100",
    ]);
    let asset = only_asset_id(&project);

    let out = scratch.path().join("poster.png");
    let stderr = run_failing(&[
        "export",
        project_arg,
        out.to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(
        stderr.contains(&asset),
        "the failure must name the asset {asset}: {stderr}"
    );
    assert!(
        stderr.contains("names no font family"),
        "and say what to do about it: {stderr}"
    );
    assert!(!out.exists(), "a refused export writes no file");
}

#[test]
fn an_svg_asset_with_no_text_still_needs_no_fonts() {
    // The rule reaches only assets that actually draw text. A drawing is a
    // drawing, and an export of one still needs nothing named.
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("mark");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "100"]);
    run(&[
        "add-svg",
        project_arg,
        fixture("no_text.svg").to_str().unwrap(),
    ]);

    let out = scratch.path().join("mark.png");
    run(&["export", project_arg, out.to_str().unwrap()]);
    assert!(out.is_file());
}
