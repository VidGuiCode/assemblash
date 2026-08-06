//! Presets: named style bundles stored in the document.
//!
//! # A preset is the properties of an update
//!
//! A preset carries exactly the optional style properties [`UpdateLayer`]
//! already has — font, size, colour, alignment, line height, opacity, blend
//! mode, effect stack. Applying one **builds that same `UpdateLayer`** and
//! hands it to the operation layer.
//!
//! That is what makes "a preset renders identically to the same properties set
//! by hand" true by construction rather than by a test that hopes so. It is
//! the same argument templates use: filling a slot produces ordinary `Update`
//! operations, so a slot cannot reach a protected layer and a fill cannot
//! drift from a hand edit. A preset that computed a style its own way would be
//! a second implementation of what a style is, and second implementations
//! drift.
//!
//! # Why they live in the document
//!
//! A project directory is portable, and this engine's central promise is that
//! a document plus its fonts is what you get. A preset stored beside the
//! workspace would mean the same document renders differently depending on
//! what else happens to be installed next to it — the exact failure the font
//! store exists to prevent. `slots` made the same choice for the same reason.
//!
//! The cost, stated plainly: sharing a preset between projects means copying
//! it.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::{BlendMode, Color, Document, Effect, TextAlign};
use crate::ids::LayerId;
use crate::ops::UpdateLayer;

/// A named bundle of style properties.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    /// What it is called. Unique within a document.
    pub name: String,
    /// What it is for, for whoever is choosing between presets — including an
    /// agent, which is the case that needs it most.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// The properties it sets. Anything left out is left alone on apply.
    pub properties: PresetProperties,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: crate::document::Extras,
}

/// What a preset sets.
///
/// Every field optional, and absent means "leave alone" — so a preset that
/// only names a colour is a colour preset, and applying it does not quietly
/// reset a layer's font.
///
/// Deliberately no transform: a style is not a position. A preset that moved
/// layers would be a template, and templates already exist.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PresetProperties {
    /// Text layers: font family.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// Text layers: font size.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_size: Option<f64>,
    /// Text layers: fill colour.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,
    /// Text layers: horizontal alignment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub align: Option<TextAlign>,
    /// Text layers: line height.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line_height: Option<f64>,
    /// Any layer: opacity.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub opacity: Option<f64>,
    /// Any layer: how it composites.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blend_mode: Option<BlendMode>,
    /// Any layer: the whole effect stack.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub effects: Option<Vec<Effect>>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: crate::document::Extras,
}

impl PresetProperties {
    /// The update that applying this preset to a layer performs.
    ///
    /// The single place a preset turns into a change. Nothing else in the
    /// engine knows how to apply one, which is why applying a preset and
    /// setting the same properties by hand cannot produce different pixels.
    pub fn update_for(&self, id: LayerId, allow_locked: bool) -> UpdateLayer {
        UpdateLayer {
            font_family: self.font_family.clone(),
            font_size: self.font_size,
            color: self.color.clone(),
            align: self.align,
            line_height: self.line_height,
            opacity: self.opacity,
            blend_mode: self.blend_mode.clone(),
            effects: self.effects.clone(),
            allow_locked,
            ..UpdateLayer::new(id)
        }
    }

    /// Whether this preset would change nothing at all.
    pub fn is_empty(&self) -> bool {
        self.font_family.is_none()
            && self.font_size.is_none()
            && self.color.is_none()
            && self.align.is_none()
            && self.line_height.is_none()
            && self.opacity.is_none()
            && self.blend_mode.is_none()
            && self.effects.is_none()
    }
}

/// Finds a preset by name.
pub fn find<'a>(document: &'a Document, name: &str) -> Option<&'a Preset> {
    document.presets.iter().find(|preset| preset.name == name)
}

/// Every preset name, sorted, for error messages and for listing.
pub fn names(document: &Document) -> Vec<String> {
    let mut names: Vec<String> = document
        .presets
        .iter()
        .map(|preset| preset.name.clone())
        .collect();
    names.sort();
    names
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    fn heading() -> Preset {
        Preset {
            name: "heading".to_owned(),
            description: Some("The house headline".to_owned()),
            properties: PresetProperties {
                font_size: Some(48.0),
                color: Some(Color::new("#101820")),
                blend_mode: Some(BlendMode::Multiply),
                effects: Some(vec![Effect::Blur { radius: 1.0 }]),
                ..PresetProperties::default()
            },
            extra: crate::document::Extras::new(),
        }
    }

    #[test]
    fn applying_a_preset_is_the_update_it_describes() {
        // The claim the whole design rests on: there is one way to express a
        // style change, and a preset produces exactly it.
        let preset = heading();
        let update = preset.properties.update_for(LayerId::new("layer_1"), false);

        assert_eq!(update.id, LayerId::new("layer_1"));
        assert_eq!(update.font_size, Some(48.0));
        assert_eq!(update.color, Some(Color::new("#101820")));
        assert_eq!(update.blend_mode, Some(BlendMode::Multiply));
        assert_eq!(update.effects, Some(vec![Effect::Blur { radius: 1.0 }]));
        // Untouched by a style: a preset never moves anything.
        assert_eq!(update.transform, None);
        assert_eq!(update.name, None);
        assert_eq!(update.text, None);
    }

    #[test]
    fn a_property_a_preset_does_not_set_is_left_alone() {
        let preset = Preset {
            name: "just-colour".to_owned(),
            description: None,
            properties: PresetProperties {
                color: Some(Color::new("#ff0000")),
                ..PresetProperties::default()
            },
            extra: crate::document::Extras::new(),
        };
        let update = preset.properties.update_for(LayerId::new("layer_1"), false);
        assert_eq!(update.color, Some(Color::new("#ff0000")));
        assert_eq!(
            update.font_size, None,
            "a colour preset is not a font preset"
        );
        assert_eq!(update.opacity, None);
        assert_eq!(update.effects, None, "and it does not clear the effects");
    }

    #[test]
    fn an_empty_preset_is_recognisable_as_one() {
        assert!(PresetProperties::default().is_empty());
        assert!(!heading().properties.is_empty());
    }

    #[test]
    fn presets_survive_a_round_trip() {
        let preset = heading();
        let json = serde_json::to_string(&preset).unwrap();
        let back: Preset = serde_json::from_str(&json).unwrap();
        assert_eq!(back, preset);

        // And one from a build that knows more than this one keeps what it
        // knew, like every other part of the document.
        let newer = serde_json::json!({
            "name": "future",
            "properties": { "opacity": 0.5, "letterSpacing": 2 },
            "appliesTo": ["text"]
        });
        let loaded: Preset = serde_json::from_value(newer.clone()).unwrap();
        assert_eq!(loaded.properties.opacity, Some(0.5));
        assert_eq!(serde_json::to_value(&loaded).unwrap(), newer);
    }
}
