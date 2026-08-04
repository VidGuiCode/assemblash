//! Step 5 exit test: reference documents rasterize, and the PNGs carry their
//! provenance.
//!
//! Fonts come only from the subsetted Noto files in `tests/fonts/`. Nothing
//! here may depend on a font installed on the machine running the test — that
//! is the whole point.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::PathBuf;

use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::{Color, Document, Layer, LayerKind};
use assemblash_renderer::raster::{font_files_in, read_png_metadata, LoadedFonts, PngMetadata};
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
