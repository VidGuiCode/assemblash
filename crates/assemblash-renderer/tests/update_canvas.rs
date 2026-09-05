//! `updateCanvas` through the operation journal and the real PNG renderer.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_core::document::{Extras, ImageFit, ImageLayer, Transform};
use assemblash_core::history::{Actor, ActorKind};
use assemblash_core::ids::{AssetId, LayerId, SequentialIdSource};
use assemblash_core::ops::{CanvasAnchor, Operation, UpdateCanvas};
use assemblash_core::{Asset, Color, Document, Layer, LayerKind, Session};
use assemblash_renderer::{document_to_png, AssetHrefs, LoadedFonts, PngMetadata};

fn solid_png(rgba: [u8; 4]) -> Vec<u8> {
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, 1, 1);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&rgba).unwrap();
    }
    out
}

const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn base64(bytes: &[u8]) -> String {
    let mut out = String::new();
    for chunk in bytes.chunks(3) {
        let b0 = u32::from(chunk[0]);
        let b1 = chunk.get(1).copied().map_or(0, u32::from);
        let b2 = chunk.get(2).copied().map_or(0, u32::from);
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHABET[(triple >> 18) as usize & 0x3f] as char);
        out.push(ALPHABET[(triple >> 12) as usize & 0x3f] as char);
        out.push(if chunk.len() > 1 {
            ALPHABET[(triple >> 6) as usize & 0x3f] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            ALPHABET[triple as usize & 0x3f] as char
        } else {
            '='
        });
    }
    out
}
fn decode(png_bytes: &[u8]) -> (u32, u32, Vec<u8>) {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().unwrap();
    let mut buffer = vec![0; reader.output_buffer_size().unwrap()];
    let info = reader.next_frame(&mut buffer).unwrap();
    buffer.truncate(info.buffer_size());
    (info.width, info.height, buffer)
}

fn render(document: &Document, hrefs: &AssetHrefs) -> Vec<u8> {
    document_to_png(
        document,
        &LoadedFonts::from_bytes(std::iter::empty::<Vec<u8>>()),
        hrefs,
        1.0,
        &PngMetadata::for_document(document),
    )
    .unwrap()
}

fn pixel(width: u32, rgba: &[u8], x: u32, y: u32) -> [u8; 4] {
    let start = ((y * width + x) * 4) as usize;
    rgba[start..start + 4].try_into().unwrap()
}

fn blue_bounds(width: u32, rgba: &[u8]) -> (u32, u32, u32, u32) {
    let points: Vec<(u32, u32)> = rgba
        .chunks_exact(4)
        .enumerate()
        .filter(|(_, value)| value[0] == 0 && value[1] == 0 && value[2] == 255 && value[3] == 255)
        .map(|(index, _)| (index as u32 % width, index as u32 / width))
        .collect();
    (
        points.iter().map(|point| point.0).min().unwrap(),
        points.iter().map(|point| point.1).min().unwrap(),
        points.iter().map(|point| point.0).max().unwrap(),
        points.iter().map(|point| point.1).max().unwrap(),
    )
}

#[test]
fn canvas_resize_changes_surface_and_background_without_scaling_then_undoes_pixels() {
    let mut ids = SequentialIdSource::new();
    let mut document = Document::new(&mut ids, 40.0, 30.0);
    let asset_id = AssetId::new("asset_blue");
    let blue = solid_png([0, 0, 255, 255]);
    document.assets.push(Asset {
        id: asset_id.clone(),
        path: "blue.png".to_owned(),
        hash: assemblash_core::storage::hash_bytes(&blue),
        media_type: "image/png".to_owned(),
        width: Some(1),
        height: Some(1),
        extra: Extras::new(),
    });
    document.layers.push(Layer::new(
        LayerId::new("layer_blue"),
        Transform::new(5.0, 6.0, 10.0, 8.0),
        LayerKind::Image(ImageLayer {
            asset: asset_id.clone(),
            fit: ImageFit::Fill,
            extra: Extras::new(),
        }),
    ));
    let mut hrefs = AssetHrefs::new();
    hrefs.insert(asset_id, format!("data:image/png;base64,{}", base64(&blue)));

    let directory = tempfile::tempdir().unwrap();
    let mut session = Session::create(directory.path(), document, Some(1)).unwrap();
    let before = render(session.document(), &hrefs);
    let (before_width, before_height, before_pixels) = decode(&before);
    assert_eq!((before_width, before_height), (40, 30));
    assert_eq!(pixel(before_width, &before_pixels, 0, 0), [0, 0, 0, 0]);
    assert_eq!(blue_bounds(before_width, &before_pixels), (5, 6, 14, 13));

    session
        .apply(
            &Operation::UpdateCanvas(UpdateCanvas {
                width: Some(60.0),
                height: Some(50.0),
                background: Some(Some(Color::new("#ff0000"))),
                anchor: Some(CanvasAnchor::Center),
            }),
            &Actor::named(ActorKind::Human, "renderer-test"),
            Some(2),
            Some(0),
            &mut ids,
        )
        .unwrap();
    let resized = render(session.document(), &hrefs);
    let (width, height, pixels) = decode(&resized);
    assert_eq!((width, height), (60, 50));
    assert_eq!(pixel(width, &pixels, 0, 0), [255, 0, 0, 255]);
    assert_eq!(blue_bounds(width, &pixels), (15, 16, 24, 23));

    session
        .undo(
            &Actor::named(ActorKind::Human, "renderer-test"),
            Some(3),
            &mut ids,
        )
        .unwrap();
    assert_eq!(render(session.document(), &hrefs), before);
}
