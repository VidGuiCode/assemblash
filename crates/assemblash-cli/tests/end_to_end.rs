//! Step 6 exit test: the scripted round trip the Phase 0 gate needs —
//! create a project, add layers, save, reload, and export a PNG, all through
//! the binary rather than the library.

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
    assert!(!output.status.success(), "assemblash {args:?} should fail");
    String::from_utf8_lossy(&output.stderr).into_owned()
}

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

#[test]
fn create_add_layers_save_reload_export() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("poster");
    let project_arg = project.to_str().unwrap();
    let source_image = workspace.path().join("swatch.png");
    write_test_png(&source_image);

    let document_id = run(&[
        "new",
        project_arg,
        "--width",
        "400",
        "--height",
        "300",
        "--background",
        "#ffffff",
        "--name",
        "Poster",
    ])
    .trim()
    .to_owned();
    assert!(document_id.starts_with("doc_"), "{document_id}");
    assert!(project.join("document.json").is_file());

    let text_layer = run(&[
        "add-text",
        project_arg,
        "--text",
        "Hello\nAssemblash",
        "--font",
        "Noto Sans",
        "--size",
        "36",
        "--x",
        "20",
        "--y",
        "20",
        "--width",
        "360",
        "--height",
        "120",
    ])
    .trim()
    .to_owned();
    assert!(text_layer.starts_with("layer_"), "{text_layer}");

    let image_layer = run(&[
        "add-image",
        project_arg,
        "--file",
        source_image.to_str().unwrap(),
        "--x",
        "20",
        "--y",
        "160",
        "--width",
        "120",
        "--height",
        "120",
        "--fit",
        "cover",
    ])
    .trim()
    .to_owned();
    assert!(image_layer.starts_with("layer_"), "{image_layer}");

    // Reload through the binary: the document it prints must contain both
    // layers and the imported asset.
    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    assert_eq!(document["schemaVersion"], 1);
    assert_eq!(document["id"], document_id);
    assert_eq!(document["layers"].as_array().unwrap().len(), 2);
    assert_eq!(document["assets"].as_array().unwrap().len(), 1);

    // SVG, with the asset embedded so the file stands alone.
    let svg_path = workspace.path().join("out.svg");
    run(&[
        "render",
        project_arg,
        "--out",
        svg_path.to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    let svg = std::fs::read_to_string(&svg_path).unwrap();
    assert!(svg.starts_with("<svg"), "{svg}");
    assert!(svg.contains("Assemblash"));
    assert!(svg.contains("data:image/png;base64,"));

    // PNG.
    let png_path = workspace.path().join("out.png");
    run(&[
        "export",
        project_arg,
        "--out",
        png_path.to_str().unwrap(),
        "--scale",
        "2",
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    let png_bytes = std::fs::read(&png_path).unwrap();
    let decoder = png::Decoder::new(std::io::Cursor::new(&png_bytes));
    let reader = decoder.read_info().unwrap();
    assert_eq!((reader.info().width, reader.info().height), (800, 600));

    let metadata = assemblash_renderer::raster::read_png_metadata(&png_bytes).unwrap();
    assert!(
        metadata.contains(&("assemblash:documentId".to_owned(), document_id.clone())),
        "{metadata:?}"
    );
    assert!(
        !metadata
            .iter()
            .any(|(keyword, _)| keyword == "assemblash:created"),
        "no timestamp was asked for, so none should be written: {metadata:?}"
    );

    // Exporting again must produce the same bytes: this is the round trip the
    // gate depends on.
    let second_png = workspace.path().join("out2.png");
    run(&[
        "export",
        project_arg,
        "--out",
        second_png.to_str().unwrap(),
        "--scale",
        "2",
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert_eq!(png_bytes, std::fs::read(&second_png).unwrap());
}

#[test]
fn creating_a_project_twice_is_refused() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    run(&["new", project.to_str().unwrap()]);
    let stderr = run_failing(&["new", project.to_str().unwrap()]);
    assert!(stderr.contains("already contains a project"), "{stderr}");
}

#[test]
fn a_missing_font_stops_the_export() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg]);
    run(&[
        "add-text",
        project_arg,
        "--text",
        "x",
        "--font",
        "Definitely Not Installed",
    ]);

    let stderr = run_failing(&[
        "export",
        project_arg,
        "--out",
        workspace.path().join("o.png").to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(stderr.contains("is not available"), "{stderr}");
}

#[test]
fn opening_a_directory_that_is_not_a_project_is_refused() {
    let workspace = tempfile::tempdir().unwrap();
    let stderr = run_failing(&["show", workspace.path().to_str().unwrap()]);
    assert!(stderr.contains("is not an Assemblash project"), "{stderr}");
}

#[test]
fn an_imported_svg_is_sanitised_and_still_renders() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("vector");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "200"]);

    let hostile = workspace.path().join("logo.svg");
    std::fs::write(
        &hostile,
        concat!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" ",
            "onload=\"steal()\">",
            "<script>fetch('https://example.com')</script>",
            "<image href=\"https://example.com/tracker.png\" width=\"1\" height=\"1\"/>",
            "<circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#3355ff\"/>",
            "</svg>",
        ),
    )
    .unwrap();

    run(&[
        "add-svg",
        project_arg,
        "--file",
        hostile.to_str().unwrap(),
        "--x",
        "20",
        "--y",
        "20",
        "--width",
        "160",
        "--height",
        "160",
    ]);

    // What was stored must be safe: this is the invariant the whole import
    // path exists to hold.
    let assets = std::fs::read_dir(project.join("assets")).unwrap();
    let mut checked = 0;
    for entry in assets {
        let stored = std::fs::read_to_string(entry.unwrap().path()).unwrap();
        assert!(!stored.contains("script"), "{stored}");
        assert!(!stored.contains("onload"), "{stored}");
        assert!(!stored.contains("example.com"), "{stored}");
        assert!(stored.contains("<circle"), "the drawing survived: {stored}");
        checked += 1;
    }
    assert_eq!(checked, 1);

    // And it still renders.
    let png_path = workspace.path().join("vector.png");
    run(&[
        "export",
        project_arg,
        "--out",
        png_path.to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    let png_bytes = std::fs::read(&png_path).unwrap();
    let decoder = png::Decoder::new(std::io::Cursor::new(&png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());

    let blue = buffer
        .chunks_exact(4)
        .filter(|p| p[3] > 128 && p[2] > 200 && p[0] < 120)
        .count();
    assert!(
        blue > 1000,
        "the circle should have been drawn, found {blue} blue pixels"
    );
}

#[test]
fn an_svg_with_a_doctype_is_refused() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg]);

    let bomb = workspace.path().join("bomb.svg");
    std::fs::write(
        &bomb,
        "<!DOCTYPE svg [<!ENTITY a \"aaaaaaaaaa\">]><svg xmlns=\"http://www.w3.org/2000/svg\"/>",
    )
    .unwrap();

    let stderr = run_failing(&["add-svg", project_arg, "--file", bomb.to_str().unwrap()]);
    assert!(stderr.contains("DOCTYPE"), "{stderr}");
    // Nothing was stored.
    assert_eq!(
        std::fs::read_dir(project.join("assets")).unwrap().count(),
        0
    );
}

#[test]
fn layout_commands_align_and_report_through_the_binary() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("layout");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "1000", "--height", "1000"]);

    let mut ids = Vec::new();
    for (x, y) in [(100.0, 10.0), (30.0, 200.0), (400.0, 500.0)] {
        ids.push(
            run(&[
                "add-text",
                project_arg,
                "--text",
                "x",
                "--font",
                "Noto Sans",
                "--x",
                &x.to_string(),
                "--y",
                &y.to_string(),
                "--width",
                "80",
                "--height",
                "40",
            ])
            .trim()
            .to_owned(),
        );
    }

    // Before aligning, the three sit at different left edges.
    let before = run(&["bounds", project_arg]);
    assert_eq!(before.split_whitespace().next(), Some("30"), "{before}");

    let moved = run(&[
        "align",
        project_arg,
        "--layer",
        &ids.join(","),
        "--edge",
        "left",
        "--actor",
        "agent",
        "--actor-name",
        "layout-test",
    ]);
    assert_eq!(moved.lines().count(), 2, "one layer was already aligned");

    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    for layer in document["layers"].as_array().unwrap() {
        assert_eq!(layer["transform"]["x"], 30.0, "{layer}");
    }

    // The layout change is in the audit trail, and undoable like anything else.
    let history = run(&["history", project_arg]);
    assert!(history.contains("layout-test"), "{history}");
    // The audit trail names the operation, rather than calling everything it
    // does not recognise "operation".
    assert!(history.contains("align"), "{history}");
    run(&["undo", project_arg]);
    let after_undo = run(&["show", project_arg]);
    let restored: serde_json::Value = serde_json::from_str(&after_undo).unwrap();
    assert_eq!(restored["layers"][0]["transform"]["x"], 100.0);

    // Overlap reporting: two layers put on top of each other are found.
    run(&["center", project_arg, "--layer", &ids[0], "--axis", "both"]);
    run(&["center", project_arg, "--layer", &ids[1], "--axis", "both"]);
    let overlaps = run(&["overlaps", project_arg]);
    // The two centred layers are now on top of each other. Others may overlap
    // them too — the check is that this pair is reported, not how many pairs
    // the layout happens to produce.
    assert!(
        overlaps
            .lines()
            .any(|line| line.contains(&ids[0]) && line.contains(&ids[1])),
        "{overlaps}"
    );
}
