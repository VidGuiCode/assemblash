//! The three print-proofing warnings.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::{Document, Insets};
use assemblash_renderer::proofing::{
    print_warnings, ASSET_BELOW_TARGET_RESOLUTION, CONTENT_INSIDE_BLEED, CONTENT_OUTSIDE_MARGINS,
};

/// A 200 x 100 canvas with the given layers.
fn document(layers: serde_json::Value) -> Document {
    serde_json::from_value(serde_json::json!({
        "schemaVersion": 1,
        "id": "doc_01M61CXXZ0X2V89DQ9T8Z3VF00",
        "version": 0,
        "canvas": { "width": 200.0, "height": 100.0 },
        "assets": [{
            "id": "asset_01M61CXXZ0X2V89DQ9T8Z3VFA0",
            "path": "photo.png",
            "hash": format!("sha256:{}", "0".repeat(64)),
            "mediaType": "image/png",
            "width": 100,
            "height": 50
        }],
        "layers": layers
    }))
    .unwrap()
}

fn rect(id: u32, x: f64, y: f64, width: f64, height: f64) -> serde_json::Value {
    serde_json::json!({
        "id": format!("layer_01M61CXXZ0X2V89DQ9T8Z3VF{id:02}"),
        "transform": { "x": x, "y": y, "width": width, "height": height, "rotation": 0.0 },
        "type": "shape",
        "shape": { "kind": "rect", "cornerRadius": 0.0 },
        "fill": "#2F6FDB"
    })
}

fn text(id: u32, x: f64, y: f64, width: f64, height: f64) -> serde_json::Value {
    serde_json::json!({
        "id": format!("layer_01M61CXXZ0X2V89DQ9T8Z3VF{id:02}"),
        "transform": { "x": x, "y": y, "width": width, "height": height, "rotation": 0.0 },
        "type": "text",
        "text": "Title",
        "fontFamily": "Test Sans",
        "fontSize": 12.0,
        "color": "#101820",
        "align": "left",
        "lineHeight": 1.2
    })
}

fn image(id: u32, width: f64, height: f64, fit: &str) -> serde_json::Value {
    serde_json::json!({
        "id": format!("layer_01M61CXXZ0X2V89DQ9T8Z3VF{id:02}"),
        "transform": { "x": 50.0, "y": 25.0, "width": width, "height": height, "rotation": 0.0 },
        "type": "image",
        "asset": "asset_01M61CXXZ0X2V89DQ9T8Z3VFA0",
        "fit": fit
    })
}

fn codes(document: &Document, scale: f32) -> Vec<&'static str> {
    print_warnings(document, scale)
        .into_iter()
        .map(|warning| warning.code)
        .collect()
}

fn with_margins(mut document: Document, margin: f64) -> Document {
    document.canvas.margins = Some(Insets::uniform(margin));
    document
}

fn with_bleed(mut document: Document, bleed: f64) -> Document {
    document.canvas.bleed = Some(Insets::uniform(bleed));
    document
}

#[test]
fn a_document_without_print_geometry_has_no_proofing_warnings() {
    // Text past the edge and an upscaled image: both would warn on a print
    // document. Without bleed or margins, nothing is said.
    let plain = document(serde_json::json!([
        text(1, -5.0, 10.0, 60.0, 20.0),
        image(2, 400.0, 200.0, "fill")
    ]));
    assert!(print_warnings(&plain, 1.0).is_empty());
}

#[test]
fn text_that_crosses_the_margin_is_reported() {
    let doc = with_margins(
        document(serde_json::json!([
            text(1, 20.0, 20.0, 100.0, 20.0),
            text(2, 5.0, 20.0, 100.0, 20.0),
            text(3, 150.0, 20.0, 60.0, 20.0)
        ])),
        10.0,
    );
    let warnings = print_warnings(&doc, 1.0);
    let layers: Vec<String> = warnings
        .iter()
        .map(|w| w.layer_id.as_ref().unwrap().to_string())
        .collect();
    assert!(warnings.iter().all(|w| w.code == CONTENT_OUTSIDE_MARGINS));
    // Layer 1 is inside the safe area. Layer 2 crosses the left margin.
    // Layer 3 runs past the right trim edge: text is reported there too.
    assert_eq!(
        layers,
        [
            "layer_01M61CXXZ0X2V89DQ9T8Z3VF02",
            "layer_01M61CXXZ0X2V89DQ9T8Z3VF03"
        ]
    );
    assert!(
        warnings[0].message.contains("left"),
        "{}",
        warnings[0].message
    );
    assert!(
        warnings[1].message.contains("right"),
        "{}",
        warnings[1].message
    );
}

#[test]
fn a_shape_that_runs_to_the_trim_is_not_a_margin_problem() {
    let doc = with_margins(
        document(serde_json::json!([
            rect(1, 0.0, 0.0, 200.0, 100.0),
            rect(2, 5.0, 40.0, 20.0, 20.0)
        ])),
        10.0,
    );
    let warnings = print_warnings(&doc, 1.0);
    assert_eq!(warnings.len(), 1);
    assert_eq!(warnings[0].code, CONTENT_OUTSIDE_MARGINS);
    assert_eq!(
        warnings[0].layer_id.as_ref().unwrap().as_str(),
        "layer_01M61CXXZ0X2V89DQ9T8Z3VF02"
    );
}

#[test]
fn content_that_stops_inside_the_bleed_is_reported() {
    let doc = with_bleed(
        document(serde_json::json!([
            // Full bleed: reaches the bleed edge on every side.
            rect(1, -9.0, -9.0, 218.0, 118.0),
            // Ends at the trim on the left: a line of paper can show.
            rect(2, 0.0, 30.0, 40.0, 40.0),
            // Goes 4 pixels past the right trim, short of the 9 pixel bleed.
            rect(3, 170.0, 30.0, 34.0, 40.0),
            // Well inside the trim.
            rect(4, 80.0, 30.0, 40.0, 40.0)
        ])),
        9.0,
    );
    let warnings = print_warnings(&doc, 1.0);
    assert!(warnings.iter().all(|w| w.code == CONTENT_INSIDE_BLEED));
    let layers: Vec<&str> = warnings
        .iter()
        .map(|w| w.layer_id.as_ref().unwrap().as_str())
        .collect();
    assert_eq!(
        layers,
        [
            "layer_01M61CXXZ0X2V89DQ9T8Z3VF02",
            "layer_01M61CXXZ0X2V89DQ9T8Z3VF03"
        ]
    );
}

#[test]
fn a_hidden_layer_is_not_checked() {
    let mut hidden = rect(1, 0.0, 30.0, 40.0, 40.0);
    hidden["visible"] = serde_json::json!(false);
    let doc = with_bleed(document(serde_json::json!([hidden])), 9.0);
    assert!(print_warnings(&doc, 1.0).is_empty());
}

#[test]
fn an_upscaled_image_is_below_target_resolution() {
    // The asset is 100 x 50 source pixels.
    let at_size = with_margins(
        document(serde_json::json!([image(1, 100.0, 50.0, "fill")])),
        1.0,
    );
    assert!(codes(&at_size, 1.0).is_empty());
    // The same box exported at scale 2 needs 200 x 100 output pixels.
    assert_eq!(codes(&at_size, 2.0), [ASSET_BELOW_TARGET_RESOLUTION]);

    let stretched = with_margins(
        document(serde_json::json!([image(1, 120.0, 50.0, "fill")])),
        1.0,
    );
    assert_eq!(codes(&stretched, 1.0), [ASSET_BELOW_TARGET_RESOLUTION]);

    // `contain` in a taller box keeps the aspect ratio: 100 x 50 still fits
    // without upscaling into a 100 x 90 box.
    let contained = with_margins(
        document(serde_json::json!([image(1, 100.0, 70.0, "contain")])),
        1.0,
    );
    assert!(codes(&contained, 1.0).is_empty());
    // `cover` of the same box must scale up to fill its height.
    let covered = with_margins(
        document(serde_json::json!([image(1, 100.0, 70.0, "cover")])),
        1.0,
    );
    assert_eq!(codes(&covered, 1.0), [ASSET_BELOW_TARGET_RESOLUTION]);
}

#[test]
fn a_crop_counts_only_the_cropped_source_pixels() {
    let mut cropped = image(1, 100.0, 50.0, "fill");
    cropped["crop"] = serde_json::json!({ "x": 0.0, "y": 0.0, "width": 50.0, "height": 25.0 });
    let doc = with_margins(document(serde_json::json!([cropped])), 1.0);
    let warnings = print_warnings(&doc, 1.0);
    assert_eq!(warnings.len(), 1);
    assert!(
        warnings[0].message.contains("50 x 25"),
        "{}",
        warnings[0].message
    );
}

#[test]
fn margins_that_leave_no_safe_area_are_one_warning_and_never_a_panic() {
    // A release before 1.14.0 can resize a canvas below its margins, and such
    // a document loads. Its export says so once, instead of a margin warning
    // for every layer.
    let mut document = with_margins(
        document(serde_json::json!([
            text(1, 10.0, 10.0, 50.0, 20.0),
            rect(2, 0.0, 0.0, 10.0, 10.0)
        ])),
        150.0,
    );
    assert_eq!(
        codes(&document, 1.0),
        [assemblash_renderer::proofing::MARGINS_LEAVE_NO_SAFE_AREA]
    );
    let warning = &print_warnings(&document, 1.0)[0];
    assert!(
        warning.message.contains("updateCanvas"),
        "{}",
        warning.message
    );

    // A negative bleed from a hand-written file is not a panic either.
    document.canvas.bleed = Some(Insets {
        left: -5.0,
        ..Insets::default()
    });
    let _ = print_warnings(&document, 1.0);
}
