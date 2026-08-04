//! History: an append-only journal, periodic snapshots, and undo.
//!
//! The journal is `history/journal.jsonl` — one JSON object per line, never
//! rewritten. That shape is deliberate (PRD §10.5): it is the audit trail, so
//! it must be greppable by a human, appendable without rewriting anything a
//! crash could truncate, and impossible for a later edit to quietly revise.
//!
//! # Positions, not line numbers
//!
//! Every entry records the *logical position* of the document after it: 1
//! after the first operation, 2 after the second. Undo moves the position
//! back; a new operation after an undo writes the position it replaces. So a
//! position can appear twice in the file, and **the last entry wins** — the
//! earlier one stays as history of what was undone.
//!
//! The current position is the position of the last entry. The furthest
//! position that can be redone to is the position of the last *applied*
//! entry, which is why a new operation after an undo makes the old redo tail
//! unreachable without anything being deleted.
//!
//! # Undo is replay, not inversion
//!
//! Rebuilding a state means taking the nearest snapshot at or before it and
//! replaying operations forward. Inverse operations would be cheaper and
//! would drift; the exit test for this milestone is that undo produces a
//! byte-identical document, and replay is the only way to promise that.

use std::collections::BTreeMap;
use std::io::Write as _;
use std::path::{Path, PathBuf};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::Document;
use crate::ids::{IdSource, TransactionId};
use crate::ops::{OpError, OpOutcome, Operation};

/// Directory holding history, inside a project.
pub const HISTORY_DIR: &str = "history";

/// The append-only journal file, inside [`HISTORY_DIR`].
pub const JOURNAL_FILE: &str = "journal.jsonl";

/// Directory of snapshots, inside [`HISTORY_DIR`].
pub const SNAPSHOTS_DIR: &str = "snapshots";

/// How many operations may pass before a snapshot is written.
///
/// Replay is fast and documents are small, so this trades a little disk for a
/// bounded rebuild.
const SNAPSHOT_INTERVAL: u64 = 20;

/// Who performed a mutation (PRD §10.5).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum ActorKind {
    /// A person, working directly.
    Human,
    /// An AI agent, usually over MCP.
    Agent,
    /// An automated script or batch job.
    Script,
    /// A provider or downstream adapter.
    Adapter,
}

/// Who performed a mutation, and optionally which one.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Actor {
    /// The kind of actor.
    pub kind: ActorKind,
    /// Which one, when the caller knows: a client name, a script name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

impl Actor {
    /// An actor of the given kind, unnamed.
    pub fn new(kind: ActorKind) -> Self {
        Self { kind, detail: None }
    }

    /// An actor of the given kind, named.
    pub fn named(kind: ActorKind, detail: impl Into<String>) -> Self {
        Self {
            kind,
            detail: Some(detail.into()),
        }
    }
}

/// What one journal entry records.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "kind", rename_all = "camelCase")]
#[non_exhaustive]
pub enum EntryKind {
    /// An operation was applied.
    Applied {
        /// What was asked for.
        ///
        /// Boxed because a create operation carries a whole layer request,
        /// which would otherwise make every undo entry as large as the
        /// largest operation.
        operation: Box<Operation>,
        /// What it did.
        outcome: OpOutcome,
    },
    /// The document was moved back to an earlier position.
    Undone {
        /// The transaction that was undone.
        ///
        /// Named `target` rather than `transaction` because this variant is
        /// flattened into [`JournalEntry`], which has a `transaction` of its
        /// own — two fields of the same name would write a duplicate key and
        /// make the line unreadable.
        target: TransactionId,
    },
    /// The document was moved forward again.
    Redone {
        /// The transaction that was redone. See [`EntryKind::Undone`] for why
        /// it is not called `transaction`.
        target: TransactionId,
    },
}

/// One line of the journal.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntry {
    /// Id of this transaction, so a write can be undone by id (FR-13).
    pub transaction: TransactionId,
    /// Logical position of the document after this entry.
    pub position: u64,
    /// Who did it (PRD §10.5).
    pub actor: Actor,
    /// When, in milliseconds since the Unix epoch, if the caller recorded it.
    ///
    /// Supplied by the caller rather than read from a clock here: the same
    /// reason the renderer takes its timestamp as an argument, so that a test
    /// can produce the same journal twice.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub recorded_at: Option<u64>,
    /// What happened.
    #[serde(flatten)]
    pub kind: EntryKind,
}

impl JournalEntry {
    /// The operation, if this entry applied one.
    pub fn operation(&self) -> Option<&Operation> {
        match &self.kind {
            EntryKind::Applied { operation, .. } => Some(operation),
            _ => None,
        }
    }
}

/// Something that went wrong reading or writing history.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum HistoryError {
    /// A history file could not be read or written.
    #[error("{operation} {path}: {source}")]
    Io {
        /// What was being attempted.
        operation: &'static str,
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },

    /// A journal line that is not the last one is unreadable.
    ///
    /// The last line is allowed to be a fragment — that is what a crash
    /// during an append looks like, and it is recovered from. A broken line
    /// in the middle means the file was damaged some other way, and guessing
    /// would be worse than stopping.
    #[error("{path} line {line} is corrupt: {source}")]
    CorruptJournal {
        /// File involved.
        path: PathBuf,
        /// 1-based line number.
        line: usize,
        /// Underlying cause.
        source: serde_json::Error,
    },

    /// A snapshot file could not be read.
    #[error("snapshot {path} is unreadable: {source}")]
    CorruptSnapshot {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: serde_json::Error,
    },

    /// History refers to a position with no snapshot at or before it.
    #[error("cannot rebuild position {position}: no snapshot at or before it")]
    NoBaseSnapshot {
        /// The position that was asked for.
        position: u64,
    },

    /// Replaying a recorded operation failed.
    ///
    /// This means the journal and the snapshots disagree, which is a bug or a
    /// damaged project — not something a caller did wrong.
    #[error("replaying transaction {transaction} failed: {source}")]
    ReplayFailed {
        /// The entry that would not replay.
        transaction: TransactionId,
        /// Why.
        source: OpError,
    },

    /// There is nothing to undo.
    #[error("nothing to undo")]
    NothingToUndo,

    /// There is nothing to redo.
    #[error("nothing to redo")]
    NothingToRedo,
}

impl HistoryError {
    fn io(operation: &'static str, path: impl Into<PathBuf>, source: std::io::Error) -> Self {
        Self::Io {
            operation,
            path: path.into(),
            source,
        }
    }
}

/// The history of one project.
#[derive(Debug)]
pub struct History {
    dir: PathBuf,
    entries: Vec<JournalEntry>,
}

impl History {
    /// Opens, or starts, the history of a project.
    ///
    /// A project with no history directory — one written by an older build —
    /// opens with an empty history rather than failing.
    pub fn open(project_dir: &Path) -> Result<Self, HistoryError> {
        let dir = project_dir.join(HISTORY_DIR);
        let entries = read_journal(&dir.join(JOURNAL_FILE))?;
        Ok(Self { dir, entries })
    }

    /// Every entry, in the order they were written.
    pub fn entries(&self) -> &[JournalEntry] {
        &self.entries
    }

    /// Logical position of the document as history has it.
    pub fn position(&self) -> u64 {
        self.entries.last().map_or(0, |entry| entry.position)
    }

    /// The furthest position that could be redone to.
    ///
    /// The last *applied* entry, which is why an operation applied after an
    /// undo puts the old redo tail out of reach without deleting anything.
    pub fn head(&self) -> u64 {
        self.entries
            .iter()
            .rev()
            .find(|entry| matches!(entry.kind, EntryKind::Applied { .. }))
            .map_or(0, |entry| entry.position)
    }

    /// Whether there is anything to undo.
    pub fn can_undo(&self) -> bool {
        self.position() > 0
    }

    /// Whether there is anything to redo.
    pub fn can_redo(&self) -> bool {
        self.position() < self.head()
    }

    /// The entry that produced the current position, if any.
    pub fn current_transaction(&self) -> Option<&JournalEntry> {
        self.effective(self.position())
    }

    /// The last applied entry at a position — later entries replace earlier
    /// ones, which is how a branch after an undo works.
    fn effective(&self, position: u64) -> Option<&JournalEntry> {
        self.entries
            .iter()
            .rev()
            .find(|entry| entry.position == position && entry.operation().is_some())
    }

    /// Records that an operation was applied, and snapshots when due.
    pub fn record_applied(
        &mut self,
        operation: &Operation,
        outcome: &OpOutcome,
        document: &Document,
        actor: &Actor,
        recorded_at: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<TransactionId, HistoryError> {
        let position = self.position() + 1;
        let transaction = TransactionId::generate(ids);
        let entry = JournalEntry {
            transaction: transaction.clone(),
            position,
            actor: actor.clone(),
            recorded_at,
            kind: EntryKind::Applied {
                operation: Box::new(operation.clone()),
                outcome: outcome.clone(),
            },
        };
        self.append(entry)?;

        // Snapshot on the interval, and always at position 1, so a rebuild
        // never has to start from nothing.
        if position == 1 || position.is_multiple_of(SNAPSHOT_INTERVAL) {
            self.write_snapshot(position, document)?;
        }
        Ok(transaction)
    }

    /// Records the state a project starts from.
    pub fn record_base(&mut self, document: &Document) -> Result<(), HistoryError> {
        self.write_snapshot(0, document)
    }

    /// Moves back one position, returning the rebuilt document.
    pub fn undo(
        &mut self,
        actor: &Actor,
        recorded_at: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<(Document, TransactionId), HistoryError> {
        if !self.can_undo() {
            return Err(HistoryError::NothingToUndo);
        }
        let current = self.position();
        let undone = self
            .effective(current)
            .map(|entry| entry.transaction.clone())
            .unwrap_or_else(|| TransactionId::new("txn_unknown"));

        let target = current - 1;
        let document = self.rebuild(target)?;

        let transaction = TransactionId::generate(ids);
        self.append(JournalEntry {
            transaction: transaction.clone(),
            position: target,
            actor: actor.clone(),
            recorded_at,
            kind: EntryKind::Undone { target: undone },
        })?;
        // Snapshot every undo and redo: it costs one small file and means a
        // rebuild never has to reason about what an undo entry meant.
        self.write_snapshot(target, &document)?;
        Ok((document, transaction))
    }

    /// Moves forward one position, returning the rebuilt document.
    pub fn redo(
        &mut self,
        actor: &Actor,
        recorded_at: Option<u64>,
        ids: &mut dyn IdSource,
    ) -> Result<(Document, TransactionId), HistoryError> {
        if !self.can_redo() {
            return Err(HistoryError::NothingToRedo);
        }
        let target = self.position() + 1;
        let document = self.rebuild(target)?;
        let redone = self
            .effective(target)
            .map(|entry| entry.transaction.clone())
            .unwrap_or_else(|| TransactionId::new("txn_unknown"));

        let transaction = TransactionId::generate(ids);
        self.append(JournalEntry {
            transaction: transaction.clone(),
            position: target,
            actor: actor.clone(),
            recorded_at,
            kind: EntryKind::Redone { target: redone },
        })?;
        self.write_snapshot(target, &document)?;
        Ok((document, transaction))
    }

    /// Rebuilds the document as it was at a position.
    pub fn rebuild(&self, position: u64) -> Result<Document, HistoryError> {
        let snapshots = self.snapshots()?;
        let (base_position, path) = snapshots
            .range(..=position)
            .next_back()
            .ok_or(HistoryError::NoBaseSnapshot { position })?;

        let text = std::fs::read_to_string(path)
            .map_err(|source| HistoryError::io("reading", path, source))?;
        let mut document: Document =
            serde_json::from_str(&text).map_err(|source| HistoryError::CorruptSnapshot {
                path: path.clone(),
                source,
            })?;

        for step in (base_position + 1)..=position {
            let Some(entry) = self.effective(step) else {
                continue;
            };
            let Some(operation) = entry.operation() else {
                continue;
            };
            // Replayed with the ids the journal recorded, not fresh ones: a
            // rebuilt document has to equal the original byte for byte, and
            // newly minted ids would defeat that before anything else did.
            let mut ids = ReplayIds::from_outcome(entry);
            crate::ops::apply(&mut document, operation, &mut ids).map_err(|source| {
                HistoryError::ReplayFailed {
                    transaction: entry.transaction.clone(),
                    source,
                }
            })?;
        }

        document.version = position;
        Ok(document)
    }

    fn append(&mut self, entry: JournalEntry) -> Result<(), HistoryError> {
        let path = self.dir.join(JOURNAL_FILE);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|source| HistoryError::io("creating", parent, source))?;
        }
        let mut line = serde_json::to_string(&entry).unwrap_or_default();
        line.push('\n');

        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .map_err(|source| HistoryError::io("opening", &path, source))?;
        file.write_all(line.as_bytes())
            .map_err(|source| HistoryError::io("appending to", &path, source))?;
        // Flushed to disk before the caller is told it happened: a journal
        // that lives only in the page cache is not an audit trail.
        file.sync_all()
            .map_err(|source| HistoryError::io("flushing", &path, source))?;

        self.entries.push(entry);
        Ok(())
    }

    fn write_snapshot(&self, position: u64, document: &Document) -> Result<(), HistoryError> {
        let dir = self.dir.join(SNAPSHOTS_DIR);
        std::fs::create_dir_all(&dir)
            .map_err(|source| HistoryError::io("creating", &dir, source))?;
        let path = dir.join(format!("{position:012}.json"));

        let mut json = serde_json::to_string(document).unwrap_or_default();
        json.push('\n');

        let temporary = path.with_extension("json.tmp");
        std::fs::write(&temporary, json)
            .map_err(|source| HistoryError::io("writing", &temporary, source))?;
        std::fs::rename(&temporary, &path)
            .map_err(|source| HistoryError::io("replacing", &path, source))?;
        Ok(())
    }

    fn snapshots(&self) -> Result<BTreeMap<u64, PathBuf>, HistoryError> {
        let dir = self.dir.join(SNAPSHOTS_DIR);
        let mut found = BTreeMap::new();
        let entries = match std::fs::read_dir(&dir) {
            Ok(entries) => entries,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(found),
            Err(source) => return Err(HistoryError::io("reading", &dir, source)),
        };
        for entry in entries {
            let entry = entry.map_err(|source| HistoryError::io("reading", &dir, source))?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("json") {
                continue;
            }
            let Some(position) = path
                .file_stem()
                .and_then(|stem| stem.to_str())
                .and_then(|stem| stem.parse::<u64>().ok())
            else {
                continue;
            };
            found.insert(position, path);
        }
        Ok(found)
    }
}

/// Hands back the ids an operation minted the first time it ran.
///
/// Replay has to reproduce them exactly. If it minted new ones, a rebuilt
/// document would differ from the original in every id, and undo could never
/// be byte-identical.
#[derive(Debug)]
struct ReplayIds {
    bodies: std::vec::IntoIter<String>,
}

impl ReplayIds {
    fn from_outcome(entry: &JournalEntry) -> Self {
        let bodies = match &entry.kind {
            EntryKind::Applied { outcome, .. } => outcome
                .created
                .iter()
                .map(|id| {
                    id.as_str()
                        .split_once('_')
                        .map_or_else(|| id.to_string(), |(_, body)| body.to_owned())
                })
                .collect::<Vec<_>>(),
            _ => Vec::new(),
        };
        Self {
            bodies: bodies.into_iter(),
        }
    }
}

impl IdSource for ReplayIds {
    fn next_raw(&mut self) -> String {
        // Running out means the journal and the operation disagree about how
        // many layers were created. Returning a placeholder makes the rebuild
        // fail validation with a duplicate id, which is reported as
        // `ReplayFailed` — better than panicking inside a replay.
        self.bodies
            .next()
            .unwrap_or_else(|| "replay-id-exhausted".to_owned())
    }
}

/// Reads a journal, tolerating a truncated last line.
fn read_journal(path: &Path) -> Result<Vec<JournalEntry>, HistoryError> {
    let text = match std::fs::read_to_string(path) {
        Ok(text) => text,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(source) => return Err(HistoryError::io("reading", path, source)),
    };

    let lines: Vec<&str> = text.lines().collect();
    let mut entries = Vec::with_capacity(lines.len());
    let ends_cleanly = text.ends_with('\n');

    for (index, line) in lines.iter().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        match serde_json::from_str::<JournalEntry>(line) {
            Ok(entry) => entries.push(entry),
            Err(source) => {
                let is_last = index + 1 == lines.len();
                // A half-written last line is what a crash mid-append looks
                // like. Dropping it takes the project back to the state
                // before that operation, which is consistent with everything
                // else on disk. Anywhere else, the file is damaged.
                if is_last && !ends_cleanly {
                    break;
                }
                return Err(HistoryError::CorruptJournal {
                    path: path.to_path_buf(),
                    line: index + 1,
                    source,
                });
            }
        }
    }
    Ok(entries)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    #[test]
    fn a_missing_journal_reads_as_empty() {
        let dir = tempfile::tempdir().unwrap();
        let history = History::open(dir.path()).unwrap();
        assert_eq!(history.position(), 0);
        assert!(!history.can_undo());
        assert!(!history.can_redo());
    }

    #[test]
    fn a_truncated_last_line_is_dropped_not_fatal() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(HISTORY_DIR).join(JOURNAL_FILE);
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();

        let good = serde_json::json!({
            "transaction": "txn_1",
            "position": 1,
            "actor": { "kind": "human" },
            "kind": "undone",
            "transactionUndone": "txn_0"
        });
        let _ = good;
        // Build a real entry so the shape is whatever the type actually
        // serialises to.
        let entry = JournalEntry {
            transaction: TransactionId::new("txn_1"),
            position: 1,
            actor: Actor::new(ActorKind::Human),
            recorded_at: None,
            kind: EntryKind::Undone {
                target: TransactionId::new("txn_0"),
            },
        };
        let mut text = serde_json::to_string(&entry).unwrap();
        text.push('\n');
        text.push_str("{\"transaction\":\"txn_2\",\"posi");
        std::fs::write(&path, text).unwrap();

        let history = History::open(dir.path()).unwrap();
        assert_eq!(history.entries().len(), 1);
        assert_eq!(history.position(), 1);
    }

    #[test]
    fn a_corrupt_line_in_the_middle_is_an_error() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(HISTORY_DIR).join(JOURNAL_FILE);
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, "not json\n{\"also\":\"not an entry\"}\n").unwrap();

        assert!(matches!(
            History::open(dir.path()),
            Err(HistoryError::CorruptJournal { line: 1, .. })
        ));
    }
}
