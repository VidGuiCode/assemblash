//! Generators: charts, tables and QR codes as sanitised SVG.
//!
//! A generator turns a spec into SVG bytes. The engine imports those bytes
//! as an ordinary `svg` asset, so the renderer does not know that charts
//! exist. The spec is recorded on the layer, so the layer can be made again
//! from the same data, for example with another chart type.
//!
//! Equal input gives equal bytes on every release target:
//!
//! * every number is written with at most two decimals, from integer
//!   arithmetic on the rounded value;
//! * sine and cosine come from [`math`], which uses only `+`, `-`, `*` and
//!   `/`, not the platform maths library;
//! * labels are glyph outlines from the face the caller gives, so the asset
//!   holds no `<text>` and needs no font when it is drawn.
//!
//! The face is part of the input. The engine reads it from the pinned font
//! store and records its sha256 next to the spec.

mod chart;
mod csv;
mod error;
pub mod math;
mod outline;
mod qr;
mod svg;
mod table;

pub use chart::{ChartAxis, ChartSeries, ChartSpec, ChartType};
pub use csv::parse_csv;
pub use error::GenerateError;
pub use outline::Face;
pub use qr::{QrErrorCorrection, QrSpec};
pub use table::{TableBorder, TableCellStyle, TableMerge, TableSpec, TextAlignment};

/// The family a spec draws its labels with when it names none.
pub const DEFAULT_FONT_FAMILY: &str = "Noto Sans";

/// One spec of any kind, tagged by `kind` in JSON.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum GeneratedSpec {
    /// A chart.
    Chart(ChartSpec),
    /// A table.
    Table(TableSpec),
    /// A QR code.
    Qr(QrSpec),
}

impl GeneratedSpec {
    /// The kind, as written in JSON: `chart`, `table` or `qr`.
    pub fn kind(&self) -> &'static str {
        match self {
            Self::Chart(_) => "chart",
            Self::Table(_) => "table",
            Self::Qr(_) => "qr",
        }
    }

    /// The reserved layer metadata key the spec is recorded under.
    pub fn meta_key(&self) -> &'static str {
        match self {
            Self::Chart(_) => "assemblash.chart",
            Self::Table(_) => "assemblash.table",
            Self::Qr(_) => "assemblash.qr",
        }
    }

    /// The family the labels need, or `None` for a QR code, which has no
    /// labels.
    pub fn font_family(&self) -> Option<&str> {
        match self {
            Self::Chart(spec) => Some(spec.font_family()),
            Self::Table(spec) => Some(spec.font_family()),
            Self::Qr(_) => None,
        }
    }

    /// Makes the SVG. `face` is required when [`Self::font_family`] is
    /// `Some`.
    pub fn to_svg(&self, face: Option<&Face<'_>>) -> Result<Generated, GenerateError> {
        match self {
            Self::Chart(spec) => chart::render(spec, face.ok_or(GenerateError::NoFace)?),
            Self::Table(spec) => table::render(spec, face.ok_or(GenerateError::NoFace)?),
            Self::Qr(spec) => qr::render(spec),
        }
    }
}

/// What a generator made.
#[derive(Debug, Clone, PartialEq)]
pub struct Generated {
    /// The SVG document, UTF-8.
    pub svg: String,
    /// Its width, in CSS pixels.
    pub width: f64,
    /// Its height, in CSS pixels.
    pub height: f64,
}
