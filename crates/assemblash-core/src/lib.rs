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
pub mod ids;
pub mod schema;
pub mod validate;

pub use document::{
    Asset, BlendMode, Canvas, Color, Document, Extras, GroupLayer, ImageFit, ImageLayer, Layer,
    LayerKind, TextAlign, TextLayer, Transform,
};
pub use error::{ValidationError, ValidationErrors};
pub use ids::{AssetId, DocumentId, IdSource, LayerId, SequentialIdSource, UlidIdSource};
pub use validate::validate;

/// The document schema version this build reads and writes.
///
/// Independent of the release version. A breaking schema change bumps this
/// and ships a migration (PRD §16.1).
pub const SCHEMA_VERSION: u32 = 1;
