# Assemblash

> A local-first visual document engine and MCP server for humans and AI agents.

**Status:** Early design / pre-alpha

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
- `get_selection`
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

This repository currently contains the product definition only. Implementation should begin with a small vertical slice that can:

1. create a document;
2. add text and image layers;
3. save and reload the document;
4. render a preview;
5. export a PNG; and
6. inspect the document through a local API.

The project should not claim to support features until they have been implemented and verified.
