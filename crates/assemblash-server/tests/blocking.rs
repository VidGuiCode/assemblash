//! Page-set routes keep their blocking work off the async runtime.
//!
//! The server runs on a runtime with few threads. A handler that waits on the
//! filesystem, a font load, or a mutex on that thread stops every other
//! connection while it waits. This test makes a page-set export wait, on
//! purpose, for a project that is closing, and checks that the server still
//! answers another request in the meantime. It uses a current-thread runtime,
//! so one blocked handler would block the whole server.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{Read as _, Write as _};
use std::time::{Duration, Instant};

use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_server::AppState;

/// One request over a fresh connection, answered with its status line.
fn request(base: &str, method: &str, path: &str, body: &str) -> String {
    let authority = base.trim_start_matches("http://");
    let mut stream = std::net::TcpStream::connect(authority).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(60)))
        .unwrap();
    write!(
        stream,
        "{method} {path} HTTP/1.1\r\nHost: {authority}\r\nContent-Type: application/json\r\n\
         Content-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    )
    .unwrap();
    let mut answer = Vec::new();
    let _ = stream.read_to_end(&mut answer);
    String::from_utf8_lossy(&answer)
        .lines()
        .next()
        .unwrap_or_default()
        .to_owned()
}

fn project(workspace: &Workspace, id: &str) {
    let directory = workspace
        .create_project_dir(&ProjectId::new(id).unwrap())
        .unwrap();
    let document = assemblash_core::Document::new(
        &mut assemblash_core::ids::SequentialIdSource::new(),
        20.0,
        20.0,
    );
    drop(assemblash_core::Session::create(&directory, document, Some(1)).unwrap());
}

#[test]
fn a_waiting_page_set_export_does_not_stop_other_requests() {
    let directory = tempfile::tempdir().unwrap();
    let root = directory.path().join("workspace");
    let workspace = Workspace::open_or_create(&root).unwrap();
    project(&workspace, "held");
    project(&workspace, "page");
    std::fs::create_dir_all(root.join("page-sets")).unwrap();
    std::fs::write(
        root.join("page-sets").join("deck.json"),
        r#"{"pages":[{"project":"page"}]}"#,
    )
    .unwrap();
    let state = AppState::new(workspace);

    let (send, receive) = std::sync::mpsc::channel();
    let served = state.clone();
    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        runtime.block_on(async move {
            let listener = tokio::net::TcpListener::bind(("127.0.0.1", 0))
                .await
                .unwrap();
            let address = listener.local_addr().unwrap();
            let (stop, _stopping) = tokio::sync::watch::channel(false);
            let router = assemblash_server::api::router(
                served,
                Default::default(),
                Default::default(),
                std::sync::Arc::new(stop),
                Default::default(),
            );
            send.send(format!("http://{address}")).unwrap();
            let _ = axum::serve(listener, router).await;
        });
    });
    let base = receive.recv().unwrap();

    // A running request holds "held", and a close of it starts: the close
    // waits for that request, and requests for "held" wait for the close.
    let id = ProjectId::new("held").unwrap();
    let held = state.project(&id, None).unwrap();
    let closer = {
        let state = state.clone();
        let id = id.clone();
        std::thread::spawn(move || state.close_project(&id))
    };
    std::thread::sleep(Duration::from_millis(200));

    // The export goes into "held", so it waits for the close.
    let exporter = {
        let base = base.clone();
        std::thread::spawn(move || {
            request(
                &base,
                "POST",
                "/api/projects/held/export",
                r#"{"format":"pdf","pages":"deck"}"#,
            )
        })
    };
    std::thread::sleep(Duration::from_millis(300));

    let started = Instant::now();
    let listed = request(&base, "GET", "/api/page-sets", "");
    let took = started.elapsed();
    assert!(listed.contains("200"), "{listed}");
    assert!(
        took < Duration::from_secs(2),
        "another request waited {took:?} for the page-set export"
    );

    drop(held);
    assert!(closer.join().unwrap().unwrap());
    let exported = exporter.join().unwrap();
    assert!(exported.contains("200"), "{exported}");
}
