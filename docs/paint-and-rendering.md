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
3. PNG export writes those pixels. SVG export writes the intermediate SVG. The PDF, JPEG, and WebP exports start from the same pixels as the PNG export. `assemblash-export` encodes them.

The output size is the canvas size multiplied by the export scale. The pipeline is pure Rust, including text shaping. It has no platform-specific code path.

The renderer loads fonts only from the font store or from the font files that you give it. It records a hash of each font file. Thus text and pixels are the same on all operating systems.

## Determinism

The same document, assets, and pinned font files give bit-identical PNGs on all six release targets.

- The renderer never reads a system font.
- The renderer never uses the network.
- Font files are hash-pinned. A changed font file changes the pixels and the recorded hash.
- The fourteen blend modes are the modes that pass the determinism check on every target.
- `export` writes no PNG timestamp by default. Two exports of the same document are byte-identical. Use `--timestamp` to record a time.
- The same promise applies to every export format: PNG, SVG, raster PDF, JPEG, and lossless WebP. Lossy WebP does not give the same bytes on all targets, so the engine refuses it.

## Export formats

An export writes one of five formats. PNG is the default.

| Format | Request value | File | Contents |
| --- | --- | --- | --- |
| PNG | `png` | `.png` | The pixels, with transparency. |
| SVG | `svg` | `.svg` | The intermediate SVG of the renderer. |
| PDF | `pdf` | `.pdf` | A raster PDF: one image for each page. |
| JPEG | `jpeg` or `jpg` | `.jpg` | The pixels, flattened onto white. |
| WebP | `webp` | `.webp` | The pixels, lossless, with transparency. |

The request value is not case-sensitive. The engine never takes the format from the file extension. Any other value is refused with `exportFormatNotSupported`.

### Quality

- `quality` applies to JPEG only. The value is 1 to 100. The default is 90.
- A JPEG quality outside 1 to 100 is refused with `exportQualityOutOfRange`.
- WebP is lossless only. A `quality` with `webp` is a request for lossy WebP. The engine refuses it with `lossyWebpNotSupported`. For a lossy file, use `jpeg` with a quality.
- A `quality` with `png`, `svg`, or `pdf` is refused with `exportQualityNotApplicable`.

### JPEG

JPEG has no transparency. The engine flattens each pixel onto white before it encodes the file. A transparent area of the document is white in the JPEG. The flattening uses integer arithmetic only, so it gives the same bytes on all targets.

### Raster PDF

The PDF holds one image for each page. Each image is the PNG pixels of that page.

- One canvas pixel is one PDF point. A 1080 × 1350 canvas gives a page of 1080 × 1350 points.
- `scale` changes the resolution of the image. It does not change the page size.
- A page with transparent pixels keeps them in a soft mask. A page with only opaque pixels has no soft mask.
- The file has no creation date, no modification date, and no XMP metadata. Its `/ID` comes from the file content. Its producer is `Assemblash`.
- The text is part of the image. A PDF reader cannot select or search it.
- A PDF of the same pages is byte-identical on each export.

### Print PDF

`print` adds print geometry to a PDF. It reads `canvas.bleed`. See [Print geometry](document-model.md#print-geometry).

- The page gets a `/TrimBox` and a `/BleedBox`. The trim box is the canvas.
- The page gets an 18 pt mark zone outside the bleed on each side, and crop marks in that zone. Each crop mark is a 0.25 pt line on a trim line.
- The image covers the trim box only. The bleed area holds no rendered content in this release. Content that crosses the trim edge is cut at the trim edge.
- A document without `bleed`, or with a bleed of `0` on all sides, gives a plain page.
- `print` with a format other than `pdf` is refused with `printNeedsPdf`.

For a canvas of 1080 × 1350 with a bleed of 9, the page is 1134 × 1404 points. The bleed box is `18 18 1116 1386`. The trim box is `27 27 1107 1377`.

### Page sets

`pages` exports the pages of a page set. See [Page sets](document-model.md#page-sets).

- `<set>` selects every page of the set, for example `deck`.
- `<set>:<selection>` selects some pages, for example `deck:1-3,5`. A selection is a comma-separated list of page numbers and ranges.
- Pages are numbered from 1, in manifest order. A nested set adds its pages in place.
- The export keeps manifest order. A page that you name two times is exported one time.
- A page number of `0`, a page above the page count, a range that goes down, or an empty selection is refused with `invalidPageSelection`.
- A `pdf` export holds every selected page. Any other format holds one image. More than one selected page with such a format is refused with `pagesNeedPdf`.
- Each page renders with the assets of its own project.

A page-set PDF and a variants PDF have these limits. The engine checks them before it renders a page.

- One PDF holds at most 200 pages. More pages are refused with `pdfPageLimitExceeded`.
- One PDF renders at most 400 000 000 output pixels, all pages together. The pixels of a page are `round(width × scale) × round(height × scale)`. More pixels are refused with `pdfPixelLimitExceeded`. For example, 200 pages of 1414 × 1414 at scale 1 are in the limit.
- At most 4 threads render PDF pages at one time in one process. Two exports at the same time share these threads. Each thread loads the fonts and assets of its page when it renders the page.

The CLI writes the file to the path that you give. HTTP and MCP write the file to the `exports/` directory of the project in the request. That project does not have to be a page of the set.

### Variants

A batch of variants takes `format` and `quality`, with the same rules.

- `png`, `svg`, `jpeg`, and `webp` write one file for each variant, `exports/<variant name>.<extension>`.
- `pdf` writes one PDF, `exports/<name>.pdf`, with one page for each variant in the order of the request. Without `name`, the file is `exports/variants.pdf`. Each variant in the result has its `page` number and the hash of the PDF.
- `name` applies to `pdf` only. `name` with another format is refused with `variantsNameNeedsPdf`.
- A variants PDF has no print geometry.

### Refusals

A refused export writes no file. The engine checks the format fields before it reads a project.

| Code | Cause |
| --- | --- |
| `exportFormatNotSupported` | The format is not one of the five formats. |
| `lossyWebpNotSupported` | A `quality` with `webp`. |
| `exportQualityOutOfRange` | A JPEG quality outside 1 to 100. |
| `exportQualityNotApplicable` | A `quality` with `png`, `svg`, or `pdf`. |
| `printNeedsPdf` | `print` with a format other than `pdf`. |
| `invalidPageSelection` | The page selection cannot be used. |
| `pagesNeedPdf` | More than one page with a format other than `pdf`. |
| `pdfPageLimitExceeded` | A page-set or variants PDF with more than 200 pages. |
| `pdfPixelLimitExceeded` | A page-set or variants PDF with more than 400 000 000 output pixels. |
| `variantsNameNeedsPdf` | A variants `name` with a format other than `pdf`. |
| `timestampNeedsPng` | CLI only. `--timestamp` with a format other than `png`. |
| `exportEncodingFailed` | The encoder cannot write the image, for example because it is too large. |
| `colorSpaceNotSupported` | A colour space other than `srgb`. |

HTTP returns these refusals with status `422`. A set that does not resolve gives a page-set code, for example `pageSetNotFound`. See [Page sets](document-model.md#page-sets).

## Export warnings

An export reports problems that did not stop it:

| Code | Meaning |
| --- | --- |
| `wordBrokenMidWord` | One word is too wide for its layer box, so the engine splits it. |
| `textOverflowsBox` | The text is taller than its layer box. |
| `textCoveredByLayer` | A later sibling layer covers the text. |
| `cannotMeasureText` | The engine cannot measure a text layer. |
| `lockReclaimed` | The server cleared a stale project lock before the export. HTTP and MCP only. |
| `contentOutsideMargins` | Print proofing. Text leaves the safe area, or other content crosses a margin line and stops before the trim edge. |
| `contentInsideBleed` | Print proofing. Content touches or crosses a trim edge and stops before the bleed edge. |
| `assetBelowTargetResolution` | Print proofing. An image has fewer source pixels than the output pixels that it covers. |

Each warning has a `code`, a `message`, and a `layerId` when a layer applies. A warning changes no pixel and no exit status.

A page-set export reports the warnings of each page, in page order. Each of these warnings has an extra `project` field that names the project of the page. The CLI prints the project as a fourth column. Other exports do not have the `project` field.

An SVG export measures its warnings at scale 1. The other formats measure them at the export scale.

- The CLI prints one line for each warning on standard error.
- With `--warnings-json`, the CLI prints the array as JSON on standard output.
- The HTTP export response and the MCP `export_document` result contain a `warnings` array.

### Print proofing

The three print-proofing warnings come only from a document that has `canvas.bleed` or `canvas.margins`. A document without these fields gets the same warnings as before 1.14.0. See [Print geometry](document-model.md#print-geometry).

- The engine checks each visible layer that is not a group. It uses the box of the layer on the canvas, with its rotation.
- A shape or an image that reaches the trim edge is art that runs to the edge. `contentOutsideMargins` does not report it on that side. `contentInsideBleed` checks it.
- Text does not run to the edge on purpose. Thus `contentOutsideMargins` reports text that is past the margin line, also when it is past the trim edge.
- `assetBelowTargetResolution` uses the crop and the fit of the image, and the export scale. The target is one source pixel for each output pixel. The engine does not check an asset with no recorded size.

### Colour space

Every export is sRGB. Professional print colour management, CMYK included, is out of scope. An export request can name its colour space: `--color-space` on the CLI `export`, and `colorSpace` on the HTTP export and on the MCP `export_document`. The only accepted value is `srgb`. Any other value, `cmyk` included, is refused with `colorSpaceNotSupported`, and no file is written. The engine never converts colours to another colour space.

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
- The PDF, JPEG, and WebP exports, `print`, and `pages` need 1.14.0. They add no document field. Release 1.13.1 opens every exported project unchanged.
- Release 1.13.1 has no `--format`, `--quality`, `--pages`, or `--print` on `export`. Its HTTP export refuses the new body fields with `400 malformedRequest`. Its MCP `export_document` ignores the new arguments and writes a PNG.
- The schema version stays at `1`.

## Related pages

- [Document model](document-model.md)
- [Text and fonts](text-and-fonts.md)
- [Automation](automation.md)
- [README](../README.md)
- [PRD](../PRD.md)
