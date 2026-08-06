//! Document to SVG.
//!
//! A pure function: no filesystem, no font discovery, no clock. Everything
//! variable is passed in, which is what makes the output testable as a string
//! and reproducible on every platform (NFR-1).

use std::collections::BTreeMap;
use std::fmt::Write as _;

use assemblash_core::document::{
    Effect, GroupLayer, ImageFit, Layer, LayerKind, TextAlign, Transform,
};
use assemblash_core::ids::AssetId;
use assemblash_core::{validate, Color, Document};

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

            for (index, line) in text.text.split('\n').enumerate() {
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
            Effect::Other(_) => {
                return Err(RenderError::UnsupportedEffect {
                    layer: layer.id.clone(),
                    effect: effect.type_name().to_owned(),
                })
            }
        }
        input = result;
    }

    Ok(format!(
        "    <filter id=\"{id}\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\" \
         color-interpolation-filters=\"sRGB\">\n{body}    </filter>\n",
        id = filter_id(layer),
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
fn number(value: f64) -> String {
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
    fn colors_render_as_hex_or_rgba() {
        assert_eq!(color(&Color::new("#ff8000")).unwrap(), "#ff8000");
        assert_eq!(
            color(&Color::new("#ff800080")).unwrap(),
            "rgba(255,128,0,0.501961)"
        );
    }
}
