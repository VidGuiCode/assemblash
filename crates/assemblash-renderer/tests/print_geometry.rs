//! `Canvas.bleed` and `Canvas.margins` never reach a PNG or SVG export.
//!
//! The two fields describe print geometry for the proofing warnings and for a
//! later print export. A PNG or SVG of the same document must not change by a
//! single byte when they are present.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::{Document, Insets};
use assemblash_renderer::{doc_to_svg, document_to_png, AssetHrefs, LoadedFonts, PngMetadata};

fn document() -> Document {
    serde_json::from_value(serde_json::json!({
        "schemaVersion": 1,
        "id": "doc_01M61CXXZ0X2V89DQ9T8Z3VF00",
        "version": 0,
        "canvas": { "width": 120.0, "height": 80.0, "background": "#E2DDD3" },
        "assets": [],
        "layers": [{
            "id": "layer_01M61CXXZ0X2V89DQ9T8Z3VF01",
            "transform": { "x": -10.0, "y": 4.0, "width": 70.0, "height": 40.0, "rotation": 0.0 },
            "type": "shape",
            "shape": { "kind": "rect", "cornerRadius": 6.0 },
            "fill": "#2F6FDB"
        }]
    }))
    .unwrap()
}

fn with_print_geometry(mut document: Document) -> Document {
    document.canvas.bleed = Some(Insets::uniform(9.0));
    document.canvas.margins = Some(Insets {
        top: 12.0,
        right: 10.0,
        bottom: 12.0,
        left: 10.0,
        ..Insets::default()
    });
    document
}

fn png(document: &Document) -> Vec<u8> {
    document_to_png(
        document,
        &LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>()),
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(document),
    )
    .unwrap()
}

fn svg(document: &Document) -> String {
    let fonts = LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>());
    doc_to_svg(document, fonts.font_set(), &AssetHrefs::new()).unwrap()
}

#[test]
fn bleed_and_margins_do_not_change_png_bytes() {
    let plain = document();
    let print = with_print_geometry(plain.clone());
    assert_ne!(plain, print, "the second document carries print geometry");
    assert_eq!(png(&plain), png(&print));
}

#[test]
fn bleed_and_margins_do_not_change_svg_bytes() {
    let plain = document();
    let print = with_print_geometry(plain.clone());
    assert_eq!(svg(&plain), svg(&print));
}

#[test]
fn a_document_without_print_geometry_writes_no_new_keys() {
    let text = serde_json::to_string(&document()).unwrap();
    assert!(!text.contains("bleed"), "{text}");
    assert!(!text.contains("margins"), "{text}");
}

#[test]
fn print_geometry_round_trips_and_unknown_side_keys_are_kept() {
    let mut value = serde_json::to_value(with_print_geometry(document())).unwrap();
    value["canvas"]["bleed"]["slug"] = serde_json::json!(18);
    value["canvas"]["margins"] = serde_json::json!({ "left": 5 });
    let read: Document = serde_json::from_value(value.clone()).unwrap();
    let margins = read.canvas.margins.clone().unwrap();
    assert_eq!((margins.left, margins.top, margins.right), (5.0, 0.0, 0.0));
    let written = serde_json::to_value(&read).unwrap();
    assert_eq!(written["canvas"]["bleed"]["slug"], serde_json::json!(18));
}
