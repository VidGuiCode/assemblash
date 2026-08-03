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

/// Path of the committed schema, relative to the repository root.
pub const SCHEMA_PATH: &str = "schema/document.schema.json";

/// Renders the document JSON Schema as pretty-printed JSON with a trailing
/// newline — byte-for-byte what the committed file must contain.
pub fn document_schema_json() -> String {
    let schema = schemars::schema_for!(Document);
    let mut rendered =
        serde_json::to_string_pretty(&schema).unwrap_or_else(|_| String::from("{}\n"));
    rendered.push('\n');
    rendered
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used)]

    use super::*;

    fn committed_schema_path() -> std::path::PathBuf {
        std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../..")
            .join(SCHEMA_PATH)
    }

    #[test]
    fn committed_schema_matches_the_types() {
        let committed = std::fs::read_to_string(committed_schema_path())
            .expect("schema/document.schema.json is committed");
        // Normalise line endings: the file may arrive through a checkout that
        // rewrites them, and only the content is meaningful.
        assert_eq!(
            committed.replace("\r\n", "\n"),
            document_schema_json(),
            "the committed JSON Schema is out of date — run: \
             cargo run -p assemblash-core --example generate-schema"
        );
    }

    #[test]
    fn schema_describes_a_document() {
        let schema: serde_json::Value = serde_json::from_str(&document_schema_json()).unwrap();
        assert_eq!(schema["title"], "Document");
        assert!(schema["properties"]["schemaVersion"].is_object());
        assert!(schema["properties"]["canvas"].is_object());
    }
}
