//! Typed interpretation of raw text runs. Storage retains the original JSON values.
//!
//! Each run requires a `text` string. Optional properties are `fontFamily`, `fontSize`,
//! `color`, `fontWeight`, `fontStyle`, and `letterSpacing`.
//! Omission inherits the base value. Null color removes the fill.
//! Other optional null properties inherit the base value.
//! Unknown properties remain in the raw values.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

use crate::{Color, FontStyle, TextLayer};

/// Supported properties for newly supplied runs. Storage remains arbitrary JSON.
/// Omitted properties inherit. Null color removes fill; other optional null properties inherit.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct TextRunInput {
    /// Required text. Nonempty run lists concatenate exactly to the authoritative text.
    pub text: String,
    /// Family override. Omission or null inherits the base family.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// Positive finite size in pixels. Omission or null inherits the base size.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[schemars(extend("exclusiveMinimum" = 0))]
    pub font_size: Option<f64>,
    /// Fill override. Omission inherits; explicit null means no fill.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        deserialize_with = "input_color"
    )]
    pub color: Option<Option<Color>>,
    /// Integer weight from 100 through 900. Omission or null inherits.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[schemars(range(min = 100, max = 900))]
    pub font_weight: Option<u16>,
    /// Normal or italic. Omission or null inherits the base style.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_style: Option<FontStyle>,
    /// Finite spacing in pixels, including negative values. Omission or null inherits.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub letter_spacing: Option<f64>,
    /// Unknown properties retained in the original raw run values.
    #[serde(flatten)]
    pub extra: crate::Extras,
}

fn input_color<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<Option<Color>>, D::Error> {
    Option::<Color>::deserialize(deserializer).map(Some)
}

/// One run with effective properties and original text indices.
#[derive(Debug, Clone, PartialEq)]
pub struct TextRun<'a> {
    /// Text in this run.
    pub text: &'a str,
    /// Effective font family.
    pub font_family: &'a str,
    /// Effective font size in pixels.
    pub font_size: f64,
    /// Effective fill. `None` means no fill.
    pub color: Option<Color>,
    /// Effective font weight.
    pub font_weight: u16,
    /// Effective font style.
    pub font_style: FontStyle,
    /// Effective letter spacing in pixels.
    pub letter_spacing: f64,
    /// Index in the stored run array, starting at zero.
    pub run_index: usize,
    /// Unicode scalar index at the start of this run.
    pub character_index: usize,
    /// UTF-8 byte index at the start of this run.
    pub byte_index: usize,
}

/// A raw run cannot be interpreted. Loading the raw value remains supported.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("run {run_index} at character {character_index} (byte {byte_index}), {field}: {reason}")]
#[non_exhaustive]
pub struct TextRunError {
    /// Index in the stored run array, starting at zero.
    pub run_index: usize,
    /// Unicode scalar index in the concatenated run text.
    pub character_index: usize,
    /// UTF-8 byte index in the concatenated run text.
    pub byte_index: usize,
    /// Known property that cannot be interpreted, or `run` for a non-object.
    pub field: &'static str,
    /// Specific reason for the refusal.
    pub reason: String,
}

fn optional<'a>(object: &'a Map<String, Value>, field: &str) -> Option<&'a Value> {
    object.get(field).filter(|value| !value.is_null())
}

impl TextLayer {
    /// Interpret runs without changing raw values or unknown properties.
    ///
    /// Omitted overrides inherit base properties. Null color means no fill.
    /// Other optional null overrides inherit. Empty runs use the plain text path.
    /// Nonempty runs must concatenate exactly to the authoritative text.
    /// This method is not called during document loading or ordinary validation.
    ///
    /// ```
    /// # use assemblash_core::{TextLayer, TextRunError};
    /// fn run_text(layer: &TextLayer) -> Result<Vec<&str>, TextRunError> {
    ///     Ok(layer.interpreted_runs()?.iter().map(|run| run.text).collect())
    /// }
    /// ```
    pub fn interpreted_runs(&self) -> Result<Vec<TextRun<'_>>, TextRunError> {
        let mut runs = Vec::new();
        let mut character_index = 0;
        let mut byte_index = 0;
        for (run_index, raw) in self.runs.iter().enumerate() {
            let error = |field, reason: String| TextRunError {
                run_index,
                character_index,
                byte_index,
                field,
                reason,
            };
            let object = raw
                .as_object()
                .ok_or_else(|| error("run", "expected an object".into()))?;
            let text = object
                .get("text")
                .and_then(Value::as_str)
                .ok_or_else(|| error("text", "expected a string".into()))?;
            let font_family = match optional(object, "fontFamily") {
                None => self.font_family.as_str(),
                Some(value) => value
                    .as_str()
                    .ok_or_else(|| error("fontFamily", "expected a string".into()))?,
            };
            let number = |field, default: f64| -> Result<f64, TextRunError> {
                match optional(object, field) {
                    None => Ok(default),
                    Some(value) => value
                        .as_f64()
                        .filter(|value| value.is_finite())
                        .ok_or_else(|| error(field, "expected a finite number".into())),
                }
            };
            let font_size = number("fontSize", self.font_size)?;
            if font_size <= 0.0 {
                return Err(error(
                    "fontSize",
                    "expected a number greater than zero".into(),
                ));
            }
            let font_weight = match optional(object, "fontWeight") {
                None => self.font_weight,
                Some(value) => value
                    .as_u64()
                    .filter(|value| (100..=900).contains(value))
                    .map(|value| value as u16)
                    .ok_or_else(|| {
                        error("fontWeight", "expected an integer from 100 to 900".into())
                    })?,
            };
            let font_style = match optional(object, "fontStyle") {
                None => self.font_style,
                Some(value) => serde_json::from_value(value.clone())
                    .map_err(|_| error("fontStyle", "expected normal or italic".into()))?,
            };
            let letter_spacing = number("letterSpacing", self.letter_spacing)?;
            let color = match object.get("color") {
                None => self.color.clone(),
                Some(Value::Null) => None,
                Some(value) => Some(
                    serde_json::from_value::<Color>(value.clone())
                        .map_err(|reason| error("color", reason.to_string()))?,
                ),
            };
            if let Some(color) = &color {
                if let Color::Other(other) = color {
                    return Err(error(
                        "color",
                        format!("unsupported paint kind {:?}", other.kind),
                    ));
                }
                let mut errors = Vec::new();
                crate::validate::check_color(color, "run color", &mut errors);
                if let Some(reason) = errors.first() {
                    return Err(error("color", reason.to_string()));
                }
            }
            if !self
                .text
                .get(byte_index..)
                .is_some_and(|remaining| remaining.starts_with(text))
            {
                return Err(error(
                    "text",
                    "run text does not match authoritative text".into(),
                ));
            }
            runs.push(TextRun {
                text,
                font_family,
                font_size,
                color,
                font_weight,
                font_style,
                letter_spacing,
                run_index,
                character_index,
                byte_index,
            });
            character_index += text.chars().count();
            byte_index += text.len();
        }
        if !runs.is_empty() && byte_index != self.text.len() {
            return Err(TextRunError {
                run_index: runs.len() - 1,
                character_index,
                byte_index,
                field: "text",
                reason: "run text does not cover authoritative text".into(),
            });
        }
        Ok(runs)
    }
}
