//! An open project: the document, its history, and the lock that says who
//! has it.
//!
//! This is the type every transport uses. The CLI holds one; the HTTP API
//! (v0.6) will hold one per project; the MCP server (v0.7) will hold one per
//! session. Putting the ordering rules here — journal before document, lock
//! before either — means no transport can get them subtly wrong on its own.
//!
//! # Write order, and what a crash leaves behind
//!
//! An operation is journalled *first*, then the document is written. A crash
//! between the two leaves the journal one step ahead of `document.json`, and
//! [`Session::open`] notices: it rebuilds from history and rewrites the
//! document. The journal is the record of what happened, so when the two
//! disagree the journal wins.
//!
//! The reverse order would lose the operation instead, silently. Losing work
//! quietly is worse than doing extra work loudly at the next open.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::document::Document;
use crate::history::{Actor, History, HistoryError};
use crate::ids::{IdSource, TransactionId};
use crate::ops::{self, OpError, OpOutcome, Operation};
use crate::storage::{self, StorageError};

/// Name of the lock file inside a project directory.
pub const LOCK_FILE: &str = ".assemblash-lock";

/// Something that stopped a session.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum SessionError {
    /// Reading or writing the project failed.
    #[error(transparent)]
    Storage(#[from] StorageError),

    /// Reading or writing history failed.
    #[error(transparent)]
    History(#[from] HistoryError),

    /// The operation itself was refused.
    #[error(transparent)]
    Operation(#[from] OpError),

    /// Another process holds the project.
    #[error(
        "project is open in another process (pid {pid}); \
         if that process is gone, remove {path}"
    )]
    Locked {
        /// Process that claimed it.
        pid: u32,
        /// Where the claim is recorded.
        path: PathBuf,
    },

    /// The caller's expected version does not match the document.
    ///
    /// PRD §10.3: the caller read the document, someone else changed it, and
    /// this mutation was written against a version that no longer exists.
    #[error("document has moved on: expected version {expected}, found {actual}")]
    VersionConflict {
        /// What the caller expected.
        expected: u64,
        /// What the document actually is.
        actual: u64,
    },
}

/// What was recorded in the lock file.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LockContents {
    pid: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    since: Option<u64>,
}

/// Exclusive claim on a project directory, released when dropped.
#[derive(Debug)]
struct ProjectLock {
    path: PathBuf,
    /// False when the session was opened without taking the lock, so dropping
    /// it must not delete someone else's file.
    owned: bool,
}

impl ProjectLock {
    fn acquire(project_dir: &Path, now: Option<u64>) -> Result<Self, SessionError> {
        let path = project_dir.join(LOCK_FILE);
        let contents = serde_json::to_string(&LockContents {
            pid: std::process::id(),
            since: now,
        })
        .unwrap_or_default();

        // create_new is the whole mechanism: the filesystem decides the race,
        // so two processes cannot both believe they won.
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&path)
        {
            Ok(mut file) => {
                use std::io::Write as _;
                let _ = file.write_all(contents.as_bytes());
                Ok(Self { path, owned: true })
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                let pid = std::fs::read_to_string(&path)
                    .ok()
                    .and_then(|text| serde_json::from_str::<LockContents>(&text).ok())
                    .map_or(0, |lock| lock.pid);
                Err(SessionError::Locked { pid, path })
            }
            Err(source) => Err(SessionError::Storage(StorageError::Io {
                operation: "creating",
                path,
                source,
            })),
        }
    }

    fn unlocked() -> Self {
        Self {
            path: PathBuf::new(),
            owned: false,
        }
    }
}

impl Drop for ProjectLock {
    fn drop(&mut self) {
        if self.owned {
            let _ = std::fs::remove_file(&self.path);
        }
    }
}

/// Removes a stale lock left by a process that is gone.
///
/// Deliberately a separate, explicit call rather than a timeout: this build
/// cannot tell a crashed process from a slow one, and guessing wrong means
/// two processes writing one project. A human, or an operator script, decides.
pub fn force_unlock(project_dir: &Path) -> Result<bool, SessionError> {
    let path = project_dir.join(LOCK_FILE);
    match std::fs::remove_file(&path) {
        Ok(()) => Ok(true),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Err(source) => Err(SessionError::Storage(StorageError::Io {
            operation: "removing",
            path,
            source,
        })),
    }
}

/// An open project.
#[derive(Debug)]
pub struct Session {
    project_dir: PathBuf,
    document: Document,
    history: History,
    /// Held for as long as the session is, released on drop.
    _lock: ProjectLock,
    recovered: bool,
}

impl Session {
    /// Creates a project directory and starts its history.
    pub fn create(
        project_dir: &Path,
        document: Document,
        now: Option<u64>,
    ) -> Result<Self, SessionError> {
        std::fs::create_dir_all(project_dir).map_err(|source| {
            SessionError::Storage(StorageError::Io {
                operation: "creating",
                path: project_dir.to_path_buf(),
                source,
            })
        })?;
        let lock = ProjectLock::acquire(project_dir, now)?;

        storage::save(&document, project_dir)?;
        let mut history = History::open(project_dir)?;
        // The state the project starts from, so a rebuild always has
        // somewhere to start.
        history.record_base(&document)?;

        Ok(Self {
            project_dir: project_dir.to_path_buf(),
            document,
            history,
            _lock: lock,
            recovered: false,
        })
    }

    /// Opens a project, recovering from an interrupted write if there was one.
    pub fn open(project_dir: &Path, now: Option<u64>) -> Result<Self, SessionError> {
        let lock = ProjectLock::acquire(project_dir, now)?;
        Self::open_with_lock(project_dir, lock)
    }

    /// Opens a project without taking the lock.
    ///
    /// For reading only — rendering a preview, listing layers. A caller that
    /// mutates through this is racing another process by choice.
    pub fn open_read_only(project_dir: &Path) -> Result<Self, SessionError> {
        Self::open_with_lock(project_dir, ProjectLock::unlocked())
    }

    fn open_with_lock(project_dir: &Path, lock: ProjectLock) -> Result<Self, SessionError> {
        let mut document = storage::load(project_dir)?;
        let history = History::open(project_dir)?;
        let mut recovered = false;

        // Reconcile against the *version*, not against the content.
        //
        // The version says which position the file was written at. If it is
        // behind history, an operation was journalled and the save never
        // finished, so the document is rebuilt. If it matches, the file is
        // taken as it is — a human editing `document.json` by hand is a
        // supported thing to do (FR-9), and comparing content instead would
        // silently revert their work every time they opened the project.
        let position = history.position();
        if document.version < position {
            document = history.rebuild(position)?;
            storage::save(&document, project_dir)?;
            recovered = true;
        } else if document.version > position {
            // History is shorter than the document claims — the history
            // directory was trimmed or deleted. The document is the user's
            // data and stays; the version follows history, which is the only
            // thing that can say what is undoable.
            document.version = position;
        }

        Ok(Self {
            project_dir: project_dir.to_path_buf(),
            document,
            history,
            _lock: lock,
            recovered,
        })
    }

    /// Whether opening this project had to repair an interrupted write.
    pub fn recovered_from_interrupted_write(&self) -> bool {
        self.recovered
    }

    /// The document as it currently is.
    pub fn document(&self) -> &Document {
        &self.document
    }

    /// The project directory.
    pub fn project_dir(&self) -> &Path {
        &self.project_dir
    }

    /// The history of this project.
    pub fn history(&self) -> &History {
        &self.history
    }

    /// The document's current version, for a caller that will mutate later.
    pub fn version(&self) -> u64 {
        self.document.version
    }

    /// Applies an operation, journals it, and saves.
    ///
    /// `expected_version` is the version the caller last read. Passing it is
    /// how a client avoids overwriting work it never saw (PRD §10.3);
    /// passing `None` means "apply to whatever is there".
    pub fn apply(
        &mut self,
        operation: &Operation,
        actor: &Actor,
        now: Option<u64>,
        expected_version: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<(OpOutcome, TransactionId), SessionError> {
        self.check_version(expected_version)?;

        let mut candidate = self.document.clone();
        let outcome = ops::apply(&mut candidate, operation, ids)?;
        candidate.version = self.history.position() + 1;

        // Journal first. A crash after this and before the save leaves the
        // document behind the journal, which `open` repairs; the reverse
        // would lose the operation with nothing to repair it from.
        let transaction = self
            .history
            .record_applied(operation, &outcome, &candidate, actor, now, ids)?;
        crate::crash_point("journal-appended");
        storage::save(&candidate, &self.project_dir)?;
        self.document = candidate;
        Ok((outcome, transaction))
    }

    /// Adds an imported asset to the document.
    ///
    /// Importing is not an operation: it changes the project directory rather
    /// than the layer tree, and it is not undoable — undoing a copy would
    /// mean deciding whether to delete the user's file. The asset entry is
    /// saved immediately, and the layer that references it goes through the
    /// operation layer as usual.
    pub fn register_asset(&mut self, asset: crate::Asset) -> Result<(), SessionError> {
        self.document.assets.push(asset);
        storage::save(&self.document, &self.project_dir)?;
        Ok(())
    }

    /// Reports what an operation would do, without doing it (PRD §10.4).
    pub fn dry_run(
        &self,
        operation: &Operation,
        expected_version: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<OpOutcome, SessionError> {
        self.check_version(expected_version)?;
        Ok(ops::dry_run(&self.document, operation, ids)?)
    }

    /// Undoes the last operation.
    pub fn undo(
        &mut self,
        actor: &Actor,
        now: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<TransactionId, SessionError> {
        let (document, transaction) = self.history.undo(actor, now, ids)?;
        storage::save(&document, &self.project_dir)?;
        self.document = document;
        Ok(transaction)
    }

    /// Redoes the operation that was last undone.
    pub fn redo(
        &mut self,
        actor: &Actor,
        now: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<TransactionId, SessionError> {
        let (document, transaction) = self.history.redo(actor, now, ids)?;
        storage::save(&document, &self.project_dir)?;
        self.document = document;
        Ok(transaction)
    }

    fn check_version(&self, expected: Option<u64>) -> Result<(), SessionError> {
        match expected {
            Some(expected) if expected != self.document.version => {
                Err(SessionError::VersionConflict {
                    expected,
                    actual: self.document.version,
                })
            }
            _ => Ok(()),
        }
    }
}
