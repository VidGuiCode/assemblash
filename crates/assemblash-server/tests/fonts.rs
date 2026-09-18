//! Web font management over HTTP: list, import, remove, and install.
//!
//! Everything here goes through the socket. The point of these routes is that
//! a browser can manage the font store without a terminal, so a test that
//! reached into `FontStore` to set something up would be testing the half
//! that already worked.
//!
//! Two things are deliberately not left to reasoning:
//!
//! * **the parsed-font cache follows the store** — a family that renders is
//!   removed and the same render then fails, in one process, with no restart;
//! * **concurrent imports do not lose index entries** — eight at once, on a
//!   multi-threaded runtime, and the index still has every face exactly once.
//!
//! The install route is the one place the server reaches the network, so it
//! is driven here through an injected fetcher that serves fixture bytes. The
//! bundled manifest pins the sha256 of files that are megabytes each, and a
//! fixture cannot hash to one of those — a successful install is therefore
//! tested against a manifest that pins the fixtures, and the bundled manifest
//! is exercised for the lookups and refusals that never fetch anything.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

use assemblash_core::workspace::{Workspace, FONTS_DIR};
use assemblash_renderer::install::{FontFetcher, Manifest, ManifestEntry};
use assemblash_renderer::store::{hash_bytes, FontStore};
use assemblash_server::state::SharedFontFetcher;
use assemblash_server::AppState;
use serde_json::json;

/// A fixture font, by file name under `assemblash-renderer/tests/fonts/`.
fn fixture(name: &str) -> Vec<u8> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts")
        .join(name);
    std::fs::read(&path).unwrap_or_else(|e| panic!("reading {}: {e}", path.display()))
}

/// A fetcher that answers from a table, and counts what it was asked for.
///
/// Anything not in the table is a fetch failure rather than a panic: "the
/// upstream does not have this" is one of the cases the route has to report.
#[derive(Debug, Default)]
struct FakeFetcher {
    files: BTreeMap<String, Result<Vec<u8>, String>>,
    calls: AtomicUsize,
}

impl FakeFetcher {
    fn calls(&self) -> usize {
        self.calls.load(Ordering::SeqCst)
    }
}

impl FontFetcher for FakeFetcher {
    fn fetch(&self, url: &str) -> Result<Vec<u8>, String> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        match self.files.get(url) {
            Some(answer) => answer.clone(),
            None => Err(format!("nothing is published at {url}")),
        }
    }
}

/// The prefix and commit a test manifest resolves URLs against.
///
/// `.invalid` is reserved by RFC 2606 and can never resolve, so a test that
/// accidentally used a real fetcher would fail loudly rather than reach out.
const FIXTURE_PREFIX: &str = "https://fixtures.invalid/";
const FIXTURE_COMMIT: &str = "0000000000000000000000000000000000000000";

/// A manifest pinning fixture fonts, with the hashes they really have.
fn fixture_manifest(entries: &[(&str, &str, &str)]) -> Manifest {
    Manifest {
        version: 1,
        source: "the test fixtures".to_owned(),
        commit: FIXTURE_COMMIT.to_owned(),
        url_prefix: FIXTURE_PREFIX.to_owned(),
        families: entries
            .iter()
            .map(|(family, file, pack)| {
                let bytes = fixture(file);
                ManifestEntry {
                    name: (*family).to_owned(),
                    path: (*file).to_owned(),
                    sha256: hash_bytes(&bytes),
                    bytes: bytes.len() as u64,
                    license: "OFL-1.1".to_owned(),
                    packs: vec![(*pack).to_owned()],
                    weight: None,
                    url_prefix: None,
                    commit: None,
                }
            })
            .collect(),
    }
}

/// The URL a fixture manifest resolves a path to.
fn fixture_url(path: &str) -> String {
    format!("{FIXTURE_PREFIX}{FIXTURE_COMMIT}/{path}")
}

/// A running server, and the scratch workspace it works in.
struct Harness {
    base: String,
    _workspace: tempfile::TempDir,
    root: PathBuf,
    fetcher: Arc<FakeFetcher>,
}

impl Harness {
    fn start() -> Self {
        Self::start_with(Arc::new(FakeFetcher::default()), None)
    }

    /// Starts a server on its own **multi-threaded** runtime.
    ///
    /// Multi-threaded on purpose: the handlers do their file work inline, so
    /// on a current-thread runtime concurrent requests would be serialised by
    /// the runtime and the concurrency test would pass without the store lock
    /// existing at all.
    fn start_with(fetcher: Arc<FakeFetcher>, manifest: Option<Manifest>) -> Self {
        Self::start_limited(fetcher, manifest, Default::default())
    }

    /// A server whose upload ceilings are whatever the caller says.
    ///
    /// The real one is 64 MiB, and proving that an over-limit body comes back
    /// as JSON does not need 64 MiB to travel down a socket to do it.
    fn start_limited(
        fetcher: Arc<FakeFetcher>,
        manifest: Option<Manifest>,
        limits: assemblash_server::api::BodyLimits,
    ) -> Self {
        let directory = tempfile::tempdir().unwrap();
        let root = directory.path().join("workspace");
        let workspace = Workspace::open_or_create(&root).unwrap();

        let shared: SharedFontFetcher = Arc::clone(&fetcher) as SharedFontFetcher;
        let state = AppState::with_font_source(workspace, shared, manifest);

        let (send, receive) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(4)
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async move {
                // Port 0: the OS picks, so tests never collide.
                let listener = tokio::net::TcpListener::bind(("127.0.0.1", 0))
                    .await
                    .unwrap();
                let address = listener.local_addr().unwrap();
                let (stop, _stopping) = tokio::sync::watch::channel(false);
                let router = assemblash_server::api::router_with_limits(
                    state,
                    Default::default(),
                    Default::default(),
                    std::sync::Arc::new(stop),
                    Default::default(),
                    limits,
                );
                send.send(format!("http://{address}")).unwrap();
                let _ = axum::serve(listener, router).await;
            });
        });

        let base = receive.recv().expect("the server started");
        Self {
            base,
            _workspace: directory,
            root,
            fetcher,
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.base)
    }

    /// The store as it is on disk, read outside the server.
    fn store(&self) -> FontStore {
        FontStore::open(self.root.join(FONTS_DIR)).unwrap()
    }

    fn fetcher(&self) -> &FakeFetcher {
        &self.fetcher
    }
}

/// A tiny blocking HTTP/1.1 client.
///
/// Hand-rolled for the same reason `api.rs` hand-rolls one: the server's only
/// dependency on an HTTP client would otherwise be a test one, and every
/// crate in a single-binary product has to be licence-audited and shipped.
mod http {
    #![allow(unreachable_pub)]

    use std::io::{ErrorKind, Read as _, Write as _};
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

        let raw = read_response(&mut stream);
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
        if headers
            .to_ascii_lowercase()
            .contains("transfer-encoding: chunked")
        {
            body = dechunk(&body);
        }
        Response { status, body }
    }

    /// Reads exactly one response and stops there.
    ///
    /// Not `read_to_end`: waiting for the server's `FIN` after the answer is
    /// already in hand turns a perfectly good response into a
    /// `ConnectionReset`. `api.rs` carries the long version of the note.
    fn read_response(stream: &mut TcpStream) -> Vec<u8> {
        let mut raw = Vec::new();
        let mut buffer = [0_u8; 8192];
        while !is_complete(&raw) {
            match stream.read(&mut buffer) {
                Ok(0) => break,
                Ok(read) => raw.extend_from_slice(&buffer[..read]),
                Err(error) if error.kind() == ErrorKind::Interrupted => {}
                Err(error) => panic!("read failed after {} bytes: {error}", raw.len()),
            }
        }
        raw
    }

    fn is_complete(raw: &[u8]) -> bool {
        let Some(split) = raw.windows(4).position(|window| window == b"\r\n\r\n") else {
            return false;
        };
        let headers = String::from_utf8_lossy(&raw[..split]).to_ascii_lowercase();
        let body = &raw[split + 4..];
        if headers.contains("transfer-encoding: chunked") {
            return chunks_are_terminated(body);
        }
        match headers
            .lines()
            .find_map(|line| line.strip_prefix("content-length:"))
            .and_then(|value| value.trim().parse::<usize>().ok())
        {
            Some(length) => body.len() >= length,
            None => false,
        }
    }

    fn chunks_are_terminated(mut input: &[u8]) -> bool {
        loop {
            let Some(end) = input.windows(2).position(|w| w == b"\r\n") else {
                return false;
            };
            let Ok(size) = usize::from_str_radix(String::from_utf8_lossy(&input[..end]).trim(), 16)
            else {
                return false;
            };
            let start = end + 2;
            if size == 0 {
                let trailers = &input[start..];
                return trailers.starts_with(b"\r\n")
                    || trailers.windows(4).any(|window| window == b"\r\n\r\n");
            }
            if input.len() < start + size + 2 {
                return false;
            }
            input = &input[start + size + 2..];
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

    pub fn get(url: &str) -> Response {
        request("GET", url, None, None)
    }

    pub fn delete(url: &str) -> Response {
        request("DELETE", url, None, None)
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

/// Uploads a fixture under a chosen name.
fn import(harness: &Harness, filename: &str, bytes: &[u8]) -> http::Response {
    http::post_bytes(
        &harness.url(&format!("/api/fonts?filename={filename}")),
        "font/ttf",
        bytes,
    )
}

fn families(harness: &Harness) -> Vec<String> {
    http::get(&harness.url("/api/fonts")).json()["families"]
        .as_array()
        .expect("families is an array")
        .iter()
        .map(|value| value.as_str().unwrap_or_default().to_owned())
        .collect()
}

fn create_project(harness: &Harness, id: &str) {
    let response = http::post_json(
        &harness.url("/api/projects"),
        &json!({ "id": id, "width": 400.0, "height": 200.0, "background": "#ffffff" }),
    );
    assert_eq!(response.status, 201, "{}", response.json());
}

fn add_text(harness: &Harness, id: &str, family: &str) {
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
}

#[test]
fn listing_fonts_reports_families_and_faces() {
    let harness = Harness::start();

    // An empty store is an empty answer in both shapes, not a failure.
    let empty = http::get(&harness.url("/api/fonts")).json();
    assert_eq!(empty["families"], json!([]));
    assert_eq!(empty["faces"], json!([]));

    let bytes = fixture("NotoSans-Subset.ttf");
    let response = import(&harness, "NotoSans-Subset.ttf", &bytes);
    assert_eq!(response.status, 201, "{}", response.json());

    let body = response.json();
    assert_eq!(body["families"], json!(["Noto Sans"]));
    assert_eq!(body["imported"][0]["family"], "Noto Sans");
    // The client's file name is what the index records as the source, and
    // nothing claims a licence the uploader did not state.
    assert_eq!(body["imported"][0]["source"], "NotoSans-Subset.ttf");
    assert!(
        body["imported"][0].get("license").is_none(),
        "an uploaded font carries no licence: {}",
        body["imported"][0]
    );

    // `families` is what 1.4.0 clients read and is unchanged; `faces` is the
    // addition, and carries the content hash each face was stored under.
    let listed = http::get(&harness.url("/api/fonts")).json();
    assert_eq!(listed["families"], json!(["Noto Sans"]));
    let faces = listed["faces"].as_array().unwrap();
    assert_eq!(faces.len(), 1, "{listed}");
    assert_eq!(faces[0]["family"], "Noto Sans");
    assert_eq!(faces[0]["style"], "normal");
    assert_eq!(faces[0]["weight"], 400);
    assert!(
        faces[0]["hash"]
            .as_str()
            .unwrap_or_default()
            .starts_with("sha256:"),
        "{}",
        faces[0]
    );
}

#[test]
fn faces_are_ordered_by_family_then_weight_then_style() {
    let harness = Harness::start();
    for (name, file) in [
        ("NotoSansJP-Subset.ttf", "NotoSansJP-Subset.ttf"),
        ("NotoSans-Subset.ttf", "NotoSans-Subset.ttf"),
        ("NotoSansArabic-Subset.ttf", "NotoSansArabic-Subset.ttf"),
    ] {
        let response = import(&harness, name, &fixture(file));
        assert_eq!(response.status, 201, "{}", response.json());
    }

    let listed = http::get(&harness.url("/api/fonts")).json();
    let ordering: Vec<(String, u64, String)> = listed["faces"]
        .as_array()
        .unwrap()
        .iter()
        .map(|face| {
            (
                face["family"].as_str().unwrap_or_default().to_owned(),
                face["weight"].as_u64().unwrap_or_default(),
                face["style"].as_str().unwrap_or_default().to_owned(),
            )
        })
        .collect();
    let mut sorted = ordering.clone();
    sorted.sort();
    assert_eq!(ordering, sorted, "faces must arrive sorted");
}

#[test]
fn importing_the_same_bytes_twice_is_not_a_second_face() {
    let harness = Harness::start();
    let bytes = fixture("NotoSans-Subset.ttf");

    let first = import(&harness, "NotoSans-Subset.ttf", &bytes);
    assert_eq!(first.status, 201, "{}", first.json());

    // The same bytes again, and under a different name, so the only thing
    // that could make it "new" is the description rather than the font.
    let again = import(&harness, "renamed.ttf", &bytes);
    assert_eq!(
        again.status,
        200,
        "a font already in the store is not created again: {}",
        again.json()
    );
    assert_eq!(again.json()["imported"][0]["family"], "Noto Sans");

    let listed = http::get(&harness.url("/api/fonts")).json();
    assert_eq!(listed["families"], json!(["Noto Sans"]));
    assert_eq!(listed["faces"].as_array().unwrap().len(), 1, "{listed}");
    // The first import's description is the one kept.
    assert_eq!(listed["faces"][0]["source"], "NotoSans-Subset.ttf");
}

#[test]
fn every_accepted_container_really_imports() {
    // WOFF and WOFF2 are decompressed at import, so the store holds plain
    // OpenType and nothing decompresses anything at render time. The two
    // web-font fixtures are the same subset re-flavoured, so all
    // three arrive as the same family under different hashes.
    let harness = Harness::start();
    for file in [
        "NotoSans-Subset.ttf",
        "NotoSans-Subset.woff",
        "NotoSans-Subset.woff2",
    ] {
        let response = import(&harness, file, &fixture(file));
        assert_eq!(
            response.status,
            201,
            "{file} must import: {}",
            response.json()
        );
        assert_eq!(response.json()["imported"][0]["family"], "Noto Sans");
    }

    // Every stored file is what its recorded hash says it is.
    harness.store().verify().unwrap();
}

#[test]
fn a_name_that_is_not_a_font_format_is_refused_before_the_bytes_are_read() {
    let harness = Harness::start();
    let bytes = fixture("NotoSans-Subset.ttf");

    for filename in ["notes.txt", "font.exe", "font", "NotoSans-Subset.zip"] {
        let response = import(&harness, filename, &bytes);
        assert_eq!(response.status, 400, "{filename}: {}", response.json());
        assert_eq!(error_code(&response), "unsupportedFontFormat", "{filename}");
    }

    // Refused, and nothing was written.
    assert_eq!(families(&harness), Vec::<String>::new());
    assert!(harness.store().records().is_empty());

    // The extension test is case-insensitive: a font is not refused for
    // arriving from a system that shouts its file names.
    let response = import(&harness, "NotoSans-Subset.TTF", &bytes);
    assert_eq!(response.status, 201, "{}", response.json());
}

#[test]
fn bytes_that_are_not_a_font_are_refused_and_change_nothing() {
    let harness = Harness::start();
    // One real font first, so "unchanged" means something more than "empty".
    import(
        &harness,
        "NotoSans-Subset.ttf",
        &fixture("NotoSans-Subset.ttf"),
    );
    let before = harness.store().records().to_vec();

    let response = import(&harness, "trouble.ttf", b"this is not a font at all");
    assert_eq!(response.status, 422, "{}", response.json());
    assert_eq!(error_code(&response), "invalidFont");

    assert_eq!(harness.store().records(), before.as_slice());
    assert_eq!(families(&harness), vec!["Noto Sans".to_owned()]);

    // A web-font container that cannot be decompressed reports the same way,
    // and names the format rather than leaving a client to guess.
    let mut broken = fixture("NotoSans-Subset.woff2");
    for byte in broken.iter_mut().skip(48) {
        *byte ^= 0xff;
    }
    let response = import(&harness, "broken.woff2", &broken);
    assert_eq!(response.status, 422, "{}", response.json());
    assert_eq!(error_code(&response), "invalidFont");
    assert_eq!(harness.store().records(), before.as_slice());
}

#[test]
fn a_font_name_that_is_really_a_path_is_refused() {
    let harness = Harness::start();
    let bytes = fixture("NotoSans-Subset.ttf");
    for filename in ["..%2F..%2Fescape.ttf", "sub%2Fdir.ttf"] {
        let response = import(&harness, filename, &bytes);
        assert_eq!(response.status, 400, "{filename}: {}", response.json());
        assert_eq!(error_code(&response), "invalidFilename", "{filename}");
    }
    assert!(harness.store().records().is_empty());
}

#[test]
fn removing_a_family_takes_it_out_of_the_store_and_the_render_path() {
    let harness = Harness::start();
    let response = import(
        &harness,
        "NotoSans-Subset.ttf",
        &fixture("NotoSans-Subset.ttf"),
    );
    assert_eq!(response.status, 201, "{}", response.json());

    create_project(&harness, "poster");
    add_text(&harness, "poster", "Noto Sans");

    // Before: the font is there and the project renders.
    let preview = http::get(&harness.url("/api/projects/poster/preview.png"));
    assert_eq!(
        preview.status,
        200,
        "{}",
        String::from_utf8_lossy(&preview.body)
    );
    assert_eq!(&preview.body[1..4], b"PNG");

    // The family is percent-encoded by the client, and decoded here.
    let removed = http::delete(&harness.url("/api/fonts/Noto%20Sans"));
    assert_eq!(removed.status, 200, "{}", removed.json());
    assert_eq!(removed.json()["removed"], 1);
    assert_eq!(removed.json()["families"], json!([]));

    // After: the same request fails, in the same process, with no restart.
    // This is the assertion the parsed-font cache exists to threaten — a
    // cache that outlived the store would keep rendering a removed font.
    let preview = http::get(&harness.url("/api/projects/poster/preview.png"));
    assert_eq!(
        preview.status,
        422,
        "a removed font must stop rendering: {}",
        String::from_utf8_lossy(&preview.body)
    );
    assert_eq!(error_code(&preview), "missingFont");
    assert_eq!(preview.json()["error"]["details"]["family"], "Noto Sans");

    // The file itself is gone, not merely unlisted.
    let left: Vec<String> = std::fs::read_dir(harness.root.join(FONTS_DIR))
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
        .filter(|name| name != "index.json")
        .collect();
    assert!(left.is_empty(), "left behind {left:?}");
}

#[test]
fn removing_a_family_the_store_does_not_have_is_a_404() {
    let harness = Harness::start();
    import(
        &harness,
        "NotoSans-Subset.ttf",
        &fixture("NotoSans-Subset.ttf"),
    );

    let first = http::delete(&harness.url("/api/fonts/Noto%20Sans"));
    assert_eq!(first.status, 200, "{}", first.json());

    let again = http::delete(&harness.url("/api/fonts/Noto%20Sans"));
    assert_eq!(again.status, 404, "{}", again.json());
    assert_eq!(error_code(&again), "unknownFontFamily");
    assert_eq!(again.json()["error"]["details"]["family"], "Noto Sans");

    let never = http::delete(&harness.url("/api/fonts/Comic%20Sans%20MS"));
    assert_eq!(never.status, 404, "{}", never.json());
    assert_eq!(error_code(&never), "unknownFontFamily");
}

/// Renames every face in the store's index to `family`, outside the server.
///
/// A font's family comes out of its own `name` table, so a store holding a
/// family called "install" cannot be built by importing one — and the point
/// of the test below is what the route does once such a family exists, not
/// how it got there. The index on disk is the store's whole state, and the
/// handlers reopen it per request, so rewriting it is enough.
fn rename_every_family_to(harness: &Harness, family: &str) {
    let index = harness.root.join(FONTS_DIR).join("index.json");
    let mut json: serde_json::Value =
        serde_json::from_slice(&std::fs::read(&index).unwrap()).unwrap();
    for face in json["fonts"].as_array_mut().expect("the index lists faces") {
        face["family"] = json!(family);
    }
    std::fs::write(&index, serde_json::to_vec_pretty(&json).unwrap()).unwrap();
}

#[test]
fn a_family_named_after_one_of_the_two_fixed_font_routes_can_be_removed() {
    // `/api/fonts/catalogue` and `/api/fonts/install` are fixed segments, so
    // they win over `/api/fonts/{family}`: until 1.6.0 a family literally
    // called "install" could be imported and listed but never deleted, and
    // the 405 said nothing a client could act on (DEF-21). Each fixed route
    // now carries the removal for its own name.
    for name in ["install", "catalogue"] {
        let harness = Harness::start();
        assert_eq!(
            import(&harness, "noto.ttf", &fixture("NotoSans-Subset.ttf")).status,
            201
        );
        rename_every_family_to(&harness, name);
        assert_eq!(families(&harness), vec![name.to_owned()]);

        let removed = http::delete(&harness.url(&format!("/api/fonts/{name}")));
        assert_eq!(removed.status, 200, "{}", removed.json());
        assert_eq!(removed.json()["removed"], 1);
        assert_eq!(removed.json()["families"], json!([]));

        // Gone from the store as well as from the answer.
        assert_eq!(families(&harness), Vec::<String>::new());
        assert!(!harness.store().has_family(name));

        // And the two routes' other methods still do what they did.
        assert_eq!(http::get(&harness.url("/api/fonts/catalogue")).status, 200);
    }
}

#[test]
fn a_family_named_after_a_fixed_route_but_absent_reports_like_any_other() {
    // The removal is the same code either way, so a name that is not there
    // is the same 404 with the same code — not a 405, and not a silent 200.
    let harness = Harness::start();
    for name in ["install", "catalogue", "Installer"] {
        let response = http::delete(&harness.url(&format!("/api/fonts/{name}")));
        assert_eq!(response.status, 404, "{name}: {}", response.json());
        assert_eq!(error_code(&response), "unknownFontFamily");
        assert_eq!(response.json()["error"]["details"]["family"], json!(name));
    }
}

#[test]
fn a_font_over_the_body_limit_is_refused_in_the_usual_envelope() {
    // Every other failure this API has comes back as
    // `{"error": {"code", "message", "details"}}`; axum's own answer to an
    // over-limit body is plain text, which made the one mistake an upload
    // form makes most often the one a client could not read (DEF-20).
    //
    // The ceiling here is 1 MiB rather than the shipped 64 MiB: the handler
    // names the limit it was built with, so the small one proves the same
    // path without moving 64 MiB down a loopback socket.
    let harness = Harness::start_limited(
        Arc::new(FakeFetcher::default()),
        None,
        assemblash_server::api::BodyLimits::testing(1024 * 1024, 1024 * 1024),
    );

    let mut oversize = fixture("NotoSans-Subset.ttf");
    oversize.resize(1024 * 1024 + 1, 0);
    let response = import(&harness, "big.ttf", &oversize);
    assert_eq!(
        response.status,
        413,
        "{}",
        String::from_utf8_lossy(&response.body)
    );
    assert_eq!(error_code(&response), "payloadTooLarge");
    let message = response.json()["error"]["message"]
        .as_str()
        .unwrap_or_default()
        .to_owned();
    assert!(
        message.contains("1 MiB"),
        "the message must name the limit in MiB: {message}"
    );
    assert_eq!(
        response.json()["error"]["details"]["limitBytes"],
        1024 * 1024
    );

    // Nothing was imported, and a body under the limit still is.
    assert_eq!(families(&harness), Vec::<String>::new());
    assert_eq!(
        import(&harness, "noto.ttf", &fixture("NotoSans-Subset.ttf")).status,
        201
    );
}

#[test]
fn the_catalogue_says_what_the_install_button_would_fetch() {
    let harness = Harness::start();
    let catalogue = http::get(&harness.url("/api/fonts/catalogue")).json();

    assert_eq!(
        catalogue["packs"]["default"],
        json!(["Noto Sans", "Noto Serif", "Noto Sans Mono"]),
        "{catalogue}"
    );

    let families = catalogue["families"].as_array().unwrap();
    let noto = families
        .iter()
        .find(|family| family["family"] == "Noto Sans")
        .expect("Noto Sans is in the catalogue");
    assert_eq!(noto["license"], "OFL-1.1");
    assert!(noto["bytes"].as_u64().unwrap_or_default() > 0, "{noto}");
    assert_eq!(noto["packs"], json!(["default"]));

    // Every family in a pack is also listed on its own, so a client can size
    // an install without joining two lists by hand.
    let total: u64 = ["Noto Sans", "Noto Serif", "Noto Sans Mono"]
        .iter()
        .map(|name| {
            families
                .iter()
                .find(|family| family["family"] == *name)
                .and_then(|family| family["bytes"].as_u64())
                .unwrap_or_default()
        })
        .sum();
    assert!(
        (7_000_000..9_000_000).contains(&total),
        // Since DEF-25's fix each family's total covers its variable font
        // *and* its bold face, so the pack is about 7.3 MB, not 5.6.
        "the default pack (variable fonts plus bold faces) is about 7.3 MB, got {total}"
    );

    // Reading the catalogue reaches nothing: it is the compiled-in manifest.
    assert_eq!(harness.fetcher().calls(), 0);
}

#[test]
fn installing_a_pack_stores_every_family_in_it() {
    let manifest = fixture_manifest(&[
        ("Noto Sans", "NotoSans-Subset.ttf", "test"),
        ("Noto Sans Arabic", "NotoSansArabic-Subset.ttf", "test"),
    ]);
    let fetcher = Arc::new(FakeFetcher {
        files: manifest
            .families
            .iter()
            .map(|entry| (fixture_url(&entry.path), Ok(fixture(&entry.path))))
            .collect(),
        calls: AtomicUsize::new(0),
    });
    let harness = Harness::start_with(fetcher, Some(manifest));

    let response = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "pack": "test" }),
    );
    assert_eq!(response.status, 201, "{}", response.json());
    let body = response.json();
    assert_eq!(body["families"], json!(["Noto Sans", "Noto Sans Arabic"]));
    assert_eq!(body["installed"].as_array().unwrap().len(), 2, "{body}");
    // An installed font records where it came from and under what licence,
    // which an uploaded one cannot.
    assert_eq!(body["installed"][0]["license"], "OFL-1.1");

    assert_eq!(harness.fetcher().calls(), 2);
    harness.store().verify().unwrap();
    assert_eq!(
        families(&harness),
        vec!["Noto Sans".to_owned(), "Noto Sans Arabic".to_owned()]
    );
}

#[test]
fn installing_one_family_stores_only_that_one() {
    let manifest = fixture_manifest(&[
        ("Noto Sans", "NotoSans-Subset.ttf", "test"),
        ("Noto Sans Arabic", "NotoSansArabic-Subset.ttf", "test"),
    ]);
    let fetcher = Arc::new(FakeFetcher {
        files: manifest
            .families
            .iter()
            .map(|entry| (fixture_url(&entry.path), Ok(fixture(&entry.path))))
            .collect(),
        calls: AtomicUsize::new(0),
    });
    let harness = Harness::start_with(fetcher, Some(manifest));

    let response = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "family": "Noto Sans Arabic" }),
    );
    assert_eq!(response.status, 201, "{}", response.json());
    assert_eq!(families(&harness), vec!["Noto Sans Arabic".to_owned()]);
    assert_eq!(harness.fetcher().calls(), 1);
}

#[test]
fn a_failed_download_leaves_the_store_exactly_as_it_was() {
    let manifest = fixture_manifest(&[
        ("Noto Sans", "NotoSans-Subset.ttf", "test"),
        ("Noto Sans Arabic", "NotoSansArabic-Subset.ttf", "test"),
    ]);
    // The first family downloads perfectly; the second does not. A store
    // that ended up holding the first would be a partial install a caller
    // was told had failed.
    let mut files = BTreeMap::new();
    files.insert(
        fixture_url("NotoSans-Subset.ttf"),
        Ok(fixture("NotoSans-Subset.ttf")),
    );
    files.insert(
        fixture_url("NotoSansArabic-Subset.ttf"),
        Err("the upstream is having a day".to_owned()),
    );
    let fetcher = Arc::new(FakeFetcher {
        files,
        calls: AtomicUsize::new(0),
    });
    let harness = Harness::start_with(fetcher, Some(manifest));

    let response = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "pack": "test" }),
    );
    assert_eq!(response.status, 502, "{}", response.json());
    assert_eq!(error_code(&response), "fontInstallFailed");

    assert_eq!(families(&harness), Vec::<String>::new());
    assert!(
        harness.store().records().is_empty(),
        "a failed install stored something: {:?}",
        harness.store().records()
    );
    // Not even a stray file: nothing reached the directory at all.
    let left: Vec<String> = std::fs::read_dir(harness.root.join(FONTS_DIR))
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
        .filter(|name| name != "index.json")
        .collect();
    assert!(left.is_empty(), "left behind {left:?}");
}

#[test]
fn bytes_that_are_not_the_pinned_ones_are_refused_before_the_store_sees_them() {
    // The manifest pins Noto Sans, and what arrives is the Arabic subset:
    // the right shape, the wrong bytes. Storing it would make this install
    // render differently from the same install anywhere else.
    let manifest = fixture_manifest(&[("Noto Sans", "NotoSans-Subset.ttf", "test")]);
    let mut files = BTreeMap::new();
    files.insert(
        fixture_url("NotoSans-Subset.ttf"),
        Ok(fixture("NotoSansArabic-Subset.ttf")),
    );
    let fetcher = Arc::new(FakeFetcher {
        files,
        calls: AtomicUsize::new(0),
    });
    let harness = Harness::start_with(fetcher, Some(manifest));

    let response = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "family": "Noto Sans" }),
    );
    assert_eq!(response.status, 502, "{}", response.json());
    assert_eq!(error_code(&response), "fontInstallFailed");
    let details = response.json()["error"]["details"].clone();
    assert_eq!(details["family"], "Noto Sans");
    assert_ne!(details["expected"], details["actual"]);

    assert!(harness.store().records().is_empty());
    assert_eq!(families(&harness), Vec::<String>::new());
}

#[test]
fn an_install_of_something_the_manifest_has_never_heard_of_fetches_nothing() {
    // The bundled manifest this time, because these two answers are about
    // what may be installed at all rather than about downloading.
    let harness = Harness::start();

    let family = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "family": "Comic Sans MS" }),
    );
    assert_eq!(family.status, 404, "{}", family.json());
    assert_eq!(error_code(&family), "unknownFontFamily");
    assert_eq!(family.json()["error"]["details"]["family"], "Comic Sans MS");

    let pack = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "pack": "everything" }),
    );
    assert_eq!(pack.status, 404, "{}", pack.json());
    assert_eq!(error_code(&pack), "unknownFontPack");
    assert_eq!(pack.json()["error"]["details"]["pack"], "everything");

    // The lookup fails before anything is fetched, so a typo costs nothing.
    assert_eq!(harness.fetcher().calls(), 0);
    assert!(harness.store().records().is_empty());
}

#[test]
fn an_install_names_exactly_one_of_pack_or_family() {
    let harness = Harness::start();

    for body in [
        json!({}),
        json!({ "pack": "default", "family": "Noto Sans" }),
    ] {
        let response = http::post_json(&harness.url("/api/fonts/install"), &body);
        assert_eq!(response.status, 400, "{body}: {}", response.json());
        assert_eq!(error_code(&response), "badRequest", "{body}");
    }

    // DEF-17: an unknown key is refused rather than silently dropped, so a
    // misspelt field cannot succeed while doing something else than it said.
    let response = http::post_json(
        &harness.url("/api/fonts/install"),
        &json!({ "packs": "default" }),
    );
    assert_eq!(response.status, 400, "{}", response.json());
    assert_eq!(error_code(&response), "malformedRequest");

    assert_eq!(harness.fetcher().calls(), 0);
}

#[test]
fn eight_concurrent_imports_lose_nothing() {
    let harness = Harness::start();

    // Four distinct fonts, each offered twice under a different name. The
    // duplicates are the interesting half: they must collapse to one face,
    // and the distinct ones must all survive — an index written from a copy
    // read before a neighbour's write would drop one or the other.
    let fixtures = [
        ("NotoSans-Subset.ttf", "Noto Sans"),
        ("NotoSansArabic-Subset.ttf", "Noto Sans Arabic"),
        ("NotoSansJP-Subset.ttf", "Noto Sans JP"),
        ("TwoFamilyNames-Subset.ttf", "Assemblash Two Names"),
    ];

    let statuses: Vec<u16> = std::thread::scope(|scope| {
        let handles: Vec<_> = fixtures
            .iter()
            .flat_map(|(file, _)| {
                [
                    (*file, format!("first-{file}")),
                    (*file, format!("second-{file}")),
                ]
            })
            .map(|(file, name)| {
                let harness = &harness;
                scope.spawn(move || import(harness, &name, &fixture(file)).status)
            })
            .collect();
        handles
            .into_iter()
            .map(|handle| handle.join().expect("the import thread finished"))
            .collect()
    });

    // Each font was accepted twice: exactly one of each pair created a face
    // and the other found it already there.
    assert_eq!(statuses.len(), 8);
    assert!(
        statuses
            .iter()
            .all(|status| *status == 200 || *status == 201),
        "{statuses:?}"
    );
    assert_eq!(
        statuses.iter().filter(|status| **status == 201).count(),
        4,
        "one create per distinct font: {statuses:?}"
    );

    let mut expected: Vec<String> = fixtures
        .iter()
        .map(|(_, family)| (*family).to_owned())
        .collect();
    expected.sort();
    assert_eq!(families(&harness), expected);

    // Every face is in the index once, every stored file is what the index
    // says it is, and the server agrees with the disk.
    let store = harness.store();
    assert_eq!(store.records().len(), 4, "{:?}", store.records());
    store.verify().unwrap();
    assert_eq!(
        http::get(&harness.url("/api/fonts")).json()["faces"]
            .as_array()
            .unwrap()
            .len(),
        4
    );
}

#[test]
fn a_font_far_larger_than_the_default_body_limit_is_accepted() {
    // axum's default ceiling is 2 MB and a CJK font is fifteen times that,
    // so the import route sets its own. Sending real font bytes followed by
    // padding proves the limit rather than the parser: the body arrives
    // whole, and it is the *content* that is then refused.
    let harness = Harness::start();
    let mut padded = fixture("NotoSans-Subset.ttf");
    padded.resize(6 * 1024 * 1024, 0);

    let response = import(&harness, "padded.ttf", &padded);
    assert_ne!(
        response.status, 413,
        "a 6 MB font must not be refused for its size"
    );
    assert_eq!(response.status, 201, "{}", response.json());
    assert_eq!(response.json()["families"], json!(["Noto Sans"]));
}
