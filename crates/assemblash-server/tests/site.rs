//! A loopback server with no token refuses web pages that must not use it.
//!
//! Over a real socket, with the `Host` and `Origin` headers written by hand,
//! because those two headers are the whole attack: a DNS-rebinding page sends
//! its own name as `Host`, and a cross-site page sends its own `Origin`.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::io::{Read as _, Write as _};
use std::time::Duration;

use assemblash_core::workspace::Workspace;
use assemblash_server::Server;
use serde_json::Value;

/// Starts a server over a workspace whose configuration the caller shapes.
fn start(
    configure: impl FnOnce(&mut assemblash_core::workspace::Config),
) -> (u16, tempfile::TempDir) {
    let directory = tempfile::tempdir().unwrap();
    let mut workspace = Workspace::open_or_create(directory.path().join("workspace")).unwrap();
    let mut config = workspace.config().clone();
    configure(&mut config);
    workspace.set_config(config).unwrap();

    let (send, receive) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        runtime.block_on(async move {
            let server = Server::bind(workspace, 0, Default::default())
                .await
                .unwrap();
            send.send(server.address().port()).unwrap();
            let _ = server.serve().await;
        });
    });
    (receive.recv().unwrap(), directory)
}

/// One request with exactly these headers; the status and the JSON body.
fn request(
    port: u16,
    method: &str,
    path: &str,
    headers: &[(&str, &str)],
    body: &str,
) -> (u16, Value) {
    let mut stream = std::net::TcpStream::connect(("127.0.0.1", port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .unwrap();
    let mut text = format!("{method} {path} HTTP/1.1\r\n");
    for (name, value) in headers {
        text.push_str(&format!("{name}: {value}\r\n"));
    }
    text.push_str(&format!(
        "Content-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    ));
    stream.write_all(text.as_bytes()).unwrap();

    let response = read_all(stream);
    let (status_line, rest) = response.split_once("\r\n").unwrap_or((&response, ""));
    let status = status_line
        .split_whitespace()
        .nth(1)
        .and_then(|code| code.parse().ok())
        .unwrap_or_else(|| panic!("no status line: {status_line:?}"));
    let body = rest.split("\r\n\r\n").nth(1).unwrap_or_default();
    // A chunked body starts with its length; the JSON is the first `{` on.
    let json = body.find('{').map_or("null", |start| &body[start..]);
    let json = json.rfind('}').map_or(json, |end| &json[..=end]);
    (status, serde_json::from_str(json).unwrap_or(Value::Null))
}

fn code(body: &Value) -> &str {
    body["error"]["code"].as_str().unwrap_or_default()
}

#[test]
fn a_rebinding_host_is_refused_on_every_route() {
    let (port, _workspace) = start(|_| {});
    let loopback = format!("127.0.0.1:{port}");

    let (status, _) = request(port, "GET", "/api/version", &[("Host", &loopback)], "");
    assert_eq!(status, 200);
    let (status, _) = request(
        port,
        "GET",
        "/",
        &[("Host", &format!("localhost:{port}"))],
        "",
    );
    assert_eq!(status, 200);

    for path in ["/api/version", "/api/projects", "/", "/app.js"] {
        let (status, body) = request(
            port,
            "GET",
            path,
            &[("Host", &format!("attacker.example:{port}"))],
            "",
        );
        assert_eq!(status, 403, "{path}");
        assert_eq!(code(&body), "hostNotAllowed", "{path}");
    }
}

#[test]
fn a_cross_site_write_is_refused_and_changes_nothing() {
    let (port, workspace) = start(|_| {});
    let loopback = format!("127.0.0.1:{port}");
    let project = r#"{"id":"forged","width":10,"height":10}"#;

    let (status, body) = request(
        port,
        "POST",
        "/api/projects",
        &[("Host", &loopback), ("Origin", "https://attacker.example")],
        project,
    );
    assert_eq!(status, 403);
    assert_eq!(code(&body), "originNotAllowed");
    assert!(!workspace.path().join("workspace/projects/forged").exists());

    // The editor's own page, from the same address, may write.
    let (status, _) = request(
        port,
        "POST",
        "/api/projects",
        &[
            ("Host", &loopback),
            ("Origin", &format!("http://{loopback}")),
        ],
        project,
    );
    assert_eq!(status, 201);
}

#[test]
fn a_reverse_proxy_name_in_allowed_hosts_is_accepted() {
    let (port, _workspace) = start(|config| {
        config.allowed_hosts = vec!["assemblash.example.com".to_owned()];
    });
    // nginx: `proxy_set_header Host $host`, a browser on the public name.
    let (status, _) = request(
        port,
        "GET",
        "/api/projects",
        &[
            ("Host", "assemblash.example.com"),
            ("Origin", "https://assemblash.example.com"),
        ],
        "",
    );
    assert_eq!(status, 200);
    let (status, _) = request(
        port,
        "GET",
        "/api/projects",
        &[("Host", "other.example.com")],
        "",
    );
    assert_eq!(status, 403);
}

#[test]
fn with_a_token_the_token_is_the_protection() {
    let token = "site-test-token-long-enough-to-be-real";
    let (port, _workspace) = start(|config| config.token = Some(token.to_owned()));
    let bearer = format!("Bearer {token}");
    let (status, _) = request(
        port,
        "GET",
        "/api/projects",
        &[
            ("Host", "assemblash.example.com"),
            ("Authorization", &bearer),
        ],
        "",
    );
    assert_eq!(status, 200);
    // And without the token, the request is refused whatever its Host.
    let (status, _) = request(
        port,
        "GET",
        "/api/projects",
        &[("Host", &format!("127.0.0.1:{port}"))],
        "",
    );
    assert_eq!(status, 401);
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
