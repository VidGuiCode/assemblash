//! Document to SVG.
//!
//! A pure function: no filesystem, no font discovery, no clock. Everything
//! variable is passed in, which is what makes the output testable as a string
//! and reproducible on every platform (NFR-1).

use std::collections::BTreeMap;
use std::fmt::Write as _;

use assemblash_core::document::{
    Effect, GroupLayer, ImageFit, Layer, LayerKind, ShapeKind, ShapeLayer, TextAlign, Transform,
};
use assemblash_core::ids::AssetId;
use assemblash_core::{svg_import, validate, Color, Document};

use crate::error::RenderError;
use crate::fonts::FontSet;

/// Where each asset's bytes can be found, from the SVG's point of view.
///
/// Values are used verbatim as the `href` of an `<image>`: a `data:` URI for
/// self-contained output, or a path for a preview that reads from disk.
/// Resolving them is the caller's job — this crate does no I/O.
pub type AssetHrefs = BTreeMap<AssetId, String>;

/// Renders a document to an SVG string.
///
/// Fails, rather than guessing, when the document is invalid, a font family is
/// not available, or an asset has no href.
pub fn doc_to_svg(
    document: &Document,
    fonts: &FontSet,
    assets: &AssetHrefs,
) -> Result<String, RenderError> {
    validate(document).map_err(RenderError::InvalidDocument)?;

    let mut out = String::new();
    let _ = writeln!(
        out,
        concat!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" ",
            "width=\"{w}\" height=\"{h}\" viewBox=\"0 0 {w} {h}\">"
        ),
        w = number(document.canvas.width),
        h = number(document.canvas.height),
    );

    // Effects become filters in one <defs>, referenced by the layers that ask
    // for them. Collected up front because a filter has to be defined before
    // it is used, and because a layer nested three groups deep must still find
    // its own.
    let mut defs = String::new();
    let mut failure = None;
    document.walk_layers(&mut |layer| {
        if failure.is_some() || layer.effects.is_empty() {
            return;
        }
        match filter_for(layer) {
            Ok(filter) => defs.push_str(&filter),
            Err(error) => failure = Some(error),
        }
    });
    if let Some(error) = failure {
        return Err(error);
    }
    if !defs.is_empty() {
        let _ = write!(out, "  <defs>\n{defs}  </defs>\n");
    }

    if let Some(background) = &document.canvas.background {
        let _ = writeln!(
            out,
            "  <rect x=\"0\" y=\"0\" width=\"{}\" height=\"{}\" fill=\"{}\"/>",
            number(document.canvas.width),
            number(document.canvas.height),
            color(background)?,
        );
    }

    for layer in &document.layers {
        write_layer(&mut out, layer, fonts, assets, 1)?;
    }

    out.push_str("</svg>\n");
    Ok(out)
}

fn write_layer(
    out: &mut String,
    layer: &Layer,
    fonts: &FontSet,
    assets: &AssetHrefs,
    depth: usize,
) -> Result<(), RenderError> {
    // An invisible layer contributes nothing, and leaving it out keeps the
    // output as small as what it draws.
    if !layer.visible {
        return Ok(());
    }

    let pad = "  ".repeat(depth);
    let t = &layer.transform;

    match &layer.kind {
        LayerKind::Text(text) => {
            if !fonts.contains(&text.font_family) {
                return Err(RenderError::MissingFont {
                    layer: layer.id.clone(),
                    family: text.font_family.clone(),
                });
            }

            let (anchor, x) = match text.align {
                TextAlign::Left => ("start", t.x),
                TextAlign::Center => ("middle", t.x + t.width / 2.0),
                TextAlign::Right => ("end", t.x + t.width),
            };

            let _ = write!(
                out,
                "{pad}<text x=\"{x}\" y=\"{y}\" font-family=\"{family}\" \
                 font-size=\"{size}\" fill=\"{fill}\" text-anchor=\"{anchor}\"\
                 {opacity}{rotation}{filter}{blend}>",
                x = number(x),
                // The first baseline sits one ascent below the box top, taken
                // from the font file itself. The ascent is measured by
                // whoever loaded the fonts and arrives in `fonts`, so this
                // stays a pure function and two machines with the same font
                // files agree to the last decimal.
                y = number(t.y + text.font_size * fonts.ascent_ratio(&text.font_family)),
                family = attribute(&text.font_family),
                size = number(text.font_size),
                fill = color(&text.color)?,
                anchor = anchor,
                opacity = opacity_attribute(layer.opacity),
                rotation = rotation_attribute(t),
                filter = filter_attribute(layer),
                blend = blend_attribute(layer)?,
            );

            for (index, line) in layout_text(
                &text.text,
                t.width,
                text.font_size,
                text.line_height,
                &text.font_family,
                fonts,
            )
            .lines
            .iter()
            .enumerate()
            {
                let dy = if index == 0 {
                    0.0
                } else {
                    text.font_size * text.line_height
                };
                let _ = write!(
                    out,
                    "<tspan x=\"{}\" dy=\"{}\">{}</tspan>",
                    number(x),
                    number(dy),
                    escape_text(line),
                );
            }

            out.push_str("</text>\n");
        }

        // An SVG layer draws exactly like an image layer: usvg reads a nested
        // SVG through the same <image> element, and the asset was sanitised
        // at import, so nothing here has to treat it as untrusted markup.
        LayerKind::Image(_) | LayerKind::Svg(_) => {
            let (asset_id, fit) = match &layer.kind {
                LayerKind::Image(image) => (&image.asset, image.fit),
                LayerKind::Svg(svg) => (&svg.asset, svg.fit),
                _ => unreachable!("matched on image or svg above"),
            };

            let href = assets
                .get(asset_id)
                .ok_or_else(|| RenderError::UnresolvedAsset {
                    layer: layer.id.clone(),
                    asset: asset_id.clone(),
                })?;

            // A vector asset carries its own `<text>`, and nothing has loaded
            // a font for it. Refused here rather than drawn as a hole.
            if matches!(&layer.kind, LayerKind::Svg(_)) {
                check_asset_text(asset_id, href, fonts)?;
            }

            let preserve = match fit {
                ImageFit::Fill => "none",
                ImageFit::Contain => "xMidYMid meet",
                ImageFit::Cover => "xMidYMid slice",
            };

            let _ = writeln!(
                out,
                "{pad}<image x=\"{x}\" y=\"{y}\" width=\"{w}\" height=\"{h}\" \
                 preserveAspectRatio=\"{preserve}\" href=\"{href}\"{opacity}{rotation}{filter}{blend}/>",
                x = number(t.x),
                y = number(t.y),
                w = number(t.width),
                h = number(t.height),
                preserve = preserve,
                href = attribute(href),
                opacity = opacity_attribute(layer.opacity),
                rotation = rotation_attribute(t),
                filter = filter_attribute(layer),
                blend = blend_attribute(layer)?,
            );
        }

        LayerKind::Shape(shape) => write_shape(out, layer, shape, &pad)?,

        LayerKind::Group(group) => {
            let _ = writeln!(
                out,
                "{pad}<g transform=\"translate({x} {y})\"{opacity}{filter}{style}>",
                x = number(t.x),
                y = number(t.y),
                opacity = opacity_attribute(layer.opacity),
                filter = filter_attribute(layer),
                style = group_style(layer, group)?,
            );
            // A rotated group rotates its children as a unit, about its own
            // centre, so the rotation wraps the children rather than sitting
            // on the translate.
            let rotated = t.rotation != 0.0;
            if rotated {
                let _ = writeln!(
                    out,
                    "{pad}  <g transform=\"rotate({angle} {cx} {cy})\">",
                    angle = number(t.rotation),
                    cx = number(t.width / 2.0),
                    cy = number(t.height / 2.0),
                );
            }
            for child in &group.children {
                write_layer(
                    out,
                    child,
                    fonts,
                    assets,
                    depth + if rotated { 2 } else { 1 },
                )?;
            }
            if rotated {
                let _ = writeln!(out, "{pad}  </g>");
            }
            let _ = writeln!(out, "{pad}</g>");
        }
    }

    Ok(())
}

/// Control-arm length for a quarter arc, as a fraction of the radius.
///
/// The usual `4/3 * (sqrt(2) - 1)`, written as a literal rather than computed:
/// a constant is the same bits on every target, and a `sqrt` at start-up would
/// be one more thing to argue about when two machines disagree about a golden.
const KAPPA: f64 = 0.552_284_749_8;

/// Draws one shape layer.
///
/// Three decisions here are not obvious and all three are the result of the
/// 1.6.0 stroker spike, which measured them rather than assuming them:
///
/// * **Every curve is written as cubic Béziers, never as `rx` on a `<rect>`
///   and never as `<ellipse>`.** usvg converts both of those to cubics with
///   `kurbo::Arc`, which calls `sin_cos`, `tan`, `atan2` and `powf` from the
///   platform's math library. Those are not required to be correctly rounded,
///   so glibc, Darwin and the UCRT are each free to differ by an ULP — and
///   `powf(1/6)` feeds a `ceil()` that picks the *number* of cubic segments,
///   so an unlucky ULP changes the path's structure rather than a hair of its
///   position. Emitting the cubics ourselves keeps that whole family of
///   functions off the path: what is left is multiplication and addition on
///   `f64`, which is exact everywhere. (`kurbo` flips the segment count for a
///   quadrant at a radius near 367 user units; the gate carries a shape there
///   as a canary.)
/// * **The stroke width is clamped, not the box.** Clamping `w - s` to zero
///   makes an over-stroked shape vanish entirely at `s = min(w, h)` while
///   `s = 0.999 * min(w, h)` still fills the box — a cliff in the middle of a
///   slider. Clamping `s` and falling back to a plain fill in the stroke
///   colour is the continuous limit, and was measured bit-identical to the
///   `0.999` case.
/// * **The stroke is inset by `s/2`** (D5), so the transform box is the visual
///   box and nothing that reasons about layout has to know whether a shape is
///   stroked. One measured caveat: below one device pixel tiny-skia draws a
///   *hairline* centred on the edge rather than running the stroker, and a
///   hairline always covers a whole pixel row — so a 0.5-wide stroke spills up
///   to half a pixel outside the box on each side. Deterministic and identical
///   on every target, so it is documented rather than refused, but below
///   `s = 1` the box is not quite the visual box.
fn write_shape(
    out: &mut String,
    layer: &Layer,
    shape: &ShapeLayer,
    pad: &str,
) -> Result<(), RenderError> {
    // A geometry this build does not know is refused rather than skipped: a
    // shape silently missing from an export is the one failure this engine
    // refuses to make.
    if let ShapeKind::Other(_) = &shape.shape {
        return Err(RenderError::UnsupportedShape {
            layer: layer.id.clone(),
            kind: shape.shape.kind_name().to_owned(),
        });
    }

    let t = &layer.transform;
    let (x, y, w, h) = (t.x, t.y, t.width, t.height);
    // Exactly the image branch's trailing attributes, in the same order.
    let common = || -> Result<String, RenderError> {
        Ok(format!(
            "{opacity}{rotation}{filter}{blend}",
            opacity = opacity_attribute(layer.opacity),
            rotation = rotation_attribute(t),
            filter = filter_attribute(layer),
            blend = blend_attribute(layer)?,
        ))
    };

    match &shape.shape {
        ShapeKind::Rect { corner_radius } => {
            let (fill, stroke, inset) = shape_paint(shape, w.min(h))?;
            // Clamped against the box first, so a radius larger than the shape
            // is a stadium rather than a refusal, and only then pulled in by
            // the inset — the inner edge of a stroked corner has the smaller
            // radius.
            let radius = corner_radius.clamp(0.0, (w.min(h) / 2.0).max(0.0));
            let radius = (radius - inset).max(0.0);
            let (bx, by, bw, bh) = (x + inset, y + inset, w - 2.0 * inset, h - 2.0 * inset);
            if radius <= 0.0 {
                // Square corners have no arc to convert, so a plain <rect> is
                // already free of the kurbo path and is the shorter output.
                let _ = writeln!(
                    out,
                    "{pad}<rect x=\"{bx}\" y=\"{by}\" width=\"{bw}\" height=\"{bh}\" \
                     fill=\"{fill}\"{stroke}{common}/>",
                    bx = number(bx),
                    by = number(by),
                    bw = number(bw),
                    bh = number(bh),
                    common = common()?,
                );
            } else {
                let _ = writeln!(
                    out,
                    "{pad}<path d=\"{d}\" fill=\"{fill}\"{stroke}{common}/>",
                    d = rounded_rect_path(bx, by, bw, bh, radius),
                    common = common()?,
                );
            }
        }

        ShapeKind::Ellipse => {
            let (fill, stroke, inset) = shape_paint(shape, w.min(h))?;
            let _ = writeln!(
                out,
                "{pad}<path d=\"{d}\" fill=\"{fill}\"{stroke}{common}/>",
                d = ellipse_path(x + w / 2.0, y + h / 2.0, w / 2.0 - inset, h / 2.0 - inset),
                common = common()?,
            );
        }

        // A line has no interior: its stroke is centred on the segment rather
        // than inset, it is not clamped against the box (there is nothing for
        // it to eat), and `fill` means nothing. With no stroke, or a width of
        // zero, there is nothing to draw at all — and an empty element that
        // draws nothing is worse than no element, because it still costs the
        // rasterizer a pass.
        ShapeKind::Line => {
            let Some(stroke) = &shape.stroke else {
                return Ok(());
            };
            if stroke.width <= 0.0 {
                return Ok(());
            }
            let _ = writeln!(
                out,
                "{pad}<line x1=\"{x1}\" y1=\"{y1}\" x2=\"{x2}\" y2=\"{y2}\" \
                 stroke=\"{color}\" stroke-width=\"{width}\" \
                 stroke-linecap=\"butt\"{common}/>",
                x1 = number(x),
                y1 = number(y + h / 2.0),
                x2 = number(x + w),
                y2 = number(y + h / 2.0),
                color = color(&stroke.color)?,
                width = number(stroke.width),
                common = common()?,
            );
        }

        ShapeKind::Other(_) => unreachable!("refused above"),
    }

    Ok(())
}

/// A rect or ellipse's paint, after the stroke clamp.
///
/// Returns the `fill` value, the stroke attributes (empty when there is no
/// stroke to draw) and the inset to apply to the geometry — `s/2`, or 0 when
/// nothing is stroked.
fn shape_paint(shape: &ShapeLayer, minimum: f64) -> Result<(String, String, f64), RenderError> {
    let fill = match &shape.fill {
        Some(color_value) => color(color_value)?,
        None => "none".to_owned(),
    };
    let Some(stroke) = &shape.stroke else {
        return Ok((fill, String::new(), 0.0));
    };

    // `minimum` is negative only for a box validation would have refused;
    // `clamp` panics when its bounds cross, so it is floored here rather than
    // trusted.
    let width = stroke.width.clamp(0.0, minimum.max(0.0));
    if width <= 0.0 {
        return Ok((fill, String::new(), 0.0));
    }
    if width >= minimum {
        // The stroke has eaten the box. Drawn as the whole shape filled in the
        // stroke colour, which is what the inset rule converges to.
        return Ok((color(&stroke.color)?, String::new(), 0.0));
    }
    Ok((
        fill,
        format!(
            " stroke=\"{}\" stroke-width=\"{}\"",
            color(&stroke.color)?,
            number(width)
        ),
        width / 2.0,
    ))
}

/// A rounded rectangle as four straight edges and four cubic quarter-arcs.
///
/// Clockwise from the top-left corner's end. See [`write_shape`] for why the
/// arcs are cubics rather than an `rx` attribute.
fn rounded_rect_path(x: f64, y: f64, width: f64, height: f64, radius: f64) -> String {
    let (x0, y0, x1, y1) = (x, y, x + width, y + height);
    let r = radius;
    let k = KAPPA * radius;
    let mut d = String::new();
    let _ = write!(d, "M {} {}", number(x0 + r), number(y0));
    let _ = write!(d, " L {} {}", number(x1 - r), number(y0));
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(x1 - r + k),
        number(y0),
        number(x1),
        number(y0 + r - k),
        number(x1),
        number(y0 + r),
    );
    let _ = write!(d, " L {} {}", number(x1), number(y1 - r));
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(x1),
        number(y1 - r + k),
        number(x1 - r + k),
        number(y1),
        number(x1 - r),
        number(y1),
    );
    let _ = write!(d, " L {} {}", number(x0 + r), number(y1));
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(x0 + r - k),
        number(y1),
        number(x0),
        number(y1 - r + k),
        number(x0),
        number(y1 - r),
    );
    let _ = write!(d, " L {} {}", number(x0), number(y0 + r));
    let _ = write!(
        d,
        " C {} {} {} {} {} {} Z",
        number(x0),
        number(y0 + r - k),
        number(x0 + r - k),
        number(y0),
        number(x0 + r),
        number(y0),
    );
    d
}

/// An ellipse as four cubic quadrants, starting at the rightmost point and
/// running clockwise. See [`write_shape`] for why this is not an `<ellipse>`.
fn ellipse_path(cx: f64, cy: f64, rx: f64, ry: f64) -> String {
    let (kx, ky) = (KAPPA * rx, KAPPA * ry);
    let mut d = String::new();
    let _ = write!(d, "M {} {}", number(cx + rx), number(cy));
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(cx + rx),
        number(cy + ky),
        number(cx + kx),
        number(cy + ry),
        number(cx),
        number(cy + ry),
    );
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(cx - kx),
        number(cy + ry),
        number(cx - rx),
        number(cy + ky),
        number(cx - rx),
        number(cy),
    );
    let _ = write!(
        d,
        " C {} {} {} {} {} {}",
        number(cx - rx),
        number(cy - ky),
        number(cx - kx),
        number(cy - ry),
        number(cx),
        number(cy - ry),
    );
    let _ = write!(
        d,
        " C {} {} {} {} {} {} Z",
        number(cx + kx),
        number(cy - ry),
        number(cx + rx),
        number(cy - ky),
        number(cx + rx),
        number(cy),
    );
    d
}

/// CSS families that name a role rather than a file.
///
/// A role is not a family this document could load: the font store is keyed by
/// the family name a face declares, and no face declares itself `sans-serif`.
/// So a `<text>` asking only for one of these names nothing that can be
/// resolved, and is treated exactly like a `<text>` that names no family at
/// all — refused, with no family to put in the message.
const GENERIC_FAMILIES: &[&str] = &[
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
];

/// Refuses an SVG asset whose `<text>` no loaded font can draw (DEF-2).
///
/// Fonts are resolved from the families **text layers** name, so a `<text>`
/// inside an imported asset had nothing loaded for it and drew as nothing —
/// while the export exited successfully and wrote a file with a hole in it.
/// Whether it happened at all depended on the surface: the command line's
/// `--font-dir` loads every file in the directory and so happened to work,
/// every other path did not. Silent, and different depending on how you asked:
/// the two properties a rendering promise cannot have.
///
/// This does not fix it — loading the families an asset names is a separate
/// change — it stops the render instead of producing the hole.
///
/// The families come from [`svg_import::text_families`], which parses the
/// markup, so a `<text>` inside a comment is not one and an empty `<text>` with
/// nothing to draw is not one either. Each value is a CSS list, and a list is
/// satisfied by any one of its members, so a `<text>` passes when **any** of
/// the families it names was loaded.
///
/// A `<text>` that names **no** family, or only generic ones, is refused too,
/// with no family to name. That is not pedantry: fonts are resolved by family
/// name out of a pinned store, so the store never holds the default family
/// usvg falls back to, and such a `<text>` is guaranteed to draw nothing. It
/// measured zero dark pixels with a face loaded, which is the silent loss this
/// check exists to remove — a chart exporting "successfully" without its
/// labels. Refusing is the only honest answer, and the caller has two real
/// fixes: name a family the document loads, or outline the text at import.
/// (The 1.3.0 `svgAssetTextWithoutFont` warning covered this case by reporting
/// it and carrying on; it is superseded here.)
///
/// The fault reported is the first one in the sorted order
/// [`svg_import::text_families`] returns, so the message is the same on every
/// machine.
fn check_asset_text(asset_id: &AssetId, href: &str, fonts: &FontSet) -> Result<(), RenderError> {
    // Only a `data:` URI carries the bytes with it. A caller that resolved its
    // assets to paths instead has an href this function cannot read, and a
    // guess about a file it has not seen would be worse than no check: this
    // crate does no I/O.
    let Some(source) = svg_data_uri(href) else {
        return Ok(());
    };
    // Markup that will not parse is not this check's business; the rasterizer
    // reports it as a malformed SVG a moment later.
    let Ok(referenced) = svg_import::text_families(&source) else {
        return Ok(());
    };

    for value in &referenced {
        let wanted = families_in(value);
        // One loaded family out of the list is enough: that is what a CSS
        // font-family list means, and this `<text>` has a face to draw with.
        if wanted.iter().any(|family| fonts.contains(family)) {
            continue;
        }
        return Err(RenderError::SvgAssetTextWithoutFont {
            asset: asset_id.to_string(),
            // `None` when the `<text>` named nothing resolvable, which is a
            // different sentence to the caller: there is no family to install.
            family: wanted.into_iter().next(),
        });
    }

    Ok(())
}

/// The named, non-generic families in one `font-family` value, in order.
pub(crate) fn families_in(value: &str) -> Vec<String> {
    value
        .split(',')
        .map(|family| {
            let family = family.trim();
            // A family with a space in it is usually quoted in CSS.
            family
                .strip_prefix(['"', '\''])
                .and_then(|rest| rest.strip_suffix(['"', '\'']))
                .unwrap_or(family)
                .trim()
        })
        .filter(|family| {
            !family.is_empty()
                && !GENERIC_FAMILIES
                    .iter()
                    .any(|generic| family.eq_ignore_ascii_case(generic))
        })
        .map(str::to_owned)
        .collect()
}

/// The markup inside a `data:` URI that carries an SVG, if this href is one.
fn svg_data_uri(href: &str) -> Option<String> {
    let (meta, payload) = href.split_once(',')?;
    let meta = meta.to_ascii_lowercase();
    let media = meta.strip_prefix("data:")?;
    if !media.contains("svg") {
        return None;
    }
    let bytes = if media.ends_with(";base64") {
        decode_base64(payload)?
    } else {
        percent_decode(payload)
    };
    String::from_utf8(bytes).ok()
}

/// Standard base64, ignoring padding and whitespace.
///
/// Hand-rolled for the same reason [`crate::assets`] hand-rolls the encoder:
/// every crate in a single-binary product has to be licence-audited and
/// shipped (R8), and this is a dozen lines of arithmetic.
fn decode_base64(text: &str) -> Option<Vec<u8>> {
    let mut out = Vec::with_capacity(text.len() / 4 * 3);
    let mut accumulator: u32 = 0;
    let mut bits: u32 = 0;
    for byte in text.bytes() {
        if byte == b'=' || byte.is_ascii_whitespace() {
            continue;
        }
        let value = match byte {
            b'A'..=b'Z' => byte - b'A',
            b'a'..=b'z' => byte - b'a' + 26,
            b'0'..=b'9' => byte - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            _ => return None,
        };
        accumulator = (accumulator << 6) | u32::from(value);
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((accumulator >> bits) as u8);
        }
    }
    Some(out)
}

/// Percent-decoding, for a `data:` URI that spells its payload out.
fn percent_decode(text: &str) -> Vec<u8> {
    let bytes = text.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        let pair = (index + 2 < bytes.len() && bytes[index] == b'%')
            .then(|| {
                let high = char::from(bytes[index + 1]).to_digit(16)?;
                let low = char::from(bytes[index + 2]).to_digit(16)?;
                u8::try_from(high * 16 + low).ok()
            })
            .flatten();
        match pair {
            Some(byte) => {
                out.push(byte);
                index += 3;
            }
            None => {
                out.push(bytes[index]);
                index += 1;
            }
        }
    }
    out
}

/// Wraps text at the layer width, preserving explicit line breaks.
///
/// Widths come from the pinned font file. A single word that is wider than
/// the box is split at character boundaries so even pasted URLs cannot paint
/// across neighbouring layers.
/// Deterministic text layout for a rectangular text layer.
#[derive(Debug, Clone, PartialEq)]
pub struct TextLayout {
    /// Lines after explicit breaks and width wrapping.
    pub lines: Vec<String>,
    /// Minimum layer height that contains every resulting line.
    pub height: f64,
    /// Whether a single word had to be split at a character boundary.
    ///
    /// The split itself is not a failure — it is what stops a pasted URL
    /// painting across its neighbours — but it is never what an author
    /// intended, so an export says it happened.
    pub broke_mid_word: bool,
}

/// Measures and wraps text with the same pinned metrics used by rendering.
pub fn layout_text(
    text: &str,
    width: f64,
    font_size: f64,
    line_height: f64,
    family: &str,
    fonts: &FontSet,
) -> TextLayout {
    let Some(_) = fonts.text_advance_ratio(family, "") else {
        let lines = text.split('\n').map(str::to_owned).collect::<Vec<_>>();
        return TextLayout {
            height: text_height(lines.len(), font_size, line_height, family, fonts),
            lines,
            // Nothing was measured, so nothing was broken.
            broke_mid_word: false,
        };
    };
    let max_ratio = width / font_size;
    let measure = |value: &str| {
        fonts
            .text_advance_ratio(family, value)
            .unwrap_or(f64::INFINITY)
    };
    let mut lines = Vec::new();
    let mut broke_mid_word = false;
    for paragraph in text.split('\n') {
        broke_mid_word |= wrap_paragraph(paragraph, max_ratio, &measure, &mut lines);
    }
    TextLayout {
        height: text_height(lines.len(), font_size, line_height, family, fonts),
        lines,
        broke_mid_word,
    }
}

fn text_height(
    line_count: usize,
    font_size: f64,
    line_height: f64,
    family: &str,
    fonts: &FontSet,
) -> f64 {
    let extra_lines = line_count.saturating_sub(1) as f64;
    font_size
        * (fonts.ascent_ratio(family) + fonts.descent_ratio(family) + extra_lines * line_height)
}

/// Wraps one paragraph, reporting whether a word had to be split.
fn wrap_paragraph(
    paragraph: &str,
    max_width: f64,
    measure: &impl Fn(&str) -> f64,
    lines: &mut Vec<String>,
) -> bool {
    let words = paragraph.split_whitespace().collect::<Vec<_>>();
    if words.is_empty() {
        lines.push(String::new());
        return false;
    }

    let mut broke_mid_word = false;
    let mut current = String::new();
    for word in words {
        let candidate = if current.is_empty() {
            word.to_owned()
        } else {
            format!("{current} {word}")
        };
        if measure(&candidate) <= max_width {
            current = candidate;
            continue;
        }
        if !current.is_empty() {
            lines.push(std::mem::take(&mut current));
        }
        if measure(word) <= max_width {
            current.push_str(word);
            continue;
        }

        // Reaching here is the detection: the word does not fit its box on a
        // line of its own, so it is split at character boundaries.
        broke_mid_word = true;
        for character in word.chars() {
            let mut candidate = current.clone();
            candidate.push(character);
            if !current.is_empty() && measure(&candidate) > max_width {
                lines.push(std::mem::take(&mut current));
            }
            current.push(character);
        }
    }
    lines.push(current);
    broke_mid_word
}

/// A `mix-blend-mode` for a layer that asks for one.
///
/// Every mode this build names was checked to rasterize. A mode it does not
/// name is refused rather than composited as `normal`: the document keeps the
/// value, but drawing something else would be a picture that looks right and
/// is not.
fn blend_attribute(layer: &Layer) -> Result<String, RenderError> {
    let mode = &layer.blend_mode;
    if !mode.is_rendered() {
        return Err(RenderError::UnsupportedBlendMode {
            layer: layer.id.clone(),
            mode: mode.as_str().to_owned(),
        });
    }
    Ok(if mode.is_default() {
        String::new()
    } else {
        format!(" style=\"mix-blend-mode:{}\"", mode.as_str())
    })
}

/// The id of a layer's filter, and the attribute that references it.
fn filter_attribute(layer: &Layer) -> String {
    if layer.effects.is_empty() {
        String::new()
    } else {
        format!(" filter=\"url(#{})\"", filter_id(layer))
    }
}

fn filter_id(layer: &Layer) -> String {
    format!("fx-{}", layer.id)
}

/// A layer's effect stack, as one SVG filter.
///
/// Two decisions that are not obvious and matter a lot:
///
/// * **`color-interpolation-filters="sRGB"`.** SVG's default filter space is
///   linearRGB, where `slope="1.5"` comes out as roughly ×1.2 in the output.
///   Nobody typing "brightness 1.5" means that. In sRGB the arithmetic is
///   exactly what it looks like.
/// * **A generous filter region.** The default region clips at 110% of the
///   bounding box, which cuts the soft edge off any blur worth applying.
///
/// Effects chain in document order: each primitive reads the previous one's
/// result, so `[blur, saturation]` is a blurred thing desaturated, and the
/// other order is a desaturated thing blurred — which are different pictures,
/// as they should be.
fn filter_for(layer: &Layer) -> Result<String, RenderError> {
    let mut body = String::new();
    let mut input = "SourceGraphic".to_owned();

    for (index, effect) in layer.effects.iter().enumerate() {
        let result = format!("e{index}");
        match effect {
            Effect::Brightness { amount } => {
                component_transfer(&mut body, &input, &result, *amount, 0.0);
            }
            Effect::Contrast { amount } => {
                // Pivot around mid grey, so contrast 0 is flat grey rather
                // than black: slope a, intercept (1 - a) / 2.
                component_transfer(&mut body, &input, &result, *amount, (1.0 - amount) / 2.0);
            }
            Effect::Saturation { amount } => {
                let _ = writeln!(
                    body,
                    "      <feColorMatrix in=\"{input}\" result=\"{result}\" \
                     type=\"saturate\" values=\"{}\"/>",
                    number(*amount)
                );
            }
            Effect::Blur { radius } => {
                let _ = writeln!(
                    body,
                    "      <feGaussianBlur in=\"{input}\" result=\"{result}\" \
                     stdDeviation=\"{}\"/>",
                    number(*radius)
                );
            }
            Effect::Grain {
                amount,
                seed,
                scale,
            } => {
                grain(&mut body, &input, &result, *amount, *seed, *scale);
            }
            // One primitive, not a decomposition into offset/blur/flood/merge:
            // resvg implements `feDropShadow` natively, and the two were
            // measured to produce identical pixels, so the shorter one wins.
            Effect::DropShadow {
                dx,
                dy,
                blur,
                color: shadow,
            } => {
                let [r, g, b, a] = shadow
                    .to_rgba()
                    .ok_or_else(|| RenderError::InvalidColor(shadow.as_str().to_owned()))?;
                // A shadow's strength is written in its colour's alpha, which
                // is where every other colour in this document writes it; the
                // filter wants the two separately. Omitted when opaque so the
                // common case stays short.
                let flood_opacity = if a == 255 {
                    String::new()
                } else {
                    format!(" flood-opacity=\"{}\"", number(f64::from(a) / 255.0))
                };
                let _ = writeln!(
                    body,
                    "      <feDropShadow in=\"{input}\" result=\"{result}\" dx=\"{dx}\" \
                     dy=\"{dy}\" stdDeviation=\"{blur}\" flood-color=\"#{r:02x}{g:02x}{b:02x}\"\
                     {flood_opacity}/>",
                    dx = number(*dx),
                    dy = number(*dy),
                    blur = number(*blur),
                );
            }
            Effect::Other(_) => {
                return Err(RenderError::UnsupportedEffect {
                    layer: layer.id.clone(),
                    effect: effect.type_name().to_owned(),
                })
            }
        }
        input = result;
    }

    // A percentage region is a percentage of the *bounding box*, which is
    // exactly the wrong unit for an offset shadow: a thin shape has a small
    // box, and 50% of a small box is a small margin. A shadow therefore gets
    // an explicit region in user units; everything else keeps the region it
    // has always had, so no existing output moves.
    let region = match shadow_region(layer) {
        Some((x, y, width, height)) => format!(
            "filterUnits=\"userSpaceOnUse\" x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"",
            number(x),
            number(y),
            number(width),
            number(height),
        ),
        None => "x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"".to_owned(),
    };

    Ok(format!(
        "    <filter id=\"{id}\" {region} color-interpolation-filters=\"sRGB\">\n\
         {body}    </filter>\n",
        id = filter_id(layer),
    ))
}

/// The user-space filter region for a stack that casts a shadow, if it does.
///
/// The union of the layer's box and its offset copy, expanded on each side by
/// the larger of half that axis's box side and `ceil(3σ) + 1`, σ being the
/// largest blur anywhere in the stack — a Gaussian blur earlier in the chain
/// widens the thing the shadow is cast from, so it counts too. `ceil(3σ) + 1`
/// was measured against both of resvg's blur implementations: the box branch
/// (σ ≥ 2) needs 2.875σ and the IIR branch below it needs 3.33σ, and the `+ 1`
/// is what keeps the IIR case from having zero slack. A region that is too
/// large costs memory and changes nothing, so erring wide is safe.
///
/// The trade-off, stated plainly: the region is sized from the layer's *box*,
/// so content that paints more than half a box outside it — an overflowing
/// text layer, a group whose children spill past its bounds — can have the
/// far edge of its shadow clipped. Sizing from real content bounds would mean
/// measuring every glyph and every descendant here, and this function is
/// deliberately arithmetic on the transform, which is the same on every
/// machine.
///
/// A group's box starts at the origin: its `<g>` carries a `translate`, so its
/// children and its filter both live in that translated space.
fn shadow_region(layer: &Layer) -> Option<(f64, f64, f64, f64)> {
    let mut offsets = Vec::new();
    let mut sigma: f64 = 0.0;
    for effect in &layer.effects {
        match effect {
            Effect::DropShadow { dx, dy, blur, .. } => {
                offsets.push((*dx, *dy));
                sigma = sigma.max(*blur);
            }
            Effect::Blur { radius } => sigma = sigma.max(*radius),
            _ => {}
        }
    }
    if offsets.is_empty() {
        return None;
    }

    let t = &layer.transform;
    let (box_x, box_y) = if matches!(&layer.kind, LayerKind::Group(_)) {
        (0.0, 0.0)
    } else {
        (t.x, t.y)
    };
    let (box_w, box_h) = (t.width, t.height);

    let (mut x0, mut y0) = (box_x, box_y);
    let (mut x1, mut y1) = (box_x + box_w, box_y + box_h);
    for (dx, dy) in offsets {
        x0 = x0.min(box_x + dx);
        y0 = y0.min(box_y + dy);
        x1 = x1.max(box_x + box_w + dx);
        y1 = y1.max(box_y + box_h + dy);
    }

    let blur_margin = (3.0 * sigma).ceil() + 1.0;
    let margin_x = (0.5 * box_w).max(blur_margin);
    let margin_y = (0.5 * box_h).max(blur_margin);
    Some((
        x0 - margin_x,
        y0 - margin_y,
        (x1 - x0) + 2.0 * margin_x,
        (y1 - y0) + 2.0 * margin_y,
    ))
}

/// The same linear transfer on each colour channel, leaving alpha alone.
fn component_transfer(out: &mut String, input: &str, result: &str, slope: f64, intercept: f64) {
    let _ = writeln!(
        out,
        "      <feComponentTransfer in=\"{input}\" result=\"{result}\">"
    );
    for channel in ["R", "G", "B"] {
        let _ = writeln!(
            out,
            "        <feFunc{channel} type=\"linear\" slope=\"{}\" intercept=\"{}\"/>",
            number(slope),
            number(intercept),
        );
    }
    let _ = writeln!(out, "      </feComponentTransfer>");
}

/// Seeded monochrome noise, overlaid on the layer.
///
/// `feTurbulence` is specified down to the integer arithmetic, so the same
/// seed produces the same noise on every machine — which is the only reason
/// grain is allowed to exist in a renderer that promises byte-identical output
/// (NFR-3). Nothing here reads a clock or a random number generator.
///
/// The noise is desaturated, squeezed to a band around mid grey, and composited
/// with `overlay`, for which mid grey is the neutral value: `amount` is
/// therefore how far the speckle may lighten or darken, symmetrically, and 0
/// leaves the layer alone. Finally it is clipped back to the layer's own alpha,
/// so grain cannot paint outside the thing it grains.
fn grain(out: &mut String, input: &str, result: &str, amount: f64, seed: u32, scale: f64) {
    // Feature size: a bigger `scale` means coarser noise, so it divides the
    // frequency. Guarded against a zero that validation should already have
    // refused.
    let frequency = 0.75 / scale.max(f64::EPSILON);
    let _ = writeln!(
        out,
        "      <feTurbulence type=\"fractalNoise\" baseFrequency=\"{}\" numOctaves=\"1\" \
         seed=\"{seed}\" result=\"{result}-noise\"/>",
        number(frequency),
    );
    let _ = writeln!(
        out,
        "      <feColorMatrix in=\"{result}-noise\" type=\"saturate\" values=\"0\" \
         result=\"{result}-grey\"/>",
    );
    let _ = writeln!(
        out,
        "      <feComponentTransfer in=\"{result}-grey\" result=\"{result}-band\">"
    );
    for channel in ["R", "G", "B"] {
        let _ = writeln!(
            out,
            "        <feFunc{channel} type=\"linear\" slope=\"{}\" intercept=\"{}\"/>",
            number(amount),
            number((1.0 - amount) / 2.0),
        );
    }
    // Opaque: the turbulence's own alpha is noise too, and a semi-transparent
    // overlay would thin the layer rather than texture it.
    let _ = writeln!(
        out,
        "        <feFuncA type=\"linear\" slope=\"0\" intercept=\"1\"/>"
    );
    let _ = writeln!(out, "      </feComponentTransfer>");
    let _ = writeln!(
        out,
        "      <feBlend in=\"{result}-band\" in2=\"{input}\" mode=\"overlay\" \
         result=\"{result}-mixed\"/>",
    );
    let _ = writeln!(
        out,
        "      <feComposite in=\"{result}-mixed\" in2=\"{input}\" operator=\"in\" \
         result=\"{result}\"/>",
    );
}

/// The `style` of a group element: its own blend mode, and isolation.
///
/// A group that holds a blending child isolates, so the child blends with what
/// is inside the group and not with the whole page behind it — which is what a
/// group means everywhere else. Isolation is emitted only when some child
/// actually blends: an isolated group is composited through an offscreen
/// buffer, and there is no reason to make every existing document pay for it.
/// Nested groups apply the same rule to themselves, so a blend never escapes
/// more than one level by accident.
fn group_style(layer: &Layer, group: &GroupLayer) -> Result<String, RenderError> {
    let mut parts = Vec::new();
    if !layer.blend_mode.is_rendered() {
        return Err(RenderError::UnsupportedBlendMode {
            layer: layer.id.clone(),
            mode: layer.blend_mode.as_str().to_owned(),
        });
    }
    if !layer.blend_mode.is_default() {
        parts.push(format!("mix-blend-mode:{}", layer.blend_mode.as_str()));
    }
    // A child that blends at all needs the group isolated. A child whose mode
    // this build does not render is left to its own element to refuse — that
    // is where the error names the layer actually at fault.
    if group
        .children
        .iter()
        .any(|child| !child.blend_mode.is_default() && child.blend_mode.is_rendered())
    {
        parts.push("isolation:isolate".to_owned());
    }
    Ok(if parts.is_empty() {
        String::new()
    } else {
        format!(" style=\"{}\"", parts.join(";"))
    })
}

fn opacity_attribute(opacity: f64) -> String {
    if opacity >= 1.0 {
        String::new()
    } else {
        format!(" opacity=\"{}\"", number(opacity))
    }
}

fn rotation_attribute(transform: &Transform) -> String {
    if transform.rotation == 0.0 {
        return String::new();
    }
    format!(
        " transform=\"rotate({} {} {})\"",
        number(transform.rotation),
        number(transform.x + transform.width / 2.0),
        number(transform.y + transform.height / 2.0),
    )
}

fn color(color: &Color) -> Result<String, RenderError> {
    let [r, g, b, a] = color
        .to_rgba()
        .ok_or_else(|| RenderError::InvalidColor(color.as_str().to_owned()))?;
    // Alpha is folded into an rgba() colour rather than a separate
    // fill-opacity: one value, one place it can go wrong.
    if a == 255 {
        Ok(format!("#{r:02x}{g:02x}{b:02x}"))
    } else {
        Ok(format!(
            "rgba({r},{g},{b},{})",
            number(f64::from(a) / 255.0)
        ))
    }
}

/// Formats a number identically on every platform.
///
/// Rounded to six decimals — far finer than a pixel — so that arithmetic
/// tails like `0.30000000000000004` cannot reach the output and make two
/// otherwise identical renders differ.
pub(crate) fn number(value: f64) -> String {
    if !value.is_finite() {
        return "0".to_owned();
    }
    let rounded = (value * 1_000_000.0).round() / 1_000_000.0;
    if rounded == 0.0 {
        // Collapses -0 to 0.
        return "0".to_owned();
    }
    let mut text = format!("{rounded:.6}");
    while text.ends_with('0') {
        text.pop();
    }
    if text.ends_with('.') {
        text.pop();
    }
    text
}

fn escape_text(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    for character in text.chars() {
        match character {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            other => out.push(other),
        }
    }
    out
}

fn attribute(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    for character in text.chars() {
        match character {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&apos;"),
            other => out.push(other),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn numbers_are_short_and_stable() {
        assert_eq!(number(1.0), "1");
        assert_eq!(number(-0.0), "0");
        assert_eq!(number(0.1 + 0.2), "0.3");
        assert_eq!(number(1.0 / 3.0), "0.333333");
        assert_eq!(number(f64::NAN), "0");
    }

    #[test]
    fn markup_characters_are_escaped() {
        assert_eq!(escape_text("a & b < c"), "a &amp; b &lt; c");
        assert_eq!(attribute("say \"hi\""), "say &quot;hi&quot;");
    }

    #[test]
    fn a_font_family_list_is_split_trimmed_unquoted_and_stripped_of_generics() {
        assert_eq!(families_in("Noto Sans"), ["Noto Sans"]);
        assert_eq!(
            families_in("  'Noto Sans' , \"Inter\" ,sans-serif "),
            ["Noto Sans", "Inter"]
        );
        // A list of nothing but roles names no file, so there is nothing a
        // document could add and nothing to refuse.
        assert!(families_in("serif, SANS-SERIF, system-ui").is_empty());
        assert!(families_in("").is_empty());
    }

    #[test]
    fn only_an_svg_data_uri_is_read_back() {
        let base64 = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
        assert_eq!(svg_data_uri(base64).as_deref(), Some("<svg></svg>"));

        let plain = "data:image/svg+xml,%3Csvg%3E%3C/svg%3E";
        assert_eq!(svg_data_uri(plain).as_deref(), Some("<svg></svg>"));

        // A path, and an asset that is not vector: nothing this can read, and
        // guessing would be worse than not checking.
        assert_eq!(svg_data_uri("assets/logo.svg"), None);
        assert_eq!(svg_data_uri("data:image/png;base64,iVBOR"), None);
    }

    #[test]
    fn the_refusal_names_the_asset_and_the_family_when_there_is_one() {
        let named = RenderError::SvgAssetTextWithoutFont {
            asset: "logo.svg".to_owned(),
            family: Some("Arial".to_owned()),
        };
        assert_eq!(
            named.to_string(),
            "SVG asset \"logo.svg\" draws text but no font is loaded for \"Arial\"; \
             add the family to the document's fonts or outline the text before importing"
        );

        // No family to name is a different instruction, not a shorter one:
        // there is nothing to install, so the asset itself has to change.
        let unnamed = RenderError::SvgAssetTextWithoutFont {
            asset: "logo.svg".to_owned(),
            family: None,
        };
        assert_eq!(
            unnamed.to_string(),
            "SVG asset \"logo.svg\" draws text that names no font family; \
             name one the document loads or outline the text before importing"
        );
    }

    #[test]
    fn colors_render_as_hex_or_rgba() {
        assert_eq!(color(&Color::new("#ff8000")).unwrap(), "#ff8000");
        assert_eq!(
            color(&Color::new("#ff800080")).unwrap(),
            "rgba(255,128,0,0.501961)"
        );
    }
}
