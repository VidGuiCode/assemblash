//! Export formats, page sets, print geometry and variants at the command
//! line, through the real binary.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};
use std::process::Command;

use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
use assemblash_core::{Color, Document, Layer, LayerId, SequentialIdSource, Slot, SlotKind};

/// The binary, with the ambient workspace and font store removed, so a
/// machine that sets them cannot change what a test means.
fn assemblash() -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_assemblash"));
    command
        .env_remove("ASSEMBLASH_FONT_STORE")
        .env_remove("ASSEMBLASH_WORKSPACE");
    command
}

fn font_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../assemblash-renderer/tests/fonts")
}

#[track_caller]
fn run(args: &[&str]) -> (String, String) {
    let output = assemblash().args(args).output().expect("the binary runs");
    assert!(
        output.status.success(),
        "assemblash {args:?} failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    (
        String::from_utf8(output.stdout).expect("stdout is UTF-8"),
        String::from_utf8_lossy(&output.stderr).into_owned(),
    )
}

#[track_caller]
fn run_failing(args: &[&str]) -> String {
    let output = assemblash().args(args).output().expect("the binary runs");
    assert!(!output.status.success(), "assemblash {args:?} should fail");
    String::from_utf8_lossy(&output.stderr).into_owned()
}

fn text(path: &Path) -> &str {
    path.to_str().unwrap()
}

fn decode_png(bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

/// A workspace with three visibly different projects and a deck whose
/// middle page comes from a nested set.
fn deck_workspace(root: &Path) {
    for (id, colour) in [
        ("cover", "#c0392b"),
        ("inside", "#27ae60"),
        ("back", "#2980b9"),
    ] {
        let project = root.join("projects").join(id);
        run(&[
            "new",
            text(&project),
            "--width",
            "120",
            "--height",
            "80",
            "--background",
            colour,
        ]);
    }
    let sets = root.join("page-sets");
    std::fs::create_dir_all(&sets).unwrap();
    std::fs::write(
        sets.join("middle.json"),
        r#"{"pages":[{"project":"inside"}]}"#,
    )
    .unwrap();
    std::fs::write(
        sets.join("deck.json"),
        r#"{"pages":[{"project":"cover"},{"set":"middle"},{"project":"back"}]}"#,
    )
    .unwrap();
}

fn text_layer(id: &str, transform: Transform, body: &str) -> Layer {
    Layer::new(
        LayerId::new(id),
        transform,
        assemblash_core::LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: 24.0,
            color: Some(Color::new("#101820")),
            align: TextAlign::Left,
            line_height: 1.2,
            paragraph_spacing: 0.0,
            font_weight: 400,
            font_style: assemblash_core::FontStyle::Normal,
            letter_spacing: 0.0,
            stroke: None,
            vertical_align: assemblash_core::VerticalAlign::Top,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

/// A project whose text crosses a 20 px margin.
fn across_the_margin(directory: &Path, layer: &str) {
    std::fs::create_dir_all(directory).unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 200.0);
    document.canvas.margins = Some(assemblash_core::Insets {
        top: 20.0,
        right: 20.0,
        bottom: 20.0,
        left: 20.0,
        extra: Extras::new(),
    });
    document.layers.push(text_layer(
        layer,
        Transform::new(8.0, 40.0, 300.0, 60.0),
        "Across the margin",
    ));
    assemblash_core::storage::save(&document, directory).unwrap();
}

#[test]
fn an_export_without_the_new_flags_is_the_png_export_it_always_was() {
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("p");
    run(&[
        "new",
        text(&project),
        "--width",
        "40",
        "--height",
        "20",
        "--background",
        "#c0392b",
    ]);
    let plain = scratch.path().join("plain.png");
    let explicit = scratch.path().join("explicit.png");
    run(&["export", text(&project), text(&plain)]);
    run(&["export", text(&project), text(&explicit), "--format", "png"]);
    let written = std::fs::read(&plain).unwrap();
    assert_eq!(written, std::fs::read(&explicit).unwrap());

    // The same bytes as the direct PNG path of the renderer.
    let document = assemblash_core::Session::open_read_only(&project)
        .unwrap()
        .document()
        .clone();
    let hrefs = assemblash_renderer::data_uris(&document, &project).unwrap();
    let direct = assemblash_renderer::document_to_png(
        &document,
        &assemblash_renderer::LoadedFonts::from_bytes([]),
        &hrefs,
        1.0,
        &assemblash_renderer::PngMetadata::for_document(&document),
    )
    .unwrap();
    assert_eq!(written, direct);

    // The format never comes from the extension: out.pdf without --format
    // is a PNG.
    let named_pdf = scratch.path().join("out.pdf");
    run(&["export", text(&project), text(&named_pdf)]);
    assert_eq!(std::fs::read(&named_pdf).unwrap(), written);
}

#[test]
fn each_new_format_writes_its_own_bytes() {
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("p");
    run(&[
        "new",
        text(&project),
        "--width",
        "40",
        "--height",
        "20",
        "--background",
        "#c0392b",
    ]);
    for format in ["pdf", "jpeg", "jpg", "webp", "svg"] {
        let out = scratch.path().join(format!("out-{format}.bin"));
        let (printed, _) = run(&["export", text(&project), text(&out), "--format", format]);
        assert!(printed.starts_with(text(&out)), "{printed}");
        let bytes = std::fs::read(&out).unwrap();
        match format {
            "pdf" => assert!(bytes.starts_with(b"%PDF-")),
            "jpeg" | "jpg" => assert!(bytes.starts_with(&[0xFF, 0xD8, 0xFF])),
            "webp" => {
                assert!(bytes.starts_with(b"RIFF"));
                assert_eq!(&bytes[8..12], b"WEBP");
            }
            _ => assert!(String::from_utf8_lossy(&bytes).contains("<svg")),
        }
    }

    // The same JPEG twice is the same bytes.
    let first = scratch.path().join("first.jpg");
    let second = scratch.path().join("second.jpg");
    for out in [&first, &second] {
        run(&[
            "export",
            text(&project),
            text(out),
            "--format",
            "jpeg",
            "--quality",
            "70",
        ]);
    }
    assert_eq!(
        std::fs::read(first).unwrap(),
        std::fs::read(second).unwrap()
    );
}

#[test]
fn every_export_refusal_names_its_code_and_writes_nothing() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    deck_workspace(&root);
    let project = root.join("projects/cover");
    let out = scratch.path().join("refused.out");
    let workspace = text(&root);
    for (flags, code) in [
        (vec!["--format", "gif"], "exportFormatNotSupported"),
        (
            vec!["--format", "webp", "--quality", "80"],
            "lossyWebpNotSupported",
        ),
        (
            vec!["--format", "jpeg", "--quality", "0"],
            "exportQualityOutOfRange",
        ),
        (vec!["--quality", "80"], "exportQualityNotApplicable"),
        (vec!["--print"], "printNeedsPdf"),
        (
            vec!["--format", "pdf", "--timestamp", "2026-11-20T00:00:00Z"],
            "timestampNeedsPng",
        ),
    ] {
        let mut args = vec!["export", text(&project), text(&out)];
        args.extend(flags.iter().copied());
        let complaint = run_failing(&args);
        assert!(complaint.contains(code), "{flags:?}: {complaint}");
        if code == "lossyWebpNotSupported" {
            assert!(complaint.contains("lossless WebP"), "{complaint}");
            assert!(complaint.contains("jpeg"), "{complaint}");
        }
        assert!(!out.exists(), "{flags:?} wrote a file");
    }

    for (pages, format, code) in [
        ("deck:x", "pdf", "invalidPageSelection"),
        ("deck:0", "pdf", "invalidPageSelection"),
        ("deck:4", "pdf", "invalidPageSelection"),
        ("deck:", "pdf", "invalidPageSelection"),
        ("deck", "png", "pagesNeedPdf"),
        ("deck:1-2", "webp", "pagesNeedPdf"),
        ("nope", "pdf", "pageSetNotFound"),
    ] {
        let complaint = run_failing(&[
            "export",
            "--workspace",
            workspace,
            "--pages",
            pages,
            "--format",
            format,
            text(&out),
        ]);
        assert!(complaint.contains(code), "{pages}: {complaint}");
        if code == "pagesNeedPdf" {
            assert!(complaint.contains("use format pdf"), "{complaint}");
        }
        assert!(!out.exists(), "{pages} wrote a file");
    }

    // A project and --pages together are refused: which pages would it be?
    let both = run_failing(&[
        "export",
        text(&project),
        text(&out),
        "--workspace",
        workspace,
        "--pages",
        "deck",
        "--format",
        "pdf",
    ]);
    assert!(both.contains("not both"), "{both}");
    assert!(!out.exists());
    // Neither is a usage error.
    let neither = run_failing(&["export", "--format", "pdf"]);
    assert!(neither.contains("PROJECT"), "{neither}");
}

/// Rung exit test 2 at the command line, and the same PDF twice.
#[test]
fn a_page_set_exports_to_one_pdf_whose_pages_are_the_png_exports() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    deck_workspace(&root);

    let pdf_a = scratch.path().join("deck-a.pdf");
    let pdf_b = scratch.path().join("deck-b.pdf");
    for out in [&pdf_a, &pdf_b] {
        run(&[
            "export",
            "--workspace",
            text(&root),
            "--pages",
            "deck",
            "--format",
            "pdf",
            text(out),
        ]);
    }
    let pdf = std::fs::read(&pdf_a).unwrap();
    assert_eq!(pdf, std::fs::read(&pdf_b).unwrap());

    let images = assemblash_export::pdf::extract_page_images(&pdf).unwrap();
    assert_eq!(images.len(), 3);
    for (page, project) in ["cover", "inside", "back"].iter().enumerate() {
        let png = scratch.path().join(format!("{project}.png"));
        run(&[
            "export",
            text(&root.join("projects").join(project)),
            text(&png),
        ]);
        assert_eq!(
            images[page],
            decode_png(&std::fs::read(png).unwrap()),
            "page {page}"
        );
    }
    assert_ne!(images[0].2, images[1].2);
    assert_ne!(images[1].2, images[2].2);

    // One page with a single-image format, given with --out.
    let second = scratch.path().join("second.webp");
    run(&[
        "export",
        "--workspace",
        text(&root),
        "--pages",
        "deck:2",
        "--format",
        "webp",
        "--out",
        text(&second),
    ]);
    assert!(std::fs::read(second).unwrap().starts_with(b"RIFF"));
}

/// Rung exit test 4 at the command line.
#[test]
fn print_gives_crop_marks_from_the_bleed_and_the_png_does_not_change() {
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("p");
    run(&[
        "new",
        text(&project),
        "--width",
        "60",
        "--height",
        "40",
        "--background",
        "#c0392b",
    ]);
    let before = scratch.path().join("before.png");
    run(&["export", text(&project), text(&before)]);
    run(&["canvas", "set", text(&project), "--bleed", "9"]);
    let after = scratch.path().join("after.png");
    run(&["export", text(&project), text(&after)]);
    assert_eq!(
        std::fs::read(&before).unwrap(),
        std::fs::read(&after).unwrap()
    );

    let marked = scratch.path().join("marked.pdf");
    run(&[
        "export",
        text(&project),
        text(&marked),
        "--format",
        "pdf",
        "--print",
    ]);
    let pdf = std::fs::read(&marked).unwrap();
    let streams = assemblash_export::pdf::page_content_streams(&pdf).unwrap();
    assert!(streams[0].contains(" l S"), "{}", streams[0]);
    let boxes = assemblash_export::pdf::page_dictionaries(&pdf).unwrap();
    assert!(boxes[0].contains("/TrimBox") && boxes[0].contains("/BleedBox"));

    let plain = scratch.path().join("plain.pdf");
    run(&["export", text(&project), text(&plain), "--format", "pdf"]);
    let pdf = std::fs::read(&plain).unwrap();
    let streams = assemblash_export::pdf::page_content_streams(&pdf).unwrap();
    assert!(!streams[0].contains(" l S"), "{}", streams[0]);
    let boxes = assemblash_export::pdf::page_dictionaries(&pdf).unwrap();
    assert!(!boxes[0].contains("/TrimBox"), "{}", boxes[0]);
}

#[test]
fn every_format_reports_content_outside_margins_and_a_page_set_in_page_order() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    let first = root.join("projects/first");
    let second = root.join("projects/second");
    across_the_margin(&first, "layer_first");
    across_the_margin(&second, "layer_second");
    let fonts = font_dir();

    let png = scratch.path().join("proof.png");
    let (printed, _) = run(&[
        "export",
        text(&first),
        text(&png),
        "--font-dir",
        text(&fonts),
        "--warnings-json",
    ]);
    let expected = printed.lines().nth(1).unwrap().to_owned();
    assert!(expected.contains("contentOutsideMargins"), "{expected}");
    assert!(expected.contains("layer_first"), "{expected}");
    for format in ["pdf", "jpeg", "webp"] {
        let out = scratch.path().join(format!("proof-{format}"));
        let (printed, _) = run(&[
            "export",
            text(&first),
            text(&out),
            "--format",
            format,
            "--font-dir",
            text(&fonts),
            "--warnings-json",
        ]);
        assert_eq!(printed.lines().nth(1).unwrap(), expected, "{format}");
    }

    // A page set: the warnings of each page, in page order, each with its
    // project. The fonts come from the workspace's store.
    let mut store = assemblash_renderer::store::FontStore::open(
        root.join(assemblash_core::workspace::FONTS_DIR),
    )
    .unwrap();
    store
        .import_file(
            &fonts.join("NotoSans-Subset.ttf"),
            None,
            Some("OFL-1.1".into()),
        )
        .unwrap();
    std::fs::create_dir_all(root.join("page-sets")).unwrap();
    std::fs::write(
        root.join("page-sets/proofs.json"),
        r#"{"pages":[{"project":"second"},{"project":"first"}]}"#,
    )
    .unwrap();
    let out = scratch.path().join("proofs.pdf");
    let (_, stderr) = run(&[
        "export",
        "--workspace",
        text(&root),
        "--pages",
        "proofs",
        "--format",
        "pdf",
        text(&out),
    ]);
    let outside: Vec<&str> = stderr
        .lines()
        .filter(|line| line.starts_with("contentOutsideMargins"))
        .collect();
    assert_eq!(outside.len(), 2, "{stderr}");
    assert!(outside[0].contains("layer_second") && outside[0].ends_with("\tsecond"));
    assert!(outside[1].contains("layer_first") && outside[1].ends_with("\tfirst"));
}

#[test]
fn variants_as_a_pdf_are_one_page_each_in_the_order_asked_for() {
    let scratch = tempfile::tempdir().unwrap();
    let project = scratch.path().join("flyer");
    std::fs::create_dir_all(&project).unwrap();
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 200.0);
    document.canvas.background = Some(Color::new("#ffffff"));
    document.layers.push(text_layer(
        "layer_headline",
        Transform::new(10.0, 10.0, 380.0, 80.0),
        "placeholder",
    ));
    document.slots = vec![Slot {
        name: "headline".to_owned(),
        layer: LayerId::new("layer_headline"),
        kind: SlotKind::Text,
        description: None,
        required: true,
        extra: Extras::new(),
    }];
    assemblash_core::storage::save(&document, &project).unwrap();

    let store_dir = scratch.path().join("fonts");
    let mut store = assemblash_renderer::store::FontStore::open(&store_dir).unwrap();
    store
        .import_file(
            &font_dir().join("NotoSans-Subset.ttf"),
            None,
            Some("OFL-1.1".into()),
        )
        .unwrap();
    let values = scratch.path().join("values.json");
    std::fs::write(
        &values,
        r#"[{"name":"one","values":{"headline":"First"}},
            {"name":"two","values":{"headline":"Second"}},
            {"name":"three","values":{"headline":"Third"}}]"#,
    )
    .unwrap();

    let (pngs, _) = run(&[
        "variants",
        text(&project),
        "--values",
        text(&values),
        "--font-store",
        text(&store_dir),
    ]);
    assert_eq!(pngs.lines().count(), 3, "{pngs}");
    assert!(
        pngs.lines().next().unwrap().contains("exports/one.png"),
        "{pngs}"
    );

    let (pdf, _) = run(&[
        "variants",
        text(&project),
        "--values",
        text(&values),
        "--font-store",
        text(&store_dir),
        "--format",
        "pdf",
        "--name",
        "batch",
    ]);
    assert!(
        pdf.lines().all(|line| line.contains("exports/batch.pdf")),
        "{pdf}"
    );
    let bytes = std::fs::read(project.join("exports/batch.pdf")).unwrap();
    let images = assemblash_export::pdf::extract_page_images(&bytes).unwrap();
    assert_eq!(images.len(), 3);
    for (index, name) in ["one", "two", "three"].iter().enumerate() {
        let png = std::fs::read(project.join(format!("exports/{name}.png"))).unwrap();
        assert_eq!(images[index], decode_png(&png), "{name}");
    }

    // A name without pdf is refused before anything is written.
    let complaint = run_failing(&[
        "variants",
        text(&project),
        "--values",
        text(&values),
        "--font-store",
        text(&store_dir),
        "--name",
        "batch2",
    ]);
    assert!(complaint.contains("variantsNameNeedsPdf"), "{complaint}");
    assert!(!project.join("exports/batch2.pdf").exists());
}
