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
    font.save(path)


def reflavour():
    """Writes the WOFF and WOFF2 copies the font-store import tests read."""
    for flavor in ("woff", "woff2"):
        font = TTFont("NotoSans-Subset.ttf")
        font.flavor = flavor
        destination = f"NotoSans-Subset.{flavor}"
        font.save(destination)
        print("wrote", destination)


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


if __name__ == "__main__":
    main()
