//! The `assemblash` binary.
//!
//! Scaffolding for the Phase 0 spike: enough commands to build a document,
//! save it, reload it, and export a PNG from a script. It is deliberately
//! thin — the real surfaces are the HTTP API and MCP, over the same operation
//! layer in `assemblash-core`.

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
use assemblash_core::workspace::Workspace;
use assemblash_core::{Color, Document};
use assemblash_renderer::install::{self, HttpFetcher, InstallError, Manifest};
use assemblash_renderer::raster::{font_files_in, LoadedFonts, PngMetadata};
use assemblash_renderer::store::{FontStore, FontStoreError};
use assemblash_renderer::{doc_to_svg, svg_to_pixmap};
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

    /// Manages the local font store.
    #[command(subcommand)]
    Font(FontCommand),

    /// Serves the local HTTP API.
    ///
    /// Listens on 127.0.0.1 only. Making it reachable from the network is a
    /// decision with an authentication question attached, and is not something
    /// this release lets you turn on by accident.
    Serve {
        /// Workspace to serve. Defaults to this machine's data directory,
        /// created on first run.
        #[arg(long, env = "ASSEMBLASH_WORKSPACE")]
        workspace: Option<PathBuf>,
        /// Port to try first. Falls back to one the OS picks if it is taken.
        #[arg(long)]
        port: Option<u16>,
        /// Serve the interface from this directory instead of the copy built
        /// into the binary. For working on the interface itself.
        #[arg(long)]
        ui_dir: Option<PathBuf>,
    },

    /// Serves the Model Context Protocol over standard input and output.
    ///
    /// Started by an agent client, not by a person: it speaks a protocol on
    /// stdin and stdout and exits when the client closes them. Standard output
    /// carries protocol frames and nothing else; anything to say goes to
    /// standard error.
    Mcp {
        /// Workspace to serve. Tools take a project name from `list_projects`.
        #[arg(long, env = "ASSEMBLASH_WORKSPACE")]
        workspace: Option<PathBuf>,
        /// Serve one project directory instead of a workspace. The project
        /// argument on each tool then becomes optional.
        #[arg(long)]
        project: Option<PathBuf>,
    },

    /// Prints where this machine's workspace is, creating it if needed.
    Workspace {
        /// Workspace to report on. Defaults to this machine's data directory.
        #[arg(long, env = "ASSEMBLASH_WORKSPACE")]
        workspace: Option<PathBuf>,
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

/// The font store: a directory of hash-pinned font files.
///
/// The store has no default location in this build. The workspace (v0.6) is
/// what gives it a home; until then it is named explicitly, which also keeps
/// scripted and containerised runs honest about which fonts they used.
#[derive(Debug, Subcommand)]
enum FontCommand {
    /// Imports a font file into the store.
    ///
    /// TTF, OTF, TrueType collections, WOFF, and WOFF2. Web fonts are
    /// decompressed on the way in, so nothing has to decompress anything while
    /// rendering.
    Add {
        /// Font file to import.
        file: PathBuf,
        /// Licence to record against it, e.g. `OFL-1.1`.
        #[arg(long)]
        license: Option<String>,
        #[command(flatten)]
        store: StoreArgs,
    },

    /// Lists what the store holds.
    List {
        /// Print every face rather than one line per family.
        #[arg(long)]
        faces: bool,
        #[command(flatten)]
        store: StoreArgs,
    },

    /// Downloads a font named in the bundled manifest, once, and verifies it.
    ///
    /// This is the only thing in Assemblash that uses the network, and it does
    /// so only when asked. Rendering never does, and fonts already installed
    /// keep working with no network at all.
    Install {
        /// Family to install. Omit to install a whole pack.
        family: Option<String>,
        /// Pack to install instead of a single family.
        #[arg(long)]
        pack: Option<String>,
        /// List what could be installed, and download nothing.
        ///
        /// The list comes from the manifest compiled into this binary, so it
        /// needs neither a store nor a network.
        #[arg(long)]
        list: bool,
        /// Directory holding the font store. Required unless `--list`.
        #[arg(long = "font-store", env = "ASSEMBLASH_FONT_STORE")]
        font_store: Option<PathBuf>,
    },

    /// Re-hashes every file in the store and reports the first that changed.
    Verify {
        #[command(flatten)]
        store: StoreArgs,
    },

    /// Prints the licence recorded for each font in the store.
    Licenses {
        #[command(flatten)]
        store: StoreArgs,
    },

    /// Removes a family and any file it was the last user of.
    Remove {
        /// Family to remove.
        family: String,
        #[command(flatten)]
        store: StoreArgs,
    },
}

#[derive(Debug, Args)]
struct StoreArgs {
    /// Directory holding the font store.
    #[arg(long = "font-store", env = "ASSEMBLASH_FONT_STORE")]
    font_store: PathBuf,
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
    /// Font store to resolve the document's families against.
    ///
    /// Only the families the document actually names are loaded, so adding an
    /// unrelated font to the store cannot change an existing document's
    /// pixels.
    #[arg(long = "font-store", env = "ASSEMBLASH_FONT_STORE")]
    font_store: Option<PathBuf>,
}

impl FontArgs {
    fn names_nothing(&self) -> bool {
        self.font_dirs.is_empty() && self.font_files.is_empty() && self.font_store.is_none()
    }
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
    #[error(transparent)]
    FontStore(#[from] FontStoreError),
    #[error(transparent)]
    Install(#[from] InstallError),
    #[error("this document uses text, so name its fonts: --font, --font-dir, or --font-store")]
    NoFonts,
    #[error("say which font to install: a family name, or --pack")]
    InstallTarget,
    #[error("say where the font store is: --font-store")]
    NoStore,
    #[error(transparent)]
    Workspace(#[from] assemblash_core::WorkspaceError),
    #[error(transparent)]
    Serve(#[from] assemblash_server::ServeError),
    #[error(transparent)]
    Mcp(#[from] assemblash_mcp::McpError),
    #[error("starting the server: {source}")]
    Runtime { source: std::io::Error },
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
            let hrefs = assemblash_renderer::data_uris(&document, &project)?;
            let loaded = load_fonts(&fonts, &document)?;
            let svg = doc_to_svg(&document, loaded.font_set(), &hrefs)?;
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
            let hrefs = assemblash_renderer::data_uris(&document, &project)?;
            let loaded = load_fonts(&fonts, &document)?;
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

        Command::Font(command) => run_font(command),

        Command::Serve {
            workspace,
            port,
            ui_dir,
        } => {
            let workspace = open_workspace(workspace)?;
            let port = port.unwrap_or(workspace.config().port);
            let ui = match ui_dir {
                Some(directory) => assemblash_server::UiSource::Directory(directory),
                None => assemblash_server::UiSource::Embedded,
            };
            // One runtime, built here rather than by an attribute on `main`,
            // so every other command stays a plain synchronous program with no
            // async runtime started for it.
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .map_err(|source| CliError::Runtime { source })?;
            runtime.block_on(async move {
                let server = assemblash_server::Server::bind(workspace, port, ui).await?;
                println!("{}", server.url());
                server.serve().await
            })?;
            Ok(())
        }

        Command::Mcp { workspace, project } => {
            // Nothing in this arm may print to stdout: the protocol owns it.
            let backend = match project {
                Some(directory) => assemblash_mcp::Backend::single_project(directory),
                None => assemblash_mcp::Backend::workspace(open_workspace(workspace)?),
            };
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .map_err(|source| CliError::Runtime { source })?;
            runtime.block_on(assemblash_mcp::serve(backend))?;
            Ok(())
        }

        Command::Workspace { workspace } => {
            let workspace = open_workspace(workspace)?;
            println!("{}", workspace.root().display());
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

/// Every font family the document asks for, sorted and deduplicated.
fn families_used(document: &Document) -> Vec<String> {
    let mut families = std::collections::BTreeSet::new();
    document.walk_layers(&mut |layer| {
        if let assemblash_core::document::LayerKind::Text(text) = &layer.kind {
            families.insert(text.font_family.clone());
        }
    });
    families.into_iter().collect()
}

/// Resolves the fonts a render may use, from files, directories, and a store.
///
/// The store contributes exactly the families the document names: a render
/// must not change because something unrelated was installed afterwards.
fn load_fonts(args: &FontArgs, document: &Document) -> Result<LoadedFonts, CliError> {
    // A document with text but no fonts named used to render anyway, placing
    // the first baseline one whole font size below the box top instead of one
    // ascent. Rather than have two placements depending on how the command was
    // called, a document that needs a font has to be told where it is.
    if args.names_nothing() && !families_used(document).is_empty() {
        return Err(CliError::NoFonts);
    }

    let mut paths = args.font_files.clone();
    for directory in &args.font_dirs {
        paths.extend(font_files_in(directory)?);
    }

    if let Some(directory) = &args.font_store {
        let store = FontStore::open(directory)?;
        // Families already covered by an explicit file are not looked up, so
        // naming a file for a family the store also has is not an error.
        let explicit = LoadedFonts::from_files(paths.clone())?;
        let wanted: Vec<String> = families_used(document)
            .into_iter()
            .filter(|family| !explicit.font_set().contains(family))
            .collect();
        for family in &wanted {
            if !store.has_family(family) {
                return Err(CliError::FontStore(FontStoreError::UnknownFamily {
                    family: family.clone(),
                    path: directory.clone(),
                }));
            }
        }
        for record in store.records() {
            if wanted.iter().any(|family| family == &record.family) {
                paths.push(store.file_path(&record.file));
            }
        }
    }

    // Sorted, so font resolution — and therefore the pixels — does not depend
    // on the order the arguments happened to arrive in.
    paths.sort();
    paths.dedup();
    Ok(LoadedFonts::from_files(paths)?)
}

/// Opens a workspace, at the given path or at this machine's default.
fn open_workspace(explicit: Option<PathBuf>) -> Result<Workspace, CliError> {
    let root = match explicit {
        Some(path) => path,
        None => Workspace::default_dir()?,
    };
    Ok(Workspace::open_or_create(root)?)
}

fn open_store(args: &StoreArgs) -> Result<FontStore, CliError> {
    Ok(FontStore::open(&args.font_store)?)
}

fn run_font(command: FontCommand) -> Result<(), CliError> {
    match command {
        FontCommand::Add {
            file,
            license,
            store,
        } => {
            let mut store = open_store(&store)?;
            for record in store.import_file(&file, None, license)? {
                println!(
                    "{}\t{}\t{}\t{}",
                    record.family, record.style, record.weight, record.file
                );
            }
            Ok(())
        }

        FontCommand::List { faces, store } => {
            let store = open_store(&store)?;
            if faces {
                for record in store.records() {
                    println!(
                        "{}\t{}\t{}\t{}\t{}",
                        record.family, record.style, record.weight, record.hash, record.file
                    );
                }
            } else {
                for family in store.families() {
                    println!("{family}");
                }
            }
            Ok(())
        }

        FontCommand::Install {
            family,
            pack,
            list,
            font_store,
        } => {
            let manifest = Manifest::bundled()?;
            if list {
                for entry in &manifest.families {
                    println!(
                        "{}\t{}\t{}",
                        entry.name,
                        entry.license,
                        entry.packs.join(",")
                    );
                }
                return Ok(());
            }

            let Some(directory) = font_store else {
                return Err(CliError::NoStore);
            };
            let mut store = FontStore::open(directory)?;
            let fetcher = HttpFetcher;
            let installed = match (&family, &pack) {
                (Some(family), None) => {
                    install::install_family(&mut store, &manifest, family, &fetcher)?
                }
                (None, Some(pack)) => install::install_pack(&mut store, &manifest, pack, &fetcher)?,
                _ => return Err(CliError::InstallTarget),
            };
            for record in installed {
                println!("{}\t{}", record.family, record.hash);
            }
            Ok(())
        }

        FontCommand::Verify { store } => {
            open_store(&store)?.verify()?;
            println!("every font matches its recorded hash");
            Ok(())
        }

        FontCommand::Licenses { store } => {
            let store = open_store(&store)?;
            for record in store.records() {
                println!(
                    "{}\t{}\t{}",
                    record.family,
                    record.license.as_deref().unwrap_or("unrecorded"),
                    record.source.as_deref().unwrap_or("unrecorded"),
                );
            }
            Ok(())
        }

        FontCommand::Remove { family, store } => {
            let mut store = open_store(&store)?;
            let removed = store.remove_family(&family)?;
            println!("{removed}");
            Ok(())
        }
    }
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
