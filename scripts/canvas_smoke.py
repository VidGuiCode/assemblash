#!/usr/bin/env python3
"""Cross-transport updateCanvas smoke for a packaged Assemblash binary.

The workspace must be fresh. The script uses only Python's standard library
and emits one JSON object on stdout.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import zlib
from pathlib import Path

from release_smoke import Mcp, Server, SmokeFailure, json_request, request, run


def png_rgba_corner(data: bytes) -> tuple[int, int, bytes]:
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SmokeFailure("export is not a PNG")
    position = 8
    compressed = bytearray()
    width = height = None
    while position + 12 <= len(data):
        length = int.from_bytes(data[position : position + 4], "big")
        kind = data[position + 4 : position + 8]
        body = data[position + 8 : position + 8 + length]
        position += length + 12
        if kind == b"IHDR":
            width = int.from_bytes(body[0:4], "big")
            height = int.from_bytes(body[4:8], "big")
            if body[8:10] != b"\x08\x06":
                raise SmokeFailure(f"expected 8-bit RGBA PNG, got IHDR {body!r}")
        elif kind == b"IDAT":
            compressed.extend(body)
        elif kind == b"IEND":
            break
    if width is None or height is None:
        raise SmokeFailure("PNG has no IHDR")
    scanlines = zlib.decompress(compressed)
    if len(scanlines) < 5:
        raise SmokeFailure("PNG has no complete first pixel")
    # PNG filters have no left or previous pixel at the top-left corner, so its
    # stored RGBA bytes are already the reconstructed value for every filter.
    return width, height, bytes(scanlines[1:5])


def expect_status(status: int, wanted: int, body: object, action: str) -> None:
    if status != wanted:
        raise SmokeFailure(f"{action} returned {status}, expected {wanted}: {body!r}")


def http_operation(server: Server, operation: object) -> None:
    status, body = json_request(
        server.base,
        "POST",
        "/api/projects/canvas/operations",
        {"operation": operation},
    )
    expect_status(status, 200, body, f"HTTP operation {operation!r}")


def http_export(server: Server, name: str) -> bytes:
    status, body = json_request(
        server.base, "POST", "/api/projects/canvas/export", {"name": name}
    )
    expect_status(status, 200, body, f"HTTP export {name}")
    status, png = request(
        server.base, "GET", f"/api/projects/canvas/exports/{name}.png"
    )
    expect_status(status, 200, png[:200], f"HTTP download {name}")
    return png


def http_undo(server: Server) -> None:
    status, body = json_request(
        server.base, "POST", "/api/projects/canvas/undo", {}
    )
    expect_status(status, 200, body, "HTTP undo")


def mcp_export(mcp: Mcp, project: Path, name: str) -> bytes:
    result = mcp.tool("export_document", {"project": "canvas", "name": name})
    reported = result.get("path") if isinstance(result, dict) else None
    path = project / (reported or f"exports/{name}.png")
    if not path.is_file():
        raise SmokeFailure(f"MCP export is missing: result={result!r}, path={path}")
    return path.read_bytes()


def assert_restored(project: Path, baseline: bytes, transport: str) -> None:
    current = (project / "document.json").read_bytes()
    if current != baseline:
        raise SmokeFailure(f"{transport} undo twice did not restore document.json bytes")


def old_binary_exit_test(binary: Path, project: Path) -> dict[str, object]:
    shown = subprocess.run(
        [str(binary), "show", str(project)],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    history = subprocess.run(
        [str(binary), "history", str(project)],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    history_diagnostic = history.stderr.strip()
    lowered = history_diagnostic.lower()
    if history.returncode == 0 or "corrupt" not in lowered or "line" not in lowered:
        raise SmokeFailure(
            "baseline history did not return a corrupt-journal diagnostic naming its line: "
            f"code={history.returncode}, stderr={history_diagnostic!r}"
        )
    return {
        "show": {
            "exitCode": shown.returncode,
            "stdout": shown.stdout.strip(),
            "stderr": shown.stderr.strip(),
        },
        "history": {
            "exitCode": history.returncode,
            "stderr": history_diagnostic,
            "typedCorruptJournal": True,
        },
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--font", required=True, type=Path)
    parser.add_argument("--baseline-binary", type=Path)
    args = parser.parse_args()

    binary = args.binary.resolve()
    workspace = args.workspace.resolve()
    font = args.font.resolve()
    baseline_binary = args.baseline_binary.resolve() if args.baseline_binary else None
    evidence: dict[str, object] = {
        "binary": str(binary),
        "workspace": str(workspace),
    }
    server = None
    mcp = None
    try:
        for label, path in [("binary", binary), ("font", font)]:
            if not path.is_file():
                raise SmokeFailure(f"{label} does not exist: {path}")
        if baseline_binary and not baseline_binary.is_file():
            raise SmokeFailure(f"baseline binary does not exist: {baseline_binary}")
        if workspace.exists() and any(workspace.iterdir()):
            raise SmokeFailure(f"workspace must be fresh and empty: {workspace}")
        workspace.mkdir(parents=True, exist_ok=True)

        run(binary, "workspace", "--workspace", str(workspace))
        (workspace / "config.toml").write_text("port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n", encoding="utf-8")
        fonts = workspace / "fonts"
        run(
            binary,
            "font",
            "add",
            str(font),
            "--license",
            "OFL-1.1",
            "--font-store",
            str(fonts),
        )
        project = workspace / "projects" / "canvas"
        run(binary, "new", str(project), "--width", "200", "--height", "100")
        run(
            binary,
            "add-text",
            str(project),
            "--text",
            "Canvas",
            "--font",
            "Noto Sans",
            "--size",
            "24",
            "--x",
            "20",
            "--y",
            "20",
            "--width",
            "100",
            "--height",
            "40",
            "--font-store",
            str(fonts),
        )
        baseline = (project / "document.json").read_bytes()

        run(
            binary,
            "canvas",
            "set",
            str(project),
            "--width",
            "400",
            "--height",
            "300",
            "--background",
            "#102030",
            "--anchor",
            "center",
        )
        cli_background_path = workspace / "cli-background.png"
        run(binary, "export", str(project), str(cli_background_path), "--font-store", str(fonts))
        cli_background = cli_background_path.read_bytes()
        run(binary, "canvas", "set", str(project), "--no-background")
        cli_clear_path = workspace / "cli-clear.png"
        run(binary, "export", str(project), str(cli_clear_path), "--font-store", str(fonts))
        cli_clear = cli_clear_path.read_bytes()
        run(binary, "undo", str(project))
        run(binary, "undo", str(project))
        assert_restored(project, baseline, "CLI")

        server = Server.start(binary, workspace)
        http_operation(
            server,
            {
                "op": "updateCanvas",
                "width": 400,
                "height": 300,
                "background": "#102030",
                "anchor": "center",
            },
        )
        http_background = http_export(server, "http-background")
        http_operation(server, {"op": "updateCanvas", "background": None})
        http_clear = http_export(server, "http-clear")
        http_undo(server)
        http_undo(server)
        server.close()
        server = None
        assert_restored(project, baseline, "HTTP")

        mcp = Mcp.start(binary, workspace)
        mcp.tool(
            "update_canvas",
            {
                "project": "canvas",
                "width": 400,
                "height": 300,
                "background": "#102030",
                "anchor": "center",
            },
        )
        mcp_background = mcp_export(mcp, project, "mcp-background")
        mcp.tool("update_canvas", {"project": "canvas", "background": None})
        mcp_clear = mcp_export(mcp, project, "mcp-clear")
        mcp.tool("undo", {"project": "canvas"})
        mcp.tool("undo", {"project": "canvas"})
        mcp.close()
        mcp = None
        assert_restored(project, baseline, "MCP")

        if not (cli_background == http_background == mcp_background):
            raise SmokeFailure("background PNG bytes differ across CLI, HTTP, and MCP")
        if not (cli_clear == http_clear == mcp_clear):
            raise SmokeFailure("transparent PNG bytes differ across CLI, HTTP, and MCP")
        for label, png, corner in [
            ("background", cli_background, bytes.fromhex("102030ff")),
            ("transparent", cli_clear, bytes.fromhex("00000000")),
        ]:
            width, height, found = png_rgba_corner(png)
            if (width, height) != (400, 300) or found != corner:
                raise SmokeFailure(
                    f"{label} PNG was {(width, height)} corner={found.hex()}, "
                    f"expected (400, 300) corner={corner.hex()}"
                )
        evidence["exports"] = {
            "dimensions": [400, 300],
            "backgroundSha256": hashlib.sha256(cli_background).hexdigest(),
            "transparentSha256": hashlib.sha256(cli_clear).hexdigest(),
            "equalAcrossTransports": True,
            "undoRestoredBytes": True,
        }

        if baseline_binary:
            evidence["baseline"] = old_binary_exit_test(baseline_binary, project)

        print(json.dumps({"ok": True, **evidence}, separators=(",", ":")))
        return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError, ValueError) as error:
        print(json.dumps({"ok": False, **evidence, "error": str(error)}, separators=(",", ":")))
        return 1
    finally:
        teardown = []
        if mcp is not None:
            try:
                mcp.close()
            except (SmokeFailure, OSError) as error:
                teardown.append(str(error))
                if mcp.process.poll() is None:
                    mcp.process.kill()
        if server is not None:
            try:
                server.close()
            except (SmokeFailure, OSError) as error:
                teardown.append(str(error))
                if server.process.poll() is None:
                    server.process.kill()
        if teardown:
            print(
                json.dumps({"ok": False, "teardownError": "; ".join(teardown)}, separators=(",", ":")),
                file=sys.stderr,
            )
            raise SystemExit(1)


if __name__ == "__main__":
    raise SystemExit(main())