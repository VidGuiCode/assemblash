//! Export formats and the quality setting of a request.

/// A file format that an export can write.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ExportFormat {
    /// PNG, with alpha. The default.
    Png,
    /// The SVG that the renderer rasterizes.
    Svg,
    /// A raster PDF: one image for each page.
    Pdf,
    /// JPEG. JPEG has no alpha, so pixels are flattened onto white.
    Jpeg,
    /// Lossless WebP, with alpha.
    Webp,
}

/// The error for a requested format that is not one of the five formats.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error(
    "export format {requested:?} is not supported; use one of: png, svg, pdf, jpeg (or jpg), webp"
)]
pub struct ExportFormatNotSupported {
    /// The format that was asked for, as written.
    pub requested: String,
}

impl ExportFormatNotSupported {
    /// Stable machine-readable code.
    pub const CODE: &'static str = "exportFormatNotSupported";
}

impl ExportFormat {
    /// All formats, in a fixed order.
    pub const ALL: [Self; 5] = [Self::Png, Self::Svg, Self::Pdf, Self::Jpeg, Self::Webp];

    /// The name of this format in a request.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Png => "png",
            Self::Svg => "svg",
            Self::Pdf => "pdf",
            Self::Jpeg => "jpeg",
            Self::Webp => "webp",
        }
    }

    /// The file name extension, without the dot.
    pub fn extension(self) -> &'static str {
        match self {
            Self::Png => "png",
            Self::Svg => "svg",
            Self::Pdf => "pdf",
            Self::Jpeg => "jpg",
            Self::Webp => "webp",
        }
    }

    /// The media type of the file.
    pub fn media_type(self) -> &'static str {
        match self {
            Self::Png => "image/png",
            Self::Svg => "image/svg+xml",
            Self::Pdf => "application/pdf",
            Self::Jpeg => "image/jpeg",
            Self::Webp => "image/webp",
        }
    }

    /// Reads a requested format. Case and surrounding spaces do not matter.
    ///
    /// `jpg` is a second name for `jpeg`. Every other unknown value is
    /// refused.
    pub fn parse(requested: &str) -> Result<Self, ExportFormatNotSupported> {
        let value = requested.trim();
        if value.eq_ignore_ascii_case("jpg") {
            return Ok(Self::Jpeg);
        }
        Self::ALL
            .into_iter()
            .find(|format| value.eq_ignore_ascii_case(format.as_str()))
            .ok_or_else(|| ExportFormatNotSupported {
                requested: requested.to_owned(),
            })
    }

    /// Reads an optional request: no value is PNG.
    pub fn from_request(requested: Option<&str>) -> Result<Self, ExportFormatNotSupported> {
        requested.map_or(Ok(Self::Png), Self::parse)
    }
}

/// The JPEG quality when the request gives none.
pub const DEFAULT_JPEG_QUALITY: u8 = 90;

/// How to encode an export, after the quality of the request is checked.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EncodeSettings {
    /// PNG.
    Png,
    /// SVG.
    Svg,
    /// Raster PDF.
    Pdf,
    /// JPEG at this quality, 1 to 100.
    Jpeg {
        /// The JPEG quality, 1 to 100.
        quality: u8,
    },
    /// Lossless WebP.
    WebpLossless,
}

impl EncodeSettings {
    /// The format of these settings.
    pub fn format(self) -> ExportFormat {
        match self {
            Self::Png => ExportFormat::Png,
            Self::Svg => ExportFormat::Svg,
            Self::Pdf => ExportFormat::Pdf,
            Self::Jpeg { .. } => ExportFormat::Jpeg,
            Self::WebpLossless => ExportFormat::Webp,
        }
    }
}

/// The error for a quality value that the format cannot use.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum QualityError {
    /// A JPEG quality outside 1 to 100.
    #[error("JPEG quality {quality} is out of range; use a value from 1 to 100")]
    OutOfRange {
        /// The quality that was asked for.
        quality: u32,
    },
    /// A quality with WebP, which is a request for lossy WebP.
    #[error(
        "lossy WebP is not supported because its bytes are not the same on all targets; \
         for lossless WebP, omit the quality; for a lossy file, use format jpeg with a quality"
    )]
    LossyWebpNotSupported {
        /// The quality that was asked for.
        quality: u32,
    },
    /// A quality with PNG, SVG or PDF.
    #[error("quality applies to JPEG only; omit the quality for format {}", format.as_str())]
    NotApplicable {
        /// The format of the request.
        format: ExportFormat,
        /// The quality that was asked for.
        quality: u32,
    },
}

impl QualityError {
    /// Code of [`QualityError::OutOfRange`].
    pub const OUT_OF_RANGE_CODE: &'static str = "exportQualityOutOfRange";
    /// Code of [`QualityError::LossyWebpNotSupported`].
    pub const LOSSY_WEBP_CODE: &'static str = "lossyWebpNotSupported";
    /// Code of [`QualityError::NotApplicable`].
    pub const NOT_APPLICABLE_CODE: &'static str = "exportQualityNotApplicable";

    /// Stable machine-readable code.
    pub fn code(&self) -> &'static str {
        match self {
            Self::OutOfRange { .. } => Self::OUT_OF_RANGE_CODE,
            Self::LossyWebpNotSupported { .. } => Self::LOSSY_WEBP_CODE,
            Self::NotApplicable { .. } => Self::NOT_APPLICABLE_CODE,
        }
    }
}

/// Checks the quality of a request against its format.
///
/// * JPEG: 1 to 100. No quality gives [`DEFAULT_JPEG_QUALITY`].
/// * WebP: no quality gives lossless WebP. Any quality is refused.
/// * PNG, SVG and PDF: any quality is refused.
pub fn resolve_quality(
    format: ExportFormat,
    quality: Option<u32>,
) -> Result<EncodeSettings, QualityError> {
    match (format, quality) {
        (ExportFormat::Jpeg, None) => Ok(EncodeSettings::Jpeg {
            quality: DEFAULT_JPEG_QUALITY,
        }),
        (ExportFormat::Jpeg, Some(quality)) => match u8::try_from(quality) {
            Ok(value @ 1..=100) => Ok(EncodeSettings::Jpeg { quality: value }),
            _ => Err(QualityError::OutOfRange { quality }),
        },
        (ExportFormat::Webp, None) => Ok(EncodeSettings::WebpLossless),
        (ExportFormat::Webp, Some(quality)) => Err(QualityError::LossyWebpNotSupported { quality }),
        (ExportFormat::Png, None) => Ok(EncodeSettings::Png),
        (ExportFormat::Svg, None) => Ok(EncodeSettings::Svg),
        (ExportFormat::Pdf, None) => Ok(EncodeSettings::Pdf),
        (format, Some(quality)) => Err(QualityError::NotApplicable { format, quality }),
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn every_format_is_read_in_any_case_and_png_is_the_default() {
        for format in ExportFormat::ALL {
            let upper = format.as_str().to_ascii_uppercase();
            assert_eq!(ExportFormat::parse(format.as_str()).unwrap(), format);
            assert_eq!(ExportFormat::parse(&format!(" {upper} ")).unwrap(), format);
        }
        assert_eq!(ExportFormat::parse("jpg").unwrap(), ExportFormat::Jpeg);
        assert_eq!(ExportFormat::parse(" JPG").unwrap(), ExportFormat::Jpeg);
        assert_eq!(ExportFormat::from_request(None).unwrap(), ExportFormat::Png);
        assert_eq!(
            ExportFormat::from_request(Some("webp")).unwrap(),
            ExportFormat::Webp
        );
    }

    #[test]
    fn extensions_and_media_types_are_fixed() {
        let table: Vec<_> = ExportFormat::ALL
            .into_iter()
            .map(|format| (format.extension(), format.media_type()))
            .collect();
        assert_eq!(
            table,
            [
                ("png", "image/png"),
                ("svg", "image/svg+xml"),
                ("pdf", "application/pdf"),
                ("jpg", "image/jpeg"),
                ("webp", "image/webp"),
            ]
        );
    }

    #[test]
    fn an_unknown_format_is_refused_with_the_list_of_formats() {
        for value in ["gif", "tiff", "", "png8"] {
            let error = ExportFormat::parse(value).unwrap_err();
            assert_eq!(error.requested, value);
            let message = error.to_string();
            for name in ["png", "svg", "pdf", "jpeg", "webp"] {
                assert!(message.contains(name), "{message}");
            }
        }
        assert_eq!(ExportFormatNotSupported::CODE, "exportFormatNotSupported");
    }

    #[test]
    fn jpeg_quality_defaults_to_90_and_must_be_1_to_100() {
        assert_eq!(
            resolve_quality(ExportFormat::Jpeg, None).unwrap(),
            EncodeSettings::Jpeg { quality: 90 }
        );
        for quality in [1, 75, 100] {
            assert_eq!(
                resolve_quality(ExportFormat::Jpeg, Some(quality)).unwrap(),
                EncodeSettings::Jpeg {
                    quality: quality as u8
                }
            );
        }
        for quality in [0, 101, 256, u32::MAX] {
            let error = resolve_quality(ExportFormat::Jpeg, Some(quality)).unwrap_err();
            assert_eq!(error, QualityError::OutOfRange { quality });
            assert_eq!(error.code(), "exportQualityOutOfRange");
        }
    }

    #[test]
    fn webp_without_quality_is_lossless_and_any_quality_is_refused() {
        assert_eq!(
            resolve_quality(ExportFormat::Webp, None).unwrap(),
            EncodeSettings::WebpLossless
        );
        for quality in [0, 80, 100, 500] {
            let error = resolve_quality(ExportFormat::Webp, Some(quality)).unwrap_err();
            assert_eq!(error.code(), "lossyWebpNotSupported");
            let message = error.to_string();
            assert!(message.contains("lossy WebP is not supported"), "{message}");
            assert!(message.contains("not the same on all targets"), "{message}");
            assert!(message.contains("lossless WebP"), "{message}");
            assert!(message.contains("omit the quality"), "{message}");
            assert!(message.contains("jpeg"), "{message}");
        }
    }

    #[test]
    fn a_quality_with_png_svg_or_pdf_is_refused() {
        for format in [ExportFormat::Png, ExportFormat::Svg, ExportFormat::Pdf] {
            assert_eq!(
                resolve_quality(format, None).unwrap().format(),
                format,
                "no quality is accepted"
            );
            let error = resolve_quality(format, Some(80)).unwrap_err();
            assert_eq!(error.code(), "exportQualityNotApplicable");
            assert!(error.to_string().contains("JPEG only"), "{error}");
        }
    }
}
