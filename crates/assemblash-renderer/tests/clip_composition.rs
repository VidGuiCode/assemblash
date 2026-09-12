//! The clip-and-filter composition spike (v1.8.0 step 1), kept as a
//! regression guard.
//!
//! SVG 1.1 applies `clip-path` after `filter` on the same element, so a
//! shadow carried beside a `clip-path` attribute is cut off at the clip
//! boundary. Wrapping the clipped content in a group that carries the filter
//! applies the filter to the clipped result first, so the shadow follows the
//! clipped silhouette. These tests measure both orders and pin the answer
//! the renderer's emission relies on: ink outside the clip box exists only
//! in the wrapper order.

#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use assemblash_renderer::{svg_to_pixmap, LoadedFonts};

fn fonts() -> LoadedFonts {
    let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fonts");
    let files: Vec<std::path::PathBuf> = ["NotoSans-Subset.ttf"]
        .iter()
        .map(|name| dir.join(name))
        .collect();
    LoadedFonts::from_files(files).unwrap()
}

/// A 120×120 rounded rect at (100, 100), blurred with a shadow offset 24
/// pixels down: the shadow must reach y ≈ 244+, far below the clip's bottom
/// edge at 220.
fn svg(order: &str) -> String {
    let shape = "M100 130 Q100 100 130 100 L190 100 Q220 100 220 130 L220 190 \
                 Q220 220 190 220 L130 220 Q100 220 100 190 Z";
    let defs = format!(
        "<defs>\
         <clipPath id=\"clip\"><path d=\"{shape}\"/></clipPath>\
         <filter id=\"fx\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">\
         <feDropShadow dx=\"0\" dy=\"24\" stdDeviation=\"6\" flood-color=\"#000000\" flood-opacity=\"0.9\"/>\
         </filter></defs>"
    );
    let body = match order {
        // (a) wrapper: filter on the outer group, clip on the inner group.
        "wrapper" => format!(
            "{defs}<g filter=\"url(#fx)\"><g clip-path=\"url(#clip)\">\
             <path d=\"{shape}\" fill=\"#3366aa\"/></g></g>"
        ),
        // (b) attributes: filter and clip-path on the same element.
        "attribute" => format!(
            "{defs}<path d=\"{shape}\" fill=\"#3366aa\" clip-path=\"url(#clip)\" filter=\"url(#fx)\"/>"
        ),
        other => panic!("unknown order {other}"),
    };
    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" \
         viewBox=\"0 0 400 400\"><rect width=\"400\" height=\"400\" fill=\"#ffffff\"/>{body}</svg>"
    )
}

/// Darkened pixels in a band strictly below the clip box, where only the
/// shadow can reach. The shadow composites over the opaque white background,
/// so it shows as a darker colour at full alpha, not as transparency.
fn ink_below_shadow_band(pixmap: &tiny_skia::Pixmap) -> u64 {
    let mut ink = 0u64;
    for y in 226..400 {
        for x in 0..400 {
            let pixel = pixmap.pixel(x, y).expect("pixel in range");
            if pixel.red() < 255 || pixel.green() < 255 || pixel.blue() < 255 {
                ink += 1;
            }
        }
    }
    ink
}

#[test]
fn the_wrapper_order_lets_the_shadow_follow_the_clipped_silhouette() {
    let fonts = fonts();
    let wrapper = svg_to_pixmap(&svg("wrapper"), &fonts, 1.0).unwrap();
    let attribute = svg_to_pixmap(&svg("attribute"), &fonts, 1.0).unwrap();

    let wrapper_ink = ink_below_shadow_band(&wrapper);
    let attribute_ink = ink_below_shadow_band(&attribute);

    // Keep the measurement visible in the research note's terms.
    println!("wrapper order, shadow-band ink: {wrapper_ink}");
    println!("attribute order, shadow-band ink: {attribute_ink}");

    assert!(
        wrapper_ink > 2_000,
        "the shadow must survive outside the clip in the wrapper order"
    );
    assert_eq!(
        attribute_ink, 0,
        "SVG applies clip-path after filter, so the attribute order cuts the shadow off"
    );

    // Proof PNGs for the spike's research note, written when asked for.
    if std::env::var_os("UPDATE_GATE").is_some() {
        let out = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/gate");
        std::fs::create_dir_all(&out).unwrap();
        for (name, pixmap) in [
            ("clip-spike-wrapper", &wrapper),
            ("clip-spike-attribute", &attribute),
        ] {
            pixmap.save_png(out.join(format!("{name}.png"))).unwrap();
        }
    }

    // And the render is stable: the same SVG renders the same bytes twice.
    let again = svg_to_pixmap(&svg("wrapper"), &fonts, 1.0).unwrap();
    assert_eq!(wrapper.data(), again.data(), "render is deterministic");
}

/// Which coordinate space a `clip-path` is measured in.
///
/// The clip geometry is written once, in the layer's parent space. If a
/// rotation sits between the referencing element and the parent, the clip is
/// either turned with the content (the referencing element's own user space)
/// or stays put (the parent's space). The content here is a square rotated
/// 45°, which reaches outside the clip box; the box is only respected when
/// the clip is measured in the parent's space.
fn rotated_clip_svg(placement: &str) -> String {
    let clip = "<defs><clipPath id=\"clip\"><rect x=\"100\" y=\"100\" width=\"120\" height=\"120\"/></clipPath></defs>";
    let square = "<rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" fill=\"#3366aa\"/>";
    let body = match placement {
        // Clip on the inner group, rotation on the outer group.
        "clip_inside_rotation" => format!(
            "{clip}<g transform=\"rotate(45 160 160)\"><g clip-path=\"url(#clip)\">{square}</g></g>"
        ),
        // Rotation on the inner group, clip on the outer group.
        "clip_outside_rotation" => format!(
            "{clip}<g clip-path=\"url(#clip)\"><g transform=\"rotate(45 160 160)\">{square}</g></g>"
        ),
        // Clip and rotation on the same element.
        "clip_and_rotation_together" => format!(
            "{clip}<rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" fill=\"#3366aa\" \
             transform=\"rotate(45 160 160)\" clip-path=\"url(#clip)\"/>"
        ),
        other => panic!("unknown placement {other}"),
    };
    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"320\" \
         viewBox=\"0 0 320 320\"><rect width=\"320\" height=\"320\" fill=\"#ffffff\"/>{body}</svg>"
    )
}

/// Darkened pixels outside the clip box, where a clip that turned with the
/// content would leave the rotated square's corners visible.
fn ink_outside_clip_box(pixmap: &tiny_skia::Pixmap) -> u64 {
    let mut ink = 0u64;
    for y in 0..320 {
        for x in 0..320 {
            let outside = !(100..220).contains(&x) || !(100..220).contains(&y);
            if !outside {
                continue;
            }
            let pixel = pixmap.pixel(x, y).expect("pixel in range");
            if pixel.red() < 255 || pixel.green() < 255 || pixel.blue() < 255 {
                ink += 1;
            }
        }
    }
    ink
}

/// The colour that means "the square itself", rather than its shadow. The
/// square is blue; a shadow of it is grey at every channel.
fn is_content_blue(pixel: tiny_skia::PremultipliedColorU8) -> bool {
    i32::from(pixel.blue()) - i32::from(pixel.red()) > 20 && pixel.blue() > 60
}

/// Content pixels outside the clip box. A shadow may fall outside the box —
/// that is the point of it — so a shadow must not count as content here.
fn content_outside_clip_box(pixmap: &tiny_skia::Pixmap) -> u64 {
    let mut ink = 0u64;
    for y in 0..320 {
        for x in 0..320 {
            let outside = !(100..220).contains(&x) || !(100..220).contains(&y);
            if !outside {
                continue;
            }
            if is_content_blue(pixmap.pixel(x, y).expect("pixel in range")) {
                ink += 1;
            }
        }
    }
    ink
}

#[test]
fn a_clip_stays_in_the_parent_space_when_a_rotation_is_between_them() {
    let fonts = fonts();
    let mut measured = Vec::new();
    for placement in [
        "clip_inside_rotation",
        "clip_outside_rotation",
        "clip_and_rotation_together",
    ] {
        let pixmap = svg_to_pixmap(&rotated_clip_svg(placement), &fonts, 1.0).unwrap();
        let ink = ink_outside_clip_box(&pixmap);
        println!("{placement}: ink outside the clip box = {ink}");
        measured.push((placement, ink, pixmap));
    }

    // The clip is measured in the referencing element's own user space: with a
    // rotation above it, it turns with the content. Only a clip outside the
    // rotation stays in the layer's parent space.
    assert!(measured[0].1 > 0, "clip inside rotation turns with it");
    assert_eq!(
        measured[1].1, 0,
        "a clip outside the rotation stays in parent space"
    );
    assert!(
        measured[2].1 > 0,
        "an element's own transform turns its own clip too"
    );
}

/// The chosen emission for a rotated, clipped, shadowed layer: the rotation
/// and the filter on an outer group, the clip on an inner group, and the
/// content at rest inside. The `clipPath` shape carries the inverse rotation
/// so the box stays in the layer's parent space.
fn compensated_rotated_clip_svg() -> String {
    "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"400\" \
     viewBox=\"0 0 400 400\"><rect width=\"400\" height=\"400\" fill=\"#ffffff\"/>\
     <defs>\
     <clipPath id=\"clip\">\
     <rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" \
     transform=\"translate(160 160) rotate(-45) translate(-160 -160)\"/></clipPath>\
     <filter id=\"fx\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">\
     <feDropShadow dx=\"0\" dy=\"24\" stdDeviation=\"6\" flood-color=\"#000000\" flood-opacity=\"0.9\"/>\
     </filter></defs>\
     <g transform=\"rotate(45 160 160)\" filter=\"url(#fx)\">\
     <g clip-path=\"url(#clip)\">\
     <rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" fill=\"#3366aa\"/></g></g></svg>"
        .to_owned()
}

#[test]
fn the_compensated_emission_clips_in_parent_space_and_keeps_the_shadow() {
    let fonts = fonts();
    let pixmap = svg_to_pixmap(&compensated_rotated_clip_svg(), &fonts, 1.0).unwrap();

    // The clip box is the layer's box in parent space: the rotated square is
    // cut to it, so no *content* falls outside. Its shadow does, by design.
    assert_eq!(
        content_outside_clip_box(&pixmap),
        0,
        "the compensated clip must stay in the parent space"
    );
    // And the shadow of the clipped silhouette survives below the box.
    let shadow = ink_below_shadow_band(&pixmap);
    println!("compensated emission, shadow-band ink: {shadow}");
    if std::env::var_os("UPDATE_GATE").is_some() {
        let out = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/gate");
        std::fs::create_dir_all(&out).unwrap();
        pixmap
            .save_png(out.join("clip-spike-compensated.png"))
            .unwrap();
    }
    assert!(
        shadow > 100,
        "the shadow must follow the clipped silhouette, got {shadow}"
    );
}

/// Three ways a rotated, clipped layer could be emitted, measured against
/// each other before one is chosen.
///
/// * `shape_transform` — the clip shape carries the inverse rotation, so the
///   box would stay axis-aligned in the parent space.
/// * `clippath_transform` — the `clipPath` element carries it.
/// * `rotates_with_layer` — no compensation: the mask turns with the layer,
///   which is what a mask does in every editor that has frames.
fn rotated_clip_variant(variant: &str) -> String {
    let (defs, wrapper) = match variant {
        "shape_transform" => (
            "<clipPath id=\"clip\"><rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" \
             transform=\"translate(160 160) rotate(-45) translate(-160 -160)\"/></clipPath>",
            "<g transform=\"rotate(45 160 160)\"><g clip-path=\"url(#clip)\">{content}</g></g>",
        ),
        "clippath_transform" => (
            "<clipPath id=\"clip\" \
             transform=\"translate(160 160) rotate(-45) translate(-160 -160)\">\
             <rect x=\"100\" y=\"100\" width=\"120\" height=\"120\"/></clipPath>",
            "<g transform=\"rotate(45 160 160)\"><g clip-path=\"url(#clip)\">{content}</g></g>",
        ),
        "rotates_with_layer" => (
            "<clipPath id=\"clip\"><rect x=\"100\" y=\"100\" width=\"120\" height=\"120\"/></clipPath>",
            "<g transform=\"rotate(45 160 160)\"><g clip-path=\"url(#clip)\">{content}</g></g>",
        ),
        other => panic!("unknown variant {other}"),
    };
    let content = "<rect x=\"100\" y=\"100\" width=\"120\" height=\"120\" fill=\"#3366aa\"/>";
    let body = wrapper.replace("{content}", content);
    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"320\" \
         viewBox=\"0 0 320 320\"><rect width=\"320\" height=\"320\" fill=\"#ffffff\"/>\
         <defs>{defs}</defs>{body}</svg>"
    )
}

#[test]
fn the_clip_path_transform_variants_are_measured() {
    let fonts = fonts();
    for variant in [
        "shape_transform",
        "clippath_transform",
        "rotates_with_layer",
    ] {
        let pixmap = svg_to_pixmap(&rotated_clip_variant(variant), &fonts, 1.0).unwrap();
        // Ink inside the box tells us whether anything was drawn at all.
        let mut inside = 0u64;
        for y in 100..220 {
            for x in 100..220 {
                let pixel = pixmap.pixel(x, y).expect("pixel in range");
                if pixel.blue() > 100 && pixel.red() < 200 {
                    inside += 1;
                }
            }
        }
        println!(
            "{variant}: ink inside box = {inside}, ink outside box = {}",
            ink_outside_clip_box(&pixmap)
        );
    }
}

/// Whether a nested `<svg viewBox>` places a source sub-rectangle into a box
/// the way a crop needs: the viewBox is the crop, the box is the viewport,
/// and `preserveAspectRatio` is the fit.
#[test]
fn a_nested_svg_view_box_places_a_crop_rectangle() {
    let fonts = fonts();
    // Source space is a 5×10 rectangle. The viewport is the 120×120 box at
    // (100,100). With `none`, the viewBox maps straight onto it, so a marker
    // covering the whole viewBox must cover the whole viewport and nothing
    // outside it.
    let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"320\" \
               viewBox=\"0 0 320 320\"><rect width=\"320\" height=\"320\" fill=\"#ffffff\"/>\
               <svg x=\"100\" y=\"100\" width=\"120\" height=\"120\" viewBox=\"0 0 5 10\" \
               preserveAspectRatio=\"none\">\
               <rect x=\"0\" y=\"0\" width=\"5\" height=\"10\" fill=\"#3366aa\"/></svg></svg>";
    let pixmap = svg_to_pixmap(svg, &fonts, 1.0).unwrap();

    let mut blue_inside = 0u64;
    let mut blue_outside = 0u64;
    for y in 0..320 {
        for x in 0..320 {
            let blue = is_content_blue(pixmap.pixel(x, y).expect("pixel in range"));
            let inside = (100..220).contains(&x) && (100..220).contains(&y);
            match (blue, inside) {
                (true, true) => blue_inside += 1,
                (true, false) => blue_outside += 1,
                _ => {}
            }
        }
    }
    println!("nested viewBox: blue inside = {blue_inside}, outside = {blue_outside}");
    assert_eq!(blue_inside, 120 * 120, "the crop fills the box exactly");
    assert_eq!(blue_outside, 0, "nothing spills outside the viewport");
}

/// The same mechanism with `meet` instead of `none`: a 5×10 viewBox in a
/// 120×120 viewport must letterbox to 60×120, centred.
#[test]
fn a_nested_svg_view_box_honours_preserve_aspect_ratio() {
    let fonts = fonts();
    let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"320\" \
               viewBox=\"0 0 320 320\"><rect width=\"320\" height=\"320\" fill=\"#ffffff\"/>\
               <svg x=\"100\" y=\"100\" width=\"120\" height=\"120\" viewBox=\"0 0 5 10\" \
               preserveAspectRatio=\"xMidYMid meet\">\
               <rect x=\"0\" y=\"0\" width=\"5\" height=\"10\" fill=\"#3366aa\"/></svg></svg>";
    let pixmap = svg_to_pixmap(svg, &fonts, 1.0).unwrap();

    let mut columns = Vec::new();
    for x in 0..320 {
        for y in 0..320 {
            if is_content_blue(pixmap.pixel(x, y).expect("pixel in range")) {
                columns.push(x);
                break;
            }
        }
    }
    println!(
        "meet: inked columns = {:?}..{:?} ({})",
        columns.first(),
        columns.last(),
        columns.len()
    );
    assert_eq!(columns.len(), 60, "a 1:2 viewBox letterboxes to 60 wide");
}
