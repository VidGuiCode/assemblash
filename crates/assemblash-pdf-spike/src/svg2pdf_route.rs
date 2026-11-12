//! svg2pdf 0.13.0 route. svg2pdf parses with its own usvg 0.45.

use std::collections::HashMap;

use pdf_writer::{Content, Finish, Name, Pdf, Rect, Ref};
use sha2::{Digest, Sha256};
use svg2pdf::usvg;

use crate::raster_pdf::{crop_marks_ops, Print};

pub fn options(fonts: &[Vec<u8>]) -> usvg::Options<'static> {
    let mut opt = usvg::Options::default();
    for font in fonts {
        opt.fontdb_mut().load_font_data(font.clone());
    }
    opt
}

/// One PDF, one page per SVG string.
pub fn write_pdf(
    svgs: &[String],
    opt: &usvg::Options<'_>,
    print: Option<Print>,
) -> Result<Vec<u8>, String> {
    let mut alloc = Ref::new(1);
    let catalog = alloc.bump();
    let tree_id = alloc.bump();
    let mut pdf = Pdf::new();
    let mut page_ids = Vec::new();
    let mut chunks = Vec::new();
    let mut pages = Vec::new();
    for svg in svgs {
        let tree = usvg::Tree::from_str(svg, opt).map_err(|e| e.to_string())?;
        let (chunk, root) =
            svg2pdf::to_chunk(&tree, svg2pdf::ConversionOptions::default()).map_err(|e| e.to_string())?;
        let mut map = HashMap::new();
        let chunk = chunk.renumber(|old| *map.entry(old).or_insert_with(|| alloc.bump()));
        let root = map[&root];
        let page_id = alloc.bump();
        let content_id = alloc.bump();
        page_ids.push(page_id);
        // usvg size is in CSS px; 96 px = 72 pt.
        let w = tree.size().width() * 0.75;
        let h = tree.size().height() * 0.75;
        pages.push((page_id, content_id, root, w, h));
        chunks.push(chunk);
    }
    pdf.catalog(catalog).pages(tree_id);
    pdf.pages(tree_id).kids(page_ids.iter().copied()).count(page_ids.len() as i32);
    for (page_id, content_id, root, w, h) in &pages {
        // CROP-MARKS-BEGIN svg2pdf
        let (bleed, slug) = print.map_or((0.0, 0.0), |p| (p.bleed_pt, p.slug_pt));
        let (trim_w, trim_h) = (w - 2.0 * bleed, h - 2.0 * bleed);
        let (media_w, media_h) = (w + 2.0 * slug, h + 2.0 * slug);
        // CROP-MARKS-END svg2pdf
        let mut page = pdf.page(*page_id);
        page.media_box(Rect::new(0.0, 0.0, media_w, media_h));
        // CROP-MARKS-BEGIN svg2pdf
        if print.is_some() {
            page.bleed_box(Rect::new(slug, slug, media_w - slug, media_h - slug));
            page.trim_box(Rect::new(slug + bleed, slug + bleed, media_w - slug - bleed, media_h - slug - bleed));
        }
        // CROP-MARKS-END svg2pdf
        page.parent(tree_id);
        page.contents(*content_id);
        page.resources().x_objects().pair(Name(b"S0"), *root);
        page.finish();
        let mut content = Content::new();
        content.save_state().transform([*w, 0.0, 0.0, *h, slug, slug]).x_object(Name(b"S0")).restore_state();
        let mut bytes = content.finish().into_vec();
        // CROP-MARKS-BEGIN svg2pdf
        if let Some(p) = print {
            bytes.extend_from_slice(crop_marks_ops(slug + bleed, slug + bleed, trim_w, trim_h, p).as_bytes());
        }
        // CROP-MARKS-END svg2pdf
        pdf.stream(*content_id, &bytes);
    }
    for chunk in &chunks {
        pdf.extend(chunk);
    }
    // Content-derived file identifier from the SVG inputs.
    let mut hasher = Sha256::new();
    for svg in svgs {
        hasher.update(svg.as_bytes());
    }
    let id = hasher.finalize()[..16].to_vec();
    pdf.set_file_id((id.clone(), id));
    Ok(pdf.finish())
}
