//! JPEG and WebP encoder determinism spike.
//!
//! Render fixed inputs with the existing renderer, then encode each input with
//! every candidate encoder at quality 75 and 90. Print one CSV row for each
//! output with its sha256. Each encode runs twice in the process; the second
//! result must equal the first.
//!
//! Run: `cargo run --release -- --out DIR`

use std::fs;
use std::path::{Path, PathBuf};

use assemblash_renderer::raster::font_files_in;
use assemblash_renderer::{data_uris, doc_to_svg, svg_to_pixmap, AssetHrefs, LoadedFonts};
use resvg::tiny_skia;
use sha2::{Digest, Sha256};

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

struct Input {
    name: &'static str,
    width: u32,
    height: u32,
    /// Opaque straight RGB, 3 bytes per pixel.
    rgb: Vec<u8>,
    /// Opaque straight RGBA, 4 bytes per pixel (alpha is always 255).
    rgba: Vec<u8>,
}

fn main() -> Result<()> {
    let out = out_dir();
    fs::create_dir_all(&out)?;
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");

    let inputs = vec![
        from_svg("flat", &flat_svg(), &LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>()))?,
        from_svg("gradient", &gradient_svg(), &LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>()))?,
        text_input(&root)?,
        synthetic_photo(),
    ];

    let mut csv = String::from("target,variant,input,encoder,setting,bytes,sha256,second_run_equal\n");
    let target = target_name();
    let variant = variant_name();
    for input in &inputs {
        fs::write(out.join(format!("{}.rgba", input.name)), &input.rgba)?;
        csv.push_str(&format!(
            "{target},{variant},{},input-rgba,{}x{},{},{},true\n",
            input.name,
            input.width,
            input.height,
            input.rgba.len(),
            hash(&input.rgba)
        ));
        for (encoder, setting, encode) in encoders() {
            let first = encode(input)?;
            let second = encode(input)?;
            let extension = if encoder.contains("webp") { "webp" } else { "jpg" };
            fs::write(
                out.join(format!("{}-{encoder}-{setting}.{extension}", input.name)),
                &first,
            )?;
            csv.push_str(&format!(
                "{target},{variant},{},{encoder},{setting},{},{},{}\n",
                input.name,
                first.len(),
                hash(&first),
                first == second
            ));
        }
    }

    fs::write(out.join("hashes.csv"), &csv)?;
    print!("{csv}");
    Ok(())
}

type EncodeFn = Box<dyn Fn(&Input) -> Result<Vec<u8>>>;

fn encoders() -> Vec<(&'static str, String, EncodeFn)> {
    #[allow(unused_mut)]
    let mut list: Vec<(&'static str, String, EncodeFn)> = Vec::new();
    for quality in [75u8, 90] {
        #[cfg(feature = "enc-jpeg-encoder")]
        list.push((
            "jpeg-encoder",
            format!("q{quality}"),
            Box::new(move |input: &Input| {
                let mut out = Vec::new();
                let encoder = jpeg_encoder::Encoder::new(&mut out, quality);
                encoder.encode(
                    &input.rgb,
                    u16::try_from(input.width)?,
                    u16::try_from(input.height)?,
                    jpeg_encoder::ColorType::Rgb,
                )?;
                Ok(out)
            }),
        ));
        #[cfg(feature = "enc-image")]
        list.push((
            "image-jpeg",
            format!("q{quality}"),
            Box::new(move |input: &Input| {
                use image::ImageEncoder;
                let mut out = Vec::new();
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, quality).write_image(
                    &input.rgb,
                    input.width,
                    input.height,
                    image::ExtendedColorType::Rgb8,
                )?;
                Ok(out)
            }),
        ));
        #[cfg(feature = "enc-mozjpeg")]
        list.push((
            "mozjpeg",
            format!("q{quality}"),
            Box::new(move |input: &Input| {
                let mut compress = mozjpeg::Compress::new(mozjpeg::ColorSpace::JCS_RGB);
                compress.set_size(input.width as usize, input.height as usize);
                compress.set_quality(f32::from(quality));
                let mut started = compress.start_compress(Vec::new())?;
                started.write_scanlines(&input.rgb)?;
                Ok(started.finish()?)
            }),
        ));
        #[cfg(feature = "enc-libwebp")]
        list.push((
            "libwebp-lossy",
            format!("q{quality}"),
            Box::new(move |input: &Input| {
                let encoder = webp::Encoder::from_rgb(&input.rgb, input.width, input.height);
                Ok(encoder.encode(f32::from(quality)).to_vec())
            }),
        ));
        #[cfg(feature = "enc-zenwebp")]
        list.push((
            "zenwebp-lossy",
            format!("q{quality}"),
            Box::new(move |input: &Input| {
                let config = zenwebp::LossyConfig::new()
                    .with_quality(f32::from(quality))
                    .with_method(4);
                Ok(zenwebp::EncodeRequest::lossy(
                    &config,
                    &input.rgb,
                    zenwebp::PixelLayout::Rgb8,
                    input.width,
                    input.height,
                )
                .encode()?)
            }),
        ));
    }
    #[cfg(feature = "enc-image")]
    list.push((
        "image-webp-lossless",
        "lossless".to_owned(),
        Box::new(|input: &Input| {
            use image::ImageEncoder;
            let mut out = Vec::new();
            image::codecs::webp::WebPEncoder::new_lossless(&mut out).write_image(
                &input.rgba,
                input.width,
                input.height,
                image::ExtendedColorType::Rgba8,
            )?;
            Ok(out)
        }),
    ));
    #[cfg(feature = "enc-libwebp")]
    list.push((
        "libwebp-lossless",
        "lossless".to_owned(),
        Box::new(|input: &Input| {
            let encoder = webp::Encoder::from_rgba(&input.rgba, input.width, input.height);
            Ok(encoder.encode_lossless().to_vec())
        }),
    ));
    #[cfg(feature = "enc-zenwebp")]
    list.push((
        "zenwebp-lossless",
        "lossless".to_owned(),
        Box::new(|input: &Input| {
            let config = zenwebp::LosslessConfig::new();
            Ok(zenwebp::EncodeRequest::lossless(
                &config,
                &input.rgba,
                zenwebp::PixelLayout::Rgba8,
                input.width,
                input.height,
            )
            .encode()?)
        }),
    ));
    list
}

fn from_svg(name: &'static str, svg: &str, fonts: &LoadedFonts) -> Result<Input> {
    let pixmap = svg_to_pixmap(svg, fonts, 1.0)?;
    Ok(flatten(name, &pixmap))
}

/// Composite the premultiplied pixmap onto white with exact integer math:
/// `c_premultiplied + (255 - a)`.
fn flatten(name: &'static str, pixmap: &tiny_skia::Pixmap) -> Input {
    let mut rgb = Vec::with_capacity((pixmap.width() * pixmap.height() * 3) as usize);
    let mut rgba = Vec::with_capacity((pixmap.width() * pixmap.height() * 4) as usize);
    for pixel in pixmap.pixels() {
        let lift = 255 - pixel.alpha();
        let channels = [pixel.red() + lift, pixel.green() + lift, pixel.blue() + lift];
        rgb.extend_from_slice(&channels);
        rgba.extend_from_slice(&channels);
        rgba.push(255);
    }
    Input {
        name,
        width: pixmap.width(),
        height: pixmap.height(),
        rgb,
        rgba,
    }
}

fn flat_svg() -> String {
    r##"<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<rect width="800" height="450" fill="#1e3a5f"/>
<rect x="40" y="40" width="320" height="180" fill="#f4b400"/>
<rect x="400" y="40" width="360" height="180" fill="#db4437"/>
<rect x="40" y="260" width="720" height="150" fill="#0f9d58"/>
<rect x="420" y="280" width="120" height="110" fill="#ffffff"/>
</svg>"##
        .to_owned()
}

fn gradient_svg() -> String {
    r##"<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0.3" y2="1">
<stop offset="0" stop-color="#0b1d3a"/><stop offset="0.45" stop-color="#c0587e"/><stop offset="1" stop-color="#fcb25b"/>
</linearGradient>
<radialGradient id="sun" cx="0.68" cy="0.62" r="0.35">
<stop offset="0" stop-color="#fff6d5" stop-opacity="1"/><stop offset="0.4" stop-color="#ffd27a" stop-opacity="0.7"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ground" x1="0" y1="0" x2="1" y2="0.2">
<stop offset="0" stop-color="#1b3b2a"/><stop offset="1" stop-color="#5b7f3a"/>
</linearGradient>
</defs>
<rect width="800" height="450" fill="url(#sky)"/>
<rect width="800" height="450" fill="url(#sun)"/>
<path d="M0 330 C 160 290 300 360 470 320 S 700 300 800 340 L 800 450 L 0 450 Z" fill="url(#ground)"/>
</svg>"##
        .to_owned()
}

/// The committed text-only example project, rendered by the existing renderer
/// with the committed example fonts.
fn text_input(root: &Path) -> Result<Input> {
    let project = root.join("examples/readme-pipeline");
    let document = assemblash_core::storage::load(&project)?;
    let fonts = LoadedFonts::from_files(font_files_in(&root.join("examples/fonts"))?)?;
    let hrefs: AssetHrefs = data_uris(&document, &project)?;
    let svg = doc_to_svg(&document, fonts.font_set(), &hrefs)?;
    let pixmap = svg_to_pixmap(&svg, &fonts, 1.0)?;
    Ok(flatten("text", &pixmap))
}

/// A photo-like input built with integer math only, so it does not depend on
/// the renderer: smooth gradients plus deterministic noise.
fn synthetic_photo() -> Input {
    let (width, height) = (640u32, 480u32);
    let mut rgb = Vec::with_capacity((width * height * 3) as usize);
    let mut rgba = Vec::with_capacity((width * height * 4) as usize);
    let mut state: u32 = 0x1234_5678;
    for y in 0..height {
        for x in 0..width {
            state ^= state << 13;
            state ^= state >> 17;
            state ^= state << 5;
            let noise = (state % 25) as i32 - 12;
            let dx = x as i32 - 400;
            let dy = y as i32 - 200;
            let ring = ((dx * dx + dy * dy) / 600) as i32;
            let r = (x * 255 / width) as i32 + noise;
            let g = (y * 255 / height) as i32 + noise - ring / 4;
            let b = 200 - ring + noise;
            let channels = [clamp(r), clamp(g), clamp(b)];
            rgb.extend_from_slice(&channels);
            rgba.extend_from_slice(&channels);
            rgba.push(255);
        }
    }
    Input {
        name: "synthetic-photo",
        width,
        height,
        rgb,
        rgba,
    }
}

fn clamp(value: i32) -> u8 {
    value.clamp(0, 255) as u8
}

fn target_name() -> String {
    format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH)
}

fn variant_name() -> &'static str {
    match (cfg!(feature = "jpeg-encoder-simd"), cfg!(feature = "zenwebp-simd")) {
        (false, false) => "scalar",
        (true, false) => "jpeg-encoder-simd",
        (false, true) => "zenwebp-simd",
        (true, true) => "simd",
    }
}

fn out_dir() -> PathBuf {
    let args: Vec<String> = std::env::args().collect();
    let mut out = PathBuf::from("target/jpeg-webp-spike");
    for (index, arg) in args.iter().enumerate() {
        if arg == "--out" {
            if let Some(value) = args.get(index + 1) {
                out = PathBuf::from(value);
            }
        }
    }
    out
}

fn hash(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut hex = String::with_capacity(digest.len() * 2);
    for byte in digest {
        hex.push_str(&format!("{byte:02x}"));
    }
    hex
}
