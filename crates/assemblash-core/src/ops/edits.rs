//! The tree-shaped operations: duplicate, reorder, group, ungroup, and the
//! transform edits.
//!
//! These are the ones that can corrupt a document if they are careless — an
//! orphaned subtree, a duplicated id, a layer inside itself — so they live
//! together and are property-tested together.

use crate::document::{Extras, GroupLayer, Layer, LayerKind, Transform};
use crate::ids::{IdSource, LayerId};
use crate::ops::error::OpError;
use crate::ops::requests::LayerPosition;
use crate::ops::{tree, OpOutcome};
use crate::Document;

/// Shared body of move, resize, and rotate: find the layer, refuse if locked,
/// then edit its transform.
pub(super) fn transform(
    document: &mut Document,
    id: &LayerId,
    edit: impl FnOnce(&mut Transform),
) -> Result<OpOutcome, OpError> {
    super::ensure_mutable(document, id, false)?;
    let layer =
        tree::find_mut(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    edit(&mut layer.transform);
    Ok(OpOutcome::changed(id.clone()))
}

/// Copies a layer and everything inside it, placing the copy directly above
/// the original.
pub(super) fn duplicate(
    document: &mut Document,
    id: &LayerId,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, OpError> {
    let mut copy = tree::find(document, id)
        .ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?
        .clone();

    // Every layer in the copied subtree needs its own id: sharing one would
    // be an invalid document, and the caller has to be able to address the
    // copy afterwards.
    let mut created = Vec::new();
    tree::reassign_ids(&mut copy, ids, &mut created);

    let position = tree::position_above(document, id)?;
    tree::insert(document, &position, copy)?;
    Ok(OpOutcome {
        created,
        removed: Vec::new(),
        changed: Vec::new(),
    })
}

/// Moves a layer elsewhere in the tree: another parent, another z-position,
/// or both.
pub(super) fn reorder(
    document: &mut Document,
    id: &LayerId,
    to: &LayerPosition,
) -> Result<OpOutcome, OpError> {
    super::ensure_mutable(document, id, false)?;

    if let LayerPosition::In { parent, .. } = to {
        // A layer inside itself is a tree with a loop in it — unrepresentable
        // in the document model, and an infinite render if it ever got made.
        if parent == id || tree::is_descendant(document, id, parent) {
            return Err(OpError::WouldCycle { id: id.clone() });
        }
    }

    let layer =
        tree::remove(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    tree::insert(document, to, layer)?;
    Ok(OpOutcome::changed(id.clone()))
}

/// Wraps sibling layers in a new group, keeping the picture unchanged.
pub(super) fn group(
    document: &mut Document,
    members: &[LayerId],
    name: Option<String>,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, OpError> {
    if members.is_empty() {
        return Err(OpError::NothingToDo { operation: "group" });
    }
    for id in members {
        super::ensure_mutable(document, id, false)?;
    }

    let parent = tree::common_parent(document, members)?;
    let index = tree::index_of(document, &parent, &members[0]);

    let mut children = Vec::new();
    for id in members {
        children.push(
            tree::remove(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?,
        );
    }

    // The group's box is the bounding box of what it holds, and the children
    // are re-based onto it, so grouping does not move anything on the canvas.
    // Rotated children are boxed by the extent they actually occupy — the
    // unrotated approximation this used to make was noted as v0.4 work.
    let bounds = tree::bounding_box(&children);
    for child in &mut children {
        child.transform.x -= bounds.x;
        child.transform.y -= bounds.y;
    }

    let mut container = Layer::new(
        LayerId::generate(ids),
        Transform::new(bounds.x, bounds.y, bounds.width, bounds.height),
        LayerKind::Group(GroupLayer {
            children,
            extra: Extras::new(),
        }),
    );
    container.name = name;
    let container_id = container.id.clone();

    tree::insert(document, &tree::position_in(parent, index), container)?;
    Ok(OpOutcome::created(container_id))
}

/// Replaces a group with its children, in place.
///
/// Children are moved back into the parent's coordinate space, so the picture
/// does not change. Positions return to within a billionth of a pixel rather
/// than bit-exactly: rebasing subtracts the group's origin and this adds it
/// back, and floating-point addition does not always undo subtraction
/// exactly. It is still deterministic — the same edits always produce the
/// same numbers.
pub(super) fn ungroup(document: &mut Document, id: &LayerId) -> Result<OpOutcome, OpError> {
    super::ensure_mutable(document, id, false)?;
    let layer = tree::find(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    if !matches!(layer.kind, LayerKind::Group(_)) {
        return Err(OpError::NotAGroup { id: id.clone() });
    }
    // Rotation and opacity on a group apply to its children as a unit and
    // cannot be pushed down onto them without changing the image. Refusing is
    // honest; quietly producing a different picture is not.
    if layer.transform.rotation != 0.0 {
        return Err(OpError::UngroupWouldChangeAppearance {
            id: id.clone(),
            property: "rotation",
        });
    }
    if layer.opacity != 1.0 {
        return Err(OpError::UngroupWouldChangeAppearance {
            id: id.clone(),
            property: "opacity",
        });
    }

    let parent = tree::parent_of(document, id);
    let index = tree::index_of(document, &parent, id);
    let removed =
        tree::remove(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    let LayerKind::Group(group) = removed.kind else {
        return Err(OpError::NotAGroup { id: id.clone() });
    };

    let mut changed = Vec::new();
    for (offset, mut child) in group.children.into_iter().enumerate() {
        child.transform.x += removed.transform.x;
        child.transform.y += removed.transform.y;
        changed.push(child.id.clone());
        tree::insert(
            document,
            &tree::position_in(parent.clone(), index + offset),
            child,
        )?;
    }

    Ok(OpOutcome {
        created: Vec::new(),
        removed: vec![id.clone()],
        changed,
    })
}
