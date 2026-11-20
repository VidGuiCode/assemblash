//! The open project tabs of the reference interface (decision D33 (b)).
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
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OpenTabs {
    pub projects: Vec<String>,
    #[serde(default)]
    pub active: Option<String>,
}

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
    std::fs::read(root.join(OPEN_TABS_FILE))
        .ok()
        .and_then(|bytes| serde_json::from_slice::<OpenTabs>(&bytes).ok())
        .map(OpenTabs::normalized)
        .unwrap_or_default()
}

/// Writes the list through a temporary file and a rename, so a reader never
/// sees half a file.
pub fn write_open_tabs(root: &Path, tabs: &OpenTabs) -> std::io::Result<()> {
    let target = root.join(OPEN_TABS_FILE);
    let temporary = root.join(format!("{OPEN_TABS_FILE}.tmp"));
    let mut bytes = serde_json::to_vec_pretty(tabs).map_err(std::io::Error::other)?;
    bytes.push(b'\n');
    std::fs::write(&temporary, bytes)?;
    std::fs::rename(&temporary, &target)
}

/// `GET /api/open-tabs`.
pub async fn get_open_tabs(State(state): State<AppState>) -> Json<OpenTabs> {
    Json(read_open_tabs(state.workspace().root()))
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
    write_open_tabs(&root, &tabs).map_err(|source| {
        ApiError::from(assemblash_core::storage::StorageError::Io {
            operation: "writing",
            path: root.join(OPEN_TABS_FILE),
            source,
        })
    })?;
    Ok(Json(tabs))
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

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
}
