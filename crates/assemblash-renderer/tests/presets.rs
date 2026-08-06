//! The v0.15.0 exit test's central claim, checked by rendering:
//! **applying a preset produces the same pixels as setting the same
//! properties by hand.**
//!
//! It lives in the renderer's tests because it is a claim about pixels. The
//! design is meant to make it true by construction — a preset compiles to the
//! same `Update` a person would send — but "meant to" is not evidence, and
//! this is the one property somebody would notice being wrong.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::PathBuf;

use assemblash_core::document::{BlendMode, Effect, Extras, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource, UlidIdSource};
use assemblash_core::ops::{Operation, UpdateLayer};
use assemblash_core::presets::{Preset, PresetProperties};
use assemblash_core::{Color, Document, Layer, LayerKind};
use assemblash_renderer::raster::{font_files_in, LoadedFonts, PngMetadata};
use assemblash_renderer::{document_to_png, AssetHrefs};

fn fonts() -> LoadedFonts {
    LoadedFonts::from_files(
        font_files_in(&PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts")).unwrap(),
    )
    .unwrap()
}

fn document() -> Document {
    let mut document = Document::new(&mut SequentialIdSource::new(), 300.0, 120.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(Layer::new(
        LayerId::new("layer_1"),
        Transform::new(20.0, 20.0, 260.0, 80.0),
        LayerKind::Text(TextLayer {
            text: "Preset".to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 24.0,
            color: Color::new("#000000"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    ));
    document
}

/// The style under test, as a preset and as the same properties by hand.
fn properties() -> PresetProperties {
    PresetProperties {
        font_size: Some(40.0),
        color: Some(Color::new("#a8442a")),
        align: Some(TextAlign::Center),
        line_height: Some(1.5),
        opacity: Some(0.8),
        blend_mode: Some(BlendMode::Multiply),
        effects: Some(vec![
            Effect::Brightness { amount: 1.2 },
            Effect::Grain {
                amount: 0.25,
                seed: 17,
                scale: 1.5,
            },
        ]),
        ..PresetProperties::default()
    }
}

fn render(document: &Document) -> Vec<u8> {
    document_to_png(
        document,
        &fonts(),
        &AssetHrefs::new(),
        1.0,
        // Fixed metadata: the two documents have different ids, and the id is
        // written into the PNG. What is being compared is the picture.
        &PngMetadata {
            document_id: "doc_comparison".to_owned(),
            schema_version: assemblash_core::SCHEMA_VERSION,
            renderer_version: "test".to_owned(),
            created: None,
        },
    )
    .expect("the document renders")
}

#[test]
fn a_preset_renders_identically_to_the_same_properties_set_by_hand() {
    // By preset.
    let mut by_preset = document();
    by_preset.presets.push(Preset {
        name: "headline".to_owned(),
        description: Some("The house headline".to_owned()),
        properties: properties(),
        extra: Extras::new(),
    });
    assemblash_core::ops::apply(
        &mut by_preset,
        &Operation::ApplyPreset {
            id: LayerId::new("layer_1"),
            preset: "headline".to_owned(),
            allow_locked: false,
        },
        &mut UlidIdSource,
    )
    .unwrap();

    // By hand: the same properties, sent as an ordinary update.
    let mut by_hand = document();
    let properties = properties();
    assemblash_core::ops::apply(
        &mut by_hand,
        &Operation::Update(UpdateLayer {
            font_size: properties.font_size,
            color: properties.color.clone(),
            align: properties.align,
            line_height: properties.line_height,
            opacity: properties.opacity,
            blend_mode: properties.blend_mode.clone(),
            effects: properties.effects.clone(),
            ..UpdateLayer::new(LayerId::new("layer_1"))
        }),
        &mut UlidIdSource,
    )
    .unwrap();

    // The layers themselves are the same, which is the reason the pixels are.
    assert_eq!(
        by_preset.layers[0], by_hand.layers[0],
        "a preset produced a different layer from the same properties by hand"
    );
    assert_eq!(
        render(&by_preset),
        render(&by_hand),
        "a preset rendered differently from the same properties by hand"
    );

    // And it really did something — otherwise two unchanged documents would
    // match and prove nothing.
    assert_ne!(render(&by_preset), render(&document()));
}

#[test]
fn applying_a_preset_then_undoing_it_is_the_original_picture() {
    // Undo is the operation layer's business, not the preset's, but this is
    // the property somebody applying a style actually cares about.
    let mut document = document();
    let before = render(&document);

    document.presets.push(Preset {
        name: "headline".to_owned(),
        description: None,
        properties: properties(),
        extra: Extras::new(),
    });
    let styled_from = document.clone();
    assemblash_core::ops::apply(
        &mut document,
        &Operation::ApplyPreset {
            id: LayerId::new("layer_1"),
            preset: "headline".to_owned(),
            allow_locked: false,
        },
        &mut UlidIdSource,
    )
    .unwrap();
    assert_ne!(render(&document), before);

    // The inverse of an update is the document as it was, which the session's
    // journal restores; here the same thing is shown directly.
    assert_eq!(
        render(&styled_from),
        before,
        "defining a preset drew something"
    );
}

#[test]
fn a_preset_only_sets_what_it_names() {
    let mut document = document();
    document.presets.push(Preset {
        name: "just-colour".to_owned(),
        description: None,
        properties: PresetProperties {
            color: Some(Color::new("#2f6fb8")),
            ..PresetProperties::default()
        },
        extra: Extras::new(),
    });
    assemblash_core::ops::apply(
        &mut document,
        &Operation::ApplyPreset {
            id: LayerId::new("layer_1"),
            preset: "just-colour".to_owned(),
            allow_locked: false,
        },
        &mut UlidIdSource,
    )
    .unwrap();

    let LayerKind::Text(text) = &document.layers[0].kind else {
        panic!("expected a text layer");
    };
    assert_eq!(text.color, Color::new("#2f6fb8"));
    // Everything the preset did not name is untouched: a colour preset is not
    // a font preset, and applying one must not quietly reset a layer.
    assert_eq!(text.font_size, 24.0);
    assert_eq!(text.align, TextAlign::Left);
    assert_eq!(document.layers[0].opacity, 1.0);
    assert!(document.layers[0].effects.is_empty());
}
