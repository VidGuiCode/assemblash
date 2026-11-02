# Paint and rendering

This page describes colours, gradients, blend modes, the effect stack, the renderer, and export warnings.

## Solid colours

A colour position takes a solid sRGB colour or a gradient object. A solid colour is a string in the form `#rrggbb` or `#rrggbbaa`. The document stores the string as written.

Colour positions include the canvas background, the text fill, shape fills, strokes, and presets. Colour slot values stay solid colour strings.

The CLI accepts three forms for a colour argument: a hexadecimal colour, inline JSON, or `@file.json`.

```sh
assemblash canvas set ./poster --background @paint.json
assemblash set ./poster --layer <LAYER_ID> --color @paint.json
```

Two rules bound paints:

- The engine refuses a gradient shadow colour.
- The engine refuses an image shape fill. Use an image layer with a clip instead.

## Gradient paints

Use a gradient object for a canvas background, text, a shape fill, or a stroke. Presets accept the same paints.

A linear gradient has `kind`, `angle`, and `stops`. Angle `0` runs from left to right. Angle `90` runs from top to bottom. The angle turns clockwise as drawn.

A radial gradient has `kind`, `center`, `radius`, and `stops`. The centre and the radius are fractions of the painted layer box. The default centre is `{ "x": 0.5, "y": 0.5 }`. The default radius is `0.5`.

Each stop has `offset`, a solid `color`, and an optional `alpha`.

- `offset` values increase strictly within `0` to `1`.
- `alpha` defaults to `1`. It multiplies the colour alpha.
- A gradient has 1 to 16 stops.

The engine refuses an empty stop list, an invalid number, and an unsupported gradient kind.

```json
{
  "kind": "linear",
  "angle": 30,
  "stops": [
    { "offset": 0, "color": "#102030" },
    { "offset": 1, "color": "#ddeeff", "alpha": 0.7 }
  ]
}
```

A load keeps an unsupported gradient kind as written. An edit and a render refuse its use. The engine never guesses at a gradient kind.

In the reference editor, select **Gradient JSON** for a canvas paint. Enter the gradient object, then select **Use JSON paint**. Select **Apply changes** to submit the canvas draft.

## Canvas background image

Import an image asset before you use it as a canvas background. The canvas colour appears below the image. All layers appear above the image.

The fit is `fill`, `contain`, or `cover`. The default fit is `fill`.

```sh
assemblash canvas set ./poster --background-image <ASSET_ID> --background-image-fit cover
assemblash canvas set ./poster --clear-background-image
assemblash undo ./poster
```

HTTP `updateCanvas` and MCP `update_canvas` accept `backgroundImage: { "asset": "<ASSET_ID>", "fit": "cover" }`. Set `clearBackgroundImage: true` to remove the image. Omit both fields to keep it. The canvas image controls in the reference editor select or upload an image, set its fit, and remove it.

- The engine refuses a missing asset.
- The engine refuses a set and a clear in the same operation.
- Asset pruning keeps an asset that the canvas background uses.

## Blend modes

A layer has one of fourteen blend modes:

| Mode | Mode | Mode |
| --- | --- | --- |
| `normal` | `multiply` | `screen` |
| `overlay` | `darken` | `lighten` |
| `hard-light` | `soft-light` | `difference` |
| `exclusion` | `hue` | `saturation` |
| `color` | `luminosity` | |

The engine refuses `color-dodge` and `color-burn`. They are not bit-identical across every target. A mode that a newer build writes stays in the document. The renderer refuses it and never draws it as `normal`.

Set the mode with `set --blend` or `style --blend`. A preset can carry `blendMode`.

## Effect stack

An effect is a non-destructive adjustment. The document stores the effect stack as an array. The engine applies the effects in stored order. An effect never changes the stored pixels.

The engine supports eight effects:

| Type | Parameters | Neutral value |
| --- | --- | --- |
| `brightness` | `amount` | `1` |
| `contrast` | `amount` | `1` |
| `saturation` | `amount` | `1`, and `0` is greyscale |
| `blur` | `radius`, in document units | `0` |
| `grain` | `amount`, `seed`, `scale` | `0` amount |
| `dropShadow` | `dx`, `dy`, `blur`, `color` | No neutral value. `dx` and `dy` at `0` make a glow. |
| `hueRotate` | `degrees` | `0`, or any complete turn |
| `invert` | `amount` from `0` to `1` | `0` |

Details:

- `grain` is seeded. The same document grains the same way.
- A drop shadow colour with an `#rrggbbaa` alpha sets the flood opacity.
- `hueRotate` accepts any finite angle. Negative angles rotate in reverse. It uses the SVG hue matrix in sRGB.
- `invert` interpolates each RGB channel toward its inverse. An amount of `1` gives full inversion.
- `hueRotate` and `invert` preserve alpha and run in stored stack order.
- An unknown effect stays in the document. The renderer refuses it. It is never skipped or guessed at.

```json
[
  { "type": "hueRotate", "degrees": 90 },
  { "type": "invert", "amount": 0.75 }
]
```

Apply the array with one reversible operation:

```sh
assemblash set ./project --layer layer_id --effects-file effects.json
```

HTTP takes the same array in `operation.effects` on an `update` operation. MCP takes it in `update_layer.effects`. The reference editor provides every effect in its Effects control.

Use `assemblash styles --json`, `GET /api/capabilities`, or MCP `list_capabilities` to inspect the supported set. All three serve the same canonical listing.

## Renderer pipeline

1. A pure function converts the document to SVG.
2. `resvg` and `tiny-skia` convert the SVG to pixels.
3. PNG export writes those pixels. SVG export writes the intermediate SVG.

The output size is the canvas size multiplied by the export scale. The pipeline is pure Rust, including text shaping. It has no platform-specific code path.

The renderer loads fonts only from the font store or from the font files that you give it. It records a hash of each font file. Thus text and pixels are the same on all operating systems.

## Determinism

The same document, assets, and pinned font files give bit-identical PNGs on all six release targets.

- The renderer never reads a system font.
- The renderer never uses the network.
- Font files are hash-pinned. A changed font file changes the pixels and the recorded hash.
- The fourteen blend modes are the modes that pass the determinism check on every target.
- `export` writes no PNG timestamp by default. Two exports of the same document are byte-identical. Use `--timestamp` to record a time.

## Export warnings

An export reports problems that did not stop it:

| Code | Meaning |
| --- | --- |
| `wordBrokenMidWord` | One word is too wide for its layer box, so the engine splits it. |
| `textOverflowsBox` | The text is taller than its layer box. |
| `textCoveredByLayer` | A later sibling layer covers the text. |
| `cannotMeasureText` | The engine cannot measure a text layer. |
| `lockReclaimed` | The server cleared a stale project lock before the export. HTTP and MCP only. |

Each warning has a `code`, a `message`, and a `layerId` when a layer applies. A warning changes no pixel and no exit status.

- The CLI prints one line for each warning on standard error.
- With `--warnings-json`, the CLI prints the array as JSON on standard output.
- The HTTP export response and the MCP `export_document` result contain a `warnings` array.

## The SVG asset text rule

Text inside an imported SVG asset is different. It causes an error, not a warning.

The renderer refuses the render with a typed error that names the asset. The render continues only when each `<text>` in the asset names a font family that the render loaded.

- A generic family, such as `sans-serif`, is not sufficient.
- The font store never contains the fallback font of the renderer.
- Name a loaded family in the asset, or convert the text to outlines before you import the asset.

The 1.3.0 warning code `svgAssetTextWithoutFont` still exists. This case now gives the error instead.

## Compatibility

- Gradient paints need 1.11.0. Builds 1.0 to 1.10 refuse to load or export a document with gradient paints. They can also refuse a project whose journal holds gradient operations.
- Release 1.10.0 keeps `backgroundImage` when it loads a document. Its renderer ignores the image. The canvas colour stays visible.
- Recovery with 1.10.0 can discard image metadata from a newer `updateCanvas` journal entry.
- Unknown fields survive inside `clip`, `crop`, `stroke`, `shape`, and the effect stack.
- Release 1.12.0 keeps `hueRotate` and `invert` as unknown effects and refuses to render them. HTTP returns `422 renderFailed`. Use 1.13.0 to render them.
- The schema version stays at `1`.

## Related pages

- [Document model](document-model.md)
- [Text and fonts](text-and-fonts.md)
- [Automation](automation.md)
- [README](../README.md)
- [PRD](../PRD.md)
