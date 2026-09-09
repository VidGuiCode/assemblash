//! Stale-lock reclaim through the real binary.
//!
//! `assemblash serve --reclaim-stale-locks` opens a project whose lock names
//! this machine and a process that is gone; plain `assemblash serve` still
//! refuses it. Both halves run the shipped executable over a real socket,
//! because the flag is a command-line surface and the wiring between clap and
//! `AppState` is the thing that could be wrong.
//!
//! Every wait here is bounded: the server prints its URL on the first line of
//! standard output and the harness reads exactly that, the HTTP client reads
//! exactly one response and stops, and the child is killed and reaped when the
//! harness is dropped.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{BufRead as _, Read as _};
use std::path::Path;
use std::process::{Child, Command, Stdio};

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_assemblash")
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

/// Spawns something that stays running until it is killed.
fn long_lived_child() -> Child {
    let mut command = if cfg!(windows) {
        // `pause` blocks on console input. stdin is a pipe nobody writes to,
        // so it never gets a line and the process stays up.
        let mut command = Command::new("cmd");
        command.args(["/C", "pause"]);
        command
    } else {
        let mut command = Command::new("sleep");
        command.arg("30");
        command
    };
    command
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawning a child process")
}

/// A pid that definitely belonged to a process and definitely does not now.
fn dead_pid() -> u32 {
    let mut child = long_lived_child();
    let pid = child.id();
    child.kill().expect("killing the child");
    // Without the wait the process is a zombie on Unix, which `kill(0)` still
    // reports as alive; reaping it is what makes the pid genuinely gone.
    child.wait().expect("reaping the child");
    pid
}

fn this_host() -> String {
    assemblash_core::this_host().expect("this machine must be able to name itself for these tests")
}

/// A workspace with one project in it, and a hand-written lock left behind.
///
/// The lock is written rather than produced by killing a server: the pid has
/// to be one this test can prove is dead, and a killed server's pid is only
/// dead once the operating system has finished with it.
fn workspace_with_a_crashed_project(scratch: &Path) -> std::path::PathBuf {
    let workspace = scratch.join("data");
    run(&["workspace", "--workspace", workspace.to_str().unwrap()]);

    let project = workspace.join("projects").join("poster");
    run(&[
        "new",
        project.to_str().unwrap(),
        "--width",
        "400",
        "--height",
        "200",
        "--background",
        "#ffffff",
    ]);
    assert!(
        !project.join(assemblash_core::session::LOCK_FILE).exists(),
        "the command that created it released its lock on the way out"
    );

    let lock = format!(
        r#"{{"pid":{},"since":1,"host":"{}"}}"#,
        dead_pid(),
        this_host()
    );
    std::fs::write(project.join(assemblash_core::session::LOCK_FILE), lock).unwrap();
    workspace
}

fn summary(server: &Serving) -> http::Response {
    http::request("GET", &server.url("/api/projects/poster"), None)
}

fn json(response: &http::Response) -> serde_json::Value {
    serde_json::from_slice(&response.body).unwrap_or_else(|e| {
        panic!(
            "body is not JSON ({e}): {}",
            String::from_utf8_lossy(&response.body)
        )
    })
}

#[test]
fn serve_with_the_flag_opens_a_project_whose_owner_crashed() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = workspace_with_a_crashed_project(scratch.path());

    let server = Serving::start(
        &workspace,
        &["serve", "--port", "0", "--reclaim-stale-locks"],
    );
    let response = summary(&server);
    assert_eq!(
        response.status,
        200,
        "expected the project to open: {}",
        String::from_utf8_lossy(&response.body)
    );
    let body = json(&response);
    assert_eq!(body["id"], serde_json::json!("poster"));
    assert_eq!(
        body["reclaimedLock"]["host"],
        serde_json::json!(this_host()),
        "the notice says which machine's process it was: {body}"
    );
}

/// The environment variable the flag also reads.
const RECLAIM_ENV: &str = "ASSEMBLASH_RECLAIM_STALE_LOCKS";

#[test]
fn the_environment_variable_turns_the_flag_on() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = workspace_with_a_crashed_project(scratch.path());

    // `1`, not `true`: clap's own bool parser accepts only the two literals
    // from an environment variable and refuses to start on anything else,
    // which is not how a shell toggle is expected to read. The flag names a
    // value parser to fix that, and this is the test of it.
    let server =
        Serving::start_with_env(&workspace, &["serve", "--port", "0"], &[(RECLAIM_ENV, "1")]);
    let response = summary(&server);
    assert_eq!(
        response.status,
        200,
        "expected the project to open: {}",
        String::from_utf8_lossy(&response.body)
    );
    assert_eq!(
        json(&response)["reclaimedLock"]["host"],
        serde_json::json!(this_host())
    );
}

#[test]
fn the_environment_variable_can_also_say_no() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = workspace_with_a_crashed_project(scratch.path());

    let server =
        Serving::start_with_env(&workspace, &["serve", "--port", "0"], &[(RECLAIM_ENV, "0")]);
    let response = summary(&server);
    assert_eq!(
        response.status,
        409,
        "`0` is off, not merely `not true`: {}",
        String::from_utf8_lossy(&response.body)
    );
}

/// The launch a double-click produces, which is the case this whole feature
/// exists for: the person is starting their editor again, most often because
/// the last one went away without releasing what it had open.
///
/// `--friendly` rather than no arguments at all, because a no-argument launch
/// serves the machine's real workspace — this test must not touch it.
#[test]
fn a_friendly_launch_reclaims_without_being_asked() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = workspace_with_a_crashed_project(scratch.path());
    // A friendly launch would otherwise open a browser window on whoever is
    // running the tests.
    std::fs::write(
        workspace.join(assemblash_core::workspace::CONFIG_FILE),
        "open-browser = false\n",
    )
    .unwrap();

    let server = Serving::start(&workspace, &["serve", "--port", "0", "--friendly"]);
    let response = summary(&server);
    assert_eq!(
        response.status,
        200,
        "a friendly launch cleans up after a crashed predecessor: {}",
        String::from_utf8_lossy(&response.body)
    );
    assert_eq!(
        json(&response)["reclaimedLock"]["host"],
        serde_json::json!(this_host())
    );
}

#[test]
fn serve_without_the_flag_still_refuses_it() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace = workspace_with_a_crashed_project(scratch.path());

    let server = Serving::start(&workspace, &["serve", "--port", "0"]);
    let response = summary(&server);
    assert_eq!(
        response.status,
        409,
        "a stale lock is a conflict unless the flag says otherwise: {}",
        String::from_utf8_lossy(&response.body)
    );
    assert_eq!(json(&response)["error"]["code"], "projectLocked");
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
    /// Starts `assemblash serve` on a port the OS picks and waits for its
    /// URL.
    ///
    /// `--port 0` and reading the printed URL rather than guessing a port:
    /// tests run in parallel and on other people's machines. The URL is the
    /// first line the server prints, and it prints it before serving, so
    /// reading one line is the bounded wait for "it is up".
    fn start(workspace: &Path, args: &[&str]) -> Self {
        Self::start_with_env(workspace, args, &[])
    }

    /// The same, with the environment the flag can also be set from.
    ///
    /// The variable is *removed* when it is not being tested, so a value in
    /// the environment this test suite was launched with cannot decide the
    /// answer.
    fn start_with_env(workspace: &Path, args: &[&str], env: &[(&str, &str)]) -> Self {
        let mut command = Command::new(binary());
        command
            .args(args)
            .arg("--workspace")
            .arg(workspace)
            .env_remove(RECLAIM_ENV)
            .stdout(Stdio::piped())
            .stderr(Stdio::null());
        for (key, value) in env {
            command.env(key, value);
        }
        let mut child = command.spawn().expect("the binary runs");

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
