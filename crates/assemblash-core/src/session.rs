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
use crate::liveness::{process_is_alive, this_host, Liveness};
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
///
/// Every field after `pid` is optional in both directions. A lock written by
/// a build before 1.5.0 carries no `host`, and a build before 1.5.0 reading a
/// lock that has one ignores it — serde skips unknown fields unless asked not
/// to, and this struct never asks. Both halves are pinned by tests below, so
/// the file stays readable in both directions rather than by assertion.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LockContents {
    pid: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    since: Option<u64>,
    /// The machine that took the lock.
    ///
    /// A pid means nothing without it: pid 4812 on a colleague's laptop is not
    /// pid 4812 here, and probing it locally would answer about an unrelated
    /// process. Absent when [`crate::liveness::this_host`] could not name this
    /// machine, and absent from every lock written before 1.5.0.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    host: Option<String>,
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
            host: this_host(),
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

/// Removes a lock only when it is still the one the caller inspected.
///
/// This is the safe primitive for an interactive recovery flow: the UI first
/// receives the owning PID in [`SessionError::Locked`], asks the person to
/// confirm that process is gone, then presents that PID here. If another
/// process acquired the project in between, its different claim is preserved.
pub fn force_unlock_if_pid(project_dir: &Path, expected_pid: u32) -> Result<bool, SessionError> {
    let path = project_dir.join(LOCK_FILE);
    let text = match std::fs::read_to_string(&path) {
        Ok(text) => text,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(false),
        Err(source) => {
            return Err(SessionError::Storage(StorageError::Io {
                operation: "reading",
                path,
                source,
            }))
        }
    };
    let actual_pid = serde_json::from_str::<LockContents>(&text).map_or(0, |lock| lock.pid);
    if actual_pid != expected_pid {
        return Err(SessionError::Locked {
            pid: actual_pid,
            path,
        });
    }

    force_unlock(project_dir)
}

/// Why a lock was left where it was.
///
/// Every variant except [`HeldReason::Alive`] is a refusal to *decide*, not a
/// finding that the owner is running. Reclaim needs positive evidence — this
/// machine, this pid, definitely gone — and anything short of that keeps the
/// lock. A human can still clear it with [`force_unlock_if_pid`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub enum HeldReason {
    /// The lock records no host: written before 1.5.0, or written on a machine
    /// that could not name itself. The pid cannot be attributed to any
    /// machine, so it is not probed.
    NoHost,
    /// The lock was taken on a different machine. Its pid is meaningless here.
    ForeignHost,
    /// The owning process is running.
    Alive,
    /// A process with that id exists but could not be inspected — another
    /// user, or a platform with no probe. Treated as alive.
    Unknown,
}

/// What [`reclaim_if_stale`] found, and what it did about it.
///
/// Internally tagged, so every outcome is one flat object with the same
/// `status` key — `{"status":"notLocked"}`, `{"status":"reclaimed","pid":…,
/// "host":…}`, `{"status":"held","pid":…,"host":…,"reason":…}`. A client
/// reads one field to know which it has rather than switching on the shape of
/// the value, which is what an externally tagged enum would make it do.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
#[non_exhaustive]
pub enum Reclaim {
    /// There was no lock file.
    NotLocked,
    /// A lock left by a dead process on this machine was removed.
    Reclaimed {
        /// The process that had left it behind.
        pid: u32,
        /// The machine it was taken on — this one.
        host: String,
    },
    /// The lock was left alone.
    Held {
        /// Who the lock names. 0 when the file could not be parsed.
        pid: u32,
        /// The machine the lock names, when it names one.
        host: Option<String>,
        /// Why it was not reclaimed.
        reason: HeldReason,
    },
}

/// Removes a lock whose owner is provably gone, and nothing else.
///
/// This is the automatic half of lock recovery, and it is deliberately timid.
/// It removes the file only when **both** of these hold:
///
/// 1. the lock names this machine — a pid from another host says nothing here;
/// 2. [`process_is_alive`] answers [`Liveness::Dead`] for that pid — not
///    "probably", not "could not tell".
///
/// Anything else returns [`Reclaim::Held`] with the reason and touches
/// nothing. The failure this protects against is two processes writing one
/// project, which corrupts it; the failure it accepts is a stale lock
/// surviving until a human clears it with [`force_unlock_if_pid`], which
/// merely annoys.
///
/// # The residual risk
///
/// A pid can be reused. If the process that took the lock died and the
/// operating system handed its id to something else on this machine, the probe
/// answers `Alive` and the lock is kept — safe. The dangerous direction, a
/// reused pid being mistaken for the *owner*, cannot cause a wrongful reclaim
/// here: reclaim needs `Dead`, and a reused pid is never `Dead`.
pub fn reclaim_if_stale(project_dir: &Path) -> Result<Reclaim, SessionError> {
    let path = project_dir.join(LOCK_FILE);
    let text = match std::fs::read_to_string(&path) {
        Ok(text) => text,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(Reclaim::NotLocked)
        }
        Err(source) => {
            return Err(SessionError::Storage(StorageError::Io {
                operation: "reading",
                path,
                source,
            }))
        }
    };

    // A lock this build cannot parse is a lock this build must not remove: it
    // degrades to pid 0 and no host, which lands on `NoHost` below.
    let contents = serde_json::from_str::<LockContents>(&text).ok();
    let pid = contents.as_ref().map_or(0, |lock| lock.pid);
    let host = contents.and_then(|lock| lock.host);

    let Some(host) = host else {
        return Ok(Reclaim::Held {
            pid,
            host: None,
            reason: HeldReason::NoHost,
        });
    };

    // `this_host()` returning `None` lands here too, and that is intended: a
    // machine that cannot name itself cannot claim a lock as its own.
    if this_host().as_deref() != Some(host.as_str()) {
        return Ok(Reclaim::Held {
            pid,
            host: Some(host),
            reason: HeldReason::ForeignHost,
        });
    }

    match process_is_alive(pid) {
        Liveness::Dead => {
            // Deliberately the same removal path a human takes, so there is
            // one way a lock file leaves the disk.
            force_unlock(project_dir)?;
            Ok(Reclaim::Reclaimed { pid, host })
        }
        Liveness::Alive => Ok(Reclaim::Held {
            pid,
            host: Some(host),
            reason: HeldReason::Alive,
        }),
        // `Liveness::Unknown`, and anything a later version of the probe
        // learns to answer. Everything that is not a definite `Dead` keeps the
        // lock, so a new variant can only ever be more cautious here.
        _ => Ok(Reclaim::Held {
            pid,
            host: Some(host),
            reason: HeldReason::Unknown,
        }),
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

    /// Opens a project, first clearing a lock whose owner is provably gone.
    ///
    /// [`Session::open`] is unchanged and still refuses a locked project
    /// outright; this is the variant a transport uses when it wants a crashed
    /// predecessor cleaned up without a human in the loop. The [`Reclaim`] is
    /// returned rather than logged so the caller can report it as a typed
    /// event — a lock disappearing is worth telling someone about.
    ///
    /// When the lock is [`Reclaim::Held`], the open that follows fails with
    /// [`SessionError::Locked`] exactly as it does today; the reason for
    /// holding is available from [`reclaim_if_stale`] on its own.
    pub fn open_reclaiming(
        project_dir: &Path,
        now: Option<u64>,
    ) -> Result<(Self, Reclaim), SessionError> {
        let reclaim = reclaim_if_stale(project_dir)?;
        let session = Self::open(project_dir, now)?;
        Ok((session, reclaim))
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
        let mut history = History::open(project_dir)?;
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

        // A hand edit is a state history has never seen. Undo rebuilds from a
        // snapshot, so without this the first undo after a hand edit would
        // quietly restore the pre-edit document and destroy the user's work —
        // which was the behaviour up to 0.8.0. Recording the state as it
        // actually is makes undo return to what the user last saw.
        //
        // Only when the session can write: `open_read_only` must not touch the
        // project, and a reader has nothing to undo anyway.
        if lock.owned && !recovered {
            let diverged = match history.rebuild(position) {
                Ok(recorded) => recorded != document,
                // Nothing to compare against — `ensure_base` will lay the
                // foundation on the first mutation.
                Err(_) => false,
            };
            if diverged {
                history.snapshot_at(position, &document)?;
            }
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

        // A project that never went through `create` — assembled by hand, or
        // with its history removed — has no snapshot to rebuild from, so its
        // very first undo would fail. Establish the base from the state before
        // this operation, which is what that undo has to return to.
        self.history.ensure_base(&self.document)?;

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

    /// Applies ordinary operations atomically and journals them as one step.
    ///
    /// Every member still passes through [`ops::apply`]. The only new
    /// semantic is transaction scope: validation happens against a cloned
    /// document, nothing is persisted if any member fails, and one undo
    /// restores the state before the whole batch.
    pub fn apply_batch(
        &mut self,
        label: &str,
        operations: &[Operation],
        actor: &Actor,
        now: Option<u64>,
        expected_version: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<(OpOutcome, TransactionId), SessionError> {
        self.check_version(expected_version)?;
        self.history.ensure_base(&self.document)?;

        let mut candidate = self.document.clone();
        let mut aggregate = OpOutcome::default();
        for operation in operations {
            let outcome = ops::apply(&mut candidate, operation, ids)?;
            extend_unique(&mut aggregate.created, outcome.created);
            extend_unique(&mut aggregate.changed, outcome.changed);
            extend_unique(&mut aggregate.removed, outcome.removed);
        }
        candidate.version = self.history.position() + 1;

        let transaction = self.history.record_applied_batch(
            (label, operations),
            &aggregate,
            &candidate,
            actor,
            now,
            ids,
        )?;
        crate::crash_point("journal-appended");
        storage::save(&candidate, &self.project_dir)?;
        self.document = candidate;
        Ok((aggregate, transaction))
    }

    /// Adds an imported asset to the document.
    ///
    /// Importing is not an operation: it changes the project directory rather
    /// than the layer tree, and it is not undoable — undoing a copy would
    /// mean deciding whether to delete the user's file. The asset entry is
    /// saved immediately, and the layer that references it goes through the
    /// operation layer as usual.
    /// Recording it as the state at this position is not optional. Undo
    /// rebuilds by replaying operations onto the nearest snapshot, and the
    /// layer that references this asset *is* an operation — so replaying it
    /// onto a snapshot taken before the import fails with a dangling
    /// reference, and undo stops working for the whole project. The same
    /// mechanism a hand edit uses, for the same reason: history has to be able
    /// to see every change to the document, even the ones it cannot reverse.
    pub fn register_asset(&mut self, asset: crate::Asset) -> Result<(), SessionError> {
        self.document.assets.push(asset);
        storage::save(&self.document, &self.project_dir)?;
        self.history.ensure_base(&self.document)?;
        let position = self.history.position();
        self.history.snapshot_at(position, &self.document)?;
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

fn extend_unique<T: PartialEq>(target: &mut Vec<T>, values: Vec<T>) {
    for value in values {
        if !target.contains(&value) {
            target.push(value);
        }
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    /// `LockContents` exactly as 1.4.0 declared it.
    ///
    /// Kept as a frozen copy rather than a version check: the compatibility
    /// claim is about the *bytes*, and the only honest way to test it is to
    /// hand an old reader a new file. If someone later adds
    /// `deny_unknown_fields` to the live struct, this still passes — which is
    /// why the matching forward test below exists too.
    #[derive(Debug, Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct LockContentsV140 {
        pid: u32,
        #[serde(default)]
        since: Option<u64>,
    }

    #[test]
    fn a_1_4_0_reader_ignores_the_host_field() {
        let written = r#"{"pid":1,"since":2,"host":"x"}"#;
        let old: LockContentsV140 = serde_json::from_str(written).unwrap();
        assert_eq!(old.pid, 1);
        assert_eq!(old.since, Some(2));
    }

    #[test]
    fn this_build_reads_a_1_4_0_lock() {
        let written = r#"{"pid":1,"since":2}"#;
        let lock: LockContents = serde_json::from_str(written).unwrap();
        assert_eq!(lock.pid, 1);
        assert_eq!(lock.since, Some(2));
        assert_eq!(lock.host, None, "an old lock claims no machine");
    }

    #[test]
    fn host_round_trips() {
        let lock = LockContents {
            pid: 7,
            since: Some(11),
            host: Some("some-machine".to_owned()),
        };
        let text = serde_json::to_string(&lock).unwrap();
        assert_eq!(text, r#"{"pid":7,"since":11,"host":"some-machine"}"#);

        let back: LockContents = serde_json::from_str(&text).unwrap();
        assert_eq!(back.pid, 7);
        assert_eq!(back.since, Some(11));
        assert_eq!(back.host.as_deref(), Some("some-machine"));
    }

    #[test]
    fn an_absent_host_is_not_written() {
        let text = serde_json::to_string(&LockContents {
            pid: 7,
            since: None,
            host: None,
        })
        .unwrap();
        assert_eq!(text, r#"{"pid":7}"#);
    }

    #[test]
    fn every_reclaim_outcome_is_one_flat_object_tagged_by_status() {
        assert_eq!(
            serde_json::to_string(&Reclaim::NotLocked).unwrap(),
            r#"{"status":"notLocked"}"#
        );
        assert_eq!(
            serde_json::to_string(&Reclaim::Reclaimed {
                pid: 3,
                host: "some-machine".to_owned(),
            })
            .unwrap(),
            r#"{"status":"reclaimed","pid":3,"host":"some-machine"}"#
        );
        assert_eq!(
            serde_json::to_string(&Reclaim::Held {
                pid: 3,
                host: None,
                reason: HeldReason::NoHost,
            })
            .unwrap(),
            r#"{"status":"held","pid":3,"host":null,"reason":"noHost"}"#
        );
    }

    #[test]
    fn every_held_reason_is_camel_case() {
        for (reason, expected) in [
            (HeldReason::NoHost, "\"noHost\""),
            (HeldReason::ForeignHost, "\"foreignHost\""),
            (HeldReason::Alive, "\"alive\""),
            (HeldReason::Unknown, "\"unknown\""),
        ] {
            assert_eq!(serde_json::to_string(&reason).unwrap(), expected);
        }
    }
}
