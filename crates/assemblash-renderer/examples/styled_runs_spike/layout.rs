//! Isolated layout candidate. Public document fields remain unchanged.

use std::{
    collections::{BTreeMap, BTreeSet},
    error::Error,
    fs,
    path::Path,
};

use assemblash_core::{ids::LayerId, storage::hash_bytes, FontStyle};
use assemblash_renderer::{pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata, RenderError};
use resvg::usvg;
use serde_json::{json, Value};

#[path = "outline_candidate.rs"]
mod outline_candidate;

#[derive(Debug, Clone, Copy, PartialEq)]
struct Style {
    family: &'static str,
    weight: u16,
    italic: bool,
    size: f64,
    spacing: f64,
    fill: &'static str,
}

const BASE: Style = Style {
    family: "Noto Sans",
    weight: 400,
    italic: false,
    size: 32.0,
    spacing: 0.0,
    fill: "#102030",
};

#[derive(Debug, Clone, Copy)]
struct Character {
    ch: char,
    style: Style,
    run_index: usize,
    character_index: usize,
    byte_index: usize,
}

#[derive(Debug)]
struct UnsupportedBoundary {
    run_index: usize,
    character_index: usize,
    byte_index: usize,
    reason: &'static str,
}

impl std::fmt::Display for UnsupportedBoundary {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            formatter,
            "unsupported run {} at character {} (byte {}): {}",
            self.run_index, self.character_index, self.byte_index, self.reason
        )
    }
}

impl Error for UnsupportedBoundary {}

#[derive(Debug, Clone)]
struct Line {
    chars: Vec<Character>,
    width: f64,
    ascent: f64,
    descent: f64,
    advance: f64,
    baseline: f64,
    paragraph_last: bool,
    word_spacing: f64,
    x: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum Align {
    Left,
    Center,
    Right,
    Justify,
}

#[derive(Debug, Clone, Copy)]
enum Vertical {
    Top,
    Middle,
    Bottom,
}

#[derive(Debug, Clone, Copy)]
struct Config {
    width: f64,
    height: f64,
    paragraph_spacing: f64,
    line_height: f64,
    align: Align,
    vertical: Vertical,
    exact_glyphs: bool,
}

const CONFIG: Config = Config {
    width: 260.0,
    height: 360.0,
    paragraph_spacing: 0.0,
    line_height: 1.4,
    align: Align::Left,
    vertical: Vertical::Top,
    exact_glyphs: true,
};

#[derive(Debug)]
struct Layout {
    lines: Vec<Line>,
    height: f64,
    broke_word: bool,
    overflow: bool,
}

fn text(chars: &[Character]) -> String {
    chars.iter().map(|item| item.ch).collect()
}

fn characters(runs: &[(&str, Style)]) -> Vec<Character> {
    let mut chars = Vec::new();
    let mut byte_index = 0;
    for (run_index, (text, style)) in runs.iter().enumerate() {
        for ch in text.chars() {
            chars.push(Character {
                ch,
                style: *style,
                run_index,
                character_index: chars.len(),
                byte_index,
            });
            byte_index += ch.len_utf8();
        }
    }
    chars
}

fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn spans(chars: &[Character], measuring: bool) -> String {
    let mut output = String::new();
    let mut start = 0;
    while start < chars.len() {
        let style = chars[start].style;
        let mut end = start + 1;
        while end < chars.len() && chars[end].style == style {
            end += 1;
        }
        output.push_str(&format!("<tspan font-family=\"{}\" font-weight=\"{}\" font-style=\"{}\" font-size=\"{}\" letter-spacing=\"{}\" fill=\"{}\">{}</tspan>",
            escape(style.family), style.weight, if style.italic { "italic" } else { "normal" }, style.size, style.spacing,
            if measuring { "#000000" } else { style.fill }, escape(&text(&chars[start..end]))));
        start = end;
    }
    output
}

fn text_node(group: &usvg::Group) -> Option<&usvg::Text> {
    for node in group.children() {
        match node {
            usvg::Node::Text(text) => return Some(text),
            usvg::Node::Group(group) => {
                if let Some(text) = text_node(group) {
                    return Some(text);
                }
            }
            _ => {}
        }
    }
    None
}

fn measure(
    chars: &[Character],
    options: &usvg::Options,
    exact_glyphs: bool,
) -> Result<f64, Box<dyn Error>> {
    if exact_glyphs {
        outline_candidate::measure(chars, options)
    } else {
        raw_measure(chars, options)
    }
}

fn raw_measure(chars: &[Character], options: &usvg::Options) -> Result<f64, Box<dyn Error>> {
    if chars.is_empty() {
        return Ok(0.0);
    }
    if chars.iter().all(|item| item.ch == ' ') {
        let mut width = 0.0;
        for (index, item) in chars.iter().enumerate() {
            let style = item.style;
            let face = options
                .fontdb
                .faces()
                .find(|face| {
                    face.families.iter().any(|(name, _)| name == style.family)
                        && face.weight.0 == style.weight
                        && matches!(
                            face.style,
                            usvg::fontdb::Style::Italic | usvg::fontdb::Style::Oblique
                        ) == style.italic
                })
                .ok_or("space face absent")?;
            width += options
                .fontdb
                .with_face_data(face.id, |bytes, index| -> Result<f64, Box<dyn Error>> {
                    let font = harfrust::FontRef::from_index(bytes, index)?;
                    let data = harfrust::ShaperData::new(&font);
                    let shaper = data.shaper(&font).build();
                    let mut buffer = harfrust::UnicodeBuffer::new();
                    buffer.push_str(" ");
                    buffer.guess_segment_properties();
                    let shaped = shaper.shape(buffer, harfrust::ShapeOptions::new());
                    Ok(shaped
                        .glyph_positions()
                        .iter()
                        .map(|position| f64::from(position.x_advance))
                        .sum::<f64>()
                        * style.size
                        / f64::from(shaper.units_per_em()))
                })
                .ok_or("space font data absent")??;
            if index + 1 < chars.len() {
                width += style.spacing;
            }
        }
        return Ok(width);
    }
    let svg = format!("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"8192\" height=\"1024\"><text x=\"0\" y=\"256\" xml:space=\"preserve\">{}</text></svg>", spans(chars, true));
    let tree = usvg::Tree::from_str(&svg, options)?;
    let node = text_node(tree.root()).ok_or("measurement produces no text")?;
    Ok(f64::from(node.bounding_box().width()))
}

fn require_style(
    style: Style,
    fonts: &LoadedFonts,
) -> Result<assemblash_renderer::FontSet, RenderError> {
    fonts
        .font_set()
        .select_face(
            style.family,
            style.weight,
            if style.italic {
                FontStyle::Italic
            } else {
                FontStyle::Normal
            },
        )
        .ok_or_else(|| RenderError::MissingFont {
            layer: LayerId::new("layer_00000000000000000000000001"),
            family: style.family.into(),
            weight: style.weight,
            style: if style.italic { "italic" } else { "normal" },
        })
}

fn line(
    chars: Vec<Character>,
    fonts: &LoadedFonts,
    options: &usvg::Options,
    config: Config,
) -> Result<Line, Box<dyn Error>> {
    let mut ascent = 0.0_f64;
    let mut descent = 0.0_f64;
    let mut size = 0.0_f64;
    for style in chars
        .iter()
        .map(|item| item.style)
        .chain(chars.is_empty().then_some(BASE))
    {
        let selected = require_style(style, fonts)?;
        ascent = ascent.max(style.size * selected.ascent_ratio(style.family));
        descent = descent.max(style.size * selected.descent_ratio(style.family));
        size = size.max(style.size);
    }
    Ok(Line {
        width: measure(&chars, options, config.exact_glyphs)?,
        chars,
        ascent,
        descent,
        advance: size * config.line_height,
        baseline: 0.0,
        paragraph_last: false,
        word_spacing: 0.0,
        x: 0.0,
    })
}

#[derive(Debug, Clone)]
struct SourceGlyph {
    byte_index: usize,
    glyph_id: u32,
    text: String,
    visual_run: usize,
    glyph_order: usize,
    ltr: bool,
    x_advance: i32,
    x_offset: i32,
    y_offset: i32,
    units_per_em: i32,
}

fn exact_face(style: Style, options: &usvg::Options) -> Result<usvg::fontdb::ID, Box<dyn Error>> {
    options
        .fontdb
        .faces()
        .find(|face| {
            face.families.iter().any(|(name, _)| name == style.family)
                && face.weight.0 == style.weight
                && matches!(
                    face.style,
                    usvg::fontdb::Style::Italic | usvg::fontdb::Style::Oblique
                ) == style.italic
        })
        .map(|face| face.id)
        .ok_or_else(|| "exact shaping face absent".into())
}

fn shape_source(
    body: &str,
    style: Style,
    options: &usvg::Options,
) -> Result<Vec<SourceGlyph>, Box<dyn Error>> {
    if body.is_empty() {
        return Ok(Vec::new());
    }
    let face = exact_face(style, options)?;
    options
        .fontdb
        .with_face_data(
            face,
            |bytes, index| -> Result<Vec<SourceGlyph>, Box<dyn Error>> {
                let font = harfrust::FontRef::from_index(bytes, index)?;
                let data = harfrust::ShaperData::new(&font);
                let shaper = data.shaper(&font).build();
                // Match usvg::shape_text_with_font: LTR paragraph base, visual bidi runs,
                // actual run direction, and complete run text including whitespace.
                let bidi = unicode_bidi::BidiInfo::new(body, Some(unicode_bidi::Level::ltr()));
                let paragraph = bidi.paragraphs.first().ok_or("bidi paragraph absent")?;
                let (levels, runs) = bidi.visual_runs(paragraph, paragraph.range.clone());
                let mut glyphs = Vec::new();
                for (visual_run, run) in runs.into_iter().enumerate() {
                    let sub_text = &body[run.clone()];
                    if sub_text.is_empty() {
                        continue;
                    }
                    let ltr = levels[run.start].is_ltr();
                    let mut buffer = harfrust::UnicodeBuffer::new();
                    buffer.push_str(sub_text);
                    buffer.set_direction(if ltr {
                        harfrust::Direction::LeftToRight
                    } else {
                        harfrust::Direction::RightToLeft
                    });
                    buffer.guess_segment_properties();
                    let shaped = shaper.shape(buffer, harfrust::ShapeOptions::new());
                    let infos = shaped.glyph_infos();
                    for (index, info) in infos.iter().enumerate() {
                        let position = shaped.glyph_positions()[index];
                        let start = info.cluster as usize;
                        let end = if ltr {
                            index.checked_add(1)
                        } else {
                            index.checked_sub(1)
                        }
                        .and_then(|next| infos.get(next))
                        .map_or(sub_text.len(), |next| next.cluster as usize);
                        glyphs.push(SourceGlyph {
                            byte_index: run.start + start,
                            glyph_id: info.glyph_id,
                            text: sub_text[start..end].to_owned(),
                            visual_run,
                            glyph_order: index,
                            ltr,
                            x_advance: position.x_advance,
                            x_offset: position.x_offset,
                            y_offset: position.y_offset,
                            units_per_em: shaper.units_per_em(),
                        });
                    }
                }
                Ok(glyphs)
            },
        )
        .ok_or("shaping font bytes absent")?
}

fn cluster_boundaries(
    chars: &[Character],
    options: &usvg::Options,
) -> Result<Vec<usize>, Box<dyn Error>> {
    let body = text(chars);
    let mut boundaries = body
        .char_indices()
        .map(|(index, _)| index)
        .chain([body.len()])
        .collect::<BTreeSet<_>>();
    let mut faces = BTreeSet::new();
    for character in chars {
        faces.insert((
            character.style.family,
            character.style.weight,
            character.style.italic,
        ));
    }
    for (family, weight, italic) in faces {
        let style = Style {
            family,
            weight,
            italic,
            ..BASE
        };
        let clusters: BTreeSet<_> = shape_source(&body, style, options)?
            .iter()
            .map(|glyph| glyph.byte_index)
            .chain([body.len()])
            .collect();
        boundaries = boundaries.intersection(&clusters).copied().collect();
    }
    Ok(boundaries
        .into_iter()
        .filter(|offset| *offset > 0)
        .map(|offset| body[..offset].chars().count())
        .collect())
}

fn check_boundaries(chars: &[Character], options: &usvg::Options) -> Result<(), Box<dyn Error>> {
    for paragraph in chars.split(|item| item.ch == '\n') {
        let boundaries = cluster_boundaries(paragraph, options)?;
        for index in 1..paragraph.len() {
            let left = paragraph[index - 1];
            let right = paragraph[index];
            if left.style == right.style || boundaries.contains(&index) {
                continue;
            }
            return Err(Box::new(UnsupportedBoundary {
                run_index: right.run_index,
                character_index: right.character_index,
                byte_index: right.byte_index,
                reason: "effective styles differ inside one shaping cluster",
            }));
        }
    }
    Ok(())
}

fn checked_layout(
    chars: &[Character],
    fonts: &LoadedFonts,
    options: &usvg::Options,
    config: Config,
) -> Result<Layout, Box<dyn Error>> {
    // Check faces before boundary analysis can read a requested face.
    for item in chars {
        require_style(item.style, fonts)?;
    }
    check_boundaries(chars, options)?;
    let result = layout(chars, fonts, options, config)?;
    for line in &result.lines {
        check_boundaries(&line.chars, options)?;
    }
    Ok(result)
}

fn layout(
    chars: &[Character],
    fonts: &LoadedFonts,
    options: &usvg::Options,
    config: Config,
) -> Result<Layout, Box<dyn Error>> {
    if !config.width.is_finite()
        || config.width <= 0.0
        || !config.height.is_finite()
        || config.height <= 0.0
        || !config.line_height.is_finite()
        || config.line_height <= 0.0
        || !config.paragraph_spacing.is_finite()
        || config.paragraph_spacing < 0.0
    {
        return Err("invalid layout dimensions or spacing".into());
    }
    for character in chars {
        let style = character.style;
        if !style.size.is_finite() || style.size <= 0.0 || !style.spacing.is_finite() {
            return Err("invalid run size or spacing".into());
        }
        require_style(style, fonts)?;
    }
    let mut lines = Vec::new();
    let mut broke_word = false;
    for paragraph in chars.split(|item| item.ch == '\n') {
        let paragraph_boundaries = cluster_boundaries(paragraph, options)?;
        let mut words = Vec::new();
        let mut index = 0;
        while index < paragraph.len() {
            let start = index;
            loop {
                while index < paragraph.len() && !paragraph[index].ch.is_whitespace() {
                    index += 1;
                }
                while index < paragraph.len() && paragraph[index].ch.is_whitespace() {
                    index += 1;
                }
                // Whitespace can own a combining mark. Never break its shaping cluster.
                if index == paragraph.len() || paragraph_boundaries.contains(&index) {
                    break;
                }
            }
            // Keep every original separator and its style, including paragraph-edge spaces.
            words.push(paragraph[start..index].to_vec());
        }
        let mut current = Vec::new();
        let first_line = lines.len();
        for word in words {
            let mut candidate = current.clone();
            candidate.extend_from_slice(&word);
            if measure(&candidate, options, config.exact_glyphs)? <= config.width {
                current = candidate;
                continue;
            }
            if !current.is_empty() {
                lines.push(line(std::mem::take(&mut current), fonts, options, config)?);
            }
            if measure(&word, options, config.exact_glyphs)? <= config.width {
                current = word;
                continue;
            }
            broke_word = true;
            let word_start = word[0].character_index - paragraph[0].character_index;
            let boundaries: Vec<_> = paragraph_boundaries
                .iter()
                .copied()
                .filter(|end| *end > word_start && *end <= word_start + word.len())
                .map(|end| end - word_start)
                .collect();
            let mut start = 0;
            while start < word.len() {
                let mut end = start;
                for candidate in boundaries.iter().copied().filter(|end| *end > start) {
                    if measure(&word[start..candidate], options, config.exact_glyphs)?
                        <= config.width
                    {
                        end = candidate;
                    } else {
                        break;
                    }
                }
                if end == start {
                    end = boundaries
                        .iter()
                        .copied()
                        .find(|end| *end > start)
                        .ok_or("cluster boundary missing")?;
                }
                let part = word[start..end].to_vec();
                if end < word.len() {
                    lines.push(line(part, fonts, options, config)?);
                } else {
                    current = part;
                }
                start = end;
            }
        }
        if !current.is_empty() || lines.len() == first_line {
            lines.push(line(current, fonts, options, config)?);
        }
        lines
            .last_mut()
            .ok_or("paragraph has no line")?
            .paragraph_last = true;
    }
    for index in 0..lines.len() {
        let baseline = if index == 0 {
            lines[index].ascent
        } else {
            let previous = &lines[index - 1];
            previous.baseline
                + previous.advance.max(previous.descent + lines[index].ascent)
                + if previous.paragraph_last {
                    config.paragraph_spacing
                } else {
                    0.0
                }
        };
        let item = &mut lines[index];
        item.baseline = baseline;
        let free = (config.width - item.width).max(0.0);
        item.x = match config.align {
            Align::Center => free / 2.0,
            Align::Right => free,
            _ => 0.0,
        };
        let gaps = item.chars.iter().filter(|item| item.ch == ' ').count();
        if config.align == Align::Justify && !item.paragraph_last && gaps > 0 {
            item.word_spacing = free / gaps as f64;
        }
    }
    let height = lines
        .last()
        .map_or(0.0, |line| line.baseline + line.descent);
    let free = (config.height - height).max(0.0);
    let shift = match config.vertical {
        Vertical::Top => 0.0,
        Vertical::Middle => free / 2.0,
        Vertical::Bottom => free,
    };
    for item in &mut lines {
        item.baseline += shift;
    }
    let overflow =
        height > config.height || lines.iter().any(|item| item.width > config.width + 0.0001);
    Ok(Layout {
        lines,
        height,
        broke_word,
        overflow,
    })
}

fn render(layout: &Layout, config: Config) -> String {
    let mut body = String::new();
    for line in &layout.lines {
        if line.chars.is_empty() {
            continue;
        }
        body.push_str(&format!(
            "<text x=\"{}\" y=\"{}\" xml:space=\"preserve\" word-spacing=\"{}\">{}</text>",
            24.0 + line.x,
            24.0 + line.baseline,
            line.word_spacing,
            spans(&line.chars, false)
        ));
    }
    format!("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"720\" height=\"540\"><defs><linearGradient id=\"run-gradient\"><stop offset=\"0\" stop-color=\"#b02050\"/><stop offset=\"1\" stop-color=\"#102030\"/></linearGradient><clipPath id=\"box\"><rect x=\"24\" y=\"24\" width=\"{}\" height=\"{}\"/></clipPath></defs><rect width=\"720\" height=\"540\" fill=\"#ffffff\"/><g clip-path=\"url(#box)\">{body}</g></svg>", config.width, config.height)
}

fn render_trusted(layout: &Layout, config: Config) -> String {
    let raw = render(layout, config);
    let mut body = String::new();
    for line in &layout.lines {
        if line.chars.is_empty() {
            continue;
        }
        body.push_str(&format!(
            "<tspan x=\"{}\" y=\"{}\" word-spacing=\"{}\">{}</tspan>",
            24.0 + line.x,
            24.0 + line.baseline,
            line.word_spacing,
            spans(&line.chars, false)
        ));
    }
    let start = raw.find("<text ");
    let end = raw.rfind("</text>");
    match (start, end) {
        (Some(start), Some(end)) => format!(
            "{}<text xml:space=\"preserve\">{body}</text>{}",
            &raw[..start],
            &raw[end + 7..]
        ),
        _ => raw,
    }
}

fn collect_rendered<'a>(group: &'a usvg::Group, nodes: &mut Vec<&'a usvg::Text>) {
    for node in group.children() {
        match node {
            usvg::Node::Text(text) => nodes.push(text),
            usvg::Node::Group(group) => collect_rendered(group, nodes),
            _ => {}
        }
    }
}

fn source_indexed_glyphs(
    chars: &[Character],
    options: &usvg::Options,
) -> Result<Vec<Value>, Box<dyn Error>> {
    let body = text(chars);
    let offsets: Vec<_> = body
        .char_indices()
        .map(|(index, _)| index)
        .chain([body.len()])
        .collect();
    let mut expected = Vec::new();
    let mut start = 0;
    while start < chars.len() {
        let style = chars[start].style;
        let mut end = start + 1;
        while end < chars.len() && chars[end].style == style {
            end += 1;
        }
        // usvg emits source spans in order and glyphs within each span in visual-run order.
        for glyph in shape_source(&body, style, options)? {
            if glyph.byte_index < offsets[start] || glyph.byte_index >= offsets[end] {
                continue;
            }
            let character_index = offsets
                .binary_search(&glyph.byte_index)
                .map_err(|_| "glyph cluster is not a scalar boundary")?;
            let source = chars[character_index];
            expected.push(
                json!({"id":glyph.glyph_id,"text":glyph.text,"family":style.family,
                "weight":style.weight,"style":if style.italic { "Italic" } else { "Normal" },
                "size":style.size,"paint":style.fill,"sourceCharacterIndex":source.character_index,
                "sourceByteIndex":source.byte_index}),
            );
        }
        start = end;
    }
    Ok(expected)
}

fn verify_source_order(actual: &[Value], expected: &[Value]) -> Result<(), Box<dyn Error>> {
    if actual.len() != expected.len() {
        return Err(format!("source-indexed glyph count differs: {} actual, {} expected; actual={actual:?}; expected={expected:?}", actual.len(), expected.len()).into());
    }
    for (actual, expected) in actual.iter().zip(expected) {
        for key in ["id", "text", "family", "weight", "style", "size", "paint"] {
            if actual[key] != expected[key] {
                return Err(format!(
                    "glyph {key} differs at source character {} (byte {})",
                    expected["sourceCharacterIndex"], expected["sourceByteIndex"]
                )
                .into());
            }
        }
    }
    Ok(())
}

fn verify_rendered(
    layout: &Layout,
    svg: &str,
    options: &usvg::Options,
    assert_styles: bool,
) -> Result<Vec<Value>, Box<dyn Error>> {
    let tree = usvg::Tree::from_str(svg, options)?;
    let mut nodes = Vec::new();
    collect_rendered(tree.root(), &mut nodes);
    let visible = layout
        .lines
        .iter()
        .filter(|line| line.chars.iter().any(|item| !item.ch.is_whitespace()))
        .collect::<Vec<_>>();
    assert_eq!(
        nodes.len(),
        visible.len(),
        "rendered line count disagrees with layout"
    );
    let mut glyphs = Vec::new();
    for (node, line) in nodes.iter().zip(visible) {
        let expected = if assert_styles {
            check_boundaries(&line.chars, options)?;
            source_indexed_glyphs(&line.chars, options)?
        } else {
            Vec::new()
        };
        let mut rendered = Vec::new();
        let gaps = line.chars.iter().filter(|item| item.ch == ' ').count();
        let expected_width = line.width + line.word_spacing * gaps as f64;
        assert!(
            (f64::from(node.bounding_box().width()) - expected_width).abs() < 0.05,
            "shaped rendered width differs from measured width: {} versus {}",
            node.bounding_box().width(),
            expected_width
        );
        for span in node.layouted() {
            let paint = match span.fill.as_ref().map(|fill| fill.paint()) {
                None => "none".to_owned(),
                Some(usvg::Paint::Color(color)) => {
                    format!("#{:02x}{:02x}{:02x}", color.red, color.green, color.blue)
                }
                Some(usvg::Paint::LinearGradient(_)) => "url(#run-gradient)".to_owned(),
                _ => return Err("unexpected run paint".into()),
            };
            for glyph in &span.positioned_glyphs {
                assert_ne!(glyph.id.0, 0, "missing glyph must not pass the spike");
                let face = tree
                    .fontdb()
                    .face(glyph.font)
                    .ok_or("rendered face absent")?;
                let ts = glyph.transform();
                rendered.push(json!({"id":glyph.id.0,"text":glyph.text,"family":face.families[0].0,
                    "weight":face.weight.0,"style":format!("{:?}",face.style),"size":glyph.font_size(),
                    "paint":paint,
                    "transform":[ts.sx,ts.kx,ts.ky,ts.sy,ts.tx,ts.ty]}));
            }
        }
        if assert_styles {
            verify_source_order(&rendered, &expected)?;
            for (glyph, source) in rendered.iter_mut().zip(&expected) {
                glyph["sourceCharacterIndex"] = source["sourceCharacterIndex"].clone();
                glyph["sourceByteIndex"] = source["sourceByteIndex"].clone();
            }
        }
        glyphs.extend(rendered);
    }
    Ok(glyphs)
}

fn trusted_glyphs(svg: &str, options: &usvg::Options) -> Result<Vec<Value>, Box<dyn Error>> {
    let tree = usvg::Tree::from_str(svg, options)?;
    let mut nodes = Vec::new();
    collect_rendered(tree.root(), &mut nodes);
    assert_eq!(nodes.len(), 1, "trusted reference must use one parent text");
    let mut glyphs = Vec::new();
    for span in nodes[0].layouted() {
        for glyph in &span.positioned_glyphs {
            assert_ne!(glyph.id.0, 0, "trusted reference has a missing glyph");
            let face = tree
                .fontdb()
                .face(glyph.font)
                .ok_or("reference face absent")?;
            let ts = glyph.transform();
            glyphs.push(
                json!({"id":glyph.id.0,"text":glyph.text,"family":face.families[0].0,
                "weight":face.weight.0,"style":format!("{:?}",face.style),"size":glyph.font_size(),
                "transform":[ts.sx,ts.kx,ts.ky,ts.sy,ts.tx,ts.ty]}),
            );
        }
    }
    Ok(glyphs)
}

fn geometry(value: &Value) -> Vec<(String, Vec<f64>)> {
    let mut glyphs = value
        .as_array()
        .expect("glyph array")
        .iter()
        .map(|glyph| {
            let mut geometry = glyph.clone();
            let object = geometry.as_object_mut().expect("glyph object");
            let transform: Vec<f64> = object
                .remove("transform")
                .expect("glyph transform")
                .as_array()
                .expect("transform array")
                .iter()
                .map(|value| value.as_f64().expect("transform number"))
                .collect();
            for key in [
                "paint",
                "sourceCharacterIndex",
                "sourceByteIndex",
                "outlinePathSha256",
                "outlineContourCount",
                "pathId",
                "fontSha256",
                "fontFaceIndex",
                "variationCoordinates",
                "sourceXAdvance",
            ] {
                object.remove(key);
            }
            (geometry.to_string(), transform)
        })
        .collect::<Vec<_>>();
    glyphs.sort_by(|left, right| {
        left.0.cmp(&right.0).then_with(|| {
            left.1
                .iter()
                .zip(&right.1)
                .find_map(|(left, right)| {
                    let order = left.total_cmp(right);
                    (!order.is_eq()).then_some(order)
                })
                .unwrap_or(std::cmp::Ordering::Equal)
        })
    });
    glyphs
}

fn compare_raw_geometry(left: &Value, right: &Value) {
    let left = geometry(left);
    let right = geometry(right);
    assert_eq!(left.len(), right.len(), "raw reference glyph count differs");
    for (left, right) in left.iter().zip(&right) {
        assert_eq!(left.0, right.0, "raw reference glyph identity differs");
        assert!(
            left.1
                .iter()
                .zip(&right.1)
                .all(|(left, right)| (left - right).abs() < 0.0001),
            "raw reference glyph placement differs"
        );
    }
}

pub(super) fn run_spike(
    out: &Path,
    fonts: &LoadedFonts,
    options: &usvg::Options,
) -> Result<Value, Box<dyn Error>> {
    let regular = BASE;
    let bold = Style {
        weight: 700,
        ..BASE
    };
    let red = Style {
        fill: "#b02050",
        ..BASE
    };
    let arabic = Style {
        family: "Noto Sans Arabic",
        ..BASE
    };
    let large = Style { size: 52.0, ..bold };
    let cases = vec![
        (
            "layout_gradient_resume_long",
            vec![
                (
                    "gradient ",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
                ("long solid middle ", regular),
                (
                    "gradient",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
            ],
            Config {
                width: 600.0,
                ..CONFIG
            },
        ),
        (
            "layout_gradient_resume_metrics",
            vec![
                (
                    "gradient line\n",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
                (
                    "a much wider solid middle line with a larger font\n",
                    Style {
                        size: 36.0,
                        ..regular
                    },
                ),
                (
                    "gradient resumes",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
            ],
            Config {
                width: 600.0,
                ..CONFIG
            },
        ),
        (
            "layout_gradient_resume",
            vec![
                (
                    "gradient ",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
                ("solid ", regular),
                (
                    "resumed",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
            ],
            Config {
                width: 600.0,
                ..CONFIG
            },
        ),
        (
            "layout_gradient_multiline",
            vec![
                (
                    "gradient words wrap ",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
                ("solid words wrap ", regular),
                (
                    "resumed gradient words",
                    Style {
                        fill: "url(#run-gradient)",
                        ..regular
                    },
                ),
            ],
            Config {
                width: 180.0,
                ..CONFIG
            },
        ),
        (
            "layout_gradient_reference",
            vec![(
                "gradient words",
                Style {
                    fill: "url(#run-gradient)",
                    ..regular
                },
            )],
            CONFIG,
        ),
        (
            "layout_arabic_spacing_positive",
            vec![(
                "مرحبا بالعالم",
                Style {
                    spacing: 2.0,
                    ..arabic
                },
            )],
            CONFIG,
        ),
        (
            "layout_arabic_spacing_negative",
            vec![(
                "مرحبا بالعالم",
                Style {
                    spacing: -2.0,
                    ..arabic
                },
            )],
            CONFIG,
        ),
        (
            "layout_latin_spacing_negative",
            vec![(
                "safe spacing",
                Style {
                    spacing: -2.0,
                    ..regular
                },
            )],
            CONFIG,
        ),
        (
            "layout_final_spacing_unused",
            vec![(
                "x",
                Style {
                    spacing: -64.0,
                    ..regular
                },
            )],
            CONFIG,
        ),
        (
            "layout_cursive_spacing_unused",
            vec![(
                "مرحبا",
                Style {
                    spacing: -64.0,
                    ..arabic
                },
            )],
            CONFIG,
        ),
        (
            "layout_natural_zero_mark",
            vec![("x\u{301}", regular)],
            CONFIG,
        ),
        (
            "layout_regular",
            vec![(
                "AVATAR highlight office",
                Style {
                    size: 40.0,
                    ..regular
                },
            )],
            Config {
                width: 180.0,
                ..CONFIG
            },
        ),
        (
            "layout_bold",
            vec![("AVATAR highlight office", Style { size: 40.0, ..bold })],
            Config {
                width: 180.0,
                ..CONFIG
            },
        ),
        (
            "layout_italic",
            vec![
                ("regular ", regular),
                (
                    "italic office",
                    Style {
                        italic: true,
                        ..regular
                    },
                ),
            ],
            CONFIG,
        ),
        (
            "layout_split_word",
            vec![
                ("prefix high", regular),
                ("light", bold),
                (" suffix office AVATAR", regular),
            ],
            CONFIG,
        ),
        (
            "layout_paint_unsplit",
            vec![(
                "office highlighted words wrap within this paragraph",
                regular,
            )],
            CONFIG,
        ),
        (
            "layout_paint_split",
            vec![
                ("of", regular),
                ("fice highlighted words wrap within this paragraph", red),
            ],
            CONFIG,
        ),
        (
            "layout_same_split",
            vec![
                ("of", regular),
                ("fice highlighted words wrap within this paragraph", regular),
            ],
            CONFIG,
        ),
        (
            "layout_arabic_unsplit",
            vec![("مرحبا بالعالم مرحبا بالعالم", arabic)],
            CONFIG,
        ),
        (
            "layout_arabic_split",
            vec![("مر", arabic), ("حبا بالعالم مرحبا بالعالم", arabic)],
            CONFIG,
        ),
        (
            "layout_arabic_colour",
            vec![
                (
                    "مر",
                    Style {
                        fill: "#b02050",
                        ..arabic
                    },
                ),
                ("حبا بالعالم مرحبا بالعالم", arabic),
            ],
            CONFIG,
        ),
        (
            "layout_bidi",
            vec![("abc ", regular), ("مرحبا", arabic), (" 123 office", bold)],
            CONFIG,
        ),
        (
            "layout_combining",
            vec![("Cafe", regular), ("\u{301} Cafe\u{301} Cafe\u{301}", red)],
            Config {
                width: 70.0,
                ..CONFIG
            },
        ),
        (
            "layout_long_word",
            vec![("Cafe\u{301}Cafe\u{301}Cafe\u{301}", regular)],
            Config {
                width: 50.0,
                ..CONFIG
            },
        ),
        (
            "layout_mixed_metrics",
            vec![
                ("large ", large),
                ("small ", Style { size: 18.0, ..BASE }),
                ("مرحبا", arabic),
            ],
            CONFIG,
        ),
        (
            "layout_paragraphs",
            vec![(
                "first paragraph wraps onto another line\n\nlast paragraph",
                regular,
            )],
            Config {
                paragraph_spacing: 24.0,
                ..CONFIG
            },
        ),
        (
            "layout_justify",
            vec![(
                "first paragraph wraps onto another line\nlast paragraph",
                regular,
            )],
            Config {
                align: Align::Justify,
                ..CONFIG
            },
        ),
        (
            "layout_single_word",
            vec![("AVATARAVATARAVATAR", regular)],
            Config {
                width: 95.0,
                align: Align::Justify,
                ..CONFIG
            },
        ),
        (
            "layout_middle",
            vec![("large ", large), ("small", regular)],
            Config {
                vertical: Vertical::Middle,
                ..CONFIG
            },
        ),
        (
            "layout_bottom",
            vec![("large ", large), ("small", regular)],
            Config {
                vertical: Vertical::Bottom,
                ..CONFIG
            },
        ),
        (
            "layout_center",
            vec![("centered text", regular)],
            Config {
                align: Align::Center,
                ..CONFIG
            },
        ),
        (
            "layout_right",
            vec![("مرحبا بالعالم", arabic)],
            Config {
                align: Align::Right,
                ..CONFIG
            },
        ),
        (
            "layout_spacing",
            vec![
                (
                    "letter spacing ",
                    Style {
                        spacing: 2.0,
                        ..BASE
                    },
                ),
                ("plain ending", regular),
            ],
            CONFIG,
        ),
        (
            "layout_gradient",
            vec![
                (
                    "gradient ",
                    Style {
                        fill: "url(#run-gradient)",
                        ..BASE
                    },
                ),
                ("solid\n", regular),
                (
                    "no fill",
                    Style {
                        fill: "none",
                        ..BASE
                    },
                ),
            ],
            CONFIG,
        ),
        ("layout_empty", vec![("", regular)], CONFIG),
        (
            "layout_empty_paragraphs",
            vec![("\n\n", regular)],
            Config {
                paragraph_spacing: 12.0,
                ..CONFIG
            },
        ),
        (
            "layout_overflow",
            vec![("one two three four five six seven", large)],
            Config {
                width: 100.0,
                height: 80.0,
                ..CONFIG
            },
        ),
        (
            "layout_plain_gap",
            vec![("alpha beta", regular)],
            Config {
                width: 600.0,
                ..CONFIG
            },
        ),
        (
            "layout_styled_gap",
            vec![
                ("alpha", regular),
                (
                    " ",
                    Style {
                        size: 80.0,
                        spacing: 16.0,
                        ..BASE
                    },
                ),
                ("beta", regular),
            ],
            Config {
                width: 600.0,
                ..CONFIG
            },
        ),
        (
            "layout_preserved_spaces",
            vec![("  alpha", regular), ("  ", red), ("beta  ", regular)],
            CONFIG,
        ),
        (
            "layout_styled_gap_wrap",
            vec![
                ("alpha", regular),
                ("  ", Style { size: 48.0, ..BASE }),
                ("beta gamma", regular),
            ],
            Config {
                width: 145.0,
                ..CONFIG
            },
        ),
        (
            "layout_whitespace_paragraphs",
            vec![(" \n  \n ", regular)],
            CONFIG,
        ),
        (
            "layout_ligature_weight",
            vec![("of", regular), ("fice", bold)],
            CONFIG,
        ),
        (
            "layout_ligature_size",
            vec![("of", regular), ("fice", Style { size: 48.0, ..BASE })],
            CONFIG,
        ),
        (
            "layout_ligature_italic",
            vec![
                ("of", regular),
                (
                    "fice",
                    Style {
                        italic: true,
                        ..BASE
                    },
                ),
            ],
            CONFIG,
        ),
        (
            "layout_ligature_spacing",
            vec![
                ("of", regular),
                (
                    "fice",
                    Style {
                        spacing: 3.0,
                        ..BASE
                    },
                ),
            ],
            CONFIG,
        ),
        (
            "layout_marks_same_style",
            vec![("Cafe", regular), ("\u{301}", regular)],
            CONFIG,
        ),
        (
            "layout_arabic_ligature_size",
            vec![
                ("ل", arabic),
                (
                    "ا",
                    Style {
                        size: 48.0,
                        ..arabic
                    },
                ),
            ],
            CONFIG,
        ),
        (
            "layout_space_mark_same_style",
            vec![(" \u{301} \u{301}", regular)],
            CONFIG,
        ),
        (
            "layout_space_mark_wrap",
            vec![("x \u{301} x \u{301}", regular)],
            Config {
                width: 35.0,
                ..CONFIG
            },
        ),
        (
            "layout_nospace_mixed_script",
            vec![("x", regular), ("لا", arabic)],
            CONFIG,
        ),
        (
            "layout_nospace_arabic_paints",
            vec![
                ("x", regular),
                ("ل", arabic),
                (
                    "ال",
                    Style {
                        fill: "#b02050",
                        ..arabic
                    },
                ),
                ("ا", arabic),
            ],
            CONFIG,
        ),
    ];
    let directory = out.join("layout");
    fs::create_dir_all(&directory)?;
    let mut results = BTreeMap::new();
    let mut trusted_references = BTreeMap::new();
    let mut boundary_refusals = BTreeMap::new();
    for (name, runs, config) in cases {
        let chars = characters(&runs);
        let (result, accepted) = match checked_layout(&chars, fonts, options, config) {
            Ok(result) => (result, true),
            Err(error) => {
                let boundary = error
                    .downcast_ref::<UnsupportedBoundary>()
                    .ok_or(error.to_string())?;
                boundary_refusals.insert(name.to_owned(), json!({"runIndex":boundary.run_index,"characterIndex":boundary.character_index,"byteIndex":boundary.byte_index,"reason":boundary.reason}));
                // Retain the original unsafe controls as diagnostics. They are never acceptance proof.
                (
                    layout(
                        &chars,
                        fonts,
                        options,
                        Config {
                            exact_glyphs: false,
                            ..config
                        },
                    )?,
                    false,
                )
            }
        };
        let original: String = chars
            .iter()
            .filter(|item| item.ch != '\n')
            .map(|item| item.ch)
            .collect();
        let reconstructed: String = result
            .lines
            .iter()
            .flat_map(|line| line.chars.iter().map(|item| item.ch))
            .collect();
        assert_eq!(
            original, reconstructed,
            "layout drops original whitespace or text"
        );
        let (svg, glyphs) = if accepted {
            outline_candidate::render(&result, config, options)?
        } else {
            let svg = render(&result, config);
            let glyphs = verify_rendered(&result, &svg, options, false)
                .map_err(|error| format!("{name}: {error}"))?;
            (svg, glyphs)
        };
        let reference = if [
            "layout_regular",
            "layout_bold",
            "layout_arabic_unsplit",
            "layout_marks_same_style",
            "layout_gradient_reference",
            "layout_gradient_resume_long",
            "layout_gradient_resume_metrics",
            "layout_gradient_resume",
            "layout_gradient_multiline",
            "layout_arabic_spacing_positive",
            "layout_arabic_spacing_negative",
            "layout_latin_spacing_negative",
            "layout_final_spacing_unused",
            "layout_cursive_spacing_unused",
        ]
        .contains(&name)
        {
            let svg = render_trusted(&result, config);
            let reference_glyphs = trusted_glyphs(&svg, options)?;
            compare_raw_geometry(&glyphs.clone().into(), &reference_glyphs.clone().into());
            fs::write(directory.join(format!("{name}-reference.svg")), &svg)?;
            Some((svg, reference_glyphs))
        } else {
            None
        };
        let mut reference_scales = BTreeMap::new();
        let mut hashes = BTreeMap::new();
        for scale in [1.0, 2.0] {
            let pixmap = svg_to_pixmap(&svg, fonts, scale)?;
            let png = pixmap_to_png(
                &pixmap,
                &PngMetadata {
                    document_id: "styled-layout-spike".into(),
                    schema_version: 1,
                    renderer_version: "spike-v7".into(),
                    created: None,
                },
            )?;
            fs::write(directory.join(format!("{name}-{scale}.png")), &png)?;
            if let Some((reference, _)) = &reference {
                let pixels = svg_to_pixmap(reference, fonts, scale)?;
                let reference_png = pixmap_to_png(
                    &pixels,
                    &PngMetadata {
                        document_id: "trusted-usvg-reference".into(),
                        schema_version: 1,
                        renderer_version: "spike-v7".into(),
                        created: None,
                    },
                )?;
                fs::write(
                    directory.join(format!("{name}-reference-{scale}.png")),
                    &reference_png,
                )?;
                let maximum = pixmap
                    .data()
                    .iter()
                    .zip(pixels.data())
                    .map(|(left, right)| left.abs_diff(*right))
                    .max()
                    .unwrap_or(0);
                let total: usize = pixmap
                    .data()
                    .iter()
                    .zip(pixels.data())
                    .map(|(left, right)| usize::from(left.abs_diff(*right)))
                    .sum();
                let changed = pixmap
                    .data()
                    .chunks_exact(4)
                    .zip(pixels.data().chunks_exact(4))
                    .filter(|(left, right)| left != right)
                    .count();
                assert!(maximum <= 16 && changed <= 2 && total <= 96, "trusted reference raster differs: {name}, max={maximum}, changed={changed}, total={total}");
                reference_scales.insert(scale.to_string(), json!({"png":hash_bytes(&reference_png),"rgba":hash_bytes(pixels.data()),"maximumChannelDifference":maximum,"totalChannelDifference":total,"changedPixels":changed,"pixelCount":pixmap.pixels().len()}));
            }
            hashes.insert(
                scale.to_string(),
                json!({"rgba":hash_bytes(pixmap.data()),"png":hash_bytes(&png)}),
            );
        }
        fs::write(directory.join(format!("{name}.svg")), &svg)?;
        if let Some((reference, glyphs)) = reference {
            trusted_references.insert(name.to_owned(), json!({"svg":hash_bytes(reference.as_bytes()),"glyphs":glyphs,"scales":reference_scales,"placementTolerancePx":0.0001, "strokeComparisons":stroke_references(name, &svg, &reference, fonts, &directory)?}));
        }
        let lines = result.lines.iter().map(|item| json!({"text":text(&item.chars),"width":item.width,"ascent":item.ascent,
            "descent":item.descent,"baseline":item.baseline,"paragraphLast":item.paragraph_last,"wordSpacing":item.word_spacing,"x":item.x})).collect::<Vec<_>>();
        if name == "layout_justify" {
            assert!(result.lines.iter().any(|line| line.word_spacing > 0.0));
            assert!(result
                .lines
                .iter()
                .filter(|line| line.paragraph_last)
                .all(|line| line.word_spacing == 0.0));
        }
        if name == "layout_single_word" {
            assert!(result.lines.iter().all(|line| line.word_spacing == 0.0));
        }
        if name == "layout_long_word" {
            assert!(result.broke_word);
            assert!(result
                .lines
                .iter()
                .all(|line| !text(&line.chars).starts_with('\u{301}')));
        }
        if name == "layout_overflow" {
            assert!(result.overflow);
        }
        results.insert(name.to_owned(), json!({"accepted":accepted,"diagnosticOnly":!accepted,"textPreserved":true,"stylesVerified":accepted,"sourceIndexedStylesVerified":accepted,"lines":lines,"glyphs":glyphs,"height":result.height,"brokeWord":result.broke_word,"overflow":result.overflow,"hashes":hashes,"svg":hash_bytes(svg.as_bytes())}));
    }
    assert!(
        results["layout_styled_gap"]["lines"][0]["width"]
            .as_f64()
            .expect("line width")
            > results["layout_plain_gap"]["lines"][0]["width"]
                .as_f64()
                .expect("line width")
    );
    for (name, runs) in [
        (
            "marks_size",
            vec![("Cafe", regular), ("\u{301}", Style { size: 80.0, ..BASE })],
        ),
        ("marks_weight", vec![("Cafe", regular), ("\u{301}", bold)]),
        ("marks_family", vec![("Cafe", regular), ("\u{301}", arabic)]),
        (
            "marks_spacing",
            vec![
                ("Cafe", regular),
                (
                    "\u{301}",
                    Style {
                        spacing: 3.0,
                        ..BASE
                    },
                ),
            ],
        ),
        ("marks_paint", vec![("Cafe", regular), ("\u{301}", red)]),
        (
            "marks_italic",
            vec![
                ("Cafe", regular),
                (
                    "\u{301}",
                    Style {
                        italic: true,
                        ..BASE
                    },
                ),
            ],
        ),
        ("ligature_family", vec![("of", regular), ("fice", arabic)]),
        ("ligature_paint", vec![("of", regular), ("fice", red)]),
        (
            "ligature_gradient",
            vec![
                ("of", regular),
                (
                    "fice",
                    Style {
                        fill: "url(#run-gradient)",
                        ..BASE
                    },
                ),
            ],
        ),
        (
            "ligature_no_fill",
            vec![
                ("of", regular),
                (
                    "fice",
                    Style {
                        fill: "none",
                        ..BASE
                    },
                ),
            ],
        ),
        (
            "bidi_ligature_weight",
            vec![("of", regular), ("fice ", bold), ("مرحبا", arabic)],
        ),
        ("space_mark_paint", vec![(" ", regular), ("\u{301}", red)]),
        (
            "space_mark_size",
            vec![(" ", regular), ("\u{301}", Style { size: 80.0, ..BASE })],
        ),
        (
            "space_mark_balanced_paint",
            vec![
                (" ", regular),
                ("\u{301}", red),
                (" ", red),
                ("\u{301}", regular),
            ],
        ),
    ] {
        let error = checked_layout(&characters(&runs), fonts, options, CONFIG)
            .expect_err("unsupported boundary must refuse");
        let boundary = error
            .downcast_ref::<UnsupportedBoundary>()
            .expect("typed boundary refusal");
        boundary_refusals.insert(name.to_owned(), json!({"runIndex":boundary.run_index,"characterIndex":boundary.character_index,"byteIndex":boundary.byte_index,"reason":boundary.reason}));
    }
    for (left, right) in [
        ("layout_paint_unsplit", "layout_same_split"),
        ("layout_arabic_unsplit", "layout_arabic_split"),
    ] {
        assert_eq!(
            results[left]["hashes"], results[right]["hashes"],
            "same-style split changes pixels"
        );
        assert_eq!(
            results[left]["lines"], results[right]["lines"],
            "same-style split changes layout"
        );
    }
    assert_eq!(
        results["layout_paint_unsplit"]["lines"],
        results["layout_paint_split"]["lines"]
    );
    assert_eq!(
        results["layout_arabic_unsplit"]["lines"],
        results["layout_arabic_colour"]["lines"]
    );
    compare_raw_geometry(
        &results["layout_paint_unsplit"]["glyphs"],
        &results["layout_paint_split"]["glyphs"],
    );
    compare_raw_geometry(
        &results["layout_arabic_unsplit"]["glyphs"],
        &results["layout_arabic_colour"]["glyphs"],
    );
    let missing = [
        Style {
            family: "Absent",
            ..BASE
        },
        Style {
            weight: 900,
            ..BASE
        },
        Style {
            weight: 700,
            italic: true,
            ..BASE
        },
    ]
    .iter()
    .map(|style| {
        let error = layout(&characters(&[("missing", *style)]), fonts, options, CONFIG)
            .expect_err("absent face must refuse");
        assert!(error
            .downcast_ref::<RenderError>()
            .is_some_and(|error| matches!(error, RenderError::MissingFont { .. })));
        error.to_string()
    })
    .collect::<Vec<_>>();
    let expected_diagnostics = [
        "layout_paint_split",
        "layout_combining",
        "layout_ligature_weight",
        "layout_ligature_size",
        "layout_ligature_italic",
        "layout_ligature_spacing",
    ];
    assert!(
        results["layout_natural_zero_mark"]["glyphs"]
            .as_array()
            .expect("natural zero-advance glyph evidence")
            .iter()
            .any(|glyph| glyph["sourceXAdvance"] == 0 && glyph["outlinePathSha256"].is_string()),
        "naturally zero-advance mark loses its outline"
    );
    let bidi = results["layout_bidi"]["glyphs"]
        .as_array()
        .expect("bidi glyphs");
    for id in [8, 44] {
        assert!(
            bidi.iter().any(|glyph| glyph["id"] == id
                && glyph["family"] == "Noto Sans Arabic"
                && glyph["sourceCharacterIndex"] == 7
                && glyph["sourceByteIndex"] == 10
                && glyph["outlinePathSha256"].is_string()),
            "mixed-font beh loses an outline"
        );
    }
    for (name, result) in &results {
        assert_eq!(
            result["accepted"],
            !expected_diagnostics.contains(&name.as_str()),
            "unexpected supported or refused layout control"
        );
    }
    let report = json!({"candidate":"source-indexed HarfRust cluster assembly and pinned skrifa outlines", "cases":results,"missingFontRefusals":missing,
        "trustedReferences":trusted_references,"mixedFontBodyAndDotVerified":true,
        "boundaryRefusals":boundary_refusals,"spacingRefusals":spacing_refusals(fonts, options)?,"readyForProductIntegration":true,
        "boundaryPolicy":"effective styles must agree within one shaping cluster",
        "limit":"incompatible cluster styles receive typed refusal; diagnostic images are not accepted renders; public integration and six-native proof remain separate"});
    fs::write(
        directory.join("report.json"),
        serde_json::to_string_pretty(&report)? + "\n",
    )?;
    Ok(report)
}

fn stroke_references(
    name: &str,
    candidate: &str,
    reference: &str,
    fonts: &LoadedFonts,
    directory: &Path,
) -> Result<Value, Box<dyn Error>> {
    let mut comparisons = BTreeMap::new();
    for (mode, attributes) in [
        ("stroke", "stroke=\"#213141\" stroke-width=\"1.5\""),
        (
            "stroke-first",
            "stroke=\"#213141\" stroke-width=\"1.5\" paint-order=\"stroke fill\"",
        ),
    ] {
        let candidate = candidate.replace("<g clip-path", &format!("<g {attributes} clip-path"));
        let reference = reference.replace("<g clip-path", &format!("<g {attributes} clip-path"));
        fs::write(directory.join(format!("{name}-{mode}.svg")), &candidate)?;
        fs::write(
            directory.join(format!("{name}-{mode}-reference.svg")),
            &reference,
        )?;
        let mut scales = BTreeMap::new();
        for scale in [1.0, 2.0] {
            let left = svg_to_pixmap(&candidate, fonts, scale)?;
            let right = svg_to_pixmap(&reference, fonts, scale)?;
            let mut changed = 0;
            let mut maximum = 0;
            let mut total = 0_usize;
            for (left, right) in left
                .data()
                .chunks_exact(4)
                .zip(right.data().chunks_exact(4))
            {
                changed += usize::from(left != right);
                for (left, right) in left.iter().zip(right) {
                    let delta = left.abs_diff(*right);
                    maximum = maximum.max(delta);
                    total += usize::from(delta);
                }
            }
            assert!(maximum <= 16 && changed <= 2 && total <= 96,
                "trusted {mode} raster differs: {name}, scale={scale}, max={maximum}, changed={changed}, total={total}");
            let mut hashes = Vec::new();
            for (suffix, pixels) in [("", &left), ("-reference", &right)] {
                let png = pixmap_to_png(
                    pixels,
                    &PngMetadata {
                        document_id: "styled-stroke-reference".into(),
                        schema_version: 1,
                        renderer_version: "spike-v7".into(),
                        created: None,
                    },
                )?;
                fs::write(
                    directory.join(format!("{name}-{mode}{suffix}-{scale}.png")),
                    &png,
                )?;
                hashes.push(hash_bytes(&png));
            }
            scales.insert(scale.to_string(), json!({"png":hashes[0],"referencePng":hashes[1],
                "changedPixels":changed,"maximumChannelDifference":maximum,"totalChannelDifference":total}));
        }
        comparisons.insert(
            mode,
            json!({"svg":hash_bytes(candidate.as_bytes()),
            "referenceSvg":hash_bytes(reference.as_bytes()),"scales":scales}),
        );
    }
    Ok(json!(comparisons))
}

fn spacing_refusals(fonts: &LoadedFonts, options: &usvg::Options) -> Result<Value, Box<dyn Error>> {
    let advance = outline_candidate::measure(&characters(&[("x", BASE)]), options)?;
    let mut refusals = BTreeMap::new();
    for (name, runs) in [
        (
            "exact_zero",
            vec![(
                "xx",
                Style {
                    spacing: -advance,
                    ..BASE
                },
            )],
        ),
        (
            "negative",
            vec![(
                "xx",
                Style {
                    spacing: -advance - 1.0,
                    ..BASE
                },
            )],
        ),
        (
            "indexed_extreme",
            vec![
                ("é", BASE),
                (
                    "xx",
                    Style {
                        spacing: -64.0,
                        ..BASE
                    },
                ),
            ],
        ),
    ] {
        let error = checked_layout(&characters(&runs), fonts, options, CONFIG)
            .expect_err("nonpositive spaced advance must refuse");
        let spacing = error
            .downcast_ref::<outline_candidate::UnsupportedSpacing>()
            .expect("typed spacing geometry refusal");
        let expected = if name == "indexed_extreme" {
            (1, 1, 2)
        } else {
            (0, 0, 0)
        };
        assert_eq!(
            (
                spacing.run_index,
                spacing.character_index,
                spacing.byte_index
            ),
            expected
        );
        refusals.insert(name, json!({"runIndex":spacing.run_index,
            "characterIndex":spacing.character_index,"byteIndex":spacing.byte_index,"reason":spacing.reason}));
    }
    Ok(json!(refusals))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn source_order_refuses_a_balanced_paint_swap() {
        let first = json!({"id":89,"text":"x","family":"Noto Sans","weight":400,"style":"Normal","size":32.0,"paint":"#102030","sourceCharacterIndex":0,"sourceByteIndex":0});
        let mut second = first.clone();
        second["paint"] = json!("#b02050");
        second["sourceCharacterIndex"] = json!(1);
        second["sourceByteIndex"] = json!(1);
        let expected = vec![first, second];
        assert!(verify_source_order(&expected, &expected).is_ok());
        let mut swapped = expected.clone();
        swapped[0]["paint"] = expected[1]["paint"].clone();
        swapped[1]["paint"] = expected[0]["paint"].clone();
        let error =
            verify_source_order(&swapped, &expected).expect_err("balanced paint swaps must fail");
        assert!(error.to_string().contains("source character 0 (byte 0)"));
    }

    fn shaping_options() -> usvg::Options<'static> {
        let mut database = usvg::fontdb::Database::new();
        let directory = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("tests")
            .join("fonts");
        for name in [
            "NotoSans-Subset.ttf",
            "NotoSans-Bold-Subset.ttf",
            "NotoSansArabic-Subset.ttf",
        ] {
            database.load_font_data(fs::read(directory.join(name)).expect("pinned font"));
        }
        usvg::Options {
            fontdb: std::sync::Arc::new(database),
            ..Default::default()
        }
    }

    #[test]
    fn paragraph_guard_refuses_space_mark_styles_at_original_indices() {
        let options = shaping_options();
        let red = Style {
            fill: "#b02050",
            ..BASE
        };
        for runs in [
            vec![(" ", BASE), ("\u{301}", red)],
            vec![(" ", BASE), ("\u{301}", Style { size: 80.0, ..BASE })],
            vec![(" ", BASE), ("\u{301}", red), (" ", red), ("\u{301}", BASE)],
        ] {
            let chars = characters(&runs);
            let error = check_boundaries(&chars, &options).expect_err("incompatible cluster");
            let boundary = error
                .downcast_ref::<UnsupportedBoundary>()
                .expect("typed boundary error");
            assert_eq!(
                (
                    boundary.run_index,
                    boundary.character_index,
                    boundary.byte_index
                ),
                (1, 1, 1)
            );
        }
        let chars = characters(&[("é ", BASE), ("\u{301}", red)]);
        let error = check_boundaries(&chars, &options)
            .expect_err("incompatible cluster after multibyte text");
        let boundary = error
            .downcast_ref::<UnsupportedBoundary>()
            .expect("typed boundary error");
        assert_eq!(
            (
                boundary.run_index,
                boundary.character_index,
                boundary.byte_index
            ),
            (1, 2, 3)
        );
    }

    #[test]
    fn paragraph_guard_keeps_compatible_space_marks_and_mixed_scripts() {
        let options = shaping_options();
        assert!(check_boundaries(&characters(&[(" \u{301} \u{301}", BASE)]), &options).is_ok());
        let arabic = Style {
            family: "Noto Sans Arabic",
            ..BASE
        };
        assert!(check_boundaries(&characters(&[("x", BASE), ("لا", arabic)]), &options).is_ok());
    }
}
