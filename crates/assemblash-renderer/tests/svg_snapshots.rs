//! Step 4 exit test: the SVG for each layer and transform combination is
//! snapshotted, so any change to the output is something a human agreed to.
//!
//! Snapshots live in `tests/snapshots/`. To rewrite them after an intended
//! change:
//!
//! ```text
//! UPDATE_SNAPSHOTS=1 cargo test -p assemblash-renderer
//! ```
//!
//! Then read the diff. A snapshot nobody looked at proves nothing.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{
    BlendMode, Effect, Extras, GroupLayer, ImageFit, ImageLayer, ShapeKind, ShapeLayer, Stroke,
    TextAlign, TextLayer, Transform,
};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::{Asset, Color, Document, Layer, LayerKind};
use assemblash_renderer::warnings::{TEXT_OVERFLOWS_BOX, WORD_BROKEN_MID_WORD};
use assemblash_renderer::{
    doc_to_svg, export_warnings, AssetHrefs, FontMetrics, FontSet, LoadedFonts,
};

fn fonts() -> FontSet {
    FontSet::new(["Inter", "Noto Sans"])
}

fn document(width: f64, height: f64) -> Document {
    Document::new(&mut SequentialIdSource::new(), width, height)
}

fn text(id: &str, transform: Transform, body: &str) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: "Inter".to_owned(),
            font_size: 24.0,
            color: Color::new("#112233"),
            align: TextAlign::Left,
            line_height: 1.5,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

fn image(id: &str, transform: Transform, fit: ImageFit) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        LayerKind::Image(ImageLayer {
            asset: AssetId::new("asset_1"),
            fit,
            extra: Extras::new(),
        }),
    )
}

fn asset() -> Asset {
    Asset {
        id: AssetId::new("asset_1"),
        path: "logo.png".to_owned(),
        hash: format!("sha256:{}", "0".repeat(64)),
        media_type: "image/png".to_owned(),
        width: Some(100),
        height: Some(50),
        extra: Extras::new(),
    }
}

fn hrefs() -> AssetHrefs {
    AssetHrefs::from([(AssetId::new("asset_1"), "assets/logo.png".to_owned())])
}

fn snapshot_path(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/snapshots")
        .join(format!("{name}.svg"))
}

#[track_caller]
fn assert_snapshot(name: &str, actual: &str) {
    let path = snapshot_path(name);
    if std::env::var_os("UPDATE_SNAPSHOTS").is_some() {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, actual).unwrap();
        return;
    }
    let expected = std::fs::read_to_string(&path).unwrap_or_else(|e| {
        panic!(
            "missing snapshot {}: {e}\nrun with UPDATE_SNAPSHOTS=1 to create it",
            path.display()
        )
    });
    assert_eq!(
        expected.replace("\r\n", "\n"),
        actual,
        "snapshot {name} changed"
    );
}

#[test]
fn empty_canvas_with_background() {
    let mut doc = document(200.0, 100.0);
    doc.canvas.background = Some(Color::new("#ffffff"));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert_snapshot("empty_canvas_with_background", &svg);
}

#[test]
fn transparent_canvas_has_no_background_rect() {
    let doc = document(10.0, 10.0);
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(!svg.contains("<rect"), "{svg}");
    assert_snapshot("transparent_canvas", &svg);
}

#[test]
fn text_alignments() {
    let mut doc = document(300.0, 200.0);
    for (index, align) in [TextAlign::Left, TextAlign::Center, TextAlign::Right]
        .into_iter()
        .enumerate()
    {
        let mut layer = text(
            &format!("layer_{index}"),
            Transform::new(10.0, 10.0 + 50.0 * index as f64, 280.0, 40.0),
            "Aligned",
        );
        if let LayerKind::Text(t) = &mut layer.kind {
            t.align = align;
        }
        doc.layers.push(layer);
    }
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert_snapshot("text_alignments", &svg);
}

#[test]
fn multi_line_text_and_escaping() {
    let mut doc = document(300.0, 200.0);
    doc.layers.push(text(
        "layer_1",
        Transform::new(0.0, 0.0, 300.0, 120.0),
        "first line\nsecond & <third>",
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert_snapshot("multi_line_text", &svg);
}

#[test]
fn opacity_and_rotation() {
    let mut doc = document(200.0, 200.0);
    let mut layer = text(
        "layer_1",
        Transform {
            rotation: 30.0,
            ..Transform::new(20.0, 20.0, 160.0, 60.0)
        },
        "Tilted",
    );
    layer.opacity = 0.5;
    doc.layers.push(layer);
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert_snapshot("opacity_and_rotation", &svg);
}

#[test]
fn invisible_layers_are_omitted() {
    let mut doc = document(100.0, 100.0);
    let mut layer = text("layer_1", Transform::new(0.0, 0.0, 100.0, 20.0), "hidden");
    layer.visible = false;
    doc.layers.push(layer);
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(!svg.contains("hidden"), "{svg}");
    assert_snapshot("invisible_layer", &svg);
}

#[test]
fn image_fits() {
    let mut doc = document(400.0, 300.0);
    doc.assets.push(asset());
    for (index, fit) in [ImageFit::Fill, ImageFit::Contain, ImageFit::Cover]
        .into_iter()
        .enumerate()
    {
        doc.layers.push(image(
            &format!("layer_{index}"),
            Transform::new(10.0, 10.0 + 90.0 * index as f64, 120.0, 80.0),
            fit,
        ));
    }
    let svg = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    assert_snapshot("image_fits", &svg);
}

#[test]
fn nested_groups_and_rotated_group() {
    let mut doc = document(400.0, 400.0);
    doc.assets.push(asset());

    let inner = Layer::new(
        LayerId::new("layer_inner_group"),
        Transform::new(10.0, 10.0, 100.0, 100.0),
        LayerKind::Group(GroupLayer {
            children: vec![
                text(
                    "layer_nested_text",
                    Transform::new(0.0, 0.0, 100.0, 30.0),
                    "deep",
                ),
                image(
                    "layer_nested_image",
                    Transform::new(0.0, 40.0, 60.0, 40.0),
                    ImageFit::Contain,
                ),
            ],
            extra: Extras::new(),
        }),
    );

    let mut outer = Layer::new(
        LayerId::new("layer_outer_group"),
        Transform {
            rotation: 15.0,
            ..Transform::new(50.0, 50.0, 200.0, 200.0)
        },
        LayerKind::Group(GroupLayer {
            children: vec![inner],
            extra: Extras::new(),
        }),
    );
    outer.opacity = 0.8;
    doc.layers.push(outer);

    let svg = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    assert_snapshot("nested_groups", &svg);
}

#[test]
fn blend_modes_reach_the_output() {
    let mut doc = document(300.0, 300.0);
    doc.assets.push(asset());

    // Four of the sixteen, including two that only started rendering in
    // 0.14.0, so the snapshot shows the kebab-case spelling CSS uses.
    for (index, mode) in [
        BlendMode::Normal,
        BlendMode::Multiply,
        BlendMode::Overlay,
        BlendMode::Difference,
    ]
    .into_iter()
    .enumerate()
    {
        let mut layer = image(
            &format!("layer_{index}"),
            Transform::new(10.0, 10.0 + 60.0 * index as f64, 100.0, 50.0),
            ImageFit::Fill,
        );
        layer.blend_mode = mode;
        doc.layers.push(layer);
    }

    let svg = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    // `normal` is the default everywhere, so emitting it would only make the
    // output longer.
    assert_eq!(svg.matches("mix-blend-mode").count(), 3, "{svg}");
    assert!(svg.contains("mix-blend-mode:difference"), "{svg}");
    assert_snapshot("blend_modes", &svg);
}

#[test]
fn a_mode_this_build_cannot_draw_stops_the_render() {
    // Before 0.14.0 an unknown mode was left out of the output and composited
    // as `normal`. It is now refused: the document still keeps the value, but
    // a picture that silently ignores what it was told to do is worse than no
    // picture.
    let mut doc = document(300.0, 300.0);
    doc.assets.push(asset());
    let mut layer = image(
        "layer_future",
        Transform::new(10.0, 10.0, 100.0, 50.0),
        ImageFit::Fill,
    );
    layer.blend_mode = BlendMode::Other("plus-darker".to_owned());
    doc.layers.push(layer);

    let error = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap_err();
    assert!(
        matches!(
            &error,
            assemblash_renderer::RenderError::UnsupportedBlendMode { mode, .. }
                if mode == "plus-darker"
        ),
        "{error:?}"
    );
}

#[test]
fn a_group_isolates_only_when_a_child_blends() {
    let mut doc = document(300.0, 300.0);
    doc.assets.push(asset());

    let mut blending = image(
        "layer_blending",
        Transform::new(0.0, 0.0, 50.0, 50.0),
        ImageFit::Fill,
    );
    blending.blend_mode = BlendMode::Screen;

    let mut with_blend = Layer::new(
        LayerId::new("layer_group_isolated"),
        Transform::new(10.0, 10.0, 100.0, 100.0),
        LayerKind::Group(GroupLayer {
            children: vec![blending],
            extra: Extras::new(),
        }),
    );
    with_blend.blend_mode = BlendMode::Multiply;

    let plain = Layer::new(
        LayerId::new("layer_group_plain"),
        Transform::new(150.0, 10.0, 100.0, 100.0),
        LayerKind::Group(GroupLayer {
            children: vec![image(
                "layer_plain_child",
                Transform::new(0.0, 0.0, 50.0, 50.0),
                ImageFit::Fill,
            )],
            extra: Extras::new(),
        }),
    );

    doc.layers.push(with_blend);
    doc.layers.push(plain);

    let svg = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    assert_eq!(svg.matches("isolation:isolate").count(), 1, "{svg}");
    assert_snapshot("group_isolation", &svg);
}

#[test]
fn the_first_baseline_comes_from_the_fonts_ascent() {
    let mut doc = document(300.0, 100.0);
    doc.layers.push(text(
        "layer_1",
        Transform::new(0.0, 10.0, 300.0, 40.0),
        "measured",
    ));

    let measured = FontSet::measured([(
        "Inter",
        Some(FontMetrics {
            units_per_em: 1000.0,
            ascender: 750.0,
            descender: -250.0,
            line_gap: 0.0,
        }),
    )]);

    // 10 (box top) + 24 (font size) * 0.75 (ascent) = 28.
    let svg = doc_to_svg(&doc, &measured, &AssetHrefs::new()).unwrap();
    assert!(svg.contains("y=\"28\""), "{svg}");

    // A set nobody measured keeps the pre-0.5 rule: 10 + 24 = 34. Only
    // callers that never resolved fonts see this, and they are previewing
    // structure rather than producing final pixels.
    let unmeasured = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(unmeasured.contains("y=\"34\""), "{unmeasured}");

    assert_snapshot("measured_baseline", &svg);
}

#[test]
fn semi_transparent_colors_render_as_rgba() {
    let mut doc = document(100.0, 100.0);
    doc.canvas.background = Some(Color::new("#00000040"));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert_snapshot("translucent_background", &svg);
}

#[test]
fn rendering_is_deterministic() {
    let mut doc = document(400.0, 400.0);
    doc.assets.push(asset());
    doc.layers.push(text(
        "layer_1",
        Transform::new(1.0 / 3.0, 0.1 + 0.2, 300.0, 40.0),
        "same every time",
    ));
    doc.layers.push(image(
        "layer_2",
        Transform::new(0.0, 0.0, 10.0, 10.0),
        ImageFit::Cover,
    ));

    let first = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    let second = doc_to_svg(&doc, &fonts(), &hrefs()).unwrap();
    assert_eq!(first, second);
    assert_snapshot("deterministic_numbers", &first);
}

#[test]
fn a_missing_font_is_an_error_not_a_substitution() {
    let mut doc = document(100.0, 100.0);
    let mut layer = text("layer_1", Transform::new(0.0, 0.0, 100.0, 20.0), "x");
    if let LayerKind::Text(t) = &mut layer.kind {
        t.font_family = "Nonexistent".to_owned();
    }
    doc.layers.push(layer);

    let error = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap_err();
    assert!(
        matches!(error, assemblash_renderer::RenderError::MissingFont { .. }),
        "{error:?}"
    );
}

#[test]
fn an_unresolved_asset_is_an_error() {
    let mut doc = document(100.0, 100.0);
    doc.assets.push(asset());
    doc.layers.push(image(
        "layer_1",
        Transform::new(0.0, 0.0, 10.0, 10.0),
        ImageFit::Fill,
    ));

    let error = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap_err();
    assert!(
        matches!(
            error,
            assemblash_renderer::RenderError::UnresolvedAsset { .. }
        ),
        "{error:?}"
    );
}

#[test]
fn an_invalid_document_is_refused() {
    let mut doc = document(0.0, 100.0);
    doc.canvas.width = 0.0;
    let error = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap_err();
    assert!(
        matches!(
            error,
            assemblash_renderer::RenderError::InvalidDocument { .. }
        ),
        "{error:?}"
    );
}

/// The bundled subset, loaded with the glyph advances wrapping needs.
///
/// `FontSet::new` names families without measuring them, which is enough for
/// the snapshots above and not enough here: nothing wraps until something has
/// been measured.
fn measured_fonts() -> LoadedFonts {
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts/NotoSans-Subset.ttf");
    LoadedFonts::from_files([fixture]).unwrap()
}

fn noto(id: &str, transform: Transform, body: &str) -> Layer {
    let mut layer = text(id, transform, body);
    if let LayerKind::Text(t) = &mut layer.kind {
        t.font_family = "Noto Sans".to_owned();
    }
    layer
}

#[test]
fn a_word_wider_than_its_box_is_reported() {
    let fonts = measured_fonts();
    let mut doc = document(400.0, 400.0);
    doc.layers.push(noto(
        "layer_1",
        Transform::new(0.0, 0.0, 40.0, 300.0),
        "Supercalifragilistic",
    ));

    let warnings = export_warnings(&doc, fonts.font_set(), Path::new("."));
    let broken = warnings
        .iter()
        .find(|warning| warning.code == WORD_BROKEN_MID_WORD)
        .expect("a word wider than a 40 pixel box is split");
    assert_eq!(broken.layer_id, Some(LayerId::new("layer_1")));
    assert!(broken.message.contains("layer_1"), "{}", broken.message);

    // The same words in a box wide enough for them say nothing.
    let mut roomy = document(400.0, 400.0);
    roomy.layers.push(noto(
        "layer_1",
        Transform::new(0.0, 0.0, 380.0, 300.0),
        "Supercalifragilistic",
    ));
    assert_eq!(
        export_warnings(&roomy, fonts.font_set(), Path::new(".")),
        []
    );
}

#[test]
fn text_taller_than_its_box_is_reported() {
    let fonts = measured_fonts();
    let mut doc = document(400.0, 400.0);
    doc.layers.push(noto(
        "layer_1",
        Transform::new(0.0, 0.0, 380.0, 20.0),
        "one
two
three
four",
    ));

    let warnings = export_warnings(&doc, fonts.font_set(), Path::new("."));
    let overflow = warnings
        .iter()
        .find(|warning| warning.code == TEXT_OVERFLOWS_BOX)
        .expect("four lines do not fit a 20 pixel box");
    assert_eq!(overflow.layer_id, Some(LayerId::new("layer_1")));

    // A box tall enough for the same four lines is silent — and warnings
    // never touch a pixel, so both documents render identically to the
    // renderer's own SVG apart from the height they were given.
    let mut tall = document(400.0, 400.0);
    tall.layers.push(noto(
        "layer_1",
        Transform::new(0.0, 0.0, 380.0, 300.0),
        "one
two
three
four",
    ));
    assert_eq!(export_warnings(&tall, fonts.font_set(), Path::new(".")), []);
}

#[test]
fn warnings_never_change_what_is_drawn() {
    let fonts = measured_fonts();
    let mut doc = document(400.0, 400.0);
    doc.layers.push(noto(
        "layer_1",
        Transform::new(0.0, 0.0, 40.0, 20.0),
        "Supercalifragilistic",
    ));

    let before = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    let warnings = export_warnings(&doc, fonts.font_set(), Path::new("."));
    assert_eq!(warnings.len(), 2, "{warnings:?}");
    let after = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    assert_eq!(before, after);
}

// ---------------------------------------------------------------------------
// Shapes and shadows (1.6.0)
// ---------------------------------------------------------------------------

fn shape(
    id: &str,
    transform: Transform,
    kind: ShapeKind,
    fill: Option<&str>,
    stroke: Option<(&str, f64)>,
) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        LayerKind::Shape(ShapeLayer {
            shape: kind,
            fill: fill.map(Color::new),
            stroke: stroke.map(|(color, width)| Stroke {
                color: Color::new(color),
                width,
            }),
            extra: Extras::new(),
        }),
    )
}

#[test]
fn a_filled_rect_with_square_corners_is_a_plain_rect() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 90.5),
        ShapeKind::Rect { corner_radius: 0.0 },
        Some("#3366cc"),
        None,
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    // Square corners have no arc to convert, so the short element is also the
    // one that never reaches kurbo.
    assert!(svg.contains("<rect x=\"20.5\""), "{svg}");
    assert!(!svg.contains("stroke"), "{svg}");
    assert_snapshot("shape_filled_rect", &svg);
}

#[test]
fn a_stroked_rounded_rect_is_cubics_and_never_rx() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 90.5),
        ShapeKind::Rect {
            corner_radius: 18.0,
        },
        Some("#3366cc"),
        Some(("#112233", 4.0)),
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    // `rx` would hand the corner to usvg, which hands it to kurbo, which calls
    // the platform's `sin_cos`/`tan`/`powf` — the one thing on this path that
    // can differ between targets.
    assert!(svg.contains("<path d=\"M "), "{svg}");
    assert!(svg.contains(" C "), "{svg}");
    assert!(!svg.contains("rx="), "{svg}");
    // The stroke is inset by half its width: 20.5 + 2 = 22.5, and the radius
    // comes in with it, 18 - 2 = 16, so the path starts at 22.5 + 16 = 38.5.
    assert!(svg.contains("stroke-width=\"4\""), "{svg}");
    assert!(svg.contains("M 38.5 12.25"), "{svg}");
    assert_snapshot("shape_stroked_rounded_rect", &svg);
}

#[test]
fn an_ellipse_is_four_cubics_not_an_ellipse_element() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 90.5),
        ShapeKind::Ellipse,
        None,
        Some(("#204060", 0.5)),
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(!svg.contains("<ellipse"), "{svg}");
    assert_eq!(svg.matches(" C ").count(), 4, "{svg}");
    // No fill is `none`, not black.
    assert!(svg.contains("fill=\"none\""), "{svg}");
    assert_snapshot("shape_ellipse", &svg);
}

#[test]
fn a_line_runs_across_the_middle_of_its_box() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform {
            rotation: 17.5,
            ..Transform::new(20.5, 10.25, 160.0, 40.0)
        },
        ShapeKind::Line,
        // A line has no interior, so a fill on one means nothing and is left
        // out of the output rather than drawn.
        Some("#3366cc"),
        Some(("#8b1a1a", 3.0)),
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(
        svg.contains("<line x1=\"20.5\" y1=\"30.25\" x2=\"180.5\" y2=\"30.25\""),
        "{svg}"
    );
    assert!(svg.contains("stroke-linecap=\"butt\""), "{svg}");
    assert!(!svg.contains("fill="), "{svg}");
    assert_snapshot("shape_line", &svg);
}

#[test]
fn a_stroke_wider_than_its_box_fills_in_the_stroke_colour() {
    // The naive clamp — `w - s` floored at zero — makes the shape vanish at
    // exactly `s = min(w, h)` while `0.999 * min(w, h)` still fills the box.
    // Clamping `s` instead is the continuous limit of the inset rule.
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 40.0),
        ShapeKind::Rect { corner_radius: 6.0 },
        Some("#3366cc"),
        Some(("#8b1a1a", 90.0)),
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(!svg.contains("stroke"), "{svg}");
    assert!(svg.contains("fill=\"#8b1a1a\""), "{svg}");
    // The full box, not an inset one, and its radius is untouched.
    assert!(svg.contains("M 26.5 10.25"), "{svg}");
    assert_snapshot("shape_oversize_stroke", &svg);
}

#[test]
fn a_zero_width_stroke_draws_nothing() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 40.0),
        ShapeKind::Rect { corner_radius: 0.0 },
        Some("#3366cc"),
        Some(("#8b1a1a", 0.0)),
    ));
    // A line with no width has nothing left at all: no interior to fill, and
    // an element that draws nothing still costs the rasterizer a pass.
    doc.layers.push(shape(
        "layer_2",
        Transform::new(20.5, 70.0, 160.0, 20.0),
        ShapeKind::Line,
        None,
        Some(("#8b1a1a", 0.0)),
    ));
    doc.layers.push(shape(
        "layer_3",
        Transform::new(20.5, 95.0, 160.0, 20.0),
        ShapeKind::Line,
        None,
        None,
    ));
    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(!svg.contains("stroke"), "{svg}");
    assert!(!svg.contains("<line"), "{svg}");
    assert_eq!(svg.matches("<rect").count(), 1, "{svg}");
    assert_snapshot("shape_zero_width_stroke", &svg);
}

#[test]
fn a_shape_this_build_cannot_draw_stops_the_render() {
    let mut doc = document(200.0, 120.0);
    doc.layers.push(shape(
        "layer_1",
        Transform::new(20.5, 10.25, 160.0, 40.0),
        ShapeKind::Other(serde_json::json!({ "kind": "star", "points": 5 })),
        Some("#3366cc"),
        None,
    ));
    let error = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap_err();
    assert!(
        matches!(
            &error,
            assemblash_renderer::RenderError::UnsupportedShape { kind, .. } if kind == "star"
        ),
        "{error:?}"
    );
}

#[test]
fn a_drop_shadow_gets_an_explicit_user_space_region() {
    let mut doc = document(300.0, 200.0);
    let mut layer = shape(
        "layer_1",
        Transform::new(40.0, 30.0, 100.0, 60.0),
        ShapeKind::Rect { corner_radius: 0.0 },
        Some("#3366cc"),
        None,
    );
    layer.effects = vec![Effect::DropShadow {
        dx: 6.0,
        dy: 4.0,
        blur: 3.0,
        color: Color::new("#00000080"),
    }];
    doc.layers.push(layer);

    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    // Box (40, 30, 100, 60) union its (6, 4) copy is x 40..146, y 30..94. The
    // blur margin is ceil(3 * 3) + 1 = 10, and half the box is 50 and 30, so
    // the region grows by 50 on each side in x and 30 in y.
    assert!(
        svg.contains(
            "filterUnits=\"userSpaceOnUse\" x=\"-10\" y=\"0\" width=\"206\" height=\"124\""
        ),
        "{svg}"
    );
    assert!(
        svg.contains(
            "<feDropShadow in=\"SourceGraphic\" result=\"e0\" dx=\"6\" dy=\"4\" \
             stdDeviation=\"3\" flood-color=\"#000000\" flood-opacity=\"0.501961\"/>"
        ),
        "{svg}"
    );
    assert_snapshot("shape_drop_shadow", &svg);
}

#[test]
fn a_stack_without_a_shadow_keeps_the_percentage_region() {
    // The region rule only changes for a stack that casts a shadow; every
    // other filter is emitted exactly as it was before 1.6.0, which is what
    // keeps the existing goldens and snapshots unmoved.
    let mut doc = document(300.0, 200.0);
    let mut layer = shape(
        "layer_1",
        Transform::new(40.0, 30.0, 100.0, 60.0),
        ShapeKind::Ellipse,
        Some("#3366cc"),
        None,
    );
    layer.effects = vec![Effect::Blur { radius: 4.0 }];
    doc.layers.push(layer);

    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    assert!(
        svg.contains("x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\""),
        "{svg}"
    );
    assert!(!svg.contains("filterUnits"), "{svg}");
    assert_snapshot("shape_blur_only_region", &svg);
}

#[test]
fn several_shadows_in_one_stack_union_their_offsets() {
    let mut doc = document(300.0, 200.0);
    let mut layer = shape(
        "layer_1",
        Transform::new(40.0, 30.0, 100.0, 60.0),
        ShapeKind::Rect { corner_radius: 0.0 },
        Some("#3366cc"),
        None,
    );
    layer.effects = vec![
        Effect::DropShadow {
            dx: -20.0,
            dy: 0.0,
            blur: 1.0,
            color: Color::new("#000000"),
        },
        Effect::DropShadow {
            dx: 30.0,
            dy: 12.0,
            blur: 2.0,
            color: Color::new("#ff0000"),
        },
    ];
    doc.layers.push(layer);

    let svg = doc_to_svg(&doc, &fonts(), &AssetHrefs::new()).unwrap();
    // x 20..170, y 30..102; the margins are max(50, ceil(6) + 1) = 50 and
    // max(30, 7) = 30.
    assert!(
        svg.contains(
            "filterUnits=\"userSpaceOnUse\" x=\"-30\" y=\"0\" width=\"250\" height=\"132\""
        ),
        "{svg}"
    );
    // An opaque shadow colour writes no flood-opacity at all.
    assert!(svg.contains("flood-color=\"#ff0000\"/>"), "{svg}");
    assert_snapshot("shape_two_shadows", &svg);
}
