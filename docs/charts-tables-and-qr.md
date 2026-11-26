# Charts, tables and QR codes

Assemblash makes a chart, a table or a QR code from a spec. The result is an
ordinary `svg` asset and an `svg` layer. The renderer and every export format
draw it as they draw an uploaded SVG. The spec is recorded on the layer, so
the layer can be made again from the same data.

Release 1.15.0 adds this function.

## Make a generated layer

| Interface | Chart | Table | QR code | Make again |
| --- | --- | --- | --- | --- |
| Reference editor | **Uploads**, then **Chart, table or QR code** | the same dialog | the same dialog | Inspector, **Generated** |
| CLI | `add-chart` | `add-table` | `add-qr` | `regenerate` |
| HTTP | `POST /api/projects/{id}/generated-layers` | the same route | the same route | `PUT /api/projects/{id}/generated-layers/{layer}` |
| MCP | `add_chart_layer` | `add_table_layer` | `add_qr_layer` | `regenerate_layer` |

A chart or a table can come from a whole JSON spec or from CSV text. CSV
gives a spec with default settings. The CSV reader follows RFC 4180 and reads
at most 1 MiB.

- For a chart, the first CSV row names the series. Its first cell is not
  used. Each other row is one category, then one value for each series.
- For a table, each CSV row is one table row, and the first row is the
  header.

See `examples/charts/` for a spec, two CSV files and the commands.

## Spec fields

The JSON `kind` field is `chart`, `table` or `qr`. A field that the generator
does not know is refused.

**Chart.** `type` (`bar`, `column`, `line`, `area`, `pie`, `donut`,
`scatter`), `width` (800), `height` (500), `title`, `categories`, `series`
(each with `name`, `values` and an optional `color`), `fontFamily`, `fontSize`
(14), `palette`, `background`, `textColor`, `axis` (`min`, `max`,
`gridLines`), `legend` and `valueLabels`. A pie or donut chart uses the first
series. A scatter chart uses the categories as x values when each category is
a number.

**Table.** `rows`, `width` (600), `header`, `columnWidths`, `fontFamily`,
`fontSize`, `padding` (8), `border`, `headerFill`, `fill`, `stripeFill`,
`textColor`, `align`, `merges` and `cells`. Text that is too long for its
cell is clipped.

**QR code.** `data`, `errorCorrection` (`L`, `M`, `Q` or `H`), `margin` (4),
`moduleSize` (10), `foreground` and `background`. Data that does not fit in
the largest QR code is refused with `qrDataTooLong`.

A colour is `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`.

## Labels and fonts

Labels are glyph outlines from an installed font face. The asset holds no
`<text>`, so it needs no font when it is drawn. The family is `fontFamily`,
or Noto Sans when the spec names no family. The face must be in the font
store, or in `--font-dir` or `--font` on the CLI. A character that the face
does not cover is refused with `generatorMissingGlyph`. Use a font that
covers it.

With CSV on HTTP and no `fontFamily`, the labels use Noto Sans if the
workspace has it. If not, they use the first installed family by name. The
spec records the family that was used.

## The record on the layer

The spec is in the layer `extra` map under one reserved key:
`assemblash.chart`, `assemblash.table` or `assemblash.qr`. The record is:

```json
{ "spec": { "kind": "chart", "...": "..." }, "generator": "assemblash 1.15.0", "font": { "family": "Inter", "sha256": "sha256:..." } }
```

The `setLayerMeta` operation writes reserved keys. Its key must start with
`assemblash.`, and its value must be at most 64 KiB.

## Make a layer again

Regenerate replaces the asset of the layer and its record in one
transaction. It takes a whole new spec of the same kind or, for a chart, only
a new chart type. The data stays the same. The layer keeps its box, its name
and its place in the tree. One undo restores the layer as it was.

- A spec of another kind is refused with `generatorKindMismatch`.
- A layer with no record is refused with `notGeneratedLayer`.

## Equal input gives equal bytes

The same spec and the same face give the same SVG bytes on every release
target. Each number has at most two decimals and comes from integer
arithmetic. Sine and cosine use only `+`, `-`, `*` and `/`, not the platform
maths library.

## Limits

- Adding a generated layer imports an asset. As for an upload, undo removes
  the layer but the asset entry stays in the project.
- A table is not a text layer. To change its text, change the spec and make
  the layer again.
- One QR code for each call. The CLI and the tools do not make a QR code for
  each row of a file.
