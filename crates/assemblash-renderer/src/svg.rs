//! Document to SVG.
//!
//! A pure function: no filesystem, no font discovery, no clock. Everything
//! variable is passed in, which is what makes the output testable as a string
//! and reproducible on every platform (NFR-1).

use std::collections::BTreeMap;
use std::fmt::Write as _;

use assemblash_core::document::{ImageFit, Layer, LayerKind, TextAlign, Transform};
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
                 {opacity}{rotation}>",
                x = number(x),
                // The first baseline sits one line below the box top. Real
                // ascent metrics arrive with the font store (v0.5); until then
                // this is the same on every platform, which is what matters.
                y = number(t.y + text.font_size),
                family = attribute(&text.font_family),
                size = number(text.font_size),
                fill = color(&text.color)?,
                anchor = anchor,
                opacity = opacity_attribute(layer.opacity),
                rotation = rotation_attribute(t),
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
                 preserveAspectRatio=\"{preserve}\" href=\"{href}\"{opacity}{rotation}/>",
                x = number(t.x),
                y = number(t.y),
                w = number(t.width),
                h = number(t.height),
                preserve = preserve,
                href = attribute(href),
                opacity = opacity_attribute(layer.opacity),
                rotation = rotation_attribute(t),
            );
        }

        LayerKind::Group(group) => {
            let _ = writeln!(
                out,
                "{pad}<g transform=\"translate({x} {y})\"{opacity}>",
                x = number(t.x),
                y = number(t.y),
                opacity = opacity_attribute(layer.opacity),
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
