//! Stale-lock reclaim over MCP, through the real `assemblash` binary.
//!
//! An agent is the caller with no way to clear a lock itself: there is no tool
//! for it, and there should not be — deciding that a process is really gone is
//! a judgement, and the whole point of `--reclaim-stale-locks` is that the
//! machine only makes it when the evidence is conclusive. So the two claims
//! here are the ones an agent's operator cares about:
//!
//! * with the flag, a project whose owner crashed **on this machine** opens,
//!   and `open_project` says once that it cleared a lock;
//! * without it, the same project is the typed `projectLocked` refusal it has
//!   always been — not a silent success against a project someone else may
//!   still be writing.
//!
//! Both modes the server has are covered, because they open a session through
//! different code: `--workspace` goes through `AppState`, `--project` through
//! the backend's own single-session cache.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

use assemblash_core::ids::SequentialIdSource;
use assemblash_core::session::LOCK_FILE;
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Document, Session};
use rmcp::model::CallToolRequestParams;
use rmcp::service::RunningService;
use rmcp::transport::TokioChildProcess;
use rmcp::{RoleClient, ServiceExt};
use serde_json::{json, Map, Value};

mod support;

use support::binary;

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

/// Writes the lock a crash on this machine leaves behind, and returns its pid.
fn leave_a_stale_lock(project_dir: &Path) -> u32 {
    let pid = dead_pid();
    std::fs::write(
        project_dir.join(LOCK_FILE),
        format!(r#"{{"pid":{pid},"since":1,"host":"{}"}}"#, this_host()),
    )
    .unwrap();
    pid
}

/// A project directory with a real document and history, and no lock held.
fn project(directory: &Path) {
    let document = Document::new(&mut SequentialIdSource::new(), 200.0, 100.0);
    let session = Session::create(directory, document, Some(1)).unwrap();
    // Dropping releases the lock, leaving the directory the way a clean exit
    // does — which is the state each test below then perturbs by hand.
    drop(session);
    assert!(
        !directory.join(LOCK_FILE).exists(),
        "a dropped session leaves no lock"
    );
}

/// A workspace holding one project called `poster`.
fn workspace_with_project(root: &Path) -> PathBuf {
    let workspace = Workspace::open_or_create(root).unwrap();
    let id = ProjectId::new("poster").unwrap();
    let directory = workspace.create_project_dir(&id).unwrap();
    project(&directory);
    directory
}

async fn connect(args: &[&str], path: &Path) -> RunningService<RoleClient, ()> {
    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").args(args).arg(path);
    ().serve(TokioChildProcess::new(command).unwrap())
        .await
        .expect("the server initialized")
}

fn args(value: Value) -> Option<Map<String, Value>> {
    value.as_object().cloned()
}

fn call(name: &'static str, arguments: Option<Map<String, Value>>) -> CallToolRequestParams {
    let mut params = CallToolRequestParams::default();
    params.name = name.into();
    params.arguments = arguments;
    params
}

fn structured(result: &rmcp::model::CallToolResult) -> Value {
    result
        .structured_content
        .clone()
        .unwrap_or_else(|| panic!("no structured content in {result:#?}"))
}

#[tokio::test]
async fn workspace_mode_with_the_flag_opens_a_project_whose_owner_crashed() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let directory = workspace_with_project(&root);
    let pid = leave_a_stale_lock(&directory);

    let client = connect(&["--reclaim-stale-locks", "--workspace"], &root).await;
    let opened = structured(
        &client
            .call_tool(call("open_project", args(json!({ "project": "poster" }))))
            .await
            .expect("the project opens once the dead owner's lock is cleared"),
    );
    assert_eq!(opened["project"], json!("poster"));
    assert_eq!(opened["version"], json!(0));

    let note = opened["note"]
        .as_str()
        .unwrap_or_else(|| panic!("expected a note about the reclaimed lock: {opened:#}"));
    assert!(
        note.contains(&pid.to_string()) && note.contains(&this_host()),
        "the note names the process and the machine: {note}"
    );
    assert_eq!(
        note.lines().count(),
        1,
        "one line, so an agent can pass it on unchanged: {note}"
    );

    // Said once. A second open is an ordinary open.
    let again = structured(
        &client
            .call_tool(call("open_project", args(json!({ "project": "poster" }))))
            .await
            .unwrap(),
    );
    assert_eq!(again.get("note"), None, "{again:#}");

    client.cancel().await.unwrap();
}

#[tokio::test]
async fn single_project_mode_with_the_flag_opens_a_project_whose_owner_crashed() {
    let scratch = tempfile::tempdir().unwrap();
    let directory = scratch.path().join("poster");
    project(&directory);
    let pid = leave_a_stale_lock(&directory);

    let client = connect(&["--reclaim-stale-locks", "--project"], &directory).await;
    let opened = structured(
        &client
            .call_tool(call("open_project", args(json!({ "project": "poster" }))))
            .await
            .expect("the project opens once the dead owner's lock is cleared"),
    );
    let note = opened["note"]
        .as_str()
        .unwrap_or_else(|| panic!("expected a note about the reclaimed lock: {opened:#}"));
    assert!(
        note.contains(&pid.to_string()) && note.contains(&this_host()),
        "the note names the process and the machine: {note}"
    );

    client.cancel().await.unwrap();
}

#[tokio::test]
async fn without_the_flag_a_stale_lock_is_still_the_typed_refusal() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let directory = workspace_with_project(&root);
    let pid = leave_a_stale_lock(&directory);

    let client = connect(&["--workspace"], &root).await;
    let error = client
        .call_tool(call("open_project", args(json!({ "project": "poster" }))))
        .await
        .expect_err("a lock this server was not told to clear is still a conflict");
    let text = format!("{error:?}");
    assert!(
        text.contains("projectLocked"),
        "refused, but not as a typed refusal: {text}"
    );
    assert!(
        text.contains(&pid.to_string()),
        "the refusal names the process holding it, so a person can check: {text}"
    );
    assert!(
        directory.join(LOCK_FILE).exists(),
        "and the lock is exactly where it was"
    );

    // A tool error is not a crash: the server is still answering.
    let listed = structured(&client.call_tool(call("list_projects", None)).await.unwrap());
    assert_eq!(listed["projects"][0]["id"], json!("poster"));

    client.cancel().await.unwrap();
}
