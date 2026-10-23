"""Build the OFL optical-size fixture from the local Noto Sans subset.

Requires fontTools 4.61.1. Run this file from any directory.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from fontTools.ttLib import TTFont
from fontTools.designspaceLib import DesignSpaceDocument, AxisDescriptor, SourceDescriptor
from fontTools.varLib import build

HERE = Path(__file__).resolve().parent
TIMESTAMP = 3406620153

with TemporaryDirectory() as temporary:
    output = Path(temporary)
    for name, scale in [('small', 1.0), ('large', 1.3)]:
        font = TTFont(HERE / 'NotoSans-Subset.ttf', recalcTimestamp=False)
        font['head'].created = font['head'].modified = TIMESTAMP
        for record in font['name'].names:
            if record.nameID in (1, 16):
                record.string = 'Assemblash Optical Probe'.encode(record.getEncoding())
            elif record.nameID in (4, 6):
                record.string = 'AssemblashOpticalProbe-Regular'.encode(record.getEncoding())
        for glyph in font['glyf'].glyphs.values():
            glyph.expand(font['glyf'])
            if glyph.numberOfContours > 0:
                for index, (x, y) in enumerate(glyph.coordinates):
                    glyph.coordinates[index] = (round(x * scale), y)
        font['hmtx'].metrics = {glyph: (round(width * scale), round(bearing * scale))
                                for glyph, (width, bearing) in font['hmtx'].metrics.items()}
        font.save(output / f'{name}.ttf')
    design = DesignSpaceDocument()
    axis = AxisDescriptor()
    axis.name, axis.tag = 'Optical Size', 'opsz'
    axis.minimum = axis.default = 8
    axis.maximum = 72
    design.addAxis(axis)
    for name, location in [('small', 8), ('large', 72)]:
        master = SourceDescriptor()
        master.path, master.name = str(output / f'{name}.ttf'), name
        master.familyName, master.styleName = 'Assemblash Optical Probe', 'Regular'
        master.location = {'Optical Size': location}
        if name == 'small':
            master.copyInfo = master.copyLib = master.copyFeatures = True
        design.addSource(master)
    font, _, _ = build(design)
    font.recalcTimestamp = False
    font['head'].created = font['head'].modified = TIMESTAMP
    font.save(HERE / 'AssemblashOpticalProbe.ttf')
