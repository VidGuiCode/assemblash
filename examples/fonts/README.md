# Example fonts

These files are Latin subsets of four open-licence font families. They let the
example projects in this directory export offline and with the same pixels on
every computer.

| File | Family | Weight | Licence |
| --- | --- | --- | --- |
| `Montserrat-ExtraBold.ttf` | Montserrat | 800 | SIL Open Font License 1.1 |
| `Inter-Regular.ttf` | Inter | 400 | SIL Open Font License 1.1 |
| `JetBrainsMono-Regular.ttf` | JetBrains Mono | 400 | SIL Open Font License 1.1 |
| `Caveat-Bold.ttf` | Caveat | 700 | SIL Open Font License 1.1 |

Each subset keeps only the Latin letters, common punctuation, quotes, and arrow
glyphs that the examples use. Each licence file is next to its font file. The
families are published on Google Fonts.

The examples load this directory with `--font-dir`. They never read the system
font list or the workspace font store. To use the full families, install them
in the Assemblash font store.
