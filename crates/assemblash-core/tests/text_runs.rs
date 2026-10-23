//! Raw storage compatibility and real session operations for typed text runs.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::{fs, path::Path};

use assemblash_core::{
    history::{HISTORY_DIR, JOURNAL_FILE},
    ops::{check_properties, OpError, Operation},
    storage::DOCUMENT_FILE,
    templates::fill_operations,
    Actor, ActorKind, Color, Document, FontStyle, LayerId, LayerKind, SequentialIdSource, Session,
    SessionError, TextLayer,
};
use serde_json::{json, Value};

fn operation(value: Value) -> Operation {
    check_properties(&value).expect("accepted shared request property");
    serde_json::from_value(value).expect("serialized operation")
}

fn create(runs: Value) -> Operation {
    operation(json!({"op":"create","type":"text","text":"éx",
        "fontFamily":"Base","fontSize":20,"color":"#102030",
        "transform":{"x":0,"y":0,"width":200,"height":80,"rotation":0},"runs":runs}))
}

fn supported() -> Value {
    json!([{"text":"é","future":{"nested":[null,4,{"keep":true}]}},
        {"text":"x","fontFamily":"Other","fontSize":32,"fontWeight":700,
         "fontStyle":"italic","color":null,"letterSpacing":-2,"future":[1,2]}])
}

fn legacy() -> Value {
    json!([17,null,["future"],{"text":false,"fontSize":"future","nested":{"keep":[3,4]}}])
}

fn actor() -> Actor {
    Actor::named(ActorKind::Agent, "core-test")
}

fn text(document: &Document) -> &TextLayer {
    match &document.layers[0].kind {
        LayerKind::Text(text) => text,
        _ => panic!("text fixture"),
    }
}

fn text_mut(document: &mut Document) -> &mut TextLayer {
    match &mut document.layers[0].kind {
        LayerKind::Text(text) => text,
        _ => panic!("text fixture"),
    }
}

fn fixture(runs: Value) -> (Document, SequentialIdSource) {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 400.0, 220.0);
    assemblash_core::apply(&mut document, &create(json!([])), &mut ids).unwrap();
    text_mut(&mut document).runs = runs.as_array().unwrap().clone();
    (document, ids)
}

struct Project {
    directory: tempfile::TempDir,
    session: Session,
    ids: SequentialIdSource,
}

impl Project {
    fn new(runs: Value) -> Self {
        let (document, ids) = fixture(runs);
        Self::with_document(document, ids)
    }

    fn with_document(document: Document, ids: SequentialIdSource) -> Self {
        let directory = tempfile::tempdir().unwrap();
        let session = Session::create(directory.path(), document, Some(1)).unwrap();
        Self {
            directory,
            session,
            ids,
        }
    }

    fn id(&self) -> LayerId {
        self.session.document().layers[0].id.clone()
    }

    fn update(&self, fields: Value) -> Operation {
        let mut value = fields.as_object().unwrap().clone();
        value.insert("op".into(), json!("update"));
        value.insert("id".into(), json!(self.id()));
        operation(value.into())
    }

    fn apply(&mut self, operation: &Operation) -> Result<(), SessionError> {
        let version = self.session.document().version;
        self.session
            .apply(operation, &actor(), Some(2), Some(version), &mut self.ids)
            .map(|_| ())
    }

    fn persisted(&self) -> (Vec<u8>, Option<Vec<u8>>) {
        (
            fs::read(self.directory.path().join(DOCUMENT_FILE)).unwrap(),
            match fs::read(self.directory.path().join(HISTORY_DIR).join(JOURNAL_FILE)) {
                Ok(bytes) => Some(bytes),
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => None,
                Err(error) => panic!("read journal: {error}"),
            },
        )
    }

    fn undo(&mut self) {
        self.session.undo(&actor(), Some(3), &mut self.ids).unwrap();
    }

    fn redo(&mut self) {
        self.session.redo(&actor(), Some(4), &mut self.ids).unwrap();
    }
}

#[test]
fn typed_view_inherits_nulls_and_preserves_original_values() {
    let (mut document, _) = fixture(supported());
    let raw = json!([{"text":"é","fontFamily":null,"fontSize":null,"fontWeight":null,
        "fontStyle":null,"letterSpacing":null,"unknown":{"values":[1,null]}},
        supported()[1].clone()]);
    text_mut(&mut document).runs = raw.as_array().unwrap().clone();
    let before = serde_json::to_vec(&document).unwrap();
    let runs = text(&document).interpreted_runs().unwrap();
    assert_eq!(
        (runs[0].font_family, runs[0].font_size, runs[0].font_weight),
        ("Base", 20.0, 400)
    );
    assert_eq!(runs[0].color, Some(Color::new("#102030")));
    assert_eq!(
        (runs[1].font_family, runs[1].font_size, runs[1].font_weight),
        ("Other", 32.0, 700)
    );
    assert_eq!(runs[1].font_style, FontStyle::Italic);
    assert_eq!(runs[1].letter_spacing, -2.0);
    assert!(runs[1].color.is_none());
    assert_eq!(
        (
            runs[1].run_index,
            runs[1].character_index,
            runs[1].byte_index
        ),
        (1, 1, 2)
    );
    assert_eq!(serde_json::to_vec(&document).unwrap(), before);
    text_mut(&mut document).runs.clear();
    assert!(text(&document).interpreted_runs().unwrap().is_empty());
}

#[test]
fn invalid_known_values_refuse_only_interpretation_with_source_indices() {
    for (field, value) in [
        ("fontFamily", json!(7)),
        ("fontSize", json!(0)),
        ("fontSize", json!("large")),
        ("fontWeight", json!(99)),
        ("fontWeight", json!(400.5)),
        ("fontWeight", json!(901)),
        ("fontStyle", json!("future")),
        ("letterSpacing", json!("wide")),
        ("color", json!(false)),
        ("color", json!("red")),
        ("color", json!({"kind":"future","unknown":{"keep":true}})),
        ("color", json!({"kind":"linear","angle":0,"stops":[]})),
        ("text", json!(null)),
    ] {
        let mut run = json!({"text":"x"});
        run[field] = value;
        let (document, _) = fixture(json!([{"text":"é"},run]));
        assemblash_core::validate(&document)
            .expect("legacy runs do not affect ordinary validation");
        let error = text(&document)
            .interpreted_runs()
            .expect_err("unsupported known value");
        assert_eq!(
            (
                error.run_index,
                error.character_index,
                error.byte_index,
                error.field
            ),
            (1, 1, 2, field)
        );
    }
    let (document, _) = fixture(legacy());
    let error = text(&document).interpreted_runs().unwrap_err();
    assert_eq!((error.run_index, error.field), (0, "run"));
}

#[test]
fn serialized_creation_persists_raw_fields_and_replays_history() {
    let directory = tempfile::tempdir().unwrap();
    let mut ids = SequentialIdSource::new();
    let mut session = Session::create(
        directory.path(),
        Document::new(&mut ids, 400.0, 220.0),
        Some(1),
    )
    .unwrap();
    let before = fs::read(directory.path().join(DOCUMENT_FILE)).unwrap();
    session
        .apply(&create(supported()), &actor(), Some(2), Some(0), &mut ids)
        .unwrap();
    assert_eq!(json!(text(session.document()).runs), supported());
    assert_eq!(session.document().schema_version, 1);
    let after = fs::read(directory.path().join(DOCUMENT_FILE)).unwrap();
    session.undo(&actor(), Some(3), &mut ids).unwrap();
    assert_eq!(
        fs::read(directory.path().join(DOCUMENT_FILE)).unwrap(),
        before
    );
    session.redo(&actor(), Some(4), &mut ids).unwrap();
    assert_eq!(
        fs::read(directory.path().join(DOCUMENT_FILE)).unwrap(),
        after
    );
    drop(session);
    let session = Session::open(directory.path(), Some(5)).unwrap();
    assert_eq!(json!(text(session.document()).runs), supported());
    assert_eq!(
        fs::read(directory.path().join(DOCUMENT_FILE)).unwrap(),
        after
    );
}

#[test]
fn creation_refuses_unsupported_runs_and_accepts_empty_text_runs() {
    let mut project = Project::new(supported());
    let before = project.persisted();
    let error = project.apply(&create(legacy())).unwrap_err();
    assert!(matches!(
        error,
        SessionError::Operation(OpError::TextRuns { id: None, .. })
    ));
    assert_eq!(project.persisted(), before);
    for runs in [json!([]), json!([{"text":""}])] {
        let mut empty = serde_json::to_value(create(runs)).unwrap();
        empty["text"] = json!("");
        project.apply(&operation(empty)).unwrap();
    }
    assert_eq!(project.session.document().layers.len(), 3);
}

#[test]
fn raw_legacy_runs_load_and_survive_base_and_preset_updates() {
    let mut project = Project::new(legacy());
    let original = project.persisted().0;
    let raw = text(project.session.document()).runs.clone();
    project
        .apply(&project.update(json!({"fontSize":30,"color":"#abcdef"})))
        .unwrap();
    assert_eq!(text(project.session.document()).runs, raw);
    project.undo();
    assert_eq!(project.persisted().0, original);
    project.redo();
    project
        .apply(&operation(
            json!({"op":"definePreset","preset":{"name":"base","properties":{
        "fontSize":28,"color":"#123456","runs":[{"text":"never applied"}]}}}),
        ))
        .unwrap();
    project
        .apply(&operation(
            json!({"op":"applyPreset","preset":"base","id":project.id()}),
        ))
        .unwrap();
    assert_eq!(text(project.session.document()).runs, raw);
    let update = project.session.document().presets[0]
        .properties
        .update_for(project.id(), false);
    assert!(update.runs.is_none());
    let path = project.directory.path().to_owned();
    drop(project.session);
    let reopened = Session::open(&path, Some(5)).unwrap();
    assert_eq!(text(reopened.document()).runs, raw);
    assert!(text(reopened.document()).interpreted_runs().is_err());
    let loaded = assemblash_core::load(&path).unwrap();
    assert_eq!(text(&loaded).runs, raw);
}

#[test]
fn text_and_run_writes_follow_authoritative_atomic_rules() {
    let mut project = Project::new(supported());
    let original = project.persisted();
    let mismatch = project.update(json!({"runs":[{"text":"wrong"}]}));
    assert!(matches!(
        project.apply(&mismatch),
        Err(SessionError::Operation(OpError::TextRuns { .. }))
    ));
    assert_eq!(project.persisted(), original);
    project
        .apply(&project.update(json!({"text":"éx"})))
        .unwrap();
    assert!(
        text(project.session.document()).runs.is_empty(),
        "unchanged supplied text clears runs"
    );
    project.undo();
    assert_eq!(project.persisted().0, original.0);
    project
        .apply(&project.update(json!({"text":"new","runs":[]})))
        .unwrap();
    assert_eq!(text(project.session.document()).text, "new");
    assert!(text(project.session.document()).runs.is_empty());
    project
        .apply(
            &project.update(
                json!({"text":"atomic","runs":[{"text":"atom"},{"text":"ic","fontSize":42}]}),
            ),
        )
        .unwrap();
    assert_eq!(text(project.session.document()).text, "atomic");
    assert_eq!(
        text(project.session.document())
            .interpreted_runs()
            .unwrap()
            .len(),
        2
    );
    let before = project.persisted();
    assert!(project
        .apply(&project.update(json!({"text":"other","fontSize":55,"runs":[{"text":"different"}]})))
        .is_err());
    assert_eq!(project.persisted(), before);
    project.apply(&project.update(json!({"runs":[]}))).unwrap();
    assert_eq!(text(project.session.document()).text, "atomic");
    assert!(text(project.session.document()).runs.is_empty());
}

#[test]
fn text_only_clear_restores_unsupported_raw_runs_through_replay_and_reopen() {
    let mut project = Project::new(legacy());
    // Position one has a snapshot. Position two must replay the text-only write.
    project
        .apply(&project.update(json!({"fontSize":30})))
        .unwrap();
    let before = project.persisted().0;
    project
        .apply(&project.update(json!({"text":"éx"})))
        .unwrap();
    assert!(text(project.session.document()).runs.is_empty());
    let after = project.persisted().0;
    project.undo();
    assert_eq!(project.persisted().0, before);
    assert_eq!(json!(text(project.session.document()).runs), legacy());
    project.redo();
    assert_eq!(project.persisted().0, after);
    let path = project.directory.path().to_owned();
    drop(project.session);
    let mut reopened = Session::open(&path, Some(5)).unwrap();
    assert!(text(reopened.document()).runs.is_empty());
    reopened.undo(&actor(), Some(6), &mut project.ids).unwrap();
    assert_eq!(json!(text(reopened.document()).runs), legacy());
    assert_eq!(fs::read(path.join(DOCUMENT_FILE)).unwrap(), before);
}

#[test]
fn dry_run_stale_and_batch_refusals_leave_persisted_bytes_unchanged() {
    let mut project = Project::new(supported());
    let before = project.persisted();
    let update = project.update(json!({"runs":[]}));
    project
        .session
        .dry_run(&update, Some(0), &mut project.ids)
        .unwrap();
    assert_eq!(project.persisted(), before);
    let invalid = project.update(json!({"runs":[{"text":"éx","fontSize":0}]}));
    assert!(matches!(
        project.session.dry_run(&invalid, Some(0), &mut project.ids),
        Err(SessionError::Operation(OpError::TextRuns { .. }))
    ));
    assert_eq!(project.persisted(), before);
    assert!(matches!(
        project
            .session
            .apply(&update, &actor(), Some(2), Some(99), &mut project.ids),
        Err(SessionError::VersionConflict { .. })
    ));
    assert_eq!(project.persisted(), before);
    let operations = [
        project.update(json!({"color":"#fedcba"})),
        project.update(json!({"runs":[{"text":"mismatch"}]})),
    ];
    assert!(project
        .session
        .apply_batch(
            "atomic",
            &operations,
            &actor(),
            Some(2),
            Some(0),
            &mut project.ids
        )
        .is_err());
    assert_eq!(project.persisted(), before);
    assert_eq!(json!(text(project.session.document()).runs), supported());
}

#[test]
fn guards_and_wrong_layer_checks_cover_explicit_empty_runs() {
    for guard in ["locked", "protected", "readOnly"] {
        let (document, ids) = fixture(legacy());
        let mut value = serde_json::to_value(document).unwrap();
        value["layers"][0][guard] = json!(true);
        let mut project = Project::with_document(serde_json::from_value(value).unwrap(), ids);
        let before = project.persisted();
        assert!(
            project.apply(&project.update(json!({"runs":[]}))).is_err(),
            "{guard}"
        );
        assert_eq!(project.persisted(), before);
    }
    let mut project = Project::new(json!([]));
    project
        .apply(&operation(
            json!({"op":"create","type":"group","transform":{
        "x":0,"y":0,"width":200,"height":80,"rotation":0}}),
        ))
        .unwrap();
    let group = project.session.document().layers[1].id.clone();
    let before = project.persisted();
    let error = project
        .apply(&operation(json!({"op":"update","id":group,"runs":[]})))
        .unwrap_err();
    assert!(error.to_string().contains("runs"));
    assert_eq!(project.persisted(), before);
}

#[test]
fn text_and_color_slots_clear_legacy_runs_with_exact_undo() {
    for kind in ["text", "color"] {
        let mut project = Project::new(legacy());
        project
            .apply(&operation(json!({"op":"defineSlot","slot":{
            "name":"value","layer":project.id(),"kind":kind,"required":true}})))
            .unwrap();
        let before = project.persisted().0;
        let value = if kind == "text" {
            "replacement"
        } else {
            "#aabbcc"
        };
        let operations = fill_operations(
            project.session.document(),
            &[("value".into(), value.into())].into(),
        )
        .unwrap();
        project
            .session
            .apply_batch(
                "fill",
                &operations,
                &actor(),
                Some(2),
                None,
                &mut project.ids,
            )
            .unwrap();
        assert!(text(project.session.document()).runs.is_empty());
        if kind == "text" {
            assert_eq!(text(project.session.document()).text, value);
        } else {
            assert_eq!(
                text(project.session.document()).color,
                Some(Color::new(value))
            );
        }
        project.undo();
        assert_eq!(project.persisted().0, before);
        assert_eq!(json!(text(project.session.document()).runs), legacy());
        project.redo();
        assert!(text(project.session.document()).runs.is_empty());
    }
}

#[test]
fn nested_paint_fields_survive_interpretation_updates_and_history() {
    let gradient = json!({"kind":"linear","angle":45,"future":{"a":[1,2]},"stops":[
        {"offset":0,"color":"#001122","alpha":1,"future":{"b":true}},
        {"offset":1,"color":"#aabbcc","alpha":1}]});
    let runs = json!([{"text":"éx","color":gradient,"unknown":{"keep":[null,1]}}]);
    let mut project = Project::new(json!([]));
    let before = project.persisted().0;
    project
        .apply(&project.update(json!({"runs":runs})))
        .unwrap();
    text(project.session.document()).interpreted_runs().unwrap();
    assert_eq!(json!(text(project.session.document()).runs), runs);
    let after = project.persisted().0;
    project.undo();
    assert_eq!(project.persisted().0, before);
    project.redo();
    assert_eq!(project.persisted().0, after);
    assert_eq!(json!(text(project.session.document()).runs), runs);
    assert!(Path::new(&project.directory.path().join(DOCUMENT_FILE)).is_file());
}

#[test]
fn new_request_schema_exposes_supported_inputs_without_restricting_document_storage() {
    let schema: Value =
        serde_json::from_str(&assemblash_core::schema::operation_schema_json()).unwrap();
    let input = &schema["$defs"]["TextRunInput"];
    assert_eq!(input["required"], json!(["text"]));
    for property in [
        "text",
        "fontFamily",
        "fontSize",
        "color",
        "fontWeight",
        "fontStyle",
        "letterSpacing",
    ] {
        assert!(
            input["properties"][property].is_object(),
            "{property} is discoverable"
        );
    }
    assert_eq!(input["properties"]["fontSize"]["exclusiveMinimum"], 0);
    assert_eq!(input["properties"]["fontWeight"]["minimum"], 100);
    assert_eq!(input["properties"]["fontWeight"]["maximum"], 900);
    assert_ne!(input["additionalProperties"], json!(false));
    let document: Value =
        serde_json::from_str(&assemblash_core::schema::document_schema_json()).unwrap();
    assert_eq!(
        document["$defs"]["TextLayer"]["properties"]["runs"]["items"],
        true
    );
    let declarations = assemblash_core::typescript::operation_types();
    assert!(declarations.contains("export type TextRunInput"));
    assert!(declarations.contains("runs?: TextRunInput[]"));
    let null: assemblash_core::TextRunInput =
        serde_json::from_value(json!({"text":"x","color":null,
        "fontFamily":null,"fontSize":null,"fontWeight":null,"fontStyle":null,"letterSpacing":null,
        "future":{"keep":[1,null]}}))
        .unwrap();
    assert_eq!(null.color, Some(None));
    assert_eq!(null.extra["future"], json!({"keep":[1,null]}));
    let omitted: assemblash_core::TextRunInput =
        serde_json::from_value(json!({"text":"x"})).unwrap();
    assert_eq!(omitted.color, None);
}
