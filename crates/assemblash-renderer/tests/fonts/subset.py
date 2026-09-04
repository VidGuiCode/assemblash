"""Rebuilds the font fixtures committed next to this script.

Expects the upstream files in the working directory:

    NotoSans-Regular.ttf            (notofonts.github.io, hinted/ttf)
    NotoSansArabic-Regular.ttf      (notofonts.github.io, hinted/ttf)
    NotoSansJP[wght].ttf            (google/fonts, ofl/notosansjp)

The Japanese font ships as a variable font whose default instance is Thin, so
it is first instanced at wght=400 and its name table is rewritten to the plain
family name — otherwise a document would have to ask for "Noto Sans JP Thin".
"""

import subprocess
import sys

from fontTools.ttLib import TTFont

LATIN = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "áéíóúàèäöüñçÁÉÍ"
    + "̧̣́̈̄"
)
ARABIC = "مرحبا بالعالم السلام عليكم "
JAPANESE = "こんにちは世界日本語組版テスト "

JOBS = [
    ("NotoSans-Regular.ttf", "NotoSans-Subset.ttf", LATIN, None),
    ("NotoSansArabic-Regular.ttf", "NotoSansArabic-Subset.ttf", ARABIC, None),
    ("NotoSansJP-Regular.ttf", "NotoSansJP-Subset.ttf", JAPANESE, "Noto Sans JP"),
]


def instance_japanese():
    subprocess.run(
        [
            sys.executable,
            "-m",
            "fontTools.varLib.instancer",
            "NotoSansJP[wght].ttf",
            "wght=400",
            "-o",
            "NotoSansJP-Regular.ttf",
        ],
        check=True,
    )


def rename(path, family):
    font = TTFont(path)
    rename_records(font, family)
    font.save(path)


def reflavour():
    """Writes the WOFF and WOFF2 copies the font-store import tests read."""
    for flavor in ("woff", "woff2"):
        font = TTFont("NotoSans-Subset.ttf")
        font.flavor = flavor
        destination = f"NotoSans-Subset.{flavor}"
        font.save(destination)
        print("wrote", destination)


def two_names():
    """Writes the fixture that carries two Unicode family-name records.

    A real font often names its family once per language, and the store used
    to write one index line for each of those records — one file arriving as
    several families. Reproducing that needs a font with more than one name
    record, and every other fixture here has exactly one, so this builds the
    case deliberately: the same subset renamed, plus a Japanese-language
    family record naming the same family in Japanese.

    Derived from the committed `NotoSans-Subset.ttf`, so it needs no upstream
    download and can be rebuilt from this repository alone.
    """
    family = "Assemblash Two Names"
    japanese_family = "アセンブラッシュ二名"
    font = TTFont("NotoSans-Subset.ttf")
    rename_records(font, family)
    # Windows platform, Unicode BMP, Japanese — a second family record the
    # name table is perfectly entitled to carry.
    font["name"].setName(japanese_family, 1, 3, 1, 0x0411)
    destination = "TwoFamilyNames-Subset.ttf"
    font.save(destination)
    print("wrote", destination)


def rename_records(font, family):
    """Rewrites the basic naming records of an open font in place."""
    full = f"{family} Regular"
    postscript = family.replace(" ", "") + "-Regular"
    for record in font["name"].names:
        if record.nameID == 1:
            record.string = family
        elif record.nameID == 2:
            record.string = "Regular"
        elif record.nameID == 4:
            record.string = full
        elif record.nameID == 6:
            record.string = postscript
    # Typographic family/subfamily would otherwise keep the variable font's
    # naming and win over the basic records.
    font["name"].names = [n for n in font["name"].names if n.nameID not in (16, 17)]


def main():
    instance_japanese()
    for source, destination, text, family in JOBS:
        subprocess.run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                source,
                "--text=" + text,
                "--layout-features=*",
                "--glyph-names",
                "--notdef-outline",
                "--recalc-bounds",
                "--output-file=" + destination,
            ],
            check=True,
        )
        if family:
            rename(destination, family)
        print("wrote", destination)
    reflavour()
    two_names()


if __name__ == "__main__":
    main()
