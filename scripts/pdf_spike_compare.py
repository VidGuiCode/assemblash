"""Compare the PDF spike hash tables from all six targets.

Usage: python scripts/pdf_spike_compare.py RESULTS_DIR
"""

import csv
import pathlib
import sys


def main() -> int:
    root = pathlib.Path(sys.argv[1])
    tables = {}
    for target_dir in sorted(root.iterdir()):
        hashes = target_dir / "hashes.csv"
        if not hashes.exists():
            print(f"{target_dir.name}: no hashes.csv")
            continue
        target = (target_dir / "target.txt").read_text().strip()
        with hashes.open() as f:
            tables[target] = {(r["route"], r["set"]): r for r in csv.DictReader(f)}
        print(f"--- {target}: two separate process runs")
        print((target_dir / "two-process-runs.txt").read_text())
        print(f"--- {target}: notes")
        print((target_dir / "notes.csv").read_text())

    targets = sorted(tables)
    keys = sorted({k for t in tables.values() for k in t})
    status = 0
    print("route,set," + ",".join(targets) + ",same_on_all")
    for key in keys:
        shas = [tables[t].get(key, {}).get("sha256", "missing") for t in targets]
        same = len(set(shas)) == 1 and len(targets) == 6
        status |= 0 if same else 1
        print(f"{key[0]},{key[1]}," + ",".join(s[:16] for s in shas) + f",{same}")
    print()
    print("route,set,target,in_process_runs_identical,bytes,min_total_ms,min_render_ms,min_pdf_ms")
    for key in keys:
        for t in targets:
            r = tables[t].get(key)
            if r:
                print(f"{key[0]},{key[1]},{t},{r['identical']},{r['bytes']},{r['min_total_ms']},{r['min_render_ms']},{r['min_pdf_ms']}")
    print()
    print("full sha256:")
    for key in keys:
        for t in targets:
            r = tables[t].get(key)
            if r:
                print(f"{key[0]},{key[1]},{t},{r['sha256']}")
    return status


if __name__ == "__main__":
    sys.exit(main())
