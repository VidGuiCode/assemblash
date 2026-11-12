//! Raster route: a hand-written PDF with one image per page.
//!
//! No `/CreationDate`, no `/ModDate`, no XMP. The `/ID` is derived from the
//! bytes of the file body, so equal input gives an equal file.

use sha2::{Digest, Sha256};

/// One page: straight-alpha RGBA pixels decoded from the PNG export.
#[derive(Debug, Clone)]
pub struct PageImage {
    pub width_px: u32,
    pub height_px: u32,
    pub rgba: Vec<u8>,
    /// Page size in points of the trim box (the canvas).
    pub trim_w_pt: f32,
    pub trim_h_pt: f32,
}

/// Print geometry for crop marks. `None` gives a plain page.
#[derive(Debug, Clone, Copy)]
pub struct Print {
    /// Bleed on each side, in points. The image covers trim + bleed.
    pub bleed_pt: f32,
    /// Free area outside the bleed box that holds the marks, in points.
    pub slug_pt: f32,
}

/// Fixed-precision number text, the same on every target.
pub fn num(value: f32) -> String {
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

/// Crop-mark content stream operators. Shared shape for every route.
// CROP-MARKS-BEGIN raster
pub fn crop_marks_ops(trim_x: f32, trim_y: f32, trim_w: f32, trim_h: f32, print: Print) -> String {
    let gap = print.bleed_pt; // marks start outside the bleed box
    let len = (print.slug_pt - 2.0).max(1.0);
    let (x0, y0, x1, y1) = (trim_x, trim_y, trim_x + trim_w, trim_y + trim_h);
    let mut ops = String::from("q 0.25 w 0 G\n");
    for &(x, y) in &[(x0, y0), (x1, y0), (x0, y1), (x1, y1)] {
        let sx = if x == x0 { -1.0 } else { 1.0 };
        let sy = if y == y0 { -1.0 } else { 1.0 };
        // Horizontal mark on the trim line, vertical mark on the trim line.
        ops.push_str(&format!(
            "{} {} m {} {} l S\n",
            num(x + sx * gap),
            num(y),
            num(x + sx * (gap + len)),
            num(y)
        ));
        ops.push_str(&format!(
            "{} {} m {} {} l S\n",
            num(x),
            num(y + sy * gap),
            num(x),
            num(y + sy * (gap + len))
        ));
    }
    ops.push_str("Q\n");
    ops
}
// CROP-MARKS-END raster

/// Writes the PDF.
pub fn write_pdf(pages: &[PageImage], print: Option<Print>) -> Vec<u8> {
    let mut out: Vec<u8> = Vec::new();
    let mut offsets: Vec<usize> = Vec::new();
    out.extend_from_slice(b"%PDF-1.7\n%\xE2\xE3\xCF\xD3\n");

    let per_page = 4usize;
    let first_page_obj = 4usize;
    let total_objs = 3 + per_page * pages.len();

    let mut obj = |out: &mut Vec<u8>, offsets: &mut Vec<usize>, body: &[u8]| {
        offsets.push(out.len());
        let n = offsets.len();
        out.extend_from_slice(format!("{n} 0 obj\n").as_bytes());
        out.extend_from_slice(body);
        out.extend_from_slice(b"\nendobj\n");
    };

    obj(&mut out, &mut offsets, b"<< /Type /Catalog /Pages 2 0 R >>");
    let kids: Vec<String> = (0..pages.len())
        .map(|i| format!("{} 0 R", first_page_obj + i * per_page))
        .collect();
    obj(
        &mut out,
        &mut offsets,
        format!("<< /Type /Pages /Kids [{}] /Count {} >>", kids.join(" "), pages.len()).as_bytes(),
    );
    obj(&mut out, &mut offsets, b"<< /Producer (Assemblash PDF spike) >>");

    for (i, page) in pages.iter().enumerate() {
        let base = first_page_obj + i * per_page;
        let (page_obj, content_obj, image_obj, smask_obj) = (base, base + 1, base + 2, base + 3);

        // Geometry in points. Without print: media = trim = image.
        let (bleed, slug) = print.map_or((0.0, 0.0), |p| (p.bleed_pt, p.slug_pt));
        let media_w = page.trim_w_pt + 2.0 * (bleed + slug);
        let media_h = page.trim_h_pt + 2.0 * (bleed + slug);
        let trim_x = slug + bleed;
        let img_x = slug;
        let img_w = page.trim_w_pt + 2.0 * bleed;
        let img_h = page.trim_h_pt + 2.0 * bleed;

        let mut boxes = format!("/MediaBox [0 0 {} {}]", num(media_w), num(media_h));
        if let Some(p) = print {
            boxes.push_str(&format!(
                " /BleedBox [{} {} {} {}] /TrimBox [{} {} {} {}]",
                num(slug),
                num(slug),
                num(media_w - slug),
                num(media_h - slug),
                num(trim_x),
                num(trim_x),
                num(media_w - trim_x),
                num(media_h - trim_x)
            ));
            let _ = p;
        }

        obj(
            &mut out,
            &mut offsets,
            format!(
                "<< /Type /Page /Parent 2 0 R {boxes} /Resources << /XObject << /Im0 {image_obj} 0 R >> >> /Contents {content_obj} 0 R >>"
            )
            .as_bytes(),
        );

        let mut content = format!(
            "q {} 0 0 {} {} {} cm /Im0 Do Q\n",
            num(img_w),
            num(img_h),
            num(img_x),
            num(img_x)
        );
        if let Some(p) = print {
            content.push_str(&crop_marks_ops(trim_x, trim_x, page.trim_w_pt, page.trim_h_pt, p));
        }
        let content_z = flate(content.as_bytes());
        let mut body = format!("<< /Length {} /Filter /FlateDecode >>\nstream\n", content_z.len()).into_bytes();
        body.extend_from_slice(&content_z);
        body.extend_from_slice(b"\nendstream");
        obj(&mut out, &mut offsets, &body);

        let pixels = (page.width_px as usize) * (page.height_px as usize);
        let mut rgb = Vec::with_capacity(pixels * 3);
        let mut alpha = Vec::with_capacity(pixels);
        for px in page.rgba.chunks_exact(4) {
            rgb.extend_from_slice(&px[..3]);
            alpha.push(px[3]);
        }
        // The SMask object is always written (as an empty-dictionary stub
        // when the page is opaque) so object numbers stay fixed per page.
        let opaque = alpha.iter().all(|&a| a == 255);
        let rgb_z = flate(&rgb);
        let smask_ref = if opaque { String::new() } else { format!(" /SMask {smask_obj} 0 R") };
        let mut body = format!(
            "<< /Type /XObject /Subtype /Image /Width {} /Height {} /ColorSpace /DeviceRGB /BitsPerComponent 8{} /Length {} /Filter /FlateDecode >>\nstream\n",
            page.width_px, page.height_px, smask_ref, rgb_z.len()
        )
        .into_bytes();
        body.extend_from_slice(&rgb_z);
        body.extend_from_slice(b"\nendstream");
        obj(&mut out, &mut offsets, &body);

        if opaque {
            obj(&mut out, &mut offsets, b"<< >>");
        } else {
            let a_z = flate(&alpha);
            let mut body = format!(
                "<< /Type /XObject /Subtype /Image /Width {} /Height {} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length {} /Filter /FlateDecode >>\nstream\n",
                page.width_px, page.height_px, a_z.len()
            )
            .into_bytes();
            body.extend_from_slice(&a_z);
            body.extend_from_slice(b"\nendstream");
            obj(&mut out, &mut offsets, &body);
        }
    }
    debug_assert_eq!(offsets.len(), total_objs);

    // Content-derived file identifier.
    let digest = Sha256::digest(&out);
    let id: String = digest[..16].iter().map(|b| format!("{b:02X}")).collect();

    let xref = out.len();
    out.extend_from_slice(format!("xref\n0 {}\n0000000000 65535 f \n", total_objs + 1).as_bytes());
    for off in &offsets {
        out.extend_from_slice(format!("{off:010} 00000 n \n").as_bytes());
    }
    out.extend_from_slice(
        format!(
            "trailer\n<< /Size {} /Root 1 0 R /Info 3 0 R /ID [<{id}> <{id}>] >>\nstartxref\n{xref}\n%%EOF\n",
            total_objs + 1
        )
        .as_bytes(),
    );
    out
}

/// Reads the page images back out of a PDF written by `write_pdf`.
///
/// Returns straight RGBA per image XObject that is not itself a soft mask.
pub fn extract_images(pdf: &[u8]) -> Result<Vec<(u32, u32, Vec<u8>)>, String> {
    // Collect every object: number -> (dict text, stream bytes).
    let mut objects = std::collections::BTreeMap::new();
    let mut pos = 0;
    while let Some(rel) = find(&pdf[pos..], b" 0 obj\n") {
        let start = pos + rel;
        let num_start = pdf[..start]
            .iter()
            .rposition(|&b| b == b'\n')
            .map_or(0, |p| p + 1);
        let n: usize = std::str::from_utf8(&pdf[num_start..start])
            .map_err(|e| e.to_string())?
            .parse()
            .map_err(|e: std::num::ParseIntError| e.to_string())?;
        let body_start = start + 7;
        // The dictionary is text; read up to the first ">>" line end.
        let dict_end = body_start
            + find(&pdf[body_start..], b">>\n").map_or_else(
                || find(&pdf[body_start..], b">>").map(|p| p + 2),
                |p| Some(p + 2),
            )
            .ok_or("no dict end")?;
        let dict = String::from_utf8_lossy(&pdf[body_start..dict_end]).into_owned();
        let (stream, end) = if pdf[dict_end..].starts_with(b"\nstream\n") {
            let len: usize = {
                let i = dict.find("/Length ").ok_or("no length")? + 8;
                dict[i..].split_whitespace().next().ok_or("len")?.parse().map_err(|_| "len")?
            };
            let s = dict_end + 8;
            (Some(pdf[s..s + len].to_vec()), s + len)
        } else {
            (None, dict_end)
        };
        objects.insert(n, (dict, stream));
        pos = end;
    }
    let int_after = |dict: &str, key: &str| -> Option<u32> {
        let i = dict.find(key)? + key.len();
        dict[i..].split_whitespace().next()?.parse().ok()
    };
    let mut out = Vec::new();
    for (dict, stream) in objects.values() {
        if !dict.contains("/Subtype /Image") || dict.contains("/DeviceGray") {
            continue;
        }
        let w = int_after(dict, "/Width ").ok_or("width")?;
        let h = int_after(dict, "/Height ").ok_or("height")?;
        let rgb = miniz_oxide::inflate::decompress_to_vec_zlib(stream.as_deref().ok_or("stream")?)
            .map_err(|e| format!("{e:?}"))?;
        let alpha = match int_after(dict, "/SMask ") {
            Some(m) => {
                let (_, s) = objects.get(&(m as usize)).ok_or("smask")?;
                Some(
                    miniz_oxide::inflate::decompress_to_vec_zlib(s.as_deref().ok_or("smask stream")?)
                        .map_err(|e| format!("{e:?}"))?,
                )
            }
            None => None,
        };
        let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
        for (i, px) in rgb.chunks_exact(3).enumerate() {
            rgba.extend_from_slice(px);
            rgba.push(alpha.as_ref().map_or(255, |a| a[i]));
        }
        out.push((w, h, rgba));
    }
    Ok(out)
}

pub fn find(hay: &[u8], needle: &[u8]) -> Option<usize> {
    hay.windows(needle.len()).position(|w| w == needle)
}
