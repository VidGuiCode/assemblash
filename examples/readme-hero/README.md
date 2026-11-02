# README hero example

This is the editable Assemblash project behind the hero image in the main
README. It is a real document, not a design mockup.

The canvas is 2048 by 1152 pixels. The picture has two columns.

- **Left column.** The group `Hero copy` holds four text layers: the category
  label, the main headline, the description, and the technical footer.
- **Right column.** The group `Editable poster` holds the dark poster and
  everything on it: the top label, the poster headline, the supporting text,
  the red circle, the divider, and the two bottom labels.
- **Editing detail.** The group `Circle selection` holds a thin blue bounding
  box, eight white selection handles, and a cursor. The bounding box and the
  handles are ordinary rectangle layers. The cursor is an imported SVG asset.
- **Human touch.** The group `Handwritten note` holds the note text and its
  arrow. The arrow is one imported vector asset: a smooth stroke with round
  caps and round joins, and a shallow chevron for its head. A path shape
  cannot paint its stroke in 1.13.0, so a rounded stroked arrow is an SVG
  asset, not a path layer.
- `Paper texture` is a full-canvas rectangle. It carries a `grain` effect, and
  the layer is partly transparent, so only the grain survives on the paper
  colour. The effect uses a fixed seed, so the texture is the same on every
  export.

Every text layer keeps its exact line breaks. The headline, the description,
the poster headline, the poster copy, the note, and the footer each read their
text from one stored string.

The four groups were created with the `group` operation over the HTTP API,
because the command line has no group command. Each group has a name.

## Export it

The example uses four font families. This repository holds Latin subsets of
them in `../fonts/`: Montserrat 800, Inter 400, JetBrains Mono 400, and
Caveat 700. Export with `--font-dir` so the export does not read the system
font list or the workspace font store.

```sh
assemblash export ./examples/readme-hero --out hero.png --scale 1 --font-dir ./examples/fonts
```

The README image is the `--scale 1` export, 2048 by 1152 pixels. The export
prints its `sha256:` digest and no warnings. Two exports of this project print
the same digest:

```text
sha256:ad6a85a1fadfd1ea8570f1d55aede16760a902d5f8de4f0d131d0d747d161399
```

The committed project holds the document and its history. The font families
and the rendered output stay outside the project.
