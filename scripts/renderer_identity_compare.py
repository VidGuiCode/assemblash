"""Compare SVG, RGBA and PNG hashes from all six supported targets."""

import argparse
import json
import re
from pathlib import Path

TARGETS = {
    "linux-x86_64", "linux-aarch64", "windows-x86_64", "windows-aarch64",
    "macos-x86_64", "macos-aarch64",
}
ROOT = Path(__file__).resolve().parents[1]


def compare(directory: Path, prefix: str = "renderer-") -> None:
    reports = sorted(directory.glob("*/hashes.json"))
    if {report.parent.name for report in reports} != {f"{prefix}{target}" for target in TARGETS}:
        raise ValueError("Require exactly one renderer report from each of the six supported targets.")
    goldens = json.loads((ROOT / "crates/assemblash-renderer/tests/gate/goldens.json").read_text())
    reference = None
    for report in reports:
        result = json.loads(report.read_text(encoding="utf-8"))
        if result.get("schemaVersion") != 1 or result.get("rendererVersion") != "gate":
            raise ValueError(f"{report.parent.name}: unexpected report metadata")
        hashes = result.get("hashes", {})
        if hashes.keys() != goldens.keys():
            missing = sorted(goldens.keys() - hashes.keys())
            extra = sorted(hashes.keys() - goldens.keys())
            raise ValueError(f"{report.parent.name}: missing={missing}, extra={extra}")
        if not all(isinstance(value, str) and re.fullmatch(r"sha256:[0-9a-f]{64}", value) for value in hashes.values()):
            raise ValueError(f"{report.parent.name}: invalid SHA-256 hash")
        for key, expected in goldens.items():
            if hashes[key] != expected:
                raise ValueError(f"{report.parent.name}: {key}: expected {expected}, got {hashes[key]}")
        if reference is None:
            reference = report.read_bytes()
        elif report.read_bytes() != reference:
            raise ValueError(f"{report.parent.name}: complete report bytes differ")
        print(f"{report.parent.name}: {len(hashes)} hashes match")
    print("PASS: all six targets have identical SVG, RGBA and PNG reports.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--prefix", default="renderer-")
    args = parser.parse_args()
    try:
        compare(args.directory, args.prefix)
    except (ValueError, OSError, json.JSONDecodeError) as error:
        print(f"FAIL: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
