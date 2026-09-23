#!/usr/bin/env python3
"""Build local SVG specimens from the pinned optional font files."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
FONT_MANIFEST = ROOT / "crates/assemblash-renderer/fonts/manifest.json"
OUTPUT = ROOT / "ui/src/catalogue-specimens"
FAMILIES = {
    "Inter",
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Lora",
    "Playfair Display",
    "JetBrains Mono",
}
SAMPLE = "Aa Bb 0123"
WIDTH = 420
HEIGHT = 70


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def fetch(url: str) -> bytes:
    url = urllib.parse.quote(url, safe=":/[]")
    request = urllib.request.Request(url, headers={"User-Agent": "Assemblash-font-specimen-builder/1"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def svg_specimen(font_bytes: bytes) -> bytes:
    font = TTFont(__import__("io").BytesIO(font_bytes), recalcBBoxes=False, recalcTimestamp=False)
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    metrics = font["hmtx"].metrics
    units = font["head"].unitsPerEm
    advances = sum(metrics[cmap[ord(char)]][0] for char in SAMPLE)
    scale = min(38.0 / units, (WIDTH - 24.0) / advances)
    x = 12 / scale
    paths: list[str] = []
    for char in SAMPLE:
        glyph_name = cmap.get(ord(char))
        if glyph_name is None:
            raise ValueError(f"Pinned font does not contain {char!r}")
        if char != " ":
            pen = SVGPathPen(glyph_set)
            glyph_set[glyph_name].draw(pen)
            path = pen.getCommands()
            if path:
                paths.append(f'<path transform="translate({x} 0)" d="{path}"/>')
        x += metrics[glyph_name][0]
    # Paths use font units. Flip the font Y axis and put the baseline at 51 px.
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" '
        f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label="{SAMPLE}">'
        f'<g fill="#25231f" transform="translate(0 51) scale({scale:.10g} -{scale:.10g})">'
        + "".join(paths)
        + "</g></svg>\n"
    )
    return svg.encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch", action="store_true", help="Fetch missing pinned font and license files.")
    parser.add_argument("--cache-dir", type=Path, required=True, help="Directory for source files.")
    args = parser.parse_args()
    manifest = json.loads(FONT_MANIFEST.read_text(encoding="utf-8"))
    selected = [entry for entry in manifest["families"] if entry["name"] in FAMILIES]
    if {entry["name"] for entry in selected} != FAMILIES:
        raise SystemExit("The font manifest must pin all seven catalogue specimen families.")

    args.cache_dir.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records: dict[str, dict[str, object]] = {}
    for entry in selected:
        name = entry["name"]
        key = slug(name)
        font_path = args.cache_dir / f"{key}.ttf"
        source_hash = entry["sha256"].removeprefix("sha256:")
        if not font_path.exists() and args.fetch:
            url = f'{entry.get("urlPrefix", manifest["urlPrefix"])}{entry.get("commit", manifest["commit"])}/{entry["path"]}'
            font_path.write_bytes(fetch(url))
        if not font_path.exists():
            raise SystemExit(f"Missing {font_path}. Pass --fetch or place the pinned font in the cache.")
        font_bytes = font_path.read_bytes()
        if sha256(font_bytes) != source_hash:
            raise SystemExit(f"Source hash mismatch for {name}: expected {source_hash}.")

        license_path = args.cache_dir / f"{key}-OFL.txt"
        if not license_path.exists() and args.fetch:
            license_path.write_bytes(fetch(f'{manifest["urlPrefix"]}{manifest["commit"]}/ofl/{entry["path"].split("/")[1]}/OFL.txt'))
        if not license_path.exists():
            raise SystemExit(f"Missing OFL license for {name}: {license_path}.")
        license_text = license_path.read_text(encoding="utf-8")
        if "SIL OPEN FONT LICENSE" not in license_text.upper() or "Version 1.1" not in license_text:
            raise SystemExit(f"Unsupported license text for {name}.")
        license_target = OUTPUT / "licenses" / f"{key}-OFL.txt"
        license_target.parent.mkdir(parents=True, exist_ok=True)
        license_target.write_bytes(license_path.read_bytes())

        asset = svg_specimen(font_bytes)
        asset_path = OUTPUT / f"{key}.svg"
        asset_path.write_bytes(asset)
        records[name] = {
            "src": f"./{key}.svg",
            "sourceSha256": source_hash,
            "assetSha256": sha256(asset),
            "face": {"weight": 400, "style": "normal"},
            "sample": SAMPLE,
            "license": entry["license"],
            "licenseFile": f"./licenses/{key}-OFL.txt",
        }

    (OUTPUT / "manifest.json").write_text(json.dumps({"version": 1, "families": records}, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(records)} catalogue specimens in {OUTPUT}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, urllib.error.URLError, ValueError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
