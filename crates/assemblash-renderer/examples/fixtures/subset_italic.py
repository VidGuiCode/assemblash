"""Create the italic fixture from the pinned Noto Sans source file."""

import hashlib
from pathlib import Path
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

SOURCE_SHA256 = '467e3f89eeca4108bb8710a2b9e0cf2281ac56d5b0609211a83776d0505eecb5'
SUBSET_SHA256 = '3bcfdb3bb99c765becb3bbe930b75cdf52ddf5c8a2ffc620f4ea061b7a298323'


def main():
    source, destination = map(Path, sys.argv[1:])
    if hashlib.sha256(source.read_bytes()).hexdigest() != SOURCE_SHA256:
        raise ValueError('source font hash differs')
    font = TTFont(source, recalcTimestamp=False)
    text = ''.join(chr(code) for code in range(0x20, 0x7f))
    text += 'áéíóúàèäöüñçÁÉÍ\u0301\u0308\u0327\u0304\u0323'
    options = subset.Options()
    options.layout_features = ['*']
    options.glyph_names = True
    options.notdef_outline = True
    options.recalc_bounds = True
    options.recalc_timestamp = False
    processor = subset.Subsetter(options=options)
    processor.populate(text=text)
    processor.subset(font)
    font.save(destination)
    if hashlib.sha256(destination.read_bytes()).hexdigest() != SUBSET_SHA256:
        raise ValueError('subset font hash differs')
    print('PASS: the fixture matches the pinned subset hash.')


if __name__ == '__main__':
    main()
