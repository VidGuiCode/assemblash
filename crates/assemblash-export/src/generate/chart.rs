//! Charts: bar, column, line, area, pie, donut and scatter.
//!
//! All seven types read the same data: a list of categories and one or more
//! series of numbers, one number for each category. A type switch therefore
//! keeps the data. Pie and donut draw the first series. Scatter uses the
//! categories as x values when every category is a number, and 1, 2, 3, …
//! otherwise.

use serde::{Deserialize, Serialize};

use super::outline::{Anchor, Outliner};
use super::svg::{color, num, rect_path, SvgWriter};
use super::{math, Face, GenerateError, Generated, DEFAULT_FONT_FAMILY};

/// The chart types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChartType {
    /// Horizontal bars, one group for each category.
    Bar,
    /// Vertical bars, one group for each category.
    Column,
    /// One line for each series.
    Line,
    /// One filled area for each series, not stacked.
    Area,
    /// The first series as slices of a circle.
    Pie,
    /// The first series as slices of a ring.
    Donut,
    /// One dot for each value.
    Scatter,
}

impl ChartType {
    /// All types, in a fixed order.
    pub const ALL: [Self; 7] = [
        Self::Bar,
        Self::Column,
        Self::Line,
        Self::Area,
        Self::Pie,
        Self::Donut,
        Self::Scatter,
    ];

    /// The name in a spec.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Bar => "bar",
            Self::Column => "column",
            Self::Line => "line",
            Self::Area => "area",
            Self::Pie => "pie",
            Self::Donut => "donut",
            Self::Scatter => "scatter",
        }
    }

    /// Reads a type name.
    pub fn parse(name: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|t| t.as_str() == name)
    }

    fn is_round(self) -> bool {
        matches!(self, Self::Pie | Self::Donut)
    }
}

/// One series of values.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ChartSeries {
    /// The name in the legend.
    pub name: String,
    /// One value for each category.
    pub values: Vec<f64>,
    /// The colour. The palette gives one when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

/// The value axis.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ChartAxis {
    /// The lowest value on the axis. Chosen from the data when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min: Option<f64>,
    /// The highest value on the axis. Chosen from the data when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max: Option<f64>,
    /// Whether to draw a grid line at each tick.
    #[serde(default = "yes")]
    pub grid_lines: bool,
}

impl Default for ChartAxis {
    fn default() -> Self {
        Self {
            min: None,
            max: None,
            grid_lines: true,
        }
    }
}

/// A chart spec.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ChartSpec {
    /// The chart type.
    #[serde(rename = "type")]
    pub chart_type: ChartType,
    /// Width of the generated graphic, in pixels. Default 800.
    #[serde(default = "default_width")]
    pub width: f64,
    /// Height of the generated graphic, in pixels. Default 500.
    #[serde(default = "default_height")]
    pub height: f64,
    /// A title above the chart.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// The category labels.
    pub categories: Vec<String>,
    /// The series.
    pub series: Vec<ChartSeries>,
    /// The family for labels. Default `Noto Sans`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_family: Option<String>,
    /// The label size, in pixels. Default 14.
    #[serde(default = "default_font_size")]
    pub font_size: f64,
    /// Colours for series (or for slices of a pie), used in order.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub palette: Vec<String>,
    /// A background fill. Transparent when absent.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    /// The colour of labels. Default `#333333`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    /// The value axis.
    #[serde(default)]
    pub axis: ChartAxis,
    /// Whether to draw a legend. Default true. A chart with one series and
    /// no slices draws no legend either way.
    #[serde(default = "yes")]
    pub legend: bool,
    /// Whether to write each value next to its mark. Default false.
    #[serde(default)]
    pub value_labels: bool,
}

fn yes() -> bool {
    true
}
fn default_width() -> f64 {
    800.0
}
fn default_height() -> f64 {
    500.0
}
fn default_font_size() -> f64 {
    14.0
}

/// The palette when a spec gives none.
const DEFAULT_PALETTE: [&str; 8] = [
    "#4269d0", "#efb118", "#ff725c", "#6cc5b0", "#3ca951", "#ff8ab7", "#a463f2", "#97bbf5",
];
const DEFAULT_TEXT: &str = "#333333";
const GRID: &str = "#e6e6e6";
const AXIS: &str = "#999999";

/// Largest number of categories.
pub(crate) const MAX_CATEGORIES: usize = 500;
/// Largest number of series.
pub(crate) const MAX_SERIES: usize = 24;

impl ChartSpec {
    /// The family the labels use.
    pub fn font_family(&self) -> &str {
        self.font_family.as_deref().unwrap_or(DEFAULT_FONT_FAMILY)
    }

    /// A spec from CSV text. The first row names the series (its first cell
    /// is ignored); each later row is one category, then one value for each
    /// series. Every other setting has its default.
    pub fn from_csv(chart_type: ChartType, text: &str) -> Result<Self, GenerateError> {
        let rows = super::parse_csv(text)?;
        let Some((header, data)) = rows.split_first() else {
            return Err(GenerateError::InvalidCsv {
                line: 1,
                reason: "the file is empty".to_owned(),
            });
        };
        if header.len() < 2 {
            return Err(GenerateError::InvalidCsv {
                line: 1,
                reason: "the header needs a category column and at least one series column"
                    .to_owned(),
            });
        }
        let mut series: Vec<ChartSeries> = header[1..]
            .iter()
            .map(|name| ChartSeries {
                name: name.trim().to_owned(),
                values: Vec::with_capacity(data.len()),
                color: None,
            })
            .collect();
        let mut categories = Vec::with_capacity(data.len());
        for (index, row) in data.iter().enumerate() {
            let line = index + 2;
            if row.len() != header.len() {
                return Err(GenerateError::InvalidCsv {
                    line,
                    reason: format!("{} fields, but the header has {}", row.len(), header.len()),
                });
            }
            categories.push(row[0].trim().to_owned());
            for (column, cell) in row[1..].iter().enumerate() {
                let value: f64 = cell.trim().parse().map_err(|_| GenerateError::InvalidCsv {
                    line,
                    reason: format!("{:?} in column {} is not a number", cell, column + 2),
                })?;
                series[column].values.push(value);
            }
        }
        let spec = Self {
            chart_type,
            width: default_width(),
            height: default_height(),
            title: None,
            categories,
            series,
            font_family: None,
            font_size: default_font_size(),
            palette: Vec::new(),
            background: None,
            text_color: None,
            axis: ChartAxis::default(),
            legend: true,
            value_labels: false,
        };
        spec.validate()?;
        Ok(spec)
    }

    /// Checks the spec without drawing it.
    pub fn validate(&self) -> Result<(), GenerateError> {
        size_in_range("width", self.width)?;
        size_in_range("height", self.height)?;
        if !(4.0..=200.0).contains(&self.font_size) {
            return Err(GenerateError::spec("fontSize", "must be from 4 to 200"));
        }
        if self.categories.is_empty() {
            return Err(GenerateError::spec(
                "categories",
                "needs at least one category",
            ));
        }
        if self.categories.len() > MAX_CATEGORIES {
            return Err(GenerateError::spec(
                "categories",
                format!("at most {MAX_CATEGORIES} categories"),
            ));
        }
        if self.series.is_empty() {
            return Err(GenerateError::spec("series", "needs at least one series"));
        }
        if self.series.len() > MAX_SERIES {
            return Err(GenerateError::spec(
                "series",
                format!("at most {MAX_SERIES} series"),
            ));
        }
        for (index, series) in self.series.iter().enumerate() {
            if series.values.len() != self.categories.len() {
                return Err(GenerateError::spec(
                    format!("series[{index}].values"),
                    format!(
                        "has {} values, but there are {} categories",
                        series.values.len(),
                        self.categories.len()
                    ),
                ));
            }
            if let Some(bad) = series.values.iter().position(|v| !v.is_finite()) {
                return Err(GenerateError::spec(
                    format!("series[{index}].values[{bad}]"),
                    "is not a finite number",
                ));
            }
            if let Some(c) = &series.color {
                color(&format!("series[{index}].color"), c)?;
            }
        }
        for (index, c) in self.palette.iter().enumerate() {
            color(&format!("palette[{index}]"), c)?;
        }
        if let Some(c) = &self.background {
            color("background", c)?;
        }
        if let Some(c) = &self.text_color {
            color("textColor", c)?;
        }
        for (field, value) in [("axis.min", self.axis.min), ("axis.max", self.axis.max)] {
            if value.is_some_and(|v| !v.is_finite()) {
                return Err(GenerateError::spec(field, "is not a finite number"));
            }
        }
        if let (Some(min), Some(max)) = (self.axis.min, self.axis.max) {
            if min >= max {
                return Err(GenerateError::spec("axis", "min must be less than max"));
            }
        }
        if self.chart_type.is_round() {
            let values = &self.series[0].values;
            if values.iter().any(|v| *v < 0.0) {
                return Err(GenerateError::spec(
                    "series[0].values",
                    "a pie or donut cannot show a negative value",
                ));
            }
            if values.iter().sum::<f64>() <= 0.0 {
                return Err(GenerateError::spec(
                    "series[0].values",
                    "a pie or donut needs a total above zero",
                ));
            }
        }
        Ok(())
    }

    fn series_color(&self, index: usize) -> String {
        if let Some(c) = &self.series[index].color {
            return c.to_ascii_lowercase();
        }
        self.palette_color(index)
    }

    fn palette_color(&self, index: usize) -> String {
        if self.palette.is_empty() {
            DEFAULT_PALETTE[index % DEFAULT_PALETTE.len()].to_owned()
        } else {
            self.palette[index % self.palette.len()].to_ascii_lowercase()
        }
    }
}

pub(crate) fn size_in_range(field: &str, value: f64) -> Result<(), GenerateError> {
    if value.is_finite() && (16.0..=8192.0).contains(&value) {
        Ok(())
    } else {
        Err(GenerateError::spec(field, "must be from 16 to 8192 pixels"))
    }
}

/// A rectangle in the graphic.
#[derive(Debug, Clone, Copy)]
struct Area {
    left: f64,
    top: f64,
    right: f64,
    bottom: f64,
}

impl Area {
    fn width(&self) -> f64 {
        self.right - self.left
    }
    fn height(&self) -> f64 {
        self.bottom - self.top
    }
}

/// A linear scale from values to pixels.
#[derive(Debug, Clone)]
struct Scale {
    lo: f64,
    hi: f64,
    ticks: Vec<f64>,
}

impl Scale {
    fn new(data_lo: f64, data_hi: f64, fixed_lo: Option<f64>, fixed_hi: Option<f64>) -> Self {
        let mut lo = fixed_lo.unwrap_or(data_lo);
        let mut hi = fixed_hi.unwrap_or(data_hi);
        if hi <= lo {
            hi = lo + 1.0;
        }
        let step = nice_step((hi - lo) / 5.0);
        if fixed_lo.is_none() {
            lo = (lo / step).floor() * step;
        }
        if fixed_hi.is_none() {
            hi = (hi / step).ceil() * step;
        }
        let mut ticks = Vec::new();
        let first = (lo / step).ceil();
        let mut i = 0.0;
        loop {
            let tick = (first + i) * step;
            if tick > hi + step * 1e-9 || ticks.len() > 50 {
                break;
            }
            ticks.push(tick);
            i += 1.0;
        }
        Self { lo, hi, ticks }
    }

    /// Position of `value` from 0 (lo) to 1 (hi).
    fn fraction(&self, value: f64) -> f64 {
        (value - self.lo) / (self.hi - self.lo)
    }

    /// The value the marks start from: zero when it is on the axis.
    fn baseline(&self) -> f64 {
        if self.lo <= 0.0 && self.hi >= 0.0 {
            0.0
        } else if self.lo > 0.0 {
            self.lo
        } else {
            self.hi
        }
    }
}

/// 1, 2 or 5 times a power of ten, at least `raw`. Loops instead of
/// `log10`, which comes from the platform maths library.
fn nice_step(raw: f64) -> f64 {
    if raw <= 0.0 || !raw.is_finite() {
        return 1.0;
    }
    let mut power = 1.0;
    while power > raw {
        power /= 10.0;
    }
    while power * 10.0 <= raw {
        power *= 10.0;
    }
    let fraction = raw / power;
    let nice = if fraction <= 1.0 {
        1.0
    } else if fraction <= 2.0 {
        2.0
    } else if fraction <= 5.0 {
        5.0
    } else {
        10.0
    };
    nice * power
}

struct Painter<'a> {
    svg: SvgWriter,
    text: Outliner<'a>,
    text_color: String,
    size: f64,
}

impl Painter<'_> {
    fn label(
        &mut self,
        text: &str,
        x: f64,
        baseline: f64,
        size: f64,
        anchor: Anchor,
        field: &str,
    ) -> Result<(), GenerateError> {
        let d = self.text.path(text, x, baseline, size, anchor, field)?;
        if !d.is_empty() {
            self.svg
                .element("path", &[("d", d), ("fill", self.text_color.clone())]);
        }
        Ok(())
    }

    /// The baseline that centres a line of `size` text on `middle`.
    fn centred_baseline(&self, middle: f64, size: f64) -> f64 {
        middle - self.text.line_height(size) / 2.0 + self.text.ascent(size)
    }
}

pub(crate) fn render(spec: &ChartSpec, face: &Face<'_>) -> Result<Generated, GenerateError> {
    spec.validate()?;
    let mut painter = Painter {
        svg: SvgWriter::new(spec.width, spec.height),
        text: Outliner::new(face)?,
        text_color: spec
            .text_color
            .as_deref()
            .unwrap_or(DEFAULT_TEXT)
            .to_ascii_lowercase(),
        size: spec.font_size,
    };
    if let Some(background) = &spec.background {
        painter.svg.element(
            "rect",
            &[
                ("width", num(spec.width)),
                ("height", num(spec.height)),
                ("fill", background.to_ascii_lowercase()),
            ],
        );
    }

    let pad = spec.font_size;
    let mut area = Area {
        left: pad,
        top: pad,
        right: spec.width - pad,
        bottom: spec.height - pad,
    };

    if let Some(title) = spec.title.as_deref().filter(|t| !t.trim().is_empty()) {
        let size = spec.font_size * 1.25;
        let baseline = area.top + painter.text.ascent(size);
        painter.label(
            title,
            spec.width / 2.0,
            baseline,
            size,
            Anchor::Middle,
            "title",
        )?;
        area.top += painter.text.line_height(size) + pad / 2.0;
    }

    let legend: Vec<(String, String)> = if spec.chart_type.is_round() {
        spec.categories
            .iter()
            .enumerate()
            .map(|(i, name)| (name.clone(), spec.palette_color(i)))
            .collect()
    } else if spec.series.len() > 1 {
        spec.series
            .iter()
            .enumerate()
            .map(|(i, s)| (s.name.clone(), spec.series_color(i)))
            .collect()
    } else {
        Vec::new()
    };
    if spec.legend && !legend.is_empty() {
        area.bottom = draw_legend(&mut painter, &legend, area, spec.width)?;
    }

    if area.width() < 8.0 || area.height() < 8.0 {
        return Err(GenerateError::spec(
            "width",
            "the chart is too small for its labels; make it larger or the font smaller",
        ));
    }

    match spec.chart_type {
        ChartType::Pie | ChartType::Donut => draw_round(&mut painter, spec, area)?,
        ChartType::Scatter => draw_scatter(&mut painter, spec, area)?,
        ChartType::Bar => draw_bar(&mut painter, spec, area)?,
        ChartType::Column | ChartType::Line | ChartType::Area => {
            draw_vertical(&mut painter, spec, area)?
        }
    }

    Ok(Generated {
        svg: painter.svg.finish(),
        width: spec.width,
        height: spec.height,
    })
}

/// Draws the legend in rows along the bottom and returns the new bottom of
/// the plot area.
fn draw_legend(
    painter: &mut Painter<'_>,
    entries: &[(String, String)],
    area: Area,
    width: f64,
) -> Result<f64, GenerateError> {
    let size = painter.size;
    let swatch = size * 0.8;
    let gap = size * 0.4;
    let line = painter.text.line_height(size);
    let mut rows: Vec<Vec<(usize, f64)>> = vec![Vec::new()];
    let mut used = 0.0;
    for (index, (name, _)) in entries.iter().enumerate() {
        let item = swatch + gap + painter.text.width(name, size, "legend")?;
        let advance = if rows.last().is_some_and(|r| r.is_empty()) {
            item
        } else {
            item + gap * 3.0
        };
        if used + advance > area.width() && rows.last().is_some_and(|r| !r.is_empty()) {
            rows.push(Vec::new());
            used = 0.0;
            used += item;
        } else {
            used += advance;
        }
        if let Some(row) = rows.last_mut() {
            row.push((index, item));
        }
    }
    let height = rows.len() as f64 * line;
    let mut top = area.bottom - height;
    for row in &rows {
        let total: f64 =
            row.iter().map(|(_, w)| w).sum::<f64>() + gap * 3.0 * (row.len() as f64 - 1.0);
        let mut x = (width - total) / 2.0;
        let middle = top + line / 2.0;
        for (index, item) in row {
            let (name, fill) = &entries[*index];
            painter.svg.element(
                "rect",
                &[
                    ("x", num(x)),
                    ("y", num(middle - swatch / 2.0)),
                    ("width", num(swatch)),
                    ("height", num(swatch)),
                    ("fill", fill.clone()),
                ],
            );
            let baseline = painter.centred_baseline(middle, size);
            painter.label(
                name,
                x + swatch + gap,
                baseline,
                size,
                Anchor::Start,
                "legend",
            )?;
            x += item + gap * 3.0;
        }
        top += line;
    }
    Ok(area.bottom - height - size / 2.0)
}

fn value_range(spec: &ChartSpec) -> (f64, f64) {
    let mut lo = f64::INFINITY;
    let mut hi = f64::NEG_INFINITY;
    for value in spec.series.iter().flat_map(|s| &s.values) {
        lo = lo.min(*value);
        hi = hi.max(*value);
    }
    (lo.min(0.0), hi.max(0.0))
}

fn widest(
    painter: &Painter<'_>,
    labels: &[String],
    size: f64,
    field: &str,
) -> Result<f64, GenerateError> {
    let mut widest: f64 = 0.0;
    for label in labels {
        widest = widest.max(painter.text.width(label, size, field)?);
    }
    Ok(widest)
}

/// Column, line and area: categories along x, values up.
fn draw_vertical(
    painter: &mut Painter<'_>,
    spec: &ChartSpec,
    area: Area,
) -> Result<(), GenerateError> {
    let size = spec.font_size;
    let (lo, hi) = value_range(spec);
    let scale = Scale::new(lo, hi, spec.axis.min, spec.axis.max);
    let tick_labels: Vec<String> = scale.ticks.iter().map(|t| num(*t)).collect();
    let label_width = widest(painter, &tick_labels, size, "axis")?;
    let line = painter.text.line_height(size);
    let plot = Area {
        left: area.left + label_width + size / 2.0,
        top: area.top + line / 2.0,
        right: area.right,
        bottom: area.bottom - line - size / 4.0,
    };
    let y = |v: f64| plot.bottom - scale.fraction(v) * plot.height();

    for (tick, label) in scale.ticks.iter().zip(&tick_labels) {
        let ty = y(*tick);
        if spec.axis.grid_lines {
            painter.svg.element(
                "path",
                &[
                    (
                        "d",
                        format!("M{} {}H{}", num(plot.left), num(ty), num(plot.right)),
                    ),
                    ("stroke", GRID.to_owned()),
                    ("stroke-width", "1".to_owned()),
                ],
            );
        }
        let baseline = painter.centred_baseline(ty, size);
        painter.label(
            label,
            plot.left - size / 2.0,
            baseline,
            size,
            Anchor::End,
            "axis",
        )?;
    }

    let n = spec.categories.len();
    let band = plot.width() / n as f64;
    let label_skip = category_skip(painter, &spec.categories, band, size)?;
    let label_baseline = plot.bottom + size / 4.0 + painter.text.ascent(size);
    for (i, category) in spec.categories.iter().enumerate() {
        if i % label_skip == 0 {
            let x = plot.left + band * (i as f64 + 0.5);
            painter.label(
                category,
                x,
                label_baseline,
                size,
                Anchor::Middle,
                "categories",
            )?;
        }
    }

    let base = y(scale.baseline());
    let k = spec.series.len();
    match spec.chart_type {
        ChartType::Column => {
            let inner = band * 0.8;
            let bar = inner / k as f64;
            for (j, series) in spec.series.iter().enumerate() {
                let fill = spec.series_color(j);
                for (i, value) in series.values.iter().enumerate() {
                    let x = plot.left + band * i as f64 + band * 0.1 + bar * j as f64;
                    let top = y(clamp(*value, &scale));
                    let (y0, y1) = if top < base { (top, base) } else { (base, top) };
                    painter.svg.element(
                        "path",
                        &[
                            ("d", rect_path(x, y0, bar, y1 - y0)),
                            ("fill", fill.clone()),
                        ],
                    );
                    if spec.value_labels {
                        let baseline = if *value >= scale.baseline() {
                            y0 - size / 4.0
                        } else {
                            y1 + size / 4.0 + painter.text.ascent(size)
                        };
                        painter.label(
                            &num(*value),
                            x + bar / 2.0,
                            baseline,
                            size * 0.85,
                            Anchor::Middle,
                            "values",
                        )?;
                    }
                }
            }
        }
        _ => {
            for (j, series) in spec.series.iter().enumerate() {
                let stroke = spec.series_color(j);
                let points: Vec<(f64, f64)> = series
                    .values
                    .iter()
                    .enumerate()
                    .map(|(i, v)| (plot.left + band * (i as f64 + 0.5), y(clamp(*v, &scale))))
                    .collect();
                let mut d = String::new();
                for (index, (px, py)) in points.iter().enumerate() {
                    d.push(if index == 0 { 'M' } else { 'L' });
                    d.push_str(&format!("{} {}", num(*px), num(*py)));
                }
                if spec.chart_type == ChartType::Area {
                    let (first, last) = (points[0].0, points[points.len() - 1].0);
                    let fill = format!(
                        "{d}L{} {}L{} {}Z",
                        num(last),
                        num(base),
                        num(first),
                        num(base)
                    );
                    painter.svg.element(
                        "path",
                        &[
                            ("d", fill),
                            ("fill", stroke.clone()),
                            ("fill-opacity", "0.3".to_owned()),
                        ],
                    );
                }
                painter.svg.element(
                    "path",
                    &[
                        ("d", d),
                        ("fill", "none".to_owned()),
                        ("stroke", stroke.clone()),
                        ("stroke-width", "2".to_owned()),
                        ("stroke-linejoin", "round".to_owned()),
                        ("stroke-linecap", "round".to_owned()),
                    ],
                );
                for ((px, py), value) in points.iter().zip(&series.values) {
                    if spec.chart_type == ChartType::Line {
                        painter.svg.element(
                            "circle",
                            &[
                                ("cx", num(*px)),
                                ("cy", num(*py)),
                                ("r", "3".to_owned()),
                                ("fill", stroke.clone()),
                            ],
                        );
                    }
                    if spec.value_labels {
                        painter.label(
                            &num(*value),
                            *px,
                            py - size / 2.0,
                            size * 0.85,
                            Anchor::Middle,
                            "values",
                        )?;
                    }
                }
            }
        }
    }

    // The axis line on top of the marks.
    painter.svg.element(
        "path",
        &[
            (
                "d",
                format!("M{} {}H{}", num(plot.left), num(base), num(plot.right)),
            ),
            ("stroke", AXIS.to_owned()),
            ("stroke-width", "1".to_owned()),
        ],
    );
    Ok(())
}

/// Bar: categories down the left, values to the right.
fn draw_bar(painter: &mut Painter<'_>, spec: &ChartSpec, area: Area) -> Result<(), GenerateError> {
    let size = spec.font_size;
    let (lo, hi) = value_range(spec);
    let scale = Scale::new(lo, hi, spec.axis.min, spec.axis.max);
    let tick_labels: Vec<String> = scale.ticks.iter().map(|t| num(*t)).collect();
    let category_width = widest(painter, &spec.categories, size, "categories")?;
    let line = painter.text.line_height(size);
    let last_tick = tick_labels
        .last()
        .map(|t| painter.text.width(t, size, "axis"))
        .transpose()?
        .unwrap_or(0.0);
    let plot = Area {
        left: area.left + category_width + size / 2.0,
        top: area.top,
        right: area.right - last_tick / 2.0,
        bottom: area.bottom - line - size / 4.0,
    };
    let x = |v: f64| plot.left + scale.fraction(v) * plot.width();

    let tick_baseline = plot.bottom + size / 4.0 + painter.text.ascent(size);
    for (tick, label) in scale.ticks.iter().zip(&tick_labels) {
        let tx = x(*tick);
        if spec.axis.grid_lines {
            painter.svg.element(
                "path",
                &[
                    (
                        "d",
                        format!("M{} {}V{}", num(tx), num(plot.top), num(plot.bottom)),
                    ),
                    ("stroke", GRID.to_owned()),
                    ("stroke-width", "1".to_owned()),
                ],
            );
        }
        painter.label(label, tx, tick_baseline, size, Anchor::Middle, "axis")?;
    }

    let n = spec.categories.len();
    let band = plot.height() / n as f64;
    for (i, category) in spec.categories.iter().enumerate() {
        let middle = plot.top + band * (i as f64 + 0.5);
        let baseline = painter.centred_baseline(middle, size);
        painter.label(
            category,
            plot.left - size / 2.0,
            baseline,
            size,
            Anchor::End,
            "categories",
        )?;
    }

    let base = x(scale.baseline());
    let k = spec.series.len();
    let inner = band * 0.8;
    let bar = inner / k as f64;
    for (j, series) in spec.series.iter().enumerate() {
        let fill = spec.series_color(j);
        for (i, value) in series.values.iter().enumerate() {
            let y = plot.top + band * i as f64 + band * 0.1 + bar * j as f64;
            let end = x(clamp(*value, &scale));
            let (x0, x1) = if end < base { (end, base) } else { (base, end) };
            painter.svg.element(
                "path",
                &[
                    ("d", rect_path(x0, y, x1 - x0, bar)),
                    ("fill", fill.clone()),
                ],
            );
            if spec.value_labels {
                let baseline = painter.centred_baseline(y + bar / 2.0, size * 0.85);
                let (lx, anchor) = if *value >= scale.baseline() {
                    (x1 + size / 4.0, Anchor::Start)
                } else {
                    (x0 - size / 4.0, Anchor::End)
                };
                painter.label(&num(*value), lx, baseline, size * 0.85, anchor, "values")?;
            }
        }
    }
    painter.svg.element(
        "path",
        &[
            (
                "d",
                format!("M{} {}V{}", num(base), num(plot.top), num(plot.bottom)),
            ),
            ("stroke", AXIS.to_owned()),
            ("stroke-width", "1".to_owned()),
        ],
    );
    Ok(())
}

/// Scatter: numeric x, values up.
fn draw_scatter(
    painter: &mut Painter<'_>,
    spec: &ChartSpec,
    area: Area,
) -> Result<(), GenerateError> {
    let size = spec.font_size;
    let parsed: Option<Vec<f64>> = spec
        .categories
        .iter()
        .map(|c| c.trim().parse::<f64>().ok().filter(|v| v.is_finite()))
        .collect();
    let xs: Vec<f64> =
        parsed.unwrap_or_else(|| (1..=spec.categories.len()).map(|i| i as f64).collect());
    let (x_lo, x_hi) = xs
        .iter()
        .fold((f64::INFINITY, f64::NEG_INFINITY), |(lo, hi), v| {
            (lo.min(*v), hi.max(*v))
        });
    let x_scale = Scale::new(x_lo, x_hi, None, None);
    let (lo, hi) = value_range(spec);
    let y_scale = Scale::new(lo, hi, spec.axis.min, spec.axis.max);
    let y_labels: Vec<String> = y_scale.ticks.iter().map(|t| num(*t)).collect();
    let x_labels: Vec<String> = x_scale.ticks.iter().map(|t| num(*t)).collect();
    let label_width = widest(painter, &y_labels, size, "axis")?;
    let line = painter.text.line_height(size);
    let last_x = x_labels
        .last()
        .map(|t| painter.text.width(t, size, "axis"))
        .transpose()?
        .unwrap_or(0.0);
    let plot = Area {
        left: area.left + label_width + size / 2.0,
        top: area.top + line / 2.0,
        right: area.right - last_x / 2.0,
        bottom: area.bottom - line - size / 4.0,
    };
    let px = |v: f64| plot.left + x_scale.fraction(v) * plot.width();
    let py = |v: f64| plot.bottom - y_scale.fraction(v) * plot.height();

    for (tick, label) in y_scale.ticks.iter().zip(&y_labels) {
        let ty = py(*tick);
        if spec.axis.grid_lines {
            painter.svg.element(
                "path",
                &[
                    (
                        "d",
                        format!("M{} {}H{}", num(plot.left), num(ty), num(plot.right)),
                    ),
                    ("stroke", GRID.to_owned()),
                    ("stroke-width", "1".to_owned()),
                ],
            );
        }
        let baseline = painter.centred_baseline(ty, size);
        painter.label(
            label,
            plot.left - size / 2.0,
            baseline,
            size,
            Anchor::End,
            "axis",
        )?;
    }
    let x_baseline = plot.bottom + size / 4.0 + painter.text.ascent(size);
    for (tick, label) in x_scale.ticks.iter().zip(&x_labels) {
        painter.label(label, px(*tick), x_baseline, size, Anchor::Middle, "axis")?;
    }
    painter.svg.element(
        "path",
        &[
            (
                "d",
                format!(
                    "M{} {}V{}H{}",
                    num(plot.left),
                    num(plot.top),
                    num(plot.bottom),
                    num(plot.right)
                ),
            ),
            ("fill", "none".to_owned()),
            ("stroke", AXIS.to_owned()),
            ("stroke-width", "1".to_owned()),
        ],
    );
    for (j, series) in spec.series.iter().enumerate() {
        let fill = spec.series_color(j);
        for (x, value) in xs.iter().zip(&series.values) {
            let cy = py(clamp(*value, &y_scale));
            painter.svg.element(
                "circle",
                &[
                    ("cx", num(px(*x))),
                    ("cy", num(cy)),
                    ("r", num(size * 0.3)),
                    ("fill", fill.clone()),
                ],
            );
            if spec.value_labels {
                painter.label(
                    &num(*value),
                    px(*x),
                    cy - size / 2.0,
                    size * 0.85,
                    Anchor::Middle,
                    "values",
                )?;
            }
        }
    }
    Ok(())
}

/// Pie and donut: the first series, clockwise from twelve o'clock.
fn draw_round(
    painter: &mut Painter<'_>,
    spec: &ChartSpec,
    area: Area,
) -> Result<(), GenerateError> {
    let values = &spec.series[0].values;
    let total: f64 = values.iter().sum();
    let cx = (area.left + area.right) / 2.0;
    let cy = (area.top + area.bottom) / 2.0;
    let radius = area.width().min(area.height()) / 2.0;
    let inner = if spec.chart_type == ChartType::Donut {
        radius * 0.55
    } else {
        0.0
    };
    let edge = spec
        .background
        .as_deref()
        .unwrap_or("#ffffff")
        .to_ascii_lowercase();
    let point = |angle: f64, r: f64| (cx + r * math::sin(angle), cy - r * math::cos(angle));
    let full = std::f64::consts::TAU;
    let mut start = 0.0;
    for (i, value) in values.iter().enumerate() {
        if *value <= 0.0 {
            continue;
        }
        let fill = spec.palette_color(i);
        let sweep = full * value / total;
        let end = start + sweep;
        let d = if sweep >= full - 1e-9 {
            // One slice is the whole circle: two half arcs, and the hole as a
            // second ring with even-odd fill.
            let mut d = circle_path(cx, cy, radius);
            if inner > 0.0 {
                d.push_str(&circle_path(cx, cy, inner));
            }
            d
        } else {
            let large = if sweep > full / 2.0 { 1 } else { 0 };
            let (x0, y0) = point(start, radius);
            let (x1, y1) = point(end, radius);
            if inner > 0.0 {
                let (ix1, iy1) = point(end, inner);
                let (ix0, iy0) = point(start, inner);
                format!(
                    "M{} {}A{r} {r} 0 {large} 1 {} {}L{} {}A{ir} {ir} 0 {large} 0 {} {}Z",
                    num(x0),
                    num(y0),
                    num(x1),
                    num(y1),
                    num(ix1),
                    num(iy1),
                    num(ix0),
                    num(iy0),
                    r = num(radius),
                    ir = num(inner),
                )
            } else {
                format!(
                    "M{} {}L{} {}A{r} {r} 0 {large} 1 {} {}Z",
                    num(cx),
                    num(cy),
                    num(x0),
                    num(y0),
                    num(x1),
                    num(y1),
                    r = num(radius),
                )
            }
        };
        painter.svg.element(
            "path",
            &[
                ("d", d),
                ("fill", fill),
                ("fill-rule", "evenodd".to_owned()),
                ("stroke", edge.clone()),
                ("stroke-width", "1".to_owned()),
            ],
        );
        if spec.value_labels {
            let percent = (value / total * 100.0).round() as i64;
            let middle = start + sweep / 2.0;
            let r = if inner > 0.0 {
                (radius + inner) / 2.0
            } else {
                radius * 0.65
            };
            let (lx, ly) = point(middle, r);
            let size = spec.font_size * 0.85;
            let baseline = painter.centred_baseline(ly, size);
            painter.label(
                &format!("{percent}%"),
                lx,
                baseline,
                size,
                Anchor::Middle,
                "values",
            )?;
        }
        start = end;
    }
    Ok(())
}

fn circle_path(cx: f64, cy: f64, r: f64) -> String {
    format!(
        "M{} {}A{r} {r} 0 1 1 {} {}A{r} {r} 0 1 1 {} {}Z",
        num(cx),
        num(cy - r),
        num(cx),
        num(cy + r),
        num(cx),
        num(cy - r),
        r = num(r),
    )
}

/// A value outside a fixed axis is drawn at the edge, not past it.
fn clamp(value: f64, scale: &Scale) -> f64 {
    value.clamp(scale.lo, scale.hi)
}

/// Draw every n-th category label so that labels do not overlap.
fn category_skip(
    painter: &Painter<'_>,
    categories: &[String],
    band: f64,
    size: f64,
) -> Result<usize, GenerateError> {
    let widest = widest(painter, categories, size, "categories")? + size / 2.0;
    if band <= 0.0 {
        return Ok(1);
    }
    let mut skip = 1usize;
    while (skip as f64) * band < widest && skip < categories.len() {
        skip += 1;
    }
    Ok(skip)
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    #[test]
    fn nice_steps_are_one_two_or_five_times_a_power_of_ten() {
        assert_eq!(nice_step(0.9), 1.0);
        assert_eq!(nice_step(1.5), 2.0);
        assert_eq!(nice_step(3.0), 5.0);
        assert_eq!(nice_step(7.0), 10.0);
        assert_eq!(nice_step(130.0), 200.0);
        assert!((nice_step(0.03) - 0.05).abs() < 1e-12);
    }

    #[test]
    fn a_scale_covers_the_data_with_round_ticks() {
        let scale = Scale::new(0.0, 87.0, None, None);
        assert_eq!(scale.lo, 0.0);
        assert_eq!(scale.hi, 100.0);
        assert_eq!(scale.ticks, vec![0.0, 20.0, 40.0, 60.0, 80.0, 100.0]);
    }

    #[test]
    fn csv_gives_one_series_for_each_column() {
        let spec =
            ChartSpec::from_csv(ChartType::Bar, "Quarter,North,South\nQ1,3,4\nQ2,5,1.5\n").unwrap();
        assert_eq!(spec.categories, vec!["Q1", "Q2"]);
        assert_eq!(spec.series.len(), 2);
        assert_eq!(spec.series[1].name, "South");
        assert_eq!(spec.series[1].values, vec![4.0, 1.5]);
        assert!(ChartSpec::from_csv(ChartType::Bar, "a,b\nx,y\n").is_err());
        assert!(ChartSpec::from_csv(ChartType::Bar, "a,b\nx\n").is_err());
    }

    #[test]
    fn a_spec_with_unequal_series_is_refused_naming_the_field() {
        let mut spec = ChartSpec::from_csv(ChartType::Line, "k,v\na,1\nb,2\n").unwrap();
        spec.series[0].values.pop();
        let error = spec.validate().unwrap_err();
        assert!(error.to_string().starts_with("series[0].values"), "{error}");
    }
}
