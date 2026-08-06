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

use std::path::PathBuf;

use assemblash_core::document::{
    BlendMode, Extras, GroupLayer, ImageFit, ImageLayer, TextAlign, TextLayer, Transform,
};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::{Asset, Color, Document, Layer, LayerKind};
use assemblash_renderer::{doc_to_svg, AssetHrefs, FontMetrics, FontSet};

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
        BlendMode::ColorDodge,
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
    assert!(svg.contains("mix-blend-mode:color-dodge"), "{svg}");
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
