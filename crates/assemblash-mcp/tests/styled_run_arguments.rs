//! Raw transport values stay unchanged before shared operation validation.
#![allow(clippy::unwrap_used)]
use assemblash_mcp::write_tools::{AddTextArgs, UpdateArgs};
use serde_json::json;

#[test]
fn raw_runs_keep_extras_and_distinct_outer_null_rules() {
    let runs = json!([{"text":"A","color":null,"fontSize":null,"future":{"keep":[1,2]}}]);
    let create = json!({"text":"A","fontFamily":"Noto Sans","fontSize":32,"x":0,"y":0,"width":300,"height":100,"runs":runs});
    let args: AddTextArgs = serde_json::from_value(create.clone()).unwrap();
    assert_eq!(args.runs, runs.as_array().unwrap().clone());
    let mut null_create = create;
    null_create["runs"] = serde_json::Value::Null;
    assert!(serde_json::from_value::<AddTextArgs>(null_create).is_err());
    let update: UpdateArgs =
        serde_json::from_value(json!({"layerId":"layer_text","runs":runs})).unwrap();
    assert_eq!(update.runs.unwrap(), runs.as_array().unwrap().clone());
    let null_update: UpdateArgs =
        serde_json::from_value(json!({"layerId":"layer_text","runs":null})).unwrap();
    assert!(null_update.runs.is_none());
    let empty: UpdateArgs =
        serde_json::from_value(json!({"layerId":"layer_text","runs":[]})).unwrap();
    assert_eq!(empty.runs, Some(vec![]));
    let schema = serde_json::to_value(schemars::schema_for!(AddTextArgs)).unwrap();
    assert!(schema.to_string().contains("TextRunInput"));
    assert!(schema.to_string().contains("letterSpacing"));
}
