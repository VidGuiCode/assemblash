//! Closing a project while a request still holds it.
//!
//! The server is the single writer for the projects it has open. A close
//! that cannot finish in time must not forget a session that is still alive:
//! the session keeps its lock file, so a forgotten session is a project that
//! this server can neither use nor release. These tests hold a session handle
//! the way a running request does, and check what the registry says about
//! the project during and after the close.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use assemblash_core::session::LOCK_FILE;
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_server::AppState;

struct Fixture {
    _directory: tempfile::TempDir,
    state: AppState,
    id: ProjectId,
    lock: PathBuf,
}

fn fixture() -> Fixture {
    let directory = tempfile::tempdir().unwrap();
    let workspace = Workspace::open_or_create(directory.path().join("workspace")).unwrap();
    let id = ProjectId::new("held").unwrap();
    let project = workspace.create_project_dir(&id).unwrap();
    let document = assemblash_core::Document::new(
        &mut assemblash_core::ids::SequentialIdSource::new(),
        100.0,
        100.0,
    );
    drop(assemblash_core::Session::create(&project, document, Some(1)).unwrap());
    let lock = project.join(LOCK_FILE);
    Fixture {
        _directory: directory,
        state: AppState::new(workspace),
        id,
        lock,
    }
}

#[test]
fn a_close_that_runs_out_of_time_leaves_the_project_open_here() {
    let f = fixture();
    // A running request: it holds its own handle on the session.
    let held = f.state.project(&f.id, None).unwrap();

    let error = f.state.close_project(&f.id).unwrap_err();
    assert_eq!(error.code(), "projectOpen");
    assert!(f.lock.exists(), "the live session still holds its lock");

    // The registry still knows the session: the next request gets the same
    // one, not a refusal that names this server's own process.
    let again = f
        .state
        .project(&f.id, None)
        .expect("the project is still open here");
    assert!(
        Arc::ptr_eq(&held, &again),
        "no second session for one project"
    );
    drop(again);

    // The lock of a live session is never removed through recovery.
    let refused = f
        .state
        .recover_project_lock(&f.id, std::process::id())
        .unwrap_err();
    assert_eq!(refused.code(), "projectLocked");
    assert!(f.lock.exists());

    // When the request ends, a second close works and releases the lock.
    drop(held);
    assert!(f.state.close_project(&f.id).unwrap());
    assert!(!f.lock.exists());
}

#[test]
fn a_request_during_a_close_waits_and_then_reopens_the_project() {
    let f = fixture();
    let held = f.state.project(&f.id, None).unwrap();
    let old = Arc::downgrade(&held);

    let closer = {
        let state = f.state.clone();
        let id = f.id.clone();
        std::thread::spawn(move || state.close_project(&id))
    };
    // Give the close time to start its wait.
    std::thread::sleep(Duration::from_millis(200));

    let opener = {
        let state = f.state.clone();
        let id = f.id.clone();
        std::thread::spawn(move || {
            state
                .project(&id, None)
                .map(|project| Arc::downgrade(&project))
        })
    };
    std::thread::sleep(Duration::from_millis(200));
    assert!(
        !opener.is_finished(),
        "a request for a closing project waits for the close"
    );

    // The running request ends.
    drop(held);
    assert!(
        closer.join().unwrap().expect("the close worked"),
        "the close answers closed"
    );
    let reopened = opener.join().unwrap().expect("the project opens again");
    assert!(old.upgrade().is_none(), "the old session is gone");
    let reopened = reopened
        .upgrade()
        .expect("the registry holds the new session");
    let current = f.state.project(&f.id, None).unwrap();
    assert!(
        Arc::ptr_eq(&reopened, &current),
        "the reopened session is the registered one"
    );
    assert!(f.lock.exists(), "the reopened session holds the lock");
}
