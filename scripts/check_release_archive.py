"""Download and verify a release archive, then smoke-test its executable."""

import argparse
import hashlib
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tag", required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--repo", required=True)
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


if __name__ == "__main__":
    main()
