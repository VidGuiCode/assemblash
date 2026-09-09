//! D12(a) over HTTP: an SVG asset whose text nothing can draw is a typed
//! error, not a 200 with a hole in the picture.
//!
//! The route resolves fonts from the families **text layers** name, so a
//! document whose only text lives inside an imported vector asset had no font
//! loaded at all — and exported successfully anyway (DEF-2). The first test
//! here is that document; the second adds a text layer in the same family the
//! asset asks for, which is what makes the family load, and the export goes
//! through.
//!
//! The HTTP client is deliberately the smallest thing that can post a body and
//! read a status: the full one lives in `tests/api.rs`, and an integration test
//! is its own crate, so there is nothing to share without moving it.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::workspace::{Workspace, FONTS_DIR};
use assemblash_server::Server;
use serde_json::{json, Value};

/// A running server, and the scratch directory it works in.
struct Harness {
    base: String,
    _scratch: tempfile::TempDir,
    root: PathBuf,
}

impl Harness {
    fn start() -> Self {
        let scratch = tempfile::tempdir().unwrap();
        let root = scratch.path().join("workspace");
        let workspace = Workspace::open_or_create(&root).unwrap();

        let (send, receive) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async move {
                let server = Server::bind(workspace, 0, Default::default())
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

    fn root(&self) -> &Path {
        &self.root
    }
}

/// Enough HTTP/1.1 to post a body and read one answer back.
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
            serde_json::from_slice(&self.body).unwrap_or_else(|error| {
                panic!(
                    "body is not JSON ({error}): {}",
                    String::from_utf8_lossy(&self.body)
                )
            })
        }
    }

    pub fn post(url: &str, content_type: &str, body: &[u8]) -> Response {
        let rest = url.strip_prefix("http://").expect("http url");
        let (authority, path) = match rest.find('/') {
            Some(index) => (&rest[..index], &rest[index..]),
            None => (rest, "/"),
        };

        let mut stream = TcpStream::connect(authority).expect("connect");
        let head = format!(
            "POST {path} HTTP/1.1\r\nHost: {authority}\r\nConnection: close\r\n\
             Content-Type: {content_type}\r\nContent-Length: {}\r\n\r\n",
            body.len()
        );
        stream.write_all(head.as_bytes()).expect("write head");
        stream.write_all(body).expect("write body");
        stream.flush().expect("flush");

        // Every answer this test asks for is a JSON body with a
        // `Content-Length`, so reading to the declared length is enough and
        // there is no chunked case to handle.
        let mut raw = Vec::new();
        let mut buffer = [0_u8; 8192];
        loop {
            if let Some(split) = headers_end(&raw) {
                let declared = content_length(&raw[..split]);
                if declared.is_some_and(|length| raw.len() - split - 4 >= length) {
                    break;
                }
            }
            match stream.read(&mut buffer) {
                Ok(0) => break,
                Ok(read) => raw.extend_from_slice(&buffer[..read]),
                Err(error) => panic!("read failed after {} bytes: {error}", raw.len()),
            }
        }

        let split = headers_end(&raw).expect("headers end");
        let headers = String::from_utf8_lossy(&raw[..split]).into_owned();
        let status = headers
            .lines()
            .next()
            .and_then(|line| line.split_whitespace().nth(1))
            .and_then(|code| code.parse().ok())
            .expect("status line");
        Response {
            status,
            body: raw[split + 4..].to_vec(),
        }
    }

    pub fn post_json(url: &str, body: &serde_json::Value) -> Response {
        post(url, "application/json", body.to_string().as_bytes())
    }

    fn headers_end(raw: &[u8]) -> Option<usize> {
        raw.windows(4).position(|window| window == b"\r\n\r\n")
    }

    fn content_length(headers: &[u8]) -> Option<usize> {
        String::from_utf8_lossy(headers)
            .to_ascii_lowercase()
            .lines()
            .find_map(|line| line.strip_prefix("content-length:"))
            .and_then(|value| value.trim().parse().ok())
    }
}

fn install_noto(harness: &Harness) {
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf");
    let mut store =
        assemblash_renderer::store::FontStore::open(harness.root().join(FONTS_DIR)).unwrap();
    store
        .import_file(&fixture, None, Some("OFL-1.1".into()))
        .unwrap();
}

/// A project holding one SVG layer whose asset draws text in Noto Sans.
///
/// The asset id comes back so the refusal can be checked to name it.
fn project_with_svg_text(harness: &Harness) -> String {
    let created = http::post_json(
        &harness.url("/api/projects"),
        &json!({ "id": "poster", "width": 200.0, "height": 100.0 }),
    );
    assert_eq!(created.status, 201, "{}", created.json());

    let svg = std::fs::read(
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../assemblash-renderer/tests/svg_assets/named_family.svg"),
    )
    .unwrap();
    let uploaded = http::post(
        &harness.url("/api/projects/poster/assets?filename=label.svg"),
        "image/svg+xml",
        &svg,
    );
    assert_eq!(uploaded.status, 201, "{}", uploaded.json());
    let asset = uploaded.json()["asset"]["id"].as_str().unwrap().to_owned();

    let layer = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 0.0, "y": 0.0, "width": 200.0, "height": 100.0 },
                "type": "svg",
                "asset": asset,
                "fit": "fill"
            }
        }),
    );
    assert_eq!(layer.status, 200, "{}", layer.json());
    asset
}

fn error_code(response: &http::Response) -> String {
    response.json()["error"]["code"]
        .as_str()
        .unwrap_or_default()
        .to_owned()
}

fn error_message(response: &http::Response) -> String {
    response.json()["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .to_owned()
}

#[test]
fn exporting_an_svg_asset_whose_text_has_no_font_is_a_typed_error() {
    let harness = Harness::start();
    install_noto(&harness);
    let asset = project_with_svg_text(&harness);

    // Noto Sans is installed in the store, but nothing loads it: the document
    // has no text layer, and the store is asked only for the families text
    // layers name. This is the export that used to be a 200.
    let refused = http::post_json(
        &harness.url("/api/projects/poster/export"),
        &json!({ "name": "with-svg" }),
    );
    assert_eq!(refused.status, 422, "{}", refused.json());
    assert_eq!(error_code(&refused), "renderFailed");

    let message = error_message(&refused);
    assert!(message.contains(&asset), "must name the asset: {message}");
    assert!(message.contains("Noto Sans"), "and the family: {message}");
    assert!(
        !harness
            .root()
            .join("projects/poster/exports/with-svg.png")
            .exists(),
        "a refused export writes no file"
    );
}

#[test]
fn the_same_export_succeeds_once_a_text_layer_makes_the_family_load() {
    let harness = Harness::start();
    install_noto(&harness);
    project_with_svg_text(&harness);

    // The fix a person actually has: name the family somewhere the loader can
    // see it. This is a workaround for DEF-2, not the repair — loading the
    // families an asset itself names is a separate change — but it is the one
    // the error message points at, so it has to work.
    let text = http::post_json(
        &harness.url("/api/projects/poster/operations"),
        &json!({
            "operation": {
                "op": "create",
                "position": { "at": "root" },
                "transform": { "x": 0.0, "y": 0.0, "width": 200.0, "height": 20.0 },
                "type": "text",
                "text": "caption",
                "fontFamily": "Noto Sans",
                "fontSize": 12.0,
                "color": "#101820",
                "align": "left",
                "lineHeight": 1.2
            }
        }),
    );
    assert_eq!(text.status, 200, "{}", text.json());

    let exported = http::post_json(
        &harness.url("/api/projects/poster/export"),
        &json!({ "name": "with-svg" }),
    );
    assert_eq!(exported.status, 200, "{}", exported.json());
    let body: Value = exported.json();
    assert_eq!(body["path"], "exports/with-svg.png");
    assert!(harness
        .root()
        .join("projects/poster/exports/with-svg.png")
        .is_file());
}
