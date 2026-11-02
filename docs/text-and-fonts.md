# Text and fonts

This page describes text layers, styled runs, the font store, and the text warnings.

## The font store

The font store is a directory. `--font-store <FONT_STORE>` names it. The environment variable `ASSEMBLASH_FONT_STORE` also names it.

The font store keeps font files and an `index.json`. Each file is named by the sha256 of its bytes. `index.json` records the family, style, weight, hash, and provenance of each face. It also records the licence when a face has one.

The renderer loads fonts only from these sources:

- the font store;
- `--font <FILE>` on `render` and `export`;
- `--font-dir <DIR>` on `render` and `export`.

The renderer never reads the system font list. A render never uses the network. `assemblash font verify` re-hashes every file in the font store and names the first file that changed.

## Licences

A face can record a licence. `assemblash font add --license OFL-1.1` records one when you import a file. `assemblash font licenses` prints the licence, or `unrecorded`.

The manifest that is compiled into the binary names twelve OFL-1.1 families:

| Pack | Families |
| --- | --- |
| `default` | Noto Sans, Noto Serif, Noto Sans Mono |
| `text` | Inter, Roboto, Open Sans, Lora |
| `display` | Montserrat, Playfair Display |
| `mono` | JetBrains Mono |
| No pack | Noto Sans Arabic, Noto Sans JP |

The manifest pins each family to the sha256 of its file. The font store refuses a download with a different hash and does not store it.

`assemblash font install`, the update check (only after you agree to it), and `assemblash upgrade` are the only actions that use the network. Fonts that are already installed continue to work with no network.

## Install and import fonts

| Command | Effect |
| --- | --- |
| `assemblash font install [FAMILY]` | Install one family. To install a pack, use `--pack <PACK>`. With neither a family nor `--pack`, the command refuses. |
| `assemblash font install --pack <PACK>` | Install the named pack. |
| `assemblash font install --list` | List the installable families. Download nothing. |
| `assemblash font add <FILE> --license <LICENCE>` | Import a font file into the font store. |
| `assemblash font list [--faces]` | List the families, or every face. |
| `assemblash font remove <FAMILY>` | Remove a family and any file that it was the last user of. |
| `assemblash font verify` | Re-hash every file in the font store. |
| `assemblash font licenses` | Print the licence of each font, or `unrecorded`. |

`assemblash font add` accepts TTF, OTF, TrueType collections, WOFF, and WOFF2 files. The font store decompresses a web font on import. Thus nothing decompresses a font during a render.

The editor manages the same font store in the **Fonts** section of the Add panel:

- It lists the installed families and their faces.
- It imports TTF, OTF, TTC, OTC, WOFF, and WOFF2 files from disk.
- It removes a family. Before it removes one, it tells you that projects that use the family will report a missing font.
- When the font store is empty, it shows one button. The button installs the `default` pack: Noto Sans, Noto Serif, and Noto Sans Mono. It names the download before it starts.
- The font picker and the canvas update immediately.
- A removal never changes the fonts of your operating system or the file that you imported.

## Font resolution and refusal

A text layer names a font family. It also names a weight and a style.

- `fontWeight` is an integer from 100 to 900. `400` is the regular face.
- `fontStyle` is `normal` or `italic`.

The renderer selects the exact face in the font store. The face must match the family, the weight, and the style. A weight that is not installed is refused. It is never replaced by another weight. A missing family produces a typed error at the font store, the renderer, and the CLI. The engine never uses a different font without a message.

The renderer loads only the families that the document names. Thus an unrelated font in the font store cannot change the pixels of an existing document.

The renderer refuses these cases:

- incompatible styles within one shaping cluster;
- invalid spacing geometry;
- an imported SVG asset whose `<text>` names a family that the render did not load.

A generic family name, such as `sans-serif`, is not sufficient. The font store never holds the fallback font of the renderer. See [Paint and rendering](paint-and-rendering.md).

## Text layer properties

| Property | Meaning |
| --- | --- |
| `text` | The text. `\n` starts a new line. |
| `fontFamily` | The font family name. |
| `fontSize` | Font size in pixels. It is positive finite. |
| `color` | A solid colour, a gradient, or `null` for no fill. |
| `align` | `left`, `center`, `right`, or `justify`. |
| `lineHeight` | A multiple of the font size. The default is `1.2`. |
| `paragraphSpacing` | Extra pixels between explicit paragraphs. The default is `0`. |
| `fontWeight` | `100` to `900`. The default is `400`. |
| `fontStyle` | `normal` or `italic`. The default is `normal`. |
| `letterSpacing` | Extra space between characters, in pixels. The default is `0`. |
| `stroke` | The glyph stroke. A `none` fill with a stroke gives outlined text. |
| `verticalAlign` | `top`, `middle`, or `bottom`. The default is `top`. |
| `runs` | Raw styled runs. |

The CLI defaults for `add-text` are:

| Field | Default |
| --- | --- |
| size | `48` |
| colour | `#000000` |
| align | `left` |
| line height | `1.2` |
| weight | `400` |
| style | `normal` |
| letter spacing | `0` |
| vertical align | `top` |
| layer box | `100` by `100` at `0,0` |

## Vertical alignment

`verticalAlign` places the text block in its layer box. The value is `top`, `middle`, or `bottom`. The measurement, the overflow warning, and the automatic text height use the same layout as rendering.

## Paragraph spacing

`paragraphSpacing` sets extra pixels between explicit paragraphs. The default is zero. The value must be finite and not negative. Leading, trailing, and empty paragraphs count. Automatic line wrapping adds no paragraph spacing. Plain text and styled runs support this property. Zero removes an existing value. Ordinary paragraph spacing updates preserve raw runs and unknown run properties.

Measurement, vertical alignment, overflow warnings, and automatic text height use the same paragraph spacing.

Use `add-text --paragraph-spacing 12` or `set --paragraph-spacing 12` on the CLI. Use `paragraphSpacing` in HTTP operations and the MCP `add_text_layer` and `update_layer` tools. The Typography section has a Paragraph spacing field in pixels. Presets include this property.

Older consumers can keep the stored property but do not render paragraph spacing. Older history replay can discard paragraph spacing updates. Use a consumer with paragraph spacing support to edit these documents. The schema stays at version 1.

## Justified alignment

Set `align` to `justify` for a text layer.

- Only groups of regular spaces (U+0020) between words receive extra width.
- Leading and trailing whitespace receive no extra width. A run boundary adds no word gap.
- Eligible automatically wrapped lines fill the layer box width.
- Each explicit paragraph's final line keeps its natural width.
- Single-word lines, lines without word gaps, and oversized natural lines stay unstretched.
- The fit check excludes trailing whitespace. Stored text and raw runs stay unchanged.
- An unstretched final line keeps natural whitespace advances. Its measured width can exceed the layer box width.

Justified text needs the exact loaded font bytes and exact shaping for wrapping. Rendering, measurement, overflow, clipping, and automatic text height use the same layout.

Use `--align justify` with CLI `add-text` and `set`. Set `align` to `justify` in HTTP create and update operations. Use the same value with MCP `add_text_layer` and `update_layer`. Choose Justify text on the alignment toolbar. Presets store this alignment value.

Versions 1.0.0, 1.10.0, and 1.11.0 refuse a snapshot with `justify` in a text layer or a preset. Undo can restore an earlier alignment while the journal still holds a `justify` update. The older consumers also refuse that journal. Use a consumer with justified alignment support to open or edit these documents. The schema stays at version 1.

## Styled runs

A text layer can carry styled runs. The reference editor, the CLI, the HTTP API, and MCP accept styled runs. Each run has a `text` string. The join of all run text must equal the layer `text` exactly.

These optional fields override the layer style:

| Field | Supported value |
| --- | --- |
| `fontFamily` | Font family name |
| `fontSize` | Positive size in pixels |
| `color` | Solid colour, gradient object, or `null` for no fill |
| `fontWeight` | Integer from 100 to 900 |
| `fontStyle` | `normal` or `italic` |
| `letterSpacing` | Finite spacing in pixels |

An omitted field inherits the layer style. A null field also inherits, except `color: null`, which removes the fill. Unknown run properties stay unchanged during storage.

```json
[{"text":"Hello "},{"text":"world","fontWeight":700}]
```

```sh
assemblash add-text ./poster --text "Hello world" --font "Noto Sans" --runs-file runs.json --x 24 --y 24 --width 500 --height 150
assemblash set ./poster --layer <LAYER_ID> --runs-file runs.json
```

HTTP sends `runs` in the `create` and `update` operations at `POST /api/projects/{id}/operations`. MCP accepts `runs` in `add_text_layer` and `update_layer`.

Use `--runs` for an inline JSON array. Do not combine `--runs` and `--runs-file`. An empty array clears styling. An outer update `null` omits the runs field. Creation refuses an outer `null`. Supply `text` and `runs` together to replace both in one operation. The engine does not infer text from runs. A text-only update clears runs, also when the supplied text is unchanged. Ordinary base-style updates keep runs. Text and Color slot fills clear runs.

In the editor, select one text layer. Open **Typography** in **Properties**, then select **Edit runs**. Use **Add run**, **Delete**, **Move up**, and **Move down** to arrange the rows. The fill control distinguishes inherited fill, an override, and no fill. Select **Apply runs** to save all rows in one operation and one undo step. Select **Cancel** to discard the draft without a change. The layer box stays unchanged.

A draft keeps unknown fields and untouched null values. Unsupported stored values and inconsistent run text stay read-only until an explicit clear or replacement. Apply uses the document version captured when the draft starts. A concurrent operation can refuse Apply. The draft stays available. Use **Discard draft and load current runs** to replace the draft with current stored values. An uncertain response also needs this action before another Apply.

The engine checks structure without loading fonts. Rendering needs each exact font family, weight, and style. HTTP and MCP can return `cannotMeasureText` after a successful operation. The operation remains saved.

Release 1.11.0 loads stored raw runs but renders the base style. Its text-only updates can leave run text inconsistent. Cached snapshots can keep new runs during undo and redo. History replay from before a run update can drop runs. Release 1.12.0 keeps runs during recovery, and read-only history leaves project files unchanged. Use a styled-run build for projects with styled runs.

## Measurement and warnings

The renderer measures text with the pinned metrics of the loaded font files. The layout is the same for rendering, measurement, overflow, clipping, and automatic text height.

`GET /api/projects/{id}/text-layout?id=<LAYER_ID>&width=<WIDTH>` measures one text layer. It returns `lineCount` and `height`. It is a read-only aid for horizontal resize handles. The resize itself is one ordinary operation batch.

A warning reports a problem that did not stop the export. Each warning has a `code`, a `message`, and a `layerId` when one layer applies. A warning changes no pixel and no exit status.

| Code | Meaning |
| --- | --- |
| `wordBrokenMidWord` | One word is too wide for its layer box, so the engine splits it. |
| `textOverflowsBox` | The wrapped text is taller than its layer box. |
| `textCoveredByLayer` | A later sibling layer is opaque over the text, so the text may not be readable. |
| `cannotMeasureText` | The engine cannot measure the text with the available fonts or interpretation. |
| `lockReclaimed` | The server cleared a stale project lock before the export. HTTP and MCP only. |
| `svgAssetTextWithoutFont` | A code from 1.3.0. This case now gives an error. |

The CLI prints one line for each warning on standard error. With `--warnings-json`, it prints the array as JSON on standard output. The HTTP export response and the MCP `export_document` result contain a `warnings` array. HTTP and MCP operation responses can also report the text warnings of the layers that they touched.

## Compatibility

- Styled runs and justified alignment need 1.12.0 or newer.
- Release 1.11.0 loads stored raw runs but renders the base style.
- Versions 1.0.0, 1.10.0, and 1.11.0 refuse a document or a journal with `justify`.
- Paragraph spacing needs 1.12.0 or newer for rendering. Older consumers keep the value and ignore it.
- The schema version stays at `1`.

## Related pages

- [Document model](document-model.md)
- [Paint and rendering](paint-and-rendering.md)
- [Automation](automation.md)
- [README](../README.md)
- [PRD](../PRD.md)
