//! Walking and editing the layer tree.
//!
//! Layers nest, so every operation that addresses one has to search the whole
//! tree rather than the top level. Keeping that in one place means a new
//! operation cannot quietly forget about groups.

use crate::document::{Document, Layer, LayerKind};
use crate::ids::{IdSource, LayerId};
use crate::ops::error::OpError;
use crate::ops::requests::LayerPosition;

/// Finds a layer anywhere in the document.
pub(super) fn find<'a>(document: &'a Document, id: &LayerId) -> Option<&'a Layer> {
    fn search<'a>(layers: &'a [Layer], id: &LayerId) -> Option<&'a Layer> {
        for layer in layers {
            if &layer.id == id {
                return Some(layer);
            }
            if let LayerKind::Group(group) = &layer.kind {
                if let Some(found) = search(&group.children, id) {
                    return Some(found);
                }
            }
        }
        None
    }
    search(&document.layers, id)
}

/// Finds a layer anywhere in the document, for editing.
pub(super) fn find_mut<'a>(document: &'a mut Document, id: &LayerId) -> Option<&'a mut Layer> {
    fn search<'a>(layers: &'a mut [Layer], id: &LayerId) -> Option<&'a mut Layer> {
        for layer in layers {
            if &layer.id == id {
                return Some(layer);
            }
            if let LayerKind::Group(group) = &mut layer.kind {
                if let Some(found) = search(&mut group.children, id) {
                    return Some(found);
                }
            }
        }
        None
    }
    search(&mut document.layers, id)
}

/// Inserts a layer at the requested position.
pub(super) fn insert(
    document: &mut Document,
    position: &LayerPosition,
    layer: Layer,
) -> Result<(), OpError> {
    let (siblings, index) = match position {
        LayerPosition::Root { index } => (&mut document.layers, *index),
        LayerPosition::In { parent, index } => {
            let parent_id = parent.clone();
            let parent_layer = find_mut(document, parent).ok_or(OpError::NoSuchLayer {
                id: parent_id.clone(),
            })?;
            match &mut parent_layer.kind {
                LayerKind::Group(group) => (&mut group.children, *index),
                _ => return Err(OpError::NotAGroup { id: parent_id }),
            }
        }
    };

    match index {
        // No index means "on top", which is the end of the list: array order
        // is z-order, bottom first.
        None => siblings.push(layer),
        Some(index) if index <= siblings.len() => siblings.insert(index, layer),
        Some(index) => {
            return Err(OpError::IndexOutOfRange {
                index,
                length: siblings.len(),
            })
        }
    }
    Ok(())
}

/// Removes a layer from wherever it is, returning it.
pub(super) fn remove(document: &mut Document, id: &LayerId) -> Option<Layer> {
    fn search(layers: &mut Vec<Layer>, id: &LayerId) -> Option<Layer> {
        if let Some(position) = layers.iter().position(|layer| &layer.id == id) {
            return Some(layers.remove(position));
        }
        for layer in layers {
            if let LayerKind::Group(group) = &mut layer.kind {
                if let Some(found) = search(&mut group.children, id) {
                    return Some(found);
                }
            }
        }
        None
    }
    search(&mut document.layers, id)
}

/// Collects the ids of a subtree, depth first, parents before children.
pub(super) fn collect_ids(layers: &[Layer], out: &mut Vec<LayerId>) {
    for layer in layers {
        out.push(layer.id.clone());
        if let LayerKind::Group(group) = &layer.kind {
            collect_ids(&group.children, out);
        }
    }
}

/// Gives every layer in a subtree a fresh id, recording them in order.
pub(super) fn reassign_ids(layer: &mut Layer, ids: &mut dyn IdSource, out: &mut Vec<LayerId>) {
    layer.id = LayerId::generate(ids);
    out.push(layer.id.clone());
    if let LayerKind::Group(group) = &mut layer.kind {
        for child in &mut group.children {
            reassign_ids(child, ids, out);
        }
    }
}

/// The id of a layer's parent group, or `None` if it sits at the top level.
pub(super) fn parent_of(document: &Document, id: &LayerId) -> Option<LayerId> {
    fn search(layers: &[Layer], id: &LayerId, current: Option<&LayerId>) -> Option<LayerId> {
        for layer in layers {
            if &layer.id == id {
                return current.cloned();
            }
            if let LayerKind::Group(group) = &layer.kind {
                if let Some(found) = search(&group.children, id, Some(&layer.id)) {
                    return Some(found);
                }
            }
        }
        None
    }
    search(&document.layers, id, None)
}

/// Index of a layer among its siblings, or the end of the list if it is not
/// found.
pub(super) fn index_of(document: &Document, parent: &Option<LayerId>, id: &LayerId) -> usize {
    let siblings = match parent {
        None => &document.layers,
        Some(parent) => match find(document, parent) {
            Some(Layer {
                kind: LayerKind::Group(group),
                ..
            }) => &group.children,
            _ => return 0,
        },
    };
    siblings
        .iter()
        .position(|layer| &layer.id == id)
        .unwrap_or(siblings.len())
}

/// A position addressing an index inside a parent, or at the top level.
pub(super) fn position_in(parent: Option<LayerId>, index: usize) -> LayerPosition {
    match parent {
        Some(parent) => LayerPosition::In {
            parent,
            index: Some(index),
        },
        None => LayerPosition::Root { index: Some(index) },
    }
}

/// The position directly above a layer — where a duplicate belongs.
pub(super) fn position_above(document: &Document, id: &LayerId) -> Result<LayerPosition, OpError> {
    if find(document, id).is_none() {
        return Err(OpError::NoSuchLayer { id: id.clone() });
    }
    let parent = parent_of(document, id);
    Ok(position_in(
        parent.clone(),
        index_of(document, &parent, id) + 1,
    ))
}

/// Whether `candidate` sits somewhere inside `ancestor`.
pub(super) fn is_descendant(document: &Document, ancestor: &LayerId, candidate: &LayerId) -> bool {
    let Some(layer) = find(document, ancestor) else {
        return false;
    };
    let LayerKind::Group(group) = &layer.kind else {
        return false;
    };
    let mut ids = Vec::new();
    collect_ids(&group.children, &mut ids);
    ids.contains(candidate)
}

/// The parent every one of these layers shares, or an error if they are not
/// siblings.
pub(super) fn common_parent(
    document: &Document,
    ids: &[LayerId],
) -> Result<Option<LayerId>, OpError> {
    let mut parents = ids.iter().map(|id| parent_of(document, id));
    let first = parents.next().flatten();
    let same = {
        let first = first.clone();
        ids.iter()
            .all(|id| parent_of(document, id) == first.clone())
    };
    if same {
        Ok(first)
    } else {
        Err(OpError::NotSiblings {
            ids: ids
                .iter()
                .map(LayerId::to_string)
                .collect::<Vec<_>>()
                .join(", "),
        })
    }
}

/// The box that contains all of these layers.
#[derive(Debug, Clone, Copy, PartialEq)]
pub(super) struct Bounds {
    pub(super) x: f64,
    pub(super) y: f64,
    pub(super) width: f64,
    pub(super) height: f64,
}

/// Bounding box of a set of layers, by their unrotated boxes.
pub(super) fn bounding_box(layers: &[Layer]) -> Bounds {
    let mut left = f64::INFINITY;
    let mut top = f64::INFINITY;
    let mut right = f64::NEG_INFINITY;
    let mut bottom = f64::NEG_INFINITY;
    for layer in layers {
        let t = &layer.transform;
        left = left.min(t.x);
        top = top.min(t.y);
        right = right.max(t.x + t.width);
        bottom = bottom.max(t.y + t.height);
    }
    if !left.is_finite() {
        return Bounds {
            x: 0.0,
            y: 0.0,
            width: 0.0,
            height: 0.0,
        };
    }
    Bounds {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    }
}
