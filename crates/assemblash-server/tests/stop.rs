//! Stopping a server from outside a request.
//!
//! `POST /api/shutdown` is how the page stops a friendly server. A person at
//! a terminal presses Ctrl-C instead, and the command line needs the same
//! graceful stop for that: in-flight requests finish, and every open project
//! is released rather than left locked. This covers the handle that does it.
//! The signal itself belongs to the command line and is not simulated here.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::time::Duration;

use assemblash_core::workspace::Workspace;
use assemblash_server::Server;

#[test]
fn the_stop_handle_ends_serving_and_releases_the_projects() {
    let directory = tempfile::tempdir().unwrap();
    let root = directory.path().join("workspace");
    let workspace = Workspace::open_or_create(&root).unwrap();
    let id = assemblash_core::workspace::ProjectId::new("held").unwrap();
    let project = workspace.create_project_dir(&id).unwrap();
    let document = assemblash_core::Document::new(
        &mut assemblash_core::ids::SequentialIdSource::new(),
        100.0,
        100.0,
    );
    drop(assemblash_core::Session::create(&project, document, Some(1)).unwrap());
    let lock = project.join(assemblash_core::session::LOCK_FILE);
    assert!(!lock.exists());

    let (ready, started) = std::sync::mpsc::channel();
    let (ended, stopped) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        runtime.block_on(async move {
            let server = Server::bind(workspace, 0, Default::default())
                .await
                .unwrap();
            // The server holds the project open, as it does for any request.
            let opened = server
                .state()
                .project(
                    &assemblash_core::workspace::ProjectId::new("held").unwrap(),
                    None,
                )
                .unwrap();
            drop(opened);
            ready.send(server.stop_handle()).unwrap();
            let _ = server.serve().await;
            // Dropping the state is what releases the lock; the server owns
            // it until `serve` returns.
            ended.send(()).unwrap();
        });
    });

    let stop = started.recv().unwrap();
    assert!(
        lock.exists(),
        "the server holds the project while it serves"
    );
    assert!(stop.send(true).is_ok());
    stopped
        .recv_timeout(Duration::from_secs(20))
        .expect("the stop handle ends serving");
    // The runtime drops the state when the task ends; give the drop a moment.
    let deadline = std::time::Instant::now() + Duration::from_secs(10);
    while lock.exists() {
        assert!(
            std::time::Instant::now() < deadline,
            "the project stayed locked after the server stopped"
        );
        std::thread::sleep(Duration::from_millis(20));
    }
}
