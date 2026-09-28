"""Compare the gradient spike hash tables across the six CI targets.

Usage: python scripts/gradient_spike_compare.py HASHES_DIR

HASHES_DIR holds one directory per target, each with a `hashes.csv`. The run
passes only when every table is byte-equal. The first mismatch prints the two
offending lines and exits 1.
"""

import sys
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
