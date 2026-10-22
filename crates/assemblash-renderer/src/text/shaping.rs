use std::{collections::BTreeSet, sync::Arc};

use assemblash_core::{Color, FontStyle, Layer, TextAlign, TextLayer, VerticalAlign};
use resvg::tiny_skia::{NonZeroRect, Path, PathBuilder, Transform};
use skrifa::{
    outline::{DrawSettings, OutlinePen},
    prelude::{GlyphId, LocationRef, NormalizedCoord, Size},
    MetadataProvider,
};
use unicode_script::{Script, UnicodeScript};

use super::{
    TextEmission, TextEmissionLine, TextFailureKind as Kind, TextGlyph, TextLayerLayout,
    TextLayoutError, TextLine,
};
use crate::{FontFaceData, FontSet, RenderError};

#[derive(Debug, Clone, Copy, Default)]
struct Source {
    run: usize,
    character: usize,
    byte: usize,
}

fn fail(layer: &Layer, source: Source, kind: Kind, reason: impl Into<String>) -> RenderError {
    RenderError::TextLayout {
        layer: layer.id.clone(),
        source: TextLayoutError::Unsupported {
            kind,
            run_index: source.run,
            character_index: source.character,
            byte_index: source.byte,
            reason: reason.into(),
        },
    }
}

#[derive(Debug)]
struct Style {
    face: FontFaceData,
    coordinates: Vec<i16>,
    family: String,
    size: f32,
    spacing: f32,
    paint: Option<Color>,
    paint_key: serde_json::Value,
    ascent: f32,
    descent: f32,
    units: f32,
}

impl PartialEq for Style {
    fn eq(&self, other: &Self) -> bool {
        self.face.sha256() == other.face.sha256()
            && self.face.index() == other.face.index()
            && self.coordinates == other.coordinates
            && self.size == other.size
            && self.spacing == other.spacing
            && self.paint_key == other.paint_key
    }
}

fn paint_key(paint: &Option<Color>) -> serde_json::Value {
    use serde_json::json;
    let stops = |stops: &[assemblash_core::GradientStop]| {
        stops
            .iter()
            .map(|stop| json!([stop.offset, stop.color.to_rgba(), stop.alpha]))
            .collect::<Vec<_>>()
    };
    match paint {
        None => serde_json::Value::Null,
        Some(Color::Solid(solid)) => json!(solid.to_rgba()),
        Some(Color::Linear(gradient)) => {
            json!({"linear":[gradient.angle.rem_euclid(360.0),stops(&gradient.stops)]})
        }
        Some(Color::Radial(gradient)) => {
            json!({"radial":[gradient.center.x,gradient.center.y,gradient.radius,stops(&gradient.stops)]})
        }
        Some(Color::Other(_)) => json!({"unsupported":true}),
    }
}

#[allow(clippy::too_many_arguments)]
fn style(
    layer: &Layer,
    fonts: &FontSet,
    source: Source,
    family: &str,
    size: f64,
    weight: u16,
    font_style: FontStyle,
    spacing: f64,
    paint: Option<Color>,
) -> Result<Arc<Style>, RenderError> {
    if !fonts.contains_face(family, weight, font_style) {
        return Err(RenderError::MissingFont {
            layer: layer.id.clone(),
            family: family.into(),
            weight,
            style: font_style.as_str(),
        });
    }
    let face = fonts
        .face_data(family, weight, font_style)
        .ok_or_else(|| {
            fail(
                layer,
                source,
                Kind::FontDataUnavailable,
                format!(
                    "exact font bytes are unavailable for {family:?}, weight {weight}, {}",
                    font_style.as_str()
                ),
            )
        })?
        .clone();
    let size = size as f32;
    let spacing = spacing as f32;
    if !size.is_finite() || size <= 0.0 || !spacing.is_finite() {
        return Err(fail(
            layer,
            source,
            Kind::InvalidGeometry,
            "font size or letter spacing exceeds finite render coordinates",
        ));
    }
    let font = skrifa::FontRef::from_index(face.bytes(), face.index())
        .map_err(|error| fail(layer, source, Kind::InvalidFontData, error.to_string()))?;
    let mut settings = vec![("wght", f32::from(weight)), ("opsz", size)];
    if font_style == FontStyle::Italic {
        settings.push(("ital", 1.0));
    }
    let location = font.axes().location(settings);
    let coordinates = location
        .coords()
        .iter()
        .map(|coord| coord.to_bits())
        .collect();
    let metrics = font.metrics(Size::unscaled(), location.coords());
    let units = f32::from(metrics.units_per_em);
    if !(16.0..=16384.0).contains(&units) {
        return Err(fail(
            layer,
            source,
            Kind::InvalidFontData,
            "invalid units per em",
        ));
    }
    let scale = size / units;
    let ascent = metrics.ascent * scale;
    let descent = -metrics.descent * scale;
    if !ascent.is_finite() || !descent.is_finite() {
        return Err(fail(
            layer,
            source,
            Kind::InvalidGeometry,
            "font metrics exceed finite render coordinates",
        ));
    }
    Ok(Arc::new(Style {
        face,
        coordinates,
        family: family.into(),
        size,
        spacing,
        paint_key: paint_key(&paint),
        paint,
        ascent,
        descent,
        units,
    }))
}

#[derive(Clone)]
struct Character {
    ch: char,
    style: Arc<Style>,
    source: Source,
}
fn body(chars: &[Character]) -> String {
    chars.iter().map(|item| item.ch).collect()
}

#[derive(Clone)]
struct Glyph {
    byte: usize,
    id: u32,
    run: usize,
    order: usize,
    ltr: bool,
    advance: i32,
    dx: i32,
    dy: i32,
}

fn shape(
    text: &str,
    style: &Style,
    layer: &Layer,
    source: Source,
) -> Result<Vec<Glyph>, RenderError> {
    if text.is_empty() {
        return Ok(Vec::new());
    }
    let font = harfrust::FontRef::from_index(style.face.bytes(), style.face.index())
        .map_err(|error| fail(layer, source, Kind::InvalidFontData, error.to_string()))?;
    let instance = harfrust::ShaperInstance::from_coords(
        &font,
        style
            .coordinates
            .iter()
            .map(|bits| harfrust::NormalizedCoord::from_bits(*bits)),
    );
    let data = harfrust::ShaperData::new(&font);
    let shaper = data.shaper(&font).instance(Some(&instance)).build();
    let bidi = unicode_bidi::BidiInfo::new(text, Some(unicode_bidi::Level::ltr()));
    let mut result = Vec::new();
    let mut run_index = 0;
    for paragraph in &bidi.paragraphs {
        let (levels, runs) = bidi.visual_runs(paragraph, paragraph.range.clone());
        for run in runs {
            let ltr = levels[run.start].is_ltr();
            let mut buffer = harfrust::UnicodeBuffer::new();
            buffer.push_str(&text[run.clone()]);
            buffer.set_direction(if ltr {
                harfrust::Direction::LeftToRight
            } else {
                harfrust::Direction::RightToLeft
            });
            buffer.guess_segment_properties();
            let shaped = shaper.shape(buffer, harfrust::ShapeOptions::new());
            for (order, (info, position)) in shaped
                .glyph_infos()
                .iter()
                .zip(shaped.glyph_positions())
                .enumerate()
            {
                result.push(Glyph {
                    byte: run.start + info.cluster as usize,
                    id: info.glyph_id,
                    run: run_index,
                    order,
                    ltr,
                    advance: position.x_advance,
                    dx: position.x_offset,
                    dy: position.y_offset,
                });
            }
            run_index += 1;
        }
    }
    Ok(result)
}

fn boundaries(chars: &[Character], layer: &Layer) -> Result<BTreeSet<usize>, RenderError> {
    let text = body(chars);
    let mut result = text
        .char_indices()
        .map(|(index, _)| index)
        .chain([text.len()])
        .collect::<BTreeSet<_>>();
    let mut faces = BTreeSet::new();
    for character in chars {
        let key = (
            character.style.face.sha256(),
            character.style.face.index(),
            &character.style.coordinates,
        );
        if !faces.insert(key) {
            continue;
        }
        let clusters = shape(&text, &character.style, layer, character.source)?
            .into_iter()
            .map(|glyph| glyph.byte)
            .chain([text.len()])
            .collect();
        result = result.intersection(&clusters).copied().collect();
    }
    let offsets = text
        .char_indices()
        .map(|(offset, _)| offset)
        .collect::<Vec<_>>();
    for (index, pair) in chars.windows(2).enumerate() {
        if pair[0].style != pair[1].style && !result.contains(&offsets[index + 1]) {
            return Err(fail(
                layer,
                pair[1].source,
                Kind::IncompatibleCluster,
                "effective styles differ inside one shaping cluster",
            ));
        }
    }
    Ok(result
        .into_iter()
        .map(|offset| text[..offset].chars().count())
        .collect())
}

#[derive(Clone)]
struct Selected {
    glyph: Glyph,
    character: Character,
}
struct Cluster {
    glyphs: Vec<Selected>,
    advance: f32,
}

fn supports_spacing(ch: char) -> bool {
    !matches!(
        ch.script(),
        Script::Arabic
            | Script::Syriac
            | Script::Nko
            | Script::Manichaean
            | Script::Psalter_Pahlavi
            | Script::Mandaic
            | Script::Mongolian
            | Script::Phags_Pa
            | Script::Devanagari
            | Script::Bengali
            | Script::Gurmukhi
            | Script::Modi
            | Script::Sharada
            | Script::Syloti_Nagri
            | Script::Tirhuta
            | Script::Ogham
    )
}

fn clusters(chars: &[Character], layer: &Layer) -> Result<Vec<Cluster>, RenderError> {
    let text = body(chars);
    let offsets = text
        .char_indices()
        .map(|(index, _)| index)
        .chain([text.len()])
        .collect::<Vec<_>>();
    let mut selected = Vec::new();
    let mut start = 0;
    while start < chars.len() {
        let style = &chars[start].style;
        let mut end = start + 1;
        while end < chars.len() && chars[end].style == *style {
            end += 1;
        }
        for glyph in shape(&text, style, layer, chars[start].source)? {
            if glyph.byte < offsets[start] || glyph.byte >= offsets[end] {
                continue;
            }
            let index = offsets.binary_search(&glyph.byte).map_err(|_| {
                fail(
                    layer,
                    chars[start].source,
                    Kind::InvalidFontData,
                    "invalid shaping cluster offset",
                )
            })?;
            if glyph.id == 0 {
                return Err(fail(
                    layer,
                    chars[index].source,
                    Kind::MissingGlyph,
                    format!(
                        "exact face {:?} has no glyph for {:?}",
                        style.family, chars[index].ch
                    ),
                ));
            }
            selected.push(Selected {
                glyph,
                character: chars[index].clone(),
            });
        }
        start = end;
    }
    selected.sort_by(|left, right| {
        left.glyph
            .run
            .cmp(&right.glyph.run)
            .then_with(|| {
                if left.glyph.ltr {
                    left.glyph.byte.cmp(&right.glyph.byte)
                } else {
                    right.glyph.byte.cmp(&left.glyph.byte)
                }
            })
            .then(left.glyph.order.cmp(&right.glyph.order))
    });
    let mut result: Vec<Cluster> = Vec::new();
    for glyph in selected {
        let append = result.last().is_some_and(|cluster| {
            cluster.glyphs[0].glyph.run == glyph.glyph.run
                && cluster.glyphs[0].glyph.byte == glyph.glyph.byte
        });
        if !append {
            result.push(Cluster {
                glyphs: Vec::new(),
                advance: 0.0,
            });
        }
        let cluster = result.last_mut().ok_or_else(|| {
            fail(
                layer,
                glyph.character.source,
                Kind::InvalidFontData,
                "shaping cluster missing",
            )
        })?;
        cluster.advance +=
            glyph.glyph.advance as f32 * (glyph.character.style.size / glyph.character.style.units);
        cluster.glyphs.push(glyph);
    }
    let count = result.len();
    for (index, cluster) in result.iter_mut().enumerate() {
        let character = &cluster.glyphs[0].character;
        if index + 1 < count && character.style.spacing != 0.0 && supports_spacing(character.ch) {
            cluster.advance += character.style.spacing;
            if cluster.advance <= 0.0 {
                return Err(fail(
                    layer,
                    character.source,
                    Kind::InvalidSpacing,
                    "applied letter spacing makes cluster advance nonpositive",
                ));
            }
        }
        if !cluster.advance.is_finite() {
            return Err(fail(
                layer,
                character.source,
                Kind::InvalidGeometry,
                "cluster advance exceeds finite render coordinates",
            ));
        }
    }
    Ok(result)
}

fn measure(chars: &[Character], layer: &Layer) -> Result<f64, RenderError> {
    let advance = clusters(chars, layer)?
        .iter()
        .map(|cluster| cluster.advance)
        .sum::<f32>();
    if !advance.is_finite() {
        return Err(fail(
            layer,
            chars.first().map_or(Source::default(), |ch| ch.source),
            Kind::InvalidGeometry,
            "line advance exceeds finite render coordinates",
        ));
    }
    Ok(f64::from(advance))
}

struct Line {
    chars: Vec<Character>,
    width: f64,
    ascent: f64,
    descent: f64,
    size: f64,
    baseline: f64,
    x: f64,
}

fn line(chars: Vec<Character>, base: &Style, layer: &Layer) -> Result<Line, RenderError> {
    let (ascent, descent, size) = if chars.is_empty() {
        (base.ascent, base.descent, base.size)
    } else {
        chars
            .iter()
            .fold((0.0_f32, 0.0_f32, 0.0_f32), |(a, d, s), ch| {
                (
                    a.max(ch.style.ascent),
                    d.max(ch.style.descent),
                    s.max(ch.style.size),
                )
            })
    };
    Ok(Line {
        width: measure(&chars, layer)?,
        chars,
        ascent: f64::from(ascent),
        descent: f64::from(descent),
        size: f64::from(size),
        baseline: 0.0,
        x: 0.0,
    })
}

pub(super) fn layout(
    layer: &Layer,
    text: &TextLayer,
    width: f64,
    fonts: &FontSet,
) -> Result<TextLayerLayout, RenderError> {
    if !text.line_height.is_finite()
        || text.line_height <= 0.0
        || !layer.transform.height.is_finite()
    {
        return Err(fail(
            layer,
            Source::default(),
            Kind::InvalidGeometry,
            "line height or layer height is invalid",
        ));
    }
    let runs = text
        .interpreted_runs()
        .map_err(|source| RenderError::TextLayout {
            layer: layer.id.clone(),
            source: source.into(),
        })?;
    let base = style(
        layer,
        fonts,
        Source::default(),
        &text.font_family,
        text.font_size,
        text.font_weight,
        text.font_style,
        text.letter_spacing,
        text.color.clone(),
    )?;
    let mut chars = Vec::new();
    for run in runs {
        if run.text.is_empty() {
            continue;
        }
        let source = Source {
            run: run.run_index,
            character: run.character_index,
            byte: run.byte_index,
        };
        let resolved = style(
            layer,
            fonts,
            source,
            run.font_family,
            run.font_size,
            run.font_weight,
            run.font_style,
            run.letter_spacing,
            run.color,
        )?;
        let mut byte = run.byte_index;
        for (index, ch) in run.text.chars().enumerate() {
            chars.push(Character {
                ch,
                style: resolved.clone(),
                source: Source {
                    run: run.run_index,
                    character: run.character_index + index,
                    byte,
                },
            });
            byte += ch.len_utf8();
        }
    }
    let mut lines = Vec::new();
    let mut broke_mid_word = false;
    for paragraph in chars.split(|ch| ch.ch == '\n') {
        let ends = boundaries(paragraph, layer)?;
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
                if index == paragraph.len() || ends.contains(&index) {
                    break;
                }
            }
            words.push((start, paragraph[start..index].to_vec()));
        }
        let first_line = lines.len();
        let mut current = Vec::new();
        for (word_start, word) in words {
            let mut candidate = current.clone();
            candidate.extend_from_slice(&word);
            if measure(&candidate, layer)? <= width {
                current = candidate;
                continue;
            }
            if !current.is_empty() {
                lines.push(line(std::mem::take(&mut current), &base, layer)?);
            }
            if measure(&word, layer)? <= width {
                current = word;
                continue;
            }
            broke_mid_word = true;
            let breaks = ends
                .iter()
                .copied()
                .filter(|end| *end > word_start && *end <= word_start + word.len())
                .map(|end| end - word_start)
                .collect::<Vec<_>>();
            let mut start = 0;
            while start < word.len() {
                let mut end = start;
                for candidate in breaks.iter().copied().filter(|end| *end > start) {
                    if measure(&word[start..candidate], layer)? <= width {
                        end = candidate;
                    } else {
                        break;
                    }
                }
                if end == start {
                    end = breaks
                        .iter()
                        .copied()
                        .find(|end| *end > start)
                        .ok_or_else(|| {
                            fail(
                                layer,
                                word[start].source,
                                Kind::InvalidFontData,
                                "cluster boundary missing",
                            )
                        })?;
                }
                let part = word[start..end].to_vec();
                if end < word.len() {
                    lines.push(line(part, &base, layer)?);
                } else {
                    current = part;
                }
                start = end;
            }
        }
        if !current.is_empty() || lines.len() == first_line {
            lines.push(line(current, &base, layer)?);
        }
    }
    let mut top = f64::INFINITY;
    let mut bottom = f64::NEG_INFINITY;
    for index in 0..lines.len() {
        lines[index].baseline = if index == 0 {
            lines[index].ascent
        } else {
            lines[index - 1].baseline + lines[index - 1].size * text.line_height
        };
        top = top.min(lines[index].baseline - lines[index].ascent);
        bottom = bottom.max(lines[index].baseline + lines[index].descent);
        let free = width - lines[index].width;
        lines[index].x = match text.align {
            TextAlign::Left => 0.0,
            TextAlign::Center => free / 2.0,
            TextAlign::Right => free,
        };
    }
    let height = bottom - top;
    let anchor = match text.vertical_align {
        VerticalAlign::Top => 0.0,
        VerticalAlign::Middle => 0.5,
        VerticalAlign::Bottom => 1.0,
    };
    let shift = anchor * (layer.transform.height - height) - top;
    if !height.is_finite()
        || !(shift as f32).is_finite()
        || lines
            .iter()
            .any(|line| !(line.baseline as f32).is_finite() || !(line.x as f32).is_finite())
    {
        return Err(fail(
            layer,
            Source::default(),
            Kind::InvalidGeometry,
            "text block exceeds finite render coordinates",
        ));
    }
    for item in &mut lines {
        item.baseline += shift;
        boundaries(&item.chars, layer)?;
    }
    let mut glyphs = Vec::new();
    let mut metric_bounds = None;
    let mut emission = TextEmission::default();
    let mut emitted_baseline = 0.0_f32;
    let mut paint_spans = std::collections::BTreeMap::new();
    let mut paint_span = 0;
    let mut previous_paint = None;
    for character in &chars {
        if previous_paint
            .as_ref()
            .is_some_and(|paint| paint != &character.style.paint_key)
        {
            paint_span += 1;
        }
        previous_paint = Some(character.style.paint_key.clone());
        paint_spans.insert(character.source.character, paint_span);
    }
    for (line_index, item) in lines.iter().enumerate() {
        let baseline = item.baseline as f32;
        let origin = item.x as f32;
        // SVG serializes the first y and each dy separately. The parser then
        // accumulates the f32 deltas. Do not recast each absolute baseline.
        let dy = if line_index == 0 {
            emitted_baseline = svg_coordinate(layer.transform.y + item.baseline);
            0.0
        } else {
            svg_coordinate(lines[line_index - 1].size * text.line_height)
        };
        let span = Transform::from_translate(layer.transform.x as f32 + origin, emitted_baseline);
        emitted_baseline += dy;
        emission.lines.push(TextEmissionLine { span, dy });
        let mut metric_path = PathBuilder::new();
        let mut x = 0.0_f32;
        for cluster in clusters(&item.chars, layer)? {
            let first = &cluster.glyphs[0].character;
            let rect = (
                origin + x,
                baseline - first.style.ascent,
                origin
                    + x
                    + if cluster.advance > 0.0 {
                        cluster.advance
                    } else {
                        1.0
                    },
                baseline + first.style.descent,
            );
            union_bounds(&mut metric_bounds, rect);
            // Match usvg: construct the font-metric rectangle, transform the
            // cluster, append its rectangle, then transform the complete span.
            let metric = NonZeroRect::from_xywh(
                0.0,
                -first.style.ascent,
                if cluster.advance > 0.0 {
                    cluster.advance
                } else {
                    1.0
                },
                first.style.ascent + first.style.descent,
            )
            .and_then(|rect| rect.transform(Transform::from_translate(x, dy)))
            .ok_or_else(|| {
                fail(
                    layer,
                    first.source,
                    Kind::InvalidGeometry,
                    "text metric rectangle exceeds finite render coordinates",
                )
            })?;
            metric_path.push_rect(metric.to_rect());
            let mut advance = 0.0_f32;
            for selected in cluster.glyphs {
                let character = selected.character;
                let style = &character.style;
                let paint_span = paint_spans[&character.source.character];
                let scale = style.size / style.units;
                let offset = advance + selected.glyph.dx as f32;
                let transform = Transform::from_translate(origin, baseline)
                    .pre_translate(x, 0.0)
                    .pre_scale(scale, scale)
                    .pre_translate(offset, -selected.glyph.dy as f32);
                advance += selected.glyph.advance as f32;
                let font_outline = outline(style, selected.glyph.id, layer, character.source)?;
                let path = font_outline
                    .clone()
                    .map(|path| {
                        path.transform(transform.pre_scale(1.0, -1.0))
                            .ok_or_else(|| {
                                fail(
                                    layer,
                                    character.source,
                                    Kind::InvalidGeometry,
                                    "glyph outline exceeds finite render coordinates",
                                )
                            })
                    })
                    .transpose()?;
                glyphs.push(TextGlyph {
                    glyph_id: selected.glyph.id,
                    run_index: character.source.run,
                    character_index: character.source.character,
                    byte_index: character.source.byte,
                    font_size: style.size,
                    x: transform.tx,
                    y: transform.ty,
                    source_advance: selected.glyph.advance,
                    face: style.face.clone(),
                    coordinates: style.coordinates.clone(),
                    outline: path,
                    font_outline,
                    placement: [
                        origin,
                        baseline,
                        x,
                        offset,
                        -selected.glyph.dy as f32,
                        scale,
                    ],
                    line_index,
                    paint: style.paint.clone(),
                    paint_span,
                });
            }
            x += cluster.advance;
        }
        if let Some(path) = metric_path.finish() {
            let bounds = path
                .transform(span)
                .and_then(|path| path.compute_tight_bounds())
                .and_then(|rect| rect.to_non_zero_rect())
                .ok_or_else(|| {
                    fail(
                        layer,
                        Source::default(),
                        Kind::InvalidGeometry,
                        "emitted text metrics exceed finite render coordinates",
                    )
                })?;
            emission.metric_bounds = Some(match emission.metric_bounds {
                None => bounds,
                Some(old) => old
                    .to_rect()
                    .join(&bounds.to_rect())
                    .and_then(|rect| rect.to_non_zero_rect())
                    .ok_or_else(|| {
                        fail(
                            layer,
                            Source::default(),
                            Kind::InvalidGeometry,
                            "emitted text bounds exceed finite render coordinates",
                        )
                    })?,
            });
        }
    }
    let overflow = height > layer.transform.height || lines.iter().any(|line| line.width > width);
    Ok(TextLayerLayout {
        lines: lines
            .into_iter()
            .map(|line| TextLine {
                text: body(&line.chars),
                width: Some(line.width),
                x: Some(line.x),
                baseline: line.baseline,
                ascent: line.ascent,
                descent: line.descent,
            })
            .collect(),
        height,
        broke_mid_word,
        overflow,
        glyphs,
        metric_bounds,
        emission,
    })
}

fn svg_coordinate(value: f64) -> f32 {
    ((value * 1_000_000.0).round() / 1_000_000.0) as f32
}

fn union_bounds(bounds: &mut Option<(f32, f32, f32, f32)>, rect: (f32, f32, f32, f32)) {
    match bounds {
        None => *bounds = Some(rect),
        Some(bound) => {
            bound.0 = bound.0.min(rect.0);
            bound.1 = bound.1.min(rect.1);
            bound.2 = bound.2.max(rect.2);
            bound.3 = bound.3.max(rect.3);
        }
    }
}

#[derive(Default)]
struct Pen {
    builder: PathBuilder,
}
impl OutlinePen for Pen {
    fn move_to(&mut self, x: f32, y: f32) {
        self.builder.move_to(x, y);
    }
    fn line_to(&mut self, x: f32, y: f32) {
        self.builder.line_to(x, y);
    }
    fn quad_to(&mut self, x: f32, y: f32, px: f32, py: f32) {
        self.builder.quad_to(x, y, px, py);
    }
    fn curve_to(&mut self, x: f32, y: f32, bx: f32, by: f32, px: f32, py: f32) {
        self.builder.cubic_to(x, y, bx, by, px, py);
    }
    fn close(&mut self) {
        self.builder.close();
    }
}
fn outline(
    style: &Style,
    id: u32,
    layer: &Layer,
    source: Source,
) -> Result<Option<Path>, RenderError> {
    let font = skrifa::FontRef::from_index(style.face.bytes(), style.face.index())
        .map_err(|error| fail(layer, source, Kind::InvalidFontData, error.to_string()))?;
    let outline = font.outline_glyphs().get(GlyphId::new(id)).ok_or_else(|| {
        fail(
            layer,
            source,
            Kind::InvalidFontData,
            "selected glyph has no supported outline",
        )
    })?;
    let coords = style
        .coordinates
        .iter()
        .map(|bits| NormalizedCoord::from_bits(*bits))
        .collect::<Vec<_>>();
    let mut pen = Pen::default();
    outline
        .draw(
            DrawSettings::unhinted(Size::unscaled(), LocationRef::new(&coords)),
            &mut pen,
        )
        .map_err(|error| fail(layer, source, Kind::InvalidFontData, error.to_string()))?;
    Ok(pen.builder.finish())
}
