//! Rendering a project: assets, fonts, and the two output forms.
//!
//! One place, because both transports need exactly this and had each grown
//! their own copy of "resolve the assets, resolve the fonts, rasterize". That
//! is the same duplication the one-operation-layer rule forbids, one level
//! down: two copies is two chances for a preview and an export to disagree.
//!
//! Fonts are resolved from the store by the families the document actually
//! names — never everything installed — so adding an unrelated font cannot
//! change what an existing document renders as. A family the store does not
//! have is a structured error, never a substitution.

use std::path::{Path, PathBuf};

use assemblash_core::{Document, LayerKind};
use assemblash_renderer::raster::PngMetadata;
use assemblash_renderer::{doc_to_svg, document_to_png, FontStore, LoadedFonts};

use crate::error::ApiError;

/// Directory a project's exports go into.
///
/// Chosen here rather than by a caller: an export path a client could name
/// would be unrestricted filesystem access wearing a friendly name (PRD
/// §10.1, FR-13).
pub const EXPORTS_DIR: &str = "exports";

/// A rendered image and the size it came out at.
#[derive(Debug, Clone)]
pub struct Rendered {
    /// The bytes — PNG or SVG, depending on which function produced them.
    pub bytes: Vec<u8>,
    /// Pixel width.
    pub width: u32,
    /// Pixel height.
    pub height: u32,
}

/// Where a document was exported to.
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Exported {
    /// Path inside the project, `/`-separated.
    pub path: String,
    /// Bytes written.
    pub bytes: usize,
    /// Pixel width.
    pub width: u32,
    /// Pixel height.
    pub height: u32,
}

/// Every font family the document asks for, sorted and deduplicated.
pub fn families_used(document: &Document) -> Vec<String> {
    let mut families = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        if let LayerKind::Text(text) = &layer.kind {
            families.insert(text.font_family.clone());
        }
    });
    families.into_iter().collect()
}

/// Loads exactly the fonts a document needs.
pub fn fonts_for(document: &Document, store: &FontStore) -> Result<LoadedFonts, ApiError> {
    let families = families_used(document);
    if families.is_empty() {
        return Ok(LoadedFonts::from_bytes([]));
    }
    Ok(store.load_families(&families)?)
}

/// Renders a document to SVG.
///
/// The same function the PNG path runs through, one step earlier — which is
/// what makes the reference UI's preview pixel-true to the export rather than
/// merely similar to it (PRD §16.3).
pub fn svg_for(
    document: &Document,
    project_dir: &Path,
    store: &FontStore,
) -> Result<Rendered, ApiError> {
    let hrefs = assemblash_renderer::data_uris(document, project_dir)?;
    let fonts = fonts_for(document, store)?;
    let svg = doc_to_svg(document, fonts.font_set(), &hrefs)?;
    Ok(Rendered {
        bytes: svg.into_bytes(),
        width: document.canvas.width.round() as u32,
        height: document.canvas.height.round() as u32,
    })
}

/// Renders a document to PNG.
pub fn png_for(
    document: &Document,
    project_dir: &Path,
    store: &FontStore,
    scale: f32,
) -> Result<Rendered, ApiError> {
    let hrefs = assemblash_renderer::data_uris(document, project_dir)?;
    let fonts = fonts_for(document, store)?;
    let png = document_to_png(
        document,
        &fonts,
        &hrefs,
        scale,
        // No timestamp: two renders of an unchanged document are identical,
        // which is what makes a client's cache — and a byte comparison —
        // trustworthy.
        &PngMetadata::for_document(document),
    )?;
    Ok(Rendered {
        bytes: png,
        width: (f64::from(scale) * document.canvas.width).round() as u32,
        height: (f64::from(scale) * document.canvas.height).round() as u32,
    })
}

/// Renders a PNG into the project's own `exports/` directory.
pub fn export_into_project(
    document: &Document,
    project_dir: &Path,
    store: &FontStore,
    scale: f32,
    name: Option<&str>,
) -> Result<Exported, ApiError> {
    let stem = match name {
        Some(name) => safe_stem(name)?,
        None => "export".to_owned(),
    };
    let rendered = png_for(document, project_dir, store, scale)?;

    let directory = project_dir.join(EXPORTS_DIR);
    std::fs::create_dir_all(&directory).map_err(|source| io(&directory, "creating", source))?;
    let file = format!("{stem}.png");
    let path = directory.join(&file);
    std::fs::write(&path, &rendered.bytes).map_err(|source| io(&path, "writing", source))?;

    Ok(Exported {
        path: format!("{EXPORTS_DIR}/{file}"),
        bytes: rendered.bytes.len(),
        width: rendered.width,
        height: rendered.height,
    })
}

fn io(path: &Path, operation: &'static str, source: std::io::Error) -> ApiError {
    ApiError::from(assemblash_core::storage::StorageError::Io {
        operation,
        path: PathBuf::from(path),
        source,
    })
}

/// A file stem a caller may choose, with anything path-shaped refused.
pub fn safe_stem(name: &str) -> Result<String, ApiError> {
    let trimmed = name.trim();
    let usable = !trimmed.is_empty()
        && trimmed.len() <= 60
        && !trimmed.starts_with('.')
        && trimmed
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'));
    if usable {
        Ok(trimmed.to_owned())
    } else {
        Err(ApiError::new(
            axum::http::StatusCode::BAD_REQUEST,
            "invalidExportName",
            format!(
                "{name:?} is not a usable export name: letters, digits, hyphens, \
                 and underscores only"
            ),
        ))
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn an_export_name_is_a_name_and_never_a_path() {
        for good in ["poster", "poster-2", "final_v3", "A1"] {
            assert!(safe_stem(good).is_ok(), "{good}");
        }
        for bad in [
            "",
            "..",
            ".hidden",
            "a/b",
            "a\\b",
            "../../evil",
            "C:evil",
            "with space",
            "nul\0",
        ] {
            assert!(safe_stem(bad).is_err(), "{bad:?} should have been refused");
        }
    }
}
