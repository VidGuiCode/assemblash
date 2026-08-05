# Assemblash

> A local-first visual document engine and MCP server for humans and AI agents.

**Status:** Pre-alpha — v0.6.0 is released and runs: the document model, the operation layer with undo and history, layout operations, a hash-pinned font store, deterministic PNG export, and a local HTTP API bound to `127.0.0.1`. There is no MCP server and no user interface yet. See [Current project status](#current-project-status) for exactly what has been run.

Assemblash is a headless system for creating, inspecting, modifying, rendering, and exporting structured visual documents. It provides a machine-readable document model, a local API, an MCP server for agent access, and an optional reference web interface.

Assemblash is not intended to be a Photoshop replacement. It focuses on a smaller and more programmable problem: composing visual assets from layers, text, images, SVGs, groups, and reusable templates.

## Why Assemblash exists

Most image workflows expose one of two extremes:

- a powerful visual editor that an agent cannot reliably control;
- a code or image-generation pipeline that produces flattened output and is difficult for a human to refine.

Assemblash is intended to provide a structured middle layer:

```text
Human UI ───────────────┐
CLI / scripts ──────────┼──> Assemblash API ──> Document engine ──> Renderer/exporter
AI agent ──> MCP server ┘
```

The document remains editable and inspectable. Human-facing frontends and agent interfaces use the same operations and the same document model.

## Core principles

- **Local-first:** the core must work without a cloud account or remote service.
- **Headless:** the document engine must be useful without the reference UI.
- **Agent-native:** structured state and typed operations are more important than GUI clicking.
- **Human-editable:** every agent change should remain visible and reversible.
- **Deterministic where possible:** text, layout, branding, and export should not depend on unpredictable generation.
- **AI-optional:** local or remote AI providers may add capabilities, but the core must not require them.
- **Composable:** other applications should be able to embed or call Assemblash.
- **Small before broad:** basic layers, groups, text, images, and export come before advanced image-editing features.

## Planned capabilities

### Document engine

- Canvas dimensions and background settings
- Text layers
- Raster image layers
- SVG/vector layers
- Groups and nested groups
- Position, size, rotation, scale, opacity, and visibility
- Layer ordering, locking, and duplication
- Stable IDs and metadata
- Undoable operations
- JSON-based persistence

### Rendering and export

- Preview rendering
- PNG export
- SVG export where the document contains compatible vector content
- Configurable output dimensions
- Export validation
- Reproducible rendering for deterministic documents

### Agent interface

The MCP server is planned as an adapter over the same API used by the UI. Initial tools should include:

- `get_document_state`
- `get_canvas_preview`
- `validate_document`
- `add_text_layer`
- `add_image_layer`
- `update_layer`
- `move_layer`
- `resize_layer`
- `group_layers`
- `reorder_layers`
- `duplicate_layer`
- `export_document`

Read-only inspection and preview operations should be available before write operations. Write operations should support validation, version checks, and reversible changes.

### Optional adapters

The core may later support adapters for:

- local ComfyUI workflows;
- local image-analysis or vision models;
- deterministic SVG/HTML renderers;
- animation tools;
- external import/export formats;
- custom downstream frontends.

AI adapters must not silently modify protected layers such as logos, legal text, or approved brand elements.

## Reference UI

Assemblash will include a small reference web UI to make the project easy to understand, test, and use locally. The reference UI is not the only intended frontend.

A downstream application may instead provide its own interface and use the Assemblash API directly. This allows specialized applications to add their own templates, design rules, workflows, or permissions without changing the generic engine.

## Proposed architecture

```text
┌───────────────────────────────────────────────────────────┐
│ Clients                                                   │
│ Reference UI · downstream applications · CLI · scripts    │
└───────────────────────┬───────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│ Assemblash API                                             │
│ Document queries · typed operations · validation · export  │
└───────────────┬───────────────────────┬───────────────────┘
                │                       │
┌───────────────▼──────────────┐ ┌──────▼───────────────────┐
│ Assemblash Core              │ │ MCP server                │
│ Document model · operations  │ │ Agent context and actions │
└───────────────┬──────────────┘ └──────────────────────────┘
                │
┌───────────────▼───────────────────────────────────────────┐
│ Rendering and persistence                                  │
│ JSON document · asset store · SVG/HTML/canvas · PNG export │
└────────────────────────────────────────────────────────────┘
```

The API and MCP server must not duplicate document logic. Both call the core operation layer.

## Technology

The engine is implemented in **Rust** and ships as a single static binary with no runtime dependencies, targeting Windows, Linux, and macOS on both x86_64 and ARM64. It was chosen for minimal resource use, deterministic rendering, and zero-friction deployment — including small home-lab hardware.

- Document model: `serde`, with a language-neutral JSON Schema generated via `schemars`
- Rendering: SVG-first, rasterized with `resvg`/`tiny-skia` — pure Rust, using only explicitly provided font files, so output is reproducible across operating systems and CPU architectures
- API: embedded Rust crate first, HTTP (`axum`) planned
- MCP: official Rust SDK, stdio transport first
- Reference UI: web-based (TypeScript), served as static assets by the same binary

The full decision record, including rejected alternatives, is in [PRD.md](PRD.md) §16.1.

## Project boundaries

Assemblash is a generic open-source engine. Downstream projects may maintain private:

- brand kits;
- templates;
- assets;
- workflow presets;
- authentication and deployment configuration;
- proprietary adapters.

The public repository should contain neutral examples only. Do not commit private company assets, credentials, or customer content.

## Non-goals for the first release

Assemblash will not initially attempt to provide:

- a complete Photoshop or GIMP replacement;
- a professional brush engine;
- full PSD compatibility;
- advanced color-management workflows;
- real-time multiplayer collaboration;
- billing or hosted accounts;
- a model marketplace;
- mandatory image generation;
- a full desktop application;
- arbitrary remote filesystem access from MCP.

## Development direction

The recommended order is:

1. Define and validate the document format.
2. Implement pure document operations with tests.
3. Render the document deterministically.
4. Add PNG/SVG export.
5. Add a local HTTP API or embedded library interface.
6. Build the minimal reference UI.
7. Add the MCP server with read-only tools first.
8. Add safe write operations with versioning and undo.
9. Add optional AI and downstream adapters.
10. Package for local use and Docker deployment.

## Related projects and inspiration

Assemblash is a focused project rather than a replacement for existing tools. Relevant projects include:

- [Penpot](https://penpot.app/) — open-source self-hosted design platform with programmable design workflows.
- [tldraw](https://tldraw.dev/) — extensible canvas SDK with agent and workflow starter kits.
- [Fabric.js](https://github.com/fabricjs/fabric.js) — JavaScript canvas library with object manipulation and serialization.
- [miniPaint](https://github.com/viliusle/miniPaint) — lightweight browser-based image editor.
- [Krita AI Diffusion](https://github.com/Acly/krita-ai-diffusion) — local AI-assisted image editing inside Krita.

Assemblash focuses on the intersection of structured visual composition, local execution, and agent control.

## Contributing

The project is intended to be open source. Contributions should prioritize:

- small, composable features;
- stable document semantics;
- tests for every document operation;
- reproducible exports;
- explicit security boundaries;
- provider-neutral integrations;
- documentation and examples.

Before adding a feature, ask whether it belongs in the generic engine or in a downstream adapter.

See [CONTRIBUTING.md](CONTRIBUTING.md) for scope rules and review expectations, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

Security issues must not be filed as public issues — see [SECURITY.md](SECURITY.md).

## License

Licensed under the [Apache License 2.0](LICENSE).

Apache-2.0 was chosen for the generic core because it is permissive, includes an explicit patent grant, and covers contribution terms directly — which suits a project intended to be embedded by downstream applications. Contributions are accepted under the same license (Apache-2.0 §5).

The dependency graph must be rechecked against this license once an implementation stack is chosen, and again if the renderer or canvas foundation is replaced.

## Current project status

**v0.6.0.** What exists and has been run:

1. **Documents** — canvas, assets, and a nested tree of text, image, SVG, and group layers, saved as `document.json` plus `assets/`. Unknown fields survive a load-and-save cycle. Hand-editing the file is supported.
2. **Operations** — thirteen typed operations (create, update, delete, duplicate, move, resize, rotate, reorder, group, ungroup, show/hide, lock/unlock, rename), each validated and applied transactionally: a refused operation leaves the document exactly as it was.
3. **Layout** — align, centre on canvas, distribute, snap, bounding boxes, and overlap detection, all rotation-aware and taking explicit layer-id lists.
4. **History and safety** — an append-only journal, undo and redo across restarts that produce a byte-identical document, protected and read-only layers, file locking, and expected-version conflict checks.
5. **Fonts** — a local store where every file is pinned by the hash of its own bytes, importing TTF, OTF, collections, WOFF, and WOFF2, with a one-time installer for a pinned set of OFL families. The system font list is never consulted; a font the store does not have is an error, never a substitution.
6. **Rendering** — document to SVG as a pure function, then to PNG through resvg, with `normal`, `multiply`, and `screen` blend modes.
7. **Workspace** — an OS-appropriate data directory created on first run, holding `config.toml`, the font store, and projects. A project directory stays portable; the workspace is a default location, not a container.
8. **Local HTTP API** — `assemblash serve`, on `127.0.0.1` only, over the same operation layer everything else uses: projects, document, history, validation, operations with dry run and expected-version checks, undo and redo, asset upload, and PNG preview. JSON Schemas and TypeScript declarations for the document and the operations are published at [`schema/`](schema/).

What does not exist yet: the MCP server, the reference UI, effects, styled text runs, and templates. Everything above this section describes where the project is going, not what it does today.

The renderer gate passes on Windows and Linux, x86_64 and aarch64: the same document plus the same font files produces bit-identical PNGs on every one of those targets. macOS is not built or tested yet.

### Trying it

Binaries for those four targets are attached to each [release](https://github.com/VidGuiCode/assemblash/releases). To build from source instead, with Rust 1.92 or newer:

```sh
cargo install --git https://github.com/VidGuiCode/assemblash --tag v0.6.0 assemblash-cli
```

The engine never uses installed system fonts, so a document has to be told where its fonts are. Install one into a font store once:

```sh
assemblash font install "Noto Sans" --font-store ~/assemblash-fonts
```

Then compose and export:

```sh
assemblash new ./poster --width 800 --height 400 --background '#f6f4ef'
assemblash add-text ./poster --text "Hello" --font "Noto Sans" --size 64 --x 40 --y 40 --width 720 --height 120
assemblash export ./poster --out poster.png --font-store ~/assemblash-fonts
```

`--font /path/to/Some.ttf` and `--font-dir /path/to/fonts` work too, for a font you already have on disk.

Or serve the API and drive it over HTTP. `serve` creates the workspace on first run and prints the URL it bound:

```sh
assemblash serve
```

It listens on `127.0.0.1` only. Making it reachable from a network needs an answer to authentication first, so this release does not offer the option.

The project does not claim to support a feature until it has been implemented and run.
