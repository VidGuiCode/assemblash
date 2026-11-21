//! The 1.15.0 exit tests that run on one machine: charts, tables and QR
//! codes through every surface.
//!
//! * Exit test 2: a chart tile has non-zero label ink.
//! * Exit test 3: one spec through the CLI, HTTP and MCP gives the same asset
//!   hash and, with a shadow and a clip on the layer, the same PNG.
//! * Exit test 4: bar to line regenerates from the recorded spec with no data
//!   re-entry, and undo restores the layer exactly.
//! * Exit test 5: a QR code at three sizes decodes with an off-the-shelf
//!   reader.
//!
//! Exit test 1 (the same bytes on six targets) is the pinned-hash test in
//! `assemblash-export`, run by the CI matrix.
//!
//! Every process here is the real binary.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{BufRead as _, Read as _};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

use serde_json::{json, Value};

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
}

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/fonts/Inter-Regular.ttf")
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

#[track_caller]
fn run_fails(args: &[&str]) -> String {
    let output = Command::new(binary())
        .args(args)
        .output()
        .expect("the binary runs");
    assert!(!output.status.success(), "assemblash {args:?} succeeded");
    String::from_utf8_lossy(&output.stderr).into_owned()
}

/// A blocking HTTP/1.1 client, hand-rolled.
///
/// Small on purpose: the product ships one binary, and every dependency has
/// to be licence-audited and carried (R8). A test-only HTTP client is not
/// worth that.
mod http {
    #![allow(unreachable_pub)]

    use std::io::{ErrorKind, Read as _, Write as _};
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

    /// Reads exactly one HTTP response, and stops there.
    ///
    /// Not `read_to_end`: that waits for the server's `FIN` after the answer
    /// is already in hand, and a host closing a connection with anything still
    /// unread in its receive queue must send `RST` instead — which fails the
    /// pending read with `ConnectionReset` for a response that arrived
    /// perfectly well. `assemblash-server/tests/round_trip.rs` carries the long
    /// version of the note; this is the same client and had the same latent
    /// flake.
    fn read_response(stream: &mut TcpStream) -> Vec<u8> {
        let mut raw = Vec::new();
        let mut buffer = [0_u8; 8192];
        while !is_complete(&raw) {
            match stream.read(&mut buffer) {
                Ok(0) => break,
                Ok(read) => raw.extend_from_slice(&buffer[..read]),
                Err(error) if error.kind() == ErrorKind::Interrupted => {}
                Err(error)
                    if matches!(
                        error.kind(),
                        ErrorKind::ConnectionReset | ErrorKind::ConnectionAborted
                    ) =>
                {
                    panic!(
                        "the connection was reset after {} incomplete bytes ({error}): {}",
                        raw.len(),
                        String::from_utf8_lossy(&raw)
                    )
                }
                Err(error) => panic!("read failed after {} bytes: {error}", raw.len()),
            }
        }
        raw
    }

    /// Whether `raw` already holds a whole response. A response with neither
    /// `Content-Length` nor `chunked` is delimited by the close itself.
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

    /// Whether a chunked body has reached its zero-length terminator.
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
                // The zero-sized chunk is followed by a trailer section. With
                // no trailers that section is one final CRLF; with trailers it
                // ends at the first empty line.
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

/// A workspace with Inter installed and one empty project for each name.
struct Fixture {
    _scratch: tempfile::TempDir,
    workspace: PathBuf,
}

impl Fixture {
    fn new(projects: &[&str]) -> Self {
        let scratch = tempfile::tempdir().unwrap();
        let workspace = scratch.path().join("workspace");
        run(&["workspace", "--workspace", workspace.to_str().unwrap()]);
        run(&[
            "font",
            "add",
            font_fixture().to_str().unwrap(),
            "--license",
            "OFL-1.1",
            "--font-store",
            workspace.join("fonts").to_str().unwrap(),
        ]);
        let fixture = Self {
            _scratch: scratch,
            workspace,
        };
        for name in projects {
            run(&[
                "new",
                fixture.project(name).to_str().unwrap(),
                "--width",
                "900",
                "--height",
                "600",
                "--background",
                "#ffffff",
            ]);
        }
        fixture
    }

    fn project(&self, name: &str) -> PathBuf {
        self.workspace.join("projects").join(name)
    }

    fn store(&self) -> String {
        self.workspace.join("fonts").to_str().unwrap().to_owned()
    }

    fn file(&self, name: &str, contents: &str) -> PathBuf {
        let path = self.workspace.join(name);
        std::fs::write(&path, contents).unwrap();
        path
    }

    fn document(&self, name: &str) -> Value {
        serde_json::from_slice(&std::fs::read(self.project(name).join("document.json")).unwrap())
            .unwrap()
    }

    fn export(&self, name: &str) -> Vec<u8> {
        let out = self.workspace.join(format!("{name}.png"));
        run(&[
            "export",
            self.project(name).to_str().unwrap(),
            "--out",
            out.to_str().unwrap(),
            "--font-store",
            &self.store(),
        ]);
        std::fs::read(out).unwrap()
    }
}

fn chart_spec() -> Value {
    json!({
        "type": "bar",
        "title": "Sales by quarter",
        "categories": ["Q1", "Q2", "Q3", "Q4"],
        "series": [
            { "name": "North", "values": [12, 18, 9, 21] },
            { "name": "South", "values": [7, 11, 14, 16] }
        ],
        "fontFamily": "Inter",
        "valueLabels": true
    })
}

/// Sends MCP frames to `assemblash mcp` over stdio and returns each tool
/// call's structured result.
fn mcp_calls(workspace: &Path, calls: &[(&str, Value)]) -> Vec<Value> {
    use std::io::Write as _;

    let mut child = Command::new(binary())
        .args(["mcp", "--workspace"])
        .arg(workspace)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("the MCP server starts");
    let mut input = child.stdin.take().expect("stdin");
    let mut output = std::io::BufReader::new(child.stdout.take().expect("stdout"));
    let mut send = |value: Value| {
        writeln!(input, "{value}").expect("write");
        input.flush().expect("flush");
    };
    let mut receive = || loop {
        let mut line = String::new();
        let read = output.read_line(&mut line).expect("read");
        assert!(read > 0, "the server closed the connection");
        if !line.trim().is_empty() {
            return serde_json::from_str::<Value>(&line).unwrap();
        }
    };

    send(json!({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {
            "protocolVersion": "2025-06-18",
            "capabilities": {},
            "clientInfo": { "name": "generated layers test", "version": "1.0.0" }
        }
    }));
    receive();
    send(json!({ "jsonrpc": "2.0", "method": "notifications/initialized" }));

    let mut results = Vec::new();
    for (index, (name, arguments)) in calls.iter().enumerate() {
        send(json!({
            "jsonrpc": "2.0", "id": index + 2, "method": "tools/call",
            "params": { "name": name, "arguments": arguments }
        }));
        let answer = receive();
        assert!(
            answer["result"]["isError"] != json!(true) && answer.get("error").is_none(),
            "{name} failed: {answer}"
        );
        results.push(answer["result"]["structuredContent"].clone());
    }
    // Closing stdin ends the session cleanly, which releases the locks.
    drop(input);
    let finished = child.wait_with_output().expect("the server exits");
    assert!(
        finished.status.success(),
        "the MCP server exited badly: {}",
        String::from_utf8_lossy(&finished.stderr)
    );
    results
}

fn pixels(png: &[u8]) -> Vec<u8> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png));
    let mut reader = decoder.read_info().unwrap();
    let mut pixels = vec![0; reader.output_buffer_size().unwrap()];
    let frame = reader.next_frame(&mut pixels).unwrap();
    pixels.truncate(frame.buffer_size());
    pixels
}

/// Exit tests 2 and 3.
#[test]
fn one_chart_spec_gives_the_same_tile_through_cli_http_and_mcp() {
    let fixture = Fixture::new(&["cli", "http", "mcp"]);
    let spec_file = fixture.file("chart.json", &chart_spec().to_string());
    let box_ = [
        "--x", "50", "--y", "50", "--width", "800", "--height", "500",
    ];

    // CLI.
    let mut args = vec![
        "add-chart",
        fixture.project("cli").to_str().unwrap().to_owned().leak() as &str,
        "--spec",
        spec_file.to_str().unwrap(),
        "--font-store",
    ];
    let store = fixture.store();
    args.push(&store);
    args.extend(box_);
    let printed = run(&args);
    let (cli_layer, cli_hash) = printed.trim().split_once('\t').unwrap();

    // HTTP.
    let mut spec = chart_spec();
    spec["kind"] = json!("chart");
    let (http_layer, http_hash) = {
        let server = Serving::start(&fixture.workspace);
        let response = http::request(
            "POST",
            &server.url("/api/projects/http/generated-layers"),
            Some(
                json!({
                    "spec": spec,
                    "transform": { "x": 50, "y": 50, "width": 800, "height": 500 }
                })
                .to_string()
                .as_bytes(),
            ),
        );
        let body: Value = serde_json::from_slice(&response.body).unwrap();
        assert_eq!(response.status, 201, "{body}");
        // Closing the project releases its lock for the CLI below.
        let closed = http::request("POST", &server.url("/api/projects/http/close"), Some(b"{}"));
        assert!(closed.status < 300, "close: {}", closed.status);
        (
            body["layer"].as_str().unwrap().to_owned(),
            body["assetHash"].as_str().unwrap().to_owned(),
        )
    };

    // MCP, after the server has stopped, so this is the local stdio path.
    let results = mcp_calls(
        &fixture.workspace,
        &[(
            "add_chart_layer",
            json!({
                "project": "mcp",
                "spec": chart_spec(),
                "x": 50, "y": 50, "width": 800, "height": 500
            }),
        )],
    );
    let mcp_layer = results[0]["layerId"].as_str().unwrap().to_owned();
    let mcp_hash = results[0]["assetHash"].as_str().unwrap().to_owned();

    assert_eq!(cli_hash, http_hash, "CLI and HTTP made different assets");
    assert_eq!(cli_hash, mcp_hash, "CLI and MCP made different assets");

    // The same shadow and clip on each tile, then the same picture.
    for (name, layer) in [
        ("cli", cli_layer),
        ("http", &http_layer),
        ("mcp", &mcp_layer),
    ] {
        run(&[
            "set",
            fixture.project(name).to_str().unwrap(),
            "--layer",
            layer,
            "--effects",
            r##"[{"type":"dropShadow","dx":6,"dy":6,"blur":4,"color":"#00000066"}]"##,
            "--clip-rect",
            "--clip-radius",
            "24",
        ]);
    }
    // Pixels, not file bytes: the PNG metadata names each project's own
    // document id.
    let cli_png = fixture.export("cli");
    if let Some(path) = std::env::var_os("ASSEMBLASH_KEEP_PNG") {
        std::fs::write(path, &cli_png).unwrap();
    }
    let cli_pixels = pixels(&cli_png);
    assert!(
        cli_pixels == pixels(&fixture.export("http")),
        "CLI and HTTP pictures differ"
    );
    assert!(
        cli_pixels == pixels(&fixture.export("mcp")),
        "CLI and MCP pictures differ"
    );

    // Exit test 2: the labels have ink. Bars are blue and yellow; only the
    // outlined labels and the axis are dark grey.
    let decoder = png::Decoder::new(std::io::Cursor::new(&cli_png));
    let mut reader = decoder.read_info().unwrap();
    let mut pixels = vec![0; reader.output_buffer_size().unwrap()];
    let frame = reader.next_frame(&mut pixels).unwrap();
    let channels = frame.color_type.samples();
    let dark = pixels[..frame.buffer_size()]
        .chunks(channels)
        .filter(|p| p[0] < 110 && p[1] < 110 && p[2] < 110 && (channels < 4 || p[3] > 200))
        .count();
    // The labels measured 1047 such pixels when this was written; the axis
    // (#999999) and the shadow (#00000066 on white) are both lighter.
    assert!(
        dark > 500,
        "only {dark} dark pixels: the labels drew nothing"
    );

    // The spec is recorded on the layer.
    let document = fixture.document("cli");
    let layer = &document["layers"][0];
    assert_eq!(layer["type"], "svg");
    assert_eq!(layer["assemblash.chart"]["spec"]["kind"], "chart");
    assert_eq!(layer["assemblash.chart"]["font"]["family"], "Inter");
}

/// Exit test 4.
#[test]
fn switching_bar_to_line_keeps_the_data_and_undo_restores_the_layer() {
    let fixture = Fixture::new(&["switch"]);
    let project = fixture.project("switch");
    let project_arg = project.to_str().unwrap();
    let csv = fixture.file(
        "sales.csv",
        "Quarter,North,South\nQ1,12,7\nQ2,18,11\nQ3,9,14\n",
    );
    let printed = run(&[
        "add-chart",
        project_arg,
        "--csv",
        csv.to_str().unwrap(),
        "--type",
        "bar",
        "--title",
        "Sales",
        "--font-family",
        "Inter",
        "--font-store",
        &fixture.store(),
    ]);
    let (layer, bar_hash) = printed.trim().split_once('\t').unwrap();
    let before = fixture.document("switch");

    let printed = run(&[
        "regenerate",
        project_arg,
        layer,
        "--type",
        "line",
        "--font-store",
        &fixture.store(),
    ]);
    let (same_layer, line_hash) = printed.trim().split_once('\t').unwrap();
    assert_eq!(same_layer, layer);
    assert_ne!(line_hash, bar_hash, "a line chart is a different picture");

    let after = fixture.document("switch");
    let recorded = &after["layers"][0]["assemblash.chart"]["spec"];
    assert_eq!(recorded["type"], "line");
    assert_eq!(
        recorded["series"], before["layers"][0]["assemblash.chart"]["spec"]["series"],
        "the data came from the recorded spec"
    );
    assert_eq!(
        after["layers"][0]["transform"],
        before["layers"][0]["transform"]
    );

    run(&["undo", project_arg]);
    let undone = fixture.document("switch");
    assert_eq!(
        serde_json::to_string(&undone["layers"]).unwrap(),
        serde_json::to_string(&before["layers"]).unwrap(),
        "undo restores the layer, spec and asset reference exactly"
    );

    // A type switch on a table is refused, typed.
    let table_csv = fixture.file("t.csv", "a,b\n1,2\n");
    let printed = run(&[
        "add-table",
        project_arg,
        "--csv",
        table_csv.to_str().unwrap(),
        "--font-family",
        "Inter",
        "--font-store",
        &fixture.store(),
    ]);
    let (table, _) = printed.trim().split_once('\t').unwrap();
    let refused = run_fails(&[
        "regenerate",
        project_arg,
        table,
        "--type",
        "pie",
        "--font-store",
        &fixture.store(),
    ]);
    assert!(refused.contains("not a chart"), "{refused}");
}

/// Exit test 5.
#[test]
fn a_qr_code_at_three_sizes_decodes() {
    let fixture = Fixture::new(&["qr"]);
    let data = "https://example.org/assemblash/1.15.0";
    for (index, module) in [2, 4, 8].into_iter().enumerate() {
        let name = format!("qr{index}");
        run(&[
            "new",
            fixture.project(&name).to_str().unwrap(),
            "--width",
            "600",
            "--height",
            "600",
            "--background",
            "#ffffff",
        ]);
        let spec = fixture.file(
            &format!("{name}.json"),
            &json!({ "data": data, "moduleSize": module }).to_string(),
        );
        run(&[
            "add-qr",
            fixture.project(&name).to_str().unwrap(),
            "--spec",
            spec.to_str().unwrap(),
            "--x",
            "10",
            "--y",
            "10",
        ]);
        let png = fixture.export(&name);
        let decoder = png::Decoder::new(std::io::Cursor::new(&png));
        let mut reader = decoder.read_info().unwrap();
        let mut pixels = vec![0; reader.output_buffer_size().unwrap()];
        let frame = reader.next_frame(&mut pixels).unwrap();
        let channels = frame.color_type.samples();
        let (width, height) = (frame.width as usize, frame.height as usize);
        let grey: Vec<u8> = pixels[..frame.buffer_size()]
            .chunks(channels)
            .map(|p| ((u16::from(p[0]) + u16::from(p[1]) + u16::from(p[2])) / 3) as u8)
            .collect();
        let mut image =
            rqrr::PreparedImage::prepare_from_greyscale(width, height, |x, y| grey[y * width + x]);
        let grids = image.detect_grids();
        assert_eq!(grids.len(), 1, "module size {module}: one code found");
        let (_, content) = grids[0].decode().unwrap();
        assert_eq!(content, data, "module size {module}");
    }
}
