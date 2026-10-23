//! Emit retained font-unit contours in the layer's parent coordinate space.
//! Compose the origin before rounding. Keep existing layer wrappers outside these paths.

use super::TextLayerLayout;
use crate::{
    svg::{gradient_def, paint_value},
    RenderError,
};
use assemblash_core::{Color, Layer, TextLayer};
use resvg::tiny_skia::{PathBuilder, PathSegment};
use std::{collections::BTreeMap, fmt::Write};

fn path_data(path: &resvg::tiny_skia::Path) -> String {
    let mut data = String::new();
    for segment in path.segments() {
        match segment {
            PathSegment::MoveTo(p) => {
                let _ = write!(data, "M{} {}", p.x, p.y);
            }
            PathSegment::LineTo(p) => {
                let _ = write!(data, "L{} {}", p.x, p.y);
            }
            PathSegment::QuadTo(a, b) => {
                let _ = write!(data, "Q{} {} {} {}", a.x, a.y, b.x, b.y);
            }
            PathSegment::CubicTo(a, b, c) => {
                let _ = write!(data, "C{} {} {} {} {} {}", a.x, a.y, b.x, b.y, c.x, c.y);
            }
            PathSegment::Close => data.push('Z'),
        }
    }
    data
}

fn paint(
    paint: &Color,
    id: &str,
    layer: &Layer,
    layout: &TextLayerLayout,
    defs: &mut String,
) -> Result<String, RenderError> {
    if !matches!(paint, Color::Solid(_)) {
        let definition = gradient_def(id, paint, Some(&layer.id))?;
        if let Some(bounds) = layout.emission.metric_bounds {
            let transform = format!(
                "gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix({} 0 0 {} {} {})\"",
                bounds.width(),
                bounds.height(),
                bounds.x(),
                bounds.y()
            );
            defs.push_str(&definition.replace("gradientUnits=\"objectBoundingBox\"", &transform));
        }
    }
    paint_value(paint, id, &layer.id)
}

pub(crate) fn render(
    layer: &Layer,
    text: &TextLayer,
    layout: &TextLayerLayout,
) -> Result<String, RenderError> {
    let mut groups = BTreeMap::<usize, (Option<Color>, PathBuilder)>::new();
    for glyph in &layout.glyphs {
        if let Some(path) = glyph.emitted_outline(layer, &layout.emission)? {
            groups
                .entry(glyph.paint_span)
                .or_insert_with(|| (glyph.paint.clone(), PathBuilder::new()))
                .1
                .push_path(&path);
        }
    }
    let mut defs = String::new();
    let stroke = if let Some(stroke) = &text.stroke {
        let value = paint(
            &stroke.color,
            &format!("{}-styled-stroke", layer.id),
            layer,
            layout,
            &mut defs,
        )?;
        format!(" stroke=\"{value}\" stroke-width=\"{}\" stroke-linejoin=\"round\" paint-order=\"stroke\"",stroke.width)
    } else {
        String::new()
    };
    let mut paths = String::new();
    for (span, (fill, builder)) in groups {
        let Some(path) = builder.finish() else {
            continue;
        };
        let fill = match fill {
            None => "none".into(),
            Some(fill) => paint(
                &fill,
                &format!("{}-styled-{span}", layer.id),
                layer,
                layout,
                &mut defs,
            )?,
        };
        let _ = writeln!(
            paths,
            "<path d=\"{}\" fill=\"{fill}\" fill-rule=\"nonzero\"{stroke}/>",
            path_data(&path)
        );
    }
    Ok(if defs.is_empty() {
        paths
    } else {
        format!("<defs>\n{defs}</defs>\n{paths}")
    })
}
