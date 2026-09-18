//! MCP hosted by the editor process.
//!
//! A person starts the editor and an agent connects to `/mcp` on the same
//! server. These tests run a real bound [`Server`] with the MCP service
//! mounted the way the command line mounts it, and talk to it over sockets:
//!
//! * the HTTP API opens a project, and `/mcp` reads and changes the same
//!   project with no `projectLocked`, in one journal, as an agent;
//! * a session that ends leaves the editor's projects open;
//! * a foreign `Host` or `Origin` is refused;
//! * a workspace token guards `/mcp` like every route;
//! * the endpoint does not hide the interface;
//! * stopping the editor ends open event streams, so shutdown finishes;
//! * the editor tells a page how an agent connects, and never the token.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{BufRead as _, BufReader, Read as _, Write as _};
use std::path::PathBuf;
use std::sync::mpsc;
use std::time::Duration;

use assemblash_core::workspace::Workspace;
use assemblash_mcp::{Backend, Hosting, MCP_PATH};
use assemblash_server::{AppState, Server, Shutdown};
use serde_json::{json, Value};

const PROTOCOL: &str = "2025-06-18";

/// A running editor with MCP mounted, on its own thread and runtime.
struct Editor {
    base: String,
    root: PathBuf,
    _directory: tempfile::TempDir,
    /// Receives once `serve` has returned.
    stopped: mpsc::Receiver<()>,
}

impl Editor {
    fn start(token: Option<&str>, shutdown: Shutdown) -> Self {
        let directory = tempfile::tempdir().unwrap();
        let root = directory.path().join("workspace");
        let mut workspace = Workspace::open_or_create(&root).unwrap();
        if let Some(token) = token {
            let mut config = workspace.config().clone();
            config.token = Some(token.to_owned());
            workspace.set_config(config).unwrap();
        }

        let (send, receive) = mpsc::channel();
        let (stopped_send, stopped) = mpsc::channel();
        std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(2)
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async move {
                let server = Server::bind_with(workspace, 0, Default::default(), shutdown)
                    .await
                    .unwrap();
                // Exactly what the `serve` command does.
                let hosting = Hosting {
                    url: server.url(),
                    port: server.address().port(),
                    local_only: server.site_guard().is_enabled(),
                    extra_hosts: server.site_guard().extra_hosts().to_vec(),
                    stopping: server.stop_signal(),
                    session_idle: None,
                };
                let (mcp, agents) =
                    assemblash_mcp::http_service_with_sessions(server.state(), hosting);
                let server = server
                    .with_service(MCP_PATH, mcp)
                    .with_agent_access(MCP_PATH)
                    .with_agent_sessions(move || agents.count());
                send.send(server.url()).unwrap();
                let _ = server.serve().await;
                let _ = stopped_send.send(());
            });
        });

        let base = receive.recv().expect("the server started");
        Self {
            base,
            root,
            _directory: directory,
            stopped,
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{path}", self.base)
    }

    fn port(&self) -> u16 {
        self.base.rsplit(':').next().unwrap().parse().unwrap()
    }

    fn lock_file(&self, project: &str) -> PathBuf {
        self.root
            .join("projects")
            .join(project)
            .join(".assemblash-lock")
    }
}

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(Duration::from_secs(30)))
        .build()
        .into()
}

/// A plain HTTP API call: status and JSON body.
fn api(method: &str, url: &str, body: Option<Value>) -> (u16, Value) {
    let agent = agent();
    let response = match (method, body) {
        ("GET", _) => agent.get(url).call(),
        ("POST", Some(body)) => agent
            .post(url)
            .header("Content-Type", "application/json")
            .send(body.to_string()),
        ("POST", None) => agent.post(url).send_empty(),
        _ => panic!("unsupported method {method}"),
    };
    let mut response = response.unwrap();
    let status = response.status().as_u16();
    let text = response.body_mut().read_to_string().unwrap();
    (status, serde_json::from_str(&text).unwrap_or(Value::Null))
}

/// A minimal Streamable HTTP MCP client, written from the specification
/// rather than taken from rmcp, so the server half is checked against a
/// different implementation.
struct Client {
    endpoint: String,
    token: Option<String>,
    session: Option<String>,
    next_id: u64,
}

impl Client {
    fn new(editor: &Editor) -> Self {
        Self {
            endpoint: editor.url(MCP_PATH),
            token: None,
            session: None,
            next_id: 1,
        }
    }

    fn post(&self, message: &Value) -> ureq::http::Response<ureq::Body> {
        let mut request = agent()
            .post(&self.endpoint)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream");
        if let Some(session) = &self.session {
            request = request
                .header("Mcp-Session-Id", session)
                .header("MCP-Protocol-Version", PROTOCOL);
        }
        if let Some(token) = &self.token {
            request = request.header("Authorization", format!("Bearer {token}"));
        }
        request.send(message.to_string()).unwrap()
    }

    /// Sends a request and returns its JSON-RPC response.
    fn request(&mut self, method: &str, params: Value) -> Value {
        let id = self.next_id;
        self.next_id += 1;
        let response = self.post(&json!({
            "jsonrpc": "2.0", "id": id, "method": method, "params": params
        }));
        assert_eq!(response.status().as_u16(), 200, "{method}");
        if let Some(session) = response.headers().get("mcp-session-id") {
            self.session = Some(session.to_str().unwrap().to_owned());
        }
        let is_stream = response
            .headers()
            .get("content-type")
            .and_then(|value| value.to_str().ok())
            .is_some_and(|value| value.starts_with("text/event-stream"));
        let reader = BufReader::new(response.into_body().into_reader());
        if !is_stream {
            return serde_json::from_reader(reader).unwrap();
        }
        // An event stream: read `data:` lines until this request's answer.
        for line in reader.lines() {
            let line = line.unwrap();
            let Some(data) = line.strip_prefix("data:") else {
                continue;
            };
            let Ok(message) = serde_json::from_str::<Value>(data.trim()) else {
                continue;
            };
            if message["id"] == json!(id) {
                return message;
            }
        }
        panic!("the stream ended before the answer to {method}");
    }

    fn initialize(&mut self) {
        let response = self.request(
            "initialize",
            json!({
                "protocolVersion": PROTOCOL,
                "capabilities": {},
                "clientInfo": { "name": "hosted-test", "version": "0" }
            }),
        );
        assert_eq!(response["result"]["serverInfo"]["name"], "assemblash");
        assert!(self.session.is_some(), "initialize returns a session id");
        let accepted = self.post(&json!({
            "jsonrpc": "2.0", "method": "notifications/initialized"
        }));
        assert_eq!(accepted.status().as_u16(), 202);
    }

    /// Calls a tool: its structured result, or the JSON-RPC error.
    fn call(&mut self, tool: &str, arguments: Value) -> Result<Value, Value> {
        let response = self.request(
            "tools/call",
            json!({ "name": tool, "arguments": arguments }),
        );
        if let Some(error) = response.get("error") {
            return Err(error.clone());
        }
        let result = &response["result"];
        assert_ne!(result["isError"], json!(true), "{tool}: {result}");
        Ok(result["structuredContent"].clone())
    }

    /// Ends the session, the way a client that closes does.
    fn end(&mut self) -> u16 {
        let session = self.session.take().unwrap();
        agent()
            .delete(&self.endpoint)
            .header("Mcp-Session-Id", &session)
            .header("MCP-Protocol-Version", PROTOCOL)
            .call()
            .unwrap()
            .status()
            .as_u16()
    }
}

/// One raw request, so the `Host` header is exactly what the test says.
fn raw_status(port: u16, host: &str, origin: Option<&str>) -> u16 {
    let body = json!({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {
            "protocolVersion": PROTOCOL,
            "capabilities": {},
            "clientInfo": { "name": "raw", "version": "0" }
        }
    })
    .to_string();
    let mut stream = std::net::TcpStream::connect(("127.0.0.1", port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .unwrap();
    let origin = origin
        .map(|origin| format!("Origin: {origin}\r\n"))
        .unwrap_or_default();
    write!(
        stream,
        "POST {MCP_PATH} HTTP/1.1\r\nHost: {host}\r\n{origin}\
         Content-Type: application/json\r\nAccept: application/json, text/event-stream\r\n\
         Content-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    )
    .unwrap();
    let response = read_all(stream);
    let status_line = response.lines().next().unwrap_or_default().to_owned();
    status_line
        .split_whitespace()
        .nth(1)
        .and_then(|code| code.parse().ok())
        .unwrap_or_else(|| panic!("no status line: {status_line:?}"))
}

#[test]
fn an_agent_edits_the_project_the_editor_has_open() {
    let editor = Editor::start(None, Shutdown::Refused);

    // The person creates and opens a project in the editor.
    let (status, _) = api(
        "POST",
        &editor.url("/api/projects"),
        Some(json!({ "id": "demo", "width": 800.0, "height": 600.0 })),
    );
    assert_eq!(status, 201);
    let (status, document) = api("GET", &editor.url("/api/projects/demo/document"), None);
    assert_eq!(status, 200);
    assert_eq!(document["version"], 0);
    let lock = std::fs::read_to_string(editor.lock_file("demo")).unwrap();
    let holder: Value = serde_json::from_str(&lock).unwrap();
    assert_eq!(
        holder["pid"],
        std::process::id(),
        "the editor holds the lock"
    );

    // The agent reads it: the report's reproduction answered `projectLocked`.
    let mut client = Client::new(&editor);
    client.initialize();
    let state = client
        .call("get_document_state", json!({ "project": "demo" }))
        .unwrap_or_else(|error| panic!("the hosted read was refused: {error}"));
    assert_eq!(state["version"], 0);

    // Agent, person, agent: versions interleave in one sequence.
    let added = client
        .call(
            "add_shape_layer",
            json!({
                "project": "demo", "expectedVersion": 0, "shape": "rect",
                "x": 10.0, "y": 10.0, "width": 100.0, "height": 50.0
            }),
        )
        .unwrap();
    assert_eq!(added["version"], 1);
    let layer = added["created"][0].as_str().unwrap().to_owned();

    let (status, moved) = api(
        "POST",
        &editor.url("/api/projects/demo/operations"),
        Some(json!({
            "operation": { "op": "move", "id": layer, "dx": 5.0, "dy": 0.0 },
            "expectedVersion": 1,
            "actor": { "kind": "human", "name": "reference UI" }
        })),
    );
    assert_eq!(status, 200, "{moved}");
    assert_eq!(moved["version"], 2);

    let moved = client
        .call(
            "move_layer",
            json!({
                "project": "demo", "expectedVersion": 2,
                "layerId": layer, "dx": 0.0, "dy": 5.0
            }),
        )
        .unwrap();
    assert_eq!(moved["version"], 3);

    // An agent that did not re-read gets the ordinary conflict.
    let stale = client
        .call(
            "move_layer",
            json!({
                "project": "demo", "expectedVersion": 2,
                "layerId": layer, "dx": 1.0, "dy": 1.0
            }),
        )
        .unwrap_err();
    assert_eq!(stale["data"]["code"], "versionConflict", "{stale}");

    // One journal, in order, with the agent recorded as an agent.
    let (status, history) = api("GET", &editor.url("/api/projects/demo/history"), None);
    assert_eq!(status, 200);
    let entries = history["entries"].as_array().unwrap();
    let kinds: Vec<&str> = entries
        .iter()
        .map(|entry| entry["actor"]["kind"].as_str().unwrap())
        .collect();
    assert_eq!(kinds, ["agent", "human", "agent"], "{history}");
    let positions: Vec<u64> = entries
        .iter()
        .map(|entry| entry["position"].as_u64().unwrap())
        .collect();
    assert_eq!(positions, [1, 2, 3]);
    let (_, document) = api("GET", &editor.url("/api/projects/demo/document"), None);
    assert_eq!(document["version"], 3);
    assert_eq!(document["layers"][0]["transform"]["x"], 15.0);
    assert_eq!(document["layers"][0]["transform"]["y"], 15.0);

    // The agent leaves. The editor's project stays open and editable.
    let ended = client.end();
    assert!((200..300).contains(&ended), "ending the session: {ended}");
    assert!(
        editor.lock_file("demo").is_file(),
        "a session ending must not close the editor's projects"
    );
    let (status, moved) = api(
        "POST",
        &editor.url("/api/projects/demo/operations"),
        Some(json!({
            "operation": { "op": "move", "id": layer, "dx": 1.0, "dy": 0.0 },
            "expectedVersion": 3
        })),
    );
    assert_eq!(status, 200, "{moved}");
    assert_eq!(moved["version"], 4);

    // A new agent session sees the person's latest edit.
    let mut again = Client::new(&editor);
    again.initialize();
    let state = again
        .call("get_document_state", json!({ "project": "demo" }))
        .unwrap();
    assert_eq!(state["version"], 4);

    // A project an agent creates is one the editor lists.
    again
        .call(
            "create_project",
            json!({ "project": "from-agent", "width": 100.0, "height": 100.0 }),
        )
        .unwrap();
    let (_, list) = api("GET", &editor.url("/api/projects"), None);
    assert!(
        list["projects"]
            .as_array()
            .unwrap()
            .iter()
            .any(|project| project["id"] == "from-agent"),
        "{list}"
    );
}

#[test]
fn a_foreign_host_or_origin_is_refused() {
    let editor = Editor::start(None, Shutdown::Refused);
    let port = editor.port();

    // DNS rebinding: a page whose own name resolves to 127.0.0.1.
    assert_eq!(
        raw_status(port, &format!("attacker.example:{port}"), None),
        403
    );
    // A page on another origin.
    assert_eq!(
        raw_status(
            port,
            &format!("127.0.0.1:{port}"),
            Some("http://evil.example")
        ),
        403
    );
    // The editor's own page, and a client that sends no Origin, pass.
    assert_eq!(
        raw_status(
            port,
            &format!("127.0.0.1:{port}"),
            Some(&format!("http://127.0.0.1:{port}"))
        ),
        200
    );
    assert_eq!(raw_status(port, &format!("localhost:{port}"), None), 200);
}

#[test]
fn the_workspace_token_guards_the_endpoint() {
    let token = "hosted-test-token";
    let editor = Editor::start(Some(token), Shutdown::Refused);

    let mut client = Client::new(&editor);
    let refused = client.post(&json!({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {
            "protocolVersion": PROTOCOL, "capabilities": {},
            "clientInfo": { "name": "no-token", "version": "0" }
        }
    }));
    assert_eq!(refused.status().as_u16(), 401);
    let body: Value = serde_json::from_reader(refused.into_body().into_reader()).unwrap();
    assert_eq!(body["error"]["code"], "unauthorized");

    client.token = Some("wrong".to_owned());
    let refused = client.post(&json!({ "jsonrpc": "2.0", "method": "ping", "id": 2 }));
    assert_eq!(refused.status().as_u16(), 401);

    client.token = Some(token.to_owned());
    client.initialize();
    client.call("list_projects", json!({})).unwrap();
}

#[test]
fn the_endpoint_does_not_hide_the_interface() {
    let editor = Editor::start(None, Shutdown::Refused);
    let agent = agent();

    for path in ["/", "/app.js", "/index.html"] {
        let response = agent.get(editor.url(path)).call().unwrap();
        assert_eq!(response.status().as_u16(), 200, "{path}");
    }
    // GET on the endpoint reaches MCP, not the interface's file list.
    let mut response = agent.get(editor.url(MCP_PATH)).call().unwrap();
    let text = response.body_mut().read_to_string().unwrap_or_default();
    assert!(!text.contains("<html"), "GET /mcp served the interface");
    assert_ne!(response.status().as_u16(), 404);
}

#[test]
fn stopping_the_editor_ends_open_streams() {
    let editor = Editor::start(None, Shutdown::Allowed);
    let mut client = Client::new(&editor);
    client.initialize();

    // A standalone event stream, held open the way a client holds one.
    let session = client.session.clone().unwrap();
    let endpoint = editor.url(MCP_PATH);
    let (opened_send, opened) = mpsc::channel();
    std::thread::spawn(move || {
        let response = agent()
            .get(&endpoint)
            .header("Accept", "text/event-stream")
            .header("Mcp-Session-Id", &session)
            .header("MCP-Protocol-Version", PROTOCOL)
            .call()
            .unwrap();
        let _ = opened_send.send(response.status().as_u16());
        let mut sink = Vec::new();
        let _ = response.into_body().into_reader().read_to_end(&mut sink);
    });
    assert_eq!(opened.recv_timeout(Duration::from_secs(10)).unwrap(), 200);

    let (status, _) = api("POST", &editor.url("/api/shutdown"), None);
    assert_eq!(status, 200);
    editor
        .stopped
        .recv_timeout(Duration::from_secs(20))
        .expect("the server stopped although an event stream was open");
}

/// The trap the plan names first: a hosted backend closing the editor's
/// projects when an agent leaves.
#[test]
fn a_hosted_backend_never_closes_the_editors_projects() {
    let directory = tempfile::tempdir().unwrap();
    let workspace = Workspace::open_or_create(directory.path().join("workspace")).unwrap();
    let state = AppState::new(workspace);

    let hosted = Backend::from_state(state.clone());
    assert!(hosted.is_hosted());
    hosted
        .create_project("demo", 100.0, 100.0, None, None)
        .unwrap();
    let lock = directory
        .path()
        .join("workspace/projects/demo/.assemblash-lock");
    assert!(lock.is_file());

    hosted.close();
    assert!(
        lock.is_file(),
        "close() on a hosted backend released a project"
    );
    hosted.document_state(Some("demo")).unwrap();

    // The editor itself still releases them on its way out.
    state.close_all();
    assert!(!lock.is_file());
}

#[test]
fn the_editor_says_how_an_agent_connects_and_never_the_token() {
    let token = "agent-access-secret";
    let editor = Editor::start(Some(token), Shutdown::Refused);

    // Behind the token like every route.
    let (status, _) = api("GET", &editor.url("/api/agent-access"), None);
    assert_eq!(status, 401);

    let mut response = agent()
        .get(editor.url("/api/agent-access"))
        .header("Authorization", format!("Bearer {token}"))
        .call()
        .unwrap();
    assert_eq!(response.status().as_u16(), 200);
    let text = response.body_mut().read_to_string().unwrap();
    assert!(!text.contains(token), "the token leaked: {text}");
    let access: Value = serde_json::from_str(&text).unwrap();
    assert_eq!(access["mcpUrl"], editor.url(MCP_PATH));
    assert_eq!(access["tokenRequired"], true);
    let executable = PathBuf::from(access["executable"].as_str().unwrap());
    assert!(executable.is_file(), "{executable:?}");
    let workspace = PathBuf::from(access["workspace"].as_str().unwrap());
    assert_eq!(
        std::fs::canonicalize(workspace).unwrap(),
        std::fs::canonicalize(&editor.root).unwrap()
    );
}

/// A request that is still running holds its own handle on a project. The
/// relay waits for it before it hands the projects to the editor, so the
/// editor does not meet `projectLocked` from a request that is just ending.
#[test]
fn closing_and_waiting_outlasts_a_request_that_still_holds_a_project() {
    let directory = tempfile::tempdir().unwrap();
    let workspace = Workspace::open_or_create(directory.path().join("workspace")).unwrap();
    let owned = Backend::workspace(workspace);
    owned
        .create_project("busy", 100.0, 100.0, None, None)
        .unwrap();
    let lock = directory
        .path()
        .join("workspace/projects/busy/.assemblash-lock");

    // What a tool call in progress holds.
    let in_progress = owned.open(Some("busy")).unwrap();
    let release = std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(300));
        drop(in_progress);
    });
    let started = std::time::Instant::now();
    assert!(owned.close_and_wait(Duration::from_secs(10)));
    assert!(
        started.elapsed() >= Duration::from_millis(250),
        "returned before the request ended"
    );
    assert!(
        !lock.exists(),
        "the lock is gone when close_and_wait returns"
    );
    release.join().unwrap();

    // A request that does not end in time is reported, not waited for forever.
    let owned_again =
        Backend::workspace(Workspace::open_or_create(directory.path().join("workspace")).unwrap());
    let stuck = owned_again.open(Some("busy")).unwrap();
    assert!(!owned_again.close_and_wait(Duration::from_millis(100)));
    drop(stuck);
    assert!(!lock.exists());
}

/// Everything the server sent before it closed the connection.
///
/// A refusal that comes before the server reads the request body closes the
/// connection with the body unread, and Windows then resets it. The response
/// has already arrived by then, so a reset after some bytes is the end of the
/// response, not a failure. A reset before any byte still fails the test.
fn read_all(mut stream: std::net::TcpStream) -> String {
    let mut raw = Vec::new();
    let mut buffer = [0_u8; 8192];
    loop {
        match stream.read(&mut buffer) {
            Ok(0) => break,
            Ok(read) => raw.extend_from_slice(&buffer[..read]),
            Err(error) if error.kind() == std::io::ErrorKind::Interrupted => {}
            Err(error) if !raw.is_empty() => {
                let _ = error;
                break;
            }
            Err(error) => panic!("no response before the connection failed: {error}"),
        }
    }
    String::from_utf8_lossy(&raw).into_owned()
}

/// The editor can say how many agents are connected, so a person is not
/// surprised by a change they did not make.
#[test]
fn the_editor_counts_the_agents_that_are_connected() {
    let editor = Editor::start(None, Shutdown::Refused);
    let count = || api("GET", &editor.url("/api/agent-sessions"), None).1["count"].clone();
    assert_eq!(count(), json!(0));

    let mut first = Client::new(&editor);
    first.initialize();
    assert_eq!(count(), json!(1));

    let mut second = Client::new(&editor);
    second.initialize();
    assert_eq!(count(), json!(2), "two agents, two sessions");

    first.end();
    assert_eq!(count(), json!(1), "a session that ended is not counted");
    second.end();
    assert_eq!(count(), json!(0));
}
