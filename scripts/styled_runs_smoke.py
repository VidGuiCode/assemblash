#!/usr/bin/env python3
"""Verify styled runs through the actual CLI, HTTP API, and MCP server."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

from release_smoke import Mcp, Server, SmokeFailure, json_request, request, run


BODY = "A bold ب"
RUNS = [
    {"text": "A ", "fontSize": None, "future": {"keep": [1, 2]}},
    {"text": "bold", "fontWeight": 700, "color": {
        "kind": "linear", "angle": 20, "futurePaint": {"keep": True},
        "stops": [{"offset": 0, "color": "#b02050"}, {"offset": 1, "color": "#102030"}],
    }},
    {"text": " ", "color": None},
    {"text": "ب", "fontFamily": "Noto Sans Arabic", "fontSize": 36, "color": "#336699"},
]


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise SmokeFailure(message)


def durable(project: Path) -> dict[str, bytes]:
    return {str(p.relative_to(project)): p.read_bytes() for p in project.rglob("*")
            if p.is_file() and p.name != ".assemblash-lock" and "exports" not in p.relative_to(project).parts}


def cli_refusal(binary: Path, *args: str) -> str:
    result = subprocess.run([str(binary), *map(str, args)], capture_output=True, text=True, encoding="utf-8",
                            timeout=30, check=False)
    ensure(result.returncode != 0, f"CLI unexpectedly accepts {args!r}")
    return result.stderr


def mcp_refusal(mcp: Mcp, name: str, args: dict, code: str | None = None) -> object:
    try:
        result = mcp.call("tools/call", {"name": name, "arguments": args})
    except SmokeFailure as error:
        prefix = "MCP tools/call failed: "
        ensure(str(error).startswith(prefix), f"Unexpected MCP failure: {error}")
        result = ast.literal_eval(str(error)[len(prefix):])
        if code:
            ensure(result.get("data", {}).get("code") == code, f"MCP refusal lacks {code}: {result!r}")
        return result
    ensure(result.get("isError") is True, f"MCP unexpectedly accepts {name}: {result!r}")
    if code:
        ensure(code in json.dumps(result), f"MCP refusal lacks {code}: {result!r}")
    return result


class Client:
    """Keep one transport owner active for a project."""

    def __init__(self, kind: str, binary: Path, workspace: Path, name: str, fonts: Path):
        self.kind, self.binary, self.workspace, self.name, self.fonts = kind, binary, workspace, name, fonts
        self.project = workspace / "projects" / name
        self.server = Server.start(binary, workspace) if kind == "http" else None
        self.mcp = Mcp.start(binary, workspace) if kind == "mcp" else None
        self.prefix = f"/api/projects/{name}"

    def __enter__(self):
        return self

    def __exit__(self, *_):
        if self.mcp:
            self.mcp.close()
        if self.server:
            self.server.close()

    def doc(self) -> dict:
        if self.kind == "cli":
            return json.loads(run(self.binary, "show", self.project))
        if self.server:
            status, doc = json_request(self.server.base, "GET", self.prefix + "/document")
            ensure(status == 200, f"HTTP read: {status} {doc!r}")
            return doc
        return self.mcp.tool("get_document_state", {"project": self.name})["document"]

    def update(self, layer: str, values: dict, *, refuse=False, code=None, dry=False, version=None):
        if self.kind == "cli":
            args = ["set", str(self.project), "--layer", layer]
            flags = {"fontSize": "size", "fontFamily": "font", "fontWeight": "weight", "paragraphSpacing": "paragraph-spacing"}
            for key, value in values.items():
                if key == "runs":
                    path = self.workspace / f"{self.name}-runs.json"
                    path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")
                    args.extend(["--runs-file", str(path)])
                else:
                    args.extend(["--" + flags.get(key, key), str(value).lower() if isinstance(value, bool) else str(value)])
            if version is not None:
                args.extend(["--expect-version", str(version)])
            return cli_refusal(self.binary, *args) if refuse else run(self.binary, *args)
        if self.server:
            payload = {"operation": {"op": "update", "id": layer, **values}, "dryRun": dry}
            if version is not None:
                payload["expectedVersion"] = version
            status, result = json_request(self.server.base, "POST", self.prefix + "/operations", payload)
            ensure((status >= 400) if refuse else status == 200, f"HTTP update: {status} {result!r}")
            if refuse and code:
                ensure(result.get("error", {}).get("code") == code, f"HTTP refusal lacks {code}: {result!r}")
            return result
        args = {"project": self.name, "layerId": layer, "dryRun": dry, **values}
        if version is not None:
            args["expectedVersion"] = version
        return mcp_refusal(self.mcp, "update_layer", args, code) if refuse else self.mcp.tool("update_layer", args)

    def history(self, action: str):
        if self.kind == "cli":
            run(self.binary, action, self.project)
        elif self.server:
            status, result = json_request(self.server.base, "POST", self.prefix + "/" + action, {})
            ensure(status == 200, f"HTTP {action}: {result!r}")
        else:
            self.mcp.tool(action, {"project": self.name})

    def create(self, runs: object, *, refuse=False, file_input=False):
        values = {"text": "Made", "fontFamily": "Noto Sans", "fontSize": 24, "runs": runs,
                  "x": 20, "y": 130, "width": 400, "height": 50}
        if self.kind == "cli":
            args = ["add-text", str(self.project), "--text", "Made", "--font", "Noto Sans",
                    "--size", "24", "--x", "20", "--y", "130", "--width", "400", "--height", "50",
                    "--runs", json.dumps(runs, ensure_ascii=False)]
            if file_input:
                path = self.workspace / "create-runs.json"
                path.write_text(json.dumps(runs, ensure_ascii=False), encoding="utf-8")
                args[-2:] = ["--runs-file", str(path)]
            return cli_refusal(self.binary, *args) if refuse else run(self.binary, *args)
        if self.server:
            geometry = {k: values.pop(k) for k in ["x", "y", "width", "height"]}
            status, result = json_request(self.server.base, "POST", self.prefix + "/operations",
                {"operation": {"op": "create", "position": {"at": "root"}, "transform": geometry, "type": "text", **values}})
            ensure((status >= 400) if refuse else status == 200, f"HTTP create: {status} {result!r}")
            return result
        args = {"project": self.name, **values}
        return mcp_refusal(self.mcp, "add_text_layer", args) if refuse else self.mcp.tool("add_text_layer", args)

    def render_refusal(self, code: str):
        if self.kind == "cli":
            diagnostic = cli_refusal(self.binary, "render", self.project, self.workspace / "refused.svg", "--font-store", self.fonts)
            ensure(("cluster" if code == "incompatibleTextCluster" else "font") in diagnostic.lower(),
                   f"CLI render refusal lacks its cause: {diagnostic}")
            return diagnostic
        if self.server:
            status, result = json_request(self.server.base, "GET", self.prefix + "/preview.svg")
            ensure(status == 422 and result.get("error", {}).get("code") == code, f"HTTP render refusal: {status} {result!r}")
            return result
        return mcp_refusal(self.mcp, "render_document", {"project": self.name}, code)

    def png(self) -> bytes:
        if self.kind == "cli":
            path = self.workspace / "styled-cli.png"
            run(self.binary, "export", self.project, path, "--font-store", self.fonts)
            return path.read_bytes()
        if self.server:
            status, result = json_request(self.server.base, "POST", self.prefix + "/export", {"name": "styled"})
            ensure(status == 200, f"HTTP export: {status} {result!r}")
            status, png = request(self.server.base, "GET", self.prefix + "/exports/styled.png")
            ensure(status == 200, f"HTTP PNG: {status}")
            return png
        result = self.mcp.tool("export_document", {"project": self.name, "name": "styled", "overwrite": True})
        return (self.project / result.get("path", "exports/styled.png")).read_bytes()


def scenarios(client: Client, layer: str, evidence: dict) -> bytes:
    def selected() -> dict:
        return next(item for item in client.doc()["layers"] if item["id"] == layer)

    seed = (client.project / "document.json").read_bytes()
    made_runs = [{"text": "Made", "fontSize": None, "future": {"keep": [1, 2]}}]
    for file_input in ([False, True] if client.kind == "cli" else [False]):
        client.create(made_runs, file_input=file_input)
        ensure(client.doc()["layers"][-1]["runs"] == made_runs, "Creation loses raw runs")
        client.history("undo")
        ensure((client.project / "document.json").read_bytes() == seed, "Creation undo does not restore seed")
    before = durable(client.project)
    for runs in [None, [{"text": "different"}]]:
        client.create(runs, refuse=True)
        ensure(durable(client.project) == before, "Creation refusal changes project or infers text")

    client.update(layer, {"runs": RUNS})
    ensure(selected()["runs"] == RUNS, "Run-only update loses raw overrides")
    styled_bytes = (client.project / "document.json").read_bytes()
    if client.kind == "cli":
        run(client.binary, "set", client.project, "--layer", layer, "--runs", json.dumps(RUNS, ensure_ascii=False))
        ensure(selected()["runs"] == RUNS, "Inline update loses raw runs")
        client.history("undo")
        ensure((client.project / "document.json").read_bytes() == styled_bytes, "Inline update undo loses bytes")
    client.history("undo")
    ensure((client.project / "document.json").read_bytes() == seed, "Run undo changes seed")
    client.history("redo")
    ensure((client.project / "document.json").read_bytes() == styled_bytes, "Run redo loses stored bytes")

    for values in [{"text": BODY}, {"runs": []}, {"text": "Atomic", "runs": [{"text": "Atomic"}]}]:
        client.update(layer, values)
        now = selected()
        ensure(now["runs"] == values.get("runs", []), "Text write or explicit clear keeps runs")
        client.history("undo")
        ensure((client.project / "document.json").read_bytes() == styled_bytes, "Clearing undo loses raw runs")
    client.update(layer, {"color": "#112233", "runs": None})
    ensure(selected()["runs"] == RUNS, "Outer null or base color rewrites runs")
    client.history("undo")
    before = durable(client.project)
    for values in [{"runs": [17]}, {"runs": [{"text": "wrong"}]},
                   {"text": "changed", "runs": [{"text": "different"}]},
                   {"runs": [{"text": BODY, "fontSize": "bad"}]}]:
        client.update(layer, values, refuse=True, code="operationRefused")
        ensure(durable(client.project) == before, "Structural refusal changes project bytes")
    for guard in ["layer_protected", "layer_locked", "layer_readonly"]:
        client.update(guard, {"runs": RUNS}, refuse=True, code="operationRefused")
        ensure(durable(client.project) == before, "Guard refusal changes project bytes")
    version = client.doc()["version"]
    client.update(layer, {"runs": []}, refuse=True, code="versionConflict", version=version - 1)
    ensure(durable(client.project) == before, "Stale write changes project bytes")
    if client.kind != "cli":
        dry = client.update(layer, {"runs": []}, dry=True, version=version)
        ensure(dry.get("dryRun") is True and durable(client.project) == before, "Dry run changes durable state")
    for values, code in [
        ({"runs": [{"text": BODY, "fontWeight": 900}]}, "missingFont"),
        ({"runs": [{"text": BODY, "fontFamily": "Missing Styled Face"}]}, "missingFont"),
        ({"text": "office", "runs": [{"text": "of"}, {"text": "fice", "fontWeight": 700}]}, "incompatibleTextCluster"),
    ]:
        client.update(layer, values)
        client.render_refusal(code)
        client.history("undo")
        ensure((client.project / "document.json").read_bytes() == styled_bytes, "Render-refusal undo loses raw data")
    if client.server:
        status, layout = json_request(client.server.base, "GET", client.prefix + f"/text-layout?id={layer}&width=80")
        ensure(status == 200 and set(layout) == {"lineCount", "height"} and layout["lineCount"] > 1,
               f"Shared layout endpoint differs: {status} {layout!r}")
        evidence["layout"] = layout
    if client.mcp:
        for slot, value in [("headline", "Slot text"), ("ink", "#abcdef")]:
            client.mcp.tool("fill_template", {"project": client.name, "values": {slot: value}})
            ensure(selected()["runs"] == [], f"{slot} slot does not clear styling")
            client.history("undo")
            ensure((client.project / "document.json").read_bytes() == styled_bytes, "Slot undo loses raw runs")
        tools = client.mcp.call("tools/list", {})["tools"]
        for name in ["add_text_layer", "update_layer"]:
            schema = next(tool["inputSchema"] for tool in tools if tool["name"] == name)
            ensure("runs" in schema.get("properties", {}) and "letterSpacing" in json.dumps(schema), f"{name} schema hides supported runs")
        evidence["toolCount"] = len(tools)
    png = client.png()
    evidence.update({"rawReadBack": True, "creation": True, "undoRedoBytes": True,
        "structuralAtomicRefusal": True, "guards": True, "staleVersion": True,
        "dryRun": client.kind != "cli", "renderRefusals": True,
        "pngSha256": hashlib.sha256(png).hexdigest(), "pngBytes": len(png)})
    return png


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    args = parser.parse_args()
    binary, workspace = args.binary.resolve(), args.workspace.resolve()
    fixture = Path(__file__).resolve().parents[1] / "crates/assemblash-renderer/tests/fonts"
    evidence = {"check": "styledRuns", "executed": True, "binary": str(binary), "transports": {}}
    try:
        ensure(binary.is_file(), f"Binary is missing: {binary}")
        evidence["version"] = run(binary, "--version").strip()
        ensure(not workspace.exists() or not any(workspace.iterdir()), f"Workspace must be empty: {workspace}")
        workspace.mkdir(parents=True, exist_ok=True)
        for name in ["ASSEMBLASH_FONT_STORE", "ASSEMBLASH_WORKSPACE", "ASSEMBLASH_BIND", "ASSEMBLASH_TOKEN"]:
            os.environ.pop(name, None)
        run(binary, "workspace", "--workspace", workspace)
        (workspace / "config.toml").write_text("port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n", encoding="utf-8")
        fonts = workspace / "fonts"
        for name in ["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf", "NotoSansArabic-Subset.ttf"]:
            run(binary, "font", "add", fixture / name, "--license", "OFL-1.1", "--font-store", fonts)
        seed = workspace / "seed"
        run(binary, "new", seed, "--width", "600", "--height", "240", "--background", "#ffffff")
        layer = run(binary, "add-text", seed, "--text", BODY, "--font", "Noto Sans", "--size", "32",
                    "--x", "24", "--y", "24", "--width", "500", "--height", "150").strip()
        raw = json.loads((seed / "document.json").read_text(encoding="utf-8"))
        for flag, id_ in [("protected", "layer_protected"), ("locked", "layer_locked"), ("readOnly", "layer_readonly")]:
            guard = json.loads(json.dumps(raw["layers"][0]))
            guard.update({"id": id_, flag: True, "visible": False})
            raw["layers"].append(guard)
        raw["slots"] = [{"name": "headline", "layer": layer, "kind": "text"}, {"name": "ink", "layer": layer, "kind": "color"}]
        (seed / "document.json").write_text(json.dumps(raw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        # Save fixture defaults through the actual operation engine before cloning.
        run(binary, "set", seed, "--layer", layer, "--color", "#000000")
        outputs = []
        capabilities = json.loads(run(binary, "styles", "--json"))
        for kind in ["cli", "http", "mcp"]:
            project = workspace / "projects" / kind
            shutil.copytree(seed, project)
            details = evidence["transports"][kind] = {}
            with Client(kind, binary, workspace, kind, fonts) as client:
                outputs.append(scenarios(client, layer, details))
                if client.server:
                    status, advertised = json_request(client.server.base, "GET", "/api/capabilities")
                    ensure(status == 200 and advertised == capabilities, "HTTP capabilities differ from CLI")
                if client.mcp:
                    ensure(client.mcp.tool("list_capabilities", {}) == capabilities, "MCP capabilities differ from CLI")
            # Reopen through the same real transport after its lock owner exits.
            with Client(kind, binary, workspace, kind, fonts) as client:
                ensure(client.doc()["layers"][0]["runs"] == RUNS, f"{kind} reload loses raw runs")
                ensure(client.png() == outputs[-1], f"{kind} reload changes PNG bytes")
                details["reload"] = True
            legacy_name = kind + "-legacy"
            legacy = workspace / "projects" / legacy_name
            shutil.copytree(seed, legacy)
            legacy_raw = json.loads((legacy / "document.json").read_text(encoding="utf-8"))
            reserved = [17, None, {"legacy": {"keep": [1, 2, 3]}}]
            legacy_raw["layers"][0]["runs"] = reserved
            (legacy / "document.json").write_text(json.dumps(legacy_raw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            with Client(kind, binary, workspace, legacy_name, fonts) as client:
                result = client.update(layer, {"fontSize": 33})
                ensure(client.doc()["layers"][0]["runs"] == reserved, f"{kind} base write loses reserved raw runs")
                if kind != "cli":
                    ensure(any(w["code"] == "cannotMeasureText" for w in result.get("warnings", [])),
                           f"{kind} successful legacy write lacks precise measurement warning: {result!r}")
                before_clear = (legacy / "document.json").read_bytes()
                client.update(layer, {"text": BODY})
                ensure(client.doc()["layers"][0]["runs"] == [], f"{kind} text write does not clear unsupported raw runs")
                client.history("undo")
                ensure((legacy / "document.json").read_bytes() == before_clear, f"{kind} undo loses unsupported raw runs")
                client.history("redo")
                ensure(client.doc()["layers"][0]["runs"] == [], f"{kind} redo does not retain clearing")
            details["legacyRawPreservedAndCleared"] = True
        ensure(outputs[0] == outputs[1] == outputs[2], "PNG bytes differ across transports")
        supplemental = workspace / "supplemental-fonts"
        for name in ["NotoSans-Bold-Subset.ttf", "NotoSansArabic-Subset.ttf"]:
            run(binary, "font", "add", fixture / name, "--license", "OFL-1.1", "--font-store", supplemental)
        combined = workspace / "combined.png"
        run(binary, "export", workspace / "projects/cli", combined,
            "--font", fixture / "NotoSans-Subset.ttf", "--font-store", supplemental)
        ensure(combined.read_bytes() == outputs[0], "Explicit regular plus stored run faces changes PNG")
        evidence.update({"ok": True, "pngParity": True, "combinedFontSources": True, "capabilitiesParity": True,
            "documentId": raw["id"], "binarySha256": hashlib.sha256(binary.read_bytes()).hexdigest()})
        print(json.dumps(evidence, separators=(",", ":")))
        return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError, ValueError) as error:
        print(json.dumps({**evidence, "ok": False, "error": str(error)}, separators=(",", ":")))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
