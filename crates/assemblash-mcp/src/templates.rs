//! Templates over MCP: filling slots, and rendering variants.
//!
//! Both go through the same places everything else does. Filling is a batch of
//! ordinary `Update` operations applied through `Session::apply`, so a slot
//! pointing at a protected layer refuses exactly where every other route to it
//! refuses. Rendering variants never touches the project at all.

use assemblash_server::ApiError;

use crate::backend::Backend;
use crate::writes::{WriteEnvelope, WriteOutcome};

impl Backend {
    /// What a template offers to be filled.
    pub fn slots(&self, project: Option<&str>) -> Result<crate::backend::SlotList, ApiError> {
        let state = self.document_state(project)?;
        Ok(crate::backend::SlotList {
            is_template: !state.document.slots.is_empty(),
            slots: state.document.slots.clone(),
        })
    }

    /// Fills a template's slots in the project, as one change per slot.
    ///
    /// Every operation goes through the one choke point, so the whole
    /// safeguard set applies: dry run, expected version, protected layers, and
    /// a transaction id per change. The result reports the last one, which is
    /// what undo steps back through.
    pub fn fill_template(
        &self,
        envelope: &WriteEnvelope,
        values: &assemblash_core::SlotValues,
    ) -> Result<WriteOutcome, ApiError> {
        let state = self.document_state(envelope.project.as_deref())?;
        let operations = assemblash_core::templates::fill_operations(&state.document, values)
            .map_err(|error| {
                ApiError::new(
                    assemblash_server::StatusCode::UNPROCESSABLE_ENTITY,
                    "templateRefused",
                    error.to_string(),
                )
            })?;

        let mut outcome = WriteOutcome {
            version: state.version,
            dry_run: envelope.dry_run,
            transaction: None,
            created: Vec::new(),
            changed: Vec::new(),
            removed: Vec::new(),
        };
        for operation in operations {
            // Each is applied on its own, so a refusal — a protected layer,
            // say — stops the batch with everything before it already
            // recorded and undoable, rather than half-applying invisibly.
            let step = self.apply(envelope, operation)?;
            outcome.version = step.version;
            outcome.transaction = step.transaction.or(outcome.transaction);
            outcome.changed.extend(step.changed);
        }
        Ok(outcome)
    }

    /// Renders a template once per set of values, leaving it untouched.
    pub fn render_variants(
        &self,
        project: Option<&str>,
        scale: f32,
        variants: &[assemblash_server::render::Variant],
    ) -> Result<assemblash_server::render::RenderedVariants, ApiError> {
        let opened = self.open(project)?;
        let session = assemblash_server::state::lock_project(&opened)?;
        let document = session.document().clone();
        let directory = session.project_dir().to_path_buf();
        drop(session);

        assemblash_server::render::render_variants(
            &document,
            &directory,
            &self.font_store()?,
            scale,
            variants,
        )
    }
}
