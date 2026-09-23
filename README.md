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

Assemblash makes visual documents: posters, social images, diagrams, and
templates. You build a document from text, shapes, images, and SVG files. The
document stays editable: every layer stays a layer, every change can be
undone, and the export is exactly what you see.

Assemblash is one program. It contains a browser-based editor, a
command-line interface, a local HTTP API, and an MCP server for AI agents.
You and an AI agent can work on the same document at the same time. No cloud
service and no account are necessary.

**Current release: 1.10.0.** The document schema and the operation API are
stable since 1.0. See the [release notes](https://github.com/VidGuiCode/assemblash/releases/tag/v1.10.0)
or the [changelog](CHANGELOG.md).

<p align="center">
  <img src="assets/assemblash-example.png" width="960" alt="A near-white diagram in Assemblash red and black: a white outlined document sheet with a simple layout on it and two earlier sheets behind it; on the left, terminal and node-graph icons labelled CLI and MCP connect to it, on the right a cursor icon labelled Canvas; the Assemblash mark and wordmark centred above, and one centred line below, Visuals that stay editable">
</p>

<p align="center"><sub>Created as a structured Assemblash document and exported by the deterministic renderer. <a href="examples/readme-hero">Inspect the editable project.</a></sub></p>

## Quick start

You do not need a terminal for these steps.

### 1. Download Assemblash

Go to [GitHub Releases](https://github.com/VidGuiCode/assemblash/releases/latest)
and download the file for your computer:

For example, the Windows file of release 1.10.0 is
`assemblash-v1.10.0-windows-x86_64.exe`.

| Your computer | Download this file |
| --- | --- |
| Windows | `assemblash-<version>-windows-x86_64.exe` (on an ARM laptop: `windows-aarch64`) |
| Mac with Apple silicon (M1 or newer) | `assemblash-<version>-macos-aarch64.tar.gz` |
| Mac with an Intel processor | `assemblash-<version>-macos-x86_64.tar.gz` |
| Debian or Ubuntu | `assemblash_<version>_amd64.deb` (on ARM: `arm64`) |

The file is the complete program. You do not install anything else.

### 2. Start Assemblash

- **Windows:** double-click the `.exe` file. If Windows shows "Windows
  protected your PC", click **More info**, then **Run anyway**.
- **Debian or Ubuntu:** install the file with
  `sudo apt install ./assemblash_<version>_amd64.deb`. Then open Assemblash
  from the application menu.
- **Mac:** double-click the `.tar.gz` file to unpack it. Then double-click
  `assemblash`. The first time, macOS blocks it, because the program is not
  signed with an Apple Developer ID. Do these steps once:
  1. In the warning, click **Done**.
  2. Open **System Settings** → **Privacy & Security**.
  3. Find the message about `assemblash` and click **Open Anyway**.
  4. Double-click `assemblash` again and confirm.

The editor opens in your web browser. A small text window also opens (a
console window on Windows, a Terminal window on a Mac). Keep that window open
while you use Assemblash.

If you start Assemblash a second time, it opens the editor that already runs.

### 3. Make your first document

1. Click **Create a project**. Type a name, select a size, and click
   **Create project**.
2. Use the tools on the left side to add content: **Text**, **Shapes**,
   **Uploads** (images), and **Vector** (SVG files).
3. To add text, you need a font. The first time, open **Fonts** and click the
   button that installs the default fonts (Noto Sans, Noto Serif, and Noto
   Sans Mono). This is the only step that downloads something.
4. Click a layer on the canvas to select it. Drag it to move it. Change its
   properties in the panel. Use **Undo** and **Redo** at the top.
5. Click **Export** and select PNG or SVG.

Assemblash saves every change immediately. There is no **Save** button.

### 4. Let an AI agent work with you (1.9.0)

An AI agent, for example Codex or Claude, can work on your projects while the
editor is open. You see the agent's changes in the editor as they happen.

1. Start Assemblash (step 2).
2. In the editor, click the robot button at the top: **Connect an AI agent**.
   This window also opens by itself the first time you start Assemblash.
3. Click **Copy** on the configuration for your AI client.
4. Paste it into the MCP settings of your AI client:
   - **Codex:** add it to `~/.codex/config.toml`, or use **Settings** →
     **MCP servers** → **Add server** → **STDIO**.
   - **Other clients:** add it to the client's MCP configuration. Use the
     first block if the client starts a command, or the URL if the client
     asks for a URL.
5. Restart the AI client. Then ask the agent, for example: "List my
   Assemblash projects."

The copied configuration already contains the full path of the program and of
your workspace. Do not replace the path with only `assemblash`: a downloaded
program is not on your `PATH`, so the client cannot find it by name.

Keep the editor open while the agent works. If the agent starts before the
editor, it works alone. When you start the editor, the agent moves to it
automatically.

### 5. Stop Assemblash

Click the power button at the top right of the editor: **Stop Assemblash**.
Your work is already saved. If you started Assemblash from a terminal, you
can also press Ctrl+C there.

### Where your projects are

Assemblash keeps your projects, fonts, and settings in one folder, the
**workspace**:

| System | Workspace folder |
| --- | --- |
| Windows | `%APPDATA%\Assemblash` |
| Mac | `~/Library/Application Support/Assemblash` |
| Linux | `~/.local/share/assemblash` |

Each project is a folder in `projects/`. You can copy a project folder to
back it up or to give it to another person.

### If something does not work

| Problem | What to do |
| --- | --- |
| macOS says the program "cannot be opened" | Do the **Open Anyway** steps in step 2. |
| The browser does not open | Find the address in the small text window, and open it in your browser. Usually it is `http://127.0.0.1:8787`. |
| The AI client cannot start Assemblash | Use the configuration from **Connect an AI agent**. It contains the full path of the program. |
| The agent reports `projectLocked` | Another Assemblash process has the project open. Connect the agent to the running editor (step 4). Never delete a `.assemblash-lock` file. |
| The agent reports `versionConflict` | This is normal when you and the agent edit the same project. The agent reads the document again and retries. |
| An error says that a font is missing | Install the font in **Fonts** (step 3). Assemblash never uses a different font without telling you. |

## Why Assemblash?

Usually you must choose. A powerful editor is difficult to automate. A code or
image-generation pipeline gives a flat image, and a flat image is difficult to
change. Assemblash gives you structure and automation together.

- **Structured, not flattened.** Documents keep their layers, groups, assets,
  metadata, templates, and named slots.
- **Local by default.** Create, edit, render, and export operations work
  offline. No account or AI provider is necessary.
- **Safe to automate.** Mutations are typed, validated, journalled, versioned,
  dry-runnable, and undoable. Protected content stays protected.
- **Deterministic.** The same document, assets, and pinned font files produce
  bit-identical PNGs on all six supported release targets.
- **Easy to embed.** Use the Rust crates, HTTP API, CLI, or MCP server. You do
  not need to drive the reference interface with clicks.

Assemblash contains no AI model. It gives an AI agent two things: an MCP
server, and a history that records who made each change. The agent brings its
own model. You can create, edit, render, and export documents with no model at
all. A change from an agent goes through the same validated operations as a
click or a command. The history records it with the agent as the actor, so you
can review it and undo it.

Assemblash does not replace Photoshop, GIMP, or Figma. It is a composition
engine for repeatable visual assets, templates, and work with AI agents.

---

## Technical guide

The sections below are for developers, scripts, and self-hosting. You do not
need them to use the editor or to connect an agent.

## Get started from a terminal

### Launch options

A launch without arguments creates the workspace, starts the server, and opens
the editor in your browser. A second launch opens the server that already
runs. `assemblash workspace` prints the workspace folder.

On macOS, you can also clear the quarantine flag in a terminal instead of the
**Open Anyway** steps:

```sh
xattr -d com.apple.quarantine ./assemblash
```

A Homebrew tap would remove that step, because Homebrew clears the flag on the
files it installs. The formula is in `packaging/homebrew/`, but the tap is
**not published yet**.

### Install from source

Builds need [Rust 1.92 or newer](https://www.rust-lang.org/tools/install):

```sh
cargo install --git https://github.com/VidGuiCode/assemblash --tag v1.10.0 assemblash-cli
```

### Create and export from the CLI

Assemblash never substitutes a system font without telling you. Install a font
into a local store once, then use that same store when you export:

```sh
assemblash font install "Noto Sans" --font-store ./assemblash-fonts
assemblash new ./poster --width 800 --height 400 --background '#f6f4ef'
assemblash add-text ./poster --text "Hello" --font "Noto Sans" --size 64 --x 40 --y 40 --width 720 --height 120
assemblash add-rect ./poster --x 40 --y 200 --width 240 --height 96 --fill '#1d1d1f' --corner-radius 12
assemblash export ./poster --out poster.png --font-store ./assemblash-fonts
```

Do you have a font file? Then use `--font /path/to/SomeFont.ttf` or
`--font-dir /path/to/fonts` instead. Run `assemblash --help` or
`assemblash <command> --help` for the complete command reference.

`add-ellipse` and `add-line` take the same box flags. A line's box is the line,
so `--width` is its length and `--rotation` its angle.

The editor manages the same store without a terminal, in the **Fonts** section
of the Add panel (1.5.0 and newer):

- It lists the installed families and their faces.
- It imports TTF, OTF, TTC, OTC, WOFF, and WOFF2 files from disk.
- It removes a family. Before it removes one, it tells you that projects that
  use the family will report a missing font.
- When the store is empty, it shows one button that installs the `default`
  pack: Noto Sans, Noto Serif, and Noto Sans Mono. It names the download
  before it starts.

The font picker and the canvas update immediately. A removal never changes
the fonts of your operating system or the file that you imported.

To change a layer later, use `assemblash set`. It changes every property that
can change: name, position, size, rotation, opacity, visibility, lock, blend
mode, effect stack, text, font, font size, colour, alignment, line height, font
weight, font style, letter spacing, vertical alignment, fill, stroke, stroke
width, corner radius, fit, and asset:

```sh
assemblash set ./poster --layer <LAYER_ID> --color '#1d1d1f' --size 72 --line-height 1.4
assemblash set ./poster --layer <LAYER_ID> --weight 700 --letter-spacing 3
```

For a text layer, `--weight` selects the exact face in the font store. A
weight that is not installed is refused. It is never replaced by another
weight. `--color none` with `--stroke` gives outlined text. `--vertical-align`
`top`, `middle`, or `bottom` places the text in its box.

One command is one operation, however many flags it has. The history records
it once, and one undo reverts it.

`render` and `export` take the output path positionally as well as through
`--out`. Both print the written path and its `sha256:` digest as one
tab-separated line. So a script can compare what two interfaces produced
without hashing the file itself:

```sh
assemblash export ./poster poster.png --font-store ./assemblash-fonts
```

### Update Assemblash (1.10.0)

Assemblash can tell you that a new version exists, and can install it.

- The first `serve` asks once whether to check for updates. The answer is
  kept in `config.toml` as `updateCheck = "off"` or `"notify"`. You can
  change it later in Settings.
- A check sends one request to the release feed of this repository. It
  sends no identifiers and no document data. It runs at most once every 24
  hours, and the result is kept in the workspace.
- When a newer stable version exists, the editor shows a banner. The banner
  links to the release notes and never blocks your work.
- `assemblash upgrade --check` prints the installed version and the latest
  version. `assemblash upgrade` downloads the new version, checks it
  against the `SHA256SUMS` file of the release, replaces the program, and
  starts `serve` again. The old program is kept as `.old` until the next
  start. A failed or interrupted download changes nothing.
- An installation that a package manager owns gets advice to use that
  package manager instead of a swap.
- MCP mode never checks for updates.

## Platform compatibility

The same six platforms are built, tested, and included in every release:

| Operating system | x86_64 / Intel / AMD64 | ARM64 / AArch64 |
| --- | :---: | :---: |
| Windows | ✅ `.exe`, `.zip` | ✅ `.exe`, `.zip` |
| Linux | ✅ `.deb`, `.tar.gz` | ✅ `.deb`, `.tar.gz` |
| macOS | ✅ Intel `.tar.gz` | ✅ Apple silicon `.tar.gz` |

Every release also contains a single `.exe` for each Windows target and a
`.deb` for each Linux target. macOS has no installer yet. See the
**Open Anyway** steps in the Quick start.

The release workflow checks that every binary starts before it attaches the
binary. CI also runs the Rust workspace tests on all six targets. The reference
editor runs in a modern browser and is served by the executable itself.

## What is included

### A structured document engine

- Canvas dimensions and background settings
- Text, raster image, SVG, shape, and nested group layers
- Rectangle, ellipse, line, and path shapes with fill, stroke, corner
  radius, dash pattern, line cap, and line join
- Arrow and circle markers on the ends of a line
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
through an Assemblash interface, so they are validated and recorded in history.
The published contracts live in [`schema/`](schema/).

### Clipping, cropping, and flips

From 1.8.0, a layer can carry a mask, and an image layer can show only part of
its source file. Both are ordinary document values, so they are journalled,
undoable, and reversible like any other property.

- **Clip.** A layer clips to its own box, as a rectangle or an ellipse. A
  corner radius makes a rounded rectangle. A radius larger than the box makes a
  stadium. This is how a circle avatar or a rounded screenshot is made.
- **Crop.** An image layer shows a rectangle of its source file, in source
  pixels. The crop composes with `fit`: `fill` stretches the rectangle to the
  box, and `contain` and `cover` work from its shape. Values outside the source
  clamp to it, and a rectangle that misses the source is refused.
- **Flip.** A layer mirrors horizontally, vertically, or both, about the centre
  of its box. Mirroring text mirrors its glyphs.

The clip sits inside the effect stack, not beside it. A shadow the layer
carries follows the clipped shape, and a rotated clipped layer is cut to the
box in its parent's space. No clip, no crop, and no flip means the document
renders exactly as it did before 1.8.0.

An imported image records its pixel size, so a crop can be placed. An asset
whose size this build cannot read is still imported, and a crop of it is
refused by name rather than guessed at.

Set these on the CLI with `set --clip-rect`, `--clip-radius`, `--clip-ellipse`,
`--no-clip`, `--crop X,Y,W,H`, `--no-crop`, `--flip-h`, and `--flip-v`; in the
interface with the inspector rows; and over MCP with the `clip`, `crop`,
`flipHorizontal`, and `flipVertical` arguments of `update_layer`.

### Paths, dashes, and markers (1.10.0)

A shape can be any silhouette. A path shape carries an SVG path string, and
so can a clip. A stroke can be dashed, and a line can end in an arrow or a
circle.

- **The path grammar.** The accepted commands are `M`, `L`, `H`, `V`, `C`,
  `S`, `A`, and `Z`, in upper or lower case. The path starts with one `M`
  and ends with `Z`. It holds at most 30 commands and 2048 bytes. Every
  number must be finite. A path that breaks a rule is refused with a
  message that names the command and its position.
- **Stroke style.** A stroke carries `dashArray` (at most 8 entries, each
  greater than zero), `lineCap` (`butt`, `round`, or `square`), and
  `lineJoin` (`miter`, `round`, or `bevel`).
- **Markers.** A line carries `markerStart` and `markerEnd` from a fixed
  set: `arrow`, `circle`, or `none`. The marker size follows the stroke
  width, so a marker never appears at a size the document did not ask for.
- **Presets** carry the dash, cap, and join fields. Markers belong to the
  line, so presets do not carry them.

Set these on the CLI with `add-path` and `set --path --dash --cap --join
--marker-start --marker-end`; in the interface with the shape rows of the
properties panel; and over MCP with the `path` argument of
`add_shape_layer` and the `shape`, `path`, and marker arguments of
`update_layer`.

### Rendering and export

Assemblash converts a document to SVG with a pure function. Then `resvg` and
`tiny-skia` convert the SVG to pixels. Assemblash exports PNG and SVG at the
output size that you set. It has fourteen deterministic blend modes and a
non-destructive effect stack: brightness, contrast, saturation, blur, seeded
grain, and drop shadow. A glow is a drop shadow with no offset.

Assemblash loads fonts only from files that you give it or install in the
font store. It records a hash of each font file. Thus text and exported pixels
are the same on all operating systems.

An export also reports problems that did not stop it:

- `wordBrokenMidWord`: one word is too wide for its box, so it is split.
- `textOverflowsBox`: the text is taller than its box.
- `lockReclaimed` (1.5.0 and newer, HTTP and MCP only): the server cleared a
  stale project lock before the export.

Each warning has a `code`, a `message`, and a `layerId` when a layer applies.
A warning changes no pixel and no exit status. The HTTP export response and
the MCP `export_document` result contain a `warnings` array. The CLI prints
one line for each warning on stderr. With `--warnings-json`, it prints the
array as JSON on stdout.

Text in an imported SVG asset is different: it causes an error, not a
warning. From 1.5.0, a render is refused with a typed error that names the
asset, unless each `<text>` in the asset names a font family that the render
loaded. A generic family, such as `sans-serif`, is not sufficient, because the
font store never contains the fallback font of the renderer. Earlier releases
exported such a document without the text, and the result looked complete.
Name a loaded family in the asset, or convert the text to outlines before you
import the asset. The 1.3.0 warning code `svgAssetTextWithoutFont` still
exists, but this case now gives the error instead.

### History and safety

Every change uses the same transactional operation layer. A refused
operation does not change the document. The history records each successful
operation with its actor and transaction ID. You can undo and redo it, also
after a restart.

- Expected-version checks prevent stale clients from overwriting newer work.
- A dry run shows what a supported mutation would do without committing it.
- `locked`, `protected`, and `readOnly` layers are enforced in the engine, not
  just hidden behind UI controls.
- Project and asset paths stay inside the configured filesystem boundary.
- Imported SVGs are sanitized before they enter the asset store.
- The editor puts every action in a queue. It does not drop fast actions. When
  you set the same property of the same layer again before the first change
  is sent, only the newest value is sent. The canvas shows your edit
  immediately, and the engine render then replaces it with the exact pixels.

To see how long each interaction took, add `?perf` to the editor address. The
editor then shows the time in the queue, the run time, and the time until the
exact preview appeared. A script can read the same numbers from
`window.__assemblashPerf`.

## Choose the interface that fits

| Interface | Best for | Start with |
| --- | --- | --- |
| Reference editor | Creating and refining documents visually | Launch `assemblash` |
| CLI | Shell scripts and straightforward local workflows | `assemblash --help` |
| HTTP API | Applications and custom frontends | `assemblash serve` |
| MCP server | AI agents and MCP-compatible clients | **Connect an AI agent** in the editor, or `assemblash mcp` |
| Rust crates | Embedding the engine directly | [`crates/`](crates/) |

The editor is a reference client. It has no special access. Edits in the
editor, CLI commands, HTTP requests, and MCP tools all become the same
operations.

### MCP in detail (1.9.0)

For the simple steps, see **Let an AI agent work with you** in the Quick
start. This section explains how the connection works.

The editor process serves MCP. An agent that connects to it works on the same
open projects as the person, with one lock for each project. The editor shows
the changes of the agent without a reload.

The **Connect an AI agent** dialog in the editor gives copy-ready
configuration. It contains the full path of the executable and the workspace.
It opens by itself on the first launch of an empty workspace.

You can also write the configuration yourself. Most MCP clients start a
command. Write the full path of the executable in `command`. A downloaded
binary is not on your `PATH`, so the bare name `assemblash` does not start it:

```json
{
  "command": "C:\\Users\\you\\Downloads\\assemblash-<version>-windows-x86_64.exe",
  "args": ["mcp"]
}
```

On macOS or Linux, the path has the form `/Users/you/Downloads/assemblash`.
Use the bare name `assemblash` only when the package or `cargo install` put
the executable on your `PATH`. Add `"--workspace", "<path>"` to `args` when
the editor uses a workspace other than the default one.

For Codex, add the same command to `~/.codex/config.toml`:

```toml
[mcp_servers.assemblash]
command = '/Users/you/Downloads/assemblash'
args = ['mcp']
```

`assemblash mcp` finds the editor that runs on the same workspace and sends
the agent's requests to it. It opens no project itself while the editor runs,
so it cannot lock you out of a project. When no editor runs, it serves the
workspace itself. It checks about once a second: if the agent starts first
and you start the editor later, the agent releases its projects and moves to
the editor. It moves back when you stop the editor. A request that is in
progress at the moment of a move can fail with an error; send it again.

Clients that take a URL can connect directly to `http://127.0.0.1:8787/mcp`
(Streamable HTTP). Use the command form when your client supports it: the
editor uses another port when 8787 is in use, and the command finds the editor
on any port. `assemblash serve` prints the MCP URL on standard error.

How the relay finds the editor, and its limits:

- It uses the server that the workspace records, only when the address is
  loopback and that server confirms that it serves the same workspace. A
  record for another workspace, for example one that a synchronised folder
  copied, is ignored.
- It sends the workspace access token when the workspace has one.
- A server bound to a wider address is not recorded. Connect to its URL
  directly, with the token.
- The editor ends an MCP session after five minutes without activity. The
  relay then starts a new session by itself. A client that connects to the
  URL directly must start a new session.
- It forwards requests and their answers. It does not open the optional
  event stream for messages that the server starts itself. The Assemblash
  server sends no such messages today.

Never delete a project's `.assemblash-lock` file while a process uses the
project. A `projectLocked` refusal means that another process has the project
open. Connect the agent to that editor instead.

Add `--project /path/to/project` to serve one project instead of the
workspace. This mode does not look for a running editor.

The MCP server has read tools for documents, layers, validation, history, and
rendered previews. It has change tools with a dry run, a version check, a
protection check, and an undo transaction ID. Other tools:

- `create_project` creates a project.
- `set_layer_box` sets a layer's position, size, and rotation in absolute
  values, in one change that one undo reverts.
- `add_svg_layer` adds a layer that draws an imported SVG asset.
- `render_document` returns the vector render of the document as text.
- `find_overlaps` returns the overlapping layers, in the same pairs and order
  as the CLI and the HTTP API.
- `update_layer` sets `lineHeight` and the other text properties.
- `add_shape_layer` takes `path` for a path shape, and `markerStart` and
  `markerEnd` for a line. `update_layer` replaces the geometry with `shape`
  and `path`, and sets the markers of a line.
- `export_document` returns the same `warnings` array as the other
  interfaces. It refuses to replace a file of the same name unless the call
  passes `overwrite`.
- Six more tools cover the whole surface: `insert_layer_tree` pastes a
  copied layer tree, `list_fonts` reads the font store, `install_font_pack`
  and `remove_font_family` manage it, and `delete_project` and
  `rename_project` manage projects. The tool surface holds 53 tools.

A change to a text layer reports the same warnings immediately, in the
`warnings` field of the result. An agent cannot see its own render, so it
learns at once that text does not fit its box (`textOverflowsBox`), that a
word was split (`wordBrokenMidWord`), or that another layer is drawn over the
text (`textCoveredByLayer`).

While an agent is connected, the editor shows "1 AI agent connected" in its
status bar.

For agents that work in a checkout of this repository, a public skill is in
[`skills/assemblash/SKILL.md`](skills/assemblash/SKILL.md). It explains the
document-first workflow and the guarantees that an integration must keep.

## How the pieces fit together

```text
Reference editor ───────┐
CLI and scripts ────────┼──> API / typed operations ──> document + history
Custom applications ───┤              │
AI agents via MCP ──────┘              └──────────────> renderer + export
```

The API and the MCP server contain no document logic of their own:

- `assemblash-core` does the validation and the operations.
- `assemblash-renderer` does the rendering.
- The server, MCP, and CLI crates give these functions to different clients.

Assemblash is written in Rust. The reference interface is written in
TypeScript and is built into the executable, so you do not need Node.js. The
official `scratch` container image is approximately 9 MB.

## Local use and self-hosting

`assemblash serve` listens on `127.0.0.1` by default and needs no
configuration:

```sh
assemblash serve
```

A non-loopback bind refuses to start without an access token:

```sh
assemblash token show
assemblash serve --bind 0.0.0.0
```

Every server also serves MCP at `/mcp`. The access token applies to `/mcp` as
to every other route.

A server on a loopback address with no token also protects itself from web
pages in your browser (1.9.0 and newer). On every route, including `/mcp`, it
refuses:

- a request whose `Host` is not `localhost`, `127.0.0.1`, or `::1`. This stops
  DNS rebinding, where a web page makes its own name point to your computer;
- a request from a web page on another origin (`Origin` header).

A client that is not a web page sends no `Origin`, so the second check does
not affect it. A reverse proxy on the same computer that sends its public name
as `Host` needs that name in `config.toml`:

```toml
allowed-hosts = ["assemblash.example.com"]
```

A server with a token does not do these checks: a web page cannot know the
token.

The token authenticates requests; it does not encrypt traffic. Put Assemblash
behind a TLS reverse proxy when it is reachable beyond a trusted network. See
[DEPLOYMENT.md](DEPLOYMENT.md) for Docker, Caddy, Traefik, nginx, and identity
provider guidance.

A process that stops unexpectedly can leave the lock file of a project behind.
Then Assemblash refuses to open the project until the lock is cleared:

- A person can clear it in the confirm dialog of the editor, or with
  `assemblash unlock`.
- `serve --reclaim-stale-locks` lets the server clear it automatically.
  `assemblash mcp` accepts the same flag. From 1.5.0, the double-click launch
  and `--friendly` do this without the flag.
- The server clears a lock automatically only when the lock names this
  computer and its process is not running. A lock from another computer, or
  from an older build that recorded no computer name, still needs a person.
  On a synchronized project folder, a process ID from another computer proves
  nothing.
- Every automatic clear is reported in the server log, in the editor, and as a
  `lockReclaimed` export warning.

## Edit the canvas

Click **Canvas** to open the Properties panel of the editor. Set the size, a
background colour or transparency, and a resize anchor. Then apply the
changes together. Layers keep their sizes. The anchor changes only their
positions. The same change in the CLI:

```sh
assemblash canvas set ./poster --width 1200 --height 900 --background "#102030" --anchor center
assemblash canvas set ./poster --no-background
assemblash undo ./poster
```

MCP has `update_canvas` with `width`, `height`, `background`, `anchor`,
`expectedVersion`, and `dryRun`. HTTP accepts the same fields in an
`updateCanvas` operation at `POST /api/projects/{id}/operations`. Omit
`background` to keep it, or send `null` to remove it. A resize that moves
locked, protected, or read-only content is refused, and nothing changes.

Canvas editing needs 1.4.0 or newer. When a project history contains
`updateCanvas`, 1.3.1 refuses `show` and `history`, also after undo, because
it cannot read that operation. Continue to use the newer executable, and do
not edit the history files. The document schema stays at version 1.

The **Shapes** row in the Add panel (1.6.0 and newer) adds a rectangle, an
ellipse, or a line. The inspector of a shape then changes Fill, Stroke, Stroke
width, and, for a rectangle, Corner radius. Each row is one change that you
can undo. The **None** button next to a paint removes it. A drop shadow is an
effect, not a shape property: add `dropShadow` to the effect stack of a layer
and set `dx`, `dy`, `blur`, and the colour. For a glow, set both offsets to 0.

## Stability and current limits

Assemblash 1.x makes two compatibility promises:

1. A document written by 1.0 remains readable by every 1.x release.
2. A client written against the 1.0 operation API keeps working across 1.x.

A change that breaks one of these promises needs a major release and a
documented migration. New fields have default values. Unknown document fields
stay in the document when it is loaded and saved.

The important limits:

- Styled text runs are not implemented yet.
- Assemblash contains no AI image generator or AI provider adapter. They are
  not part of the core.
- Fourteen blend modes are supported. `color-dodge` and `color-burn` are
  refused because they are not bit-identical across every target.
- A document with a shape layer needs 1.6.0 or newer. Releases 1.0 to 1.5
  refuse the whole document and name `shape` as an unknown layer kind.
- A path shape or a path clip is preserved by releases 1.6.0 to 1.9.x, but
  those releases refuse to draw it and refuse an update that touches it.
- Unknown fields survive load and save at every level of the document,
  including inside `clip`, `crop`, `stroke`, `shape`, and the effect stack
  (1.10.0).
- The stroke of a shape is painted inside its box, so the box is the visible
  size. A stroke narrower than 1 is the exception: it is a hairline on the
  edge and can extend half a pixel outside the box.
- Built-in authentication is one shared token. Accounts, roles, OIDC, SSO,
  TLS, and per-user audit identity belong in a reverse proxy.
- The editor is a reference client. It is not a complete professional design
  application.

For the product scope and the design decisions, read [PRD.md](PRD.md). For the
changes in each release, read [CHANGELOG.md](CHANGELOG.md).

## Try it and tell us what you find

Assemblash is released, and its core contracts are stable. Now the project
needs to see it in real work. If you use it, tell us what you made, what
worked well, and what caused problems.

- Share a workflow, result, or question in
  [GitHub Discussions](https://github.com/VidGuiCode/assemblash/discussions).
- Report reproducible problems with the
  [bug form](https://github.com/VidGuiCode/assemblash/issues/new?template=bug_report.yml).
- Propose a focused addition with the
  [feature form](https://github.com/VidGuiCode/assemblash/issues/new?template=feature_request.yml).

Do not report security problems in public. Report them privately, as
[SECURITY.md](SECURITY.md) describes.

## Develop and contribute

Clone the repository and run the Rust checks from its root:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace
```

The TypeScript project is in `ui/`. There is no `package.json` at the root:

```sh
cd ui
npm ci
npm run check
```

`ui/dist/` is committed because the Rust binary embeds it. After you change
the interface, `npm run build` must leave that directory up to date.

Before you propose a change, please read [CONTRIBUTING.md](CONTRIBUTING.md).
It explains the stability rules, testing expectations, and the line between
the generic engine and downstream adapters. Report security problems privately
as described in [SECURITY.md](SECURITY.md), never as public issues.

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
repository contains only the generic engine and neutral examples. Private
brand kits, credentials, customer assets, and downstream workflows belong
outside it.
