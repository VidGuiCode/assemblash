# Assemblash Product Requirements Document

**Product:** Assemblash  
**Status:** Pre-alpha — v0.1.0 (Phase 0 spike) released 2026-08-04  
**Document type:** Product and technical requirements  
**Audience:** Maintainers, contributors, downstream integrators, and coding agents  
**Primary deployment model:** Local machine or self-hosted server  
**Public/private boundary:** Generic engine public; downstream brand assets and private integrations remain outside this repository

---

## 1. Product summary

Assemblash is a local-first, headless visual document engine designed to be used by both humans and AI agents.

It provides:

- a structured document model for layered visual compositions;
- an operation API for creating and editing documents;
- deterministic rendering and export;
- an optional local reference web interface;
- an MCP server that exposes document inspection and editing capabilities to AI agents;
- extension points for image processing, AI providers, animation workflows, and downstream applications.

Assemblash is deliberately smaller than Photoshop, GIMP, or a full design platform. Its purpose is to make visual composition programmable without flattening the document or forcing agents to operate a graphical interface through unreliable clicks.

### One-sentence definition

> Assemblash lets humans and AI agents compose, inspect, modify, and export structured visual documents through a local API, MCP, or optional graphical interface.

---

## 2. Problem statement

Current visual workflows create a gap between human editing and agent automation.

### Existing editor problem

Mature editors are powerful, but external agents generally lack a stable, typed interface for:

- reading the document structure;
- identifying layers and groups;
- changing exact text or positions;
- applying repeatable transformations;
- validating output against rules;
- producing variants without GUI automation.

### Existing code pipeline problem

Code-first pipelines are reproducible, but they often produce flattened output. A human may then need to rewrite code to make a small visual adjustment.

### Existing image-generation problem

Image-generation systems can produce visually interesting results, but they are not reliable for:

- exact text;
- logos and marks;
- repeatable layout;
- protected brand elements;
- predictable layer structure;
- deterministic export.

### Required middle layer

Assemblash should preserve structure while allowing both programmatic and human editing:

```text
Structured document
      ├── Human-readable in a UI
      ├── Machine-readable as JSON
      ├── Editable through an API
      ├── Controllable through MCP
      └── Renderable to final assets
```

---

## 3. Goals

### G1 — Provide a stable structured document model

Documents must represent visual compositions as layers, groups, assets, styles, and transforms rather than only as a flattened bitmap.

### G2 — Make the core usable without a frontend

The document engine, renderer, and API must be usable by scripts, services, and downstream products without requiring the reference UI.

### G3 — Make agent operations safe and predictable

Agents must receive structured context and use typed operations. The system must support preview, validation, version checks, and reversible changes.

### G4 — Support deterministic visual production

Text, layout, vector elements, and protected assets should render consistently across repeated exports.

### G5 — Keep the project local-first

The core must work without a cloud account, mandatory hosted service, or paid AI provider.

### G6 — Enable downstream applications

Other applications should be able to provide their own frontend, templates, permissions, brand rules, and deployment model.

### G7 — Publish a useful open-source foundation

The public project should be generic, documented, testable, and extensible without exposing private downstream assets or credentials.

---

## 4. Non-goals

The following are explicitly outside the initial product scope:

- replacing Photoshop or GIMP;
- professional raster painting and brush engines;
- full PSD import/export fidelity;
- complete desktop operating-system integration;
- cloud accounts and billing;
- hosted multi-tenant SaaS;
- real-time multiplayer editing;
- mandatory AI image generation;
- an AI model marketplace;
- unrestricted agent access to the host filesystem;
- automatic publishing to social networks or websites;
- a full animation timeline;
- professional print color management;
- every possible blend mode and filter.

These may be reconsidered only after the core document and agent workflow are stable.

---

## 5. Target users

### 5.1 Agent-integrated application developers

Developers who want to embed visual composition into another product and expose the canvas to an AI agent.

### 5.2 Technical creators

People who want reproducible, scriptable visual assets without depending on a cloud design platform.

### 5.3 Small teams and organizations

Teams that need reusable templates, local or self-hosted operation, and controlled asset handling without adopting a large design platform.

### 5.4 Human reviewers

People who want to inspect and adjust an agent-created composition in a simple visual interface before export.

---

## 6. Primary use cases

### Use case A — Agent creates a structured composition

1. The user asks an agent to create a document from a template.
2. The agent creates text, image, SVG, and group layers.
3. The agent positions and styles those layers using typed operations.
4. The user reviews the result in a frontend.
5. The user or agent makes revisions.
6. The document is exported.

### Use case B — Agent edits an existing document

1. A document is opened or selected.
2. The agent reads the document state and receives a preview.
3. The user requests a specific change.
4. The agent proposes or applies typed operations.
5. The system validates the result and records the operation.
6. The user can undo or revise the change.

### Use case C — Deterministic template variants

1. A template contains named slots and protected layers.
2. A script or agent supplies content and parameters.
3. Assemblash renders several variants.
4. Each variant remains traceable to its source document and parameters.
5. The variants are exported in one or more dimensions.

### Use case D — Optional AI image operation

1. The user selects an editable raster layer or region.
2. An optional adapter sends a controlled operation to a local or remote image provider.
3. The result returns as a new or replacement layer.
4. Protected layers remain unchanged.
5. The user reviews and accepts or discards the result.

### Use case E — Downstream application integration

1. A downstream product embeds or launches Assemblash.
2. The downstream frontend provides its own UI and rules.
3. The backend stores and renders generic Assemblash documents.
4. The downstream product keeps its private assets and templates outside the generic project.

---

## 7. Product principles

### 7.1 Core before interface

The document model and operation semantics are the product foundation. The reference UI must not become the only way to use the system.

### 7.2 One operation layer

The UI, CLI, API, and MCP server must call the same validated operations. There must not be separate implementations with inconsistent behavior.

### 7.3 Preview before mutation

Agents should be able to inspect a document and preview proposed changes before applying them.

### 7.4 Protected content must be explicit

Documents should be able to mark layers as protected, locked, or read-only. AI operations must respect these properties.

### 7.5 Determinism is a feature

If an operation can be deterministic, it should be. Random or provider-dependent operations must record their provider, parameters, seed where applicable, and source asset metadata.

### 7.6 Private integrations stay private

The generic project must not require or contain private brand kits, credentials, customer data, or downstream business logic.

---

## 8. Functional requirements

### FR-1 — Document creation

The system MUST support creation of a document with:

- width and height;
- unit or pixel interpretation;
- background color or transparency;
- document ID;
- schema version;
- creation and update metadata.

### FR-2 — Layer model

The system MUST support at least these layer types in the first release:

- text;
- raster image;
- SVG/vector content;
- group.

Each layer MUST have:

- a stable ID;
- a name;
- a parent group or root placement;
- a z-order;
- visibility state;
- lock state;
- transform data;
- optional metadata.

### FR-3 — Groups

The system MUST support:

- nested groups;
- moving layers into and out of groups;
- group transforms;
- group visibility and locking;
- group duplication;
- group ordering.

### FR-4 — Text

Text layers MUST support, at minimum:

- text content;
- font family reference;
- font size;
- weight or style where available;
- color;
- alignment;
- line height;
- opacity;
- a bounding box;
- overflow behavior.

The renderer MUST clearly report when a requested font is unavailable.

### FR-5 — Images and assets

The system MUST support importing local raster images and SVG assets through a controlled asset interface.

Assets MUST have:

- stable asset IDs;
- MIME type;
- source metadata;
- dimensions where known;
- a storage reference;
- optional content hash.

The initial implementation MUST avoid unrestricted arbitrary filesystem access from agent tools.

### FR-6 — Transforms

The system MUST support:

- x/y position;
- width and height;
- scale;
- rotation;
- transform origin or equivalent behavior;
- opacity.

The system SHOULD support non-destructive transforms where practical.

### FR-7 — Layer operations

The operation layer MUST support:

- create;
- update;
- delete;
- duplicate;
- move;
- resize;
- rotate;
- group;
- ungroup;
- reorder;
- hide/show;
- lock/unlock;
- select;
- rename.

Each mutation MUST be validated before commit.

### FR-8 — Undo and history

Mutating operations MUST be represented as history entries or reversible transactions.

The first release MUST support undo for operations performed through the API and reference UI. MCP-triggered writes MUST also be reversible.

### FR-9 — Persistence

The system MUST support saving and loading a document in a human-inspectable format.

The initial representation SHOULD be:

```text
document.json
assets/
  asset-id-1.png
  asset-id-2.svg
```

A packaged `.assemblash` format MAY be added later after the directory representation is stable.

Documents MUST include a schema version and SHOULD support migration between compatible versions.

### FR-10 — Rendering

The renderer MUST produce a preview from the document model without requiring the reference UI.

The renderer MUST report errors for:

- missing assets;
- unavailable fonts;
- unsupported layer properties;
- invalid dimensions;
- malformed SVG or image data.

### FR-11 — Export

The first release MUST support PNG export.

The first release SHOULD support SVG export when all included content is compatible with SVG output.

Exports MUST record:

- document ID;
- schema version;
- output dimensions;
- renderer version;
- export time;
- warnings or degraded features.

### FR-12 — API

The system MUST expose a local API or embedded library interface for:

- creating and loading documents;
- reading document state;
- applying operations;
- rendering previews;
- exporting documents;
- validating documents.

The API MUST use explicit schemas and stable error responses.

### FR-13 — MCP server

The MCP server MUST be an adapter over the public API.

Initial MCP capabilities MUST be divided into:

#### Read-only

- inspect document;
- list layers;
- get selection;
- retrieve preview;
- validate document;
- read text and metadata.

#### Mutating

- create or update layers;
- move and resize layers;
- group and reorder layers;
- duplicate or delete layers;
- export a document.

Mutating tools SHOULD support:

- dry-run or preview mode;
- expected document version;
- operation summary;
- protected-layer checks;
- undo transaction ID.

### FR-14 — Reference UI

The reference UI MUST support the first-release operations through a simple canvas and layer panel.

It SHOULD include:

- canvas preview;
- layer tree;
- property inspector;
- text and image insertion;
- drag or numeric transforms;
- visibility and locking;
- save/load;
- export;
- operation history.

The UI MUST remain replaceable by downstream applications.

### FR-15 — Optional AI adapters

AI providers MUST be optional integrations and MUST NOT be required by the core.

An AI adapter MUST:

- identify the provider and operation;
- preserve the original asset or layer unless replacement is explicitly accepted;
- record relevant parameters;
- respect protected layers;
- return structured errors;
- avoid leaking local project data without explicit configuration.

---

## 9. Proposed document model

The exact schema is a technical design decision, but the first model should have a shape similar to:

```json
{
  "schemaVersion": 1,
  "documentId": "doc_example",
  "canvas": {
    "width": 1200,
    "height": 675,
    "background": "#101014"
  },
  "assets": {
    "asset_logo": {
      "kind": "svg",
      "path": "assets/asset_logo.svg",
      "mimeType": "image/svg+xml"
    }
  },
  "layers": [
    {
      "id": "group_background",
      "type": "group",
      "name": "Background",
      "children": ["layer_background"]
    },
    {
      "id": "layer_background",
      "type": "image",
      "name": "Background image",
      "assetId": "asset_background",
      "transform": {
        "x": 0,
        "y": 0,
        "width": 1200,
        "height": 675,
        "rotation": 0,
        "opacity": 1
      },
      "locked": true,
      "visible": true
    }
  ],
  "rootLayerIds": ["group_background"],
  "metadata": {}
}
```

The schema MUST remain implementation-independent enough to support multiple renderers and frontends.

---

## 10. Agent safety model

### 10.1 Filesystem boundary

The server MUST operate inside an explicitly configured project root or asset directory. MCP tools MUST NOT receive unrestricted filesystem access by default.

### 10.2 Protected layers

Layers may be marked:

- `locked` — cannot be changed by normal operations;
- `protected` — AI adapters cannot replace or edit the content;
- `readOnly` — visible and inspectable but not mutable through the API.

### 10.3 Version checks

Every document mutation SHOULD include an expected document version. If the document changed since the agent inspected it, the API should reject the mutation and require a fresh read.

### 10.4 Dry-run operations

The API SHOULD support returning:

- the proposed operation list;
- affected layer IDs;
- validation warnings;
- a preview render;

without committing the changes.

### 10.5 Auditability

Mutations SHOULD record:

- operation type;
- actor type (`human`, `agent`, `script`, or `adapter`);
- timestamp;
- affected IDs;
- previous values where needed for undo;
- provider metadata for AI operations.

---

## 11. Non-functional requirements

### NFR-1 — Local execution

The core MUST run locally without a hosted service or mandatory network access.

### NFR-2 — Cross-platform support

The initial target environments are Windows and Linux. The project SHOULD avoid platform-specific assumptions in the core.

### NFR-3 — Reproducible output

The same document, assets, renderer version, and configuration SHOULD produce equivalent output across repeated runs.

### NFR-4 — Structured errors

Errors MUST identify the operation, relevant IDs, and a human-readable cause without exposing secrets.

### NFR-5 — Testability

Core operations, schema validation, serialization, rendering, export, and MCP tool schemas MUST be testable without a live cloud provider.

### NFR-6 — Extension safety

Optional providers and downstream adapters MUST be isolated from the core so that failure in an AI integration cannot corrupt the base document model.

### NFR-7 — Documentation

Each public operation, document field, MCP tool, and extension point MUST have documentation and an example.

---

## 12. MVP acceptance criteria

The MVP is complete only when all of the following are demonstrated with real execution:

1. A document can be created from an API call.
2. Text and image layers can be added.
3. Layers can be grouped and reordered.
4. Layers can be moved and resized.
5. A document can be saved and loaded without losing structure.
6. A preview can be rendered without opening the reference UI.
7. A PNG can be exported.
8. Invalid operations return structured errors.
9. At least one local MCP client can inspect the document.
10. At least one local MCP client can apply a reversible layer operation.
11. Protected or locked layers cannot be modified through normal agent tools.
12. The reference UI can open, edit, and export the same document format used by the API.
13. Tests cover the document model, core operations, persistence, export, and MCP schemas.
14. No cloud account or paid provider is required for the MVP.

---

## 13. Suggested implementation phases

### Phase 0 — Technical spike

Goal: validate the document model and rendering approach.

Deliverables:

- one document schema;
- text and image layers;
- one renderer;
- save/load;
- PNG export;
- a small command-line smoke test.

Decision gate: continue only if the document survives round-trip serialization and produces a usable export.

### Phase 1 — Core engine

Deliverables:

- validated operation types;
- layer tree and groups;
- transforms;
- history and undo;
- schema validation;
- deterministic renderer;
- structured errors;
- automated tests.

### Phase 2 — Local API and persistence

Deliverables:

- local API or embedded SDK;
- project-root filesystem boundary;
- asset import;
- preview endpoint;
- export endpoint;
- version checks;
- API documentation.

### Phase 3 — Reference UI

Deliverables:

- canvas;
- layer tree;
- property inspector;
- insertion controls;
- history controls;
- save/load/export flow.

### Phase 4 — MCP server

Deliverables:

- read-only inspection tools;
- preview and validation tools;
- safe write tools;
- dry-run support;
- version checks;
- operation summaries;
- MCP documentation and example configuration.

### Phase 5 — Adapters

Potential adapters:

- deterministic SVG/HTML workflows;
- local ComfyUI;
- local vision analysis;
- animation/rendering tools;
- downstream application frontends;
- additional export formats.

### Phase 6 — Packaging and deployment

Potential deliverables:

- Docker image;
- Docker Compose example;
- local CLI installer;
- home-lab deployment guide;
- optional reverse-proxy and OIDC guidance;
- desktop wrapper evaluation.

---

## 14. Technical direction

The implementation stack is **Rust** — decided 2026-08-03; the full rationale
and rejected alternatives are recorded in §16.1. The requirements the stack
was selected against:

- a reliable, deterministic renderer;
- typed document schemas;
- local HTTP or embedded operation access;
- MCP server implementation;
- PNG export;
- testable serialization;
- Windows, Linux, and macOS support on both x86_64 and ARM64;
- minimal resource use and single-binary deployment.

Summary of the chosen direction (details in §16.1):

- Rust core, shipping as one static binary;
- `serde` document model with JSON Schema generated via `schemars` — the
  document format stays language-neutral;
- SVG-first rendering rasterized with `resvg`/`tiny-skia` (pure Rust,
  explicit font files only, no system-font dependency);
- embedded (crate) interface first, `axum` HTTP layer in Phase 2;
- MCP over stdio via the official Rust SDK;
- web-based reference UI (TypeScript) served as static assets by the same
  binary, with UI types generated from the JSON Schema;
- Python and other languages remain welcome as adapter implementations
  against the API.

The project MUST avoid selecting a dependency solely because it offers a visually impressive demo. License terms, serialization behavior, export reliability, testability, and agent access are more important. Every renderer-level dependency must pass the Phase 0 determinism gate (§16.1) before the project depends on it.

---

## 15. Risks and mitigations

### R1 — Scope expands into Photoshop

**Mitigation:** keep the MVP limited to structured layers, groups, text, images, transforms, and export. Record broader ideas in a roadmap rather than implementing them immediately.

### R2 — Agent makes visually poor decisions

**Mitigation:** expose structured state, screenshots, typed actions, constraints, protected layers, preview mode, and human review.

### R3 — Rendering differs between UI and export

**Mitigation:** use one renderer or one shared rendering contract for preview and export. Add snapshot tests for representative documents.

### R4 — Forks diverge

**Mitigation:** keep downstream customizations in adapters and templates. Version the core API. Avoid unnecessary permanent forks.

### R5 — Private assets leak into the public repository

**Mitigation:** use neutral fixtures and example assets. Keep downstream brand packs and credentials outside this repository. Add a privacy scan before release.

### R6 — AI providers make the project expensive

**Mitigation:** keep AI optional. Make the core and deterministic workflows fully useful without inference.

### R7 — MCP grants too much access

**Mitigation:** project-root sandboxing, explicit tool schemas, read/write separation, protected layers, version checks, dry-run, and audit history.

### R8 — Dependency license conflicts

**Mitigation:** record every runtime dependency and license before the first public release. Recheck the license when replacing the canvas or renderer foundation.

### R9 — Public project receives little contribution

**Mitigation:** design the project to be valuable even with one maintainer. Provide a working reference UI, examples, tests, and clear extension points; do not assume community maintenance.

---

## 16. Open decisions

These decisions should be resolved before implementation reaches the first public release:

1. ~~TypeScript-only core or a language-neutral API with multiple implementations?~~ **Resolved:** Rust core with a language-neutral JSON Schema document format (see §16.1).
2. ~~SVG-first, HTML/canvas, or hybrid renderer?~~ **Resolved:** SVG-first, rasterized with resvg (see §16.1).
3. Which canvas library, if any, should power the reference UI?
4. Directory-based JSON documents only, or a packaged `.assemblash` file?
5. ~~Which local API transport: embedded library, HTTP, or both?~~ **Resolved:** embedded (core crate) first, HTTP via axum in Phase 2 (see §16.1).
6. ~~Which MCP transport should the reference server support first?~~ **Resolved:** stdio first (see §16.1).
7. How should fonts be resolved and reported?
8. What image formats are supported in the first release?
9. Which operations are atomic transactions?
10. What is the minimum audit/history format?
11. ~~Which open-source license fits the dependency graph and contribution goals?~~ **Resolved:** Apache-2.0 (see §16.1 below).
12. Should optional provider adapters live in this repository or separate repositories?
13. ~~What versioning policy applies to the document schema and API?~~ **Resolved:** see §16.1 below.
14. What security profile is required for home-lab deployment?

### 16.1 Resolved decisions

**License (decision 11, resolved 2026-08-03):** Apache License 2.0. Chosen for
the explicit patent grant and the §5 contribution clause, which suit a generic
engine intended to be embedded by downstream applications. Dependency licenses
must be rechecked against Apache-2.0 as the stack is selected (R8).

**Implementation stack (decisions 1, 2, 5, 6 — resolved 2026-08-03):**

The maintainer set three deciding criteria: lowest possible resource use,
the easiest possible deployment, and first-class support for x86_64 and ARM64
across Windows, Linux, and macOS. Single-maintainer iteration speed was
explicitly deprioritized.

- **Language: Rust.** The engine ships as one static binary (target ~8–15 MB,
  ~5–10 MB idle memory, millisecond startup) with no runtime, no package
  manager, and no system dependencies to install. Cross-compilation to
  x86_64 and aarch64 is native.
- **Document model:** `serde`-based, with JSON Schema generated via `schemars`,
  so the document format remains language-neutral even though the reference
  implementation is Rust. TypeScript types for the reference UI are generated
  from the JSON Schema.
- **Renderer: SVG-first.** The document renders to SVG through a pure
  function, then rasterizes to PNG with `resvg`/`tiny-skia`. This stack is
  pure Rust — including text shaping (`rustybuzz`) — and uses only explicitly
  provided font files, never system fonts. This is what makes deterministic,
  bit-comparable output across operating systems and CPU architectures
  achievable (NFR-3): there is no platform-specific code path in the rendering
  pipeline. SVG export (FR-11) falls out of the intermediate format.
- **Local API:** the core crate is the embedded interface; a thin HTTP layer
  (`axum`) follows in Phase 2. Both call the same operation layer (§7.2).
- **MCP:** the official Rust MCP SDK, stdio transport first; HTTP transport
  may follow.
- **Reference UI:** web-based (TypeScript) as always intended, shipped as
  static assets served by the same binary. The UI is a client of the API like
  any downstream application (§7.1).

Considered and rejected: **TypeScript/Node** (best iteration speed and MCP
maturity, but a ~100 MB runtime, roughly an order of magnitude more idle
memory, and per-platform native-binding artifacts — the weakest fit for the
resource and portability criteria); **Go** (equal single-binary story, but no
production-grade pure-Go SVG renderer or text shaper — CGo bindings would
forfeit exactly the painless cross-compilation being optimized for);
**headless-browser rendering** (output varies across browser versions,
violating NFR-3, and is heavyweight to deploy).

Accepted trade-offs, recorded deliberately: slower per-feature development,
Rust compile times, a smaller contributor pool, and a type-generation step
for the UI instead of a shared TypeScript import. The renderer choice must be
revalidated at the Phase 0 gate: cross-platform output equivalence, correct
shaping of non-Latin text, and correct rasterization of at least one blend
mode and one filter. The named fallback if resvg fails the gate is
`skia-canvas`-class Skia bindings, re-run through the same gate.

**Versioning policy (decision 13, resolved 2026-08-03):**

- Releases use Semantic Versioning `MAJOR.MINOR.PATCH` (for example `v0.2.350`
  or `v0.12.2`). Pre-1.0, MINOR may include breaking changes, as SemVer allows.
- The document `schemaVersion` is an **independent integer**, decoupled from
  the release version. An application release may or may not introduce a new
  schema version; a schema change always increments `schemaVersion` and MUST
  ship with a migration path (FR-9).
- Every export records both the renderer/application version and the document
  schema version (FR-11).
- The public API is versioned with the application release; breaking API
  changes after 1.0 require a MAJOR increment.

---

## 17. Testing strategy

### Unit tests

- document validation;
- layer creation and deletion;
- group operations;
- transforms;
- ordering;
- protected-layer behavior;
- serialization and migration;
- operation history.

### Rendering tests

- representative layer compositions;
- text placement;
- missing asset behavior;
- unsupported feature warnings;
- preview/export consistency.

### API tests

- valid and invalid requests;
- version conflicts;
- project-root boundaries;
- structured error responses;
- export output.

### MCP tests

- tool schema validation;
- read-only tools;
- dry-run mutations;
- protected-layer rejection;
- successful reversible mutations;
- malformed agent input.

### End-to-end smoke test

A local smoke test MUST create a document, add text and image layers, save it, reload it, request a preview, apply one MCP mutation, undo it, and export a PNG.

No public release should be described as working until this smoke test has run successfully on the target development environments.

---

## 18. Release and contribution policy

Before the first public release, the repository should contain:

- a selected open-source license;
- a working vertical slice;
- installation instructions;
- API and MCP examples;
- a security policy;
- contribution guidelines;
- a changelog or release notes process;
- a dependency and license inventory;
- neutral sample assets;
- a clear list of implemented and unimplemented features.

Contributors should be encouraged to add generic capabilities to the core and keep product-specific behavior in adapters.

---

## 19. Definition of success

Assemblash is successful if a developer can install it locally, provide a structured document to an agent, ask the agent to make a precise visual change, inspect the result in a frontend, undo or revise the change, and export a reliable image without requiring a cloud design platform.

The project does not need to replace professional editors. It needs to make a smaller workflow—structured, repeatable, agent-controlled visual composition—work well.
