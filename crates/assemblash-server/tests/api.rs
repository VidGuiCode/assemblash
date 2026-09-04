//! The v0.6.0 exit test, over a real socket.
//!
//! Three things the ladder asks for, each answered by running it rather than
//! reasoning about it:
//!
//! * **path-escape attempts are rejected** — through a project id, through an
//!   asset filename, and through an encoded separator;
//! * **a stale version gives a structured conflict** — and leaves the document
//!   alone;
//! * **first run creates a valid workspace**.
//!
//! Everything here goes through the HTTP surface. Nothing reaches into the
//! library to set a document up, because the point is whether the transport
//! preserves what the operation layer guarantees.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::workspace::{Workspace, CONFIG_FILE, FONTS_DIR, PROJECTS_DIR};
use assemblash_server::Server;
use serde_json::{json, Value};

/// A running server, and the scratch directory it works in.
struct Harness {
    base: String,
    _workspace: tempfile::TempDir,
    root: PathBuf,
}

impl Harness {
    /// Starts a server on its own thread and runtime.
    ///
    /// The tests themselves are ordinary synchronous code making blocking
    /// requests, so the server cannot share their thread — it would never get
    /// a chance to run between a request being written and the reply being
    /// waited for.
    fn start() -> Self {
        let directory = tempfile::tempdir().unwrap();
        let root = directory.path().join("workspace");
        let workspace = Workspace::open_or_create(&root).unwrap();

        let (send, receive) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async move {
                // Port 0: the OS picks, so tests never collide with each other
                // or with whatever else is running on the machine.
                let server = Server::bind(workspace, 0, Default::default())
                    .await
                    .unwrap();
                send.send(server.url()).unwrap();
                let _ = server.serve().await;
            });
        });

        let base = receive.recv().expect("the server started");
        assert!(
            base.starts_with("http://127.0.0.1:"),
            "the server must be loopback-only, got {base}"
        );
        Self {
            base,
            _workspace: directory,
            root,
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.base)
    }

    fn root(&self) -> &Path {
        &self.root
    }
}

/// A tiny blocking HTTP/1.1 client.
///
/// Hand-rolled rather than pulled in: the server's only dependency on an HTTP
/// client would otherwise be a test one, and every crate in a single-binary
/// product has to be licence-audited and shipped (R8).
mod http {
    #![allow(unreachable_pub)]

    use std::io::{Read as _, Write as _};
    use std::net::TcpStream;

    pub struct Response {
        pub status: u16,
        pub body: Vec<u8>,
    }

    impl Response {
        pub fn json(&self) -> serde_json::Value {
            serde_json::from_slice(&self.body).unwrap_or_else(|e| {
                panic!(
                    "body is not JSON ({e}): {}",
                    String::from_utf8_lossy(&self.body)
                )
            })
        }
    }

    pub fn request(
        method: &str,
        url: &str,
        content_type: Option<&str>,
        body: Option<&[u8]>,
    ) -> Response {
        let rest = url.strip_prefix("http://").expect("http url");
        let (authority, path) = match rest.find('/') {
            Some(index) => (&rest[..index], &rest[index..]),
            None => (rest, "/"),
        };

        let mut stream = TcpStream::connect(authority).expect("connect");
        let body = body.unwrap_or(&[]);
        let mut head = format!(
            "{method} {path} HTTP/1.1\r\nHost: {authority}\r\nConnection: close\r\n\
             Content-Length: {}\r\n",
            body.len()
        );
        if let Some(content_type) = content_type {
            head.push_str(&format!("Content-Type: {content_type}\r\n"));
        }
        head.push_str("\r\n");

        stream.write_all(head.as_bytes()).expect("write head");
        stream.write_all(body).expect("write body");
        stream.flush().expect("flush");

        let mut raw = Vec::new();
        stream.read_to_end(&mut raw).expect("read");

        let split = raw
            .windows(4)
            .position(|window| window == b"\r\n\r\n")
            .expect("headers end");
        let headers = String::from_utf8_lossy(&raw[..split]).into_owned();
        let status = headers
            .lines()
            .next()
            .and_then(|line| line.split_whitespace().nth(1))
            .and_then(|code| code.parse().ok())
            .expect("status line");

        let mut body = raw[split + 4..].to_vec();
        // `Connection: close` means the body may still be chunked, because
        // axum decides that, not us.
        if headers
            .to_ascii_lowercase()
            .contains("transfer-encoding: chunked")
        {
            body = dechunk(&body);
        }
        Response { status, body }
    }

    fn dechunk(mut input: &[u8]) -> Vec<u8> {
        let mut out = Vec::new();
        loop {
            let Some(end) = input.windows(2).position(|w| w == b"\r\n") else {
                break;
            };
            let size = usize::from_str_radix(String::from_utf8_lossy(&input[..end]).trim(), 16)
                .unwrap_or(0);
            if size == 0 {
                break;
            }
            let start = end + 2;
            out.extend_from_slice(&input[start..start + size]);
            input = &input[start + size + 2..];
        }
        out
    }

    pub fn get(url: &str) -> Response {
        request("GET", url, None, None)
    }

    pub fn post_json(url: &str, body: &serde_json::Value) -> Response {
        request(
            "POST",
            url,
            Some("application/json"),
            Some(body.to_string().as_bytes()),
        )
    }

    pub fn post_bytes(url: &str, content_type: &str, body: &[u8]) -> Response {
        request("POST", url, Some(content_type), Some(body))
    }
}

fn error_code(response: &http::Response) -> String {
    response.json()["error"]["code"]
        .as_str()
        .unwrap_or_default()
        .to_owned()
}

fn create_project(harness: &Harness, id: &str) -> Value {
    let response = http::post_json(
        &harness.url("/api/projects"),
        &json!({ "id": id, "width": 400.0, "height": 200.0, "background": "#ffffff" }),
    );
    assert_eq!(response.status, 201, "{}", response.json());
    response.json()
}

fn add_text(harness: &Harness, id: &str, family: &str) -> Value {
    let response = http::post_json(
        &harness.url(&format!("/api/projects/{id}/operations")),
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 10.0, "y": 10.0, "width": 380.0, "height": 80.0 },
                "type": "text",
                "text": "over http",
                "fontFamily": family,
                "fontSize": 32.0,
                "color": "#101820",
                "align": "left",
                "lineHeight": 1.2
            },
            "actor": { "kind": "agent", "name": "the test" }
        }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    response.json()
}

#[test]
fn first_run_creates_a_valid_workspace() {
    let harness = Harness::start();

    // Exit test, part three. This runs for real on Windows and Linux in CI;
    // the macOS location is a pure function of the environment and is unit
    // tested in `assemblash-core`, not executed, until macOS joins the matrix.
    assert!(harness.root().join(PROJECTS_DIR).is_dir());
    assert!(harness.root().join(FONTS_DIR).is_dir());
    assert!(harness.root().join(CONFIG_FILE).is_file());

    let version = http::get(&harness.url("/api/version")).json();
    assert_eq!(version["name"], "assemblash");
    assert_eq!(version["schemaVersion"], 1);

    // A workspace with nothing in it lists nothing, rather than failing.
    let projects = http::get(&harness.url("/api/projects")).json();
    assert_eq!(projects["projects"], json!([]));

    // And the store the workspace made is readable, and empty.
    assert_eq!(
        http::get(&harness.url("/api/fonts")).json()["families"],
        json!([])
    );
}

#[test]
fn a_project_round_trips_through_the_api() {
    let harness = Harness::start();

    let created = create_project(&harness, "poster");
    assert_eq!(created["id"], "poster");
    assert_eq!(created["version"], 0);
    assert_eq!(created["layers"], 0);

    let applied = add_text(&harness, "poster", "Noto Sans");
    assert_eq!(applied["version"], 1);
    assert_eq!(applied["created"].as_array().unwrap().len(), 1);
    let layer = applied["created"][0].as_str().unwrap().to_owned();

    let document = http::get(&harness.url("/api/projects/poster/document")).json();
    assert_eq!(document["version"], 1);
    assert_eq!(document["layers"][0]["id"], layer);
    assert_eq!(document["layers"][0]["text"], "over http");

    // The journal recorded who did it.
    let history = http::get(&harness.url("/api/projects/poster/history")).json();
    assert_eq!(history["position"], 1);
    assert_eq!(history["entries"][0]["actor"]["kind"], "agent");
    assert_eq!(history["entries"][0]["actor"]["detail"], "the test");

    assert_eq!(
        http::get(&harness.url("/api/projects/poster/validate")).json()["valid"],
        true
    );

    // Undo and redo, over HTTP, through the same history the CLI uses.
    let undone = http::post_json(&harness.url("/api/projects/poster/undo"), &json!({}));
    assert_eq!(undone.status, 200, "{}", undone.json());
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json()["layers"],
        json!([])
    );
    http::post_json(&harness.url("/api/projects/poster/redo"), &json!({}));
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json()["layers"][0]["id"],
        layer.as_str()
    );

    // The listing sees it.
    let listed = http::get(&harness.url("/api/projects")).json();
    assert_eq!(listed["projects"].as_array().unwrap().len(), 1);
    assert_eq!(listed["projects"][0]["id"], "poster");

    // Creating the same project twice is refused rather than overwriting.
    let again = http::post_json(
        &harness.url("/api/projects"),
        &json!({ "id": "poster", "width": 10.0, "height": 10.0 }),
    );
    assert_eq!(again.status, 409);
    assert_eq!(error_code(&again), "projectExists");
}

#[test]
fn a_stale_version_is_a_structured_conflict() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    add_text(&harness, "poster", "Noto Sans");

    let before = http::get(&harness.url("/api/projects/poster/document")).json();
    assert_eq!(before["version"], 1);

    // Exit test, part two: a write against a version that has moved on.
    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": { "op": "delete", "id": before["layers"][0]["id"] },
            "expectedVersion": 0
        }),
    );
    assert_eq!(response.status, 409);
    let body = response.json();
    assert_eq!(body["error"]["code"], "versionConflict");
    assert_eq!(body["error"]["details"]["expected"], 0);
    assert_eq!(body["error"]["details"]["actual"], 1);

    // And the refusal changed nothing.
    let after = http::get(&harness.url("/api/projects/poster/document")).json();
    assert_eq!(after, before);

    // The right version goes through.
    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": { "op": "delete", "id": before["layers"][0]["id"] },
            "expectedVersion": 1
        }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    assert_eq!(response.json()["version"], 2);
}

#[test]
fn a_dry_run_reports_without_changing_anything() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    add_text(&harness, "poster", "Noto Sans");
    let before = http::get(&harness.url("/api/projects/poster/document")).json();

    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": { "op": "delete", "id": before["layers"][0]["id"] },
            "dryRun": true
        }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    let body = response.json();
    assert_eq!(body["dryRun"], true);
    assert_eq!(body["removed"].as_array().unwrap().len(), 1);
    assert!(body["transaction"].is_null());

    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json(),
        before
    );
}

#[test]
fn an_operation_batch_is_atomic_and_undoes_in_one_step() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    let response = http::post_json(
        &harness.url("/api/projects/poster/operation-batches"),
        &json!({
            "expectedVersion": 0,
            "label": "Add heading and body",
            "actor": { "kind": "human", "name": "batch test" },
            "commands": [
                {
                    "op": "create",
                    "position": { "at": "root" },
                    "transform": { "x": 10.0, "y": 10.0, "width": 300.0, "height": 40.0 },
                    "type": "text",
                    "text": "Heading",
                    "fontFamily": "Noto Sans",
                    "fontSize": 32.0
                },
                {
                    "op": "create",
                    "position": { "at": "root" },
                    "transform": { "x": 10.0, "y": 60.0, "width": 300.0, "height": 30.0 },
                    "type": "text",
                    "text": "Body",
                    "fontFamily": "Noto Sans",
                    "fontSize": 16.0
                }
            ]
        }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    let body = response.json();
    assert_eq!(body["version"], 1);
    assert_eq!(body["created"].as_array().unwrap().len(), 2);
    assert!(body["transactionId"].as_str().unwrap().starts_with("txn_"));

    let history = http::get(&harness.url("/api/projects/poster/history")).json();
    assert_eq!(history["position"], 1);
    assert_eq!(history["entries"][0]["kind"], "batchApplied");
    assert_eq!(history["entries"][0]["label"], "Add heading and body");

    http::post_json(&harness.url("/api/projects/poster/undo"), &json!({}));
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json()["layers"],
        json!([])
    );
    http::post_json(&harness.url("/api/projects/poster/redo"), &json!({}));
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json()["layers"]
            .as_array()
            .unwrap()
            .len(),
        2
    );
}

#[test]
fn a_refused_batch_rolls_back_every_earlier_command() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    let before = http::get(&harness.url("/api/projects/poster/document")).json();

    let response = http::post_json(
        &harness.url("/api/projects/poster/operation-batches"),
        &json!({
            "expectedVersion": 0,
            "label": "This must roll back",
            "commands": [
                {
                    "op": "create",
                    "position": { "at": "root" },
                    "transform": { "x": 0.0, "y": 0.0, "width": 100.0, "height": 40.0 },
                    "type": "text",
                    "text": "temporary",
                    "fontFamily": "Noto Sans",
                    "fontSize": 16.0
                },
                { "op": "delete", "id": "layer_missing" }
            ]
        }),
    );
    assert_eq!(response.status, 422, "{}", response.json());
    assert_eq!(error_code(&response), "operationRefused");
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json(),
        before
    );
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/history")).json()["position"],
        0
    );
}

#[test]
fn insert_layer_tree_rebuilds_nested_groups_and_validates_assets() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    let nested = json!({
        "id": "layer_source_group",
        "name": "Copied group",
        "transform": { "x": 20.0, "y": 30.0, "width": 200.0, "height": 100.0 },
        "type": "group",
        "children": [{
            "id": "layer_source_text",
            "name": "Copied text",
            "transform": { "x": 5.0, "y": 6.0, "width": 180.0, "height": 40.0 },
            "type": "text",
            "text": "Nested",
            "fontFamily": "Noto Sans",
            "fontSize": 18.0
        }]
    });
    let response = http::post_json(
        &harness.url("/api/projects/poster/operation-batches"),
        &json!({
            "expectedVersion": 0,
            "label": "Paste layers",
            "commands": [{
                "op": "insertLayerTree",
                "sourceProject": "poster",
                "layers": [nested],
                "offsetX": 12.0,
                "offsetY": 8.0
            }]
        }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    assert_eq!(response.json()["created"].as_array().unwrap().len(), 2);
    let document = http::get(&harness.url("/api/projects/poster/document")).json();
    assert_ne!(document["layers"][0]["id"], "layer_source_group");
    assert_ne!(
        document["layers"][0]["children"][0]["id"],
        "layer_source_text"
    );
    assert_eq!(document["layers"][0]["children"][0]["text"], "Nested");
    assert_eq!(document["layers"][0]["transform"]["x"], 32.0);

    let before = document;
    let missing_asset = http::post_json(
        &harness.url("/api/projects/poster/operation-batches"),
        &json!({
            "expectedVersion": 1,
            "label": "Invalid paste",
            "commands": [{
                "op": "insertLayerTree",
                "sourceProject": "poster",
                "layers": [{
                    "id": "layer_image",
                    "transform": { "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0 },
                    "type": "image",
                    "asset": "asset_missing"
                }]
            }]
        }),
    );
    assert_eq!(missing_asset.status, 422, "{}", missing_asset.json());
    assert_eq!(
        http::get(&harness.url("/api/projects/poster/document")).json(),
        before
    );
}

#[test]
fn path_escape_attempts_are_rejected() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    // Exit test, part one. Each of these is a way of asking the server to put
    // something outside the workspace, and each must be refused before it
    // reaches the filesystem.
    let escapes = [
        // Encoded separators, which the router hands over decoded.
        "%2e%2e%2f%2e%2e%2fetc",
        "..%2Fsecrets",
        "%2Fetc%2Fpasswd",
        "%2e%2e",
        // A drive letter and a UNC path.
        "C%3A%5CWindows",
        "%5C%5Cserver%5Cshare",
        // Names the operating system reserves.
        "CON",
        "nul",
        // A dotfile.
        ".ssh",
    ];
    for escape in escapes {
        let response = http::get(&harness.url(&format!("/api/projects/{escape}/document")));
        assert!(
            matches!(response.status, 400 | 404 | 301 | 405),
            "{escape} returned {}: {}",
            response.status,
            String::from_utf8_lossy(&response.body)
        );
        if response.status == 400 {
            assert_eq!(error_code(&response), "invalidProjectId", "{escape}");
        }
    }

    // Creating one is refused at the same gate, and nothing is left behind.
    for escape in ["../outside", "a/b", "..", ".hidden"] {
        let response = http::post_json(
            &harness.url("/api/projects"),
            &json!({ "id": escape, "width": 10.0, "height": 10.0 }),
        );
        // 400: the id fails to deserialise, because `ProjectId` is checked
        // on the way in rather than by each handler remembering to.
        assert_eq!(response.status, 400, "{escape} was not refused");
        assert_eq!(error_code(&response), "malformedRequest", "{escape}");
    }
    let outside = harness.root().parent().unwrap().join("outside");
    assert!(!outside.exists(), "a project escaped the workspace");

    // Only the one real project exists.
    let entries: Vec<String> = std::fs::read_dir(harness.root().join(PROJECTS_DIR))
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
        .collect();
    assert_eq!(entries, ["poster"]);
}

#[test]
fn an_uploaded_filename_never_becomes_a_path() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    let png = solid_png();
    for hostile in [
        "../../evil.png",
        "..\\..\\evil.png",
        "/etc/passwd.png",
        "C:\\evil.png",
        ".hidden.png",
        "no-extension",
        "trailing.",
    ] {
        let response = http::post_bytes(
            &harness.url(&format!(
                "/api/projects/poster/assets?filename={}",
                urlencode(hostile)
            )),
            "application/octet-stream",
            &png,
        );
        assert_eq!(response.status, 400, "{hostile} was accepted");
    }

    // An ordinary name works, and what lands on disk is named by the content
    // hash rather than by anything the client sent.
    let response = http::post_bytes(
        &harness.url("/api/projects/poster/assets?filename=swatch.png"),
        "image/png",
        &png,
    );
    assert_eq!(response.status, 201, "{}", response.json());
    let body = response.json();
    let stored = body["asset"]["path"].as_str().unwrap();
    assert!(stored.ends_with(".png"), "{stored}");
    assert!(!stored.contains("swatch"), "{stored}");
    assert_eq!(
        body["asset"]["hash"].as_str().unwrap(),
        assemblash_core::storage::hash_bytes(&png)
    );

    let assets = harness
        .root()
        .join(PROJECTS_DIR)
        .join("poster")
        .join("assets");
    assert!(assets.join(stored).is_file());

    // No scratch file was left behind.
    let leftovers: Vec<String> =
        std::fs::read_dir(harness.root().join(PROJECTS_DIR).join("poster"))
            .unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.starts_with("upload"))
            .collect();
    assert!(leftovers.is_empty(), "left behind {leftovers:?}");
}

#[test]
fn rendering_needs_a_font_the_store_actually_has() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    add_text(&harness, "poster", "Nothing Installed");

    let response = http::get(&harness.url("/api/projects/poster/preview.png"));
    assert_eq!(response.status, 422);
    let body = response.json();
    assert_eq!(body["error"]["code"], "missingFont");
    assert_eq!(body["error"]["details"]["family"], "Nothing Installed");

    // With the font installed, the same request produces a PNG.
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf");
    let mut store =
        assemblash_renderer::store::FontStore::open(harness.root().join(FONTS_DIR)).unwrap();
    store
        .import_file(&fixture, None, Some("OFL-1.1".into()))
        .unwrap();

    create_project(&harness, "second");
    add_text(&harness, "second", "Noto Sans");
    let response = http::get(&harness.url("/api/projects/second/preview.png"));
    assert_eq!(
        response.status,
        200,
        "{}",
        String::from_utf8_lossy(&response.body)
    );
    assert_eq!(&response.body[1..4], b"PNG");

    // Twice, identically: a preview of an unchanged document carries no
    // timestamp, so a client may cache it.
    let again = http::get(&harness.url("/api/projects/second/preview.png"));
    assert_eq!(again.body, response.body);
}

#[test]
fn preview_filters_support_the_editors_local_drag_compositor() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf");
    let mut store =
        assemblash_renderer::store::FontStore::open(harness.root().join(FONTS_DIR)).unwrap();
    store
        .import_file(&fixture, None, Some("OFL-1.1".into()))
        .unwrap();
    let created = add_text(&harness, "poster", "Noto Sans");
    let layer = created["created"][0].as_str().unwrap();

    let normal = http::get(&harness.url("/api/projects/poster/preview.png"));
    let base =
        http::get(&harness.url(&format!("/api/projects/poster/preview.png?exclude={layer}")));
    let selected =
        http::get(&harness.url(&format!("/api/projects/poster/preview.png?only={layer}")));
    assert_eq!(normal.status, 200);
    assert_eq!(base.status, 200);
    assert_eq!(selected.status, 200);
    assert_ne!(normal.body, base.body);
    assert_ne!(normal.body, selected.body);

    let layout = http::get(&harness.url(&format!(
        "/api/projects/poster/text-layout?id={layer}&width=90"
    )));
    assert_eq!(layout.status, 200, "{}", layout.json());
    assert!(layout.json()["lineCount"].as_u64().unwrap() >= 2);
    assert!(layout.json()["height"].as_f64().unwrap() > 32.0);

    let both = http::get(&harness.url(&format!(
        "/api/projects/poster/preview.png?only={layer}&exclude={layer}"
    )));
    assert_eq!(both.status, 400);
    assert_eq!(error_code(&both), "invalidPreviewFilter");
}

/// Writes a template project straight onto disk, before the server opens it.
///
/// `slots` is a document field with no operation that sets it — a template is
/// authored by writing one — so this is how a template gets into a workspace
/// in a test as well as in life.
fn write_template(harness: &Harness, id: &str, family: &str) {
    use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
    use assemblash_core::{Color, Document, Layer, LayerId, SequentialIdSource, Slot, SlotKind};

    let directory = harness.root().join(PROJECTS_DIR).join(id);
    std::fs::create_dir_all(&directory).unwrap();

    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 200.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(Layer::new(
        LayerId::new("layer_headline"),
        Transform::new(10.0, 10.0, 380.0, 80.0),
        assemblash_core::LayerKind::Text(TextLayer {
            text: "placeholder".to_owned(),
            font_family: family.to_owned(),
            font_size: 32.0,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    ));
    document.slots = vec![Slot {
        name: "headline".to_owned(),
        layer: LayerId::new("layer_headline"),
        kind: SlotKind::Text,
        description: Some("The big line".to_owned()),
        required: true,
        extra: Extras::new(),
    }];

    // Dropped straight away: holding the session would keep the lock the
    // server needs when it opens the project itself.
    drop(assemblash_core::Session::create(&directory, document, None).unwrap());
}

fn install_test_font(harness: &Harness) {
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf");
    let mut store =
        assemblash_renderer::store::FontStore::open(harness.root().join(FONTS_DIR)).unwrap();
    store
        .import_file(&fixture, None, Some("OFL-1.1".into()))
        .unwrap();
}

#[test]
fn a_reported_stale_lock_can_be_recovered_without_removing_a_changed_claim() {
    let harness = Harness::start();
    let directory = harness.root().join(PROJECTS_DIR).join("stale");
    let mut ids = assemblash_core::SequentialIdSource::new();
    let document = assemblash_core::Document::new(&mut ids, 320.0, 180.0);
    drop(assemblash_core::Session::create(&directory, document, None).unwrap());
    let lock = directory.join(assemblash_core::session::LOCK_FILE);
    std::fs::write(&lock, "{\"pid\":424242}").unwrap();

    let refused = http::get(&harness.url("/api/projects/stale/document"));
    assert_eq!(refused.status, 409);
    assert_eq!(error_code(&refused), "projectLocked");
    assert_eq!(refused.json()["error"]["details"]["pid"], 424242);

    let changed = http::post_json(
        &harness.url("/api/projects/stale/recover-lock"),
        &json!({ "expectedPid": 7 }),
    );
    assert_eq!(changed.status, 409);
    assert!(lock.exists(), "a different claim must be preserved");

    let recovered = http::post_json(
        &harness.url("/api/projects/stale/recover-lock"),
        &json!({ "expectedPid": 424242 }),
    );
    assert_eq!(recovered.status, 200, "{}", recovered.json());
    assert_eq!(recovered.json()["unlocked"], true);
    assert!(!lock.exists());

    let opened = http::get(&harness.url("/api/projects/stale/document"));
    assert_eq!(opened.status, 200, "{}", opened.json());
}

#[test]
fn a_variant_batch_is_readable_back_and_repeatable() {
    // What the interface's gallery needs: render a batch, then fetch each
    // produced PNG. The bytes it gets must be the bytes the batch hashed,
    // or a gallery would be showing something other than what was made.
    let harness = Harness::start();
    install_test_font(&harness);
    write_template(&harness, "flyer", "Noto Sans");

    let slots = http::get(&harness.url("/api/projects/flyer/slots")).json();
    assert_eq!(slots["isTemplate"], true);
    assert_eq!(slots["slots"][0]["name"], "headline");
    assert_eq!(slots["slots"][0]["required"], true);

    let request = json!({
        "scale": 1.0,
        "variants": [
            { "name": "one", "values": { "headline": "First" } },
            { "name": "two", "values": { "headline": "Second" } }
        ]
    });
    let response = http::post_json(&harness.url("/api/projects/flyer/variants"), &request);
    assert_eq!(response.status, 200, "{}", response.json());
    let batch = response.json();
    let variants = batch["variants"].as_array().unwrap().clone();
    assert_eq!(variants.len(), 2);

    for variant in &variants {
        let name = variant["name"].as_str().unwrap();
        let png = http::get(&harness.url(&format!("/api/projects/flyer/exports/{name}.png")));
        assert_eq!(png.status, 200, "{name}");
        assert_eq!(&png.body[1..4], b"PNG", "{name}");
        assert_eq!(
            assemblash_core::storage::hash_bytes(&png.body),
            variant["hash"].as_str().unwrap(),
            "what was served is not what the batch reported for {name}"
        );
        assert_eq!(png.body.len(), variant["bytes"].as_u64().unwrap() as usize);
    }

    // Two different values must not produce the same picture, or the test
    // above would pass on a batch that ignored its input.
    assert_ne!(variants[0]["hash"], variants[1]["hash"]);

    // The same values again produce the same hashes: a batch is as
    // reproducible as a single render (NFR-3).
    let again = http::post_json(&harness.url("/api/projects/flyer/variants"), &request).json();
    assert_eq!(again["variants"], batch["variants"]);

    // And the template itself was not touched.
    let document = http::get(&harness.url("/api/projects/flyer/document")).json();
    assert_eq!(document["layers"][0]["text"], "placeholder");
    assert_eq!(document["version"], 0);
}

#[test]
fn an_export_name_never_becomes_a_path() {
    let harness = Harness::start();
    install_test_font(&harness);
    write_template(&harness, "flyer", "Noto Sans");
    http::post_json(
        &harness.url("/api/projects/flyer/variants"),
        &json!({ "variants": [{ "name": "one", "values": { "headline": "First" } }] }),
    );

    // A name that is not a plain stem plus `.png` is refused before anything
    // reads the filesystem — the same rule that named the file in the first
    // place (PRD §10.1).
    for hostile in [
        "..%2F..%2Fdocument.json",
        "..%2Fdocument.json",
        "document.json",
        "one",
        "one.png.png",
        "%2E%2E.png",
        "%2Fetc%2Fpasswd.png",
        "C%3A%5CWindows%5Cwin.ini.png",
    ] {
        let response = http::get(&harness.url(&format!("/api/projects/flyer/exports/{hostile}")));
        assert!(
            matches!(response.status, 400 | 404 | 301 | 405),
            "{hostile} returned {}: {}",
            response.status,
            String::from_utf8_lossy(&response.body)
        );
        if response.status == 400 {
            assert_eq!(error_code(&response), "invalidExportName", "{hostile}");
        }
    }

    // A well-formed name for something that was never rendered is a plain
    // not-found, not an error about the shape of the request.
    let missing = http::get(&harness.url("/api/projects/flyer/exports/never-made.png"));
    assert_eq!(missing.status, 404);
    assert_eq!(error_code(&missing), "noSuchExport");
}

#[test]
fn overlaps_over_http_match_the_cli() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    // Three boxes that pile up, and one on its own.
    let mut ids = Vec::new();
    for (x, y, width, height) in [
        (0.0, 0.0, 100.0, 100.0),
        (50.0, 50.0, 100.0, 100.0),
        (80.0, 80.0, 100.0, 100.0),
        (300.0, 150.0, 50.0, 40.0),
    ] {
        let created = http::post_json(
            &harness.url("/api/projects/poster/operations"),
            &json!({
                "operation": {
                    "op": "create",
                    "position": { "at": "root" },
                    "transform": { "x": x, "y": y, "width": width, "height": height },
                    "type": "text",
                    "text": "box",
                    "fontFamily": "Noto Sans",
                    "fontSize": 12.0
                }
            }),
        );
        assert_eq!(created.status, 200, "{}", created.json());
        ids.push(created.json()["created"][0].as_str().unwrap().to_owned());
    }

    // What `assemblash overlaps <project>` computes, through the same two
    // functions the command calls.
    let project = harness.root().join(PROJECTS_DIR).join("poster");
    let session = assemblash_core::Session::open_read_only(&project).unwrap();
    let expected = assemblash_core::layout::find_overlaps(
        session.document(),
        &assemblash_core::layout::all_layer_ids(session.document()),
    )
    .unwrap()
    .into_iter()
    .map(|(first, second)| json!([first.to_string(), second.to_string()]))
    .collect::<Vec<_>>();
    assert_eq!(
        expected,
        vec![
            json!([ids[0], ids[1]]),
            json!([ids[0], ids[2]]),
            json!([ids[1], ids[2]])
        ],
        "the fixture is not three overlapping layers and one disjoint one"
    );

    let response = http::get(&harness.url("/api/projects/poster/overlaps"));
    assert_eq!(response.status, 200, "{}", response.json());
    assert_eq!(response.json()["pairs"], json!(expected));

    // `?layers=` narrows the set, exactly as the command's positional list
    // does — repeated or comma-separated, either spelling.
    let narrowed = http::get(&harness.url(&format!(
        "/api/projects/poster/overlaps?layers={}&layers={}",
        ids[0], ids[3]
    )));
    assert_eq!(narrowed.status, 200, "{}", narrowed.json());
    assert_eq!(narrowed.json()["pairs"], json!([]));

    let commas = http::get(&harness.url(&format!(
        "/api/projects/poster/overlaps?layers={},{}",
        ids[1], ids[2]
    )));
    assert_eq!(commas.json()["pairs"], json!([[ids[1], ids[2]]]));

    // A layer that is not there is refused, not answered with an empty list.
    let missing = http::get(&harness.url("/api/projects/poster/overlaps?layers=layer_nope"));
    assert_eq!(missing.status, 422, "{}", missing.json());
    assert_eq!(error_code(&missing), "operationRefused");
}

#[test]
fn svg_asset_text_with_no_loaded_font_is_reported() {
    let harness = Harness::start();
    install_test_font(&harness);
    create_project(&harness, "poster");

    // An asset whose `<text>` names a family nothing loaded. Fonts are
    // resolved from the families *text layers* name, so this draws as
    // nothing and always has — the export now says so rather than exiting
    // successfully with a hole in the picture (DEF-2 is still open; this is
    // the symptom made loud, not the fix).
    let svg = concat!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">"#,
        r##"<rect width="100" height="50" fill="#eeeeee"/>"##,
        r#"<text x="4" y="30" font-family="Nowhere Sans" font-size="20">label</text>"#,
        "</svg>"
    );
    let uploaded = http::post_bytes(
        &harness.url("/api/projects/poster/assets?filename=label.svg"),
        "image/svg+xml",
        svg.as_bytes(),
    );
    assert_eq!(uploaded.status, 201, "{}", uploaded.json());
    let asset = uploaded.json()["asset"]["id"].as_str().unwrap().to_owned();

    let created = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0 },
                "type": "svg",
                "asset": asset,
                "fit": "contain"
            }
        }),
    );
    assert_eq!(created.status, 200, "{}", created.json());
    let layer = created.json()["created"][0].as_str().unwrap().to_owned();

    let exported = http::post_json(
        &harness.url("/api/projects/poster/export"),
        &json!({ "name": "with-svg" }),
    );
    // Still a success: a warning is not a failure.
    assert_eq!(exported.status, 200, "{}", exported.json());
    let body = exported.json();
    assert_eq!(body["path"], "exports/with-svg.png");
    let warnings = body["warnings"].as_array().unwrap();
    assert_eq!(warnings.len(), 1, "{warnings:?}");
    assert_eq!(warnings[0]["code"], "svgAssetTextWithoutFont");
    assert_eq!(warnings[0]["layerId"], layer);
    assert!(warnings[0]["message"]
        .as_str()
        .unwrap_or_default()
        .contains("Nowhere Sans"));
}

#[test]
fn a_document_with_nothing_to_say_exports_an_empty_warnings_array() {
    let harness = Harness::start();
    install_test_font(&harness);
    create_project(&harness, "poster");
    add_text(&harness, "poster", "Noto Sans");

    let exported = http::post_json(
        &harness.url("/api/projects/poster/export"),
        &json!({ "name": "quiet" }),
    );
    assert_eq!(exported.status, 200, "{}", exported.json());
    assert_eq!(
        exported.json()["warnings"],
        json!([]),
        "the field is always there, so a client need not test for it"
    );

    // And warnings touch no pixel: the same document exported twice is the
    // same bytes, warnings channel or no warnings channel.
    let first = http::get(&harness.url("/api/projects/poster/exports/quiet.png"));
    let again = http::post_json(
        &harness.url("/api/projects/poster/export"),
        &json!({ "name": "quiet-again" }),
    );
    assert_eq!(again.status, 200, "{}", again.json());
    let second = http::get(&harness.url("/api/projects/poster/exports/quiet-again.png"));
    assert_eq!(first.body, second.body);
}

/// How many entries the journal holds, and what version the document is at.
fn journal_and_version(harness: &Harness, project: &str) -> (usize, u64) {
    let history = http::get(&harness.url(&format!("/api/projects/{project}/history"))).json();
    let document = http::get(&harness.url(&format!("/api/projects/{project}/document"))).json();
    (
        history["entries"].as_array().map_or(0, Vec::len),
        document["version"].as_u64().unwrap_or_default(),
    )
}

#[test]
fn an_unknown_property_on_an_update_is_refused() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    let created = add_text(&harness, "poster", "Noto Sans");
    let layer = created["created"][0].as_str().unwrap().to_owned();
    let before = journal_and_version(&harness, "poster");

    // Against 1.2.0 this was `200 OK`, a version bump, the layer in
    // `changed`, and a journal entry with no properties in it. A false
    // success is worse than a refusal, so it is a refusal now.
    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({ "operation": { "op": "update", "id": layer, "letterSpacing": 4 } }),
    );
    assert_eq!(response.status, 422, "{}", response.json());
    assert_eq!(error_code(&response), "operationRefused");
    let message = response.json()["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .to_owned();
    assert!(
        message.contains("letterSpacing"),
        "the message must name the property: {message}"
    );

    assert_eq!(
        journal_and_version(&harness, "poster"),
        before,
        "a refused operation moves neither the version nor the journal"
    );
}

#[test]
fn an_unknown_property_on_a_create_is_refused() {
    let harness = Harness::start();
    create_project(&harness, "poster");
    let before = journal_and_version(&harness, "poster");

    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 0.0, "y": 0.0, "width": 100.0, "height": 40.0 },
                "type": "text",
                "text": "over http",
                "fontFamily": "Noto Sans",
                "fontSize": 32.0,
                "letterSpacing": 9
            }
        }),
    );
    assert_eq!(response.status, 422, "{}", response.json());
    assert_eq!(error_code(&response), "operationRefused");
    assert!(response.json()["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .contains("letterSpacing"));

    assert_eq!(journal_and_version(&harness, "poster"), before);

    // And the same refusal inside a batch, which parses commands its own way.
    let batch = http::post_json(
        &harness.url("/api/projects/poster/operation-batches"),
        &json!({
            "expectedVersion": before.1,
            "label": "Add a heading",
            "commands": [{ "op": "update", "id": "layer_nope", "cornerRadius": 8 }]
        }),
    );
    assert_eq!(batch.status, 422, "{}", batch.json());
    assert_eq!(error_code(&batch), "operationRefused");
    assert!(batch.json()["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .contains("cornerRadius"));
    assert_eq!(journal_and_version(&harness, "poster"), before);
}

#[test]
fn refused_operations_and_bad_requests_are_typed() {
    let harness = Harness::start();
    create_project(&harness, "poster");

    // A layer that is not there: a well-formed request the engine declines.
    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({ "operation": { "op": "delete", "id": "layer_nope" } }),
    );
    assert_eq!(response.status, 422);
    assert_eq!(error_code(&response), "operationRefused");

    // An actor kind nobody defined must not silently become `human`.
    let response = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": { "op": "delete", "id": "layer_nope" },
            "actor": { "kind": "the-boss" }
        }),
    );
    assert_eq!(response.status, 400);
    assert_eq!(error_code(&response), "badRequest");

    // A project that does not exist.
    let response = http::get(&harness.url("/api/projects/absent/document"));
    assert_eq!(response.status, 404);
    assert_eq!(error_code(&response), "noSuchProject");
}

#[test]
fn the_published_schemas_are_the_ones_the_engine_uses() {
    let harness = Harness::start();

    let document = http::get(&harness.url("/api/schema/document"));
    assert_eq!(document.status, 200);
    assert_eq!(
        String::from_utf8(document.body).unwrap(),
        assemblash_core::schema::document_schema_json()
    );

    let operation = http::get(&harness.url("/api/schema/operation"));
    assert_eq!(operation.status, 200);
    assert_eq!(
        String::from_utf8(operation.body).unwrap(),
        assemblash_core::schema::operation_schema_json()
    );
}

fn solid_png() -> Vec<u8> {
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, 1, 1);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&[10, 20, 30, 255]).unwrap();
    }
    out
}

fn urlencode(value: &str) -> String {
    let mut out = String::new();
    for byte in value.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~') {
            out.push(byte as char);
        } else {
            out.push_str(&format!("%{byte:02X}"));
        }
    }
    out
}
