//! Export formats, page sets, print geometry and variants over MCP.
//!
//! Each test drives the real `assemblash mcp` binary over a stdio pipe, the
//! same way `writes.rs` does. Nothing here reaches into the library to make
//! an export.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Color, Document, Layer, LayerId, SequentialIdSource, Slot, SlotKind};
use rmcp::model::CallToolRequestParams;
use rmcp::service::RunningService;
use rmcp::transport::TokioChildProcess;
use rmcp::{RoleClient, ServiceExt};
use serde_json::{json, Map, Value};

mod support;

use support::binary;

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
}

/// A workspace with the test font installed.
fn workspace(root: &Path) -> Workspace {
    let workspace = Workspace::open_or_create(root).unwrap();
    let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    store
        .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
        .unwrap();
    workspace
}

/// A project with one background colour and nothing else.
fn coloured(workspace: &Workspace, id: &str, colour: &str) -> PathBuf {
    let directory = workspace
        .create_project_dir(&ProjectId::new(id).unwrap())
        .unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 120.0, 80.0);
    document.canvas.background = Some(Color::new(colour));
    assemblash_core::storage::save(&document, &directory).unwrap();
    directory
}

/// Three visibly different pages, and a deck whose middle page comes from a
/// nested set.
fn three_page_deck(workspace: &Workspace) {
    coloured(workspace, "cover", "#c0392b");
    coloured(workspace, "inside", "#27ae60");
    coloured(workspace, "back", "#2980b9");
    let sets = workspace.page_sets_dir();
    std::fs::create_dir_all(&sets).unwrap();
    std::fs::write(
        sets.join("middle.json"),
        r#"{"pages":[{"project":"inside"}]}"#,
    )
    .unwrap();
    std::fs::write(
        sets.join("deck.json"),
        r#"{"pages":[{"project":"cover"},{"set":"middle"},{"project":"back"}]}"#,
    )
    .unwrap();
}

fn text_layer(id: &str, transform: Transform, body: &str) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        assemblash_core::LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 24.0,
            color: Some(Color::new("#101820")),
            align: TextAlign::Left,
            line_height: 1.2,
            paragraph_spacing: 0.0,
            font_weight: 400,
            font_style: assemblash_core::FontStyle::Normal,
            letter_spacing: 0.0,
            stroke: None,
            vertical_align: assemblash_core::VerticalAlign::Top,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

async fn connect(root: &Path) -> RunningService<RoleClient, ()> {
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(root);
    ().serve(TokioChildProcess::new(command).unwrap())
        .await
        .expect("the server initialized")
}

fn call(name: &'static str, arguments: Value) -> CallToolRequestParams {
    let mut params = CallToolRequestParams::default();
    params.name = name.into();
    params.arguments = arguments.as_object().cloned().or_else(|| Some(Map::new()));
    params
}

fn structured(result: &rmcp::model::CallToolResult) -> Value {
    result
        .structured_content
        .clone()
        .unwrap_or_else(|| panic!("no structured content in {result:#?}"))
}

async fn export(client: &RunningService<RoleClient, ()>, arguments: Value) -> Value {
    structured(
        &client
            .call_tool(call("export_document", arguments))
            .await
            .unwrap(),
    )
}

fn decode_png(bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

fn export_files(root: &Path, project: &str) -> Vec<String> {
    let Ok(entries) = std::fs::read_dir(root.join("projects").join(project).join("exports")) else {
        return Vec::new();
    };
    let mut names: Vec<String> = entries
        .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
        .collect();
    names.sort();
    names
}

#[tokio::test]
async fn export_document_without_the_new_fields_is_the_png_export_it_always_was() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    let directory = coloured(&workspace, "poster", "#c0392b");
    let client = connect(&root).await;

    let exported = export(&client, json!({ "project": "poster" })).await;
    let mut keys: Vec<&String> = exported.as_object().unwrap().keys().collect();
    keys.sort();
    assert_eq!(
        keys,
        ["bytes", "height", "path", "replaced", "warnings", "width"]
    );
    assert_eq!(exported["path"], "exports/export.png");
    client.cancel().await.unwrap();

    let document = assemblash_core::Session::open_read_only(&directory)
        .unwrap()
        .document()
        .clone();
    let store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    let direct = assemblash_server::render::png_for(&document, &directory, &store, 1.0).unwrap();
    assert_eq!(
        std::fs::read(directory.join("exports/export.png")).unwrap(),
        direct.bytes
    );
}

#[tokio::test]
async fn export_document_writes_each_new_format() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    let directory = coloured(&workspace, "poster", "#c0392b");
    let client = connect(&root).await;

    for (format, file) in [
        ("pdf", "out.pdf"),
        ("jpeg", "out.jpg"),
        ("webp", "out.webp"),
        ("svg", "out.svg"),
    ] {
        let exported = export(
            &client,
            json!({ "project": "poster", "name": "out", "format": format }),
        )
        .await;
        assert_eq!(exported["path"], format!("exports/{file}"), "{format}");
        assert!(exported.get("pages").is_none(), "{exported}");
        let bytes = std::fs::read(directory.join("exports").join(file)).unwrap();
        assert_eq!(bytes.len(), exported["bytes"].as_u64().unwrap() as usize);
        match format {
            "pdf" => assert!(bytes.starts_with(b"%PDF-")),
            "jpeg" => assert!(bytes.starts_with(&[0xFF, 0xD8, 0xFF])),
            "webp" => {
                assert!(bytes.starts_with(b"RIFF"));
                assert_eq!(&bytes[8..12], b"WEBP");
            }
            _ => assert!(String::from_utf8_lossy(&bytes).contains("<svg")),
        }
    }

    // The overwrite rule holds for every extension.
    let again = client
        .call_tool(call(
            "export_document",
            json!({ "project": "poster", "name": "out", "format": "jpg" }),
        ))
        .await;
    assert!(format!("{again:?}").contains("exportExists"), "{again:?}");
    let replaced = export(
        &client,
        json!({ "project": "poster", "name": "out", "format": "jpg", "overwrite": true }),
    )
    .await;
    assert_eq!(replaced["replaced"], true);
    client.cancel().await.unwrap();
}

#[tokio::test]
async fn export_document_refusals_are_typed_and_write_nothing() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    three_page_deck(&workspace);
    let client = connect(&root).await;

    for (arguments, code) in [
        (json!({ "format": "gif" }), "exportFormatNotSupported"),
        (
            json!({ "format": "webp", "quality": 80 }),
            "lossyWebpNotSupported",
        ),
        (
            json!({ "format": "jpeg", "quality": 101 }),
            "exportQualityOutOfRange",
        ),
        (json!({ "quality": 80 }), "exportQualityNotApplicable"),
        (json!({ "format": "webp", "print": true }), "printNeedsPdf"),
        (
            json!({ "format": "pdf", "pages": "deck:0" }),
            "invalidPageSelection",
        ),
        (
            json!({ "format": "pdf", "pages": "deck:4" }),
            "invalidPageSelection",
        ),
        (json!({ "format": "png", "pages": "deck" }), "pagesNeedPdf"),
        (
            json!({ "format": "pdf", "pages": "nope" }),
            "pageSetNotFound",
        ),
    ] {
        let mut arguments = arguments;
        arguments["project"] = json!("cover");
        let refused = client
            .call_tool(call("export_document", arguments.clone()))
            .await;
        let text = format!("{refused:?}");
        assert!(text.contains(code), "{arguments}: {text}");
        if code == "lossyWebpNotSupported" {
            assert!(text.contains("lossless WebP"), "{text}");
            assert!(text.contains("jpeg"), "{text}");
        }
        for project in ["cover", "inside", "back"] {
            assert!(
                export_files(&root, project).is_empty(),
                "{arguments} wrote into {project}"
            );
        }
    }
    client.cancel().await.unwrap();
}

/// Rung exit test 2 over MCP, and the same PDF twice.
#[tokio::test]
async fn a_page_set_exports_to_one_pdf_of_the_png_pages_every_time_the_same() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    three_page_deck(&workspace);
    coloured(&workspace, "office", "#ffffff");
    let client = connect(&root).await;

    let mut runs = Vec::new();
    for run in ["deck-a", "deck-b"] {
        let exported = export(
            &client,
            json!({ "project": "office", "name": run, "format": "pdf", "pages": "deck" }),
        )
        .await;
        assert_eq!(exported["path"], format!("exports/{run}.pdf"));
        assert_eq!(exported["pages"], 3);
        runs.push(std::fs::read(root.join(format!("projects/office/exports/{run}.pdf"))).unwrap());
    }
    assert_eq!(runs[0], runs[1], "the same pages give the same bytes");

    let images = assemblash_export::pdf::extract_page_images(&runs[0]).unwrap();
    assert_eq!(images.len(), 3);
    for (page, project) in ["cover", "inside", "back"].iter().enumerate() {
        export(&client, json!({ "project": project, "name": "page" })).await;
        let png = std::fs::read(root.join(format!("projects/{project}/exports/page.png"))).unwrap();
        assert_eq!(images[page], decode_png(&png), "page {page}");
    }
    assert_ne!(images[0].2, images[1].2);
    assert_ne!(images[1].2, images[2].2);
    client.cancel().await.unwrap();
}

/// Rung exit test 4 over MCP.
#[tokio::test]
async fn print_gives_crop_marks_only_when_asked() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    let directory = coloured(&workspace, "poster", "#c0392b");
    let mut document = assemblash_core::storage::load(&directory).unwrap();
    document.canvas.bleed = Some(assemblash_core::Insets {
        top: 9.0,
        right: 9.0,
        bottom: 9.0,
        left: 9.0,
        extra: Extras::new(),
    });
    assemblash_core::storage::save(&document, &directory).unwrap();
    let client = connect(&root).await;

    export(
        &client,
        json!({ "project": "poster", "name": "marked", "format": "pdf", "print": true }),
    )
    .await;
    export(
        &client,
        json!({ "project": "poster", "name": "plain", "format": "pdf" }),
    )
    .await;
    client.cancel().await.unwrap();

    let marked = std::fs::read(directory.join("exports/marked.pdf")).unwrap();
    let streams = assemblash_export::pdf::page_content_streams(&marked).unwrap();
    assert!(streams[0].contains(" l S"), "{}", streams[0]);
    let boxes = assemblash_export::pdf::page_dictionaries(&marked).unwrap();
    assert!(boxes[0].contains("/TrimBox") && boxes[0].contains("/BleedBox"));

    let plain = std::fs::read(directory.join("exports/plain.pdf")).unwrap();
    let streams = assemblash_export::pdf::page_content_streams(&plain).unwrap();
    assert!(!streams[0].contains(" l S"), "{}", streams[0]);
}

#[tokio::test]
async fn every_format_reports_content_outside_margins() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    let directory = workspace
        .create_project_dir(&ProjectId::new("print").unwrap())
        .unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 200.0);
    document.canvas.margins = Some(assemblash_core::Insets {
        top: 20.0,
        right: 20.0,
        bottom: 20.0,
        left: 20.0,
        extra: Extras::new(),
    });
    document.layers.push(text_layer(
        "layer_across",
        Transform::new(8.0, 40.0, 300.0, 60.0),
        "Across the margin",
    ));
    assemblash_core::storage::save(&document, &directory).unwrap();
    let client = connect(&root).await;

    let png = export(&client, json!({ "project": "print", "name": "png" })).await;
    let expected = png["warnings"].clone();
    assert!(
        expected.as_array().unwrap().iter().any(|warning| {
            warning["code"] == "contentOutsideMargins" && warning["layerId"] == "layer_across"
        }),
        "{expected}"
    );
    for format in ["pdf", "jpeg", "webp"] {
        let exported = export(
            &client,
            json!({ "project": "print", "name": format, "format": format }),
        )
        .await;
        assert_eq!(exported["warnings"], expected, "{format}");
    }
    client.cancel().await.unwrap();
}

#[tokio::test]
async fn render_variants_as_a_pdf_is_one_page_each_in_order() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = workspace(&root);
    let directory = workspace
        .create_project_dir(&ProjectId::new("flyer").unwrap())
        .unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 200.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(text_layer(
        "layer_headline",
        Transform::new(10.0, 10.0, 380.0, 80.0),
        "placeholder",
    ));
    document.slots = vec![Slot {
        name: "headline".to_owned(),
        layer: LayerId::new("layer_headline"),
        kind: SlotKind::Text,
        description: None,
        required: true,
        extra: Extras::new(),
    }];
    assemblash_core::storage::save(&document, &directory).unwrap();
    let client = connect(&root).await;

    let variants = json!([
        { "name": "one", "values": { "headline": "First" } },
        { "name": "two", "values": { "headline": "Second" } }
    ]);
    let pngs = structured(
        &client
            .call_tool(call(
                "render_variants",
                json!({ "project": "flyer", "variants": variants }),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(pngs["variants"][0]["path"], "exports/one.png");
    assert!(pngs["variants"][0].get("page").is_none());

    let pdf = structured(
        &client
            .call_tool(call(
                "render_variants",
                json!({ "project": "flyer", "variants": variants, "format": "pdf" }),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(pdf["variants"][1]["path"], "exports/variants.pdf");
    assert_eq!(pdf["variants"][1]["page"], 2);
    client.cancel().await.unwrap();

    let bytes = std::fs::read(directory.join("exports/variants.pdf")).unwrap();
    let images = assemblash_export::pdf::extract_page_images(&bytes).unwrap();
    assert_eq!(images.len(), 2);
    for (index, name) in ["one", "two"].iter().enumerate() {
        let png = std::fs::read(directory.join(format!("exports/{name}.png"))).unwrap();
        assert_eq!(images[index], decode_png(&png), "{name}");
    }
}
