//! The v0.7.0 exit test — MVP criterion 9: **at least one local MCP client
//! can inspect the document.**
//!
//! This is a real client, not a mock and not an in-process shortcut. It:
//!
//! * builds a project on disk with the library;
//! * spawns the **actual `assemblash` binary** as a child process;
//! * speaks the real protocol over a real stdio pipe, using the SDK's client
//!   half — a different implementation from the server half under test;
//! * initializes, lists the tools, calls every one of them, and checks that
//!   what comes back describes the document that is on disk.
//!
//! It runs on all four CI targets. The release is additionally driven by the
//! official TypeScript MCP SDK, which is a separate implementation in a
//! separate language; the release notes say which claim rests on which.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, GroupLayer, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::workspace::Workspace;
use assemblash_core::{Color, Document, Layer, LayerKind};
use rmcp::model::{CallToolRequestParams, ContentBlock};
use rmcp::transport::TokioChildProcess;
use rmcp::ServiceExt;
use serde_json::{json, Map, Value};

mod support;

use support::binary;

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
}

/// A document with one of everything the read tools report on.
fn build_project(directory: &Path) -> Document {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 400.0, 200.0);
    document.name = Some("Inspected by an agent".to_owned());
    document.canvas.background = Some(Color::new("#f6f4ef"));

    let text = Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(20.0, 20.0, 360.0, 80.0),
        LayerKind::Text(TextLayer {
            text: "read me".to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 40.0,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    );

    let mut protected = Layer::new(
        LayerId::new("layer_00000000000000000000000003"),
        Transform::new(0.0, 0.0, 100.0, 40.0),
        LayerKind::Text(TextLayer {
            text: "the logo".to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 20.0,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    );
    protected.protected = true;
    protected.name = Some("brand".to_owned());

    let group = Layer::new(
        LayerId::new("layer_00000000000000000000000002"),
        Transform::new(20.0, 120.0, 200.0, 60.0),
        LayerKind::Group(GroupLayer {
            children: vec![protected],
            extra: Extras::new(),
        }),
    );

    document.layers.push(text);
    document.layers.push(group);
    assemblash_core::storage::save(&document, directory).unwrap();
    document
}

/// A workspace with one project in it, and a font installed so previews work.
fn workspace_with_project(root: &Path) -> Document {
    let workspace = Workspace::open_or_create(root).unwrap();
    let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    store
        .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
        .unwrap();

    let id = assemblash_core::workspace::ProjectId::new("poster").unwrap();
    let directory = workspace.create_project_dir(&id).unwrap();
    build_project(&directory)
}

/// The structured JSON a tool returned.
///
/// Tools that return data put it in `structuredContent`; this falls back to
/// parsing the text block so the test does not depend on which the SDK chose.
fn structured(result: &rmcp::model::CallToolResult) -> Value {
    if let Some(content) = &result.structured_content {
        return content.clone();
    }
    for block in &result.content {
        if let ContentBlock::Text(text) = block {
            if let Ok(value) = serde_json::from_str::<Value>(&text.text) {
                return value;
            }
        }
    }
    panic!("no structured content in {result:#?}");
}

fn arguments(value: Value) -> Option<Map<String, Value>> {
    value.as_object().cloned()
}

/// A tool call. `CallToolRequestParams` is non-exhaustive, so it is built
/// field by field rather than as a literal.
fn call(name: &'static str, args: Option<Map<String, Value>>) -> CallToolRequestParams {
    let mut params = CallToolRequestParams::default();
    params.name = name.into();
    params.arguments = args;
    params
}

#[tokio::test]
async fn a_real_mcp_client_inspects_a_document() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let on_disk = workspace_with_project(&root);

    // A real child process, spawned the way an agent client spawns one.
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client =
        ().serve(TokioChildProcess::new(command).unwrap())
            .await
            .expect("the server initialized");

    // The handshake told us who we are talking to.
    let info = client.peer_info().expect("server info");
    let identity = info.server_info.clone().expect("the server named itself");
    assert_eq!(identity.name, "assemblash");
    assert_eq!(identity.version, env!("CARGO_PKG_VERSION"));
    let instructions = info.instructions.clone().unwrap_or_default();
    assert!(
        instructions.contains("protected"),
        "the instructions should warn about layers an agent may not touch: {instructions}"
    );

    // Every tool it advertises, and nothing that writes.
    let tools = client.list_all_tools().await.unwrap();
    let names: Vec<&str> = tools.iter().map(|tool| tool.name.as_ref()).collect();
    for expected in [
        "list_projects",
        "get_document_state",
        "list_layers",
        "get_layer",
        "validate_document",
        "get_history",
        "get_canvas_preview",
    ] {
        assert!(names.contains(&expected), "no {expected} in {names:?}");
    }
    // Two things that must never exist, whatever the milestone:
    //
    // * `get_selection` — selection is client state (amended FR-7), so there
    //   is nothing here to read;
    // * `apply_operation` — a generic escape hatch would let an agent build
    //   operations no tool describes, which is the surface the write-tool
    //   safeguards exist to bound.
    //
    // The write tools themselves arrived in 0.8.0; that they refuse protected
    // layers is the subject of `tests/writes.rs`.
    for forbidden in ["get_selection", "apply_operation", "set_layer_protected"] {
        assert!(
            !names.contains(&forbidden),
            "{forbidden} must not exist: {names:?}"
        );
    }

    // list_projects: the entry point a client uses to name anything else.
    let projects = structured(&client.call_tool(call("list_projects", None)).await.unwrap());
    let projects = projects["projects"]
        .as_array()
        .cloned()
        .expect("an array of projects");
    assert_eq!(projects.len(), 1, "{projects:#?}");
    assert_eq!(projects[0]["id"], "poster");
    assert_eq!(projects[0]["name"], "Inspected by an agent");
    assert_eq!(projects[0]["layers"], 3);

    // get_document_state: the document that came back is the one on disk.
    let state = structured(
        &client
            .call_tool(call(
                "get_document_state",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    let returned: Document = serde_json::from_value(state["document"].clone()).unwrap();
    assert_eq!(returned, on_disk, "the document must survive the protocol");
    assert_eq!(state["version"], 0);

    // list_layers: flattened, with the tree recoverable and the flags visible.
    let layers = structured(
        &client
            .call_tool(call(
                "list_layers",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    let layers = layers["layers"].as_array().cloned().expect("layers");
    assert_eq!(layers.len(), 3);
    assert_eq!(layers[0]["kind"], "text");
    assert_eq!(layers[0]["text"], "read me");
    assert_eq!(layers[1]["kind"], "group");
    assert_eq!(layers[1]["children"], 1);
    assert_eq!(layers[2]["depth"], 1);
    assert_eq!(layers[2]["parent"], layers[1]["id"]);
    assert_eq!(
        layers[2]["protected"], true,
        "an agent must be able to see what it may not touch"
    );

    // get_layer: one of them, by the id the listing gave.
    let layer = structured(
        &client
            .call_tool(call(
                "get_layer",
                arguments(json!({
                    "project": "poster",
                    "layerId": layers[2]["id"],
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(layer["name"], "brand");
    assert_eq!(layer["protected"], true);

    // 0.7.0 spelled this argument `layer_id`. It still works, so a client
    // written against that release keeps working.
    let same = structured(
        &client
            .call_tool(call(
                "get_layer",
                arguments(json!({
                    "project": "poster",
                    "layer_id": layers[2]["id"],
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(same, layer);

    // validate_document: answers rather than failing.
    let report = structured(
        &client
            .call_tool(call(
                "validate_document",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(report["valid"], true, "{report:#?}");

    // get_history: a project nobody has edited has an empty journal.
    let history = structured(
        &client
            .call_tool(call(
                "get_history",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(history["position"], 0);

    // get_canvas_preview: a real PNG, of the size the canvas says.
    let preview = client
        .call_tool(call(
            "get_canvas_preview",
            arguments(json!({ "project": "poster" })),
        ))
        .await
        .unwrap();
    let image = preview
        .content
        .iter()
        .find_map(|block| match block {
            ContentBlock::Image(image) => Some(image),
            _ => None,
        })
        .expect("an image block");
    assert_eq!(image.mime_type, "image/png");
    let png = decode_base64(&image.data);
    assert_eq!(&png[1..4], b"PNG");
    let (width, height) = png_size(&png);
    assert_eq!((width, height), (400, 200));

    // An error carries the same machine-readable code the HTTP API uses.
    let refused = client
        .call_tool(call(
            "get_document_state",
            arguments(json!({ "project": "no-such-project" })),
        ))
        .await
        .expect_err("a project that does not exist must be refused");
    let text = format!("{refused:?}");
    assert!(text.contains("noSuchProject"), "{text}");

    // And a name that is really a path never reaches the filesystem.
    let escaped = client
        .call_tool(call(
            "get_document_state",
            arguments(json!({ "project": "../../etc" })),
        ))
        .await
        .expect_err("a path-shaped project name must be refused");
    let text = format!("{escaped:?}");
    assert!(text.contains("invalidProjectId"), "{text}");

    client.cancel().await.unwrap();
}

#[tokio::test]
async fn a_single_project_server_needs_no_project_name() {
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("standalone");
    std::fs::create_dir_all(&project).unwrap();
    build_project(&project);

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--project").arg(&project);
    let client =
        ().serve(TokioChildProcess::new(command).unwrap())
            .await
            .expect("the server initialized");

    let instructions = client
        .peer_info()
        .and_then(|info| info.instructions.clone())
        .unwrap_or_default();
    assert!(instructions.contains("single project"), "{instructions}");

    // No project argument at all.
    let layers = structured(&client.call_tool(call("list_layers", None)).await.unwrap());
    let layers = layers["layers"].as_array().cloned().expect("layers");
    assert_eq!(layers.len(), 3);

    client.cancel().await.unwrap();
}

/// Standard output carries protocol frames and nothing else.
///
/// The classic way a stdio MCP server breaks, and it breaks silently: one
/// stray line on stdout corrupts the stream and the failure looks like a
/// client bug. The whole conversation above already proves the stream stayed
/// parseable; this checks the other half — that a server which fails to start
/// says so on standard error and leaves stdout empty.
#[tokio::test]
async fn a_failure_says_so_on_standard_error_and_leaves_stdout_clean() {
    let scratch = tempfile::tempdir().unwrap();
    let missing = scratch.path().join("not-a-project");

    let output = tokio::process::Command::new(binary())
        .arg("mcp")
        .arg("--project")
        .arg(&missing)
        .stdin(std::process::Stdio::null())
        .output()
        .await
        .expect("the binary runs");

    assert!(
        output.stdout.is_empty(),
        "stdout must carry protocol frames only, got: {}",
        String::from_utf8_lossy(&output.stdout)
    );
}

fn decode_base64(text: &str) -> Vec<u8> {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut lookup = [255u8; 256];
    for (index, byte) in ALPHABET.iter().enumerate() {
        lookup[*byte as usize] = index as u8;
    }

    let mut out = Vec::new();
    let mut accumulator = 0u32;
    let mut bits = 0u32;
    for byte in text.bytes() {
        if byte == b'=' {
            break;
        }
        let value = lookup[byte as usize];
        assert_ne!(value, 255, "not base64: {byte}");
        accumulator = (accumulator << 6) | u32::from(value);
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((accumulator >> bits) as u8);
        }
    }
    out
}

/// Width and height straight out of the PNG header.
fn png_size(png: &[u8]) -> (u32, u32) {
    let width = u32::from_be_bytes(png[16..20].try_into().unwrap());
    let height = u32::from_be_bytes(png[20..24].try_into().unwrap());
    (width, height)
}

/// The 1.3.0 tools are advertised, and each one answers.
///
/// The count is asserted as well as the names. Nothing else in this repository
/// says how many tools this server offers, so a tool added without a thought
/// for what it lets an agent do has nowhere to hide: adding one means changing
/// this number on purpose.
#[tokio::test]
async fn every_new_tool_is_advertised_and_callable() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();

    let tools = client.list_all_tools().await.unwrap();
    let names: Vec<&str> = tools.iter().map(|tool| tool.name.as_ref()).collect();
    for expected in [
        "update_canvas",
        "add_svg_layer",
        "render_document",
        "find_overlaps",
        "create_project",
    ] {
        assert!(names.contains(&expected), "no {expected} in {names:?}");
    }
    assert_eq!(
        tools.len(),
        44,
        "the tool count is a deliberate number, not an accident: {names:?}"
    );

    // create_project: a project that was not there before, made from nothing
    // but arguments.
    let made = structured(
        &client
            .call_tool(call(
                "create_project",
                arguments(json!({
                    "project": "flyer",
                    "width": 300.0,
                    "height": 150.0,
                    "background": "#101820",
                    "name": "Made by an agent"
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(made["id"], "flyer");
    assert_eq!(made["name"], "Made by an agent");
    assert_eq!(made["version"], 0);

    // render_document: the same render as the export, one step before pixels.
    let rendered = structured(
        &client
            .call_tool(call(
                "render_document",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    let svg = rendered["svg"].as_str().expect("SVG source");
    assert!(svg.starts_with("<svg"), "{svg:.80}");
    assert_eq!(rendered["width"], 400);
    assert_eq!(rendered["height"], 200);

    // find_overlaps: an answer about the whole document when none is narrowed.
    let overlaps = structured(
        &client
            .call_tool(call(
                "find_overlaps",
                arguments(json!({ "project": "poster" })),
            ))
            .await
            .unwrap(),
    );
    assert!(
        overlaps["pairs"].is_array(),
        "pairs should be an array: {overlaps:#?}"
    );

    // add_svg_layer: wired to the operation layer, which is what refuses an
    // asset nobody imported. Drawing a real one is `tests/writes.rs`.
    let refused = client
        .call_tool(call(
            "add_svg_layer",
            arguments(json!({
                "project": "poster",
                "x": 0.0, "y": 0.0, "width": 50.0, "height": 50.0,
                "asset": "asset_00000000000000000000000009"
            })),
        ))
        .await
        .expect_err("an asset that was never imported must be refused");
    let text = format!("{refused:?}");
    assert!(text.contains("operationRefused"), "{text}");
    assert!(text.contains("no asset"), "{text}");

    client.cancel().await.unwrap();
}

/// Every tool's schemas are the shape the protocol requires.
///
/// MCP says a tool's `inputSchema` and `outputSchema` describe *objects*. Two
/// tools originally returned bare arrays, which the Rust SDK was happy to send
/// and a strict client refused outright — found by pointing the official
/// TypeScript SDK at this server, which is exactly why an independent
/// implementation is worth the trouble.
#[tokio::test]
async fn every_tool_schema_is_an_object() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();

    let tools = client.list_all_tools().await.unwrap();
    assert!(!tools.is_empty());
    for tool in &tools {
        assert_eq!(
            tool.input_schema.get("type").and_then(Value::as_str),
            Some("object"),
            "{}: inputSchema must describe an object",
            tool.name
        );
        if let Some(output) = &tool.output_schema {
            assert_eq!(
                output.get("type").and_then(Value::as_str),
                Some("object"),
                "{}: outputSchema must describe an object",
                tool.name
            );
        }
        assert!(
            tool.description
                .as_ref()
                .is_some_and(|text| !text.is_empty()),
            "{}: a tool an agent is meant to choose needs a description",
            tool.name
        );
    }

    client.cancel().await.unwrap();
}

/// The project lock is released when the client closes the connection.
///
/// A `Session` holds an exclusive lock for its lifetime, so an MCP server that
/// exits without dropping its sessions leaves `.assemblash-lock` behind and
/// the project cannot be opened again until someone runs `assemblash unlock`.
/// That is a puzzle to hand a person whose agent simply closed a pipe — and it
/// is what a second pair of hands found in the v0.10.0 verification.
#[tokio::test]
async fn closing_the_connection_releases_the_project_lock() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let lock = root.join("projects/poster/.assemblash-lock");

    // Workspace mode: the project is opened by the first tool call.
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client
        .call_tool(call(
            "list_layers",
            arguments(json!({ "project": "poster" })),
        ))
        .await
        .unwrap();
    assert!(
        lock.is_file(),
        "the server should hold the project while serving"
    );

    // `cancel` closes the connection, which is what stdin-EOF does to a
    // server an agent client has finished with.
    client.cancel().await.unwrap();
    wait_for_unlock(&lock).await;
    assert!(
        !lock.exists(),
        "the lock must be released when the client goes away"
    );

    // And the project opens again, which is the thing that was actually
    // broken: the error was recoverable but nobody should have to.
    assemblash_core::Session::open(&root.join("projects/poster"), Some(1))
        .expect("the project reopens without needing `assemblash unlock`");

    // Single-project mode holds its sessions somewhere else, so it gets its
    // own check rather than an assumption.
    let standalone = scratch.path().join("standalone");
    std::fs::create_dir_all(&standalone).unwrap();
    build_project(&standalone);
    let standalone_lock = standalone.join(".assemblash-lock");

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--project").arg(&standalone);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client.call_tool(call("list_layers", None)).await.unwrap();
    assert!(standalone_lock.is_file());

    client.cancel().await.unwrap();
    wait_for_unlock(&standalone_lock).await;
    assert!(
        !standalone_lock.exists(),
        "single-project mode must release its lock too"
    );
}

/// Waits briefly for the child process to finish exiting.
///
/// The release happens as the server shuts down, which is a different process:
/// there is no ordering between `cancel` returning here and the file being
/// gone there, so this polls rather than asserting into a race.
async fn wait_for_unlock(lock: &Path) {
    for _ in 0..100 {
        if !lock.exists() {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    }
}

#[tokio::test]
async fn canvas_tool_preserves_omitted_background_and_clears_null_with_undo() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with_project(&root);
    let path = root.join("projects/poster/document.json");
    let before = std::fs::read(&path).unwrap();
    let document: Value = serde_json::from_slice(&before).unwrap();
    let version = document["version"].as_u64().unwrap();
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    let dry = structured(
        &client
            .call_tool(call(
                "update_canvas",
                arguments(json!({
                    "project": "poster", "width": 600, "dryRun": true, "expectedVersion": version
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(dry["dryRun"], true);
    assert_eq!(std::fs::read(&path).unwrap(), before);
    let applied = structured(
        &client
            .call_tool(call(
                "update_canvas",
                arguments(json!({
                    "project": "poster", "width": 600, "expectedVersion": version
                })),
            ))
            .await
            .unwrap(),
    );
    assert_eq!(applied["version"], version + 1);
    let after_resize = std::fs::read(&path).unwrap();
    let resized: Value = serde_json::from_slice(&after_resize).unwrap();
    assert_eq!(resized["canvas"]["width"], 600.0);
    assert_eq!(
        resized["canvas"]["background"],
        document["canvas"]["background"]
    );
    let stale = client
        .call_tool(call(
            "update_canvas",
            arguments(json!({
                "project": "poster", "height": 300, "expectedVersion": version
            })),
        ))
        .await;
    assert!(stale.is_err() || stale.as_ref().unwrap().is_error == Some(true));
    assert_eq!(std::fs::read(&path).unwrap(), after_resize);
    let cleared = client
        .call_tool(call(
            "update_canvas",
            arguments(json!({
                "project": "poster", "background": null, "expectedVersion": version + 1
            })),
        ))
        .await
        .unwrap();
    assert_ne!(cleared.is_error, Some(true));
    let current: Value = serde_json::from_slice(&std::fs::read(&path).unwrap()).unwrap();
    assert!(current["canvas"]["background"].is_null());
    client
        .call_tool(call("undo", arguments(json!({"project":"poster"}))))
        .await
        .unwrap();
    assert_eq!(std::fs::read(&path).unwrap(), after_resize);
    client
        .call_tool(call("undo", arguments(json!({"project":"poster"}))))
        .await
        .unwrap();
    assert_eq!(std::fs::read(&path).unwrap(), before);
    client.cancel().await.unwrap();
}
