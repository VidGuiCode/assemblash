//! The end-to-end smoke test PRD §17 requires, on every target CI runs.
//!
//! > A local smoke test MUST create a document, add text and image layers,
//! > save it, reload it, request a preview, apply one MCP mutation, undo it,
//! > and export a PNG.
//!
//! > No public release should be described as working until this smoke test
//! > has run successfully on the target development environments.
//!
//! Every step goes through the **binary**, not the library, and the MCP step
//! goes through a real protocol conversation with a second process — because
//! "apply one MCP mutation" is a claim about the MCP server, and calling a
//! Rust function would not test it.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::Command;

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
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

/// A 2x2 PNG to import, so the image-layer step has something real.
fn write_png(path: &Path) {
    let file = std::fs::File::create(path).unwrap();
    let mut encoder = png::Encoder::new(std::io::BufWriter::new(file), 2, 2);
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    let mut writer = encoder.write_header().unwrap();
    writer
        .write_image_data(&[
            220, 40, 40, 255, 40, 80, 220, 255, 40, 80, 220, 255, 220, 40, 40, 255,
        ])
        .unwrap();
}

/// One MCP mutation, over a real stdio conversation with a real child process.
///
/// Hand-rolled rather than through a client library: this crate ships the
/// binary and should not take a protocol dependency to test it. The framing is
/// newline-delimited JSON-RPC, which is what MCP over stdio is.
fn one_mcp_mutation(workspace: &Path, project: &str, layer_text: &str) -> String {
    use std::io::{BufRead as _, BufReader, Write as _};

    let mut child = Command::new(binary())
        .args(["mcp", "--workspace"])
        .arg(workspace)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .expect("the MCP server starts");

    let mut input = child.stdin.take().expect("stdin");
    let mut output = BufReader::new(child.stdout.take().expect("stdout"));

    let send = |input: &mut std::process::ChildStdin, value: serde_json::Value| {
        writeln!(input, "{value}").expect("write");
        input.flush().expect("flush");
    };
    let mut receive = || {
        let mut line = String::new();
        loop {
            line.clear();
            let read = output.read_line(&mut line).expect("read");
            assert!(read > 0, "the server closed the connection");
            if line.trim().is_empty() {
                continue;
            }
            return serde_json::from_str::<serde_json::Value>(&line)
                .unwrap_or_else(|e| panic!("not a protocol frame ({e}): {line}"));
        }
    };

    send(
        &mut input,
        serde_json::json!({
            "jsonrpc": "2.0", "id": 1, "method": "initialize",
            "params": {
                "protocolVersion": "2025-06-18",
                "capabilities": {},
                "clientInfo": { "name": "smoke test", "version": "1.0.0" }
            }
        }),
    );
    let initialized = receive();
    assert_eq!(
        initialized["result"]["serverInfo"]["name"], "assemblash",
        "{initialized}"
    );
    send(
        &mut input,
        serde_json::json!({ "jsonrpc": "2.0", "method": "notifications/initialized" }),
    );

    send(
        &mut input,
        serde_json::json!({
            "jsonrpc": "2.0", "id": 2, "method": "tools/call",
            "params": {
                "name": "add_text_layer",
                "arguments": {
                    "project": project,
                    "x": 20.0, "y": 150.0, "width": 360.0, "height": 60.0,
                    "text": layer_text,
                    "fontFamily": "Noto Sans",
                    "fontSize": 28.0,
                    "actor": "the smoke test"
                }
            }
        }),
    );
    let applied = receive();
    let structured = &applied["result"]["structuredContent"];
    let transaction = structured["transaction"]
        .as_str()
        .unwrap_or_else(|| panic!("no transaction id in {applied}"))
        .to_owned();

    drop(input);
    let finished = child.wait_with_output().expect("the server exits");
    // stdio discipline: the protocol owns standard output. Every line of it
    // parsed above, and anything the server had to say went to stderr.
    assert!(
        finished.status.success() || finished.status.code().is_none(),
        "the MCP server exited badly: {}",
        String::from_utf8_lossy(&finished.stderr)
    );

    transaction
}

/// PRD §17, start to finish.
#[test]
fn the_end_to_end_smoke_test() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = scratch.path().join("workspace");
    let workspace_arg = workspace.to_str().unwrap();

    // A workspace, and a font, because a document with text and no font is not
    // renderable and this test renders.
    run(&["workspace", "--workspace", workspace_arg]);
    run(&[
        "font",
        "add",
        font_fixture().to_str().unwrap(),
        "--license",
        "OFL-1.1",
        "--font-store",
        workspace.join("fonts").to_str().unwrap(),
    ]);

    // 1. Create a document.
    let project = workspace.join("projects").join("smoke");
    let project_arg = project.to_str().unwrap();
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
        "smoke",
    ]);
    assert!(document_id.starts_with("doc_"), "{document_id}");

    // 2. Add text and image layers.
    run(&[
        "add-text",
        project_arg,
        "--text",
        "smoke test",
        "--font",
        "Noto Sans",
        "--size",
        "32",
        "--x",
        "20",
        "--y",
        "20",
        "--width",
        "360",
        "--height",
        "60",
    ]);
    let source = scratch.path().join("swatch.png");
    write_png(&source);
    run(&[
        "add-image",
        project_arg,
        "--file",
        source.to_str().unwrap(),
        "--x",
        "20",
        "--y",
        "90",
        "--width",
        "80",
        "--height",
        "40",
    ]);

    // 3. Save and reload: `show` reads the document back from disk and
    //    validates it before printing.
    let shown = run(&["show", project_arg]);
    let reloaded: serde_json::Value = serde_json::from_str(&shown).expect("valid JSON");
    assert_eq!(reloaded["layers"].as_array().unwrap().len(), 2);
    assert_eq!(reloaded["version"], 2);

    // 4. Request a preview.
    let preview = scratch.path().join("preview.png");
    run(&[
        "export",
        project_arg,
        "--out",
        preview.to_str().unwrap(),
        "--font-store",
        workspace.join("fonts").to_str().unwrap(),
    ]);
    assert!(preview.is_file());

    // 5. Apply one MCP mutation — through the protocol, to a second process.
    let transaction = one_mcp_mutation(&workspace, "smoke", "added over MCP");
    assert!(transaction.starts_with("txn_"), "{transaction}");
    let after_mcp = run(&["show", project_arg]);
    let after_mcp: serde_json::Value = serde_json::from_str(&after_mcp).unwrap();
    assert_eq!(after_mcp["layers"].as_array().unwrap().len(), 3);

    // 6. Undo it, and the document is what it was, byte for byte.
    let before_mcp = serde_json::to_string(&reloaded).unwrap();
    run(&["undo", project_arg]);
    let undone = run(&["show", project_arg]);
    let undone: serde_json::Value = serde_json::from_str(&undone).unwrap();
    assert_eq!(
        serde_json::to_string(&undone).unwrap(),
        before_mcp,
        "undo must restore the document exactly"
    );

    // 7. Export a PNG.
    let exported = scratch.path().join("smoke.png");
    run(&[
        "export",
        project_arg,
        "--out",
        exported.to_str().unwrap(),
        "--font-store",
        workspace.join("fonts").to_str().unwrap(),
    ]);
    let bytes = std::fs::read(&exported).unwrap();
    assert_eq!(&bytes[1..4], b"PNG");
    assert!(bytes.len() > 1000, "the export looks empty");

    // And the two exports of the same document are identical, which is the
    // determinism the whole project is built on.
    assert_eq!(std::fs::read(&preview).unwrap(), bytes);
}
