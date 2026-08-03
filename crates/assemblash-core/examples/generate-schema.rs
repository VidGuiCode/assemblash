//! Writes the document JSON Schema to `schema/document.schema.json`.
//!
//! Run after changing the document model:
//!
//! ```text
//! cargo run -p assemblash-core --example generate-schema
//! ```

fn main() -> std::io::Result<()> {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    let path = root.join(assemblash_core::schema::SCHEMA_PATH);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&path, assemblash_core::schema::document_schema_json())?;
    println!("wrote {}", path.display());
    Ok(())
}
