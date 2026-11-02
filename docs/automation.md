# Automation

This page describes the interfaces, the operation layer, the CLI, the HTTP API, the MCP server, and self-hosting.

## Interfaces

| Interface | Best for | Start with |
| --- | --- | --- |
| Reference editor | Creating and refining documents visually | Launch `assemblash` |
| CLI | Shell scripts and straightforward local workflows | `assemblash --help` |
| HTTP API | Applications and custom frontends | `assemblash serve` |
| MCP server | AI agents and MCP-compatible clients | **Connect an AI agent** in the editor, or `assemblash mcp` |
| Rust crates | Embedding the engine directly | `crates/` |

The editor is a reference client. It has no special access. An edit in the editor, a CLI command, an HTTP request, and an MCP tool become the same operations.

```text
Reference editor ───────┐
CLI and scripts ────────┼──> API / typed operations ──> document + history
Custom applications ────┤              │
AI agents via MCP ──────┘              └──────────────> renderer + export
```

The API and the MCP server contain no document logic of their own. `assemblash-core` validates and applies the operations. `assemblash-renderer` renders. The server, MCP, and CLI crates give these functions to different clients.

Assemblash is written in Rust. The reference editor is written in TypeScript and is built into the executable, so you do not need Node.js. The official `scratch` container image contains one static binary.

The reference editor uses React and Mantine for controls, menus, dialogs, font controls, and login. All browser assets ship inside the executable. The editor keeps its document controller and operation queue. The canvas keeps pointer handling and the Rust preview. The asset list embeds every browser file. The login list includes only local login dependencies. The notices include the locked runtime packages and the icon font.

## One operation layer

Every change is one typed operation. The canvas operation is `updateCanvas`. The layer operations are:

- `create`, `update`, `delete`, `duplicate`, `move`, `resize`, `rotate`, `reorder`, `group`, `ungroup`, `setVisible`, `setLocked`, `rename`, `align`, `centerOnCanvas`, `distribute`, and `snapTo`.

The template operations are `definePreset`, `deletePreset`, `applyPreset`, `defineSlot`, `updateSlot`, and `removeSlot`.

Every operation runs against a copy of the document. The engine writes the copy back only after the result validates. A refused operation leaves the document byte-identical.

Each operation has these properties:

- **One transaction.** The history records the operation once. One undo reverts it.
- **Expected version.** A caller sends the document version that it read. If the document has moved on, the engine refuses the operation with `versionConflict`.
- **Dry run.** The engine reports what the operation would do and commits nothing.
- **Actor.** The history records `human`, `agent`, `script`, or `adapter`, and an optional name.
- **Protection.** The engine refuses a change to a `protected`, `readOnly`, or `locked` layer. A `locked` layer has the explicit `allowLocked` override. The other two have none.

`POST /api/projects/{id}/operation-batches` applies a group of operations to one cloned document. If one member fails, the server writes nothing. The engine journals the batch, and undoes or redoes it as one step.

## CLI

A launch without arguments creates the workspace, starts the server, and opens the editor. A second launch opens the server that already runs. `assemblash workspace` prints the workspace folder.

Builds need Rust 1.92 or newer:

```sh
cargo install --git https://github.com/VidGuiCode/assemblash --tag v1.13.0 assemblash-cli
```

The main commands:

| Command | Effect |
| --- | --- |
| `new`, `canvas set` | Create a project and change the canvas. |
| `add-text`, `add-rect`, `add-ellipse`, `add-line`, `add-path`, `add-image`, `add-svg` | Add a layer. |
| `set`, `style` | Change layer properties, the blend mode, and the effect stack. |
| `show`, `render`, `export` | Print or write the document, SVG, or PNG. |
| `undo`, `redo`, `history` | Read or move through the history. |
| `align`, `center`, `distribute`, `snap`, `bounds`, `overlaps` | Measure and place layers. |
| `preset`, `slot`, `slots`, `variants` | Define and fill templates. |
| `font`, `token`, `workspace` | Manage local state. |
| `serve`, `mcp` | Start an interface. |
| `unlock`, `upgrade`, `styles` | Recover, update, and inspect the build. |

One command is one operation, however many flags it has. The history records it once, and one undo reverts it. `set` changes these properties of a layer:

- name, position, size, rotation, opacity, visibility, lock, blend mode, and effect stack;
- text, runs, font, font size, colour, alignment, line height, font weight, font style, letter spacing, and vertical alignment;
- fill, stroke, stroke width, corner radius, fit, and asset;
- clip, crop, flip, paragraph spacing, path, dash, cap, join, and markers.

`protected` and `readOnly` are layer flags. No interface can change them. A property that the layer kind does not have is refused by name.

Important flags:

| Flag | Effect |
| --- | --- |
| `--layer <LAYER_ID>` | Select the layer to change. |
| `--expect-version <N>` | Refuse the change if the document moved on. |
| `--actor <KIND>`, `--actor-name <NAME>` | Record who made the change. |
| `--allow-locked` | Change a locked layer. |
| `--font-store <DIR>` | Use this font store. |
| `--font <FILE>`, `--font-dir <DIR>` | Load font files directly on `render` and `export`. |
| `--scale <N>` | Multiply the canvas size. `export` and `variants` only. |
| `--timestamp <TIME>` | Record a timestamp in PNG metadata. |
| `--warnings-json` | Print export warnings as JSON on standard output. |

`render` and `export` take the output path positionally as well as through `--out`. Both print the written path and its `sha256:` digest as one tab-separated line. A script can compare two interfaces without hashing the file itself.

```sh
assemblash font install "Noto Sans" --font-store ./assemblash-fonts
assemblash new ./poster --width 800 --height 400 --background '#f6f4ef'
assemblash add-text ./poster --text "Hello" --font "Noto Sans" --size 64 --x 40 --y 40 --width 720 --height 120
assemblash add-rect ./poster --x 40 --y 200 --width 240 --height 96 --fill '#1d1d1f' --corner-radius 12
assemblash export ./poster --out poster.png --font-store ./assemblash-fonts
```

`add-ellipse` and `add-line` take the same layer box flags. The layer box of a line is the line. Thus `--width` is its length and `--rotation` its angle.

To change a layer later, use `assemblash set`:

```sh
assemblash set ./poster --layer <LAYER_ID> --color '#1d1d1f' --size 72 --line-height 1.4
assemblash set ./poster --layer <LAYER_ID> --weight 700 --letter-spacing 3
```

## HTTP API

`assemblash serve` listens on `127.0.0.1` by default. It needs no configuration. Every server also serves MCP at `/mcp`. `serve` prints the MCP URL on standard error.

The main routes:

| Route | Purpose |
| --- | --- |
| `GET /api/version`, `GET /api/schema/document`, `GET /api/schema/operation`, `GET /api/capabilities` | Report the version, serve the JSON Schemas, and serve the capability listing. |
| `GET, POST /api/projects` | List projects and create a project. |
| `GET, DELETE /api/projects/{id}`, `POST /api/projects/{id}/rename` | Read a project summary, delete a project, and rename a project. |
| `GET /api/projects/{id}/document` | Read the document. |
| `GET /api/projects/{id}/validate` | Validate the document. |
| `POST /api/projects/{id}/operations` | Apply one operation. |
| `POST /api/projects/{id}/operation-batches` | Apply a group of operations. |
| `POST /api/projects/{id}/undo`, `.../redo` | Undo or redo. |
| `GET /api/projects/{id}/history` | Read the journal. `?tail=N` reads the newest `N` entries, up to 1000. |
| `POST /api/projects/{id}/assets` | Import an asset. |
| `GET /api/projects/{id}/preview.png`, `.../preview.svg`, `.../thumbnail.png` | Render a preview or thumbnail. |
| `GET /api/projects/{id}/text-layout`, `.../overlaps` | Measure one text layer and list overlapping layer pairs. |
| `POST /api/projects/{id}/export` | Write an export. |
| `GET /api/projects/{id}/exports/{file}` | Read a written export. |
| `GET /api/projects/{id}/presets`, `.../slots` | List presets and slots. |
| `POST /api/projects/{id}/variants` | Render variant batches. |
| `POST /api/projects/{id}/recover-lock` | Recover a project lock. |
| `GET, POST /api/fonts`, `POST /api/fonts/install`, `DELETE /api/fonts/{family}` | List the font store, import a font, install a family, and remove a family. |
| `GET /api/update-status`, `POST /api/update-consent`, `GET /api/agent-sessions`, `POST /api/shutdown` | Read and set the update choice, count the connected agents, and stop the server. |

An operation request has this shape:

```json
{
  "operation": { "op": "update", "id": "layer_...", "opacity": 0.5 },
  "actor": { "kind": "agent", "name": "my-agent" },
  "expectedVersion": 7,
  "dryRun": false
}
```

The response has `version`, `dryRun`, an optional `transaction` ID, the outcome, optional `warnings`, and an optional `document`. Add `?includeDocument=true` to an operation request to receive the document as `GET .../document` serves it. A dry run returns no transaction and no warnings.

An error has one envelope. The common codes are:

```json
{ "error": { "code": "versionConflict", "message": "...", "details": {} } }
```

- `400` for a malformed request.
- `401` for a missing or wrong token.
- `409` for `versionConflict` or `projectLocked`.
- `422` for `operationRefused` or `renderFailed`.

## MCP

The editor process serves MCP. An agent that connects to it works on the same open projects as the person. Each project has one lock. The editor shows the agent's changes without a reload.

The **Connect an AI agent** dialog gives copy-ready configuration. It contains the full path of the executable and the workspace. It opens by itself on the first launch of an empty workspace.

```json
{
  "command": "C:\\Users\\you\\Downloads\\assemblash-<version>-windows-x86_64.exe",
  "args": ["mcp"]
}
```

```toml
[mcp_servers.assemblash]
command = '/Users/you/Downloads/assemblash'
args = ['mcp']
```

Use the full path of the executable. A downloaded binary is not on your `PATH`. Use the bare name `assemblash` only when a package or `cargo install` put the executable on your `PATH`. On macOS or Linux, the full path has the form `/Users/you/Downloads/assemblash`. Add `"--workspace", "<path>"` to `args` when the editor uses another workspace.

`assemblash mcp` finds the editor on the same workspace and sends the agent's requests to it. It opens no project itself while the editor runs, so it cannot lock you out of a project. When no editor runs, it serves the workspace itself. It checks about once a second. If the agent starts first, it releases its projects when the editor starts. It moves back when the editor stops. A request in progress at the move can fail. Send it again.

Clients that take a URL can connect to `http://127.0.0.1:8787/mcp` (Streamable HTTP). Use the command form when the client supports it. The editor uses another port when 8787 is in use, and the command finds the editor on any port.

The relay obeys these rules:

- It uses the server that the workspace records. It does this only when the address is loopback and the server confirms the same workspace. It ignores a record for another workspace.
- It sends the workspace access token when the workspace has one.
- A server bound to a wider address is not recorded. Connect to its URL directly, with the token.
- The editor ends an MCP session after five minutes without activity. The relay starts a new session. A client that connects to the URL directly must start a new session.
- It forwards requests and answers. It does not open the optional event stream for server-started messages. The Assemblash server sends no such messages today.

Add `--project /path/to/project` to serve one project instead of the workspace. This mode does not look for a running editor.

The server has read tools for documents, layers, validation, history, and rendered previews. It has change tools with a dry run, a version check, a protection check, and an undo transaction ID.

| Tool family | Examples |
| --- | --- |
| Projects | `create_project`, `list_projects`, `rename_project`, `delete_project` |
| Layers | `add_text_layer`, `add_shape_layer`, `add_svg_layer`, `update_layer`, `set_layer_box`, `insert_layer_tree` |
| Rendering and export | `render_document`, `export_document` |
| Analysis | `find_overlaps`, `list_capabilities` |
| Fonts | `list_fonts`, `install_font_pack`, `remove_font_family` |

`create_project` creates a project. These tools have behaviour that their names do not tell:

- `set_layer_box` sets absolute position, size, and rotation in one undoable change.
- `add_svg_layer` draws an imported SVG asset.
- `render_document` returns the vector render of the document as text.
- `find_overlaps` returns the same pairs and order as the CLI and the HTTP API.
- `update_layer` sets `lineHeight` and the other text properties.
- `add_shape_layer` takes `path` for a path and `markerStart` and `markerEnd` for a line. `update_layer` replaces the geometry with `shape` and `path`, and sets the line markers.

`export_document` returns the same `warnings` array as the other interfaces. It refuses to replace a file of the same name unless the call passes `overwrite`.

A change to a text layer reports the same warnings immediately, in the `warnings` field of the result. An agent cannot see its own render. Thus the agent learns three things at once: the text does not fit its layer box, a word was split, or another layer covers the text.

While an agent is connected, the editor shows "1 AI agent connected" in its status bar. The MCP server provides 53 tools.

For agents that work in a checkout of this repository, the skill is `skills/assemblash/SKILL.md`. It explains the document-first workflow and the guarantees that an integration must keep.

## History and safety

Every change uses the same transactional operation layer. A refused operation does not change the document. The history records each successful operation with its actor and transaction ID. You can undo and redo it, also after a restart.

- Expected-version checks stop a stale client from overwriting newer work.
- A dry run shows what a supported operation would do without committing it.
- The engine enforces `locked`, `protected`, and `readOnly` layers.
- Project and asset paths stay inside the configured filesystem boundary.
- The engine sanitises an imported SVG before it enters the asset store.
- The editor puts every action in a queue. It does not discard fast actions. You can set the same property of the same layer again before the first change is sent. Then the editor sends only the newest value. The canvas shows your edit immediately. The engine render then replaces it with the exact pixels.

To see how long each interaction took, add `?perf` to the editor address. The editor shows the time in the queue, the run time, and the time until the exact preview appeared. A script can read the same numbers from `window.__assemblashPerf`.

## Locks and recovery

A process that stops unexpectedly can leave the lock file of a project behind. Assemblash then refuses to open the project until the lock is cleared.

- A person can clear the lock in the confirm dialog of the editor, or with `assemblash unlock`.
- `serve --reclaim-stale-locks` lets the server clear a stale lock automatically. `assemblash mcp` accepts the same flag. The double-click launch and `--friendly` do this without the flag.
- The server clears a lock automatically only when the lock names this computer and its process is not running. A lock from another computer, or from an older build that recorded no computer name, still needs a person.
- On a synchronized project folder, a process ID from another computer proves nothing.
- The server reports every automatic clear in the server log, in the editor, and as a `lockReclaimed` export warning.

Never delete a `.assemblash-lock` file while a process uses the project. A `projectLocked` refusal means that another process has the project open. Connect the agent to that editor.

## Self-hosting and tokens

`assemblash serve` listens on `127.0.0.1` and needs no configuration:

```sh
assemblash serve
```

A non-loopback bind refuses to start without an access token:

```sh
assemblash token show
assemblash serve --bind 0.0.0.0
```

`assemblash token show` prints the token and creates one if there is none. `assemblash token rotate` replaces it. `assemblash token clear` removes it, so only a loopback bind will start. The token lives in the workspace `config.toml`. There is no `--token` argument.

A client sends the token in an `Authorization: Bearer` header. The editor uses a host-only browser cookie that the server issues after a bearer request. An operation sent with that cookie must come from the same origin. The comparison is constant time. A request without the token, or with a wrong token, gets `401`.

A server on a loopback address with no token also protects itself from web pages in your browser. On every route, including `/mcp`, it refuses:

- a request whose `Host` is not `localhost`, `127.0.0.1`, or `::1`. This stops DNS rebinding, where a web page makes its own name point to your computer.
- a request from a web page on another origin (`Origin` header).

A client that is not a web page sends no `Origin`, so the second check does not affect it. A reverse proxy on the same computer that sends its public name as `Host` needs that name in `config.toml`:

```toml
allowed-hosts = ["assemblash.example.com"]
```

A server with a token does not do these checks. A web page cannot know the token.

The token authenticates requests. It does not encrypt traffic. Put Assemblash behind a TLS reverse proxy when it is reachable beyond a trusted network. See [DEPLOYMENT.md](../DEPLOYMENT.md) for Docker, Caddy, Traefik, nginx, and identity provider guidance.

`serve` also takes `--workspace`, `--port`, `--ui-dir`, and `--friendly`. `mcp` takes `--workspace`, `--project`, and `--reclaim-stale-locks`.

## Update checking

Assemblash can tell you that a new version exists, and can install it.

- The first `serve` asks once whether to check for updates. Assemblash keeps the answer in `config.toml` as `updateCheck = "off"` or `"notify"`. You can change it later in Settings.
- A check sends one request to the release feed of this repository. It sends no identifiers and no document data. It runs at most once every 24 hours. Assemblash keeps the result in the workspace.
- When a newer stable version exists, the editor shows a banner. The banner links to the release notes and never blocks your work.
- `assemblash upgrade --check` prints the installed version and the latest version.
- `assemblash upgrade` downloads the new version and checks it against the `SHA256SUMS` file of the release. It replaces the program and starts `serve` again. `assemblash upgrade` keeps the old program as `.old` until the next start. A failed or interrupted download changes nothing.
- An installation that a package manager owns gets advice to use that package manager instead of a swap.
- MCP mode never checks for updates.

## Stability and limits

Assemblash 1.x makes two compatibility promises. A document written by 1.0 stays readable by every 1.x release. A client written against the 1.0 operation API keeps working across 1.x. A change that breaks one of these promises needs a major release and a documented migration. New fields have default values, and unknown document fields stay in the document.

The core contains no AI image generator or AI provider adapter. Fourteen blend modes are supported, and `color-dodge` and `color-burn` are refused. Built-in authentication is one shared token. Accounts, roles, OIDC, SSO, TLS, and per-user audit identity belong in a reverse proxy. The editor is a reference client, not a complete professional design application.

## Related pages

- [Document model](document-model.md)
- [Text and fonts](text-and-fonts.md)
- [Paint and rendering](paint-and-rendering.md)
- [README](../README.md)
- [PRD](../PRD.md)
- [CHANGELOG](../CHANGELOG.md)
- [DEPLOYMENT](../DEPLOYMENT.md)
