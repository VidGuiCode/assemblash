//! The v0.5.0 exit test: the same document plus the same font files produce
//! the same pixels everywhere, and a font that is not installed is an error
//! rather than a substitution.
//!
//! "The same font files" is what the store makes checkable. Every file is
//! named by the hash of its own bytes, so a render can say exactly which bytes
//! it used, and [`FontStore::verify`] notices when they change.
//!
//! Nothing here touches the network. The installer is exercised end to end
//! against a fake fetcher, which is the whole reason the fetcher is a trait.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::storage::hash_bytes as core_hash_bytes;
use assemblash_core::{Color, Document, Layer, LayerKind};
use assemblash_renderer::install::{
    install_family, install_pack, FontFetcher, InstallError, Manifest,
};
use assemblash_renderer::store::{FontStore, FontStoreError, INDEX_FILE};
use assemblash_renderer::{doc_to_svg, document_to_png, AssetHrefs, LoadedFonts, PngMetadata};

/// The fixture that names one family twice, in two languages.
///
/// Built by `tests/fonts/subset.py` from the committed `NotoSans-Subset.ttf`,
/// so it is a Noto Sans subset under the SIL Open Font License 1.1 like every
/// other font here (`tests/fonts/OFL.txt`), renamed because a derived font
/// should not claim to be the original.
const TWO_NAMES: &str = "TwoFamilyNames-Subset.ttf";

fn fixture_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fonts")
}

fn fixture(name: &str) -> PathBuf {
    fixture_dir().join(name)
}

fn new_store() -> (tempfile::TempDir, FontStore) {
    let dir = tempfile::tempdir().unwrap();
    let store = FontStore::open(dir.path()).unwrap();
    (dir, store)
}

fn document(family: &str) -> Document {
    let mut doc = Document::new(&mut SequentialIdSource::new(), 400.0, 140.0);
    doc.canvas.background = Some(Color::new("#ffffff"));
    doc.layers.push(Layer::new(
        LayerId::new("layer_00000000000000000000000001"),
        Transform::new(20.0, 20.0, 360.0, 100.0),
        LayerKind::Text(TextLayer {
            text: "Pinned bytes".to_owned(),
            font_family: family.to_owned(),
            font_size: 40.0,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.3,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    ));
    doc
}

#[test]
fn text_wraps_using_the_loaded_fonts_advances() {
    let fonts = LoadedFonts::from_files([fixture("NotoSans-Subset.ttf")]).unwrap();
    let mut doc = document("Noto Sans");
    let layer = doc.layers.first_mut().unwrap();
    layer.transform.width = 150.0;
    if let LayerKind::Text(text) = &mut layer.kind {
        text.text = "Direct editing works".to_owned();
    }

    let svg = doc_to_svg(&doc, fonts.font_set(), &AssetHrefs::new()).unwrap();
    assert!(svg.matches("<tspan").count() >= 2, "{svg}");
    assert!(!svg.contains(">Direct editing works</tspan>"), "{svg}");
}

/// A fetcher serving files from a directory, so the install path can be
/// exercised without a network.
struct LocalFiles {
    directory: PathBuf,
    /// Bytes to serve instead of the real file, for the tamper case.
    corrupt: bool,
}

impl FontFetcher for LocalFiles {
    fn fetch(&self, url: &str) -> Result<Vec<u8>, String> {
        if self.corrupt {
            return Ok(b"not a font at all".to_vec());
        }
        let name = url.rsplit('/').next().ok_or("no file in url")?;
        let path = self.directory.join(name);
        std::fs::read(&path).map_err(|e| format!("{}: {e}", path.display()))
    }
}

/// A manifest pointing at the committed test fixtures rather than the network.
fn fixture_manifest() -> Manifest {
    let subset = std::fs::read(fixture("NotoSans-Subset.ttf")).unwrap();
    let arabic = std::fs::read(fixture("NotoSansArabic-Subset.ttf")).unwrap();
    let json = serde_json::json!({
        "version": 1,
        "source": "test fixtures",
        "commit": "0".repeat(40),
        "urlPrefix": "https://example.invalid/",
        "families": [
            {
                "name": "Noto Sans",
                "path": "NotoSans-Subset.ttf",
                "sha256": assemblash_renderer::store::hash_bytes(&subset),
                "bytes": subset.len(),
                "license": "OFL-1.1",
                "packs": ["default"]
            },
            {
                "name": "Noto Sans Arabic",
                "path": "NotoSansArabic-Subset.ttf",
                "sha256": assemblash_renderer::store::hash_bytes(&arabic),
                "bytes": arabic.len(),
                "license": "OFL-1.1",
                "packs": ["default"]
            }
        ]
    });
    serde_json::from_value(json).unwrap()
}

#[test]
fn importing_pins_a_file_by_its_hash() {
    let (dir, mut store) = new_store();
    let added = store
        .import_file(
            &fixture("NotoSans-Subset.ttf"),
            None,
            Some("OFL-1.1".into()),
        )
        .unwrap();

    assert!(!added.is_empty());
    let record = added
        .iter()
        .find(|r| r.family == "Noto Sans")
        .expect("the fixture provides Noto Sans");
    assert_eq!(record.license.as_deref(), Some("OFL-1.1"));
    assert_eq!(record.source.as_deref(), Some("NotoSans-Subset.ttf"));

    // The stored file is named by the hash of its own bytes, and hashes the
    // same way `assemblash-core` hashes an asset.
    let bytes = std::fs::read(fixture("NotoSans-Subset.ttf")).unwrap();
    assert_eq!(record.hash, core_hash_bytes(&bytes));
    assert!(record
        .file
        .starts_with(record.hash.trim_start_matches("sha256:")));
    assert!(store.file_path(&record.file).is_file());

    // Reopening reads the same index back.
    let reopened = FontStore::open(dir.path()).unwrap();
    assert_eq!(reopened.records(), store.records());
    assert!(reopened.has_family("Noto Sans"));
    reopened.verify().unwrap();
}

#[test]
fn importing_the_same_bytes_twice_adds_nothing() {
    let (_dir, mut store) = new_store();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    let after_first = store.records().to_vec();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    assert_eq!(store.records(), after_first);
}

#[test]
fn a_font_naming_its_family_in_two_languages_is_one_record() {
    // `TwoFamilyNames-Subset.ttf` carries two Unicode family-name records for
    // the same face — an English one and a Japanese one, which is ordinary in
    // a shipped font. One file provides one family, so importing it must add
    // one record, not one per name-table language.
    let (_dir, mut store) = new_store();
    let added = store
        .import_file(&fixture(TWO_NAMES), None, Some("OFL-1.1".into()))
        .unwrap();

    assert_eq!(added.len(), 1, "one face, one record: {added:?}");
    assert_eq!(added[0].family, "Assemblash Two Names");
    assert_eq!(store.families(), vec!["Assemblash Two Names".to_owned()]);
    assert_eq!(store.records().len(), 1);
}

#[test]
fn the_same_bytes_under_another_name_add_nothing() {
    // A user who keeps a copy of a font under a different filename, or adds it
    // a second time with the licence filled in, is adding the same face. The
    // file is already pinned by its hash, so a second index record would
    // describe the same bytes twice.
    let (_dir, mut store) = new_store();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    let after_first = store.records().to_vec();

    let elsewhere = tempfile::tempdir().unwrap();
    let renamed = elsewhere.path().join("my-favourite-font.ttf");
    std::fs::copy(fixture("NotoSans-Subset.ttf"), &renamed).unwrap();
    store
        .import_file(&renamed, None, Some("OFL-1.1".into()))
        .unwrap();

    assert_eq!(store.records(), after_first);
}

#[test]
fn the_index_is_written_deterministically() {
    let mut written = Vec::new();
    for order in [
        ["NotoSans-Subset.ttf", "NotoSansJP-Subset.ttf"],
        ["NotoSansJP-Subset.ttf", "NotoSans-Subset.ttf"],
    ] {
        let (dir, mut store) = new_store();
        for name in order {
            store.import_file(&fixture(name), None, None).unwrap();
        }
        written.push(std::fs::read_to_string(dir.path().join(INDEX_FILE)).unwrap());
    }
    assert_eq!(
        written[0], written[1],
        "index order must not depend on import order"
    );
}

#[test]
fn a_file_that_is_not_a_font_is_refused() {
    let (_dir, mut store) = new_store();
    let junk = tempfile::tempdir().unwrap();
    let path = junk.path().join("notafont.ttf");
    std::fs::write(&path, b"this is not a font").unwrap();

    assert!(matches!(
        store.import_file(&path, None, None),
        Err(FontStoreError::NotAFont { .. })
    ));
    assert!(store.records().is_empty());
}

#[test]
fn a_tampered_store_is_detected_by_hash() {
    let (_dir, mut store) = new_store();
    let added = store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    store.verify().unwrap();

    let path = store.file_path(&added[0].file);
    let mut bytes = std::fs::read(&path).unwrap();
    // Flip a byte well inside the file: still a file, no longer these bytes.
    bytes[1000] ^= 0xff;
    std::fs::write(&path, bytes).unwrap();

    assert!(matches!(
        store.verify(),
        Err(FontStoreError::HashMismatch { .. })
    ));
}

#[test]
fn a_deleted_file_is_detected() {
    let (_dir, mut store) = new_store();
    let added = store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    std::fs::remove_file(store.file_path(&added[0].file)).unwrap();
    assert!(matches!(
        store.verify(),
        Err(FontStoreError::MissingFile { .. })
    ));
}

#[test]
fn a_family_the_store_does_not_have_is_a_structured_error() {
    let (_dir, mut store) = new_store();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();

    let error = store.load_families(["Comic Sans MS"]).unwrap_err();
    let FontStoreError::UnknownFamily { family, .. } = &error else {
        panic!("expected UnknownFamily, got {error:?}");
    };
    assert_eq!(family, "Comic Sans MS");
}

#[test]
fn a_missing_font_is_never_substituted_at_render_time() {
    let (_dir, mut store) = new_store();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();

    let fonts = store.load_families(["Noto Sans"]).unwrap();
    let doc = document("Helvetica Neue");
    let error = document_to_png(
        &doc,
        &fonts,
        &AssetHrefs::new(),
        1.0,
        &PngMetadata::for_document(&doc),
    )
    .unwrap_err();
    assert!(
        matches!(error, assemblash_renderer::RenderError::MissingFont { .. }),
        "{error:?}"
    );
}

#[test]
fn removing_a_family_removes_its_file() {
    let (_dir, mut store) = new_store();
    let added = store
        .import_file(&fixture("NotoSansJP-Subset.ttf"), None, None)
        .unwrap();
    let file = store.file_path(&added[0].file);
    let family = added[0].family.clone();

    assert!(store.remove_family(&family).unwrap() > 0);
    assert!(!file.exists());
    assert!(!store.has_family(&family));
    assert_eq!(store.remove_family(&family).unwrap(), 0);
}

/// The exit test proper.
///
/// The bytes are pinned by hash, so this expectation is a claim about the
/// pipeline, not about this machine: CI runs it on Windows and Linux, x86_64
/// and aarch64, and a target that renders differently fails here.
#[test]
fn the_same_document_and_the_same_font_bytes_give_the_same_pixels() {
    const EXPECTED: &str =
        "sha256:09850b75a21e283fa41a355aa4b53e495582e261b7dfec7f7c3c29d3314c0356";

    let (_dir, mut store) = new_store();
    store
        .import_file(&fixture("NotoSans-Subset.ttf"), None, None)
        .unwrap();
    let fonts = store.load_families(["Noto Sans"]).unwrap();

    let doc = document("Noto Sans");
    let render = || {
        document_to_png(
            &doc,
            &fonts,
            &AssetHrefs::new(),
            1.0,
            &PngMetadata {
                document_id: doc.id.to_string(),
                schema_version: assemblash_core::SCHEMA_VERSION,
                // A constant, not the release version: a version bump must
                // not look like a change in rendered output.
                renderer_version: "font-store".to_owned(),
                created: None,
            },
        )
        .unwrap()
    };

    let first = render();
    assert_eq!(first, render(), "two renders in one process differ");

    let actual = core_hash_bytes(&first);
    if std::env::var_os("UPDATE_GATE").is_some() {
        println!("font store exit-test hash: {actual}");
        return;
    }
    assert_eq!(
        actual, EXPECTED,
        "the store's pixels differ from the committed hash on this platform"
    );
}

#[test]
fn installing_verifies_the_hash_the_manifest_pins() {
    let (_dir, mut store) = new_store();
    let manifest = fixture_manifest();
    let fetcher = LocalFiles {
        directory: fixture_dir(),
        corrupt: false,
    };

    let installed = install_family(&mut store, &manifest, "Noto Sans", &fetcher).unwrap();
    assert!(installed.iter().any(|r| r.family == "Noto Sans"));
    assert_eq!(installed[0].license.as_deref(), Some("OFL-1.1"));
    assert!(installed[0]
        .source
        .as_deref()
        .unwrap()
        .contains("example.invalid"));
    store.verify().unwrap();

    // The whole pack, and a family that is not in the manifest.
    let (_dir2, mut store2) = new_store();
    let pack = install_pack(&mut store2, &manifest, "default", &fetcher).unwrap();
    assert!(pack.len() >= 2);
    assert!(matches!(
        install_family(&mut store2, &manifest, "Nothing", &fetcher),
        Err(InstallError::UnknownFamily { .. })
    ));
    assert!(matches!(
        install_pack(&mut store2, &manifest, "nothing", &fetcher),
        Err(InstallError::UnknownPack { .. })
    ));
}

#[test]
fn a_download_that_does_not_match_the_manifest_is_refused() {
    let (dir, mut store) = new_store();
    let manifest = fixture_manifest();
    let fetcher = LocalFiles {
        directory: fixture_dir(),
        corrupt: true,
    };

    let error = install_family(&mut store, &manifest, "Noto Sans", &fetcher).unwrap_err();
    assert!(
        matches!(error, InstallError::HashMismatch { .. }),
        "{error:?}"
    );
    // Nothing was written: a font that is not what was pinned does not become
    // a file that a later render might pick up.
    assert!(store.records().is_empty());
    assert!(!dir.path().join(INDEX_FILE).exists());
}

#[test]
fn a_fetch_failure_is_a_typed_error() {
    let (_dir, mut store) = new_store();
    let manifest = fixture_manifest();
    let fetcher = LocalFiles {
        directory: PathBuf::from("this-directory-does-not-exist"),
        corrupt: false,
    };
    assert!(matches!(
        install_family(&mut store, &manifest, "Noto Sans", &fetcher),
        Err(InstallError::Fetch { .. })
    ));
}

#[test]
fn web_fonts_are_decompressed_on_the_way_in() {
    for name in ["NotoSans-Subset.woff", "NotoSans-Subset.woff2"] {
        let compressed = std::fs::read(fixture(name)).unwrap();

        let (_dir, mut store) = new_store();
        let added = store
            .import_file(&fixture(name), None, Some("OFL-1.1".into()))
            .unwrap();
        let record = added
            .iter()
            .find(|r| r.family == "Noto Sans")
            .unwrap_or_else(|| panic!("{name} should provide Noto Sans"));

        // What is stored, and what the index hashes, is the decompressed
        // font — so a render is a plain file read and the hash describes what
        // is actually on disk.
        assert!(
            record.file.ends_with(".ttf"),
            "{name} stored as {}",
            record.file
        );
        let stored = std::fs::read(store.file_path(&record.file)).unwrap();
        assert_ne!(stored, compressed, "{name} was stored still compressed");
        assert_eq!(record.hash, core_hash_bytes(&stored), "{name}");
        store.verify().unwrap();

        // And it renders.
        let fonts = store.load_families(["Noto Sans"]).unwrap();
        let doc = document("Noto Sans");
        document_to_png(
            &doc,
            &fonts,
            &AssetHrefs::new(),
            1.0,
            &PngMetadata::for_document(&doc),
        )
        .unwrap();
    }
}

#[test]
fn a_web_font_that_cannot_be_decompressed_is_refused() {
    let (_dir, mut store) = new_store();
    let mut broken = b"wOF2".to_vec();
    broken.extend_from_slice(&[0u8; 64]);
    let error = store
        .import_bytes(&broken, Path::new("broken.woff2"), None, None)
        .unwrap_err();
    assert!(
        matches!(
            error,
            FontStoreError::Undecompressable {
                format: "WOFF2",
                ..
            }
        ),
        "{error:?}"
    );
}
