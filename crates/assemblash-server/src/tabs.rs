//! The open project tabs of the reference interface.
//!
//! The workspace remembers the open tabs and their order, and the next start
//! opens them again.
//!
//! The interface keeps one tab for each open project. The list of open tabs
//! and its order is interface state, not document state: it lives in one
//! small file in the workspace root, so it survives a cleared browser and
//! is the same for every browser that opens this workspace.
//!
//! - `GET /api/open-tabs` answers the list, or an empty list when there is
//!   no file or the file cannot be read.
//! - `PUT /api/open-tabs` replaces the list.
//!
//! Nothing here touches a document, an operation, or the journal.

use std::path::Path;

use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};

use assemblash_core::workspace::ProjectId;

use crate::error::{ApiError, ApiJson};
use crate::state::AppState;

/// The file in the workspace root that holds the list.
pub const OPEN_TABS_FILE: &str = "open-tabs.json";

/// The most tabs the list keeps. The interface refuses more.
pub const MAX_OPEN_TABS: usize = 64;

/// The open tabs, in strip order, and the visible one.
///
/// This is the body of the routes. A request with a key this build does not
/// know is refused.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OpenTabs {
    pub projects: Vec<String>,
    #[serde(default)]
    pub active: Option<String>,
}

/// The file contents: the list, and every key this build does not know.
///
/// A later build can add keys to the file. This build reads past them and
/// writes them back unchanged, so a write from this build does not remove
/// them.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OpenTabsFile {
    #[serde(default)]
    projects: Vec<String>,
    #[serde(default)]
    active: Option<String>,
    #[serde(flatten)]
    extra: serde_json::Map<String, serde_json::Value>,
}

/// Held for each read-modify-write of the file in this process.
///
/// A write reads the unknown keys of the file and writes them back. Two
/// writes at the same time must not both read the old file.
static WRITES: std::sync::Mutex<()> = std::sync::Mutex::new(());

/// Gives each temporary file of this process its own name.
static TEMPORARY: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

impl OpenTabs {
    /// Keeps only distinct, valid project ids, at most [`MAX_OPEN_TABS`],
    /// and an active id that is one of them.
    fn normalized(self) -> Self {
        let mut projects: Vec<String> = Vec::new();
        for id in self.projects {
            if projects.len() == MAX_OPEN_TABS {
                break;
            }
            if ProjectId::new(id.clone()).is_ok() && !projects.contains(&id) {
                projects.push(id);
            }
        }
        let active = self.active.filter(|id| projects.contains(id));
        Self { projects, active }
    }
}

/// Reads the list. A missing or unreadable file is an empty list: losing the
/// tabs is never a reason to refuse to start the interface.
pub fn read_open_tabs(root: &Path) -> OpenTabs {
    let file = read_file(root);
    OpenTabs {
        projects: file.projects,
        active: file.active,
    }
    .normalized()
}

fn read_file(root: &Path) -> OpenTabsFile {
    std::fs::read(root.join(OPEN_TABS_FILE))
        .ok()
        .and_then(|bytes| serde_json::from_slice::<OpenTabsFile>(&bytes).ok())
        .unwrap_or_default()
}

/// Writes the list through a temporary file and a rename, so a reader never
/// sees half a file.
///
/// Each write has its own temporary file, so two writes cannot write into
/// one file. The keys of the file that this build does not know are kept.
pub fn write_open_tabs(root: &Path, tabs: &OpenTabs) -> std::io::Result<()> {
    let _writing = WRITES
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    let file = OpenTabsFile {
        projects: tabs.projects.clone(),
        active: tabs.active.clone(),
        extra: read_file(root).extra,
    };
    let target = root.join(OPEN_TABS_FILE);
    let temporary = root.join(format!(
        "{OPEN_TABS_FILE}.{}-{}.tmp",
        std::process::id(),
        TEMPORARY.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    ));
    let mut bytes = serde_json::to_vec_pretty(&file).map_err(std::io::Error::other)?;
    bytes.push(b'\n');
    let written = std::fs::write(&temporary, bytes).and_then(|()| rename(&temporary, &target));
    if written.is_err() {
        let _ = std::fs::remove_file(&temporary);
    }
    written
}

/// Renames the temporary file over the list, with a short bounded retry.
///
/// On Windows a rename over a file fails with "access denied" while another
/// program has the file open without delete sharing. A virus scanner, a
/// search indexer, or a file sync client opens files like this for a short
/// time. Five tries 20 ms apart wait for such a reader. A rename that still
/// fails is an error. On other platforms the first try is the answer.
fn rename(from: &Path, to: &Path) -> std::io::Result<()> {
    let mut tries = 0;
    loop {
        match std::fs::rename(from, to) {
            Err(error)
                if cfg!(windows)
                    && error.kind() == std::io::ErrorKind::PermissionDenied
                    && tries < 4 =>
            {
                tries += 1;
                std::thread::sleep(std::time::Duration::from_millis(20));
            }
            result => return result,
        }
    }
}

/// `GET /api/open-tabs`.
pub async fn get_open_tabs(State(state): State<AppState>) -> Json<OpenTabs> {
    let root = state.workspace().root().to_path_buf();
    Json(
        tokio::task::spawn_blocking(move || read_open_tabs(&root))
            .await
            .unwrap_or_default(),
    )
}

/// `PUT /api/open-tabs`. Answers the list as it was stored.
pub async fn put_open_tabs(
    State(state): State<AppState>,
    ApiJson(request): ApiJson<OpenTabs>,
) -> Result<Json<OpenTabs>, ApiError> {
    if request.projects.len() > MAX_OPEN_TABS {
        return Err(ApiError::new(
            axum::http::StatusCode::BAD_REQUEST,
            "tooManyTabs",
            format!("at most {MAX_OPEN_TABS} tabs can be open"),
        ));
    }
    let tabs = request.normalized();
    let root = state.workspace().root().to_path_buf();
    // The write waits for other writes and can retry its rename, so it runs
    // on the blocking pool.
    let stored = tabs.clone();
    tokio::task::spawn_blocking(move || {
        write_open_tabs(&root, &stored).map_err(|source| {
            ApiError::from(assemblash_core::storage::StorageError::Io {
                operation: "writing",
                path: root.join(OPEN_TABS_FILE),
                source,
            })
        })
    })
    .await
    .map_err(|_| {
        ApiError::new(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "internal",
            "the open-tab write stopped before it finished",
        )
    })??;
    Ok(Json(tabs))
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used)]

    use super::*;

    #[test]
    fn a_missing_or_broken_file_reads_as_no_tabs() {
        let root = tempfile::tempdir().unwrap();
        assert_eq!(read_open_tabs(root.path()), OpenTabs::default());
        std::fs::write(root.path().join(OPEN_TABS_FILE), b"{not json").unwrap();
        assert_eq!(read_open_tabs(root.path()), OpenTabs::default());
    }

    #[test]
    fn the_list_round_trips_and_drops_what_it_cannot_use() {
        let root = tempfile::tempdir().unwrap();
        let written = OpenTabs {
            projects: vec![
                "alpha".into(),
                "../escape".into(),
                "beta".into(),
                "alpha".into(),
            ],
            active: Some("gone".into()),
        }
        .normalized();
        assert_eq!(
            written.projects,
            vec!["alpha".to_string(), "beta".to_string()]
        );
        assert_eq!(written.active, None);
        write_open_tabs(root.path(), &written).unwrap();
        assert_eq!(read_open_tabs(root.path()), written);
        assert!(!root.path().join(format!("{OPEN_TABS_FILE}.tmp")).exists());
    }

    /// Every file in `root` whose name starts with the list file name.
    fn tab_files(root: &Path) -> Vec<String> {
        let mut names: Vec<String> = std::fs::read_dir(root)
            .unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.starts_with(OPEN_TABS_FILE))
            .collect();
        names.sort();
        names
    }

    #[test]
    fn concurrent_writes_each_succeed_and_leave_one_whole_file() {
        let root = tempfile::tempdir().unwrap();
        let lists: Vec<OpenTabs> = (0..8)
            .map(|writer| OpenTabs {
                projects: (0..=writer).map(|tab| format!("p{writer}-{tab}")).collect(),
                active: None,
            })
            .collect();
        std::thread::scope(|scope| {
            for tabs in &lists {
                let root = root.path();
                scope.spawn(move || {
                    for _ in 0..20 {
                        write_open_tabs(root, tabs).expect("every write succeeds");
                    }
                });
            }
        });
        let read = read_open_tabs(root.path());
        assert!(lists.contains(&read), "{read:?}");
        assert_eq!(tab_files(root.path()), [OPEN_TABS_FILE]);
    }

    #[test]
    fn unknown_keys_of_the_file_are_read_past_and_written_back() {
        let root = tempfile::tempdir().unwrap();
        let path = root.path().join(OPEN_TABS_FILE);
        std::fs::write(
            &path,
            br#"{"projects":["alpha"],"active":"alpha","pinned":["alpha"]}"#,
        )
        .unwrap();
        let read = read_open_tabs(root.path());
        assert_eq!(read.projects, ["alpha"]);
        assert_eq!(read.active.as_deref(), Some("alpha"));

        let next = OpenTabs {
            projects: vec!["beta".into()],
            active: None,
        };
        write_open_tabs(root.path(), &next).unwrap();
        let written: serde_json::Value =
            serde_json::from_slice(&std::fs::read(&path).unwrap()).unwrap();
        assert_eq!(written["projects"], serde_json::json!(["beta"]));
        assert_eq!(written["pinned"], serde_json::json!(["alpha"]));
        assert_eq!(read_open_tabs(root.path()), next);
    }
}
