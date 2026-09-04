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

/// Both streams of a command that must succeed: stdout, then stderr.
///
/// Warnings go to stderr and the exported file's hash goes to stdout, so a
/// test about warnings has to read both and keep them apart.
#[track_caller]
fn run_output(args: &[&str]) -> (String, String) {
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

/// The `<path>\t<sha256:…>` line `render` and `export` print.
#[track_caller]
fn hash_line(printed: &str) -> (String, String) {
    let line = printed.lines().next().unwrap_or_default();
    let (path, hash) = line
        .split_once('\t')
        .unwrap_or_else(|| panic!("expected `<path>\\t<sha256:…>`, got {printed:?}"));
    (path.to_owned(), hash.to_owned())
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

#[test]
fn the_font_store_is_driven_from_the_command_line() {
    let workspace = tempfile::tempdir().unwrap();
    let store = workspace.path().join("fonts");
    let store_arg = store.to_str().unwrap();
    let font = font_dir().join("NotoSans-Subset.ttf");

    let added = run(&[
        "font",
        "add",
        font.to_str().unwrap(),
        "--license",
        "OFL-1.1",
        "--font-store",
        store_arg,
    ]);
    assert!(added.contains("Noto Sans"), "{added}");

    let families = run(&["font", "list", "--font-store", store_arg]);
    assert_eq!(families.trim(), "Noto Sans");

    let faces = run(&["font", "list", "--faces", "--font-store", store_arg]);
    assert!(faces.contains("sha256:"), "{faces}");

    let licenses = run(&["font", "licenses", "--font-store", store_arg]);
    assert!(licenses.contains("OFL-1.1"), "{licenses}");

    assert!(run(&["font", "verify", "--font-store", store_arg]).contains("matches"));

    // What could be installed, without touching the network.
    let installable = run(&["font", "install", "--list"]);
    assert!(installable.contains("Noto Sans"), "{installable}");

    // A project that renders through the store, and one that asks for a family
    // the store does not have.
    let project = workspace.path().join("poster");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "300", "--height", "120"]);
    run(&[
        "add-text",
        project_arg,
        "--text",
        "stored",
        "--font",
        "Noto Sans",
        "--size",
        "32",
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "280",
        "--height",
        "60",
    ]);

    let png = workspace.path().join("out.png");
    run(&[
        "export",
        project_arg,
        "--out",
        png.to_str().unwrap(),
        "--font-store",
        store_arg,
    ]);
    assert!(png.is_file());

    // Naming no fonts at all is refused rather than quietly placing text by a
    // different rule.
    let error = run_failing(&["export", project_arg, "--out", png.to_str().unwrap()]);
    assert!(error.contains("name its fonts"), "{error}");

    // A family the store does not have is a structured refusal, never a
    // substitution.
    let other = workspace.path().join("other");
    let other_arg = other.to_str().unwrap();
    run(&["new", other_arg, "--width", "300", "--height", "120"]);
    run(&[
        "add-text",
        other_arg,
        "--text",
        "missing",
        "--font",
        "Helvetica Neue",
        "--size",
        "32",
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "280",
        "--height",
        "60",
    ]);
    let error = run_failing(&[
        "export",
        other_arg,
        "--out",
        png.to_str().unwrap(),
        "--font-store",
        store_arg,
    ]);
    assert!(error.contains("Helvetica Neue"), "{error}");
    assert!(error.contains("font store"), "{error}");

    // Removing takes the file with it.
    assert_eq!(
        run(&["font", "remove", "Noto Sans", "--font-store", store_arg]).trim(),
        "1"
    );
    assert_eq!(run(&["font", "list", "--font-store", store_arg]).trim(), "");
}

#[test]
fn the_workspace_command_creates_a_workspace_on_first_run() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("data");

    let output = Command::new(binary())
        .args(["workspace"])
        .env("ASSEMBLASH_WORKSPACE", &root)
        .output()
        .expect("the binary runs");
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        String::from_utf8_lossy(&output.stdout).trim(),
        root.to_string_lossy()
    );

    assert!(root.join("projects").is_dir());
    assert!(root.join("fonts").is_dir());
    assert!(root.join("config.toml").is_file());

    // Running it again reports the same place and changes nothing.
    let settings = std::fs::read_to_string(root.join("config.toml")).unwrap();
    Command::new(binary())
        .args(["workspace"])
        .env("ASSEMBLASH_WORKSPACE", &root)
        .output()
        .unwrap();
    assert_eq!(
        std::fs::read_to_string(root.join("config.toml")).unwrap(),
        settings
    );
}

/// `add-text` checks the family against the store when told where it is.
///
/// Naming a font that is not installed used to succeed and then fail at
/// export, several commands later, looking like a rendering problem rather
/// than a typo. Found in the v0.10.0 independent verification.
#[test]
fn add_text_checks_the_font_family_against_the_store() {
    let workspace = tempfile::tempdir().unwrap();
    let store = workspace.path().join("fonts");
    let store_arg = store.to_str().unwrap();
    run(&[
        "font",
        "add",
        font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
        "--font-store",
        store_arg,
    ]);

    let project = workspace.path().join("poster");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "100"]);

    let add = |family: &'static str| {
        [
            "add-text",
            project_arg,
            "--text",
            "hello",
            "--font",
            family,
            "--size",
            "20",
            "--x",
            "0",
            "--y",
            "0",
            "--width",
            "100",
            "--height",
            "30",
            "--font-store",
            store_arg,
        ]
    };

    // A family the store has goes through.
    run(&add("Noto Sans"));

    // One it does not have is refused here, with what is available.
    let error = run_failing(&add("Helvetica Neue"));
    assert!(error.contains("Helvetica Neue"), "{error}");
    assert!(
        error.contains("Noto Sans"),
        "the error should say what is available: {error}"
    );

    // The document was not touched by the refusal.
    let shown = run(&["show", project_arg]);
    let document: serde_json::Value = serde_json::from_str(&shown).unwrap();
    assert_eq!(document["layers"].as_array().unwrap().len(), 1);

    // Without the flag it still works, because the check is a courtesy and
    // not a new requirement — the store is optional and export is where a
    // missing font has always been fatal.
    run(&[
        "add-text",
        project_arg,
        "--text",
        "unchecked",
        "--font",
        "Whatever",
        "--size",
        "20",
        "--x",
        "0",
        "--y",
        "40",
        "--width",
        "100",
        "--height",
        "30",
    ]);
}

/// DEF-10: an output path is a positional argument, and both commands say
/// what they wrote by printing its hash.
///
/// The hash is what lets the exit test compare transports without shelling
/// out to a hasher: the same document exported over the CLI, over HTTP and
/// over MCP must produce the same bytes, and this is how the CLI says which
/// bytes it produced.
#[test]
fn export_accepts_a_positional_output_and_prints_its_hash() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&[
        "new",
        project_arg,
        "--width",
        "40",
        "--height",
        "40",
        "--background",
        "#ffffff",
    ]);

    let positional = workspace.path().join("positional.png");
    let (path, hash) = hash_line(&run(&["export", project_arg, positional.to_str().unwrap()]));
    assert_eq!(path, positional.to_string_lossy());
    assert_eq!(
        hash,
        assemblash_core::storage::hash_bytes(&std::fs::read(&positional).unwrap()),
        "the printed hash is not the hash of the file on disk"
    );

    // `--out` is the older spelling of the same thing and prints the same
    // hash, because it is the same document.
    let flagged = workspace.path().join("flagged.png");
    let (path, flagged_hash) = hash_line(&run(&[
        "export",
        project_arg,
        "--out",
        flagged.to_str().unwrap(),
    ]));
    assert_eq!(path, flagged.to_string_lossy());
    assert_eq!(flagged_hash, hash, "the same document exported differently");

    // `render` does both as well.
    let svg = workspace.path().join("out.svg");
    let (path, svg_hash) = hash_line(&run(&["render", project_arg, svg.to_str().unwrap()]));
    assert_eq!(path, svg.to_string_lossy());
    assert_eq!(
        svg_hash,
        assemblash_core::storage::hash_bytes(&std::fs::read(&svg).unwrap())
    );

    // Saying where twice is a mistake worth catching, and saying it not at
    // all is the error it always was.
    let refused = run_failing(&[
        "export",
        project_arg,
        positional.to_str().unwrap(),
        "--out",
        flagged.to_str().unwrap(),
    ]);
    assert!(refused.contains("cannot be used with"), "{refused}");
    let refused = run_failing(&["export", project_arg]);
    assert!(refused.contains("required"), "{refused}");
}

/// DEF-12: the file an import reads is a positional argument.
///
/// `font add` already took one, so `assemblash add-svg p logo.svg` looked as
/// though it should work and exited 2 with `unexpected argument`.
#[test]
fn add_svg_accepts_a_positional_file_and_the_flag() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "200"]);

    let logo = workspace.path().join("logo.svg");
    std::fs::write(
        &logo,
        concat!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\">",
            "<circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#3355ff\"/></svg>",
        ),
    )
    .unwrap();

    let positional = run(&["add-svg", project_arg, logo.to_str().unwrap()])
        .trim()
        .to_owned();
    assert!(positional.starts_with("layer_"), "{positional}");

    let flagged = run(&["add-svg", project_arg, "--file", logo.to_str().unwrap()])
        .trim()
        .to_owned();
    assert!(flagged.starts_with("layer_"), "{flagged}");

    // Images too, and saying it both ways is refused rather than half-obeyed.
    let swatch = workspace.path().join("swatch.png");
    write_test_png(&swatch);
    let image = run(&["add-image", project_arg, swatch.to_str().unwrap()])
        .trim()
        .to_owned();
    assert!(image.starts_with("layer_"), "{image}");

    let refused = run_failing(&[
        "add-image",
        project_arg,
        swatch.to_str().unwrap(),
        "--file",
        swatch.to_str().unwrap(),
    ]);
    assert!(refused.contains("cannot be used with"), "{refused}");

    // Naming no file at all is a parser error, not a panic.
    let refused = run_failing(&["add-svg", project_arg]);
    assert!(refused.contains("required"), "{refused}");
}

/// DEF-12: inline JSON is what a shell mangles, so a file may say it instead.
#[test]
fn preset_define_reads_properties_from_a_file() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg]);

    let properties = workspace.path().join("heading.json");
    std::fs::write(&properties, r##"{"fontSize":48,"color":"#101820"}"##).unwrap();

    run(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "heading",
        "--properties-file",
        properties.to_str().unwrap(),
    ]);

    let listed = run(&["preset", "list", project_arg]);
    assert!(listed.contains("heading"), "{listed}");
    assert!(listed.contains("48"), "{listed}");
    assert!(listed.contains("#101820"), "{listed}");

    // Both spellings at once is refused, and neither is a parser error.
    let refused = run_failing(&[
        "preset",
        "define",
        project_arg,
        "--name",
        "other",
        "--properties",
        "{}",
        "--properties-file",
        properties.to_str().unwrap(),
    ]);
    assert!(refused.contains("cannot be used with"), "{refused}");
    let refused = run_failing(&["preset", "define", project_arg, "--name", "other"]);
    assert!(refused.contains("required"), "{refused}");
}

/// FR-11 on the command line: an export says what it noticed, and succeeds
/// anyway. A warning is not a failure — the file is exactly what the document
/// says; it is the document that is surprising.
#[test]
fn overflowing_text_warns_on_stderr_and_still_exits_zero() {
    let workspace = tempfile::tempdir().unwrap();
    let project = workspace.path().join("p");
    let project_arg = project.to_str().unwrap();
    run(&["new", project_arg, "--width", "200", "--height", "200"]);

    let layer = run(&[
        "add-text",
        project_arg,
        "--text",
        "Assemblash renders more text than this box can hold",
        "--font",
        "Noto Sans",
        "--size",
        "24",
        "--x",
        "0",
        "--y",
        "0",
        "--width",
        "180",
        "--height",
        "20",
    ])
    .trim()
    .to_owned();

    let png = workspace.path().join("out.png");
    let (printed, complaints) = run_output(&[
        "export",
        project_arg,
        png.to_str().unwrap(),
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(
        complaints.contains("textOverflowsBox") && complaints.contains(&layer),
        "the overflow should be one line on stderr: {complaints:?}"
    );
    // Nothing about the warning may reach stdout, which carries the hash.
    assert_eq!(printed.lines().count(), 1, "{printed:?}");
    assert!(!printed.contains("textOverflowsBox"), "{printed:?}");
    assert!(png.is_file(), "the export still wrote its file");

    // Asked for as JSON, the array goes to stdout under the hash, and stderr
    // stays quiet.
    let (printed, complaints) = run_output(&[
        "export",
        project_arg,
        png.to_str().unwrap(),
        "--warnings-json",
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(
        !complaints.contains("textOverflowsBox"),
        "asked for JSON, stderr should stay quiet: {complaints:?}"
    );
    let mut lines = printed.lines();
    assert!(lines.next().unwrap_or_default().contains("sha256:"));
    let warnings: serde_json::Value = serde_json::from_str(lines.next().unwrap_or_default())
        .unwrap_or_else(|error| panic!("stdout should end in a JSON array: {printed:?} ({error})"));
    let first = &warnings[0];
    assert_eq!(first["code"], "textOverflowsBox", "{warnings}");
    assert_eq!(first["layerId"], layer, "{warnings}");
    assert!(first["message"].as_str().is_some(), "{warnings}");

    // `render` says the same things about the same document.
    let svg = workspace.path().join("out.svg");
    let (printed, _) = run_output(&[
        "render",
        project_arg,
        svg.to_str().unwrap(),
        "--warnings-json",
        "--font-dir",
        font_dir().to_str().unwrap(),
    ]);
    assert!(printed.contains("textOverflowsBox"), "{printed:?}");

    // A document with nothing to say says nothing at all.
    let quiet = workspace.path().join("quiet");
    run(&[
        "new",
        quiet.to_str().unwrap(),
        "--width",
        "20",
        "--height",
        "20",
    ]);
    let (printed, complaints) = run_output(&[
        "export",
        quiet.to_str().unwrap(),
        workspace.path().join("quiet.png").to_str().unwrap(),
        "--warnings-json",
    ]);
    assert_eq!(printed.lines().nth(1), Some("[]"), "{printed:?}");
    assert!(complaints.is_empty(), "{complaints:?}");
}
