//! Step 2 exit test: an arbitrary valid document survives a JSON round trip
//! unchanged — including keys this build does not understand.
//!
//! This is the property the whole file format rests on. If a document can
//! lose a field by being opened and saved, nothing downstream (history,
//! undo, agent edits) can be trusted.

#![allow(clippy::unwrap_used, clippy::expect_used)]

use std::collections::BTreeMap;

use assemblash_core::document::{Extras, GroupLayer, ImageFit, ImageLayer, TextAlign, TextLayer};
use assemblash_core::ids::{AssetId, DocumentId, LayerId};
use assemblash_core::{
    validate, Asset, BlendMode, Canvas, Color, Document, Layer, LayerKind, Transform,
    SCHEMA_VERSION,
};
use proptest::prelude::*;

/// Finite, unremarkable coordinates. The point of the test is structure, not
/// float edge cases; validation is what rejects the non-finite ones.
fn coordinate() -> impl Strategy<Value = f64> {
    -10_000.0f64..10_000.0
}

fn extent() -> impl Strategy<Value = f64> {
    0.0f64..10_000.0
}

fn color() -> impl Strategy<Value = Color> {
    "#[0-9a-f]{6}".prop_map(Color::new)
}

/// JSON a future version might write and this build must not drop.
fn unknown_value() -> impl Strategy<Value = serde_json::Value> {
    let leaf = prop_oneof![
        Just(serde_json::Value::Null),
        any::<bool>().prop_map(Into::into),
        any::<i32>().prop_map(Into::into),
        "[a-z ]{0,12}".prop_map(Into::into),
    ];
    leaf.prop_recursive(2, 6, 3, |inner| {
        prop_oneof![
            prop::collection::vec(inner.clone(), 0..3).prop_map(Into::into),
            prop::collection::btree_map("[a-z]{1,6}", inner, 0..3)
                .prop_map(|m| serde_json::Value::Object(m.into_iter().collect())),
        ]
    })
}

fn extras() -> impl Strategy<Value = Extras> {
    prop::collection::btree_map("future[A-Z][a-z]{1,6}", unknown_value(), 0..3)
        .prop_map(|m| m.into_iter().collect::<BTreeMap<_, _>>())
}

fn transform() -> impl Strategy<Value = Transform> {
    (
        coordinate(),
        coordinate(),
        extent(),
        extent(),
        -360.0f64..360.0,
        extras(),
    )
        .prop_map(|(x, y, width, height, rotation, extra)| Transform {
            x,
            y,
            width,
            height,
            rotation,
            extra,
        })
}

fn text_kind() -> impl Strategy<Value = LayerKind> {
    (
        "[a-zA-Z0-9 \n]{0,40}",
        "[A-Z][a-z]{2,10}",
        1.0f64..400.0,
        color(),
        prop_oneof![
            Just(TextAlign::Left),
            Just(TextAlign::Center),
            Just(TextAlign::Right)
        ],
        0.5f64..3.0,
        prop::collection::vec(unknown_value(), 0..2),
        extras(),
    )
        .prop_map(
            |(text, font_family, font_size, color, align, line_height, runs, extra)| {
                LayerKind::Text(TextLayer {
                    text,
                    font_family,
                    font_size,
                    color,
                    align,
                    line_height,
                    runs,
                    extra,
                })
            },
        )
}

fn image_kind(assets: Vec<AssetId>) -> impl Strategy<Value = LayerKind> {
    (
        prop::sample::select(assets),
        prop_oneof![
            Just(ImageFit::Fill),
            Just(ImageFit::Contain),
            Just(ImageFit::Cover)
        ],
        extras(),
    )
        .prop_map(|(asset, fit, extra)| LayerKind::Image(ImageLayer { asset, fit, extra }))
}

fn blend_mode() -> impl Strategy<Value = BlendMode> {
    prop_oneof![
        Just(BlendMode::Normal),
        Just(BlendMode::Multiply),
        Just(BlendMode::Screen)
    ]
}

/// Builds layers with unique ids: `id_counter` is threaded through the tree
/// after generation, because proptest has no notion of "unique across the
/// whole structure" and duplicate ids would be an invalid document.
fn layer(assets: Vec<AssetId>) -> impl Strategy<Value = Layer> {
    let leaf_kind = if assets.is_empty() {
        text_kind().boxed()
    } else {
        prop_oneof![text_kind(), image_kind(assets)].boxed()
    };

    let leaf = (
        leaf_kind,
        transform(),
        0.0f64..=1.0,
        any::<bool>(),
        any::<bool>(),
        blend_mode(),
        prop::collection::vec(unknown_value(), 0..2),
    )
        .prop_map(
            |(kind, transform, opacity, visible, locked, blend_mode, effects)| Layer {
                id: LayerId::new("layer_placeholder"),
                name: None,
                transform,
                opacity,
                visible,
                locked,
                blend_mode,
                effects,
                constraints: None,
                kind,
            },
        );

    leaf.prop_recursive(3, 12, 3, |inner| {
        (prop::collection::vec(inner, 0..3), transform(), extras()).prop_map(
            |(children, transform, extra)| {
                Layer::new(
                    LayerId::new("layer_placeholder"),
                    transform,
                    LayerKind::Group(GroupLayer { children, extra }),
                )
            },
        )
    })
}

fn assign_ids(layers: &mut [Layer], next: &mut u32) {
    for layer in layers {
        *next += 1;
        layer.id = LayerId::new(format!("layer_{next:026}"));
        if let LayerKind::Group(group) = &mut layer.kind {
            assign_ids(&mut group.children, next);
        }
    }
}

fn asset(index: usize) -> Asset {
    Asset {
        id: AssetId::new(format!("asset_{index:026}")),
        path: format!("images/{index}.png"),
        hash: format!("sha256:{}", "0".repeat(64)),
        media_type: "image/png".to_owned(),
        width: Some(64),
        height: Some(64),
        extra: Extras::new(),
    }
}

fn document() -> impl Strategy<Value = Document> {
    (0usize..3).prop_flat_map(|asset_count| {
        let assets: Vec<Asset> = (0..asset_count).map(asset).collect();
        let asset_ids: Vec<AssetId> = assets.iter().map(|a| a.id.clone()).collect();
        (
            prop::collection::vec(layer(asset_ids), 0..4),
            1.0f64..8000.0,
            1.0f64..8000.0,
            prop::option::of(color()),
            prop::option::of("[a-zA-Z ]{0,20}"),
            extras(),
            extras(),
        )
            .prop_map(
                move |(mut layers, width, height, background, name, canvas_extra, extra)| {
                    let mut next = 0;
                    assign_ids(&mut layers, &mut next);
                    Document {
                        schema_version: SCHEMA_VERSION,
                        id: DocumentId::new("doc_00000000000000000000000001"),
                        name,
                        canvas: Canvas {
                            width,
                            height,
                            background,
                            extra: canvas_extra,
                        },
                        assets: assets.clone(),
                        layers,
                        extra,
                    }
                },
            )
    })
}

proptest! {
    /// Generated documents are valid: the generator and the validator agree on
    /// what a document is. A failure here means one of them is wrong.
    #[test]
    fn generated_documents_are_valid(document in document()) {
        prop_assert!(validate(&document).is_ok(), "{:?}", validate(&document));
    }

    /// The exit test: serialize, deserialize, and get exactly the same value.
    #[test]
    fn json_round_trip_is_lossless(document in document()) {
        let json = serde_json::to_string(&document).unwrap();
        let parsed: Document = serde_json::from_str(&json).unwrap();
        prop_assert_eq!(&document, &parsed);

        // And serializing again produces identical bytes, so saving a file
        // twice cannot churn the diff.
        prop_assert_eq!(json, serde_json::to_string(&parsed).unwrap());
    }
}

/// A document written by v0.1.0 — before the SVG layer kind existed — must
/// still load unchanged. That is what lets `schemaVersion` stay at 1: the
/// new layer kind is additive, so no migration is owed.
#[test]
fn a_v0_1_0_document_still_loads() {
    let json = r##"{
      "schemaVersion": 1,
      "id": "doc_01JZZZZZZZZZZZZZZZZZZZZZZZ",
      "name": "Poster",
      "canvas": { "width": 400.0, "height": 300.0, "background": "#ffffff" },
      "assets": [{
        "id": "asset_01JZZZZZZZZZZZZZZZZZZZZZZZ",
        "path": "logo.png",
        "hash": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        "mediaType": "image/png"
      }],
      "layers": [
        {
          "id": "layer_01JZZZZZZZZZZZZZZZZZZZZZZ1",
          "transform": { "x": 20.0, "y": 20.0, "width": 360.0, "height": 120.0, "rotation": 0.0 },
          "opacity": 1.0,
          "visible": true,
          "locked": false,
          "blendMode": "normal",
          "effects": [],
          "type": "text",
          "text": "Hello",
          "fontFamily": "Noto Sans",
          "fontSize": 36.0,
          "color": "#000000",
          "align": "left",
          "lineHeight": 1.2,
          "runs": []
        },
        {
          "id": "layer_01JZZZZZZZZZZZZZZZZZZZZZZ2",
          "transform": { "x": 20.0, "y": 160.0, "width": 120.0, "height": 120.0, "rotation": 0.0 },
          "opacity": 1.0,
          "visible": true,
          "locked": false,
          "blendMode": "normal",
          "effects": [],
          "type": "image",
          "asset": "asset_01JZZZZZZZZZZZZZZZZZZZZZZZ",
          "fit": "cover"
        }
      ]
    }"##;

    let document: Document = serde_json::from_str(json).expect("a v0.1.0 document still parses");
    validate(&document).expect("and is still valid");
    assert_eq!(document.layers.len(), 2);
    assert_eq!(document.schema_version, SCHEMA_VERSION);
}
