#!/usr/bin/env python3
"""Verify justified alignment through the actual CLI, HTTP API, and MCP server."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

from release_smoke import SmokeFailure, json_request, request, run
from styled_runs_smoke import Client, cli_refusal, durable, ensure, mcp_refusal

BODY = "  A bold C D E F G H I J\n\nLast words\n"
RUNS = [{"text": "  A ", "future": {"keep": [1, 2]}},
        {"text": "bo", "fontWeight": 700, "color": "#336699"},
        {"text": "ld C D ", "fontWeight": 700, "color": "#336699", "future": {"wordBoundary": False}},
        {"text": "E F G H I J\n\nLast words\n", "fontSize": 24}]


def scenarios(client: Client, layer: str, evidence: dict) -> tuple[bytes, bytes]:
    selected = lambda: next(item for item in client.doc()["layers"] if item["id"] == layer)
    seed = (client.project / "document.json").read_bytes()
    for align in ["justify", "invalid"]:
        values = {"text": "Made words wrap onto another line", "fontFamily": "Noto Sans", "fontSize": 24, "align": align}
        geometry = {"x": 20, "y": 20, "width": 140, "height": 200}
        if client.kind == "cli":
            command = ["add-text", client.project, "--text", values["text"], "--font", "Noto Sans", "--size", "24", "--align", align, "--x", "20", "--y", "20", "--width", "140", "--height", "200"]
            cli_refusal(client.binary, *command) if align == "invalid" else run(client.binary, *command)
        elif client.server:
            status, result = json_request(client.server.base, "POST", client.prefix + "/operations", {"operation": {"op": "create", "type": "text", "transform": geometry, **values}})
            ensure(status >= 400 if align == "invalid" else status == 200, f"HTTP creation: {status} {result}")
        else:
            args = {"project": client.name, **geometry, **values}
            mcp_refusal(client.mcp, "add_text_layer", args) if align == "invalid" else client.mcp.tool("add_text_layer", args)
        if align == "justify":
            ensure(client.doc()["layers"][-1]["align"] == align, "Creation loses justification")
            client.history("undo")
        ensure((client.project / "document.json").read_bytes() == seed, "Creation or refusal changes source bytes")
    before = durable(client.project)
    version = client.doc()["version"]
    client.update(layer, {"align": "justify"}, refuse=True, code="versionConflict", version=version - 1)
    ensure(durable(client.project) == before, "Stale alignment changes durable bytes")
    if client.kind != "cli":
        result = client.update(layer, {"align": "justify"}, dry=True, version=version)
        ensure(result.get("dryRun") is True and durable(client.project) == before, "Dry run changes durable bytes")
    for target in ["layer_protected", "layer_locked", "layer_readonly", "layer_shape"]:
        client.update(target, {"align": "justify"}, refuse=True)
        ensure(durable(client.project) == before, f"Guard changes bytes: {target}")
    for values in [{"align": "spread"}, {"align": "justify", "fontSize": -1}]:
        client.update(layer, values, refuse=True)
        ensure(durable(client.project) == before, f"Refused alignment changes bytes: {values}")
    if client.server:
        status, result = json_request(client.server.base, "POST", client.prefix + "/operation-batches", {
            "expectedVersion": version, "label": "Atomic justification refusal", "commands": [
                {"op": "update", "id": layer, "align": "justify"},
                {"op": "update", "id": "layer_shape", "align": "justify"}]})
        ensure(status == 422 and durable(client.project) == before, f"Refused batch changes durable bytes: {result}")
    preset_before = durable(client.project)
    for align in ["spread", "justify"]:
        if client.kind == "cli":
            command = ["preset", "define", client.project, "--name", "justify", "--properties", json.dumps({"align": align})]
            cli_refusal(client.binary, *command) if align == "spread" else run(client.binary, *command)
        elif client.server:
            status, result = json_request(client.server.base, "POST", client.prefix + "/operations", {"operation": {"op": "definePreset", "preset": {"name": "justify", "properties": {"align": align}}}})
            ensure(status >= 400 if align == "spread" else status == 200, f"Preset definition: {result}")
        else:
            args = {"project": client.name, "name": "justify", "properties": {"align": align}}
            mcp_refusal(client.mcp, "define_preset", args) if align == "spread" else client.mcp.tool("define_preset", args)
        if align == "spread":
            ensure(durable(client.project) == preset_before, "Invalid preset changes durable bytes")
    if client.kind == "cli":
        listing = run(client.binary, "preset", "list", client.project)
        ensure('"align":"justify"' in listing, "CLI preset read-back loses alignment")
    elif client.server:
        status, listing = json_request(client.server.base, "GET", client.prefix + "/presets")
        ensure(status == 200 and '"align": "justify"' in json.dumps(listing), "HTTP preset read-back loses alignment")
    else:
        listing = client.mcp.tool("list_presets", {"project": client.name})
        ensure('"align": "justify"' in json.dumps(listing), "MCP preset read-back loses alignment")
    layouts = []
    left_png = None
    for align in ["left", "justify"]:
        client.update(layer, {"align": align})
        ensure(selected()["align"] == align and selected()["runs"] == RUNS, "Alignment changes raw runs")
        ensure(selected()["paragraphSpacing"] == 9.25, "Alignment changes paragraph spacing")
        if align == "left":
            left_png = client.png()
        if client.server:
            status, layout = json_request(client.server.base, "GET", client.prefix + f"/text-layout?id={layer}&width=220")
            ensure(status == 200 and set(layout) == {"lineCount", "height"}, f"Layout contract differs: {layout}")
            layouts.append(layout)
    if layouts:
        ensure(layouts[0] == layouts[1] and layouts[0]["lineCount"] > 4, "Justification changes natural line wrapping or height")
        evidence["layouts"] = layouts
    justified = (client.project / "document.json").read_bytes()
    client.history("undo")
    ensure(selected()["align"] == "left", "Undo retains justification")
    client.history("redo")
    ensure((client.project / "document.json").read_bytes() == justified, "Redo changes document bytes")
    styled_png = client.png()
    ensure(styled_png != left_png, "Wrapped justified pixels equal left alignment")
    if client.kind == "cli":
        run(client.binary, "preset", "apply", client.project, "--layer", layer, "--preset", "justify")
    elif client.server:
        status, result = json_request(client.server.base, "POST", client.prefix + "/operations", {"operation": {"op": "applyPreset", "id": layer, "preset": "justify"}})
        ensure(status == 200, f"Preset application: {result}")
    else:
        client.mcp.tool("apply_preset", {"project": client.name, "layerId": layer, "preset": "justify"})
    ensure(selected()["align"] == "justify" and selected()["runs"] == RUNS, "Preset changes runs or loses alignment")
    client.history("undo")
    client.update(layer, {"runs": []})
    ensure(selected()["runs"] == [], "Plain justification stores synthetic runs")
    plain_png = client.png()
    if client.server:
        status, preview = request(client.server.base, "GET", client.prefix + "/preview.png")
        ensure(status == 200 and preview == plain_png, "Plain preview differs from export")
    client.history("undo")
    ensure((client.project / "document.json").read_bytes() == justified, "Plain control undo loses raw bytes")
    if client.server:
        status, preview = request(client.server.base, "GET", client.prefix + "/preview.png")
        ensure(status == 200 and preview == styled_png, "Styled preview differs from export")
    if client.mcp:
        tools = client.mcp.call("tools/list", {})["tools"]
        for name in ["add_text_layer", "update_layer", "define_preset"]:
            schema = next(item["inputSchema"] for item in tools if item["name"] == name)
            ensure('"justify"' in json.dumps(schema), f"{name} discovery hides justified alignment")
    evidence.update({"creation": True, "guards": True, "atomicRefusal": True, "batchRefusal": client.kind == "http",
        "staleVersion": True, "dryRun": client.kind != "cli", "readBack": True, "rawRuns": True,
        "undoRedoBytes": True, "preset": True, "leftPngSha256": hashlib.sha256(left_png).hexdigest(), "styledPngSha256": hashlib.sha256(styled_png).hexdigest(),
        "plainPngSha256": hashlib.sha256(plain_png).hexdigest()})
    return styled_png, plain_png


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    args = parser.parse_args()
    binary, workspace = args.binary.resolve(), args.workspace.resolve()
    evidence = {"check": "justification", "executed": True, "transports": {}}
    try:
        ensure(not workspace.exists() or not any(workspace.iterdir()), "Workspace must be empty")
        workspace.mkdir(parents=True, exist_ok=True)
        for key in ["ASSEMBLASH_FONT_STORE", "ASSEMBLASH_WORKSPACE", "ASSEMBLASH_BIND", "ASSEMBLASH_TOKEN"]:
            os.environ.pop(key, None)
        run(binary, "workspace", "--workspace", workspace)
        (workspace / "config.toml").write_text("port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n", encoding="utf-8")
        fonts = workspace / "fonts"
        fixture = Path(__file__).resolve().parents[1] / "crates/assemblash-renderer/tests/fonts"
        for name in ["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf"]:
            run(binary, "font", "add", fixture / name, "--license", "OFL-1.1", "--font-store", fonts)
        seed = workspace / "seed"
        run(binary, "new", seed, "--width", "600", "--height", "340", "--background", "#ffffff")
        layer = run(binary, "add-text", seed, "--text", BODY, "--font", "Noto Sans", "--size", "32", "--align", "justify",
            "--x", "24", "--y", "24", "--width", "220", "--height", "260", "--paragraph-spacing", "9.25").strip()
        raw = json.loads((seed / "document.json").read_text(encoding="utf-8"))
        ensure(raw["layers"][0]["align"] == "justify" and raw["layers"][0]["runs"] == [], "CLI creation loses alignment or stores runs")
        raw["layers"][0]["runs"] = RUNS
        raw["layers"][0]["futureLayer"] = {"keep": True}
        for flag, target in [("protected", "layer_protected"), ("locked", "layer_locked"), ("readOnly", "layer_readonly")]:
            guard = json.loads(json.dumps(raw["layers"][0])); guard.update({"id": target, flag: True, "visible": False}); raw["layers"].append(guard)
        raw["layers"].append({"id": "layer_shape", "type": "shape", "shape": "rect", "fill": "#000000", "visible": False, "transform": {"x": 0, "y": 0, "width": 10, "height": 10}})
        (seed / "document.json").write_text(json.dumps(raw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        run(binary, "set", seed, "--layer", layer, "--align", "left")
        run(binary, "preset", "define", seed, "--name", "justify", "--properties", '{"align":"justify"}')
        outputs = []
        for kind in ["cli", "http", "mcp"]:
            project = workspace / "projects" / kind; shutil.copytree(seed, project)
            details = evidence["transports"][kind] = {}
            with Client(kind, binary, workspace, kind, fonts) as client:
                outputs.append(scenarios(client, layer, details))
                ensure(client.doc()["layers"][0]["futureLayer"] == {"keep": True}, "Alignment loses unknown fields")
            with Client(kind, binary, workspace, kind, fonts) as client:
                ensure(client.doc()["layers"][0]["align"] == "justify" and client.png() == outputs[-1][0], "Reload changes alignment or PNG")
                details["reload"] = True
        ensure(outputs[0] == outputs[1] == outputs[2], "PNG bytes differ across transports")
        evidence.update({"ok": True, "pngParity": True, "binarySha256": hashlib.sha256(binary.read_bytes()).hexdigest(), "version": run(binary, "--version").strip()})
        print(json.dumps(evidence, separators=(",", ":"))); return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError, ValueError) as error:
        print(json.dumps({**evidence, "ok": False, "error": str(error)}, separators=(",", ":"))); return 1


if __name__ == "__main__":
    raise SystemExit(main())
