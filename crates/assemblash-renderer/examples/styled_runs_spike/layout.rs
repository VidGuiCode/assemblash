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
}

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
}

const CONFIG: Config = Config {
    width: 260.0,
    height: 360.0,
    paragraph_spacing: 0.0,
    line_height: 1.4,
    align: Align::Left,
    vertical: Vertical::Top,
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
    runs.iter()
        .flat_map(|(text, style)| text.chars().map(|ch| Character { ch, style: *style }))
        .collect()
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

fn measure(chars: &[Character], options: &usvg::Options) -> Result<f64, Box<dyn Error>> {
    if chars.is_empty() {
        return Ok(0.0);
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
        width: measure(&chars, options)?,
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

fn cluster_boundaries(
    word: &[Character],
    options: &usvg::Options,
) -> Result<Vec<usize>, Box<dyn Error>> {
    let body = text(word);
    let mut boundaries = body
        .char_indices()
        .map(|(index, _)| index)
        .chain([body.len()])
        .collect::<BTreeSet<_>>();
    let mut faces = BTreeSet::new();
    for character in word {
        faces.insert((
            character.style.family,
            character.style.weight,
            character.style.italic,
        ));
    }
    for (family, weight, italic) in faces {
        let face = options
            .fontdb
            .faces()
            .find(|face| {
                face.families.iter().any(|(name, _)| name == family)
                    && face.weight.0 == weight
                    && matches!(
                        face.style,
                        usvg::fontdb::Style::Italic | usvg::fontdb::Style::Oblique
                    ) == italic
            })
            .ok_or("exact cluster face absent")?;
        let clusters = options
            .fontdb
            .with_face_data(
                face.id,
                |bytes, index| -> Result<BTreeSet<usize>, Box<dyn Error>> {
                    let font = harfrust::FontRef::from_index(bytes, index)?;
                    let data = harfrust::ShaperData::new(&font);
                    let shaper = data.shaper(&font).build();
                    let mut buffer = harfrust::UnicodeBuffer::new();
                    buffer.push_str(&body);
                    buffer.guess_segment_properties();
                    let shaped = shaper.shape(buffer, harfrust::ShapeOptions::new());
                    Ok(shaped
                        .glyph_infos()
                        .iter()
                        .map(|info| info.cluster as usize)
                        .chain([body.len()])
                        .collect())
                },
            )
            .ok_or("cluster font bytes absent")??;
        boundaries = boundaries.intersection(&clusters).copied().collect();
    }
    Ok(boundaries
        .into_iter()
        .filter(|offset| *offset > 0)
        .map(|offset| body[..offset].chars().count())
        .collect())
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
        let mut words = Vec::new();
        let mut index = 0;
        while index < paragraph.len() {
            while index < paragraph.len() && paragraph[index].ch.is_whitespace() {
                index += 1;
            }
            if index == paragraph.len() {
                break;
            }
            let start = index;
            while index < paragraph.len() && !paragraph[index].ch.is_whitespace() {
                index += 1;
            }
            words.push(paragraph[start..index].to_vec());
        }
        let mut current = Vec::new();
        let first_line = lines.len();
        for word in words {
            let mut candidate = current.clone();
            if !candidate.is_empty() {
                candidate.push(Character {
                    ch: ' ',
                    style: word[0].style,
                });
            }
            candidate.extend_from_slice(&word);
            if measure(&candidate, options)? <= config.width {
                current = candidate;
                continue;
            }
            if !current.is_empty() {
                lines.push(line(std::mem::take(&mut current), fonts, options, config)?);
            }
            if measure(&word, options)? <= config.width {
                current = word;
                continue;
            }
            broke_word = true;
            let boundaries = cluster_boundaries(&word, options)?;
            let mut start = 0;
            while start < word.len() {
                let mut end = start;
                for candidate in boundaries.iter().copied().filter(|end| *end > start) {
                    if measure(&word[start..candidate], options)? <= config.width {
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

fn collect_rendered<'a>(group: &'a usvg::Group, nodes: &mut Vec<&'a usvg::Text>) {
    for node in group.children() {
        match node {
            usvg::Node::Text(text) => nodes.push(text),
            usvg::Node::Group(group) => collect_rendered(group, nodes),
            _ => {}
        }
    }
}

fn verify_rendered(
    layout: &Layout,
    svg: &str,
    options: &usvg::Options,
) -> Result<Vec<Value>, Box<dyn Error>> {
    let tree = usvg::Tree::from_str(svg, options)?;
    let mut nodes = Vec::new();
    collect_rendered(tree.root(), &mut nodes);
    let visible = layout
        .lines
        .iter()
        .filter(|line| !line.chars.is_empty())
        .collect::<Vec<_>>();
    assert_eq!(
        nodes.len(),
        visible.len(),
        "rendered line count disagrees with layout"
    );
    let mut glyphs = Vec::new();
    for (node, line) in nodes.iter().zip(visible) {
        let gaps = line.chars.iter().filter(|item| item.ch == ' ').count();
        let expected_width = line.width + line.word_spacing * gaps as f64;
        assert!(
            (f64::from(node.bounding_box().width()) - expected_width).abs() < 0.05,
            "shaped rendered width differs from measured width: {} versus {}",
            node.bounding_box().width(),
            expected_width
        );
        for span in node.layouted() {
            for glyph in &span.positioned_glyphs {
                assert_ne!(glyph.id.0, 0, "missing glyph must not pass the spike");
                let face = tree
                    .fontdb()
                    .face(glyph.font)
                    .ok_or("rendered face absent")?;
                let ts = glyph.transform();
                glyphs.push(json!({"id":glyph.id.0,"text":glyph.text,"family":face.families[0].0,
                    "weight":face.weight.0,"style":format!("{:?}",face.style),"size":glyph.font_size(),
                    "transform":[ts.sx,ts.kx,ts.ky,ts.sy,ts.tx,ts.ty]}));
            }
        }
    }
    Ok(glyphs)
}

fn geometry(value: &Value) -> Vec<String> {
    let mut glyphs = value
        .as_array()
        .expect("glyph array")
        .iter()
        .map(Value::to_string)
        .collect::<Vec<_>>();
    glyphs.sort();
    glyphs
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
    ];
    let directory = out.join("layout");
    fs::create_dir_all(&directory)?;
    let mut results = BTreeMap::new();
    for (name, runs, config) in cases {
        let chars = characters(&runs);
        let result = layout(&chars, fonts, options, config)?;
        let svg = render(&result, config);
        let glyphs = verify_rendered(&result, &svg, options)?;
        let mut hashes = BTreeMap::new();
        for scale in [1.0, 2.0] {
            let pixmap = svg_to_pixmap(&svg, fonts, scale)?;
            let png = pixmap_to_png(
                &pixmap,
                &PngMetadata {
                    document_id: "styled-layout-spike".into(),
                    schema_version: 1,
                    renderer_version: "spike-v2".into(),
                    created: None,
                },
            )?;
            fs::write(directory.join(format!("{name}-{scale}.png")), &png)?;
            hashes.insert(
                scale.to_string(),
                json!({"rgba":hash_bytes(pixmap.data()),"png":hash_bytes(&png)}),
            );
        }
        fs::write(directory.join(format!("{name}.svg")), &svg)?;
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
        results.insert(name.to_owned(), json!({"lines":lines,"glyphs":glyphs,"height":result.height,"brokeWord":result.broke_word,"overflow":result.overflow,"hashes":hashes,"svg":hash_bytes(svg.as_bytes())}));
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
    assert_eq!(
        geometry(&results["layout_paint_unsplit"]["glyphs"]),
        geometry(&results["layout_paint_split"]["glyphs"])
    );
    assert_eq!(
        geometry(&results["layout_arabic_unsplit"]["glyphs"]),
        geometry(&results["layout_arabic_colour"]["glyphs"])
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
    let report = json!({"candidate":"usvg shaped-line measurement and exact-face vertical metrics", "cases":results,"missingFontRefusals":missing,
        "limit":"isolated local candidate; no public model integration or six-target proof"});
    fs::write(
        directory.join("report.json"),
        serde_json::to_string_pretty(&report)? + "\n",
    )?;
    Ok(report)
}
