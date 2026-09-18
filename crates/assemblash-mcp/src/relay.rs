//! `assemblash mcp` in front of a running editor.
//!
//! Most desktop MCP clients only start stdio servers. When a person's editor
//! is already running for the same workspace, a stdio server that opened the
//! projects itself would be a second writer, and whichever process opened a
//! project first would lock the other out. So this relay forwards the
//! client's messages to the editor's hosted endpoint (`POST <url>/mcp`) and
//! opens nothing itself.
//!
//! When no editor runs, it serves the workspace locally, exactly as
//! `assemblash mcp` always did.
//!
//! # Which editor
//!
//! The workspace records its running server in `running.json`. The relay
//! uses a record only when three things hold: the address is loopback, a
//! server answers there as Assemblash, and that server says it serves *this*
//! workspace (`GET /api/agent-access`). A record left behind by a server that
//! stopped, or synchronised from another computer, can name a different
//! server on the same port — and an agent must never edit the wrong
//! workspace.
//!
//! # The target is chosen again while the client is connected
//!
//! The relay checks about once a second whether an editor runs. When one
//! appears, the relay releases every project it holds and moves to the
//! editor; when the editor stops, it moves back. The client's `initialize` is
//! replayed to each new target, and its answer is not passed on: the client
//! already has one. Without the move, an agent that started first would lock
//! the person out of their own project for as long as the agent ran.
//!
//! A busy editor can miss one check, so the relay leaves a live editor only
//! when its record is gone or several checks in a row fail.
//!
//! The editor ends a session that stays idle (five minutes by default). The
//! relay then starts a new session and sends the request again.
//!
//! # Every request is answered
//!
//! A request that cannot be delivered, whose answer stream ends early, or
//! that is still open when the relay leaves a target, is answered with a
//! JSON-RPC error. A client never waits for an answer that cannot come.
//!
//! # Standard output is protocol
//!
//! Every line written to stdout is one JSON-RPC message, written whole under
//! one lock. Diagnostics go to stderr.

use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader, Write as _};
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use assemblash_core::workspace::Workspace;
use rmcp::ServiceExt as _;
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt as _, AsyncWriteExt as _};

use crate::{AssemblashMcp, Backend, McpError, MCP_PATH};

/// How often the relay asks whether an editor runs.
const CHECK_EVERY: Duration = Duration::from_secs(1);

/// How many checks in a row must fail before the relay leaves an editor
/// whose record is still there.
const FAILED_CHECKS_TO_LEAVE: u32 = 3;

/// The protocol version the relay asks for when it replays `initialize`
/// without one from the client.
const FALLBACK_PROTOCOL: &str = "2025-06-18";

/// How long the relay waits for the local server to answer what it was sent
/// before it leaves.
const LOCAL_DRAIN: Duration = Duration::from_secs(30);

/// Where the client's messages go.
#[derive(Debug)]
enum Target {
    /// Not chosen yet: no message has needed one.
    None,
    /// The editor's hosted endpoint.
    Remote(Remote),
    /// This process, over its own copy of the workspace.
    Local(Local),
}

/// One MCP session on an editor.
#[derive(Debug, Clone, PartialEq, Eq)]
struct Session {
    id: String,
    protocol: String,
}

/// A running editor's endpoint, shared by the threads that post to it.
#[derive(Clone)]
struct Remote {
    inner: Arc<RemoteInner>,
}

struct RemoteInner {
    base: String,
    /// The editor process, so a restart on the same port is a new target.
    pid: u32,
    endpoint: String,
    token: Option<String>,
    session: Mutex<Option<Session>>,
    /// The client's `initialize`, for a session that must be started again.
    initialize: Mutex<Option<Value>>,
    /// Held while a new session is started, so two requests that both find
    /// the session expired start one new session, not two.
    renewing: Mutex<()>,
    /// Numbers the replayed `initialize` requests.
    replays: std::sync::atomic::AtomicU64,
}

// Written by hand so the token cannot reach a log through a derived `Debug`.
impl std::fmt::Debug for Remote {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Remote")
            .field("base", &self.inner.base)
            .field("pid", &self.inner.pid)
            .field("token", &self.inner.token.as_ref().map(|_| "<redacted>"))
            .finish_non_exhaustive()
    }
}

/// The MCP server running in this process, behind an in-memory pipe.
#[derive(Debug)]
struct Local {
    writer: tokio::io::WriteHalf<tokio::io::DuplexStream>,
    /// Passes the local server's messages on; ends when the server closes.
    reader: tokio::task::JoinHandle<()>,
}

/// Writes whole lines to stdout, one at a time.
#[derive(Debug, Clone)]
struct Output {
    stdout: Arc<Mutex<std::io::Stdout>>,
    /// Ids of replayed requests whose answers the client must not see.
    swallow: Arc<Mutex<HashSet<String>>>,
    /// Requests sent to the local server and not answered yet, by id.
    pending: Arc<Mutex<HashMap<String, Value>>>,
}

impl Output {
    fn new() -> Self {
        Self {
            stdout: Arc::new(Mutex::new(std::io::stdout())),
            swallow: Arc::new(Mutex::new(HashSet::new())),
            pending: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Sends one message to the client, unless it answers a replay.
    fn send(&self, message: &Value) {
        if let Some(id) = response_id(message) {
            let key = id.to_string();
            if let Ok(mut pending) = self.pending.lock() {
                pending.remove(&key);
            }
            if let Ok(mut swallow) = self.swallow.lock() {
                if swallow.remove(&key) {
                    return;
                }
            }
        }
        let Ok(mut line) = serde_json::to_string(message) else {
            return;
        };
        line.push('\n');
        if let Ok(mut stdout) = self.stdout.lock() {
            let _ = stdout.write_all(line.as_bytes());
            let _ = stdout.flush();
        }
    }

    fn swallow(&self, id: &Value) {
        if let Ok(mut swallow) = self.swallow.lock() {
            swallow.insert(id.to_string());
        }
    }

    fn expect_answer(&self, id: &Value) {
        if let Ok(mut pending) = self.pending.lock() {
            pending.insert(id.to_string(), id.clone());
        }
    }

    /// Answers every request the local server did not answer.
    fn fail_pending(&self, reason: &str) {
        let ids: Vec<Value> = match self.pending.lock() {
            Ok(mut pending) => pending.drain().map(|(_, id)| id).collect(),
            Err(_) => Vec::new(),
        };
        for id in ids {
            let swallowed = self
                .swallow
                .lock()
                .map(|mut swallow| swallow.remove(&id.to_string()))
                .unwrap_or(false);
            if !swallowed {
                self.send(&error_for(&id, reason));
            }
        }
    }
}

/// The id of a response (an answer, not a request or a notification).
fn response_id(message: &Value) -> Option<&Value> {
    message
        .get("id")
        .filter(|_| message.get("method").is_none())
}

/// The id of a request (a message the peer must answer).
fn request_id(message: &Value) -> Option<&Value> {
    message
        .get("id")
        .filter(|_| message.get("method").is_some())
}

fn error_for(id: &Value, reason: &str) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "error": { "code": -32603, "message": reason },
    })
}

/// What the stdin thread reports.
enum Input {
    Message(Value),
    End,
}

/// Serves MCP on stdio for a workspace, relaying to a running editor when
/// there is one.
pub fn relay(workspace: Workspace, reclaim_stale_locks: bool) -> Result<(), McpError> {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .map_err(|error| McpError::Start(error.to_string()))?;
    let root = workspace.root().to_path_buf();
    let token = workspace
        .config()
        .token
        .clone()
        .filter(|token| !token.is_empty());
    let backend = Backend::workspace_with(workspace, reclaim_stale_locks);

    let (send, receive) = mpsc::channel();
    std::thread::spawn(move || read_stdin(&send));

    let mut relay = Relay {
        runtime,
        root,
        token,
        backend,
        output: Output::new(),
        target: Target::None,
        initialize: None,
        initialized: false,
        last_check: None,
        failed_checks: 0,
        rejected: None,
        editor: None,
        in_flight: Vec::new(),
    };

    loop {
        match receive.recv_timeout(CHECK_EVERY) {
            Ok(Input::Message(message)) => relay.handle(message),
            Ok(Input::End) | Err(mpsc::RecvTimeoutError::Disconnected) => break,
            Err(mpsc::RecvTimeoutError::Timeout) => {
                // A client that is quiet still must not hold projects the
                // person's editor needs.
                if relay.initialize.is_some() {
                    relay.choose_target(true);
                }
            }
        }
    }
    relay.leave();
    Ok(())
}

fn read_stdin(send: &mpsc::Sender<Input>) {
    let stdin = std::io::stdin();
    for line in stdin.lock().lines() {
        let Ok(line) = line else { break };
        if line.trim().is_empty() {
            continue;
        }
        match serde_json::from_str::<Value>(&line) {
            Ok(message) => {
                if send.send(Input::Message(message)).is_err() {
                    return;
                }
            }
            Err(error) => eprintln!("assemblash mcp: ignored a line that is not JSON: {error}"),
        }
    }
    let _ = send.send(Input::End);
}

struct Relay {
    runtime: tokio::runtime::Runtime,
    root: PathBuf,
    token: Option<String>,
    backend: Backend,
    output: Output,
    target: Target,
    /// The client's own `initialize` request, once it was sent to a target.
    initialize: Option<Value>,
    /// Whether the client has said `notifications/initialized`.
    initialized: bool,
    last_check: Option<Instant>,
    /// Checks in a row that did not find the current editor.
    failed_checks: u32,
    /// A server whose record was refused, so it is not checked and reported
    /// again every second.
    rejected: Option<(String, u32)>,
    /// The editor URL in use, for messages on stderr.
    editor: Option<String>,
    /// Requests posted to the editor and not answered yet.
    in_flight: Vec<std::thread::JoinHandle<()>>,
}

impl Relay {
    fn handle(&mut self, message: Value) {
        let method = message
            .get("method")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        self.choose_target(method == "initialize");
        if method == "initialize" {
            // Kept after the target is chosen: a replay before the client's
            // own initialize has reached any target would send it twice.
            self.initialize = Some(message.clone());
            if let Target::Remote(remote) = &self.target {
                remote.set_initialize(&message);
            }
        }
        if method == "notifications/initialized" {
            self.initialized = true;
        }
        match &mut self.target {
            Target::Remote(remote) => {
                let remote = remote.clone();
                let output = self.output.clone();
                if method == "initialize" {
                    // Inline: its answer carries the session every later
                    // request needs.
                    remote.start_session(&message, &output, false);
                } else if request_id(&message).is_some() {
                    // Requests run side by side, so a long export does not
                    // hold up a ping or a cancellation.
                    self.in_flight.retain(|request| !request.is_finished());
                    self.in_flight
                        .push(std::thread::spawn(move || remote.post(&message, &output)));
                } else {
                    remote.post(&message, &output);
                }
            }
            Target::Local(local) => {
                if let Some(id) = request_id(&message) {
                    self.output.expect_answer(id);
                }
                let mut line = message.to_string();
                line.push('\n');
                let writer = &mut local.writer;
                let written = self
                    .runtime
                    .block_on(async { writer.write_all(line.as_bytes()).await });
                if written.is_err() {
                    answer_error(&self.output, &message, "the local MCP server stopped");
                }
            }
            Target::None => answer_error(&self.output, &message, "no MCP server is available"),
        }
    }

    /// Picks the editor when one runs for this workspace, this process
    /// otherwise.
    ///
    /// Checks at most once per [`CHECK_EVERY`] unless `now` is set.
    fn choose_target(&mut self, now: bool) {
        let record_gone = !assemblash_server::instance::instance_path(&self.root).is_file();
        let on_editor = matches!(self.target, Target::Remote(_));
        let due = self
            .last_check
            .is_none_or(|last| last.elapsed() >= CHECK_EVERY);
        // An editor that stopped cleanly removed its record: one `stat`, so
        // the first message after a stop already goes to the new target.
        if !(now || due || (on_editor && record_gone) || matches!(self.target, Target::None)) {
            return;
        }
        self.last_check = Some(Instant::now());

        let found = self.find_editor();
        if let (Target::Remote(remote), None) = (&self.target, &found) {
            // A busy editor can miss one check. Leave it only when its record
            // is gone or it has missed several checks in a row.
            let same_record = assemblash_server::instance::read(&self.root)
                .ok()
                .flatten()
                .is_some_and(|running| {
                    running.url == remote.inner.base && running.pid == remote.inner.pid
                });
            if same_record {
                self.failed_checks += 1;
                if self.failed_checks < FAILED_CHECKS_TO_LEAVE {
                    return;
                }
            }
        }
        self.failed_checks = 0;

        let unchanged = match (&self.target, &found) {
            (Target::Remote(remote), Some((url, pid))) => {
                remote.inner.base == *url && remote.inner.pid == *pid
            }
            (Target::Local(_), None) => true,
            _ => false,
        };
        if unchanged {
            return;
        }
        let url = found.as_ref().map(|(url, _)| url.clone());
        if url != self.editor {
            match &url {
                Some(url) => eprintln!("assemblash mcp: using the running editor at {url}"),
                None if self.editor.is_some() => {
                    eprintln!("assemblash mcp: the editor stopped; serving the workspace here")
                }
                None => {}
            }
            self.editor = url;
        }

        self.leave();
        self.target = match found {
            Some((base, pid)) => {
                let remote = Remote::new(base, pid, self.token.clone());
                if let Some(initialize) = &self.initialize {
                    remote.set_initialize(initialize);
                }
                Target::Remote(remote)
            }
            None => Target::Local(self.start_local()),
        };
        self.replay();
    }

    /// The editor recorded for this workspace, when it answers and serves
    /// this workspace.
    fn find_editor(&mut self) -> Option<(String, u32)> {
        let url =
            assemblash_server::instance::running_url_with_token(&self.root, self.token.as_deref())?;
        let pid = assemblash_server::instance::read(&self.root)
            .ok()
            .flatten()
            .map_or(0, |running| running.pid);
        let candidate = (url, pid);

        if let Target::Remote(remote) = &self.target {
            if remote.inner.base == candidate.0 && remote.inner.pid == candidate.1 {
                // Already confirmed when the relay moved to it.
                return Some(candidate);
            }
        }
        if self.rejected.as_ref() == Some(&candidate) {
            return None;
        }
        match serves_workspace(&candidate.0, self.token.as_deref(), &self.root) {
            Ok(()) => {
                self.rejected = None;
                Some(candidate)
            }
            Err(reason) => {
                eprintln!(
                    "assemblash mcp: not using the server at {}: {reason}",
                    candidate.0
                );
                self.rejected = Some(candidate);
                None
            }
        }
    }

    /// Sends the client's `initialize` to a new target, keeping its answer
    /// from the client.
    fn replay(&mut self) {
        let Some(initialize) = self.initialize.clone() else {
            // The client's own initialize has not been sent yet: it goes to
            // this target in the ordinary way.
            return;
        };
        match &mut self.target {
            Target::Remote(remote) => {
                let remote = remote.clone();
                remote.start_session(&initialize, &self.output, true);
                if self.initialized {
                    remote.post(&initialized_notification(), &self.output);
                }
            }
            Target::Local(local) => {
                let mut replayed = initialize;
                let id = json!("assemblash-relay-replay-local");
                replayed["id"] = id.clone();
                self.output.swallow(&id);
                let mut lines = format!("{replayed}\n");
                if self.initialized {
                    lines.push_str(&format!("{}\n", initialized_notification()));
                }
                let writer = &mut local.writer;
                let _ = self
                    .runtime
                    .block_on(async { writer.write_all(lines.as_bytes()).await });
            }
            Target::None => {}
        }
    }

    fn start_local(&self) -> Local {
        let (client, server) = tokio::io::duplex(64 * 1024);
        let (client_read, client_write) = tokio::io::split(client);
        let backend = self.backend.clone();
        let output = self.output.clone();

        self.runtime.spawn(async move {
            match AssemblashMcp::new(backend).serve(server).await {
                Ok(service) => {
                    let _ = service.waiting().await;
                }
                Err(error) => eprintln!("assemblash mcp: the local server stopped: {error}"),
            }
        });
        let reader = self.runtime.spawn(async move {
            let mut lines = tokio::io::BufReader::new(client_read).lines();
            while let Ok(Some(line)) = lines.next_line().await {
                if let Ok(message) = serde_json::from_str::<Value>(&line) {
                    output.send(&message);
                }
            }
        });
        Local {
            writer: client_write,
            reader,
        }
    }

    /// Leaves the current target: ends the editor session, or stops the
    /// local server and releases every project it holds — before the editor
    /// needs them.
    ///
    /// Work already sent is answered first, so a client that writes its
    /// requests and closes its end still reads every answer. What cannot be
    /// answered is answered with an error.
    fn leave(&mut self) {
        match std::mem::replace(&mut self.target, Target::None) {
            Target::Remote(remote) => {
                for request in self.in_flight.drain(..) {
                    let _ = request.join();
                }
                remote.end_session();
            }
            Target::Local(mut local) => {
                // Closing the pipe ends the local server once it has
                // answered what it was sent; the reader ends with it.
                self.runtime.block_on(async {
                    let _ = local.writer.shutdown().await;
                    let _ = tokio::time::timeout(LOCAL_DRAIN, &mut local.reader).await;
                });
                self.output.fail_pending(
                    "the request was not answered: the MCP server changed while it was in \
                     progress; send it again",
                );
                if !self.backend.close_and_wait(LOCAL_DRAIN) {
                    eprintln!(
                        "assemblash mcp: a request still holds a project after {} s; the editor \
                         may find that project locked until it ends",
                        LOCAL_DRAIN.as_secs()
                    );
                }
            }
            Target::None => {}
        }
    }
}

fn initialized_notification() -> Value {
    json!({ "jsonrpc": "2.0", "method": "notifications/initialized" })
}

/// A blocking HTTP client for loopback requests.
fn agent(timeout: Duration) -> ureq::Agent {
    ureq::Agent::config_builder()
        .http_status_as_error(false)
        .timeout_global(Some(timeout))
        .build()
        .into()
}

/// Loopback, but an export can take a while; a request that never returns is
/// answered with an error instead of hanging the client.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(600);

/// Short: ending a session or checking a server must not hold anything up.
const QUICK_TIMEOUT: Duration = Duration::from_secs(5);

/// Whether the server at `base` says that it serves the workspace at `root`.
fn serves_workspace(base: &str, token: Option<&str>, root: &Path) -> Result<(), String> {
    let mut request = agent(QUICK_TIMEOUT).get(format!("{base}/api/agent-access"));
    if let Some(token) = token {
        request = request.header("Authorization", format!("Bearer {token}"));
    }
    let mut response = request
        .call()
        .map_err(|error| format!("it did not answer: {error}"))?;
    let status = response.status().as_u16();
    if status != 200 {
        return Err(format!(
            "it has no MCP endpoint for agents (status {status}); it may be an older version"
        ));
    }
    let access: Value = response
        .body_mut()
        .read_to_string()
        .map_err(|error| error.to_string())
        .and_then(|text| serde_json::from_str(&text).map_err(|error| error.to_string()))
        .map_err(|error| format!("its answer was not readable: {error}"))?;
    let served = access
        .get("workspace")
        .and_then(Value::as_str)
        .ok_or("its answer names no workspace")?;
    if same_directory(Path::new(served), root) {
        Ok(())
    } else {
        Err(format!(
            "it serves the workspace {served}, not {}",
            root.display()
        ))
    }
}

/// Whether two paths name one directory, however they are spelled.
fn same_directory(a: &Path, b: &Path) -> bool {
    match (std::fs::canonicalize(a), std::fs::canonicalize(b)) {
        (Ok(a), Ok(b)) => a == b,
        _ => false,
    }
}

/// Why a post did not give a response to read.
enum PostError {
    /// The editor no longer knows the session: it was idle too long, or the
    /// editor ended it.
    SessionExpired,
    /// Anything else, as a message for the client.
    Failed(String),
}

impl Remote {
    fn new(base: String, pid: u32, token: Option<String>) -> Self {
        Self {
            inner: Arc::new(RemoteInner {
                endpoint: format!("{base}{MCP_PATH}"),
                base,
                pid,
                token,
                session: Mutex::new(None),
                initialize: Mutex::new(None),
                renewing: Mutex::new(()),
                replays: std::sync::atomic::AtomicU64::new(0),
            }),
        }
    }

    fn set_initialize(&self, initialize: &Value) {
        if let Ok(mut slot) = self.inner.initialize.lock() {
            *slot = Some(initialize.clone());
        }
    }

    fn session(&self) -> Option<Session> {
        self.inner.session.lock().ok().and_then(|slot| slot.clone())
    }

    /// Posts `initialize` and keeps the session it starts.
    ///
    /// For the client's own `initialize`, the answer goes to the client. For
    /// a replay, the request gets a new id and its answer is swallowed.
    fn start_session(&self, initialize: &Value, output: &Output, replay: bool) -> bool {
        let mut message = initialize.clone();
        if replay {
            let number = self
                .inner
                .replays
                .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            let id = json!(format!("assemblash-relay-replay-{number}"));
            message["id"] = id.clone();
            output.swallow(&id);
        }
        let mut response = match self.send(&message, None) {
            Ok(response) => response,
            Err(error) => {
                // For a replay the error answer is swallowed, which also
                // removes its entry: no answer to it will ever come.
                answer_error(output, &message, &error_text(&error));
                return false;
            }
        };
        let session = response
            .headers()
            .get("mcp-session-id")
            .and_then(|value| value.to_str().ok())
            .map(ToOwned::to_owned);
        let answers = read_response(&mut response, message.get("id"));
        let mut protocol = FALLBACK_PROTOCOL.to_owned();
        for answer in &answers {
            if let Some(version) = answer["result"]["protocolVersion"].as_str() {
                protocol = version.to_owned();
            }
            output.send(answer);
        }
        if !answered(&answers, message.get("id")) {
            answer_error(
                output,
                &message,
                "the editor closed the connection before it answered",
            );
            return false;
        }
        match (session, self.inner.session.lock()) {
            (Some(id), Ok(mut slot)) => {
                *slot = Some(Session { id, protocol });
                true
            }
            _ => false,
        }
    }

    /// Starts a new session when `expired` is still the current one.
    fn renew(&self, expired: Option<&Session>, output: &Output) -> bool {
        let Ok(_renewing) = self.inner.renewing.lock() else {
            return false;
        };
        if self.session().as_ref() != expired {
            // Another request renewed it while this one waited.
            return true;
        }
        let Some(initialize) = self.inner.initialize.lock().ok().and_then(|i| i.clone()) else {
            return false;
        };
        eprintln!("assemblash mcp: the editor ended the idle session; starting a new one");
        if !self.start_session(&initialize, output, true) {
            return false;
        }
        let notification = initialized_notification();
        let _ = self.send(&notification, self.session().as_ref());
        true
    }

    /// Posts one message and passes every answer on. A request always gets
    /// an answer.
    fn post(&self, message: &Value, output: &Output) {
        let session = self.session();
        let result = match self.send(message, session.as_ref()) {
            Err(PostError::SessionExpired) => {
                if self.renew(session.as_ref(), output) {
                    self.send(message, self.session().as_ref())
                } else {
                    Err(PostError::Failed(
                        "the editor ended the session and a new one could not be started"
                            .to_owned(),
                    ))
                }
            }
            other => other,
        };
        match result {
            Ok(mut response) => {
                let answers = read_response(&mut response, message.get("id"));
                for answer in &answers {
                    output.send(answer);
                }
                if request_id(message).is_some() && !answered(&answers, message.get("id")) {
                    answer_error(
                        output,
                        message,
                        "the editor closed the answer stream before it answered; send the \
                         request again",
                    );
                }
            }
            Err(error) => answer_error(output, message, &error_text(&error)),
        }
    }

    fn send(
        &self,
        message: &Value,
        session: Option<&Session>,
    ) -> Result<ureq::http::Response<ureq::Body>, PostError> {
        let mut request = agent(REQUEST_TIMEOUT)
            .post(&self.inner.endpoint)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream");
        if let Some(session) = session {
            request = request
                .header("Mcp-Session-Id", &session.id)
                .header("MCP-Protocol-Version", &session.protocol);
        }
        if let Some(token) = &self.inner.token {
            request = request.header("Authorization", format!("Bearer {token}"));
        }
        let mut response = request.send(message.to_string()).map_err(|error| {
            PostError::Failed(format!(
                "the editor at {} did not answer: {error}",
                self.inner.base
            ))
        })?;
        let status = response.status().as_u16();
        if (200..300).contains(&status) {
            return Ok(response);
        }
        if status == 404 && session.is_some() {
            return Err(PostError::SessionExpired);
        }
        let body = response
            .body_mut()
            .read_to_string()
            .unwrap_or_default()
            .chars()
            .take(300)
            .collect::<String>();
        Err(PostError::Failed(format!(
            "the editor at {} refused the request ({status}): {}",
            self.inner.base,
            body.trim()
        )))
    }

    /// Tells the editor the session is over. Quick, and failure is fine: the
    /// editor ends an idle session by itself.
    fn end_session(&self) {
        let Some(session) = self.session() else {
            return;
        };
        let mut request = agent(QUICK_TIMEOUT)
            .delete(&self.inner.endpoint)
            .header("Mcp-Session-Id", &session.id)
            .header("MCP-Protocol-Version", &session.protocol);
        if let Some(token) = &self.inner.token {
            request = request.header("Authorization", format!("Bearer {token}"));
        }
        let _ = request.call();
    }
}

fn error_text(error: &PostError) -> String {
    match error {
        PostError::SessionExpired => "the editor ended the session".to_owned(),
        PostError::Failed(message) => message.clone(),
    }
}

/// The messages in a response: one JSON body, or an event stream read until
/// the answer to `id` arrives.
fn read_response(
    response: &mut ureq::http::Response<ureq::Body>,
    id: Option<&Value>,
) -> Vec<Value> {
    if response.status().as_u16() == 202 {
        return Vec::new();
    }
    let is_stream = response
        .headers()
        .get("content-type")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("text/event-stream"));
    read_answers(
        BufReader::new(response.body_mut().as_reader()),
        is_stream,
        id,
    )
}

fn read_answers(reader: impl BufRead, is_stream: bool, id: Option<&Value>) -> Vec<Value> {
    if !is_stream {
        return match serde_json::from_reader::<_, Value>(reader) {
            Ok(Value::Array(messages)) => messages,
            Ok(message) => vec![message],
            Err(_) => Vec::new(),
        };
    }
    let mut answers = Vec::new();
    for line in reader.lines() {
        let Ok(line) = line else { break };
        let Some(data) = line.strip_prefix("data:") else {
            continue;
        };
        let Ok(message) = serde_json::from_str::<Value>(data.trim()) else {
            continue;
        };
        let done = id.is_some() && response_id(&message) == id;
        answers.push(message);
        if done {
            break;
        }
    }
    answers
}

/// Whether the answers contain the answer to `id`.
fn answered(answers: &[Value], id: Option<&Value>) -> bool {
    let Some(id) = id else {
        return true;
    };
    answers.iter().any(|answer| response_id(answer) == Some(id))
}

/// Answers a request that could not be delivered. A notification has no
/// answer to give.
fn answer_error(output: &Output, message: &Value, reason: &str) {
    eprintln!("assemblash mcp: {reason}");
    if let Some(id) = request_id(message) {
        output.send(&error_for(id, reason));
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn a_stream_that_ends_before_the_answer_is_not_an_answer() {
        let id = json!(7);
        let stream = "data: {\"jsonrpc\":\"2.0\",\"method\":\"notifications/progress\"}\n\n";
        let answers = read_answers(stream.as_bytes(), true, Some(&id));
        assert_eq!(answers.len(), 1);
        assert!(!answered(&answers, Some(&id)));

        let complete = format!(
            "{stream}data: {{\"jsonrpc\":\"2.0\",\"id\":7,\"result\":{{}}}}\n\ndata: ignored\n"
        );
        let answers = read_answers(complete.as_bytes(), true, Some(&id));
        assert!(answered(&answers, Some(&id)));
    }

    #[test]
    fn a_json_body_is_read_whole() {
        let id = json!("a");
        let body = r#"{"jsonrpc":"2.0","id":"a","result":{"ok":true}}"#;
        let answers = read_answers(body.as_bytes(), false, Some(&id));
        assert!(answered(&answers, Some(&id)));
        // A notification needs no answer.
        assert!(answered(&[], None));
    }

    #[test]
    fn unanswered_local_requests_are_answered_with_an_error_once() {
        let output = Output::new();
        output.expect_answer(&json!(1));
        output.expect_answer(&json!(2));
        // The server answered request 1.
        if let Ok(mut pending) = output.pending.lock() {
            pending.remove(&json!(1).to_string());
        }
        let left: Vec<String> = output.pending.lock().unwrap().keys().cloned().collect();
        assert_eq!(left, [json!(2).to_string()]);
        output.fail_pending("gone");
        assert!(output.pending.lock().unwrap().is_empty());
    }

    #[test]
    fn the_token_is_not_in_debug_output() {
        let remote = Remote::new(
            "http://127.0.0.1:1".to_owned(),
            1,
            Some("relay-secret".to_owned()),
        );
        let printed = format!("{remote:?}");
        assert!(!printed.contains("relay-secret"), "{printed}");
    }

    #[test]
    fn two_spellings_of_one_directory_are_the_same_workspace() {
        let scratch = tempfile::tempdir().unwrap();
        let dir = scratch.path().to_path_buf();
        std::fs::create_dir_all(dir.join("sub")).unwrap();
        let dotted = dir.join(".").join("sub").join("..");
        assert!(same_directory(&dir, &dotted));
        assert!(!same_directory(&dir, &dir.join("sub")));
        assert!(!same_directory(&dir, &dir.join("missing")));
    }
}
