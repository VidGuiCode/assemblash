# README capability sheet example

This example is the editable Assemblash project behind `assets/capabilities.png`
in the main README. The build uses release 1.13.0.

The document is 1500 x 1125 pixels. It holds a header, six tiles, and a footer.
Each tile is a real render of this one document. The PNG export is 3000 x 2250
pixels.

## Tile families

| Tile | Family | Caption | Demonstration |
| --- | --- | --- | --- |
| 01 | TYPE | `RUNS · JUSTIFY · SPACING` | A justified paragraph with one bold red run. |
| 02 | SHAPE | `SHAPES · PATHS · MARKERS` | A rounded outline, a red circle, a closed path, and a dashed line with an arrow marker. |
| 03 | PAINT | `GRADIENTS · BLEND MODES` | A linear gradient bar, a radial gradient disc, and two circles that use a blend mode. |
| 04 | EFFECT | `BLUR · SHADOW · GRAIN · HUE` | Four squares with blur, drop shadow, grain, and hue rotate. |
| 05 | MASK | `CLIP · CROP · FLIP` | A rounded image card with a crop, and an ellipse-clipped copy that is flipped. |
| 06 | STRUCTURE | `GROUPS · LOCKS · HISTORY` | A layer tree with one selected row, one locked row, and dimmed HISTORY and ASSETS rows. |

## Layers and history

The project has 61 top-level layers. Each tile has a white surface, a mono
label, a mono caption, and its demonstration layers.

The six tiles are not groups. The STRUCTURE tile draws its tree with vector
shapes and text. One text layer is locked to match the locked row.

The journal holds 70 operations. Run
`assemblash history ./examples/readme-capabilities`. Undo and redo restore the
document. The redone project exports the same digest.

## The image in tile 05

The two image layers in tile 05 draw one imported PNG. The file is
`assets/e7cb498c4d6317e4343eec9e562e2bd3c83252186093bbd4a2fd4fc3fc032444.png`.

That PNG is not a photograph. A small Assemblash composition produced it with
the same palette. The source project stays outside this example.

## Type

The title uses Montserrat 800 at 54 pixels. Body text uses Inter 400 at
21 pixels. Tile labels and captions use JetBrains Mono 400 at 20 pixels. The
layer tree rows use 16 pixels. The footer and the small counts use 14 pixels.

The export loads the font files from `examples/fonts`. The project does not
contain font files.

## Export

Run this command from the repository root:

```sh
assemblash export ./examples/readme-capabilities \
  --out assets/capabilities.png \
  --scale 2 \
  --font-dir ./examples/fonts
```

The command uses `--scale 2`. It prints the output path and a digest.
Two exports print the same digest:

    sha256:85975f8302f2747cbabb03b098b018b569bde1b112b83e78fbb7d36b2ab4dbaf

The export writes no warnings.
