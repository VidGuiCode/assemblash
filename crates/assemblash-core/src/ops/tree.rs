//! Walking and editing the layer tree.
//!
//! Layers nest, so every operation that addresses one has to search the whole
//! tree rather than the top level. Keeping that in one place means a new
//! operation cannot quietly forget about groups.

use crate::document::{Document, Layer, LayerKind};
use crate::ids::LayerId;
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
