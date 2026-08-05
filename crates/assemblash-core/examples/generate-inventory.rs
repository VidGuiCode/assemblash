//! Writes `DEPENDENCIES.md` — the inventory PRD §18 asks for.
//!
//! Generated from `cargo metadata`, not typed by hand, because an inventory
//! that has to be maintained by remembering is an inventory that is wrong. A
//! test compares the committed file with what this produces, so a dependency
//! added without updating it fails CI.
//!
//! ```text
//! cargo run -p assemblash-core --example generate-inventory
//! ```

fn main() -> std::io::Result<()> {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    let path = root.join(assemblash_core::inventory::INVENTORY_PATH);

    let metadata = std::process::Command::new(env!("CARGO"))
        .args(["metadata", "--format-version", "1", "--all-features"])
        .current_dir(&root)
        .output()?;
    if !metadata.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&metadata.stderr));
        return Err(std::io::Error::other("cargo metadata failed"));
    }

    let rendered = assemblash_core::inventory::render(&metadata.stdout)
        .ok_or_else(|| std::io::Error::other("cargo metadata was not readable"))?;
    std::fs::write(&path, rendered)?;
    println!("wrote {}", path.display());
    Ok(())
}
