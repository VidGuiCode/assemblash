//! The effect stack, checked by looking at the pixels it produces.
//!
//! Every claim this milestone makes about an effect is made here against a
//! render, not against the markup: an SVG filter that parses and does nothing
//! would pass a string comparison and fail a person.
//!
//! The layer under test is a solid colour, `#4080c0` — (64, 128, 192) — drawn
//! as a 1×1 image stretched over the canvas, so any pixel of it is the
//! effect's answer for that colour.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::PathBuf;

use assemblash_core::document::{Effect, Extras, ImageFit, ImageLayer, Transform};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::{Asset, Color, Document, Layer, LayerKind};
use assemblash_renderer::raster::{font_files_in, LoadedFonts, PngMetadata};
use assemblash_renderer::{document_to_png, AssetHrefs, RenderError};

fn fonts() -> LoadedFonts {
    LoadedFonts::from_files(
        font_files_in(&PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts")).unwrap(),
    )
    .unwrap()
}

fn solid_png(color: &Color) -> Vec<u8> {
    let rgba = color.to_rgba().unwrap();
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, 1, 1);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&rgba).unwrap();
    }
    out
}

const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn base64(bytes: &[u8]) -> String {
    let mut out = String::new();
    for chunk in bytes.chunks(3) {
        let b0 = u32::from(chunk[0]);
        let b1 = chunk.get(1).copied().map_or(0, u32::from);
        let b2 = chunk.get(2).copied().map_or(0, u32::from);
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHABET[(triple >> 18) as usize & 0x3F] as char);
        out.push(ALPHABET[(triple >> 12) as usize & 0x3F] as char);
        out.push(if chunk.len() > 1 {
            ALPHABET[(triple >> 6) as usize & 0x3F] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            ALPHABET[triple as usize & 0x3F] as char
        } else {
            '='
        });
    }
    out
}

/// A 40×40 canvas filled by one image layer carrying the given effects.
fn document(effects: Vec<Effect>) -> (Document, AssetHrefs) {
    let mut doc = Document::new(&mut SequentialIdSource::new(), 40.0, 40.0);
    doc.canvas.background = Some(Color::new("#ffffff"));

    let color = Color::new("#4080c0");
    let asset = AssetId::new("asset_1");
    doc.assets.push(Asset {
        id: asset.clone(),
        path: "solid.png".to_owned(),
        hash: assemblash_core::storage::hash_bytes(&solid_png(&color)),
        media_type: "image/png".to_owned(),
        width: Some(1),
        height: Some(1),
        extra: Extras::new(),
    });
    let mut hrefs = AssetHrefs::new();
    hrefs.insert(
        asset.clone(),
        format!("data:image/png;base64,{}", base64(&solid_png(&color))),
    );

    let mut layer = Layer::new(
        LayerId::new("layer_1"),
        Transform::new(0.0, 0.0, 40.0, 40.0),
        LayerKind::Image(ImageLayer {
            asset,
            fit: ImageFit::Fill,
            extra: Extras::new(),
        }),
    );
    layer.effects = effects;
    doc.layers.push(layer);
    (doc, hrefs)
}

fn decode(png_bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

fn render(effects: Vec<Effect>) -> Vec<u8> {
    let (doc, hrefs) = document(effects);
    let png = document_to_png(
        &doc,
        &fonts(),
        &hrefs,
        1.0,
        &PngMetadata::for_document(&doc),
    )
    .expect("the document renders");
    decode(&png).2
}

/// The pixel at the middle of the canvas, well inside the layer.
fn middle(pixels: &[u8]) -> [u8; 3] {
    let start = ((20 * 40 + 20) * 4) as usize;
    [pixels[start], pixels[start + 1], pixels[start + 2]]
}

#[test]
fn each_effect_does_what_its_name_says() {
    // #4080c0 is (64, 128, 192). The expectations are the arithmetic done in
    // sRGB, which is why the filters declare that space: in SVG's default
    // linearRGB a slope of 1.5 comes out as roughly 1.2 and nobody typing
    // "brightness 1.5" means that.
    assert_eq!(middle(&render(vec![])), [64, 128, 192], "unchanged");

    assert_eq!(
        middle(&render(vec![Effect::Brightness { amount: 1.5 }])),
        [96, 192, 255],
        "brightness scales each channel, clamping at white"
    );
    assert_eq!(
        middle(&render(vec![Effect::Brightness { amount: 0.5 }])),
        [32, 64, 96],
        "and downwards"
    );
    assert_eq!(
        middle(&render(vec![Effect::Contrast { amount: 2.0 }])),
        [0, 128, 255],
        "contrast pushes away from mid grey"
    );
    assert_eq!(
        middle(&render(vec![Effect::Contrast { amount: 0.0 }])),
        [127, 127, 127],
        "contrast 0 is flat mid grey, not black"
    );
    let grey = middle(&render(vec![Effect::Saturation { amount: 0.0 }]));
    assert!(
        grey[0] == grey[1] && grey[1] == grey[2],
        "saturation 0 is grey, got {grey:?}"
    );
}

#[test]
fn the_neutral_value_of_every_effect_changes_nothing() {
    // The property that makes an effect stack usable: turning an effect down
    // to nothing must be the same as not having it. An effect whose "off" is
    // slightly wrong is one that silently degrades every document it touches.
    for neutral in [
        Effect::Brightness { amount: 1.0 },
        Effect::Contrast { amount: 1.0 },
        Effect::Saturation { amount: 1.0 },
        Effect::Blur { radius: 0.0 },
        Effect::Grain {
            amount: 0.0,
            seed: 3,
            scale: 1.0,
        },
    ] {
        assert_eq!(
            middle(&render(vec![neutral.clone()])),
            [64, 128, 192],
            "{neutral:?} should have left the colour alone"
        );
    }
}

#[test]
fn effects_apply_in_order() {
    // Brightening then desaturating is not the same picture as desaturating
    // then brightening, and the stack is a list precisely so a caller can say
    // which they meant.
    let brighten_then_grey = middle(&render(vec![
        Effect::Brightness { amount: 1.5 },
        Effect::Saturation { amount: 0.0 },
    ]));
    let grey_then_brighten = middle(&render(vec![
        Effect::Saturation { amount: 0.0 },
        Effect::Brightness { amount: 1.5 },
    ]));
    assert_ne!(brighten_then_grey, grey_then_brighten);
}

#[test]
fn a_blur_softens_the_edge_without_moving_the_middle() {
    let sharp = render(vec![]);
    let blurred = render(vec![Effect::Blur { radius: 4.0 }]);

    // Deep inside the layer a blur of a flat colour changes nothing...
    assert_eq!(middle(&blurred), middle(&sharp));

    // ...but the boundary at the canvas edge is no longer a step.
    let edge = |pixels: &[u8], x: usize| {
        let start = (20 * 40 + x) * 4;
        [
            pixels[start],
            pixels[start + 1],
            pixels[start + 2],
            pixels[start + 3],
        ]
    };
    assert_ne!(
        edge(&blurred, 0),
        edge(&sharp, 0),
        "the edge should have softened"
    );
}

#[test]
fn grain_is_seeded_and_repeatable() {
    let a = render(vec![Effect::Grain {
        amount: 0.4,
        seed: 11,
        scale: 1.0,
    }]);
    let again = render(vec![Effect::Grain {
        amount: 0.4,
        seed: 11,
        scale: 1.0,
    }]);
    let other_seed = render(vec![Effect::Grain {
        amount: 0.4,
        seed: 12,
        scale: 1.0,
    }]);

    // The whole reason grain is allowed to exist in a renderer that promises
    // byte-identical output: the noise comes from the document, not a clock
    // or a random number generator (NFR-3).
    assert_eq!(a, again, "the same seed must produce the same grain");
    assert_ne!(
        a, other_seed,
        "a different seed must produce different grain"
    );

    // And it is actually noise: many distinct values, spread either side of
    // the colour it grained rather than only darkening it.
    let greens: Vec<u8> = a.chunks_exact(4).map(|pixel| pixel[1]).collect();
    let distinct: std::collections::BTreeSet<u8> = greens.iter().copied().collect();
    assert!(
        distinct.len() > 8,
        "grain looks flat: {} values",
        distinct.len()
    );
    assert!(
        greens.iter().any(|&g| g < 128) && greens.iter().any(|&g| g > 128),
        "grain should lighten as well as darken"
    );
}

#[test]
fn grain_stays_inside_the_layer_it_grains() {
    // A 20×20 layer on a 40×40 canvas: the grain must not spill onto the
    // canvas around it, or an effect would be changing pixels that do not
    // belong to the layer it was applied to.
    let (mut doc, hrefs) = document(vec![Effect::Grain {
        amount: 0.8,
        seed: 5,
        scale: 1.0,
    }]);
    doc.layers[0].transform = Transform::new(0.0, 0.0, 20.0, 20.0);

    let png = document_to_png(
        &doc,
        &fonts(),
        &hrefs,
        1.0,
        &PngMetadata::for_document(&doc),
    )
    .unwrap();
    let (_, _, pixels) = decode(&png);
    let at = |x: usize, y: usize| {
        let start = (y * 40 + x) * 4;
        [pixels[start], pixels[start + 1], pixels[start + 2]]
    };
    assert_eq!(
        at(30, 30),
        [255, 255, 255],
        "the canvas outside is untouched"
    );
    assert_ne!(at(10, 10), [255, 255, 255], "the layer itself is drawn");
}

#[test]
fn an_effect_this_build_cannot_draw_is_refused() {
    // Same bargain as an unknown blend mode: a document from a newer build
    // keeps its effect through a load and save here, and refuses to render
    // rather than drawing something that is not what it says.
    let (doc, hrefs) = document(vec![Effect::Other(serde_json::json!({
        "type": "vignette",
        "strength": 0.5
    }))]);

    let error = document_to_png(
        &doc,
        &fonts(),
        &hrefs,
        1.0,
        &PngMetadata::for_document(&doc),
    )
    .expect_err("an unknown effect must not render");
    let RenderError::UnsupportedEffect { layer, effect } = &error else {
        panic!("expected UnsupportedEffect, got {error:?}");
    };
    assert_eq!(layer.as_str(), "layer_1");
    assert_eq!(effect, "vignette");
}

#[test]
fn rendering_an_effect_twice_gives_identical_bytes() {
    let (doc, hrefs) = document(vec![
        Effect::Brightness { amount: 1.2 },
        Effect::Blur { radius: 1.5 },
        Effect::Grain {
            amount: 0.2,
            seed: 42,
            scale: 2.0,
        },
    ]);
    let metadata = PngMetadata::for_document(&doc);
    let first = document_to_png(&doc, &fonts(), &hrefs, 1.0, &metadata).unwrap();
    let second = document_to_png(&doc, &fonts(), &hrefs, 1.0, &metadata).unwrap();
    assert_eq!(first, second);
}
