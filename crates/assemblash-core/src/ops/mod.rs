//! The operation layer.
//!
//! Every mutation of a document goes through here (PRD §7.2). The CLI, the
//! HTTP API, and the MCP server are transports: they parse a request into an
//! [`Operation`] and apply it. Nothing edits a `Document` in place behind this
//! module's back, because everything that comes later — undo, audit,
//! dry-run, permission checks — has to sit at one choke point or it will not
//! hold.
//!
//! Operations are serializable on purpose. The same value that an agent sends
//! over MCP is the value that will be appended to the history journal in
//! v0.3.
//!
//! # Applying is transactional
//!
//! [`apply`] works on a copy and only writes it back once the result
//! validates. A rejected operation leaves the document exactly as it was —
//! never half-applied. The cost is a clone of the document per operation,
//! which is a few hundred kilobytes of JSON-shaped data; correctness is worth
//! more than that here, and undo in v0.3 needs the same guarantee anyway.

mod edits;
mod error;
mod layout_ops;
mod requests;
mod tree;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub use error::OpError;
pub use layout_ops::{AlignEdge, Axis, SnapTarget};
pub use requests::{CreateLayer, LayerPosition, NewLayerKind, UpdateLayer};

use crate::document::{Document, LayerKind};
use crate::ids::{IdSource, LayerId};
use crate::validate::validate;

/// One mutation of a document.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "op", rename_all = "camelCase")]
#[non_exhaustive]
pub enum Operation {
    /// Adds a layer.
    Create(CreateLayer),
    /// Changes properties of an existing layer.
    Update(UpdateLayer),
    /// Removes a layer and everything inside it.
    Delete {
        /// Layer to remove.
        id: LayerId,
    },
    /// Copies a layer, and everything inside it, directly above the original.
    Duplicate {
        /// Layer to copy.
        id: LayerId,
    },
    /// Moves a layer by a distance, leaving its size and rotation alone.
    Move {
        /// Layer to move.
        id: LayerId,
        /// Distance along x.
        dx: f64,
        /// Distance along y.
        dy: f64,
    },
    /// Sets a layer's box size.
    Resize {
        /// Layer to resize.
        id: LayerId,
        /// New width.
        width: f64,
        /// New height.
        height: f64,
    },
    /// Sets a layer's rotation: the angle to rotate *to*, not by.
    Rotate {
        /// Layer to rotate.
        id: LayerId,
        /// Degrees clockwise about the layer's centre.
        degrees: f64,
    },
    /// Moves a layer elsewhere in the tree: another parent, another z-order,
    /// or both.
    Reorder {
        /// Layer to move.
        id: LayerId,
        /// Where it should end up.
        to: LayerPosition,
    },
    /// Wraps sibling layers in a new group, without moving the picture.
    Group {
        /// Layers to wrap. They must currently share a parent.
        ids: Vec<LayerId>,
        /// Optional name for the new group.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        name: Option<String>,
    },
    /// Replaces a group with its children, in place.
    Ungroup {
        /// The group to dissolve.
        id: LayerId,
    },
    /// Shows or hides a layer.
    SetVisible {
        /// Layer to change.
        id: LayerId,
        /// Whether it renders.
        visible: bool,
    },
    /// Locks or unlocks a layer.
    SetLocked {
        /// Layer to change.
        id: LayerId,
        /// Whether editing operations refuse to touch it.
        locked: bool,
    },
    /// Renames a layer, or clears its name.
    Rename {
        /// Layer to rename.
        id: LayerId,
        /// The new name, or `None` to clear it.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        name: Option<String>,
    },

    /// Lines the given layers up on an edge or a centre line.
    ///
    /// Takes explicit ids rather than acting on a selection: what an agent
    /// asked for should be legible in the journal afterwards.
    Align {
        /// Layers to line up.
        ids: Vec<LayerId>,
        /// Which edge or centre line.
        edge: AlignEdge,
    },

    /// Moves the given layers, as one group, onto the centre of the canvas.
    CenterOnCanvas {
        /// Layers to move.
        ids: Vec<LayerId>,
        /// Which axis to centre on.
        axis: Axis,
    },

    /// Spreads the given layers out with equal gaps.
    Distribute {
        /// Layers to spread out.
        ids: Vec<LayerId>,
        /// Which axis to spread along.
        axis: Axis,
    },

    /// Moves one layer so it sits against an edge of another layer or of the
    /// canvas.
    SnapTo {
        /// Layer to move.
        id: LayerId,
        /// What to snap it against.
        target: SnapTarget,
    },

    /// Adds a named style bundle to the document, or replaces one by name.
    DefinePreset {
        /// The preset to store.
        preset: crate::presets::Preset,
    },

    /// Removes a named style bundle.
    ///
    /// Layers that were styled by it keep their properties: applying a preset
    /// sets properties, it does not create a link, so deleting one cannot
    /// change a picture.
    DeletePreset {
        /// The preset to remove.
        name: String,
    },

    /// Applies a named style bundle to a layer.
    ///
    /// Compiles to the [`Update`](Operation::Update) the preset describes
    /// before anything is changed, which is what makes applying a preset and
    /// setting the same properties by hand the same picture — and what makes
    /// a protected layer refuse here without a preset-specific check.
    ApplyPreset {
        /// Layer to restyle.
        id: LayerId,
        /// Name of the preset to apply.
        preset: String,
        /// Apply to a locked layer.
        #[serde(default, skip_serializing_if = "std::ops::Not::not")]
        allow_locked: bool,
    },
}

/// What an operation did, beyond changing the document.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub struct OpOutcome {
    /// Layers the operation created, in creation order.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub created: Vec<LayerId>,
    /// Layers the operation removed, in removal order.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub removed: Vec<LayerId>,
    /// Layers the operation changed.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub changed: Vec<LayerId>,
}

impl OpOutcome {
    /// An operation that changed the document without touching any layer —
    /// defining or deleting a preset, for instance.
    fn nothing() -> Self {
        Self::default()
    }

    fn created(id: LayerId) -> Self {
        Self {
            created: vec![id],
            removed: Vec::new(),
            changed: Vec::new(),
        }
    }

    fn changed(id: LayerId) -> Self {
        Self {
            created: Vec::new(),
            removed: Vec::new(),
            changed: vec![id],
        }
    }

    fn removed(ids: Vec<LayerId>) -> Self {
        Self {
            created: Vec::new(),
            removed: ids,
            changed: Vec::new(),
        }
    }
}

/// Applies an operation, or leaves the document untouched and says why not.
pub fn apply(
    document: &mut Document,
    operation: &Operation,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, OpError> {
    let mut candidate = document.clone();
    let outcome = match operation {
        Operation::Create(request) => create(&mut candidate, request, ids),
        Operation::Update(request) => update(&mut candidate, request),
        Operation::Delete { id } => delete(&mut candidate, id),
        Operation::Duplicate { id } => edits::duplicate(&mut candidate, id, ids),
        Operation::Move { id, dx, dy } => edits::transform(&mut candidate, id, |t| {
            t.x += dx;
            t.y += dy;
        }),
        Operation::Resize { id, width, height } => edits::transform(&mut candidate, id, |t| {
            t.width = *width;
            t.height = *height;
        }),
        Operation::Rotate { id, degrees } => edits::transform(&mut candidate, id, |t| {
            t.rotation = *degrees;
        }),
        Operation::Reorder { id, to } => edits::reorder(&mut candidate, id, to),
        Operation::Group { ids: members, name } => {
            edits::group(&mut candidate, members, name.clone(), ids)
        }
        Operation::Ungroup { id } => edits::ungroup(&mut candidate, id),
        // Named for the caller's sake — an agent asking to "hide" a layer
        // should not have to know it is an update with one field set. The
        // journal reads better for it too.
        Operation::SetVisible { id, visible } => update(
            &mut candidate,
            &UpdateLayer {
                visible: Some(*visible),
                ..UpdateLayer::new(id.clone())
            },
        ),
        Operation::SetLocked { id, locked } => update(
            &mut candidate,
            &UpdateLayer {
                locked: Some(*locked),
                // Unlocking a locked layer is the point of this operation, so
                // it carries the override.
                allow_locked: true,
                ..UpdateLayer::new(id.clone())
            },
        ),
        Operation::DefinePreset { preset } => define_preset(&mut candidate, preset),
        Operation::DeletePreset { name } => delete_preset(&mut candidate, name),
        Operation::ApplyPreset {
            id,
            preset,
            allow_locked,
        } => {
            // Resolved here, against the document as it is now, and applied as
            // an ordinary update. The journal therefore records what actually
            // changed rather than a name whose meaning could move later — a
            // replay of "apply heading" would stop being deterministic the
            // first time somebody redefined `heading`.
            let found =
                crate::presets::find(&candidate, preset).ok_or_else(|| OpError::NoSuchPreset {
                    name: preset.clone(),
                    available: crate::presets::names(&candidate).join(", "),
                })?;
            let update = found.properties.update_for(id.clone(), *allow_locked);
            update_layer(&mut candidate, &update)
        }
        Operation::Align { ids: members, edge } => {
            layout_ops::align(&mut candidate, members, *edge)
        }
        Operation::CenterOnCanvas { ids: members, axis } => {
            layout_ops::center_on_canvas(&mut candidate, members, *axis)
        }
        Operation::Distribute { ids: members, axis } => {
            layout_ops::distribute(&mut candidate, members, *axis)
        }
        Operation::SnapTo { id, target } => layout_ops::snap_to(&mut candidate, id, target),
        Operation::Rename { id, name } => update(
            &mut candidate,
            &UpdateLayer {
                name: Some(name.clone()),
                ..UpdateLayer::new(id.clone())
            },
        ),
    }?;

    // The operation itself checks its own preconditions; this catches
    // everything else — an id collision, a dangling reference, a value that
    // is individually plausible but invalid in context.
    validate(&candidate)?;

    *document = candidate;
    Ok(outcome)
}

/// Reports what an operation would do, without doing it (PRD §10.4).
pub fn dry_run(
    document: &Document,
    operation: &Operation,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, OpError> {
    let mut copy = document.clone();
    apply(&mut copy, operation, ids)
}

/// Refuses a mutation the document's own flags forbid (PRD §10.2).
///
/// One function, called by every operation, because a protection that each
/// operation has to remember to check is a protection that a new operation
/// will forget. `protected` and `readOnly` have no override; `locked` has one,
/// because unlocking is itself an update.
pub(super) fn ensure_mutable(
    document: &Document,
    id: &LayerId,
    allow_locked: bool,
) -> Result<(), OpError> {
    let layer = tree::find(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    if layer.protected {
        return Err(OpError::LayerProtected { id: id.clone() });
    }
    if layer.read_only {
        return Err(OpError::LayerReadOnly { id: id.clone() });
    }
    if layer.locked && !allow_locked {
        return Err(OpError::LayerLocked { id: id.clone() });
    }
    Ok(())
}

/// The same check, applied to a layer and everything inside it.
///
/// Deleting a group must not quietly take a protected child with it.
pub(super) fn ensure_subtree_mutable(document: &Document, id: &LayerId) -> Result<(), OpError> {
    ensure_mutable(document, id, false)?;
    let layer = tree::find(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    if let LayerKind::Group(group) = &layer.kind {
        let mut ids = Vec::new();
        tree::collect_ids(&group.children, &mut ids);
        for child in ids {
            ensure_mutable(document, &child, true)?;
        }
    }
    Ok(())
}

fn create(
    document: &mut Document,
    request: &CreateLayer,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, OpError> {
    let layer = request.build(ids, document)?;
    let id = layer.id.clone();
    tree::insert(document, &request.position, layer)?;
    Ok(OpOutcome::created(id))
}

/// Stores a preset, replacing any with the same name.
///
/// Replacing rather than refusing a duplicate: "define this style" is what a
/// caller means whether or not the name is already taken, and the alternative
/// is every caller writing a delete-then-define dance that is not atomic.
/// Nothing that was already applied changes — a preset sets properties, it
/// does not create a link.
fn define_preset(
    document: &mut Document,
    preset: &crate::presets::Preset,
) -> Result<OpOutcome, OpError> {
    if preset.name.trim().is_empty() {
        return Err(OpError::InvalidPreset {
            name: preset.name.clone(),
            reason: "a preset needs a name",
        });
    }
    if preset.properties.is_empty() {
        return Err(OpError::InvalidPreset {
            name: preset.name.clone(),
            reason: "a preset that sets nothing would do nothing",
        });
    }
    // The same checks setting these properties directly would face, so a
    // preset cannot be a way to smuggle in a blend mode or an effect that
    // nothing can draw.
    if let Some(mode) = &preset.properties.blend_mode {
        if !mode.is_rendered() {
            return Err(OpError::UnsupportedBlendMode {
                id: LayerId::new(format!("preset:{}", preset.name)),
                mode: mode.as_str().to_owned(),
                available: crate::document::BlendMode::RENDERED
                    .iter()
                    .map(crate::document::BlendMode::as_str)
                    .collect::<Vec<_>>()
                    .join(", "),
            });
        }
    }
    if let Some(effects) = &preset.properties.effects {
        if let Some(unknown) = effects.iter().find(|effect| !effect.is_rendered()) {
            return Err(OpError::UnsupportedEffect {
                id: LayerId::new(format!("preset:{}", preset.name)),
                effect: unknown.type_name().to_owned(),
            });
        }
    }

    match document
        .presets
        .iter_mut()
        .find(|existing| existing.name == preset.name)
    {
        Some(existing) => *existing = preset.clone(),
        None => document.presets.push(preset.clone()),
    }
    Ok(OpOutcome::nothing())
}

fn delete_preset(document: &mut Document, name: &str) -> Result<OpOutcome, OpError> {
    let before = document.presets.len();
    document.presets.retain(|preset| preset.name != name);
    if document.presets.len() == before {
        return Err(OpError::NoSuchPreset {
            name: name.to_owned(),
            available: crate::presets::names(document).join(", "),
        });
    }
    Ok(OpOutcome::nothing())
}

fn update_layer(document: &mut Document, request: &UpdateLayer) -> Result<OpOutcome, OpError> {
    update(document, request)
}

fn update(document: &mut Document, request: &UpdateLayer) -> Result<OpOutcome, OpError> {
    ensure_mutable(document, &request.id, request.allow_locked)?;
    let layer = tree::find_mut(document, &request.id).ok_or_else(|| OpError::NoSuchLayer {
        id: request.id.clone(),
    })?;
    request.apply_to(layer)?;
    Ok(OpOutcome::changed(request.id.clone()))
}

fn delete(document: &mut Document, id: &LayerId) -> Result<OpOutcome, OpError> {
    ensure_subtree_mutable(document, id)?;
    let layer = tree::find(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;

    // Everything inside a group goes with it, and the caller is told exactly
    // what disappeared — a group deletion that silently takes twenty layers
    // with it is how people lose work.
    let mut removed = vec![id.clone()];
    if let LayerKind::Group(group) = &layer.kind {
        tree::collect_ids(&group.children, &mut removed);
    }

    tree::remove(document, id).ok_or_else(|| OpError::NoSuchLayer { id: id.clone() })?;
    Ok(OpOutcome::removed(removed))
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;
    use crate::document::{Extras, GroupLayer, TextAlign, Transform};
    use crate::ids::SequentialIdSource;
    use crate::{Color, Layer};

    fn document() -> Document {
        Document::new(&mut SequentialIdSource::new(), 200.0, 200.0)
    }

    fn new_text() -> NewLayerKind {
        NewLayerKind::Text {
            text: "hello".to_owned(),
            font_family: "Inter".to_owned(),
            font_size: 16.0,
            color: Color::new("#000000"),
            align: TextAlign::Left,
            line_height: 1.2,
        }
    }

    fn create_text(position: LayerPosition) -> Operation {
        Operation::Create(CreateLayer {
            position,
            transform: Transform::new(0.0, 0.0, 50.0, 20.0),
            name: None,
            kind: new_text(),
        })
    }

    #[test]
    fn create_appends_to_the_root_by_default() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        let outcome = apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();

        assert_eq!(doc.layers.len(), 1);
        assert_eq!(outcome.created, vec![doc.layers[0].id.clone()]);
    }

    #[test]
    fn create_can_insert_at_an_index_to_control_z_order() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();
        let first = doc.layers[0].id.clone();

        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: Some(0) }),
            &mut ids,
        )
        .unwrap();

        assert_eq!(doc.layers.len(), 2);
        assert_eq!(doc.layers[1].id, first, "the original moved up in z-order");
    }

    #[test]
    fn create_inside_a_missing_group_is_refused_and_changes_nothing() {
        let mut doc = document();
        let before = doc.clone();
        let error = apply(
            &mut doc,
            &create_text(LayerPosition::In {
                parent: LayerId::new("layer_nope"),
                index: None,
            }),
            &mut SequentialIdSource::new(),
        )
        .unwrap_err();

        assert!(matches!(error, OpError::NoSuchLayer { .. }), "{error:?}");
        assert_eq!(doc, before);
    }

    #[test]
    fn create_inside_a_layer_that_is_not_a_group_is_refused() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();
        let text = doc.layers[0].id.clone();

        let error = apply(
            &mut doc,
            &create_text(LayerPosition::In {
                parent: text,
                index: None,
            }),
            &mut ids,
        )
        .unwrap_err();
        assert!(matches!(error, OpError::NotAGroup { .. }), "{error:?}");
    }

    #[test]
    fn update_changes_only_what_was_asked_for() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();
        let id = doc.layers[0].id.clone();
        let transform_before = doc.layers[0].transform.clone();

        apply(
            &mut doc,
            &Operation::Update(UpdateLayer {
                id: id.clone(),
                name: Some(Some("Title".to_owned())),
                opacity: Some(0.5),
                ..UpdateLayer::new(id.clone())
            }),
            &mut ids,
        )
        .unwrap();

        assert_eq!(doc.layers[0].name.as_deref(), Some("Title"));
        assert_eq!(doc.layers[0].opacity, 0.5);
        assert_eq!(doc.layers[0].transform, transform_before);
    }

    #[test]
    fn an_invalid_update_leaves_the_document_untouched() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();
        let before = doc.clone();
        let id = doc.layers[0].id.clone();

        let error = apply(
            &mut doc,
            &Operation::Update(UpdateLayer {
                opacity: Some(4.0),
                ..UpdateLayer::new(id)
            }),
            &mut ids,
        )
        .unwrap_err();

        assert!(matches!(error, OpError::Invalid(_)), "{error:?}");
        assert_eq!(doc, before, "a rejected operation must change nothing");
    }

    #[test]
    fn locked_layers_refuse_updates_and_deletes() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();
        apply(
            &mut doc,
            &create_text(LayerPosition::Root { index: None }),
            &mut ids,
        )
        .unwrap();
        let id = doc.layers[0].id.clone();
        doc.layers[0].locked = true;

        let error = apply(
            &mut doc,
            &Operation::Update(UpdateLayer {
                opacity: Some(0.5),
                ..UpdateLayer::new(id.clone())
            }),
            &mut ids,
        )
        .unwrap_err();
        assert!(matches!(error, OpError::LayerLocked { .. }), "{error:?}");

        let error = apply(&mut doc, &Operation::Delete { id: id.clone() }, &mut ids).unwrap_err();
        assert!(matches!(error, OpError::LayerLocked { .. }), "{error:?}");

        // Unlocking is itself an update, so it needs the explicit override.
        apply(
            &mut doc,
            &Operation::Update(UpdateLayer {
                locked: Some(false),
                allow_locked: true,
                ..UpdateLayer::new(id)
            }),
            &mut ids,
        )
        .unwrap();
        assert!(!doc.layers[0].locked);
    }

    #[test]
    fn deleting_a_group_reports_every_layer_it_took_with_it() {
        let mut doc = document();
        let mut ids = SequentialIdSource::new();

        let child = Layer::new(
            LayerId::new("layer_child"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            LayerKind::Text(crate::document::TextLayer {
                text: "x".to_owned(),
                font_family: "Inter".to_owned(),
                font_size: 10.0,
                color: Color::new("#000000"),
                align: TextAlign::Left,
                line_height: 1.2,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        );
        doc.layers.push(Layer::new(
            LayerId::new("layer_group"),
            Transform::new(0.0, 0.0, 100.0, 100.0),
            LayerKind::Group(GroupLayer {
                children: vec![child],
                extra: Extras::new(),
            }),
        ));

        let outcome = apply(
            &mut doc,
            &Operation::Delete {
                id: LayerId::new("layer_group"),
            },
            &mut ids,
        )
        .unwrap();

        assert!(doc.layers.is_empty());
        assert_eq!(
            outcome.removed,
            vec![LayerId::new("layer_group"), LayerId::new("layer_child")]
        );
    }

    #[test]
    fn dry_run_reports_the_same_outcome_without_touching_the_document() {
        let doc = document();
        let mut ids = SequentialIdSource::new();
        let operation = create_text(LayerPosition::Root { index: None });

        let predicted = dry_run(&doc, &operation, &mut ids).unwrap();
        assert!(doc.layers.is_empty());
        assert_eq!(predicted.created.len(), 1);
    }

    #[test]
    fn operations_round_trip_as_json() {
        let operation = create_text(LayerPosition::Root { index: Some(2) });
        let json = serde_json::to_string(&operation).unwrap();
        assert!(json.contains("\"op\":\"create\""), "{json}");
        let parsed: Operation = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, operation);
    }
}
