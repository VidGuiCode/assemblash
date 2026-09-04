# Test fonts

Subsets of Noto fonts, used as fixtures so that rendering tests depend only on
files in this repository — never on a font installed on the machine running
them. Determinism (NFR-1) is meaningless if the font can vary.

| File | Upstream | Covers |
| ---- | -------- | ------ |
| `NotoSans-Subset.ttf` | [notofonts/latin-greek-cyrillic](https://github.com/notofonts/notofonts.github.io), `NotoSans-Regular.ttf` | ASCII plus combining diacritics |
| `NotoSansArabic-Subset.ttf` | [notofonts/arabic](https://github.com/notofonts/notofonts.github.io), `NotoSansArabic-Regular.ttf` | the Arabic sample strings |
| `NotoSansJP-Subset.ttf` | [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosansjp), `NotoSansJP[wght].ttf` instanced at `wght=400` | the Japanese sample strings |
| `NotoSans-Subset.woff` | `NotoSans-Subset.ttf`, re-flavoured | WOFF import |
| `NotoSans-Subset.woff2` | `NotoSans-Subset.ttf`, re-flavoured | WOFF2 import |
| `TwoFamilyNames-Subset.ttf` | `NotoSans-Subset.ttf`, renamed with a second family record | a font that names its family in two languages |

Each file is a subset of the upstream release covering only the characters the
tests use — 67 KB in total instead of about 10 MB. Layout features are kept
(`--layout-features='*'`), so shaping behaviour such as Arabic joining is
preserved.

The two web-font files are the same subset in a compressed container. They
exist so the store's import path can be tested on real WOFF and WOFF2 bytes;
`font_files_in` ignores those extensions, so no rendering test picks them up.

`TwoFamilyNames-Subset.ttf` is the Latin subset with its naming records
rewritten to "Assemblash Two Names" and a second family record added under the
Japanese language id — one face, two Unicode family names, which is ordinary in
a shipped font and is what the font store's import path has to collapse into a
single index record. No font already here has more than one such record, and
the system fonts that do cannot be used on the Linux and macOS halves of the
test matrix.

## Licence

The Noto fonts are licensed under the SIL Open Font License 1.1, included here
as `OFL.txt`. The upstream copyright notices carry no Reserved Font Name, so
these subsets keep the original family names.

`TwoFamilyNames-Subset.ttf` is the one exception: it is a modified version of
the same OFL-licensed Noto Sans subset, and a modified version must not claim
to be the original, so it is renamed. It remains under the OFL, and its
copyright record still names the Noto Project Authors.

## Rebuilding

`subset.py` regenerates the subsets. It expects the upstream files in the
working directory:

```sh
python subset.py
```
