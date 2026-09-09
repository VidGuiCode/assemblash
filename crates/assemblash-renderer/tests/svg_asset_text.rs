//! D12(a): an SVG asset whose text nothing can draw is refused, not exported.
//!
//! DEF-2 was silent, surface-dependent data loss. Fonts are loaded for the
//! families **text layers** name, so a `<text>` inside an imported vector asset
//! had nothing loaded for it, drew as nothing, and the export exited 0 with a
//! hole in the picture. On the command line `--font-dir` loads every file in
//! the directory, so the same document rendered its text there and nowhere
//! else.
//!
//! These tests fix the rule in place: what refuses, what still renders, and —
//! in `an_asset_whose_family_is_loaded_draws_ink` — what the refusal is buying,
//! measured in pixels rather than asserted in prose.
//!
//! The rule is not "a family that is missing": it is that **every** `<text>`
//! must name at least one non-generic family this render loaded. Naming none,
//! or naming only `serif`-style roles, refuses as well, because the store is
//! keyed by declared family name and never holds the renderer's own fallback —
//! `text_that_names_no_family_is_refused_even_with_a_face_loaded` measures
//! that: zero dark pixels, which is a chart losing its labels.
//!
//! The fixtures go through the real import path, so every one of them is
//! checked as the **sanitiser stored it**, not as it was written here. That
//! matters: `style` is not on the import allowlist, so a family named only in a
//! `style="…"` attribute is gone before the renderer ever sees the asset.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, ImageFit, SvgLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::{Document, Layer, LayerKind};
use assemblash_renderer::{data_uris, doc_to_svg, svg_to_pixmap, LoadedFonts, RenderError};

fn fixture(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/svg_assets")
        .join(name)
}

/// Noto Sans, and nothing else — the same OFL subset every other render test
/// pins itself to.
fn noto() -> LoadedFonts {
    LoadedFonts::from_files([
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts/NotoSans-Subset.ttf")
    ])
    .unwrap()
}

fn nothing() -> LoadedFonts {
    LoadedFonts::from_bytes([])
}

/// A project on disk whose only layer is the named fixture, imported.
fn project_with(directory: &Path, name: &str) -> Document {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 200.0, 100.0);

    let asset =
        assemblash_core::storage::import_asset(directory, &fixture(name), &mut ids).unwrap();
    let asset_id = asset.id.clone();
    document.assets.push(asset);
    document.layers.push(Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(0.0, 0.0, 200.0, 100.0),
        LayerKind::Svg(SvgLayer {
            asset: asset_id,
            fit: ImageFit::Fill,
            extra: Extras::new(),
        }),
    ));
    assemblash_core::storage::save(&document, directory).unwrap();
    document
}

/// Renders the fixture the way every real export path does: assets embedded as
/// `data:` URIs, then the pure document-to-SVG step.
fn render(name: &str, fonts: &LoadedFonts) -> Result<String, RenderError> {
    let scratch = tempfile::tempdir().unwrap();
    let document = project_with(scratch.path(), name);
    let hrefs = data_uris(&document, scratch.path()).unwrap();
    doc_to_svg(&document, fonts.font_set(), &hrefs)
}

/// Pixels that are dark and opaque — ink, as opposed to the empty canvas.
fn ink(svg: &str, fonts: &LoadedFonts) -> usize {
    let pixmap = svg_to_pixmap(svg, fonts, 1.0).unwrap();
    pixmap
        .pixels()
        .iter()
        .map(|pixel| pixel.demultiply())
        .filter(|pixel| {
            pixel.alpha() > 128
                && u16::from(pixel.red()) + u16::from(pixel.green()) + u16::from(pixel.blue())
                    < 3 * 128
        })
        .count()
}

/// The asset the refusal names, so a person can find it in `document.json`.
fn refused_asset(error: &RenderError) -> (String, Option<String>) {
    match error {
        RenderError::SvgAssetTextWithoutFont { asset, family } => (asset.clone(), family.clone()),
        other => panic!("expected SvgAssetTextWithoutFont, got {other:?}"),
    }
}

#[test]
fn an_asset_that_draws_text_with_no_font_loaded_at_all_is_refused() {
    let error = render("named_family.svg", &nothing()).expect_err("nothing can draw this");
    let (asset, family) = refused_asset(&error);
    assert!(asset.starts_with("asset_"), "{asset}");
    assert_eq!(family.as_deref(), Some("Noto Sans"));
    assert!(
        error.to_string().contains("Noto Sans"),
        "the message must name what is missing: {error}"
    );
}

#[test]
fn an_asset_whose_family_is_loaded_draws_ink() {
    // The point of the whole change, in pixels: this is the one shape of
    // asset that is allowed through, and it has to actually draw.
    let drawn = render("named_family.svg", &noto()).expect("Noto Sans is loaded");
    let drawn = ink(&drawn, &noto());
    // 1830 on the pinned toolchain. Asserted as a band rather than an equality
    // because antialiasing at the glyph edges is the rasterizer's business and
    // the pinned goldens in `gate.rs` are where exact pixels are guarded; what
    // this test proves is that "Hello" is there at all, where it used to be a
    // silently empty box.
    assert!(
        (1_000..3_000).contains(&drawn),
        "\"Hello\" at 60px in Noto Sans should be roughly 1830 dark pixels, got {drawn}"
    );
}

#[test]
fn text_that_names_no_family_is_refused_even_with_a_face_loaded() {
    // The measurement that decided the rule. Noto Sans is loaded, the same
    // "Hello" at the same size is in the file, and the export used to succeed
    // with a 1.3.0 warning attached — drawing exactly zero pixels. The store
    // is keyed by the family a face declares, so it never holds the fallback
    // usvg reaches for, and this text can never appear.
    let error = render("no_family.svg", &noto()).expect_err("blank is not a successful export");
    let (asset, family) = refused_asset(&error);
    assert!(asset.starts_with("asset_"), "{asset}");
    assert_eq!(family, None, "there is no family to name in the message");
    assert!(
        error.to_string().contains("names no font family"),
        "the message must say what to do about it: {error}"
    );
}

#[test]
fn a_generic_family_names_nothing_the_document_could_load() {
    // `serif` is a role, not a file. No installed face declares itself
    // `serif`, so this resolves to nothing for the same reason naming no
    // family at all does, and is refused the same way.
    let error = render("generic_family.svg", &noto()).expect_err("a role is not a family");
    let (_, family) = refused_asset(&error);
    assert_eq!(family, None);
}

#[test]
fn a_family_nothing_loaded_is_refused_by_name() {
    let error = render("unknown_family.svg", &noto()).expect_err("Arial is not loaded");
    let (_, family) = refused_asset(&error);
    assert_eq!(family.as_deref(), Some("Arial"));
}

#[test]
fn an_asset_with_no_text_renders_with_no_font_loaded() {
    let svg = render("no_text.svg", &nothing()).expect("a drawing needs no font");
    // The fixture is a 180x80 solid rectangle: 14400 pixels, exactly.
    assert_eq!(ink(&svg, &nothing()), 14_400);
}

#[test]
fn a_text_element_inside_a_comment_is_not_text() {
    // The families are read from the parsed markup, not scanned for out of the
    // bytes, so a commented-out `<text>` is not one. A `<text>` with nothing
    // between its tags is not one either: it draws nothing whatever is loaded.
    render("commented_text.svg", &nothing()).expect("a comment draws nothing");
}

#[test]
fn a_family_named_only_in_a_style_attribute_does_not_survive_import() {
    // Honest about what is checked. `style` is not on the import allowlist, so
    // by the time a render sees this asset the family is gone and the `<text>`
    // names nothing — which is refused exactly like `no_family.svg`, rather
    // than being refused for a family that is no longer in the file. Right
    // answer for the right reason: that text really would draw as nothing.
    for fonts in [noto(), nothing()] {
        let error = render("styled_family.svg", &fonts).expect_err("nothing can draw this");
        let (_, family) = refused_asset(&error);
        assert_eq!(family, None, "there is no family left in the asset to name");
    }
}

#[test]
fn an_image_layer_is_never_checked_for_text() {
    // The check belongs to SVG layers. An image layer pointing at the same
    // bytes is not a vector asset and is not this rule's business.
    let scratch = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 200.0, 100.0);
    let asset = assemblash_core::storage::import_asset(
        scratch.path(),
        &fixture("named_family.svg"),
        &mut ids,
    )
    .unwrap();
    let asset_id = asset.id.clone();
    document.assets.push(asset);
    document.layers.push(Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(0.0, 0.0, 200.0, 100.0),
        LayerKind::Image(assemblash_core::document::ImageLayer {
            asset: asset_id,
            fit: ImageFit::Fill,
            extra: Extras::new(),
        }),
    ));
    assemblash_core::storage::save(&document, scratch.path()).unwrap();

    let hrefs = data_uris(&document, scratch.path()).unwrap();
    doc_to_svg(&document, nothing().font_set(), &hrefs).expect("an image layer is not checked");
}
