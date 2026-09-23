//! The Phase 0 renderer gate (PRD §13, `v0.1.0-plan.md` step 7).
//!
//! Four questions, each answered by running something rather than reasoning
//! about it:
//!
//! * **G1** — does a document survive save, reload, and render with the same
//!   pixels?
//! * **G2** — are those pixels the same on Windows and Linux, x86_64 and
//!   aarch64? The golden hashes in `tests/gate/goldens.json` are committed,
//!   and every CI target checks itself against them. A platform that differs
//!   fails here.
//! * **G3** — is non-Latin text shaped correctly: right-to-left Arabic with
//!   joining, Japanese, and combining diacritics?
//! * **G4** — do a blend mode and a Gaussian blur rasterize, so the v1.x
//!   effect stack is not built on a renderer that cannot do it?
//!
//! Regenerate the goldens deliberately, and look at the images, with:
//!
//! ```text
//! UPDATE_GATE=1 cargo test -p assemblash-renderer --test gate
//! ```
//!
//! That also writes the rendered PNGs to `target/gate/` for inspection.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::collections::BTreeMap;
use std::path::PathBuf;

use assemblash_core::document::{
    Clip, Crop, Effect, Extras, GroupLayer, ImageFit, ImageLayer, ShapeKind, ShapeLayer, Stroke,
    TextAlign, TextLayer, Transform,
};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::storage::{self, hash_bytes};
use assemblash_core::{Color, Document, Layer, LayerKind};
use assemblash_renderer::raster::{font_files_in, LoadedFonts, PngMetadata};
use assemblash_renderer::{doc_to_svg, document_to_png, svg_to_pixmap, AssetHrefs};

fn manifest_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn fonts() -> LoadedFonts {
    LoadedFonts::from_files(font_files_in(&manifest_dir().join("tests/fonts")).unwrap()).unwrap()
}

fn updating() -> bool {
    std::env::var_os("UPDATE_GATE").is_some()
}

/// A 4x4 image with hard colour edges, so scaling and fit are visible.
fn swatch_png() -> Vec<u8> {
    let mut pixels = Vec::new();
    for y in 0..4u8 {
        for x in 0..4u8 {
            let on = (x + y) % 2 == 0;
            pixels.extend_from_slice(if on {
                &[220, 40, 40, 255]
            } else {
                &[40, 80, 220, 255]
            });
        }
    }
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, 4, 4);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&pixels).unwrap();
    }
    out
}

fn text_layer(
    id: &str,
    transform: Transform,
    body: &str,
    family: &str,
    size: f64,
    align: TextAlign,
) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: family.to_owned(),
            font_size: size,
            color: Some(Color::new("#101820")),
            align,
            line_height: 1.4,
            font_weight: 400,
            font_style: assemblash_core::FontStyle::Normal,
            letter_spacing: 0.0,
            stroke: None,
            vertical_align: assemblash_core::VerticalAlign::Top,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

/// The composite document: text, an image, a nested group, rotation, and
/// partial opacity in one picture.
fn mixed_document() -> (Document, AssetHrefs) {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 480.0, 320.0);
    document.canvas.background = Some(Color::new("#f6f4ef"));

    let asset = assemblash_core::Asset {
        id: AssetId::new("asset_00000000000000000000000001"),
        path: "swatch.png".to_owned(),
        hash: hash_bytes(&swatch_png()),
        media_type: "image/png".to_owned(),
        width: Some(4),
        height: Some(4),
        extra: Extras::new(),
    };
    let asset_id = asset.id.clone();
    document.assets.push(asset);

    document.layers.push(text_layer(
        "layer_00000000000000000000000001",
        Transform::new(24.0, 24.0, 432.0, 120.0),
        "Assemblash\nlayer stack",
        "Noto Sans",
        44.0,
        TextAlign::Left,
    ));

    let mut group = Layer::new(
        LayerId::new("layer_00000000000000000000000002"),
        Transform {
            rotation: 12.0,
            ..Transform::new(24.0, 160.0, 432.0, 130.0)
        },
        LayerKind::Group(GroupLayer {
            children: vec![
                Layer::new(
                    LayerId::new("layer_00000000000000000000000003"),
                    Transform::new(0.0, 0.0, 120.0, 120.0),
                    LayerKind::Image(ImageLayer {
                        asset: asset_id.clone(),
                        fit: ImageFit::Cover,
                        crop: None,
                        extra: Extras::new(),
                    }),
                ),
                text_layer(
                    "layer_00000000000000000000000004",
                    Transform::new(140.0, 30.0, 280.0, 60.0),
                    "grouped, rotated",
                    "Noto Sans",
                    28.0,
                    TextAlign::Center,
                ),
            ],
            extra: Extras::new(),
        }),
    );
    group.opacity = 0.85;
    document.layers.push(group);

    let hrefs = AssetHrefs::from([(
        asset_id,
        format!("data:image/png;base64,{}", base64(&swatch_png())),
    )]);
    (document, hrefs)
}

/// Latin: multi-line, all three alignments, and combining diacritics.
fn latin_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 300.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let samples = [
        ("Handgloves\nsecond line", TextAlign::Left),
        ("centred", TextAlign::Center),
        // e + combining acute, a + combining diaeresis, c + combining cedilla.
        ("e\u{0301} a\u{0308} c\u{0327}", TextAlign::Right),
    ];
    for (index, (body, align)) in samples.into_iter().enumerate() {
        document.layers.push(text_layer(
            &format!("layer_{:026}", index + 1),
            Transform::new(20.0, 20.0 + 95.0 * index as f64, 440.0, 90.0),
            body,
            "Noto Sans",
            34.0,
            align,
        ));
    }
    (document, AssetHrefs::new())
}

/// Arabic: right-to-left, with letters that must join.
fn arabic_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 160.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(text_layer(
        "layer_00000000000000000000000001",
        Transform::new(20.0, 30.0, 440.0, 100.0),
        "مرحبا بالعالم",
        "Noto Sans Arabic",
        44.0,
        TextAlign::Right,
    ));
    (document, AssetHrefs::new())
}

/// Japanese.
fn japanese_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 160.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(text_layer(
        "layer_00000000000000000000000001",
        Transform::new(20.0, 30.0, 440.0, 100.0),
        "こんにちは世界",
        "Noto Sans JP",
        40.0,
        TextAlign::Left,
    ));
    (document, AssetHrefs::new())
}

/// One blend mode, over one background.
///
/// One document per mode rather than a grid of sixteen: when a target
/// disagrees, the failure has to name the mode, or the next person is left
/// bisecting a picture. Blending is a compositing path in the rasterizer, and
/// compositing is exactly where a machine's SIMD dispatch can change the
/// arithmetic.
fn blend_mode_document(mode: &assemblash_core::BlendMode) -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 120.0, 120.0);
    document.canvas.background = Some(Color::new("#204060"));

    let asset_id = AssetId::new("asset_00000000000000000000000001");
    document.assets.push(assemblash_core::Asset {
        id: asset_id.clone(),
        path: "swatch.png".to_owned(),
        hash: storage::hash_bytes(&swatch_png()),
        media_type: "image/png".to_owned(),
        width: Some(4),
        height: Some(4),
        extra: Extras::new(),
    });

    let mut layer = Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(10.0, 10.0, 100.0, 100.0),
        LayerKind::Image(ImageLayer {
            asset: asset_id.clone(),
            fit: ImageFit::Fill,
            crop: None,
            extra: Extras::new(),
        }),
    );
    layer.blend_mode = mode.clone();
    document.layers.push(layer);

    let hrefs = AssetHrefs::from([(
        asset_id,
        format!("data:image/png;base64,{}", base64(&swatch_png())),
    )]);
    (document, hrefs)
}

/// Every effect, alone and stacked — including seeded grain.
///
/// Grain is the one that matters most here: `feTurbulence` is specified down
/// to its integer arithmetic, and this is what proves the same seed really
/// does produce the same noise on all six targets rather than merely being
/// expected to (NFR-3).
fn effects_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 320.0, 260.0);
    document.canvas.background = Some(Color::new("#ffffff"));

    let asset_id = AssetId::new("asset_00000000000000000000000001");
    document.assets.push(assemblash_core::Asset {
        id: asset_id.clone(),
        path: "swatch.png".to_owned(),
        hash: storage::hash_bytes(&swatch_png()),
        media_type: "image/png".to_owned(),
        width: Some(4),
        height: Some(4),
        extra: Extras::new(),
    });

    let stacks = [
        vec![Effect::Brightness {
            amount: 1.4,
            extra: Extras::new(),
        }],
        vec![Effect::Contrast {
            amount: 1.8,
            extra: Extras::new(),
        }],
        vec![Effect::Saturation {
            amount: 0.0,
            extra: Extras::new(),
        }],
        vec![Effect::Blur {
            radius: 3.0,
            extra: Extras::new(),
        }],
        vec![Effect::Grain {
            amount: 0.35,
            seed: 7,
            scale: 1.0,
            extra: Extras::new(),
        }],
        vec![
            Effect::Brightness {
                amount: 1.2,
                extra: Extras::new(),
            },
            Effect::Saturation {
                amount: 0.4,
                extra: Extras::new(),
            },
            Effect::Grain {
                amount: 0.2,
                seed: 99,
                scale: 2.5,
                extra: Extras::new(),
            },
        ],
    ];

    for (index, effects) in stacks.into_iter().enumerate() {
        let column = (index % 3) as f64;
        let row = (index / 3) as f64;
        let mut layer = Layer::new(
            LayerId::new(format!("layer_{:026}", index + 1)),
            Transform::new(15.0 + column * 100.0, 15.0 + row * 120.0, 90.0, 100.0),
            LayerKind::Image(ImageLayer {
                asset: asset_id.clone(),
                fit: ImageFit::Fill,
                crop: None,
                extra: Extras::new(),
            }),
        );
        layer.effects = effects;
        document.layers.push(layer);
    }

    // One text layer under an effect too: a filter over glyphs takes a
    // different path through the rasterizer than one over an image.
    let mut text = text_layer(
        "layer_00000000000000000000000009",
        Transform::new(15.0, 200.0, 290.0, 50.0),
        "Effects",
        "Noto Sans",
        36.0,
        TextAlign::Left,
    );
    text.effects = vec![Effect::Blur {
        radius: 1.2,
        extra: Extras::new(),
    }];
    document.layers.push(text);

    let hrefs = AssetHrefs::from([(
        asset_id,
        format!("data:image/png;base64,{}", base64(&swatch_png())),
    )]);
    (document, hrefs)
}

fn shape_layer(
    index: usize,
    transform: Transform,
    kind: ShapeKind,
    fill: Option<&str>,
    stroke: Option<(&str, f64)>,
) -> Layer {
    Layer::new(
        LayerId::new(format!("layer_{index:026}")),
        transform,
        LayerKind::Shape(ShapeLayer {
            shape: kind,
            fill: fill.map(Color::new),
            stroke: stroke.map(|(color, width)| Stroke {
                color: Color::new(color),
                width,
                dash_array: None,
                line_cap: None,
                line_join: None,
                extra: Extras::new(),
            }),
            extra: Extras::new(),
        }),
    )
}

/// Every branch the shape emitter and the shape raster path can take.
///
/// The cases are not decoration; each one is a place where two targets could
/// disagree, taken from the 1.6.0 stroker spike:
///
/// * a **square-cornered** rect and a **rounded** one, because usvg takes a
///   completely different branch when there is no corner arc, so a golden with
///   only rounded corners covers neither;
/// * a corner radius **near 367 user units** — the radius at which kurbo's
///   `powf(1/6).ceil()` flips the number of cubics it generates for a
///   quadrant, i.e. the one place a platform-libm ULP could change a path's
///   *structure* rather than nudge it. This renderer no longer emits `rx`, so
///   kurbo is off our path entirely and nothing should be sensitive here any
///   more — the case is kept deliberately as a **canary**: if a target ever
///   disagrees about this document and no other, the arc conversion has crept
///   back in;
/// * an **ellipse**, four cubic quadrants of it;
/// * a **rotated** shape, which resolves its `rotate()` through svgtypes'
///   `sin`/`cos`;
/// * a stroke **below 1 px**, which tiny-skia draws as a hairline rather than
///   running the stroker at all;
/// * a stroke **wider than its box**, which is the clamp cliff;
/// * fractional coordinates throughout, and alpha in a fill and in a stroke.
fn shapes_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 1200.0, 800.0);
    document.canvas.background = Some(Color::new("#ffffff"));

    // The kurbo canary. The radius survives the clamp only because the box is
    // larger than 734 on its shorter side.
    document.layers.push(shape_layer(
        1,
        Transform::new(20.5, 20.25, 760.75, 750.5),
        ShapeKind::Rect {
            corner_radius: 366.9,
            extra: Extras::new(),
        },
        Some("#3366cc40"),
        None,
    ));

    // Square corners, no arc anywhere.
    document.layers.push(shape_layer(
        2,
        Transform::new(800.25, 20.75, 180.5, 90.25),
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some("#3366cc"),
        Some(("#112233", 3.0)),
    ));

    // Rounded, with an alpha fill.
    document.layers.push(shape_layer(
        3,
        Transform::new(800.25, 130.5, 180.5, 90.25),
        ShapeKind::Rect {
            corner_radius: 18.75,
            extra: Extras::new(),
        },
        Some("#cc6633aa"),
        Some(("#112233", 3.0)),
    ));

    // Hairline: below one device pixel the stroker is bypassed entirely.
    document.layers.push(shape_layer(
        4,
        Transform::new(800.25, 240.5, 180.5, 90.25),
        ShapeKind::Ellipse {
            extra: Extras::new(),
        },
        None,
        Some(("#204060", 0.5)),
    ));

    // A rotated line, and a rotated rect: two different rotate() centres.
    document.layers.push(shape_layer(
        5,
        Transform {
            rotation: 17.5,
            ..Transform::new(800.25, 350.5, 180.5, 40.25)
        },
        ShapeKind::Line {
            marker_start: None,
            marker_end: None,
            extra: Extras::new(),
        },
        None,
        Some(("#8b1a1a", 4.0)),
    ));
    document.layers.push(shape_layer(
        6,
        Transform {
            rotation: 30.0,
            ..Transform::new(820.5, 430.75, 140.25, 100.5)
        },
        ShapeKind::Rect {
            corner_radius: 8.5,
            extra: Extras::new(),
        },
        Some("#2e8b57"),
        // Alpha in a stroke.
        Some(("#11223380", 5.0)),
    ));

    // The clamp cliff: 90 is wider than the 60.5 shorter side, so this draws
    // as the whole box filled in the stroke colour.
    document.layers.push(shape_layer(
        7,
        Transform::new(820.5, 580.5, 120.25, 60.5),
        ShapeKind::Rect {
            corner_radius: 4.0,
            extra: Extras::new(),
        },
        Some("#000000"),
        Some(("#d2691e", 90.0)),
    ));

    (document, AssetHrefs::new())
}

/// Both blur implementations, both offset shapes, and a shadow over glyphs.
///
/// σ 1.5 and σ 8 straddle resvg's `BLUR_SIGMA_THRESHOLD` of 2.0: below it the
/// IIR blur runs, above it a five-pass box blur. They are different code, so
/// one of them alone would not cover the other.
fn shadow_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 600.0, 420.0);
    document.canvas.background = Some(Color::new("#ffffff"));

    // IIR branch, and a non-integer dx the filter has to resample.
    let mut small_sigma = shape_layer(
        1,
        Transform::new(40.5, 30.5, 120.25, 80.5),
        ShapeKind::Rect {
            corner_radius: 6.0,
            extra: Extras::new(),
        },
        Some("#3366cc"),
        None,
    );
    small_sigma.effects = vec![Effect::DropShadow {
        dx: 6.5,
        dy: 4.0,
        blur: 1.5,
        color: Color::new("#000000"),
        extra: Extras::new(),
    }];
    document.layers.push(small_sigma);

    // Box-blur branch, with an alpha shadow colour.
    let mut large_sigma = shape_layer(
        2,
        Transform::new(240.5, 30.5, 120.25, 80.5),
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some("#cc3366"),
        None,
    );
    large_sigma.effects = vec![Effect::DropShadow {
        dx: 12.0,
        dy: 10.0,
        blur: 8.0,
        color: Color::new("#20406080"),
        extra: Extras::new(),
    }];
    document.layers.push(large_sigma);

    // A glow is the same primitive with no offset; there is no second one.
    let mut glow = shape_layer(
        3,
        Transform::new(440.5, 30.5, 120.25, 80.5),
        ShapeKind::Ellipse {
            extra: Extras::new(),
        },
        Some("#2e8b57"),
        None,
    );
    glow.effects = vec![Effect::DropShadow {
        dx: 0.0,
        dy: 0.0,
        blur: 6.0,
        color: Color::new("#ff8000"),
        extra: Extras::new(),
    }];
    document.layers.push(glow);

    // Stacked after a blur: the shadow is cast from the blurred result, and
    // the region has to be sized from the larger of the two sigmas.
    let mut stacked = shape_layer(
        4,
        Transform::new(40.5, 180.5, 200.5, 90.25),
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some("#204060"),
        None,
    );
    stacked.effects = vec![
        Effect::Blur {
            radius: 2.0,
            extra: Extras::new(),
        },
        Effect::DropShadow {
            dx: 8.0,
            dy: 8.0,
            blur: 4.0,
            color: Color::new("#000000"),
            extra: Extras::new(),
        },
    ];
    document.layers.push(stacked);

    // A filter over glyphs takes a different path through the rasterizer than
    // one over a shape.
    let mut text = text_layer(
        "layer_00000000000000000000000005",
        Transform::new(40.5, 310.5, 520.25, 80.0),
        "Shadowed",
        "Noto Sans",
        40.0,
        TextAlign::Left,
    );
    text.effects = vec![Effect::DropShadow {
        dx: 3.5,
        dy: 3.5,
        blur: 2.5,
        color: Color::new("#00000099"),
        extra: Extras::new(),
    }];
    document.layers.push(text);

    (document, AssetHrefs::new())
}

/// A text layer carrying 1.7.0 typography, for the four typographic gates.
#[allow(clippy::too_many_arguments)]
fn typography_layer(
    index: usize,
    transform: Transform,
    body: &str,
    family: &str,
    size: f64,
    weight: u16,
    style: assemblash_core::FontStyle,
    spacing: f64,
    stroke: Option<Stroke>,
    valign: assemblash_core::VerticalAlign,
) -> Layer {
    Layer::new(
        LayerId::new(format!("layer_{index:026}")),
        transform,
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: family.to_owned(),
            font_size: size,
            color: Some(Color::new("#101820")),
            align: TextAlign::Left,
            line_height: 1.4,
            font_weight: weight,
            font_style: style,
            letter_spacing: spacing,
            stroke,
            vertical_align: valign,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

/// Weight: 400 and 700 of the same family in the same picture.
///
/// This is the face-keyed selection the 1.7.0 font set exists for: both faces
/// come from the same committed fixtures (`NotoSans-Subset.ttf` and
/// `NotoSans-Bold-Subset.ttf`, instanced from the variable font the bundled
/// manifest pins), so what the golden proves is that the renderer resolves
/// the exact face a layer names, deterministically.
fn text_weight_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 240.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(typography_layer(
        1,
        Transform::new(20.0, 24.0, 440.0, 90.0),
        "Regular weight",
        "Noto Sans",
        36.0,
        400,
        assemblash_core::FontStyle::Normal,
        0.0,
        None,
        assemblash_core::VerticalAlign::Top,
    ));
    document.layers.push(typography_layer(
        2,
        Transform::new(20.0, 120.0, 440.0, 90.0),
        "Bold weight",
        "Noto Sans",
        36.0,
        700,
        assemblash_core::FontStyle::Normal,
        0.0,
        None,
        assemblash_core::VerticalAlign::Top,
    ));
    (document, AssetHrefs::new())
}

/// Stroke: a centred stroke over a fill, and a hollow line (no fill).
fn text_stroke_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 240.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    // Fill first, stroke over it (paint-order="stroke" put the stroke *under*
    // the fill — either way the centre is what is being pinned, D5).
    document.layers.push(typography_layer(
        1,
        Transform::new(20.0, 24.0, 440.0, 90.0),
        "Stroked fill",
        "Noto Sans",
        36.0,
        400,
        assemblash_core::FontStyle::Normal,
        0.0,
        Some(Stroke {
            color: Color::new("#cc3344"),
            width: 2.5,
            dash_array: None,
            line_cap: None,
            line_join: None,
            extra: Extras::new(),
        }),
        assemblash_core::VerticalAlign::Top,
    ));
    // Hollow: no fill at all, the stroke is the whole letter.
    let mut hollow = typography_layer(
        2,
        Transform::new(20.0, 120.0, 440.0, 90.0),
        "Hollow outline",
        "Noto Sans",
        36.0,
        400,
        assemblash_core::FontStyle::Normal,
        0.0,
        Some(Stroke {
            color: Color::new("#101820"),
            width: 1.5,
            dash_array: None,
            line_cap: None,
            line_join: None,
            extra: Extras::new(),
        }),
        assemblash_core::VerticalAlign::Top,
    );
    if let LayerKind::Text(text) = &mut hollow.kind {
        text.color = None;
    }
    document.layers.push(hollow);
    (document, AssetHrefs::new())
}

/// Letter spacing: tracked Latin, and Arabic that usvg shapes without it.
fn text_spacing_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 240.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(typography_layer(
        1,
        Transform::new(20.0, 24.0, 440.0, 90.0),
        "tracked caption",
        "Noto Sans",
        36.0,
        400,
        assemblash_core::FontStyle::Normal,
        6.0,
        None,
        assemblash_core::VerticalAlign::Top,
    ));
    // Arabic ignores inter-character spacing by usvg's shaping rule; the
    // document demonstrates that it still renders, joined and right-to-left.
    document.layers.push(typography_layer(
        2,
        Transform::new(20.0, 120.0, 440.0, 90.0),
        "مرحبا بالعالم",
        "Noto Sans Arabic",
        36.0,
        400,
        assemblash_core::FontStyle::Normal,
        6.0,
        None,
        assemblash_core::VerticalAlign::Top,
    ));
    (document, AssetHrefs::new())
}

/// Vertical alignment: top, middle and bottom in identical boxes.
fn text_valign_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 360.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    for (index, valign) in [
        assemblash_core::VerticalAlign::Top,
        assemblash_core::VerticalAlign::Middle,
        assemblash_core::VerticalAlign::Bottom,
    ]
    .into_iter()
    .enumerate()
    {
        document.layers.push(typography_layer(
            index + 1,
            Transform::new(20.0, 20.0 + 110.0 * index as f64, 440.0, 100.0),
            "vertical",
            "Noto Sans",
            36.0,
            400,
            assemblash_core::FontStyle::Normal,
            0.0,
            None,
            valign,
        ));
    }
    (document, AssetHrefs::new())
}

/// The 4x4 swatch as a document asset, and the href map that resolves it.
fn add_swatch(document: &mut Document) -> (AssetId, AssetHrefs) {
    let asset_id = AssetId::new("asset_00000000000000000000000001");
    document.assets.push(assemblash_core::Asset {
        id: asset_id.clone(),
        path: "swatch.png".to_owned(),
        hash: hash_bytes(&swatch_png()),
        media_type: "image/png".to_owned(),
        width: Some(4),
        height: Some(4),
        extra: Extras::new(),
    });
    let hrefs = AssetHrefs::from([(
        asset_id.clone(),
        format!("data:image/png;base64,{}", base64(&swatch_png())),
    )]);
    (asset_id, hrefs)
}

fn image_layer(index: usize, transform: Transform, asset: &AssetId, fit: ImageFit) -> Layer {
    Layer::new(
        LayerId::new(format!("layer_{index:026}")),
        transform,
        LayerKind::Image(ImageLayer {
            asset: asset.clone(),
            fit,
            crop: None,
            extra: Extras::new(),
        }),
    )
}

/// Clips: a rounded rectangle over a photo and over a shape, a rotated clipped
/// layer, and a clipped layer carrying a drop shadow.
///
/// The last two are the spike's proof cases. The shadow must follow the
/// clipped silhouette, and a rotated layer's mask must stay on the box in its
/// parent's space rather than turning with the content.
fn clip_rounded_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 470.0);
    document.canvas.background = Some(Color::new("#f6f4ef"));
    let (asset, hrefs) = add_swatch(&mut document);

    let mut photo = image_layer(
        1,
        Transform::new(24.0, 24.0, 150.0, 150.0),
        &asset,
        ImageFit::Cover,
    );
    photo.clip = Some(Clip::Rect {
        corner_radius: 28.0,
        extra: Extras::new(),
    });
    document.layers.push(photo);

    let mut stadium = shape_layer(
        2,
        Transform::new(200.0, 24.0, 150.0, 90.0),
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some("#2f6f4f"),
        None,
    );
    // A radius larger than half the box clamps to a stadium, not a refusal.
    stadium.clip = Some(Clip::Rect {
        corner_radius: 400.0,
        extra: Extras::new(),
    });
    document.layers.push(stadium);

    let mut rotated = image_layer(
        3,
        Transform {
            rotation: 30.0,
            ..Transform::new(40.0, 200.0, 150.0, 110.0)
        },
        &asset,
        ImageFit::Fill,
    );
    rotated.clip = Some(Clip::Rect {
        corner_radius: 16.0,
        extra: Extras::new(),
    });
    document.layers.push(rotated);

    let mut shadowed = shape_layer(
        4,
        Transform::new(240.0, 195.0, 180.0, 90.0),
        ShapeKind::Rect {
            corner_radius: 8.0,
            extra: Extras::new(),
        },
        Some("#3366cc"),
        None,
    );
    shadowed.clip = Some(Clip::Rect {
        corner_radius: 20.0,
        extra: Extras::new(),
    });
    shadowed.effects = vec![Effect::DropShadow {
        dx: 8.0,
        dy: 12.0,
        blur: 5.0,
        color: Color::new("#00000099"),
        extra: Extras::new(),
    }];
    document.layers.push(shadowed);

    // A clipped group, and a clipped group that is also rotated: a group's
    // mask is written in the group's own space, so the compensation and the
    // subtree both have to be right.
    let mut group = Layer::new(
        LayerId::new(format!("layer_{:026}", 5)),
        Transform::new(24.0, 330.0, 200.0, 110.0),
        LayerKind::Group(GroupLayer {
            children: vec![
                shape_layer(
                    7,
                    Transform::new(0.0, 0.0, 200.0, 110.0),
                    ShapeKind::Rect {
                        corner_radius: 0.0,
                        extra: Extras::new(),
                    },
                    Some("#2f6f4f"),
                    None,
                ),
                shape_layer(
                    8,
                    Transform::new(40.0, 20.0, 120.0, 70.0),
                    ShapeKind::Ellipse {
                        extra: Extras::new(),
                    },
                    Some("#e0b23c"),
                    None,
                ),
            ],
            extra: Extras::new(),
        }),
    );
    group.clip = Some(Clip::Rect {
        corner_radius: 24.0,
        extra: Extras::new(),
    });
    document.layers.push(group);

    let mut rotated_group = Layer::new(
        LayerId::new(format!("layer_{:026}", 6)),
        Transform {
            rotation: 15.0,
            ..Transform::new(256.0, 330.0, 200.0, 110.0)
        },
        LayerKind::Group(GroupLayer {
            children: vec![
                image_layer(
                    9,
                    Transform::new(0.0, 0.0, 200.0, 110.0),
                    &asset,
                    ImageFit::Cover,
                ),
                shape_layer(
                    10,
                    Transform::new(20.0, 20.0, 70.0, 70.0),
                    ShapeKind::Ellipse {
                        extra: Extras::new(),
                    },
                    Some("#cc3366"),
                    None,
                ),
            ],
            extra: Extras::new(),
        }),
    );
    rotated_group.clip = Some(Clip::Ellipse {
        extra: Extras::new(),
    });
    document.layers.push(rotated_group);

    (document, hrefs)
}

/// Circles: an ellipse clip over a photo and over a flat colour.
fn clip_ellipse_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 260.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let (asset, hrefs) = add_swatch(&mut document);

    let mut avatar = image_layer(
        1,
        Transform::new(40.0, 30.0, 180.0, 180.0),
        &asset,
        ImageFit::Cover,
    );
    avatar.clip = Some(Clip::Ellipse {
        extra: Extras::new(),
    });
    document.layers.push(avatar);

    let mut disc = shape_layer(
        2,
        Transform::new(260.0, 30.0, 180.0, 180.0),
        ShapeKind::Ellipse {
            extra: Extras::new(),
        },
        Some("#cc3366"),
        None,
    );
    disc.clip = Some(Clip::Ellipse {
        extra: Extras::new(),
    });
    document.layers.push(disc);

    (document, hrefs)
}

/// Crops: a square crop, a letterbox crop, and a rectangle that runs past the
/// source so the clamp is drawn rather than described.
fn crop_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 200.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let (asset, hrefs) = add_swatch(&mut document);

    // The top-left quadrant, stretched to fill a square box.
    let mut square = image_layer(
        1,
        Transform::new(20.0, 30.0, 120.0, 120.0),
        &asset,
        ImageFit::Fill,
    );
    if let LayerKind::Image(image) = &mut square.kind {
        image.crop = Some(Crop {
            x: 0.0,
            y: 0.0,
            width: 2.0,
            height: 2.0,
            extra: Extras::new(),
        });
    }
    document.layers.push(square);

    // A letterbox crop: wide and short, contained in a wide box.
    let mut letterbox = image_layer(
        2,
        Transform::new(180.0, 30.0, 200.0, 120.0),
        &asset,
        ImageFit::Contain,
    );
    if let LayerKind::Image(image) = &mut letterbox.kind {
        image.crop = Some(Crop {
            x: 1.0,
            y: 0.0,
            width: 2.0,
            height: 4.0,
            extra: Extras::new(),
        });
    }
    document.layers.push(letterbox);

    // Runs two pixels past both edges: clamped to the source's 4x4.
    let mut clamped = image_layer(
        3,
        Transform::new(400.0, 30.0, 60.0, 120.0),
        &asset,
        ImageFit::Fill,
    );
    if let LayerKind::Image(image) = &mut clamped.kind {
        image.crop = Some(Crop {
            x: 2.0,
            y: 2.0,
            width: 6.0,
            height: 6.0,
            extra: Extras::new(),
        });
    }
    document.layers.push(clamped);

    (document, hrefs)
}

/// Flips: each axis alone and with a rotation, on an image, a shape and a text
/// layer.
///
/// Flipping text mirrors its glyphs — that is what a mirror means — so a text
/// layer is here deliberately.
fn flip_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 340.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let (asset, hrefs) = add_swatch(&mut document);

    let mut horizontal = image_layer(
        1,
        Transform {
            flip_horizontal: true,
            ..Transform::new(24.0, 24.0, 120.0, 120.0)
        },
        &asset,
        ImageFit::Fill,
    );
    horizontal.name = Some("flipped horizontally".to_owned());
    document.layers.push(horizontal);

    let mut vertical = image_layer(
        2,
        Transform {
            flip_vertical: true,
            ..Transform::new(180.0, 24.0, 120.0, 120.0)
        },
        &asset,
        ImageFit::Fill,
    );
    vertical.name = Some("flipped vertically".to_owned());
    document.layers.push(vertical);

    // Both axes and a rotation: the mirror is composed about the box centre,
    // so the rotation turns the mirrored result.
    let mut both = shape_layer(
        3,
        Transform {
            rotation: 20.0,
            flip_horizontal: true,
            flip_vertical: true,
            ..Transform::new(336.0, 24.0, 120.0, 120.0)
        },
        ShapeKind::Rect {
            corner_radius: 0.0,
            extra: Extras::new(),
        },
        Some("#2f6f4f"),
        Some(("#101820", 6.0)),
    );
    both.name = Some("flipped both ways and rotated".to_owned());
    document.layers.push(both);

    let mut mirrored_text = text_layer(
        "layer_00000000000000000000000004",
        Transform {
            flip_horizontal: true,
            ..Transform::new(24.0, 190.0, 432.0, 120.0)
        },
        "mirrored text",
        "Noto Sans",
        44.0,
        TextAlign::Left,
    );
    mirrored_text.name = Some("mirrored text".to_owned());
    document.layers.push(mirrored_text);

    (document, hrefs)
}

/// A shape layer carrying a full stroke — dash, cap and join included — for
/// the 1.10.0 paint documents.
fn stroked_shape(
    index: usize,
    transform: Transform,
    kind: ShapeKind,
    fill: Option<&str>,
    stroke: Stroke,
) -> Layer {
    Layer::new(
        LayerId::new(format!("layer_{index:026}")),
        transform,
        LayerKind::Shape(ShapeLayer {
            shape: kind,
            fill: fill.map(Color::new),
            stroke: Some(stroke),
            extra: Extras::new(),
        }),
    )
}

/// A plain stroke, for documents that ask for no dash, cap or join.
fn plain_stroke(color: &str, width: f64) -> Stroke {
    Stroke {
        color: Color::new(color),
        width,
        dash_array: None,
        line_cap: None,
        line_join: None,
        extra: Extras::new(),
    }
}

/// The 1.10.0 path paint: a filled path shape, a stroked and rotated one, and
/// a path clip over a photo. Every `d` is written in the layer's own box
/// space, closed, in the conservative grammar.
fn path_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 260.0);
    document.canvas.background = Some(Color::new("#ffffff"));

    // A filled silhouette: a pentagon-ish outline in a 180x150 box.
    document.layers.push(stroked_shape(
        1,
        Transform::new(24.0, 24.0, 180.0, 150.0),
        ShapeKind::Path {
            d: "M 90 0 L 180 55 L 145 150 L 35 150 L 0 55 Z".to_owned(),
            extra: Extras::new(),
        },
        Some("#3366cc"),
        plain_stroke("#112233", 3.0),
    ));

    // The same path, rotated: the box's rotation must turn the path with it.
    document.layers.push(stroked_shape(
        2,
        Transform {
            rotation: 20.0,
            ..Transform::new(240.0, 24.0, 180.0, 150.0)
        },
        ShapeKind::Path {
            d: "M 90 0 L 180 55 L 145 150 L 35 150 L 0 55 Z".to_owned(),
            extra: Extras::new(),
        },
        Some("#cc6633aa"),
        plain_stroke("#112233", 3.0),
    ));

    // A path clip over the swatch: the mask must cut to the silhouette.
    let (asset, hrefs) = add_swatch(&mut document);
    let mut clipped = image_layer(
        3,
        Transform::new(60.0, 20.0, 120.0, 120.0),
        &asset,
        ImageFit::Cover,
    );
    clipped.clip = Some(Clip::Path {
        d: "M 60 0 L 120 30 L 120 90 L 60 120 L 0 90 L 0 30 Z".to_owned(),
        extra: Extras::new(),
    });
    document.layers.push(clipped);

    (document, hrefs)
}

/// The 1.10.0 dash, cap and join paint: a dashed arc, a dashed rect with an
/// odd-count pattern, and a dashed line rotated off the axes with a square
/// cap and a bevel join.
///
/// The arc and the rotated line are the spike's two riskiest documents: arcs
/// exercise the dash phase along a curve, and the rotated line dashes across
/// a diagonal raster walk.
fn dash_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 260.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let hrefs = AssetHrefs::new();

    // A dashed arc: the ellipse's four cubic quadrants, stroked, dashes
    // riding the inset geometry (D5).
    document.layers.push(stroked_shape(
        1,
        Transform::new(30.0, 30.0, 180.0, 180.0),
        ShapeKind::Ellipse {
            extra: Extras::new(),
        },
        None,
        Stroke {
            color: Color::new("#204060"),
            width: 4.0,
            dash_array: Some(vec![6.0, 4.0]),
            line_cap: Some(assemblash_core::LineCap::Round),
            line_join: None,
            extra: Extras::new(),
        },
    ));

    // An odd-count pattern: resvg repeats it to an even count, and the gate
    // re-checks that on every target.
    document.layers.push(stroked_shape(
        2,
        Transform::new(250.0, 40.0, 190.0, 140.0),
        ShapeKind::Rect {
            corner_radius: 12.0,
            extra: Extras::new(),
        },
        None,
        Stroke {
            color: Color::new("#8b1a1a"),
            width: 3.0,
            dash_array: Some(vec![6.0, 4.0, 2.0]),
            line_cap: Some(assemblash_core::LineCap::Butt),
            line_join: Some(assemblash_core::LineJoin::Round),
            extra: Extras::new(),
        },
    ));

    // A dashed line off the axes, square cap: a diagonal dash walk.
    document.layers.push(stroked_shape(
        3,
        Transform {
            rotation: 17.0,
            ..Transform::new(40.0, 220.0, 400.0, 0.0)
        },
        ShapeKind::Line {
            marker_start: None,
            marker_end: None,
            extra: Extras::new(),
        },
        None,
        Stroke {
            color: Color::new("#2e8b57"),
            width: 5.0,
            dash_array: Some(vec![8.0, 5.0]),
            line_cap: Some(assemblash_core::LineCap::Square),
            line_join: Some(assemblash_core::LineJoin::Bevel),
            extra: Extras::new(),
        },
    ));

    (document, hrefs)
}

/// The 1.10.0 marker paint: both marker ends on one line, the same line
/// rotated, and an explicit `none` control that must emit no definition.
fn marker_document() -> (Document, AssetHrefs) {
    let mut document = Document::new(&mut SequentialIdSource::new(), 480.0, 220.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    let hrefs = AssetHrefs::new();

    // Arrow at the start, circle at the end, on the same line.
    document.layers.push(stroked_shape(
        1,
        Transform::new(40.0, 40.0, 400.0, 0.0),
        ShapeKind::Line {
            marker_start: Some(assemblash_core::LineMarker::Arrow),
            marker_end: Some(assemblash_core::LineMarker::Circle),
            extra: Extras::new(),
        },
        None,
        plain_stroke("#101820", 4.0),
    ));

    // Both ends marked, rotated: the markers must turn with the line.
    document.layers.push(stroked_shape(
        2,
        Transform {
            rotation: 25.0,
            ..Transform::new(60.0, 80.0, 360.0, 0.0)
        },
        ShapeKind::Line {
            marker_start: Some(assemblash_core::LineMarker::Circle),
            marker_end: Some(assemblash_core::LineMarker::Arrow),
            extra: Extras::new(),
        },
        None,
        plain_stroke("#8b1a1a", 3.0),
    ));

    // An explicit `none`: a real marker value, and it emits nothing.
    document.layers.push(stroked_shape(
        3,
        Transform::new(40.0, 170.0, 400.0, 0.0),
        ShapeKind::Line {
            marker_start: Some(assemblash_core::LineMarker::None),
            marker_end: Some(assemblash_core::LineMarker::None),
            extra: Extras::new(),
        },
        None,
        plain_stroke("#204060", 4.0),
    ));

    (document, hrefs)
}

fn reference_documents() -> Vec<(&'static str, Document, AssetHrefs)> {
    let mut out = Vec::new();
    for (name, (document, hrefs)) in [
        ("mixed", mixed_document()),
        ("latin", latin_document()),
        ("arabic", arabic_document()),
        ("japanese", japanese_document()),
        ("effects", effects_document()),
        ("shapes", shapes_document()),
        ("shadow", shadow_document()),
        ("text-weight", text_weight_document()),
        ("text-stroke", text_stroke_document()),
        ("text-spacing", text_spacing_document()),
        ("text-valign", text_valign_document()),
        ("clip-rounded", clip_rounded_document()),
        ("clip-ellipse", clip_ellipse_document()),
        ("crop", crop_document()),
        ("flip", flip_document()),
        ("path", path_document()),
        ("dash", dash_document()),
        ("marker", marker_document()),
    ] {
        out.push((name, document, hrefs));
    }
    for mode in assemblash_core::BlendMode::RENDERED {
        let (document, hrefs) = blend_mode_document(mode);
        // Leaked so the name can be `&'static str` like the rest; this is a
        // test binary that runs once and exits.
        let name: &'static str = Box::leak(format!("blend-{}", mode.as_str()).into_boxed_str());
        out.push((name, document, hrefs));
    }
    out
}

/// Reference documents that are also rendered at another scale.
///
/// The scale multiplies the SVG's own size, so a crop's viewBox placement is
/// checked in a second pixel grid rather than only in the first.
fn scaled_reference_documents() -> Vec<(&'static str, Document, AssetHrefs, f32)> {
    let (document, hrefs) = crop_document();
    vec![("crop-scale2", document, hrefs, 2.0)]
}

/// The two SVGs behind G4: a `screen` blend and a Gaussian blur. They are
/// written by hand rather than produced from a document, because blend modes
/// and effects are v0.5 and v1.x scope — what the gate needs to know now is
/// only whether the renderer can do them at all.
const BLEND_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" fill="#000000"/>
  <rect x="10" y="10" width="60" height="60" fill="#ff0000"/>
  <rect x="30" y="30" width="60" height="60" fill="#0000ff" style="mix-blend-mode:screen"/>
</svg>
"##;

const BLUR_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <rect x="0" y="0" width="100" height="100" fill="#ffffff"/>
  <rect x="25" y="25" width="50" height="50" fill="#000000" filter="url(#soft)"/>
</svg>
"##;

/// Metadata for a golden render.
///
/// The renderer version is pinned to a constant rather than taken from the
/// build. The goldens hash whole PNG files, metadata included, and a release
/// that only bumps the version number must not look like a change in rendered
/// output — that would train whoever sees the failure to regenerate goldens
/// without reading them, which is how a real regression gets waved through.
fn gate_metadata(document_id: &str) -> PngMetadata {
    PngMetadata {
        document_id: document_id.to_owned(),
        schema_version: assemblash_core::SCHEMA_VERSION,
        renderer_version: "gate".to_owned(),
        // No timestamp: provenance that changes per run would make the whole
        // comparison meaningless.
        created: None,
    }
}

fn goldens_path() -> PathBuf {
    manifest_dir().join("tests/gate/goldens.json")
}

fn read_goldens() -> BTreeMap<String, String> {
    let text = std::fs::read_to_string(goldens_path())
        .expect("tests/gate/goldens.json is committed; UPDATE_GATE=1 writes it");
    serde_json::from_str(&text).expect("goldens.json is JSON")
}

fn write_goldens(goldens: &BTreeMap<String, String>) {
    let path = goldens_path();
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    let mut json = serde_json::to_string_pretty(goldens).unwrap();
    json.push('\n');
    std::fs::write(path, json).unwrap();
}

fn preview_dir() -> PathBuf {
    manifest_dir().join("../../target/gate")
}

fn decode(png_bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

fn ink(rgba: &[u8]) -> usize {
    rgba.chunks_exact(4)
        .filter(|p| p[3] > 128 && (p[0] as u16 + p[1] as u16 + p[2] as u16) < 400)
        .count()
}

/// Columns that contain ink, used to check that text sits where the alignment
/// says it should without pinning exact glyph positions.
fn inked_columns(width: u32, rgba: &[u8]) -> (u32, u32) {
    let width = width as usize;
    let mut first = usize::MAX;
    let mut last = 0usize;
    for (index, pixel) in rgba.chunks_exact(4).enumerate() {
        if pixel[3] > 128 && (pixel[0] as u16 + pixel[1] as u16 + pixel[2] as u16) < 400 {
            let column = index % width;
            first = first.min(column);
            last = last.max(column);
        }
    }
    (first as u32, last as u32)
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

/// The crop document places each rectangle where it says: a square crop fills
/// its box, a letterbox crop keeps its aspect inside the box, and a rectangle
/// that runs past the source is clamped rather than refused or stretched.
#[test]
fn g5_crops_place_and_clamp() {
    let fonts = fonts();
    let (document, hrefs) = crop_document();
    let png = document_to_png(
        &document,
        &fonts,
        &hrefs,
        1.0,
        &gate_metadata(&document.id.to_string()),
    )
    .unwrap();
    let (width, _, pixels) = decode(&png);

    // Ink columns inside a box, against the box's own pixel range.
    let inked = |from: u32, to: u32| {
        let mut count = 0;
        for x in from..to {
            let mut column = false;
            for y in 0..200 {
                let offset = ((y * width + x) * 4) as usize;
                if pixels[offset] != 255 || pixels[offset + 1] != 255 || pixels[offset + 2] != 255 {
                    column = true;
                }
            }
            if column {
                count += 1;
            }
        }
        count
    };

    // Fill: the crop stretches to the whole 120-pixel box.
    assert_eq!(inked(20, 140), 120, "a square crop fills its box");
    // Contain: the 2x4 crop is 60 pixels wide in a 200-pixel box, centred.
    assert_eq!(
        inked(180, 380),
        60,
        "a letterbox crop keeps its aspect inside the box"
    );
    // Out-of-bounds: clamped to the source's 2x2 remainder, still filling.
    assert_eq!(inked(400, 460), 60, "a clamped crop fills its box");
}

/// G1 — a document that goes to disk and comes back renders the same pixels,
/// byte for byte.
#[test]
fn g1_round_trip_through_disk_changes_nothing() {
    let fonts = fonts();
    let (document, hrefs) = mixed_document();

    let project = tempfile::tempdir().unwrap();
    std::fs::create_dir_all(project.path().join("assets")).unwrap();
    std::fs::write(project.path().join("assets/swatch.png"), swatch_png()).unwrap();
    storage::save(&document, project.path()).unwrap();

    let before = document_to_png(
        &document,
        &fonts,
        &hrefs,
        1.0,
        &PngMetadata::for_document(&document),
    )
    .unwrap();

    let reloaded = storage::load(project.path()).unwrap();
    assert_eq!(reloaded, document, "the document itself must survive");
    storage::verify_assets(&reloaded, project.path()).unwrap();

    let after = document_to_png(
        &reloaded,
        &fonts,
        &hrefs,
        1.0,
        &PngMetadata::for_document(&reloaded),
    )
    .unwrap();

    assert_eq!(
        hash_bytes(&before),
        hash_bytes(&after),
        "save/reload/render changed the image"
    );
}

/// G2 — every reference document hashes to the value committed in
/// `goldens.json`, on every target CI runs.
#[test]
fn g2_reference_documents_match_the_committed_hashes() {
    let fonts = fonts();
    let mut computed = BTreeMap::new();

    if updating() {
        std::fs::create_dir_all(preview_dir()).unwrap();
    }

    for (name, document, hrefs) in reference_documents() {
        let png = document_to_png(
            &document,
            &fonts,
            &hrefs,
            1.0,
            &gate_metadata(&document.id.to_string()),
        )
        .unwrap();
        let (_, _, pixels) = decode(&png);

        computed.insert(format!("{name}.pixels"), hash_bytes(&pixels));
        computed.insert(format!("{name}.png"), hash_bytes(&png));

        if updating() {
            std::fs::write(preview_dir().join(format!("{name}.png")), &png).unwrap();
        }
    }

    // A crop at scale 2: the viewBox maps into twice the pixels, so the
    // placement is checked at a second scale rather than only at 1.
    for (name, document, hrefs, scale) in scaled_reference_documents() {
        let png = document_to_png(
            &document,
            &fonts,
            &hrefs,
            scale,
            &gate_metadata(&document.id.to_string()),
        )
        .unwrap();
        let (_, _, pixels) = decode(&png);

        computed.insert(format!("{name}.pixels"), hash_bytes(&pixels));
        computed.insert(format!("{name}.png"), hash_bytes(&png));

        if updating() {
            std::fs::write(preview_dir().join(format!("{name}.png")), &png).unwrap();
        }
    }

    for (name, svg) in [("blend", BLEND_SVG), ("blur", BLUR_SVG)] {
        let pixmap = svg_to_pixmap(svg, &fonts, 1.0).unwrap();
        let png = assemblash_renderer::pixmap_to_png(
            &pixmap,
            &gate_metadata(&format!("doc_gate_{name}")),
        )
        .unwrap();
        let (_, _, pixels) = decode(&png);
        computed.insert(format!("{name}.pixels"), hash_bytes(&pixels));
        computed.insert(format!("{name}.png"), hash_bytes(&png));
        if updating() {
            std::fs::write(preview_dir().join(format!("{name}.png")), &png).unwrap();
        }
    }

    if updating() {
        write_goldens(&computed);
        return;
    }

    let expected = read_goldens();
    assert_eq!(
        computed, expected,
        "rendered output differs from the committed goldens on this platform"
    );
}

/// G3 — non-Latin text is shaped, not dropped: Arabic joins and runs
/// right-to-left, Japanese draws, diacritics combine.
#[test]
fn g3_non_latin_text_is_shaped() {
    let fonts = fonts();

    // Arabic: aligned right, so the ink must sit against the right edge, and
    // joined script covers noticeably more of the line than isolated letters
    // would.
    let (arabic, _) = arabic_document();
    let png = document_to_png(
        &arabic,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&arabic),
    )
    .unwrap();
    let (width, _, pixels) = decode(&png);
    assert!(ink(&pixels) > 500, "Arabic drew almost nothing");
    let (_, last_column) = inked_columns(width, &pixels);
    assert!(
        last_column > 420,
        "right-aligned Arabic should reach the right edge, ended at {last_column}"
    );

    // Japanese.
    let (japanese, _) = japanese_document();
    let png = document_to_png(
        &japanese,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&japanese),
    )
    .unwrap();
    let (_, _, pixels) = decode(&png);
    assert!(ink(&pixels) > 800, "Japanese drew almost nothing");

    // Latin with combining marks: the accented line must have more ink than
    // the same letters without their marks.
    let mut with_marks = Document::new(&mut SequentialIdSource::new(), 300.0, 120.0);
    with_marks.canvas.background = Some(Color::new("#ffffff"));
    with_marks.layers.push(text_layer(
        "layer_00000000000000000000000001",
        Transform::new(10.0, 10.0, 280.0, 100.0),
        "e\u{0301} a\u{0308} c\u{0327}",
        "Noto Sans",
        48.0,
        TextAlign::Left,
    ));
    let mut without_marks = with_marks.clone();
    if let LayerKind::Text(text) = &mut without_marks.layers[0].kind {
        text.text = "e a c".to_owned();
    }

    let marked = document_to_png(
        &with_marks,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&with_marks),
    )
    .unwrap();
    let plain = document_to_png(
        &without_marks,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&without_marks),
    )
    .unwrap();
    let (_, _, marked_pixels) = decode(&marked);
    let (_, _, plain_pixels) = decode(&plain);
    assert!(
        ink(&marked_pixels) > ink(&plain_pixels),
        "combining marks added no ink: {} vs {}",
        ink(&marked_pixels),
        ink(&plain_pixels)
    );
}

/// G4 — a blend mode and a Gaussian blur actually rasterize. The v1.x effect
/// stack depends on this renderer being able to do both.
#[test]
fn g4_blend_mode_and_blur_rasterize() {
    let fonts = fonts();

    let pixmap = svg_to_pixmap(BLEND_SVG, &fonts, 1.0).unwrap();
    let png = assemblash_renderer::pixmap_to_png(
        &pixmap,
        &PngMetadata {
            document_id: "doc_gate_blend".to_owned(),
            schema_version: assemblash_core::SCHEMA_VERSION,
            renderer_version: assemblash_renderer::RENDERER_VERSION.to_owned(),
            created: None,
        },
    )
    .unwrap();
    let (width, _, pixels) = decode(&png);
    let pixel_at = |x: u32, y: u32| {
        let start = ((y * width + x) * 4) as usize;
        [
            pixels[start],
            pixels[start + 1],
            pixels[start + 2],
            pixels[start + 3],
        ]
    };
    // Red only, blue only, and the overlap. Screen of red over blue is
    // magenta — if the blend were ignored the overlap would be plain blue.
    assert_eq!(pixel_at(20, 20), [255, 0, 0, 255]);
    assert_eq!(pixel_at(80, 80), [0, 0, 255, 255]);
    assert_eq!(pixel_at(50, 50), [255, 0, 255, 255]);

    let pixmap = svg_to_pixmap(BLUR_SVG, &fonts, 1.0).unwrap();
    let png = assemblash_renderer::pixmap_to_png(
        &pixmap,
        &PngMetadata {
            document_id: "doc_gate_blur".to_owned(),
            schema_version: assemblash_core::SCHEMA_VERSION,
            renderer_version: assemblash_renderer::RENDERER_VERSION.to_owned(),
            created: None,
        },
    )
    .unwrap();
    let (width, _, pixels) = decode(&png);
    let value_at = |x: u32, y: u32| pixels[((y * width + x) * 4) as usize];
    // Centre stays dark, the square's edge becomes a gradient rather than a
    // step, and the far corner stays white.
    assert!(value_at(50, 50) < 20, "centre should still be dark");
    let edge = value_at(25, 50);
    assert!(
        (40..=215).contains(&edge),
        "the blurred edge should be a mid tone, was {edge}"
    );
    assert!(value_at(2, 2) > 240, "the corner should stay white");
}

/// The gate is only meaningful if the goldens cover every reference document.
#[test]
fn goldens_cover_every_reference_document() {
    if updating() {
        return;
    }
    let goldens = read_goldens();
    for name in [
        "mixed", "latin", "arabic", "japanese", "blend", "blur", "shapes", "shadow", "path",
        "dash", "marker",
    ] {
        assert!(
            goldens.contains_key(&format!("{name}.pixels")),
            "no golden for {name}"
        );
        assert!(goldens.contains_key(&format!("{name}.png")));
    }
}

/// Rendering the SVG twice in one process must also be identical — a cheap
/// check that nothing in the pipeline depends on iteration order.
#[test]
fn svg_generation_is_stable_within_a_run() {
    let fonts = fonts();
    for (_, document, hrefs) in reference_documents() {
        let first = doc_to_svg(&document, fonts.font_set(), &hrefs).unwrap();
        let second = doc_to_svg(&document, fonts.font_set(), &hrefs).unwrap();
        assert_eq!(first, second);
    }
}
