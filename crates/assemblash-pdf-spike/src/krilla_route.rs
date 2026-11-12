//! krilla 0.8.2 + krilla-svg 0.8.1 route. krilla-svg parses with usvg 0.47.

use krilla::color::luma;
use krilla::geom::{PathBuilder, Rect, Size};
use krilla::page::PageSettings;
use krilla::paint::Stroke;
use krilla::Document;
use krilla_svg::{SurfaceExt, SvgSettings};

use crate::raster_pdf::Print;

pub fn options(fonts: &[Vec<u8>]) -> usvg47::Options<'static> {
    let mut opt = usvg47::Options::default();
    for font in fonts {
        opt.fontdb_mut().load_font_data(font.clone());
    }
    opt
}

pub fn write_pdf(
    svgs: &[String],
    opt: &usvg47::Options<'_>,
    print: Option<Print>,
) -> Result<Vec<u8>, String> {
    let mut doc = Document::new();
    for svg in svgs {
        let tree = usvg47::Tree::from_str(svg, opt).map_err(|e| e.to_string())?;
        let w = tree.size().width() * 0.75;
        let h = tree.size().height() * 0.75;
        // CROP-MARKS-BEGIN krilla
        let (bleed, slug) = print.map_or((0.0, 0.0), |p| (p.bleed_pt, p.slug_pt));
        let (media_w, media_h) = (w + 2.0 * slug, h + 2.0 * slug);
        let mut settings = PageSettings::from_wh(media_w, media_h).ok_or("page size")?;
        if print.is_some() {
            settings = settings
                .with_bleed_box(Rect::from_ltrb(slug, slug, media_w - slug, media_h - slug))
                .with_trim_box(Rect::from_ltrb(
                    slug + bleed,
                    slug + bleed,
                    media_w - slug - bleed,
                    media_h - slug - bleed,
                ));
        }
        // CROP-MARKS-END krilla
        let mut page = doc.start_page_with(settings);
        let mut surface = page.surface();
        surface.push_transform(&krilla::geom::Transform::from_translate(slug, slug));
        surface
            .draw_svg(&tree, Size::from_wh(w, h).ok_or("svg size")?, SvgSettings::default())
            .ok_or("draw_svg failed")?;
        surface.pop();
        // CROP-MARKS-BEGIN krilla
        if let Some(p) = print {
            // krilla uses a top-left origin, y down.
            let (x0, y0) = (slug + bleed, slug + bleed);
            let (x1, y1) = (media_w - slug - bleed, media_h - slug - bleed);
            let gap = p.bleed_pt;
            let len = (p.slug_pt - 2.0).max(1.0);
            let mut pb = PathBuilder::new();
            for &(x, y) in &[(x0, y0), (x1, y0), (x0, y1), (x1, y1)] {
                let sx = if x == x0 { -1.0 } else { 1.0 };
                let sy = if y == y0 { -1.0 } else { 1.0 };
                pb.move_to(x + sx * gap, y);
                pb.line_to(x + sx * (gap + len), y);
                pb.move_to(x, y + sy * gap);
                pb.line_to(x, y + sy * (gap + len));
            }
            let path = pb.finish().ok_or("marks path")?;
            surface.set_fill(None);
            surface.set_stroke(Some(Stroke {
                paint: luma::Color::black().into(),
                width: 0.25,
                ..Stroke::default()
            }));
            surface.draw_path(&path);
        }
        // CROP-MARKS-END krilla
        surface.finish();
        page.finish();
    }
    doc.finish().map_err(|e| format!("{e:?}"))
}
