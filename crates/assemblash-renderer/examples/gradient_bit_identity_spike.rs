//! Compare gradient rendering on all six targets.
//!
//! Use one fixed PNG fixture on every target.
//! Record its encoded bytes and decoded pixels in the hash table.
//! Render linear gradients, radial gradients, an image background, and two controls.
//! Record SVG bytes, rendered pixels, and PNG bytes at scales 1 and 2.
//! Each gradient definition uses a layer identifier and a field name.
//! The documents include alpha stops, rotation, and angles outside the coordinate axes.
//! Every target must produce the same complete hash table.
//!
//! Run: `cargo run -p assemblash-renderer --example gradient_bit_identity_spike -- --out DIR`

use std::fs;
use std::path::PathBuf;

use assemblash_renderer::{
    pixmap_to_png, svg_to_pixmap, LoadedFonts, PngMetadata, RENDERER_VERSION,
};
use resvg::tiny_skia;
use sha2::{Digest, Sha256};

const BACKGROUND_PNG: &[u8] = include_bytes!("fixtures/gradient-background.png");

type Stop = (f64, &'static str, f64);

/// Use the renderer's existing six-decimal SVG number format.
fn number(value: f64) -> String {
    if !value.is_finite() {
        return "0".to_owned();
    }
    let rounded = (value * 1_000_000.0).round() / 1_000_000.0;
    if rounded == 0.0 {
        return "0".to_owned();
    }
    let mut text = format!("{rounded:.6}");
    while text.ends_with('0') {
        text.pop();
    }
    if text.ends_with('.') {
        text.pop();
    }
    text
}

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

    let fixture = tiny_skia::Pixmap::decode_png(BACKGROUND_PNG)?;
    let fixture_png_hash = hash(BACKGROUND_PNG);
    let fixture_rgba_hash = hash(fixture.data());
    let mut csv = String::from("document,scale,fixture_png_sha256,fixture_rgba_sha256,svg_sha256,rgba_sha256,png_sha256,ink_px\n");
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
                "{name},{scale},{fixture_png_hash},{fixture_rgba_hash},{svg_hash},{},{},{ink}\n",
                hash(pixmap.data()),
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

/// The linear document includes alpha stops, rotation, and a gradient stroke.
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
        base64(BACKGROUND_PNG),
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
        number(0.5 - dx),
        number(0.5 - dy),
        number(0.5 + dx),
        number(0.5 + dy),
    );
    for (offset, color, alpha) in stops {
        svg.push_str(&format!(
            "    <stop offset=\"{}\" stop-color=\"{color}\" stop-opacity=\"{}\"/>\n",
            number(*offset),
            number(*alpha)
        ));
    }
    svg.push_str("  </linearGradient>\n");
    svg
}

fn radial_gradient(id: &str, center: (f64, f64), radius: f64, stops: &[Stop]) -> String {
    let mut svg = format!(
        "  <radialGradient id=\"{id}\" gradientUnits=\"objectBoundingBox\" \
         cx=\"{}\" cy=\"{}\" r=\"{}\">\n",
        number(center.0),
        number(center.1),
        number(radius),
    );
    for (offset, color, alpha) in stops {
        svg.push_str(&format!(
            "    <stop offset=\"{}\" stop-color=\"{color}\" stop-opacity=\"{}\"/>\n",
            number(*offset),
            number(*alpha)
        ));
    }
    svg.push_str("  </radialGradient>\n");
    svg
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
