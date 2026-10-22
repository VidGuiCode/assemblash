//! Preserve text metric bounds for relative filters after outline conversion.
//!
//! A private SVG copy supplies metric rectangles to the pinned bounds engine.
//! These rectangles and owner IDs never enter the exported SVG.

use std::{
    collections::BTreeSet,
    ops::Range,
    sync::{Arc, Mutex},
};

use assemblash_core::{Document, Layer, LayerKind, TextLayer};
use resvg::{tiny_skia::NonZeroRect, usvg};

use super::{attribute, decode_base64, filter_id, percent_decode, shadow_region, AssetHrefs};
use crate::{FontSet, RenderError, TextLayerLayout};

#[derive(Default)]
pub(super) struct BoundsPass {
    proxies: Vec<(Range<usize>, String)>,
    painted: BTreeSet<assemblash_core::LayerId>,
}

fn error(layer: &Layer, reason: impl Into<String>) -> RenderError {
    RenderError::TextFilterBounds {
        layer: layer.id.clone(),
        reason: reason.into(),
    }
}

fn affected(layer: &Layer, painted: &BTreeSet<assemblash_core::LayerId>) -> bool {
    layer.visible
        && match &layer.kind {
            LayerKind::Text(_) => painted.contains(&layer.id),
            LayerKind::Group(group) => group.children.iter().any(|child| affected(child, painted)),
            _ => false,
        }
}

fn owners<'a>(
    layer: &'a Layer,
    painted: &BTreeSet<assemblash_core::LayerId>,
    found: &mut Vec<&'a Layer>,
) {
    if !layer.visible {
        return;
    }
    if !layer.effects.is_empty() && shadow_region(layer).is_none() && affected(layer, painted) {
        found.push(layer);
    }
    if let LayerKind::Group(group) = &layer.kind {
        for child in &group.children {
            owners(child, painted, found);
        }
    }
}

// Only resources in affected filter subtrees are required by the private pass.
fn resources(
    layer: &Layer,
    owner: &Layer,
    fonts: &FontSet,
    assets: &AssetHrefs,
    hashes: &mut BTreeSet<String>,
) -> Result<(), RenderError> {
    if !layer.visible {
        return Ok(());
    }
    match &layer.kind {
        LayerKind::Text(text) if text.runs.is_empty() && !text.text.trim().is_empty() => {
            if fonts
                .face_data(&text.font_family, text.font_weight, text.font_style)
                .is_none()
            {
                return Err(error(
                    owner,
                    format!(
                        "layer {} requires loaded font bytes for {:?}",
                        layer.id, text.font_family
                    ),
                ));
            }
        }
        LayerKind::Group(group) => {
            for child in &group.children {
                resources(child, owner, fonts, assets, hashes)?;
            }
        }
        LayerKind::Image(image) if layer.transform.width > 0.0 && layer.transform.height > 0.0 => {
            resource(&image.asset, owner, assets, hashes)?
        }
        LayerKind::Svg(svg) if layer.transform.width > 0.0 && layer.transform.height > 0.0 => {
            resource(&svg.asset, owner, assets, hashes)?
        }
        _ => {}
    }
    Ok(())
}

fn resource(
    id: &assemblash_core::AssetId,
    owner: &Layer,
    assets: &AssetHrefs,
    hashes: &mut BTreeSet<String>,
) -> Result<(), RenderError> {
    let href = assets
        .get(id)
        .ok_or_else(|| error(owner, format!("asset {id} is unavailable")))?;
    let (meta, payload) = href
        .split_once(',')
        .filter(|(meta, _)| meta.starts_with("data:"))
        .ok_or_else(|| {
            error(
                owner,
                format!("asset {id} requires in-memory data for filter measurement"),
            )
        })?;
    let bytes = if meta.to_ascii_lowercase().ends_with(";base64") {
        decode_base64(payload)
            .ok_or_else(|| error(owner, format!("asset {id} has invalid data")))?
    } else {
        percent_decode(payload)
    };
    hashes.insert(assemblash_core::storage::hash_bytes(&bytes));
    Ok(())
}

fn group<'a>(root: &'a usvg::Group, id: &str) -> Option<&'a usvg::Group> {
    if root.id() == id {
        return Some(root);
    }
    root.children().iter().find_map(|node| match node {
        usvg::Node::Group(child) => group(child, id),
        _ => None,
    })
}

fn image_hashes(root: &usvg::Group, seen: &mut BTreeSet<String>) {
    for node in root.children() {
        match node {
            usvg::Node::Group(child) => image_hashes(child, seen),
            usvg::Node::Image(image) => match image.kind() {
                usvg::ImageKind::JPEG(data)
                | usvg::ImageKind::PNG(data)
                | usvg::ImageKind::GIF(data)
                | usvg::ImageKind::WEBP(data) => {
                    seen.insert(assemblash_core::storage::hash_bytes(data));
                }
                usvg::ImageKind::SVG(tree) => image_hashes(tree.root(), seen),
            },
            _ => {}
        }
    }
}

impl BoundsPass {
    pub(super) fn styled_content(
        &mut self,
        range: Range<usize>,
        layout: &TextLayerLayout,
        text: &TextLayer,
        layer: &Layer,
    ) {
        // Upstream drops text without a visible contour. Do not give spaces or
        // no-fill/no-stroke text a new object bounding box.
        let painted = layout.glyphs().iter().any(|glyph| {
            glyph.outline().is_some() && (glyph.paint.is_some() || text.stroke.is_some())
        });
        let proxy = if painted {
            self.painted.insert(layer.id.clone());
            layout
                .emission
                .metric_bounds
                .map(|r| {
                    format!(
                        "<rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"/>",
                        r.x(),
                        r.y(),
                        r.width(),
                        r.height()
                    )
                })
                .unwrap_or_default()
        } else {
            String::new()
        };
        self.proxies.push((range, proxy));
    }

    pub(super) fn resolve(
        self,
        mut actual: String,
        document: &Document,
        fonts: &FontSet,
        assets: &AssetHrefs,
    ) -> Result<String, RenderError> {
        if self.proxies.is_empty() {
            return Ok(actual);
        }
        let mut owners_found = Vec::new();
        for layer in &document.layers {
            owners(layer, &self.painted, &mut owners_found);
        }
        if owners_found.is_empty() {
            return Ok(actual);
        }

        let mut private = actual.clone();
        for (range, proxy) in self.proxies.into_iter().rev() {
            private.replace_range(range, &proxy);
        }
        let mut needed = Vec::new();
        for owner in &owners_found {
            let mut hashes = BTreeSet::new();
            resources(owner, owner, fonts, assets, &mut hashes)?;
            needed.push(hashes);
        }
        // Remove every filter before parsing. Its provisional region must not
        // prune an owner or change its bounds. Keep transforms and clips.
        document.walk_layers(&mut |layer| {
            let attr = format!(" filter=\"url(#{})\"", filter_id(layer));
            let replacement = if owners_found.iter().any(|owner| owner.id == layer.id) {
                format!(" id=\"bounds-{}\"", filter_id(layer))
            } else {
                String::new()
            };
            private = private.replace(&attr, &replacement);
        });

        let svg_data = Arc::new(Mutex::new(BTreeSet::new()));
        let resolved_svg = svg_data.clone();
        let data_resolver = usvg::ImageHrefResolver::default_data_resolver();
        let options = usvg::Options {
            // Preserve the rasterizer's complete inventory, order and face IDs.
            fontdb: fonts
                .loaded_database()
                .ok_or_else(|| error(owners_found[0], "loaded font database is unavailable"))?,
            image_href_resolver: usvg::ImageHrefResolver {
                resolve_string: Box::new(|_, _| None),
                resolve_data: Box::new(move |mime, data, options| {
                    let result = data_resolver(mime, data.clone(), options);
                    if matches!(result, Some(usvg::ImageKind::SVG(_))) {
                        if let Ok(mut resolved) = resolved_svg.lock() {
                            resolved.insert(assemblash_core::storage::hash_bytes(&data));
                        }
                    }
                    result
                }),
            },
            ..usvg::Options::default()
        };
        let tree = usvg::Tree::from_str(&private, &options)
            .map_err(|source| error(owners_found[0], format!("private SVG bounds: {source}")))?;
        let mut seen = svg_data
            .lock()
            .map_err(|_| error(owners_found[0], "resource measurement failed"))?
            .clone();
        image_hashes(tree.root(), &mut seen);
        for (owner, required) in owners_found.into_iter().zip(needed) {
            let Some(owner_group) = group(tree.root(), &format!("bounds-{}", filter_id(owner)))
            else {
                // An empty or pruned subtree has no object bounds.
                continue;
            };
            if !required.is_subset(&seen) {
                return Err(error(
                    owner,
                    "an in-memory image cannot provide filter bounds",
                ));
            }
            let Some(bounds) = owner_group.bounding_box().to_non_zero_rect() else {
                continue;
            };
            // Keep the existing -50% / 200% f32 arithmetic. Check overflow
            // before construction instead of calling bbox_transform's unwrap.
            let region = NonZeroRect::from_xywh(
                -0.5 * bounds.width() + bounds.x(),
                -0.5 * bounds.height() + bounds.y(),
                2.0 * bounds.width(),
                2.0 * bounds.height(),
            )
            .ok_or_else(|| error(owner, "filter region exceeds finite render coordinates"))?;
            let old = format!(
                "<filter id=\"{}\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"",
                filter_id(owner)
            );
            let new = format!("<filter id=\"{}\" filterUnits=\"userSpaceOnUse\" x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"",
                attribute(&filter_id(owner)), region.x(), region.y(), region.width(), region.height());
            actual = actual.replace(&old, &new);
        }
        Ok(actual)
    }
}
