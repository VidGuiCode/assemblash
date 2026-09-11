<p align="center">
  <img src="assets/assemblash-mark.svg" width="112" alt="Assemblash logo">
</p>

<h1 align="center">Assemblash</h1>

<p align="center">
  A local-first visual document engine for people, applications, scripts, and AI agents.
</p>

<p align="center">
  <a href="https://github.com/VidGuiCode/assemblash/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/VidGuiCode/assemblash"></a>
  <a href="https://github.com/VidGuiCode/assemblash/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/VidGuiCode/assemblash/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/github/license/VidGuiCode/assemblash"></a>
  <img alt="Windows, Linux, and macOS" src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-2f3136">
</p>

Assemblash creates structured visual documents from text, images, SVGs, groups,
templates, and reusable styles. The result stays editable: you can inspect the
layer tree, apply a typed operation, undo it, render a preview, and export PNG or
SVG without depending on a cloud service.

It ships as one small executable with a browser-based editor, a command-line
interface, a local HTTP API, an embedded Rust API, and an MCP server. Every
interface goes through the same validated operation layer, so a change made by
an agent behaves like a change made by a person.

**Current release: 1.6.1.** The document schema and operation API have been
stable since 1.0. See the [release notes](https://github.com/VidGuiCode/assemblash/releases/tag/v1.6.1)
or [changelog](CHANGELOG.md) for the full history.

<p align="center">
  <img src="assets/assemblash-example.png" width="960" alt="A near-white diagram in Assemblash red and black: a white outlined document sheet with a simple layout on it and two earlier sheets behind it; on the left, terminal and node-graph icons labelled CLI and MCP connect to it, on the right a cursor icon labelled Canvas; the Assemblash mark and wordmark centred above, and one centred line below, Visuals that stay editable">
</p>

<p align="center"><sub>Created as a structured Assemblash document and exported by the deterministic renderer. <a href="examples/readme-hero">Inspect the editable project.</a></sub></p>

## Why Assemblash?

Visual work usually lands at one of two extremes: a powerful editor that is
hard to automate reliably, or a code/generation pipeline that produces a flat
image nobody can comfortably refine. Assemblash sits in the middle.

- **Structured, not flattened.** Documents keep their layers, groups, assets,
  metadata, templates, and named slots.
- **Local by default.** Creating, editing, rendering, and exporting work
  offline. No account or AI provider is required.
- **Safe to automate.** Mutations are typed, validated, journalled, versioned,
  dry-runnable, and undoable. Protected content stays protected.
- **Deterministic.** The same document, assets, and pinned font files produce
  bit-identical PNGs on all six supported release targets.
- **Easy to embed.** Use the Rust crates, HTTP API, CLI, or MCP server instead
  of driving the reference interface with clicks.

The AI story is deliberately small, and it is the whole story: an MCP server
and an attributed history. An agent connects over MCP and brings its own model.
No provider adapter ships with Assemblash, and the core never requires one — a
document is created, edited, rendered, and exported with no model involved at
all. What an agent does goes through the same validated operation layer as a
click or a shell command and lands in the journal with its actor, so its work
is reviewable and undoable rather than merely trusted.

Assemblash is deliberately not a Photoshop, GIMP, or Figma replacement. It is
a focused composition engine for repeatable visual assets, templates, and
agent-assisted workflows.

## Get started

### Download a release

Pick the download that fits your machine from
[GitHub Releases](https://github.com/VidGuiCode/assemblash/releases/latest):

| Platform | Download | Run it |
| --- | --- | --- |
| Windows | `assemblash-<version>-windows-<arch>.exe` | Double-click it. |
| Debian, Ubuntu | `assemblash_<version>_<arch>.deb` | `sudo apt install ./assemblash_<version>_<arch>.deb`, then pick Assemblash from the application menu. |
| macOS | the `.tar.gz` archive | Unpack it, then see the note below before first launch. |
| Anything else | the `.zip` or `.tar.gz` archive | Unpack it and launch `assemblash`. |

The executable is self-contained — the editor is compiled into it — so the
single file is the whole program. The archives and the `.deb` additionally
carry the licence texts and the changelog.

Launching it without arguments creates a local workspace, starts the server,
and opens the editor in your browser. A second launch opens the server that is
already running. You can stop it from the editor.

The macOS binaries are not signed with an Apple Developer ID, so macOS
quarantines them on download and Gatekeeper refuses the first launch. Clear
the flag yourself after unpacking:

```sh
xattr -d com.apple.quarantine ./assemblash
```

A Homebrew tap would remove that step, since Homebrew clears the flag on what
it installs. The formula is written and lives in `packaging/homebrew/`, but
the tap is **not published yet**, so there is no `brew install` to run today.

### Install from source

Building requires [Rust 1.92 or newer](https://www.rust-lang.org/tools/install):

```sh
cargo install --git https://github.com/VidGuiCode/assemblash --tag v1.6.1 assemblash-cli
```

### Create and export from the CLI

Assemblash never substitutes a system font behind your back. Install a font
into a local store once, then use that same store when exporting:

```sh
assemblash font install "Noto Sans" --font-store ./assemblash-fonts
assemblash new ./poster --width 800 --height 400 --background '#f6f4ef'
assemblash add-text ./poster --text "Hello" --font "Noto Sans" --size 64 --x 40 --y 40 --width 720 --height 120
assemblash add-rect ./poster --x 40 --y 200 --width 240 --height 96 --fill '#1d1d1f' --corner-radius 12
assemblash export ./poster --out poster.png --font-store ./assemblash-fonts
```

Already have a font file? Use `--font /path/to/SomeFont.ttf` or
`--font-dir /path/to/fonts` instead. Run `assemblash --help` or
`assemblash <command> --help` for the complete command reference.

`add-ellipse` and `add-line` take the same box flags; a line's box is the line,
so `--width` is its length and `--rotation` its angle.

The editor manages the same store without a terminal. Its Add panel has a
**Fonts** section (1.5.0 and newer) that lists the installed families and their
faces, imports TTF, OTF, TTC, OTC, WOFF and WOFF2 files from disk, and removes
a family after confirming that projects using it will report a missing font
until it is imported again. When the store is empty it offers a single button
that installs the bundled `default` pack — Noto Sans, Noto Serif and Noto Sans
Mono — naming what it will download before anything is fetched. The font picker
and the canvas update immediately, and removing a family never touches your
operating system's fonts or the file you imported from.

To change a layer afterwards, `assemblash set` reaches every updatable
property — name, position, size, rotation, opacity, visibility, lock, blend
mode, effect stack, text, font, size, colour, alignment, line height, fill,
stroke, stroke width, corner radius, fit, and asset:

```sh
assemblash set ./poster --layer <LAYER_ID> --color '#1d1d1f' --size 72 --line-height 1.4
```

However many flags you give it, one invocation is one operation: journalled
once, undone once.

`render` and `export` take the output path positionally as well as through
`--out`, and both print the written path and its `sha256:` digest as one
tab-separated line, so a script can compare what two interfaces produced
without hashing the file itself:

```sh
assemblash export ./poster poster.png --font-store ./assemblash-fonts
```

## Platform compatibility

The same six platforms are built, tested, and included in every release:

| Operating system | x86_64 / Intel / AMD64 | ARM64 / AArch64 |
| --- | :---: | :---: |
| Windows | ✅ `.exe`, `.zip` | ✅ `.exe`, `.zip` |
| Linux | ✅ `.deb`, `.tar.gz` | ✅ `.deb`, `.tar.gz` |
| macOS | ✅ Intel `.tar.gz` | ✅ Apple silicon `.tar.gz` |

Every release carries a bare `.exe` per Windows target and a `.deb` per Linux
target beside the archives. macOS has no installer of its own yet — see the
note above about the quarantine flag.

The release workflow checks that every binary starts before attaching it. CI
also runs the Rust workspace tests on all six targets. The reference editor
runs in a modern browser and is served by the executable itself.

## What is included

### A structured document engine

- Canvas dimensions and background settings
- Text, raster image, SVG, shape, and nested group layers
- Rectangle, ellipse, and line shapes with fill, stroke, and corner radius
- Position, size, rotation, scale, opacity, visibility, and ordering
- Stable IDs, metadata, locking, duplication, grouping, and ungrouping
- Alignment, centering, distribution, snapping, bounds, and overlap queries
- JSON persistence with unknown-field preservation
- Named presets, templates, slots, and deterministic variant batches

A project remains ordinary, portable files:

```text
my-project/
├── document.json
├── assets/
└── history/
```

You can inspect and hand-edit `document.json`. Normal edits should still go
through an Assemblash interface so they are validated and recorded in history.
The published contracts live in [`schema/`](schema/).

### Rendering and export

Assemblash converts a document to SVG as a pure function and rasterizes it with
`resvg` and `tiny-skia`. It supports PNG export, compatible SVG export,
configurable output dimensions, fourteen deterministic blend modes, and a
non-destructive effect stack for brightness, contrast, saturation, blur,
seeded grain, and drop shadow — a glow being that shadow with no offset.

Fonts are loaded only from files you explicitly provide or install into the
font store. Their bytes are hashed and pinned, which keeps typography and
export pixels consistent across operating systems.

An export also reports what it could not do well. It produces
`wordBrokenMidWord` when a single word is too wide for its box and has to be
split, `textOverflowsBox` when laid-out text is taller than the box holding it,
and — from 1.5.0, on the HTTP and MCP paths only — `lockReclaimed` when the
server reclaimed a stale project lock before producing it. Each carries a
`code`, a `message`, and the `layerId`
where one applies. A warning is advisory: it changes no pixel and no exit
status. The HTTP export response and the MCP `export_document` result carry a
`warnings` array; the CLI prints one line per warning on stderr, or the whole
array as JSON on stdout with `--warnings-json`.

Text inside an imported SVG asset is not advisory. From 1.5.0 a render refuses,
with a typed error naming the asset, unless every `<text>` in that asset names
at least one non-generic font family the render loaded; text that names only a
generic family such as `sans-serif` is refused too, because the pinned store
never holds the renderer's fallback. Earlier releases exported such a document
successfully with the text simply absent, which looked finished and was not.
Name a loaded family in the asset, or outline the text before importing it. The
1.3.0 warning code `svgAssetTextWithoutFont` is kept but is no longer produced
for this case, because the refusal comes first.

### History and safety

Every mutation uses the same transactional operation layer. A refused
operation leaves the document unchanged. Successful operations are journalled
with their actor and transaction ID and can be undone or redone across
restarts.

- Expected-version checks prevent stale clients from overwriting newer work.
- Dry run shows what a supported mutation would do without committing it.
- `locked`, `protected`, and `readOnly` layers are enforced in the engine, not
  just hidden behind UI controls.
- Project and asset paths stay inside the configured filesystem boundary.
- Imported SVGs are sanitized before they enter the asset store.

## Choose the interface that fits

| Interface | Best for | Start with |
| --- | --- | --- |
| Reference editor | Creating and refining documents visually | Launch `assemblash` |
| CLI | Shell scripts and straightforward local workflows | `assemblash --help` |
| HTTP API | Applications and custom frontends | `assemblash serve` |
| MCP server | AI agents and MCP-compatible clients | `assemblash mcp` |
| Rust crates | Embedding the engine directly | [`crates/`](crates/) |

The editor is a reference client, not a privileged implementation. Its edits,
the CLI, HTTP requests, and MCP tools all compile to the same operations.

Most MCP clients can start Assemblash with this configuration:

```json
{
  "command": "assemblash",
  "args": ["mcp"]
}
```

Add `--project /path/to/project` to expose one project instead of the workspace.
The MCP server provides read tools for documents, layers, validation, history,
and rendered previews, plus mutation tools with dry run, version checks,
protection checks, and undo transaction IDs.

An agent can also start a project with `create_project`, add a layer drawing an
already-imported SVG asset with `add_svg_layer`, ask for the document's vector
render as text with `render_document`, and query overlapping layers with
`find_overlaps` — the same pairs, in the same order, that the CLI and the HTTP
API report. `update_layer` sets `lineHeight` beside the other text properties,
and `export_document` returns the same `warnings` array the other interfaces
report.

For agents working from a repository checkout, a reusable public skill is in
[`skills/assemblash/SKILL.md`](skills/assemblash/SKILL.md). It explains the
document-first workflow and the guarantees an integration must preserve.

## How the pieces fit together

```text
Reference editor ───────┐
CLI and scripts ────────┼──> API / typed operations ──> document + history
Custom applications ───┤              │
AI agents via MCP ──────┘              └──────────────> renderer + export
```

The API and MCP server do not contain their own document logic. They are
adapters over `assemblash-core`, which owns validation and operations;
`assemblash-renderer` owns rendering; and the server, MCP, and CLI crates expose
those capabilities to different clients.

The implementation is Rust with a TypeScript reference interface. The
executable embeds the built interface, so users do not need Node.js. The
official `scratch` container image is about 9 MB.

## Local use and self-hosting

`assemblash serve` listens on `127.0.0.1` by default and needs no configuration:

```sh
assemblash serve
```

A non-loopback bind refuses to start without an access token:

```sh
assemblash token show
assemblash serve --bind 0.0.0.0
```

The token authenticates requests; it does not encrypt traffic. Put Assemblash
behind a TLS reverse proxy when it is reachable beyond a trusted network. See
[DEPLOYMENT.md](DEPLOYMENT.md) for Docker, Caddy, Traefik, nginx, and identity
provider guidance.

If a project's lock file is left behind by a process that died, opening the
project is refused until someone clears the claim — from the editor's confirm
dialog, or with `assemblash unlock`. `serve --reclaim-stale-locks` (also
accepted by `assemblash mcp`, and on from 1.5.0 by the double-click or
`--friendly` launch, where there is nobody at a terminal) lets the server clear
such a claim on its own, but only when the lock names this machine and its
process is provably gone. A lock from another machine, or one written by an
older build that recorded no machine name, still needs a person: on a synced
project folder a process id from a different computer proves nothing. Every
reclaim is reported in the server log, in the editor, and as a `lockReclaimed`
export warning.

## Edit the canvas

Use the **Canvas** button to open the editor's Properties panel.
Set dimensions, choose a background or transparency, select a resize anchor,
and apply the changes together. Layers keep their sizes; the anchor controls
only their positions. The CLI equivalent is:

```sh
assemblash canvas set ./poster --width 1200 --height 900 --background "#102030" --anchor center
assemblash canvas set ./poster --no-background
assemblash undo ./poster
```

MCP exposes `update_canvas` with `width`, `height`, `background`, `anchor`,
`expectedVersion` and `dryRun`. HTTP accepts the same canvas fields in an
`updateCanvas` operation at `POST /api/projects/{id}/operations`. Omit
`background` to preserve it or send `null` to clear it. A resize that would
move locked, protected or read-only content is refused atomically.

Canvas editing requires 1.4.0 or newer. Once a project records
`updateCanvas`, 1.3.1 refuses both `show` and `history` because it cannot parse
that journal operation, even after undo. Continue using the newer binary;
do not edit the journal. The document schema remains version 1.

The Add panel's **Shapes** row (1.6.0 and newer) adds a rectangle, an ellipse
or a line, and a shape's inspector then edits Fill, Stroke, Stroke width and,
for a rectangle, Corner radius — each row one undoable change, with a **None**
button beside each paint for removing it. A drop shadow is an effect rather
than a shape property: add `dropShadow` to any layer's effect stack and set its
`dx`, `dy`, `blur` and colour, leaving both offsets at 0 for a glow.

## Stability and current limits

Assemblash 1.x makes two compatibility promises:

1. A document written by 1.0 remains readable by every 1.x release.
2. A client written against the 1.0 operation API keeps working across 1.x.

Breaking either contract requires a major release and a documented migration.
Additive fields use defaults, and unknown document fields survive load and save.

The important limits are stated plainly:

- Styled text runs are not implemented yet.
- AI image/provider adapters do not ship and are out of scope for the core.
- Fourteen blend modes are supported. `color-dodge` and `color-burn` are
  refused because they are not bit-identical across every target.
- A document containing a shape layer needs 1.6.0 or newer: 1.0 through 1.5
  refuse to read the whole document, naming `shape` as a layer kind they do
  not know.
- A shape's stroke is painted inside its box, so the box is the visual box —
  except below width 1, where the stroke is drawn as a hairline centred on the
  edge and may spill up to half a pixel outside the box.
- Built-in authentication is one shared token. Accounts, roles, OIDC, SSO,
  TLS, and per-user audit identity belong in a reverse proxy.
- The editor is intentionally a reference client rather than a complete
  professional design application.

For the product scope and design rationale, read [PRD.md](PRD.md). For the
precise changes in each release, read [CHANGELOG.md](CHANGELOG.md).

## Try it and tell us what you find

Assemblash is released and the core contracts are stable; the useful next step
is seeing it in real workflows. If you try it, the project would genuinely
benefit from hearing what you made, what felt smooth, and what got in your way.

- Share a workflow, result, or question in
  [GitHub Discussions](https://github.com/VidGuiCode/assemblash/discussions).
- Report reproducible problems with the
  [bug form](https://github.com/VidGuiCode/assemblash/issues/new?template=bug_report.yml).
- Propose a focused addition with the
  [feature form](https://github.com/VidGuiCode/assemblash/issues/new?template=feature_request.yml).

Security problems are the exception: report those privately as described in
[SECURITY.md](SECURITY.md).

## Develop and contribute

Clone the repository and run the Rust checks from its root:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace
```

The TypeScript project is inside `ui/`—there is intentionally no root
`package.json`:

```sh
cd ui
npm ci
npm run check
```

`ui/dist/` is committed because the Rust binary embeds it. After changing the
interface, `npm run build` must leave that directory up to date.

Before proposing a change, please read [CONTRIBUTING.md](CONTRIBUTING.md). It
explains the stability rules, testing expectations, and the line between the
generic engine and downstream adapters. Security problems should be reported
privately as described in [SECURITY.md](SECURITY.md), never as public issues.

Useful project documents:

| Document | What it covers |
| --- | --- |
| [PRD.md](PRD.md) | Scope, requirements, invariants, and product decisions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution and review expectations |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Tokens, Docker, TLS, and reverse proxies |
| [SECURITY.md](SECURITY.md) | Supported releases and private reporting |
| [DEPENDENCIES.md](DEPENDENCIES.md) | Dependency and license inventory |
| [CHANGELOG.md](CHANGELOG.md) | Release-by-release history |

Assemblash is licensed under the [Apache License 2.0](LICENSE). The public
repository contains only the generic engine and neutral examples; private
brand kits, credentials, customer assets, and downstream workflows belong
outside it.
