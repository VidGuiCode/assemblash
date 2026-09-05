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
pub use requests::{
    CanvasAnchor, CreateLayer, LayerPosition, NewLayerKind, UpdateCanvas, UpdateLayer,
};

use crate::document::{Document, LayerKind};
use crate::ids::{IdSource, LayerId};
use crate::validate::validate;

/// One mutation of a document.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "op", rename_all = "camelCase")]
#[non_exhaustive]
pub enum Operation {
    /// Changes the canvas without scaling layers.
    UpdateCanvas(UpdateCanvas),
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

    /// Declares a named opening in the document, making it a template.
    ///
    /// Refused at definition time — not merely reported by validation — for a
    /// name already taken, a layer that is not there, a kind that does not
    /// match the layer, or **a layer that is protected or read-only**.
    ///
    /// That last refusal is why this is an operation rather than a hand edit.
    /// Filling a slot is already refused on protected chrome, because a fill
    /// is an `Update`. Defining one is not a fill, and without this check a
    /// template could advertise an opening that always fails: the author would
    /// think they had offered something, and every variant would refuse.
    DefineSlot {
        /// The slot to declare.
        slot: crate::templates::Slot,
    },

    /// Changes an existing slot, by name.
    ///
    /// The same checks a definition faces, because the result has to be a slot
    /// that could have been defined.
    UpdateSlot {
        /// Which slot to change.
        name: String,
        /// The slot's new content. Its `name` may differ, which renames it.
        slot: crate::templates::Slot,
    },

    /// Removes a named opening. The layer it pointed at is untouched.
    RemoveSlot {
        /// Which slot to remove.
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
        Operation::UpdateCanvas(request) => update_canvas(&mut candidate, request),
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
        Operation::DefineSlot { slot } => define_slot(&mut candidate, slot, None),
        Operation::UpdateSlot { name, slot } => define_slot(&mut candidate, slot, Some(name)),
        Operation::RemoveSlot { name } => remove_slot(&mut candidate, name),
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

/// Refuses an operation carrying a property the operation does not have.
///
/// Called by a transport on the raw JSON, *before* it is deserialised into an
/// [`Operation`]. Two reasons it lives here rather than in an extractor.
/// Serde cannot do it: `CreateLayer` flattens the tagged `NewLayerKind`, and
/// `deny_unknown_fields` beside a flattened field is not supported. And a
/// refusal raised after parsing is a refused *operation* — the request was
/// well formed, the engine declined it — which is what every other typed
/// refusal in this module is, and what a transport maps onto its own
/// "refused" status rather than its "malformed" one.
///
/// Every variant is checked. Serde's internally tagged enum parser otherwise
/// ignores unknown top-level fields on its struct variants, producing a false
/// success. Nested metadata remains governed by its own typed `extra` maps.
///
/// The known keys are read out of the generated schema rather than listed
/// here, so a field added to an operation request in a later release is
/// accepted without anybody remembering a second list.
/// `check_properties_accepts_every_operation_the_schema_describes` is what
/// keeps that promise honest.
pub fn check_properties(value: &serde_json::Value) -> Result<(), OpError> {
    let Some(object) = value.as_object() else {
        return Ok(());
    };
    let Some(raw_op) = object.get("op").and_then(serde_json::Value::as_str) else {
        return Ok(());
    };
    let Some(op) = known_operation_name(raw_op) else {
        return Ok(());
    };
    let known = match op {
        "create" => create_keys(object.get("type").and_then(serde_json::Value::as_str)),
        "update" => update_keys().clone(),
        "updateCanvas" => request_keys::<UpdateCanvas>(),
        _ => operation_keys(op),
    };
    for key in object.keys() {
        if !known.contains(key.as_str()) {
            return Err(OpError::UnknownProperty {
                op,
                property: key.clone(),
            });
        }
    }
    Ok(())
}

const OPERATION_NAMES: &[&str] = &[
    "updateCanvas",
    "create",
    "update",
    "delete",
    "duplicate",
    "move",
    "resize",
    "rotate",
    "reorder",
    "group",
    "ungroup",
    "setVisible",
    "setLocked",
    "rename",
    "align",
    "centerOnCanvas",
    "distribute",
    "snapTo",
    "definePreset",
    "deletePreset",
    "defineSlot",
    "updateSlot",
    "removeSlot",
    "applyPreset",
];

fn known_operation_name(name: &str) -> Option<&'static str> {
    OPERATION_NAMES.iter().copied().find(|known| *known == name)
}

fn request_keys<T: JsonSchema>() -> std::collections::BTreeSet<String> {
    let mut keys = property_names(&schema_value(schemars::schema_for!(T)));
    keys.insert("op".to_owned());
    keys
}

fn operation_keys(op: &str) -> std::collections::BTreeSet<String> {
    let schema = schema_value(schemars::schema_for!(Operation));
    let mut keys = schema
        .get("oneOf")
        .or_else(|| schema.get("anyOf"))
        .and_then(serde_json::Value::as_array)
        .and_then(|branches| {
            branches.iter().find(|branch| {
                branch
                    .get("properties")
                    .and_then(|properties| properties.get("op"))
                    .and_then(|tag| tag.get("const"))
                    .and_then(serde_json::Value::as_str)
                    == Some(op)
            })
        })
        .map(property_names)
        .unwrap_or_default();
    keys.insert("op".to_owned());
    keys
}
/// Spellings `NewLayerKind::Text` accepts as aliases, which the schema
/// therefore does not name (`requests.rs:63-75`).
///
/// They were the wire format before 0.6.0 and are still read, so a journal
/// written by an older build replays through this check unchanged.
const TEXT_ALIASES: &[&str] = &["font_family", "font_size", "line_height"];

/// Top-level keys an `update` may carry.
fn update_keys() -> &'static std::collections::BTreeSet<String> {
    static KEYS: std::sync::OnceLock<std::collections::BTreeSet<String>> =
        std::sync::OnceLock::new();
    KEYS.get_or_init(|| {
        let schema = schema_value(schemars::schema_for!(UpdateLayer));
        let mut keys = property_names(&schema);
        keys.insert("op".to_owned());
        keys
    })
}

/// Top-level keys a `create` of the given layer `type` may carry.
///
/// The flattened `NewLayerKind` is tagged, so the payload's own `type` picks
/// one branch of the union: a `fontSize` on an image create is refused as
/// precisely as a `letterSpacing` is. A `type` that names no branch — missing,
/// or misspelled — falls back to the union of all four, because the parser is
/// about to refuse it as an unknown variant and saying so twice, differently,
/// would be worse than saying it once.
fn create_keys(kind: Option<&str>) -> std::collections::BTreeSet<String> {
    static SCHEMA: std::sync::OnceLock<serde_json::Value> = std::sync::OnceLock::new();
    let schema = SCHEMA.get_or_init(|| schema_value(schemars::schema_for!(CreateLayer)));

    let mut keys = property_names(schema);
    keys.insert("op".to_owned());

    let branches = schema
        .get("oneOf")
        .and_then(serde_json::Value::as_array)
        .map_or(&[][..], Vec::as_slice);
    let selected = branches
        .iter()
        .filter(|branch| kind.is_some_and(|kind| branch_tag(branch) == Some(kind)))
        .collect::<Vec<_>>();
    let selected = if selected.is_empty() {
        branches.iter().collect()
    } else {
        selected
    };
    for branch in selected {
        keys.extend(property_names(branch));
        if branch_tag(branch) == Some("text") {
            keys.extend(TEXT_ALIASES.iter().map(|alias| (*alias).to_owned()));
        }
    }
    keys
}

/// The `type` a `NewLayerKind` branch of the schema is for.
fn branch_tag(branch: &serde_json::Value) -> Option<&str> {
    branch
        .get("properties")?
        .get("type")?
        .get("const")?
        .as_str()
}

/// The names in a schema object's `properties`.
fn property_names(schema: &serde_json::Value) -> std::collections::BTreeSet<String> {
    schema
        .get("properties")
        .and_then(serde_json::Value::as_object)
        .map(|properties| properties.keys().cloned().collect())
        .unwrap_or_default()
}

fn schema_value(schema: schemars::Schema) -> serde_json::Value {
    serde_json::to_value(schema).unwrap_or_default()
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

fn update_canvas(document: &mut Document, request: &UpdateCanvas) -> Result<OpOutcome, OpError> {
    let old_width = document.canvas.width;
    let old_height = document.canvas.height;
    let new_width = request.width.unwrap_or(old_width);
    let new_height = request.height.unwrap_or(old_height);
    let (x_factor, y_factor) = match request.anchor.unwrap_or_default() {
        CanvasAnchor::TopLeft => (0.0, 0.0),
        CanvasAnchor::Top => (0.5, 0.0),
        CanvasAnchor::TopRight => (1.0, 0.0),
        CanvasAnchor::Left => (0.0, 0.5),
        CanvasAnchor::Center => (0.5, 0.5),
        CanvasAnchor::Right => (1.0, 0.5),
        CanvasAnchor::BottomLeft => (0.0, 1.0),
        CanvasAnchor::Bottom => (0.5, 1.0),
        CanvasAnchor::BottomRight => (1.0, 1.0),
    };
    let dx = if x_factor == 0.0 {
        0.0
    } else {
        (new_width - old_width) * x_factor
    };
    let dy = if y_factor == 0.0 {
        0.0
    } else {
        (new_height - old_height) * y_factor
    };
    let moves_layers = dx != 0.0 || dy != 0.0;
    if moves_layers {
        for layer in &document.layers {
            ensure_mutable(document, &layer.id, false)?;
            if let LayerKind::Group(group) = &layer.kind {
                let mut descendants = Vec::new();
                tree::collect_ids(&group.children, &mut descendants);
                for descendant in descendants {
                    ensure_mutable(document, &descendant, false)?;
                }
            }
        }
    }

    document.canvas.width = new_width;
    document.canvas.height = new_height;
    if let Some(background) = &request.background {
        document.canvas.background = background.clone();
    }
    let mut changed = Vec::new();
    if moves_layers {
        for layer in &mut document.layers {
            layer.transform.x += dx;
            layer.transform.y += dy;
            changed.push(layer.id.clone());
        }
    }
    Ok(OpOutcome {
        created: Vec::new(),
        removed: Vec::new(),
        changed,
    })
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

/// Declares a slot, or replaces the one named by `replacing`.
///
/// One function for both operations because the checks are the same, and a
/// second copy of them is a second thing to forget: an update that could
/// produce a slot a definition would have refused is a hole.
fn define_slot(
    document: &mut Document,
    slot: &crate::templates::Slot,
    replacing: Option<&str>,
) -> Result<OpOutcome, OpError> {
    if slot.name.trim().is_empty() {
        return Err(OpError::InvalidSlot {
            name: slot.name.clone(),
            reason: "a slot needs a name",
        });
    }

    // Renaming onto a name another slot already has would make one of them
    // unreachable, and `validate_slots` would then refuse the whole document.
    let taken = document
        .slots
        .iter()
        .any(|existing| existing.name == slot.name && Some(existing.name.as_str()) != replacing);
    if taken {
        return Err(OpError::InvalidSlot {
            name: slot.name.clone(),
            reason: "another slot already has that name",
        });
    }

    if let Some(name) = replacing {
        if !document.slots.iter().any(|existing| existing.name == name) {
            return Err(OpError::NoSuchSlot {
                name: name.to_owned(),
                available: crate::templates::slot_names(document).join(", "),
            });
        }
    }

    let layer = tree::find(document, &slot.layer).ok_or_else(|| OpError::NoSuchLayer {
        id: slot.layer.clone(),
    })?;

    // A slot on chrome would be an opening that always refuses when filled.
    // Better to say so now, while somebody is looking at it, than to hand out
    // a template whose contract is a lie.
    if layer.protected {
        return Err(OpError::LayerProtected {
            id: slot.layer.clone(),
        });
    }
    if layer.read_only {
        return Err(OpError::LayerReadOnly {
            id: slot.layer.clone(),
        });
    }

    let found = match &layer.kind {
        LayerKind::Text(_) => "text",
        LayerKind::Image(_) => "image",
        LayerKind::Svg(_) => "svg",
        LayerKind::Group(_) => "group",
    };
    let wants = match slot.kind {
        crate::templates::SlotKind::Text | crate::templates::SlotKind::Color => "text",
        crate::templates::SlotKind::Image => "image",
    };
    if found != wants {
        return Err(OpError::SlotKindMismatch {
            name: slot.name.clone(),
            wants,
            id: slot.layer.clone(),
            found,
        });
    }

    match replacing {
        Some(name) => {
            if let Some(existing) = document
                .slots
                .iter_mut()
                .find(|existing| existing.name == name)
            {
                *existing = slot.clone();
            }
        }
        None => document.slots.push(slot.clone()),
    }
    Ok(OpOutcome::nothing())
}

fn remove_slot(document: &mut Document, name: &str) -> Result<OpOutcome, OpError> {
    let before = document.slots.len();
    document.slots.retain(|slot| slot.name != name);
    if document.slots.len() == before {
        return Err(OpError::NoSuchSlot {
            name: name.to_owned(),
            available: crate::templates::slot_names(document).join(", "),
        });
    }
    Ok(OpOutcome::nothing())
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

    // A slot pointing at a layer that is about to go would leave the document
    // invalid, so something has to give. Refused rather than cascading: an
    // agent deleting a layer must not silently break a contract other scripts
    // and agents are filling, and the `removed` outcome has nowhere to say it
    // did. The fix is one `removeSlot`, and this names which.
    let orphaned: Vec<String> = document
        .slots
        .iter()
        .filter(|slot| removed.contains(&slot.layer))
        .map(|slot| slot.name.clone())
        .collect();
    if !orphaned.is_empty() {
        return Err(OpError::LayerIsSlotTarget {
            id: id.clone(),
            slots: orphaned.join(", "),
        });
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
    fn canvas_anchors_translate_only_root_layers() {
        let anchors = [
            (CanvasAnchor::TopLeft, 0.0, 0.0),
            (CanvasAnchor::Top, 50.0, 0.0),
            (CanvasAnchor::TopRight, 100.0, 0.0),
            (CanvasAnchor::Left, 0.0, 100.0),
            (CanvasAnchor::Center, 50.0, 100.0),
            (CanvasAnchor::Right, 100.0, 100.0),
            (CanvasAnchor::BottomLeft, 0.0, 200.0),
            (CanvasAnchor::Bottom, 50.0, 200.0),
            (CanvasAnchor::BottomRight, 100.0, 200.0),
        ];
        for (anchor, dx, dy) in anchors {
            let mut doc = document();
            let child = Layer::new(
                LayerId::new("layer_child"),
                Transform::new(7.0, 9.0, 10.0, 10.0),
                LayerKind::Group(GroupLayer {
                    children: Vec::new(),
                    extra: Extras::new(),
                }),
            );
            doc.layers.push(Layer::new(
                LayerId::new("layer_root"),
                Transform::new(10.0, 20.0, 30.0, 40.0),
                LayerKind::Group(GroupLayer {
                    children: vec![child],
                    extra: Extras::new(),
                }),
            ));
            apply(
                &mut doc,
                &Operation::UpdateCanvas(UpdateCanvas {
                    width: Some(300.0),
                    height: Some(400.0),
                    anchor: Some(anchor),
                    ..UpdateCanvas::default()
                }),
                &mut SequentialIdSource::new(),
            )
            .unwrap();
            assert_eq!(
                (doc.layers[0].transform.x, doc.layers[0].transform.y),
                (10.0 + dx, 20.0 + dy)
            );
            let LayerKind::Group(group) = &doc.layers[0].kind else {
                panic!()
            };
            assert_eq!(
                (group.children[0].transform.x, group.children[0].transform.y),
                (7.0, 9.0)
            );
        }
    }

    #[test]
    fn canvas_dry_run_reports_moves_without_mutating() {
        let mut doc = document();
        doc.layers.push(Layer::new(
            LayerId::new("layer_root"),
            Transform::new(1.0, 2.0, 3.0, 4.0),
            LayerKind::Group(GroupLayer {
                children: Vec::new(),
                extra: Extras::new(),
            }),
        ));
        let before = doc.clone();
        let outcome = dry_run(
            &doc,
            &Operation::UpdateCanvas(UpdateCanvas {
                width: Some(300.0),
                anchor: Some(CanvasAnchor::Right),
                ..UpdateCanvas::default()
            }),
            &mut SequentialIdSource::new(),
        )
        .unwrap();
        assert_eq!(outcome.changed, vec![LayerId::new("layer_root")]);
        assert_eq!(doc, before);
    }
    #[test]
    fn canvas_update_preserves_omitted_background_and_clears_null() {
        let omitted: UpdateCanvas = serde_json::from_value(serde_json::json!({})).unwrap();
        let cleared: UpdateCanvas =
            serde_json::from_value(serde_json::json!({ "background": null })).unwrap();
        assert_eq!(omitted.background, None);
        assert_eq!(cleared.background, Some(None));
        assert_eq!(
            serde_json::to_value(&cleared).unwrap()["background"],
            serde_json::Value::Null
        );
    }

    #[test]
    fn invalid_or_guarded_canvas_updates_are_atomic() {
        let mut doc = document();
        doc.canvas.background = Some(Color::new("#ffffff"));
        let mut locked_child = Layer::new(
            LayerId::new("layer_locked_child"),
            Transform::new(5.0, 6.0, 7.0, 8.0),
            LayerKind::Group(GroupLayer {
                children: Vec::new(),
                extra: Extras::new(),
            }),
        );
        locked_child.locked = true;
        doc.layers.push(Layer::new(
            LayerId::new("layer_guarded"),
            Transform::new(1.0, 2.0, 3.0, 4.0),
            LayerKind::Group(GroupLayer {
                children: vec![locked_child],
                extra: Extras::new(),
            }),
        ));
        doc.layers[0].protected = true;
        let before = doc.clone();
        let guarded = Operation::UpdateCanvas(UpdateCanvas {
            width: Some(300.0),
            anchor: Some(CanvasAnchor::Right),
            ..UpdateCanvas::default()
        });
        assert!(matches!(
            apply(&mut doc, &guarded, &mut SequentialIdSource::new()),
            Err(OpError::LayerProtected { .. })
        ));
        assert_eq!(doc, before);

        doc.layers[0].protected = false;
        let locked_before = doc.clone();
        assert!(matches!(
            apply(&mut doc, &guarded, &mut SequentialIdSource::new()),
            Err(OpError::LayerLocked { .. })
        ));
        assert_eq!(doc, locked_before);

        for request in [
            UpdateCanvas {
                width: Some(0.0),
                ..UpdateCanvas::default()
            },
            UpdateCanvas {
                height: Some(f64::NAN),
                ..UpdateCanvas::default()
            },
            UpdateCanvas {
                background: Some(Some(Color::new("bad"))),
                ..UpdateCanvas::default()
            },
        ] {
            let mut candidate = locked_before.clone();
            assert!(matches!(
                apply(
                    &mut candidate,
                    &Operation::UpdateCanvas(request),
                    &mut SequentialIdSource::new()
                ),
                Err(OpError::Invalid(_))
            ));
            assert_eq!(candidate, locked_before);
        }
    }

    #[test]
    fn every_operation_variant_refuses_unknown_top_level_properties() {
        for operation in one_of_every_operation() {
            let mut value = serde_json::to_value(operation).unwrap();
            value
                .as_object_mut()
                .unwrap()
                .insert("definitelyUnknown".to_owned(), serde_json::json!(true));
            assert!(
                matches!(check_properties(&value), Err(OpError::UnknownProperty { property, .. }) if property == "definitelyUnknown"),
                "{value}"
            );
        }
    }
    /// Every variant of the union, one instance each.
    ///
    /// Listed rather than derived, because the point is to notice when the
    /// union grows: a new variant does not appear here until somebody adds
    /// it, and adding it is what runs it through `check_properties`.
    fn one_of_every_operation() -> Vec<Operation> {
        let id = LayerId::new("layer_one");
        let other = LayerId::new("layer_two");
        let asset = crate::ids::AssetId::new("asset_one");
        let slot = crate::templates::Slot {
            name: "headline".to_owned(),
            layer: id.clone(),
            kind: crate::templates::SlotKind::Text,
            description: None,
            required: false,
            extra: Extras::new(),
        };
        vec![
            Operation::UpdateCanvas(UpdateCanvas::default()),
            create_text(LayerPosition::Root { index: None }),
            Operation::Create(CreateLayer {
                position: LayerPosition::Root { index: None },
                transform: Transform::new(0.0, 0.0, 10.0, 10.0),
                name: None,
                kind: NewLayerKind::Image {
                    asset: asset.clone(),
                    fit: crate::document::ImageFit::Contain,
                },
            }),
            Operation::Create(CreateLayer {
                position: LayerPosition::Root { index: None },
                transform: Transform::new(0.0, 0.0, 10.0, 10.0),
                name: None,
                kind: NewLayerKind::Group,
            }),
            Operation::Create(CreateLayer {
                position: LayerPosition::Root { index: None },
                transform: Transform::new(0.0, 0.0, 10.0, 10.0),
                name: None,
                kind: NewLayerKind::Svg {
                    asset: asset.clone(),
                    fit: crate::document::ImageFit::Contain,
                },
            }),
            Operation::Update(UpdateLayer {
                name: Some(Some("named".to_owned())),
                transform: Some(Transform::new(1.0, 2.0, 3.0, 4.0)),
                opacity: Some(0.5),
                visible: Some(true),
                locked: Some(false),
                blend_mode: Some(crate::document::BlendMode::Multiply),
                effects: Some(Vec::new()),
                text: Some("changed".to_owned()),
                font_family: Some("Inter".to_owned()),
                font_size: Some(12.0),
                color: Some(Color::new("#ffffff")),
                align: Some(TextAlign::Center),
                line_height: Some(1.5),
                fit: Some(crate::document::ImageFit::Cover),
                asset: Some(asset),
                allow_locked: true,
                ..UpdateLayer::new(id.clone())
            }),
            Operation::Delete { id: id.clone() },
            Operation::Duplicate { id: id.clone() },
            Operation::Move {
                id: id.clone(),
                dx: 1.0,
                dy: 2.0,
            },
            Operation::Resize {
                id: id.clone(),
                width: 10.0,
                height: 20.0,
            },
            Operation::Rotate {
                id: id.clone(),
                degrees: 90.0,
            },
            Operation::Reorder {
                id: id.clone(),
                to: LayerPosition::Root { index: Some(0) },
            },
            Operation::Group {
                ids: vec![id.clone(), other.clone()],
                name: Some("pair".to_owned()),
            },
            Operation::Ungroup { id: id.clone() },
            Operation::SetVisible {
                id: id.clone(),
                visible: false,
            },
            Operation::SetLocked {
                id: id.clone(),
                locked: true,
            },
            Operation::Rename {
                id: id.clone(),
                name: None,
            },
            Operation::Align {
                ids: vec![id.clone(), other.clone()],
                edge: AlignEdge::Left,
            },
            Operation::CenterOnCanvas {
                ids: vec![id.clone()],
                axis: Axis::Horizontal,
            },
            Operation::Distribute {
                ids: vec![id.clone(), other],
                axis: Axis::Vertical,
            },
            Operation::SnapTo {
                id: id.clone(),
                target: SnapTarget::Canvas {
                    edge: AlignEdge::Left,
                },
            },
            Operation::DefinePreset {
                preset: crate::presets::Preset {
                    name: "heading".to_owned(),
                    description: None,
                    properties: crate::presets::PresetProperties::default(),
                    extra: Extras::new(),
                },
            },
            Operation::DeletePreset {
                name: "heading".to_owned(),
            },
            Operation::DefineSlot { slot: slot.clone() },
            Operation::UpdateSlot {
                name: "headline".to_owned(),
                slot,
            },
            Operation::RemoveSlot {
                name: "headline".to_owned(),
            },
            Operation::ApplyPreset {
                id,
                preset: "heading".to_owned(),
                allow_locked: false,
            },
        ]
    }

    #[test]
    fn check_properties_accepts_every_operation_the_schema_describes() {
        for operation in one_of_every_operation() {
            let value = serde_json::to_value(&operation).unwrap();
            assert_eq!(
                check_properties(&value),
                Ok(()),
                "the check refuses an operation this build itself writes: {value}"
            );
        }
    }

    #[test]
    fn an_unknown_property_is_refused_naming_itself() {
        let update = serde_json::json!({
            "op": "update",
            "id": "layer_one",
            "letterSpacing": 4
        });
        assert_eq!(
            check_properties(&update),
            Err(OpError::UnknownProperty {
                op: "update",
                property: "letterSpacing".to_owned(),
            })
        );
        assert_eq!(
            check_properties(&update).unwrap_err().to_string(),
            r#"unknown property "letterSpacing" on an update operation"#
        );

        let create = serde_json::json!({
            "op": "create",
            "transform": { "x": 0, "y": 0, "width": 10, "height": 10 },
            "type": "text",
            "text": "hi",
            "fontFamily": "Inter",
            "fontSize": 12,
            "letterSpacing": 9
        });
        assert_eq!(
            check_properties(&create).unwrap_err().to_string(),
            r#"unknown property "letterSpacing" on a create operation"#
        );
    }

    #[test]
    fn a_create_is_checked_against_the_kind_it_names() {
        // `fontSize` is a real property — of a text create. On an image
        // create it is as wrong as a property nothing has.
        let image = serde_json::json!({
            "op": "create",
            "transform": { "x": 0, "y": 0, "width": 10, "height": 10 },
            "type": "image",
            "asset": "asset_one",
            "fontSize": 12
        });
        assert_eq!(
            check_properties(&image),
            Err(OpError::UnknownProperty {
                op: "create",
                property: "fontSize".to_owned(),
            })
        );
    }

    #[test]
    fn the_spellings_that_predate_0_6_0_are_still_accepted() {
        // Aliases the schema does not name, kept so an old journal replays.
        let create = serde_json::json!({
            "op": "create",
            "transform": { "x": 0, "y": 0, "width": 10, "height": 10 },
            "type": "text",
            "text": "hi",
            "font_family": "Inter",
            "font_size": 12,
            "line_height": 1.4
        });
        assert_eq!(check_properties(&create), Ok(()));
        assert!(serde_json::from_value::<Operation>(create).is_ok());
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
