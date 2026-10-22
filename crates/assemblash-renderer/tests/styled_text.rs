//! Product styled-layout controls use only licensed local font bytes.
#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
use assemblash_core::{
    document::{Extras, TextAlign, TextLayer, Transform, VerticalAlign},
    ids::SequentialIdSource,
    Color, Document, FontStyle, Layer, LayerId, LayerKind,
};
use assemblash_renderer::{
    doc_to_svg, layout_text_layer, svg_to_pixmap, AssetHrefs, FontSet, LoadedFonts, RenderError,
    TextFailureKind, TextLayoutError,
};
use serde_json::json;

fn fonts() -> LoadedFonts {
    LoadedFonts::from_bytes([
        include_bytes!("fonts/NotoSans-Subset.ttf").to_vec(),
        include_bytes!("fonts/NotoSans-Bold-Subset.ttf").to_vec(),
        include_bytes!("fonts/NotoSansArabic-Subset.ttf").to_vec(),
        include_bytes!("fonts/AssemblashOpticalProbe.ttf").to_vec(),
    ])
}
fn document(body: &str) -> Document {
    let mut document = Document::new(&mut SequentialIdSource::new(), 500.0, 240.0);
    document.layers.push(Layer::new(
        LayerId::new("layer_text"),
        Transform::new(24.0, 24.0, 450.0, 180.0),
        LayerKind::Text(TextLayer {
            text: body.into(),
            font_family: "Noto Sans".into(),
            font_size: 32.0,
            color: Some(Color::new("#000000")),
            align: TextAlign::Left,
            line_height: 1.2,
            font_weight: 400,
            font_style: FontStyle::Normal,
            letter_spacing: 0.0,
            stroke: None,
            vertical_align: VerticalAlign::Top,
            runs: vec![],
            extra: Extras::new(),
        }),
    ));
    document
}
fn text(document: &mut Document) -> &mut TextLayer {
    let LayerKind::Text(text) = &mut document.layers[0].kind else {
        unreachable!()
    };
    text
}
fn styled(document: &mut Document) {
    let text = text(document);
    text.runs = vec![json!({"text":text.text})];
}
fn refuses(document: &Document, kind: TextFailureKind) {
    assert!(
        matches!(layout_text_layer(&document.layers[0],450.0,fonts().font_set()),Err(RenderError::TextLayout {
        source:TextLayoutError::Unsupported {kind:actual,..},..}) if actual==kind)
    );
}

fn compare_pixels(expected: &str, actual: &str, fonts: &LoadedFonts, label: &str) {
    for scale in [1.0, 2.0] {
        let expected = svg_to_pixmap(expected, fonts, scale).unwrap();
        let actual = svg_to_pixmap(actual, fonts, scale).unwrap();
        let changed = expected
            .data()
            .chunks_exact(4)
            .zip(actual.data().chunks_exact(4))
            .filter(|(a, b)| a != b)
            .count();
        let max = expected
            .data()
            .iter()
            .zip(actual.data())
            .map(|(a, b)| a.abs_diff(*b))
            .max()
            .unwrap();
        let total = expected
            .data()
            .iter()
            .zip(actual.data())
            .map(|(a, b)| usize::from(a.abs_diff(*b)))
            .sum::<usize>();
        println!("{label} @{scale}: changed={changed}, max={max}, total={total}");
        assert!(
            changed <= 2 && max <= 16 && total <= 96,
            "{label} @{scale}: changed={changed}, max={max}, total={total}"
        );
    }
}

#[test]
fn whole_parent_gradient_resumes_across_solid_spans_and_lines_with_strokes() {
    let fonts = fonts();
    for body in ["AA BB CC", "AA BB CC\nDD EE FF"] {
        for stroked in [false, true] {
            let mut doc = document(body);
            text(&mut doc).color = Some(
                serde_json::from_value(json!({"kind":"linear","angle":20,"stops":[
                {"offset":0,"color":"#ff0000"},{"offset":1,"color":"#0000ff"}]}))
                .unwrap(),
            );
            if stroked {
                text(&mut doc).stroke =
                    Some(serde_json::from_value(json!({"color":"#008800","width":1.5})).unwrap());
            }
            let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new())
                .unwrap()
                .replace("AA BB CC", "AA <tspan fill=\"#222222\">BB</tspan> CC");
            text(&mut doc).runs = vec![
                json!({"text":"AA "}),
                json!({"text":"BB","color":"#222222"}),
                json!({"text":&body[5..]}),
            ];
            let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
            compare_pixels(
                &expected,
                &actual,
                &fonts,
                &format!("resume {body:?} stroke={stroked}"),
            );
        }
    }
}

#[test]
fn multiline_emission_matches_text_cursor_and_metric_gradient_arithmetic() {
    let fonts = fonts();
    let mut doc = document("gradient first line\nlonger second line\nend");
    doc.canvas.width = 720.0;
    doc.canvas.height = 540.0;
    doc.layers[0].transform.width = 650.0;
    doc.layers[0].transform.height = 450.0;
    doc.layers[0].opacity = 0.8;
    doc.layers[0].clip =
        Some(serde_json::from_value(json!({"shape":"rect","cornerRadius":6.0})).unwrap());
    text(&mut doc).line_height = 1.4;
    text(&mut doc).color = Some(
        serde_json::from_value(json!({"kind":"linear","angle":45.0,
        "stops":[{"offset":0.0,"color":"#b02050"},{"offset":1.0,"color":"#102030"}]}))
        .unwrap(),
    );
    text(&mut doc).stroke =
        Some(serde_json::from_value(json!({"color":"#213141","width":1.5})).unwrap());
    let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    styled(&mut doc);
    let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    compare_pixels(
        &expected,
        &actual,
        &fonts,
        "multiline gradient stroke clip opacity",
    );
}

#[test]
fn fractional_alignment_and_filtered_legacy_fallback_keep_upstream_geometry() {
    let fonts = fonts();
    for align in [TextAlign::Left, TextAlign::Center, TextAlign::Right] {
        let mut doc = document("office AVATAR\nsecond line");
        doc.layers[0].transform.x = 24.1234567;
        doc.layers[0].transform.y = 19.4321987;
        doc.layers[0].transform.width = 400.1234567;
        text(&mut doc).line_height = 1.4;
        text(&mut doc).align = align;
        let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        styled(&mut doc);
        let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        compare_pixels(&expected, &actual, &fonts, &format!("fractional {align:?}"));
    }
    let regular = include_bytes!("fonts/NotoSans-Subset.ttf").to_vec();
    let arabic = include_bytes!("fonts/NotoSansArabic-Subset.ttf").to_vec();
    // Keep an unselected duplicate in the original database. The legacy sibling
    // also needs fallback from its named Latin face to an Arabic face.
    let loaded = LoadedFonts::from_bytes([regular.clone(), arabic, regular]);
    let mut doc = document("Styled text");
    styled(&mut doc);
    let mut legacy = document("مرحبا بالعالم").layers.remove(0);
    legacy.id = LayerId::new("layer_legacy");
    legacy.transform.y = 75.0;
    let zero_image: Layer = serde_json::from_value(json!({"id":"layer_zero_image","type":"svg","asset":"asset_zero_image","fit":"contain","transform":{"x":0.0,"y":0.0,"width":0.0,"height":20.0}})).unwrap();
    doc.assets.push(serde_json::from_value(json!({"id":"asset_zero_image","path":"not-on-disk.svg","hash":format!("sha256:{}","0".repeat(64)),"mediaType":"image/svg+xml"})).unwrap());
    let hrefs = AssetHrefs::from([(assemblash_core::AssetId::new("asset_zero_image"), "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60'/%3E%3C/svg%3E".into())]);
    let children = vec![doc.layers.remove(0), legacy, zero_image];
    let mut group = Layer::new(
        LayerId::new("layer_filtered"),
        Transform::new(0.0, 0.0, 500.0, 240.0),
        LayerKind::Group(assemblash_core::document::GroupLayer {
            children,
            extra: Extras::new(),
        }),
    );
    group
        .effects
        .push(serde_json::from_value(json!({"type":"blur","radius":1.0})).unwrap());
    doc.layers.push(group);
    let mut expected_doc = doc.clone();
    let LayerKind::Group(group) = &mut expected_doc.layers[0].kind else {
        unreachable!()
    };
    let LayerKind::Text(text) = &mut group.children[0].kind else {
        unreachable!()
    };
    text.runs.clear();
    compare_pixels(
        &doc_to_svg(&expected_doc, loaded.font_set(), &hrefs).unwrap(),
        &doc_to_svg(&doc, loaded.font_set(), &hrefs).unwrap(),
        &loaded,
        "legacy fallback duplicate and zero-area sibling",
    );
}

#[test]
fn direct_and_ancestor_filters_keep_text_metrics_with_mixed_memory_siblings() {
    use resvg::usvg;
    fn rectangles(root: &usvg::Group, result: &mut Vec<[f32; 4]>) {
        for filter in root.filters() {
            let r = filter.rect();
            result.push([r.x(), r.y(), r.width(), r.height()]);
        }
        for node in root.children() {
            if let usvg::Node::Group(child) = node {
                rectangles(child, result);
            }
        }
    }
    fn clear_runs(layer: &mut Layer) {
        match &mut layer.kind {
            LayerKind::Text(text) => text.runs.clear(),
            LayerKind::Group(group) => group.children.iter_mut().for_each(clear_runs),
            _ => {}
        }
    }
    let fonts = fonts();
    let mut database = usvg::fontdb::Database::new();
    database.load_font_data(include_bytes!("fonts/NotoSans-Subset.ttf").to_vec());
    let options = usvg::Options {
        fontdb: std::sync::Arc::new(database),
        ..Default::default()
    };
    let png = include_bytes!("../examples/fixtures/gradient-background.png");
    let png_uri = format!(
        "data:image/png,{}",
        png.iter()
            .map(|byte| format!("%{byte:02X}"))
            .collect::<String>()
    );
    let svg_uri = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect x='4' y='5' width='70' height='50' fill='%23b02050'/%3E%3C/svg%3E";
    let hrefs = AssetHrefs::from([
        (assemblash_core::AssetId::new("asset_png"), png_uri),
        (assemblash_core::AssetId::new("asset_svg"), svg_uri.into()),
    ]);
    for parent_filter in [false, true] {
        for shadow in [false, true] {
            let effect = if shadow {
                json!({"type":"dropShadow","dx":2.0,"dy":3.0,"blur":1.5,"color":"#21314180"})
            } else {
                json!({"type":"blur","radius":1.0})
            };
            let mut base = document("Nested office\nsecond line");
            base.canvas.width = 720.0;
            base.canvas.height = 540.0;
            text(&mut base).line_height = 1.4;
            styled(&mut base);
            let mut raw = serde_json::to_value(base).unwrap();
            let layer = &mut raw["layers"][0];
            layer["transform"] = json!({"x":15.0,"y":19.0,"width":400.0,"height":180.0,"rotation":11.0,"flipHorizontal":true});
            layer["color"] = json!({"kind":"linear","angle":20.0,"stops":[{"offset":0.0,"color":"#b02050"},{"offset":1.0,"color":"#102030"}]});
            layer["stroke"] = json!({"color":"#234567","width":1.5});
            layer["opacity"] = json!(0.85);
            layer["clip"] = json!({"shape":"rect","cornerRadius":8.0});
            if !parent_filter {
                layer["effects"] = json!([effect]);
            }
            let mut children = vec![layer.clone()];
            if parent_filter {
                children.extend([
                    json!({"id":"layer_png","type":"image","asset":"asset_png","fit":"contain","transform":{"x":310.0,"y":25.0,"width":90.0,"height":70.0}}),
                    json!({"id":"layer_svg","type":"svg","asset":"asset_svg","fit":"contain","transform":{"x":20.0,"y":155.0,"width":100.0,"height":80.0}}),
                    json!({"id":"layer_shape","type":"shape","shape":{"kind":"rect","cornerRadius":4.0},"fill":"#2468ab","transform":{"x":250.0,"y":150.0,"width":100.0,"height":55.0}}),
                ]);
                raw["assets"] = json!([
                    {"id":"asset_png","path":"not-on-disk.png","hash":assemblash_core::storage::hash_bytes(png),"mediaType":"image/png","width":64,"height":64},
                    {"id":"asset_svg","path":"not-on-disk.svg","hash":format!("sha256:{}","0".repeat(64)),"mediaType":"image/svg+xml","width":80,"height":60},
                ]);
            }
            let inner = json!({"id":"layer_inner","type":"group","transform":{"x":20.0,"y":27.0,"width":450.0,"height":250.0,"rotation":-7.0,"flipVertical":true},"children":children});
            raw["layers"] = json!([{"id":"layer_outer","type":"group","opacity":0.9,"effects":if parent_filter { json!([effect]) } else { json!([]) },"transform":{"x":30.0,"y":40.0,"width":540.0,"height":390.0,"rotation":4.0},"children":[inner]}]);
            let actual_doc: Document = serde_json::from_value(raw).unwrap();
            let mut expected_doc = actual_doc.clone();
            expected_doc.layers.iter_mut().for_each(clear_runs);
            let expected = doc_to_svg(&expected_doc, fonts.font_set(), &hrefs).unwrap();
            let actual = doc_to_svg(&actual_doc, fonts.font_set(), &hrefs).unwrap();
            assert!(!actual.contains("bounds-") && !actual.contains("<text "));
            compare_pixels(
                &expected,
                &actual,
                &fonts,
                &format!("nested filter parent={parent_filter} shadow={shadow}"),
            );
            let (mut a, mut b) = (Vec::new(), Vec::new());
            rectangles(
                usvg::Tree::from_str(&actual, &options).unwrap().root(),
                &mut a,
            );
            rectangles(
                usvg::Tree::from_str(&expected, &options).unwrap().root(),
                &mut b,
            );
            println!("filter regions parent={parent_filter} shadow={shadow}: {a:?} / {b:?}");
            assert_eq!(a, b);
            if parent_filter && !shadow {
                let mut path_hrefs = hrefs.clone();
                path_hrefs.insert(
                    assemblash_core::AssetId::new("asset_png"),
                    "must-not-read.png".into(),
                );
                assert!(matches!(
                    doc_to_svg(&actual_doc, fonts.font_set(), &path_hrefs),
                    Err(RenderError::TextFilterBounds { .. })
                ));
            }
        }
    }
}

#[test]
fn wrappers_apply_once_to_local_outlines() {
    let fonts = fonts();
    let mut doc = document("Local text");
    let transform = &mut doc.layers[0].transform;
    transform.rotation = 12.0;
    transform.flip_horizontal = true;
    transform.flip_vertical = true;
    doc.layers[0].opacity = 0.65;
    doc.layers[0].clip = Some(serde_json::from_value(json!({"shape":"rect"})).unwrap());
    let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    styled(&mut doc);
    let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    compare_pixels(&expected, &actual, &fonts, "transformed clip");
    let plain_child = {
        let mut plain = doc.layers.remove(0);
        let LayerKind::Text(text) = &mut plain.kind else {
            unreachable!()
        };
        text.runs.clear();
        plain
    };
    let mut group = Layer::new(
        LayerId::new("layer_parent"),
        Transform::new(13.5, 17.25, 480.0, 210.0),
        LayerKind::Group(assemblash_core::document::GroupLayer {
            children: vec![plain_child],
            extra: Extras::new(),
        }),
    );
    group.transform.rotation = -7.0;
    group.opacity = 0.8;
    group
        .effects
        .push(serde_json::from_value(json!({"type":"blur","radius":0.5})).unwrap());
    doc.layers.push(group);
    let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    let LayerKind::Group(group) = &mut doc.layers[0].kind else {
        unreachable!()
    };
    let LayerKind::Text(text) = &mut group.children[0].kind else {
        unreachable!()
    };
    text.runs = vec![json!({"text":text.text})];
    let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    compare_pixels(&expected, &actual, &fonts, "nested transformed clip blur");
}

#[test]
fn uniform_runs_match_plain_product_pixels_and_keep_arabic_components() {
    let fonts = fonts();
    for body in ["office Cafe\u{301}", "مرحبا بالعالم"] {
        let mut doc = document(body);
        if !body.is_ascii() && body.starts_with('م') {
            text(&mut doc).font_family = "Noto Sans Arabic".into();
        }
        let plain = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        styled(&mut doc);
        let outlined = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        for scale in [1.0, 2.0] {
            let expected = svg_to_pixmap(&plain, &fonts, scale).unwrap();
            let actual = svg_to_pixmap(&outlined, &fonts, scale).unwrap();
            let changed = expected
                .data()
                .chunks_exact(4)
                .zip(actual.data().chunks_exact(4))
                .filter(|(a, b)| a != b)
                .count();
            let max = expected
                .data()
                .iter()
                .zip(actual.data())
                .map(|(a, b)| a.abs_diff(*b))
                .max()
                .unwrap();
            let total = expected
                .data()
                .iter()
                .zip(actual.data())
                .map(|(a, b)| usize::from(a.abs_diff(*b)))
                .sum::<usize>();
            println!("uniform {body:?} @{scale}: changed={changed}, max={max}, total={total}");
            assert!(
                changed <= 2 && max <= 16 && total <= 96,
                "{body} @{scale}: changed={changed}, max={max}, total={total}"
            );
        }
    }
    let mut doc = document("ب");
    text(&mut doc).font_family = "Noto Sans Arabic".into();
    styled(&mut doc);
    let layout = layout_text_layer(&doc.layers[0], 450.0, fonts.font_set()).unwrap();
    assert!(layout.glyphs().len() >= 2);
    assert!(
        layout
            .glyphs()
            .iter()
            .filter(|glyph| glyph.outline().is_some())
            .count()
            >= 2
    );
}

#[test]
fn incompatible_clusters_refuse_original_source_indices_but_canonical_paint_and_extras_match() {
    let mut doc = document("office");
    text(&mut doc).runs = vec![
        json!({"text":"of"}),
        json!({"text":"fice","fontWeight":700}),
    ];
    refuses(&doc, TextFailureKind::IncompatibleCluster);
    let error = layout_text_layer(&doc.layers[0], 450.0, fonts().font_set()).unwrap_err();
    assert!(matches!(
        error,
        RenderError::TextLayout {
            source: TextLayoutError::Unsupported {
                run_index: 1,
                character_index: 2,
                byte_index: 2,
                ..
            },
            ..
        }
    ));
    let mut doc = document(" \u{301} \u{301}");
    text(&mut doc).runs = vec![
        json!({"text":" ","color":"#000000"}),
        json!({"text":"\u{301}","color":"#ff0000"}),
        json!({"text":" ","color":"#ff0000"}),
        json!({"text":"\u{301}","color":"#000000"}),
    ];
    refuses(&doc, TextFailureKind::IncompatibleCluster);
    let mut doc = document("office");
    text(&mut doc).runs = vec![
        json!({"text":"of","color":"#ffffff","future":17}),
        json!({"text":"fice","color":"#ffffffff","future":null}),
    ];
    assert!(layout_text_layer(&doc.layers[0], 450.0, fonts().font_set()).is_ok());
}

#[test]
fn exact_fonts_data_and_api_inputs_have_typed_errors() {
    let mut doc = document("test");
    styled(&mut doc);
    assert!(matches!(
        layout_text_layer(&doc.layers[0], 450.0, &FontSet::new(["Noto Sans"])),
        Err(RenderError::TextLayout {
            source: TextLayoutError::Unsupported {
                kind: TextFailureKind::FontDataUnavailable,
                ..
            },
            ..
        })
    ));
    text(&mut doc).runs = vec![json!({"text":"test","fontFamily":"missing"})];
    assert!(
        matches!(layout_text_layer(&doc.layers[0],450.0,fonts().font_set()),Err(RenderError::MissingFont {family,..}) if family=="missing")
    );
    for width in [0.0, -1.0, f64::NAN, f64::INFINITY, f64::NEG_INFINITY] {
        assert!(matches!(
            layout_text_layer(&doc.layers[0], width, fonts().font_set()),
            Err(RenderError::InvalidTextWidth { .. })
        ));
    }
}

#[test]
fn variation_coordinates_shape_and_outline_at_effective_optical_size() {
    let fonts = fonts();
    for (size, advance) in [(8.0, 639), (32.0, 711), (72.0, 831)] {
        let mut doc = document("A");
        let text = text(&mut doc);
        text.font_family = "Assemblash Optical Probe".into();
        text.font_size = size;
        let expected = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        styled(&mut doc);
        let layout = layout_text_layer(&doc.layers[0], 450.0, fonts.font_set()).unwrap();
        assert_eq!(layout.glyphs()[0].source_advance, advance);
        assert_eq!(layout.glyphs()[0].variation_coordinates().len(), 1);
        assert!(layout.glyphs()[0].outline().is_some());
        let actual = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
        compare_pixels(&expected, &actual, &fonts, &format!("optical {size}"));
    }
}

#[test]
fn spacing_and_aggregate_overflow_refuse_without_losing_marks() {
    let mut doc = document("xx");
    text(&mut doc).runs = vec![json!({"text":"xx","letterSpacing":-64})];
    refuses(&doc, TextFailureKind::InvalidSpacing);
    text(&mut doc).runs = vec![json!({"text":"xx","letterSpacing":-2})];
    assert!(layout_text_layer(&doc.layers[0], 450.0, fonts().font_set()).is_ok());
    text(&mut doc).runs = vec![json!({"text":"xx","fontSize":3.0e38,"letterSpacing":3.0e38})];
    refuses(&doc, TextFailureKind::InvalidGeometry);
    let mut doc = document("\u{301}");
    styled(&mut doc);
    assert!(layout_text_layer(&doc.layers[0], 450.0, fonts().font_set()).is_ok());
}

#[test]
fn mixed_size_overlapping_lines_use_all_bounds_and_signed_alignment() {
    let fonts = fonts();
    for sizes in [vec![52, 18, 18], vec![18, 52]] {
        let body = vec!["A"; sizes.len()].join("\n");
        for (align, anchor) in [
            (VerticalAlign::Top, 0.0),
            (VerticalAlign::Middle, 0.5),
            (VerticalAlign::Bottom, 1.0),
        ] {
            let mut doc = document(&body);
            doc.layers[0].transform.height = 10.0;
            let text = text(&mut doc);
            text.line_height = 0.1;
            text.vertical_align = align;
            text.runs=sizes.iter().enumerate().map(|(index,size)|json!({"text":if index+1<sizes.len(){"A\n"}else{"A"},"fontSize":size})).collect();
            let layout = layout_text_layer(&doc.layers[0], 450.0, fonts.font_set()).unwrap();
            let top = layout
                .lines
                .iter()
                .map(|line| line.baseline - line.ascent)
                .fold(f64::INFINITY, f64::min);
            let bottom = layout
                .lines
                .iter()
                .map(|line| line.baseline + line.descent)
                .fold(f64::NEG_INFINITY, f64::max);
            assert!((bottom - top - layout.height).abs() < 0.00001);
            assert!((top - anchor * (10.0 - layout.height)).abs() < 0.00001);
            assert!(layout.overflow);
        }
    }
    let mut doc = document("A");
    doc.layers[0].transform.height = 0.0;
    styled(&mut doc);
    assert!(
        layout_text_layer(&doc.layers[0], 450.0, fonts.font_set())
            .unwrap()
            .overflow
    );
    assert!(doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).is_ok());
}

#[test]
fn measurement_warnings_are_isolated_and_keep_legacy_name_only_layout() {
    let fonts = fonts();
    let mut doc = document("A");
    doc.layers[0].transform.height = 1.0;
    let healthy = doc.layers[0].id.clone();
    let mut bad = doc.layers[0].clone();
    bad.id = LayerId::new("layer_old_raw");
    let LayerKind::Text(old) = &mut bad.kind else {
        unreachable!()
    };
    old.runs = vec![json!(17)];
    doc.layers.push(bad);
    let warnings = assemblash_renderer::warnings::text_write_warnings(
        &doc,
        std::slice::from_ref(&healthy),
        std::path::Path::new(""),
        |isolated| assemblash_renderer::text_font_requirements(isolated).map(|_| fonts.clone()),
    );
    assert!(warnings
        .iter()
        .any(|warning| warning.code == "textOverflowsBox"));
    assert!(!warnings
        .iter()
        .any(|warning| warning.code == "cannotMeasureText"));
    let warnings = assemblash_renderer::warnings::text_write_warnings(
        &doc,
        &[LayerId::new("layer_old_raw")],
        std::path::Path::new(""),
        |isolated| assemblash_renderer::text_font_requirements(isolated).map(|_| fonts.clone()),
    );
    assert_eq!(warnings[0].code, "cannotMeasureText");
    assert!(warnings[0].message.contains("run 0"));
    doc.layers[0].transform.height = 200.0;
    let layout = layout_text_layer(&doc.layers[0], 450.0, &FontSet::new(["Noto Sans"])).unwrap();
    assert_eq!(layout.lines[0].width, None);
    assert_eq!(layout.lines[0].x, None);
    let narrow = layout_text_layer(&doc.layers[0], 1.0, fonts.font_set()).unwrap();
    assert!(narrow.height < 200.0 && narrow.lines[0].width.unwrap() > 1.0 && narrow.overflow);
    assert!(
        !layout_text_layer(&doc.layers[0], 1.0, &FontSet::new(["Noto Sans"]))
            .unwrap()
            .overflow
    );
    styled(&mut doc);
    assert!(
        layout_text_layer(&doc.layers[0], 1.0, fonts.font_set())
            .unwrap()
            .overflow
    );
}

#[test]
fn emitted_contours_correspond_to_each_local_glyph_without_repositioning_loss() {
    use resvg::{
        tiny_skia::{PathBuilder, PathSegment, Transform},
        usvg,
    };
    fn paths(group: &usvg::Group, result: &mut Vec<resvg::tiny_skia::Path>) {
        for node in group.children() {
            match node {
                usvg::Node::Group(group) => paths(group, result),
                usvg::Node::Path(path) => result.push(path.data().clone()),
                _ => {}
            }
        }
    }
    fn coordinates(path: &resvg::tiny_skia::Path) -> Vec<f32> {
        path.segments()
            .flat_map(|segment| match segment {
                PathSegment::MoveTo(p) => vec![0.0, p.x, p.y],
                PathSegment::LineTo(p) => vec![1.0, p.x, p.y],
                PathSegment::QuadTo(a, b) => vec![2.0, a.x, a.y, b.x, b.y],
                PathSegment::CubicTo(a, b, c) => vec![3.0, a.x, a.y, b.x, b.y, c.x, c.y],
                PathSegment::Close => vec![4.0],
            })
            .collect()
    }
    fn same(left: &resvg::tiny_skia::Path, right: &resvg::tiny_skia::Path) -> bool {
        let a = coordinates(left);
        let b = coordinates(right);
        a.len() == b.len() && a.iter().zip(b).all(|(a, b)| (*a - b).abs() < 0.0001)
    }
    let mut doc = document("ب\nب");
    text(&mut doc).font_family = "Noto Sans Arabic".into();
    styled(&mut doc);
    let fonts = fonts();
    let layout = layout_text_layer(&doc.layers[0], 450.0, fonts.font_set()).unwrap();
    let svg = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    let tree = usvg::Tree::from_str(&svg, &usvg::Options::default()).unwrap();
    let mut actual = Vec::new();
    paths(tree.root(), &mut actual);
    assert_eq!(actual.len(), 1);
    let mut expected = PathBuilder::new();
    let mut contours = 0;
    for glyph in layout.glyphs() {
        if let Some(path) = glyph.outline() {
            contours += path
                .segments()
                .filter(|segment| matches!(segment, PathSegment::MoveTo(_)))
                .count();
            expected.push_path(
                &path
                    .clone()
                    .transform(Transform::from_translate(24.0, 24.0))
                    .unwrap(),
            );
        }
    }
    assert_eq!(
        actual[0]
            .segments()
            .filter(|segment| matches!(segment, PathSegment::MoveTo(_)))
            .count(),
        contours
    );
    let expected_path = expected.finish().unwrap();
    assert!(same(&expected_path, &actual[0]));
    let shifted = actual[0]
        .clone()
        .transform(Transform::from_translate(0.25, 0.0))
        .unwrap();
    assert!(!same(&expected_path, &shifted));
    let expected = expected_path.compute_tight_bounds().unwrap();
    let actual = actual[0].compute_tight_bounds().unwrap();
    for (a, b) in [
        (expected.left(), actual.left()),
        (expected.right(), actual.right()),
        (expected.top(), actual.top()),
        (expected.bottom(), actual.bottom()),
    ] {
        assert!((a - b).abs() < 0.0001);
    }
}

#[test]
fn exact_face_selection_prefers_normal_width_then_actual_italic_and_preserves_first_ties() {
    fn table(bytes: &[u8], name: &[u8]) -> usize {
        let count = u16::from_be_bytes(bytes[4..6].try_into().unwrap());
        (0..usize::from(count))
            .find_map(|index| {
                let at = 12 + index * 16;
                (&bytes[at..at + 4] == name).then(|| {
                    u32::from_be_bytes(bytes[at + 8..at + 12].try_into().unwrap()) as usize
                })
            })
            .unwrap()
    }
    let italic = include_bytes!("../examples/fixtures/NotoSans-Italic-Subset.ttf").to_vec();
    let mut oblique = italic.clone();
    let os2 = table(&oblique, b"OS/2");
    let selection = u16::from_be_bytes(oblique[os2 + 62..os2 + 64].try_into().unwrap());
    oblique[os2 + 62..os2 + 64].copy_from_slice(&((selection | 512) & !1).to_be_bytes());
    let mut condensed = italic.clone();
    let os2 = table(&condensed, b"OS/2");
    condensed[os2 + 6..os2 + 8].copy_from_slice(&3_u16.to_be_bytes());
    for bytes in [
        vec![oblique.clone(), italic.clone()],
        vec![condensed.clone(), italic.clone()],
    ] {
        let loaded = LoadedFonts::from_bytes(bytes);
        let selected = loaded
            .font_set()
            .face_data("Noto Sans", 400, FontStyle::Italic)
            .unwrap();
        assert_eq!(selected.bytes(), italic);
        let measured = loaded
            .font_set()
            .select_face("Noto Sans", 400, FontStyle::Italic)
            .unwrap();
        assert_eq!(
            measured.metrics("Noto Sans"),
            assemblash_renderer::fonts::read_metrics(&italic, 0).as_ref()
        );
    }
    let loaded = LoadedFonts::from_bytes([oblique.clone(), condensed]);
    // Normal-width Oblique precedes narrower Italic in the pinned preference order.
    assert_eq!(
        loaded
            .font_set()
            .face_data("Noto Sans", 400, FontStyle::Italic)
            .unwrap()
            .bytes(),
        oblique
    );
    let regular = include_bytes!("fonts/NotoSans-Subset.ttf").to_vec();
    let mut different = regular.clone();
    let hhea = table(&different, b"hhea");
    different[hhea + 4..hhea + 6].copy_from_slice(&1200_i16.to_be_bytes());
    for (first, second) in [(regular.clone(), different.clone()), (different, regular)] {
        let loaded = LoadedFonts::from_bytes([first.clone(), second]);
        let selected = loaded
            .font_set()
            .face_data("Noto Sans", 400, FontStyle::Normal)
            .unwrap();
        assert_eq!(selected.bytes(), first);
        let measured = loaded
            .font_set()
            .select_face("Noto Sans", 400, FontStyle::Normal)
            .unwrap();
        assert_eq!(
            measured.metrics("Noto Sans"),
            assemblash_renderer::fonts::read_metrics(&first, 0).as_ref()
        );
    }
}
