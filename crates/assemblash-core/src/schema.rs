//! JSON Schema generation for the document model.
//!
//! The generated schema is committed at `schema/document.schema.json` and a
//! test fails when it drifts from the Rust types. That makes every schema
//! change visible in the diff of the pull request that causes it — which is
//! what makes the `schemaVersion` rule (bump + migration, PRD §16.1)
//! enforceable rather than aspirational.
//!
//! Regenerate with:
//!
//! ```text
//! cargo run -p assemblash-core --example generate-schema
//! ```

use crate::document::Document;
use crate::ops::Operation;

/// Path of the committed document schema, relative to the repository root.
pub const SCHEMA_PATH: &str = "schema/document.schema.json";

/// Path of the committed operation schema, relative to the repository root.
///
/// Published for the same reason the document schema is: the HTTP API and the
/// MCP server both take an `Operation` as their one mutating input, so a
/// client needs to know its shape without reading Rust.
pub const OPERATION_SCHEMA_PATH: &str = "schema/operation.schema.json";

/// Renders the document JSON Schema as pretty-printed JSON with a trailing
/// newline — byte-for-byte what the committed file must contain.
pub fn document_schema_json() -> String {
    render(schemars::schema_for!(Document))
}

/// Renders the operation JSON Schema the same way.
pub fn operation_schema_json() -> String {
    render(schemars::schema_for!(Operation))
}

fn render(schema: schemars::Schema) -> String {
    let mut rendered =
        serde_json::to_string_pretty(&schema).unwrap_or_else(|_| String::from("{}\n"));
    rendered.push('\n');
    rendered
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    fn committed_schema_path(relative: &str) -> std::path::PathBuf {
        std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../..")
            .join(relative)
    }

    #[test]
    fn committed_schemas_match_the_types() {
        for (path, generated) in [
            (SCHEMA_PATH, document_schema_json()),
            (OPERATION_SCHEMA_PATH, operation_schema_json()),
        ] {
            let committed = std::fs::read_to_string(committed_schema_path(path))
                .unwrap_or_else(|_| panic!("{path} is committed"));
            // Normalise line endings: the file may arrive through a checkout
            // that rewrites them, and only the content is meaningful.
            assert_eq!(
                committed.replace("\r\n", "\n"),
                generated,
                "{path} is out of date — run: \
                 cargo run -p assemblash-core --example generate-schema"
            );
        }
    }

    #[test]
    fn the_operation_schema_describes_the_tagged_union() {
        let schema: serde_json::Value = serde_json::from_str(&operation_schema_json()).unwrap();
        let text = schema.to_string();
        for op in ["create", "align", "ungroup", "snapTo"] {
            assert!(text.contains(op), "no {op} in the operation schema");
        }
    }

    #[test]
    fn schema_describes_a_document() {
        let schema: serde_json::Value = serde_json::from_str(&document_schema_json()).unwrap();
        assert_eq!(schema["title"], "Document");
        assert!(schema["properties"]["schemaVersion"].is_object());
        assert!(schema["properties"]["canvas"].is_object());
    }
}
