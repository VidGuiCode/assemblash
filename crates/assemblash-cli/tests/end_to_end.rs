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
