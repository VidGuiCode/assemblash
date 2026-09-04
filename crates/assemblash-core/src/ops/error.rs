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

    /// A blend mode was set that this build does not render.
    ///
    /// Refused on the way in rather than stored and discovered at render
    /// time: a document that saves cleanly and then cannot be drawn is the
    /// worst place to find out.
    #[error(
        "layer {id}: blend mode {mode:?} is not one this build renders; available: {available}"
    )]
    UnsupportedBlendMode {
        /// The layer in question.
        id: LayerId,
        /// The mode that was asked for.
        mode: String,
        /// The modes that would have worked.
        available: String,
    },

    /// An effect was set whose type this build does not render.
    #[error("layer {id}: effect {effect:?} is not one this build renders")]
    UnsupportedEffect {
        /// The layer in question.
        id: LayerId,
        /// The effect type that was asked for.
        effect: String,
    },

    /// No slot of that name is in the document.
    #[error("no slot named {name:?}; this document has: {available}")]
    NoSuchSlot {
        /// The name that was asked for.
        name: String,
        /// What it does have.
        available: String,
    },

    /// A slot was defined that could never be usefully filled.
    #[error("slot {name:?} is not usable: {reason}")]
    InvalidSlot {
        /// The slot at fault.
        name: String,
        /// What is wrong with it.
        reason: &'static str,
    },

    /// A slot's kind does not match the layer it points at.
    #[error("slot {name:?} is a {wants} slot but layer {id} is a {found} layer")]
    SlotKindMismatch {
        /// The slot at fault.
        name: String,
        /// What the slot needs the layer to be.
        wants: &'static str,
        /// The layer it names.
        id: LayerId,
        /// What that layer actually is.
        found: &'static str,
    },

    /// A layer cannot be deleted while a slot offers it.
    #[error("layer {id} is offered by slot(s) {slots}; remove them first")]
    LayerIsSlotTarget {
        /// The layer somebody tried to delete.
        id: LayerId,
        /// The slots in the way.
        slots: String,
    },

    /// No preset of that name is in the document.
    #[error("no preset named {name:?}; this document has: {available}")]
    NoSuchPreset {
        /// The name that was asked for.
        name: String,
        /// What it does have.
        available: String,
    },

    /// A preset was defined that could never be usefully applied.
    #[error("preset {name:?} is not usable: {reason}")]
    InvalidPreset {
        /// The preset at fault.
        name: String,
        /// What is wrong with it.
        reason: &'static str,
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

    /// The layer is protected: agents and adapters may not change it, and
    /// there is no override (PRD §10.2).
    #[error("layer {id} is protected and cannot be modified")]
    LayerProtected {
        /// The protected layer.
        id: LayerId,
    },

    /// The layer is read-only: inspectable, but never mutable through the
    /// operation layer.
    #[error("layer {id} is read-only")]
    LayerReadOnly {
        /// The read-only layer.
        id: LayerId,
    },

    /// A layer was asked to be moved inside itself or its own descendant.
    #[error("layer {id} cannot be placed inside itself")]
    WouldCycle {
        /// The layer being moved.
        id: LayerId,
    },

    /// Grouping was asked for with layers that do not share a parent.
    #[error("layers must share a parent to be grouped: {ids}")]
    NotSiblings {
        /// The ids that were asked for, comma separated.
        ids: String,
    },

    /// Ungrouping would change what the picture looks like.
    #[error("group {id} has {property} applied, so ungrouping would change the image")]
    UngroupWouldChangeAppearance {
        /// The group in question.
        id: LayerId,
        /// What is in the way — `rotation` or `opacity`.
        property: &'static str,
    },

    /// An operation was given an empty list of layers.
    #[error("{operation} needs at least one layer")]
    NothingToDo {
        /// The operation that was asked for.
        operation: &'static str,
    },

    /// A property was sent that the operation does not have.
    ///
    /// Refused rather than ignored, because ignoring it is a false success:
    /// the caller is told the layer changed, the version moves, and the
    /// journal records an edit with nothing in it. A client that misspells a
    /// property should hear about it from the engine, not from a picture that
    /// never changed.
    #[error("unknown property {property:?} on {} {op} operation", article(op))]
    UnknownProperty {
        /// The operation it was sent on — `create` or `update`.
        op: &'static str,
        /// The property that is not one this operation has.
        property: String,
    },

    /// A layout question could not be answered.
    #[error(transparent)]
    Layout(#[from] crate::layout::LayoutError),

    /// The result would not have been a valid document.
    #[error(transparent)]
    Invalid(#[from] ValidationErrors),
}

/// The indefinite article that reads correctly before `word`.
///
/// Two operations reach [`OpError::UnknownProperty`] and they need different
/// articles — "an update", "a create" — so the message picks rather than
/// settling for a wooden "on operation update".
fn article(word: &str) -> &'static str {
    if word.starts_with(['a', 'e', 'i', 'o', 'u']) {
        "an"
    } else {
        "a"
    }
}
