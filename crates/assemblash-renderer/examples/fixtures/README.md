# Italic font fixture

The styled runs example uses this fixture for exact italic face checks.
The existing renderer goldens do not load this fixture.

Source: [Noto Sans Italic](https://raw.githubusercontent.com/notofonts/notofonts.github.io/92d2ea744479d3379927f1fb5f8b0945dd0349b7/fonts/NotoSans/hinted/ttf/NotoSans-Italic.ttf).
The upstream revision is `92d2ea744479d3379927f1fb5f8b0945dd0349b7`.
The source SHA256 is `467e3f89eeca4108bb8710a2b9e0cf2281ac56d5b0609211a83776d0505eecb5`.
The subset SHA256 is `3bcfdb3bb99c765becb3bbe930b75cdf52ddf5c8a2ffc620f4ea061b7a298323`.
The subset contains ASCII, selected Latin accents, and five combining marks.
It retains the shaping features and glyph names.

Use fontTools 4.61.1 to reproduce the fixture:

```text
python subset_italic.py NotoSans-Italic.ttf NotoSans-Italic-Subset.ttf
```

The script checks both hashes. It preserves the source font timestamp.
The font uses [SIL Open Font License 1.1](NotoSans-Italic-OFL.txt).
