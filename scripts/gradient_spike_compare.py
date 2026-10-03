"""Compare the gradient spike hash tables across the six CI targets.

Usage: python scripts/gradient_spike_compare.py HASHES_DIR

HASHES_DIR holds one directory per target, each with a `hashes.csv`. The run
passes only when every table is byte-equal. The first mismatch prints the two
offending lines and exits 1.
"""

import sys
import csv
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "hashes")
    tables = sorted(root.glob("*/hashes.csv"))
    if not tables:
        print(f"no hashes.csv found under {root}")
        return 1
    if len(tables) != 6:
        print(f"expected 6 target tables, found {len(tables)}:")
        for table in tables:
            print(f"  {table.parent.name}")
        return 1

    expected_targets = {
        "grad-spike-linux-x86_64", "grad-spike-linux-aarch64",
        "grad-spike-windows-x86_64", "grad-spike-windows-aarch64",
        "grad-spike-macos-x86_64", "grad-spike-macos-aarch64",
    }
    if {table.parent.name for table in tables} != expected_targets:
        print("FAIL: the six required target names are not present")
        return 1
    expected_rows = {
        (document, scale)
        for document in (
            "gradient_linear", "gradient_radial", "background_image",
            "solid_control", "blank_control",
        )
        for scale in ("1", "2")
    }
    expected_fields = [
        "document", "scale", "fixture_png_sha256", "fixture_rgba_sha256",
        "svg_sha256", "rgba_sha256", "png_sha256", "ink_px",
    ]
    for table in tables:
        with table.open(encoding="utf-8", newline="") as stream:
            reader = csv.DictReader(stream)
            rows = list(reader)
            if reader.fieldnames != expected_fields:
                print(f"FAIL: {table.parent.name} has an invalid table header")
                return 1
        if len(rows) != len(expected_rows) or {(row["document"], row["scale"]) for row in rows} != expected_rows:
            print(f"FAIL: {table.parent.name} does not contain every required document and scale")
            return 1
        for field in expected_fields[2:-1]:
            if any(len(row[field]) != 64 or any(character not in "0123456789abcdef" for character in row[field]) for row in rows):
                print(f"FAIL: {table.parent.name} has an invalid hash in {field}")
                return 1

    reference_name = tables[0].parent.name
    reference = tables[0].read_bytes()
    print(f"reference: {reference_name} ({len(reference)} bytes)")
    passed = True
    for table in tables[1:]:
        name = table.parent.name
        candidate = table.read_bytes()
        if candidate == reference:
            print(f"  {name}: identical")
            continue
        passed = False
        print(f"  {name}: DIFFERS")
        reference_lines = reference.decode().splitlines()
        candidate_lines = candidate.decode().splitlines()
        for want, got in zip(reference_lines, candidate_lines):
            if want != got:
                print(f"    reference ({reference_name}): {want}")
                print(f"    candidate  ({name}): {got}")

    if not passed:
        print("FAIL: at least one target diverged")
        return 1
    print("PASS: all six targets byte-identical")
    return 0


if __name__ == "__main__":
    sys.exit(main())
