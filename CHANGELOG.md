# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

## [1.8.0] — 2026-09-12

**Clipping and cropping.** A layer can mask itself to a rectangle or an
ellipse, an image layer can show one rectangle of its source, and any layer can
mirror horizontally or vertically. Circle avatars, rounded screenshots, and
crops that are rectangles rather than fit modes.

`schemaVersion` stays **1** and the `Operation` union does not grow: all four
values are ordinary `UpdateLayer` fields. **Oldest build that opens a 1.8.0
document: 1.0** — builds 1.0 through 1.7 degrade silently through the `Extras`
capture map. They keep `clip`, `crop`, `flipHorizontal` and `flipVertical`
exactly as written and render the layer unclipped, uncropped and unflipped.

### Added

- **`Layer.clip`: `{"shape":"rect","cornerRadius":N}` or
  `{"shape":"ellipse"}`.** The mask is the layer's transform box, so the clip
  carries no coordinates and `move`, `resize` and `rotate` mean for a mask
  exactly what they mean for the layer. A radius larger than the box clamps to
  a stadium, the same way a shape rect's does. A clip written by a newer build
  is preserved as written and refused when an update touches it.
- **`ImageLayer.crop`: `{ x, y, width, height }` in source pixels.** It
  composes with `fit`: the rectangle is placed into the box as if it were the
  whole image, so `fill` stretches it and `contain` and `cover` work from its
  shape. Out-of-bounds rectangles clamp to the source. A rectangle that shares
  no area with the source is refused typed. A degenerate rectangle is refused
  by validation.
- **`Transform.flipHorizontal` / `flipVertical` (default false).** A mirror
  about the box centre, composed with the rotation — never a negative size,
  which validation forbids. Mirroring text mirrors its glyphs.
- **The CLI, MCP and interface carry all four.** `set --clip-rect`,
  `--clip-radius`, `--clip-ellipse`, `--no-clip`, `--crop X,Y,W,H`, `--no-crop`,
  `--flip-h`, `--flip-v`; MCP `update_layer` arguments `clip`, `clearClip`,
  `crop`, `clearCrop`, `flipHorizontal`, `flipVertical`; one inspector row per
  feature. HTTP needs nothing: `POST /operations` deserialises the union.
- **An imported image now records its pixel size.** A crop is a rectangle in
  the source's own pixels, so the header of a PNG, JPEG, GIF or WebP is read at
  import and its size written to the asset record. A format this build cannot
  measure is imported with an unknown size, and a crop of it is refused by name
  rather than guessed at. An asset's `width` and `height` are pre-existing
  document fields, so this changes no schema.

### Fixed

- **A clip and a shadow on one layer kept the shadow.** The mask is applied
  inside the effect stack. Measured, not assumed: with the mask beside the
  filter, SVG applies the clip after the effect and cuts the shadow off at the
  boundary — 0 ink pixels outside the box against 4390 in the shipped order.
- **A rotated clipped layer is cut to the box its own coordinates name.** SVG
  measures a `clip-path` in the referencing element's user space, so the mask
  carries the inverse of the layer's rotation and stays where the document says
  it is — 2600 ink pixels outside the box become 0 with the inverse.

### Notes

- Four new determinism gates: `clip-rounded` (including a rotated clipped layer
  and a clipped layer carrying a drop shadow), `clip-ellipse`, `crop` (square,
  letterbox, a rectangle clamped to the source, and a scale-2 export), and
  `flip`. Every golden from 1.7.0 is byte-identical.
- The crop is emitted as a nested `<svg>` whose viewBox is the source rectangle
  and whose viewport is the rectangle the fit places it in. The viewBox maps but
  does not crop, so the placement is computed rather than left to
  `preserveAspectRatio`.
- A layer with no clip, no crop and no flip emits the same SVG it emitted in
  1.7.0, byte for byte.

## [1.7.1] — 2026-09-12

**Bugfix release: `font install` now delivers a bold face.** This release
contains only the defect registered against 1.7.0. No new capability. No
`schemaVersion` change. No change to the `Operation` union or any operation
shape. No new surface. No dependency bump. The gate goldens do not change.

### Fixed

- **A store built only through `font install` held no bold face. Every
  `fontWeight: 700` layer then failed with a typed `MissingFont`.** The
  bundled manifest pinned Noto Sans, Noto Serif and Noto Sans Mono as
  variable fonts. The font database sees only the 400 default face of a
  variable font. The 1.7.0 weight field then did not work for install-only
  users. The refusal was honest. It was never a substitution. The manifest
  now also registers a bold (700) face for each of the three `default`-pack
  families. Each new entry pins sha256 to a commit of the notofonts
  distribution. An install of a family now installs every face registered
  under its name. `font install --list` and `GET /api/fonts/catalogue` still
  answer once per family. The byte totals now include the bold faces.
  Rendering does not change. The engine, the goldens, and the typed refusal
  for a truly absent face stay the same.

## [1.7.0] — 2026-09-12

**Typographic control, plus the canonical capability surface.** Bold
headlines, tracked captions, outlined display text, and text that sits where
the box says it should — and one capability listing that every surface reads,
so the DEF-24 drift class (render it but don't advertise it) cannot recur.

`schemaVersion` stays **1** and the `Operation` union does not grow: all five
typography fields are ordinary `UpdateLayer` and create-payload fields.
**Oldest build that opens a 1.7.0 document: 1.0** — builds 1.0 through 1.6
degrade silently through the `Extras` capture map, rendering the regular face
with no spacing, stroke or vertical alignment (per §1.3, that accepted price
of staying additive is named here).

### Added

- **`TextLayer.fontWeight` (100–900, default 400) and `fontStyle` (`normal`
  | `italic`).** Resolved against the caller's font set by *exact face*: a
  family whose bold is not installed is refused with a typed `MissingFont`
  naming family, weight and style — never a silent nearest match, because
  "looks roughly right" is how a wrong render gets trusted. Set everywhere a
  style can be set: `create`, `update`, presets, CLI `set`/`add-text`, MCP
  `add_text_layer`/`update_layer`, and a row in the interface.
- **`TextLayer.letterSpacing` (px, default 0).** Part of measurement, not
  just of drawing: wrapping, `GET /api/projects/{id}/text-layout`, the
  overflow warnings and the export all add it per gap, so the measured line
  and the rendered line are the same line.
- **`TextLayer.stroke` (`{ color, width }`), painted centred on the glyph
  outline with `paint-order="stroke"`** (D5, text half): the fill goes down
  first, so a stroke never eats the letter. A layer with `color: null` and a
  stroke is hollow display text. `update` accepts `null` to clear it, exactly
  like a shape's stroke.
- **`TextLayer.verticalAlign` (`top` | `middle` | `bottom`, default `top`)**
  (D19). `top` is the behaviour every earlier build had — the baseline one
  ascent below the box top — so existing documents render pixel-identically.
- **`TextLayer.color` is nullable.** `null` means no fill, the same bargain
  a shape's `fill` has; `update` clears it with `null`, and an absent key
  still means the pre-1.7 default of black. `null` serializes as `null`,
  never as an omitted key, so a hollow layer survives a round trip exactly.
- **The canonical capability surface.** One listing, in core, fed by the
  same sources the renderer is bound to (`BlendMode::RENDERED` and the
  `Effect` enum), served three ways: CLI `assemblash styles --json`, HTTP
  `GET /api/capabilities`, and the new MCP `list_capabilities` tool. Plain
  `styles` prose output is unchanged. Check it before using a mode or an
  effect: what a build cannot render, it refuses, and now it says so before
  you build the document.
- Four new determinism-gate documents — `text-weight`, `text-stroke`,
  `text-spacing`, `text-valign` — byte-identical across all six targets,
  beside the existing goldens, none of which moved.

## [1.6.1] — 2026-09-11

A defect sweep on 1.6.0. No schema change: `schemaVersion` stays 1, and no
operation, route, tool, flag or control changed.

### Fixed

- **`assemblash styles` now lists `dropShadow`.** 1.6.0 rendered the effect
  but the CLI's discovery listing still named only the five pre-1.6 effects,
  so an agent reading `styles` — the surface agents read to learn what a
  build can do — concluded drop shadows were unsupported and fell back to a
  blurred rectangle behind the layer. The listing is now derived from the
  `Effect` enum in core instead of a literal array in the CLI, a new effect
  variant fails to compile until it is given its line, and the regression
  test asserts every variant by an exhaustive match. The `dropShadow` entry
  documents its four fields (`dx`, `dy`, `blur`, `color`), notes that
  `dx`/`dy` at 0 is a glow, and that an `#rrggbbaa` alpha sets flood opacity.
- **The `add-text --text` and `set --text` help no longer claim `` `\n` ``
  is a line break.** A backslash-n typed at the shell is stored as the two
  characters and renders as such; only `--text-file` produces a real line
  break. The help now says the text is taken verbatim and points at
  `--text-file` for a line break. Behaviour is unchanged — this corrects
  the documentation, not the engine.

## [1.6.0] — 2026-09-09

No 1.5.1 was released: no defect was outstanding after 1.5.0.

A rectangle, an ellipse and a line stop being things you draw elsewhere and
import: they are layers this document draws itself, with fill, stroke and
corner radius as ordinary properties. A drop shadow joins the effect stack,
and a glow is that shadow with no offset rather than a second thing to keep
bit-identical.

### Added

- **Shape layers, a fifth layer kind.** A `shape` layer draws a rectangle, an
  ellipse or a line from the document itself, so a badge, a rule or a panel
  no longer needs an imported file that nothing here can edit afterwards. The
  transform box *is* the geometry — a rect fills it, an ellipse is inscribed
  in it — which means `move`, `resize` and `rotate` mean for a shape exactly
  what they already mean for every other layer, and layout bounds stay the
  box.
- **A line is its box.** `width` is the segment's length, `rotation` is its
  angle, and `height` is layout only: the line runs across the middle of the
  box, left edge to right edge. A second pair of endpoint coordinates would
  have been a second way of saying where a layer is, and every operation that
  moves a layer would then have meant something different for this one kind
  than for the other four.
- **`fill` and `stroke`.** `fill` is the interior paint, `stroke` is
  `{ color, width }`, and either may be absent — absent meaning *no paint*,
  which is SVG's `fill="none"` and not black. A shape with neither is a valid
  document, for the same reason `opacity: 0` is one: an editor has to be able
  to clear one paint before choosing the other.
- **A stroke is painted inward on a rect and an ellipse**, so the transform
  box is the visual box and nothing that reasons about layout has to know
  whether a shape is stroked. A line has no interior, so its stroke is
  centred on the segment instead. A width larger than the shorter side of the
  box fills the shape in the stroke colour, which is the continuous limit of
  the same rule — clamping the box instead would make an over-stroked shape
  vanish entirely one step after it still filled its box.
- **One measured caveat, on strokes thinner than a pixel.** A width below one
  device pixel is drawn as a hairline centred on the geometric edge, and a
  hairline always covers a whole pixel row, so a 0.5-wide stroke spills up to
  half a pixel outside the box on each side. It is deterministic and
  identical on every target, so it is written down here rather than refused —
  but below width 1 the box is not quite the visual box.
- **A `dropShadow` effect**, with `dx`, `dy`, `blur` and `color`. A glow is
  this with `dx` and `dy` at 0: there is no second primitive, because two
  names for one filter would be two things to keep bit-identical for no gain.
  An `#rrggbbaa` alpha becomes the shadow's flood opacity, so a shadow's
  strength is written where every other colour in the document writes it. A
  fractional offset is resampled by the filter and reads slightly softer;
  whole-pixel offsets give the crispest edge.
- **Presets carry `fill` and `stroke`.** A preset that omits one leaves it
  alone, and there is no spelling that clears a paint from a preset: a preset
  says what it sets, and one that could silently remove paint would be a
  different kind of thing.
- **A colour slot may target a shape's fill.** A template's colour slot now
  accepts a text layer or a shape layer and resolves to the right property
  when it is filled — a text layer's `color`, a shape layer's `fill` —
  because those are one question asked of two layer kinds. Stroke colour is
  not slot-able anywhere in 1.x, so a template cannot repaint an edge.
- **CLI `add-rect`, `add-ellipse` and `add-line`**, each taking the `--x`,
  `--y`, `--width`, `--height`, `--rotation`, `--opacity` and `--layer-name`
  flags `add-text` already has. `add-rect` and `add-ellipse` take `--fill`
  (default `#000000`, or `none`), `--stroke` and `--stroke-width`, and
  `add-rect` also takes `--corner-radius`; `add-line` takes `--stroke`
  (default `#000000`) and `--stroke-width` and no fill, because a line has no
  interior to paint.
- **`set` gains `--fill`, `--stroke`, `--stroke-width` and
  `--corner-radius`**, still one operation however many flags are given.
  `--fill none` and `--stroke none` clear a paint, and a colour on its own
  keeps the width the layer is already drawn with. `--stroke-width` on its
  own is refused on a shape that has no stroke to take a colour from: a width
  without a colour is not a stroke, and inventing a colour nobody asked for
  is the kind of quiet guess this engine does not make.
- **MCP `add_shape_layer`**, taking `shape` (`rect`, `ellipse` or `line`),
  `cornerRadius`, `fill`, `stroke` as `{ color, width }` and `name` beside
  the same placement, box and write arguments as `add_text_layer` — taking
  the server from 44 tools to 45. `update_layer` gains `fill`, `stroke` and
  `cornerRadius`, with `clearFill` and `clearStroke` for removing a paint,
  because a JSON null in a tool argument cannot be told apart from an
  argument nobody sent. A layer summary reports `kind` `shape` and a `shape`
  field naming the geometry, so an agent listing layers can tell a rect from
  a line without reading the document.
- **A Shapes row in the reference interface's Add panel** — Rectangle,
  Ellipse, Line — and a Shape inspector with Fill, Stroke, Stroke width and,
  for a rectangle, Corner radius, each row sending exactly one `update`.
  `dropShadow` is in the add-effect menu with all four of its fields, and the
  layer tree shows a shape's geometry in its icon.
- **Two new reference documents in the render gate**, `shapes` and `shadow`,
  so every shape and shadow path is checked byte-for-byte on all six released
  targets rather than only on the machine that wrote it.

### Changed

- **An asset upload may be up to 64 MiB**, the ceiling a font import has had
  since 1.5.0. Until now this route ran under the web framework's 2 MB
  default, so a photograph from a phone was refused for being an ordinary
  photograph. Both upload routes now answer a body over their limit with the
  same JSON error envelope as every other failure — status 413, code
  `payloadTooLarge`, and a message naming the limit in MiB — rather than the
  framework's plain-text refusal, because a client that learned to read this
  API's errors one way should not have to learn a second way for the most
  ordinary mistake an upload can make.

### Fixed

- **A font family literally named `catalogue` or `install` can now be
  removed.** `GET /api/fonts/catalogue` and `POST /api/fonts/install` are
  fixed path segments, and a fixed segment wins over `/api/fonts/{family}`:
  a family with one of those two names could be imported and listed but never
  deleted, and the answer to trying was a 405 with nothing a client could do
  about it. `DELETE` now sits on both paths and removes the family of that
  name.

### Compatibility

- `schemaVersion` stays **1**, and the `Operation` union is additive: one new
  `create` payload for a shape layer and three new `update` properties. No
  existing operation or document field changes shape.
- **1.0 through 1.5 refuse a document that contains a shape layer — the whole
  document, not the layer.** `show`, `history` and every other command exit 1
  with `` unknown variant `shape`, expected one of `text`, `image`, `group`,
  `svg` `` and the line and column where the read stopped. This is the first
  1.x feature that makes a released build refuse a project rather than open it
  with less in it, which is why a new layer kind is a `.0` and is named here
  rather than left to be discovered. There is nothing to migrate and nothing
  to repair in the file: open the project with 1.6.0 or newer.
- **A `dropShadow` effect is the gentler story.** Every 1.3.0-and-newer build
  keeps it in the document verbatim and refuses only the render, with
  `effect "dropShadow" is not one this build renders` naming the layer;
  unrelated edits to the same project still succeed, and the effect is still
  there afterwards. The way back is the same one: render with 1.6.0 or newer.
- **Rounded corners and ellipses are emitted as cubic curves rather than as
  SVG arcs**, so the rasteriser's own arc conversion — which reaches the
  platform's maths library, where two operating systems are free to disagree
  in the last bit — is never on the path to a pixel.
- **A layer that casts a shadow gets an explicit filter region** in user units
  rather than the percentage-of-bounding-box default, which is the wrong unit
  for an offset shadow; the trade-off is that content reaching more than half
  a box beyond the layer's box may have its shadow clipped, while a stack
  with no shadow keeps exactly the region it has always had.

## [1.5.0] — 2026-09-09

No 1.4.1 was released: no defect was outstanding after 1.4.0.

Fonts become something you manage in the interface rather than in a terminal,
and an imported SVG asset drawing text no loaded font can provide stops
exporting a blank space and calling it a success.

### Added

- **A Fonts section in the reference interface's Add panel.** It lists the
  installed families and their faces, imports font files from disk, and removes
  a family. Until now the interface's answer to a missing font was a line of
  text telling you to go and run `assemblash font install …` in a terminal,
  which is not an answer for the person the double-click launch exists for.
  That instruction no longer appears anywhere in the interface.
- **Import takes TTF, OTF, TTC, OTC, WOFF and WOFF2.** A WOFF or WOFF2 file is
  decompressed on import and stored as the sfnt bytes it carries, so the hash
  in the index describes the file that is actually on disk rather than the
  container it arrived in.
- **Removing a family asks first**, and the confirmation says what will happen:
  a project using that family reports a missing-font error until the family is
  imported again. Removal touches the font store and nothing else — not the
  operating system's fonts, and not the file you imported from.
- **One button installs the bundled `default` pack** — Noto Sans, Noto Serif
  and Noto Sans Mono — offered only when the store is empty. The button says
  what it will download, and nothing is fetched until it is pressed.
- After an import, an install or a removal, the font picker and the canvas
  refresh immediately. There is no restart.
- **The font store now has an HTTP surface**, under the same access-token rule
  as every other route:
  - `GET /api/fonts` returns `{ families, faces }`. `faces` is new and
    additive; `families` is unchanged.
  - `POST /api/fonts?filename=<name>` takes the raw bytes, up to 64 MB, and
    answers `201 {imported, families}` — or `200` when those exact bytes were
    already stored, because importing the same file twice is not an error. The
    refusals are `400 unsupportedFontFormat`, `400 invalidFilename` and
    `422 invalidFont`. Concurrent imports are serialised in the server, so two
    uploads that arrive together cannot cost one of them its index entry.
  - `DELETE /api/fonts/{family}` answers `200 {removed, families}`, or
    `404 unknownFontFamily`.
  - `GET /api/fonts/catalogue` reports what the bundled manifest offers:
    `packs`, and `families` with a license and a byte size, so a caller can
    show the cost before anyone agrees to it.
  - `POST /api/fonts/install` with `{"pack":"default"}` or `{"family":"…"}`
    answers `201 {installed, families}`, `404 unknownFontFamily`,
    `404 unknownFontPack`, or `502 fontInstallFailed`. **This is the one route
    that reaches the network, and it does so only on this explicit request.** A
    pack install is atomic: every file is downloaded and hash-checked before
    any of them is stored, so a download that fails partway leaves the store
    exactly as it was rather than holding half a pack. An unknown key in the
    install body is refused, following the 1.4.0 rule.
- **`serve --reclaim-stale-locks`, and the same flag on `mcp`.** A lock file
  now records the machine that wrote it (`host`) beside the pid. With the flag
  on, the server reclaims a project lock by itself only when the lock names
  this machine and the process it names is provably gone; every reclaim is
  reported — a line in the server log, a notice in the interface, and a
  `lockReclaimed` export warning wherever there is an export result to carry
  one. The flag is off by default and switched on by the double-click /
  `--friendly` launch, which is the case with nobody at a terminal to run
  `assemblash unlock`. A lock written on another machine, or written by an
  older build and so carrying no `host` at all, still needs a person: the
  interface's confirm dialog and `assemblash unlock` are unchanged. The reason
  is the synced folder — a project directory that syncs between machines can
  hold a lock whose pid belongs to a different computer, where that number
  proves nothing.

### Changed

- **An imported SVG asset whose text no loaded font can draw is now refused
  rather than exported blank.** Since 0.x, rendering an SVG asset containing
  `<text>` with no matching font produced a file with that text simply missing:
  exit 0, zero ink, and a document that looked finished. That was the behaviour
  on the HTTP, MCP and interface paths and on CLI `--font-store`, while CLI
  `--font-dir` drew the text — so the same document produced two different
  pictures depending on how its fonts were supplied. This is the same argument
  1.3.0 made about an operation carrying a property it does not define: a
  success that did nothing is a false success, and the fix is to stop reporting
  it as one.

  1.5.0 refuses the render with a typed error naming the asset id and, where
  there is one, the family. The rule it applies: an asset draws text only if
  every `<text>` in it names at least one non-generic font family the render
  loaded. Text that names no family, or only a generic one (`serif`,
  `sans-serif`, …), is refused too, because the pinned store never holds the
  renderer's fallback family — such text is guaranteed to draw nothing.

  **A document that used to export blank but successfully now refuses.** Name a
  loaded family in the asset, or outline the text before importing it. On the
  CLI the exit status is non-zero and no file is written; over HTTP it is
  `422 renderFailed`; over MCP it is a tool error.
- The `svgAssetTextWithoutFont` export warning added in 1.3.0 is kept as a
  code, but it is no longer produced for this case. The refusal happens first,
  so there is no export result for a warning to sit in.

### Compatibility

- `schemaVersion` stays **1**, and the existing `Operation` union is unchanged.
  This release adds no operation and no document field.
- **1.4.0 opens every project 1.5.0 writes**, and so does every earlier 1.x
  build, because nothing about the on-disk document changed. The only new data
  written anywhere is the optional `host` in a lock file, which 1.4.0 reads and
  ignores.
- `faces` on `GET /api/fonts` is additive, and the other four font routes are
  new. No existing HTTP route, CLI flag, subcommand or MCP tool changed shape.
- **The one thing you may notice on an existing document is the SVG-text
  refusal.** A project that exported successfully while an SVG asset drew text
  in a family no loaded font provides will now refuse to export. Nothing in the
  document changed and there is nothing to migrate: load the family the asset
  names, name a loaded family in the asset, or outline its text and import it
  again. 1.4.0 still exports the same project blank.

## [1.4.0] — 2026-09-05

### Added

- Canvas editing through the reference editor, `assemblash canvas set`, MCP
  `update_canvas`, and HTTP `updateCanvas`. Width, height and background change
  in one undoable operation. Omitting background preserves it; explicit JSON
  `null` or CLI `--no-background` clears it.
- Nine resize anchors position existing content without scaling layers. The
  default `top-left` leaves positions unchanged. An anchor that would move
  locked, protected or read-only content refuses the entire operation.

### Fixed

- Unknown top-level properties are refused across all operation variants.
  Typed HTTP JSON request envelopes also reject unknown fields, so misspelled
  version, actor or export options cannot silently take their defaults.

### Compatibility

- `schemaVersion` remains 1; the document fields and existing operation shapes
  are unchanged. The operation union gains `updateCanvas`.
- **Upgrade before reopening a project whose history contains `updateCanvas`.**
  The released 1.3.1 binary refuses both `show` and `history` with a corrupt
  journal error naming the line and unknown operation. Undoing the change does
  not remove that journal entry. Keep the newer binary; do not edit or delete
  the journal to work around the refusal.

## [1.3.1] — 2026-09-05

A bugfix release on 1.3.0. Every defect is in the test and CI harness rather
than in anything the program does, so this release changes no behaviour at
all — and that is worth saying plainly rather than dressing up. One test could
pass for the wrong reason, another could fail for the wrong reason, and a run
could hang instead of reporting anything at all; a suite that does any of those
is not evidence about a release, which is the only thing a suite is for.
Nothing new was added, and this is the 1.3 release to install.

### Fixed

- **The Model Context Protocol tests could pass against a binary built from
  older code.** They drive the real `assemblash` executable as a child process,
  which is the point of them, but the executable belongs to a different crate
  from the tests, so `cargo test -p assemblash-mcp` never rebuilt it: the tests
  ran against whatever an earlier `cargo build --workspace` had left on disk.
  Removing a tool from the source and running them still passed. They now build
  the binary themselves, once per test process and into the profile they were
  built for, and the same removal now fails as it should.
- **A test's minimal HTTP client waited for the connection to close instead of
  for the response to finish**, and intermittently failed with `Connection
  reset by peer` on macOS after the server had answered it perfectly well. A
  host that closes a connection with anything still unread in its receive queue
  must send `RST` rather than `FIN`, so a client still reading at that moment
  sees a reset instead of an end. It was `POST /api/shutdown` that exposed
  this — its handler takes no body extractor, so the body the test sends is
  never read — and the failure was a matter of kernel timing, which is why the
  same commit passed and failed on the same runner twenty minutes apart. The
  client now reads until the message is complete, by `Content-Length` or by the
  chunked terminator, and stops there. All four copies of it are fixed, and a
  new assertion checks that completeness is decided by framing rather than by
  the close.
- **A test run could hang for the best part of an hour instead of reporting.**
  The browser journeys for the reference interface passed all twelve of their
  assertions and then failed while removing the temporary Chrome profile:
  Chrome's helper processes outlive the one the test signals and were still
  writing into the directory being deleted. That failure came from the first of
  two cleanup steps and so skipped the second, which left the fixture web server
  listening — an open handle that keeps Node alive with nothing left to do. The
  run sat silent until somebody cancelled it by hand, and a hang reports
  nothing, which is worse than a failure. Removing the profile now retries and,
  if it still loses the race, says so rather than failing a run that has already
  made every assertion it came to make; the fixture server is closed whatever
  happens before it; and every wait in the journeys — a condition in the page, a
  DevTools command, the browser's launch handshake, the sockets at either end —
  now has an upper bound that fails the test naming what it was waiting for.
  Every job in both workflows also carries a time limit, so nothing else of this
  kind can sit unreported either.

- **Release validation now exercises the executable through CLI, HTTP and
  MCP on all six supported targets.** The same smoke test runs before release
  and against checksum-verified archives downloaded after publication. It
  checks matching PNG bytes and warnings, refusal without mutation, actor
  attribution, undo and overlap queries.

### Compatibility and safety

- `schemaVersion` stays **1**.
- The existing `Operation` union is unchanged, and no operation changed shape.
- No CLI flag or subcommand, HTTP route, MCP tool or interface control was
  added, changed or removed.
- **A document written by 1.3.0 is unchanged by this release**: it loads and
  saves identically, and renders the same pixels. Export bytes include the
  renderer version, so their metadata changes to 1.3.1. No generated
  artefact moved — not the generated schema, not the TypeScript declarations,
  not the interface bundle. Every change in this release is a test or a CI
  workflow, apart from the version number and a comment in a manifest.
- No server, engine or interface code was touched. In particular the socket
  behaviour behind the second fix is the server's correct response to
  `Connection: close`, and it was left alone.
- Every renderer gate golden is unmoved. No dependency was bumped.

## [1.3.0] — 2026-09-04

Nothing new that the engine can draw; everything it could already draw becomes
reachable from every interface. A layer property only the HTTP API could set is
now a CLI flag. A query only the CLI could answer is now an HTTP route and an
MCP tool. An export now says what it could not do well instead of staying
quiet. And an operation carrying a property it does not define is refused,
where it used to be accepted and silently discarded.

### Added

- **`assemblash set`**, one command for every updatable layer property:
  `--name`, `--x`, `--y`, `--width`, `--height`, `--rotation`, `--opacity`,
  `--visible`, `--locked`, `--blend`, `--effects`, `--effects-file`, `--text`,
  `--text-file`, `--font`, `--size`, `--color`, `--align`, `--line-height`,
  `--fit`, `--asset` and `--allow-locked`. However many flags an invocation
  carries, it is one `update` operation: journalled once, undone once. Position
  and size flags are merged into the layer's current transform, so `--x` alone
  moves without resizing, and `--name ""` removes a name. `assemblash style` is
  unchanged and now calls the same builder, so the two cannot drift.
- **`--line-height` on `assemblash add-text`**, and **`lineHeight` on the MCP
  `update_layer` tool** — the last updatable property those two surfaces could
  not set.
- **Export warnings.** An export now reports what it could not do well:
  `wordBrokenMidWord` (a single word too wide for its box, split to fit),
  `textOverflowsBox` (laid-out text taller than the box holding it) and
  `svgAssetTextWithoutFont` (an imported SVG asset drawing text in a family no
  loaded font provides). Each carries `code`, `message` and, where one applies,
  `layerId`. `POST /api/projects/{id}/export` and the MCP `export_document`
  result carry a `warnings` array; the CLI prints one line per warning on
  stderr, or the whole array as JSON on stdout with the new `--warnings-json`
  flag on `render` and `export`. A warning is advisory: it changes no pixel and
  no exit status.
- **`GET /api/projects/{id}/overlaps`**, returning `{"pairs": …}` in the same
  order as `assemblash overlaps`, narrowable with a repeated or
  comma-separated `?layers=`. A layer id that is not in the document is
  refused, not ignored.
- **Four MCP tools — `create_project`, `add_svg_layer`, `render_document` and
  `find_overlaps`** — taking the server from 39 tools to 43. `render_document`
  returns the same SVG the HTTP preview route serves; `find_overlaps` returns
  the same pairs as the CLI and the new route; `add_svg_layer` draws an asset
  that was already imported, because a layer can only ever draw a sanitized
  one.
- **Positional output paths on `assemblash render` and `assemblash export`**,
  beside the existing `--out`, and both now print the written path and its
  `sha256:` digest as one tab-separated line on stdout — the same digest form
  `variants` already prints — so two interfaces can be compared without
  hashing the files.
- **Positional input files on `assemblash add-svg` and `assemblash
  add-image`**, beside the existing `--file`, matching `assemblash font add`.
- **`assemblash preset define --properties-file`**, so a preset's JSON can come
  from a file rather than from a shell that may rewrite it on the way through.
- **An SVG choice in the reference editor's export dialog.** Choosing SVG
  downloads the engine's vector render and disables the resolution row, since a
  scale means nothing for a vector; nothing is written into the project.
- **Reference-editor inspector controls** for image and SVG `fit`, and for
  reordering the effect stack, where order is part of what the stack means. The
  font fields gained a suggestion list of the families the server reports, with
  free text still accepted so a document naming a family this machine lacks
  stays editable. An uploaded image or SVG now arrives at its own recorded
  dimensions, scaled down to fit the canvas, instead of always 300×200.

### Changed

- The reference editor's export dialog no longer carries its bare SVG download
  link. The link could not carry an access token, so it failed on any server
  started with one, and the new format choice is the working version of the
  same affordance.
- CI's `ui` job now runs `npm run check`, which typechecks, builds and runs the
  interface's unit tests and browser journeys in one step. Those tests existed
  but had never been invoked in CI. The check that the committed build output
  is the build output still runs after it, unchanged.

### Fixed

- **An operation carrying a property it does not define used to succeed.**
  `{"op":"update","id":"layer_…","letterSpacing":4}` returned `200 OK`, bumped
  the document version, reported the layer as changed, and journalled an update
  carrying no properties at all — a false success that told a client its edit
  had landed when nothing had happened. `create` behaved the same way. Both now
  return `422` with code `operationRefused`, naming the property; the document
  version does not move and no journal entry is written. The known keys are
  derived from the same definitions the published operation schema is generated
  from, and the `create` check uses the payload's own `type`, so a text
  property on an image create is refused as precisely as a misspelt one. Three
  spellings that predate 0.6.0 — `font_family`, `font_size` and `line_height`
  on a text `create` — are still accepted, so journals written before then
  still replay.

  This affects only a newer client talking to this server. It is a refusal of
  what is sent, never of what is stored: no document, journal or existing
  client behaviour changes meaning. **MCP is unaffected** — every MCP tool
  builds a typed operation in Rust, so a property the operation does not define
  could never reach the operation layer from there.

### Compatibility and safety

- `schemaVersion` stays **1**.
- The existing `Operation` union is unchanged, and no operation changed shape.
  `set` and all four new MCP tools compile to variants that already existed.
  `schema/document.schema.json`, `schema/operation.schema.json` and both
  generated TypeScript declaration files are unchanged.
- **A document written by 1.2.x is unchanged by this release**, and every 1.x
  build — back to 1.0.0 — reads a document produced with this release's
  capabilities exactly as it read one before it. No document field was added
  and none changed shape.
- `warnings` is a new field on an export response, not on a document, so it is
  additive for any client that ignores unknown response fields.
- The published operation schema does not state whether extra keys are allowed
  on `create` and `update`. The refusal lives in the operation layer, so a
  client author should read this behaviour rather than the schema's silence.
- Export warnings are not displayed in the reference editor in this release.
  They are reported by the CLI, the HTTP API and the MCP server.
- `svgAssetTextWithoutFont` makes a silent failure loud; it does not fix it. An
  imported SVG asset drawing text in a family the loaded fonts do not provide
  still renders that text as nothing. The check reads `font-family` attributes
  only — not a `style="…"` attribute and not a `<style>` block.
- Every renderer gate golden is unmoved: this release adds no paint path.
- Every existing CLI flag and subcommand, HTTP route and MCP tool still works.
  `--out`, `--file` and `assemblash style` are all still accepted.

## [1.2.1] — 2026-09-04

A bugfix release on 1.2.0. Five defects found by auditing the released build
against what it claims to do, four of them cases where something was quietly
discarded or quietly duplicated rather than reported. Nothing new was added,
and this is the 1.2 release to install.

### Fixed

- **A font that names its family in more than one language arrived as more
  than one family.** `assemblash font add` wrote one index record per
  name-table language record, so a font naming itself in English and Japanese
  filled `font list` with families nobody had installed. One file's face is now
  one record, under the name the English record gives, or the first record when
  there is none.
- **The same font bytes under a different filename were added twice.** A stored
  record compared equal only when its `source` and `license` matched too, so
  re-adding a renamed copy — or the same file again with `--license` filled in
  — appended a second row describing a file already in the store. Records are
  now matched on what they identify: family, style, weight, file, hash and face
  index. The first import's source and licence are kept.
- **SVG import destroyed the accessibility metadata an author had written.**
  `role`, `aria-label`, `aria-labelledby` and `aria-describedby` were not on
  the import allowlist and were stripped without appearing in the removal
  report. They are now kept. None of them references anything outside the
  document, so nothing about the import threat model changes.
- **`prune_unused_assets` treated an `svg` layer's asset as an orphan** and
  would have deleted a file the document was still drawing. It now counts every
  layer kind that names an asset, and does so exhaustively, so a layer kind
  added later cannot be forgotten here silently.
- **The published schema described `blendMode` wrongly.** Its description still
  read "Reserved (v0.5): only `normal` is rendered today", fourteen releases
  after fourteen modes started rendering, and that sentence was in
  `schema/document.schema.json` and `schema/document.d.ts` as well as the Rust.
  It now says what the renderer does, including why `color-dodge` and
  `color-burn` are deliberately absent and what happens to a mode this build
  does not draw.

### Changed

- Removed `drawInspectorLegacy` from the reference interface. It was superseded
  and called from nowhere; the committed bundle is smaller by its size.
- `crates/assemblash-renderer/tests/fonts/TwoFamilyNames-Subset.ttf`, a Noto
  Sans subset carrying two Unicode family-name records, is committed as a test
  fixture for the first of the font-store fixes. Like the other fixtures there
  it is under the SIL Open Font License 1.1; it is renamed rather than keeping
  the original family name, because it is a modified version. `subset.py`
  rebuilds it from the committed Latin subset.

### Compatibility and safety

- `schemaVersion` stays **1**.
- The existing `Operation` union is unchanged, and no operation changed shape.
- No CLI flag or subcommand, HTTP route, MCP tool or interface control was
  added, changed or removed.
- **A document written by 1.2.0 is unchanged by this release**: it loads,
  saves, renders and exports exactly as it did, byte for byte. The only change
  to a published artefact is a corrected description string in the generated
  schema and TypeScript declarations, which no document depends on.
- Every renderer gate golden is unmoved. No dependency was bumped.
- Documents whose SVG assets were imported by an earlier build are unaffected;
  the accessibility fix applies to imports made from now on, and re-importing
  the original file recovers what an earlier import dropped.

## [1.2.0] — 2026-08-30

Assemblash is easier to recognize, understand, and use without changing the
stable document or operation contracts. This release integrates the finished
identity, tightens the editor's everyday interaction details, and turns the
repository into a complete public entry point with a real editable example.

### Added

- The finished Assemblash mark in the reference editor and public repository,
  using the same compact layered identity at application and documentation
  sizes.
- A neutral launch-card example under `examples/launch-card`, stored as an
  ordinary structured project with sanitized SVG assets and operation history.
  Its README image is exported by Assemblash itself and can be reproduced with
  the manifest-pinned Noto Sans font.
- A public `skills/assemblash/SKILL.md` for agents working with Assemblash
  documents or integrations. Tool-local `.agents/` installations remain
  ignored and are rejected by repository hygiene checks if committed.
- Direct README paths for questions, reproducible bug reports, feature ideas,
  deployment guidance, schemas, and the editable example project.

### Changed

- Rewrote the README around the released product: a short explanation, real
  quick start, six-target compatibility table, interface choices, architecture,
  safety model, stability promise, current limits, and contribution workflow.
- Simplified the editor's zoom controls, improved contrast and scrollbar
  treatment, and made an empty Layers panel explain how to create the first
  layer instead of presenting an unexplained blank state.
- Aligned the private UI package metadata, security policy, issue form, agent
  guidance, and release packaging with the product release. Release archives
  now carry the public image assets used by their README.
- Expanded ignore and CI hygiene rules so local AI workspaces, credentials,
  private downstream content, build output, and sync artifacts stay outside the
  public repository and Docker build context.

### Compatibility and safety

- `schemaVersion` stays **1**.
- The existing `Operation` union is unchanged.
- Existing 1.0 and 1.1 documents and clients require no migration.
- The example was created through the validated CLI and re-exported
  byte-identically from its committed document, assets, history, and pinned
  font bytes.

## [1.1.0] — 2026-08-27

The reference interface is now a practical canvas-first editor while the
stable document schema and operation API remain unchanged. Existing 1.0
documents and clients continue to work without migration.

### Added

- A unified editor shell with one Add panel, direct on-canvas text editing, a
  contextual toolbar, and one docked Properties/Layers/History panel.
- Heading, subheading, and body presets; image and SVG drop/upload flows;
  synchronized canvas/layer selection; inline layer rename, visibility, lock,
  grouping, reordering, and protected/read-only states.
- Separate horizontal and vertical canvas centring, nine canvas anchors, six
  selection alignments, distribution, ordering, and numeric transform fields.
- A shared accessible context menu for canvas and layer rows, standard
  clipboard/grouping/nudge shortcuts, multi-selection handles, marquee and
  additive selection, smart guides, zoom, fit, 100%, and responsive panels.
- `POST /api/projects/{id}/operation-batches` for atomic UI commands. Existing
  operations are validated and journalled as one transaction; the
  project-local `insertLayerTree` clipboard macro expands into ordinary
  operations with fresh IDs and validated asset references.
- `GET /api/projects/{id}/text-layout` and pinned-font text measurement so a
  resized text box wraps and grows to its content instead of stretching glyphs.
- Explicit PID-matched stale-lock recovery at
  `POST /api/projects/{id}/recover-lock`.
- Offline browser journeys for the compiled editor plus focused geometry,
  export, API, batch, wrapping, and lock-recovery tests.

### Changed

- Dragging, resizing, and rotating update locally while the pointer moves and
  commit one operation batch when interaction ends. Interactive previews render
  only the pixels needed at the displayed scale; final export stays full-size
  and deterministic.
- Rotated selection boxes, resize handles, snapping, alignment, and
  multi-selection bounds use visible geometry. A rotated resize follows the
  layer's local axes and keeps the opposite anchor fixed.
- Export has an explicit workflow with named output sizes while retaining
  original-size PNG and SVG output from the Rust renderer.
- Development builds use light optimization so local raster previews respond
  quickly without disabling debug assertions.

### Fixed

- Text overflow, stretched text during resize, delayed drag feedback, editing
  overlays that did not rotate, and selection boxes that did not follow their
  layers.
- Duplicate editing/creation surfaces, overlapping panels, inaccessible
  arrangement actions, inert sidebar modes, and mobile panel overflow.
- Project-open failures caused by stale process locks. Recovery removes only
  the exact claim the user was shown and never steals a changed or live lock.
- A missing `geometry.js` server allowlist entry that prevented the editor
  module—and therefore both sidebars—from initializing in the real binary.

### Compatibility and safety

- `schemaVersion` stays **1**.
- The existing `Operation` union is unchanged.
- Existing single-operation endpoints and clients remain supported.
- Batch commands preserve expected-version checks, protected/read-only layer
  rules, atomic rollback, deterministic replay, and one-step undo/redo.

## [1.0.0] — 2026-08-06

**Assemblash is 1.0.** Not because it is finished, but because what you build
against will not move under you.

`1.0.0` promises exactly two things:

- **The document schema is stable.** `schemaVersion` has been 1 since v0.1.0
  and has never needed a migration. Fields have only ever been added, with
  defaults, and unknown keys survive a load-and-save cycle — which is
  property-tested, not merely intended.
- **The operation API is stable.** The operation set has grown; no existing
  operation has changed shape.

**Breaking either now requires a MAJOR release, with a migration.**

It is not a claim of feature completeness. What exists is listed in
`README.md`; what does not is said there too.

### What 1.0 contains

Everything released through v0.17.0, unchanged: the document model and its
thirteen layer operations, layout operations, an append-only journal with undo
and redo across restarts, protected and read-only layers, file locking and
expected-version conflict checks, a hash-pinned font store with twelve OFL
families, deterministic SVG and PNG rendering, fourteen blend modes, a
non-destructive effect stack with seeded grain, presets, templates that can be
authored as well as filled, a workspace that stays usable at two hundred
projects, a local HTTP API, an MCP server with read and write tools, a
reference web interface, and binaries for six targets plus a `scratch`
container.

### The three limits, stated plainly

- **Fourteen blend modes, not sixteen.** `color-dodge` and `color-burn`
  rasterize correctly but do not produce bit-identical bytes on every target.
  Reproducibility is what the rest of the engine rests on — including the
  content hashes a variants batch is checked by — so both are refused with a
  typed error rather than drawn. Revisit if the upstream renderer changes.
- **AI adapters (PRD use case D) are out of scope by design.** No adapter
  ships and the core never requires an AI provider. Adapters are the post-1.0
  extension point, not a missing feature.
- **Authentication is one shared token; identity belongs in front of it.** A
  non-loopback bind refuses to start without a token, which is compared in
  constant time, never logged, and never put in a URL. There are no users, no
  roles, and no revocation beyond rotating it. For OIDC or SSO, put a reverse
  proxy in front — the token authenticates, it does not encrypt.

### Verified for this release

All fourteen MVP acceptance criteria (PRD §12) and primary use cases A, B, C,
and E (PRD §6) are demonstrated by real execution against released artifacts,
not by argument. Every release from v0.1.0 was tested on all six targets in CI
before it was tagged, and every one was verified afterwards by downloading the
binary and running it. The `scratch` container builds and runs.

## [0.17.0] — 2026-08-06

Templates can be authored, not just filled. Closes the last functional caveat
in the evidence file.

No document-model change: `slots` already existed. `schemaVersion` stays **1**,
and three new operations are additive to the operation enum, exactly as the
three preset operations were in 0.15.0.

### Added

- **`defineSlot`, `updateSlot`, `removeSlot`** as ordinary operations —
  journalled, undoable, dry-runnable, and version-checked, because that is what
  every operation gets. Before this, `slots` had no operation that set it, so
  authoring a template meant editing `document.json`: the only workflow in the
  product with no journal, no undo, and no audit trail.
- **A slot may not be aimed at protected or read-only chrome**, refused at
  definition time. Filling one was already impossible — a fill is an `Update` —
  but *offering* it was not, and an opening that always refuses when filled is
  worse than no opening, because it looks like a promise.
- The same checks refuse a name already taken, an empty name, a layer that is
  not in the document, and a kind that does not match the layer it names.
  `updateSlot` faces every one of them, so an update cannot produce a slot a
  definition would have refused.
- `assemblash slot define|update|remove`, the same three operations over HTTP
  and MCP, and an inspector affordance that offers the selected layer as a slot
  and lists and removes the document's slots.
- The journal now names the slot and preset operations rather than printing
  them as a generic `operation`.

### Changed

- **Deleting a layer a slot offers is refused**, naming the slots in the way.
  A dangling slot makes the document invalid, so doing nothing was never an
  option; cascading would let an agent delete a layer and silently break a
  contract other callers are filling, with no room in the `removed` outcome to
  say it had. The fix is one `removeSlot`, and the error says which.

### Verified

- A template authored, filled, and undone **without a single hand edit**: the
  slot definition undoes byte for byte, and redo puts it back.
- Every refusal, through the binary: protected chrome, read-only chrome, a
  missing layer, a kind mismatch, a duplicate name, and deleting a slot's
  layer — including when the layer is a child of the group being deleted.
- A refused definition leaves the document byte-identical.
- The scale test now stops the first server before restarting one over the
  same workspace, and compares the **thumbnail bytes** across the rebuild as
  well as the list and the search. Checking only the list and the search left a
  hole: a rebuilt cache could have answered those correctly and still produced
  a different picture. Found by running the v0.16.0 exit test by hand against
  the released artifact.

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
