"""Compare the spike hash tables from all targets and variants.

Usage: python compare.py DIR
DIR holds one folder for each target and variant, as uploaded by the workflow.
Print one line for each (input, encoder, setting): the number of distinct
sha256 values over all folders, then the short hash for each folder.
"""

import csv
import sys
from collections import OrderedDict
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1])
    tables = OrderedDict()
    runs_equal = {}
    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        label = folder.name.removeprefix("jpeg-webp-")
        run1 = (folder / "run1.csv").read_text()
        run2 = (folder / "run2.csv").read_text()
        runs_equal[label] = run1 == run2
        rows = {}
        for row in csv.DictReader(run1.splitlines()):
            key = (row["input"], row["encoder"], row["setting"])
            rows[key] = (row["sha256"], row["second_run_equal"], row["bytes"])
        tables[label] = rows

    labels = list(tables)
    print("folders:", ", ".join(labels))
    print("two process runs equal:", runs_equal)
    keys = list(next(iter(tables.values())).keys()) if tables else []
    divergent = 0
    print("input,encoder,setting,distinct," + ",".join(labels))
    for key in keys:
        cells = [tables[label].get(key, ("missing", "", ""))[0] for label in labels]
        in_process = all(tables[label].get(key, ("", "true", ""))[1] == "true" for label in labels)
        distinct = len(set(cells))
        if distinct > 1:
            divergent += 1
        print(",".join(key) + f",{distinct}{'' if in_process else '!'}," + ",".join(c[:12] for c in cells))
    print(f"rows with more than one hash: {divergent} of {len(keys)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
