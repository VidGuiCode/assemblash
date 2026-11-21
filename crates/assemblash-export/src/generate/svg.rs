//! The SVG writer the generators share.
//!
//! Elements are written in the order they are added, attributes in the order
//! they are given. Numbers go through [`num`], so the same value always
//! gives the same characters.

use std::fmt::Write as _;

use super::GenerateError;

/// Formats a coordinate with at most two decimals.
///
/// The value is rounded to hundredths, converted to an integer, and written
/// from that integer, so no float formatting is involved. `-0` is written as
/// `0`. A value that is not finite is written as `0`; the generators check
/// their input before they get here.
pub(crate) fn num(value: f64) -> String {
    if !value.is_finite() {
        return "0".to_owned();
    }
    let hundredths = (value * 100.0).round() as i64;
    if hundredths == 0 {
        return "0".to_owned();
    }
    let sign = if hundredths < 0 { "-" } else { "" };
    let magnitude = hundredths.unsigned_abs();
    let whole = magnitude / 100;
    let fraction = magnitude % 100;
    match fraction {
        0 => format!("{sign}{whole}"),
        f if f % 10 == 0 => format!("{sign}{whole}.{}", f / 10),
        f => format!("{sign}{whole}.{f:02}"),
    }
}

/// Checks a colour and returns it in lowercase.
pub(crate) fn color(field: &str, value: &str) -> Result<String, GenerateError> {
    let valid = value.strip_prefix('#').is_some_and(|hex| {
        matches!(hex.len(), 3 | 4 | 6 | 8) && hex.bytes().all(|b| b.is_ascii_hexdigit())
    });
    if valid {
        Ok(value.to_ascii_lowercase())
    } else {
        Err(GenerateError::InvalidColor {
            field: field.to_owned(),
            value: value.to_owned(),
        })
    }
}

/// An SVG document being written.
#[derive(Debug)]
pub(crate) struct SvgWriter {
    out: String,
}

impl SvgWriter {
    /// Starts a document `width` by `height` CSS pixels.
    pub(crate) fn new(width: f64, height: f64) -> Self {
        let (w, h) = (num(width), num(height));
        Self {
            out: format!(
                "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{w}\" height=\"{h}\" \
                 viewBox=\"0 0 {w} {h}\">"
            ),
        }
    }

    /// Writes one empty element. `attributes` are written as given; values
    /// are escaped.
    pub(crate) fn element(&mut self, name: &str, attributes: &[(&str, String)]) {
        self.open_tag(name, attributes);
        self.out.push_str("/>");
    }

    /// Opens an element that has children. Close it with [`Self::close`].
    pub(crate) fn open(&mut self, name: &str, attributes: &[(&str, String)]) {
        self.open_tag(name, attributes);
        self.out.push('>');
    }

    /// Closes an element opened with [`Self::open`].
    pub(crate) fn close(&mut self, name: &str) {
        let _ = write!(self.out, "</{name}>");
    }

    /// Ends the document and returns it.
    pub(crate) fn finish(mut self) -> String {
        self.out.push_str("</svg>\n");
        self.out
    }

    fn open_tag(&mut self, name: &str, attributes: &[(&str, String)]) {
        let _ = write!(self.out, "<{name}");
        for (key, value) in attributes {
            let _ = write!(self.out, " {key}=\"{}\"", escape(value));
        }
    }
}

fn escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            c => out.push(c),
        }
    }
    out
}

/// Path data for a rectangle.
pub(crate) fn rect_path(x: f64, y: f64, width: f64, height: f64) -> String {
    format!(
        "M{} {}H{}V{}H{}Z",
        num(x),
        num(y),
        num(x + width),
        num(y + height),
        num(x)
    )
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    #[test]
    fn numbers_have_at_most_two_decimals_and_no_negative_zero() {
        assert_eq!(num(0.0), "0");
        assert_eq!(num(-0.0), "0");
        assert_eq!(num(-0.001), "0");
        assert_eq!(num(1.0), "1");
        assert_eq!(num(1.5), "1.5");
        assert_eq!(num(1.25), "1.25");
        assert_eq!(num(1.234), "1.23");
        assert_eq!(num(-12.345_6), "-12.35");
        assert_eq!(num(0.05), "0.05");
        assert_eq!(num(f64::NAN), "0");
    }

    #[test]
    fn colours_are_checked_and_lowercased() {
        assert_eq!(color("c", "#ABC").unwrap(), "#abc");
        assert_eq!(color("c", "#11223344").unwrap(), "#11223344");
        for bad in ["red", "#12", "#12345", "112233", "#gg0000"] {
            assert!(color("c", bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn attribute_values_are_escaped() {
        let mut svg = SvgWriter::new(10.0, 10.0);
        svg.element("rect", &[("fill", "\"<&>".to_owned())]);
        assert!(svg.finish().contains("fill=\"&quot;&lt;&amp;&gt;\""));
    }
}
