#!/usr/bin/env python3
"""Cross-transport smoke test for a packaged Assemblash binary.

Run with a freshly created, otherwise empty workspace path.  The script emits
one JSON object to stdout and uses only Python's standard library.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import queue
import socket
import subprocess
import sys
import threading
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path


TIMEOUT = 30


class SmokeFailure(RuntimeError):
    pass


def run(binary: Path, *args: str, timeout: int = TIMEOUT) -> str:
    completed = subprocess.run(
        [str(binary), *map(str, args)], capture_output=True, text=True,
        timeout=timeout, check=False,
    )
    if completed.returncode:
        raise SmokeFailure(f"command failed ({completed.returncode}): {args!r}: {completed.stderr.strip()}")
    return completed.stdout


def request(base: str, method: str, path: str, payload: object | None = None, timeout: float = TIMEOUT) -> tuple[int, bytes]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(base + path, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def json_request(base: str, method: str, path: str, payload: object | None = None, timeout: float = TIMEOUT) -> tuple[int, object]:
    status, body = request(base, method, path, payload, timeout)
    try:
        return status, json.loads(body)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"{method} {path} returned non-JSON: {body[:300]!r}") from error


class Server:
    def __init__(self, binary: Path, workspace: Path):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            self.port = probe.getsockname()[1]
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        self.process = subprocess.Popen(
            [str(binary), "serve", "--workspace", str(workspace), "--port", str(self.port), "--friendly"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            text=True, creationflags=flags,
        )
        self.base = f"http://127.0.0.1:{self.port}"
        deadline = time.monotonic() + TIMEOUT
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                stderr = self.process.stderr.read() if self.process.stderr else ""
                raise SmokeFailure(f"server exited during startup: {stderr.strip()}")
            try:
                status, _ = request(self.base, "GET", "/api/version", timeout=max(0.1, deadline - time.monotonic()))
                if status == 200:
                    return
            except (urllib.error.URLError, TimeoutError, OSError):
                pass
            time.sleep(0.1)
        raise SmokeFailure("server did not answer /api/version within 30 seconds")

    @classmethod
    def start(cls, binary: Path, workspace: Path) -> 'Server':
        server = cls.__new__(cls)
        try:
            cls.__init__(server, binary, workspace)
        except BaseException:
            try:
                server.close()
            except (SmokeFailure, OSError):
                pass
            raise
        return server

    def close(self) -> None:
        try:
            status, body = json_request(self.base, "POST", "/api/shutdown", {})
            if status != 200 or body != {"stopping": True}:
                raise SmokeFailure(f"graceful shutdown refused: {status} {body!r}")
            self.process.wait(timeout=TIMEOUT)
        except subprocess.TimeoutExpired as error:
            raise SmokeFailure("server did not exit after POST /api/shutdown") from error


class Mcp:
    def __init__(self, binary: Path, workspace: Path):
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        self.process = subprocess.Popen(
            [str(binary), "mcp", "--workspace", str(workspace)], stdin=subprocess.PIPE,
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1,
            creationflags=flags,
        )
        assert self.process.stdout and self.process.stdin
        self.lines: queue.Queue[str | None] = queue.Queue()
        threading.Thread(target=self._read, daemon=True).start()
        self.next_id = 1
        self.call("initialize", {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "release-smoke", "version": "1"}})
        self.notify("notifications/initialized", {})

    def _read(self) -> None:
        assert self.process.stdout
        for line in self.process.stdout:
            self.lines.put(line)
        self.lines.put(None)

    def send(self, message: object) -> None:
        assert self.process.stdin
        self.process.stdin.write(json.dumps(message, separators=(",", ":")) + "\n")
        self.process.stdin.flush()

    def notify(self, method: str, params: object) -> None:
        self.send({"jsonrpc": "2.0", "method": method, "params": params})

    def call(self, method: str, params: object) -> object:
        request_id = self.next_id
        self.next_id += 1
        self.send({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params})
        deadline = time.monotonic() + TIMEOUT
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise SmokeFailure("MCP server exited before replying")
            try:
                line = self.lines.get(timeout=min(0.2, deadline - time.monotonic()))
            except queue.Empty:
                continue
            if line is None:
                raise SmokeFailure("MCP server closed stdout before replying")
            try:
                response = json.loads(line)
            except json.JSONDecodeError as error:
                raise SmokeFailure(f"MCP emitted invalid JSON: {line!r}") from error
            if response.get("id") != request_id:
                continue
            if "error" in response:
                raise SmokeFailure(f"MCP {method} failed: {response['error']!r}")
            return response["result"]
        raise SmokeFailure(f"MCP {method} timed out after 30 seconds")

    def tool(self, name: str, arguments: object) -> object:
        result = self.call("tools/call", {"name": name, "arguments": arguments})
        if result.get("isError"):
            raise SmokeFailure(f"MCP tool {name} refused: {result!r}")
        return result.get("structuredContent", {})

    @classmethod
    def start(cls, binary: Path, workspace: Path) -> 'Mcp':
        mcp = cls.__new__(cls)
        try:
            cls.__init__(mcp, binary, workspace)
        except BaseException:
            try:
                mcp.close()
            except (SmokeFailure, OSError):
                pass
            raise
        return mcp

    def close(self) -> None:
        if self.process.stdin:
            self.process.stdin.close()
        try:
            self.process.wait(timeout=TIMEOUT)
        except subprocess.TimeoutExpired as error:
            raise SmokeFailure("MCP server did not exit after stdin closed") from error


def warning(value: object) -> tuple[str, str, str]:
    if not isinstance(value, list) or len(value) != 1:
        raise SmokeFailure(f"expected exactly one export warning, got {value!r}")
    item = value[0]
    try:
        return item["code"], item["message"], item["layerId"]
    except (TypeError, KeyError) as error:
        raise SmokeFailure(f"malformed warning: {item!r}") from error


def cli_warnings(stdout: str) -> object:
    for line in reversed(stdout.splitlines()):
        if line.startswith("["):
            return json.loads(line)
    raise SmokeFailure(f"CLI did not print --warnings-json output: {stdout!r}")


def pairs(value: object) -> list[tuple[str, str]]:
    try:
        return [tuple(pair) for pair in value]
    except TypeError as error:
        raise SmokeFailure(f"malformed overlap pairs: {value!r}") from error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--expected-version")
    args = parser.parse_args()
    binary, workspace = args.binary.resolve(), args.workspace.resolve()
    if args.expected_version is None:
        manifest = Path(__file__).resolve().parents[1] / 'Cargo.toml'
        with manifest.open('rb') as source:
            args.expected_version = tomllib.load(source)['workspace']['package']['version']
    evidence: dict[str, object] = {"binary": str(binary), "workspace": str(workspace), "expectedVersion": args.expected_version}
    server = None
    mcp = None
    try:
        if not binary.is_file():
            raise SmokeFailure(f"binary does not exist: {binary}")
        if workspace.exists() and any(workspace.iterdir()):
            raise SmokeFailure(f"workspace must be fresh and empty: {workspace}")
        workspace.mkdir(parents=True, exist_ok=True)
        version = run(binary, "--version").strip()
        expected = f"assemblash {args.expected_version}"
        if version != expected:
            raise SmokeFailure(f"version was {version!r}, expected {expected!r}")
        evidence["version"] = version

        run(binary, "workspace", "--workspace", str(workspace))
        (workspace / "config.toml").write_text("port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n", encoding="utf-8")
        fonts = workspace / "fonts"
        fixture = Path(__file__).resolve().parents[1] / "crates" / "assemblash-renderer" / "tests" / "fonts" / "NotoSans-Subset.ttf"
        if not fixture.is_file():
            raise SmokeFailure(f"font fixture is missing: {fixture}")
        run(binary, "font", "add", str(fixture), "--license", "OFL-1.1", "--font-store", str(fonts))

        overflow = workspace / "projects" / "overflow"
        run(binary, "new", str(overflow), "--width", "400", "--height", "200", "--background", "#ffffff", "--name", "Overflow")
        text_id = run(binary, "add-text", str(overflow), "--text", "small words fill this narrow box across many separate lines again", "--font", "Noto Sans", "--size", "28", "--x", "10", "--y", "10", "--width", "120", "--height", "40", "--font-store", str(fonts)).strip()
        before = (overflow / "document.json").read_bytes()
        cli_path = workspace / "cli.png"
        cli_out = run(binary, "export", str(overflow), str(cli_path), "--font-store", str(fonts), "--warnings-json")
        cli_warning = warning(cli_warnings(cli_out))
        cli_bytes = cli_path.read_bytes()

        server = Server.start(binary, workspace)
        status, http_export = json_request(server.base, "POST", "/api/projects/overflow/export", {"name": "http"})
        if status != 200:
            raise SmokeFailure(f"HTTP export failed: {status} {http_export!r}")
        http_warning = warning(http_export["warnings"])
        status, http_bytes = request(server.base, "GET", "/api/projects/overflow/exports/http.png")
        if status != 200:
            raise SmokeFailure(f"HTTP export download failed: {status}")
        server.close()
        server = None

        overlaps = workspace / "projects" / "overlaps"
        run(binary, "new", str(overlaps), "--width", "400", "--height", "400", "--background", "#ffffff", "--name", "Overlaps")
        ids = []
        for name, x, y, width, height in [("A", "10", "10", "100", "100"), ("B", "50", "50", "100", "100"), ("C", "300", "300", "50", "50")]:
            ids.append(run(binary, "add-text", str(overlaps), "--text", name, "--font", "Noto Sans", "--size", "16", "--x", x, "--y", y, "--width", width, "--height", height, "--font-store", str(fonts)).strip())

        mcp = Mcp.start(binary, workspace)
        mcp_export = mcp.tool("export_document", {"project": "overflow", "name": "mcp"})
        mcp_warning = warning(mcp_export["warnings"])
        mcp_bytes = (overflow / "exports" / "mcp.png").read_bytes()
        mcp_overlaps = mcp.tool("find_overlaps", {"project": "overlaps"})
        mcp.close()
        mcp = None
        if not (cli_bytes == http_bytes == mcp_bytes):
            raise SmokeFailure("CLI, HTTP, and MCP exports differ")
        if not (cli_warning == http_warning == mcp_warning) or cli_warning[0] != "textOverflowsBox" or cli_warning[2] != text_id:
            raise SmokeFailure(f"overflow warnings disagree: CLI={cli_warning!r} HTTP={http_warning!r} MCP={mcp_warning!r}")
        evidence["exports"] = {"sha256": hashlib.sha256(cli_bytes).hexdigest(), "bytes": len(cli_bytes), "warning": {"code": cli_warning[0], "layerId": cli_warning[2]}}

        server = Server.start(binary, workspace)
        def state() -> tuple[int, int]:
            _, document = json_request(server.base, "GET", "/api/projects/overflow/document")
            _, history = json_request(server.base, "GET", "/api/projects/overflow/history")
            return document["version"], len(history["entries"])
        refused_before = state()
        for operation in [
            {"op": "update", "id": text_id, "releaseSmokeUnknownProperty": 4},
            {"op": "create", "position": {"at": "root"}, "transform": {"x": 0, "y": 0, "width": 100, "height": 40}, "type": "text", "text": "refused", "fontFamily": "Noto Sans", "fontSize": 16, "releaseSmokeUnknownProperty": 9},
        ]:
            status, refused = json_request(server.base, "POST", "/api/projects/overflow/operations", {"operation": operation})
            if status != 422 or refused.get("error", {}).get("code") != "operationRefused":
                raise SmokeFailure(f"unknown property was not refused: {status} {refused!r}")
            if state() != refused_before:
                raise SmokeFailure("refused operation changed version or history")
        evidence["unknownProperties"] = {"status": 422, "version": refused_before[0], "historyEntries": refused_before[1]}

        status, applied = json_request(server.base, "POST", "/api/projects/overflow/operations", {"operation": {"op": "update", "id": text_id, "opacity": 0.5}, "actor": {"kind": "agent", "detail": "release-smoke"}})
        if status != 200:
            raise SmokeFailure(f"agent update failed: {status} {applied!r}")
        _, history = json_request(server.base, "GET", "/api/projects/overflow/history")
        kinds = {entry.get("actor", {}).get("kind") for entry in history["entries"]}
        if not {"human", "agent"}.issubset(kinds):
            raise SmokeFailure(f"history did not distinguish actors: {history!r}")
        status, undone = json_request(server.base, "POST", "/api/projects/overflow/undo", {"actor": {"kind": "human"}})
        if status != 200:
            raise SmokeFailure(f"HTTP undo failed: {status} {undone!r}")
        if (overflow / "document.json").read_bytes() != before:
            raise SmokeFailure("undo did not restore document.json byte-for-byte")
        evidence["history"] = {"actors": sorted(kinds), "undoRestoredBytes": True}

        cli_pairs = [tuple(line.split("\t")) for line in run(binary, "overlaps", str(overlaps)).splitlines() if line]
        status, http_overlaps = json_request(server.base, "GET", "/api/projects/overlaps/overlaps")
        if status != 200:
            raise SmokeFailure(f"HTTP overlaps failed: {status} {http_overlaps!r}")
        expected_pairs = [(ids[0], ids[1])]
        if cli_pairs != expected_pairs or pairs(http_overlaps["pairs"]) != expected_pairs or pairs(mcp_overlaps["pairs"]) != expected_pairs:
            raise SmokeFailure(f"overlap results disagree: CLI={cli_pairs!r} HTTP={http_overlaps!r} MCP={mcp_overlaps!r}")
        evidence["overlaps"] = {"pairs": expected_pairs}

        server.close()
        server = None
        print(json.dumps({"ok": True, **evidence}, separators=(",", ":")))
        return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError) as error:
        print(json.dumps({"ok": False, **evidence, "error": str(error)}, separators=(",", ":")))
        return 1
    finally:
        errors = []
        if mcp:
            try: mcp.close()
            except SmokeFailure as error: errors.append(str(error))
        if server:
            try: server.close()
            except SmokeFailure as error: errors.append(str(error))
        if errors:
            print(json.dumps({"ok": False, **evidence, "teardownError": "; ".join(errors)}, separators=(",", ":")), file=sys.stderr)
            if sys.exc_info()[0] is None:
                raise SystemExit(1)


if __name__ == "__main__":
    raise SystemExit(main())
