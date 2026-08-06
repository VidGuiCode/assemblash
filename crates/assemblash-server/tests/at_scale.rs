//! The v0.16.0 exit test: two hundred projects, over a real socket.
//!
//! Three claims, each answered by running it:
//!
//! * a workspace of two hundred projects lists, searches, and shows
//!   thumbnails;
//! * **deleting `index.db` changes nothing** — it rebuilds and gives the same
//!   answers, which is what makes it a cache rather than a second copy of the
//!   truth;
//! * a project that is not in the cache is still found, because every route
//!   falls back to scanning.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::ids::SequentialIdSource;
use assemblash_core::workspace::{ProjectId, Workspace, FONTS_DIR};
use assemblash_core::{Color, Document};
use assemblash_server::Server;
use serde_json::Value;

/// How many projects "at scale" means here.
const PROJECTS: usize = 200;

/// A blocking HTTP/1.1 client. Hand-rolled for the same reason as everywhere
/// else here: a test-only HTTP client is a dependency this product would have
/// to carry and licence-audit.
mod http {
    #![allow(unreachable_pub)]

    use std::io::{Read as _, Write as _};
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

    pub fn get(url: &str) -> Response {
        let rest = url.strip_prefix("http://").expect("an http url");
        let (authority, path) = match rest.find('/') {
            Some(index) => (&rest[..index], &rest[index..]),
            None => (rest, "/"),
        };
        let mut stream = TcpStream::connect(authority).expect("connect");
        let head = format!(
            "GET {path} HTTP/1.1\r\nHost: {authority}\r\nConnection: close\r\n\
             Content-Length: 0\r\n\r\n"
        );
        stream.write_all(head.as_bytes()).expect("write");
        stream.flush().expect("flush");

        let mut raw = Vec::new();
        stream.read_to_end(&mut raw).expect("read");
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
            .expect("a status line");
        let mut body = raw[split + 4..].to_vec();
        if headers
            .to_ascii_lowercase()
            .contains("transfer-encoding: chunked")
        {
            body = dechunk(&body);
        }
        Response { status, body }
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
}

/// Writes `PROJECTS` projects straight onto disk.
///
/// Written rather than created over the API: the point is a workspace that is
/// already large when the server starts, which is the situation a person with
/// a year of work is in.
fn big_workspace(root: &Path) -> Workspace {
    let workspace = Workspace::open_or_create(root).unwrap();
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf");
    let mut store = assemblash_renderer::store::FontStore::open(root.join(FONTS_DIR)).unwrap();
    store
        .import_file(&fixture, None, Some("OFL-1.1".into()))
        .unwrap();

    for index in 0..PROJECTS {
        // Names in three families, so a search has something to be wrong
        // about: "poster" must not match "flyer".
        let (kind, id) = match index % 3 {
            0 => ("Poster", format!("poster-{index:03}")),
            1 => ("Flyer", format!("flyer-{index:03}")),
            _ => ("Banner", format!("banner-{index:03}")),
        };
        let project_id = ProjectId::new(id).unwrap();
        let directory = workspace.create_project_dir(&project_id).unwrap();
        let mut document = Document::new(&mut SequentialIdSource::new(), 200.0, 100.0);
        document.name = Some(format!("{kind} {index}"));
        document.canvas.background = Some(Color::new("#ffffff"));
        drop(assemblash_core::Session::create(&directory, document, None).unwrap());
    }
    workspace
}

/// Starts a server over an existing workspace root.
fn serve(root: &Path) -> String {
    let workspace = Workspace::open_or_create(root).unwrap();
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
            send.send(server.url()).unwrap();
            let _ = server.serve().await;
        });
    });
    receive.recv().expect("the server started")
}

fn ids(list: &Value) -> Vec<String> {
    list["projects"]
        .as_array()
        .unwrap()
        .iter()
        .map(|project| project["id"].as_str().unwrap().to_owned())
        .collect()
}

#[test]
fn two_hundred_projects_list_search_and_show_thumbnails() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    big_workspace(&root);

    let base = serve(&root);
    let url = |path: &str| format!("{base}{path}");

    // Listing.
    let listed = http::get(&url("/api/projects")).json();
    assert_eq!(ids(&listed).len(), PROJECTS, "every project is listed");

    // Searching, in the engine rather than in the client.
    let posters = http::get(&url("/api/projects?query=poster")).json();
    let poster_ids = ids(&posters);
    assert!(!poster_ids.is_empty());
    assert!(
        poster_ids.iter().all(|id| id.starts_with("poster-")),
        "a search for posters returned {poster_ids:?}"
    );
    // By name as well as by id, and case-insensitively.
    let by_name = ids(&http::get(&url("/api/projects?query=BANNER")).json());
    assert!(by_name.iter().all(|id| id.starts_with("banner-")));
    assert_eq!(
        ids(&http::get(&url("/api/projects?query=nothing")).json()).len(),
        0
    );

    // Recents: answerable only because the cache holds modification times.
    let recents = ids(&http::get(&url("/api/projects/recent?limit=5")).json());
    assert_eq!(recents.len(), 5);

    // A thumbnail, and the same one again from the cache.
    let first = &poster_ids[0];
    let thumbnail = http::get(&url(&format!("/api/projects/{first}/thumbnail.png")));
    assert_eq!(
        thumbnail.status,
        200,
        "{}",
        String::from_utf8_lossy(&thumbnail.body)
    );
    assert_eq!(&thumbnail.body[1..4], b"PNG");
    let again = http::get(&url(&format!("/api/projects/{first}/thumbnail.png")));
    assert_eq!(again.body, thumbnail.body, "the cached thumbnail differs");
    // Small: a browser showing two hundred of these moves kilobytes, not
    // megabytes.
    assert!(
        thumbnail.body.len() < 100_000,
        "a thumbnail was {} bytes",
        thumbnail.body.len()
    );
}

#[test]
fn deleting_the_index_changes_nothing() {
    // The rule the whole design rests on. If this ever fails, the cache has
    // become a second copy of the truth and has to be taken back out.
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    big_workspace(&root);

    let base = serve(&root);
    let before_list = ids(&http::get(&format!("{base}/api/projects")).json());
    let before_search = ids(&http::get(&format!("{base}/api/projects?query=flyer")).json());
    let before_thumb = http::get(&format!(
        "{base}/api/projects/{}/thumbnail.png",
        before_search[0]
    ))
    .body;

    // The server holds the file open, so this is the honest version of the
    // test: delete it out from under a running server.
    let index = root.join(assemblash_core::index::INDEX_FILE);
    assert!(index.is_file(), "the cache should exist by now");
    let removed = std::fs::remove_file(&index).is_ok();

    // Whether or not the platform allowed the delete while it was open, the
    // answers must not change. On Windows an open file cannot be unlinked,
    // which is itself fine: the cache is still just a cache.
    let after_list = ids(&http::get(&format!("{base}/api/projects")).json());
    let after_search = ids(&http::get(&format!("{base}/api/projects?query=flyer")).json());
    let after_thumb = http::get(&format!(
        "{base}/api/projects/{}/thumbnail.png",
        before_search[0]
    ))
    .body;

    assert_eq!(after_list, before_list, "removed: {removed}");
    assert_eq!(after_search, before_search);
    assert_eq!(after_thumb, before_thumb);

    // And a server started fresh on the same workspace — with the cache gone,
    // or rebuilt — answers the same way.
    let _ = std::fs::remove_file(&index);
    let restarted = serve(&root);
    assert_eq!(
        ids(&http::get(&format!("{restarted}/api/projects")).json()),
        before_list,
        "a rebuilt cache answered differently"
    );
    assert_eq!(
        ids(&http::get(&format!("{restarted}/api/projects?query=flyer")).json()),
        before_search
    );
}

#[test]
fn a_project_created_after_the_cache_was_built_is_still_found() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let workspace = big_workspace(&root);

    let base = serve(&root);
    assert_eq!(
        ids(&http::get(&format!("{base}/api/projects")).json()).len(),
        PROJECTS
    );

    // Written directly to disk, behind the server's back — the case a cache
    // gets wrong if it is trusted rather than refreshed.
    let late = ProjectId::new("zzz-latecomer").unwrap();
    let directory = workspace.create_project_dir(&late).unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 50.0, 50.0);
    document.name = Some("Latecomer".to_owned());
    drop(assemblash_core::Session::create(&directory, document, None).unwrap());

    let found = ids(&http::get(&format!("{base}/api/projects?query=latecomer")).json());
    assert_eq!(found, vec!["zzz-latecomer".to_owned()]);
}
