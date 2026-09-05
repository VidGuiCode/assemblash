//! TypeScript declarations, generated from the same schemas.
//!
//! The reference UI (v0.9) is TypeScript, and so is most of what will call
//! this API. Hand-written types drift; types generated from the JSON Schema
//! that is itself generated from the Rust cannot. Committed at
//! `schema/*.d.ts`, with a test that fails when they are out of date — the
//! same mechanism the schemas themselves use.
//!
//! The emitter deliberately covers only the constructs `schemars` produces for
//! this project's types. Anything it does not recognise becomes `unknown`
//! rather than a guess: a wrong type is worse than an unhelpful one, because a
//! client would believe it.

use std::fmt::Write as _;

use serde_json::Value;

/// Path of the committed document declarations, relative to the repository
/// root.
pub const DOCUMENT_TYPES_PATH: &str = "schema/document.d.ts";

/// Path of the committed operation declarations.
pub const OPERATION_TYPES_PATH: &str = "schema/operation.d.ts";

/// Renders TypeScript declarations for a JSON Schema.
///
/// `root` names the type the schema's own root becomes.
pub fn declarations(schema_json: &str, root: &str, banner: &str) -> String {
    let schema: Value = match serde_json::from_str(schema_json) {
        Ok(schema) => schema,
        Err(_) => return String::new(),
    };

    let mut out = String::new();
    let _ = writeln!(out, "// {banner}");
    let _ = writeln!(
        out,
        "// Generated from the Rust types — do not edit. Regenerate with:"
    );
    let _ = writeln!(
        out,
        "//   cargo run -p assemblash-core --example generate-schema"
    );
    out.push('\n');

    if let Some(definitions) = schema.get("$defs").and_then(Value::as_object) {
        for (name, definition) in definitions {
            emit_named(&mut out, name, definition);
        }
    }
    emit_named(&mut out, root, &schema);
    out
}

fn emit_named(out: &mut String, name: &str, schema: &Value) {
    if let Some(description) = schema.get("description").and_then(Value::as_str) {
        for line in description.lines() {
            if line.is_empty() {
                let _ = writeln!(out, "///");
            } else {
                let _ = writeln!(out, "/// {line}");
            }
        }
    }
    let _ = writeln!(out, "export type {name} = {};\n", type_of(schema, 0));
}

fn indent(depth: usize) -> String {
    "  ".repeat(depth)
}

fn type_of(schema: &Value, depth: usize) -> String {
    if let Some(reference) = schema.get("$ref").and_then(Value::as_str) {
        let referenced = reference.rsplit('/').next().unwrap_or("unknown").to_owned();
        // A `$ref` with properties beside it is how schemars writes an
        // internally tagged newtype variant: the referenced type *and* the
        // tag. Returning only the reference would drop the discriminant, and a
        // client typed against it would build requests the server refuses.
        if schema.get("properties").is_some() {
            let mut tagged = schema.clone();
            if let Some(object) = tagged.as_object_mut() {
                object.remove("$ref");
            }
            return format!("{referenced} & {}", object_type(&tagged, depth));
        }
        return referenced;
    }

    // A `const` is a single literal value: the tag of a tagged union.
    if let Some(constant) = schema.get("const") {
        return literal(constant);
    }

    if let Some(variants) = schema
        .get("oneOf")
        .or_else(|| schema.get("anyOf"))
        .and_then(Value::as_array)
    {
        let rendered: Vec<String> = variants
            .iter()
            .map(|variant| type_of(variant, depth))
            .collect();
        let union = rendered.join(" | ");

        // Variants *and* properties of its own: a tagged enum flattened next
        // to a struct's ordinary fields, which is exactly how `Layer` is
        // built. Emitting only the union silently dropped every common field —
        // `id`, `transform`, `opacity` — from the generated type, and a client
        // written against it would think a layer had none of them.
        if schema.get("properties").is_some() {
            let mut common = schema.clone();
            if let Some(object) = common.as_object_mut() {
                object.remove("oneOf");
                object.remove("anyOf");
            }
            return format!("({union}) & {}", object_type(&common, depth));
        }
        return union;
    }

    // `allOf` is how schemars expresses a flattened field: everything in the
    // list applies at once.
    if let Some(parts) = schema.get("allOf").and_then(Value::as_array) {
        let rendered: Vec<String> = parts.iter().map(|part| type_of(part, depth)).collect();
        return rendered.join(" & ");
    }

    if let Some(values) = schema.get("enum").and_then(Value::as_array) {
        let rendered: Vec<String> = values.iter().map(literal).collect();
        return rendered.join(" | ");
    }

    match type_name(schema) {
        Some("object") => object_type(schema, depth),
        Some("array") => {
            let items = schema
                .get("items")
                .map(|items| type_of(items, depth))
                .unwrap_or_else(|| "unknown".to_owned());
            if items.contains(' ') {
                format!("({items})[]")
            } else {
                format!("{items}[]")
            }
        }
        Some("string") => "string".to_owned(),
        Some("integer" | "number") => "number".to_owned(),
        Some("boolean") => "boolean".to_owned(),
        Some("null") => "null".to_owned(),
        // No `type` at all: schemars writes this for a field whose Rust type is
        // `serde_json::Value` — a reserved slot this build preserves and does
        // not interpret.
        _ => "unknown".to_owned(),
    }
}

/// The `type` keyword, which may be a string or a list including `"null"`.
fn type_name(schema: &Value) -> Option<&str> {
    match schema.get("type")? {
        Value::String(name) => Some(name),
        Value::Array(names) => names
            .iter()
            .filter_map(Value::as_str)
            .find(|name| *name != "null"),
        _ => None,
    }
}

fn object_type(schema: &Value, depth: usize) -> String {
    let Some(properties) = schema.get("properties").and_then(Value::as_object) else {
        // An object with no declared properties is the catch-all map the
        // document model uses to preserve keys it does not know.
        return "{ [key: string]: unknown }".to_owned();
    };

    let required: Vec<&str> = schema
        .get("required")
        .and_then(Value::as_array)
        .map(|names| names.iter().filter_map(Value::as_str).collect())
        .unwrap_or_default();

    let mut out = String::from("{\n");
    for (name, property) in properties {
        if let Some(description) = property.get("description").and_then(Value::as_str) {
            if let Some(first) = description.lines().next() {
                let _ = writeln!(out, "{}/** {first} */", indent(depth + 1));
            }
        }
        let optional = if required.contains(&name.as_str()) {
            ""
        } else {
            "?"
        };
        let mut rendered = type_of(property, depth + 1);
        // A nullable field is `["string", "null"]` in the schema; in
        // TypeScript that is a union with null, and it is also optional.
        if is_nullable(property) && !rendered.contains("null") {
            rendered = format!("{rendered} | null");
        }
        let _ = writeln!(out, "{}{name}{optional}: {rendered};", indent(depth + 1));
    }
    // Unknown keys are preserved by the document model, so a client that keeps
    // them round-trips too.
    if schema.get("additionalProperties") != Some(&Value::Bool(false)) {
        let _ = writeln!(out, "{}[key: string]: unknown;", indent(depth + 1));
    }
    let _ = write!(out, "{}}}", indent(depth));
    out
}

fn is_nullable(schema: &Value) -> bool {
    match schema.get("type") {
        Some(Value::Array(names)) => names.iter().any(|name| name == "null"),
        _ => false,
    }
}

fn literal(value: &Value) -> String {
    match value {
        Value::String(text) => format!("\"{}\"", text.replace('"', "\\\"")),
        other => other.to_string(),
    }
}

/// The committed document declarations, as this build would write them.
pub fn document_types() -> String {
    declarations(
        &crate::schema::document_schema_json(),
        "Document",
        "Assemblash document model.",
    )
}

/// The committed operation declarations.
pub fn operation_types() -> String {
    declarations(
        &crate::schema::operation_schema_json(),
        "Operation",
        "Assemblash operations — the one mutating input of every transport.",
    )
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    fn committed(relative: &str) -> String {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../..")
            .join(relative);
        std::fs::read_to_string(&path).unwrap_or_else(|_| panic!("{relative} is committed"))
    }

    #[test]
    fn committed_declarations_match_the_types() {
        for (path, generated) in [
            (DOCUMENT_TYPES_PATH, document_types()),
            (OPERATION_TYPES_PATH, operation_types()),
        ] {
            assert_eq!(
                committed(path).replace("\r\n", "\n"),
                generated,
                "{path} is out of date — run: \
                 cargo run -p assemblash-core --example generate-schema"
            );
        }
    }

    #[test]
    fn a_tagged_union_keeps_the_fields_it_sits_beside() {
        // `Layer` is a tagged union of payloads *plus* the fields every layer
        // has. Emitting only the union dropped `id` and `transform` from the
        // type, and a client written against it would not know a layer had
        // them.
        let types = document_types();
        let layer = types
            .split("export type Layer = ")
            .nth(1)
            .and_then(|rest| {
                rest.split(
                    "
export type ",
                )
                .next()
            })
            .unwrap_or_default();
        for field in ["id:", "transform:", "opacity?:", "protected?:"] {
            assert!(
                layer.contains(field),
                "no {field} in:
{layer}"
            );
        }
    }

    #[test]
    fn the_document_declarations_describe_the_document() {
        let types = document_types();
        assert!(types.contains("export type Document = {"), "{types}");
        assert!(types.contains("schemaVersion: number;"), "{types}");
        // Camel case throughout, and no Rust names leaking.
        assert!(!types.contains("font_family"), "{types}");
        assert!(types.contains("fontFamily"), "{types}");
    }

    #[test]
    fn the_operation_declarations_are_a_union_of_tagged_shapes() {
        let types = operation_types();
        assert!(types.contains("export type Operation = "), "{types}");
        for tag in ["\"create\"", "\"align\"", "\"snapTo\""] {
            assert!(types.contains(tag), "no {tag} in:\n{types}");
        }
    }

    #[test]
    fn nothing_recognised_becomes_a_guess() {
        // A schema shape the emitter does not know must come out as
        // `unknown`, never as a type a client would trust.
        let schema = serde_json::json!({ "title": "Mystery" }).to_string();
        assert!(declarations(&schema, "Mystery", "x").contains("export type Mystery = unknown;"));
    }
}
