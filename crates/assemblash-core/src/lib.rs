//! Assemblash core: the document model and the single operation layer.
//!
//! Every mutation of a document goes through this crate — the CLI, the HTTP
//! API, and the MCP server are transports over the same operations (PRD §7.2).

/// The document schema version this build reads and writes.
///
/// Independent of the release version. A breaking schema change bumps this
/// and ships a migration (PRD §16.1).
pub const SCHEMA_VERSION: u32 = 1;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schema_version_is_one() {
        assert_eq!(SCHEMA_VERSION, 1);
    }
}
