//! Stale-lock reclaim (rung 1.5.0, decision D23 (d)).
//!
//! Two claims are under test and they pull in opposite directions:
//!
//! 1. a lock left by a process that crashed **on this machine** is cleared
//!    automatically, so a crash does not need a human;
//! 2. every other lock is left exactly where it is — a live owner, another
//!    machine, a lock from a build that recorded no machine, an unreadable
//!    file.
//!
//! The second claim is the important one. Removing a lock that is still in use
//! puts two processes into one project directory, and the write ordering in
//! `session.rs` protects against a crash, not against a competitor.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::Path;
use std::process::{Child, Command, Stdio};

use assemblash_core::ids::SequentialIdSource;
use assemblash_core::liveness::{process_is_alive, this_host, Liveness};
use assemblash_core::session::{reclaim_if_stale, HeldReason, Reclaim, SessionError, LOCK_FILE};
use assemblash_core::{Document, Session};

/// A process id no live process can have.
///
/// On Windows a pid is always a multiple of four (the kernel allocates them
/// from the same table as handles, which are 4-byte aligned), so a value
/// congruent to 2 mod 4 can never name a process. On Linux this is far above
/// `/proc/sys/kernel/pid_max`, whose ceiling is 2^22 by default and 2^30 at
/// most on 64-bit. Keeping it inside `i32` matters: the Unix probe refuses a
/// pid that does not fit `pid_t` with `Unknown` rather than `Dead`, so
/// `u32::MAX - 1` would test the wrong branch.
const IMPOSSIBLE_PID: u32 = 0x7FFF_FFFE;

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

fn host() -> String {
    this_host().expect("this machine must be able to name itself for these tests")
}

fn write_lock(project_dir: &Path, json: &str) {
    std::fs::write(project_dir.join(LOCK_FILE), json).expect("writing a lock file");
}

fn lock_exists(project_dir: &Path) -> bool {
    project_dir.join(LOCK_FILE).exists()
}

/// A project directory with a real document and history, and no lock held.
fn project(dir: &Path) {
    let document = Document::new(&mut SequentialIdSource::new(), 1080.0, 1080.0);
    let session = Session::create(dir, document, Some(1)).expect("creating the project");
    // Dropping releases the lock, leaving the directory the way a clean exit
    // does — which is the state every test below then perturbs by hand.
    drop(session);
    assert!(!lock_exists(dir), "a dropped session leaves no lock");
}

// ---------------------------------------------------------------- the probe

#[test]
fn a_running_child_is_alive_and_a_killed_one_is_dead() {
    let mut child = long_lived_child();
    let pid = child.id();
    assert_eq!(
        process_is_alive(pid),
        Liveness::Alive,
        "a child that has not been killed is running"
    );

    child.kill().expect("killing the child");
    child.wait().expect("reaping the child");
    assert_eq!(
        process_is_alive(pid),
        Liveness::Dead,
        "a killed and reaped child is gone"
    );
}

#[test]
fn a_pid_that_cannot_exist_is_dead() {
    assert_eq!(process_is_alive(IMPOSSIBLE_PID), Liveness::Dead);
}

#[test]
fn pid_zero_is_never_decided() {
    assert_eq!(
        process_is_alive(0),
        Liveness::Unknown,
        "0 is what a corrupt lock parses to; it must never look reclaimable"
    );
}

#[test]
fn our_own_process_is_alive() {
    assert_eq!(process_is_alive(std::process::id()), Liveness::Alive);
}

// ------------------------------------------------- the lock that is written

#[test]
fn a_real_lock_records_this_machine_and_this_process() {
    let dir = tempfile::tempdir().expect("temp dir");
    let path = dir.path().join("project");
    let document = Document::new(&mut SequentialIdSource::new(), 1080.0, 1080.0);
    let session = Session::create(&path, document, Some(1)).expect("creating the project");

    // Read the file the real `acquire` wrote, not a hand-built one: the whole
    // reclaim decision rests on this field actually being there.
    let written = std::fs::read_to_string(path.join(LOCK_FILE)).expect("reading the lock");
    let lock: serde_json::Value = serde_json::from_str(&written).expect("the lock is JSON");
    assert_eq!(lock["pid"].as_u64(), Some(u64::from(std::process::id())));
    assert_eq!(lock["host"].as_str(), Some(host().as_str()));

    // And the live lock the session is holding reads back as held-because-alive
    // through the same path a crashed predecessor's would.
    assert_eq!(
        reclaim_if_stale(&path).expect("probing our own lock"),
        Reclaim::Held {
            pid: std::process::id(),
            host: Some(host()),
            reason: HeldReason::Alive,
        }
    );

    drop(session);
}

// -------------------------------------------------------- reclaim_if_stale

#[test]
fn a_dead_owner_on_this_machine_is_reclaimed() {
    let dir = tempfile::tempdir().expect("temp dir");
    let pid = dead_pid();
    write_lock(
        dir.path(),
        &format!(r#"{{"pid":{pid},"since":1,"host":"{}"}}"#, host()),
    );

    let outcome = reclaim_if_stale(dir.path()).expect("probing the lock");
    assert_eq!(outcome, Reclaim::Reclaimed { pid, host: host() });
    assert!(!lock_exists(dir.path()), "the stale lock file is gone");
}

#[test]
fn a_live_owner_on_this_machine_is_held() {
    let dir = tempfile::tempdir().expect("temp dir");
    let pid = std::process::id();
    write_lock(
        dir.path(),
        &format!(r#"{{"pid":{pid},"since":1,"host":"{}"}}"#, host()),
    );

    let outcome = reclaim_if_stale(dir.path()).expect("probing the lock");
    assert_eq!(
        outcome,
        Reclaim::Held {
            pid,
            host: Some(host()),
            reason: HeldReason::Alive,
        }
    );
    assert!(lock_exists(dir.path()), "a live owner keeps its lock");
}

#[test]
fn a_lock_from_another_machine_is_held_even_when_its_pid_is_dead() {
    let dir = tempfile::tempdir().expect("temp dir");
    let pid = dead_pid();
    write_lock(
        dir.path(),
        &format!(r#"{{"pid":{pid},"since":1,"host":"some-other-machine"}}"#),
    );

    let outcome = reclaim_if_stale(dir.path()).expect("probing the lock");
    assert_eq!(
        outcome,
        Reclaim::Held {
            pid,
            host: Some("some-other-machine".to_owned()),
            reason: HeldReason::ForeignHost,
        }
    );
    assert!(
        lock_exists(dir.path()),
        "a pid from another host says nothing here, so the file stays"
    );
}

#[test]
fn a_lock_without_a_host_is_held_even_when_its_pid_is_dead() {
    let dir = tempfile::tempdir().expect("temp dir");
    let pid = dead_pid();
    write_lock(dir.path(), &format!(r#"{{"pid":{pid},"since":1}}"#));

    let outcome = reclaim_if_stale(dir.path()).expect("probing the lock");
    assert_eq!(
        outcome,
        Reclaim::Held {
            pid,
            host: None,
            reason: HeldReason::NoHost,
        }
    );
    assert!(
        lock_exists(dir.path()),
        "a lock from a build before 1.5.0 is never reclaimed automatically"
    );
}

#[test]
fn an_unreadable_lock_is_held() {
    let dir = tempfile::tempdir().expect("temp dir");
    write_lock(dir.path(), "this is not json");

    let outcome = reclaim_if_stale(dir.path()).expect("probing the lock");
    assert_eq!(
        outcome,
        Reclaim::Held {
            pid: 0,
            host: None,
            reason: HeldReason::NoHost,
        }
    );
    assert!(
        lock_exists(dir.path()),
        "a corrupt lock is a human's problem"
    );
}

#[test]
fn no_lock_at_all_is_not_locked() {
    let dir = tempfile::tempdir().expect("temp dir");
    assert_eq!(
        reclaim_if_stale(dir.path()).expect("probing an unlocked directory"),
        Reclaim::NotLocked
    );
}

// -------------------------------------------------------------- the opener

#[test]
fn open_reclaiming_opens_a_project_whose_owner_crashed() {
    let dir = tempfile::tempdir().expect("temp dir");
    let path = dir.path().join("project");
    project(&path);

    let pid = dead_pid();
    write_lock(
        &path,
        &format!(r#"{{"pid":{pid},"since":1,"host":"{}"}}"#, host()),
    );

    let (session, outcome) = Session::open_reclaiming(&path, Some(2)).expect("opening the project");
    assert_eq!(outcome, Reclaim::Reclaimed { pid, host: host() });
    assert_eq!(session.version(), 0);
    assert!(
        lock_exists(&path),
        "the session that reclaimed the lock now holds one of its own"
    );

    drop(session);
    assert!(!lock_exists(&path), "and releases it on drop");
}

#[test]
fn open_reclaiming_still_refuses_a_lock_it_may_not_take() {
    let dir = tempfile::tempdir().expect("temp dir");
    let path = dir.path().join("project");
    project(&path);

    let pid = dead_pid();
    write_lock(
        &path,
        &format!(r#"{{"pid":{pid},"since":1,"host":"some-other-machine"}}"#),
    );

    match Session::open_reclaiming(&path, Some(2)) {
        Err(SessionError::Locked { pid: locked, .. }) => assert_eq!(locked, pid),
        other => panic!("expected the usual Locked error, got {other:?}"),
    }
    assert!(lock_exists(&path), "and the foreign lock is untouched");
}

#[test]
fn open_reclaiming_reports_an_unlocked_project_as_not_locked() {
    let dir = tempfile::tempdir().expect("temp dir");
    let path = dir.path().join("project");
    project(&path);

    let (session, outcome) = Session::open_reclaiming(&path, Some(2)).expect("opening the project");
    assert_eq!(outcome, Reclaim::NotLocked);
    drop(session);
}
