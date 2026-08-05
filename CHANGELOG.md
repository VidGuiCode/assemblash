# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

## [0.6.0] — 2026-08-05

The local HTTP API, and a home for the data it manages. This is the first
network-facing surface, and it listens on `127.0.0.1` only.

Document `schemaVersion`: **1** (unchanged).

### Added

- **Workspace.** On first run the binary creates an OS-appropriate data
  directory — `%APPDATA%\Assemblash`, `$XDG_DATA_HOME/assemblash` or
  `~/.local/share/assemblash`, `~/Library/Application Support/Assemblash` —
  holding `config.toml`, `fonts/`, and `projects/`. `ASSEMBLASH_WORKSPACE`
  overrides it. A project directory stays portable: the workspace is a default
  location, not a container.
- **HTTP API** (`assemblash serve`) over the same operation layer everything
  else uses: projects, document, history, validation, one operations endpoint
  taking an `Operation` with an optional expected version and a dry-run flag,
  undo and redo, asset upload, and PNG preview. Fonts come from the
  workspace store.
- Every failure answers with one envelope — `{"error":{"code","message",
  "details"}}` — with a stable machine-readable code, including a body that
  does not parse (FR-12).
- A `ProjectId` type: a project name is checked to be a single ordinary
  directory name before anything joins it to a path, so there is no code path
  that can be handed `../../etc` (PRD §10.1).
- Published **JSON Schemas** for the document and for operations, served by
  the API from the same generator that writes the committed copies, plus
  generated **TypeScript declarations** at `schema/*.d.ts`.
- `assemblash workspace` prints (and creates) this machine's workspace.

### Fixed

- `NewLayerKind::Text` sent `font_family`, `font_size`, and `line_height` in an
  otherwise camelCase wire format. `rename_all` on an enum renames its
  variants, not the fields of a struct variant, and nothing noticed while the
  only caller built the value in Rust. They are now `fontFamily`, `fontSize`,
  and `lineHeight`; the old spellings are still accepted, so history journals
  written before 0.6.0 keep replaying.

### Verified

- **Path-escape attempts are rejected**: through a project id, a URL-encoded
  separator, a drive letter, a UNC path, a reserved device name, and an
  uploaded filename. Nothing lands outside the workspace.
- **A stale expected version gives a 409** naming the expected and actual
  versions, and leaves the document byte-identical.
- **First run creates a valid workspace**, checked by running it on Windows
  and Linux. The macOS location is a pure function of `HOME` and is unit
  tested rather than executed — macOS joins the CI matrix in 0.10.0.
- An uploaded file is stored under its content hash; the client's filename
  contributes only an extension, and no scratch file is left behind.
- A dry run reports what would happen and changes nothing.
- Rendering through the API refuses a family the store does not have, and two
  previews of an unchanged document are byte-identical.

### Notes

- **`127.0.0.1` only, and not configurable.** Exposing the API to a network
  needs an answer to authentication first (PRD §16.14, open), and a settings
  key is how that decision gets made by accident.
- The server opens each project once and keeps the session, so it is the
  single writer for what it has open. Another process holding the same project
  is a structured 409 with the offending pid, never a wait.
- Not in this release, and not implied by it: browser auto-open, single-
  instance detection, a shutdown button, and `index.db`. Those belong to the
  milestones that need them.
- CI does not compile the generated TypeScript with `tsc` — it is checked
  structurally and for drift against the Rust types. The reference UI in 0.9.0
  is what will compile it in anger.

## [0.5.0] — 2026-08-05

Fonts and render depth. The document has been reproducible since 0.1.0, but a
document is only half the input to a render — this release pins the other half.

Document `schemaVersion`: **1** (unchanged — `blendMode` has been in the schema
since 0.1.0; this release renders it, and widens what it accepts).

### Added

- **Font store**: a directory where every font file is named by the hash of its
  own bytes, with an `index.json` recording family, style, weight, hash,
  provenance, and licence. `verify` re-hashes everything and names the file that
  changed — a font swapped behind the engine's back would otherwise change the
  pixels without changing any document.
- TTF, OTF, TrueType collections, WOFF, and WOFF2 import. Web fonts are
  decompressed on the way in and the *decompressed* bytes are what is stored and
  hashed, so nothing decompresses anything while rendering.
- **One-time installer** for a pinned set of OFL families. What may be installed
  is a manifest committed in this repository, pinned to one commit of the
  upstream font project and to the sha256 of each file; a download that does not
  match is refused rather than stored. It runs only when asked — rendering never
  reaches the network, and fonts already installed keep working with none.
- Blend modes `normal`, `multiply`, and `screen` are rendered. A group whose
  child blends is isolated, so a blend does not reach past the group it is in.
- `assemblash font add`, `list`, `install`, `verify`, `licenses`, and `remove`;
  `--font-store` on `render` and `export`, also readable from
  `ASSEMBLASH_FONT_STORE`.

### Changed

- **The first text baseline now sits one ascent below the layer box, read from
  the font file** — 0.1.0 used one whole font size everywhere, which was
  consistent but not typography. Every rendered image moves slightly; the gate
  goldens were regenerated deliberately and the images reviewed.
- `render` and `export` refuse a document that uses text when no fonts are
  named, rather than falling back to the old placement rule. Two commands that
  place text differently depending on how they were called is worse than one
  that insists on being told.
- A `blendMode` this build does not render — `overlay`, say, from a later
  version — now loads and round-trips verbatim instead of failing to parse. It
  composites normally and is never handed to the renderer.
- `cargo-deny` allows `CDLA-Permissive-2.0`, which covers the Mozilla CA root
  certificate data the installer needs to verify an HTTPS download.

### Verified

- The same document plus the same font bytes hash to the same PNG on Windows
  and Linux, x86_64 and aarch64.
- A family the store does not have is a structured error at every level — store,
  renderer, and command line — and never a substitution.
- Installing verifies the manifest's hash: a tampered download is refused and
  nothing is written.
- Multiply and screen composite correctly through the whole path from
  `blendMode` to pixels, and an isolated group contains its child's blend.
- The store's index is byte-identical whatever order fonts were imported in.

### Notes

- No font binaries ship inside the executable. The deployment story is one small
  static binary, font files are megabytes each, and a sha256 in a committed
  manifest pins them at least as tightly as embedding would.
- The store has no default location yet; it is named explicitly. The workspace
  in 0.6.0 gives it a home.
- FR-7 is **complete at thirteen operations**. `select` is not the fourteenth
  and never was: selection is a client concern, not document state, and the PRD
  was amended accordingly. Earlier entries in this file that say "13 of 14"
  describe what was known at the time.

## [0.4.1] — 2026-08-04

### Fixed

- `assemblash history` printed `operation` for the layout operations instead
  of naming them. The audit trail is meant to say what was done, so a fallback
  label for operations the printer had not been taught about defeated the
  point. Found by using the released 0.4.0 binary.

## [0.4.0] — 2026-08-04

Layout operations. Typed geometry an agent can use instead of guessing at
positions (R2).

Document `schemaVersion`: **1** (unchanged — this milestone adds operations,
not fields).

### Added

- `Align` (left, right, top, bottom, centre horizontally, centre vertically),
  `CenterOnCanvas`, `Distribute`, and `SnapTo`, applied through the operation
  layer like everything else: validated, journalled, and undoable.
- `get_bounding_box` and `find_overlaps` as read-only queries returning data.
  They are not operations and are not journalled.
- `assemblash align`, `center`, `distribute`, `snap`, `bounds`, and
  `overlaps`.
- Bounding boxes now account for rotation, by taking the extent of a layer's
  rotated corners. Grouping uses the same maths, so wrapping a tilted layer no
  longer produces a container too small to hold it — the approximation 0.2
  left behind with a note.

### Verified

- Aligning is idempotent, is deterministic across identical documents, and
  never changes a width, a height, or a rotation.
- Centring puts the set's bounding box on the canvas centre and keeps the
  layers' positions relative to each other.
- Distributing leaves equal gaps whatever order the ids arrive in.
- `find_overlaps` agrees with a brute-force check, is symmetric, and never
  reports a layer against itself.
- Every layout operation undoes to a byte-identical document.

### Notes

- Three behaviours the property tests forced, each documented where it lives:
  movements below a billionth of a pixel are not movements (otherwise
  aligning twice never settles); distribution measures its span from the
  extent of all the layers, not the first and last in sorted order; and gaps
  are never negative, so layers that do not fit end up touching rather than
  being reordered.
- A layer inside a **rotated** group is refused with a typed error rather than
  placed wrongly. This build composes translations; a position quietly wrong
  by a few degrees would be worse than saying no.
- Layout operations take explicit `ids` lists and do not use a selection.
  `select` remains unimplemented — 13 of the 14 operations FR-7 lists.

## [0.3.0] — 2026-08-04

History and the safety core. Every mutation is now recorded, reversible, and
refusable.

Document `schemaVersion`: **1** (unchanged — `version`, `protected`, and
`readOnly` are additive with defaults, and documents written by 0.1.0 and
0.2.0 still load unchanged).

### Added

- Append-only journal at `history/journal.jsonl`: one JSON object per line,
  recording the operation, the actor kind (`human`, `agent`, `script`,
  `adapter`), a timestamp, and the layers touched (PRD §10.5). It is never
  rewritten, so it stays greppable and cannot be quietly revised.
- Undo and redo, across restarts. Rebuilding a state takes the nearest
  snapshot and replays operations forward, reusing the ids the journal
  recorded — which is what makes undo byte-identical rather than merely
  equivalent.
- Transaction ids on every entry, so a write can be undone by id (FR-13).
- `Session`: opening a project takes a lock file, checks expected versions
  (PRD §10.3), and orders writes so a crash cannot lose work.
- Document `version`, incremented per mutation. A caller that passes the
  version it last read gets a structured conflict instead of overwriting work
  it never saw.
- Layer `protected` and `readOnly` flags (PRD §10.2), enforced in the
  operation layer. Deleting a group is refused if any layer inside it is
  protected.
- `assemblash undo`, `redo`, `history`, and `unlock`; `--actor`,
  `--actor-name`, and `--expect-version` on the editing commands.

### Verified

- **Apply then undo produces a byte-identical document**, including after
  closing and reopening the project, and for arbitrary-length histories.
- **A protected layer rejects every mutation** — delete, move, resize,
  rotate, rename, show/hide, lock, group, reorder — and the document is
  unchanged after each refusal (MVP criterion 11).
- **A process killed mid-write recovers cleanly**, on Windows and Linux,
  x86_64 and aarch64. The test aborts a real `assemblash` process at an exact
  point in the write path — after the journal append, and between writing the
  temporary document file and renaming it — then reopens the project and
  checks nothing was lost or corrupted.

### Notes

- There is deliberately **no operation to set `protected` or `readOnly`**. An
  agent that could unprotect a layer is an agent that is not held by
  protection at all; the flags are set in the document, and later by an
  authorized surface.
- Opening a project reconciles against the document's recorded version rather
  than by comparing content, so editing `document.json` by hand remains
  supported (FR-9). Hand edits are not in the journal, so they are not part of
  undo.
- Asset import is not undoable: reversing a file copy would mean deciding
  whether to delete the user's file.
- `select` is still not implemented — 13 of the 14 operations FR-7 lists.

## [0.2.0] — 2026-08-04

The full layer model. Every mutation of a document now goes through one
operation layer, which is what the HTTP API and the MCP server will be
transports over rather than parallel implementations of.

Document `schemaVersion`: **1** (unchanged — the new layer kind is additive,
and documents written by 0.1.0 still load unchanged).

### Added

- Operation layer (`assemblash-core::ops`). Applying is transactional: the
  operation runs against a copy, the result is validated, and only then is it
  written back. A refused operation leaves the document exactly as it was,
  never half-applied. Operations are serializable, so the value an agent sends
  is the value that can be journalled.
- Dry run (PRD §10.4): what an operation would do, without doing it.
- Thirteen of the fourteen operations FR-7 lists: create, update, delete,
  duplicate, move, resize, rotate, reorder, group, ungroup, show/hide,
  lock/unlock, rename. Grouping boxes layers by their bounding box and re-bases
  them, so the picture does not move; ungrouping puts them back.
- SVG layer type, referencing an imported SVG asset.
- Locked layers refuse changes unless a request says explicitly to override,
  which is also the only way to unlock one.
- `assemblash add-svg`, and the CLI now reports what an SVG import removed.

### Security

- Imported SVGs are rewritten to an allowlisted subset of themselves before
  they are stored. Scripts, event handlers, `foreignObject`, and references to
  anything outside the file are removed; only same-document fragments and
  `data:` image URIs survive. A DOCTYPE is refused outright, which closes off
  entity expansion.
- Deeply nested markup is refused before it reaches the XML parser. Found by
  the no-panic property tests: a few hundred bytes of nested elements
  overflows the stack inside the parser, and a stack overflow aborts the
  process rather than returning an error.
- Sanitising happens at import, so everything under a project's `assets/`
  directory is safe by construction.

### Verified

- Property tests: arbitrary sequences of operations either succeed and leave a
  valid document, or are refused and leave it byte-identical. Group then
  ungroup restores every layer's position. A layer cannot be moved inside
  itself. Duplicating a group mints new ids for the whole copied subtree.
- No-panic tests: hostile operations — ids that do not exist, indices past the
  end, NaN, infinity, `f64::MAX` — applied singly and in sequence, and
  arbitrary bytes fed to the SVG importer. Only a valid document or a typed
  error is accepted.
- A document written by 0.1.0 still loads and validates.

### Not included

- `select`, the fourteenth FR-7 operation. Whether selection belongs to the
  document or to each client changes the API, the MCP tools, and the UI, so it
  is a product decision rather than something to settle while writing code. It
  is not implemented, and FR-7 is therefore not complete.

## [0.1.0] — 2026-08-04

First release with running code: the Phase 0 vertical slice (PRD §13). It
proves the rendering approach and nothing more — there is no HTTP API, no MCP
server, no undo, and no user interface yet.

Document `schemaVersion`: **1** (initial).

### Added

- Cargo workspace: `assemblash-core` (document model, validation, storage),
  `assemblash-renderer` (SVG and PNG), and the `assemblash` binary.
- Document schema version 1: canvas, assets, and a nested layer tree of text,
  image, and group layers, with z-order, transforms, and opacity. Unknown JSON
  keys are preserved through a load-and-save cycle. Reserved fields
  (`blendMode`, `effects`, `constraints`, text `runs`) exist with defaults and
  round-trip untouched; nothing interprets them yet.
- JSON Schema for the document, generated from the types and committed at
  `schema/document.schema.json`.
- Validation reporting every problem in one pass as typed errors (NFR-4):
  dimensions, opacity, colours, duplicate ids, dangling asset references, and
  asset paths that try to leave the project (PRD §10.1).
- Project storage (FR-9): `document.json` plus an `assets/` directory. Saves
  are written to a temporary file and renamed into place. Assets are copied in
  and stored under their content hash, which also detects a file edited behind
  the engine's back.
- Rendering: document to SVG as a pure function, then SVG to PNG through
  resvg. Exported PNGs carry document id, schema version, and renderer version
  as metadata (FR-11), plus an optional caller-supplied timestamp.
- Fonts are loaded only from files named by the caller. There is no system
  font fallback anywhere in the pipeline; a missing family is an error, never
  a substitution.
- `assemblash` command line tool: `new`, `add-text`, `add-image`, `render`,
  `export`, `show`. Scaffolding for the spike, not the intended interface.
- CI on Windows and Linux, x86_64 and aarch64 (NFR-2), with formatting,
  clippy, and a dependency licence allowlist (R8) enforced.

### Verified

- The Phase 0 renderer gate passes on all four CI targets: a document survives
  save, reload, and re-render with an identical image; six reference renders
  hash bit-identically across both operating systems and both architectures;
  Arabic joins and runs right-to-left, Japanese draws, and combining
  diacritics compose; a screen blend mode and a Gaussian blur rasterize
  correctly.
- Release binaries are attached for the same four targets. macOS is not yet
  built or tested.

### Decided

- License: Apache-2.0 (PRD decision 16.11).
- Versioning: SemVer releases with an independent integer document
  `schemaVersion` (PRD decision 16.13).
- Implementation stack: Rust single-binary engine; SVG-first rendering via
  `resvg`/`tiny-skia`; embedded-then-HTTP API; MCP over stdio
  (PRD decisions 16.1, 16.2, 16.5, 16.6 — full rationale in PRD §16.1).
- The renderer choice is settled: resvg passed the Phase 0 gate, so the Skia
  fallback is not being taken.
