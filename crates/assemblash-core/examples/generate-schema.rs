//! Writes the committed JSON Schemas and TypeScript declarations under
//! `schema/`.
//!
//! Run after changing the document model or the operation layer:
//!
//! ```text
//! cargo run -p assemblash-core --example generate-schema
//! ```

use assemblash_core::{schema, typescript};

fn main() -> std::io::Result<()> {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    for (relative, contents) in [
        (schema::SCHEMA_PATH, schema::document_schema_json()),
        (
            schema::OPERATION_SCHEMA_PATH,
            schema::operation_schema_json(),
        ),
        (
            typescript::DOCUMENT_TYPES_PATH,
            typescript::document_types(),
        ),
        (
            typescript::OPERATION_TYPES_PATH,
            typescript::operation_types(),
        ),
    ] {
        let path = root.join(relative);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&path, contents)?;
        println!("wrote {}", path.display());
    }
    Ok(())
}
