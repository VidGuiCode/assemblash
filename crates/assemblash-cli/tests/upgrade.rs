//! The update mechanism, end to end, against the real binary (decision D28).
//!
//! Every fetch in this file goes to a local HTTP server on 127.0.0.1: CI
//! never reaches the network. The decided exit list this file covers:
//!
//! - `upgrade --check` prints the local and the remote version; offline it
//!   fails with a typed error.
//! - A hash mismatch is a typed refusal, and the old binary still runs.
//! - The swap works on a temp binary copy, and the `.old` file is gone at
//!   the next start.
//! - MCP mode sends nothing, even with the check consented.

#![allow(clippy::unwrap_used)]

use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;

/// Where the feed and the downloads come from, and how many requests landed.
struct FixtureServer {
    base: String,
    requests: Arc<AtomicUsize>,
    shutdown: Arc<AtomicBool>,
    handle: Option<std::thread::JoinHandle<()>>,
}

impl FixtureServer {
    fn start(routes: Vec<(String, Vec<u8>)>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
        let requests = Arc::new(AtomicUsize::new(0));
        let shutdown = Arc::new(AtomicBool::new(false));
        let handle = {
            let requests = Arc::clone(&requests);
            let shutdown = Arc::clone(&shutdown);
            std::thread::spawn(move || {
                for stream in listener.incoming() {
                    if shutdown.load(Ordering::SeqCst) {
                        return;
                    }
                    let Ok(mut stream) = stream else { return };
                    requests.fetch_add(1, Ordering::SeqCst);
                    let mut buffer = [0u8; 8192];
                    let _ = stream.read(&mut buffer);
                    let request = String::from_utf8_lossy(&buffer);
                    let path = request.split_whitespace().nth(1).unwrap_or("/").to_owned();
                    let body = routes
                        .iter()
                        .find(|(served, _)| *served == path)
                        .map(|(_, body)| body.clone());
                    match body {
                        Some(body) => write_response(&mut stream, "200 OK", &body),
                        None => write_response(&mut stream, "404 Not Found", b"nope"),
                    }
                }
            })
        };
        Self {
            base,
            requests,
            shutdown,
            handle: Some(handle),
        }
    }

    fn count(&self) -> usize {
        self.requests.load(Ordering::SeqCst)
    }

    fn env(&self) -> [(&'static str, String); 2] {
        [
            (
                "ASSEMBLASH_UPDATE_FEED",
                format!("{}/releases.atom", self.base),
            ),
            ("ASSEMBLASH_UPDATE_DOWNLOAD", self.base.clone()),
        ]
    }
}

impl Drop for FixtureServer {
    fn drop(&mut self) {
        self.shutdown.store(true, Ordering::SeqCst);
        if let Ok(stream) = TcpStream::connect(self.base.trim_start_matches("http://")) {
            drop(stream);
        }
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

fn write_response(stream: &mut TcpStream, status: &str, body: &[u8]) {
    let head = format!(
        "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(body);
}

fn atom() -> String {
    "<?xml version=\"1.0\"?><feed><entry><id>x</id><title>v1.10.1</title>\
     <link href=\"https://example.com/tag/v1.10.1\"/></entry></feed>"
        .to_owned()
}

fn temp_dir(tag: &str) -> PathBuf {
    let root =
        std::env::temp_dir().join(format!("assemblash-upgrade-{tag}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();
    root
}

fn asset_name() -> String {
    format!(
        "assemblash-{}-{}{}",
        std::env::consts::OS,
        std::env::consts::ARCH,
        std::env::consts::EXE_SUFFIX
    )
}

fn hash_of(bytes: &[u8]) -> String {
    // The engine spells its hashes `sha256:<hex>`; the sums file is bare hex.
    assemblash_renderer::store::hash_bytes(bytes)
        .trim_start_matches("sha256:")
        .to_owned()
}

fn workspace_arg(workspace: &Path) -> String {
    workspace.display().to_string()
}

/// Runs the binary with the fixture's endpoints and the given workspace.
fn run(
    exe: &Path,
    args: &[&str],
    server: Option<&FixtureServer>,
    workspace: &Path,
    extra_env: &[(&'static str, String)],
) -> std::process::Output {
    let mut command = Command::new(exe);
    command
        .args(args)
        .env("ASSEMBLASH_WORKSPACE", workspace_arg(workspace));
    if let Some(server) = server {
        for (key, value) in server.env() {
            command.env(key, value);
        }
    } else {
        // No fixture: point the feed at a closed loopback port, so an
        // accidental network attempt fails fast instead of hanging.
        command.env("ASSEMBLASH_UPDATE_FEED", "http://127.0.0.1:1/releases.atom");
    }
    for (key, value) in extra_env {
        command.env(key, value);
    }
    command.output().unwrap()
}

#[test]
fn upgrade_check_prints_both_versions_over_a_local_feed() {
    let server = FixtureServer::start(vec![("/releases.atom".to_owned(), atom().into_bytes())]);
    let workspace = temp_dir("check");
    let output = run(
        env!("CARGO_BIN_EXE_assemblash").as_ref(),
        &["upgrade", "--check"],
        Some(&server),
        &workspace,
        &[],
    );
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains(&format!("local: {}", env!("CARGO_PKG_VERSION"))),
        "{stdout}"
    );
    assert!(stdout.contains("latest: 1.10.1"), "{stdout}");
    assert_eq!(server.count(), 1, "the check is exactly one request");
}

#[test]
fn upgrade_check_offline_is_a_typed_error() {
    let workspace = temp_dir("offline");
    let output = run(
        env!("CARGO_BIN_EXE_assemblash").as_ref(),
        &["upgrade", "--check"],
        None,
        &workspace,
        &[],
    );
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("fetching"), "{stderr}");
}

#[test]
fn a_hash_mismatch_is_a_typed_refusal_and_the_old_binary_still_runs() {
    let payload = b"bytes nobody pinned".to_vec();
    let wrong = hash_of(b"other bytes entirely");
    let name = asset_name();
    let server = FixtureServer::start(vec![
        ("/releases.atom".to_owned(), atom().into_bytes()),
        (
            "/v1.10.1/SHA256SUMS".to_owned(),
            format!("{wrong}  {name}\n").into_bytes(),
        ),
        (format!("/v1.10.1/{name}"), payload),
    ]);
    let workspace = temp_dir("mismatch");
    let output = run(
        env!("CARGO_BIN_EXE_assemblash").as_ref(),
        &["upgrade"],
        Some(&server),
        &workspace,
        &[],
    );
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("does not match SHA256SUMS"), "{stderr}");
    // The old binary still runs, and no partial file is left behind.
    let again = run(
        env!("CARGO_BIN_EXE_assemblash").as_ref(),
        &["--version"],
        None,
        &workspace,
        &[],
    );
    assert!(again.status.success());
    assert!(!workspace.join("update-download.part").exists());
}

#[test]
fn the_swap_works_on_a_temp_copy_and_old_is_gone_at_the_next_start() {
    // The "new version" is a second copy of the real binary: the swap has to
    // move in something Windows can still execute, and the assertion is the
    // byte identity of what landed, plus that it runs afterwards.
    let payload = std::fs::read(env!("CARGO_BIN_EXE_assemblash")).unwrap();
    let name = asset_name();
    let server = FixtureServer::start(vec![
        ("/releases.atom".to_owned(), atom().into_bytes()),
        (
            "/v1.10.1/SHA256SUMS".to_owned(),
            format!("{}  {name}\n", hash_of(&payload)).into_bytes(),
        ),
        (format!("/v1.10.1/{name}"), payload.clone()),
    ]);
    let root = temp_dir("swap");
    let workspace = root.join("workspace");
    let install = root.join("install");
    std::fs::create_dir_all(&workspace).unwrap();
    std::fs::create_dir_all(&install).unwrap();
    let installed = install.join(format!("assemblash{}", std::env::consts::EXE_SUFFIX));
    let source = Path::new(env!("CARGO_BIN_EXE_assemblash"));
    std::fs::copy(source, &installed).unwrap();
    std::fs::set_permissions(&installed, std::fs::metadata(source).unwrap().permissions()).unwrap();

    // The copy upgrades itself: its `current_exe` is the copy, so the swap
    // replaces the copy, not the build output.
    let output = run(&installed, &["upgrade"], Some(&server), &workspace, &[]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        std::fs::read(&installed).unwrap(),
        payload,
        "the new bytes are in place"
    );
    let old = install.join(format!("assemblash{}.old", std::env::consts::EXE_SUFFIX));
    assert!(old.exists(), "the replaced binary waits as .old");

    // The next start deletes the leftover (U4).
    let next = run(&installed, &["--version"], None, &workspace, &[]);
    assert!(next.status.success());
    assert!(!old.exists(), ".old must be gone at the next start");
    assert_eq!(server.count(), 3, "sums, binary, feed — and nothing more");
}

/// Exit test 7: MCP mode sends nothing, even consented and due.
#[test]
fn mcp_mode_sends_nothing() {
    let server = FixtureServer::start(vec![("/releases.atom".to_owned(), atom().into_bytes())]);
    let workspace = temp_dir("mcp");
    // The strongest possible setup: the check is consented, no cache exists,
    // and the feed endpoint is pointed at the counting server. `serve` would
    // fetch here; MCP mode must not.
    std::fs::write(workspace.join("config.toml"), "updateCheck = \"notify\"\n").unwrap();
    let project = temp_dir("mcp-project");
    let created = run(
        env!("CARGO_BIN_EXE_assemblash").as_ref(),
        &["new", project.to_str().unwrap()],
        None,
        &workspace,
        &[],
    );
    assert!(
        created.status.success(),
        "{}",
        String::from_utf8_lossy(&created.stderr)
    );

    let mut command = Command::new(env!("CARGO_BIN_EXE_assemblash"));
    command
        .args(["mcp", "--project", project.to_str().unwrap()])
        .env("ASSEMBLASH_WORKSPACE", workspace_arg(&workspace));
    for (key, value) in server.env() {
        command.env(key, value);
    }
    command.stdin(Stdio::piped()).stdout(Stdio::piped());
    let mut child: Child = command.spawn().unwrap();
    {
        let stdin = child.stdin.as_mut().unwrap();
        writeln!(
            stdin,
            r#"{{"jsonrpc":"2.0","id":1,"method":"initialize","params":{{"protocolVersion":"2025-06-18","capabilities":{{}},"clientInfo":{{"name":"t","version":"0"}}}}}}"#
        )
        .unwrap();
        writeln!(
            stdin,
            r#"{{"jsonrpc":"2.0","method":"notifications/initialized"}}"#
        )
        .unwrap();
        writeln!(stdin, r#"{{"jsonrpc":"2.0","id":2,"method":"tools/list"}}"#).unwrap();
        stdin.flush().unwrap();
    }
    // Wait for the tools/list answer, then end the session by closing stdin.
    let answer = {
        let stdout = child.stdout.as_mut().unwrap();
        let mut reader = BufReader::new(stdout);
        let mut line = String::new();
        loop {
            line.clear();
            let read = reader.read_line(&mut line).unwrap();
            assert!(read > 0, "the MCP server closed before answering");
            if line.contains("\"id\":2") {
                break line;
            }
        }
    };
    assert!(answer.contains("\"tools\""), "{answer}");
    drop(child.stdin.take());
    let _ = child.wait();

    assert_eq!(server.count(), 0, "MCP mode must never fetch");
    assert!(
        !workspace.join("update-cache.json").exists(),
        "MCP mode must never write the check cache"
    );
}
