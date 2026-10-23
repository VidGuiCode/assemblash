//! Exact selected clusters, independent of usvg text-span replacement.

use super::*;
use skrifa::{
    outline::{DrawSettings, OutlinePen},
    prelude::{GlyphId, LocationRef, Size},
    MetadataProvider,
};
use tiny_skia::{PathBuilder, PathSegment};
use unicode_script::{Script, UnicodeScript};

#[derive(Debug)]
pub(super) struct UnsupportedSpacing {
    pub(super) run_index: usize,
    pub(super) character_index: usize,
    pub(super) byte_index: usize,
    pub(super) reason: &'static str,
}

impl std::fmt::Display for UnsupportedSpacing {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            formatter,
            "unsupported run {} at character {} (byte {}): {}",
            self.run_index, self.character_index, self.byte_index, self.reason
        )
    }
}

impl Error for UnsupportedSpacing {}

fn supports_letter_spacing(character: char) -> bool {
    !matches!(
        character.script(),
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

fn spaced_advance(
    advance: f32,
    character: Character,
    last: bool,
) -> Result<f32, UnsupportedSpacing> {
    let spacing = character.style.spacing as f32;
    if !last && spacing != 0.0 && supports_letter_spacing(character.ch) {
        let spaced = advance + spacing;
        if spaced <= 0.0 {
            return Err(UnsupportedSpacing {
                run_index: character.run_index,
                character_index: character.character_index,
                byte_index: character.byte_index,
                reason: "applied letter spacing makes cluster advance nonpositive",
            });
        }
        Ok(spaced)
    } else {
        Ok(advance)
    }
}

#[derive(Debug, Clone)]
struct SelectedGlyph {
    source: SourceGlyph,
    style: Style,
    source_character: Character,
    span: usize,
}

#[derive(Debug)]
struct Cluster {
    glyphs: Vec<SelectedGlyph>,
    advance: f32,
    space: bool,
}

fn clusters(chars: &[Character], options: &usvg::Options) -> Result<Vec<Cluster>, Box<dyn Error>> {
    let body = text(chars);
    let offsets: Vec<_> = body
        .char_indices()
        .map(|(index, _)| index)
        .chain([body.len()])
        .collect();
    let mut selected = Vec::new();
    let mut start = 0;
    let mut span = 0;
    while start < chars.len() {
        let style = chars[start].style;
        let mut end = start + 1;
        while end < chars.len() && chars[end].style == style {
            end += 1;
        }
        for source in shape_source(&body, style, options)? {
            if source.byte_index < offsets[start] || source.byte_index >= offsets[end] {
                continue;
            }
            if source.glyph_id == 0 {
                return Err(format!("missing glyph at source byte {}", source.byte_index).into());
            }
            let index = offsets
                .binary_search(&source.byte_index)
                .map_err(|_| "invalid source cluster index")?;
            selected.push(SelectedGlyph {
                source,
                style,
                source_character: chars[index],
                span,
            });
        }
        start = end;
        span += 1;
    }
    selected.sort_by(|left, right| {
        left.source
            .visual_run
            .cmp(&right.source.visual_run)
            .then_with(|| {
                if left.source.ltr {
                    left.source.byte_index.cmp(&right.source.byte_index)
                } else {
                    right.source.byte_index.cmp(&left.source.byte_index)
                }
            })
            .then(left.source.glyph_order.cmp(&right.source.glyph_order))
    });
    let mut result: Vec<Cluster> = Vec::new();
    for glyph in selected {
        let append = result.last().is_some_and(|cluster| {
            let previous = &cluster.glyphs[0].source;
            previous.visual_run == glyph.source.visual_run
                && previous.byte_index == glyph.source.byte_index
        });
        if !append {
            result.push(Cluster {
                space: glyph.source_character.ch == ' ',
                glyphs: Vec::new(),
                advance: 0.0,
            });
        }
        let cluster = result.last_mut().ok_or("cluster absent")?;
        let scale = glyph.style.size as f32 / glyph.source.units_per_em as f32;
        cluster.advance += glyph.source.x_advance as f32 * scale;
        cluster.glyphs.push(glyph);
    }
    let count = result.len();
    for (index, cluster) in result.iter_mut().enumerate() {
        let character = cluster.glyphs[0].source_character;
        cluster.advance = spaced_advance(cluster.advance, character, index + 1 == count)?;
    }
    Ok(result)
}

pub(super) fn measure(chars: &[Character], options: &usvg::Options) -> Result<f64, Box<dyn Error>> {
    Ok(f64::from(
        clusters(chars, options)?
            .iter()
            .map(|cluster| cluster.advance)
            .sum::<f32>(),
    ))
}

struct PixelPen {
    builder: PathBuilder,
    scale: f32,
    x: f32,
    y: f32,
}

impl PixelPen {
    fn point(&self, x: f32, y: f32) -> (f32, f32) {
        (x * self.scale + self.x, -y * self.scale + self.y)
    }
}

impl OutlinePen for PixelPen {
    fn move_to(&mut self, x: f32, y: f32) {
        let (x, y) = self.point(x, y);
        self.builder.move_to(x, y);
    }
    fn line_to(&mut self, x: f32, y: f32) {
        let (x, y) = self.point(x, y);
        self.builder.line_to(x, y);
    }
    fn quad_to(&mut self, cx: f32, cy: f32, x: f32, y: f32) {
        let (cx, cy) = self.point(cx, cy);
        let (x, y) = self.point(x, y);
        self.builder.quad_to(cx, cy, x, y);
    }
    fn curve_to(&mut self, ax: f32, ay: f32, bx: f32, by: f32, x: f32, y: f32) {
        let (ax, ay) = self.point(ax, ay);
        let (bx, by) = self.point(bx, by);
        let (x, y) = self.point(x, y);
        self.builder.cubic_to(ax, ay, bx, by, x, y);
    }
    fn close(&mut self) {
        self.builder.close();
    }
}

fn outline(
    glyph: &SelectedGlyph,
    x: f32,
    y: f32,
    options: &usvg::Options,
) -> Result<Option<tiny_skia::Path>, Box<dyn Error>> {
    let face = exact_face(glyph.style, options)?;
    options
        .fontdb
        .with_face_data(
            face,
            |bytes, index| -> Result<Option<tiny_skia::Path>, Box<dyn Error>> {
                let font = skrifa::FontRef::from_index(bytes, index)?;
                let outline = font
                    .outline_glyphs()
                    .get(GlyphId::new(glyph.source.glyph_id))
                    .ok_or("glyph outline absent")?;
                let mut pen = PixelPen {
                    builder: PathBuilder::new(),
                    scale: 1.0,
                    x: 0.0,
                    y: 0.0,
                };
                outline.draw(
                    DrawSettings::unhinted(Size::unscaled(), LocationRef::default()),
                    &mut pen,
                )?;
                let scale = glyph.style.size as f32 / glyph.source.units_per_em as f32;
                // Transform unscaled contours as usvg does. Per-point arithmetic rounds differently.
                Ok(pen.builder.finish().and_then(|path| {
                    path.transform(
                        tiny_skia::Transform::from_scale(scale, scale).post_translate(x, y),
                    )
                }))
            },
        )
        .ok_or("outline font bytes absent")?
}

fn path_data(path: &tiny_skia::Path) -> String {
    let mut output = String::new();
    for segment in path.segments() {
        match segment {
            PathSegment::MoveTo(point) => output.push_str(&format!("M{} {}", point.x, point.y)),
            PathSegment::LineTo(point) => output.push_str(&format!("L{} {}", point.x, point.y)),
            PathSegment::QuadTo(control, point) => output.push_str(&format!(
                "Q{} {} {} {}",
                control.x, control.y, point.x, point.y
            )),
            PathSegment::CubicTo(first, second, point) => output.push_str(&format!(
                "C{} {} {} {} {} {}",
                first.x, first.y, second.x, second.y, point.x, point.y
            )),
            PathSegment::Close => output.push('Z'),
        }
    }
    output
}

fn path_coordinates(path: &tiny_skia::Path) -> Vec<Vec<f32>> {
    path.segments()
        .map(|segment| match segment {
            PathSegment::MoveTo(point) => vec![0.0, point.x, point.y],
            PathSegment::LineTo(point) => vec![1.0, point.x, point.y],
            PathSegment::QuadTo(control, point) => {
                vec![2.0, control.x, control.y, point.x, point.y]
            }
            PathSegment::CubicTo(first, second, point) => {
                vec![3.0, first.x, first.y, second.x, second.y, point.x, point.y]
            }
            PathSegment::Close => vec![4.0],
        })
        .collect()
}

fn verify_outline_coordinates(
    expected: &tiny_skia::Path,
    actual: &tiny_skia::Path,
) -> Result<(), Box<dyn Error>> {
    let expected = path_coordinates(expected);
    let actual = path_coordinates(actual);
    if expected.len() != actual.len() {
        return Err("emitted outline segment count differs".into());
    }
    for (expected, actual) in expected.iter().zip(&actual) {
        if expected.len() != actual.len()
            || expected
                .iter()
                .zip(actual)
                .any(|(left, right)| (left - right).abs() >= 0.0001)
        {
            return Err("emitted outline coordinate differs".into());
        }
    }
    Ok(())
}

#[derive(Debug)]
struct PaintedGlyph {
    record: Value,
    path: Option<tiny_skia::Path>,
    paint_span: usize,
    fill: &'static str,
}

fn collect_paths<'a>(group: &'a usvg::Group, paths: &mut BTreeMap<String, &'a usvg::Path>) {
    for node in group.children() {
        match node {
            usvg::Node::Group(group) => collect_paths(group, paths),
            usvg::Node::Path(path) => {
                paths.insert(path.id().to_owned(), path);
            }
            _ => {}
        }
    }
}

pub(super) fn render(
    layout: &Layout,
    config: Config,
    options: &usvg::Options,
) -> Result<(String, Vec<Value>), Box<dyn Error>> {
    let mut paint_spans = BTreeMap::new();
    let mut last_fill = None;
    let mut paint_span = 0;
    for line in &layout.lines {
        for character in &line.chars {
            if last_fill.is_some_and(|fill| fill != character.style.fill) {
                paint_span += 1;
            }
            paint_spans.insert(character.character_index, paint_span);
            last_fill = Some(character.style.fill);
        }
    }
    let mut painted = Vec::new();
    let mut text_bounds = None;
    for line in &layout.lines {
        let selected = clusters(&line.chars, options)?;
        let origin_x = 24.0 + line.x as f32;
        // Keep the cluster cursor relative. Compose the span origin after accumulation.
        let mut x = 0.0_f32;
        let baseline = 24.0 + line.baseline as f32;
        let mut positioned = Vec::new();
        let mut line_bounds: Option<(f32, f32, f32, f32)> = None;
        for cluster in selected {
            let first = &cluster.glyphs[0];
            let face = exact_face(first.style, options)?;
            let metrics = options
                .fontdb
                .with_face_data(face, |bytes, index| {
                    assemblash_renderer::fonts::read_metrics(bytes, index)
                })
                .flatten()
                .ok_or("cluster metrics absent")?;
            let scale = first.style.size as f32 / metrics.units_per_em as f32;
            let rect = (
                origin_x + x,
                baseline - metrics.ascender as f32 * scale,
                origin_x
                    + x
                    + if cluster.advance > 0.0 {
                        cluster.advance
                    } else {
                        1.0
                    },
                baseline - metrics.descender as f32 * scale,
            );
            union_bounds(&mut line_bounds, rect);
            let mut advance = 0.0;
            for glyph in cluster.glyphs {
                let scale = glyph.style.size as f32 / glyph.source.units_per_em as f32;
                let transform = tiny_skia::Transform::from_translate(origin_x, baseline)
                    .pre_translate(x, 0.0)
                    .pre_scale(scale, scale)
                    .pre_translate(
                        advance + glyph.source.x_offset as f32,
                        -glyph.source.y_offset as f32,
                    );
                let gx = transform.tx;
                let gy = transform.ty;
                advance += glyph.source.x_advance as f32;
                let path = outline(&glyph, gx, gy, options)?;
                let face = exact_face(glyph.style, options)?;
                let (font_hash, face_index) = options
                    .fontdb
                    .with_face_data(face, |bytes, index| (hash_bytes(bytes), index))
                    .ok_or("font provenance absent")?;
                let record = json!({"id":glyph.source.glyph_id,"text":glyph.source.text,"family":glyph.style.family,
                    "weight":glyph.style.weight,"style":if glyph.style.italic { "Italic" } else { "Normal" },"size":glyph.style.size,"paint":glyph.style.fill,
                    "sourceCharacterIndex":glyph.source_character.character_index,"sourceByteIndex":glyph.source_character.byte_index,
                    "fontSha256":font_hash,"fontFaceIndex":face_index,"variationCoordinates":[],"sourceXAdvance":glyph.source.x_advance,
                    "transform":[scale,0.0,0.0,scale,gx,gy]});
                positioned.push((
                    glyph.span,
                    glyph.source.visual_run,
                    glyph.source.glyph_order,
                    PaintedGlyph {
                        record,
                        path,
                        paint_span: paint_spans[&glyph.source_character.character_index],
                        fill: glyph.style.fill,
                    },
                ));
            }
            x += cluster.advance
                + if cluster.space {
                    line.word_spacing as f32
                } else {
                    0.0
                };
        }
        positioned.sort_by_key(|(span, run, order, _)| (*span, *run, *order));
        let records: Vec<_> = positioned
            .iter()
            .map(|(_, _, _, glyph)| glyph.record.clone())
            .collect();
        verify_source_order(&records, &source_indexed_glyphs(&line.chars, options)?)?;
        // usvg uses all text clusters for each paint span's metric bbox.
        if let Some(rect) = line_bounds {
            union_bounds(&mut text_bounds, rect);
        }
        painted.extend(positioned.into_iter().map(|(_, _, _, glyph)| glyph));
    }
    // Every tspan uses the parent text metric bbox, across all lines and paints.
    let mut definitions = String::new();
    if let Some((left, top, right, _)) = text_bounds {
        for span in painted
            .iter()
            .map(|glyph| glyph.paint_span)
            .collect::<BTreeSet<_>>()
        {
            definitions.push_str(&format!("<linearGradient id=\"run-gradient-{span}\" gradientUnits=\"userSpaceOnUse\" x1=\"{left}\" y1=\"{top}\" x2=\"{right}\" y2=\"{top}\"><stop offset=\"0\" stop-color=\"#b02050\"/><stop offset=\"1\" stop-color=\"#102030\"/></linearGradient>"));
        }
    }
    let mut compounds = BTreeMap::<usize, (PathBuilder, &'static str, String)>::new();
    for glyph in &mut painted {
        if let Some(path) = &glyph.path {
            let data = path_data(path);
            let compound = compounds
                .entry(glyph.paint_span)
                .or_insert_with(|| (PathBuilder::new(), glyph.fill, String::new()));
            compound.0.push_path(path);
            compound.2.push_str(&data);
            glyph.record["outlinePathSha256"] = json!(hash_bytes(data.as_bytes()));
            glyph.record["pathId"] = json!(format!("paint-span-{}", glyph.paint_span));
            glyph.record["outlineContourCount"] = json!(path
                .segments()
                .filter(|segment| matches!(segment, PathSegment::MoveTo(_)))
                .count());
        }
    }
    let mut body = String::new();
    let mut expected_paths = BTreeMap::new();
    for (span, (builder, fill, data)) in compounds {
        let paint = if fill == "url(#run-gradient)" {
            format!("url(#run-gradient-{span})")
        } else {
            fill.to_owned()
        };
        body.push_str(&format!(
            "<path id=\"paint-span-{span}\" fill=\"{paint}\" fill-rule=\"nonzero\" d=\"{data}\"/>"
        ));
        expected_paths.insert(
            span,
            (builder.finish().ok_or("compound outline absent")?, fill),
        );
    }
    let svg = format!("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"720\" height=\"540\"><defs>{definitions}<clipPath id=\"box\"><rect x=\"24\" y=\"24\" width=\"{}\" height=\"{}\"/></clipPath></defs><rect width=\"720\" height=\"540\" fill=\"#ffffff\"/><g clip-path=\"url(#box)\">{body}</g></svg>", config.width, config.height);
    let tree = usvg::Tree::from_str(&svg, options)?;
    let mut actual_paths = BTreeMap::new();
    collect_paths(tree.root(), &mut actual_paths);
    for (span, (expected, fill)) in &expected_paths {
        if *fill == "none" {
            continue;
        }
        let actual = actual_paths
            .get(&format!("paint-span-{span}"))
            .ok_or("emitted compound outline missing from parsed SVG")?;
        verify_outline_coordinates(expected, actual.data())?;
        let contours = expected
            .segments()
            .filter(|segment| matches!(segment, PathSegment::MoveTo(_)))
            .count();
        let actual_contours = actual
            .data()
            .segments()
            .filter(|segment| matches!(segment, PathSegment::MoveTo(_)))
            .count();
        if contours != actual_contours {
            return Err("an emitted glyph contour was lost".into());
        }
        let expected = expected
            .compute_tight_bounds()
            .ok_or("outline bounds absent")?;
        let actual_bounds = actual
            .data()
            .compute_tight_bounds()
            .ok_or("parsed outline bounds absent")?;
        for (left, right) in [
            (expected.left(), actual_bounds.left()),
            (expected.top(), actual_bounds.top()),
            (expected.right(), actual_bounds.right()),
            (expected.bottom(), actual_bounds.bottom()),
        ] {
            if (left - right).abs() > 0.01 {
                return Err("emitted outline geometry differs".into());
            }
        }
        let actual_fill = actual.fill().ok_or("emitted outline paint absent")?;
        if actual_fill.rule() != usvg::FillRule::NonZero {
            return Err("emitted fill rule differs".into());
        }
        match (*fill, actual_fill.paint()) {
            ("url(#run-gradient)", usvg::Paint::LinearGradient(_)) => {}
            (expected, usvg::Paint::Color(color))
                if expected
                    == format!("#{:02x}{:02x}{:02x}", color.red, color.green, color.blue) => {}
            _ => return Err("emitted outline paint differs".into()),
        }
    }
    Ok((svg, painted.into_iter().map(|glyph| glyph.record).collect()))
}

fn union_bounds(bounds: &mut Option<(f32, f32, f32, f32)>, rect: (f32, f32, f32, f32)) {
    if let Some(bound) = bounds {
        bound.0 = bound.0.min(rect.0);
        bound.1 = bound.1.min(rect.1);
        bound.2 = bound.2.max(rect.2);
        bound.3 = bound.3.max(rect.3);
    } else {
        *bounds = Some(rect);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn spacing_refuses_only_applied_nonpositive_geometry() {
        let mut character = characters(&[(
            "x",
            Style {
                spacing: -10.0,
                ..BASE
            },
        )])[0];
        assert!(spaced_advance(10.0, character, false).is_err());
        assert!(spaced_advance(9.0, character, false).is_err());
        assert_eq!(
            spaced_advance(11.0, character, false).expect("unused or positive spacing"),
            1.0
        );
        assert_eq!(
            spaced_advance(0.0, character, true).expect("unused or positive spacing"),
            0.0
        );
        character.ch = 'ب';
        assert_eq!(
            spaced_advance(0.0, character, false).expect("unused or positive spacing"),
            0.0
        );
        character.ch = '\u{301}';
        character.style.spacing = 0.0;
        assert_eq!(
            spaced_advance(0.0, character, false).expect("unused or positive spacing"),
            0.0
        );
    }

    #[test]
    fn a_real_glyph_translation_fails_outline_verification() {
        let mut database = usvg::fontdb::Database::new();
        database.load_font_data(
            fs::read(Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fonts/NotoSans-Subset.ttf"))
                .expect("pinned font"),
        );
        let options = usvg::Options {
            fontdb: std::sync::Arc::new(database),
            ..Default::default()
        };
        let glyph = clusters(&characters(&[("x", BASE)]), &options)
            .expect("shape x")
            .remove(0)
            .glyphs
            .remove(0);
        let original = outline(&glyph, 24.0, 64.0, &options)
            .expect("outline x")
            .expect("x has ink");
        let translated = outline(&glyph, 24.25, 64.0, &options)
            .expect("translated outline")
            .expect("x has ink");
        assert!(verify_outline_coordinates(&original, &original).is_ok());
        assert!(verify_outline_coordinates(&original, &translated).is_err());
    }
}
