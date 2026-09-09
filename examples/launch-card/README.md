# Launch card example

This is the editable Assemblash project behind the 1.2 launch card that the
main README showed before 1.6.0. It is kept as an example of artwork built from
imported SVG assets, and of a project whose operation history travels with it.

The composition contains separate layers for:

- the background and geometric artwork;
- the Assemblash mark;
- the edition label, headline, and description;
- four capability labels; and
- the compatibility footer.

Its operation history is included, so the same project also demonstrates how
scripted changes remain inspectable and undoable.

## Inspect and export it

The example uses Noto Sans. Install the manifest-pinned font once into a local
store, then export the project:

```sh
assemblash font install "Noto Sans" --font-store ./assemblash-fonts
assemblash show ./examples/launch-card
assemblash export ./examples/launch-card --out launch-card.png --font-store ./assemblash-fonts
```

The committed project contains only the document, its sanitized SVG assets,
and its history. Font files and rendered output stay outside the project.
