//! Probe shaping boundaries before public styled-run implementation.
//! Use pinned repository fonts. Keep the document model and existing layout path unchanged.
//! Run: `cargo run -p assemblash-renderer --example styled_runs_spike -- OUTPUT_DIR`

#![allow(clippy::expect_used, clippy::panic)]

use std::{collections::BTreeMap, error::Error, fs, path::PathBuf, sync::Arc};

use assemblash_core::{
    document::{Extras, TextAlign, TextLayer, Transform},
    ids::{LayerId, SequentialIdSource},
    storage, Color, Document, FontStyle, Layer, LayerKind, Session, VerticalAlign,
};
use assemblash_renderer::{
    fonts::read_metrics, layout_text, pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata,
};
use resvg::usvg;
use serde_json::{json, Value};
use skrifa::MetadataProvider;

#[path = "styled_runs_spike/layout.rs"]
mod styled_layout;

fn main() -> Result<(), Box<dyn Error>> {
    let out = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .ok_or("supply a fresh output directory")?;
    if out.exists() {
        return Err("output directory exists".into());
    }
    fs::create_dir_all(&out)?;
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let font_dir = manifest.join("tests").join("fonts");
    let names = [
        "NotoSans-Subset.ttf",
        "NotoSans-Bold-Subset.ttf",
        "NotoSansArabic-Subset.ttf",
        "NotoSansJP-Subset.ttf",
        "NotoSans-Italic-Subset.ttf",
    ];
    let bytes = names
        .iter()
        .map(|name| {
            let path = if *name == "NotoSans-Italic-Subset.ttf" {
                manifest.join("examples").join("fixtures").join(name)
            } else {
                font_dir.join(name)
            };
            fs::read(path)
        })
        .collect::<Result<Vec<_>, _>>()?;
    let fonts = LoadedFonts::from_bytes(bytes.clone());
    let mut database = usvg::fontdb::Database::new();
    for data in &bytes {
        database.load_font_data(data.clone());
    }
    let database = Arc::new(database);
    let options = usvg::Options {
        fontdb: Arc::clone(&database),
        ..Default::default()
    };
    let mut font_report = Vec::new();
    for (name, data) in names.iter().zip(&bytes) {
        let face = skrifa::FontRef::from_index(data, 0)?;
        let metrics = read_metrics(data, 0).ok_or("font metrics absent")?;
        let glyphs = face.glyph_metrics(
            skrifa::instance::Size::unscaled(),
            skrifa::instance::LocationRef::default(),
        );
        let mut advances = BTreeMap::new();
        for character in ['A', 'V', 'f', 'i', 'م'] {
            if let Some(glyph) = face.charmap().map(character) {
                advances.insert(character.to_string(), glyphs.advance_width(glyph));
            }
        }
        font_report.push(json!({"file":name, "sha256":storage::hash_bytes(data), "unitsPerEm":metrics.units_per_em,
            "ascender":metrics.ascender,"descender":metrics.descender,"advances":advances}));
    }
    let missing_italic = !fonts
        .font_set()
        .contains_face("Noto Sans", 700, FontStyle::Italic);
    assert!(missing_italic);
    assert!(fonts
        .font_set()
        .contains_face("Noto Sans", 400, FontStyle::Italic));
    assert!(fonts
        .font_set()
        .contains_face("Noto Sans", 700, FontStyle::Normal));
    let cases = [
        ("latin_unsplit", "Noto Sans", "office AVATAR", ""),
        ("latin_split", "Noto Sans", "<tspan>of</tspan><tspan>fice AVATAR</tspan>", ""),
        ("arabic_unsplit", "Noto Sans Arabic", "مرحبا بالعالم", ""),
        ("arabic_split", "Noto Sans Arabic", "<tspan>مر</tspan><tspan>حبا بالعالم</tspan>", ""),
        ("marks_unsplit", "Noto Sans", "Cafe\u{301}", ""),
        ("marks_split", "Noto Sans", "<tspan>Cafe</tspan><tspan>\u{301}</tspan>", ""),
        ("bidi_unsplit", "Noto Sans Arabic", "abc مرحبا 123", ""),
        ("bidi_split", "Noto Sans Arabic", "<tspan>abc مر</tspan><tspan>حبا 123</tspan>", ""),
        ("colour_boundary", "Noto Sans Arabic", "<tspan fill=\"#b02050\">مر</tspan><tspan fill=\"#102030\">حبا بالعالم</tspan>", ""),
        ("mixed_weight", "Noto Sans", "<tspan>high</tspan><tspan font-weight=\"700\">light</tspan>", ""),
        ("mixed_italic", "Noto Sans", "<tspan>regular </tspan><tspan font-style=\"italic\">italic office</tspan>", ""),
        ("mixed_size_family", "Noto Sans", "<tspan>Latin </tspan><tspan font-family=\"Noto Sans Arabic\" font-size=\"52\">مرحبا</tspan><tspan font-size=\"20\"> small</tspan>", ""),
        ("letter_spacing", "Noto Sans", "<tspan letter-spacing=\"2\">spaced</tspan><tspan> plain</tspan>", ""),
        ("gradient_runs", "Noto Sans", "<tspan fill=\"url(#run-gradient)\">gradient</tspan><tspan fill=\"#102030\"> solid</tspan>", ""),
        ("explicit_no_fill", "Noto Sans", "<tspan fill=\"none\">hidden</tspan><tspan> visible</tspan>", ""),
        ("empty_run", "Noto Sans", "<tspan></tspan><tspan>empty prefix</tspan>", ""),
        ("empty_text", "Noto Sans", "", ""),
        ("manual_paragraphs", "Noto Sans", "<tspan x=\"24\" y=\"72\">first paragraph</tspan><tspan x=\"24\" y=\"160\">second paragraph</tspan>", ""),
    ];
    let mut renders = BTreeMap::<String, Value>::new();
    for (name, family, body, extra) in cases {
        let svg = format!("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"720\" height=\"220\"><defs><linearGradient id=\"run-gradient\"><stop offset=\"0\" stop-color=\"#b02050\"/><stop offset=\"1\" stop-color=\"#102030\"/></linearGradient></defs><rect width=\"720\" height=\"220\" fill=\"#ffffff\"/><text id=\"probe\" x=\"24\" y=\"90\" font-family=\"{family}\" font-size=\"40\" fill=\"#102030\" {extra}>{body}</text></svg>");
        let tree = usvg::Tree::from_str(&svg, &options)?;
        let mut glyphs = Vec::new();
        collect(tree.root(), tree.fontdb(), &mut glyphs);
        let mut scales = BTreeMap::new();
        for scale in [1.0, 2.0] {
            let pixmap = svg_to_pixmap(&svg, &fonts, scale)?;
            let png = pixmap_to_png(
                &pixmap,
                &PngMetadata {
                    document_id: "styled-runs-spike".into(),
                    schema_version: 1,
                    renderer_version: "spike-v1".into(),
                    created: None,
                },
            )?;
            fs::write(out.join(format!("{name}-{scale}.png")), &png)?;
            let ink = pixmap
                .pixels()
                .iter()
                .filter(|p| {
                    let p = p.demultiply();
                    [p.red(), p.green(), p.blue()] != [255, 255, 255]
                })
                .count();
            if name == "empty_text" {
                assert_eq!(ink, 0);
            } else {
                assert!(ink > 0, "{name} has no ink");
            }
            scales.insert(scale.to_string(), json!({"rgbaSha256":storage::hash_bytes(pixmap.data()),"pngSha256":storage::hash_bytes(&png),"inkPixels":ink}));
        }
        fs::write(out.join(format!("{name}.svg")), &svg)?;
        renders.insert(name.into(), json!({"svgSha256":storage::hash_bytes(svg.as_bytes()),"glyphs":glyphs,"scales":scales}));
    }
    let mut comparisons = BTreeMap::new();
    for prefix in ["latin", "arabic", "marks", "bidi"] {
        let a = &renders[&format!("{prefix}_unsplit")];
        let b = &renders[&format!("{prefix}_split")];
        let positioned_equal = canonical_glyphs(&a["glyphs"]) == canonical_glyphs(&b["glyphs"]);
        assert!(
            positioned_equal,
            "{prefix}: same-style split changes positioned glyphs"
        );
        assert_eq!(
            a["scales"], b["scales"],
            "{prefix}: same-style split changes pixels"
        );
        comparisons.insert(prefix, json!({"glyphOrderEqual":a["glyphs"] == b["glyphs"], "positionedGlyphsEqual":positioned_equal,
            "pixelsEqual":a["scales"] == b["scales"]}));
    }
    assert!(renders["mixed_weight"]["glyphs"]
        .as_array()
        .ok_or("glyph list absent")?
        .iter()
        .any(|glyph| glyph["weight"] == 700));
    assert!(renders["mixed_italic"]["glyphs"]
        .as_array()
        .ok_or("glyph list absent")?
        .iter()
        .any(|glyph| glyph["style"] == "Italic"));
    let colour_geometry_equal = canonical_glyphs(&renders["arabic_unsplit"]["glyphs"])
        == canonical_glyphs(&renders["colour_boundary"]["glyphs"]);
    assert!(
        colour_geometry_equal,
        "Arabic paint boundary changes positioned glyphs"
    );
    let regular = LoadedFonts::from_bytes([bytes[0].clone()]);
    let bold = LoadedFonts::from_bytes([bytes[1].clone()]);
    let text = "AVATAR highlight office";
    let a = layout_text(text, 180.0, 40.0, 1.4, 0.0, "Noto Sans", regular.font_set());
    let b = layout_text(text, 180.0, 40.0, 1.4, 0.0, "Noto Sans", bold.font_set());
    let combined = layout_text(text, 180.0, 40.0, 1.4, 0.0, "Noto Sans", fonts.font_set());
    assert_eq!(a, combined);
    let storage_probe = storage_probe(&out)?;
    let styled_layout = styled_layout::run_spike(&out, &fonts, &options)?;
    let report = json!({"probeVersion":2,"fonts":font_report,"missingItalicDetected":missing_italic,
        "italicFaceAvailable":true,
        "renders":renders,"sameStyleComparisons":comparisons,"arabicColourBoundaryGeometryEqual":colour_geometry_equal,
        "legacyFamilyMeasurement":{"regularLines":a.lines,"boldLines":b.lines,
        "combinedUsesFirstFace":true},"storage":storage_probe,"styledLayout":styled_layout,
        "unproved":["public model integration", "new typed run storage", "history replay with new operation fields", "six native targets"]});
    fs::write(
        out.join("report.json"),
        serde_json::to_string_pretty(&report)? + "\n",
    )?;
    println!(
        "{}",
        serde_json::to_string_pretty(&report["sameStyleComparisons"])?
    );
    println!("REPORT={}", out.join("report.json").display());
    Ok(())
}

fn canonical_glyphs(value: &Value) -> Vec<String> {
    let mut glyphs = value
        .as_array()
        .expect("glyph array")
        .iter()
        .map(Value::to_string)
        .collect::<Vec<_>>();
    glyphs.sort();
    glyphs
}

fn collect(group: &usvg::Group, database: &usvg::fontdb::Database, output: &mut Vec<Value>) {
    for node in group.children() {
        match node {
            usvg::Node::Group(group) => collect(group, database, output),
            usvg::Node::Text(text) => {
                for span in text.layouted() {
                    for glyph in &span.positioned_glyphs {
                        let face = database.face(glyph.font).expect("resolved glyph face");
                        let ts = glyph.transform();
                        output.push(json!({"glyph":glyph.id.0,"text":glyph.text,"family":face.families[0].0,
                            "weight":face.weight.0,"style":format!("{:?}",face.style),"size":glyph.font_size(),
                            "transform":[ts.sx,ts.kx,ts.ky,ts.sy,ts.tx,ts.ty]}));
                    }
                }
            }
            _ => {}
        }
    }
}

fn storage_probe(out: &std::path::Path) -> Result<Value, Box<dyn Error>> {
    let mut document = Document::new(&mut SequentialIdSource::new(), 320.0, 120.0);
    let runs = vec![
        json!(null),
        json!(42),
        json!("legacy"),
        json!({"text":"hello","future":{"unknown":true}}),
    ];
    let layer = Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(0.0, 0.0, 320.0, 120.0),
        LayerKind::Text(TextLayer {
            text: "hello".into(),
            font_family: "Noto Sans".into(),
            font_size: 24.0,
            color: Some(Color::new("#102030")),
            align: TextAlign::Left,
            line_height: 1.4,
            font_weight: 400,
            font_style: FontStyle::Normal,
            letter_spacing: 0.0,
            stroke: None,
            vertical_align: VerticalAlign::Top,
            runs: runs.clone(),
            extra: Extras::new(),
        }),
    );
    document.layers.push(layer);
    let project = out.join("legacy-storage");
    storage::save(&document, &project)?;
    let original = fs::read(project.join("document.json"))?;
    let loaded = storage::load(&project)?;
    assert_eq!(document, loaded);
    let session = Session::open_read_only(&project)?;
    assert_eq!(session.document(), &document);
    storage::save(&loaded, &project)?;
    assert_eq!(original, fs::read(project.join("document.json"))?);
    Ok(
        json!({"arbitraryRunsPreserved":true,"loadValidationPassed":true,"readOnlySessionPassed":true,"saveBytesEqual":true,
        "scope":"existing 1.11.0 model; future typed representation unproved","runs":runs}),
    )
}
