//! QR codes.
//!
//! The matrix comes from `qrcodegen`, which uses integer arithmetic only.
//! The graphic is one background rectangle and one path for the dark
//! modules, in module units. It has no text, so it needs no font.

use serde::{Deserialize, Serialize};

use super::svg::color;
use super::{GenerateError, Generated};

/// How much of a damaged code a reader can recover.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum QrErrorCorrection {
    /// About 7 percent.
    L,
    /// About 15 percent. The default.
    #[default]
    M,
    /// About 25 percent.
    Q,
    /// About 30 percent.
    H,
}

impl QrErrorCorrection {
    fn as_str(self) -> &'static str {
        match self {
            Self::L => "L",
            Self::M => "M",
            Self::Q => "Q",
            Self::H => "H",
        }
    }

    fn ecc(self) -> qrcodegen::QrCodeEcc {
        match self {
            Self::L => qrcodegen::QrCodeEcc::Low,
            Self::M => qrcodegen::QrCodeEcc::Medium,
            Self::Q => qrcodegen::QrCodeEcc::Quartile,
            Self::H => qrcodegen::QrCodeEcc::High,
        }
    }
}

/// A QR code spec.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct QrSpec {
    /// The text the code holds, for example a URL.
    pub data: String,
    /// The error correction level. Default `M`.
    #[serde(default)]
    pub error_correction: QrErrorCorrection,
    /// The quiet zone around the code, in modules. Default 4, which the
    /// standard asks for.
    #[serde(default = "default_margin")]
    pub margin: u32,
    /// The size of one module in pixels. Default 10.
    #[serde(default = "default_module_size")]
    pub module_size: f64,
    /// The dark colour. Default `#000000`.
    #[serde(default = "default_foreground")]
    pub foreground: String,
    /// The light colour. Default `#ffffff`. Readers need contrast, so a
    /// transparent background is not offered.
    #[serde(default = "default_background")]
    pub background: String,
}

fn default_margin() -> u32 {
    4
}
fn default_module_size() -> f64 {
    10.0
}
fn default_foreground() -> String {
    "#000000".to_owned()
}
fn default_background() -> String {
    "#ffffff".to_owned()
}

impl QrSpec {
    /// A spec with every setting at its default.
    pub fn new(data: impl Into<String>) -> Self {
        Self {
            data: data.into(),
            error_correction: QrErrorCorrection::default(),
            margin: default_margin(),
            module_size: default_module_size(),
            foreground: default_foreground(),
            background: default_background(),
        }
    }

    /// Checks the spec without drawing it.
    pub fn validate(&self) -> Result<(), GenerateError> {
        if self.data.is_empty() {
            return Err(GenerateError::spec("data", "must not be empty"));
        }
        if self.margin > 40 {
            return Err(GenerateError::spec("margin", "must be from 0 to 40"));
        }
        if !self.module_size.is_finite() || !(1.0..=100.0).contains(&self.module_size) {
            return Err(GenerateError::spec("moduleSize", "must be from 1 to 100"));
        }
        color("foreground", &self.foreground)?;
        color("background", &self.background)?;
        Ok(())
    }
}

pub(crate) fn render(spec: &QrSpec) -> Result<Generated, GenerateError> {
    spec.validate()?;
    let code =
        qrcodegen::QrCode::encode_text(&spec.data, spec.error_correction.ecc()).map_err(|_| {
            GenerateError::QrDataTooLong {
                bytes: spec.data.len(),
                level: spec.error_correction.as_str(),
            }
        })?;
    let modules = code.size();
    let margin = i32::try_from(spec.margin).unwrap_or(0);
    let total = modules + 2 * margin;
    let pixels = f64::from(total) * spec.module_size;
    super::chart::size_in_range("moduleSize", pixels).map_err(|_| {
        GenerateError::spec(
            "moduleSize",
            "the code is larger than 8192 pixels; use a smaller moduleSize",
        )
    })?;

    // One horizontal run of dark modules per subpath.
    let mut d = String::new();
    for y in 0..modules {
        let mut x = 0;
        while x < modules {
            if code.get_module(x, y) {
                let start = x;
                while x < modules && code.get_module(x, y) {
                    x += 1;
                }
                d.push_str(&format!(
                    "M{} {}h{}v1h-{}z",
                    start + margin,
                    y + margin,
                    x - start,
                    x - start
                ));
            } else {
                x += 1;
            }
        }
    }

    let size = super::svg::num(pixels);
    let svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{size}\" height=\"{size}\" \
         viewBox=\"0 0 {total} {total}\">\
         <rect width=\"{total}\" height=\"{total}\" fill=\"{}\"/>\
         <path d=\"{d}\" fill=\"{}\"/></svg>\n",
        spec.background.to_ascii_lowercase(),
        spec.foreground.to_ascii_lowercase(),
    );
    Ok(Generated {
        svg,
        width: pixels,
        height: pixels,
    })
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    #[test]
    fn the_same_data_gives_the_same_bytes() {
        let a = render(&QrSpec::new("https://example.org/a")).unwrap();
        let b = render(&QrSpec::new("https://example.org/a")).unwrap();
        assert_eq!(a, b);
        assert_ne!(a, render(&QrSpec::new("https://example.org/b")).unwrap());
        // Version 2 at level M is 25 modules, plus a margin of 4 on each side.
        assert_eq!(a.width, 330.0);
        assert!(a.svg.contains("viewBox=\"0 0 33 33\""));
    }

    #[test]
    fn data_too_long_is_refused_with_the_level() {
        let error = render(&QrSpec {
            error_correction: QrErrorCorrection::H,
            module_size: 1.0,
            ..QrSpec::new("x".repeat(3000))
        })
        .unwrap_err();
        assert_eq!(
            error,
            GenerateError::QrDataTooLong {
                bytes: 3000,
                level: "H"
            }
        );
    }
}
