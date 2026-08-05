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
