//! Which font families a render may use.
//!
//! Fonts are never discovered from the operating system: the same document
//! rendered on two machines must use the same font files, so the caller says
//! explicitly what is available (NFR-1, and the font store in v0.5).

use std::collections::BTreeSet;

/// The font families available to a render.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct FontSet {
    families: BTreeSet<String>,
    accept_any: bool,
}

impl FontSet {
    /// A set containing exactly the given families.
    pub fn new<I, S>(families: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        Self {
            families: families.into_iter().map(Into::into).collect(),
            accept_any: false,
        }
    }

    /// A set that accepts any family name.
    ///
    /// For callers that have not resolved fonts yet — a preview of a document
    /// whose fonts are checked elsewhere. Rasterization still needs real font
    /// files; this only turns off the up-front check.
    pub fn unchecked() -> Self {
        Self {
            families: BTreeSet::new(),
            accept_any: true,
        }
    }

    /// Whether a family may be used.
    pub fn contains(&self, family: &str) -> bool {
        self.accept_any || self.families.contains(family)
    }

    /// The families in the set, sorted.
    pub fn families(&self) -> impl Iterator<Item = &str> {
        self.families.iter().map(String::as_str)
    }

    /// Whether the set names no families at all.
    pub fn is_empty(&self) -> bool {
        !self.accept_any && self.families.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn membership_is_exact_unless_unchecked() {
        let set = FontSet::new(["Inter", "Noto Sans"]);
        assert!(set.contains("Inter"));
        assert!(!set.contains("inter"));
        assert!(!set.contains("Comic Sans MS"));
        assert!(FontSet::unchecked().contains("anything"));
    }

    #[test]
    fn families_are_sorted() {
        let set = FontSet::new(["Zed", "Alpha"]);
        assert_eq!(set.families().collect::<Vec<_>>(), ["Alpha", "Zed"]);
    }
}
