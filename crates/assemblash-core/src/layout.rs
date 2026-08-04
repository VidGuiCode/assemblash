//! Layout geometry: boxes, overlaps, and the maths the layout operations use.
//!
//! Pure functions over a document. No renderer, no fonts, no I/O — which is
//! what makes them cheap to call, easy to property-test, and safe for an
//! agent to use as a query before deciding what to change (R2: agents are bad
//! at eyeballing positions, and typed geometry is the cheapest fix).
//!
//! # Absolute space
//!
//! A layer's transform is relative to its parent, so everything here converts
//! to absolute canvas coordinates first. Ancestors contribute a translation.
//! If an ancestor is *rotated*, the conversion would need a full affine
//! chain, and getting that subtly wrong is worse than refusing: those cases
//! return [`LayoutError::RotatedAncestor`].
//!
//! # Rotated boxes
//!
//! A rotated layer's bounding box is the extent of its four rotated corners,
//! not its unrotated box. v0.2 grouped by the unrotated extent and left a
//! note that exact bounds were this milestone's work; this is it.

use crate::document::{Document, Layer, LayerKind};
use crate::ids::LayerId;

/// An axis-aligned rectangle in absolute canvas coordinates.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Rect {
    /// Left edge.
    pub x: f64,
    /// Top edge.
    pub y: f64,
    /// Width; never negative.
    pub width: f64,
    /// Height; never negative.
    pub height: f64,
}

impl Rect {
    /// A rectangle from its edges.
    pub fn from_edges(left: f64, top: f64, right: f64, bottom: f64) -> Self {
        Self {
            x: left,
            y: top,
            width: (right - left).max(0.0),
            height: (bottom - top).max(0.0),
        }
    }

    /// Right edge.
    pub fn right(&self) -> f64 {
        self.x + self.width
    }

    /// Bottom edge.
    pub fn bottom(&self) -> f64 {
        self.y + self.height
    }

    /// Horizontal centre.
    pub fn center_x(&self) -> f64 {
        self.x + self.width / 2.0
    }

    /// Vertical centre.
    pub fn center_y(&self) -> f64 {
        self.y + self.height / 2.0
    }

    /// The smallest rectangle containing both.
    pub fn union(&self, other: &Rect) -> Rect {
        Rect::from_edges(
            self.x.min(other.x),
            self.y.min(other.y),
            self.right().max(other.right()),
            self.bottom().max(other.bottom()),
        )
    }

    /// Whether two rectangles share any area.
    ///
    /// Touching edges do not count: layouts where boxes abut exactly are
    /// normal and reporting them as overlaps would make the answer useless.
    pub fn overlaps(&self, other: &Rect) -> bool {
        self.x < other.right()
            && other.x < self.right()
            && self.y < other.bottom()
            && other.y < self.bottom()
    }
}

/// Why a layout question could not be answered.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
#[non_exhaustive]
pub enum LayoutError {
    /// No layer with that id exists.
    #[error("no layer {id} in this document")]
    NoSuchLayer {
        /// The id that was asked for.
        id: LayerId,
    },

    /// A layer sits inside a rotated group.
    ///
    /// Absolute placement would need the full affine chain, and this build
    /// only composes translations. Refusing is honest; a position that is
    /// quietly wrong by a few degrees is not.
    #[error("layer {id} is inside rotated group {ancestor}, which this build cannot lay out")]
    RotatedAncestor {
        /// The layer that was asked about.
        id: LayerId,
        /// The rotated group above it.
        ancestor: LayerId,
    },

    /// The operation was given no layers.
    #[error("{operation} needs at least one layer")]
    NothingToDo {
        /// What was asked for.
        operation: &'static str,
    },
}

/// The translation an ancestor chain contributes, in absolute space.
///
/// Returns the offset to add to a layer's own transform.
pub fn absolute_offset(document: &Document, id: &LayerId) -> Result<(f64, f64), LayoutError> {
    fn walk(
        layers: &[Layer],
        id: &LayerId,
        offset: (f64, f64),
        rotated_ancestor: Option<&LayerId>,
    ) -> Option<Result<(f64, f64), LayerId>> {
        for layer in layers {
            if &layer.id == id {
                return Some(match rotated_ancestor {
                    Some(ancestor) => Err(ancestor.clone()),
                    None => Ok(offset),
                });
            }
            if let LayerKind::Group(group) = &layer.kind {
                let rotated = if layer.transform.rotation != 0.0 {
                    Some(&layer.id)
                } else {
                    rotated_ancestor
                };
                let inner = (offset.0 + layer.transform.x, offset.1 + layer.transform.y);
                if let Some(found) = walk(&group.children, id, inner, rotated) {
                    return Some(found);
                }
            }
        }
        None
    }

    match walk(&document.layers, id, (0.0, 0.0), None) {
        Some(Ok(offset)) => Ok(offset),
        Some(Err(ancestor)) => Err(LayoutError::RotatedAncestor {
            id: id.clone(),
            ancestor,
        }),
        None => Err(LayoutError::NoSuchLayer { id: id.clone() }),
    }
}

/// The absolute bounding box of one layer, accounting for its own rotation.
pub fn layer_bounds(document: &Document, id: &LayerId) -> Result<Rect, LayoutError> {
    let layer = document
        .find_layer(id)
        .ok_or_else(|| LayoutError::NoSuchLayer { id: id.clone() })?;
    let (dx, dy) = absolute_offset(document, id)?;
    Ok(rotated_bounds(
        layer.transform.x + dx,
        layer.transform.y + dy,
        layer.transform.width,
        layer.transform.height,
        layer.transform.rotation,
    ))
}

/// The box a rectangle occupies once rotated about its own centre.
pub fn rotated_bounds(x: f64, y: f64, width: f64, height: f64, degrees: f64) -> Rect {
    if degrees == 0.0 || !degrees.is_finite() {
        return Rect {
            x,
            y,
            width: width.max(0.0),
            height: height.max(0.0),
        };
    }

    let radians = degrees.to_radians();
    let (sin, cos) = radians.sin_cos();
    let (cx, cy) = (x + width / 2.0, y + height / 2.0);

    let mut left = f64::INFINITY;
    let mut top = f64::INFINITY;
    let mut right = f64::NEG_INFINITY;
    let mut bottom = f64::NEG_INFINITY;

    for (corner_x, corner_y) in [
        (x, y),
        (x + width, y),
        (x, y + height),
        (x + width, y + height),
    ] {
        let (ox, oy) = (corner_x - cx, corner_y - cy);
        let rotated_x = cx + ox * cos - oy * sin;
        let rotated_y = cy + ox * sin + oy * cos;
        left = left.min(rotated_x);
        top = top.min(rotated_y);
        right = right.max(rotated_x);
        bottom = bottom.max(rotated_y);
    }

    Rect::from_edges(left, top, right, bottom)
}

/// The box containing all of the given layers.
pub fn bounding_box(document: &Document, ids: &[LayerId]) -> Result<Rect, LayoutError> {
    let mut result: Option<Rect> = None;
    for id in ids {
        let bounds = layer_bounds(document, id)?;
        result = Some(match result {
            Some(current) => current.union(&bounds),
            None => bounds,
        });
    }
    result.ok_or(LayoutError::NothingToDo {
        operation: "getBoundingBox",
    })
}

/// Every pair of the given layers whose boxes overlap.
///
/// Pairs are reported once, in the order the ids were given, so the answer is
/// the same every time it is asked.
pub fn find_overlaps(
    document: &Document,
    ids: &[LayerId],
) -> Result<Vec<(LayerId, LayerId)>, LayoutError> {
    let mut boxes = Vec::with_capacity(ids.len());
    for id in ids {
        boxes.push((id.clone(), layer_bounds(document, id)?));
    }

    let mut overlaps = Vec::new();
    for (index, (first_id, first)) in boxes.iter().enumerate() {
        for (second_id, second) in boxes.iter().skip(index + 1) {
            // A layer given twice is not an overlap with itself.
            if first_id != second_id && first.overlaps(second) {
                overlaps.push((first_id.clone(), second_id.clone()));
            }
        }
    }
    Ok(overlaps)
}

/// Every layer in the document, in the order a depth-first walk finds them.
///
/// For callers that want to ask about the whole document rather than a chosen
/// set — `find_overlaps(document, &all_layer_ids(document))`.
pub fn all_layer_ids(document: &Document) -> Vec<LayerId> {
    let mut ids = Vec::new();
    document.walk_layers(&mut |layer| ids.push(layer.id.clone()));
    ids
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    #[test]
    fn an_unrotated_box_is_its_own_bounds() {
        let bounds = rotated_bounds(10.0, 20.0, 30.0, 40.0, 0.0);
        assert_eq!(
            bounds,
            Rect {
                x: 10.0,
                y: 20.0,
                width: 30.0,
                height: 40.0
            }
        );
    }

    #[test]
    fn a_square_rotated_by_ninety_degrees_keeps_its_box() {
        let bounds = rotated_bounds(0.0, 0.0, 10.0, 10.0, 90.0);
        assert!((bounds.x).abs() < 1e-9, "{bounds:?}");
        assert!((bounds.width - 10.0).abs() < 1e-9, "{bounds:?}");
    }

    #[test]
    fn a_rectangle_rotated_by_ninety_degrees_swaps_its_sides() {
        let bounds = rotated_bounds(0.0, 0.0, 40.0, 10.0, 90.0);
        assert!((bounds.width - 10.0).abs() < 1e-9, "{bounds:?}");
        assert!((bounds.height - 40.0).abs() < 1e-9, "{bounds:?}");
        // Rotation is about the centre, so the box stays centred where it was.
        assert!((bounds.center_x() - 20.0).abs() < 1e-9, "{bounds:?}");
        assert!((bounds.center_y() - 5.0).abs() < 1e-9, "{bounds:?}");
    }

    #[test]
    fn a_diagonal_rotation_grows_the_box() {
        let bounds = rotated_bounds(0.0, 0.0, 10.0, 10.0, 45.0);
        let expected = 10.0 * 2.0f64.sqrt();
        assert!((bounds.width - expected).abs() < 1e-9, "{bounds:?}");
    }

    #[test]
    fn touching_edges_do_not_count_as_overlapping() {
        let left = Rect {
            x: 0.0,
            y: 0.0,
            width: 10.0,
            height: 10.0,
        };
        let touching = Rect {
            x: 10.0,
            y: 0.0,
            width: 10.0,
            height: 10.0,
        };
        let overlapping = Rect {
            x: 9.0,
            y: 0.0,
            width: 10.0,
            height: 10.0,
        };
        assert!(!left.overlaps(&touching));
        assert!(left.overlaps(&overlapping));
        assert!(overlapping.overlaps(&left), "overlap is symmetric");
    }
}
