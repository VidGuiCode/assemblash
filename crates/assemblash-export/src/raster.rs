//! JPEG and lossless WebP encoders.

use image::ImageEncoder;

/// The error for an encode that cannot finish.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum EncodeError {
    /// The pixel buffer does not have `width * height * 4` bytes.
    #[error("a {width}x{height} RGBA image needs {expected} bytes, the buffer has {actual}")]
    PixelBufferSize {
        /// Width in pixels.
        width: u32,
        /// Height in pixels.
        height: u32,
        /// Bytes that the size needs.
        expected: u128,
        /// Bytes in the buffer.
        actual: usize,
    },
    /// A PDF page size or bleed that is not a finite value of zero or more.
    #[error("the PDF page geometry is not valid: {0}")]
    PageGeometry(String),
    /// The encoder refused the image, for example because it is too large.
    #[error("the {format} encoder failed: {message}")]
    Encoder {
        /// The format, `jpeg` or `webp`.
        format: &'static str,
        /// The message of the encoder.
        message: String,
    },
}

impl EncodeError {
    /// Stable machine-readable code.
    pub const CODE: &'static str = "exportEncodingFailed";
}

/// Checks that `rgba` holds `width * height` pixels of four bytes.
pub(crate) fn check_rgba(width: u32, height: u32, rgba: &[u8]) -> Result<(), EncodeError> {
    // A u128 holds 4 * u32::MAX * u32::MAX without overflow.
    let expected = u128::from(width) * u128::from(height) * 4;
    if usize::try_from(expected) == Ok(rgba.len()) {
        Ok(())
    } else {
        Err(EncodeError::PixelBufferSize {
            width,
            height,
            expected,
            actual: rgba.len(),
        })
    }
}

/// Flattens straight-alpha RGBA onto white and gives RGB.
///
/// Integer arithmetic only, so the result is the same on every target. For
/// each channel: `c' = (c * a + 255 * (255 - a) + 127) / 255`.
pub fn flatten_onto_white(rgba: &[u8]) -> Vec<u8> {
    let mut rgb = Vec::with_capacity(rgba.len() / 4 * 3);
    for pixel in rgba.chunks_exact(4) {
        let alpha = u32::from(pixel[3]);
        for &channel in &pixel[..3] {
            let value = (u32::from(channel) * alpha + 255 * (255 - alpha) + 127) / 255;
            // The value is at most (255 * 255 + 127) / 255 = 255.
            rgb.push(u8::try_from(value).unwrap_or(u8::MAX));
        }
    }
    rgb
}

/// Encodes straight-alpha RGBA as JPEG at `quality` (1 to 100).
///
/// JPEG has no alpha. The pixels are flattened onto white first, with
/// [`flatten_onto_white`]. Use [`crate::resolve_quality`] to check the
/// quality of a request.
pub fn encode_jpeg(
    width: u32,
    height: u32,
    rgba_straight: &[u8],
    quality: u8,
) -> Result<Vec<u8>, EncodeError> {
    check_rgba(width, height, rgba_straight)?;
    let rgb = flatten_onto_white(rgba_straight);
    let mut out = Vec::new();
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, quality)
        .write_image(&rgb, width, height, image::ExtendedColorType::Rgb8)
        .map_err(|source| EncodeError::Encoder {
            format: "jpeg",
            message: source.to_string(),
        })?;
    Ok(out)
}

/// Encodes straight-alpha RGBA as lossless WebP. The alpha is kept.
pub fn encode_webp_lossless(
    width: u32,
    height: u32,
    rgba_straight: &[u8],
) -> Result<Vec<u8>, EncodeError> {
    check_rgba(width, height, rgba_straight)?;
    let mut out = Vec::new();
    image::codecs::webp::WebPEncoder::new_lossless(&mut out)
        .write_image(
            rgba_straight,
            width,
            height,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|source| EncodeError::Encoder {
            format: "webp",
            message: source.to_string(),
        })?;
    Ok(out)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    /// A small image with hard edges, a gradient and some transparency.
    fn sample(width: u32, height: u32) -> Vec<u8> {
        let mut rgba = Vec::new();
        for y in 0..height {
            for x in 0..width {
                let alpha = if x < width / 2 {
                    255
                } else {
                    (y * 255 / height) as u8
                };
                rgba.extend_from_slice(&[
                    (x * 255 / width) as u8,
                    (y * 255 / height) as u8,
                    40,
                    alpha,
                ]);
            }
        }
        rgba
    }

    #[test]
    fn a_half_transparent_pixel_is_flattened_onto_white_with_integers() {
        // Black at alpha 128: (0 * 128 + 255 * 127 + 127) / 255 = 127.
        assert_eq!(flatten_onto_white(&[0, 0, 0, 128]), [127, 127, 127]);
        // Red at alpha 128: (255 * 128 + 255 * 127 + 127) / 255 = 255.
        assert_eq!(flatten_onto_white(&[255, 0, 0, 128]), [255, 127, 127]);
        // Opaque pixels do not change, transparent pixels become white.
        assert_eq!(flatten_onto_white(&[10, 20, 30, 255]), [10, 20, 30]);
        assert_eq!(flatten_onto_white(&[10, 20, 30, 0]), [255, 255, 255]);
    }

    #[test]
    fn jpeg_decodes_back_to_an_image_of_the_same_size() {
        let rgba = sample(48, 32);
        let jpeg = encode_jpeg(48, 32, &rgba, 90).unwrap();
        assert!(jpeg.starts_with(&[0xFF, 0xD8]), "a JPEG starts with SOI");
        let decoded = image::load_from_memory_with_format(&jpeg, image::ImageFormat::Jpeg).unwrap();
        assert_eq!((decoded.width(), decoded.height()), (48, 32));
        let rgb = decoded.to_rgb8();
        // The opaque left half keeps its colour within the JPEG loss.
        let original = &rgba[..3];
        let first = &rgb.as_raw()[..3];
        for (a, b) in original.iter().zip(first) {
            assert!(a.abs_diff(*b) < 12, "{original:?} vs {first:?}");
        }
        assert_eq!(jpeg, encode_jpeg(48, 32, &rgba, 90).unwrap());
        assert_ne!(jpeg, encode_jpeg(48, 32, &rgba, 75).unwrap());
    }

    #[test]
    fn lossless_webp_decodes_to_the_same_rgba() {
        let rgba = sample(48, 32);
        let webp = encode_webp_lossless(48, 32, &rgba).unwrap();
        assert!(webp.starts_with(b"RIFF"));
        let decoded = image::load_from_memory_with_format(&webp, image::ImageFormat::WebP).unwrap();
        assert_eq!(decoded.to_rgba8().as_raw(), &rgba);
        assert_eq!(webp, encode_webp_lossless(48, 32, &rgba).unwrap());
    }

    #[test]
    fn a_buffer_of_the_wrong_size_is_refused() {
        let error = encode_jpeg(4, 4, &[0; 10], 90).unwrap_err();
        assert!(matches!(
            error,
            EncodeError::PixelBufferSize {
                expected: 64,
                actual: 10,
                ..
            }
        ));
        assert!(encode_webp_lossless(4, 4, &[0; 63]).is_err());
    }
}
