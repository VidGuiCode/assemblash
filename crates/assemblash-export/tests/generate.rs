//! The generators: every chart type, a table and a QR code, with the bytes
//! pinned.
//!
//! A moved hash here means a generated asset changed for every user who
//! regenerates. Move a hash only in its own commit, with the reason.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_export::generate::{ChartSpec, ChartType, Face, GeneratedSpec, QrSpec, TableSpec};
use sha2::{Digest, Sha256};

const FONT: &[u8] = include_bytes!("../../../examples/fonts/Inter-Regular.ttf");

fn face() -> Face<'static> {
    Face {
        family: "Inter",
        bytes: FONT,
        index: 0,
    }
}

const CSV: &str = "Quarter,North,South\nQ1,12,7\nQ2,18,11\nQ3,9,14\nQ4,21,16\n";

fn chart(chart_type: ChartType) -> GeneratedSpec {
    let mut spec = ChartSpec::from_csv(chart_type, CSV).unwrap();
    spec.title = Some("Sales by quarter".to_owned());
    spec.font_family = Some("Inter".to_owned());
    spec.value_labels = true;
    GeneratedSpec::Chart(spec)
}

fn sha(text: &str) -> String {
    let digest = Sha256::digest(text.as_bytes());
    digest.iter().map(|b| format!("{b:02x}")).collect()
}

#[test]
fn every_chart_type_draws_labels_as_paths_and_is_repeatable() {
    for chart_type in ChartType::ALL {
        let spec = chart(chart_type);
        let first = spec.to_svg(Some(&face())).unwrap();
        let second = spec.to_svg(Some(&face())).unwrap();
        assert_eq!(first, second, "{chart_type:?}");
        assert!(!first.svg.contains("<text"), "{chart_type:?} has no <text>");
        assert!(first.svg.starts_with("<svg xmlns="), "{chart_type:?}");
        assert!(first.svg.len() > 1000, "{chart_type:?} draws something");
    }
}

#[test]
fn a_type_switch_keeps_the_data() {
    let GeneratedSpec::Chart(bar) = chart(ChartType::Bar) else {
        unreachable!()
    };
    let line = ChartSpec {
        chart_type: ChartType::Line,
        ..bar.clone()
    };
    assert_eq!(line.series, bar.series);
    let a = GeneratedSpec::Chart(bar).to_svg(Some(&face())).unwrap();
    let b = GeneratedSpec::Chart(line).to_svg(Some(&face())).unwrap();
    assert_ne!(a.svg, b.svg);
}

#[test]
fn the_spec_round_trips_through_json() {
    for spec in [
        chart(ChartType::Donut),
        GeneratedSpec::Table(TableSpec::from_csv("a,b\n1,2\n").unwrap()),
        GeneratedSpec::Qr(QrSpec::new("hello")),
    ] {
        let json = serde_json::to_value(&spec).unwrap();
        let back: GeneratedSpec = serde_json::from_value(json.clone()).unwrap();
        assert_eq!(back, spec);
        assert_eq!(json["kind"], spec.kind());
    }
}

#[test]
fn an_unknown_spec_field_is_refused() {
    let error = serde_json::from_value::<GeneratedSpec>(serde_json::json!({
        "kind": "qr",
        "data": "x",
        "colour": "#000000"
    }))
    .unwrap_err();
    assert!(error.to_string().contains("colour"), "{error}");
}

#[test]
fn a_label_character_the_face_lacks_is_refused_by_name() {
    let mut spec = ChartSpec::from_csv(ChartType::Bar, "k,v\n\u{4e2d},1\n").unwrap();
    spec.font_family = Some("Inter".to_owned());
    let error = GeneratedSpec::Chart(spec)
        .to_svg(Some(&face()))
        .unwrap_err();
    assert_eq!(error.code(), "generatorMissingGlyph");
    assert!(error.to_string().contains("U+4E2D"), "{error}");
}

#[test]
fn a_table_draws_merges_stripes_and_clips_long_text() {
    let mut spec = TableSpec::from_csv(
        "Item,Count,Note\nApples,3,fresh\nPears,12,a note that is far too long to fit inside its cell\n",
    )
    .unwrap();
    spec.stripe_fill = Some("#fafafa".to_owned());
    spec.merges = vec![assemblash_export::generate::TableMerge {
        row: 0,
        col: 1,
        row_span: 1,
        col_span: 2,
    }];
    let out = GeneratedSpec::Table(spec).to_svg(Some(&face())).unwrap();
    assert!(out.svg.contains("<clipPath id=\"cell0\">"));
    assert!(out.svg.contains("#fafafa"));
    // Three rows of one line each, plus the border.
    assert!(out.height > 3.0 * 14.0);
    assert!(!out.svg.contains("<text"));
}

/// The pinned bytes. Linux, Windows and macOS on x86_64 and aarch64 must all
/// give these.
#[test]
fn generated_bytes_are_pinned() {
    let mut actual = Vec::new();
    for chart_type in ChartType::ALL {
        let out = chart(chart_type).to_svg(Some(&face())).unwrap();
        actual.push((chart_type.as_str().to_owned(), sha(&out.svg)));
    }
    let table = GeneratedSpec::Table(TableSpec::from_csv(CSV).unwrap())
        .to_svg(Some(&face()))
        .unwrap();
    actual.push(("table".to_owned(), sha(&table.svg)));
    let qr = GeneratedSpec::Qr(QrSpec::new("https://example.org/assemblash"))
        .to_svg(None)
        .unwrap();
    actual.push(("qr".to_owned(), sha(&qr.svg)));

    if let Some(dir) = std::env::var_os("ASSEMBLASH_DUMP_GENERATED") {
        let dir = std::path::PathBuf::from(dir);
        for chart_type in ChartType::ALL {
            let out = chart(chart_type).to_svg(Some(&face())).unwrap();
            std::fs::write(dir.join(format!("{}.svg", chart_type.as_str())), out.svg).unwrap();
        }
        std::fs::write(dir.join("table.svg"), &table.svg).unwrap();
        std::fs::write(dir.join("qr.svg"), &qr.svg).unwrap();
    }

    let expected: Vec<(String, String)> = PINNED
        .iter()
        .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
        .collect();
    assert_eq!(actual, expected, "actual hashes:\n{actual:#?}");
}

const PINNED: &[(&str, &str)] = &[
    (
        "bar",
        "de94aea4f66ea47c8ca2d059dc88a1efaa816a668fe95b02d056fdad9c9c8447",
    ),
    (
        "column",
        "3ccd5dbad63d207cad558d597be34dbb1e24f02cb3f891c335214dc4c5aaeb30",
    ),
    (
        "line",
        "797d82bf1d295ac57b1301fd7c67f39e69f3d8d6b10a003fdfdf17d30e901996",
    ),
    (
        "area",
        "1d11763c4a4639e19466f5ba8aef44e973add36bada9e34331608832bde9dac9",
    ),
    (
        "pie",
        "1d55f9ec52cf789447b34007e54bafe46f9bf64d20c146f731285b4f19bdd0ed",
    ),
    (
        "donut",
        "834fc4ebcc27e263c12a2984d5cdeec5749a8496e0c17f21d20f45f85e70aa98",
    ),
    (
        "scatter",
        "014a3dbb44abc4cad8fb630ba92c1f0ef934f4debac7821eb5c20c500f0e7f33",
    ),
    (
        "table",
        "0a8cac184667cd9e1540cbecff60b971742e039fbbca81dae4763cbfda613e0d",
    ),
    (
        "qr",
        "7de6ed1fdc2caf6c0b25745e56d9bd16c32c89d7dca8199752d0eca62fc55df9",
    ),
];
