# Charts, tables and QR codes example

This folder holds the input for four generated layers: a chart spec, two CSV
files and a QR spec. The commands below make one project from them. Each
command makes an SVG asset and an `svg` layer, and records the spec on the
layer.

- `sales.json` is a column chart spec with two series and value labels.
- `sales.csv` is the same data as CSV. The first row names the series.
- `team.csv` is a table. The first row is the header.
- `qr.json` is a QR code spec.

The labels use Inter from `../fonts/`. Give `--font-dir` so that the command
does not read the workspace font store.

## Make the project

Run these commands from the repository root:

```sh
assemblash new report --width 1400 --height 1000 --background "#ffffff"
assemblash add-chart report --spec examples/charts/sales.json --x 40 --y 40 --font-dir examples/fonts
assemblash add-table report --csv examples/charts/team.csv --font-family Inter --x 760 --y 40 --font-dir examples/fonts
assemblash add-qr report --spec examples/charts/qr.json --x 1100 --y 700
assemblash add-chart report --csv examples/charts/sales.csv --type donut --title "Share" --font-family Inter --x 40 --y 580 --width 500 --height 380 --font-dir examples/fonts
```

Each command prints the layer id and the sha256 of the new asset, with a tab
between them.

## Change a chart

Use the layer id that `add-chart` printed. This command draws the same data
as a line chart. One undo restores the column chart.

```sh
assemblash regenerate report <layer> --type line --font-dir examples/fonts
```

## Export

```sh
assemblash export report --out report.png --font-dir examples/fonts
```
