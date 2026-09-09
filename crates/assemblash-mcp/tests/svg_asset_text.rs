//! D12(a) through MCP: an SVG asset whose text nothing can draw comes back as
//! a tool error, not as a successful export of a blank picture.
//!
//! An agent is the caller least able to notice DEF-2: it gets a PNG back, the
//! call succeeded, and nothing in the answer says the words in the graphic are
//! missing. So the important property here is not just that the export fails —
//! it is that it fails *as a tool error*, with the same machine-readable code
//! the HTTP API reports and a message that names the asset.
//!
//! Driven through the real `assemblash` binary over a real stdio pipe, like
//! every other test in this crate.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::ids::SequentialIdSource;
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::Document;
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

fn svg_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/svg_assets/named_family.svg")
}

/// A workspace with Noto Sans installed and one project that has **no text
/// layer**: nothing for the loader to resolve, which is what leaves the SVG
/// asset's own text with no face.
fn workspace_with_project(root: &Path) -> String {
    workspace_with_asset(root, &std::fs::read_to_string(svg_fixture()).unwrap())
}

/// The same workspace, with the asset's markup given here instead of read from
/// a fixture — for the cases the shared fixtures do not cover.
fn workspace_with_asset(root: &Path, markup: &str) -> String {
    let source_dir = tempfile::tempdir().unwrap();
    let source = source_dir.path().join("asset.svg");
    std::fs::write(&source, markup).unwrap();

    let workspace = Workspace::open_or_create(root).unwrap();
    let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    store
        .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
        .unwrap();

    let id = ProjectId::new("poster").unwrap();
    let directory = workspace.create_project_dir(&id).unwrap();
    let mut ids = SequentialIdSource::new();
    let document = Document::new(&mut ids, 200.0, 100.0);
    assemblash_core::storage::save(&document, &directory).unwrap();

    // Imported the way every transport imports: sanitised, hashed, stored.
    let asset = assemblash_core::storage::import_asset(&directory, &source, &mut ids).unwrap();
    let asset_id = asset.id.to_string();
    let mut document = assemblash_core::storage::load(&directory).unwrap();
    document.assets.push(asset);
    assemblash_core::storage::save(&document, &directory).unwrap();
    asset_id
}

async fn connect(root: &Path) -> RunningService<RoleClient, ()> {
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(root);
    ().serve(TokioChildProcess::new(command).unwrap())
        .await
        .expect("the server initialized")
}

fn args(value: Value) -> Option<Map<String, Value>> {
    value.as_object().cloned()
}

fn call(name: &'static str, arguments: Option<Map<String, Value>>) -> CallToolRequestParams {
    let mut params = CallToolRequestParams::default();
    params.name = name.into();
    params.arguments = arguments;
    params
}

fn structured(result: &rmcp::model::CallToolResult) -> Value {
    result
        .structured_content
        .clone()
        .unwrap_or_else(|| panic!("no structured content in {result:#?}"))
}

#[tokio::test]
async fn every_render_tool_refuses_an_svg_asset_whose_text_has_no_font() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let asset = workspace_with_project(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    let added = structured(
        &client
            .call_tool(call(
                "add_svg_layer",
                args(json!({
                    "x": 0.0, "y": 0.0, "width": 200.0, "height": 100.0,
                    "asset": asset
                })),
            ))
            .await
            .unwrap(),
    );
    assert!(added["created"][0].as_str().is_some(), "{added:#?}");

    // Every way of asking for the picture, because the defect was that they
    // did not all answer the same way.
    for (tool, arguments) in [
        ("export_document", args(json!({ "name": "with-svg" }))),
        ("get_canvas_preview", None),
        ("render_document", None),
    ] {
        let error = client
            .call_tool(call(tool, arguments))
            .await
            .expect_err(&format!("{tool} drew a blank picture instead of refusing"));
        let text = format!("{error:?}");
        assert!(
            text.contains("renderFailed"),
            "{tool}: refused, but not as a typed refusal: {text}"
        );
        assert!(
            text.contains(&asset),
            "{tool}: the refusal should name the asset {asset}: {text}"
        );
        assert!(
            text.contains("Noto Sans"),
            "{tool}: and the family that is missing: {text}"
        );
    }

    // A tool error is not a crash: the server is still there and still
    // answering, which is the property an agent depends on.
    let state = structured(
        &client
            .call_tool(call("get_document_state", None))
            .await
            .unwrap(),
    );
    assert_eq!(state["version"], 1);

    assert!(
        !root.join("projects/poster/exports/with-svg.png").exists(),
        "a refused export writes no file"
    );

    client.cancel().await.unwrap();
}

#[tokio::test]
async fn naming_the_family_on_a_text_layer_lets_the_same_export_through() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let asset = workspace_with_project(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();
    client
        .call_tool(call(
            "add_svg_layer",
            args(json!({
                "x": 0.0, "y": 0.0, "width": 200.0, "height": 100.0,
                "asset": asset
            })),
        ))
        .await
        .unwrap();

    // What the message tells the caller to do: put the family where the loader
    // looks. It is a workaround, not the repair — loading the families an asset
    // names is a later change — so it has to actually work.
    client
        .call_tool(call(
            "add_text_layer",
            args(json!({
                "text": "caption",
                "x": 0.0, "y": 0.0, "width": 200.0, "height": 20.0,
                "fontFamily": "Noto Sans",
                "fontSize": 12.0
            })),
        ))
        .await
        .unwrap();

    let exported = structured(
        &client
            .call_tool(call("export_document", args(json!({ "name": "with-svg" }))))
            .await
            .unwrap(),
    );
    assert_eq!(exported["path"], "exports/with-svg.png");
    assert!(root.join("projects/poster/exports/with-svg.png").is_file());

    client.cancel().await.unwrap();
}

/// The case `writes.rs` used to prove as a warning, now proved as a refusal.
///
/// Not the same shape as the test above: here a font *is* loaded — a text
/// layer names Noto Sans and the store resolves it — and the asset asks for
/// something else entirely. That was `export_document`'s one warning until
/// 1.5.0, returned alongside a written PNG with the word missing from it. An
/// agent reading `warnings` might have caught that; an agent reading `path`
/// would not, which is why it is a refusal and why the assertion lives here.
#[tokio::test]
async fn an_asset_naming_a_family_nothing_installed_is_refused_not_warned() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let asset = workspace_with_asset(
        &root,
        concat!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">"#,
            r##"<rect width="100" height="50" fill="#c8102e"/>"##,
            r#"<text x="6" y="30" font-family="Nowhere Sans" font-size="16">new</text>"#,
            "</svg>"
        ),
    );

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();
    // A loaded face, so the refusal cannot be blamed on an empty font set.
    client
        .call_tool(call(
            "add_text_layer",
            args(json!({
                "text": "caption",
                "x": 0.0, "y": 0.0, "width": 200.0, "height": 20.0,
                "fontFamily": "Noto Sans",
                "fontSize": 12.0
            })),
        ))
        .await
        .unwrap();
    client
        .call_tool(call(
            "add_svg_layer",
            args(json!({
                "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0,
                "asset": asset
            })),
        ))
        .await
        .unwrap();

    let error = client
        .call_tool(call("export_document", args(json!({ "name": "badge" }))))
        .await
        .expect_err("a family nothing installed must stop the export");
    let text = format!("{error:?}");
    assert!(text.contains("renderFailed"), "{text}");
    assert!(text.contains(&asset), "the refusal names the asset: {text}");
    assert!(
        text.contains("Nowhere Sans"),
        "and the family nothing loaded: {text}"
    );
    assert!(
        !root.join("projects/poster/exports/badge.png").exists(),
        "a refused export writes no file"
    );

    client.cancel().await.unwrap();
}
