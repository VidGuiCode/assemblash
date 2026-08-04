//! Stable, prefixed identifiers.
//!
//! Every id is `<prefix>_<ULID>`: the prefix makes an id self-describing in
//! logs and agent conversations, the ULID part is sortable by creation time.
//!
//! Id generation goes through [`IdSource`] rather than calling a random
//! generator directly. Determinism is the product (NFR-1) and tests must be
//! able to produce the same document twice, so the one place that is allowed
//! to be non-deterministic is injected.

use std::fmt;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Source of new identifiers.
///
/// [`UlidIdSource`] is the real one; [`SequentialIdSource`] makes tests and
/// reproducible fixtures possible.
pub trait IdSource {
    /// Returns the unique part of the next id (no prefix).
    fn next_raw(&mut self) -> String;
}

/// Production id source: ULIDs, monotonic within a process.
#[derive(Debug, Default, Clone, Copy)]
pub struct UlidIdSource;

impl IdSource for UlidIdSource {
    fn next_raw(&mut self) -> String {
        ulid::Ulid::generate().to_string()
    }
}

/// Deterministic id source for tests and fixtures: `00000000000000000000000001`,
/// `...02`, and so on — the same length and alphabet as a ULID.
#[derive(Debug, Default, Clone)]
pub struct SequentialIdSource {
    counter: u64,
}

impl SequentialIdSource {
    /// Starts a fresh sequence at 1.
    pub fn new() -> Self {
        Self::default()
    }
}

impl IdSource for SequentialIdSource {
    fn next_raw(&mut self) -> String {
        self.counter += 1;
        format!("{:026}", self.counter)
    }
}

macro_rules! id_type {
    ($name:ident, $prefix:literal, $doc:literal) => {
        #[doc = $doc]
        #[derive(
            Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, JsonSchema,
        )]
        #[serde(transparent)]
        pub struct $name(String);

        impl $name {
            /// The prefix every id of this kind carries.
            pub const PREFIX: &'static str = $prefix;

            /// Generates a new id from the given source.
            pub fn generate(source: &mut dyn IdSource) -> Self {
                Self(format!("{}_{}", Self::PREFIX, source.next_raw()))
            }

            /// Wraps an existing string without checking it.
            ///
            /// Ids arrive from files and from other tools, so parsing must not
            /// reject them here; [`Self::is_well_formed`] is what validation
            /// uses to report a malformed id as a structured error.
            pub fn new(raw: impl Into<String>) -> Self {
                Self(raw.into())
            }

            /// The id as a string slice.
            pub fn as_str(&self) -> &str {
                &self.0
            }

            /// Whether the id has the expected prefix and a non-empty body.
            pub fn is_well_formed(&self) -> bool {
                match self.0.split_once('_') {
                    Some((prefix, body)) => prefix == Self::PREFIX && !body.is_empty(),
                    None => false,
                }
            }
        }

        impl fmt::Display for $name {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                f.write_str(&self.0)
            }
        }
    };
}

id_type!(DocumentId, "doc", "Identifier of a document.");
id_type!(LayerId, "layer", "Identifier of a layer.");
id_type!(AssetId, "asset", "Identifier of an imported asset.");
id_type!(
    TransactionId,
    "txn",
    "Identifier of one history transaction, returned so a write can be undone by id (FR-13)."
);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sequential_source_is_reproducible() {
        let mut a = SequentialIdSource::new();
        let mut b = SequentialIdSource::new();
        assert_eq!(LayerId::generate(&mut a), LayerId::generate(&mut b));
        assert_eq!(
            LayerId::generate(&mut a).as_str(),
            "layer_00000000000000000000000002"
        );
    }

    #[test]
    fn generated_ids_are_well_formed() {
        let mut source = UlidIdSource;
        assert!(DocumentId::generate(&mut source).is_well_formed());
        assert!(AssetId::generate(&mut source).is_well_formed());
    }

    #[test]
    fn wrong_prefix_is_not_well_formed() {
        assert!(!LayerId::new("asset_01J").is_well_formed());
        assert!(!LayerId::new("layer_").is_well_formed());
        assert!(!LayerId::new("nounderscore").is_well_formed());
    }
}
