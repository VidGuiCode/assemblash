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
    Extras, GroupLayer, ImageFit, ImageLayer, TextAlign, TextLayer, Transform,
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
            color: Color::new("#101820"),
            align,
            line_height: 1.4,
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

fn reference_documents() -> Vec<(&'static str, Document, AssetHrefs)> {
    let mut out = Vec::new();
    for (name, (document, hrefs)) in [
        ("mixed", mixed_document()),
        ("latin", latin_document()),
        ("arabic", arabic_document()),
        ("japanese", japanese_document()),
    ] {
        out.push((name, document, hrefs));
    }
    out
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
    for name in ["mixed", "latin", "arabic", "japanese", "blend", "blur"] {
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
