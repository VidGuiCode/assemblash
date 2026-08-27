# Assemblash

> A local-first visual document engine and MCP server for humans and AI agents.

**Status:** **1.1.0 — released and working.** The document model, operation layer, deterministic renderer, local HTTP API, CLI and MCP interfaces remain compatible with 1.0, while the reference editor now has a canvas-first creation, editing, arrangement, and export workflow. `1.0.0` remains the stability promise for the **document schema and operation API** — see [What 1.0 means](#what-10-means). [Current project status](#current-project-status) lists exactly what has been run.

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

## What the engine is for

The sections from here to [What 1.0 means](#what-10-means) describe the product's intent and shape. [Current project status](#current-project-status) is the record of what has actually been built and run — read that one for facts.

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

Assemblash ships a small reference web UI, served by the binary itself, to make the project easy to understand, test, and use locally. It is one client of the API and holds no privileged path — it is not the only intended frontend.

A downstream application may instead provide its own interface and use the Assemblash API directly. This allows specialized applications to add their own templates, design rules, workflows, or permissions without changing the generic engine.

## Architecture

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
- API: an embedded Rust crate and an HTTP surface over `axum`, both over the same operation layer
- MCP: official Rust SDK, over stdio
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

## Non-goals

Assemblash does not attempt to provide:

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

## How it was built

The order was deliberate, and steps 1–8 and 10 are done as of 1.0.0:

1. Define and validate the document format. ✔
2. Implement pure document operations with tests. ✔
3. Render the document deterministically. ✔
4. Add PNG/SVG export. ✔
5. Add a local HTTP API and an embedded library interface. ✔
6. Build the minimal reference UI. ✔
7. Add the MCP server with read-only tools first. ✔
8. Add safe write operations with versioning and undo. ✔
9. Add optional AI and downstream adapters. — **not done, and out of scope by design**; adapters are the post-1.0 extension point (PRD use case D).
10. Package for local use and Docker deployment. ✔

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

## What 1.0 means

`1.0.0` promises two things and declines to promise a third.

**The document schema is stable.** `schemaVersion` has been 1 since v0.1.0 and has never needed a migration. Fields have only ever been added, with defaults, and unknown keys are preserved verbatim through a load-and-save cycle — which is property-tested. A document written by 1.0.0 will be readable by every 1.x release.

**The operation API is stable.** The operation set has grown — layer operations, layout operations, presets, slots — but no existing operation has changed shape. A client written against 1.0 keeps working across 1.x.

**Breaking either now requires a MAJOR bump.** That is the whole content of the promise: not that the product is finished, but that what you build against will not move under you.

**It is not a claim of feature completeness.** Styled text runs do not exist. The interface is a reference client, not a design tool. What is here is listed below, and what is not is said plainly.

### Three limits worth knowing before you adopt it

- **Fourteen blend modes, not sixteen.** `color-dodge` and `color-burn` rasterize correctly but do not produce bit-identical bytes on every target — the x86_64 macOS runner disagreed with the other five for the same document and fonts. Reproducibility (NFR-1) is what the rest of the engine rests on, including the content hashes a variants batch is checked by, so both are refused with a typed error rather than drawn. This will be revisited if the upstream renderer changes.
- **AI adapters (PRD use case D) are out of scope by design.** No adapter ships, and the core never requires an AI provider. Adapters are the post-1.0 extension point, not a missing feature.
- **Authentication is a single shared token, and identity belongs in front of it.** A non-loopback bind refuses to start without one; the token is compared in constant time, never logged, and never put in a URL. There are no users, no roles, and no revocation beyond rotating the one token. For OIDC, SSO, or per-user access, put a reverse proxy in front — see [DEPLOYMENT.md](DEPLOYMENT.md). The token authenticates; it does not encrypt.

The evidence behind every claim in this document — which test, which release, which run — is kept with the project's working notes and summarised in the release notes for [v1.1.0](https://github.com/VidGuiCode/assemblash/releases/tag/v1.1.0).

## Current project status

**1.1.0.** What exists and has been run:

1. **Documents** — canvas, assets, and a nested tree of text, image, SVG, and group layers, saved as `document.json` plus `assets/`. Unknown fields survive a load-and-save cycle. Hand-editing the file is supported.
2. **Operations** — thirteen typed operations (create, update, delete, duplicate, move, resize, rotate, reorder, group, ungroup, show/hide, lock/unlock, rename), each validated and applied transactionally: a refused operation leaves the document exactly as it was.
3. **Layout** — align, centre on canvas, distribute, snap, bounding boxes, and overlap detection, all rotation-aware and taking explicit layer-id lists.
4. **History and safety** — an append-only journal, undo and redo across restarts that produce a byte-identical document, protected and read-only layers, file locking, and expected-version conflict checks.
5. **Fonts** — a local store where every file is pinned by the hash of its own bytes, importing TTF, OTF, collections, WOFF, and WOFF2, with a one-time installer for twelve pinned OFL families (the Notos, Inter, Roboto, Open Sans, Montserrat, Playfair Display, Lora, and JetBrains Mono). The system font list is never consulted; a font the store does not have is an error, never a substitution.
6. **Rendering** — document to SVG as a pure function, then to PNG through resvg, with fourteen CSS blend modes and a non-destructive per-layer effect stack (brightness, contrast, saturation, blur, and seeded grain). A blend mode or effect this build does not render is refused, never silently drawn as something else — `color-dodge` and `color-burn` are refused on exactly those grounds, because they do not produce identical bytes on every target.
7. **Workspace** — an OS-appropriate data directory created on first run, holding `config.toml`, the font store, and projects. A project directory stays portable; the workspace is a default location, not a container. A workspace of two hundred projects stays usable through `index.db`, a rebuildable cache behind project search, recents, and thumbnails — delete it and nothing is lost.
8. **Local HTTP API** — `assemblash serve`, on `127.0.0.1` only, over the same operation layer everything else uses: projects, document, history, validation, operations with dry run and expected-version checks, atomic operation batches, undo and redo, asset upload, text layout, and PNG preview. JSON Schemas and TypeScript declarations for the document and the operations are published at [`schema/`](schema/).

9. **MCP server** — `assemblash mcp`, over stdio, on the official Rust SDK. Seven read tools let an agent list projects, read a document, list and inspect layers, validate, read the history, and get a rendered PNG preview. Twenty mutating tools cover the layer and layout operations, undo and redo, and export — each with a dry run, an optional expected version, protected-layer checks, and a transaction id it can be undone by.

10. **Reference interface** — served at `/` by `assemblash serve`, embedded in the binary. A single Add panel, direct on-canvas text editing, a contextual toolbar, a docked Properties/Layers/History panel, multi-selection, rotation-aware resize handles, alignment and distribution, a complete context menu, keyboard shortcuts, zoom and responsive editing all compile to the same validated operations used by the CLI, API, and MCP server. No canvas library: committed preview and export pixels come from the engine's own renderer.

11. **Packaging** — binaries for Windows, Linux, and macOS on x86_64 and ARM64; a 9 MB `scratch` Docker image; and friendly mode: launching the binary with no arguments creates the workspace, serves, opens a browser, and can be stopped from the page. A second launch opens the one already running.

12. **Presets** — named style bundles stored in the document: font, size, colour, alignment, line height, opacity, blend mode, and effect stack. Applying one compiles to exactly the update a person would send, so it is journalled, undoable, refused on protected layers, and pixel-identical to setting the same properties by hand.

13. **Templates with named slots** — a document names some of its layers as slots, and `assemblash variants` (or the API, or MCP) renders one image per set of values. Slots are declared, changed, and removed by ordinary operations, so authoring a template is journalled and undoable like every other edit; a slot may not be aimed at protected or read-only chrome, and filling one passes the same check every other mutation does.

What does not exist yet: styled text runs, and AI adapters (out of scope by design — see [What 1.0 means](#what-10-means)). Everything above this section describes where the project is going, not what it does today.

The renderer gate passes on Windows, Linux, and macOS, on x86_64 and aarch64: the same document plus the same font files produces bit-identical PNGs on all six targets.

### Trying it

**The short version:** download the binary for your machine from the latest [release](https://github.com/VidGuiCode/assemblash/releases), unpack it, and double-click it. It creates its own workspace, starts, and opens your browser. Stop it with the button in the page.

Binaries are attached for all six targets — Windows, Linux, and macOS on x86_64 and ARM64. To build from source instead, with Rust 1.92 or newer:

```sh
cargo install --git https://github.com/VidGuiCode/assemblash --tag v1.1.0 assemblash-cli
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

In Docker, from a `scratch` image with nothing else in it:

```sh
docker compose run --rm assemblash token show && docker compose up
```

Or serve the API and the interface. `serve` creates the workspace on first run and prints the URL it bound:

```sh
assemblash serve
```

It prints the URL it bound; open that and the reference interface is there. It listens on `127.0.0.1` by default and needs no configuration.

To serve it to more than this machine, bind explicitly — which requires an access token, and refuses to start without one:

```sh
assemblash token show
assemblash serve --bind 0.0.0.0
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the token, Docker, and reverse-proxy configurations with TLS.

Or point an agent at it. Most MCP clients take a command and its arguments:

```json
{ "command": "assemblash", "args": ["mcp"] }
```

Add `--project /path/to/a/project` to serve a single folder instead of the workspace.

Layers marked `protected` or `readOnly` refuse every change an agent can make, and no tool can clear those flags.

The project does not claim to support a feature until it has been implemented and run.
