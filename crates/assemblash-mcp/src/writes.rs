//! The mutating half: arguments in, an `Operation` out, `Session::apply`.
//!
//! FR-13 asks four things of a mutating MCP tool — a dry run, an expected
//! document version, protected-layer checks, and an undo transaction id. All
//! four are implemented **once**, in [`Backend::apply`], and every tool goes
//! through it. Twenty tools each remembering to do four things is twenty
//! chances to forget one; one function is none.
//!
//! Nothing here decides whether a change is allowed. That is the operation
//! layer's job, and it already refuses protected layers for every mutation
//! whoever asks. This module's only responsibility is not to route around it.

use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::UlidIdSource;
use assemblash_core::{LayerId, Operation};
use assemblash_server::state::lock_project;
use assemblash_server::ApiError;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::backend::{now_millis, Backend};

/// Directory a project's exports go into.
pub const EXPORTS_DIR: &str = "exports";

/// What every mutating tool is told beyond its own arguments.
#[derive(Debug, Clone, Default, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct WriteEnvelope {
    /// Project to change. Omit to use the one `open_project` selected, or the
    /// single project this server holds.
    #[serde(default)]
    pub project: Option<String>,
    /// The document version this change was written against.
    ///
    /// If the document has moved on since it was read, the change is refused
    /// rather than overwriting work that was never seen.
    #[serde(default)]
    pub expected_version: Option<u64>,
    /// Report what would happen and change nothing.
    #[serde(default)]
    pub dry_run: bool,
    /// Who to record in the audit trail. Recorded as an agent either way.
    #[serde(default)]
    pub actor: Option<String>,
}

/// What every mutating tool reports.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct WriteOutcome {
    /// The document version after the change; unmoved for a dry run.
    pub version: u64,
    /// Whether this only reported what it would do.
    pub dry_run: bool,
    /// The transaction this change was recorded as. Absent for a dry run.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transaction: Option<String>,
    /// Layers created, in creation order.
    pub created: Vec<String>,
    /// Layers changed.
    pub changed: Vec<String>,
    /// Layers removed.
    pub removed: Vec<String>,
}

/// Where a document was exported to.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExportResult {
    /// Path inside the project, `/`-separated.
    pub path: String,
    /// Bytes written.
    pub bytes: usize,
    /// Pixel width.
    pub width: u32,
    /// Pixel height.
    pub height: u32,
}

/// Which project later calls should assume.
#[derive(Debug, Clone, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct OpenedProject {
    /// The project now in use.
    pub project: String,
    /// Its current version.
    pub version: u64,
    /// How many layers it has.
    pub layers: usize,
}

impl Backend {
    /// Applies one operation, with every safeguard a mutating tool owes.
    ///
    /// The single choke point. A tool that wanted to reach past it would have
    /// to grow its own `Session` handling, which is exactly what the
    /// protected-layer exit test exists to catch.
    pub fn apply(
        &self,
        envelope: &WriteEnvelope,
        operation: Operation,
    ) -> Result<WriteOutcome, ApiError> {
        let opened = self.open(envelope.project.as_deref())?;
        let mut session = lock_project(&opened)?;

        if envelope.dry_run {
            let outcome =
                session.dry_run(&operation, envelope.expected_version, &mut UlidIdSource)?;
            return Ok(WriteOutcome {
                version: session.version(),
                dry_run: true,
                transaction: None,
                created: ids(&outcome.created),
                changed: ids(&outcome.changed),
                removed: ids(&outcome.removed),
            });
        }

        let (outcome, transaction) = session.apply(
            &operation,
            &actor_of(envelope),
            now_millis(),
            envelope.expected_version,
            &mut UlidIdSource,
        )?;
        Ok(WriteOutcome {
            version: session.version(),
            dry_run: false,
            transaction: Some(transaction.to_string()),
            created: ids(&outcome.created),
            changed: ids(&outcome.changed),
            removed: ids(&outcome.removed),
        })
    }

    /// Steps history back one transaction.
    pub fn undo(&self, envelope: &WriteEnvelope) -> Result<WriteOutcome, ApiError> {
        self.history_step(envelope, true)
    }

    /// Steps history forward one transaction.
    pub fn redo(&self, envelope: &WriteEnvelope) -> Result<WriteOutcome, ApiError> {
        self.history_step(envelope, false)
    }

    fn history_step(
        &self,
        envelope: &WriteEnvelope,
        undoing: bool,
    ) -> Result<WriteOutcome, ApiError> {
        let opened = self.open(envelope.project.as_deref())?;
        let mut session = lock_project(&opened)?;

        if envelope.dry_run {
            // Where it would land is all there is to say, and working out the
            // rest would mean replaying the whole history to throw it away.
            return Ok(WriteOutcome {
                version: session.version(),
                dry_run: true,
                transaction: None,
                created: Vec::new(),
                changed: Vec::new(),
                removed: Vec::new(),
            });
        }

        let transaction = if undoing {
            session.undo(&actor_of(envelope), now_millis(), &mut UlidIdSource)?
        } else {
            session.redo(&actor_of(envelope), now_millis(), &mut UlidIdSource)?
        };
        Ok(WriteOutcome {
            version: session.version(),
            dry_run: false,
            transaction: Some(transaction.to_string()),
            created: Vec::new(),
            changed: Vec::new(),
            removed: Vec::new(),
        })
    }

    /// Renders a project to a PNG **inside the project**.
    ///
    /// The directory is chosen here, not by the caller, and the file name is
    /// checked. A tool that wrote wherever it was told would be unrestricted
    /// filesystem access wearing a friendly name, which FR-13 and PRD §10.1
    /// both rule out.
    pub fn export(
        &self,
        project: Option<&str>,
        scale: f32,
        name: Option<&str>,
    ) -> Result<ExportResult, ApiError> {
        let stem = match name {
            Some(name) => safe_stem(name)?,
            None => "export".to_owned(),
        };
        let preview = self.preview(project, scale)?;

        let opened = self.open(project)?;
        let session = lock_project(&opened)?;
        let directory = session.project_dir().join(EXPORTS_DIR);
        drop(session);

        let file = format!("{stem}.png");
        std::fs::create_dir_all(&directory).map_err(|source| {
            ApiError::from(assemblash_core::storage::StorageError::Io {
                operation: "creating",
                path: directory.clone(),
                source,
            })
        })?;
        let path = directory.join(&file);
        std::fs::write(&path, &preview.png).map_err(|source| {
            ApiError::from(assemblash_core::storage::StorageError::Io {
                operation: "writing",
                path: path.clone(),
                source,
            })
        })?;

        Ok(ExportResult {
            path: format!("{EXPORTS_DIR}/{file}"),
            bytes: preview.png.len(),
            width: preview.width,
            height: preview.height,
        })
    }

    /// Reads a project so a client can select it, and reports what it found.
    pub fn open_project(&self, project: &str) -> Result<OpenedProject, ApiError> {
        let state = self.document_state(Some(project))?;
        let mut layers = 0;
        state.document.walk_layers(&mut |_| layers += 1);
        Ok(OpenedProject {
            project: state.project,
            version: state.version,
            layers,
        })
    }
}

fn actor_of(envelope: &WriteEnvelope) -> Actor {
    // Always an agent: this is the MCP surface, and a transport claiming to be
    // a human would make the audit trail a fiction.
    match &envelope.actor {
        Some(name) => Actor::named(ActorKind::Agent, name),
        None => Actor::new(ActorKind::Agent),
    }
}

fn ids(layers: &[LayerId]) -> Vec<String> {
    layers.iter().map(ToString::to_string).collect()
}

/// A file stem a caller may choose, with anything path-shaped refused.
fn safe_stem(name: &str) -> Result<String, ApiError> {
    let trimmed = name.trim();
    let usable = !trimmed.is_empty()
        && trimmed.len() <= 60
        && !trimmed.starts_with('.')
        && trimmed
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'));
    if usable {
        Ok(trimmed.to_owned())
    } else {
        Err(ApiError::new(
            assemblash_server::StatusCode::BAD_REQUEST,
            "invalidExportName",
            format!(
                "{name:?} is not a usable export name: letters, digits, hyphens, \
                 and underscores only"
            ),
        ))
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn an_export_name_is_a_name_and_never_a_path() {
        for good in ["poster", "poster-2", "final_v3", "A1"] {
            assert!(safe_stem(good).is_ok(), "{good}");
        }
        for bad in [
            "",
            "..",
            ".hidden",
            "a/b",
            "a\\b",
            "../../evil",
            "C:evil",
            "with space",
            "nul\0",
        ] {
            assert!(safe_stem(bad).is_err(), "{bad:?} should have been refused");
        }
    }
}
