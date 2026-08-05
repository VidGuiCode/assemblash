//! Serving the reference interface.
//!
//! The files are compiled into the binary. One static binary with no runtime
//! dependencies is the deployment story, and a UI that had to be installed
//! next to the executable would quietly break it — so `ui/dist` is committed
//! and embedded, and CI checks that what is committed is what the build
//! produces.
//!
//! `--ui-dir` serves from disk instead, for working on the interface without
//! rebuilding the binary. It is a development convenience and nothing more:
//! the path comes from the command line, never from a request.

use std::path::{Path, PathBuf};

use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};

/// One file of the interface.
struct Asset {
    /// Path as a browser asks for it, without a leading slash.
    name: &'static str,
    /// What to send as `Content-Type`.
    content_type: &'static str,
    /// The bytes.
    body: &'static [u8],
}

/// Everything the interface is made of.
///
/// Listed explicitly rather than walked at build time: a file that is not on
/// this list is not served, so nothing can be added to the directory and
/// shipped by accident.
const ASSETS: &[Asset] = &[
    Asset {
        name: "index.html",
        content_type: "text/html; charset=utf-8",
        body: include_bytes!("../../../ui/dist/index.html"),
    },
    Asset {
        name: "style.css",
        content_type: "text/css; charset=utf-8",
        body: include_bytes!("../../../ui/dist/style.css"),
    },
    Asset {
        name: "app.js",
        content_type: "text/javascript; charset=utf-8",
        body: include_bytes!("../../../ui/dist/app.js"),
    },
    Asset {
        name: "api.js",
        content_type: "text/javascript; charset=utf-8",
        body: include_bytes!("../../../ui/dist/api.js"),
    },
];

/// Where the interface is served from.
#[derive(Debug, Clone, Default)]
pub enum UiSource {
    /// The files compiled into this binary.
    #[default]
    Embedded,
    /// A directory on disk, for developing the interface.
    Directory(PathBuf),
}

impl UiSource {
    /// Serves one path, or reports that there is nothing there.
    pub fn serve(&self, path: &str) -> Response {
        // "" and "/" both mean the entry point.
        let name = match path.trim_start_matches('/') {
            "" => "index.html",
            other => other,
        };

        match self {
            Self::Embedded => match ASSETS.iter().find(|asset| asset.name == name) {
                Some(asset) => (
                    [(header::CONTENT_TYPE, asset.content_type)],
                    // The interface changes with the binary, so it must not be
                    // cached across an upgrade.
                    asset.body,
                )
                    .into_response(),
                None => not_found(),
            },
            Self::Directory(directory) => serve_from_disk(directory, name),
        }
    }
}

/// Reads a file from the development directory.
///
/// The name still has to be one of the assets this build knows about. A
/// development flag is not a reason to let a request name a path.
fn serve_from_disk(directory: &Path, name: &str) -> Response {
    let Some(asset) = ASSETS.iter().find(|asset| asset.name == name) else {
        return not_found();
    };
    match std::fs::read(directory.join(asset.name)) {
        Ok(bytes) => ([(header::CONTENT_TYPE, asset.content_type)], bytes).into_response(),
        Err(_) => not_found(),
    }
}

fn not_found() -> Response {
    (
        StatusCode::NOT_FOUND,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        "not found",
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_interface_is_complete() {
        // Every file is reachable from the entry point, directly or through a
        // module another one imports. A file nobody asks for is dead weight in
        // the binary; a file that is asked for and missing is a blank page at
        // runtime and nothing at all at build time.
        let everything: String = ASSETS
            .iter()
            .map(|asset| String::from_utf8_lossy(asset.body).into_owned())
            .collect::<Vec<_>>()
            .join(
                "
",
            );
        for asset in ASSETS.iter().filter(|asset| asset.name != "index.html") {
            assert!(
                everything.contains(asset.name),
                "{} is embedded but nothing references it",
                asset.name
            );
        }
        assert!(
            ASSETS.iter().all(|asset| !asset.body.is_empty()),
            "an empty asset means the UI build did not run"
        );
    }

    #[test]
    fn only_the_listed_files_are_served() {
        let ui = UiSource::Embedded;
        assert_eq!(ui.serve("/").status(), StatusCode::OK);
        assert_eq!(ui.serve("/app.js").status(), StatusCode::OK);
        for hostile in [
            "../../etc/passwd",
            "/../Cargo.toml",
            "document.json",
            "index.html/../../secret",
        ] {
            assert_eq!(
                ui.serve(hostile).status(),
                StatusCode::NOT_FOUND,
                "{hostile} should not be served"
            );
        }
    }
}
