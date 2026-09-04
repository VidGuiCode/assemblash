//! The mutating tools.
//!
//! Named tools rather than one generic `apply_operation`: agents are bad at
//! guessing structure (PRD R2), and a typed schema with a description is the
//! whole reason MCP beats handing over a JSON blob. There is deliberately no
//! generic escape hatch — it would let an agent build operations no tool
//! describes, which is the surface the safeguards exist to bound.
//!
//! Every one of these is three lines of translation over
//! [`Backend::apply`](crate::backend::Backend::apply), which is where the dry
//! run, the expected version, the protected-layer refusal, and the transaction
//! id live.

use assemblash_core::document::{BlendMode, Effect, ImageFit, TextAlign, Transform};
use assemblash_core::ops::{
    AlignEdge, Axis, CreateLayer, LayerPosition, NewLayerKind, SnapTarget, UpdateLayer,
};
use assemblash_core::{AssetId, Color, LayerId, Operation};
use rmcp::handler::server::wrapper::{Json, Parameters};
use rmcp::model::ErrorData;
use rmcp::{tool, tool_router};
use schemars::JsonSchema;
use serde::Deserialize;

use crate::backend::ProjectSummary;
use crate::server::{to_error, AssemblashMcp};
use crate::writes::{ExportResult, OpenedProject, WriteEnvelope, WriteOutcome};

/// A box: where a layer sits and how big it is.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct BoxArgs {
    /// Left edge, in the parent's coordinate space.
    pub x: f64,
    /// Top edge.
    pub y: f64,
    /// Box width.
    pub width: f64,
    /// Box height.
    pub height: f64,
    /// Clockwise rotation in degrees about the box centre.
    #[serde(default)]
    pub rotation: Option<f64>,
}

impl From<&BoxArgs> for Transform {
    fn from(args: &BoxArgs) -> Self {
        Self {
            rotation: args.rotation.unwrap_or(0.0),
            ..Self::new(args.x, args.y, args.width, args.height)
        }
    }
}

/// Where a new layer goes.
#[derive(Debug, Clone, Default, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PlacementArgs {
    /// Group to put it in. Omit for the top level.
    #[serde(default)]
    pub parent: Option<String>,
    /// Index among its siblings. Omit to put it on top.
    #[serde(default)]
    pub index: Option<usize>,
}

impl From<&PlacementArgs> for LayerPosition {
    fn from(args: &PlacementArgs) -> Self {
        match &args.parent {
            Some(parent) => Self::In {
                parent: LayerId::new(parent.clone()),
                index: args.index,
            },
            None => Self::Root { index: args.index },
        }
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddTextArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// The text. A newline starts a new line.
    pub text: String,
    /// Font family, spelled as the font store reports it. A family that is not
    /// installed is an error at render time, never a substitution.
    pub font_family: String,
    /// Font size in pixels.
    pub font_size: f64,
    /// Fill colour, `#rrggbb` or `#rrggbbaa`.
    #[serde(default)]
    pub color: Option<String>,
    /// `left`, `center`, or `right`.
    #[serde(default)]
    pub align: Option<TextAlign>,
    /// Line height as a multiple of the font size.
    #[serde(default)]
    pub line_height: Option<f64>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddImageArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// Id of an asset already in the document, as `get_document_state`
    /// reports it. There is no tool that imports a file from a path.
    pub asset: String,
    /// How the image fills its box: `fill`, `contain`, or `cover`.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AddSvgArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub placement: PlacementArgs,
    #[serde(flatten)]
    pub box_: BoxArgs,
    /// Id of an SVG asset already in the document, as `get_document_state`
    /// reports it. There is no tool that imports a file from a path, and none
    /// that takes markup: an asset is sanitised when it is imported, so
    /// everything drawn from one is safe by construction.
    pub asset: String,
    /// How the graphic fills its box: `fill`, `contain`, or `cover`.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// Human-facing layer name.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to change.
    pub layer_id: String,
    /// New opacity, 0 to 1.
    #[serde(default)]
    pub opacity: Option<f64>,
    /// New text, for a text layer.
    #[serde(default)]
    pub text: Option<String>,
    /// New font family, for a text layer.
    #[serde(default)]
    pub font_family: Option<String>,
    /// New font size, for a text layer.
    #[serde(default)]
    pub font_size: Option<f64>,
    /// New colour, for a text layer.
    #[serde(default)]
    pub color: Option<String>,
    /// New alignment, for a text layer.
    #[serde(default)]
    pub align: Option<TextAlign>,
    /// New line height, as a multiple of the font size, for a text layer.
    #[serde(default)]
    pub line_height: Option<f64>,
    /// New fit, for an image or SVG layer.
    #[serde(default)]
    pub fit: Option<ImageFit>,
    /// How the layer composites onto what is beneath it: normal, multiply,
    /// screen, overlay, darken, lighten, hard-light, soft-light, difference,
    /// exclusion, hue, saturation, color, luminosity. A mode this build does
    /// not render — including color-dodge and color-burn, which are not
    /// reproducible byte for byte on every target — is refused rather than
    /// drawn as normal.
    #[serde(default)]
    pub blend_mode: Option<BlendMode>,
    /// The whole effect stack, in order, replacing whatever is there:
    /// `[{"type":"brightness","amount":1.2},{"type":"blur","radius":3}]`.
    /// Pass `[]` to clear it. Grain takes a `seed`, so the same document
    /// always produces the same noise.
    #[serde(default)]
    pub effects: Option<Vec<Effect>>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct LayerTargetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to act on.
    pub layer_id: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct MoveArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move.
    pub layer_id: String,
    /// Distance along x. Positive is right.
    pub dx: f64,
    /// Distance along y. Positive is down.
    pub dy: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ResizeArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to resize.
    pub layer_id: String,
    /// New width.
    pub width: f64,
    /// New height.
    pub height: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RotateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to rotate.
    pub layer_id: String,
    /// Degrees clockwise to rotate *to*, not by.
    pub degrees: f64,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ReorderArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move in the tree.
    pub layer_id: String,
    #[serde(flatten)]
    pub placement: PlacementArgs,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct GroupArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to wrap. They must currently share a parent.
    pub layer_ids: Vec<String>,
    /// Name for the new group.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FlagArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to change.
    pub layer_id: String,
    /// The value to set.
    pub value: bool,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenameArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to rename.
    pub layer_id: String,
    /// The new name. Omit to clear it.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AlignArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to line up. Explicit ids: there is no stored selection.
    pub layer_ids: Vec<String>,
    /// Which edge or centre line.
    pub edge: AlignEdge,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct AxisArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layers to act on.
    pub layer_ids: Vec<String>,
    /// Which axis.
    pub axis: Axis,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SnapArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Layer to move.
    pub layer_id: String,
    /// Layer to snap against. Omit to snap to the canvas.
    #[serde(default)]
    pub target_layer_id: Option<String>,
    /// Which edge to snap to.
    pub edge: AlignEdge,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExportArgs {
    /// Project to export. Omit to use the one in use.
    #[serde(default)]
    pub project: Option<String>,
    /// Multiplier on the canvas size.
    #[serde(default)]
    pub scale: Option<f32>,
    /// File name stem, without an extension. Letters, digits, hyphens, and
    /// underscores only — the directory is not yours to choose.
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectArgs {
    /// Project to use for later calls, as `list_projects` reports it.
    pub project: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct NewProjectArgs {
    /// Name for the new project, and the name every later call passes as
    /// `project`. Letters, digits, hyphens, and underscores; a name that is
    /// really a path is refused, and so is one already taken.
    pub project: String,
    /// Canvas width in pixels.
    pub width: f64,
    /// Canvas height in pixels.
    pub height: f64,
    /// Canvas background, `#rrggbb` or `#rrggbbaa`. Omit for none, which
    /// exports as transparent.
    #[serde(default)]
    pub background: Option<String>,
    /// Human-facing document name. Not an identifier.
    #[serde(default)]
    pub name: Option<String>,
}

#[tool_router(router = write_tool_router, vis = "pub(crate)")]
impl AssemblashMcp {
    /// Adds a text layer.
    #[tool(
        description = "Add a text layer to a project. Fonts are not substituted: the family \
                       must be one the font store has. Set dryRun to see what would happen \
                       without doing it."
    )]
    async fn add_text_layer(
        &self,
        Parameters(args): Parameters<AddTextArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Text {
                text: args.text.clone(),
                font_family: args.font_family.clone(),
                font_size: args.font_size,
                color: args.color.clone().map(Color::new).unwrap_or_default(),
                align: args.align.unwrap_or_default(),
                line_height: args.line_height.unwrap_or(1.2),
            },
        });
        self.write(&args.write, operation)
    }

    /// Adds an image layer for an asset already in the document.
    #[tool(
        description = "Add an image layer for an asset already imported into the project. \
                       There is no tool that imports a file from a path."
    )]
    async fn add_image_layer(
        &self,
        Parameters(args): Parameters<AddImageArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Image {
                asset: AssetId::new(args.asset.clone()),
                fit: args.fit.unwrap_or_default(),
            },
        });
        self.write(&args.write, operation)
    }

    /// Adds an SVG layer for an asset already in the document.
    #[tool(
        description = "Add a vector graphic layer for an SVG asset already imported into the \
                       project. There is no tool that imports a file from a path, and none \
                       that takes markup: an SVG is sanitised on the way in, so a layer can \
                       only ever draw one that already was."
    )]
    async fn add_svg_layer(
        &self,
        Parameters(args): Parameters<AddSvgArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Create(CreateLayer {
            position: (&args.placement).into(),
            transform: (&args.box_).into(),
            name: args.name.clone(),
            kind: NewLayerKind::Svg {
                asset: AssetId::new(args.asset.clone()),
                fit: args.fit.unwrap_or_default(),
            },
        });
        self.write(&args.write, operation)
    }

    /// Changes a layer's properties.
    #[tool(
        description = "Change properties of an existing layer. Only the fields you pass are \
                       touched; omitting one leaves it alone."
    )]
    async fn update_layer(
        &self,
        Parameters(args): Parameters<UpdateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let operation = Operation::Update(UpdateLayer {
            opacity: args.opacity,
            text: args.text.clone(),
            font_family: args.font_family.clone(),
            font_size: args.font_size,
            color: args.color.clone().map(Color::new),
            align: args.align,
            line_height: args.line_height,
            fit: args.fit,
            blend_mode: args.blend_mode.clone(),
            effects: args.effects.clone(),
            ..UpdateLayer::new(LayerId::new(args.layer_id.clone()))
        });
        self.write(&args.write, operation)
    }

    /// Moves a layer.
    #[tool(description = "Move a layer by a distance, leaving its size and rotation alone.")]
    async fn move_layer(
        &self,
        Parameters(args): Parameters<MoveArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Move {
                id: LayerId::new(args.layer_id.clone()),
                dx: args.dx,
                dy: args.dy,
            },
        )
    }

    /// Resizes a layer.
    #[tool(description = "Set a layer's box size, leaving its position and rotation alone.")]
    async fn resize_layer(
        &self,
        Parameters(args): Parameters<ResizeArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Resize {
                id: LayerId::new(args.layer_id.clone()),
                width: args.width,
                height: args.height,
            },
        )
    }

    /// Rotates a layer.
    #[tool(description = "Set a layer's rotation: the angle to rotate to, not by.")]
    async fn rotate_layer(
        &self,
        Parameters(args): Parameters<RotateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Rotate {
                id: LayerId::new(args.layer_id.clone()),
                degrees: args.degrees,
            },
        )
    }

    /// Moves a layer elsewhere in the tree.
    #[tool(
        description = "Move a layer to another parent, another z-order position, or both. \
                       Array order is z-order: later means on top."
    )]
    async fn reorder_layer(
        &self,
        Parameters(args): Parameters<ReorderArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Reorder {
                id: LayerId::new(args.layer_id.clone()),
                to: (&args.placement).into(),
            },
        )
    }

    /// Wraps layers in a group.
    #[tool(
        description = "Wrap sibling layers in a new group without moving the picture. They \
                       must currently share a parent."
    )]
    async fn group_layers(
        &self,
        Parameters(args): Parameters<GroupArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Group {
                ids: layer_ids(&args.layer_ids),
                name: args.name.clone(),
            },
        )
    }

    /// Dissolves a group.
    #[tool(description = "Replace a group with its children, in place.")]
    async fn ungroup_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Ungroup {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Copies a layer.
    #[tool(description = "Copy a layer, and everything inside it, directly above the original.")]
    async fn duplicate_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Duplicate {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Removes a layer.
    #[tool(
        description = "Remove a layer and everything inside it. Reversible: the result carries \
                       a transaction id, and undo restores the document exactly."
    )]
    async fn delete_layer(
        &self,
        Parameters(args): Parameters<LayerTargetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Delete {
                id: LayerId::new(args.layer_id.clone()),
            },
        )
    }

    /// Shows or hides a layer.
    #[tool(description = "Show or hide a layer.")]
    async fn set_layer_visible(
        &self,
        Parameters(args): Parameters<FlagArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::SetVisible {
                id: LayerId::new(args.layer_id.clone()),
                visible: args.value,
            },
        )
    }

    /// Locks or unlocks a layer.
    #[tool(
        description = "Lock or unlock a layer. A locked layer refuses ordinary changes. This \
                       is not the same as protected, which no tool can turn off."
    )]
    async fn set_layer_locked(
        &self,
        Parameters(args): Parameters<FlagArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::SetLocked {
                id: LayerId::new(args.layer_id.clone()),
                locked: args.value,
            },
        )
    }

    /// Renames a layer.
    #[tool(description = "Rename a layer, or clear its name by omitting the name.")]
    async fn rename_layer(
        &self,
        Parameters(args): Parameters<RenameArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Rename {
                id: LayerId::new(args.layer_id.clone()),
                name: args.name.clone(),
            },
        )
    }

    /// Lines layers up.
    #[tool(
        description = "Line layers up on an edge or centre line. Typed geometry beats \
                       guessing at coordinates."
    )]
    async fn align_layers(
        &self,
        Parameters(args): Parameters<AlignArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Align {
                ids: layer_ids(&args.layer_ids),
                edge: args.edge,
            },
        )
    }

    /// Centres layers on the canvas.
    #[tool(description = "Move layers, as one group, onto the centre of the canvas.")]
    async fn center_on_canvas(
        &self,
        Parameters(args): Parameters<AxisArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::CenterOnCanvas {
                ids: layer_ids(&args.layer_ids),
                axis: args.axis,
            },
        )
    }

    /// Spreads layers out evenly.
    #[tool(description = "Spread layers out along an axis with equal gaps.")]
    async fn distribute_layers(
        &self,
        Parameters(args): Parameters<AxisArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::Distribute {
                ids: layer_ids(&args.layer_ids),
                axis: args.axis,
            },
        )
    }

    /// Snaps a layer to an edge.
    #[tool(
        description = "Move a layer so it sits against an edge of another layer, or of the canvas."
    )]
    async fn snap_layer(
        &self,
        Parameters(args): Parameters<SnapArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        let target = match &args.target_layer_id {
            Some(id) => SnapTarget::Layer {
                id: LayerId::new(id.clone()),
                edge: args.edge,
            },
            None => SnapTarget::Canvas { edge: args.edge },
        };
        self.write(
            &args.write,
            Operation::SnapTo {
                id: LayerId::new(args.layer_id.clone()),
                target,
            },
        )
    }

    /// Undoes the last change.
    #[tool(
        description = "Undo the last change. The document comes back byte-identical to what \
                       it was, including across restarts."
    )]
    async fn undo(
        &self,
        Parameters(args): Parameters<WriteEnvelope>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.backend()
            .undo(&self.resolved(&args))
            .map(Json)
            .map_err(to_error)
    }

    /// Redoes the change that was last undone.
    #[tool(description = "Redo the change that was last undone.")]
    async fn redo(
        &self,
        Parameters(args): Parameters<WriteEnvelope>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.backend()
            .redo(&self.resolved(&args))
            .map(Json)
            .map_err(to_error)
    }

    /// Exports a PNG into the project.
    #[tool(
        description = "Render the project to a PNG file inside the project's exports \
                       directory and report the path. The directory is not yours to choose."
    )]
    async fn export_document(
        &self,
        Parameters(args): Parameters<ExportArgs>,
    ) -> Result<Json<ExportResult>, ErrorData> {
        let project = self.resolve_project(args.project.clone());
        self.backend()
            .export(
                project.as_deref(),
                args.scale.unwrap_or(1.0),
                args.name.as_deref(),
            )
            .map(Json)
            .map_err(to_error)
    }

    /// Selects the project later calls assume.
    #[tool(
        description = "Choose the project later calls act on, so they need not repeat its \
                       name. Reports the version and layer count it found."
    )]
    async fn open_project(
        &self,
        Parameters(args): Parameters<OpenProjectArgs>,
    ) -> Result<Json<OpenedProject>, ErrorData> {
        let opened = self
            .backend()
            .open_project(&args.project)
            .map_err(to_error)?;
        self.set_current_project(&args.project);
        Ok(Json(opened))
    }

    /// Makes an empty project in the workspace.
    #[tool(
        description = "Create an empty project with the canvas size you give it, and use it \
                       for later calls. Nothing else here creates a document: every other \
                       tool changes one that exists, quoting the version it read. A server \
                       started for a single project has no workspace to put one in and says so."
    )]
    async fn create_project(
        &self,
        Parameters(args): Parameters<NewProjectArgs>,
    ) -> Result<Json<ProjectSummary>, ErrorData> {
        let summary = self
            .backend()
            .create_project(
                &args.project,
                args.width,
                args.height,
                args.background.as_deref(),
                args.name.as_deref(),
            )
            .map_err(to_error)?;
        self.set_current_project(&args.project);
        Ok(Json(summary))
    }
}

fn layer_ids(raw: &[String]) -> Vec<LayerId> {
    raw.iter().map(|id| LayerId::new(id.clone())).collect()
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct FillTemplateArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Slot name to value, as `list_slots` reports the names.
    pub values: std::collections::BTreeMap<String, String>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RenderVariantsArgs {
    /// Project holding the template. Omit to use the one in use.
    #[serde(default)]
    pub project: Option<String>,
    /// One entry per variant.
    pub variants: Vec<VariantArgs>,
    /// Multiplier on the canvas size.
    #[serde(default)]
    pub scale: Option<f32>,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct VariantArgs {
    /// File stem for this variant. Letters, digits, hyphens, underscores.
    pub name: String,
    /// Slot name to value. Slots left out keep the template's own content.
    #[serde(default)]
    pub values: std::collections::BTreeMap<String, String>,
}

#[tool_router(router = template_tool_router, vis = "pub(crate)")]
impl AssemblashMcp {
    /// Fills a template in place.
    #[tool(
        description = "Fill a template's named slots in the project itself, as one recorded \
                       change. Slots that point at protected layers are refused, like every \
                       other route to them. Use render_variants to produce several images \
                       without changing the template."
    )]
    async fn fill_template(
        &self,
        Parameters(args): Parameters<FillTemplateArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.fill(&args.write, &args.values)
    }

    /// Renders a template once per set of values.
    #[tool(
        description = "Render a template once for each set of slot values and write the PNGs \
                       into the project's exports directory. The template is not modified, \
                       and the same values always produce the same bytes."
    )]
    async fn render_variants(
        &self,
        Parameters(args): Parameters<RenderVariantsArgs>,
    ) -> Result<Json<assemblash_server::render::RenderedVariants>, ErrorData> {
        let project = self.resolve_project(args.project.clone());
        let variants: Vec<serde_json::Value> = args
            .variants
            .iter()
            .map(|variant| serde_json::json!({ "name": variant.name, "values": variant.values }))
            .collect();
        self.variants(project.as_deref(), args.scale.unwrap_or(1.0), &variants)
    }

    /// What a template offers.
    #[tool(
        description = "List a template's named slots: what each one is called, what it fills, \
                       and whether it must be given a value."
    )]
    async fn list_slots(
        &self,
        Parameters(args): Parameters<crate::server::ProjectArgs>,
    ) -> Result<Json<crate::backend::SlotList>, ErrorData> {
        self.backend()
            .slots(self.resolve_project(args.project).as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// What style bundles a document offers.
    #[tool(
        description = "List the document's named style presets: what each one is called, what                        it is for, and exactly which properties it sets."
    )]
    async fn list_presets(
        &self,
        Parameters(args): Parameters<crate::server::ProjectArgs>,
    ) -> Result<Json<crate::backend::PresetList>, ErrorData> {
        self.backend()
            .presets(self.resolve_project(args.project).as_deref())
            .map(Json)
            .map_err(to_error)
    }

    /// Stores a named style bundle.
    #[tool(
        description = "Store a named style bundle in the document, replacing any with the same                        name. A preset sets properties — font, size, colour, alignment, line                        height, opacity, blend mode, effects — and nothing about position."
    )]
    async fn define_preset(
        &self,
        Parameters(args): Parameters<DefinePresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::DefinePreset {
                preset: assemblash_core::Preset {
                    name: args.name.clone(),
                    description: args.description.clone(),
                    properties: args.properties.clone(),
                    extra: Default::default(),
                },
            },
        )
    }

    /// Removes a named style bundle.
    #[tool(
        description = "Remove a named style bundle. Layers styled by it keep their properties:                        applying a preset sets properties rather than creating a link, so this                        cannot change any picture."
    )]
    async fn delete_preset(
        &self,
        Parameters(args): Parameters<DeletePresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::DeletePreset {
                name: args.name.clone(),
            },
        )
    }

    /// Applies a named style bundle to a layer.
    #[tool(
        description = "Apply a named style bundle to a layer. Identical to setting the same                        properties by hand — it compiles to exactly that update — so it is                        journalled, undoable, and refused on a protected layer."
    )]
    async fn apply_preset(
        &self,
        Parameters(args): Parameters<ApplyPresetArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::ApplyPreset {
                id: LayerId::new(args.layer_id.clone()),
                preset: args.preset.clone(),
                allow_locked: args.allow_locked.unwrap_or(false),
            },
        )
    }

    /// Declares a named opening, making the document a template.
    #[tool(
        description = "Declare a named opening on a layer, making the document a template. \
                       Refused if the name is taken, the layer is missing, the kind does not \
                       match the layer, or the layer is protected or read-only \u{2014} a slot on \
                       chrome would be an opening that always refuses when filled."
    )]
    async fn define_slot(
        &self,
        Parameters(args): Parameters<DefineSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(&args.write, Operation::DefineSlot { slot: args.slot() })
    }

    /// Changes an existing slot.
    #[tool(
        description = "Change an existing slot, by name. Faces exactly the checks a definition \
                       faces, so an update cannot produce a slot that could not have been \
                       defined. Passing a different name renames it."
    )]
    async fn update_slot(
        &self,
        Parameters(args): Parameters<UpdateSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::UpdateSlot {
                name: args.name.clone(),
                slot: args.slot.slot(),
            },
        )
    }

    /// Removes a named opening.
    #[tool(
        description = "Remove a named opening. The layer it pointed at is untouched. Note that \
                       a layer a slot offers cannot be deleted until its slots are removed."
    )]
    async fn remove_slot(
        &self,
        Parameters(args): Parameters<RemoveSlotArgs>,
    ) -> Result<Json<WriteOutcome>, ErrorData> {
        self.write(
            &args.write,
            Operation::RemoveSlot {
                name: args.name.clone(),
            },
        )
    }
}

/// The parts of a slot a caller supplies.
#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SlotFields {
    /// What the slot is called. Unique within the document.
    pub name: String,
    /// The layer it fills.
    pub layer_id: String,
    /// What may be supplied: `text`, `image`, or `color`. Text and colour
    /// slots fill a text layer; an image slot fills an image layer.
    #[serde(default)]
    pub kind: Option<assemblash_core::SlotKind>,
    /// What this slot is for, for whoever fills it later — including an
    /// agent, which is the case that needs it most.
    #[serde(default)]
    pub description: Option<String>,
    /// Whether a variant must supply a value for it.
    #[serde(default)]
    pub required: Option<bool>,
}

impl SlotFields {
    fn slot(&self) -> assemblash_core::Slot {
        assemblash_core::Slot {
            name: self.name.clone(),
            layer: LayerId::new(self.layer_id.clone()),
            kind: self.kind.unwrap_or_default(),
            description: self.description.clone(),
            required: self.required.unwrap_or(false),
            extra: Default::default(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefineSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    #[serde(flatten)]
    pub fields: SlotFields,
}

impl DefineSlotArgs {
    fn slot(&self) -> assemblash_core::Slot {
        self.fields.slot()
    }
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which slot to change.
    pub name: String,
    /// What it should become. Its `name` may differ, which renames it.
    pub slot: SlotFields,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RemoveSlotArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which slot to remove.
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefinePresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// What the preset is called. Replaces any existing one of that name.
    pub name: String,
    /// What it is for, for whoever chooses between presets later.
    #[serde(default)]
    pub description: Option<String>,
    /// The properties it sets. Anything left out is left alone on apply.
    pub properties: assemblash_core::PresetProperties,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DeletePresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which preset to remove.
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ApplyPresetArgs {
    #[serde(flatten)]
    pub write: WriteEnvelope,
    /// Which preset, as `list_presets` reports the names.
    pub preset: String,
    /// Which layer to restyle.
    pub layer_id: String,
    /// Apply to a locked layer.
    #[serde(default)]
    pub allow_locked: Option<bool>,
}
