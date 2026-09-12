---
name: assemblash
description: Create, inspect, edit, validate, render, or export Assemblash visual-document projects through its CLI, HTTP API, or MCP server. Use for work on an Assemblash document or integration; not for unrelated repository maintenance.
---

# Assemblash

Assemblash is a local-first, structured visual-document engine. Treat a
document as an editable layer tree. Do not treat it as a flattened image or as
a graphical interface to click through. The CLI, HTTP API, MCP server, and
reference editor are clients of the same validated operation layer.

## Start with the current state

When you work in the Assemblash repository, read `README.md` for released
behavior. Read `PRD.md`, `AGENTS.md`, and `CONTRIBUTING.md` before you change
the engine or its public surfaces. The committed schemas are the precise
contracts:

- `schema/document.schema.json`
- `schema/operation.schema.json`

Inspect the target project, layer tree, document version, validation result,
and rendered preview before you propose an edit. Use explicit layer IDs.
Selection belongs to the client session and is not document state.

## Make changes safely

Use MCP, the HTTP API, or the CLI. Do not edit `document.json` directly. Those
interfaces validate mutations, enforce locks and protection, journal history,
and support undo. A normal edit follows this sequence:

1. Read the document, layers, version, and preview.
2. Identify the exact layer IDs and the intended operation.
3. Dry-run the mutation when the interface supports it. Use the current
   expected document version.
4. Apply the validated operation. Keep its transaction ID when available.
5. Validate and render a new preview. Export only after you check the result.

Do not bypass a refusal by editing files or by an attempt to clear protected
content. If another actor changed the document, refresh the state. Do not reuse
a stale expected version.

## Preserve the engine's guarantees

- Keep filesystem work inside the configured project or workspace boundary.
- Respect `locked`, `protected`, and `readOnly` layers, including group
  containment.
- Keep compositions deterministic. Use known local assets and the configured
  font store. Report a missing font or asset. Do not substitute one.
- Treat templates, presets, and slots as journalled operations. A slot must not
  target protected or read-only chrome.
- Do not add behavior that exists only in the reference editor or that
  duplicates the core operation logic.
- Do not imply that AI provider adapters ship with the core. They do not.

## Contract and release discipline

The document schema and operation API are stable throughout 1.x. A breaking
change requires a major release and a migration. Additive changes still need
schema and type generation, validation, compatibility tests, and documentation.

Do not report a feature as working until you run the relevant validation or
test. Keep public examples neutral. Never commit credentials, private brand
kits, customer assets, or downstream workflow data.

## Useful entry points

- `assemblash new`, `add-text`, `add-image`, `add-svg`, and `export` for a
  straightforward local workflow. `add-image` and `add-svg` take the input file
  positionally or through `--file`, so `assemblash add-svg ./poster logo.svg`
  works.
- `assemblash set <PROJECT> --layer <ID>` reaches every updatable layer
  property: `--name` (an empty string removes the name), `--x`, `--y`,
  `--width`, `--height`, `--rotation`, `--opacity`, `--visible`, `--locked`,
  `--blend`, `--effects`, `--effects-file`, `--text`, `--text-file`, `--font`,
  `--size`, `--color`, `--align`, `--line-height`, `--weight`, `--font-style`,
  `--letter-spacing`, `--vertical-align`, `--fit`, `--asset`, and
  `--allow-locked`. The invocation can carry many flags, but it is one `update`
  operation: journalled once, undone once. The layer's kind refuses a property
  it does not have, and the refusal names it. `assemblash style` still exists
  and is the same builder.
- `assemblash styles` lists what this build renders — blend modes and effects
  with examples. `assemblash styles --json` prints the same listing as JSON;
  it is byte-for-byte what `GET /api/capabilities` and the MCP
  `list_capabilities` tool serve. Check it (or the endpoint, or the tool)
  before you use a blend mode or effect: what a build cannot render, it
  refuses.
- `assemblash render` and `assemblash export` take the output path positionally
  or through `--out`, and print `<path>`, a tab, and the written file's
  `sha256:<hex>` digest on stdout. Compare that digest. Do not re-hash the
  file.
- `assemblash serve` for the local HTTP API and reference editor. It binds to
  loopback by default; a non-loopback bind requires an access token. From 1.5.0
  `--reclaim-stale-locks` (also on `mcp`) lets it clear a stale project lock on
  its own, but only one this machine wrote whose process is gone; anything else
  still needs `assemblash unlock` or a person in the editor.
- `assemblash mcp` for agent access over stdio. Inspect, preview, and validate
  before you use mutating tools.
- `assemblash variants` for deterministic template variants. Its `--values` is
  already a file path.

For exact arguments, payloads, and supported properties, use
`assemblash --help` and the committed schemas. Do not guess.

## Canvas editing (1.4.0 and newer)

Check the running binary's help or MCP tool list before you use `canvas set` or
`update_canvas`; 1.3.1 does not include them. Canvas resizing never scales
layers. The default `top-left` anchor preserves positions; other anchors
translate root layers. Respect a refusal caused by locked or protected content.
Omit `background` to preserve it. Send JSON `null` or use `--no-background` to
clear it. Apply dimensions and background together for one undoable change.

After `updateCanvas` enters a project's journal, 1.3.1 refuses both `show` and
`history`, including after undo. Keep using the newer binary and preserve the
journal. The document schema version remains 1.

## Fonts (1.5.0 and newer)

Check `GET /api/fonts` before you assume a family exists. It returns
`{ families, faces }`; `faces` is new in 1.5.0 and `families` is unchanged, so
the family list is safe to read against any release. A font that renders on
your machine is not evidence that this store holds it.

The rest of the font store is reachable over HTTP from 1.5.0. Check the running
binary before you use these; 1.4.0 serves only `GET /api/fonts`. All of them sit
behind the same access token as every other route.

- `POST /api/fonts?filename=<name>` with the raw bytes, up to 64 MB, imports a
  TTF, OTF, TTC, OTC, WOFF or WOFF2 file. `201 {imported, families}`, or `200`
  when those exact bytes were already stored. Refusals are
  `400 unsupportedFontFormat`, `400 invalidFilename` and `422 invalidFont`;
  from 1.6.0 a body over the limit is `413 payloadTooLarge` (the same code
  the asset upload route answers with).
- `DELETE /api/fonts/{family}` — `200 {removed, families}`, or
  `404 unknownFontFamily`. Every project using that family then reports a
  missing font, so remove one only when the user asked for it. From
  1.6.0 a family literally named `catalogue` or `install` is removed with
  `DELETE` on its own fixed path; 1.5.0 answered 405 for those two names.
- `GET /api/fonts/catalogue` — what the bundled manifest offers: `packs`, and
  `families` with a license and a byte size.
- `POST /api/fonts/install` with `{"pack":"default"}` or `{"family":"…"}` —
  `201 {installed, families}`; `404 unknownFontFamily` or `404 unknownFontPack`;
  `502 fontInstallFailed`. **This is the one route in the product that reaches
  the network.** It downloads font files, so confirm before you call it, and do
  not expect anything else here to make a network request. A pack install is
  atomic: a download that fails leaves the store exactly as it was. An unknown
  key in the body is refused, like every other typed request envelope.

## SVG asset text (1.5.0 and newer)

Check the running binary before you rely on either behavior. From 1.5.0 a
render **refuses** when an imported SVG asset draws text that no loaded font can
provide; 1.4.0 and earlier export that document successfully with the text
simply absent, and report only the `svgAssetTextWithoutFont` warning.

The rule 1.5.0 applies: an asset draws text only if every `<text>` in it names
at least one non-generic font family that the render loaded. Text that names no
family, or only a generic one (`serif`, `sans-serif`, …), is refused too — the
pinned store never holds the renderer's fallback family, so the render draws nothing there, guaranteed. The error names the asset id and, where there is
one, the family. The CLI exits non-zero and writes no file, HTTP answers
`422 renderFailed`, and MCP returns a tool error. Fix the document. Do not
retry: name a loaded family in the asset, or outline the text before
you import it.

## Shapes and shadows (1.6.0 and newer)

Check the running binary first. A `shape` layer draws a rectangle, an ellipse
or a line, and its transform box *is* the geometry: a rect fills the box, an
ellipse is inscribed in it, a line runs across its middle — `width` is the
line's length, `rotation` its angle, and `height` layout only.

Paint is `fill` (a colour, or absent for none) and `stroke`
(`{ color, width }`, or absent); a shape with neither is valid. On a rect and
an ellipse the stroke is painted inward, so the box stays the visual box —
except below width 1, where it is drawn as a hairline that may spill up to
half a pixel outside.

- `update` takes `fill`, `stroke` and `cornerRadius`. An explicit JSON `null`
  on `fill` or `stroke` clears that paint; omission of the key leaves it alone.
  `cornerRadius` is not nullable (0 is the square corner) and an ellipse or a
  line refuses it by name.
- MCP `update_layer` cannot use `null` here, because a null argument is
  indistinguishable from an omitted one: pass `clearFill: true` or
  `clearStroke: true` instead, never beside `fill` or `stroke`.
- MCP `add_shape_layer` takes `shape` (`rect`, `ellipse`, `line`),
  `cornerRadius`, `fill`, `stroke` as `{ color, width }` and `name`, beside the
  usual placement, box, `expectedVersion` and `dryRun` arguments.
- CLI `add-rect`, `add-ellipse` and `add-line` take `--x`, `--y`, `--width`,
  `--height`, `--rotation`, `--opacity`, `--layer-name`, plus `--fill`,
  `--stroke`, `--stroke-width` and, for a rect, `--corner-radius`. `set` takes
  the same four paint flags; `--fill none` and `--stroke none` clear a paint,
  and `--stroke-width` alone is refused when the layer has no stroke to take a
  colour from.
- A `dropShadow` effect takes `dx`, `dy`, `blur` and `color`; an `#rrggbbaa`
  alpha is its opacity, `dx` and `dy` at 0 is a glow, whole pixels are
  crispest.
- A colour slot may target a shape's `fill` as well as a text layer's `color`.
  Stroke colour is not slot-able anywhere in 1.x — do not offer it.

1.0 through 1.5 refuse a document that contains a shape layer outright: every
command exits 1 and names `shape` as an unknown layer kind, and nothing in the
file is repairable — open it with 1.6.0 or newer. A `dropShadow` is milder:
1.3.0 and newer keep it and refuse only the render.

## Pass JSON in a file, not on the command line

PowerShell rewrites an inline JSON argument, so a payload typed after a flag
does not always reach the process intact. Three flags exist for that reason:
`preset define --properties-file`, `set --effects-file`, and `set --text-file`.
Write the JSON — or, for `--text-file`, the literal text, which is the only way
to set text that contains a newline — to a file and pass the path. Each flag
conflicts with its inline twin, so pass one or the other.

## An export may return warnings

Every export reports what it could not do well, with these codes:

- `wordBrokenMidWord` — a single word was too wide for its box and was split.
- `textOverflowsBox` — the laid-out text is taller than the box that holds it.
- `lockReclaimed` — the server reclaimed a stale project lock while it produced
  this export (1.5.0 and newer).
- `svgAssetTextWithoutFont` — still a defined code, but from 1.5.0 no longer
  produced for the case it was added for. That render refuses instead; see
  "SVG asset text" above.

Each warning is `{ code, message, layerId? }`. **A warning is not a failure.**
It changes no pixel and no exit status; the file is written either way. Report
it and fix the document. Do not treat the export as failed.
`POST /api/projects/{id}/export` and MCP `export_document` return a `warnings`
array. The CLI prints one line per warning on stderr as
`code<TAB>layerId<TAB>message`; `--warnings-json` on `render` and `export`
prints the whole array as JSON on stdout instead and leaves stderr quiet.

## MCP tools beyond the read/mutate set

- `create_project` — `project`, `width`, `height`, and optional `background`
  (`#rrggbb` or `#rrggbbaa`) and `name`. It also becomes the current project,
  so later calls need not repeat it. A server started with `--project` refuses
  it.
- `add_svg_layer` — `asset`, `x`, `y`, `width`, `height`, and optional
  `rotation`, `fit`, `parent`, `index`, `name`. An asset id only: a layer can
  draw only an asset that was already imported and sanitized, and no tool takes
  markup.
- `render_document` — `project`; returns `svg`, `width`, `height`. The same
  vector render `GET /api/projects/{id}/preview.svg` serves.
- `find_overlaps` — `project`, `layerIds`; returns `pairs`. An empty `layerIds`
  means the whole document; an id that is not in the document is refused, not
  ignored.
- `update_layer` takes `lineHeight`, `fontWeight`, `fontStyle`,
  `letterSpacing`, and `verticalAlign` beside `opacity`, `text`,
  `fontFamily`, `fontSize`, `color`, `align`, `fit`, `blendMode`, and
  `effects`. The render refuses a `fontWeight` that the font store has no face
  for, and names family, weight and style — never substituted.
- `list_capabilities` takes no arguments and returns this build's blend modes
  and effects with examples — the same JSON `GET /api/capabilities` and
  `assemblash styles --json` serve.
- `export_document` returns `warnings` beside `path`, `bytes`, `width`, and
  `height`.

## HTTP notes

- `GET /api/projects/{id}/overlaps` returns `{"pairs": [["layer_a","layer_b"],
  …]}` — the same pairs in the same order as `assemblash overlaps` and MCP
  `find_overlaps`. Narrow it with `?layers=`, repeated or comma-separated. A
  layer id that is not in the document is `422 operationRefused`.
- A `create` or `update` that carries a property the operation does not define
  is refused: `422` with code `operationRefused` and the property named in the
  message. The document version does not move and nothing is journalled. Do not
  resend the same payload — correct the property name, or use the operation
  schema to find the one that exists.
