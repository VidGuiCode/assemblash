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
use assemblash_core::Document;
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
    /// The number of pages, for an export of a page set. Absent otherwise.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<usize>,
}

/// Every font family the document asks for, sorted and deduplicated.
/// Lenient discovery preserves base families and nonempty string run references.
/// Render consumers use strict typed requirements instead.
pub fn families_used(document: &Document) -> Vec<String> {
    let mut families = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        if let assemblash_core::LayerKind::Text(text) = &layer.kind {
            families.insert(text.font_family.clone());
            families.extend(
                text.runs
                    .iter()
                    .filter_map(|run| run.get("fontFamily").and_then(serde_json::Value::as_str))
                    .filter(|family| !family.trim().is_empty())
                    .map(str::to_owned),
            );
        }
    });
    families.into_iter().collect()
}

/// Loads exactly the fonts a document needs.
pub fn fonts_for(document: &Document, store: &FontStore) -> Result<LoadedFonts, ApiError> {
    let families = assemblash_renderer::text_font_families(document)?;
    if families.is_empty() {
        return Ok(LoadedFonts::from_bytes([]));
    }
    let fonts = store.load_available_families(&families)?;
    assemblash_renderer::check_text_fonts(document, fonts.font_set())?;
    Ok(fonts)
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
    export_into_project_as(
        document,
        project_dir,
        fonts,
        hrefs,
        scale,
        name,
        ExportSettings::default(),
    )
}

/// Renders an export in any format into the project's own `exports/`
/// directory.
///
/// With the default settings this is exactly the PNG export: the same bytes,
/// the same file name, and the same response.
pub fn export_into_project_as(
    document: &Document,
    project_dir: &Path,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
    name: Option<&str>,
    settings: ExportSettings,
) -> Result<Exported, ApiError> {
    let stem = export_stem(name)?;
    let rendered = encode_document(
        document,
        fonts,
        hrefs,
        scale,
        settings,
        // No timestamp: two renders of an unchanged document are identical.
        &PngMetadata::for_document(document),
    )?;
    let path = write_export(project_dir, &stem, settings.format(), &rendered.bytes)?;
    Ok(Exported {
        path,
        bytes: rendered.bytes.len(),
        width: rendered.width,
        height: rendered.height,
        // Measured after the file is written, on purpose: an export that has
        // something to say is still an export that happened.
        warnings: assemblash_renderer::export_warnings_at(
            document,
            fonts.font_set(),
            project_dir,
            settings.warning_scale(scale),
        ),
        pages: None,
    })
}

/// Renders the pages of a page set into the `exports/` directory of
/// `target_dir`, the project the request was sent to.
///
/// A PDF holds every page. Any other format holds one page, and the caller
/// checks with [`check_page_count`] that there is exactly one. `load` gives
/// the fonts and assets of one page; it runs on the thread that renders the
/// page (see [`render_page_sources`]).
pub fn export_pages_into_project<L>(
    target_dir: &Path,
    pages: &[PageSource],
    load: L,
    scale: f32,
    name: Option<&str>,
    settings: ExportSettings,
) -> Result<Exported, ApiError>
where
    L: Fn(&PageSource) -> Result<PageAssets, ApiError> + Sync,
{
    let stem = export_stem(name)?;
    let rendered = render_page_sources(pages, load, scale, settings)?;
    let path = write_export(
        target_dir,
        &stem,
        settings.format(),
        &rendered.rendered.bytes,
    )?;
    Ok(Exported {
        path,
        bytes: rendered.rendered.bytes.len(),
        width: rendered.rendered.width,
        height: rendered.rendered.height,
        warnings: rendered.warnings,
        pages: Some(pages.len()),
    })
}

/// The file stem of an export: the caller's name, checked, or `export`.
pub fn export_stem(name: Option<&str>) -> Result<String, ApiError> {
    match name {
        Some(name) => safe_stem(name),
        None => Ok("export".to_owned()),
    }
}

/// Writes export bytes to `exports/<stem>.<extension>` in a project, and
/// gives the `/`-separated path inside the project.
pub fn write_export(
    project_dir: &Path,
    stem: &str,
    format: ExportFormat,
    bytes: &[u8],
) -> Result<String, ApiError> {
    let directory = project_dir.join(EXPORTS_DIR);
    std::fs::create_dir_all(&directory).map_err(|source| io(&directory, "creating", source))?;
    let file = export_file_name(stem, format);
    let path = directory.join(&file);
    std::fs::write(&path, bytes).map_err(|source| io(&path, "writing", source))?;
    Ok(format!("{EXPORTS_DIR}/{file}"))
}

/// The file name of an export: `<stem>.<extension>`, `jpg` for JPEG.
pub fn export_file_name(stem: &str, format: ExportFormat) -> String {
    format!("{stem}.{}", format.extension())
}

pub use assemblash_export::{EncodeSettings, ExportFormat};

/// The code for `print` with a format other than PDF.
pub const PRINT_NEEDS_PDF: &str = "printNeedsPdf";
/// The code for a page selection that cannot be used.
pub const INVALID_PAGE_SELECTION: &str = "invalidPageSelection";
/// The code for more than one page with a format that holds one image.
pub const PAGES_NEED_PDF: &str = "pagesNeedPdf";
/// The code for a PDF export with more than [`MAX_PDF_PAGES`] pages.
pub const PDF_PAGE_LIMIT_EXCEEDED: &str = "pdfPageLimitExceeded";
/// The code for a PDF export with more than [`MAX_PDF_PIXELS`] output pixels.
pub const PDF_PIXEL_LIMIT_EXCEEDED: &str = "pdfPixelLimitExceeded";

/// The most pages one page-set or variants PDF holds.
///
/// A PDF page is a full raster image, so the page count sets the render time
/// and the file size. 200 pages is far above a usual deck or batch.
pub const MAX_PDF_PAGES: usize = 200;

/// The most output pixels one page-set or variants PDF renders, all pages
/// together: the sum of `round(width × scale) × round(height × scale)`.
///
/// 400 000 000 pixels is, for example, 200 pages of 1414 × 1414 pixels, or
/// 45 A4 pages at 300 dpi. The engine refuses a larger request before it
/// renders a page.
pub const MAX_PDF_PIXELS: u64 = 400_000_000;

/// The most threads that render PDF pages at one time, in the whole process.
///
/// One export uses at most this many threads, and two exports at the same
/// time share them. A page holds its full RGBA image while it renders, so
/// this also sets how many page images are in memory at one time.
pub const MAX_RENDER_THREADS: usize = 4;

/// How an export is encoded, after the request is checked.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ExportSettings {
    /// The format and its quality.
    pub encode: EncodeSettings,
    /// Print geometry: trim and bleed boxes and crop marks. PDF only.
    pub print: bool,
}

impl Default for ExportSettings {
    /// A PNG, which is what an export request without a format asks for.
    fn default() -> Self {
        Self {
            encode: EncodeSettings::Png,
            print: false,
        }
    }
}

impl ExportSettings {
    /// Checks the format fields of a request.
    ///
    /// Every refusal happens here, before anything is read or written:
    /// an unknown format, a quality the format cannot use, and `print` with
    /// a format other than PDF.
    pub fn from_request(
        format: Option<&str>,
        quality: Option<u32>,
        print: Option<bool>,
    ) -> Result<Self, ApiError> {
        let format = ExportFormat::from_request(format)?;
        let encode = assemblash_export::resolve_quality(format, quality)?;
        let print = print.unwrap_or(false);
        if print && format != ExportFormat::Pdf {
            return Err(ApiError::new(
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                PRINT_NEEDS_PDF,
                format!(
                    "print adds trim and bleed boxes and crop marks, which only a PDF has; \
                     use format pdf, or omit print for format {}",
                    format.as_str()
                ),
            )
            .with_details(serde_json::json!({ "format": format.as_str() })));
        }
        Ok(Self { encode, print })
    }

    /// The format of these settings.
    pub fn format(&self) -> ExportFormat {
        self.encode.format()
    }

    /// Whether these are the settings of a request without format fields.
    pub fn is_default(&self) -> bool {
        *self == Self::default()
    }

    /// The scale the warnings are measured at.
    ///
    /// SVG has no scale, so its warnings are measured at 1, as for `render`.
    pub fn warning_scale(&self, scale: f32) -> f32 {
        if self.format() == ExportFormat::Svg {
            1.0
        } else {
            scale
        }
    }
}

/// A rasterized canvas as straight-alpha RGBA: the pixels the PNG export
/// stores.
fn rgba_for(
    document: &Document,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
) -> Result<(u32, u32, Vec<u8>), ApiError> {
    let svg = doc_to_svg(document, fonts.font_set(), hrefs)?;
    let pixmap = assemblash_renderer::svg_to_pixmap(&svg, fonts, scale)?;
    Ok((
        pixmap.width(),
        pixmap.height(),
        assemblash_renderer::pixmap_to_rgba(&pixmap),
    ))
}

/// The print geometry of a document: its bleed, 1 canvas pixel to 1 point.
///
/// `None` when the document has no bleed or a bleed of zero on every side:
/// such a page is a plain page.
pub fn print_geometry(document: &Document) -> Option<assemblash_export::pdf::PrintGeometry> {
    let bleed = document.canvas.bleed.as_ref()?;
    let sides = [bleed.top, bleed.right, bleed.bottom, bleed.left];
    if sides.iter().all(|side| *side == 0.0) {
        return None;
    }
    Some(assemblash_export::pdf::PrintGeometry {
        bleed: sides.map(|side| side as f32),
    })
}

/// One PDF page of a document, prepared, with its pixel size.
fn pdf_page(
    document: &Document,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
    print: bool,
) -> Result<(assemblash_export::pdf::PdfPage, u32, u32), ApiError> {
    let (width, height, rgba) = rgba_for(document, fonts, hrefs, scale)?;
    let geometry = if print {
        print_geometry(document)
    } else {
        None
    };
    // The trim size is the canvas size in points, whatever the scale: the
    // scale changes the image resolution only.
    let page = assemblash_export::pdf::PdfPage::new(
        width,
        height,
        &rgba,
        document.canvas.width as f32,
        document.canvas.height as f32,
        geometry,
    )?;
    Ok((page, width, height))
}

/// Renders a document to the bytes of one export format.
///
/// The one function every transport encodes a single document with. A PNG
/// goes through [`document_to_png`] with `metadata`, as it always did; the
/// other raster formats start from the same pixels.
pub fn encode_document(
    document: &Document,
    fonts: &LoadedFonts,
    hrefs: &assemblash_renderer::AssetHrefs,
    scale: f32,
    settings: ExportSettings,
    metadata: &PngMetadata,
) -> Result<Rendered, ApiError> {
    match settings.encode {
        EncodeSettings::Png => {
            let png = document_to_png(document, fonts, hrefs, scale, metadata)?;
            Ok(Rendered {
                bytes: png,
                width: (f64::from(scale) * document.canvas.width).round() as u32,
                height: (f64::from(scale) * document.canvas.height).round() as u32,
            })
        }
        EncodeSettings::Svg => svg_for_loaded(document, fonts, hrefs),
        EncodeSettings::Jpeg { quality } => {
            let (width, height, rgba) = rgba_for(document, fonts, hrefs, scale)?;
            let bytes = assemblash_export::encode_jpeg(width, height, &rgba, quality)?;
            Ok(Rendered {
                bytes,
                width,
                height,
            })
        }
        EncodeSettings::WebpLossless => {
            let (width, height, rgba) = rgba_for(document, fonts, hrefs, scale)?;
            let bytes = assemblash_export::encode_webp_lossless(width, height, &rgba)?;
            Ok(Rendered {
                bytes,
                width,
                height,
            })
        }
        EncodeSettings::Pdf => {
            let (page, width, height) = pdf_page(document, fonts, hrefs, scale, settings.print)?;
            Ok(Rendered {
                bytes: assemblash_export::pdf::write_pdf(&[page]),
                width,
                height,
            })
        }
    }
}

/// One page to render, by reference.
#[derive(Debug, Clone, Copy)]
pub struct PageInput<'a> {
    /// The document of the page.
    pub document: &'a Document,
    /// The fonts the document names.
    pub fonts: &'a LoadedFonts,
    /// The asset hrefs of the document's own project.
    pub hrefs: &'a assemblash_renderer::AssetHrefs,
}

/// Renders pages into one PDF, one page each, in the order given.
///
/// The pages are rendered and prepared on several threads, at most
/// [`MAX_RENDER_THREADS`] in the whole process (see [`parallel_in_order`]).
/// The results are put back in page order, so the bytes do not depend on
/// thread timing. When pages fail, the error of the lowest page index is
/// given. The page count and the pixel budget are checked first.
///
/// The width and height are the pixel size of the first page.
pub fn pages_to_pdf(
    pages: &[PageInput<'_>],
    scale: f32,
    print: bool,
) -> Result<Rendered, ApiError> {
    check_pdf_limits(pages.iter().map(|page| page.document), scale)?;
    let prepared = parallel_in_order(pages, |page| {
        pdf_page(page.document, page.fonts, page.hrefs, scale, print)
    })?;
    let (width, height) = prepared
        .first()
        .map_or((0, 0), |(_, width, height)| (*width, *height));
    let pdf_pages: Vec<_> = prepared.into_iter().map(|(page, ..)| page).collect();
    Ok(Rendered {
        bytes: assemblash_export::pdf::write_pdf(&pdf_pages),
        width,
        height,
    })
}

/// Render threads not in use, shared by the whole process.
static RENDER_SLOTS: RenderSlots = RenderSlots {
    free: std::sync::Mutex::new(MAX_RENDER_THREADS),
    freed: std::sync::Condvar::new(),
};

/// A counting semaphore over [`MAX_RENDER_THREADS`].
struct RenderSlots {
    free: std::sync::Mutex<usize>,
    freed: std::sync::Condvar,
}

/// Render slots taken by one export, given back when dropped.
struct SlotGuard {
    taken: usize,
}

impl RenderSlots {
    /// Waits for at least one slot, then takes up to `wanted` slots.
    ///
    /// Never more than one wait: an export that has one slot can always
    /// finish, so two exports cannot block each other.
    fn take(&self, wanted: usize) -> SlotGuard {
        // A poisoned count is still a count: the guard that panicked gave its
        // slots back in its own drop.
        let mut free = self
            .free
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        while *free == 0 {
            free = self
                .freed
                .wait(free)
                .unwrap_or_else(std::sync::PoisonError::into_inner);
        }
        let taken = wanted.clamp(1, *free);
        *free -= taken;
        SlotGuard { taken }
    }
}

impl Drop for SlotGuard {
    fn drop(&mut self) {
        let mut free = RENDER_SLOTS
            .free
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        *free += self.taken;
        RENDER_SLOTS.freed.notify_all();
    }
}

/// Runs `work` on every item on a bounded set of threads, and gives the
/// results in item order. The first error in item order wins.
///
/// The threads come from [`RENDER_SLOTS`]: at most [`MAX_RENDER_THREADS`]
/// run `work` at one time in the whole process, and at most
/// [`std::thread::available_parallelism`]. A call waits until one slot is
/// free.
fn parallel_in_order<T, R, E, F>(items: &[T], work: F) -> Result<Vec<R>, E>
where
    T: Sync,
    R: Send,
    E: From<ApiError> + Send,
    F: Fn(&T) -> Result<R, E> + Sync,
{
    if items.is_empty() {
        return Ok(Vec::new());
    }
    let wanted = std::thread::available_parallelism()
        .map_or(1, std::num::NonZeroUsize::get)
        .min(MAX_RENDER_THREADS)
        .min(items.len());
    let slots = RENDER_SLOTS.take(wanted);
    let workers = slots.taken;
    if workers <= 1 {
        return items.iter().map(&work).collect();
    }

    let next = std::sync::atomic::AtomicUsize::new(0);
    let mut done_slots: Vec<Option<Result<R, E>>> = Vec::with_capacity(items.len());
    done_slots.resize_with(items.len(), || None);
    let mut stopped = false;
    std::thread::scope(|scope| {
        let handles: Vec<_> = (0..workers)
            .map(|_| {
                scope.spawn(|| {
                    let mut done = Vec::new();
                    loop {
                        let index = next.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                        let Some(item) = items.get(index) else {
                            break;
                        };
                        done.push((index, work(item)));
                    }
                    done
                })
            })
            .collect();
        for handle in handles {
            match handle.join() {
                Ok(done) => {
                    for (index, result) in done {
                        if let Some(slot) = done_slots.get_mut(index) {
                            *slot = Some(result);
                        }
                    }
                }
                Err(_) => stopped = true,
            }
        }
    });

    let lost = || {
        ApiError::new(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "renderFailed",
            "the renderer stopped while it was drawing a page",
        )
    };
    // In item order: the first error found is the error of the lowest index.
    drop(slots);
    let mut results = Vec::with_capacity(done_slots.len());
    for slot in done_slots {
        match slot {
            Some(result) => results.push(result?),
            None => return Err(lost().into()),
        }
    }
    if stopped {
        return Err(lost().into());
    }
    Ok(results)
}

/// One page of a page set: its project and its current document.
///
/// The fonts and assets of the page are not here. They are loaded by the
/// thread that renders the page, so a large set does not hold the fonts and
/// assets of every page in memory at one time.
#[derive(Debug, Clone)]
pub struct PageSource {
    /// The project that is this page.
    pub project: String,
    /// The project's current document.
    pub document: Document,
    /// The project's directory, where its assets are.
    pub directory: PathBuf,
}

/// The fonts and assets one page renders with.
#[derive(Debug, Clone)]
pub struct PageAssets {
    /// The fonts the document names.
    pub fonts: LoadedFonts,
    /// The asset hrefs of the document.
    pub hrefs: std::sync::Arc<assemblash_renderer::AssetHrefs>,
}

/// The pages of a page set, rendered, with the warnings of every page.
#[derive(Debug, Clone)]
pub struct RenderedPages {
    /// The bytes and the pixel size of the first page.
    pub rendered: Rendered,
    /// The export warnings of every page, in page order, each with its
    /// project.
    pub warnings: Vec<ExportWarning>,
}

/// Renders the pages of a page set to the bytes of one export format.
///
/// A PDF holds every page. Any other format holds one page. The page count
/// ([`check_page_count`]) and, for a PDF, the pixel budget
/// ([`check_pdf_limits`]) are checked before `load` runs for any page.
///
/// `load` gives the fonts and assets of one page. For a PDF it runs on the
/// thread that renders that page, and the page lets go of them when it is
/// done.
pub fn render_page_sources<L, E>(
    pages: &[PageSource],
    load: L,
    scale: f32,
    settings: ExportSettings,
) -> Result<RenderedPages, E>
where
    L: Fn(&PageSource) -> Result<PageAssets, E> + Sync,
    E: From<ApiError> + Send,
{
    check_page_count(settings, pages.len())?;
    let warning_scale = settings.warning_scale(scale);
    if settings.format() == ExportFormat::Pdf {
        check_pdf_limits(pages.iter().map(|page| &page.document), scale)?;
        let prepared = parallel_in_order(pages, |page| -> Result<_, E> {
            let assets = load(page)?;
            let (pdf, width, height) = pdf_page(
                &page.document,
                &assets.fonts,
                &assets.hrefs,
                scale,
                settings.print,
            )?;
            let warnings = page_warnings(page, &assets, warning_scale);
            Ok((pdf, width, height, warnings))
        })?;
        let (width, height) = prepared
            .first()
            .map_or((0, 0), |(_, width, height, _)| (*width, *height));
        let mut pdf_pages = Vec::with_capacity(prepared.len());
        let mut warnings = Vec::new();
        for (pdf, _, _, found) in prepared {
            pdf_pages.push(pdf);
            warnings.extend(found);
        }
        return Ok(RenderedPages {
            rendered: Rendered {
                bytes: assemblash_export::pdf::write_pdf(&pdf_pages),
                width,
                height,
            },
            warnings,
        });
    }
    let Some(page) = pages.first() else {
        return Err(no_pages().into());
    };
    let assets = load(page)?;
    let rendered = encode_document(
        &page.document,
        &assets.fonts,
        &assets.hrefs,
        scale,
        settings,
        &PngMetadata::for_document(&page.document),
    )?;
    Ok(RenderedPages {
        rendered,
        warnings: page_warnings(page, &assets, warning_scale),
    })
}

/// The export warnings of one page, each with its project.
fn page_warnings(page: &PageSource, assets: &PageAssets, scale: f32) -> Vec<ExportWarning> {
    assemblash_renderer::export_warnings_at(
        &page.document,
        assets.fonts.font_set(),
        &page.directory,
        scale,
    )
    .into_iter()
    .map(|mut warning| {
        warning.project = Some(page.project.clone());
        warning
    })
    .collect()
}

/// Refuses a PDF whose pages, all together, render more than
/// [`MAX_PDF_PIXELS`] pixels, or that has more than [`MAX_PDF_PAGES`] pages.
///
/// The pixel size of a page is the size its PNG export has. Nothing renders
/// before this check.
pub fn check_pdf_limits<'a>(
    documents: impl ExactSizeIterator<Item = &'a Document>,
    scale: f32,
) -> Result<(), ApiError> {
    check_pdf_page_count(documents.len())?;
    let mut total: u64 = 0;
    for document in documents {
        let width = (f64::from(scale) * document.canvas.width).round().max(0.0);
        let height = (f64::from(scale) * document.canvas.height).round().max(0.0);
        // Saturating: a canvas this large is far above the budget anyway.
        let pixels = (width * height).min(u64::MAX as f64) as u64;
        total = total.saturating_add(pixels);
    }
    if total > MAX_PDF_PIXELS {
        return Err(ApiError::new(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            PDF_PIXEL_LIMIT_EXCEEDED,
            format!(
                "these pages render {total} pixels at scale {scale}, and one PDF holds at \
                 most {MAX_PDF_PIXELS}; select fewer pages or use a smaller scale"
            ),
        )
        .with_details(serde_json::json!({ "pixels": total, "limit": MAX_PDF_PIXELS })));
    }
    Ok(())
}

/// Refuses a PDF with more than [`MAX_PDF_PAGES`] pages.
fn check_pdf_page_count(count: usize) -> Result<(), ApiError> {
    if count > MAX_PDF_PAGES {
        return Err(ApiError::new(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            PDF_PAGE_LIMIT_EXCEEDED,
            format!(
                "these pages are {count}, and one PDF holds at most {MAX_PDF_PAGES}; \
                 select fewer pages, for example deck:1-{MAX_PDF_PAGES}"
            ),
        )
        .with_details(serde_json::json!({ "pages": count, "limit": MAX_PDF_PAGES })));
    }
    Ok(())
}

/// Refuses more than one page with a format that holds one image, a PDF
/// with more than [`MAX_PDF_PAGES`] pages, and a selection of no pages.
pub fn check_page_count(settings: ExportSettings, count: usize) -> Result<(), ApiError> {
    if count == 0 {
        return Err(no_pages());
    }
    let format = settings.format();
    if format == ExportFormat::Pdf {
        check_pdf_page_count(count)?;
    }
    if format != ExportFormat::Pdf && count != 1 {
        return Err(ApiError::new(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            PAGES_NEED_PDF,
            format!(
                "a {} export holds one page, and these pages are {count}; \
                 use format pdf, or select one page (for example deck:2)",
                format.as_str()
            ),
        )
        .with_details(serde_json::json!({ "format": format.as_str(), "pages": count })));
    }
    Ok(())
}

fn no_pages() -> ApiError {
    invalid_selection("", "the pages select no page")
}

fn invalid_selection(pages: &str, reason: impl Into<String>) -> ApiError {
    let reason = reason.into();
    ApiError::new(
        axum::http::StatusCode::UNPROCESSABLE_ENTITY,
        INVALID_PAGE_SELECTION,
        format!("{pages:?} is not a usable page selection: {reason}"),
    )
    .with_details(serde_json::json!({ "pages": pages, "reason": reason }))
}

/// The `pages` field of an export request: a page set, and which of its
/// pages.
///
/// `deck` is every page of the set `deck`. `deck:1-3,5` is pages 1, 2, 3 and
/// 5. Pages are numbered from 1, in manifest order with nested sets
/// expanded. A set name cannot hold `:`, so the first `:` ends the name.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PageRequest {
    /// The text of the request, as written.
    pub text: String,
    /// The page set.
    pub set: assemblash_core::page_sets::PageSetName,
    /// The selected page numbers as inclusive ranges, from 1. `None` is
    /// every page.
    pub selection: Option<Vec<(usize, usize)>>,
}

impl PageRequest {
    /// Reads the `pages` field. Nothing is read from the workspace here.
    pub fn parse(text: &str) -> Result<Self, ApiError> {
        let (name, selection) = match text.split_once(':') {
            Some((name, selection)) => (name, Some(selection)),
            None => (text, None),
        };
        let set = assemblash_core::page_sets::PageSetName::new(name)?;
        let selection = match selection {
            Some(selection) => Some(parse_selection(text, selection)?),
            None => None,
        };
        Ok(Self {
            text: text.to_owned(),
            set,
            selection,
        })
    }

    /// The selected pages of a resolved set, in manifest order. A page
    /// named twice is selected once.
    pub fn select<'a>(
        &self,
        resolved: &'a assemblash_core::page_sets::ResolvedPageSet,
    ) -> Result<Vec<&'a assemblash_core::page_sets::ResolvedPage>, ApiError> {
        let count = resolved.pages.len();
        let Some(ranges) = &self.selection else {
            return Ok(resolved.pages.iter().collect());
        };
        let mut chosen = std::collections::BTreeSet::new();
        for &(first, last) in ranges {
            if last > count {
                return Err(invalid_selection(
                    &self.text,
                    format!("page {last} is above the page count, {count}"),
                ));
            }
            chosen.extend(first..=last);
        }
        Ok(chosen
            .into_iter()
            .filter_map(|number| resolved.pages.get(number - 1))
            .collect())
    }
}

fn parse_selection(text: &str, selection: &str) -> Result<Vec<(usize, usize)>, ApiError> {
    if selection.trim().is_empty() {
        return Err(invalid_selection(
            text,
            "the selection after ':' is empty; name pages, for example deck:1-3,5",
        ));
    }
    let number = |value: &str| -> Result<usize, ApiError> {
        let value = value.trim();
        if value.is_empty() || !value.bytes().all(|byte| byte.is_ascii_digit()) {
            return Err(invalid_selection(
                text,
                format!("{value:?} is not a page number"),
            ));
        }
        match value.parse::<usize>() {
            Ok(0) => Err(invalid_selection(text, "pages are numbered from 1")),
            Ok(number) => Ok(number),
            Err(_) => Err(invalid_selection(
                text,
                format!("{value:?} is not a page number"),
            )),
        }
    };
    let mut ranges = Vec::new();
    for item in selection.split(',') {
        let range = match item.split_once('-') {
            Some((first, last)) => {
                let (first, last) = (number(first)?, number(last)?);
                if first > last {
                    return Err(invalid_selection(
                        text,
                        format!("the range {first}-{last} goes down"),
                    ));
                }
                (first, last)
            }
            None => {
                let page = number(item)?;
                (page, page)
            }
        };
        ranges.push(range);
    }
    Ok(ranges)
}

fn io(path: &Path, operation: &'static str, source: std::io::Error) -> ApiError {
    ApiError::from(assemblash_core::storage::StorageError::Io {
        operation,
        path: PathBuf::from(path),
        source,
    })
}

/// A file stem a caller may choose, with anything path-shaped refused.
///
/// A Windows device name (`NUL`, `CON`, `COM1`, and the others of
/// [`assemblash_core::workspace::is_reserved_name`]) is refused on every
/// platform, by the same rule as a project id.
pub fn safe_stem(name: &str) -> Result<String, ApiError> {
    let trimmed = name.trim();
    let usable = !trimmed.is_empty()
        && trimmed.len() <= 60
        && !trimmed.starts_with('.')
        && trimmed
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'))
        && !assemblash_core::workspace::is_reserved_name(trimmed);
    if usable {
        Ok(trimmed.to_owned())
    } else {
        Err(ApiError::new(
            axum::http::StatusCode::BAD_REQUEST,
            "invalidExportName",
            format!(
                "{name:?} is not a usable export name: letters, digits, hyphens, \
                 and underscores only, and not a device name such as NUL or COM1"
            ),
        ))
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn lenient_discovery_keeps_base_and_known_run_families_with_legacy_values() {
        let mut document = Document::new(
            &mut assemblash_core::ids::SequentialIdSource::new(),
            400.0,
            200.0,
        );
        let text = serde_json::from_value(
            serde_json::json!({"text":"A","fontFamily":"Noto Sans","fontSize":32,
            "runs":[17,null,{"text":"A","fontFamily":"Other Face","future":{"keep":true}},
                {"fontFamily":null},{"fontFamily":24},{"fontFamily":""}]}),
        )
        .unwrap();
        document.layers.push(assemblash_core::Layer::new(
            assemblash_core::LayerId::new("layer_discovery"),
            assemblash_core::Transform::new(0.0, 0.0, 400.0, 200.0),
            assemblash_core::LayerKind::Text(text),
        ));
        assert_eq!(families_used(&document), vec!["Noto Sans", "Other Face"]);
        assert!(assemblash_renderer::text_font_families(&document).is_err());
    }

    #[test]
    fn parallel_work_keeps_item_order_and_reports_the_lowest_failing_index() {
        let items: Vec<usize> = (0..64).collect();
        let doubled = parallel_in_order(&items, |item| Ok::<_, ApiError>(item * 2)).unwrap();
        assert_eq!(
            doubled,
            items.iter().map(|item| item * 2).collect::<Vec<_>>()
        );

        // Items 7, 20 and 50 fail; the error is always the one of item 7,
        // whatever thread finished first.
        for _ in 0..20 {
            let error = parallel_in_order(&items, |item| {
                if matches!(item, 7 | 20 | 50) {
                    Err(ApiError::bad_request(format!("item {item}")))
                } else {
                    Ok(*item)
                }
            })
            .unwrap_err();
            assert_eq!(error.message(), "item 7");
        }
    }

    #[test]
    fn render_threads_are_bounded_across_concurrent_exports() {
        use std::sync::atomic::{AtomicUsize, Ordering};
        let active = AtomicUsize::new(0);
        let most = AtomicUsize::new(0);
        let items: Vec<usize> = (0..24).collect();
        let work = |item: &usize| -> Result<usize, ApiError> {
            let now = active.fetch_add(1, Ordering::SeqCst) + 1;
            most.fetch_max(now, Ordering::SeqCst);
            std::thread::sleep(std::time::Duration::from_millis(15));
            active.fetch_sub(1, Ordering::SeqCst);
            Ok(*item)
        };
        std::thread::scope(|scope| {
            let first = scope.spawn(|| parallel_in_order(&items, work));
            let second = scope.spawn(|| parallel_in_order(&items, work));
            assert_eq!(first.join().unwrap().unwrap(), items);
            assert_eq!(second.join().unwrap().unwrap(), items);
        });
        let most = most.load(Ordering::SeqCst);
        assert!(
            most <= MAX_RENDER_THREADS,
            "two exports at one time ran {most} render threads"
        );
    }

    fn pdf() -> ExportSettings {
        ExportSettings::from_request(Some("pdf"), None, None).unwrap()
    }

    fn blank(width: f64, height: f64) -> Document {
        Document::new(
            &mut assemblash_core::ids::SequentialIdSource::new(),
            width,
            height,
        )
    }

    #[test]
    fn a_pdf_holds_at_most_the_page_limit() {
        assert!(check_page_count(pdf(), MAX_PDF_PAGES).is_ok());
        let error = check_page_count(pdf(), MAX_PDF_PAGES + 1).unwrap_err();
        assert_eq!(error.code(), PDF_PAGE_LIMIT_EXCEEDED);
        assert_eq!(error.details()["limit"], MAX_PDF_PAGES);
    }

    #[test]
    fn a_pdf_above_the_pixel_budget_is_refused_before_any_page_loads() {
        let directory = tempfile::tempdir().unwrap();
        // 5 pages of 10 000 x 10 000 pixels: 500 000 000 pixels.
        let pages: Vec<_> = (0..5)
            .map(|index| PageSource {
                project: format!("p{index}"),
                document: blank(10_000.0, 10_000.0),
                directory: directory.path().to_path_buf(),
            })
            .collect();
        let loaded = std::sync::atomic::AtomicBool::new(false);
        let error = render_page_sources::<_, ApiError>(
            &pages,
            |_| {
                loaded.store(true, std::sync::atomic::Ordering::SeqCst);
                Err(ApiError::bad_request("no page may load"))
            },
            1.0,
            pdf(),
        )
        .unwrap_err();
        assert_eq!(error.code(), PDF_PIXEL_LIMIT_EXCEEDED);
        assert_eq!(error.details()["pixels"], 500_000_000_u64);
        assert!(!loaded.load(std::sync::atomic::Ordering::SeqCst));

        // The scale counts squared: the same pages at 0.5 fit.
        assert!(check_pdf_limits(pages.iter().map(|page| &page.document), 0.5).is_ok());
    }

    /// A template with one text slot, `headline`.
    fn template(width: f64, height: f64) -> Document {
        use assemblash_core::document::{Extras, TextAlign, TextLayer, Transform};
        let mut document = blank(width, height);
        document.layers.push(assemblash_core::Layer::new(
            assemblash_core::LayerId::new("layer_headline"),
            Transform::new(0.0, 0.0, 10.0, 10.0),
            assemblash_core::LayerKind::Text(TextLayer {
                text: "placeholder".to_owned(),
                font_family: "Noto Sans".to_owned(),
                font_size: 24.0,
                color: None,
                align: TextAlign::Left,
                line_height: 1.2,
                paragraph_spacing: 0.0,
                font_weight: 400,
                font_style: assemblash_core::FontStyle::Normal,
                letter_spacing: 0.0,
                stroke: None,
                vertical_align: assemblash_core::VerticalAlign::Top,
                runs: Vec::new(),
                extra: Extras::new(),
            }),
        ));
        document.slots = vec![assemblash_core::Slot {
            name: "headline".to_owned(),
            layer: assemblash_core::LayerId::new("layer_headline"),
            kind: assemblash_core::SlotKind::Text,
            description: None,
            required: false,
            extra: Extras::new(),
        }];
        document
    }

    #[test]
    fn a_variants_pdf_has_the_same_limits_and_writes_nothing() {
        let directory = tempfile::tempdir().unwrap();
        let fonts = LoadedFonts::from_bytes([]);
        let variant = |index: usize| Variant {
            name: format!("v{index}"),
            values: Default::default(),
        };

        let many: Vec<_> = (0..=MAX_PDF_PAGES).map(variant).collect();
        let error = render_variants_as(
            &template(10.0, 10.0),
            directory.path(),
            &fonts,
            1.0,
            &many,
            pdf(),
            None,
        )
        .unwrap_err();
        assert_eq!(error.code(), PDF_PAGE_LIMIT_EXCEEDED);

        let large: Vec<_> = (0..5).map(variant).collect();
        let error = render_variants_as(
            &template(10_000.0, 10_000.0),
            directory.path(),
            &fonts,
            1.0,
            &large,
            pdf(),
            None,
        )
        .unwrap_err();
        assert_eq!(
            error.code(),
            PDF_PIXEL_LIMIT_EXCEEDED,
            "{}",
            error.message()
        );
        assert!(!directory
            .path()
            .join(EXPORTS_DIR)
            .join("variants.pdf")
            .exists());
    }

    #[test]
    fn an_empty_variants_pdf_is_refused_and_writes_nothing() {
        let directory = tempfile::tempdir().unwrap();
        let error = render_variants_as(
            &template(10.0, 10.0),
            directory.path(),
            &LoadedFonts::from_bytes([]),
            1.0,
            &[],
            pdf(),
            None,
        )
        .unwrap_err();
        assert_eq!(error.code(), INVALID_PAGE_SELECTION);
        assert!(!directory.path().join(EXPORTS_DIR).exists());
    }

    #[test]
    fn a_page_request_names_a_set_and_an_optional_selection() {
        let every = PageRequest::parse("deck").unwrap();
        assert_eq!(every.set.as_str(), "deck");
        assert_eq!(every.selection, None);
        let some = PageRequest::parse("deck:1-3, 5").unwrap();
        assert_eq!(some.selection, Some(vec![(1, 3), (5, 5)]));
        for bad in [
            "deck:", "deck: ", "deck:0", "deck:1,", "deck:a", "deck:3-1", "deck:-2", "deck:1-",
            "deck:1:2",
        ] {
            let error = PageRequest::parse(bad).unwrap_err();
            assert_eq!(error.code(), INVALID_PAGE_SELECTION, "{bad}");
        }
        assert_eq!(
            PageRequest::parse("").unwrap_err().code(),
            "invalidPageSetName"
        );
    }

    #[test]
    fn an_export_name_is_never_a_device_name_on_any_platform() {
        for name in [
            "NUL", "nul", "Con", "PRN", "aux", "COM1", "com9", "LPT1", "lpt9",
        ] {
            let error = safe_stem(name).unwrap_err();
            assert_eq!(error.code(), "invalidExportName", "{name}");
        }
        for name in ["null", "console", "com10", "nul_1", "lpt"] {
            assert_eq!(safe_stem(name).unwrap(), name);
        }
    }

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
    /// Content hash of the file, `sha256:<hex>`. For a PDF batch, the hash
    /// of the one PDF.
    ///
    /// Two runs of the same template with the same values produce the same
    /// hash — which is what makes a batch as checkable as a single render.
    pub hash: String,
    /// The page of this variant in the PDF, from 1. Only a PDF batch sets it.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<usize>,
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
    render_variants_as(
        template,
        project_dir,
        fonts,
        scale,
        variants,
        ExportSettings::default(),
        None,
    )
}

/// The file stem of a batch of variants written as one PDF, when the request
/// gives no name.
pub const VARIANTS_PDF_STEM: &str = "variants";

/// Renders template variants in any export format.
///
/// PNG (the default), SVG, JPEG and WebP write one file for each variant,
/// `exports/<variant name>.<extension>`, exactly as the PNG batch always did.
/// PDF writes one file, `exports/<name>.pdf` (`variants.pdf` when `name` is
/// `None`), with one page for each variant in the order asked for: the
/// variants as one page set. `name` is used only for PDF.
pub fn render_variants_as(
    template: &Document,
    project_dir: &Path,
    fonts: &LoadedFonts,
    scale: f32,
    variants: &[Variant],
    settings: ExportSettings,
    name: Option<&str>,
) -> Result<RenderedVariants, ApiError> {
    // Checked once, before anything renders: a broken template should be one
    // clear error rather than the same error N times.
    assemblash_core::templates::validate_slots(template).map_err(template_error)?;
    if settings.format() == ExportFormat::Pdf {
        // A PDF with no page is not a file a reader can open, so an empty
        // batch is refused like an empty page selection, and writes nothing.
        if variants.is_empty() {
            return Err(ApiError::new(
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                INVALID_PAGE_SELECTION,
                "a pdf batch has one page for each variant, and this batch has no variant;                  send at least one variant",
            )
            .with_details(serde_json::json!({ "variants": 0 })));
        }
        check_pdf_page_count(variants.len())?;
    }
    let pdf_stem = match name {
        Some(name) => safe_stem(name)?,
        None => VARIANTS_PDF_STEM.to_owned(),
    };

    let directory = project_dir.join(EXPORTS_DIR);
    std::fs::create_dir_all(&directory).map_err(|source| io(&directory, "creating", source))?;

    // Filling edits layers, never assets, so every variant renders from the
    // template's own hrefs: read and encoded once for the whole batch.
    let hrefs = assemblash_renderer::data_uris(template, project_dir)?;

    if settings.format() == ExportFormat::Pdf {
        // Every variant is filled first, so a refused variant writes nothing.
        let filled = variants
            .iter()
            .map(|variant| {
                safe_stem(&variant.name)?;
                fill_variant(template, variant)
            })
            .collect::<Result<Vec<_>, _>>()?;
        let inputs: Vec<_> = filled
            .iter()
            .map(|document| PageInput {
                document,
                fonts,
                hrefs: &hrefs,
            })
            .collect();
        let pdf = pages_to_pdf(&inputs, scale, false)?;
        let path = write_export(project_dir, &pdf_stem, ExportFormat::Pdf, &pdf.bytes)?;
        let hash = assemblash_core::storage::hash_bytes(&pdf.bytes);
        let rendered = variants
            .iter()
            .enumerate()
            .map(|(index, variant)| RenderedVariant {
                name: variant.name.clone(),
                path: path.clone(),
                bytes: pdf.bytes.len(),
                width: pdf.width,
                height: pdf.height,
                hash: hash.clone(),
                page: Some(index + 1),
            })
            .collect();
        return Ok(RenderedVariants {
            template: template.id.to_string(),
            template_version: template.version,
            variants: rendered,
        });
    }

    let mut rendered = Vec::with_capacity(variants.len());
    for variant in variants {
        let stem = safe_stem(&variant.name)?;
        let filled = fill_variant(template, variant)?;
        let output = encode_document(
            &filled,
            fonts,
            &hrefs,
            scale,
            settings,
            &PngMetadata::for_document(&filled),
        )?;
        let path = write_export(project_dir, &stem, settings.format(), &output.bytes)?;

        rendered.push(RenderedVariant {
            name: variant.name.clone(),
            path,
            bytes: output.bytes.len(),
            width: output.width,
            height: output.height,
            hash: assemblash_core::storage::hash_bytes(&output.bytes),
            page: None,
        });
    }

    Ok(RenderedVariants {
        template: template.id.to_string(),
        template_version: template.version,
        variants: rendered,
    })
}

/// The code for a variants `name` with a format other than PDF.
pub const VARIANTS_NAME_NEEDS_PDF: &str = "variantsNameNeedsPdf";

/// The PDF name of a variants request: refused with any format but PDF, where
/// each file is named after its variant.
pub fn variants_pdf_name(
    settings: ExportSettings,
    name: Option<String>,
) -> Result<Option<String>, ApiError> {
    if name.is_some() && settings.format() != ExportFormat::Pdf {
        return Err(ApiError::new(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            VARIANTS_NAME_NEEDS_PDF,
            format!(
                "a {} batch names each file after its variant; \
                 name applies to a pdf batch only, so omit it",
                settings.format().as_str()
            ),
        ));
    }
    Ok(name)
}

/// A copy of the template with one variant's values filled in.
fn fill_variant(template: &Document, variant: &Variant) -> Result<Document, ApiError> {
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
    Ok(filled)
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
        project: None,
    });
}
