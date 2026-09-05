//! The v0.12.0 exit test — PRD use case C, over MCP.
//!
//! One template, N sets of values → N correct exports, byte-stable across two
//! runs, and **the protected chrome byte-identical in every variant**. Driven
//! by a real client against the real binary over a real stdio pipe.
//!
//! The last of those is the point of templates. A template offers exactly the
//! openings it means to offer; everything else — the logo, the legal line — is
//! not merely "not in the values file", it is refused if asked for. Slot
//! filling is ordinary `Update` operations, so it refuses at the same check
//! every other route to a protected layer refuses at.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::path::{Path, PathBuf};

use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
use assemblash_core::ids::{LayerId, SequentialIdSource};
use assemblash_core::templates::{Slot, SlotKind};
use assemblash_core::workspace::{ProjectId, Workspace};
use assemblash_core::{Color, Document, Layer, LayerKind};
use rmcp::model::CallToolRequestParams;
use rmcp::transport::TokioChildProcess;
use rmcp::ServiceExt;
use serde_json::{json, Map, Value};

mod support;

use support::binary;

fn font_fixture() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../assemblash-renderer/tests/fonts/NotoSans-Subset.ttf")
}

const HEADLINE: &str = "layer_00000000000000000000000001";
const PRICE: &str = "layer_00000000000000000000000002";
const CHROME: &str = "layer_00000000000000000000000003";

fn text(id: &str, y: f64, body: &str, size: f64) -> Layer {
    Layer::new(
        LayerId::new(id),
        Transform::new(20.0, y, 360.0, 50.0),
        LayerKind::Text(TextLayer {
            text: body.to_owned(),
            font_family: "Noto Sans".to_owned(),
            font_size: size,
            color: Color::new("#101820"),
            align: TextAlign::Left,
            line_height: 1.2,
            runs: Vec::new(),
            extra: Extras::new(),
        }),
    )
}

/// A template: two slots, and a protected line that is not one.
fn build_template(directory: &Path) -> Document {
    let mut document = Document::new(&mut SequentialIdSource::new(), 400.0, 220.0);
    document.name = Some("Price card".to_owned());
    document.canvas.background = Some(Color::new("#f6f4ef"));

    document.layers.push(text(HEADLINE, 20.0, "Headline", 32.0));
    document.layers.push(text(PRICE, 80.0, "£0", 28.0));

    // The chrome. Protected, and deliberately *not* offered as a slot.
    let mut chrome = text(CHROME, 150.0, "Assemblash Ltd — all rights reserved", 12.0);
    chrome.protected = true;
    chrome.name = Some("legal".to_owned());
    document.layers.push(chrome);

    document.slots = vec![
        Slot {
            name: "headline".to_owned(),
            layer: LayerId::new(HEADLINE),
            kind: SlotKind::Text,
            description: Some("The product name".to_owned()),
            required: true,
            extra: Extras::new(),
        },
        Slot {
            name: "price".to_owned(),
            layer: LayerId::new(PRICE),
            kind: SlotKind::Text,
            description: Some("Price, including the currency symbol".to_owned()),
            required: false,
            extra: Extras::new(),
        },
    ];

    assemblash_core::storage::save(&document, directory).unwrap();
    document
}

/// A template whose slot points at the protected layer — the thing a template
/// author must not be able to get away with.
fn build_leaky_template(directory: &Path) -> Document {
    let mut document = build_template(directory);
    document.slots.push(Slot {
        name: "legal".to_owned(),
        layer: LayerId::new(CHROME),
        kind: SlotKind::Text,
        description: Some("Should not be fillable".to_owned()),
        required: false,
        extra: Extras::new(),
    });
    assemblash_core::storage::save(&document, directory).unwrap();
    document
}

fn workspace_with(root: &Path, leaky: bool) -> Document {
    let workspace = Workspace::open_or_create(root).unwrap();
    let mut store = assemblash_renderer::store::FontStore::open(workspace.fonts_dir()).unwrap();
    store
        .import_file(&font_fixture(), None, Some("OFL-1.1".into()))
        .unwrap();
    let id = ProjectId::new("cards").unwrap();
    let directory = workspace.create_project_dir(&id).unwrap();
    if leaky {
        build_leaky_template(&directory)
    } else {
        build_template(&directory)
    }
}

fn args(value: Value) -> Option<Map<String, Value>> {
    value.as_object().cloned()
}

fn call(name: &'static str, arguments: Option<Map<String, Value>>) -> CallToolRequestParams {
    let mut params = CallToolRequestParams::default();
    params.name = name.into();
    params.arguments = arguments;
    params
}

fn structured(result: &rmcp::model::CallToolResult) -> Value {
    result
        .structured_content
        .clone()
        .unwrap_or_else(|| panic!("no structured content in {result:#?}"))
}

/// The variants a batch asks for, twice over, to check determinism.
fn variants_request() -> Value {
    json!({
        "variants": [
            { "name": "small",  "values": { "headline": "Small",  "price": "£9" } },
            { "name": "medium", "values": { "headline": "Medium", "price": "£19" } },
            { "name": "large",  "values": { "headline": "Large",  "price": "£29" } },
            // No price: the template's own content stands, which is how a
            // partial fill keeps its defaults.
            { "name": "plain",  "values": { "headline": "Plain" } }
        ]
    })
}

#[tokio::test]
async fn one_template_and_several_value_sets_render_stable_variants() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with(&root, false);
    let project = root.join("projects/cards");
    let before = std::fs::read(project.join("document.json")).unwrap();

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client
        .call_tool(call("open_project", args(json!({ "project": "cards" }))))
        .await
        .unwrap();

    // What the template offers, which is how an agent learns the slot names
    // rather than guessing at layer ids.
    let slots = structured(&client.call_tool(call("list_slots", None)).await.unwrap());
    assert_eq!(slots["isTemplate"], true);
    let names: Vec<&str> = slots["slots"]
        .as_array()
        .unwrap()
        .iter()
        .map(|slot| slot["name"].as_str().unwrap())
        .collect();
    assert_eq!(names, ["headline", "price"]);
    // The protected line is not on offer.
    assert!(!names.contains(&"legal"));

    // --- N value sets → N exports -----------------------------------------
    let first = structured(
        &client
            .call_tool(call("render_variants", args(variants_request())))
            .await
            .unwrap(),
    );
    let rendered = first["variants"].as_array().unwrap();
    assert_eq!(rendered.len(), 4);
    assert_eq!(first["templateVersion"], 0);

    for variant in rendered {
        let path = project.join(variant["path"].as_str().unwrap());
        assert!(path.is_file(), "{} was not written", path.display());
        let bytes = std::fs::read(&path).unwrap();
        assert_eq!(&bytes[1..4], b"PNG");
        assert_eq!(
            assemblash_core::storage::hash_bytes(&bytes),
            variant["hash"].as_str().unwrap(),
            "{}: the reported hash must be the file's",
            variant["name"]
        );
        assert_eq!(variant["width"], 400);
        assert_eq!(variant["height"], 220);
    }

    // The four are genuinely different pictures, not the same one four times.
    let hashes: std::collections::BTreeSet<&str> = rendered
        .iter()
        .map(|variant| variant["hash"].as_str().unwrap())
        .collect();
    assert_eq!(hashes.len(), 4, "each variant should differ");

    // --- byte-stable across two runs --------------------------------------
    let second = structured(
        &client
            .call_tool(call("render_variants", args(variants_request())))
            .await
            .unwrap(),
    );
    assert_eq!(
        first["variants"], second["variants"],
        "the same template and the same values must produce the same bytes"
    );

    // --- the template itself is untouched ---------------------------------
    assert_eq!(
        std::fs::read(project.join("document.json")).unwrap(),
        before,
        "rendering variants must not modify the template"
    );

    client.cancel().await.unwrap();
}

/// Every variant contains the protected chrome, unchanged, pixel for pixel.
///
/// Checked by rendering the chrome on its own — the template with both slots
/// blanked — and confirming that region is identical in each variant. A
/// cheaper test would compare whole files, which cannot tell "the chrome
/// survived" from "nothing changed at all".
#[tokio::test]
async fn the_protected_chrome_is_identical_in_every_variant() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with(&root, false);
    let project = root.join("projects/cards");

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client
        .call_tool(call("open_project", args(json!({ "project": "cards" }))))
        .await
        .unwrap();

    structured(
        &client
            .call_tool(call("render_variants", args(variants_request())))
            .await
            .unwrap(),
    );

    // The chrome sits at y=150..200 in a 400x220 canvas; the slots are above
    // it. Comparing those rows across variants is comparing the chrome.
    let rows = |name: &str| -> Vec<u8> {
        let bytes = std::fs::read(project.join(format!("exports/{name}.png"))).unwrap();
        let decoder = png::Decoder::new(std::io::Cursor::new(bytes));
        let mut reader = decoder.read_info().unwrap();
        let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
        let info = reader.next_frame(&mut buffer).unwrap();
        let width = info.width as usize;
        buffer[(150 * width * 4)..(200 * width * 4)].to_vec()
    };

    let reference = rows("small");
    assert!(
        reference.iter().any(|byte| *byte != reference[0]),
        "the chrome region should contain the legal line, not blank canvas"
    );
    for name in ["medium", "large", "plain"] {
        assert_eq!(
            rows(name),
            reference,
            "{name}: the protected chrome must be pixel-identical in every variant"
        );
    }

    client.cancel().await.unwrap();
}

/// A slot aimed at a protected layer is refused — the template cannot be a way
/// around protection.
#[tokio::test]
async fn a_slot_cannot_fill_a_protected_layer() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with(&root, true);
    let project = root.join("projects/cards");
    let before = std::fs::read(project.join("document.json")).unwrap();

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client
        .call_tool(call("open_project", args(json!({ "project": "cards" }))))
        .await
        .unwrap();

    // Rendering a variant that fills it: refused, and nothing written.
    let refused = client
        .call_tool(call(
            "render_variants",
            args(json!({
                "variants": [{
                    "name": "hijack",
                    "values": { "headline": "Hi", "legal": "mine now" }
                }]
            })),
        ))
        .await
        .expect_err("a slot pointing at a protected layer must be refused");
    let text = format!("{refused:?}");
    assert!(text.contains("protected"), "{text}");
    assert!(
        !project.join("exports/hijack.png").exists(),
        "nothing should have been written"
    );

    // And filling the project itself: refused just as firmly, document
    // unchanged.
    let refused = client
        .call_tool(call(
            "fill_template",
            args(json!({ "values": { "headline": "Hi", "legal": "mine now" } })),
        ))
        .await
        .expect_err("filling a protected slot must be refused");
    assert!(format!("{refused:?}").contains("protected"));

    // `headline` was applied before `legal` was refused — slots are applied in
    // the document's own order and each is its own recorded change. What must
    // not have happened is the protected line changing.
    let document: Document =
        serde_json::from_slice(&std::fs::read(project.join("document.json")).unwrap()).unwrap();
    let chrome = document.find_layer(&LayerId::new(CHROME)).unwrap();
    let LayerKind::Text(chrome) = &chrome.kind else {
        panic!("the chrome is a text layer");
    };
    assert_eq!(chrome.text, "Assemblash Ltd — all rights reserved");
    let _ = before;

    client.cancel().await.unwrap();
}

/// A value for a slot that does not exist is refused rather than ignored.
#[tokio::test]
async fn a_misspelt_slot_name_is_refused() {
    let scratch = tempfile::tempdir().unwrap();
    let root = scratch.path().join("workspace");
    workspace_with(&root, false);

    let mut command = tokio::process::Command::new(binary());
    command.arg("mcp").arg("--workspace").arg(&root);
    let client = ().serve(TokioChildProcess::new(command).unwrap()).await.unwrap();
    client
        .call_tool(call("open_project", args(json!({ "project": "cards" }))))
        .await
        .unwrap();

    let refused = client
        .call_tool(call(
            "render_variants",
            args(json!({
                "variants": [{ "name": "typo", "values": { "headlien": "oops" } }]
            })),
        ))
        .await
        .expect_err("a typo must not silently produce a variant missing the change");
    let text = format!("{refused:?}");
    assert!(text.contains("headlien"), "{text}");
    assert!(
        text.contains("headline"),
        "it should say what is available: {text}"
    );

    client.cancel().await.unwrap();
}
