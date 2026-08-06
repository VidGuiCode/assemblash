//! What the handlers share: a workspace, and the open projects.
//!
//! A [`Session`] holds an exclusive lock on its project for as long as it
//! lives, so the server opens a project **once** and keeps it, rather than
//! opening and dropping one per request — which would take and release a lock
//! file on every call and make two concurrent requests fight each other.
//!
//! That makes the server the single writer for the projects it has open.
//! Another process holding the same project is a structured conflict, never a
//! wait and never a second writer (PRD §10.3).

use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};

use assemblash_core::session::Session;
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_renderer::store::FontStore;

use crate::error::ApiError;

/// One open project, guarded so only one request mutates it at a time.
pub type OpenProject = Arc<Mutex<Session>>;

/// Everything the handlers need.
#[derive(Debug, Clone)]
pub struct AppState {
    inner: Arc<Inner>,
}

#[derive(Debug)]
struct Inner {
    workspace: Workspace,
    /// The workspace cache, when one could be opened.
    ///
    /// `None` is an ordinary state, not a failure: every caller falls back to
    /// scanning the projects directory, which is what the server did before
    /// the cache existed. A cache that can break the product is not a cache.
    index: Option<Mutex<assemblash_core::index::Index>>,
    /// Sessions opened so far. A `BTreeMap` rather than a hash map so that
    /// anything derived from iterating it is in the same order every run.
    open: Mutex<BTreeMap<String, OpenProject>>,
}

impl AppState {
    /// Builds the shared state over a workspace.
    pub fn new(workspace: Workspace) -> Self {
        // Opened once at start-up and refreshed then, so the first listing is
        // already warm. A workspace that will not hold one simply does not
        // get one.
        let index = assemblash_core::index::Index::open(workspace.root()).map(|index| {
            index.refresh(&workspace);
            Mutex::new(index)
        });
        Self {
            inner: Arc::new(Inner {
                workspace,
                index,
                open: Mutex::new(BTreeMap::new()),
            }),
        }
    }

    /// Runs something against the cache, if there is one.
    ///
    /// Returns `None` when there is no cache *or* when the lock is poisoned —
    /// both mean "answer this the slow way", which every caller can do.
    pub fn with_index<T>(
        &self,
        run: impl FnOnce(&assemblash_core::index::Index) -> T,
    ) -> Option<T> {
        let index = self.inner.index.as_ref()?;
        let guard = index.lock().ok()?;
        Some(run(&guard))
    }

    /// Brings the cache up to date with the projects directory.
    pub fn refresh_index(&self) {
        self.with_index(|index| index.refresh(&self.inner.workspace));
    }

    /// The workspace.
    pub fn workspace(&self) -> &Workspace {
        &self.inner.workspace
    }

    /// The font store, over the workspace's `fonts/` directory.
    pub fn font_store(&self) -> Result<FontStore, ApiError> {
        Ok(FontStore::open(self.inner.workspace.fonts_dir())?)
    }

    /// The open session for a project, opening it the first time it is asked
    /// for.
    ///
    /// The project must already exist: creating one is an explicit request, so
    /// that a typo in a URL cannot leave an empty directory behind.
    pub fn project(&self, id: &ProjectId, now: Option<u64>) -> Result<OpenProject, ApiError> {
        let mut open = self.lock_registry()?;
        if let Some(session) = open.get(id.as_str()) {
            return Ok(Arc::clone(session));
        }

        let directory = self.inner.workspace.existing_project_dir(id)?;
        let session = Arc::new(Mutex::new(Session::open(&directory, now)?));
        open.insert(id.to_string(), Arc::clone(&session));
        Ok(session)
    }

    /// Closes every open project, releasing the lock each one holds.
    ///
    /// A `Session` releases its lock file when it is dropped, and a process
    /// that exits normally drops what it owns — but a registry reachable from
    /// a static, or from a value the runtime tears down without unwinding,
    /// is not dropped, and the lock outlives the process. That is a project
    /// nobody can open until someone runs `assemblash unlock`.
    ///
    /// Calling this on the way out makes the release explicit rather than a
    /// consequence of ownership working out.
    pub fn close_all(&self) {
        if let Ok(mut open) = self.inner.open.lock() {
            open.clear();
        }
    }

    /// Registers a session for a project that has just been created.
    pub fn adopt(&self, id: &ProjectId, session: Session) -> Result<OpenProject, ApiError> {
        let session = Arc::new(Mutex::new(session));
        self.lock_registry()?
            .insert(id.to_string(), Arc::clone(&session));
        Ok(session)
    }

    fn lock_registry(
        &self,
    ) -> Result<std::sync::MutexGuard<'_, BTreeMap<String, OpenProject>>, ApiError> {
        self.inner.open.lock().map_err(|_| {
            ApiError::new(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "poisoned",
                "the server's project registry is in an unknown state; restart it",
            )
        })
    }
}

/// Locks one open project for the duration of a request.
///
/// A poisoned mutex means a previous request panicked while holding a
/// document half-updated. Reporting that rather than carrying on is the only
/// honest option: the in-memory document can no longer be trusted, though the
/// journal on disk still can.
pub fn lock_project(project: &OpenProject) -> Result<std::sync::MutexGuard<'_, Session>, ApiError> {
    project.lock().map_err(|_| {
        ApiError::new(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "poisoned",
            "a previous request failed while holding this project; restart the server \
             (the journal on disk is intact)",
        )
    })
}
