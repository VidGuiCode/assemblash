//! Reclaiming a lock left behind by a process that crashed, over HTTP.
//!
//! The claim under test is narrow on purpose. With `--reclaim-stale-locks` a
//! server opens a project whose lock names **this machine** and a process that
//! is **provably gone**, and says so once. Everything else is the conflict it
//! has always been: another machine's lock, a lock from a build that recorded
//! no machine, and — whatever the lock says — a server that was not asked to
//! reclaim anything.
//!
//! Every lock here is written by hand rather than by killing a real server,
//! because the interesting cases are the ones a real crash on this machine
//! cannot produce: a foreign hostname, and a file from an older build. The
//! pid, though, is real — spawned, killed, and reaped — because a made-up
//! number would only prove the probe answers, not that it answers correctly.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

use assemblash_core::session::LOCK_FILE;
use assemblash_core::workspace::Workspace;
use assemblash_server::AppState;
use serde_json::{json, Value};

/// A running server over a workspace, with a chosen reclaim policy.
struct Harness {
    base: String,
    _workspace: tempfile::TempDir,
    root: PathBuf,
}

impl Harness {
    fn start(reclaim: bool) -> Self {
        let directory = tempfile::tempdir().unwrap();
        let root = directory.path().join("workspace");
        let workspace = Workspace::open_or_create(&root).unwrap();
        let state = AppState::with_reclaim(workspace, reclaim);

        let (send, receive) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(2)
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
                let router = assemblash_server::api::router(
                    state,
                    Default::default(),
                    Default::default(),
                    stop,
                    Default::default(),
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
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.base)
    }

    fn project_dir(&self, id: &str) -> PathBuf {
        self.root
            .join(assemblash_core::workspace::PROJECTS_DIR)
            .join(id)
    }
}

/// Spawns something that stays running until it is killed.
///
/// The same shape `assemblash-core`'s own reclaim tests use, and for the same
/// reason: a pid that was never issued proves less than one that was.
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

/// Creates a project through the API, then makes the server let go of it.
///
/// The server holds a session — and therefore a lock — for every project it
/// has opened, so a test cannot plant a stale lock while it still owns one.
/// Restarting is the honest way to get a directory with no live owner, which
/// is exactly the state a crash leaves behind.
fn project_left_behind(id: &str, reclaim: bool) -> (Harness, PathBuf) {
    let setup = Harness::start(true);
    let response = http::post_json(
        &setup.url("/api/projects"),
        &json!({ "id": id, "width": 400.0, "height": 200.0 }),
    );
    assert_eq!(response.status, 201, "{}", response.json());
    let source = setup.project_dir(id);
    assert!(source.join("document.json").exists());

    // A second server over the same workspace root, so the first one's
    // sessions are gone with it.
    let harness = Harness::start(reclaim);
    copy_tree(&source, &harness.project_dir(id));
    drop(setup);
    let directory = harness.project_dir(id);
    // Whatever the first server left, this test writes its own lock.
    let _ = std::fs::remove_file(directory.join(LOCK_FILE));
    (harness, directory)
}

fn copy_tree(from: &Path, to: &Path) {
    std::fs::create_dir_all(to).unwrap();
    for entry in std::fs::read_dir(from).unwrap() {
        let entry = entry.unwrap();
        let target = to.join(entry.file_name());
        if entry.file_type().unwrap().is_dir() {
            copy_tree(&entry.path(), &target);
        } else {
            std::fs::copy(entry.path(), &target).unwrap();
        }
    }
}

fn write_lock(project_dir: &Path, json: &str) {
    std::fs::write(project_dir.join(LOCK_FILE), json).expect("writing a lock file");
}

fn lock_exists(project_dir: &Path) -> bool {
    project_dir.join(LOCK_FILE).exists()
}

fn error_code(response: &http::Response) -> String {
    response.json()["error"]["code"]
        .as_str()
        .unwrap_or_default()
        .to_owned()
}

fn export(harness: &Harness, id: &str) -> Value {
    let response = http::post_json(
        &harness.url(&format!("/api/projects/{id}/export")),
        &json!({ "name": "shot", "scale": 1.0 }),
    );
    assert_eq!(response.status, 200, "{}", response.json());
    response.json()
}

fn warning_codes(exported: &Value) -> Vec<String> {
    exported["warnings"]
        .as_array()
        .expect("warnings is always an array")
        .iter()
        .map(|warning| warning["code"].as_str().unwrap_or_default().to_owned())
        .collect()
}

// ------------------------------------------------------------ the happy path

#[test]
fn a_lock_from_a_dead_process_on_this_machine_is_reclaimed_and_reported_once() {
    let (harness, directory) = project_left_behind("crashed", true);
    let pid = dead_pid();
    let host = this_host();
    write_lock(
        &directory,
        &format!(r#"{{"pid":{pid},"since":1,"host":"{host}"}}"#),
    );

    let first = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(first.status, 200, "{}", first.json());
    let body = first.json();
    assert_eq!(body["reclaimedLock"]["pid"], json!(pid));
    assert_eq!(body["reclaimedLock"]["host"], json!(host));
    assert!(
        body["reclaimedLock"]["at"].is_number(),
        "the notice carries when it happened: {body}"
    );
    assert!(
        lock_exists(&directory),
        "the server that reclaimed the lock now holds one of its own"
    );

    // A notice, not a state: delivered once, to whoever asked first.
    let second = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(second.status, 200);
    assert_eq!(
        second.json().get("reclaimedLock"),
        None,
        "the second summary must not repeat it"
    );

    // And the warnings channel has nothing left to say either.
    let exported = export(&harness, "crashed");
    assert!(
        !warning_codes(&exported).contains(&"lockReclaimed".to_owned()),
        "the summary already delivered it: {exported}"
    );
}

#[test]
fn an_export_before_any_summary_carries_the_warning() {
    let (harness, directory) = project_left_behind("crashed", true);
    let pid = dead_pid();
    let host = this_host();
    write_lock(
        &directory,
        &format!(r#"{{"pid":{pid},"since":1,"host":"{host}"}}"#),
    );

    // The export is the first thing that touches the project, so opening it —
    // and reclaiming — happens here.
    let exported = export(&harness, "crashed");
    let codes = warning_codes(&exported);
    assert!(
        codes.contains(&"lockReclaimed".to_owned()),
        "expected a lockReclaimed warning, got {codes:?}"
    );
    let warning = exported["warnings"]
        .as_array()
        .unwrap()
        .iter()
        .find(|warning| warning["code"] == json!("lockReclaimed"))
        .unwrap()
        .clone();
    let message = warning["message"].as_str().unwrap_or_default();
    assert!(
        message.contains(&pid.to_string()) && message.contains(&host),
        "the message names the process and the machine: {message}"
    );

    // Peeked, not taken: the summary is still where it gets consumed.
    let summary = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(summary.json()["reclaimedLock"]["pid"], json!(pid));
}

// -------------------------------------------------- everything it will not do

#[test]
fn without_the_flag_a_stale_lock_is_still_a_conflict() {
    let (harness, directory) = project_left_behind("crashed", false);
    let pid = dead_pid();
    write_lock(
        &directory,
        &format!(r#"{{"pid":{pid},"since":1,"host":"{}"}}"#, this_host()),
    );

    let response = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(response.status, 409, "{}", response.json());
    assert_eq!(error_code(&response), "projectLocked");
    assert!(lock_exists(&directory), "and the lock is untouched");
}

#[test]
fn a_lock_from_another_machine_is_never_reclaimed() {
    let (harness, directory) = project_left_behind("crashed", true);
    let pid = dead_pid();
    write_lock(
        &directory,
        &format!(r#"{{"pid":{pid},"since":1,"host":"some-other-machine"}}"#),
    );

    let response = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(response.status, 409, "{}", response.json());
    assert_eq!(error_code(&response), "projectLocked");
    assert!(lock_exists(&directory), "and the foreign lock is untouched");
}

#[test]
fn a_lock_that_names_no_machine_is_never_reclaimed() {
    let (harness, directory) = project_left_behind("crashed", true);
    let pid = dead_pid();
    // What every build before 1.5.0 wrote. The pid may well be this
    // machine's, and that is exactly why it cannot be assumed to be.
    write_lock(&directory, &format!(r#"{{"pid":{pid},"since":1}}"#));

    let response = http::get(&harness.url("/api/projects/crashed"));
    assert_eq!(response.status, 409, "{}", response.json());
    assert_eq!(error_code(&response), "projectLocked");
    assert!(lock_exists(&directory), "and the old lock is untouched");
}

#[test]
fn a_lock_held_by_a_living_process_is_never_reclaimed() {
    let (harness, directory) = project_left_behind("busy", true);
    let mut child = long_lived_child();
    write_lock(
        &directory,
        &format!(
            r#"{{"pid":{},"since":1,"host":"{}"}}"#,
            child.id(),
            this_host()
        ),
    );

    let response = http::get(&harness.url("/api/projects/busy"));
    assert_eq!(response.status, 409, "{}", response.json());
    assert_eq!(error_code(&response), "projectLocked");
    assert!(lock_exists(&directory), "and the live lock is untouched");

    child.kill().expect("killing the child");
    child.wait().expect("reaping the child");
}

#[test]
fn an_unlocked_project_reports_nothing_at_all() {
    let (harness, directory) = project_left_behind("calm", true);
    assert!(!lock_exists(&directory));

    let response = http::get(&harness.url("/api/projects/calm"));
    assert_eq!(response.status, 200, "{}", response.json());
    assert_eq!(
        response.json().get("reclaimedLock"),
        None,
        "nothing was reclaimed, so there is nothing to say"
    );
}

/// A tiny blocking HTTP/1.1 client.
///
/// Hand-rolled for the same reason `api.rs` and `fonts.rs` each hand-roll
/// one: the server's only dependency on an HTTP client would otherwise be a
/// test one, and every crate in a single-binary product has to be
/// licence-audited and shipped (R8).
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

    pub fn post_json(url: &str, body: &serde_json::Value) -> Response {
        request(
            "POST",
            url,
            Some("application/json"),
            Some(body.to_string().as_bytes()),
        )
    }
}
