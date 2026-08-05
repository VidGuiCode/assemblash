//! MVP criterion 12, the part a browser is not needed for: **the interface
//! opens, edits, and exports the same document format the API and MCP use.**
//!
//! The interface is TypeScript in a browser, so this cannot press its buttons.
//! What it *can* do is drive the exact calls the interface makes — the same
//! endpoints, in the same order, with the same payload shapes — and check the
//! document that comes out. If this passes and the browser run passes, the
//! remaining gap is the DOM, which is what the browser run is for.
//!
//! The release notes say which claim rests on which; this file is not the
//! whole of criterion 12 and does not pretend to be.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::workspace::Workspace;
use assemblash_server::render;
use assemblash_server::{Server, UiSource};
use serde_json::{json, Value};

mod http {
    #![allow(unreachable_pub)]

    use std::io::{Read as _, Write as _};
    use std::net::TcpStream;

    pub struct Response {
        pub status: u16,
        pub body: Vec<u8>,
        pub content_type: String,
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

    pub fn request(method: &str, url: &str, body: Option<&[u8]>) -> Response {
        request_with(method, url, body, &[])
    }

    /// A request carrying extra headers, for the ones authentication needs.
    pub fn request_with(
        method: &str,
        url: &str,
        body: Option<&[u8]>,
        extra: &[(&str, &str)],
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
             Content-Type: application/json\r\nContent-Length: {}\r\n",
            body.len()
        );
        for (name, value) in extra {
            head.push_str(name);
            head.push_str(": ");
            head.push_str(value);
            head.push_str("\r\n");
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
        let content_type = headers
            .lines()
            .find(|line| line.to_ascii_lowercase().starts_with("content-type:"))
            .map(|line| line[13..].trim().to_owned())
            .unwrap_or_default();

        let mut body = raw[split + 4..].to_vec();
        if headers
            .to_ascii_lowercase()
            .contains("transfer-encoding: chunked")
        {
            body = dechunk(&body);
        }
        Response {
            status,
            body,
            content_type,
        }
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
}

struct Harness {
    base: String,
    _scratch: tempfile::TempDir,
    root: PathBuf,
}

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
}

impl Harness {
    fn start() -> Self {
        let scratch = tempfile::tempdir().unwrap();
        let root = scratch.path().join("workspace");
        let workspace = Workspace::open_or_create(&root).unwrap();
        let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
        store
            .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
            .unwrap();

        let (send, receive) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async move {
                let server = Server::bind(workspace, 0, UiSource::Embedded)
                    .await
                    .unwrap();
                send.send(server.url()).unwrap();
                let _ = server.serve().await;
            });
        });
        Self {
            base: receive.recv().expect("the server started"),
            _scratch: scratch,
            root,
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.base)
    }

    fn get(&self, path: &str) -> http::Response {
        http::request("GET", &self.url(path), None)
    }

    fn post(&self, path: &str, body: &Value) -> http::Response {
        http::request("POST", &self.url(path), Some(body.to_string().as_bytes()))
    }

    fn project_dir(&self, id: &str) -> PathBuf {
        self.root.join("projects").join(id)
    }
}

/// The exact sequence the interface performs, at the level below the DOM.
#[test]
fn the_interface_opens_edits_and_exports_the_same_document() {
    let harness = Harness::start();

    // The interface is served, and it is the one built into the binary.
    let page = harness.get("/");
    assert_eq!(page.status, 200);
    assert!(page.content_type.starts_with("text/html"));
    let html = String::from_utf8_lossy(&page.body);
    assert!(html.contains("app.js"), "the entry point is missing");
    assert_eq!(harness.get("/app.js").status, 200);
    assert_eq!(harness.get("/api.js").status, 200);
    assert_eq!(harness.get("/style.css").status, 200);

    // Something the API wrote, exactly as another client would have.
    let created = harness.post(
        "/api/projects",
        &json!({ "id": "poster", "width": 400.0, "height": 200.0, "background": "#f6f4ef" }),
    );
    assert_eq!(created.status, 201, "{}", created.json());
    let by_api = harness.post(
        "/api/projects/poster/operations",
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 20.0, "y": 20.0, "width": 360.0, "height": 60.0 },
                "type": "text",
                "text": "made by the API",
                "fontFamily": "Noto Sans",
                "fontSize": 28.0
            },
            "actor": { "kind": "agent", "name": "the API" }
        }),
    );
    assert_eq!(by_api.status, 200, "{}", by_api.json());

    // --- open ---------------------------------------------------------------
    // The interface lists projects, then reads the document and its history.
    let listed = harness.get("/api/projects").json();
    assert_eq!(listed["projects"][0]["id"], "poster");
    let document = harness.get("/api/projects/poster/document").json();
    assert_eq!(document["version"], 1);
    assert_eq!(document["layers"][0]["text"], "made by the API");
    assert_eq!(
        harness.get("/api/projects/poster/history").json()["position"],
        1
    );

    // The canvas: the engine's own render, and the vector form beside it.
    let preview = harness.get("/api/projects/poster/preview.png?scale=1");
    assert_eq!(preview.status, 200);
    assert_eq!(preview.content_type, "image/png");
    let svg = harness.get("/api/projects/poster/preview.svg");
    assert_eq!(svg.status, 200);
    assert_eq!(svg.content_type, "image/svg+xml");
    assert!(String::from_utf8_lossy(&svg.body).starts_with("<svg"));

    // --- edit ---------------------------------------------------------------
    // Adding a layer, changing its text, and moving it: the three shapes the
    // inspector and the canvas produce.
    let added = harness
        .post(
            "/api/projects/poster/operations",
            &json!({
                "operation": {
                    "op": "create",
                    "position": { "at": "root" },
                    "transform": { "x": 20.0, "y": 100.0, "width": 360.0, "height": 60.0 },
                    "type": "text",
                    "text": "New text",
                    "fontFamily": "Noto Sans",
                    "fontSize": 28.0
                },
                "expectedVersion": 1,
                "actor": { "kind": "human", "name": "reference UI" }
            }),
        )
        .json();
    let layer = added["created"][0].as_str().unwrap().to_owned();
    assert_eq!(added["version"], 2);

    let edited = harness
        .post(
            "/api/projects/poster/operations",
            &json!({
                "operation": { "op": "update", "id": layer, "text": "edited in the UI" },
                "expectedVersion": 2,
                "actor": { "kind": "human", "name": "reference UI" }
            }),
        )
        .json();
    assert_eq!(edited["version"], 3);

    let moved = harness
        .post(
            "/api/projects/poster/operations",
            &json!({
                "operation": { "op": "move", "id": layer, "dx": 0.0, "dy": 40.0 },
                "expectedVersion": 3,
                "actor": { "kind": "human", "name": "reference UI" }
            }),
        )
        .json();
    assert_eq!(moved["version"], 4);

    // A stale version is refused, which is what stops the interface and an
    // agent overwriting each other.
    let stale = harness.post(
        "/api/projects/poster/operations",
        &json!({
            "operation": { "op": "move", "id": layer, "dx": 1.0, "dy": 0.0 },
            "expectedVersion": 1
        }),
    );
    assert_eq!(stale.status, 409);
    assert_eq!(stale.json()["error"]["code"], "versionConflict");

    // --- export -------------------------------------------------------------
    let exported = harness
        .post(
            "/api/projects/poster/export",
            &json!({ "name": "ui-export", "scale": 1.0 }),
        )
        .json();
    assert_eq!(exported["path"], "exports/ui-export.png");
    let file = harness.project_dir("poster").join("exports/ui-export.png");
    assert!(file.is_file());

    // **What the canvas shows is what the export contains.** Not similar —
    // the same bytes, because they are the same render (PRD §16.3, R3).
    let shown = harness.get("/api/projects/poster/preview.png?scale=1");
    assert_eq!(
        shown.body,
        std::fs::read(&file).unwrap(),
        "the preview and the export must be the same render"
    );

    // --- the same document format ------------------------------------------
    // The file on disk is a document the engine reads, unchanged by having
    // been through the interface.
    let on_disk = assemblash_core::storage::load(&harness.project_dir("poster")).unwrap();
    assemblash_core::validate(&on_disk).expect("still a valid document");
    assert_eq!(on_disk.version, 4);
    assert_eq!(on_disk.layers.len(), 2);
    let over_http: assemblash_core::Document =
        serde_json::from_value(harness.get("/api/projects/poster/document").json()).unwrap();
    assert_eq!(over_http, on_disk, "the API and the file must agree");

    // And undo, which the interface offers, still returns it exactly.
    let before_undo = std::fs::read(harness.project_dir("poster").join("document.json")).unwrap();
    harness.post("/api/projects/poster/undo", &json!({}));
    harness.post("/api/projects/poster/redo", &json!({}));
    assert_eq!(
        std::fs::read(harness.project_dir("poster").join("document.json")).unwrap(),
        before_undo,
        "undo then redo must land exactly where it started"
    );
}

/// The interface is only served from the list this build carries.
#[test]
fn the_interface_serves_nothing_it_was_not_built_with() {
    let harness = Harness::start();
    for hostile in [
        "/../Cargo.toml",
        "/%2e%2e/%2e%2e/etc/passwd",
        "/document.json",
        "/app.js/../../secret",
    ] {
        let response = harness.get(hostile);
        assert!(
            matches!(response.status, 404 | 400 | 301),
            "{hostile} returned {}",
            response.status
        );
    }
}

/// An export name that is really a path is refused, over HTTP as over MCP.
#[test]
fn an_export_name_is_never_a_path() {
    let harness = Harness::start();
    harness.post(
        "/api/projects",
        &json!({ "id": "poster", "width": 10.0, "height": 10.0 }),
    );
    for hostile in ["../escape", "a/b", ".hidden", "with space"] {
        let response = harness.post(
            "/api/projects/poster/export",
            &json!({ "name": hostile, "scale": 1.0 }),
        );
        assert_eq!(response.status, 400, "{hostile}");
        assert_eq!(response.json()["error"]["code"], "invalidExportName");
    }
    assert!(!Path::new(&harness.root).join("escape.png").exists());
    // And the directory is the engine's choice, not the caller's.
    assert_eq!(render::EXPORTS_DIR, "exports");
}

/// A server nobody may stop refuses to be stopped, and says so.
///
/// The shutdown endpoint exists for the no-terminal promise: a person who
/// double-clicked the binary has no console to press Ctrl-C in. A server under
/// a service manager or in a container owns its own lifetime, and a web page
/// must not be able to take it away.
#[test]
fn a_managed_server_refuses_to_be_shut_down() {
    let harness = Harness::start();

    let version = harness.get("/api/version").json();
    assert_eq!(
        version["canShutdown"], false,
        "a plain `serve` must not offer the interface a way to stop it"
    );

    let refused = harness.post("/api/shutdown", &json!({}));
    assert_eq!(refused.status, 403);
    assert_eq!(refused.json()["error"]["code"], "shutdownRefused");

    // Still serving.
    assert_eq!(harness.get("/api/version").status, 200);
}

/// The v0.11.0 exit test: a non-loopback bind refuses without a token, and
/// with one it demands the token on every request.
///
/// The refusal is the load-bearing half. A server that bound a network and
/// went on serving would publish a workspace to it, and the flag that did so
/// would not have looked like it was going to (PRD §16.1, decision 14).
#[test]
fn a_wide_bind_needs_a_token_and_then_enforces_it() {
    use assemblash_core::workspace::Config;

    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = Workspace::open_or_create(&root).unwrap();

    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();

    // --- without a token: refused, and nothing is listening -----------------
    let refused = runtime.block_on(assemblash_server::Server::bind_to(
        workspace.clone(),
        "0.0.0.0".parse().unwrap(),
        0,
        UiSource::Embedded,
        assemblash_server::Shutdown::Refused,
    ));
    let error = refused.expect_err("a wide bind with no token must refuse");
    let message = error.to_string();
    assert!(message.contains("token rotate"), "{message}");
    assert!(message.contains("0.0.0.0"), "{message}");

    // Loopback with no token is unchanged: the default needs no setup.
    let allowed = runtime.block_on(assemblash_server::Server::bind_to(
        workspace.clone(),
        "127.0.0.1".parse().unwrap(),
        0,
        UiSource::Embedded,
        assemblash_server::Shutdown::Refused,
    ));
    assert!(allowed.is_ok(), "loopback must still need nothing");
    drop(allowed);

    // --- with a token: it binds, and every request must carry it ------------
    let token = assemblash_server::auth::generate_token().unwrap();
    let mut workspace = Workspace::open_or_create(&root).unwrap();
    let mut config: Config = workspace.config().clone();
    config.token = Some(token.clone());
    workspace.set_config(config).unwrap();

    let (send, receive) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        runtime.block_on(async move {
            let server = assemblash_server::Server::bind_to(
                workspace,
                "0.0.0.0".parse().unwrap(),
                0,
                UiSource::Embedded,
                assemblash_server::Shutdown::Refused,
            )
            .await
            .expect("a wide bind with a token starts");
            send.send(server.url()).unwrap();
            let _ = server.serve().await;
        });
    });
    let base = receive.recv().expect("the server started");

    let bearer = |token: &str| format!("Bearer {token}");

    // No token at all.
    let anonymous = http::request_with("GET", &format!("{base}/api/version"), None, &[]);
    assert_eq!(anonymous.status, 401);
    let body = anonymous.json();
    assert_eq!(body["error"]["code"], "unauthorized");
    assert!(
        !anonymous_body_mentions(&body.to_string(), &token),
        "a 401 must not echo the token back"
    );

    // A wrong token, including one that shares a prefix.
    for wrong in [
        "nope".to_owned(),
        token[..token.len() - 1].to_owned(),
        format!("{token}x"),
    ] {
        let header = bearer(&wrong);
        let response = http::request_with(
            "GET",
            &format!("{base}/api/version"),
            None,
            &[("authorization", header.as_str())],
        );
        assert_eq!(response.status, 401, "{wrong} was accepted");
    }

    // The right one, and the whole surface behind it.
    let header = bearer(&token);
    let authorized = http::request_with(
        "GET",
        &format!("{base}/api/version"),
        None,
        &[("authorization", header.as_str())],
    );
    assert_eq!(
        authorized.status,
        200,
        "token {:?} rejected; body {}",
        header,
        String::from_utf8_lossy(&authorized.body)
    );
    assert_eq!(authorized.json()["name"], "assemblash");

    // The interface's own files are behind it too: a page that loaded and
    // then failed everything would be a worse way to learn a token is needed.
    assert_eq!(
        http::request_with("GET", &format!("{base}/"), None, &[]).status,
        401
    );
    assert_eq!(
        http::request_with("GET", &format!("{base}/app.js"), None, &[]).status,
        401
    );

    // Except the login page, which is how a token gets into the browser.
    assert_eq!(
        http::request_with("GET", &format!("{base}/login.html"), None, &[]).status,
        200
    );
    assert_eq!(
        http::request_with("GET", &format!("{base}/login.js"), None, &[]).status,
        200
    );

    // And a write is refused just as firmly as a read.
    let write = http::request_with(
        "POST",
        &format!("{base}/api/projects"),
        Some(
            json!({ "id": "sneaky", "width": 10.0, "height": 10.0 })
                .to_string()
                .as_bytes(),
        ),
        &[],
    );
    assert_eq!(write.status, 401);
    assert!(!root.join("projects/sneaky").exists());
}

fn anonymous_body_mentions(body: &str, token: &str) -> bool {
    body.contains(token)
}
