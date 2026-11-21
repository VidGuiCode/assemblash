//! Tables: rows of text cells with borders, fills, merges and per-cell
//! styles.
//!
//! Each cell holds one line. A line break in a cell is drawn as a space. A
//! label wider than its cell is clipped at the cell edge. The height of the
//! graphic follows from the number of rows and the font size.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use super::chart::size_in_range;
use super::outline::{Anchor, Outliner};
use super::svg::{color, num, SvgWriter};
use super::{Face, GenerateError, Generated, DEFAULT_FONT_FAMILY};

/// Horizontal alignment of a cell's text.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TextAlignment {
    /// From the left edge.
    #[default]
    Left,
    /// In the middle.
    Center,
    /// To the right edge.
    Right,
}

/// The lines around cells.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TableBorder {
    /// The line colour. Default `#cccccc`.
    #[serde(default = "default_border_color")]
    pub color: String,
    /// The line width in pixels; 0 draws no lines. Default 1.
    #[serde(default = "default_border_width")]
    pub width: f64,
}

impl Default for TableBorder {
    fn default() -> Self {
        Self {
            color: default_border_color(),
            width: default_border_width(),
        }
    }
}

/// A rectangle of cells drawn as one cell. The text of the top-left cell is
/// the text of the merged cell; the text of the other cells is not drawn.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TableMerge {
    /// Top row, from 0.
    pub row: usize,
    /// Left column, from 0.
    pub col: usize,
    /// Number of rows, at least 1.
    #[serde(default = "one")]
    pub row_span: usize,
    /// Number of columns, at least 1.
    #[serde(default = "one")]
    pub col_span: usize,
}

/// A style for one cell. Each field overrides the table's own.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TableCellStyle {
    /// Row, from 0.
    pub row: usize,
    /// Column, from 0.
    pub col: usize,
    /// Background fill.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fill: Option<String>,
    /// Text colour.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    /// Text alignment.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub align: Option<TextAlignment>,
}

/// A table spec.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TableSpec {
    /// The rows; every row has the same number of cells.
    pub rows: Vec<Vec<String>>,
    /// Width of the generated graphic, in pixels. Default 600.
    #[serde(default = "default_width")]
    pub width: f64,
    /// Whether the first row is a header. Default true.
    #[serde(default = "yes")]
    pub header: bool,
    /// Relative column widths. Equal widths when absent.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub column_widths: Vec<f64>,
    /// The family for cell text. Default `Noto Sans`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// Text size in pixels. Default 14.
    #[serde(default = "default_font_size")]
    pub font_size: f64,
    /// Space between a cell edge and its text, in pixels. Default 8.
    #[serde(default = "default_padding")]
    pub padding: f64,
    /// Cell borders.
    #[serde(default)]
    pub border: TableBorder,
    /// Fill of the header row. Default `#f0f0f0`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub header_fill: Option<String>,
    /// Fill of every other cell. Transparent when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fill: Option<String>,
    /// Fill of every second body row, for stripes.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub stripe_fill: Option<String>,
    /// Text colour. Default `#333333`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    /// Alignment for each column. Left when absent.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub align: Vec<TextAlignment>,
    /// Merged cells.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub merges: Vec<TableMerge>,
    /// Styles for single cells.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub cells: Vec<TableCellStyle>,
}

fn yes() -> bool {
    true
}
fn one() -> usize {
    1
}
fn default_width() -> f64 {
    600.0
}
fn default_font_size() -> f64 {
    14.0
}
fn default_padding() -> f64 {
    8.0
}
fn default_border_color() -> String {
    "#cccccc".to_owned()
}
fn default_border_width() -> f64 {
    1.0
}

/// Largest number of rows.
pub(crate) const MAX_ROWS: usize = 500;
/// Largest number of columns.
pub(crate) const MAX_COLUMNS: usize = 50;

impl TableSpec {
    /// The family the text uses.
    pub fn font_family(&self) -> &str {
        self.font_family.as_deref().unwrap_or(DEFAULT_FONT_FAMILY)
    }

    /// A spec from CSV text: each CSV row is one table row, and the first
    /// row is the header. Every other setting has its default.
    pub fn from_csv(text: &str) -> Result<Self, GenerateError> {
        let rows = super::parse_csv(text)?;
        if let Some(first) = rows.first() {
            if let Some(bad) = rows.iter().position(|row| row.len() != first.len()) {
                return Err(GenerateError::InvalidCsv {
                    line: bad + 1,
                    reason: format!(
                        "{} fields, but the first row has {}",
                        rows[bad].len(),
                        first.len()
                    ),
                });
            }
        }
        let spec = Self {
            rows,
            width: default_width(),
            header: true,
            column_widths: Vec::new(),
            font_family: None,
            font_size: default_font_size(),
            padding: default_padding(),
            border: TableBorder::default(),
            header_fill: None,
            fill: None,
            stripe_fill: None,
            text_color: None,
            align: Vec::new(),
            merges: Vec::new(),
            cells: Vec::new(),
        };
        spec.validate()?;
        Ok(spec)
    }

    fn columns(&self) -> usize {
        self.rows.first().map_or(0, Vec::len)
    }

    /// Checks the spec without drawing it.
    pub fn validate(&self) -> Result<(), GenerateError> {
        size_in_range("width", self.width)?;
        if !(4.0..=200.0).contains(&self.font_size) {
            return Err(GenerateError::spec("fontSize", "must be from 4 to 200"));
        }
        if !(0.0..=200.0).contains(&self.padding) {
            return Err(GenerateError::spec("padding", "must be from 0 to 200"));
        }
        if !(0.0..=20.0).contains(&self.border.width) {
            return Err(GenerateError::spec("border.width", "must be from 0 to 20"));
        }
        color("border.color", &self.border.color)?;
        let columns = self.columns();
        if self.rows.is_empty() || columns == 0 {
            return Err(GenerateError::spec(
                "rows",
                "needs at least one row and one column",
            ));
        }
        if self.rows.len() > MAX_ROWS {
            return Err(GenerateError::spec(
                "rows",
                format!("at most {MAX_ROWS} rows"),
            ));
        }
        if columns > MAX_COLUMNS {
            return Err(GenerateError::spec(
                "rows",
                format!("at most {MAX_COLUMNS} columns"),
            ));
        }
        if let Some(bad) = self.rows.iter().position(|row| row.len() != columns) {
            return Err(GenerateError::spec(
                format!("rows[{bad}]"),
                format!(
                    "has {} cells, but rows[0] has {columns}",
                    self.rows[bad].len()
                ),
            ));
        }
        if !self.column_widths.is_empty() {
            if self.column_widths.len() != columns {
                return Err(GenerateError::spec(
                    "columnWidths",
                    format!("needs {columns} values, one for each column"),
                ));
            }
            if self
                .column_widths
                .iter()
                .any(|w| !w.is_finite() || *w <= 0.0)
            {
                return Err(GenerateError::spec(
                    "columnWidths",
                    "every value must be above 0",
                ));
            }
        }
        if self.align.len() > columns {
            return Err(GenerateError::spec(
                "align",
                format!("at most {columns} values"),
            ));
        }
        for (field, value) in [
            ("headerFill", &self.header_fill),
            ("fill", &self.fill),
            ("stripeFill", &self.stripe_fill),
            ("textColor", &self.text_color),
        ] {
            if let Some(c) = value {
                color(field, c)?;
            }
        }
        let mut covered: BTreeMap<(usize, usize), usize> = BTreeMap::new();
        for (index, merge) in self.merges.iter().enumerate() {
            let field = format!("merges[{index}]");
            if merge.row_span == 0 || merge.col_span == 0 {
                return Err(GenerateError::spec(
                    field,
                    "rowSpan and colSpan must be at least 1",
                ));
            }
            if merge.row + merge.row_span > self.rows.len() || merge.col + merge.col_span > columns
            {
                return Err(GenerateError::spec(
                    field,
                    "reaches past the edge of the table",
                ));
            }
            for row in merge.row..merge.row + merge.row_span {
                for col in merge.col..merge.col + merge.col_span {
                    if let Some(other) = covered.insert((row, col), index) {
                        return Err(GenerateError::spec(
                            field,
                            format!("overlaps merges[{other}] at row {row}, column {col}"),
                        ));
                    }
                }
            }
        }
        for (index, style) in self.cells.iter().enumerate() {
            let field = format!("cells[{index}]");
            if style.row >= self.rows.len() || style.col >= columns {
                return Err(GenerateError::spec(field, "names a cell outside the table"));
            }
            if let Some(c) = &style.fill {
                color(&format!("{field}.fill"), c)?;
            }
            if let Some(c) = &style.color {
                color(&format!("{field}.color"), c)?;
            }
        }
        Ok(())
    }
}

pub(crate) fn render(spec: &TableSpec, face: &Face<'_>) -> Result<Generated, GenerateError> {
    spec.validate()?;
    let text = Outliner::new(face)?;
    let columns = spec.columns();
    let border = spec.border.width;
    let inset = border / 2.0;
    let inner_width = spec.width - border;

    // Column edges, from the relative widths.
    let weights: Vec<f64> = if spec.column_widths.is_empty() {
        vec![1.0; columns]
    } else {
        spec.column_widths.clone()
    };
    let total: f64 = weights.iter().sum();
    let mut edges = Vec::with_capacity(columns + 1);
    let mut x = inset;
    edges.push(x);
    for weight in &weights {
        x += inner_width * weight / total;
        edges.push(x);
    }
    // The last edge exactly, whatever the rounding.
    edges[columns] = inset + inner_width;

    let row_height = text.line_height(spec.font_size) + 2.0 * spec.padding;
    let height = spec.rows.len() as f64 * row_height + border;
    size_in_range("height", height).map_err(|_| {
        GenerateError::spec(
            "rows",
            "the table is taller than 8192 pixels; use fewer rows",
        )
    })?;

    let styles: BTreeMap<(usize, usize), &TableCellStyle> =
        spec.cells.iter().map(|s| ((s.row, s.col), s)).collect();
    let mut spans: BTreeMap<(usize, usize), (usize, usize)> = BTreeMap::new();
    let mut hidden = std::collections::BTreeSet::new();
    for merge in &spec.merges {
        spans.insert((merge.row, merge.col), (merge.row_span, merge.col_span));
        for row in merge.row..merge.row + merge.row_span {
            for col in merge.col..merge.col + merge.col_span {
                if (row, col) != (merge.row, merge.col) {
                    hidden.insert((row, col));
                }
            }
        }
    }

    let default_text = spec
        .text_color
        .as_deref()
        .unwrap_or("#333333")
        .to_ascii_lowercase();
    let header_fill = spec
        .header_fill
        .as_deref()
        .unwrap_or("#f0f0f0")
        .to_ascii_lowercase();

    let mut svg = SvgWriter::new(spec.width, height);
    let mut clip_index = 0usize;
    for (r, row) in spec.rows.iter().enumerate() {
        for (c, cell) in row.iter().enumerate() {
            if hidden.contains(&(r, c)) {
                continue;
            }
            let (row_span, col_span) = spans.get(&(r, c)).copied().unwrap_or((1, 1));
            let x0 = edges[c];
            let x1 = edges[c + col_span];
            let y0 = inset + r as f64 * row_height;
            let y1 = y0 + row_span as f64 * row_height;
            let style = styles.get(&(r, c));

            let is_header = spec.header && r == 0;
            let body_index = if spec.header { r.wrapping_sub(1) } else { r };
            let fill = style
                .and_then(|s| s.fill.as_deref())
                .map(str::to_ascii_lowercase)
                .or_else(|| is_header.then(|| header_fill.clone()))
                .or_else(|| {
                    (!is_header && body_index % 2 == 1)
                        .then(|| spec.stripe_fill.as_deref().map(str::to_ascii_lowercase))
                        .flatten()
                })
                .or_else(|| spec.fill.as_deref().map(str::to_ascii_lowercase));

            let mut attributes = vec![
                ("x", num(x0)),
                ("y", num(y0)),
                ("width", num(x1 - x0)),
                ("height", num(y1 - y0)),
                ("fill", fill.unwrap_or_else(|| "none".to_owned())),
            ];
            if border > 0.0 {
                attributes.push(("stroke", spec.border.color.to_ascii_lowercase()));
                attributes.push(("stroke-width", num(border)));
            }
            svg.element("rect", &attributes);

            let label = cell.replace(['\r', '\n'], " ");
            if label.trim().is_empty() {
                continue;
            }
            let field = format!("rows[{r}][{c}]");
            let align = style
                .and_then(|s| s.align)
                .or_else(|| spec.align.get(c).copied())
                .unwrap_or_default();
            let (tx, anchor) = match align {
                TextAlignment::Left => (x0 + spec.padding, Anchor::Start),
                TextAlignment::Center => ((x0 + x1) / 2.0, Anchor::Middle),
                TextAlignment::Right => (x1 - spec.padding, Anchor::End),
            };
            let middle = (y0 + y1) / 2.0;
            let baseline =
                middle - text.line_height(spec.font_size) / 2.0 + text.ascent(spec.font_size);
            let d = text.path(&label, tx, baseline, spec.font_size, anchor, &field)?;
            if d.is_empty() {
                continue;
            }
            let fill = style
                .and_then(|s| s.color.as_deref())
                .map(str::to_ascii_lowercase)
                .unwrap_or_else(|| default_text.clone());
            let available = (x1 - x0) - 2.0 * spec.padding;
            if text.width(&label, spec.font_size, &field)? > available {
                // Clip at the cell's inner edge.
                let id = format!("cell{clip_index}");
                clip_index += 1;
                svg.open("clipPath", &[("id", id.clone())]);
                svg.element(
                    "rect",
                    &[
                        ("x", num(x0 + spec.padding.min((x1 - x0) / 2.0))),
                        ("y", num(y0)),
                        ("width", num(available.max(0.0))),
                        ("height", num(y1 - y0)),
                    ],
                );
                svg.close("clipPath");
                svg.element(
                    "path",
                    &[
                        ("d", d),
                        ("fill", fill),
                        ("clip-path", format!("url(#{id})")),
                    ],
                );
            } else {
                svg.element("path", &[("d", d), ("fill", fill)]);
            }
        }
    }

    Ok(Generated {
        svg: svg.finish(),
        width: spec.width,
        height,
    })
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    fn spec(rows: &[&[&str]]) -> TableSpec {
        TableSpec {
            rows: rows
                .iter()
                .map(|r| r.iter().map(|c| (*c).to_owned()).collect())
                .collect(),
            ..TableSpec::from_csv("a").unwrap()
        }
    }

    #[test]
    fn overlapping_merges_are_refused() {
        let mut table = spec(&[&["a", "b", "c"], &["d", "e", "f"]]);
        table.merges = vec![
            TableMerge {
                row: 0,
                col: 0,
                row_span: 1,
                col_span: 2,
            },
            TableMerge {
                row: 0,
                col: 1,
                row_span: 2,
                col_span: 1,
            },
        ];
        let error = table.validate().unwrap_err();
        assert!(error.to_string().contains("overlaps merges[0]"), "{error}");
    }

    #[test]
    fn a_merge_past_the_edge_is_refused() {
        let mut table = spec(&[&["a", "b"]]);
        table.merges = vec![TableMerge {
            row: 0,
            col: 1,
            row_span: 1,
            col_span: 2,
        }];
        assert!(table.validate().is_err());
    }

    #[test]
    fn rows_of_unequal_length_are_refused() {
        assert!(spec(&[&["a", "b"], &["c"]]).validate().is_err());
        assert!(TableSpec::from_csv("a,b\nc\n").is_err());
    }
}
