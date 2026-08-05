//! The dependency and licence inventory (PRD §18).
//!
//! §18 asks a public release to carry one. Writing it by hand means it is
//! wrong the first time a dependency changes, so it is rendered from
//! `cargo metadata` and committed, with a test that fails when the two
//! disagree — the same discipline the JSON Schemas and the interface build
//! already use.
//!
//! Rendering is a pure function of the metadata so it can be tested without
//! running cargo, and so this module has no idea how to run a subprocess.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use serde_json::Value;

/// Path of the committed inventory, relative to the repository root.
pub const INVENTORY_PATH: &str = "DEPENDENCIES.md";

/// One dependency, as the inventory lists it.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Entry {
    /// Crate name.
    pub name: String,
    /// Version in the locked graph.
    pub version: String,
    /// SPDX licence expression, or a note that the crate did not state one.
    pub license: String,
}

/// Renders the inventory from `cargo metadata --format-version 1` output.
///
/// Returns `None` if the metadata is not readable, rather than guessing: an
/// inventory assembled from a misparse would be worse than none.
pub fn render(metadata_json: &[u8]) -> Option<String> {
    let metadata: Value = serde_json::from_slice(metadata_json).ok()?;
    let packages = metadata.get("packages")?.as_array()?;

    // The workspace's own crates are the product, not dependencies of it.
    let members: Vec<&str> = metadata
        .get("workspace_members")?
        .as_array()?
        .iter()
        .filter_map(Value::as_str)
        .collect();

    let mut ours: Vec<Entry> = Vec::new();
    let mut theirs: Vec<Entry> = Vec::new();
    for package in packages {
        let name = package.get("name")?.as_str()?.to_owned();
        let version = package.get("version")?.as_str()?.to_owned();
        let license = package
            .get("license")
            .and_then(Value::as_str)
            .map(ToOwned::to_owned)
            .unwrap_or_else(|| {
                // A crate with a licence *file* and no expression is not a
                // mystery, but it is not machine-checkable either, so say so
                // rather than leaving a blank.
                match package.get("license_file").and_then(Value::as_str) {
                    Some(file) => format!("see {file}"),
                    None => "not stated".to_owned(),
                }
            });
        let id = package
            .get("id")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let entry = Entry {
            name,
            version,
            license,
        };
        if members.contains(&id) {
            ours.push(entry);
        } else {
            theirs.push(entry);
        }
    }
    ours.sort();
    theirs.sort();

    // How many crates each licence covers, which is the number a reviewer
    // actually wants first.
    let mut by_license: BTreeMap<&str, usize> = BTreeMap::new();
    for entry in &theirs {
        *by_license.entry(entry.license.as_str()).or_default() += 1;
    }

    let mut out = String::new();
    out.push_str("# Dependency and licence inventory\n\n");
    out.push_str(
        "Generated from `cargo metadata` — do not edit. Regenerate with:\n\n\
         ```sh\ncargo run -p assemblash-core --example generate-inventory\n```\n\n\
         A test fails when this file and the dependency graph disagree, so a\n\
         dependency cannot be added without it appearing here.\n\n\
         Every licence below is on the allowlist in `deny.toml`, which CI\n\
         enforces on every push (PRD R8). Assemblash itself is Apache-2.0.\n\n",
    );

    let _ = writeln!(out, "## Summary\n");
    let _ = writeln!(
        out,
        "{} workspace crates, {} third-party crates in the full dependency graph\n\
         (all features, all targets).\n",
        ours.len(),
        theirs.len()
    );
    let _ = writeln!(out, "| Licence | Crates |");
    let _ = writeln!(out, "| ------- | -----: |");
    for (license, count) in &by_license {
        let _ = writeln!(out, "| {license} | {count} |");
    }

    let _ = writeln!(out, "\n## This project\n");
    let _ = writeln!(out, "| Crate | Version | Licence |");
    let _ = writeln!(out, "| ----- | ------- | ------- |");
    for entry in &ours {
        let _ = writeln!(
            out,
            "| {} | {} | {} |",
            entry.name, entry.version, entry.license
        );
    }

    let _ = writeln!(out, "\n## Dependencies\n");
    let _ = writeln!(out, "| Crate | Version | Licence |");
    let _ = writeln!(out, "| ----- | ------- | ------- |");
    for entry in &theirs {
        let _ = writeln!(
            out,
            "| {} | {} | {} |",
            entry.name, entry.version, entry.license
        );
    }

    Some(out)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    #[test]
    fn unreadable_metadata_produces_nothing_rather_than_a_guess() {
        assert!(render(b"not json").is_none());
        assert!(render(b"{}").is_none());
    }

    #[test]
    fn the_inventory_separates_this_project_from_its_dependencies() {
        let metadata = serde_json::json!({
            "workspace_members": ["path+file:///x#assemblash-core@0.1.0"],
            "packages": [
                {
                    "id": "path+file:///x#assemblash-core@0.1.0",
                    "name": "assemblash-core",
                    "version": "0.1.0",
                    "license": "Apache-2.0"
                },
                {
                    "id": "registry+https://x#serde@1.0.0",
                    "name": "serde",
                    "version": "1.0.0",
                    "license": "MIT OR Apache-2.0"
                },
                {
                    "id": "registry+https://x#odd@0.1.0",
                    "name": "odd",
                    "version": "0.1.0",
                    "license_file": "LICENSE"
                }
            ]
        })
        .to_string();

        let rendered = render(metadata.as_bytes()).unwrap();
        assert!(rendered.contains("| assemblash-core | 0.1.0 | Apache-2.0 |"));
        assert!(rendered.contains("| serde | 1.0.0 | MIT OR Apache-2.0 |"));
        // A crate that states no expression is reported as such, not blank.
        assert!(rendered.contains("| odd | 0.1.0 | see LICENSE |"));
        assert!(rendered.contains("1 workspace crates, 2 third-party crates"));
    }

    #[test]
    fn the_committed_inventory_is_current() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
        let committed = std::fs::read_to_string(root.join(INVENTORY_PATH))
            .expect("DEPENDENCIES.md is committed");

        let metadata = std::process::Command::new(env!("CARGO"))
            .args(["metadata", "--format-version", "1", "--all-features"])
            .current_dir(&root)
            .output()
            .expect("cargo metadata runs");
        assert!(metadata.status.success());

        let rendered = render(&metadata.stdout).expect("metadata is readable");
        assert_eq!(
            committed.replace("\r\n", "\n"),
            rendered,
            "DEPENDENCIES.md is out of date — run: \
             cargo run -p assemblash-core --example generate-inventory"
        );
    }
}
