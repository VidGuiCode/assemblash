//! The v0.13.0 exit test's automated half: a batch of variants rendered at the
//! command line and the same batch rendered over HTTP must agree hash for
//! hash, on the same machine with the same fonts.
//!
//! The interface has no fill path of its own — it posts to the endpoint this
//! test posts to — so proving the two transports agree is what makes "the
//! gallery shows what the CLI would have produced" a checked claim rather than
//! an argument from shared code. The browser half is run by hand against the
//! released artifact and recorded in the release notes.
//!
//! Both processes here are the real binary: `assemblash variants` and
//! `assemblash serve`.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{BufRead as _, Read as _};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

fn font_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../assemblash-renderer/tests/fonts")
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

/// A blocking HTTP/1.1 client, hand-rolled.
///
/// Small on purpose: the product ships one binary, and every dependency has
/// to be licence-audited and carried (R8). A test-only HTTP client is not
/// worth that.
mod http {
    #![allow(unreachable_pub)]

    use std::io::{Read as _, Write as _};
    use std::net::TcpStream;

    pub struct Response {
        pub status: u16,
        pub body: Vec<u8>,
    }

    pub fn request(method: &str, url: &str, body: Option<&[u8]>) -> Response {
        let rest = url.strip_prefix("http://").expect("an http url");
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
        if !body.is_empty() {
            head.push_str("Content-Type: application/json\r\n");
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
            .expect("a status line");

        let mut body = raw[split + 4..].to_vec();
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
}

/// The server, as a child process, stopped when the test ends.
struct Serving {
    child: Child,
    url: String,
}

impl Serving {
    /// Starts `assemblash serve` on a port the OS picks and waits for its URL.
    ///
    /// `--port 0` and reading the printed URL rather than guessing a port:
    /// tests run in parallel and on other people's machines.
    fn start(workspace: &Path) -> Self {
        let mut child = Command::new(binary())
            .args(["serve", "--port", "0"])
            .arg("--workspace")
            .arg(workspace)
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .expect("the binary runs");

        let stdout = child.stdout.take().expect("stdout is piped");
        let mut reader = std::io::BufReader::new(stdout);
        let mut line = String::new();
        reader
            .read_line(&mut line)
            .expect("the server prints a url");
        let url = line.trim().to_owned();
        assert!(
            url.starts_with("http://127.0.0.1:"),
            "a server started for a person is loopback-only, got {url:?}"
        );
        // The pipe is drained on a thread: a server whose stdout filled up
        // would block, and the test would hang rather than fail.
        std::thread::spawn(move || {
            let mut sink = Vec::new();
            let _ = reader.read_to_end(&mut sink);
        });

        Self { child, url }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.url)
    }
}

impl Drop for Serving {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// Makes an ordinary project into a template.
///
/// `slots` is a document field with no operation that sets it: a template is
/// authored by writing one, which is what this does.
fn declare_slot(project: &Path, layer: &str) {
    let path = project.join("document.json");
    let mut document: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    document["slots"] = serde_json::json!([{
        "name": "headline",
        "layer": layer,
        "kind": "text",
        "description": "The big line",
        "required": true
    }]);
    let mut text = serde_json::to_string_pretty(&document).unwrap();
    text.push('\n');
    std::fs::write(&path, text).unwrap();
}

#[test]
fn the_command_line_and_the_http_api_render_identical_variants() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = scratch.path().join("data");
    let workspace_arg = workspace.to_str().unwrap();

    run(&["workspace", "--workspace", workspace_arg]);
    let store = workspace.join("fonts");
    let store_arg = store.to_str().unwrap();
    run(&[
        "font",
        "add",
        font_dir().join("NotoSans-Subset.ttf").to_str().unwrap(),
        "--license",
        "OFL-1.1",
        "--font-store",
        store_arg,
    ]);

    let project = workspace.join("projects").join("flyer");
    let project_arg = project.to_str().unwrap();
    run(&[
        "new",
        project_arg,
        "--width",
        "400",
        "--height",
        "200",
        "--background",
        "#ffffff",
        "--name",
        "Flyer",
    ]);
    let layer = run(&[
        "add-text",
        project_arg,
        "--text",
        "placeholder",
        "--font",
        "Noto Sans",
        "--size",
        "32",
        "--x",
        "10",
        "--y",
        "10",
        "--width",
        "380",
        "--height",
        "80",
        "--font-store",
        store_arg,
    ])
    .trim()
    .to_owned();
    declare_slot(&project, &layer);

    // The same three variants, described the same way, for both transports:
    // the file the CLI reads is the file the interface's "load values" takes.
    let variants = serde_json::json!([
        { "name": "alpha", "values": { "headline": "Alpha" } },
        { "name": "beta", "values": { "headline": "Beta" } },
        { "name": "gamma", "values": { "headline": "Gamma" } }
    ]);
    let values_file = scratch.path().join("values.json");
    std::fs::write(&values_file, variants.to_string()).unwrap();

    let printed = run(&[
        "variants",
        project_arg,
        "--values",
        values_file.to_str().unwrap(),
        "--font-store",
        store_arg,
    ]);
    let from_cli: Vec<(String, String)> = printed
        .lines()
        .map(|line| {
            let mut fields = line.split('\t');
            let name = fields.next().expect("a name").to_owned();
            let hash = fields.nth(1).expect("a hash").to_owned();
            (name, hash)
        })
        .collect();
    assert_eq!(from_cli.len(), 3, "{printed}");
    assert!(
        from_cli.iter().all(|(_, hash)| hash.starts_with("sha256:")),
        "{printed}"
    );

    let server = Serving::start(&workspace);

    // What the page sees before it draws the form.
    let slots = server_json(&server, "/api/projects/flyer/slots");
    assert_eq!(slots["isTemplate"], true);
    assert_eq!(slots["slots"][0]["name"], "headline");

    let response = http::request(
        "POST",
        &server.url("/api/projects/flyer/variants"),
        Some(
            serde_json::json!({ "variants": variants, "scale": 1.0 })
                .to_string()
                .as_bytes(),
        ),
    );
    assert_eq!(
        response.status,
        200,
        "{}",
        String::from_utf8_lossy(&response.body)
    );
    let batch: serde_json::Value = serde_json::from_slice(&response.body).unwrap();
    let from_http: Vec<(String, String)> = batch["variants"]
        .as_array()
        .unwrap()
        .iter()
        .map(|variant| {
            (
                variant["name"].as_str().unwrap().to_owned(),
                variant["hash"].as_str().unwrap().to_owned(),
            )
        })
        .collect();

    // The claim this milestone makes: same template, same values, same bytes,
    // whichever surface asked (NFR-3).
    assert_eq!(from_http, from_cli, "the transports disagree");

    // And what the gallery would actually show is those bytes, not a
    // re-render that merely resembles them.
    for (name, hash) in &from_http {
        let png = http::request(
            "GET",
            &server.url(&format!("/api/projects/flyer/exports/{name}.png")),
            None,
        );
        assert_eq!(png.status, 200, "{name}");
        assert_eq!(
            &assemblash_core::storage::hash_bytes(&png.body),
            hash,
            "the PNG served for {name} is not the one the batch reported"
        );
    }

    // Different values, different pictures — otherwise the equality above
    // would hold for a batch that ignored what it was given.
    let distinct: std::collections::BTreeSet<&String> =
        from_http.iter().map(|(_, hash)| hash).collect();
    assert_eq!(distinct.len(), 3, "{from_http:?}");
}

fn server_json(server: &Serving, path: &str) -> serde_json::Value {
    let response = http::request("GET", &server.url(path), None);
    assert_eq!(
        response.status,
        200,
        "{path}: {}",
        String::from_utf8_lossy(&response.body)
    );
    serde_json::from_slice(&response.body).unwrap()
}
