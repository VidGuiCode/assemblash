//! The `assemblash` binary.
//!
//! Scaffolding for the Phase 0 spike: enough commands to build a document,
//! save it, reload it, and export a PNG from a script. It is deliberately
//! thin — the real surfaces are the HTTP API and MCP, over the same operation
//! layer in `assemblash-core`.

mod assets;

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use assemblash_core::document::{ImageFit, TextAlign, Transform};
use assemblash_core::history::{Actor, ActorKind, EntryKind};
use assemblash_core::ids::UlidIdSource;
use assemblash_core::layout;
use assemblash_core::ops::{
    AlignEdge, Axis, CreateLayer, LayerPosition, NewLayerKind, OpOutcome, Operation, SnapTarget,
};
use assemblash_core::session::{self, Session, SessionError};
use assemblash_core::storage::{self, StorageError};
use assemblash_core::{Color, Document};
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
        #[command(flatten)]
        who: ActorArgs,
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
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Imports an SVG file and appends a vector layer for it.
    ///
    /// The file is sanitised on the way in: scripts, event handlers, and
    /// references to anything outside the file are removed.
    AddSvg {
        /// Project directory.
        project: PathBuf,
        /// SVG file to import. It is copied into the project.
        #[arg(long)]
        file: PathBuf,
        /// How the graphic fills its box.
        #[arg(long, value_enum, default_value_t = Fit::Contain)]
        fit: Fit,
        #[command(flatten)]
        box_: BoxArgs,
        #[command(flatten)]
        who: ActorArgs,
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

    /// Undoes the last operation.
    Undo {
        /// Project directory.
        project: PathBuf,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Redoes the operation that was last undone.
    Redo {
        /// Project directory.
        project: PathBuf,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Prints the history of the project, oldest first.
    History {
        /// Project directory.
        project: PathBuf,
    },

    /// Lines layers up on an edge or centre line.
    Align {
        /// Project directory.
        project: PathBuf,
        /// Layers to line up. Repeat the flag, or pass a comma-separated list.
        #[arg(long = "layer", required = true, value_delimiter = ',')]
        layers: Vec<String>,
        /// Which edge or centre line.
        #[arg(long, value_enum)]
        edge: EdgeArg,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Moves layers, as one group, onto the centre of the canvas.
    Center {
        /// Project directory.
        project: PathBuf,
        /// Layers to move.
        #[arg(long = "layer", required = true, value_delimiter = ',')]
        layers: Vec<String>,
        /// Which axis to centre on.
        #[arg(long, value_enum, default_value_t = AxisArg::Both)]
        axis: AxisArg,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Spreads layers out with equal gaps.
    Distribute {
        /// Project directory.
        project: PathBuf,
        /// Layers to spread out.
        #[arg(long = "layer", required = true, value_delimiter = ',')]
        layers: Vec<String>,
        /// Which axis to spread along.
        #[arg(long, value_enum, default_value_t = AxisArg::Horizontal)]
        axis: AxisArg,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Moves one layer against an edge of another layer, or of the canvas.
    Snap {
        /// Project directory.
        project: PathBuf,
        /// Layer to move.
        #[arg(long)]
        layer: String,
        /// Layer to snap against. Snaps to the canvas if omitted.
        #[arg(long)]
        to: Option<String>,
        /// Which edge.
        #[arg(long, value_enum)]
        edge: EdgeArg,
        #[command(flatten)]
        who: ActorArgs,
    },

    /// Prints the bounding box of the given layers, or of the whole document.
    Bounds {
        /// Project directory.
        project: PathBuf,
        /// Layers to measure. All of them if omitted.
        #[arg(long = "layer", value_delimiter = ',')]
        layers: Vec<String>,
    },

    /// Prints every pair of layers whose boxes overlap.
    Overlaps {
        /// Project directory.
        project: PathBuf,
        /// Layers to check. All of them if omitted.
        #[arg(long = "layer", value_delimiter = ',')]
        layers: Vec<String>,
    },

    /// Removes a lock left behind by a process that is gone.
    ///
    /// This build cannot tell a crashed process from a slow one, so clearing
    /// the lock is a decision a person makes, not a timeout.
    Unlock {
        /// Project directory.
        project: PathBuf,
    },
}

#[derive(Debug, Args)]
struct ActorArgs {
    /// Who is making this change, for the audit trail (PRD §10.5).
    #[arg(long, value_enum, default_value_t = ActorArg::Human)]
    actor: ActorArg,
    /// Which human, agent, script, or adapter.
    #[arg(long)]
    actor_name: Option<String>,
    /// The document version this change was written against.
    ///
    /// If the document has moved on since, the change is refused rather than
    /// overwriting work you never saw (PRD §10.3).
    #[arg(long)]
    expect_version: Option<u64>,
}

impl ActorArgs {
    fn actor(&self) -> Actor {
        let kind = match self.actor {
            ActorArg::Human => ActorKind::Human,
            ActorArg::Agent => ActorKind::Agent,
            ActorArg::Script => ActorKind::Script,
            ActorArg::Adapter => ActorKind::Adapter,
        };
        match &self.actor_name {
            Some(name) => Actor::named(kind, name),
            None => Actor::new(kind),
        }
    }
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum EdgeArg {
    Left,
    Right,
    Top,
    Bottom,
    CenterHorizontal,
    CenterVertical,
}

impl From<EdgeArg> for AlignEdge {
    fn from(edge: EdgeArg) -> Self {
        match edge {
            EdgeArg::Left => Self::Left,
            EdgeArg::Right => Self::Right,
            EdgeArg::Top => Self::Top,
            EdgeArg::Bottom => Self::Bottom,
            EdgeArg::CenterHorizontal => Self::CenterHorizontal,
            EdgeArg::CenterVertical => Self::CenterVertical,
        }
    }
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum AxisArg {
    Horizontal,
    Vertical,
    Both,
}

impl From<AxisArg> for Axis {
    fn from(axis: AxisArg) -> Self {
        match axis {
            AxisArg::Horizontal => Self::Horizontal,
            AxisArg::Vertical => Self::Vertical,
            AxisArg::Both => Self::Both,
        }
    }
}

#[derive(Debug, Clone, Copy, ValueEnum)]
enum ActorArg {
    Human,
    Agent,
    Script,
    Adapter,
}

/// Milliseconds since the Unix epoch, for the audit trail.
///
/// The clock is read here, in the transport, and passed in. Nothing in the
/// core reads it — that is what lets a test produce the same journal twice.
fn now_millis() -> Option<u64> {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_millis() as u64)
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

impl From<Fit> for ImageFit {
    fn from(fit: Fit) -> Self {
        match fit {
            Fit::Fill => Self::Fill,
            Fit::Contain => Self::Contain,
            Fit::Cover => Self::Cover,
        }
    }
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
    #[error(transparent)]
    Session(#[from] SessionError),
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
            let session = Session::create(&project, document, now_millis())?;
            println!("{}", session.document().id);
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
            who,
        } => {
            let mut session = open_session(&project)?;
            let outcome = add_layer(
                &mut session,
                NewLayerKind::Text {
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
                },
                &box_,
                &who,
            )?;
            print_created(&outcome);
            Ok(())
        }

        Command::AddImage {
            project,
            file,
            fit,
            box_,
            who,
        } => {
            let mut session = open_session(&project)?;
            let asset_id = import_into(&mut session, &file)?.0;
            let outcome = add_layer(
                &mut session,
                NewLayerKind::Image {
                    asset: asset_id,
                    fit: fit.into(),
                },
                &box_,
                &who,
            )?;
            print_created(&outcome);
            Ok(())
        }

        Command::AddSvg {
            project,
            file,
            fit,
            box_,
            who,
        } => {
            let mut session = open_session(&project)?;
            let (asset_id, report) = import_into(&mut session, &file)?;
            let outcome = add_layer(
                &mut session,
                NewLayerKind::Svg {
                    asset: asset_id,
                    fit: fit.into(),
                },
                &box_,
                &who,
            )?;

            // Say what was taken out. Silently altering someone's artwork
            // would be worse than refusing it.
            if let Some(report) = report.filter(|r| !r.is_clean()) {
                for (label, items) in [
                    ("elements", &report.removed_elements),
                    ("attributes", &report.removed_attributes),
                    ("external references", &report.removed_references),
                ] {
                    if !items.is_empty() {
                        eprintln!(
                            "removed unsafe {label}: {}",
                            items.iter().cloned().collect::<Vec<_>>().join(", ")
                        );
                    }
                }
            }

            print_created(&outcome);
            Ok(())
        }

        Command::Render {
            project,
            out,
            fonts,
        } => {
            let document = Session::open_read_only(&project)?.document().clone();
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
            let document = Session::open_read_only(&project)?.document().clone();
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
            let session = Session::open_read_only(&project)?;
            println!("{}", serde_json::to_string_pretty(session.document())?);
            Ok(())
        }

        Command::Undo { project, who } => {
            let mut session = open_session(&project)?;
            let transaction = session.undo(&who.actor(), now_millis(), &mut UlidIdSource)?;
            println!("{transaction}");
            Ok(())
        }

        Command::Redo { project, who } => {
            let mut session = open_session(&project)?;
            let transaction = session.redo(&who.actor(), now_millis(), &mut UlidIdSource)?;
            println!("{transaction}");
            Ok(())
        }

        Command::History { project } => {
            let session = Session::open_read_only(&project)?;
            for entry in session.history().entries() {
                let what = match &entry.kind {
                    EntryKind::Applied { operation, .. } => operation_name(operation).to_owned(),
                    EntryKind::Undone { target } => format!("undo {target}"),
                    EntryKind::Redone { target } => format!("redo {target}"),
                    // The enum is non-exhaustive so history written by a newer
                    // build still lists, rather than refusing to print.
                    _ => "unknown".to_owned(),
                };
                let who = entry
                    .actor
                    .detail
                    .as_ref()
                    .map(|detail| format!(" ({detail})"))
                    .unwrap_or_default();
                println!(
                    "{}\t{}\t{:?}{}\t{}",
                    entry.position, entry.transaction, entry.actor.kind, who, what
                );
            }
            println!(
                "position {} of {}",
                session.history().position(),
                session.history().head()
            );
            Ok(())
        }

        Command::Align {
            project,
            layers,
            edge,
            who,
        } => {
            let mut session = open_session(&project)?;
            run_layout(
                &mut session,
                Operation::Align {
                    ids: layer_ids(&layers),
                    edge: edge.into(),
                },
                &who,
            )
        }

        Command::Center {
            project,
            layers,
            axis,
            who,
        } => {
            let mut session = open_session(&project)?;
            run_layout(
                &mut session,
                Operation::CenterOnCanvas {
                    ids: layer_ids(&layers),
                    axis: axis.into(),
                },
                &who,
            )
        }

        Command::Distribute {
            project,
            layers,
            axis,
            who,
        } => {
            let mut session = open_session(&project)?;
            run_layout(
                &mut session,
                Operation::Distribute {
                    ids: layer_ids(&layers),
                    axis: axis.into(),
                },
                &who,
            )
        }

        Command::Snap {
            project,
            layer,
            to,
            edge,
            who,
        } => {
            let mut session = open_session(&project)?;
            let target = match to {
                Some(other) => SnapTarget::Layer {
                    id: assemblash_core::LayerId::new(other),
                    edge: edge.into(),
                },
                None => SnapTarget::Canvas { edge: edge.into() },
            };
            run_layout(
                &mut session,
                Operation::SnapTo {
                    id: assemblash_core::LayerId::new(layer),
                    target,
                },
                &who,
            )
        }

        Command::Bounds { project, layers } => {
            let session = Session::open_read_only(&project)?;
            let ids = chosen_or_all(session.document(), &layers);
            let bounds = layout::bounding_box(session.document(), &ids)
                .map_err(assemblash_core::ops::OpError::from)
                .map_err(SessionError::from)?;
            println!(
                "{} {} {} {}",
                bounds.x, bounds.y, bounds.width, bounds.height
            );
            Ok(())
        }

        Command::Overlaps { project, layers } => {
            let session = Session::open_read_only(&project)?;
            let ids = chosen_or_all(session.document(), &layers);
            let overlaps = layout::find_overlaps(session.document(), &ids)
                .map_err(assemblash_core::ops::OpError::from)
                .map_err(SessionError::from)?;
            for (first, second) in overlaps {
                println!("{first}\t{second}");
            }
            Ok(())
        }

        Command::Unlock { project } => {
            if session::force_unlock(&project)? {
                println!("lock removed");
            } else {
                println!("no lock to remove");
            }
            Ok(())
        }
    }
}

/// Applies a layout operation and reports which layers actually moved.
fn run_layout(
    session: &mut Session,
    operation: Operation,
    who: &ActorArgs,
) -> Result<(), CliError> {
    let (outcome, _) = session.apply(
        &operation,
        &who.actor(),
        now_millis(),
        who.expect_version,
        &mut UlidIdSource,
    )?;
    for id in &outcome.changed {
        println!("{id}");
    }
    Ok(())
}

fn layer_ids(raw: &[String]) -> Vec<assemblash_core::LayerId> {
    raw.iter()
        .map(|id| assemblash_core::LayerId::new(id.clone()))
        .collect()
}

/// The layers named, or every layer in the document when none were.
fn chosen_or_all(document: &Document, raw: &[String]) -> Vec<assemblash_core::LayerId> {
    if raw.is_empty() {
        layout::all_layer_ids(document)
    } else {
        layer_ids(raw)
    }
}

/// Opens a project for editing, saying plainly when it had to be repaired.
fn open_session(project: &Path) -> Result<Session, CliError> {
    let session = Session::open(project, now_millis())?;
    if session.recovered_from_interrupted_write() {
        eprintln!("recovered an interrupted write: the document was rebuilt from history");
    }
    Ok(session)
}

/// Imports an asset into an open project and records it on the document.
///
/// Importing changes the project directory rather than the layer tree, so it
/// is not an operation; the layer that references the asset goes through the
/// operation layer as usual.
fn import_into(
    session: &mut Session,
    file: &Path,
) -> Result<
    (
        assemblash_core::AssetId,
        Option<assemblash_core::svg_import::SvgImportReport>,
    ),
    CliError,
> {
    let project = session.project_dir().to_path_buf();
    let (asset, report) = storage::import_asset_reporting(&project, file, &mut UlidIdSource)?;
    let asset_id = asset.id.clone();
    session.register_asset(asset)?;
    Ok((asset_id, report))
}

fn operation_name(operation: &Operation) -> &'static str {
    match operation {
        Operation::Create(_) => "create",
        Operation::Update(_) => "update",
        Operation::Delete { .. } => "delete",
        Operation::Duplicate { .. } => "duplicate",
        Operation::Move { .. } => "move",
        Operation::Resize { .. } => "resize",
        Operation::Rotate { .. } => "rotate",
        Operation::Reorder { .. } => "reorder",
        Operation::Group { .. } => "group",
        Operation::Ungroup { .. } => "ungroup",
        Operation::SetVisible { .. } => "setVisible",
        Operation::SetLocked { .. } => "setLocked",
        Operation::Rename { .. } => "rename",
        Operation::Align { .. } => "align",
        Operation::CenterOnCanvas { .. } => "centerOnCanvas",
        Operation::Distribute { .. } => "distribute",
        Operation::SnapTo { .. } => "snapTo",
        // Operation is non-exhaustive, so history written by a newer build
        // still lists rather than refusing to print.
        _ => "operation",
    }
}

/// Adds a layer through the operation layer, journalled and saved.
///
/// The CLI does not touch `document.layers` itself: every transport goes
/// through the same operations (PRD §7.2), so validation, history, and
/// protection cannot be bypassed by one of them.
fn add_layer(
    session: &mut Session,
    kind: NewLayerKind,
    box_: &BoxArgs,
    who: &ActorArgs,
) -> Result<OpOutcome, CliError> {
    let operation = Operation::Create(CreateLayer {
        position: LayerPosition::Root { index: None },
        transform: Transform {
            rotation: box_.rotation,
            ..Transform::new(box_.x, box_.y, box_.width, box_.height)
        },
        name: box_.layer_name.clone(),
        kind,
    });
    let (outcome, _) = session.apply(
        &operation,
        &who.actor(),
        now_millis(),
        who.expect_version,
        &mut UlidIdSource,
    )?;

    // Opacity is not part of creating a layer, so it is a second operation on
    // the layer that was just made.
    if box_.opacity != 1.0 {
        if let Some(id) = outcome.created.first() {
            let set_opacity = assemblash_core::ops::UpdateLayer {
                opacity: Some(box_.opacity),
                ..assemblash_core::ops::UpdateLayer::new(id.clone())
            };
            session.apply(
                &Operation::Update(set_opacity),
                &who.actor(),
                now_millis(),
                None,
                &mut UlidIdSource,
            )?;
        }
    }
    Ok(outcome)
}

fn print_created(outcome: &OpOutcome) {
    for id in &outcome.created {
        println!("{id}");
    }
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
