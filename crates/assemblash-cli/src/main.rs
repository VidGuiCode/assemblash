//! The `assemblash` binary.
//!
//! Scaffolding for the Phase 0 spike: enough commands to build a document,
//! save it, reload it, and export a PNG from a script. It is deliberately
//! thin — the real surfaces are the HTTP API and MCP, over the same operation
//! layer in `assemblash-core`.

mod assets;

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use assemblash_core::document::{Extras, ImageFit, ImageLayer, TextAlign, TextLayer, Transform};
use assemblash_core::ids::UlidIdSource;
use assemblash_core::storage::{self, StorageError};
use assemblash_core::{Color, Document, Layer, LayerId, LayerKind};
use assemblash_renderer::raster::{font_files_in, LoadedFonts, PngMetadata};
use assemblash_renderer::{doc_to_svg, svg_to_pixmap, FontSet};
use clap::{Args, Parser, Subcommand, ValueEnum};

#[derive(Debug, Parser)]
#[command(name = "assemblash", version, about = "Deterministic document engine")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Creates an empty project directory.
    New {
        /// Directory to create the project in.
        project: PathBuf,
        /// Canvas width in pixels.
        #[arg(long, default_value_t = 1080.0)]
        width: f64,
        /// Canvas height in pixels.
        #[arg(long, default_value_t = 1080.0)]
        height: f64,
        /// Canvas background, `#rrggbb` or `#rrggbbaa`. Transparent if unset.
        #[arg(long)]
        background: Option<String>,
        /// Human-facing document name.
        #[arg(long)]
        name: Option<String>,
    },

    /// Appends a text layer.
    AddText {
        /// Project directory.
        project: PathBuf,
        /// The text. `\n` is a line break.
        #[arg(long)]
        text: String,
        /// Font family, as named by one of the loaded font files.
        #[arg(long)]
        font: String,
        /// Font size in pixels.
        #[arg(long, default_value_t = 48.0)]
        size: f64,
        /// Fill colour.
        #[arg(long, default_value = "#000000")]
        color: String,
        /// Horizontal alignment inside the layer box.
        #[arg(long, value_enum, default_value_t = Align::Left)]
        align: Align,
        #[command(flatten)]
        box_: BoxArgs,
    },

    /// Imports an image file and appends an image layer for it.
    AddImage {
        /// Project directory.
        project: PathBuf,
        /// Image file to import. It is copied into the project.
        #[arg(long)]
        file: PathBuf,
        /// How the image fills its box.
        #[arg(long, value_enum, default_value_t = Fit::Contain)]
        fit: Fit,
        #[command(flatten)]
        box_: BoxArgs,
    },

    /// Writes the document as SVG.
    Render {
        /// Project directory.
        project: PathBuf,
        /// Output file.
        #[arg(long)]
        out: PathBuf,
        #[command(flatten)]
        fonts: FontArgs,
    },

    /// Writes the document as PNG.
    Export {
        /// Project directory.
        project: PathBuf,
        /// Output file.
        #[arg(long)]
        out: PathBuf,
        /// Multiplier on the canvas size.
        #[arg(long, default_value_t = 1.0)]
        scale: f32,
        /// Timestamp to record in the PNG metadata. Omitted by default so
        /// that two exports of the same document are byte-identical.
        #[arg(long)]
        timestamp: Option<String>,
        #[command(flatten)]
        fonts: FontArgs,
    },

    /// Prints the document as JSON, after checking it.
    Show {
        /// Project directory.
        project: PathBuf,
    },
}

#[derive(Debug, Args)]
struct BoxArgs {
    /// Left edge.
    #[arg(long, default_value_t = 0.0)]
    x: f64,
    /// Top edge.
    #[arg(long, default_value_t = 0.0)]
    y: f64,
    /// Box width.
    #[arg(long, default_value_t = 100.0)]
    width: f64,
    /// Box height.
    #[arg(long, default_value_t = 100.0)]
    height: f64,
    /// Clockwise rotation in degrees about the box centre.
    #[arg(long, default_value_t = 0.0)]
    rotation: f64,
    /// Opacity from 0 to 1.
    #[arg(long, default_value_t = 1.0)]
    opacity: f64,
    /// Layer name.
    #[arg(long)]
    layer_name: Option<String>,
}

#[derive(Debug, Args)]
struct FontArgs {
    /// Directory of font files to load. Repeatable. Only fonts named here are
    /// available: the system font list is never consulted.
    #[arg(long = "font-dir")]
    font_dirs: Vec<PathBuf>,
    /// Font file to load. Repeatable.
    #[arg(long = "font")]
    font_files: Vec<PathBuf>,
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum Align {
    Left,
    Center,
    Right,
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum Fit {
    Fill,
    Contain,
    Cover,
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    match run(cli.command) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("error: {error}");
            ExitCode::FAILURE
        }
    }
}

/// Anything the CLI can fail with, flattened to one message for the user.
#[derive(Debug, thiserror::Error)]
enum CliError {
    #[error(transparent)]
    Storage(#[from] StorageError),
    #[error(transparent)]
    Render(#[from] assemblash_renderer::RenderError),
    #[error("writing {path}: {source}")]
    Write {
        path: PathBuf,
        source: std::io::Error,
    },
    #[error("{path} already contains a project")]
    ProjectExists { path: PathBuf },
    #[error("serialising the document: {0}")]
    Json(#[from] serde_json::Error),
}

fn run(command: Command) -> Result<(), CliError> {
    match command {
        Command::New {
            project,
            width,
            height,
            background,
            name,
        } => {
            if project.join(storage::DOCUMENT_FILE).exists() {
                return Err(CliError::ProjectExists { path: project });
            }
            let mut document = Document::new(&mut UlidIdSource, width, height);
            document.name = name;
            document.canvas.background = background.map(Color::new);
            storage::save(&document, &project)?;
            println!("{}", document.id);
            Ok(())
        }

        Command::AddText {
            project,
            text,
            font,
            size,
            color,
            align,
            box_,
        } => {
            let mut document = storage::load(&project)?;
            let layer = build_layer(
                &box_,
                LayerKind::Text(TextLayer {
                    text,
                    font_family: font,
                    font_size: size,
                    color: Color::new(color),
                    align: match align {
                        Align::Left => TextAlign::Left,
                        Align::Center => TextAlign::Center,
                        Align::Right => TextAlign::Right,
                    },
                    line_height: 1.2,
                    runs: Vec::new(),
                    extra: Extras::new(),
                }),
            );
            let id = layer.id.clone();
            document.layers.push(layer);
            storage::save(&document, &project)?;
            println!("{id}");
            Ok(())
        }

        Command::AddImage {
            project,
            file,
            fit,
            box_,
        } => {
            let mut document = storage::load(&project)?;
            let asset = storage::import_asset(&project, &file, &mut UlidIdSource)?;
            let layer = build_layer(
                &box_,
                LayerKind::Image(ImageLayer {
                    asset: asset.id.clone(),
                    fit: match fit {
                        Fit::Fill => ImageFit::Fill,
                        Fit::Contain => ImageFit::Contain,
                        Fit::Cover => ImageFit::Cover,
                    },
                    extra: Extras::new(),
                }),
            );
            let id = layer.id.clone();
            document.assets.push(asset);
            document.layers.push(layer);
            storage::save(&document, &project)?;
            println!("{id}");
            Ok(())
        }

        Command::Render {
            project,
            out,
            fonts,
        } => {
            let document = storage::load(&project)?;
            let hrefs = assets::data_uris(&document, &project)?;
            let font_set = match load_fonts(&fonts)? {
                Some(loaded) => loaded.font_set().clone(),
                // Nothing to check against, so anything the document asks for
                // is allowed through; rasterization would still need real
                // files.
                None => FontSet::unchecked(),
            };
            let svg = doc_to_svg(&document, &font_set, &hrefs)?;
            write_file(&out, svg.as_bytes())?;
            Ok(())
        }

        Command::Export {
            project,
            out,
            scale,
            timestamp,
            fonts,
        } => {
            let document = storage::load(&project)?;
            let hrefs = assets::data_uris(&document, &project)?;
            let loaded = load_fonts(&fonts)?.unwrap_or_else(|| LoadedFonts::from_bytes([]));
            let svg = doc_to_svg(&document, loaded.font_set(), &hrefs)?;
            let pixmap = svg_to_pixmap(&svg, &loaded, scale)?;
            let mut metadata = PngMetadata::for_document(&document);
            metadata.created = timestamp;
            let png = assemblash_renderer::pixmap_to_png(&pixmap, &metadata)?;
            write_file(&out, &png)?;
            Ok(())
        }

        Command::Show { project } => {
            let document = storage::load(&project)?;
            println!("{}", serde_json::to_string_pretty(&document)?);
            Ok(())
        }
    }
}

fn build_layer(box_: &BoxArgs, kind: LayerKind) -> Layer {
    let mut layer = Layer::new(
        LayerId::generate(&mut UlidIdSource),
        Transform {
            rotation: box_.rotation,
            ..Transform::new(box_.x, box_.y, box_.width, box_.height)
        },
        kind,
    );
    layer.opacity = box_.opacity;
    layer.name = box_.layer_name.clone();
    layer
}

fn load_fonts(args: &FontArgs) -> Result<Option<LoadedFonts>, CliError> {
    if args.font_dirs.is_empty() && args.font_files.is_empty() {
        return Ok(None);
    }
    let mut paths = args.font_files.clone();
    for directory in &args.font_dirs {
        paths.extend(font_files_in(directory)?);
    }
    paths.sort();
    Ok(Some(LoadedFonts::from_files(paths)?))
}

fn write_file(path: &Path, bytes: &[u8]) -> Result<(), CliError> {
    if let Some(parent) = path.parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(|source| CliError::Write {
                path: parent.to_path_buf(),
                source,
            })?;
        }
    }
    std::fs::write(path, bytes).map_err(|source| CliError::Write {
        path: path.to_path_buf(),
        source,
    })
}
