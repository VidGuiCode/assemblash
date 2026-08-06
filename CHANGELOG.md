# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

## [0.16.0] — 2026-08-06

A workspace holding two hundred projects stays usable, and the bundled font
manifest covers more than the Notos.

No document-model change. `index.db` has its own schema version, and drift
there is a rebuild rather than a migration — which is the whole point of a
cache.

### Added

- **`index.db`, a cache and never a source of truth.** Delete it and nothing
  is lost: it rebuilds by scanning `projects/`. Corruption, or a schema this
  build does not recognise, is not an error anybody sees — it is a reason to
  throw the file away and build it again. Absent entirely, every route falls
  back to a directory scan and the product behaves exactly as before.
- **Search, recents, and thumbnails in the project browser.** Searching
  happens in the engine against the cache, so a large workspace is never sent
  to the page for the page to look through. Thumbnails are rendered on demand
  and cached **against the document version they were made from**, so a stale
  thumbnail is impossible rather than merely unlikely.
- `GET /api/projects?query=&limit=`, `GET /api/projects/recent`, and
  `GET /api/projects/{id}/thumbnail.png`.
- **Seven more families in the bundled font manifest** — Inter, Roboto, Open
  Sans, Montserrat, Playfair Display, Lora, and JetBrains Mono — hash-pinned
  at the commit the manifest already names, exactly like the Notos. Twelve
  families in total, all OFL.

### Verified

- **Two hundred projects**, over a real socket: listed, searched by id and by
  name, and thumbnailed, with the second request for a thumbnail served from
  the cache byte for byte.
- **Deleting `index.db` changes nothing** — the same list, the same search
  results, and the same thumbnail bytes, both from the running server and from
  one restarted over the rebuilt cache. If that ever stops being true, the
  cache has become a second copy of the truth and has to come back out.
- A corrupt file and a file from an unknown schema are both rebuilt rather
  than reported.
- A project written behind the server's back is still found, because the cache
  is refreshed when a listing is asked for rather than trusted.
- Every new font family was downloaded from the pinned commit, hashed, and
  checked for the family name a document has to spell.
- **The container still builds from `scratch` and still runs**: SQLite is
  compiled in and links statically against musl. The image grew from 7 MB to
  8.65 MB, which is the honest price of the cache; `README.md` now says 9 MB.

## [0.15.0] — 2026-08-06

Presets: named style bundles, defined, applied, and undone like anything else.

Document `schemaVersion`: **1 (unchanged)**. `presets` is additive with a
default, like `slots` and `effects` before it.

### Added

- **Presets live in the document.** A project directory stays portable, and
  the same document must not render differently depending on what else is
  installed next to it — the exact failure the font store exists to prevent.
  The cost, stated plainly: sharing a preset between projects means copying it.
- **A preset is the properties of an update**: font family, size, colour,
  alignment, line height, opacity, blend mode, effect stack. Applying one
  builds that same `UpdateLayer` and hands it to the operation layer, which is
  what makes "a preset renders identically to the same properties set by hand"
  true by construction rather than by hope. Deliberately no transform: a style
  is not a position, and a preset that moved layers would be a template.
- Three operations — `definePreset`, `deletePreset`, `applyPreset` — all
  journalled, undoable, and dry-runnable. Applying to a protected layer is
  refused by the check that already guards every other mutation.
- `assemblash preset define|list|delete|apply`, `GET
  /api/projects/{id}/presets` alongside the operation endpoint,
  `list_presets`/`define_preset`/`delete_preset`/`apply_preset` over MCP, and
  a preset list in the interface's inspector with a "save style as preset"
  control.

### Verified

- **A preset applied is pixel-identical to the same properties set by hand** —
  compared as decoded pixels, both in the renderer's tests and through the
  binary on two identically built projects.
- Define, apply, undo, redo: the document comes back byte for byte at every
  step, and defining a preset does not change any picture.
- **Deleting a preset changes no picture**: applying one sets properties, it
  does not create a link.
- A preset that sets nothing, or that names a blend mode or effect this build
  cannot draw, is refused when it is defined rather than when it is finally
  applied.
- Applying an unknown preset says what the document does have.

## [0.14.0] — 2026-08-06

A non-destructive effect stack, and the rest of the CSS blend modes. Every
mode and effect named here was checked against the pixels it produces before
it was claimed.

Document `schemaVersion`: **1 (unchanged)**. Both changes are additive —
`blendMode` gains enum values and `effects`, reserved since schema version 1,
gains a shape. A document written by 0.13.0 loads here unchanged, and one
written here loads there with its effects preserved verbatim.

### Added

- **Effects, per layer, never baked**: `brightness`, `contrast`,
  `saturation`, `blur`, and `grain`, applied in the order they are listed. The
  document keeps the numbers and the pixels are derived from them every
  render, so an effect is as reversible as any other property.
- **Grain is seeded** — the seed lives in the document, not in the run, so the
  same document produces the same noise on every machine and in every render.
  A renderer that promises byte-identical output cannot have noise any other
  way.
- **The remaining reproducible blend modes**: overlay, darken, lighten,
  hard-light, soft-light, difference, exclusion, hue, saturation, color, and
  luminosity, joining normal, multiply, and screen — fourteen in all.
- `assemblash style` sets a layer's blend mode and effect stack;
  `assemblash styles` lists what this build actually renders. The same fields
  are on `update_layer` over MCP and on the operation endpoint over HTTP, and
  the interface's inspector has a blend picker and effect rows.

### Changed

- **A blend mode this build does not render is now refused rather than drawn
  as `normal`.** Before 0.14.0 an unrecognised mode was quietly composited
  normally; a picture that silently ignores what it was told to do is worse
  than no picture. The document still keeps the value — that round trip is
  unchanged — and setting one through an operation is refused up front, so it
  cannot get into a document through this build at all. The same rule applies
  to an effect type this build does not know.

### Not shipped, and why

- **`color-dodge` and `color-burn` are refused, not rendered.** They
  rasterize, and they look right. They are not *bit-identical across targets*:
  with the same document and the same fonts, the x86_64 macOS runner produced
  different bytes from the other five. Both are built on a division that
  saturates near zero, which is precisely where a machine's dispatch can
  change the arithmetic. NFR-1 — same document, same fonts, same pixels on
  every target — is what the rest of this engine rests on, including the
  content hashes a variants batch is checked by, so a mode that quietly breaks
  it on one machine is worse than a mode that says no. Both still round-trip
  through a document untouched, and both refuse with the same typed error as a
  mode from a future build. This was found by CI, not reasoned about: the
  golden set is now one document per mode so a disagreement names the mode.

### Verified

- **Every one of the fourteen blend modes composites**, checked against the
  actual pixels of a two-square overlap rather than against the markup.
- **Each effect does what its name says**, in sRGB: brightness 1.5 takes
  (64, 128, 192) to (96, 192, 255), contrast 0 is flat mid grey, saturation 0
  is grey. **Every effect's neutral value changes nothing**, so turning one
  down to zero is the same as not having it.
- **Order matters and is respected**: brightening then desaturating is a
  different picture from desaturating then brightening.
- **Grain is repeatable and seed-dependent**, lightens as well as darkens, and
  cannot paint outside the layer it grains.
- **Setting a stack is one journalled update, and undo restores both the
  document and the render byte for byte** — run through the binary.
- Styling a protected layer is refused by the same check that refuses every
  other mutation, because it is an ordinary `update`.
- **Cross-target determinism**: a golden document per rendered mode, plus one
  covering every effect, are in the gate — so CI compares hashes on Windows,
  Linux, and macOS across x86_64 and ARM64, and every mode this release claims
  has been shown to produce identical bytes on all six.
- **No existing golden moved.** The additions to `goldens.json` are additions
  only: nothing about how existing documents render changed.

## [0.13.0] — 2026-08-06

Templates in the interface: the one thing 0.12.0 shipped that the page could
not do. Filling a template and rendering a batch of variants are now available
everywhere — command line, HTTP, MCP, and the browser.

Document `schemaVersion`: **1 (unchanged)**. Nothing in the document model
changed; `slots` shipped in 0.12.0.

### Added

- **A template panel in the reference interface**, shown only for a project
  that declares slots. The form is generated from the slot definitions the
  engine reports: text slots get a text field, colour slots a colour picker,
  and image slots a list of the project's own assets plus an import button.
  Required slots are marked and a slot's description is its help text.
- **Preview and batch from the page.** Preview renders one filled result;
  the batch renders many, from rows built in the form or from a values file —
  the same JSON file `assemblash variants --values` takes, so a batch that
  works at the command line works in the page.
- **A gallery** of the produced PNGs, each with its size, byte count, content
  hash, and a download link.
- **`GET /api/projects/{id}/exports/{file}.png`** — reads back a PNG the
  engine wrote into a project's `exports/`. The caller supplies a file name,
  never a path: the stem goes through the same check that named it, so the
  only files reachable are ones this engine wrote, in the one directory it
  writes them to.

### Verified

- **The command line and the HTTP API render identical variants**, hash for
  hash, in an automated test that runs both as real processes: `assemblash
  variants` and `assemblash serve` on the same project, fonts, and values.
- **In a real browser against the released artifact**: a template chosen from
  the project list, slots filled, a batch rendered, and the gallery's hashes
  compared with what `assemblash variants` printed for the same values — the
  same hashes, variant for variant.
- What the gallery shows is what the batch made: the bytes served for each
  variant hash to the value the batch reported, not to a re-render that
  merely resembles it.
- A required slot left empty is refused in the engine's own words, and the
  panel is hidden entirely for a project that is not a template.

## [0.12.0] — 2026-08-05

Templates with named slots — PRD use case C, one of the product's primary use
cases — and the interface essentials 0.9.0 cut.

Document `schemaVersion`: **1 (unchanged)**. `slots` is additive with a
default, exactly like `blendMode`, `effects`, and `runs` before it: a document
written by 0.11.0 loads here unchanged, and one written here loads there with
its slots preserved verbatim. Bumping the version would have broken every
existing reader in exchange for a migration with nothing to do.

### Added

- **Templates.** A document may name some of its own layers as slots —
  `headline`, `logo` — so a script or an agent supplies content without
  knowing layer ids, and **without being able to touch anything that was not
  offered**.
- **Filling is ordinary operations.** A slot fill is an `Update` handed to the
  same `Session::apply` everything else uses, which is why a slot pointing at
  a protected layer is refused: not by a check templates remembered to make,
  but by the one every route to a protected layer already passes through.
- **`render_variants`**: one template, N sets of values, N PNGs into the
  project's `exports/`, each reported with its content hash and traceable to
  the template's id and version. The template is never modified — variants are
  filled on a copy — so a batch of fifty leaves the project as it found it.
- Exposed on every surface: `assemblash slots` and `assemblash variants` on the
  command line, `GET /api/projects/{id}/slots` and
  `POST /api/projects/{id}/variants` over HTTP, and `list_slots`,
  `fill_template`, and `render_variants` over MCP.
- **`UpdateLayer` can change an image layer's asset.** Image slots need it, and
  "swap the picture in this layer" was an obvious operation the engine did not
  have. The asset must already be in the document.
- **Interface essentials**: image upload from the page, keyboard shortcuts
  (arrows nudge, shift-arrows nudge by ten, Delete removes, Ctrl/Cmd+Z undo and
  redo), and selection handles for layers **inside groups**.

### Verified

- **The exit test, over MCP against the released binary**: one template, four
  value sets, four different and correct exports; the same values render
  byte-identical bytes on a second run; the template's own file is untouched.
- **The protected chrome is pixel-identical in every variant**, compared row by
  row rather than by whole-file hash — which could not tell "the chrome
  survived" from "nothing changed at all".
- A slot aimed at a protected layer is refused, and nothing is written.
- A value for a slot that does not exist is refused rather than ignored: a
  typo must not produce a variant that looks finished and is missing the
  change you meant.

### Notes

- Slots are `text`, `image`, or `color`. Positions, sizes, and fonts are not
  fillable: a template that let a caller move things is a document, and there
  is already an API for that.
- Handles for a layer inside a **rotated** group are still not drawn. This
  build composes translations, and a handle a few degrees out of place is
  worse than no handle.
- Template filling from the interface did not make this release. It is
  available on the command line, over HTTP, and over MCP.

## [0.11.0] — 2026-08-05

Self-hosting works. PRD §16.14 — the last open product decision — is resolved
as **access token plus explicit bind**, and this is it built.

Document `schemaVersion`: **1** (unchanged).

### Added

- **`--bind <address>`**, and a `bind` key in the workspace configuration. The
  default is `127.0.0.1` and needs no token and no setup: anyone who can reach
  that socket is already on the machine, where the projects are ordinary
  readable files.
- **A non-loopback bind refuses to start without an access token.** Not a
  warning — a refusal, because a server that bound a network and carried on
  serving would publish the workspace to it, and the flag that did so would
  not have looked like it was going to. The error says exactly what to run.
- **`assemblash token show | rotate | clear`.** The token lives in the
  workspace configuration and nowhere else; there is deliberately no `--token`
  argument anywhere, because a secret on a command line is a secret in shell
  history and in every process listing on the machine.
- **`Authorization: Bearer` for the API**, and a **one-time browser login** for
  the interface: paste the token once, it is kept in that tab, and every
  request carries it as a header. Even the canvas image is fetched rather than
  pointed at, so the token never reaches a URL.
- **The Docker image is genuinely servable.** It binds `0.0.0.0` so a published
  port reaches it — which means it requires a token, which is the safety
  property rather than an obstacle. `compose.yaml` publishes on loopback by
  default.
- **`DEPLOYMENT.md`**: how to get a token, what it protects, and reverse-proxy
  configurations for Caddy, Traefik, and nginx — with the point stated plainly
  that the token authenticates and does not encrypt.

### Notes

- Comparison is constant time; a rejected token is never echoed back, never
  logged, and never placed in a URL.
- The interface's own files are behind the token too. A page that loaded and
  then failed every call would be a worse way to learn a token is needed than
  not loading at all. The login page is the one exception, because it is how a
  token gets into the browser.
- Port fallback (trying port 0 when the configured port is taken) applies to
  loopback only. A server meant to be reachable at a known address should say
  it could not start rather than move quietly to another port.
- There are no accounts and no built-in OIDC. Identity belongs in the reverse
  proxy, which is where TLS belongs too.

## [0.10.1] — 2026-08-05

Two findings from an independent verification of the 0.10.0 release. Both are
things that made a correct system feel broken.

### Fixed

- **`assemblash mcp --project <dir>` left its lock file behind.** The sessions
  it opened lived in a `static`, and a static is never dropped — so the lock
  outlived the process and the project could not be reopened until someone ran
  `assemblash unlock`. That is a puzzle to hand a person whose agent simply
  closed a pipe. The registry is now owned by the server and released
  explicitly when the client goes away, rather than as a side effect of
  ownership working out. (`--workspace` mode was never affected; both are now
  covered by a regression test that spawns the real binary.)
- **`add-text` accepts `--font-store`** and checks the family against it,
  naming what *is* installed when it does not match. Naming a font the store
  does not have used to succeed and then fail at export several commands
  later, looking like a rendering problem rather than a typo. The flag is
  optional and reads `ASSEMBLASH_FONT_STORE`; without it nothing changes.

## [0.10.0] — 2026-08-05

Packaging, and the promise that someone who has never opened a terminal can
start this and stop it. The last milestone of the v0.x ladder.

Document `schemaVersion`: **1** (unchanged).

### Added

- **macOS in CI**, x86_64 and arm64. The macOS workspace path had been a
  unit-tested branch since 0.6.0 and the renderer gate had never run there;
  both execute now. **The gate's committed hashes match on macOS**, so the
  same document plus the same font files produce the same pixels on three
  operating systems and two architectures.
- **Release binaries for all six targets.**
- **Friendly mode.** Launching the binary with no arguments at all — which is
  what a double-click does — creates the workspace if it is not there, serves,
  falls back to a port the OS picks if the configured one is taken, opens a
  browser, and prints the URL for anyone who wants it.
- **Stop without a terminal.** A shutdown button in the interface, and the
  endpoint behind it, with a graceful stop that finishes in-flight requests
  and releases every project lock. Offered only by a server started for a
  person: a plain `serve`, a service manager, or a container refuses, because
  it owns its own lifetime.
- **Single-instance detection.** A second launch finds the server already
  running and opens its URL instead of starting a rival on another port. A
  claim left behind by a crashed process is checked before it is believed.
- **Docker**, from `scratch`: a 7 MB image with one statically linked binary,
  no shell and no libc.
- **`DEPENDENCIES.md`** — the inventory §18 asks for, generated from
  `cargo metadata` and drift-tested, so a dependency cannot be added without
  appearing in it.
- The end-to-end smoke test PRD §17 specifies, as one test on every CI target:
  create, add text and image layers, save, reload, preview, **one MCP mutation
  through a real protocol conversation with a real child process**, undo, and
  export.

### Fixed

- **Undo was broken for any project with an imported image.** Importing an
  asset changes the document but is not an operation, so history never saw it
  — and undo, which replays operations onto the nearest snapshot, replayed the
  image layer onto a snapshot with no such asset and failed with a dangling
  reference. Present since 0.3.0; found by the §17 smoke test on its first
  run.

### Verified

- **PRD §17's smoke test is green on all six targets.**
- **A non-technical user starts and stops it without a terminal**: the
  released binary launched by double-click created its workspace, served, and
  opened a browser; the interface was used; and the Stop button ended the
  process. A second launch opened the running server rather than starting a
  rival.
- The whole pipeline runs inside the scratch container: create, add text,
  install a font over the network, export a PNG.

### Notes

- **The Docker image's HTTP server is reachable only on the container's own
  loopback**, because the server binds `127.0.0.1` and PRD §16.14 — whether to
  expose it more widely, and what authentication that needs — is still open.
  `--network host` works on Linux; the CLI and MCP surfaces are unaffected.
  This is the one thing in the image that a decision, not code, is blocking.
- On Windows a double-click briefly shows a console window: the binary is a
  console-subsystem executable, and changing that would hide the output the
  command-line surface needs. Said here rather than left to be discovered.

## [0.9.0] — 2026-08-05

The reference interface, served by the binary. And the last way undo could
lose work, closed.

Document `schemaVersion`: **1** (unchanged).

### Added

- **A reference web interface**, embedded in the binary and served at `/` by
  `assemblash serve`: project browser, canvas, layer tree, inspector, insert
  text, drag to move and resize, group and delete, undo and redo, history, and
  export. Written in TypeScript against the declarations generated from the
  Rust types.
- **No canvas library and no second renderer** (PRD §16.3). The canvas is the
  engine's own render, shown as an image, with plain DOM elements over it for
  selection and handles.
- Layers marked `protected`, `readOnly`, or `locked` are shown as such and
  their inputs are disabled, with the reason on hover. The engine refuses them
  either way; saying so is what the interface owes a person.
- `GET /api/projects/{id}/preview.svg` — the same render one step before
  rasterization — and `POST /api/projects/{id}/export`, which writes a PNG
  into the project's own `exports/` directory.
- `assemblash serve --ui-dir` serves the interface from a directory, for
  working on it without rebuilding the binary.
- `tsc` and the interface build now run in CI, and fail if the committed
  `ui/dist` is not what the build produces — closing the drift-test-only debt
  0.6.0 recorded.

### Fixed

- **Undo could destroy a hand edit.** Undo rebuilds from a snapshot, and a
  document edited outside the journal was a state no snapshot had seen, so the
  first undo after a hand edit silently restored the document from before it.
  Opening a project for writing now records a diverged document before
  anything else happens, so undo returns to what the user last saw. Hand
  editing is supported (FR-9) — and it is the only way `protected` and
  `readOnly` get set at all.
- **The generated TypeScript dropped the fields a tagged union sits beside.**
  `Layer` is a union of payloads *plus* the properties every layer has; the
  emitter kept only the union, so a client typed against it would not know a
  layer had an `id` or a `transform`. Found by the interface being the first
  thing to actually compile against those types.
- The MCP server's instructions had lost their line breaks in 0.8.0 and read
  as one run-on paragraph with stray spacing.

### Verified

- **MVP criterion 12 — the interface opens, edits, and exports the same
  document format used by the API.** Driven in a real browser against the
  released binary: it opened a project the CLI and the API had written, added
  a layer, changed its text, moved it, exported a PNG, and undid a change —
  and the MCP server then read exactly the same document back.
- **What the canvas shows is what the export contains**, byte for byte,
  because they are the same render. Asserted in CI, not argued.
- The interface serves only the files this build carries: a path is never
  taken from a request.
- A hand edit survives a later undo; `open_read_only` still never writes.

### Notes

- The canvas shows the *rasterized* render rather than the SVG, and that is
  the decision working rather than a departure from it: a browser handed the
  SVG would re-render it with its own fonts instead of the pinned files in the
  store, so the preview would differ from the export exactly where this
  project cares most.
- `ui/dist` is committed. The binary embeds it, so `cargo build` and
  `cargo install --git` must work with no Node involved; CI is what keeps the
  committed copy honest.
- Handles are drawn for top-level layers. A layer inside a group is positioned
  relative to it, and guessing at a transform chain the drag would then have
  to invert is worse than not offering it.

## [0.8.0] — 2026-08-05

MCP writes. An agent can now change a document — reversibly, with a version
check, and never through a protected layer.

Document `schemaVersion`: **1** (unchanged).

### Added

- **Twenty mutating MCP tools**, named rather than one generic
  `apply_operation`: `add_text_layer`, `add_image_layer`, `update_layer`,
  `move_layer`, `resize_layer`, `rotate_layer`, `reorder_layer`,
  `group_layers`, `ungroup_layer`, `duplicate_layer`, `delete_layer`,
  `set_layer_visible`, `set_layer_locked`, `rename_layer`, `align_layers`,
  `center_on_canvas`, `distribute_layers`, `snap_layer`, `undo`, `redo`, and
  `export_document`.
- Every one carries all four safeguards FR-13 asks for — `dryRun`,
  `expectedVersion`, protected-layer checks, and a transaction id in the
  result — implemented once, in one function every tool goes through.
- `open_project` selects the project later calls act on, so a conversation
  does not repeat its name. Every tool still takes an explicit `project`,
  which wins.
- `export_document` writes a PNG into the project's `exports/` directory and
  reports the path.
- Server instructions now describe the version check, the dry run, and which
  layers refuse changes.

### Fixed

- **Ungrouping a group could modify a protected layer inside it.** Ungrouping
  rebases every child's transform, which is a change to each child, but only
  the group itself was checked. Deleting such a group was already refused;
  dissolving it was not. Found by the protected-layer exit test trying every
  mutating tool against a protected layer.
- **A project assembled by hand could not be undone.** A directory with a
  `document.json` and no history has no snapshot to rebuild from, so its very
  first undo failed. The first mutation now establishes the base from the
  state before it — which is exactly what undoing it must return to.
- `get_layer` took `layer_id` while every other tool took `layerId`. It now
  takes `layerId`, and still accepts the old spelling.

### Verified

- **MVP criterion 10 — a local MCP client applies a reversible layer
  operation.** A real client, driving the actual binary over a real stdio
  pipe: dry run changes nothing, the real call returns a transaction id, a
  stale `expectedVersion` is refused, and **undo restores `document.json` byte
  for byte**. Redo brings it back.
- **MVP criterion 11 — protected and locked layers cannot be modified through
  normal agent tools.** Seventeen mutating calls aimed at a protected layer,
  every one refused with `operationRefused` and the document byte-identical
  afterwards; the same for a locked layer. The same tools succeed on an
  ordinary layer, so the refusals are about the flags and not about the calls.
- Duplicating a protected layer is *allowed* — it does not touch the original
  — and the copy is protected too, so it cannot be used to obtain an editable
  clone.
- No tool can set or clear `protected`, and there is no generic
  `apply_operation` escape hatch. Both are asserted, not assumed.
- An export name that is really a path is refused.

### Notes

- There is no tool that imports a file from a path: that is the unrestricted
  filesystem access FR-13 rules out. `add_image_layer` references an asset
  already in the document, and assets arrive through the CLI or the HTTP API.
- The MCP actor is always recorded as an agent. A transport that could claim
  to be a human would make the audit trail a fiction.

## [0.7.0] — 2026-08-05

The MCP server, read-only. The first release an agent can point at a canvas.

Document `schemaVersion`: **1** (unchanged).

### Added

- **`assemblash mcp`**: a Model Context Protocol server over stdio, built on
  the official Rust SDK. It is the third transport over the one operation
  layer, after the command line and the HTTP API, and it shares the HTTP API's
  open-project registry and its machine-readable error codes rather than
  growing its own.
- Seven read tools: `list_projects`, `get_document_state`, `list_layers`,
  `get_layer`, `validate_document`, `get_history`, and `get_canvas_preview`
  (a real PNG, as an image content block).
- `--workspace` serves a workspace and its tools take a project name;
  `--project <path>` serves one arbitrary folder and the project argument
  becomes optional — the headless and home-lab flow, unchanged.
- Server instructions that say what Assemblash is, which mode this server is
  in, and that these tools do not write.

### Verified

- **MVP criterion 9 — at least one local MCP client can inspect the
  document.** An integration test spawns the *actual* `assemblash` binary as a
  child process and drives it over a real stdio pipe with the SDK's client
  half: initialize, list tools, call every tool, and compare the document that
  comes back with the one on disk. It runs on Windows and Linux, x86_64 and
  aarch64.
- The same server was additionally driven by the **official TypeScript MCP
  SDK** — a separate implementation in a separate language — reading the
  project list, the layers, the document, the validation report, and a
  480×220 PNG preview.
- The tool list contains **nothing that writes**, and no `get_selection`.
- A project name that is really a path is refused with `invalidProjectId`
  before it reaches the filesystem, over MCP as over HTTP.
- A failure leaves standard output empty: the protocol owns it.

### Notes

- **Read-only by design.** FR-13 divides MCP capabilities into read-only and
  mutating and orders them. The write tools — with dry run, expected versions,
  protected-layer checks, and undo transaction ids — arrive in 0.8.0.
- `list_projects` ships here rather than with the other workspace-aware tools:
  it is read-only, and without it a client has no way to name the thing it
  wants to inspect. `open_project`, which is stateful, is still 0.8.0.
- Tool results are objects, never bare arrays — `{"projects": [...]}` rather
  than `[...]`. MCP requires a tool's output schema to describe an object, and
  a strict client refuses a server that sends anything else. Found by pointing
  the TypeScript SDK at it; there is now a test that every tool's schemas are
  objects.
- Selection is client state (amended FR-7). There is no `get_selection` tool
  and never will be; tools take explicit layer ids.

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
