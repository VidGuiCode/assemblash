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

use assemblash_core::session::SessionError;
use assemblash_core::{Document, LayerKind};
use assemblash_renderer::raster::PngMetadata;
use assemblash_renderer::{doc_to_svg, document_to_png, ExportWarning, FontStore, LoadedFonts};

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
    /// What the export noticed and did not refuse (FR-11).
    ///
    /// Always present, empty when there is nothing to say, so a client can
    /// read it without checking whether the field exists. A warning never
    /// changes a pixel and never changes the outcome: the file above was
    /// written either way.
    pub warnings: Vec<ExportWarning>,
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

/// How many projects the href cache keeps at once.
///
/// A workspace edited by one person touches one project at a time; sixteen
/// covers a page with several projects open without growing without bound.
const HREF_CACHE_PROJECTS: usize = 16;

/// What one asset file looked like when its data URI was built.
///
/// A data URI is a pure function of the file's bytes. Reading the bytes to
/// compare them would defeat the cache, so the entry is keyed by what a stat
/// can tell about them: the path, the length, and the mtime. A file replaced
/// between two renders changes at least one of the three.
#[derive(Clone, PartialEq)]
struct AssetIdentity {
    file: PathBuf,
    len: u64,
    modified: Option<std::time::SystemTime>,
}

/// One project's built hrefs, with the asset identities they were built from.
struct HrefCacheEntry {
    fingerprint: Vec<AssetIdentity>,
    hrefs: std::sync::Arc<assemblash_renderer::AssetHrefs>,
}

/// A bounded cache of asset data-URI strings, one entry per project.
///
/// Every render reads every referenced asset file and encodes it as base64
/// into the SVG text. One committed edit asks for three renders, so a poster
/// with one large background was read and encoded three times per edit. The
/// strings only change when an asset file does, so a project whose assets are
/// unchanged reuses them, and the three renders of one version share one
/// build: the miss is built while holding the lock, so concurrent renders
/// wait for the first instead of each rebuilding.
///
/// A hit returns exactly the string `data_uris` would have built — the render
/// is byte-identical whether it came from the cache or not.
#[derive(Default)]
pub(crate) struct HrefCache {
    entries: std::sync::Mutex<std::collections::HashMap<PathBuf, HrefCacheEntry>>,
}

impl HrefCache {
    /// The hrefs a render needs, rebuilt only when an asset file changed.
    ///
    /// Storage failures are the caller's shape: an unreadable asset refuses
    /// the render, exactly as an uncached build would.
    pub(crate) fn get(
        &self,
        document: &Document,
        project_dir: &Path,
    ) -> Result<
        std::sync::Arc<assemblash_renderer::AssetHrefs>,
        assemblash_core::storage::StorageError,
    > {
        let mut fingerprint = Vec::with_capacity(document.assets.len());
        for asset in &document.assets {
            let file = assemblash_core::storage::asset_path(project_dir, asset);
            let metadata = std::fs::metadata(&file).map_err(|source| {
                assemblash_core::storage::StorageError::Io {
                    operation: "reading",
                    path: file.clone(),
                    source,
                }
            })?;
            fingerprint.push(AssetIdentity {
                file,
                len: metadata.len(),
                modified: metadata.modified().ok(),
            });
        }

        // The cache holds only pure strings, so a lock poisoned by a panic
        // elsewhere is safe to recover: the worst an interrupted build can
        // leave behind is an entry that misses again.
        let mut entries = self
            .entries
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        if let Some(entry) = entries.get(project_dir) {
            if entry.fingerprint == fingerprint {
                return Ok(std::sync::Arc::clone(&entry.hrefs));
            }
        }

        // Built under the lock on purpose: three renders of one version then
        // read and encode the assets once, not three times.
        let hrefs = std::sync::Arc::new(assemblash_renderer::data_uris(document, project_dir)?);
        if !entries.contains_key(project_dir) && entries.len() >= HREF_CACHE_PROJECTS {
            // Bounded, eviction arbitrary: a workspace edit is a small
            // working set, and no entry is ever wrong, only absent.
            if let Some(oldest) = entries.keys().next().cloned() {
                entries.remove(&oldest);
            }
        }
        entries.insert(
            project_dir.to_path_buf(),
            HrefCacheEntry {
                fingerprint,
                hrefs: std::sync::Arc::clone(&hrefs),
            },
        );
        Ok(hrefs)
    }
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
    let fonts = fonts_for(document, store)?;
    let hrefs = assemblash_renderer::data_uris(document, project_dir)?;
    svg_for_loaded(document, &fonts, &hrefs)
}

/// Renders a document to SVG with an already loaded deterministic font set.
pub fn svg_for_loaded(
    document: &Document,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
) -> Result<Rendered, ApiError> {
    let svg = doc_to_svg(document, fonts.font_set(), hrefs)?;
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
    let fonts = fonts_for(document, store)?;
    let hrefs = assemblash_renderer::data_uris(document, project_dir)?;
    png_for_loaded(document, &fonts, &hrefs, scale)
}

/// Renders a document to PNG with an already loaded deterministic font set.
pub fn png_for_loaded(
    document: &Document,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
) -> Result<Rendered, ApiError> {
    let png = document_to_png(
        document,
        fonts,
        hrefs,
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
    let fonts = fonts_for(document, store)?;
    let hrefs = assemblash_renderer::data_uris(document, project_dir)?;
    export_into_project_loaded(document, project_dir, &fonts, &hrefs, scale, name)
}

/// Renders a PNG export with an already loaded deterministic font set.
pub fn export_into_project_loaded(
    document: &Document,
    project_dir: &Path,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
    name: Option<&str>,
) -> Result<Exported, ApiError> {
    let stem = match name {
        Some(name) => safe_stem(name)?,
        None => "export".to_owned(),
    };
    let rendered = png_for_loaded(document, fonts, hrefs, scale)?;

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
        // Measured after the file is written, on purpose: an export that has
        // something to say is still an export that happened.
        warnings: assemblash_renderer::export_warnings(document, fonts.font_set(), project_dir),
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

/// One variant to render: a name and the values that make it.
#[derive(Debug, Clone, serde::Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct Variant {
    /// File stem for this variant's export. Letters, digits, hyphens, and
    /// underscores; the directory is not the caller's to choose.
    pub name: String,
    /// Slot name to value.
    #[serde(default)]
    pub values: assemblash_core::SlotValues,
}

/// What one rendered variant is, and what made it.
#[derive(Debug, Clone, serde::Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenderedVariant {
    /// The variant's name.
    pub name: String,
    /// Path inside the project, `/`-separated.
    pub path: String,
    /// Bytes written.
    pub bytes: usize,
    /// Pixel width.
    pub width: u32,
    /// Pixel height.
    pub height: u32,
    /// Content hash of the PNG, `sha256:<hex>`.
    ///
    /// Two runs of the same template with the same values produce the same
    /// hash — which is what makes a batch as checkable as a single render.
    pub hash: String,
}

/// A batch of variants, and what they came from.
#[derive(Debug, Clone, serde::Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenderedVariants {
    /// Document id of the template.
    pub template: String,
    /// Version of the template these were rendered from.
    pub template_version: u64,
    /// Every variant, in the order asked for.
    pub variants: Vec<RenderedVariant>,
}

/// Renders a template once per set of slot values.
///
/// The template is **not modified**. Each variant is filled on a copy, so a
/// batch of fifty leaves the project exactly as it found it — and so a variant
/// that is refused stops only itself.
///
/// Filling goes through the operation layer, which is the whole safety story:
/// a slot pointing at a protected layer is refused there, by the same check
/// that refuses every other route to it. Templates are not a way around
/// protection; they are a way to offer exactly what was meant to be offered.
pub fn render_variants(
    template: &Document,
    project_dir: &Path,
    store: &FontStore,
    scale: f32,
    variants: &[Variant],
) -> Result<RenderedVariants, ApiError> {
    let fonts = fonts_for(template, store)?;
    render_variants_loaded(template, project_dir, &fonts, scale, variants)
}

/// Renders template variants with an already loaded deterministic font set.
pub fn render_variants_loaded(
    template: &Document,
    project_dir: &Path,
    fonts: &LoadedFonts,
    scale: f32,
    variants: &[Variant],
) -> Result<RenderedVariants, ApiError> {
    // Checked once, before anything renders: a broken template should be one
    // clear error rather than the same error N times.
    assemblash_core::templates::validate_slots(template).map_err(template_error)?;

    let directory = project_dir.join(EXPORTS_DIR);
    std::fs::create_dir_all(&directory).map_err(|source| io(&directory, "creating", source))?;

    // Filling edits layers, never assets, so every variant renders from the
    // template's own hrefs: read and encoded once for the whole batch.
    let hrefs = assemblash_renderer::data_uris(template, project_dir)?;

    let mut rendered = Vec::with_capacity(variants.len());
    for variant in variants {
        let stem = safe_stem(&variant.name)?;

        let mut filled = template.clone();
        let operations = assemblash_core::templates::fill_operations(template, &variant.values)
            .map_err(template_error)?;
        for operation in &operations {
            // The same entry point every transport uses. A protected layer
            // refuses here, and the copy is left untouched because applying is
            // transactional.
            assemblash_core::ops::apply(
                &mut filled,
                operation,
                &mut assemblash_core::ids::UlidIdSource,
            )
            .map_err(|source| ApiError::from(SessionError::from(source)))?;
        }

        let png = png_for_loaded(&filled, fonts, &hrefs, scale)?;
        let file = format!("{stem}.png");
        let path = directory.join(&file);
        std::fs::write(&path, &png.bytes).map_err(|source| io(&path, "writing", source))?;

        rendered.push(RenderedVariant {
            name: variant.name.clone(),
            path: format!("{EXPORTS_DIR}/{file}"),
            bytes: png.bytes.len(),
            width: png.width,
            height: png.height,
            hash: assemblash_core::storage::hash_bytes(&png.bytes),
        });
    }

    Ok(RenderedVariants {
        template: template.id.to_string(),
        template_version: template.version,
        variants: rendered,
    })
}

fn template_error(error: assemblash_core::TemplateError) -> ApiError {
    ApiError::new(
        axum::http::StatusCode::UNPROCESSABLE_ENTITY,
        "templateRefused",
        error.to_string(),
    )
}

/// This project's lock had been left behind by a process that died, and this
/// server cleared it (FR-11).
///
/// Not a fault in the document, unlike every other code in
/// [`assemblash_renderer::warnings`] — it says something happened to the
/// *project* that the person exporting would want to know: an earlier run of
/// this program did not shut down, and the work it had open was reopened
/// without anyone confirming it. The export itself is unaffected.
pub const LOCK_RECLAIMED: &str = "lockReclaimed";

/// Adds the reclaimed-lock notice to an export's warnings.
///
/// Separate from [`export_warnings`](assemblash_renderer::export_warnings)
/// because that function is given a document and a font set and nothing else —
/// it cannot know what the server did to open the project. This is the one
/// place the two channels meet, so both reach a client through the same
/// `warnings` array rather than one of them needing a field of its own.
pub fn note_lock_reclaimed(exported: &mut Exported, pid: u32, host: &str) {
    exported.warnings.push(ExportWarning {
        code: LOCK_RECLAIMED,
        message: format!(
            "the lock on this project was left behind by process {pid} on {host}, \
             which is no longer running; it was cleared and the project reopened"
        ),
        layer_id: None,
    });
}
