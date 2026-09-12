//! The pixel size of an imported raster image, read from its own header.
//!
//! A crop is a rectangle in the source's pixels (`ImageLayer::crop`), so an
//! asset has to record how large the source is. The header states it, and
//! reading it here costs one pass over the first few dozen bytes at import —
//! never at render time, which stays free of file reads and format parsing.
//!
//! Only the container headers are read, and only far enough to find the size.
//! A format this build does not recognise answers `None`, and a crop of such
//! an asset is refused typed rather than guessed at.

/// The pixel width and height a raster header states, when it states one.
pub fn raster_dimensions(bytes: &[u8]) -> Option<(u32, u32)> {
    match bytes.get(..8)? {
        [0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a] => png_size(bytes),
        [b'G', b'I', b'F', b'8', b'7' | b'9', b'a', ..] => gif_size(bytes),
        [b'R', b'I', b'F', b'F', ..] if bytes.get(8..12) == Some(b"WEBP") => webp_size(bytes),
        [0xff, 0xd8, ..] => jpeg_size(bytes),
        _ => None,
    }
}

/// PNG: an `IHDR` chunk whose data starts with width and height, big-endian.
fn png_size(bytes: &[u8]) -> Option<(u32, u32)> {
    // Signature (8) + length (4) + "IHDR" (4) + width (4) + height (4).
    if bytes.get(12..16) != Some(b"IHDR") {
        return None;
    }
    let width = u32::from_be_bytes(bytes.get(16..20)?.try_into().ok()?);
    let height = u32::from_be_bytes(bytes.get(20..24)?.try_into().ok()?);
    Some((width, height))
}

/// GIF: the logical screen descriptor, little-endian, right after the header.
fn gif_size(bytes: &[u8]) -> Option<(u32, u32)> {
    let width = u16::from_le_bytes(bytes.get(6..8)?.try_into().ok()?);
    let height = u16::from_le_bytes(bytes.get(8..10)?.try_into().ok()?);
    Some((u32::from(width), u32::from(height)))
}

/// WebP: whichever of the three chunk layouts the file uses.
///
/// * `VP8X` (extended): a 24-bit canvas size, stored as value − 1.
/// * `VP8 ` (lossy): a 14-bit size after the start code.
/// * `VP8L` (lossless): a 14-bit size packed into four bytes.
fn webp_size(bytes: &[u8]) -> Option<(u32, u32)> {
    let chunk = bytes.get(12..16)?;
    match chunk {
        b"VP8X" => {
            let width = u32::from(*bytes.get(24)?)
                | u32::from(*bytes.get(25)?) << 8
                | u32::from(*bytes.get(26)?) << 16;
            let height = u32::from(*bytes.get(27)?)
                | u32::from(*bytes.get(28)?) << 8
                | u32::from(*bytes.get(29)?) << 16;
            Some((width + 1, height + 1))
        }
        b"VP8 " => {
            // 3-byte frame tag, then the 3-byte start code 9d 01 2a.
            if bytes.get(23..26) != Some(&[0x9d, 0x01, 0x2a]) {
                return None;
            }
            let width = u32::from(u16::from_le_bytes(bytes.get(26..28)?.try_into().ok()?) & 0x3fff);
            let height =
                u32::from(u16::from_le_bytes(bytes.get(28..30)?.try_into().ok()?) & 0x3fff);
            Some((width, height))
        }
        b"VP8L" => {
            if *bytes.get(20)? != 0x2f {
                return None;
            }
            let bits = u32::from_le_bytes(bytes.get(21..25)?.try_into().ok()?);
            let width = (bits & 0x3fff) + 1;
            let height = ((bits >> 14) & 0x3fff) + 1;
            Some((width, height))
        }
        _ => None,
    }
}

/// JPEG: walk the marker segments to the first frame header.
fn jpeg_size(bytes: &[u8]) -> Option<(u32, u32)> {
    let mut index = 2;
    while index + 9 < bytes.len() {
        if bytes[index] != 0xff {
            return None;
        }
        let marker = bytes[index + 1];
        // Standalone markers carry no length; padding 0xff bytes are skipped.
        if marker == 0xff || (0xd0..=0xd9).contains(&marker) {
            index += 2;
            continue;
        }
        let length = usize::from(u16::from_be_bytes(
            bytes.get(index + 2..index + 4)?.try_into().ok()?,
        ));
        // Every SOFn marker except the arithmetic-coding ones states the size.
        let is_frame =
            (0xc0..=0xcf).contains(&marker) && marker != 0xc4 && marker != 0xc8 && marker != 0xcc;
        if is_frame {
            let height = u32::from(u16::from_be_bytes(
                bytes.get(index + 5..index + 7)?.try_into().ok()?,
            ));
            let width = u32::from(u16::from_be_bytes(
                bytes.get(index + 7..index + 9)?.try_into().ok()?,
            ));
            return Some((width, height));
        }
        index += 2 + length;
    }
    None
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    /// A PNG header: signature, IHDR chunk with the given size.
    fn png(width: u32, height: u32) -> Vec<u8> {
        let mut bytes = vec![0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a];
        bytes.extend_from_slice(&13u32.to_be_bytes());
        bytes.extend_from_slice(b"IHDR");
        bytes.extend_from_slice(&width.to_be_bytes());
        bytes.extend_from_slice(&height.to_be_bytes());
        bytes.extend_from_slice(&[8, 6, 0, 0, 0, 0, 0, 0, 0]);
        bytes
    }

    #[test]
    fn a_png_state_its_size() {
        assert_eq!(png(4, 7).pipe_dimensions(), Some((4, 7)));
        assert_eq!(png(1920, 1080).pipe_dimensions(), Some((1920, 1080)));
    }

    #[test]
    fn a_gif_state_its_size() {
        let mut bytes = b"GIF89a".to_vec();
        bytes.extend_from_slice(&300u16.to_le_bytes());
        bytes.extend_from_slice(&200u16.to_le_bytes());
        bytes.push(0);
        assert_eq!(raster_dimensions(&bytes), Some((300, 200)));
    }

    #[test]
    fn a_lossy_webp_state_its_size() {
        let mut bytes = b"RIFF".to_vec();
        bytes.extend_from_slice(&0u32.to_le_bytes());
        bytes.extend_from_slice(b"WEBP");
        bytes.extend_from_slice(b"VP8 ");
        bytes.extend_from_slice(&0u32.to_le_bytes());
        bytes.extend_from_slice(&[0, 0, 0, 0x9d, 0x01, 0x2a]);
        bytes.extend_from_slice(&320u16.to_le_bytes());
        bytes.extend_from_slice(&240u16.to_le_bytes());
        assert_eq!(raster_dimensions(&bytes), Some((320, 240)));
    }

    #[test]
    fn a_jpeg_states_its_size() {
        let mut bytes = vec![0xff, 0xd8];
        // An APP0 segment the walk has to step over.
        bytes.extend_from_slice(&[0xff, 0xe0, 0x00, 0x10]);
        bytes.extend_from_slice(&[0u8; 14]);
        // SOF0: length, precision, height, width, components.
        bytes.extend_from_slice(&[0xff, 0xc0, 0x00, 0x11, 0x08]);
        bytes.extend_from_slice(&480u16.to_be_bytes());
        bytes.extend_from_slice(&640u16.to_be_bytes());
        bytes.extend_from_slice(&[0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        assert_eq!(raster_dimensions(&bytes), Some((640, 480)));
    }

    #[test]
    fn a_format_this_build_does_not_know_answers_none() {
        assert_eq!(raster_dimensions(b"not an image at all"), None);
        assert_eq!(raster_dimensions(&[]), None);
        // A PNG signature with no complete header is not a size.
        assert_eq!(raster_dimensions(&png(1, 1)[..14]), None);
    }

    trait PipeDimensions {
        fn pipe_dimensions(&self) -> Option<(u32, u32)>;
    }

    impl PipeDimensions for Vec<u8> {
        fn pipe_dimensions(&self) -> Option<(u32, u32)> {
            raster_dimensions(self)
        }
    }
}
