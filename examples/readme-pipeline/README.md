# README pipeline example

This is the editable Assemblash project behind the pipeline diagram in the main
README. The diagram shows one path: four clients send typed operations, the
engine writes one document and its history, and one renderer makes the pixels.

The document is one canvas of 1000 by 300 pixels. The layer groups follow the
reading direction:

- `Clients` holds four white chips: **Editor**, **CLI**, **HTTP**, and
  **MCP**. Four thin lines join them at one point.
- `Flow` holds the three cards and the arrows between them: **Operations**,
  **Document**, and **Renderer**. The operations card has the red outline
  because it is the single entry point for every interface.
- `Outputs` holds the **PNG** and **SVG** chips.

The connector lines are line layers with a rotation. Each line runs across the
middle of its box, so the box centre sits on the midpoint of the line. The
arrows are the `arrow` marker on a line.

## Rebuild and export it

The example uses three font families. This repository holds Latin subsets of
them in `../fonts/`: Montserrat 800, Inter 400, and JetBrains Mono 400. Export
with `--font-dir` so the export does not read the system font list or the
workspace font store.

```sh
assemblash export ./examples/readme-pipeline --out pipeline.png --scale 2 --font-dir ./examples/fonts
```

The README image is the `--scale 2` export, 2000 by 600 pixels. The export
prints its `sha256:` digest. Two exports of this project print the same digest:

```text
sha256:6f8b5ea3535ebf124faa6172be2e158ae26b10821e4137c325cd19100ee650be
```

The committed project holds the document and its history. The rendered output
stays outside the project.
