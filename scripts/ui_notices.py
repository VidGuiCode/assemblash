"""Generate notices for locked runtime UI packages and the embedded icon font."""

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / "ui"
OUTPUT = ROOT / "THIRD_PARTY_LICENSES.md"
FALLBACKS = {
    # The npm archive omits LICENSE. Preserve the upstream notice verbatim.
    # https://github.com/theKashey/react-remove-scroll-bar/blob/master/LICENSE
    # Git blob: 7c08c3990396ecefd90f99ff5d9a34f26f5b5616.
    ("react-remove-scroll-bar", "2.3.8"): "react-remove-scroll-bar-2.3.8.txt",
}


def render() -> str:
    lock = json.loads((UI / "package-lock.json").read_text(encoding="utf-8"))
    parts = [
        "# Third-party licences included in release archives\n\n",
        "These notices cover the locked runtime dependency graph and the Phosphor icon font.\n",
        "This file preserves each licence notice.\n",
        "Run `python scripts/ui_notices.py` after `npm ci` to update this file.\n",
    ]
    for path, package in sorted(lock["packages"].items()):
        if not path or (package.get("dev") and path != "node_modules/@phosphor-icons/web"):
            continue
        name = path.rsplit("node_modules/", 1)[1]
        version = package["version"]
        licence = package.get("license")
        if licence not in {"MIT", "0BSD", "(MIT OR CC0-1.0)"}:
            raise ValueError(f"Review the UI licence: {name} {version}: {licence}")
        directory = UI / path
        candidates = [directory / file for file in ("LICENSE", "license", "LICENSE.txt", "license-mit")]
        source = next((file for file in candidates if file.is_file()), None)
        if source is None and (name, version) in FALLBACKS:
            source = UI / "licenses" / FALLBACKS[(name, version)]
        if source is None or not source.is_file():
            raise ValueError(f"Missing UI licence notice: {name} {version}")
        notice = source.read_text(encoding="utf-8").replace("\r\n", "\n").rstrip()
        parts.extend([f"\n## {name} {version}\n\n", notice, "\n"])
    return "".join(parts)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = render()
    if args.check:
        if OUTPUT.read_text(encoding="utf-8") != result:
            print("UI notices are out of date. Run python scripts/ui_notices.py.")
            return 1
        print("UI licence notices match the package lock.")
    else:
        OUTPUT.write_text(result, encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
