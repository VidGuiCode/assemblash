# Optical-size test font

`AssemblashOpticalProbe.ttf` is a modified version of `NotoSans-Subset.ttf`.
The font retains the Noto Project Authors copyright records.
The SIL Open Font License 1.1 in `OFL.txt` applies to this font.
The modified family name is `Assemblash Optical Probe`.

The `opsz` axis extends from 8 to 72.
The default value is 8.
At 72, horizontal contours and advances are 30 percent wider.
This controlled change tests optical-size shaping, metrics, and outlines.

Install `fonttools==4.61.1` to rebuild the fixture.
Run `python optical_probe.py` from this directory.
The generator uses the local subset and fixed font timestamps.
The generator does not download files or read system fonts.
