#!/usr/bin/env python3
"""Two-agent smoke test for Assemblash: MCP over stdio, then two writers.

Speaks MCP over stdio to `assemblash mcp --workspace <ws>` (initialize,
tools/list with the expected tool count (53 since v1.10.0's parity tools),
then runs a two-writer stress against one project: ~40 interleaved writes,
half over HTTP and half over MCP. Asserts zero errors and a consistent
journal (version count equals write count).

Python 3, standard library only. The personal font store on this machine is
stripped from every spawned process (ASSEMBLASH_FONT_STORE).
"""

from __future__ import annotations

import argparse
import json
import os
import queue
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

TIMEOUT = 60
# 53 since v1.10.0: the 47-tool surface plus the six parity tools
# (insert_layer_tree, install_font_pack, remove_font_family, list_fonts,
# delete_project, rename_project).
EXPECTED_TOOLS = 53
WRITES_PER_WRITER = 20


class SmokeFailure(RuntimeError):
    pass


def clean_env() -> dict[str, str]:
    """The machine's font store must not leak into the test."""
    env = dict(os.environ)
    env.pop("ASSEMBLASH_FONT_STORE", None)
    return env


def request(base: str, method: str, path: str, payload: object | None = None,
            timeout: float = TIMEOUT) -> tuple[int, object]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(base + path, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read())


class Mcp:
    """A command-line MCP client over a real stdio pipe."""

    def __init__(self, binary: Path, workspace: Path):
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        self.process = subprocess.Popen(
            [str(binary), "mcp", "--workspace", str(workspace)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL, text=True, bufsize=1,
            creationflags=flags, env=clean_env(),
        )
        assert self.process.stdout and self.process.stdin
        self.lines: queue.Queue[str | None] = queue.Queue()
        threading.Thread(target=self._read, daemon=True).start()
        self.next_id = 1
        answer = self.call("initialize", {
            "protocolVersion": "2025-06-18", "capabilities": {},
            "clientInfo": {"name": "agents-smoke", "version": "1"},
        })
        if answer.get("serverInfo", {}).get("name") != "assemblash":
            raise SmokeFailure(f"unexpected initialize answer: {answer!r}")
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
                line = self.lines.get(timeout=min(0.2, max(0.0, deadline - time.monotonic())))
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
        raise SmokeFailure(f"MCP {method} timed out")

    def tool(self, name: str, arguments: object) -> object:
        result = self.call("tools/call", {"name": name, "arguments": arguments})
        if result.get("isError"):
            raise SmokeFailure(f"MCP tool {name} refused: {result!r}")
        return result.get("structuredContent", {})

    def close(self) -> None:
        if self.process.stdin:
            self.process.stdin.close()
        try:
            self.process.wait(timeout=TIMEOUT)
        except subprocess.TimeoutExpired as error:
            self.process.kill()
            raise SmokeFailure("MCP server did not exit after stdin closed") from error


class Server:
    """A plain `assemblash serve` on a free port."""

    def __init__(self, binary: Path, workspace: Path):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            self.port = probe.getsockname()[1]
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        self.process = subprocess.Popen(
            [str(binary), "serve", "--workspace", str(workspace), "--port", str(self.port)],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL, text=True, creationflags=flags, env=clean_env(),
        )
        self.base = f"http://127.0.0.1:{self.port}"
        deadline = time.monotonic() + TIMEOUT
        while time.monotonic() < deadline:
            try:
                status, _ = request(self.base, "GET", "/api/version",
                                    timeout=max(0.1, deadline - time.monotonic()))
                if status == 200:
                    return
            except (urllib.error.URLError, TimeoutError, OSError):
                pass
            time.sleep(0.1)
        raise SmokeFailure("server did not answer /api/version")

    def close(self) -> None:
        # A plain `serve` refuses a stop from the page; only a friendly one
        # accepts it. Either way the process must end.
        try:
            status, _ = request(self.base, "POST", "/api/shutdown", {})
            if status == 200:
                self.process.wait(timeout=TIMEOUT)
                return
        except (SmokeFailure, OSError, urllib.error.URLError):
            pass
        self.process.terminate()
        try:
            self.process.wait(timeout=TIMEOUT)
        except subprocess.TimeoutExpired as error:
            self.process.kill()
            raise SmokeFailure("server did not exit after terminate") from error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", type=Path, default=None)
    parser.add_argument("--workspace", type=Path, default=None)
    args = parser.parse_args()
    binary = (args.binary or Path("target/debug/assemblash.exe")).resolve()
    evidence: dict[str, object] = {"binary": str(binary)}
    workspace_path = args.workspace
    mcp: Mcp | None = None
    server: Server | None = None
    try:
        if not binary.is_file():
            raise SmokeFailure(f"binary does not exist: {binary}")
        cleanup = False
        if workspace_path is None:
            workspace_path = Path(tempfile.mkdtemp(prefix="agents-smoke-"))
            cleanup = True
        workspace = workspace_path.resolve()
        workspace.mkdir(parents=True, exist_ok=True)
        (workspace / "config.toml").write_text("open-browser = false\n", encoding="utf-8")
        evidence["workspace"] = str(workspace)

        # 1. MCP over stdio: the tools are there, the basic flow works.
        mcp = Mcp(binary, workspace)
        listed = mcp.call("tools/list", {})
        tools = listed.get("tools", [])
        if len(tools) != EXPECTED_TOOLS:
            raise SmokeFailure(f"tools/list returned {len(tools)} tools, expected {EXPECTED_TOOLS}")
        evidence["tools"] = len(tools)
        mcp.tool("create_project", {"project": "smoke", "width": 400.0, "height": 300.0})
        mcp.tool("add_shape_layer", {
            "project": "smoke", "shape": "ellipse",
            "x": 10.0, "y": 10.0, "width": 80.0, "height": 60.0,
        })
        exported = mcp.tool("export_document", {"project": "smoke", "name": "smoke"})
        export_file = workspace / "projects" / "smoke" / "exports" / "smoke.png"
        if not export_file.is_file():
            raise SmokeFailure(f"export did not produce {export_file}: {exported!r}")
        evidence["exportBytes"] = exported.get("bytes")

        # 2. The server starts; the relay moves to it (documented behaviour).
        server = Server(binary, workspace)
        server_pid = server.process.pid

        # Opening the document makes the editor take the project lock. The
        # first attempts can meet `projectLocked` while the relay still holds
        # the lock on its local target; wait out the handover.
        deadline = time.monotonic() + TIMEOUT
        while True:
            status, _ = request(server.base, "GET", "/api/projects/smoke/document")
            if status == 200:
                break
            if status != 409 or time.monotonic() > deadline:
                raise SmokeFailure(f"document read failed: {status}")
            time.sleep(0.3)

        # The MCP relay releases the project it opened locally and moves to
        # the editor. Wait for that handover, so both writers share one lock.
        deadline = time.monotonic() + TIMEOUT
        while True:
            lock = workspace / "projects" / "smoke" / ".assemblash-lock"
            try:
                holder = json.loads(lock.read_text(encoding="utf-8")).get("pid")
            except (OSError, json.JSONDecodeError):
                holder = None
            if holder == server_pid:
                break
            if time.monotonic() > deadline:
                raise SmokeFailure(
                    f"the relay did not hand the project to the editor (lock pid {holder})")
            time.sleep(0.2)

        # 3. Two writers, ~40 interleaved writes, one project, zero errors.
        # The document already carries the smoke flow's layer, so the
        # baseline version is read rather than assumed.
        _, baseline = request(server.base, "GET", "/api/projects/smoke/document")
        start_version = baseline["version"]
        http_errors: list[str] = []
        mcp_errors: list[str] = []
        http_writes = 0
        mcp_writes = 0

        def http_writer() -> None:
            nonlocal http_writes
            for index in range(WRITES_PER_WRITER):
                operation = {
                    "op": "create",
                    "position": {"at": "root"},
                    "transform": {"x": 100.0 + index, "y": 150.0,
                                  "width": 40.0, "height": 30.0},
                    "type": "shape",
                    "shape": {"kind": "rect"},
                    "fill": "#336699",
                }
                try:
                    status, body = request(
                        server.base, "POST", "/api/projects/smoke/operations",
                        {"operation": operation,
                         "actor": {"kind": "agent", "detail": "agents-smoke-http"}},
                    )
                    if status != 200:
                        http_errors.append(f"write {index}: status {status}: {body!r}")
                    else:
                        http_writes += 1
                except (OSError, urllib.error.URLError) as error:
                    http_errors.append(f"write {index}: {error}")

        def mcp_writer() -> None:
            nonlocal mcp_writes
            for index in range(WRITES_PER_WRITER):
                try:
                    mcp.tool("add_shape_layer", {
                        "project": "smoke", "shape": "ellipse",
                        "x": 10.0 + index, "y": 10.0,
                        "width": 30.0, "height": 20.0,
                    })
                    mcp_writes += 1
                except SmokeFailure as error:
                    mcp_errors.append(f"write {index}: {error}")

        threads = [threading.Thread(target=http_writer), threading.Thread(target=mcp_writer)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        errors = http_errors + mcp_errors
        evidence["writes"] = {"http": http_writes, "mcp": mcp_writes, "errors": errors[:5]}
        if errors:
            raise SmokeFailure(f"{len(errors)} write(s) failed: {errors[0]}")

        # 4. One consistent journal: version equals write count.
        status, document = request(server.base, "GET", "/api/projects/smoke/document")
        if status != 200:
            raise SmokeFailure(f"document read failed: {status} {document!r}")
        status, history = request(server.base, "GET", "/api/projects/smoke/history")
        if status != 200:
            raise SmokeFailure(f"history read failed: {status} {history!r}")
        version = document.get("version")
        entries = len(history.get("entries", []))
        expected = start_version + WRITES_PER_WRITER * 2
        evidence["journal"] = {
            "startVersion": start_version,
            "version": version,
            "entries": entries,
            "expected": expected,
        }
        if version != expected or entries != expected:
            raise SmokeFailure(
                f"journal inconsistent: version {version}, {entries} entries, expected {expected}")

        mcp.close()
        mcp = None
        server.close()
        server = None
        if cleanup:
            for child in sorted(workspace.rglob("*"), reverse=True):
                try:
                    child.unlink()
                except OSError:
                    pass
            try:
                workspace.rmdir()
            except OSError:
                pass
        print(json.dumps({"ok": True, **evidence}, separators=(",", ":")))
        return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError) as error:
        print(json.dumps({"ok": False, **evidence, "error": str(error)}, separators=(",", ":")))
        return 1
    finally:
        if mcp:
            try:
                mcp.close()
            except SmokeFailure:
                pass
        if server:
            try:
                server.close()
            except SmokeFailure:
                pass


if __name__ == "__main__":
    raise SystemExit(main())
