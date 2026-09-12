//! The 1.8.0 typed refusals, and the promise that a layer with no clip, crop
//! or flip is emitted exactly as it was before 1.8.0.
//!
//! These are the failures that would otherwise be silent: a mask that is
//! dropped, a crop that draws an empty box, or a wrapper that leaks into the
//! default path and moves every existing golden.

#![allow(clippy::unwrap_used, clippy::expect_used)]

use assemblash_core::document::{Clip, Crop, Extras, ImageFit, ImageLayer, ShapeKind, ShapeLayer};
use assemblash_core::ids::AssetId;
use assemblash_core::{Color, Document, Layer, LayerId, LayerKind, Transform};
use assemblash_renderer::fonts::FontSet;
use assemblash_renderer::{doc_to_svg, AssetHrefs, RenderError};

fn asset_hrefs(asset: &AssetId) -> AssetHrefs {
    AssetHrefs::from([(asset.clone(), "data:image/png;base64,AAAA".to_owned())])
}

/// A document with one image layer and one shape layer, plus the asset record
/// that gives the image a size.
fn image_document() -> (Document, AssetId) {
    let mut document = Document::new(
        &mut assemblash_core::ids::SequentialIdSource::new(),
        200.0,
        200.0,
    );
    let asset = AssetId::new("asset_00000000000000000000000001");
    document.assets.push(assemblash_core::Asset {
        id: asset.clone(),
        path: "swatch.png".to_owned(),
        hash: assemblash_core::storage::hash_bytes(b"bytes"),
        media_type: "image/png".to_owned(),
        width: Some(40),
        height: Some(40),
        extra: Extras::new(),
    });
    document.layers.push(Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(10.0, 10.0, 80.0, 80.0),
        LayerKind::Image(ImageLayer {
            asset: asset.clone(),
            fit: ImageFit::Fill,
            crop: None,
            extra: Extras::new(),
        }),
    ));
    document.layers.push(Layer::new(
        LayerId::new("layer_00000000000000000000000002"),
        Transform::new(100.0, 10.0, 80.0, 80.0),
        LayerKind::Shape(ShapeLayer {
            shape: ShapeKind::Rect { corner_radius: 0.0 },
            fill: Some(Color::new("#3366cc")),
            stroke: None,
            extra: Extras::new(),
        }),
    ));
    (document, asset)
}

fn render(document: &Document, asset: &AssetId) -> Result<String, RenderError> {
    doc_to_svg(document, &FontSet::unchecked(), &asset_hrefs(asset))
}

#[test]
fn a_layer_with_no_clip_crop_or_flip_is_emitted_as_before() {
    // The default path is sacred: no wrapper, no clip definition, no mirror.
    let (document, asset) = image_document();
    let svg = render(&document, &asset).unwrap();

    assert!(!svg.contains("clipPath"), "{svg}");
    assert!(!svg.contains("clip-path"), "{svg}");
    assert!(!svg.contains("scale(-1"), "{svg}");
    // Every drawn element carries its own attributes, with no group around it.
    assert!(svg.contains("<image x=\"10\" y=\"10\""), "{svg}");
    assert!(svg.contains("<rect x=\"100\" y=\"10\""), "{svg}");
}

#[test]
fn a_clip_is_emitted_as_a_definition_and_a_wrapper() {
    let (mut document, asset) = image_document();
    document.layers[0].clip = Some(Clip::Ellipse);
    let svg = render(&document, &asset).unwrap();

    assert!(
        svg.contains("<clipPath id=\"clip-layer_00000000000000000000000001\">"),
        "{svg}"
    );
    assert!(
        svg.contains("<g clip-path=\"url(#clip-layer_00000000000000000000000001)\">"),
        "{svg}"
    );
    // The layer's own attributes moved up to the wrapper: the image element
    // itself carries none.
    let image_line = svg
        .lines()
        .find(|line| line.contains("<image"))
        .expect("the image is drawn");
    assert!(!image_line.contains("opacity"), "{image_line}");
    assert!(!image_line.contains("filter"), "{image_line}");
}

#[test]
fn a_clip_on_a_box_with_no_area_is_refused() {
    let (mut document, asset) = image_document();
    document.layers[0].transform.width = 0.0;
    document.layers[0].clip = Some(Clip::Rect { corner_radius: 0.0 });

    assert!(matches!(
        render(&document, &asset),
        Err(RenderError::DegenerateClip { .. })
    ));
}

#[test]
fn a_clip_this_build_does_not_draw_is_refused_not_dropped() {
    // Validation accepts an unknown clip (preserving it is the point), so the
    // renderer is where it has to stop.
    let (mut document, asset) = image_document();
    document.layers[0].clip = Some(Clip::Other(serde_json::json!({"shape": "polygon"})));

    assert!(matches!(
        render(&document, &asset),
        Err(RenderError::UnsupportedClip { .. })
    ));
}

#[test]
fn a_crop_wholly_outside_the_source_is_refused() {
    let (mut document, asset) = image_document();
    if let LayerKind::Image(image) = &mut document.layers[0].kind {
        image.crop = Some(Crop {
            x: 200.0,
            y: 200.0,
            width: 10.0,
            height: 10.0,
        });
    }

    assert!(matches!(
        render(&document, &asset),
        Err(RenderError::CropOutsideSource { .. })
    ));
}

#[test]
fn a_crop_without_a_source_size_is_refused() {
    let (mut document, asset) = image_document();
    document.assets[0].width = None;
    document.assets[0].height = None;
    if let LayerKind::Image(image) = &mut document.layers[0].kind {
        image.crop = Some(Crop {
            x: 0.0,
            y: 0.0,
            width: 10.0,
            height: 10.0,
        });
    }

    assert!(matches!(
        render(&document, &asset),
        Err(RenderError::CropWithoutSourceSize { .. })
    ));
}

#[test]
fn a_crop_running_past_the_source_is_clamped_not_refused() {
    let (mut document, asset) = image_document();
    if let LayerKind::Image(image) = &mut document.layers[0].kind {
        image.crop = Some(Crop {
            x: 20.0,
            y: 20.0,
            width: 100.0,
            height: 100.0,
        });
    }

    let svg = render(&document, &asset).unwrap();
    // The window is the intersection with the 40x40 source: 20,20 20x20.
    assert!(svg.contains("viewBox=\"20 20 20 20\""), "{svg}");
}

#[test]
fn a_flipped_layer_composes_the_mirror_about_the_box_centre() {
    let (mut document, asset) = image_document();
    document.layers[0].transform.flip_horizontal = true;
    let svg = render(&document, &asset).unwrap();

    assert!(
        svg.contains("transform=\"translate(50 50) scale(-1 1) translate(-50 -50)\""),
        "{svg}"
    );
    // The box itself is unchanged: a mirror is not a negative size.
    assert!(
        svg.contains("<image x=\"10\" y=\"10\" width=\"80\" height=\"80\""),
        "{svg}"
    );
}

#[test]
fn a_rotated_clipped_layer_writes_the_inverse_rotation_into_the_clip() {
    let (mut document, asset) = image_document();
    document.layers[0].transform.rotation = 30.0;
    document.layers[0].clip = Some(Clip::Rect {
        corner_radius: 12.0,
    });
    let svg = render(&document, &asset).unwrap();

    // The rotation turns the layer...
    assert!(svg.contains("rotate(30 50 50)"), "{svg}");
    // ...and the clip shape carries its inverse, so the mask stays on the box
    // in the layer's parent space instead of turning with the content.
    assert!(svg.contains("rotate(-30)"), "{svg}");
}
