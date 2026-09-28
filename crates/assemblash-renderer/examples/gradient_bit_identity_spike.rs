//! Gradient bit-identity spike (Step 1 of the v1.11.0 plan).
//!
//! The rung's one technical risk: the gradient rasterizer stack must paint
//! the same bytes on all six targets. `color-dodge` and `color-burn` were
//! refused for the same class of risk (see the `BlendMode` doc comment in
//! `assemblash-core/src/document.rs`).
//!
//! Method (the dash-marker precedent):
//!
//! 1. Build each spike document's SVG in code, in the emission shape the
//!    rung intends: `<defs>` ids keyed by a layer id plus the field path,
//!    stops with alpha, an angle that runs through `cos`/`sin`, a rotated
//!    layer, a gradient stroke, and a background image below every layer.
//! 2. Render through the renderer's own public calls, `svg_to_pixmap` and
//!    `pixmap_to_png`, at scale 1 and scale 2.
//! 3. Write each PNG and one `hashes.csv` of SHA-256 digests.
//!
//! The SVG hash sits beside the PNG hash on purpose: the axis math runs
//! through `cos`/`sin`, and a one-ulp difference in a platform's libm shows
//! in the emitted string before it can show in the pixels. A CSV that is
//! byte-equal across targets and across repeated runs is the pass.
//!
//! The axis convention below is the spike's own. Step 2 fixes the published
//! one; this spike measures the arithmetic, not the convention.
//!
//! Run: `cargo run -p assemblash-renderer --example gradient_bit_identity_spike -- --out DIR`

use std::fs;
use std::path::PathBuf;

use assemblash_renderer::{
    pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata, RENDERER_VERSION,
};
use resvg::tiny_skia;
use sha2::{Digest, Sha256};

type Stop = (f64, &'static str, f64);

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out = out_dir();
    fs::create_dir_all(&out)?;
    let fonts = LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>());

    let documents = [
        ("gradient_linear", gradient_linear()),
        ("gradient_radial", gradient_radial()),
        ("background_image", background_image()?),
        ("solid_control", solid_control()),
        ("blank_control", blank_control()),
    ];

    let mut csv = String::from("document,scale,svg_sha256,png_sha256,ink_px\n");
    for (name, svg) in &documents {
        fs::write(out.join(format!("{name}.svg")), svg)?;
        let svg_hash = hash(svg.as_bytes());
        for scale in [1.0f32, 2.0] {
            let pixmap = svg_to_pixmap(svg, &fonts, scale)?;
            let metadata = PngMetadata {
                document_id: (*name).to_owned(),
                schema_version: 1,
                renderer_version: RENDERER_VERSION.to_owned(),
                created: None,
            };
            let png = pixmap_to_png(&pixmap, &metadata)?;
            let path = out.join(format!("{name}-scale{scale}.png"));
            fs::write(&path, &png)?;
            let ink = ink_pixels(&pixmap);
            csv.push_str(&format!(
                "{name},{scale},{svg_hash},{},{ink}\n",
                hash(&png),
                ink = ink,
            ));
        }
    }

    fs::write(out.join("hashes.csv"), &csv)?;
    print!("{csv}");
    println!("OUT={}", out.display());
    Ok(())
}

fn out_dir() -> PathBuf {
    let args: Vec<String> = std::env::args().collect();
    let mut out = PathBuf::from("target/gradient-bit-identity-spike");
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

fn ink_pixels(pixmap: &tiny_skia::Pixmap) -> usize {
    const BACKGROUND: [u8; 3] = [255, 254, 253];
    pixmap
        .pixels()
        .iter()
        .filter(|pixel| {
            let pixel = pixel.demultiply();
            [pixel.red(), pixel.green(), pixel.blue()] != BACKGROUND
        })
        .count()
}

/// One document per risk. Every gradient id carries a layer id and a field
/// path, as Contents A7 requires; every stop list has more than two stops and
/// at least one alpha stop, as the exit test requires.
fn gradient_linear() -> String {
    let mut svg = svg_shell("gradient-linear");
    svg.push_str(&linear_gradient(
        "gradient-linear_layer_17-fill",
        37.0,
        &[
            (0.0, "#112233", 1.0),
            (0.35, "#B98019", 0.85),
            (0.7, "#D99D28", 1.0),
            (1.0, "#101010", 0.6),
        ],
    ));
    svg.push_str(&linear_gradient(
        "gradient-linear_layer_23-fill",
        90.0,
        &[(0.0, "#F5D478", 1.0), (1.0, "#B98019", 1.0)],
    ));
    svg.push_str(&linear_gradient(
        "gradient-linear_layer_41-stroke",
        200.0,
        &[
            (0.0, "#FFFFFF", 1.0),
            (0.5, "#D99D28", 0.7),
            (1.0, "#101010", 1.0),
        ],
    ));
    svg.push_str(
        "  <rect width=\"720\" height=\"400\" fill=\"#fffefd\"/>\n\
         \x20 <rect x=\"40\" y=\"40\" width=\"640\" height=\"200\" \
        fill=\"url(#gradient-linear_layer_17-fill)\"/>\n\
         \x20 <rect x=\"120\" y=\"270\" width=\"300\" height=\"90\" rx=\"18\" \
        transform=\"rotate(17 270 315)\" fill=\"url(#gradient-linear_layer_23-fill)\"/>\n\
         \x20 <line x1=\"480\" y1=\"330\" x2=\"660\" y2=\"290\" stroke=\"url(#gradient-linear_layer_41-stroke)\" \
        stroke-width=\"14\" stroke-linecap=\"round\"/>\n\
         </svg>\n",
    );
    svg
}

fn gradient_radial() -> String {
    let mut svg = svg_shell("gradient-radial");
    svg.push_str(&radial_gradient(
        "gradient-radial_layer_19-fill",
        (0.35, 0.6),
        0.55,
        &[
            (0.0, "#FFFFFF", 1.0),
            (0.4, "#D99D28", 0.9),
            (0.75, "#B98019", 1.0),
            (1.0, "#101010", 0.35),
        ],
    ));
    svg.push_str(&radial_gradient(
        "gradient-radial_layer_27-fill",
        (0.7, 0.3),
        0.4,
        &[
            (0.0, "#F5D478", 1.0),
            (0.6, "#B98019", 0.8),
            (1.0, "#101010", 1.0),
        ],
    ));
    svg.push_str(
        "  <rect width=\"720\" height=\"400\" fill=\"#fffefd\"/>\n\
         \x20 <rect x=\"40\" y=\"40\" width=\"380\" height=\"320\" \
        fill=\"url(#gradient-radial_layer_19-fill)\"/>\n\
         \x20 <ellipse cx=\"540\" cy=\"200\" rx=\"140\" ry=\"120\" \
        fill=\"url(#gradient-radial_layer_19-fill)\"/>\n\
         \x20 <rect x=\"470\" y=\"290\" width=\"190\" height=\"80\" \
        transform=\"rotate(17 565 330)\" fill=\"url(#gradient-radial_layer_27-fill)\"/>\n\
         </svg>\n",
    );
    svg
}

fn background_image() -> Result<String, Box<dyn std::error::Error>> {
    let mut svg = svg_shell("background-image");
    svg.push_str(&linear_gradient(
        "background-image_layer_31-fill",
        64.0,
        &[
            (0.0, "#112233", 1.0),
            (0.55, "#B98019", 0.9),
            (1.0, "#D99D28", 1.0),
        ],
    ));
    svg.push_str(&format!(
        "  <rect width=\"720\" height=\"400\" fill=\"#fffefd\"/>\n\
         \x20 <image x=\"0\" y=\"0\" width=\"720\" height=\"400\" preserveAspectRatio=\"none\" \
        href=\"data:image/png;base64,{}\"/>\n\
         \x20 <rect x=\"0\" y=\"0\" width=\"720\" height=\"400\" fill=\"#101010\" opacity=\"0.35\"/>\n\
         \x20 <rect x=\"60\" y=\"90\" width=\"300\" height=\"200\" \
        fill=\"url(#background-image_layer_31-fill)\"/>\n\
         \x20 <line x1=\"420\" y1=\"80\" x2=\"660\" y2=\"320\" stroke=\"#fffefd\" \
        stroke-width=\"6\"/>\n\
         </svg>\n",
        base64(&background_png()?),
    ));
    Ok(svg)
}

fn solid_control() -> String {
    let mut svg = svg_shell("solid-control");
    svg.push_str(
        "  <rect width=\"720\" height=\"400\" fill=\"#fffefd\"/>\n\
         \x20 <rect x=\"40\" y=\"40\" width=\"300\" height=\"180\" fill=\"#B98019\"/>\n\
         \x20 <rect x=\"420\" y=\"120\" width=\"220\" height=\"140\" fill=\"#101010\" opacity=\"0.7\"/>\n\
         \x20 <line x1=\"80\" y1=\"330\" x2=\"620\" y2=\"330\" stroke=\"#D99D28\" stroke-width=\"10\"/>\n\
         </svg>\n",
    );
    svg
}

fn blank_control() -> String {
    let mut svg = svg_shell("blank-control");
    svg.push_str("  <rect width=\"720\" height=\"400\" fill=\"#fffefd\"/>\n  </svg>\n");
    svg
}

fn svg_shell(name: &str) -> String {
    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"720\" height=\"400\" \
         viewBox=\"0 0 720 400\"><!-- {name} gradient bit-identity spike -->\n"
    )
}

/// The spike's own axis convention: the gradient axis runs through the box
/// centre, and the angle turns from the positive x axis, y downward. The
/// `cos`/`sin` calls are deliberate — they are the emission math a
/// cross-platform libm can disagree about in the last ulp.
fn linear_gradient(id: &str, angle_deg: f64, stops: &[Stop]) -> String {
    let radians = angle_deg * std::f64::consts::PI / 180.0;
    let (dx, dy) = (radians.cos() / 2.0, radians.sin() / 2.0);
    let mut svg = format!(
        "  <linearGradient id=\"{id}\" gradientUnits=\"objectBoundingBox\" \
         x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\">\n",
        0.5 - dx,
        0.5 - dy,
        0.5 + dx,
        0.5 + dy,
    );
    for (offset, color, alpha) in stops {
        svg.push_str(&format!(
            "    <stop offset=\"{offset}\" stop-color=\"{color}\" stop-opacity=\"{alpha}\"/>\n"
        ));
    }
    svg.push_str("  </linearGradient>\n");
    svg
}

fn radial_gradient(id: &str, center: (f64, f64), radius: f64, stops: &[Stop]) -> String {
    let mut svg = format!(
        "  <radialGradient id=\"{id}\" gradientUnits=\"objectBoundingBox\" \
         cx=\"{}\" cy=\"{}\" r=\"{}\">\n",
        center.0, center.1, radius,
    );
    for (offset, color, alpha) in stops {
        svg.push_str(&format!(
            "    <stop offset=\"{offset}\" stop-color=\"{color}\" stop-opacity=\"{alpha}\"/>\n"
        ));
    }
    svg.push_str("  </radialGradient>\n");
    svg
}

/// A 64 by 64 RGBA image from integer arithmetic only, encoded by the same
/// `png` crate the renderer itself uses. It stands in for a canvas background
/// asset, so the decode path and the below-every-layer order are both
/// measured.
fn background_png() -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut rgba = Vec::with_capacity(64 * 64 * 4);
    for y in 0..64u16 {
        for x in 0..64u16 {
            rgba.extend_from_slice(&[
                ((x * 4) % 256) as u8,
                ((y * 7) % 256) as u8,
                (((x + y) * 3) % 256) as u8,
                255,
            ]);
        }
    }
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, 64, 64);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header()?;
        writer.write_image_data(&rgba)?;
    }
    Ok(out)
}

fn base64(data: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(data.len().div_ceil(3) * 4);
    for chunk in data.chunks(3) {
        let word = (u32::from(chunk[0]) << 16)
            | (u32::from(*chunk.get(1).unwrap_or(&0)) << 8)
            | u32::from(*chunk.get(2).unwrap_or(&0));
        out.push(ALPHABET[(word >> 18) as usize & 63] as char);
        out.push(ALPHABET[(word >> 12) as usize & 63] as char);
        out.push(if chunk.len() > 1 {
            ALPHABET[(word >> 6) as usize & 63] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            ALPHABET[word as usize & 63] as char
        } else {
            '='
        });
    }
    out
}
