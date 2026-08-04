# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

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
