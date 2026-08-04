//! SVG to PNG.
//!
//! Rasterization is where determinism is won or lost, so two things are
//! deliberate:
//!
//! * **Fonts come from files the caller names.** No system font lookup, ever.
//!   The same document plus the same font files must produce the same pixels
//!   on every machine (NFR-1); a machine-dependent font list would silently
//!   break that.
//! * **The clock is an argument.** Export metadata can carry a timestamp
//!   (FR-11), but the renderer never reads a clock itself — otherwise two
//!   runs of the same document could never be byte-compared.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use resvg::tiny_skia;
use resvg::usvg;

use crate::error::RenderError;
use crate::fonts::FontSet;

/// Font files available to a rasterization, and the families they provide.
#[derive(Debug, Clone)]
pub struct LoadedFonts {
    database: Arc<usvg::fontdb::Database>,
    families: FontSet,
}

impl LoadedFonts {
    /// Loads fonts from explicit files.
    ///
    /// Directories are not scanned and the system font list is never
    /// consulted: what is listed here is exactly what a render may use.
    pub fn from_files<I, P>(paths: I) -> Result<Self, RenderError>
    where
        I: IntoIterator<Item = P>,
        P: AsRef<Path>,
    {
        let mut database = usvg::fontdb::Database::new();
        for path in paths {
            let path = path.as_ref();
            let data = std::fs::read(path).map_err(|source| RenderError::FontFile {
                path: path.to_path_buf(),
                source,
            })?;
            database.load_font_data(data);
        }
        Ok(Self::from_database(database))
    }

    /// Loads fonts already held in memory — for embedded fonts, or a caller
    /// that has its own cache.
    pub fn from_bytes<I>(fonts: I) -> Self
    where
        I: IntoIterator<Item = Vec<u8>>,
    {
        let mut database = usvg::fontdb::Database::new();
        for data in fonts {
            database.load_font_data(data);
        }
        Self::from_database(database)
    }

    fn from_database(database: usvg::fontdb::Database) -> Self {
        let families = FontSet::new(
            database
                .faces()
                .flat_map(|face| face.families.iter().map(|(name, _)| name.clone())),
        );
        Self {
            database: Arc::new(database),
            families,
        }
    }

    /// The families these files provide, for checking a document before it is
    /// rendered.
    pub fn font_set(&self) -> &FontSet {
        &self.families
    }

    /// Whether no font was loaded.
    pub fn is_empty(&self) -> bool {
        self.database.is_empty()
    }
}

/// Provenance written into an exported PNG (FR-11).
///
/// `created` is optional and excluded from any byte comparison of two renders:
/// it is the one field that is expected to differ between runs.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PngMetadata {
    /// Id of the document rendered.
    pub document_id: String,
    /// Schema version of that document.
    pub schema_version: u32,
    /// Version of the renderer that produced the image.
    pub renderer_version: String,
    /// When it was rendered, if the caller wants it recorded.
    pub created: Option<String>,
}

impl PngMetadata {
    /// Metadata for a document, without a timestamp.
    pub fn for_document(document: &assemblash_core::Document) -> Self {
        Self {
            document_id: document.id.to_string(),
            schema_version: document.schema_version,
            renderer_version: crate::RENDERER_VERSION.to_owned(),
            created: None,
        }
    }

    /// The same metadata with a timestamp recorded.
    pub fn created_at(mut self, timestamp: impl Into<String>) -> Self {
        self.created = Some(timestamp.into());
        self
    }
}

/// Keyword prefix of the PNG text chunks this renderer writes.
pub const METADATA_PREFIX: &str = "assemblash";

/// Rasterizes an SVG string.
///
/// `scale` multiplies the SVG's own size — 2.0 renders a 1000×500 document at
/// 2000×1000.
pub fn svg_to_pixmap(
    svg: &str,
    fonts: &LoadedFonts,
    scale: f32,
) -> Result<tiny_skia::Pixmap, RenderError> {
    if !scale.is_finite() || scale <= 0.0 {
        return Err(RenderError::InvalidScale(scale));
    }

    let options = usvg::Options {
        fontdb: Arc::clone(&fonts.database),
        ..usvg::Options::default()
    };

    let tree = usvg::Tree::from_str(svg, &options)
        .map_err(|source| RenderError::MalformedSvg(source.to_string()))?;

    let size = tree.size();
    let width = (f64::from(size.width()) * f64::from(scale)).round() as u32;
    let height = (f64::from(size.height()) * f64::from(scale)).round() as u32;

    let mut pixmap = tiny_skia::Pixmap::new(width.max(1), height.max(1))
        .ok_or(RenderError::CanvasTooLarge { width, height })?;

    resvg::render(
        &tree,
        tiny_skia::Transform::from_scale(scale, scale),
        &mut pixmap.as_mut(),
    );

    Ok(pixmap)
}

/// Encodes a rasterized canvas as a PNG carrying its provenance.
pub fn pixmap_to_png(
    pixmap: &tiny_skia::Pixmap,
    metadata: &PngMetadata,
) -> Result<Vec<u8>, RenderError> {
    // tiny-skia stores premultiplied pixels; PNG wants straight alpha.
    let mut rgba = Vec::with_capacity(pixmap.data().len());
    for pixel in pixmap.pixels() {
        let demultiplied = pixel.demultiply();
        rgba.extend_from_slice(&[
            demultiplied.red(),
            demultiplied.green(),
            demultiplied.blue(),
            demultiplied.alpha(),
        ]);
    }

    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, pixmap.width(), pixmap.height());
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);

        let mut text = vec![
            (
                format!("{METADATA_PREFIX}:documentId"),
                metadata.document_id.clone(),
            ),
            (
                format!("{METADATA_PREFIX}:schemaVersion"),
                metadata.schema_version.to_string(),
            ),
            (
                format!("{METADATA_PREFIX}:renderer"),
                metadata.renderer_version.clone(),
            ),
        ];
        if let Some(created) = &metadata.created {
            text.push((format!("{METADATA_PREFIX}:created"), created.clone()));
        }
        for (keyword, value) in text {
            encoder
                .add_text_chunk(keyword, value)
                .map_err(|source| RenderError::PngEncoding(source.to_string()))?;
        }

        let mut writer = encoder
            .write_header()
            .map_err(|source| RenderError::PngEncoding(source.to_string()))?;
        writer
            .write_image_data(&rgba)
            .map_err(|source| RenderError::PngEncoding(source.to_string()))?;
    }

    Ok(out)
}

/// Renders a document all the way to PNG bytes.
pub fn document_to_png(
    document: &assemblash_core::Document,
    fonts: &LoadedFonts,
    assets: &crate::svg::AssetHrefs,
    scale: f32,
    metadata: &PngMetadata,
) -> Result<Vec<u8>, RenderError> {
    let svg = crate::svg::doc_to_svg(document, fonts.font_set(), assets)?;
    let pixmap = svg_to_pixmap(&svg, fonts, scale)?;
    pixmap_to_png(&pixmap, metadata)
}

/// Reads back the `assemblash:*` text chunks of a PNG.
///
/// Used by tests and by anything that needs to know which document and
/// renderer produced a file.
pub fn read_png_metadata(png_bytes: &[u8]) -> Result<Vec<(String, String)>, RenderError> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let reader = decoder
        .read_info()
        .map_err(|source| RenderError::PngEncoding(source.to_string()))?;
    let info = reader.info();
    let mut found: Vec<(String, String)> = info
        .uncompressed_latin1_text
        .iter()
        .map(|chunk| (chunk.keyword.clone(), chunk.text.clone()))
        .chain(
            info.compressed_latin1_text
                .iter()
                .filter_map(|chunk| Some((chunk.keyword.clone(), chunk.get_text().ok()?))),
        )
        .filter(|(keyword, _)| keyword.starts_with(METADATA_PREFIX))
        .collect();
    found.sort();
    Ok(found)
}

/// Convenience for callers holding font paths in a directory listing.
pub fn font_files_in(directory: &Path) -> Result<Vec<PathBuf>, RenderError> {
    let entries = std::fs::read_dir(directory).map_err(|source| RenderError::FontFile {
        path: directory.to_path_buf(),
        source,
    })?;
    let mut paths = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|source| RenderError::FontFile {
            path: directory.to_path_buf(),
            source,
        })?;
        let path = entry.path();
        let is_font = path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_ascii_lowercase())
            .is_some_and(|e| matches!(e.as_str(), "ttf" | "otf" | "ttc" | "otc"));
        if is_font {
            paths.push(path);
        }
    }
    // Directory order is not defined; sorting keeps font resolution — and so
    // the pixels — the same on every machine.
    paths.sort();
    Ok(paths)
}
