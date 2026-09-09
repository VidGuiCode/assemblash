# README hero example

This is the editable Assemblash project behind the hero image shown in the main
README. It is a real document, not a design mockup or generated image, and it
was built with the 1.6.0 shape layers and drop shadow.

The picture says what the engine is without saying it in words: one document in
the middle, reached from two sides. On the left, the routes an agent or a script
takes — the command line and MCP. On the right, the canvas a person edits in.
Behind the current sheet, two earlier sheets: the history that makes every
change undoable.

The layer tree is grouped the way the picture is read, so each part can be
moved, hidden or restyled as a unit:

- `Agents` — two groups, `CLI` and `MCP`, each holding a connector line, a
  white ring with a soft shadow, an imported SVG icon and a label;
- `Canvas` — the same four layers for the person's side;
- `Document` — three stacked sheets and a `Design` group of six shapes standing
  in for a layout: a block, a dot, a bar and three lines of text;
- `Brand` — the Assemblash mark and wordmark; and
- a single headline.

The three icons are hand-drawn SVGs, sanitised on import like any other asset.
The wordmark and the headline use `Noto Sans Bold`, a static Latin subset in
`fonts/` derived from the manifest's variable Noto Sans at weight 700 with
fontTools, renamed so a text layer can ask for it by family (a text layer names
a family and nothing else). It ships under the same OFL licence, copied beside it.
The operation history is included: the layers were created over the command
line and grouped over the HTTP API, and every step is in the journal.

## Inspect and export it

The example uses Noto Sans. Install the manifest-pinned font once into a local
store, then export the project:

```sh
assemblash font install "Noto Sans" --font-store ./assemblash-fonts
assemblash show ./examples/readme-hero
assemblash export ./examples/readme-hero --out readme-hero.png --scale 3 --font-store ./assemblash-fonts --font-dir ./examples/readme-hero/fonts
```

The README image is the `--scale 3` export, 3600×2025. The committed project contains the document, its sanitised SVG assets, its
history, and the one derived bold face it needs. Noto Sans itself and the
rendered output stay outside the project.
