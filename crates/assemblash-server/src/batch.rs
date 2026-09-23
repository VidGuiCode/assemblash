//! Compiling the operation-batch macros into ordinary operations.
//!
//! The batch endpoint accepts the `insertLayerTree` macro beside plain
//! operations. The macro is transport sugar: it is expanded here, against a
//! cloned document, into the ordinary create/update/set operations the stable
//! API already defines, and the expanded sequence is what gets journalled.
//!
//! The compiler is `pub` because the MCP surface offers the same capability
//! (`insert_layer_tree`) and must expand it identically — one definition, two
//! transports.

use assemblash_core::ids::{IdSource, UlidIdSource};
use assemblash_core::ops::{CreateLayer, LayerPosition, NewLayerKind, OpOutcome, UpdateLayer};
use assemblash_core::{Document, Layer, LayerKind, Operation};

use crate::error::ApiError;

/// Records the ids the compiler generated, in order.
///
/// An expansion is applied twice: once against a candidate document while it
/// is being compiled, and once for real by `Session::apply_batch`. Replaying
/// the recorded ids first keeps both passes generating the same layer ids;
/// anything past the recording falls through to fresh ULIDs.
#[derive(Debug, Default)]
pub struct RecordingIds {
    /// The raw ids handed out so far.
    pub raws: Vec<String>,
}

impl IdSource for RecordingIds {
    fn next_raw(&mut self) -> String {
        let raw = UlidIdSource.next_raw();
        self.raws.push(raw.clone());
        raw
    }
}

/// Replays recorded ids, then generates fresh ones.
#[derive(Debug)]
pub struct ReplayThenUlid {
    raws: std::collections::VecDeque<String>,
}

impl ReplayThenUlid {
    /// Replays the ids `RecordingIds` recorded.
    pub fn new(raws: Vec<String>) -> Self {
        Self { raws: raws.into() }
    }
}

impl IdSource for ReplayThenUlid {
    fn next_raw(&mut self) -> String {
        self.raws
            .pop_front()
            .unwrap_or_else(|| UlidIdSource.next_raw())
    }
}

/// Applies one operation to the candidate document and records it.
pub fn apply_compiled(
    document: &mut Document,
    operation: Operation,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<OpOutcome, ApiError> {
    let outcome = assemblash_core::apply(document, &operation, ids)
        .map_err(|error| ApiError::from(assemblash_core::SessionError::Operation(error)))?;
    compiled.push(operation);
    Ok(outcome)
}

/// Expands an `insertLayerTree` layer list into compiled operations.
///
/// Sibling layers land at `position`, shifted by their index so none of them
/// takes another's slot; children land inside the group that was created for
/// them, in the order they were written.
pub fn insert_layer_tree(
    document: &mut Document,
    layers: &[Layer],
    position: &LayerPosition,
    offset_x: f64,
    offset_y: f64,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<(), ApiError> {
    for (index, layer) in layers.iter().enumerate() {
        let position = indexed_position(position, index);
        insert_layer(document, layer, position, offset_x, offset_y, compiled, ids)?;
    }
    Ok(())
}

fn indexed_position(position: &LayerPosition, offset: usize) -> LayerPosition {
    match position {
        LayerPosition::Root { index } => LayerPosition::Root {
            index: index.map(|index| index + offset),
        },
        LayerPosition::In { parent, index } => LayerPosition::In {
            parent: parent.clone(),
            index: index.map(|index| index + offset),
        },
    }
}

fn insert_layer(
    document: &mut Document,
    layer: &Layer,
    position: LayerPosition,
    offset_x: f64,
    offset_y: f64,
    compiled: &mut Vec<Operation>,
    ids: &mut dyn IdSource,
) -> Result<(), ApiError> {
    let mut transform = layer.transform.clone();
    transform.x += offset_x;
    transform.y += offset_y;
    let kind = match &layer.kind {
        LayerKind::Text(text) => NewLayerKind::Text {
            text: text.text.clone(),
            font_family: text.font_family.clone(),
            font_size: text.font_size,
            color: text.color.clone(),
            align: text.align,
            line_height: text.line_height,
            font_weight: text.font_weight,
            font_style: text.font_style,
            letter_spacing: text.letter_spacing,
            stroke: text.stroke.clone(),
            vertical_align: text.vertical_align,
        },
        LayerKind::Image(image) => NewLayerKind::Image {
            asset: image.asset.clone(),
            fit: image.fit,
        },
        LayerKind::Svg(svg) => NewLayerKind::Svg {
            asset: svg.asset.clone(),
            fit: svg.fit,
        },
        LayerKind::Shape(shape) => NewLayerKind::Shape {
            shape: shape.shape.clone(),
            fill: shape.fill.clone(),
            stroke: shape.stroke.clone(),
        },
        LayerKind::Group(_) => NewLayerKind::Group,
    };
    let created = apply_compiled(
        document,
        Operation::Create(CreateLayer {
            position,
            transform,
            name: layer.name.clone(),
            kind,
        }),
        compiled,
        ids,
    )?;
    let id = created
        .created
        .first()
        .cloned()
        .ok_or_else(|| ApiError::bad_request("insertLayerTree failed to create a layer"))?;

    if let LayerKind::Group(group) = &layer.kind {
        for (index, child) in group.children.iter().enumerate() {
            insert_layer(
                document,
                child,
                LayerPosition::In {
                    parent: id.clone(),
                    index: Some(index),
                },
                0.0,
                0.0,
                compiled,
                ids,
            )?;
        }
    }

    let mut update = UpdateLayer::new(id.clone());
    update.opacity = (layer.opacity != 1.0).then_some(layer.opacity);
    update.blend_mode = (layer.blend_mode != Default::default()).then(|| layer.blend_mode.clone());
    update.effects = (!layer.effects.is_empty()).then(|| layer.effects.clone());
    if update.opacity.is_some() || update.blend_mode.is_some() || update.effects.is_some() {
        apply_compiled(document, Operation::Update(update), compiled, ids)?;
    }
    if !layer.visible {
        apply_compiled(
            document,
            Operation::SetVisible {
                id: id.clone(),
                visible: false,
            },
            compiled,
            ids,
        )?;
    }
    if layer.locked {
        apply_compiled(
            document,
            Operation::SetLocked { id, locked: true },
            compiled,
            ids,
        )?;
    }
    Ok(())
}
