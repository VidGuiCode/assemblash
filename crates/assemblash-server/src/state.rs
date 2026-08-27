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
use assemblash_core::Document;
use assemblash_renderer::store::FontStore;
use assemblash_renderer::LoadedFonts;

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
    /// Parsed font databases and measured glyph advances, keyed by the exact
    /// content-addressed font records used to build them.
    ///
    /// Building this data is deliberately thorough and can take seconds for a
    /// large Unicode font. The store is immutable from the server API, so
    /// repeating that work for every preview only adds latency; reopening the
    /// index to form the key still notices fonts installed by another process.
    fonts: Mutex<BTreeMap<Vec<String>, LoadedFonts>>,
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
                fonts: Mutex::new(BTreeMap::new()),
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

    /// Loads the exact fonts a document names, reusing their parsed database
    /// and measured advances across previews, exports, and text layout calls.
    pub fn fonts_for(&self, document: &Document) -> Result<LoadedFonts, ApiError> {
        let families = crate::render::families_used(document);
        if families.is_empty() {
            return Ok(LoadedFonts::from_bytes([]));
        }

        let store = self.font_store()?;
        let mut key = Vec::new();
        for family in &families {
            key.push(format!("family\0{family}"));
            for record in store
                .records()
                .iter()
                .filter(|record| &record.family == family)
            {
                key.push(format!(
                    "face\0{}\0{}\0{}\0{}\0{}\0{}",
                    record.family,
                    record.style,
                    record.weight,
                    record.file,
                    record.hash,
                    record.face_index
                ));
            }
        }

        let mut cache = self.inner.fonts.lock().map_err(|_| {
            ApiError::new(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "poisoned",
                "the server's font cache is in an unknown state; restart it",
            )
        })?;
        if let Some(fonts) = cache.get(&key) {
            return Ok(fonts.clone());
        }

        let fonts = store.load_families(&families)?;
        cache.insert(key, fonts.clone());
        Ok(fonts)
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

    /// Removes the exact project lock an interactive client already saw.
    ///
    /// Holding the registry while comparing and removing prevents this server
    /// from opening the project between those two steps. A project this server
    /// already owns is never unlocked through the recovery route.
    pub fn recover_project_lock(
        &self,
        id: &ProjectId,
        expected_pid: u32,
    ) -> Result<bool, ApiError> {
        let open = self.lock_registry()?;
        let directory = self.inner.workspace.existing_project_dir(id)?;
        if open.contains_key(id.as_str()) {
            return Err(assemblash_core::SessionError::Locked {
                pid: std::process::id(),
                path: directory.join(assemblash_core::session::LOCK_FILE),
            }
            .into());
        }
        Ok(assemblash_core::session::force_unlock_if_pid(
            &directory,
            expected_pid,
        )?)
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
