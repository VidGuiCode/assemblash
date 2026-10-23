#![allow(clippy::expect_used)]

use std::path::PathBuf;

use assemblash_core::FontStyle;
use assemblash_renderer::{layout_text, FontSet, LoadedFonts};

fn files(names: &[&str]) -> LoadedFonts {
    let directory = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts");
    LoadedFonts::from_files(names.iter().map(|name| directory.join(name)))
        .expect("load pinned font fixtures")
}

fn wrap(fonts: &FontSet) -> assemblash_renderer::TextLayout {
    layout_text(
        "AVATAR highlight office",
        180.0,
        40.0,
        1.4,
        0.0,
        "Noto Sans",
        fonts,
    )
}

#[test]
fn selected_bold_uses_bold_measurement_with_regular_loaded_first() {
    let combined = files(&["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf"]);
    let regular = files(&["NotoSans-Subset.ttf"]);
    let bold = files(&["NotoSans-Bold-Subset.ttf"]);
    let selected = combined
        .font_set()
        .select_face("Noto Sans", 700, FontStyle::Normal)
        .expect("bold face exists");
    assert_eq!(wrap(&selected), wrap(bold.font_set()));
    assert_ne!(wrap(&selected).lines, wrap(regular.font_set()).lines);
    assert_eq!(wrap(combined.font_set()), wrap(regular.font_set()));
    assert!(selected.contains_face("Noto Sans", 700, FontStyle::Normal));
    assert!(!selected.contains_face("Noto Sans", 400, FontStyle::Normal));
}

#[test]
fn selected_faces_ignore_file_loading_order() {
    let forward = files(&["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf"]);
    let reverse = files(&["NotoSans-Bold-Subset.ttf", "NotoSans-Subset.ttf"]);
    for weight in [400, 700] {
        let left = forward
            .font_set()
            .select_face("Noto Sans", weight, FontStyle::Normal)
            .expect("face exists");
        let right = reverse
            .font_set()
            .select_face("Noto Sans", weight, FontStyle::Normal)
            .expect("face exists");
        assert_eq!(left, right);
        assert_eq!(wrap(&left), wrap(&right));
    }
}

#[test]
fn absent_face_and_family_are_not_substituted() {
    let fonts = files(&["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf"]);
    assert!(fonts
        .font_set()
        .select_face("Noto Sans", 400, FontStyle::Italic)
        .is_none());
    assert!(fonts
        .font_set()
        .select_face("Noto Sans", 900, FontStyle::Normal)
        .is_none());
    assert!(fonts
        .font_set()
        .select_face("Absent", 400, FontStyle::Normal)
        .is_none());
}

#[test]
fn selected_italic_uses_italic_measurement() {
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let regular = manifest
        .join("tests")
        .join("fonts")
        .join("NotoSans-Subset.ttf");
    let italic = manifest
        .join("examples")
        .join("fixtures")
        .join("NotoSans-Italic-Subset.ttf");
    let combined = LoadedFonts::from_files([&regular, &italic]).expect("load regular and italic");
    let italic_only = LoadedFonts::from_files([&italic]).expect("load italic");
    let regular_only = LoadedFonts::from_files([&regular]).expect("load regular");
    let selected = combined
        .font_set()
        .select_face("Noto Sans", 400, FontStyle::Italic)
        .expect("italic face exists");
    for width in [160.0, 180.0, 200.0, 220.0] {
        let render = |fonts| {
            layout_text(
                "AVATAR highlight office",
                width,
                40.0,
                1.4,
                0.0,
                "Noto Sans",
                fonts,
            )
        };
        assert_eq!(render(&selected), render(italic_only.font_set()));
    }
    let differs = (100..280).any(|width| {
        let render = |fonts| {
            layout_text(
                "AVATAR highlight office",
                f64::from(width),
                40.0,
                1.4,
                0.0,
                "Noto Sans",
                fonts,
            )
        };
        render(&selected).lines != render(regular_only.font_set()).lines
    });
    assert!(differs, "italic advances must affect wrapping");
    assert!(combined
        .font_set()
        .select_face("Noto Sans", 700, FontStyle::Italic)
        .is_none());
}

#[test]
fn name_only_sets_keep_unmeasured_layout() {
    let names = FontSet::new(["Noto Sans"]);
    let selected = names
        .select_face("Noto Sans", 700, FontStyle::Italic)
        .expect("name-only sets have no face inventory");
    assert_eq!(wrap(&selected), wrap(&names));
    assert!(FontSet::unchecked()
        .select_face("Any", 700, FontStyle::Italic)
        .is_some());
}
