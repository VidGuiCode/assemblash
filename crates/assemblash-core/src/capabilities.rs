//! What this build can do, as data.
//!
//! One listing, in one place, that every surface reads: the CLI's `styles`
//! command, the HTTP API's `/api/capabilities`, and the MCP server's
//! `list_capabilities` tool. It exists because 1.6.0 could render a
//! `dropShadow` while its discovery surfaces said it could not (DEF-24) —
//! discovery that is hand-written per surface drifts from the engine, and
//! the surface an agent reads is the one that lies.
//!
//! The listing is derived from the same sources the renderer is bound to:
//! [`BlendMode::RENDERED`] for compositing and the `Effect` enum's
//! exhaustive per-variant lines for effects. A capability the engine cannot
//! draw cannot appear here, and a new variant cannot compile without a
//! discovery entry.

use schemars::JsonSchema;
use serde::Serialize;

use crate::document::{BlendMode, Effect};

/// What one rendered effect looks like and what a reader needs to know.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct EffectCapability {
    /// The effect's name in a document — the value of its `type`.
    pub kind: String,
    /// An example fragment, exactly as a document would carry it.
    pub example: String,
    /// Short notes: parameter meanings and the measured caveats.
    pub notes: Vec<String>,
}

/// Everything this build renders, in listing order.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Capabilities {
    /// The blend modes a layer may composite with.
    pub blend_modes: Vec<String>,
    /// The effects a layer's stack may carry.
    pub effects: Vec<EffectCapability>,
}

/// The canonical capability listing for this build.
pub fn capabilities() -> Capabilities {
    Capabilities {
        blend_modes: BlendMode::RENDERED
            .iter()
            .map(BlendMode::as_str)
            .map(str::to_owned)
            .collect(),
        effects: Effect::rendered_examples()
            .iter()
            .filter_map(|effect| {
                effect.styles_example().map(|example| EffectCapability {
                    kind: effect.type_name().to_owned(),
                    example: example.to_owned(),
                    notes: effect
                        .styles_notes()
                        .iter()
                        .map(|s| (*s).to_owned())
                        .collect(),
                })
            })
            .collect(),
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn every_rendered_effect_appears_with_an_example() {
        let capabilities = capabilities();
        assert_eq!(capabilities.blend_modes.len(), BlendMode::RENDERED.len());
        // The listing is exhaustive by construction — `styles_example` and
        // `styles_notes` are non-wildcard matches — so this asserts the
        // plumbing, not the enum.
        assert_eq!(
            capabilities.effects.len(),
            Effect::rendered_examples().len()
        );
        assert!(capabilities
            .effects
            .iter()
            .all(|effect| !effect.example.is_empty()));
    }

    #[test]
    fn drop_shadow_is_advertised_with_its_fields() {
        let capabilities = capabilities();
        let shadow = capabilities
            .effects
            .iter()
            .find(|effect| effect.kind == "dropShadow")
            .unwrap();
        assert!(shadow.example.contains("dropShadow"));
        assert!(shadow.example.contains("dx"));
        assert!(!shadow.notes.is_empty());
    }
}
