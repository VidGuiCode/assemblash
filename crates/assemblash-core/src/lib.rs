//! Assemblash core: the document model and the single operation layer.
//!
//! Every mutation of a document goes through this crate — the CLI, the HTTP
//! API, and the MCP server are transports over the same operations (PRD §7.2).
//!
//! ```
//! use assemblash_core::{ids::SequentialIdSource, validate, Document};
//!
//! let document = Document::new(&mut SequentialIdSource::new(), 1080.0, 1080.0);
//! validate(&document).expect("a fresh document is valid");
//! ```

pub mod document;
pub mod error;
pub mod history;
pub mod ids;
pub mod layout;
pub mod ops;
pub mod schema;
pub mod session;
pub mod storage;
pub mod svg_import;
pub mod typescript;
pub mod validate;
pub mod workspace;

pub use document::{
    Asset, BlendMode, Canvas, Color, Document, Extras, GroupLayer, ImageFit, ImageLayer, Layer,
    LayerKind, SvgLayer, TextAlign, TextLayer, Transform,
};
pub use error::{ValidationError, ValidationErrors};
pub use history::{Actor, ActorKind, History, HistoryError};
pub use ids::{AssetId, DocumentId, IdSource, LayerId, SequentialIdSource, UlidIdSource};
pub use layout::{bounding_box, find_overlaps, LayoutError, Rect};
pub use ops::{apply, dry_run, OpError, Operation};
pub use session::{Session, SessionError};
pub use storage::{load, save, StorageError};
pub use validate::validate;
pub use workspace::{ProjectId, Workspace, WorkspaceError};

/// Aborts the process if this build has fault injection enabled and the
/// environment names this point.
///
/// Crash recovery is only worth claiming if it has been watched happen, and a
/// test cannot reliably win a race against a millisecond-long write. Naming
/// the exact points where a crash is interesting — and letting a test ask for
/// one — turns "should recover" into "did recover".
///
/// Compiled out entirely unless the `fault-injection` feature is on, which no
/// release build enables.
#[inline]
pub fn crash_point(name: &str) {
    #[cfg(feature = "fault-injection")]
    {
        if std::env::var("ASSEMBLASH_CRASH_AT").as_deref() == Ok(name) {
            // abort, not exit: no unwinding, no destructors, no flushing —
            // the same thing a kill -9 or a power cut leaves behind.
            std::process::abort();
        }
    }
    #[cfg(not(feature = "fault-injection"))]
    {
        let _ = name;
    }
}

/// The document schema version this build reads and writes.
///
/// Independent of the release version. A breaking schema change bumps this
/// and ships a migration (PRD §16.1).
pub const SCHEMA_VERSION: u32 = 1;
