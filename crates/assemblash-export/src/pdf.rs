//! A raster PDF writer: one image for each page.
//!
//! The file has no `/CreationDate`, no `/ModDate`, no XMP metadata and no
//! version number. The `/ID` comes from the bytes of the file body. Equal
//! pages give an equal file.
//!
//! [`PdfPage::new`] does the slow work: it splits the pixels into colour and
//! alpha and compresses them. Callers can prepare pages on more than one
//! thread. [`write_pdf`] only puts the prepared pages together.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use sha2::{Digest, Sha256};

use crate::raster::{check_rgba, EncodeError};

/// Width of the free zone outside the bleed that holds the crop marks, in
/// points.
pub const MARK_ZONE_PT: f32 = 18.0;

/// Width of a crop-mark line, in points.
pub const CROP_MARK_WIDTH_PT: f32 = 0.25;

/// Print geometry of a page: the bleed on each side, in points.
///
/// With print geometry, the page gets a `/TrimBox`, a `/BleedBox`, a mark
/// zone of [`MARK_ZONE_PT`] outside the bleed, and crop marks. The image
/// covers the trim rectangle only.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PrintGeometry {
    /// Bleed in points, in the order top, right, bottom, left.
    pub bleed: [f32; 4],
}

impl PrintGeometry {
    /// The same bleed on all four sides.
    pub fn uniform(bleed: f32) -> Self {
        Self { bleed: [bleed; 4] }
    }
}

/// The geometry of a page in PDF points. PDF y goes up from the bottom.
#[derive(Debug, Clone, Copy)]
struct Layout {
    media_w: f32,
    media_h: f32,
    /// Lower-left corner of the trim rectangle.
    trim_x: f32,
    trim_y: f32,
    trim_w: f32,
    trim_h: f32,
}

/// One page, ready to write: its pixels are split and compressed.
#[derive(Debug, Clone)]
pub struct PdfPage {
    width_px: u32,
    height_px: u32,
    print: Option<PrintGeometry>,
    layout: Layout,
    rgb_flate: Vec<u8>,
    /// `None` when every pixel is opaque.
    alpha_flate: Option<Vec<u8>>,
    content_flate: Vec<u8>,
}

/// Fixed-precision number text, the same on every target.
///
/// Four decimals, then trailing zeros and a trailing dot are removed. `-0`
/// is written as `0`.
fn num(value: f32) -> String {
    let mut text = format!("{value:.4}");
    while text.ends_with('0') {
        text.pop();
    }
    if text.ends_with('.') {
        text.pop();
    }
    if text == "-0" {
        text = "0".to_owned();
    }
    text
}

fn flate(data: &[u8]) -> Vec<u8> {
    miniz_oxide::deflate::compress_to_vec_zlib(data, 6)
}

fn check_size(name: &str, value: f32) -> Result<(), EncodeError> {
    if value.is_finite() && value >= 0.0 {
        Ok(())
    } else {
        Err(EncodeError::PageGeometry(format!(
            "{name} must be a finite value of zero or more, not {value}"
        )))
    }
}

impl Layout {
    fn new(trim_w: f32, trim_h: f32, print: Option<PrintGeometry>) -> Self {
        match print {
            None => Self {
                media_w: trim_w,
                media_h: trim_h,
                trim_x: 0.0,
                trim_y: 0.0,
                trim_w,
                trim_h,
            },
            Some(print) => {
                let [top, right, bottom, left] = print.bleed;
                Self {
                    media_w: MARK_ZONE_PT + left + trim_w + right + MARK_ZONE_PT,
                    media_h: MARK_ZONE_PT + bottom + trim_h + top + MARK_ZONE_PT,
                    trim_x: MARK_ZONE_PT + left,
                    trim_y: MARK_ZONE_PT + bottom,
                    trim_w,
                    trim_h,
                }
            }
        }
    }

    fn trim_right(&self) -> f32 {
        self.trim_x + self.trim_w
    }

    fn trim_top(&self) -> f32 {
        self.trim_y + self.trim_h
    }
}

/// The crop-mark operators of a page.
///
/// At each trim corner there are two hairlines on the trim lines. Each line
/// starts past the bleed of its side and runs into the mark zone. It stops
/// 2 points before the edge of the page.
fn crop_marks_ops(layout: &Layout, print: PrintGeometry) -> String {
    let [top, right, bottom, left] = print.bleed;
    let length = MARK_ZONE_PT - 2.0;
    let (x0, y0) = (layout.trim_x, layout.trim_y);
    let (x1, y1) = (layout.trim_right(), layout.trim_top());
    // (corner x, corner y, horizontal start, horizontal end, vertical start,
    // vertical end)
    let corners = [
        (
            x0,
            y0,
            x0 - left,
            x0 - left - length,
            y0 - bottom,
            y0 - bottom - length,
        ),
        (
            x1,
            y0,
            x1 + right,
            x1 + right + length,
            y0 - bottom,
            y0 - bottom - length,
        ),
        (
            x0,
            y1,
            x0 - left,
            x0 - left - length,
            y1 + top,
            y1 + top + length,
        ),
        (
            x1,
            y1,
            x1 + right,
            x1 + right + length,
            y1 + top,
            y1 + top + length,
        ),
    ];
    let mut ops = format!("q {} w 0 G\n", num(CROP_MARK_WIDTH_PT));
    for (x, y, h_start, h_end, v_start, v_end) in corners {
        let _ = writeln!(
            ops,
            "{} {} m {} {} l S",
            num(h_start),
            num(y),
            num(h_end),
            num(y)
        );
        let _ = writeln!(
            ops,
            "{} {} m {} {} l S",
            num(x),
            num(v_start),
            num(x),
            num(v_end)
        );
    }
    ops.push_str("Q\n");
    ops
}

impl PdfPage {
    /// Prepares one page.
    ///
    /// * `rgba_straight` is the page image: straight-alpha RGBA,
    ///   `width_px * height_px` pixels. It is the same pixels as the PNG
    ///   export of the page.
    /// * `trim_w_pt` and `trim_h_pt` are the trim size in points. The image
    ///   is drawn on the trim rectangle.
    /// * `print` adds bleed, trim and bleed boxes, and crop marks.
    ///
    /// This is the slow part: the pixels are split and compressed here.
    pub fn new(
        width_px: u32,
        height_px: u32,
        rgba_straight: &[u8],
        trim_w_pt: f32,
        trim_h_pt: f32,
        print: Option<PrintGeometry>,
    ) -> Result<Self, EncodeError> {
        check_rgba(width_px, height_px, rgba_straight)?;
        check_size("the trim width", trim_w_pt)?;
        check_size("the trim height", trim_h_pt)?;
        if let Some(print) = print {
            for (side, value) in ["top", "right", "bottom", "left"].iter().zip(print.bleed) {
                check_size(&format!("the {side} bleed"), value)?;
            }
        }

        let pixels = rgba_straight.len() / 4;
        let mut rgb = Vec::with_capacity(pixels * 3);
        let mut alpha = Vec::with_capacity(pixels);
        for pixel in rgba_straight.chunks_exact(4) {
            rgb.extend_from_slice(&pixel[..3]);
            alpha.push(pixel[3]);
        }
        let opaque = alpha.iter().all(|&value| value == 255);

        let layout = Layout::new(trim_w_pt, trim_h_pt, print);
        let mut content = format!(
            "q {} 0 0 {} {} {} cm /Im0 Do Q\n",
            num(layout.trim_w),
            num(layout.trim_h),
            num(layout.trim_x),
            num(layout.trim_y)
        );
        if let Some(print) = print {
            content.push_str(&crop_marks_ops(&layout, print));
        }

        Ok(Self {
            width_px,
            height_px,
            print,
            layout,
            rgb_flate: flate(&rgb),
            alpha_flate: (!opaque).then(|| flate(&alpha)),
            content_flate: flate(content.as_bytes()),
        })
    }

    /// Number of PDF objects this page writes.
    fn object_count(&self) -> usize {
        if self.alpha_flate.is_some() {
            4
        } else {
            3
        }
    }

    fn boxes(&self) -> String {
        let layout = &self.layout;
        let mut boxes = format!(
            "/MediaBox [0 0 {} {}]",
            num(layout.media_w),
            num(layout.media_h)
        );
        if let Some(print) = self.print {
            let [top, right, bottom, left] = print.bleed;
            let _ = write!(
                boxes,
                " /BleedBox [{} {} {} {}] /TrimBox [{} {} {} {}]",
                num(layout.trim_x - left),
                num(layout.trim_y - bottom),
                num(layout.trim_right() + right),
                num(layout.trim_top() + top),
                num(layout.trim_x),
                num(layout.trim_y),
                num(layout.trim_right()),
                num(layout.trim_top())
            );
        }
        boxes
    }
}

/// Appends one object and records its offset. Objects are numbered in the
/// order they are written, from 1.
fn object(out: &mut Vec<u8>, offsets: &mut Vec<usize>, dictionary: &str, stream: Option<&[u8]>) {
    offsets.push(out.len());
    out.extend_from_slice(format!("{} 0 obj\n", offsets.len()).as_bytes());
    out.extend_from_slice(dictionary.as_bytes());
    if let Some(stream) = stream {
        out.extend_from_slice(b"\nstream\n");
        out.extend_from_slice(stream);
        out.extend_from_slice(b"\nendstream");
    }
    out.extend_from_slice(b"\nendobj\n");
}

/// Writes a PDF with one page for each prepared page, in the given order.
pub fn write_pdf(pages: &[PdfPage]) -> Vec<u8> {
    let mut out: Vec<u8> = Vec::new();
    let mut offsets: Vec<usize> = Vec::new();
    out.extend_from_slice(b"%PDF-1.7\n%\xE2\xE3\xCF\xD3\n");

    // Objects 1 to 3 are the catalog, the page tree and the information
    // dictionary. Each page then takes 3 objects, or 4 with a soft mask.
    let mut first_objects = Vec::with_capacity(pages.len());
    let mut next = 4;
    for page in pages {
        first_objects.push(next);
        next += page.object_count();
    }
    let kids: Vec<String> = first_objects.iter().map(|n| format!("{n} 0 R")).collect();

    object(
        &mut out,
        &mut offsets,
        "<< /Type /Catalog /Pages 2 0 R >>",
        None,
    );
    object(
        &mut out,
        &mut offsets,
        &format!(
            "<< /Type /Pages /Kids [{}] /Count {} >>",
            kids.join(" "),
            pages.len()
        ),
        None,
    );
    object(&mut out, &mut offsets, "<< /Producer (Assemblash) >>", None);

    for (page, &first) in pages.iter().zip(&first_objects) {
        let (content_obj, image_obj, smask_obj) = (first + 1, first + 2, first + 3);
        object(
            &mut out,
            &mut offsets,
            &format!(
                "<< /Type /Page /Parent 2 0 R {} /Resources << /XObject << /Im0 {image_obj} 0 R >> >> /Contents {content_obj} 0 R >>",
                page.boxes()
            ),
            None,
        );
        object(
            &mut out,
            &mut offsets,
            &format!(
                "<< /Length {} /Filter /FlateDecode >>",
                page.content_flate.len()
            ),
            Some(&page.content_flate),
        );
        let smask = if page.alpha_flate.is_some() {
            format!(" /SMask {smask_obj} 0 R")
        } else {
            String::new()
        };
        object(
            &mut out,
            &mut offsets,
            &format!(
                "<< /Type /XObject /Subtype /Image /Width {} /Height {} /ColorSpace /DeviceRGB /BitsPerComponent 8{smask} /Length {} /Filter /FlateDecode >>",
                page.width_px,
                page.height_px,
                page.rgb_flate.len()
            ),
            Some(&page.rgb_flate),
        );
        if let Some(alpha) = &page.alpha_flate {
            object(
                &mut out,
                &mut offsets,
                &format!(
                    "<< /Type /XObject /Subtype /Image /Width {} /Height {} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length {} /Filter /FlateDecode >>",
                    page.width_px,
                    page.height_px,
                    alpha.len()
                ),
                Some(alpha),
            );
        }
    }

    // The file identifier comes from the body, so equal pages give an equal
    // identifier.
    let digest = Sha256::digest(&out);
    let id: String = digest[..16].iter().fold(String::new(), |mut text, byte| {
        let _ = write!(text, "{byte:02X}");
        text
    });

    let size = offsets.len() + 1;
    let xref = out.len();
    out.extend_from_slice(format!("xref\n0 {size}\n0000000000 65535 f \n").as_bytes());
    for offset in &offsets {
        out.extend_from_slice(format!("{offset:010} 00000 n \n").as_bytes());
    }
    out.extend_from_slice(
        format!(
            "trailer\n<< /Size {size} /Root 1 0 R /Info 3 0 R /ID [<{id}> <{id}>] >>\nstartxref\n{xref}\n%%EOF\n"
        )
        .as_bytes(),
    );
    out
}

/// One object of a file: its dictionary text and its stream, if any.
type Object = (String, Option<Vec<u8>>);

fn find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack
        .windows(needle.len())
        .position(|window| window == needle)
}

/// Reads every object of a file that [`write_pdf`] wrote.
fn read_objects(pdf: &[u8]) -> Result<BTreeMap<usize, Object>, String> {
    let mut objects = BTreeMap::new();
    let mut pos = find(pdf, b"\n1 0 obj\n").ok_or("no object 1")? + 1;
    while !pdf[pos..].starts_with(b"xref\n") {
        let header_end = pos + find(&pdf[pos..], b" 0 obj\n").ok_or("no object header")?;
        let number: usize = std::str::from_utf8(&pdf[pos..header_end])
            .map_err(|error| error.to_string())?
            .parse()
            .map_err(|error: std::num::ParseIntError| error.to_string())?;
        let body = header_end + b" 0 obj\n".len();
        let stream_at = find(&pdf[body..], b"\nstream\n");
        let end_at = find(&pdf[body..], b"\nendobj\n").ok_or("no endobj")?;
        match stream_at {
            Some(stream_at) if stream_at < end_at => {
                let dictionary = String::from_utf8_lossy(&pdf[body..body + stream_at]).into_owned();
                let length = int_after(&dictionary, "/Length ").ok_or("no stream length")?;
                let start = body + stream_at + b"\nstream\n".len();
                let stream = pdf.get(start..start + length).ok_or("short stream")?;
                let tail = start + length;
                if !pdf[tail..].starts_with(b"\nendstream\nendobj\n") {
                    return Err(format!("object {number} has no endstream"));
                }
                objects.insert(number, (dictionary, Some(stream.to_vec())));
                pos = tail + b"\nendstream\nendobj\n".len();
            }
            _ => {
                let dictionary = String::from_utf8_lossy(&pdf[body..body + end_at]).into_owned();
                objects.insert(number, (dictionary, None));
                pos = body + end_at + b"\nendobj\n".len();
            }
        }
    }
    Ok(objects)
}

fn int_after(dictionary: &str, key: &str) -> Option<usize> {
    let start = dictionary.find(key)? + key.len();
    dictionary[start..].split_whitespace().next()?.parse().ok()
}

/// The page objects in page order, from the `/Kids` of object 2.
fn page_objects(objects: &BTreeMap<usize, Object>) -> Result<Vec<&str>, String> {
    let (tree, _) = objects.get(&2).ok_or("no page tree")?;
    let start = tree.find("/Kids [").ok_or("no kids")? + "/Kids [".len();
    let end = start + tree[start..].find(']').ok_or("no end of kids")?;
    let numbers: Vec<&str> = tree[start..end].split_whitespace().collect();
    numbers
        .chunks(3)
        .map(|reference| {
            let number: usize = reference
                .first()
                .and_then(|n| n.parse().ok())
                .ok_or("bad kid")?;
            objects
                .get(&number)
                .map(|(dictionary, _)| dictionary.as_str())
                .ok_or_else(|| format!("no page object {number}"))
        })
        .collect()
}

fn inflate(stream: Option<&Vec<u8>>) -> Result<Vec<u8>, String> {
    miniz_oxide::inflate::decompress_to_vec_zlib(stream.ok_or("no stream")?)
        .map_err(|error| format!("{error:?}"))
}

/// Reads the page images back out of a PDF, in page order.
///
/// Gives `(width, height, straight-alpha RGBA)` for each page. A page
/// without a soft mask reads as opaque.
///
/// This reads only files that [`write_pdf`] wrote. It is not a general PDF
/// reader. Tests use it to check that a PDF holds the expected pixels.
pub fn extract_page_images(pdf: &[u8]) -> Result<Vec<(u32, u32, Vec<u8>)>, String> {
    let objects = read_objects(pdf)?;
    let mut images = Vec::new();
    for page in page_objects(&objects)? {
        let image = int_after(page, "/Im0 ").ok_or("no page image")?;
        let (dictionary, stream) = objects.get(&image).ok_or("no image object")?;
        let width = int_after(dictionary, "/Width ").ok_or("no width")?;
        let height = int_after(dictionary, "/Height ").ok_or("no height")?;
        let rgb = inflate(stream.as_ref())?;
        let alpha = match int_after(dictionary, "/SMask ") {
            Some(mask) => Some(inflate(
                objects.get(&mask).ok_or("no soft mask")?.1.as_ref(),
            )?),
            None => None,
        };
        let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
        for (index, pixel) in rgb.chunks_exact(3).enumerate() {
            rgba.extend_from_slice(pixel);
            rgba.push(match &alpha {
                Some(alpha) => *alpha.get(index).ok_or("short soft mask")?,
                None => 255,
            });
        }
        let width = u32::try_from(width).map_err(|error| error.to_string())?;
        let height = u32::try_from(height).map_err(|error| error.to_string())?;
        images.push((width, height, rgba));
    }
    Ok(images)
}

/// Reads the content stream of each page, inflated, in page order.
///
/// This reads only files that [`write_pdf`] wrote. Tests use it to check the
/// drawing operators, for example the crop marks (`m`, `l`, `S`).
pub fn page_content_streams(pdf: &[u8]) -> Result<Vec<String>, String> {
    let objects = read_objects(pdf)?;
    page_objects(&objects)?
        .into_iter()
        .map(|page| {
            let contents = int_after(page, "/Contents ").ok_or("no contents")?;
            let (_, stream) = objects.get(&contents).ok_or("no content object")?;
            String::from_utf8(inflate(stream.as_ref())?).map_err(|error| error.to_string())
        })
        .collect()
}

/// Reads the page dictionaries, in page order.
///
/// This reads only files that [`write_pdf`] wrote. Tests use it to check the
/// page boxes.
pub fn page_dictionaries(pdf: &[u8]) -> Result<Vec<String>, String> {
    let objects = read_objects(pdf)?;
    Ok(page_objects(&objects)?
        .into_iter()
        .map(str::to_owned)
        .collect())
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    fn solid(width: u32, height: u32, rgba: [u8; 4]) -> Vec<u8> {
        rgba.repeat((width * height) as usize)
    }

    fn gradient(width: u32, height: u32, alpha: bool) -> Vec<u8> {
        let mut out = Vec::new();
        for y in 0..height {
            for x in 0..width {
                let a = if alpha {
                    ((x + y) * 7 % 256) as u8
                } else {
                    255
                };
                out.extend_from_slice(&[(x * 9) as u8, (y * 13) as u8, 77, a]);
            }
        }
        out
    }

    fn page(rgba: &[u8], width: u32, height: u32, print: Option<PrintGeometry>) -> PdfPage {
        PdfPage::new(width, height, rgba, width as f32, height as f32, print).unwrap()
    }

    #[test]
    fn numbers_have_one_fixed_text() {
        assert_eq!(num(0.0), "0");
        assert_eq!(num(-0.0), "0");
        assert_eq!(num(18.0), "18");
        assert_eq!(num(8.5), "8.5");
        assert_eq!(num(0.25), "0.25");
        assert_eq!(num(1.0 / 3.0), "0.3333");
        assert_eq!(num(-2.5), "-2.5");
        assert_eq!(num(-0.00001), "0");
    }

    #[test]
    fn two_calls_give_identical_bytes_without_a_date() {
        let rgba = gradient(20, 10, true);
        let first = write_pdf(&[page(&rgba, 20, 10, None)]);
        let second = write_pdf(&[page(&rgba, 20, 10, None)]);
        assert_eq!(first, second);
        assert!(first.starts_with(b"%PDF-1.7\n"));
        assert!(first.ends_with(b"%%EOF\n"));
        for forbidden in [&b"CreationDate"[..], b"ModDate", b"Metadata", b"xmp"] {
            assert!(find(&first, forbidden).is_none());
        }
        assert!(find(&first, b"/Producer (Assemblash)").is_some());
        let id_at = find(&first, b"/ID [<").unwrap();
        let id = &first[id_at + 6..id_at + 6 + 32];
        assert!(id.iter().all(u8::is_ascii_hexdigit));
        let digest = Sha256::digest(&first[..find(&first, b"xref\n").unwrap()]);
        let expected: String = digest[..16].iter().map(|b| format!("{b:02X}")).collect();
        assert_eq!(id, expected.as_bytes());
        assert!(find(&first, format!("<{expected}> <{expected}>").as_bytes()).is_some());
    }

    #[test]
    fn an_opaque_page_has_no_soft_mask_and_reads_back() {
        let rgba = gradient(16, 12, false);
        let pdf = write_pdf(&[page(&rgba, 16, 12, None)]);
        assert!(find(&pdf, b"/SMask").is_none());
        assert!(find(&pdf, b"/DeviceGray").is_none());
        assert!(find(&pdf, b"<< >>").is_none(), "no empty stub object");
        // Catalog, page tree, information, page, content, image.
        assert!(find(&pdf, b"trailer\n<< /Size 7 ").is_some());
        assert_eq!(extract_page_images(&pdf).unwrap(), [(16, 12, rgba)]);
    }

    #[test]
    fn a_page_with_alpha_has_a_soft_mask_and_reads_back() {
        let rgba = gradient(16, 12, true);
        let pdf = write_pdf(&[page(&rgba, 16, 12, None)]);
        assert!(find(&pdf, b"/SMask 7 0 R").is_some());
        assert!(find(&pdf, b"/DeviceGray").is_some());
        assert!(find(&pdf, b"trailer\n<< /Size 8 ").is_some());
        assert_eq!(extract_page_images(&pdf).unwrap(), [(16, 12, rgba)]);
    }

    #[test]
    fn three_pages_keep_their_order() {
        let first = solid(4, 3, [255, 0, 0, 255]);
        let second = gradient(5, 6, true);
        let third = solid(7, 2, [0, 0, 255, 255]);
        let pdf = write_pdf(&[
            page(&first, 4, 3, None),
            page(&second, 5, 6, None),
            page(&third, 7, 2, None),
        ]);
        assert!(find(&pdf, b"/Kids [4 0 R 7 0 R 11 0 R] /Count 3").is_some());
        assert_eq!(
            extract_page_images(&pdf).unwrap(),
            [(4, 3, first), (5, 6, second), (7, 2, third)]
        );
        let boxes = page_dictionaries(&pdf).unwrap();
        assert!(boxes[0].contains("/MediaBox [0 0 4 3]"));
        assert!(boxes[1].contains("/MediaBox [0 0 5 6]"));
        assert!(boxes[2].contains("/MediaBox [0 0 7 2]"));
    }

    #[test]
    fn a_plain_page_has_no_marks_and_no_print_boxes() {
        let rgba = gradient(30, 20, false);
        let pdf = write_pdf(&[page(&rgba, 30, 20, None)]);
        let contents = page_content_streams(&pdf).unwrap();
        assert_eq!(contents, ["q 30 0 0 20 0 0 cm /Im0 Do Q\n"]);
        let dictionary = &page_dictionaries(&pdf).unwrap()[0];
        assert!(dictionary.contains("/MediaBox [0 0 30 20]"));
        assert!(!dictionary.contains("/TrimBox"));
        assert!(!dictionary.contains("/BleedBox"));
    }

    #[test]
    fn print_geometry_adds_boxes_and_crop_marks() {
        let rgba = gradient(100, 50, false);
        let pdf = write_pdf(&[page(&rgba, 100, 50, Some(PrintGeometry::uniform(9.0)))]);
        let dictionary = &page_dictionaries(&pdf).unwrap()[0];
        // 18 + 9 + 100 + 9 + 18 = 154 and 18 + 9 + 50 + 9 + 18 = 104.
        assert!(
            dictionary.contains("/MediaBox [0 0 154 104]"),
            "{dictionary}"
        );
        assert!(
            dictionary.contains("/BleedBox [18 18 136 86]"),
            "{dictionary}"
        );
        assert!(
            dictionary.contains("/TrimBox [27 27 127 77]"),
            "{dictionary}"
        );
        let content = &page_content_streams(&pdf).unwrap()[0];
        assert!(
            content.starts_with("q 100 0 0 50 27 27 cm /Im0 Do Q\n"),
            "{content}"
        );
        assert!(content.contains("q 0.25 w 0 G\n"));
        assert_eq!(content.matches(" l S\n").count(), 8, "{content}");
        // Bottom-left corner: left along y = 27 from x = 18 to x = 2, and
        // down along x = 27 from y = 18 to y = 2.
        assert!(content.contains("18 27 m 2 27 l S\n"), "{content}");
        assert!(content.contains("27 18 m 27 2 l S\n"), "{content}");
        // Top-right corner.
        assert!(content.contains("136 77 m 152 77 l S\n"), "{content}");
        assert!(content.contains("127 86 m 127 102 l S\n"), "{content}");
        // The image stays the trim image.
        assert_eq!(extract_page_images(&pdf).unwrap(), [(100, 50, rgba)]);
    }

    #[test]
    fn unequal_bleeds_give_the_right_boxes_and_marks() {
        let rgba = gradient(100, 50, true);
        let print = PrintGeometry {
            // top, right, bottom, left
            bleed: [10.0, 6.0, 4.0, 2.5],
        };
        let pdf = write_pdf(&[page(&rgba, 100, 50, Some(print))]);
        let dictionary = &page_dictionaries(&pdf).unwrap()[0];
        // Width 18 + 2.5 + 100 + 6 + 18 = 144.5. Height 18 + 4 + 50 + 10 + 18
        // = 100. PDF y goes up, so the bottom bleed is below the trim.
        assert!(
            dictionary.contains("/MediaBox [0 0 144.5 100]"),
            "{dictionary}"
        );
        assert!(
            dictionary.contains("/TrimBox [20.5 22 120.5 72]"),
            "{dictionary}"
        );
        assert!(
            dictionary.contains("/BleedBox [18 18 126.5 82]"),
            "{dictionary}"
        );
        let content = &page_content_streams(&pdf).unwrap()[0];
        assert!(
            content.starts_with("q 100 0 0 50 20.5 22 cm /Im0 Do Q\n"),
            "{content}"
        );
        // Bottom-left: past the left bleed, and below the bottom bleed.
        assert!(content.contains("18 22 m 2 22 l S\n"), "{content}");
        assert!(content.contains("20.5 18 m 20.5 2 l S\n"), "{content}");
        // Top-right: past the right bleed, and above the top bleed.
        assert!(content.contains("126.5 72 m 142.5 72 l S\n"), "{content}");
        assert!(content.contains("120.5 82 m 120.5 98 l S\n"), "{content}");
        assert_eq!(extract_page_images(&pdf).unwrap(), [(100, 50, rgba)]);
    }

    #[test]
    fn bad_input_is_refused() {
        assert!(PdfPage::new(4, 4, &[0; 3], 4.0, 4.0, None).is_err());
        let rgba = solid(4, 4, [0, 0, 0, 255]);
        assert!(PdfPage::new(4, 4, &rgba, f32::NAN, 4.0, None).is_err());
        assert!(PdfPage::new(4, 4, &rgba, 4.0, -1.0, None).is_err());
        assert!(PdfPage::new(4, 4, &rgba, 4.0, 4.0, Some(PrintGeometry::uniform(-1.0))).is_err());
    }
}
