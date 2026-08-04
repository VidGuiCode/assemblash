//! Errors the operation layer returns.
//!
//! Every one of these names the layer at fault, because the caller is often a
//! program — an agent applying a batch of edits needs to know which one to
//! retry, not that "something was wrong".

use crate::ids::{AssetId, LayerId};
use crate::ValidationErrors;

/// Why an operation was refused.
///
/// A refused operation changes nothing: the document is exactly as it was.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
#[non_exhaustive]
pub enum OpError {
    /// No layer with that id exists in the document.
    #[error("no layer {id} in this document")]
    NoSuchLayer {
        /// The id that was asked for.
        id: LayerId,
    },

    /// A layer was addressed as a container but is not a group.
    #[error("layer {id} is not a group, so nothing can be placed inside it")]
    NotAGroup {
        /// The layer in question.
        id: LayerId,
    },

    /// The layer is locked and the operation did not say to override that.
    #[error("layer {id} is locked")]
    LayerLocked {
        /// The locked layer.
        id: LayerId,
    },

    /// An insertion index is past the end of the list it addresses.
    #[error("index {index} is out of range: there are {length} layers here")]
    IndexOutOfRange {
        /// Index that was asked for.
        index: usize,
        /// How many layers are actually there.
        length: usize,
    },

    /// An image layer referenced an asset the document does not have.
    #[error("no asset {asset} in this document")]
    NoSuchAsset {
        /// The asset that was asked for.
        asset: AssetId,
    },

    /// A property was set that does not exist on that kind of layer.
    #[error("layer {id} is a {actual} layer, so {property} cannot be set on it")]
    WrongLayerKind {
        /// The layer in question.
        id: LayerId,
        /// What kind it actually is.
        actual: &'static str,
        /// The property that does not apply.
        property: &'static str,
    },

    /// The result would not have been a valid document.
    #[error(transparent)]
    Invalid(#[from] ValidationErrors),
}
