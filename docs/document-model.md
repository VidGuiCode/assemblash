# Document model

This page describes the document, the layer model, the project folder, and the canvas.

## The document

A project holds one document in `document.json`. The document is a JSON object.

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | integer | Schema version of the document. It is `1` for this release. |
| `id` | string | Stable document ID, `doc_<ULID>`. |
| `version` | integer | Number of mutations the document has had. Expected-version checks use it. |
| `name` | string or null | Human-facing name. It is not an identifier. |
| `canvas` | object | The surface that holds the layers. |
| `assets` | array | Imported files that image and SVG layers can use. |
| `layers` | array | The layer stack. The first layer is at the bottom. Array order is z-order. |
| `presets` | array | Named style bundles that the document offers. |
| `slots` | array | Named openings that make the document a template. |

The required fields are `schemaVersion`, `id`, and `canvas`.

The document keeps every field that this build does not know. This rule applies at every level, including inside `clip`, `crop`, `stroke`, `shape`, and the effect stack. A load and a save do not remove these fields. A new field has a default value.

## Project folder

A project is an ordinary folder. You can copy it, back it up, or give it to another person.

```text
my-project/
├── document.json
├── assets/
└── history/
    ├── journal.jsonl
    └── snapshots/
```

- `document.json` is the document. You can inspect it and edit it by hand.
- `assets/` holds imported files. Each file is named by the sha256 of its bytes.
- `history/journal.jsonl` is an append-only record. Each line is one operation, one batch, or one undo or redo record.
- `history/snapshots/` holds periodic copies of the document.
- A process writes `.assemblash-lock` in the folder while it uses the project.

The published contract is `schema/document.schema.json`. The operation contract is `schema/operation.schema.json`.

Normal changes should go through an Assemblash interface. Then the engine validates each change and records it in history.

## Canvas

The canvas is the fixed-size surface under the layers.

| Field | Rule |
| --- | --- |
| `width` | Positive finite number, in pixels. |
| `height` | Positive finite number, in pixels. |
| `background` | A solid colour, a gradient, or `null` for transparency. |
| `backgroundImage` | An asset and a fit. The image is above the background colour and below every layer. |

A canvas change does not scale the layers. The layers keep their sizes. The `anchor` sets the point of the old canvas that stays fixed. The anchor changes only the positions of the layers.

The anchor values are `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, and `bottom-right`.

In the reference editor, click **Canvas** to open the Properties panel. Set **Width**, **Height**, **Background**, and **Canvas anchor**. Select **Apply changes** to submit all canvas fields as one undoable change.

```sh
assemblash canvas set ./poster --width 1200 --height 900 --background "#102030" --anchor center
assemblash canvas set ./poster --no-background
assemblash undo ./poster
```

MCP has `update_canvas` with `width`, `height`, `background`, `anchor`, `expectedVersion`, and `dryRun`. HTTP takes the same fields in an `updateCanvas` operation. Omit `background` to keep it. Send `null` to remove it.

The engine refuses a resize that moves locked, protected, or read-only content. Nothing changes.

## Layer kinds

| Kind | It draws | Main payload |
| --- | --- | --- |
| `text` | One block of text. | `text`, `fontFamily`, `fontSize`, `runs`. |
| `image` | One raster asset in its layer box. | `asset`, `fit`, `crop`. |
| `svg` | One SVG asset in its layer box. | `asset`, `fit`. |
| `shape` | A rectangle, an ellipse, a line, or a path. | `shape`, `fill`, `stroke`. |
| `group` | Its child layers, transformed as a unit. | `children`. |

A layer box is the area that the `transform` field sets. The layer box of a shape is its geometry. A rectangle fills the layer box. An ellipse is inscribed in the layer box. A line runs from the left-middle to the right-middle of the layer box. A path is scaled to the layer box. A move, a resize, or a rotate operation applies to a shape as it applies to any other layer.

Every layer has these fields:

| Field | Meaning |
| --- | --- |
| `id` | Stable ID, `layer_<ULID>`. |
| `name` | Human-facing name. It is not an identifier. |
| `transform` | `x`, `y`, `width`, `height`, `rotation`, `flipHorizontal`, and `flipVertical`. |
| `opacity` | From `0` to `1`. |
| `visible` | Whether the layer renders. |
| `locked` | Whether editing operations refuse the layer by default. |
| `protected` | Whether every operation that changes the layer is refused, for every caller. |
| `readOnly` | Whether inspection is allowed but every change is refused. |
| `blendMode` | How the layer composites with the layers below it. |
| `effects` | The effect stack, applied in order. |
| `clip` | The clip that cuts the layer to a shape: a rectangle, an ellipse, or a path. |
| `constraints` | Reserved for layout constraints. Preserved verbatim and never interpreted. |

The **Shapes** row in the Add panel adds a rectangle, an ellipse, or a line. The inspector of a shape changes **Fill**, **Stroke**, **Stroke width**, and, for a rectangle, **Corner radius**. Each row is one change that you can undo. The **None** button next to a paint removes it.

## Order, groups, and metadata

The layer array is bottom first. Array order is z-order.

A group contains layers. A group can contain another group. The children of a group are bottom first and position relative to the group. A transform on a group applies to all its children.

The operation layer has these layer operations:

- `create`, `update`, `delete`, `duplicate`, `move`, `resize`, `rotate`, `reorder`, `group`, `ungroup`, `setVisible`, `setLocked`, `rename`, `align`, `centerOnCanvas`, `distribute`, and `snapTo`.

Selection is not document state. Each client keeps its own selection. Every operation that acts on layers takes explicit layer IDs.

Metadata and other unknown fields stay in the document. A later save writes them again.

## Locking and protection

The engine enforces each flag. The flags are not only interface controls.

| Flag | Effect | Override |
| --- | --- | --- |
| `locked` | The engine refuses an operation that changes the layer. | `allowLocked` in an operation, or `--allow-locked` on the CLI. |
| `protected` | The engine refuses every operation that changes the layer. | None. |
| `readOnly` | The engine refuses every operation that changes the layer, from every interface. | None. |

The child layers of a group get the same check when an operation deletes or changes the group.

A slot cannot point at a protected or read-only layer. The engine refuses the slot definition.

## Clipping, cropping, and flips

A layer can carry a clip. An image layer can show only part of its source file. Both are document values. They are journalled, undoable, and reversible.

- **Clip.** A layer clips to its own layer box. The clip is a rectangle or an ellipse. A corner radius makes a rounded rectangle. A radius larger than the layer box makes a stadium. A path can also be the clip.
- **Crop.** An image layer shows a rectangle of its source file, in source pixels. The crop composes with `fit`. `fill` stretches the rectangle to the layer box. `contain` and `cover` work from the shape of the rectangle. Values outside the source clamp to the source. A rectangle that misses the source is refused.
- **Flip.** A layer mirrors horizontally, vertically, or both, about the centre of its layer box. Mirroring text mirrors its glyphs.

The clip sits inside the effect stack. A shadow on the layer follows the clipped shape. A rotated clipped layer is cut to the layer box in its parent space. A document with no clip, no crop, and no flip renders as it did before 1.8.0.

An imported image records its pixel size. Thus the engine can place a crop. If this build cannot read the size of an asset, the import still succeeds. The engine refuses a crop of that asset by name.

Set these values on the CLI with `set --clip-rect`, `--clip-radius`, `--clip-ellipse`, `--no-clip`, `--crop X,Y,W,H`, `--no-crop`, `--flip-h`, and `--flip-v`. The reference editor has inspector rows. MCP has the `clip`, `crop`, `flipHorizontal`, and `flipVertical` arguments of `update_layer`.

## Paths, dashes, and markers

A path shape carries an SVG path string. A clip can also carry a path string.

The path grammar:

- The accepted commands are `M`, `L`, `H`, `V`, `C`, `S`, `A`, and `Z`. Upper case and lower case are both accepted.
- The path starts with one `M` and ends with `Z`.
- The path holds at most 30 commands and 2048 bytes.
- Every number must be finite.

The engine refuses a path that breaks a rule. The message names the command and its position.

A stroke has these fields:

| Field | Rule |
| --- | --- |
| `dashArray` | At most 8 entries. Each entry is greater than zero. |
| `lineCap` | `butt`, `round`, or `square`. |
| `lineJoin` | `miter`, `round`, or `bevel`. |

A line has `markerStart` and `markerEnd`. The value is `arrow`, `circle`, or `none`. The marker size follows the stroke width. The engine refuses a marker on a shape that is not a line.

Presets carry `dashArray`, `lineCap`, and `lineJoin`. Markers belong to the line, so presets do not carry them.

The CLI has `add-path` and `set --path --dash --cap --join --marker-start --marker-end`. The reference editor has shape rows in the properties panel. MCP has the `path` argument of `add_shape_layer` and the `shape`, `path`, and marker arguments of `update_layer`.

In 1.13.0, a path shape paints its fill and never its stroke. The document keeps the stroke values, but the SVG export omits the `stroke` and `stroke-width` attributes on the path element. Thus a stroked path shows no outline in an export.

## Layer resizing

- Drag a canvas resize handle to change the layer boxes of the selected layers.
- Hold Shift to keep the ratio. On an edge, Shift changes both dimensions.
- An image corner keeps the ratio by default. Hold Shift to resize an image corner freely.
- Hold Alt to keep the centre. Combine Alt with Shift when necessary.
- Press or release these keys during a drag to update the outline without pointer movement.
- Press Escape to cancel. A completed resize uses one undo transaction.
- Text keeps its font sizes and raw runs. A free horizontal text resize measures the required height.
- A ratio resize keeps the scaled layer box height. A stale height response cannot replace that height.
- A positive subpixel layer box keeps its dimensions when the pointer does not move.
- A text selection keeps the authoritative canvas image while the outline moves. Scaled previews, groups, clips, effects, and interleaved selections can use the same outline-only fallback.
- The engine renders the committed document after the drag ends.
- Canvas resize handles are not available for zero-size layer boxes or for a selection of a parent and its child.
- The children of a rotated or flipped group also do not get these handles.
- A mixed selection with an unsupported item gets no resize handles.
- Use the Position and size rows of the inspector for supported edits.

## Persistence and undo

Assemblash saves every change immediately. There is no Save button.

Every successful operation is one journal entry with its actor and transaction ID. A refused operation does not change the document. You can undo and redo an operation, also after a restart. Undo rebuilds the state by replaying the journal onto the nearest snapshot.

A document written by release 1.0 stays readable by every 1.x release. The schema version stays at `1`.

## Compatibility

- A shape layer needs 1.6.0 or newer. Releases 1.0 to 1.5 refuse the whole document and name `shape` as an unknown layer kind.
- Releases 1.6.0 to 1.9.x keep a path shape or a path clip as written. They refuse to draw it and refuse an update that touches it.
- Gradient paints need 1.11.0. See [Paint and rendering](paint-and-rendering.md).
- Canvas editing needs 1.4.0 or newer. When a project history contains `updateCanvas`, 1.3.1 refuses `show` and `history`, also after undo. Continue to use the newer executable.
- Unknown fields survive load and save at every level of the document. This includes the inside of `clip`, `crop`, `stroke`, `shape`, and the effect stack.
- The stroke of a shape is painted inside its layer box. Thus the layer box is the visible size. A stroke narrower than 1 is a hairline on the edge and can extend half a pixel outside the layer box.

## Related pages

- [Text and fonts](text-and-fonts.md)
- [Paint and rendering](paint-and-rendering.md)
- [Automation](automation.md)
- [README](../README.md)
- [PRD](../PRD.md)
