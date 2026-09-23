//! `assemblash mcp` relays to a running editor.
//!
//! Both sides are the real binary: an editor (`serve`, which records itself
//! in the workspace on a loopback bind) and `assemblash mcp --workspace`
//! driven over a real stdio pipe. Every line the relay writes to stdout must
//! parse as one JSON-RPC message.
//!
//! * with the editor holding a project open, the relay reads and changes it
//!   with no `projectLocked`, and the change is the editor's journal entry;
//! * an agent that started first releases its projects when the person
//!   starts the editor, moves to the editor, and moves back when the editor
//!   stops — all in one client session;
//! * a record that names the server of another workspace is not used;
//! * a session the editor ended for idleness is renewed without an error;
//! * an editor that requires the workspace token is found and used.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{BufRead as _, BufReader, Write as _};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc;
use std::time::{Duration, Instant};

use serde_json::{json, Value};

mod support;

use support::binary;

/// A workspace that never opens a browser on whoever runs the tests.
fn workspace(scratch: &Path) -> PathBuf {
    let root = scratch.join("workspace");
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(
        root.join(assemblash_core::workspace::CONFIG_FILE),
        "open-browser = false\n",
    )
    .unwrap();
    root
}

/// An editor on its own port, stopped on drop.
struct Editor {
    child: Child,
    base: String,
    token: Option<String>,
}

impl Editor {
    /// `friendly` is the double-click launch; without it, the plain `serve`
    /// the report reproduced the lock-out with.
    fn start(root: &Path, friendly: bool) -> Self {
        Self::start_with(root, friendly, &[], None)
    }

    fn start_with(
        root: &Path,
        friendly: bool,
        environment: &[(&str, &str)],
        token: Option<&str>,
    ) -> Self {
        let mut command = Command::new(binary());
        command.args(["serve", "--port", "0"]);
        if friendly {
            command.arg("--friendly");
        }
        for (name, value) in environment {
            command.env(name, value);
        }
        let mut child = command
            .arg("--workspace")
            .arg(root)
            .env_remove("ASSEMBLASH_FONT_STORE")
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .unwrap();
        let mut line = String::new();
        BufReader::new(child.stdout.take().unwrap())
            .read_line(&mut line)
            .unwrap();
        let base = line.trim().to_owned();
        assert!(base.starts_with("http://127.0.0.1:"), "{base:?}");
        // The editor records itself after printing its URL.
        let deadline = Instant::now() + Duration::from_secs(10);
        while !root.join("running.json").is_file() {
            assert!(
                Instant::now() < deadline,
                "the editor never recorded itself"
            );
            std::thread::sleep(Duration::from_millis(20));
        }
        Self {
            child,
            base,
            token: token.map(ToOwned::to_owned),
        }
    }

    fn api(&self, method: &str, path: &str, body: Option<Value>) -> (u16, Value) {
        let agent: ureq::Agent = ureq::Agent::config_builder()
            .http_status_as_error(false)
            .build()
            .into();
        let url = format!("{}{path}", self.base);
        let bearer = format!("Bearer {}", self.token.as_deref().unwrap_or_default());
        let response = match (method, body) {
            ("GET", _) => agent.get(&url).header("Authorization", &bearer).call(),
            ("POST", Some(body)) => agent
                .post(&url)
                .header("Authorization", &bearer)
                .header("Content-Type", "application/json")
                .send(body.to_string()),
            ("POST", None) => agent
                .post(&url)
                .header("Authorization", &bearer)
                .send_empty(),
            _ => panic!("unsupported {method}"),
        };
        let mut response = response.unwrap();
        let status = response.status().as_u16();
        let text = response.body_mut().read_to_string().unwrap_or_default();
        (status, serde_json::from_str(&text).unwrap_or(Value::Null))
    }

    /// Stops the editor the way the person does, from the page.
    fn stop(mut self) {
        let (status, _) = self.api("POST", "/api/shutdown", None);
        assert_eq!(status, 200);
        let deadline = Instant::now() + Duration::from_secs(20);
        while self.child.try_wait().unwrap().is_none() {
            assert!(Instant::now() < deadline, "the editor did not stop");
            std::thread::sleep(Duration::from_millis(50));
        }
    }
}

impl Drop for Editor {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// `assemblash mcp --workspace` over a real pipe, as a client starts it.
struct Relay {
    child: Child,
    stdin: Option<ChildStdin>,
    lines: mpsc::Receiver<String>,
    next_id: u64,
}

impl Relay {
    fn start(root: &Path) -> Self {
        let mut child = Command::new(binary())
            .args(["mcp", "--workspace"])
            .arg(root)
            .env_remove("ASSEMBLASH_FONT_STORE")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .unwrap();
        let stdout = child.stdout.take().unwrap();
        let (send, lines) = mpsc::channel();
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines() {
                let Ok(line) = line else { break };
                if send.send(line).is_err() {
                    break;
                }
            }
        });
        let stdin = child.stdin.take();
        let mut relay = Self {
            child,
            stdin,
            lines,
            next_id: 1,
        };
        let answer = relay.request(
            "initialize",
            json!({
                "protocolVersion": "2025-06-18",
                "capabilities": {},
                "clientInfo": { "name": "relay-test", "version": "0" }
            }),
        );
        assert_eq!(answer["result"]["serverInfo"]["name"], "assemblash");
        relay.write(&json!({ "jsonrpc": "2.0", "method": "notifications/initialized" }));
        relay
    }

    fn write(&mut self, message: &Value) {
        let stdin = self.stdin.as_mut().unwrap();
        writeln!(stdin, "{message}").unwrap();
        stdin.flush().unwrap();
    }

    /// Sends a request and waits for its answer. Every line on the way must
    /// be protocol.
    fn request(&mut self, method: &str, params: Value) -> Value {
        let id = self.next_id;
        self.next_id += 1;
        self.write(&json!({ "jsonrpc": "2.0", "id": id, "method": method, "params": params }));
        let deadline = Instant::now() + Duration::from_secs(60);
        loop {
            let remaining = deadline.saturating_duration_since(Instant::now());
            let line = self
                .lines
                .recv_timeout(remaining)
                .unwrap_or_else(|_| panic!("no answer to {method}"));
            let message: Value = serde_json::from_str(&line).unwrap_or_else(|error| {
                panic!("stdout carried a non-protocol line {line:?}: {error}")
            });
            assert_eq!(message["jsonrpc"], "2.0", "{line}");
            if message["id"] == json!(id) {
                return message;
            }
        }
    }

    fn call(&mut self, tool: &str, arguments: Value) -> Result<Value, Value> {
        let answer = self.request(
            "tools/call",
            json!({ "name": tool, "arguments": arguments }),
        );
        if let Some(error) = answer.get("error") {
            return Err(error.clone());
        }
        assert_ne!(answer["result"]["isError"], json!(true), "{tool}: {answer}");
        Ok(answer["result"]["structuredContent"].clone())
    }

    /// Closes stdin and checks the process ends, with nothing but protocol
    /// left on stdout.
    fn finish(mut self) {
        drop(self.stdin.take());
        let deadline = Instant::now() + Duration::from_secs(30);
        while self.child.try_wait().unwrap().is_none() {
            assert!(Instant::now() < deadline, "the relay did not exit on EOF");
            std::thread::sleep(Duration::from_millis(50));
        }
        for line in self.lines.try_iter() {
            serde_json::from_str::<Value>(&line)
                .unwrap_or_else(|error| panic!("non-protocol line {line:?}: {error}"));
        }
    }
}

impl Drop for Relay {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

fn lock_pid(root: &Path, project: &str) -> Option<u64> {
    let text =
        std::fs::read_to_string(root.join("projects").join(project).join(".assemblash-lock"))
            .ok()?;
    serde_json::from_str::<Value>(&text).ok()?["pid"].as_u64()
}

fn wait_until(what: &str, mut condition: impl FnMut() -> bool) {
    let deadline = Instant::now() + Duration::from_secs(20);
    while !condition() {
        assert!(Instant::now() < deadline, "timed out waiting for {what}");
        std::thread::sleep(Duration::from_millis(100));
    }
}

#[test]
fn the_relay_works_on_a_project_the_editor_has_open() {
    let scratch = tempfile::tempdir().unwrap();
    let root = workspace(scratch.path());
    let editor = Editor::start(&root, false);

    let (status, _) = editor.api(
        "POST",
        "/api/projects",
        Some(json!({ "id": "demo", "width": 800.0, "height": 600.0 })),
    );
    assert_eq!(status, 201);
    let (status, _) = editor.api("GET", "/api/projects/demo/document", None);
    assert_eq!(status, 200);
    let editor_pid = u64::from(editor.child.id());
    assert_eq!(lock_pid(&root, "demo"), Some(editor_pid));

    // The report's reproduction: this answered `projectLocked` before.
    let mut relay = Relay::start(&root);
    let state = relay
        .call("get_document_state", json!({ "project": "demo" }))
        .unwrap_or_else(|error| panic!("the relayed read was refused: {error}"));
    assert_eq!(state["version"], 0);
    let added = relay
        .call(
            "add_shape_layer",
            json!({
                "project": "demo", "expectedVersion": 0, "shape": "ellipse",
                "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0
            }),
        )
        .unwrap();
    assert_eq!(added["version"], 1);

    // The editor holds the lock and wrote the entry, as an agent.
    assert_eq!(lock_pid(&root, "demo"), Some(editor_pid));
    let (_, history) = editor.api("GET", "/api/projects/demo/history", None);
    assert_eq!(history["entries"][0]["actor"]["kind"], "agent", "{history}");

    relay.finish();
    // The agent leaving does not close the person's project.
    assert_eq!(lock_pid(&root, "demo"), Some(editor_pid));
    let (status, _) = editor.api("GET", "/api/projects/demo/document", None);
    assert_eq!(status, 200);
    // A plain `serve` refuses a stop from the page; drop ends it.
    drop(editor);
}

#[test]
fn an_agent_that_started_first_makes_way_for_the_editor_and_back() {
    let scratch = tempfile::tempdir().unwrap();
    let root = workspace(scratch.path());

    // The agent starts first, with no editor: it serves the workspace itself
    // and holds the project it works on.
    let mut relay = Relay::start(&root);
    relay
        .call(
            "create_project",
            json!({ "project": "poster", "width": 400.0, "height": 300.0 }),
        )
        .unwrap();
    let added = relay
        .call(
            "add_shape_layer",
            json!({
                "project": "poster", "expectedVersion": 0, "shape": "rect",
                "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0
            }),
        )
        .unwrap();
    assert_eq!(added["version"], 1);
    let relay_pid = u64::from(relay.child.id());
    assert_eq!(lock_pid(&root, "poster"), Some(relay_pid));

    // The person starts the editor. The quiet agent lets go of the project,
    // so the editor can open it.
    let editor = Editor::start(&root, true);
    wait_until("the relay to release the project", || {
        lock_pid(&root, "poster") != Some(relay_pid)
    });
    let (status, document) = editor.api("GET", "/api/projects/poster/document", None);
    assert_eq!(status, 200, "{document}");
    assert_eq!(document["version"], 1);

    // The same client session keeps working, now through the editor.
    let moved = relay
        .call(
            "add_shape_layer",
            json!({
                "project": "poster", "expectedVersion": 1, "shape": "ellipse",
                "x": 5.0, "y": 5.0, "width": 10.0, "height": 10.0
            }),
        )
        .unwrap_or_else(|error| panic!("the relay did not follow the editor: {error}"));
    assert_eq!(moved["version"], 2);
    let editor_pid = u64::from(editor.child.id());
    assert_eq!(lock_pid(&root, "poster"), Some(editor_pid));
    let (_, document) = editor.api("GET", "/api/projects/poster/document", None);
    assert_eq!(document["version"], 2, "the editor sees the agent's edit");

    // The person stops the editor. The agent's next call is served locally.
    editor.stop();
    let state = relay
        .call("get_document_state", json!({ "project": "poster" }))
        .unwrap_or_else(|error| panic!("the relay did not come back to the workspace: {error}"));
    assert_eq!(state["version"], 2);
    relay.finish();
    assert_eq!(
        lock_pid(&root, "poster"),
        None,
        "the relay released its lock on exit"
    );
}

/// The reviewer's reproduction: a record in workspace A that names a server
/// for workspace B — left behind by a stopped server, or synchronised from
/// another computer. The agent configured for A must stay in A.
#[test]
fn a_record_that_names_another_workspace_is_not_used() {
    let scratch = tempfile::tempdir().unwrap();
    let workspace_a = workspace(&scratch.path().join("a"));
    let workspace_b = workspace(&scratch.path().join("b"));

    let editor_b = Editor::start(&workspace_b, false);
    let (status, _) = editor_b.api(
        "POST",
        "/api/projects",
        Some(json!({ "id": "only-in-b", "width": 100.0, "height": 100.0 })),
    );
    assert_eq!(status, 201);
    std::fs::copy(
        workspace_b.join("running.json"),
        workspace_a.join("running.json"),
    )
    .unwrap();

    let mut relay = Relay::start(&workspace_a);
    relay
        .call(
            "create_project",
            json!({ "project": "only-in-a", "width": 100.0, "height": 100.0 }),
        )
        .unwrap();
    let listed = relay.call("list_projects", json!({})).unwrap();
    let ids: Vec<&str> = listed["projects"]
        .as_array()
        .unwrap()
        .iter()
        .map(|project| project["id"].as_str().unwrap())
        .collect();
    assert_eq!(ids, ["only-in-a"], "the agent for A saw another workspace");
    assert!(workspace_a.join("projects/only-in-a").is_dir());
    assert!(!workspace_b.join("projects/only-in-a").exists());
    relay.finish();
    drop(editor_b);
}

/// An export still running on the local target does not hold the switch to
/// the editor back: it is cancelled, answered with an error, and the journal
/// holds nothing from it.
#[test]
fn a_slow_local_export_is_cancelled_when_the_editor_arrives() {
    let scratch = tempfile::tempdir().unwrap();
    let root = workspace(scratch.path());

    // The agent starts first and builds a heavy project: many blurred layers
    // on a large canvas at a doubled scale, so one export takes well over
    // the few seconds the set-up below needs.
    let mut relay = Relay::start(&root);
    relay
        .call(
            "create_project",
            json!({ "project": "poster", "width": 6000.0, "height": 6000.0 }),
        )
        .unwrap();
    let mut version = 0;
    for index in 0..150 {
        let added = relay
            .call(
                "add_shape_layer",
                json!({
                    "project": "poster", "expectedVersion": version, "shape": "ellipse",
                    "x": (index % 30) as f64 * 170.0, "y": (index / 30) as f64 * 170.0,
                    "width": 800.0, "height": 800.0,
                    "effects": [{ "type": "blur", "radius": 24.0 }]
                }),
            )
            .unwrap();
        version = added["version"].as_u64().unwrap();
    }
    assert_eq!(version, 150);

    // Send the export without waiting for its answer.
    let export_id = relay.next_id;
    relay.next_id += 1;
    relay.write(&json!({
        "jsonrpc": "2.0", "id": export_id, "method": "tools/call",
        "params": { "name": "export_document",
                    "arguments": { "project": "poster", "scale": 2.0, "name": "slow" } }
    }));
    // Give the render time to be under way before the person arrives.
    std::thread::sleep(Duration::from_secs(3));

    // The editor starts. The relay's own check must now cancel the export,
    // release the project, and move — instead of draining for up to 30 s.
    let editor = Editor::start(&root, true);
    let switch_started = Instant::now();
    let deadline = Instant::now() + Duration::from_secs(20);
    let mut export_answer: Option<Value> = None;
    while export_answer.is_none() {
        assert!(
            Instant::now() < deadline,
            "the cancelled export was never answered"
        );
        let line = relay
            .lines
            .recv_timeout(deadline.saturating_duration_since(Instant::now()))
            .expect("no answer to the cancelled export");
        let message: Value = serde_json::from_str(&line)
            .unwrap_or_else(|error| panic!("non-protocol line {line:?}: {error}"));
        if message["id"] == json!(export_id) {
            export_answer = Some(message);
        }
    }
    let waited = switch_started.elapsed();
    assert!(
        waited < Duration::from_secs(15),
        "the switch waited {waited:?}; the export was not cancelled promptly"
    );

    // The cancelled request is answered with an error, not a result.
    let answer = export_answer.unwrap();
    assert!(
        answer.get("error").is_some() || answer["result"]["isError"] == json!(true),
        "the cancelled export was answered with success: {answer}"
    );

    // The journal holds exactly the 120 layer adds: one request = one
    // transaction, and the cancelled export applied nothing.
    // The journal holds exactly the 150 layer adds: one request = one
    // transaction, and the cancelled export applied nothing.
    let (status, history) = editor.api("GET", "/api/projects/poster/history", None);
    assert_eq!(status, 200);
    assert_eq!(
        history["entries"].as_array().map(Vec::len),
        Some(150),
        "the journal changed behind the cancelled export: {history}"
    );
    assert!(!root.join("projects/poster/exports/slow.png").exists());

    // The relay now serves through the editor.
    let state = relay
        .call("get_document_state", json!({ "project": "poster" }))
        .unwrap_or_else(|error| panic!("the relay did not follow the editor: {error}"));
    assert_eq!(state["version"], 150);
    relay.finish();
    drop(editor);
}

/// The editor ends an idle session (five minutes by default; two seconds
/// here). The relay starts a new one and the call succeeds.
#[test]
fn a_session_the_editor_ended_for_idleness_is_renewed() {
    let scratch = tempfile::tempdir().unwrap();
    let root = workspace(scratch.path());
    let editor = Editor::start_with(
        &root,
        false,
        &[("ASSEMBLASH_MCP_SESSION_IDLE_SECS", "2")],
        None,
    );
    let (status, _) = editor.api(
        "POST",
        "/api/projects",
        Some(json!({ "id": "idle", "width": 100.0, "height": 100.0 })),
    );
    assert_eq!(status, 201);

    let mut relay = Relay::start(&root);
    relay.call("list_projects", json!({})).unwrap();
    std::thread::sleep(Duration::from_secs(5));
    for round in 0..2 {
        let state = relay
            .call("get_document_state", json!({ "project": "idle" }))
            .unwrap_or_else(|error| panic!("round {round} after idling: {error}"));
        assert_eq!(state["version"], 0);
        std::thread::sleep(Duration::from_secs(3));
    }
    assert_eq!(
        lock_pid(&root, "idle"),
        Some(u64::from(editor.child.id())),
        "the relay stayed on the editor"
    );
    relay.finish();
    drop(editor);
}

/// A workspace with an access token: the relay finds the editor (the check
/// sends the token) and uses it, so the agent does not lock the person out.
#[test]
fn an_editor_that_requires_the_token_is_found() {
    let scratch = tempfile::tempdir().unwrap();
    let root = workspace(scratch.path());
    let token = "relay-test-token-with-enough-length";
    std::fs::write(
        root.join(assemblash_core::workspace::CONFIG_FILE),
        format!("open-browser = false\ntoken = \"{token}\"\n"),
    )
    .unwrap();

    let editor = Editor::start_with(&root, false, &[], Some(token));
    let (status, _) = editor.api(
        "POST",
        "/api/projects",
        Some(json!({ "id": "guarded", "width": 100.0, "height": 100.0 })),
    );
    assert_eq!(status, 201);
    let (status, _) = editor.api("GET", "/api/projects/guarded/document", None);
    assert_eq!(status, 200);

    let mut relay = Relay::start(&root);
    let added = relay
        .call(
            "add_shape_layer",
            json!({
                "project": "guarded", "expectedVersion": 0, "shape": "rect",
                "x": 0.0, "y": 0.0, "width": 10.0, "height": 10.0
            }),
        )
        .unwrap_or_else(|error| panic!("the relay did not use the protected editor: {error}"));
    assert_eq!(added["version"], 1);
    assert_eq!(
        lock_pid(&root, "guarded"),
        Some(u64::from(editor.child.id()))
    );
    relay.finish();
    drop(editor);
}
