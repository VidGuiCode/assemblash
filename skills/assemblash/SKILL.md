---
name: assemblash
description: Create, inspect, edit, validate, render, or export Assemblash visual-document projects through its CLI, HTTP API, or MCP server. Use for work on an Assemblash document or integration; not for unrelated repository maintenance.
---

# Assemblash

Assemblash is a local-first, structured visual-document engine. Treat a
document as an editable layer tree, not as a flattened image or a graphical
interface to click through. The CLI, HTTP API, MCP server, and reference editor
are clients of the same validated operation layer.

## Start with the current state

When working in the Assemblash repository, read `README.md` for released
behavior. Read `PRD.md`, `AGENTS.md`, and `CONTRIBUTING.md` before changing the
engine or its public surfaces. The committed schemas are the precise contracts:

- `schema/document.schema.json`
- `schema/operation.schema.json`

Inspect the target project, layer tree, document version, validation result,
and rendered preview before proposing an edit. Use explicit layer IDs.
Selection belongs to the client session and is not document state.

## Make changes safely

Prefer MCP, the HTTP API, or the CLI over editing `document.json` directly.
Those interfaces validate mutations, enforce locks and protection, journal
history, and support undo. A normal edit follows this sequence:

1. Read the document, layers, version, and preview.
2. Identify the exact layer IDs and intended operation.
3. Dry-run the mutation when the interface supports it, using the current
   expected document version.
4. Apply the validated operation and retain its transaction ID when available.
5. Validate and render a fresh preview. Export only after checking the result.

Do not bypass a refusal by editing files or attempting to clear protected
content. If another actor changed the document, refresh the state instead of
reusing a stale expected version.

## Preserve the engine's guarantees

- Keep filesystem work inside the configured project or workspace boundary.
- Respect `locked`, `protected`, and `readOnly` layers, including group
  containment.
- Keep compositions deterministic. Use known local assets and the configured
  font store; report a missing font or asset instead of substituting one.
- Treat templates, presets, and slots as journalled operations. A slot must not
  target protected or read-only chrome.
- Do not add behavior that exists only in the reference editor or duplicates
  the core operation logic.
- Do not imply that AI provider adapters ship with the core. They do not.

## Contract and release discipline

The document schema and operation API are stable throughout 1.x. A breaking
change requires a major release and a migration. Additive changes still need
schema and type generation, validation, compatibility tests, and documentation.

Do not report a feature as working until you have run the relevant validation
or test. Keep public examples neutral: never commit credentials, private brand
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
  `--size`, `--color`, `--align`, `--line-height`, `--fit`, `--asset`, and
  `--allow-locked`. However many flags one invocation carries, it is one
  `update` operation: journalled once, undone once. A property the layer's kind
  does not have is refused, naming it. `assemblash style` still exists and is
  the same builder.
- `assemblash render` and `assemblash export` take the output path positionally
  or through `--out`, and print `<path>`, a tab, and the written file's
  `sha256:<hex>` digest on stdout. Compare that digest instead of re-hashing
  the file.
- `assemblash serve` for the local HTTP API and reference editor. It binds to
  loopback by default; a non-loopback bind requires an access token.
- `assemblash mcp` for agent access over stdio. Inspect, preview, and validate
  before using mutating tools.
- `assemblash variants` for deterministic template variants. Its `--values` is
  already a file path.

For exact arguments, payloads, and supported properties, use
`assemblash --help` and the committed schemas instead of guessing.

## Canvas editing (1.4.0 and newer)

Check the running binary's help or MCP tool list before using `canvas set` or
`update_canvas`; 1.3.1 does not include them. Canvas resizing never
scales layers. The default `top-left` anchor preserves positions; other anchors
translate root layers. Respect a refusal caused by locked or protected content.
Omit `background` to preserve it, send JSON `null` or use `--no-background` to
clear it. Apply dimensions and background together for one undoable change.

After `updateCanvas` enters a project's journal, 1.3.1 refuses both `show` and
`history`, including after undo. Keep using the newer binary and preserve the
journal. The document schema version remains 1.

## Pass JSON in a file, not on the command line

PowerShell rewrites an inline JSON argument, so a payload typed after a flag
does not always reach the process intact. Three flags exist for that reason:
`preset define --properties-file`, `set --effects-file`, and `set --text-file`.
Write the JSON — or, for `--text-file`, the literal text, which is the only way
to set text containing a newline — to a file and pass the path. Each conflicts
with its inline twin, so pass one or the other.

## An export may return warnings

Every export reports what it could not do well, with these codes:

- `wordBrokenMidWord` — a single word was too wide for its box and was split.
- `textOverflowsBox` — the laid-out text is taller than the box holding it.
- `svgAssetTextWithoutFont` — an imported SVG asset draws text in a family no
  loaded font provides, so that text will not appear.

Each warning is `{ code, message, layerId? }`. **A warning is not a failure.**
It changes no pixel and no exit status; the file is written either way. Report
it and fix the document, rather than treating the export as having failed.
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
  draw only an asset that was already imported and sanitized, and there is no
  tool that takes markup.
- `render_document` — `project`; returns `svg`, `width`, `height`. The same
  vector render `GET /api/projects/{id}/preview.svg` serves.
- `find_overlaps` — `project`, `layerIds`; returns `pairs`. An empty `layerIds`
  means the whole document; an id that is not in the document is refused, not
  ignored.
- `update_layer` takes `lineHeight` beside `opacity`, `text`, `fontFamily`,
  `fontSize`, `color`, `align`, `fit`, `blendMode`, and `effects`.
- `export_document` returns `warnings` beside `path`, `bytes`, `width`, and
  `height`.

## HTTP notes

- `GET /api/projects/{id}/overlaps` returns `{"pairs": [["layer_a","layer_b"],
  …]}` — the same pairs in the same order as `assemblash overlaps` and MCP
  `find_overlaps`. Narrow it with `?layers=`, repeated or comma-separated. A
  layer id that is not in the document is `422 operationRefused`.
- A `create` or `update` carrying a property the operation does not define is
  refused: `422` with code `operationRefused` and the property named in the
  message. The document version does not move and nothing is journalled. Do not
  resend the same payload — correct the property name, or use the operation
  schema to find the one that exists.
