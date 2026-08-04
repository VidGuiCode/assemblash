# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

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
