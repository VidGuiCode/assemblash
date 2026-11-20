//! Advertised schemas for layer trees, without a `$ref` cycle.
//!
//! The derived layer schema refers to itself: `Layer` → the `group` variant
//! → `GroupLayer.children.items` → `Layer`. Strict tool-schema validators
//! (Moonshot/Kimi) refuse a `$ref` cycle and, with it, the whole tool list.
//! These functions build the normal derived schema and then replace each
//! reference back to the layer definition, inside the definitions the layer
//! definition reaches, with a plain object whose description names the
//! shape. A reference to the layer definition from outside the cycle, such
//! as `Document.layers.items`, stays typed.
//!
//! Only the advertised schema changes. The Rust types, what deserializes,
//! and what serializes stay the same, nested groups at any depth included.
//!
//! These functions never panic (NFR-4). When the generated schema no longer
//! has the shape they rely on, the schema goes out unchanged. The test
//! `no_tool_schema_has_a_ref_cycle` guards that case: it fails on any cycle
//! in any tool's input or output schema, and it pins the replaced nodes.

use std::collections::BTreeSet;

use schemars::{Schema, SchemaGenerator};
use serde_json::Value;

/// What a group's `children` items say in an advertised layer schema.
pub const LAYER_CHILD_DESCRIPTION: &str = "A child layer: an object with the same shape as \
     an item of `layers` (any layer type, `group` included). A group can hold more groups, to any \
     depth.";

/// The schema of a `Vec<Layer>` field, with the layer cycle broken.
pub fn layer_list_schema(generator: &mut SchemaGenerator) -> Schema {
    let schema = generator.subschema_for::<Vec<assemblash_core::Layer>>();
    if let Some(layer_ref) = schema
        .get("items")
        .and_then(|items| items.get("$ref"))
        .and_then(Value::as_str)
    {
        break_layer_cycle(generator, layer_ref);
    }
    schema
}

/// The schema of a `Document` field, with the layer cycle broken.
pub fn document_schema(generator: &mut SchemaGenerator) -> Schema {
    let schema = generator.subschema_for::<assemblash_core::Document>();
    let layer = generator.subschema_for::<assemblash_core::Layer>();
    if let Some(layer_ref) = layer.get("$ref").and_then(Value::as_str) {
        break_layer_cycle(generator, layer_ref);
    }
    schema
}

/// The definition name a `$ref` points at: the part after the last `/`.
fn definition_name(reference: &str) -> &str {
    reference.rsplit('/').next().unwrap_or(reference)
}

/// Every `$ref` string in `node`.
fn collect_refs(node: &Value, out: &mut Vec<String>) {
    match node {
        Value::Object(map) => {
            if let Some(reference) = map.get("$ref").and_then(Value::as_str) {
                out.push(reference.to_owned());
            }
            for value in map.values() {
                collect_refs(value, out);
            }
        }
        Value::Array(values) => {
            for value in values {
                collect_refs(value, out);
            }
        }
        _ => {}
    }
}

/// Replaces every `$ref` to `layer_ref` inside the definitions reachable from
/// the layer definition (the layer definition included).
fn break_layer_cycle(generator: &mut SchemaGenerator, layer_ref: &str) {
    let definitions = generator.definitions_mut();
    let mut reachable = BTreeSet::new();
    let mut pending = vec![definition_name(layer_ref).to_owned()];
    while let Some(name) = pending.pop() {
        if !reachable.insert(name.clone()) {
            continue;
        }
        if let Some(body) = definitions.get(&name) {
            let mut refs = Vec::new();
            collect_refs(body, &mut refs);
            pending.extend(refs.iter().map(|r| definition_name(r).to_owned()));
        }
    }
    for name in &reachable {
        if let Some(body) = definitions.get_mut(name) {
            replace_layer_ref(body, layer_ref);
        }
    }
}

/// Replaces every node that is a `$ref` to `layer_ref` with a plain object.
fn replace_layer_ref(node: &mut Value, layer_ref: &str) {
    match node {
        Value::Object(map) => {
            if map.get("$ref").and_then(Value::as_str) == Some(layer_ref) {
                *node = serde_json::json!({
                    "type": "object",
                    "description": LAYER_CHILD_DESCRIPTION,
                });
                return;
            }
            for value in map.values_mut() {
                replace_layer_ref(value, layer_ref);
            }
        }
        Value::Array(values) => {
            for value in values {
                replace_layer_ref(value, layer_ref);
            }
        }
        _ => {}
    }
}
