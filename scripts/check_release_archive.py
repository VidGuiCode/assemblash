"""Download and verify a release archive, then smoke-test its executable."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tarfile
import tempfile
import zipfile


def supports_styled_runs(tag: str) -> bool:
    match = re.fullmatch(r"v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?", tag)
    if not match:
        raise ValueError(f"invalid release version: {tag}")
    return tuple(map(int, match.groups())) >= (1, 12, 0)


def check_styled_runs(binary: Path, workspace: Path) -> dict:
    completed = subprocess.run(
        [sys.executable, str(Path(__file__).with_name("styled_runs_smoke.py")),
         "--binary", str(binary), "--workspace", str(workspace)],
        capture_output=True, text=True, encoding="utf-8", check=False, timeout=240,
    )
    if completed.returncode:
        raise RuntimeError(f"styled-run archive check failed: {completed.stdout.strip()} {completed.stderr.strip()}")
    result = json.loads(completed.stdout)
    if result.get("ok") is not True or result.get("executed") is not True:
        raise RuntimeError(f"styled-run archive check did not execute: {result!r}")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tag", required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--canvas", action="store_true", help="Also verify canvas editing (1.4.0 and newer)")
    parser.add_argument("--paint", action="store_true", help="Also verify paints and canvas images (1.11.0 and newer)")
    parser.add_argument("--styled-runs", action="store_true", help="Force styled-run checks. Tags 1.12.0 and newer run them automatically.")
    parser.add_argument(
        "--no-terminal",
        action="store_true",
        help="Also verify font import, SVG-text refusal and stale-lock reclaim (1.5.0 and newer)",
    )
    args = parser.parse_args()
    extension = "zip" if args.target.startswith("windows-") else "tar.gz"
    name = f"assemblash-{args.tag}-{args.target}"
    archive_name = f"{name}.{extension}"
    with tempfile.TemporaryDirectory(prefix="assemblash-release-check-") as scratch:
        root = Path(scratch)
        subprocess.run(
            ["gh", "release", "download", args.tag, "--repo", args.repo,
             "--pattern", archive_name, "--pattern", "SHA256SUMS", "--dir", str(root)],
            check=True, timeout=180,
        )
        checksums = {}
        for line in (root / "SHA256SUMS").read_text(encoding="utf-8").splitlines():
            digest, filename = line.split(maxsplit=1)
            checksums[filename.lstrip("*")] = digest
        archive = root / archive_name
        with archive.open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        if checksums.get(archive_name) != digest:
            raise RuntimeError(f"checksum mismatch for {archive_name}")
        extracted = root / "extracted"
        extracted.mkdir()
        if extension == "zip":
            with zipfile.ZipFile(archive) as bundle:
                for member in bundle.infolist():
                    if not (extracted / member.filename).resolve().is_relative_to(extracted.resolve()):
                        raise RuntimeError("archive member escapes extraction directory")
                bundle.extractall(extracted)
        else:
            with tarfile.open(archive) as bundle:
                bundle.extractall(extracted, filter="data")
        binary = extracted / name / ("assemblash.exe" if extension == "zip" else "assemblash")
        print(f"Verified {archive_name}: {digest}", flush=True)
        subprocess.run(
            [sys.executable, str(Path(__file__).with_name("release_smoke.py")),
             "--binary", str(binary), "--workspace", str(root / "workspace"),
             "--expected-version", args.tag.removeprefix("v")],
            check=True, timeout=240,
        )
        if args.canvas:
            subprocess.run(
                [sys.executable, str(Path(__file__).with_name("canvas_smoke.py")),
                 "--binary", str(binary), "--workspace", str(root / "canvas-workspace"),
                 "--font", str(Path(__file__).resolve().parents[1] / "crates" /
                               "assemblash-renderer" / "tests" / "fonts" / "NotoSans-Subset.ttf")],
                check=True, timeout=240,
            )
        if args.no_terminal:
            subprocess.run(
                [sys.executable, str(Path(__file__).with_name("no_terminal_smoke.py")),
                 "--binary", str(binary), "--workspace", str(root / "no-terminal-workspace")],
                check=True, timeout=240,
            )
        if args.paint:
            subprocess.run(
                [sys.executable, str(Path(__file__).with_name("paint_smoke.py")),
                 "--binary", str(binary), "--workspace", str(root / "paint-workspace")],
                check=True, timeout=240,
            )
        styled = {"executed": False, "reason": "release predates 1.12.0"}
        if args.styled_runs or supports_styled_runs(args.tag):
            styled = check_styled_runs(binary, root / "styled-runs-workspace")
        print(json.dumps({"ok": True, "archive": archive_name, "sha256": digest,
            "checks": {"release": True, "canvas": args.canvas, "paint": args.paint,
                       "noTerminal": args.no_terminal, "styledRuns": styled}}, separators=(",", ":")))


if __name__ == "__main__":
    main()
