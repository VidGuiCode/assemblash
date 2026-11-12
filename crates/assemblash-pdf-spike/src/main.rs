//! PDF byte-reproducibility spike. Not shipped; never merged.
//!
//! Renders three example projects through the CLI export path
//! (`doc_to_svg` -> `svg_to_pixmap` -> `pixmap_to_png`), then writes
//! three-page and ten-page PDFs on each compiled route, several runs each,
//! and prints one sha256 table.
//!
//! Run: `cargo run --release -p assemblash-pdf-spike --all-features -- --out DIR`

#![allow(clippy::unwrap_used, clippy::expect_used, unreachable_pub, missing_debug_implementations)]

mod raster_pdf;
#[cfg(feature = "svg2pdf-route")]
mod svg2pdf_route;
#[cfg(feature = "krilla-route")]
mod krilla_route;

use std::fmt::Write as _;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

use assemblash_renderer::raster::font_files_in;
use assemblash_renderer::{doc_to_svg, pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata};
use raster_pdf::{PageImage, Print};
use sha2::{Digest, Sha256};

const PROJECTS: [&str; 3] = ["readme-capabilities", "readme-hero", "readme-pipeline"];
const RUNS: usize = 3;
/// 12 CSS px = 9 pt of bleed; 18 pt of slug for the marks.
const BLEED_PX: f32 = 12.0;
const PRINT: Print = Print { bleed_pt: 9.0, slug_pt: 18.0 };

type Res<T> = Result<T, Box<dyn std::error::Error>>;

fn hex(bytes: &[u8]) -> String {
    Sha256::digest(bytes).iter().map(|b| format!("{b:02x}")).collect()
}

struct Project {
    name: String,
    document: assemblash_core::Document,
    hrefs: assemblash_renderer::AssetHrefs,
}

fn main() -> Res<()> {
    let mut out = PathBuf::from("pdf-spike-out");
    let mut examples = PathBuf::from("examples");
    let mut args = std::env::args().skip(1);
    while let Some(a) = args.next() {
        match a.as_str() {
            "--out" => out = PathBuf::from(args.next().ok_or("--out DIR")?),
            "--examples" => examples = PathBuf::from(args.next().ok_or("--examples DIR")?),
            other => return Err(format!("unknown argument {other}").into()),
        }
    }
    fs::create_dir_all(&out)?;

    let mut font_paths = font_files_in(&examples.join("fonts"))?;
    font_paths.sort();
    let font_bytes: Vec<Vec<u8>> = font_paths.iter().map(fs::read).collect::<Result<_, _>>()?;
    let fonts = LoadedFonts::from_files(font_paths.clone())?;

    let mut projects = Vec::new();
    for name in PROJECTS {
        let dir = examples.join(name);
        let document = assemblash_core::storage::load(&dir)?;
        let hrefs = assemblash_renderer::data_uris(&document, &dir)?;
        projects.push(Project { name: name.to_owned(), document, hrefs });
    }

    let mut table = String::from("route,set,runs,identical,bytes,sha256,min_total_ms,min_render_ms,min_pdf_ms\n");
    let mut notes = String::new();

    // PNG export, as `assemblash export --scale 1`.
    let mut pngs = Vec::new();
    for p in &projects {
        let png = export_png(p, &fonts, None)?;
        fs::write(out.join(format!("{}.png", p.name)), &png)?;
        let _ = writeln!(table, "png,{},1,-,{},{},-,-,-", p.name, png.len(), hex(&png));
        pngs.push(png);
    }

    let three: Vec<usize> = vec![0, 1, 2];
    let ten: Vec<usize> = (0..10).map(|i| i % 3).collect();
    let sets: [(&str, &[usize], Option<Print>); 3] =
        [("three", &three, None), ("ten", &ten, None), ("three-print", &three, Some(PRINT))];

    // Raster route.
    for (set, pages, print) in &sets {
        let mut results = Vec::new();
        for _ in 0..RUNS {
            let t0 = Instant::now();
            let mut images = Vec::new();
            for &i in *pages {
                let png = export_png(&projects[i], &fonts, *print)?;
                images.push(decode_page(&png, &projects[i], *print)?);
            }
            let t1 = Instant::now();
            let pdf = raster_pdf::write_pdf(&images, *print);
            let t2 = Instant::now();
            results.push((pdf, t2 - t0, t1 - t0, t2 - t1));
        }
        record(&mut table, &out, "raster", set, &results)?;
    }

    // Rung exit test 2 on the three-page raster PDF.
    {
        let pdf = fs::read(out.join("raster-three.pdf"))?;
        let images = raster_pdf::extract_images(&pdf).map_err(|e| e.to_string())?;
        for (n, png) in pngs.iter().enumerate() {
            let (w, h, rgba) = decode_rgba(png)?;
            let (iw, ih, irgba) = &images[n];
            let pixels_equal = w == *iw && h == *ih && rgba == *irgba;
            let png_bytes_in_pdf = raster_pdf::find(&pdf, png).is_some();
            let _ = writeln!(
                notes,
                "exit2,page {},{}x{},decoded_pixels_equal={},png_file_bytes_inside_pdf={},png_rgba_sha256={},pdf_image_rgba_sha256={}",
                n + 1, w, h, pixels_equal, png_bytes_in_pdf, hex(&rgba), hex(irgba)
            );
        }
        // Exit test 4 control: the PNG export of the same document has no marks,
        // because print geometry never reaches the PNG path.
        let _ = writeln!(notes, "exit4,png export ignores print geometry: png sha256 unchanged = {}", hex(&pngs[0]) == hex(&export_png(&projects[0], &fonts, None)?));
    }

    #[cfg(feature = "svg2pdf-route")]
    {
        let opt = svg2pdf_route::options(&font_bytes);
        for (set, pages, print) in &sets {
            let mut results = Vec::new();
            for _ in 0..RUNS {
                let t0 = Instant::now();
                let svgs: Vec<String> = pages.iter().map(|&i| page_svg(&projects[i], &fonts, *print)).collect::<Res<_>>()?;
                let t1 = Instant::now();
                let pdf = svg2pdf_route::write_pdf(&svgs, &opt, *print).map_err(|e| e.to_string())?;
                let t2 = Instant::now();
                results.push((pdf, t2 - t0, t1 - t0, t2 - t1));
            }
            fonts_note(&mut notes, "svg2pdf", set, &results[0].0);
            record(&mut table, &out, "svg2pdf", set, &results)?;
        }
    }

    #[cfg(feature = "krilla-route")]
    {
        let opt = krilla_route::options(&font_bytes);
        for (set, pages, print) in &sets {
            let mut results = Vec::new();
            for _ in 0..RUNS {
                let t0 = Instant::now();
                let svgs: Vec<String> = pages.iter().map(|&i| page_svg(&projects[i], &fonts, *print)).collect::<Res<_>>()?;
                let t1 = Instant::now();
                let pdf = krilla_route::write_pdf(&svgs, &opt, *print).map_err(|e| e.to_string())?;
                let t2 = Instant::now();
                results.push((pdf, t2 - t0, t1 - t0, t2 - t1));
            }
            fonts_note(&mut notes, "krilla", set, &results[0].0);
            record(&mut table, &out, "krilla", set, &results)?;
        }
    }
    let _ = &font_bytes;

    fs::write(out.join("hashes.csv"), &table)?;
    fs::write(out.join("notes.csv"), &notes)?;
    print!("{table}\n{notes}");
    Ok(())
}

fn record(
    table: &mut String,
    out: &Path,
    route: &str,
    set: &str,
    results: &[(Vec<u8>, std::time::Duration, std::time::Duration, std::time::Duration)],
) -> Res<()> {
    let first = &results[0].0;
    let identical = results.iter().all(|r| &r.0 == first);
    let ms = |f: fn(&(Vec<u8>, std::time::Duration, std::time::Duration, std::time::Duration)) -> std::time::Duration| {
        results.iter().map(f).min().map_or(0.0, |d| d.as_secs_f64() * 1000.0)
    };
    fs::write(out.join(format!("{route}-{set}.pdf")), first)?;
    if !identical {
        for (i, r) in results.iter().enumerate() {
            fs::write(out.join(format!("{route}-{set}-run{}.pdf", i + 1)), &r.0)?;
        }
    }
    let _ = writeln!(
        table,
        "{route},{set},{},{identical},{},{},{:.1},{:.1},{:.1}",
        results.len(),
        first.len(),
        hex(first),
        ms(|r| r.1),
        ms(|r| r.2),
        ms(|r| r.3)
    );
    Ok(())
}

/// The document SVG; with print geometry, the root is widened by the bleed.
fn page_svg(p: &Project, fonts: &LoadedFonts, print: Option<Print>) -> Res<String> {
    let svg = doc_to_svg(&p.document, fonts.font_set(), &p.hrefs)?;
    Ok(match print {
        None => svg,
        Some(_) => widen(&svg, p.document.canvas.width, p.document.canvas.height),
    })
}

fn widen(svg: &str, w: f64, h: f64) -> String {
    let b = f64::from(BLEED_PX);
    let end = svg.find('\n').unwrap_or(svg.len());
    let root = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"{} {} {} {}\">",
        w + 2.0 * b,
        h + 2.0 * b,
        -b,
        -b,
        w + 2.0 * b,
        h + 2.0 * b
    );
    format!("{root}{}", &svg[end..])
}

/// The CLI export path at scale 1.
fn export_png(p: &Project, fonts: &LoadedFonts, print: Option<Print>) -> Res<Vec<u8>> {
    let svg = page_svg(p, fonts, print)?;
    let pixmap = svg_to_pixmap(&svg, fonts, 1.0)?;
    Ok(pixmap_to_png(&pixmap, &PngMetadata::for_document(&p.document))?)
}

fn decode_rgba(png_bytes: &[u8]) -> Res<(u32, u32, Vec<u8>)> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info()?;
    let mut buf = vec![0; reader.output_buffer_size().ok_or("png size")?];
    let info = reader.next_frame(&mut buf)?;
    if info.color_type != png::ColorType::Rgba || info.bit_depth != png::BitDepth::Eight {
        return Err("expected RGBA8".into());
    }
    buf.truncate(info.buffer_size());
    Ok((info.width, info.height, buf))
}

fn decode_page(png_bytes: &[u8], p: &Project, print: Option<Print>) -> Res<PageImage> {
    let (w, h, rgba) = decode_rgba(png_bytes)?;
    let _ = print;
    Ok(PageImage {
        width_px: w,
        height_px: h,
        rgba,
        trim_w_pt: (p.document.canvas.width * 0.75) as f32,
        trim_h_pt: (p.document.canvas.height * 0.75) as f32,
    })
}

#[allow(dead_code)]
fn fonts_note(notes: &mut String, route: &str, set: &str, pdf: &[u8]) {
    let text = String::from_utf8_lossy(pdf);
    let mut names: Vec<String> = text
        .match_indices("/BaseFont /")
        .map(|(i, _)| {
            text[i + 11..]
                .chars()
                .take_while(|c| !c.is_whitespace() && !"/<>[]()".contains(*c))
                .collect()
        })
        .collect();
    names.sort();
    names.dedup();
    let _ = writeln!(
        notes,
        "fonts,{route},{set},FontFile2={},FontFile3={},BaseFont=[{}]",
        text.matches("/FontFile2").count(),
        text.matches("/FontFile3").count(),
        names.join(" ")
    );
}
