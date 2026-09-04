//! The v0.8.0 exit tests — MVP criteria **10** and **11**.
//!
//! * **#10** — at least one local MCP client can apply a *reversible* layer
//!   operation. Reversible is the load-bearing word: the test undoes the
//!   change and compares the document byte for byte with what it was.
//! * **#11** — protected or locked layers cannot be modified through normal
//!   agent tools. Every mutating tool is tried against a protected layer, and
//!   every one must be refused with the document unchanged.
//!
//! Both drive the **actual `assemblash` binary** as a child process over a
//! real stdio pipe, with the SDK's client half. Nothing here reaches into the
//! library to make a change.
//!
//! #11 is the test that earns its keep later: a write tool added in some
//! future version that forgot to go through `Session::apply` would pass every
//! other test in this repository and fail this one.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, GroupLayer, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Color, Document, Layer, LayerKind};
use rmcp::model::CallToolRequestParams;
use rmcp::service::RunningService;
use rmcp::transport::TokioChildProcess;
use rmcp::{RoleClient, ServiceExt};
use serde_json::{json, Map, Value};

fn binary() -> PathBuf {
    let mut path = std::env::current_exe().expect("the test binary has a path");
    path.pop();
    path.pop();
    path.push(format!("assemblash{}", std::env::consts::EXE_SUFFIX));
    assert!(path.is_file(), "{} is missing", path.display());
    path
}

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
}

/// Ids the layers in the fixture get, so tests can name them.
const PLAIN: &str = "layer_00000000000000000000000001";
const GROUP: &str = "layer_00000000000000000000000002";
const PROTECTED: &str = "layer_00000000000000000000000003";
const LOCKED: &str = "layer_00000000000000000000000004";

fn text_layer(id: &str, transform: Transform, body: &str) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 24.0,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

/// A document with an ordinary layer, a protected one, and a locked one.
fn build_project(directory: &Path) -> Document {
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 300.0);
    document.name = Some("Written by an agent".to_owned());
    document.canvas.background = Some(Color::new("#ffffff"));

    document.layers.push(text_layer(
        PLAIN,
        Transform::new(20.0, 20.0, 200.0, 40.0),
        "ordinary",
    ));

    let mut protected = text_layer(PROTECTED, Transform::new(0.0, 0.0, 160.0, 40.0), "the logo");
    protected.protected = true;
    protected.name = Some("brand".to_owned());

    document.layers.push(Layer::new(
        LayerId::new(GROUP),
        Transform::new(20.0, 100.0, 200.0, 60.0),
        LayerKind::Group(GroupLayer {
            children: vec![protected],
            extra: Extras::new(),
        }),
    ));

    let mut locked = text_layer(
        LOCKED,
        Transform::new(20.0, 200.0, 200.0, 40.0),
        "pinned down",
    );
    locked.locked = true;
    document.layers.push(locked);

    assemblash_core::storage::save(&document, directory).unwrap();
    document
}

fn workspace_with_project(root: &Path) -> Document {
    let workspace = Workspace::open_or_create(root).unwrap();
    let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    store
        .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
        .unwrap();
    let id = ProjectId::new("poster").unwrap();
    let directory = workspace.create_project_dir(&id).unwrap();
    build_project(&directory)
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

/// The bytes of `document.json`, for comparing a document with itself later.
fn document_bytes(root: &Path) -> Vec<u8> {
    std::fs::read(root.join("projects/poster/document.json")).unwrap()
}

/// MVP criterion 10 — a real client applies a reversible layer operation.
#[tokio::test]
async fn a_real_client_applies_a_reversible_operation() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let before = document_bytes(&root);

    let client = connect(&root).await;

    // The tools this milestone is about are advertised.
    let tools = client.list_all_tools().await.unwrap();
    let names: Vec<&str> = tools.iter().map(|tool| tool.name.as_ref()).collect();
    for expected in [
        "add_text_layer",
        "update_layer",
        "move_layer",
        "resize_layer",
        "group_layers",
        "duplicate_layer",
        "delete_layer",
        "undo",
        "redo",
        "export_document",
        "open_project",
    ] {
        assert!(names.contains(&expected), "no {expected} in {names:?}");
    }
    // Still no selection to read, and still no generic escape hatch.
    assert!(!names.contains(&"get_selection"));
    assert!(!names.contains(&"apply_operation"));

    // A conversation names the project once.
    let opened = structured(
        &client
            .call_tool(call("open_project", args(json!({ "project": "poster" }))))
            .await
            .unwrap(),
    );
    assert_eq!(opened["project"], "poster");
    assert_eq!(opened["version"], 0);

    // A dry run reports what it would do and changes nothing.
    let dry = structured(
        &client
            .call_tool(call(
                "add_text_layer",
                args(json!({
                    "x": 20.0, "y": 250.0, "width": 300.0, "height": 40.0,
                    "text": "added by an agent",
                    "fontFamily": "Noto Sans",
                    "fontSize": 28.0,
                    "dryRun": true
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(dry["dryRun"], true);
    assert_eq!(dry["version"], 0);
    assert!(dry["transaction"].is_null());
    assert_eq!(dry["created"].as_array().unwrap().len(), 1);
    assert_eq!(
        document_bytes(&root),
        before,
        "a dry run must change nothing"
    );

    // For real this time, with the version it read.
    let applied = structured(
        &client
            .call_tool(call(
                "add_text_layer",
                args(json!({
                    "x": 20.0, "y": 250.0, "width": 300.0, "height": 40.0,
                    "text": "added by an agent",
                    "fontFamily": "Noto Sans",
                    "fontSize": 28.0,
                    "expectedVersion": 0,
                    "actor": "the exit test"
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(applied["dryRun"], false);
    assert_eq!(applied["version"], 1);
    let transaction = applied["transaction"]
        .as_str()
        .expect("a transaction id, so the change can be undone")
        .to_owned();
    assert!(transaction.starts_with("txn_"), "{transaction}");
    let created = applied["created"][0].as_str().unwrap().to_owned();

    // It is really there, and the journal says who did it.
    let layers = structured(&client.call_tool(call("list_layers", None)).await.unwrap());
    let layers = layers["layers"].as_array().unwrap();
    assert!(layers.iter().any(|layer| layer["id"] == created.as_str()));

    let history = structured(&client.call_tool(call("get_history", None)).await.unwrap());
    assert_eq!(history["position"], 1);
    assert_eq!(history["entries"][0]["actor"]["kind"], "agent");
    assert_eq!(history["entries"][0]["actor"]["detail"], "the exit test");
    assert_eq!(history["entries"][0]["transaction"], transaction.as_str());

    // A stale version is refused, and changes nothing.
    let stale = client
        .call_tool(call(
            "move_layer",
            args(json!({ "layerId": created, "dx": 5.0, "dy": 5.0, "expectedVersion": 0 })),
        ))
        .await
        .expect_err("a stale version must be refused");
    assert!(
        format!("{stale:?}").contains("versionConflict"),
        "{stale:?}"
    );

    // **Reversible**: undo puts the document back byte for byte, and the
    // version follows the history position back to where it was.
    let undone = structured(&client.call_tool(call("undo", None)).await.unwrap());
    assert_eq!(undone["version"], 0);
    assert!(
        undone["transaction"].is_some_and_str(),
        "an undo is itself a transaction, and says which"
    );
    assert_eq!(
        document_bytes(&root),
        before,
        "undo must restore the document byte for byte"
    );

    // And redo brings it back.
    client.call_tool(call("redo", None)).await.unwrap();
    let layers = structured(&client.call_tool(call("list_layers", None)).await.unwrap());
    assert!(layers["layers"]
        .as_array()
        .unwrap()
        .iter()
        .any(|layer| layer["id"] == created.as_str()));

    // Export lands inside the project, wherever the client would rather it
    // went.
    let exported = structured(
        &client
            .call_tool(call("export_document", args(json!({ "name": "final" }))))
            .await
            .unwrap(),
    );
    assert_eq!(exported["path"], "exports/final.png");
    assert!(root.join("projects/poster/exports/final.png").is_file());
    assert!(exported["bytes"].as_u64().unwrap() > 0);

    for hostile in ["../escape", "a/b", ".hidden", "with space"] {
        let refused = client
            .call_tool(call("export_document", args(json!({ "name": hostile }))))
            .await
            .expect_err("an export name that is a path must be refused");
        assert!(
            format!("{refused:?}").contains("invalidExportName"),
            "{hostile}: {refused:?}"
        );
    }

    client.cancel().await.unwrap();
}

/// MVP criterion 11 — protected and locked layers refuse every agent tool.
#[tokio::test]
async fn protected_and_locked_layers_refuse_every_mutating_tool() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let before = document_bytes(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    // Every mutating tool that can name a layer, aimed at the protected one.
    let attempts: Vec<(&'static str, Value)> = vec![
        (
            "update_layer",
            json!({ "layerId": PROTECTED, "text": "hijacked" }),
        ),
        (
            "update_layer",
            json!({ "layerId": PROTECTED, "opacity": 0.1 }),
        ),
        (
            "move_layer",
            json!({ "layerId": PROTECTED, "dx": 10.0, "dy": 10.0 }),
        ),
        (
            "resize_layer",
            json!({ "layerId": PROTECTED, "width": 10.0, "height": 10.0 }),
        ),
        (
            "rotate_layer",
            json!({ "layerId": PROTECTED, "degrees": 45.0 }),
        ),
        ("reorder_layer", json!({ "layerId": PROTECTED, "index": 0 })),
        ("delete_layer", json!({ "layerId": PROTECTED })),
        (
            "set_layer_visible",
            json!({ "layerId": PROTECTED, "value": false }),
        ),
        (
            "set_layer_locked",
            json!({ "layerId": PROTECTED, "value": true }),
        ),
        (
            "rename_layer",
            json!({ "layerId": PROTECTED, "name": "mine now" }),
        ),
        ("ungroup_layer", json!({ "layerId": GROUP })),
        ("delete_layer", json!({ "layerId": GROUP })),
        (
            "align_layers",
            json!({ "layerIds": [PROTECTED, PLAIN], "edge": "left" }),
        ),
        (
            "center_on_canvas",
            json!({ "layerIds": [PROTECTED], "axis": "both" }),
        ),
        (
            "distribute_layers",
            json!({ "layerIds": [PROTECTED, PLAIN], "axis": "horizontal" }),
        ),
        (
            "snap_layer",
            json!({ "layerId": PROTECTED, "edge": "left" }),
        ),
    ];

    for (tool, arguments) in &attempts {
        let result = client.call_tool(call(tool, args(arguments.clone()))).await;
        // A refusal comes back as a tool error carrying `operationRefused` —
        // the same machine-readable code the HTTP API reports.
        let error = result.expect_err(&format!(
            "{tool} with {arguments} was allowed to touch a protected layer"
        ));
        let text = format!("{error:?}");
        assert!(
            text.contains("operationRefused"),
            "{tool}: refused, but not as a typed refusal: {text}"
        );
        assert!(
            text.contains("protected") || text.contains("locked"),
            "{tool}: the message should say why: {text}"
        );
        assert_eq!(
            document_bytes(&root),
            before,
            "{tool} with {arguments} changed the document"
        );
    }

    // Duplicating is the one thing that is *not* refused, and should not be:
    // it does not touch the original. What matters is that the copy is
    // protected too, so an agent cannot obtain an editable clone of the brand.
    let copied = structured(
        &client
            .call_tool(call(
                "duplicate_layer",
                args(json!({ "layerId": PROTECTED })),
            ))
            .await
            .expect("duplicating does not modify the original"),
    );
    let copy = copied["created"][0].as_str().unwrap().to_owned();
    let duplicate = structured(
        &client
            .call_tool(call("get_layer", args(json!({ "layerId": copy }))))
            .await
            .unwrap(),
    );
    assert_eq!(
        duplicate["protected"], true,
        "a copy of a protected layer must be protected too"
    );
    let refused = client
        .call_tool(call(
            "update_layer",
            args(json!({ "layerId": copy, "text": "mine" })),
        ))
        .await
        .expect_err("the copy is protected, so it refuses changes as well");
    assert!(format!("{refused:?}").contains("operationRefused"));

    // Put the document back where the rest of this test expects it.
    client.call_tool(call("undo", None)).await.unwrap();
    let before = document_bytes(&root);

    // A locked layer refuses ordinary changes as well.
    for (tool, arguments) in [
        (
            "move_layer",
            json!({ "layerId": LOCKED, "dx": 5.0, "dy": 5.0 }),
        ),
        ("update_layer", json!({ "layerId": LOCKED, "text": "nope" })),
        ("delete_layer", json!({ "layerId": LOCKED })),
    ] {
        let error = client
            .call_tool(call(tool, args(arguments.clone())))
            .await
            .expect_err(&format!("{tool} was allowed to touch a locked layer"));
        assert!(
            format!("{error:?}").contains("operationRefused"),
            "{tool}: {error:?}"
        );
        assert_eq!(
            document_bytes(&root),
            before,
            "{tool} changed a locked layer"
        );
    }

    // Nothing above was a false negative: the same tools work on an ordinary
    // layer, so the refusals were about the flags and not about the calls.
    let moved = structured(
        &client
            .call_tool(call(
                "move_layer",
                args(json!({ "layerId": PLAIN, "dx": 5.0, "dy": 5.0 })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(moved["changed"][0], PLAIN);
    assert_ne!(document_bytes(&root), before);

    // And there is still no tool that can clear `protected`.
    let tools = client.list_all_tools().await.unwrap();
    let names: Vec<&str> = tools.iter().map(|tool| tool.name.as_ref()).collect();
    for forbidden in ["set_layer_protected", "set_protected", "unprotect_layer"] {
        assert!(
            !names.contains(&forbidden),
            "{forbidden} must not exist: an agent that can unprotect a layer \
             is not held by protection at all"
        );
    }

    client.cancel().await.unwrap();
}

/// An SVG asset in the project, drawing text in a family nothing has.
///
/// Imported through the library before the server starts, because importing a
/// file from a path is deliberately not something a tool does.
fn import_svg_asset(root: &Path) -> String {
    let directory = root.join("projects/poster");
    let source_dir = tempfile::tempdir().unwrap();
    let source = source_dir.path().join("badge.svg");
    std::fs::write(
        &source,
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"50\">\
         <rect width=\"100\" height=\"50\" fill=\"#c8102e\"/>\
         <text x=\"6\" y=\"30\" font-family=\"Nowhere Sans\" font-size=\"16\">new</text>\
         </svg>",
    )
    .unwrap();

    let mut ids = SequentialIdSource::new();
    let asset = assemblash_core::storage::import_asset(&directory, &source, &mut ids).unwrap();
    let id = asset.id.to_string();

    let mut document = assemblash_core::storage::load(&directory).unwrap();
    document.assets.push(asset);
    assemblash_core::storage::save(&document, &directory).unwrap();
    id
}

/// The document as it is on disk, for computing an expected answer the way the
/// other surfaces compute theirs.
fn document_on_disk(root: &Path) -> Document {
    assemblash_core::storage::load(&root.join("projects/poster")).unwrap()
}

/// A layer of a document state response, by id.
fn layer_of(state: &Value, id: &str) -> Value {
    fn find(layers: &[Value], id: &str) -> Option<Value> {
        for layer in layers {
            if layer["id"] == id {
                return Some(layer.clone());
            }
            if let Some(children) = layer["children"].as_array() {
                if let Some(found) = find(children, id) {
                    return Some(found);
                }
            }
        }
        None
    }
    find(state["document"]["layers"].as_array().unwrap(), id)
        .unwrap_or_else(|| panic!("no layer {id} in {state:#?}"))
}

/// `add_svg_layer` draws an asset that is already in the document.
///
/// The image tool's twin, and refused in the same place when the asset was
/// never imported — there is still no tool that reads a file from a path.
#[tokio::test]
async fn add_svg_layer_draws_an_imported_asset() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let asset = import_svg_asset(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    let before = document_bytes(&root);
    let dry = structured(
        &client
            .call_tool(call(
                "add_svg_layer",
                args(json!({
                    "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0,
                    "asset": asset,
                    "fit": "cover",
                    "dryRun": true
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(dry["dryRun"], true);
    assert_eq!(
        document_bytes(&root),
        before,
        "a dry run must change nothing"
    );

    let applied = structured(
        &client
            .call_tool(call(
                "add_svg_layer",
                args(json!({
                    "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0,
                    "asset": asset,
                    "fit": "cover",
                    "name": "the badge"
                })),
            ))
            .await
            .unwrap(),
    );
    let created = applied["created"][0].as_str().unwrap().to_owned();

    let state = structured(
        &client
            .call_tool(call("get_document_state", None))
            .await
            .unwrap(),
    );
    let layer = layer_of(&state, &created);
    assert_eq!(layer["type"], "svg");
    assert_eq!(layer["asset"], asset.as_str());
    assert_eq!(layer["fit"], "cover");
    assert_eq!(layer["name"], "the badge");

    // An asset nobody imported is refused by the operation layer, naming it.
    let refused = client
        .call_tool(call(
            "add_svg_layer",
            args(json!({
                "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0,
                "asset": "asset_00000000000000000000000099"
            })),
        ))
        .await
        .expect_err("an asset that is not in the document must be refused");
    let text = format!("{refused:?}");
    assert!(text.contains("operationRefused"), "{text}");
    assert!(
        text.contains("asset_00000000000000000000000099"),
        "the refusal should name the asset asked for: {text}"
    );

    client.cancel().await.unwrap();
}

/// `update_layer` sets line height, the one `UpdateLayer` field it omitted.
#[tokio::test]
async fn update_layer_sets_line_height() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    let changed = structured(
        &client
            .call_tool(call(
                "update_layer",
                args(json!({ "layerId": PLAIN, "lineHeight": 2.5 })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(changed["changed"][0], PLAIN);

    let state = structured(
        &client
            .call_tool(call("get_document_state", None))
            .await
            .unwrap(),
    );
    assert_eq!(
        layer_of(&state, PLAIN)["lineHeight"],
        2.5,
        "the one property the MCP update could not reach"
    );

    // And it is a change like any other: undo puts it back.
    client.call_tool(call("undo", None)).await.unwrap();
    let state = structured(
        &client
            .call_tool(call("get_document_state", None))
            .await
            .unwrap(),
    );
    assert_eq!(layer_of(&state, PLAIN)["lineHeight"], 1.2);

    client.cancel().await.unwrap();
}

/// `render_document` returns exactly what `GET .../preview.svg` serves.
#[tokio::test]
async fn render_document_returns_the_svg_the_http_preview_serves() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let client = connect(&root).await;
    let rendered = structured(
        &client
            .call_tool(call(
                "render_document",
                args(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    let svg = rendered["svg"].as_str().expect("SVG source").to_owned();
    assert_eq!(rendered["width"], 400);
    assert_eq!(rendered["height"], 300);

    // The expected answer is produced by the function the HTTP route calls, on
    // the document that is on disk, so the two surfaces cannot drift.
    let workspace = Workspace::open_or_create(&root).unwrap();
    let store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    let expected = assemblash_server::render::svg_for(
        &document_on_disk(&root),
        &root.join("projects/poster"),
        &store,
    )
    .unwrap();
    assert_eq!(
        svg.as_bytes(),
        expected.bytes.as_slice(),
        "MCP and HTTP must serve the same SVG"
    );

    client.cancel().await.unwrap();
}

/// `find_overlaps` reports the pairs the HTTP route and the command report.
#[tokio::test]
async fn find_overlaps_matches_the_http_route() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    // Two layers that certainly overlap, added through the tools.
    for y in [10.0_f64, 20.0] {
        client
            .call_tool(call(
                "add_text_layer",
                args(json!({
                    "x": 40.0, "y": y, "width": 120.0, "height": 60.0,
                    "text": "on top", "fontFamily": "Noto Sans", "fontSize": 12.0
                })),
            ))
            .await
            .unwrap();
    }

    let document = document_on_disk(&root);
    let ids = assemblash_core::layout::all_layer_ids(&document);
    let expected = assemblash_core::layout::find_overlaps(&document, &ids).unwrap();
    assert!(!expected.is_empty(), "the fixture should overlap somewhere");

    let reported = structured(&client.call_tool(call("find_overlaps", None)).await.unwrap());
    assert_eq!(
        reported["pairs"],
        serde_json::to_value(&expected).unwrap(),
        "MCP must report the same pairs, in the same order"
    );

    // Narrowing works the way the route's `?layers=` does.
    let narrowed = structured(
        &client
            .call_tool(call(
                "find_overlaps",
                args(json!({ "layerIds": [PLAIN, LOCKED] })),
            ))
            .await
            .unwrap(),
    );
    let chosen = vec![LayerId::new(PLAIN), LayerId::new(LOCKED)];
    assert_eq!(
        narrowed["pairs"],
        serde_json::to_value(assemblash_core::layout::find_overlaps(&document, &chosen).unwrap())
            .unwrap()
    );

    // A layer that is not there is refused, not answered about.
    let refused = client
        .call_tool(call(
            "find_overlaps",
            args(json!({ "layerIds": ["layer_00000000000000000000000099"] })),
        ))
        .await
        .expect_err("a layer that does not exist must be refused");
    assert!(
        format!("{refused:?}").contains("operationRefused"),
        "{refused:?}"
    );

    client.cancel().await.unwrap();
}

/// `create_project` makes a project the other tools can then use.
#[tokio::test]
async fn create_project_makes_an_openable_project() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let client = connect(&root).await;
    let made = structured(
        &client
            .call_tool(call(
                "create_project",
                args(json!({
                    "project": "flyer",
                    "width": 320.0,
                    "height": 180.0,
                    "background": "#101820",
                    "name": "Made by an agent"
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(made["id"], "flyer");
    assert_eq!(made["version"], 0);
    assert_eq!(made["layers"], 0);

    // It is on disk, with the canvas it was asked for.
    let document = assemblash_core::storage::load(&root.join("projects/flyer")).unwrap();
    assert_eq!(document.canvas.width, 320.0);
    assert_eq!(document.canvas.height, 180.0);
    assert_eq!(
        document.canvas.background.as_ref().map(Color::as_str),
        Some("#101820")
    );

    // And the rest of the server can see it: listed, opened, and written to.
    let projects = structured(&client.call_tool(call("list_projects", None)).await.unwrap());
    let ids: Vec<&str> = projects["projects"]
        .as_array()
        .unwrap()
        .iter()
        .map(|project| project["id"].as_str().unwrap())
        .collect();
    assert!(ids.contains(&"flyer"), "{ids:?}");

    let opened = structured(
        &client
            .call_tool(call("open_project", args(json!({ "project": "flyer" }))))
            .await
            .unwrap(),
    );
    assert_eq!(opened["project"], "flyer");
    client
        .call_tool(call(
            "add_text_layer",
            args(json!({
                "x": 10.0, "y": 10.0, "width": 200.0, "height": 40.0,
                "text": "hello", "fontFamily": "Noto Sans", "fontSize": 18.0
            })),
        ))
        .await
        .expect("a new project takes changes like any other");

    // A name that is really a path never reaches the filesystem, and a name
    // that is taken is refused rather than overwriting a project.
    let escaped = client
        .call_tool(call(
            "create_project",
            args(json!({ "project": "../../etc", "width": 10.0, "height": 10.0 })),
        ))
        .await
        .expect_err("a path-shaped project name must be refused");
    assert!(
        format!("{escaped:?}").contains("invalidProjectId"),
        "{escaped:?}"
    );
    let taken = client
        .call_tool(call(
            "create_project",
            args(json!({ "project": "poster", "width": 10.0, "height": 10.0 })),
        ))
        .await
        .expect_err("a project that already exists must not be overwritten");
    assert!(!format!("{taken:?}").is_empty());

    client.cancel().await.unwrap();
}

/// `export_document` reports what the export noticed (FR-11).
///
/// Advisory: the file is written either way, and the warnings never change a
/// pixel. The same three producers the CLI and the HTTP API report.
#[tokio::test]
async fn export_document_reports_export_warnings() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let asset = import_svg_asset(&root);

    let client = connect(&root).await;
    client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .unwrap();

    // Nothing to say yet, and the field is there anyway.
    let quiet = structured(
        &client
            .call_tool(call("export_document", args(json!({ "name": "quiet" }))))
            .await
            .unwrap(),
    );
    assert_eq!(
        quiet["warnings"],
        json!([]),
        "warnings is always present, empty when there is nothing to say"
    );

    // An SVG asset drawing text in a family nothing loaded: the DEF-2 symptom,
    // made loud rather than fixed.
    let added = structured(
        &client
            .call_tool(call(
                "add_svg_layer",
                args(json!({
                    "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0,
                    "asset": asset
                })),
            ))
            .await
            .unwrap(),
    );
    let created = added["created"][0].as_str().unwrap().to_owned();

    let noisy = structured(
        &client
            .call_tool(call("export_document", args(json!({ "name": "noisy" }))))
            .await
            .unwrap(),
    );
    let warnings = noisy["warnings"].as_array().unwrap();
    assert_eq!(warnings.len(), 1, "{warnings:#?}");
    assert_eq!(warnings[0]["code"], "svgAssetTextWithoutFont");
    assert_eq!(warnings[0]["layerId"], created.as_str());
    assert!(warnings[0]["message"]
        .as_str()
        .unwrap()
        .contains("Nowhere Sans"));

    // Advisory: the file was written regardless.
    assert_eq!(noisy["path"], "exports/noisy.png");
    assert!(root.join("projects/poster/exports/noisy.png").is_file());

    client.cancel().await.unwrap();
}

/// Convenience for asserting a JSON value is a non-empty string.
trait IsSomeStr {
    fn is_some_and_str(&self) -> bool;
}

impl IsSomeStr for Value {
    fn is_some_and_str(&self) -> bool {
        self.as_str().is_some_and(|text| !text.is_empty())
    }
}
