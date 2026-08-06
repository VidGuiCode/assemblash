//! Structured errors.
//!
//! NFR-4: an invalid document produces a typed, machine-readable error, never
//! a panic and never a bare string. Callers — including agents — need to know
//! *which* layer was wrong and *why*.

use crate::ids::{AssetId, LayerId};

/// One thing wrong with a document.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
#[non_exhaustive]
pub enum ValidationError {
    /// The document was written by a schema version this build cannot read.
    #[error("unsupported schemaVersion {found}: this build reads schemaVersion {supported}")]
    UnsupportedSchemaVersion {
        /// Version found in the document.
        found: u32,
        /// Version this build supports.
        supported: u32,
    },

    /// An id does not have the shape `<prefix>_<body>`.
    #[error("malformed id {id}: expected the form {expected}_<ulid>")]
    MalformedId {
        /// The offending id.
        id: String,
        /// Prefix that was expected.
        expected: &'static str,
    },

    /// Two layers share an id.
    #[error("duplicate layer id {id}")]
    DuplicateLayerId {
        /// The repeated id.
        id: LayerId,
    },

    /// Two assets share an id.
    #[error("duplicate asset id {id}")]
    DuplicateAssetId {
        /// The repeated id.
        id: AssetId,
    },

    /// A canvas dimension is zero, negative, or not a number.
    #[error("canvas {dimension} must be a positive finite number, got {value}")]
    InvalidCanvasDimension {
        /// `width` or `height`.
        dimension: &'static str,
        /// The offending value.
        value: f64,
    },

    /// A transform field is negative where it may not be, or not a number.
    #[error("layer {layer}: transform {field} is invalid ({value})")]
    InvalidTransform {
        /// The layer at fault.
        layer: LayerId,
        /// Which field.
        field: &'static str,
        /// The offending value.
        value: f64,
    },

    /// Opacity is outside 0..=1.
    #[error("layer {layer}: opacity must be between 0 and 1, got {value}")]
    InvalidOpacity {
        /// The layer at fault.
        layer: LayerId,
        /// The offending value.
        value: f64,
    },

    /// Two presets share a name, so one of them can never be applied.
    #[error("two presets are both named {name:?}")]
    DuplicatePreset {
        /// The name in question.
        name: String,
    },

    /// An effect's parameter is out of range or not a number.
    #[error("layer {layer}: effect {effect} — {field} must be {expected}, got {value}")]
    InvalidEffect {
        /// The layer at fault.
        layer: LayerId,
        /// Which effect in the stack, by its type name.
        effect: String,
        /// The parameter at fault.
        field: &'static str,
        /// What it has to be.
        expected: &'static str,
        /// The offending value.
        value: f64,
    },

    /// A font size is zero, negative, or not a number.
    #[error("layer {layer}: fontSize must be a positive finite number, got {value}")]
    InvalidFontSize {
        /// The layer at fault.
        layer: LayerId,
        /// The offending value.
        value: f64,
    },

    /// A line height is zero, negative, or not a number.
    #[error("layer {layer}: lineHeight must be a positive finite number, got {value}")]
    InvalidLineHeight {
        /// The layer at fault.
        layer: LayerId,
        /// The offending value.
        value: f64,
    },

    /// A colour is not `#rrggbb` or `#rrggbbaa`.
    #[error("{context}: invalid color {value}, expected #rrggbb or #rrggbbaa")]
    InvalidColor {
        /// Where the colour was found, e.g. `canvas background` or a layer id.
        context: String,
        /// The offending value.
        value: String,
    },

    /// An image layer points at an asset the document does not contain.
    #[error("layer {layer} references unknown asset {asset}")]
    DanglingAssetRef {
        /// The layer at fault.
        layer: LayerId,
        /// The asset it wanted.
        asset: AssetId,
    },

    /// An asset path is absolute, escapes the assets directory, or is empty.
    #[error("asset {asset}: path {path} must be a relative path inside assets/")]
    InvalidAssetPath {
        /// The asset at fault.
        asset: AssetId,
        /// The offending path.
        path: String,
    },

    /// An asset hash is not `sha256:<64 hex digits>`.
    #[error("asset {asset}: hash {hash} must be sha256:<hex>")]
    InvalidAssetHash {
        /// The asset at fault.
        asset: AssetId,
        /// The offending hash.
        hash: String,
    },
}

/// Every problem found in one validation pass.
///
/// Validation reports all errors rather than the first, so a caller fixing a
/// generated document does not have to iterate one message at a time.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
#[error("document is invalid ({} problem(s)): {}", .0.len(), format_errors(.0))]
pub struct ValidationErrors(Vec<ValidationError>);

impl ValidationErrors {
    /// Wraps a non-empty list of errors.
    pub fn new(errors: Vec<ValidationError>) -> Self {
        Self(errors)
    }

    /// The individual problems.
    pub fn errors(&self) -> &[ValidationError] {
        &self.0
    }

    /// Consumes the wrapper, returning the problems.
    pub fn into_inner(self) -> Vec<ValidationError> {
        self.0
    }
}

fn format_errors(errors: &[ValidationError]) -> String {
    errors
        .iter()
        .map(|e| e.to_string())
        .collect::<Vec<_>>()
        .join("; ")
}
