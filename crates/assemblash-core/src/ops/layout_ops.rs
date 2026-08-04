//! The layout operations: align, centre, distribute, snap.
//!
//! All of them take an explicit list of layer ids. None of them refer to a
//! selection — partly because whether selection belongs to the document is
//! still an open decision, and partly because "align these three" is a thing
//! the history journal can record and a person can audit later, while "align
//! the selection" is not.
//!
//! They move layers and never resize or rotate them. An agent asking to tidy
//! a layout should not discover that its text got wider.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::Document;
use crate::ids::LayerId;
use crate::layout::{self, Rect};
use crate::ops::error::OpError;
use crate::ops::{tree, OpOutcome};

/// Which edge or axis an alignment lines up.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum AlignEdge {
    /// Left edges.
    Left,
    /// Right edges.
    Right,
    /// Top edges.
    Top,
    /// Bottom edges.
    Bottom,
    /// Horizontal centres.
    CenterHorizontal,
    /// Vertical centres.
    CenterVertical,
}

/// Which way an operation works.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum Axis {
    /// Left to right.
    Horizontal,
    /// Top to bottom.
    Vertical,
    /// Both at once.
    Both,
}

/// What a layer is snapped to.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "to", rename_all = "camelCase")]
pub enum SnapTarget {
    /// An edge of another layer.
    Layer {
        /// The layer to snap against.
        id: LayerId,
        /// Which of its edges.
        edge: AlignEdge,
    },
    /// An edge of the canvas.
    Canvas {
        /// Which canvas edge.
        edge: AlignEdge,
    },
}

/// Moves each layer so the chosen edges line up.
pub(super) fn align(
    document: &mut Document,
    ids: &[LayerId],
    edge: AlignEdge,
) -> Result<OpOutcome, OpError> {
    require_layers(ids, "align")?;
    for id in ids {
        super::ensure_mutable(document, id, false)?;
    }

    let target = layout::bounding_box(document, ids)?;
    let mut changed = Vec::new();
    for id in ids {
        let bounds = layout::layer_bounds(document, id)?;
        let (dx, dy) = offset_to_align(&bounds, &target, edge);
        if translate(document, id, dx, dy)? {
            changed.push(id.clone());
        }
    }
    Ok(OpOutcome {
        created: Vec::new(),
        removed: Vec::new(),
        changed,
    })
}

/// Moves the layers, as one group, onto the centre of the canvas.
pub(super) fn center_on_canvas(
    document: &mut Document,
    ids: &[LayerId],
    axis: Axis,
) -> Result<OpOutcome, OpError> {
    require_layers(ids, "centerOnCanvas")?;
    for id in ids {
        super::ensure_mutable(document, id, false)?;
    }

    let bounds = layout::bounding_box(document, ids)?;
    let canvas_center_x = document.canvas.width / 2.0;
    let canvas_center_y = document.canvas.height / 2.0;

    // One offset for the whole set, so the layers keep their positions
    // relative to each other. Centring each one individually would stack them
    // all on top of each other, which is never what was meant.
    let dx = match axis {
        Axis::Horizontal | Axis::Both => canvas_center_x - bounds.center_x(),
        Axis::Vertical => 0.0,
    };
    let dy = match axis {
        Axis::Vertical | Axis::Both => canvas_center_y - bounds.center_y(),
        Axis::Horizontal => 0.0,
    };

    let mut changed = Vec::new();
    for id in ids {
        if translate(document, id, dx, dy)? {
            changed.push(id.clone());
        }
    }
    Ok(OpOutcome {
        created: Vec::new(),
        removed: Vec::new(),
        changed,
    })
}

/// Spreads the layers out with equal gaps between them.
///
/// The gaps are evened out across the span the layers already occupy, so the
/// layout keeps its extent. Fewer than three layers is a no-op: there is no
/// gap to even out, and refusing would make batch scripts fail on a boundary
/// case that is not an error.
///
/// Layers keep their order along the axis. If they are collectively wider
/// than their span, they end up touching rather than overlapping.
pub(super) fn distribute(
    document: &mut Document,
    ids: &[LayerId],
    axis: Axis,
) -> Result<OpOutcome, OpError> {
    require_layers(ids, "distribute")?;
    for id in ids {
        super::ensure_mutable(document, id, false)?;
    }
    if ids.len() < 3 {
        return Ok(OpOutcome {
            created: Vec::new(),
            removed: Vec::new(),
            changed: Vec::new(),
        });
    }

    let mut changed = Vec::new();
    for direction in axes(axis) {
        let mut boxes = Vec::with_capacity(ids.len());
        for id in ids {
            boxes.push((id.clone(), layout::layer_bounds(document, id)?));
        }
        // Sorted by position, not by the order the caller listed them: an
        // agent naming layers in an arbitrary order still gets a sensible
        // layout. Ties keep the caller's order, so the result is stable.
        boxes.sort_by(|(_, a), (_, b)| {
            let (first, second) = match direction {
                Horizontal => (a.x, b.x),
                Vertical => (a.y, b.y),
            };
            first
                .partial_cmp(&second)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // The span is the extent of everything being distributed, not the
        // first and last boxes in sorted order: a wide layer that starts
        // early can still reach further right than the one that starts last,
        // and taking its edge as the end would leave uneven gaps.
        let span = layout::bounding_box(document, ids)?;
        let (span_start, span_end) = match direction {
            Horizontal => (span.x, span.right()),
            Vertical => (span.y, span.bottom()),
        };
        let occupied: f64 = boxes
            .iter()
            .map(|(_, rect)| match direction {
                Horizontal => rect.width,
                Vertical => rect.height,
            })
            .sum();
        // Never negative. If the layers are wider than the span they
        // currently occupy there is no positive gap to share out, and
        // spacing them by a negative amount would push later layers *behind*
        // earlier ones — the operation would reorder the layout it was asked
        // to tidy. Packing them edge to edge is the predictable answer.
        let gap = ((span_end - span_start - occupied) / (boxes.len() - 1) as f64).max(0.0);

        let mut cursor = span_start;
        for (id, rect) in &boxes {
            let (dx, dy) = match direction {
                Horizontal => (cursor - rect.x, 0.0),
                Vertical => (0.0, cursor - rect.y),
            };
            if translate(document, id, dx, dy)? && !changed.contains(id) {
                changed.push(id.clone());
            }
            cursor += match direction {
                Horizontal => rect.width,
                Vertical => rect.height,
            } + gap;
        }
    }

    Ok(OpOutcome {
        created: Vec::new(),
        removed: Vec::new(),
        changed,
    })
}

/// Moves one layer so that it sits against an edge.
pub(super) fn snap_to(
    document: &mut Document,
    id: &LayerId,
    target: &SnapTarget,
) -> Result<OpOutcome, OpError> {
    super::ensure_mutable(document, id, false)?;
    let bounds = layout::layer_bounds(document, id)?;

    let (dx, dy) = match target {
        SnapTarget::Layer { id: other, edge } => {
            if other == id {
                return Err(OpError::NothingToDo {
                    operation: "snapTo",
                });
            }
            let target_bounds = layout::layer_bounds(document, other)?;
            offset_to_snap(&bounds, &target_bounds, *edge)
        }
        SnapTarget::Canvas { edge } => {
            let canvas = Rect {
                x: 0.0,
                y: 0.0,
                width: document.canvas.width,
                height: document.canvas.height,
            };
            offset_to_align(&bounds, &canvas, *edge)
        }
    };

    let moved = translate(document, id, dx, dy)?;
    Ok(OpOutcome {
        created: Vec::new(),
        removed: Vec::new(),
        changed: if moved { vec![id.clone()] } else { Vec::new() },
    })
}

/// How far to move `bounds` so the chosen edge matches `target`'s.
fn offset_to_align(bounds: &Rect, target: &Rect, edge: AlignEdge) -> (f64, f64) {
    match edge {
        AlignEdge::Left => (target.x - bounds.x, 0.0),
        AlignEdge::Right => (target.right() - bounds.right(), 0.0),
        AlignEdge::Top => (0.0, target.y - bounds.y),
        AlignEdge::Bottom => (0.0, target.bottom() - bounds.bottom()),
        AlignEdge::CenterHorizontal => (target.center_x() - bounds.center_x(), 0.0),
        AlignEdge::CenterVertical => (0.0, target.center_y() - bounds.center_y()),
    }
}

/// How far to move `bounds` so it sits *outside* the target's chosen edge.
///
/// Snapping to a layer's left edge means "put me against its left side", not
/// "line our left edges up" — that is what align is for.
fn offset_to_snap(bounds: &Rect, target: &Rect, edge: AlignEdge) -> (f64, f64) {
    match edge {
        AlignEdge::Left => (target.x - bounds.right(), 0.0),
        AlignEdge::Right => (target.right() - bounds.x, 0.0),
        AlignEdge::Top => (0.0, target.y - bounds.bottom()),
        AlignEdge::Bottom => (0.0, target.bottom() - bounds.y),
        // Centres have no inside or outside, so they behave as alignment.
        AlignEdge::CenterHorizontal => (target.center_x() - bounds.center_x(), 0.0),
        AlignEdge::CenterVertical => (0.0, target.center_y() - bounds.center_y()),
    }
}

/// Movements smaller than this are not movements.
///
/// Floating-point arithmetic does not round-trip exactly: aligning a layer
/// and then aligning it again can compute a leftover offset of one unit in
/// the last place. Without a threshold, "align" would never settle, and every
/// repeat would append another journal entry that moved nothing visible. A
/// billionth of a pixel is far below anything the renderer can express.
const NEGLIGIBLE: f64 = 1e-9;

/// Moves a layer, reporting whether it actually moved.
///
/// A move too small to matter is not recorded as a change: an align that was
/// already aligned should not fill the journal with entries that did nothing.
fn translate(document: &mut Document, id: &LayerId, dx: f64, dy: f64) -> Result<bool, OpError> {
    if dx.abs() < NEGLIGIBLE && dy.abs() < NEGLIGIBLE {
        return Ok(false);
    }
    let layer =
        tree::find_mut(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    layer.transform.x += dx;
    layer.transform.y += dy;
    Ok(true)
}

fn require_layers(ids: &[LayerId], operation: &'static str) -> Result<(), OpError> {
    if ids.is_empty() {
        return Err(OpError::NothingToDo { operation });
    }
    Ok(())
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Direction {
    Horizontal,
    Vertical,
}
use Direction::{Horizontal, Vertical};

fn axes(axis: Axis) -> Vec<Direction> {
    match axis {
        Axis::Horizontal => vec![Horizontal],
        Axis::Vertical => vec![Vertical],
        Axis::Both => vec![Horizontal, Vertical],
    }
}
