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

use assemblash_core::session::{Reclaim, Session};
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::Document;
use assemblash_renderer::install::{FontFetcher, HttpFetcher, Manifest};
use assemblash_renderer::store::FontStore;
use assemblash_renderer::LoadedFonts;

use crate::error::ApiError;

/// One open project, guarded so only one request mutates it at a time.
pub type OpenProject = Arc<Mutex<Session>>;

/// Where the install route gets its bytes.
///
/// Shared rather than owned so a test can hand the server a fetcher that
/// serves fixture bytes: the install path is then exercised end to end with
/// no network at all, which is the only way a test of it can be honest.
pub type SharedFontFetcher = Arc<dyn FontFetcher + Send + Sync>;

/// A project lock this server cleared because the process holding it was
/// gone.
///
/// Recorded rather than only logged. A lock disappearing is something a person
/// should be told about — it means a previous run of this program died without
/// releasing the project — and a log line on a server nobody is watching tells
/// no one. This is what the project summary and the export warnings channel
/// carry to whoever is actually looking.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReclaimEvent {
    /// The project whose lock was cleared.
    pub project: String,
    /// The process that had left the lock behind.
    pub pid: u32,
    /// The machine it was taken on — this one, always: a lock naming any
    /// other machine is never reclaimed.
    pub host: String,
    /// Milliseconds since the Unix epoch, from the request that noticed. 0
    /// when the transport had no clock to read.
    pub at: u64,
}

/// Everything the handlers need.
#[derive(Debug, Clone)]
pub struct AppState {
    inner: Arc<Inner>,
}

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
    /// Held for the whole of any font-store mutation.
    ///
    /// A [`FontStore`] is opened, changed, and written back, so two requests
    /// doing that at once would each write an index built from what they read
    /// before the other started — and the later write would drop the earlier
    /// one's entries. One lock across the read-modify-write makes the store
    /// single-writer for as long as this server owns it, the same guarantee
    /// [`Session`] gives a project.
    font_writes: Mutex<()>,
    /// What the install route downloads with.
    font_fetcher: SharedFontFetcher,
    /// Which manifest the install route reads, when it is not the compiled-in
    /// one.
    ///
    /// `None` in every build that ships. A test overrides it because the
    /// bundled manifest pins the sha256 of files that are megabytes each:
    /// with those hashes there is no fixture that can install, so a test of
    /// the *successful* install path needs a manifest pinning bytes it has.
    font_manifest: Option<Manifest>,
    /// Whether opening a project may clear a lock left by a dead process.
    ///
    /// Off unless a caller asked for it. A server started by a service manager
    /// shares its machine with whatever else is on it, and a lock it did not
    /// write is not obviously its business; the friendly launch, which is one
    /// person's own editor on their own desktop, is where a crashed
    /// predecessor should just be cleaned up.
    reclaim_stale_locks: bool,
    /// Locks cleared so far and not yet reported to anyone.
    ///
    /// Drained by the project summary, peeked at by the export warnings
    /// channel — so whichever surface a client looks at first learns about it,
    /// and it is not repeated forever afterwards.
    reclaimed: Mutex<Vec<ReclaimEvent>>,
}

// Hand-written: a fetcher is a trait object, and requiring `Debug` of every
// implementation only to print a placeholder here would be a worse trade than
// writing this out.
impl std::fmt::Debug for Inner {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Inner")
            .field("workspace", &self.workspace)
            .field("index", &self.index)
            .field("open", &self.open)
            .field("fonts", &self.fonts)
            .field("font_writes", &self.font_writes)
            .field("font_fetcher", &"<font fetcher>")
            .field("font_manifest", &self.font_manifest)
            .field("reclaim_stale_locks", &self.reclaim_stale_locks)
            .field("reclaimed", &self.reclaimed)
            .finish()
    }
}

impl AppState {
    /// Builds the shared state over a workspace.
    pub fn new(workspace: Workspace) -> Self {
        Self::with_font_source(workspace, Arc::new(HttpFetcher), None)
    }

    /// Builds the shared state, saying whether a stale lock may be reclaimed.
    ///
    /// `true` means: when opening a project finds a lock naming *this* machine
    /// and a process that is provably gone, remove it and open anyway. A lock
    /// from another machine, or from a build old enough not to record one, is
    /// still a conflict a person has to resolve — see
    /// [`assemblash_core::session::reclaim_if_stale`] for exactly how timid
    /// that decision is.
    ///
    /// With `false` this is [`AppState::new`], byte for byte.
    pub fn with_reclaim(workspace: Workspace, reclaim_stale_locks: bool) -> Self {
        Self::build(workspace, Arc::new(HttpFetcher), None, reclaim_stale_locks)
    }

    /// Builds the shared state with an explicit font fetcher, and optionally
    /// a manifest other than the compiled-in one.
    ///
    /// The only reason to call this rather than [`AppState::new`] is to run
    /// the install route against something other than the network.
    pub fn with_font_source(
        workspace: Workspace,
        font_fetcher: SharedFontFetcher,
        font_manifest: Option<Manifest>,
    ) -> Self {
        Self::build(workspace, font_fetcher, font_manifest, false)
    }

    /// Builds the shared state with an explicit font source *and* an explicit
    /// reclaim policy. What a test of the reclaim path uses.
    pub fn with_font_source_reclaiming(
        workspace: Workspace,
        font_fetcher: SharedFontFetcher,
        font_manifest: Option<Manifest>,
        reclaim_stale_locks: bool,
    ) -> Self {
        Self::build(workspace, font_fetcher, font_manifest, reclaim_stale_locks)
    }

    /// The one constructor the others all go through.
    fn build(
        workspace: Workspace,
        font_fetcher: SharedFontFetcher,
        font_manifest: Option<Manifest>,
        reclaim_stale_locks: bool,
    ) -> Self {
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
                font_writes: Mutex::new(()),
                font_fetcher,
                font_manifest,
                reclaim_stale_locks,
                reclaimed: Mutex::new(Vec::new()),
            }),
        }
    }

    /// Whether this server may clear a lock left by a dead process.
    pub fn reclaims_stale_locks(&self) -> bool {
        self.inner.reclaim_stale_locks
    }

    /// Every lock cleared so far and not yet reported, leaving the record
    /// where it is.
    ///
    /// The export warnings channel reads this rather than draining: an export
    /// is not the place a notice gets consumed, because then a client that
    /// exported before reading a summary would never see it on the summary.
    pub fn reclaim_events(&self) -> Vec<ReclaimEvent> {
        match self.inner.reclaimed.lock() {
            Ok(events) => events.clone(),
            // A poisoned list is a list nothing can be said about. Losing a
            // notice is not worth failing a request over.
            Err(_) => Vec::new(),
        }
    }

    /// Takes every unreported lock reclaim, leaving none behind.
    pub fn take_reclaim_events(&self) -> Vec<ReclaimEvent> {
        match self.inner.reclaimed.lock() {
            Ok(mut events) => std::mem::take(&mut events),
            Err(_) => Vec::new(),
        }
    }

    /// The pending reclaim for one project, if there is one, without taking
    /// it.
    pub fn reclaim_event(&self, project: &str) -> Option<ReclaimEvent> {
        self.reclaim_events()
            .into_iter()
            .find(|event| event.project == project)
    }

    /// Takes the pending reclaim for one project.
    ///
    /// What makes `reclaimedLock` appear on the first project summary after a
    /// reclaim and on no summary after that: the notice is delivered once, to
    /// whoever asks first.
    pub fn take_reclaim_event(&self, project: &str) -> Option<ReclaimEvent> {
        let mut events = self.inner.reclaimed.lock().ok()?;
        let at = events.iter().position(|event| event.project == project)?;
        Some(events.remove(at))
    }

    fn record_reclaim(&self, event: ReclaimEvent) {
        // This server has no logging framework; standard error is where
        // everything else it has to say to the person who started it goes.
        eprintln!(
            "reclaimed the lock on project {:?}: process {} on {} is gone",
            event.project, event.pid, event.host
        );
        if let Ok(mut events) = self.inner.reclaimed.lock() {
            events.push(event);
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

    /// Takes the right to change the font store, for as long as the guard
    /// lives.
    ///
    /// Every route that imports, removes, or installs takes this *before*
    /// opening the store and holds it until after the index is written.
    pub fn lock_font_writes(&self) -> Result<std::sync::MutexGuard<'_, ()>, ApiError> {
        self.inner.font_writes.lock().map_err(|_| {
            ApiError::new(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "poisoned",
                "a previous request failed while changing the font store; restart the server",
            )
        })
    }

    /// What the install route downloads with.
    pub fn font_fetcher(&self) -> &dyn FontFetcher {
        self.inner.font_fetcher.as_ref()
    }

    /// The manifest the install route reads: the compiled-in one unless this
    /// state was built with an override.
    pub fn font_manifest(&self) -> Result<Manifest, ApiError> {
        match &self.inner.font_manifest {
            Some(manifest) => Ok(manifest.clone()),
            None => Ok(Manifest::bundled()?),
        }
    }

    /// Drops every parsed font database this server has cached.
    ///
    /// Called after any change to the store. The cache key is built from the
    /// records themselves, so a changed store already misses rather than
    /// hits — but a family that has just been removed must not keep rendering
    /// from a database parsed before it went, and clearing is both cheaper to
    /// reason about and the thing that stops the cache growing a dead entry
    /// per removed font.
    pub fn clear_font_cache(&self) {
        if let Ok(mut cache) = self.inner.fonts.lock() {
            cache.clear();
        }
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
        let session = if self.inner.reclaim_stale_locks {
            let (session, reclaim) = Session::open_reclaiming(&directory, now)?;
            if let Reclaim::Reclaimed { pid, host } = reclaim {
                self.record_reclaim(ReclaimEvent {
                    project: id.to_string(),
                    pid,
                    host,
                    at: now.unwrap_or_default(),
                });
            }
            session
        } else {
            Session::open(&directory, now)?
        };
        let session = Arc::new(Mutex::new(session));
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

    /// [`AppState::close_all`], then waits until every closed session has
    /// really been dropped — and its lock file removed.
    ///
    /// Clearing the registry drops only the registry's handle. A request that
    /// is still running holds its own handle, and the project stays locked
    /// until that request ends. A caller that hands the projects to another
    /// process next must wait for that, or the other process meets
    /// `projectLocked`. Returns `false` when `timeout` passed first.
    pub fn close_all_and_wait(&self, timeout: std::time::Duration) -> bool {
        let deadline = std::time::Instant::now() + timeout;
        let (closed, locks): (
            Vec<std::sync::Weak<Mutex<Session>>>,
            Vec<std::path::PathBuf>,
        ) = match self.inner.open.lock() {
            Ok(mut open) => {
                let locks = open
                    .keys()
                    .filter_map(|id| ProjectId::new(id).ok())
                    .map(|id| {
                        self.inner
                            .workspace
                            .project_dir(&id)
                            .join(assemblash_core::session::LOCK_FILE)
                    })
                    .collect();
                let handles = open.values().map(Arc::downgrade).collect();
                open.clear();
                (handles, locks)
            }
            Err(_) => return false,
        };
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if !wait_until_dropped(&closed, remaining) {
            return false;
        }
        // The last handle on a session is gone a moment before the session's
        // Drop removes the lock file. Waiting for the handles is not yet
        // waiting for the locks, so the files are waited for too.
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        wait_until_locks_released(&locks, remaining)
    }

    /// Registers a session for a project that has just been created.
    pub fn adopt(&self, id: &ProjectId, session: Session) -> Result<OpenProject, ApiError> {
        let session = Arc::new(Mutex::new(session));
        self.lock_registry()?
            .insert(id.to_string(), Arc::clone(&session));
        Ok(session)
    }

    /// Removes a project from the workspace, directory and all.
    ///
    /// A project this server holds is closed on the way in (see
    /// [`AppState::closed_project_dir`]), and a project some other process
    /// holds the lock file for is refused: a lock that may be live is never
    /// deleted past. There is no undo for this route, which is why both
    /// checks happen before any bytes are touched.
    pub fn delete_project(&self, id: &ProjectId) -> Result<(), ApiError> {
        let directory = self.closed_project_dir(id)?;
        std::fs::remove_dir_all(&directory).map_err(|source| {
            assemblash_core::storage::StorageError::Io {
                operation: "removing",
                path: directory.clone(),
                source,
            }
        })?;
        self.refresh_index();
        Ok(())
    }

    /// Renames a project by renaming its directory.
    ///
    /// The same closing and lock refusals as [`AppState::delete_project`] —
    /// a live lock is never moved past — plus the rename itself being refused
    /// when the target name is taken. The id *is* the directory name, so a
    /// rename is atomic on the same volume and no document bytes change.
    pub fn rename_project(&self, id: &ProjectId, to: &ProjectId) -> Result<(), ApiError> {
        let directory = self.closed_project_dir(id)?;
        let target = self.inner.workspace.project_dir(to);
        if target.exists() {
            return Err(ApiError::new(
                axum::http::StatusCode::CONFLICT,
                "projectExists",
                format!("a project named {} is already there", to.as_str()),
            )
            .with_details(serde_json::json!({ "id": to.as_str() })));
        }
        std::fs::rename(&directory, &target).map_err(|source| {
            assemblash_core::storage::StorageError::Io {
                operation: "renaming",
                path: directory.clone(),
                source,
            }
        })?;
        self.refresh_index();
        Ok(())
    }

    /// The directory of an existing project that is neither open here nor
    /// locked elsewhere — the precondition both project-management routes
    /// share.
    ///
    /// A project this server holds is closed first: dropping the session is
    /// what releases its lock file, and a rename or delete cannot happen
    /// while one exists. A request still mid-flight keeps its own handle, so
    /// the wait below refuses instead of racing it.
    fn closed_project_dir(&self, id: &ProjectId) -> Result<std::path::PathBuf, ApiError> {
        let directory = self.inner.workspace.existing_project_dir(id)?;
        let open = self.lock_registry()?.remove(id.as_str());
        if let Some(session) = open {
            // Downgraded *before* the strong handle is dropped: the local
            // binding would keep the strong count above zero and the wait
            // below would always run out.
            let handle = std::sync::Arc::downgrade(&session);
            drop(session);
            let wait = wait_until_dropped(&[handle], std::time::Duration::from_secs(5));
            if !wait || directory.join(assemblash_core::session::LOCK_FILE).exists() {
                return Err(ApiError::new(
                    axum::http::StatusCode::CONFLICT,
                    "projectOpen",
                    format!(
                        "project {} is being used by a request in this server; try again \
                         when it has finished",
                        id.as_str()
                    ),
                )
                .with_details(serde_json::json!({ "id": id.as_str() })));
            }
        }
        if directory.join(assemblash_core::session::LOCK_FILE).exists() {
            return Err(ApiError::new(
                axum::http::StatusCode::CONFLICT,
                "projectLocked",
                format!(
                    "project {} is locked by another process; recover or remove the lock first",
                    id.as_str()
                ),
            )
            .with_details(serde_json::json!({ "id": id.as_str() })));
        }
        Ok(directory)
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

/// Waits until nothing holds any of these sessions any more.
pub fn wait_until_dropped(
    sessions: &[std::sync::Weak<Mutex<Session>>],
    timeout: std::time::Duration,
) -> bool {
    let deadline = std::time::Instant::now() + timeout;
    loop {
        if sessions.iter().all(|session| session.strong_count() == 0) {
            return true;
        }
        if std::time::Instant::now() >= deadline {
            return false;
        }
        std::thread::sleep(std::time::Duration::from_millis(20));
    }
}

/// Waits until each of these lock files is gone from disk.
///
/// Dropping the last handle on a session runs the session's `Drop`, which
/// removes the lock file. The handle count reaches zero first, so a caller
/// that waited only for the handles can still see the file for one instant.
/// This closes that window: it waits for the effect the next process sees.
/// Returns `false` when `timeout` passed first.
pub fn wait_until_locks_released(
    locks: &[std::path::PathBuf],
    timeout: std::time::Duration,
) -> bool {
    let deadline = std::time::Instant::now() + timeout;
    loop {
        if locks.iter().all(|lock| !lock.exists()) {
            return true;
        }
        if std::time::Instant::now() >= deadline {
            return false;
        }
        std::thread::sleep(std::time::Duration::from_millis(20));
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
