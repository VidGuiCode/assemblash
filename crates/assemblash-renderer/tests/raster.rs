//! Step 5 exit test: reference documents rasterize, and the PNGs carry their
//! provenance.
//!
//! Fonts come only from the subsetted Noto files in `tests/fonts/`. Nothing
//! here may depend on a font installed on the machine running the test — that
//! is the whole point.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::PathBuf;

use assemblash_core::document::{
    BlendMode, Extras, GroupLayer, ImageFit, ImageLayer, TextAlign, TextLayer, Transform,
};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::{Asset, Color, Document, Layer, LayerKind};
use assemblash_renderer::raster::{font_files_in, read_png_metadata, LoadedFonts, PngMetadata};
use assemblash_renderer::RenderError;
use assemblash_renderer::{doc_to_svg, document_to_png, svg_to_pixmap, AssetHrefs};

fn font_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts")
}

fn fonts() -> LoadedFonts {
    LoadedFonts::from_files(font_files_in(&font_dir()).unwrap()).unwrap()
}

fn document_with_text(family: &str, body: &str, align: TextAlign) -> Document {
    let mut doc = Document::new(&mut SequentialIdSource::new(), 400.0, 160.0);
    doc.canvas.background = Some(Color::new("#ffffff"));
    doc.layers.push(Layer::new(
        LayerId::new("layer_1"),
        Transform::new(20.0, 20.0, 360.0, 120.0),
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: family.to_owned(),
            font_size: 40.0,
            color: Color::new("#000000"),
            align,
            line_height: 1.4,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    ));
    doc
}

fn decode(png_bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

/// A 1x1 opaque PNG of one colour, for a layer that is a flat rectangle.
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

fn dark_pixel_count(rgba: &[u8]) -> usize {
    rgba.chunks_exact(4)
        .filter(|p| p[3] > 128 && p[0] < 100 && p[1] < 100 && p[2] < 100)
        .count()
}

#[test]
fn the_bundled_fonts_load_and_nothing_else_does() {
    let fonts = fonts();
    let set = fonts.font_set();
    assert!(set.contains("Noto Sans"), "{:?}", set);
    assert!(set.contains("Noto Sans Arabic"));
    assert!(set.contains("Noto Sans JP"));
    // A font that exists on many machines but was not handed in must not be
    // visible to the renderer.
    assert!(!set.contains("Arial"));
    assert!(!fonts.is_empty());
}

#[test]
fn a_text_document_rasterizes_to_a_png_with_metadata() {
    let fonts = fonts();
    let doc = document_with_text("Noto Sans", "Handgloves", TextAlign::Left);
    let metadata = PngMetadata::for_document(&doc).created_at("2026-08-04T00:00:00Z");

    let png_bytes = document_to_png(&doc, &fonts, &AssetHrefs::new(), 1.0, &metadata).unwrap();

    let (width, height, rgba) = decode(&png_bytes);
    assert_eq!((width, height), (400, 160));
    assert!(
        dark_pixel_count(&rgba) > 200,
        "expected glyphs to be drawn, found {} dark pixels",
        dark_pixel_count(&rgba)
    );

    let found = read_png_metadata(&png_bytes).unwrap();
    assert_eq!(
        found,
        vec![
            (
                "assemblash:created".to_owned(),
                "2026-08-04T00:00:00Z".to_owned()
            ),
            ("assemblash:documentId".to_owned(), doc.id.to_string()),
            (
                "assemblash:renderer".to_owned(),
                assemblash_renderer::RENDERER_VERSION.to_owned()
            ),
            ("assemblash:schemaVersion".to_owned(), "1".to_owned()),
        ]
    );
}

#[test]
fn rendering_the_same_document_twice_gives_identical_bytes() {
    let fonts = fonts();
    let doc = document_with_text("Noto Sans", "Repeatable", TextAlign::Center);
    let metadata = PngMetadata::for_document(&doc);

    let first = document_to_png(&doc, &fonts, &AssetHrefs::new(), 1.0, &metadata).unwrap();
    let second = document_to_png(&doc, &fonts, &AssetHrefs::new(), 1.0, &metadata).unwrap();
    assert_eq!(first, second);
}

#[test]
fn a_timestamp_is_the_only_thing_that_changes_between_runs() {
    let fonts = fonts();
    let doc = document_with_text("Noto Sans", "Timestamped", TextAlign::Left);
    let base = PngMetadata::for_document(&doc);

    let a = document_to_png(&doc, &fonts, &AssetHrefs::new(), 1.0, &base).unwrap();
    let b = document_to_png(
        &doc,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &base.clone().created_at("2026-08-04T12:00:00Z"),
    )
    .unwrap();

    // The images differ only in metadata, so the decoded pixels match.
    let (_, _, pixels_a) = decode(&a);
    let (_, _, pixels_b) = decode(&b);
    assert_eq!(pixels_a, pixels_b);
    assert_ne!(a, b);
}

#[test]
fn scale_multiplies_the_output_size() {
    let fonts = fonts();
    let doc = document_with_text("Noto Sans", "Scaled", TextAlign::Left);
    let png_bytes = document_to_png(
        &doc,
        &fonts,
        &AssetHrefs::new(),
        2.0,
        &PngMetadata::for_document(&doc),
    )
    .unwrap();
    let (width, height, _) = decode(&png_bytes);
    assert_eq!((width, height), (800, 320));
}

#[test]
fn a_translucent_background_survives_to_the_png_alpha_channel() {
    let fonts = fonts();
    let mut doc = Document::new(&mut SequentialIdSource::new(), 8.0, 8.0);
    doc.canvas.background = Some(Color::new("#00000040"));

    let png_bytes = document_to_png(
        &doc,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&doc),
    )
    .unwrap();

    let (_, _, rgba) = decode(&png_bytes);
    // 0x40 = 64. Rounding through premultiplied storage may move it by one.
    assert!(
        (63..=65).contains(&rgba[3]),
        "alpha was {}, expected about 64",
        rgba[3]
    );
}

#[test]
fn non_latin_scripts_rasterize() {
    let fonts = fonts();
    for (family, text) in [
        ("Noto Sans Arabic", "مرحبا بالعالم"),
        ("Noto Sans JP", "こんにちは世界"),
        ("Noto Sans", "éàü"),
    ] {
        let doc = document_with_text(family, text, TextAlign::Left);
        let png_bytes = document_to_png(
            &doc,
            &fonts,
            &AssetHrefs::new(),
            1.0,
            &PngMetadata::for_document(&doc),
        )
        .unwrap();
        let (_, _, rgba) = decode(&png_bytes);
        assert!(
            dark_pixel_count(&rgba) > 100,
            "{family} drew nothing for {text:?}"
        );
    }
}

/// Two overlapping opaque squares, the upper one blending, as a document.
///
/// Built from image layers rather than hand-written SVG so the test exercises
/// the whole path a real document takes — the value in `blendMode`, through
/// `doc_to_svg`, into resvg.
fn blend_document(mode: BlendMode) -> (Document, AssetHrefs) {
    let mut doc = Document::new(&mut SequentialIdSource::new(), 100.0, 100.0);
    doc.canvas.background = Some(Color::new("#ffffff"));

    let mut hrefs = AssetHrefs::new();
    for (index, (color, blend)) in [
        (Color::new("#ff0000"), BlendMode::Normal),
        (Color::new("#0000ff"), mode),
    ]
    .into_iter()
    .enumerate()
    {
        let asset_id = AssetId::new(format!("asset_{}", index + 1));
        doc.assets.push(Asset {
            id: asset_id.clone(),
            path: format!("{index}.png"),
            hash: assemblash_core::storage::hash_bytes(&solid_png(&color)),
            media_type: "image/png".to_owned(),
            width: Some(1),
            height: Some(1),
            extra: Extras::new(),
        });
        hrefs.insert(
            asset_id.clone(),
            format!("data:image/png;base64,{}", base64(&solid_png(&color))),
        );

        let mut layer = Layer::new(
            LayerId::new(format!("layer_{}", index + 1)),
            Transform::new(
                10.0 + 30.0 * index as f64,
                10.0 + 30.0 * index as f64,
                60.0,
                60.0,
            ),
            LayerKind::Image(ImageLayer {
                asset: asset_id,
                fit: ImageFit::Fill,
                extra: Extras::new(),
            }),
        );
        layer.blend_mode = blend;
        doc.layers.push(layer);
    }

    (doc, hrefs)
}

/// Every blend mode this build names actually composites — and one it does
/// not name is refused.
///
/// The point of the table is that a mode is only claimed once its pixels have
/// been looked at. Red under blue, on white: the values below are the CSS
/// blending formulas applied to those two colours, and several modes agree
/// with each other on this particular pair (multiply and darken both leave
/// nothing lit) — which is correct, not a mistake.
#[test]
fn every_named_blend_mode_composites_and_the_rest_are_refused() {
    let fonts = fonts();

    // (mode, the overlap pixel)
    let cases = [
        // Red under blue, unblended: the overlap is plain blue.
        (BlendMode::Normal, [0, 0, 255]),
        // Red x blue leaves nothing lit.
        (BlendMode::Multiply, [0, 0, 0]),
        // Red + blue is magenta.
        (BlendMode::Screen, [255, 0, 255]),
        // Overlay tests the *backdrop*: red is 1 in R (screen -> 1) and 0 in
        // G and B (multiply -> 0), so the result is the backdrop's own red.
        (BlendMode::Overlay, [255, 0, 0]),
        // Channel-wise minimum, which for these two is nothing.
        (BlendMode::Darken, [0, 0, 0]),
        // Channel-wise maximum: red's R and blue's B.
        (BlendMode::Lighten, [255, 0, 255]),
        // Hard-light tests the source instead: blue is 1 in B, 0 elsewhere.
        (BlendMode::HardLight, [0, 0, 255]),
        (BlendMode::SoftLight, [255, 0, 0]),
        // |backdrop - source| per channel.
        (BlendMode::Difference, [255, 0, 255]),
        // b + s - 2bs, which for values of 0 and 1 matches difference.
        (BlendMode::Exclusion, [255, 0, 255]),
        // The non-separable four take one attribute from the source and the
        // rest from the backdrop, through the spec's SetLum/SetSat with their
        // clipping step. These four are pinned to what the renderer produces
        // rather than to arithmetic done here: re-deriving the clipping by
        // hand would add a second implementation to disagree with, not
        // confidence. What they are really guarding is that the mode reaches
        // the rasterizer and keeps doing the same thing.
        (BlendMode::Hue, [54, 54, 255]),
        (BlendMode::Saturation, [255, 0, 0]),
        (BlendMode::Color, [54, 54, 255]),
        (BlendMode::Luminosity, [207, 0, 0]),
    ];
    assert_eq!(
        cases.len(),
        BlendMode::RENDERED.len(),
        "every mode this build claims to render needs a case here"
    );

    for (mode, expected) in cases {
        let (doc, hrefs) = blend_document(mode.clone());
        let png_bytes =
            document_to_png(&doc, &fonts, &hrefs, 1.0, &PngMetadata::for_document(&doc)).unwrap();
        let (width, _, rgba) = decode(&png_bytes);
        let at = |x: u32, y: u32| {
            let start = ((y * width + x) * 4) as usize;
            [rgba[start], rgba[start + 1], rgba[start + 2]]
        };
        // The lower square never blends, so it is the same in every case;
        // the upper square's own colour depends on the mode and the white
        // canvas behind it, so only the overlap is worth pinning.
        assert_eq!(at(20, 20), [255, 0, 0], "{mode:?}: red square");
        assert_eq!(at(50, 50), expected, "{mode:?}: the overlap");
    }
}

/// A mode this build does not render is refused, not quietly composited as
/// `normal`.
///
/// This is the whole reason `BlendMode::Other` exists rather than being
/// normalised away on load: the document keeps what a newer build wrote, and
/// drawing it as something else — which is what every version before this one
/// did — would produce a picture that looks finished and is wrong.
#[test]
fn a_blend_mode_this_build_cannot_draw_is_refused() {
    let fonts = fonts();
    let (doc, hrefs) = blend_document(BlendMode::Other("plusDarker".to_owned()));

    let error = document_to_png(&doc, &fonts, &hrefs, 1.0, &PngMetadata::for_document(&doc))
        .expect_err("an unknown blend mode must not render");
    let RenderError::UnsupportedBlendMode { layer, mode } = &error else {
        panic!("expected UnsupportedBlendMode, got {error:?}");
    };
    assert_eq!(layer.as_str(), "layer_2");
    assert_eq!(mode, "plusDarker");

    // `color-dodge` and `color-burn` are named by the document model — they
    // round-trip, and a document may carry them — but they are refused for
    // the same reason: they are not bit-identical across targets, and a mode
    // that renders differently on one machine breaks the promise the whole
    // engine rests on (NFR-1). See `BlendMode::RENDERED`.
    for undrawable in [BlendMode::ColorDodge, BlendMode::ColorBurn] {
        let (doc, hrefs) = blend_document(undrawable.clone());
        let error = document_to_png(&doc, &fonts, &hrefs, 1.0, &PngMetadata::for_document(&doc))
            .expect_err("a mode that is not reproducible must not render");
        assert!(
            matches!(&error, RenderError::UnsupportedBlendMode { mode, .. }
                if mode == undrawable.as_str()),
            "{error:?}"
        );
    }

    // And the document itself is untouched by the refusal: the mode is still
    // there to be written back out.
    assert_eq!(
        doc.layers[1].blend_mode,
        BlendMode::Other("plusDarker".to_owned())
    );
}

#[test]
fn a_blending_child_does_not_reach_past_its_group() {
    let fonts = fonts();

    // The same blue square, screened, but wrapped in a group. Isolation means
    // it screens against what is inside the group — nothing — so the red
    // square underneath is untouched and the overlap stays blue.
    let (mut doc, hrefs) = blend_document(BlendMode::Screen);
    let blending = doc.layers.pop().unwrap();
    doc.layers.push(Layer::new(
        LayerId::new("layer_group"),
        Transform::new(0.0, 0.0, 100.0, 100.0),
        LayerKind::Group(GroupLayer {
            children: vec![blending],
            extra: Extras::new(),
        }),
    ));

    let png_bytes =
        document_to_png(&doc, &fonts, &hrefs, 1.0, &PngMetadata::for_document(&doc)).unwrap();
    let (width, _, rgba) = decode(&png_bytes);
    let start = ((50 * width + 50) * 4) as usize;
    assert_eq!(
        [rgba[start], rgba[start + 1], rgba[start + 2]],
        [0, 0, 255],
        "the group should have contained the blend"
    );
}

#[test]
fn an_invalid_scale_is_refused() {
    let fonts = fonts();
    let doc = document_with_text("Noto Sans", "x", TextAlign::Left);
    let svg = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    for scale in [0.0, -1.0, f32::NAN] {
        assert!(svg_to_pixmap(&svg, &fonts, scale).is_err(), "scale {scale}");
    }
}

#[test]
fn malformed_svg_is_a_typed_error() {
    let fonts = fonts();
    let error = svg_to_pixmap("<svg", &fonts, 1.0).unwrap_err();
    assert!(
        matches!(error, assemblash_renderer::RenderError::MalformedSvg(_)),
        "{error:?}"
    );
}
