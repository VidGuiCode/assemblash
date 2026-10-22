#!/usr/bin/env python3
"""Verify paragraph spacing through the actual CLI, HTTP API, and MCP server."""
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

BODY = "\nA bold\n\nLast\n"
RUNS = [{"text": "\nA ", "future": {"keep": [1, 2]}},
        {"text": "bold", "fontWeight": 700, "fontSize": 40, "color": "#336699"},
        {"text": "\n\nLast\n", "fontSize": 20}]


def scenarios(client: Client, layer: str, evidence: dict) -> tuple[bytes, bytes]:
    selected = lambda: next(item for item in client.doc()["layers"] if item["id"] == layer)
    seed=(client.project/"document.json").read_bytes()
    for value in [4.5,-1]:
        values={"text":"Made\nAgain","fontFamily":"Noto Sans","fontSize":24,"paragraphSpacing":value}
        geometry={"x":20,"y":20,"width":400,"height":100}
        if client.kind=="cli":
            command=["add-text",client.project,"--text",values["text"],"--font","Noto Sans","--size","24","--paragraph-spacing",str(value),"--x","20","--y","20","--width","400","--height","100"]
            cli_refusal(client.binary,*command) if value<0 else run(client.binary,*command)
        elif client.server:
            status,result=json_request(client.server.base,"POST",client.prefix+"/operations",{"operation":{"op":"create","type":"text","transform":geometry,**values}})
            ensure(status>=400 if value<0 else status==200,f"HTTP creation: {status} {result}")
        else:
            args={"project":client.name,**geometry,**values}
            mcp_refusal(client.mcp,"add_text_layer",args) if value<0 else client.mcp.tool("add_text_layer",args)
        if value>=0:
            ensure(client.doc()["layers"][-1]["paragraphSpacing"]==value,"Creation loses spacing")
            client.history("undo")
        ensure((client.project/"document.json").read_bytes()==seed,"Creation or refusal loses source bytes")
    before = durable(client.project)
    version = client.doc()["version"]
    client.update(layer, {"paragraphSpacing": 2}, refuse=True, code="versionConflict", version=version-1)
    ensure(durable(client.project) == before, "Stale spacing changes durable bytes")
    if client.kind != "cli":
        result = client.update(layer, {"paragraphSpacing": 2}, dry=True, version=version)
        ensure(result.get("dryRun") is True and durable(client.project) == before, "Dry run changes durable bytes")
    for target in ["layer_protected", "layer_locked", "layer_readonly", "layer_shape"]:
        client.update(target, {"paragraphSpacing": 2}, refuse=True)
        ensure(durable(client.project) == before, f"Guard changes bytes: {target}")
    for invalid in [-1, "bad"]:
        client.update(layer, {"paragraphSpacing": invalid}, refuse=True)
        ensure(durable(client.project) == before, f"Invalid spacing changes bytes: {invalid}")
    layouts = []
    for value in [0, 17.25]:
        client.update(layer, {"paragraphSpacing": value})
        ensure(selected().get("paragraphSpacing", 0) == value, "Spacing read-back differs")
        ensure(selected()["runs"] == RUNS, "Spacing changes raw runs")
        if client.server:
            status, layout = json_request(client.server.base, "GET", client.prefix + f"/text-layout?id={layer}&width=500")
            ensure(status == 200 and set(layout) == {"lineCount", "height"}, f"Layout contract differs: {layout}")
            layouts.append(layout)
    if layouts:
        ensure(layouts[1]["lineCount"] == layouts[0]["lineCount"] == 5, "Explicit empty paragraphs disappear")
        ensure(abs(layouts[1]["height"]-layouts[0]["height"]-69) < 1e-9, "Paragraph metric delta differs")
        evidence["layouts"] = layouts
    spaced = (client.project / "document.json").read_bytes()
    client.history("undo")
    ensure(selected().get("paragraphSpacing", 0) == 0, "Undo retains spacing")
    client.history("redo")
    ensure((client.project / "document.json").read_bytes() == spaced, "Redo changes document bytes")
    styled_png = client.png()
    client.update(layer, {"runs": []})
    plain_png = client.png()
    if client.server:
        status,preview=request(client.server.base,"GET",client.prefix+"/preview.png")
        ensure(status==200 and preview==plain_png,"Plain preview differs from export")
    client.update(layer,{"paragraphSpacing":1e308})
    if client.kind=="cli":
        refused=client.workspace/"refused-geometry.png"
        diagnostic=cli_refusal(client.binary,"export",client.project,refused,"--font-store",client.fonts)
        ensure("finite render coordinates" in diagnostic and not refused.exists(),"CLI geometry refusal differs")
    elif client.server:
        status,refusal=json_request(client.server.base,"GET",client.prefix+"/preview.svg")
        ensure(status==422 and refusal.get("error",{}).get("code")=="invalidTextGeometry",f"HTTP geometry refusal differs: {refusal}")
    else:
        mcp_refusal(client.mcp,"render_document",{"project":client.name},"invalidTextGeometry")
    client.history("undo")
    client.history("undo")
    ensure((client.project / "document.json").read_bytes() == spaced, "Plain control undo loses runs")
    if client.server:
        status,preview=request(client.server.base,"GET",client.prefix+"/preview.png")
        ensure(status==200 and preview==styled_png,"Styled preview differs from export")
    if client.mcp:
        tools=client.mcp.call("tools/list", {})["tools"]
        for name in ["add_text_layer", "update_layer"]:
            schema=next(item["inputSchema"] for item in tools if item["name"] == name)
            ensure("paragraphSpacing" in schema["properties"], f"{name} hides spacing")
    evidence.update({"creation":True,"geometryRefusal":True,"guards": True, "atomicRefusal": True, "staleVersion": True,
        "dryRun": client.kind != "cli", "readBack": True, "rawRuns": True, "undoRedoBytes": True,
        "styledPngSha256": hashlib.sha256(styled_png).hexdigest(), "plainPngSha256": hashlib.sha256(plain_png).hexdigest()})
    return styled_png, plain_png


def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary",required=True,type=Path)
    parser.add_argument("--workspace",required=True,type=Path)
    args=parser.parse_args()
    binary,workspace=args.binary.resolve(),args.workspace.resolve()
    evidence={"check":"paragraphSpacing","executed":True,"transports":{}}
    try:
        ensure(not workspace.exists() or not any(workspace.iterdir()),"Workspace must be empty")
        workspace.mkdir(parents=True,exist_ok=True)
        for key in ["ASSEMBLASH_FONT_STORE","ASSEMBLASH_WORKSPACE","ASSEMBLASH_BIND","ASSEMBLASH_TOKEN"]:
            os.environ.pop(key,None)
        run(binary,"workspace","--workspace",workspace)
        (workspace/"config.toml").write_text("port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n",encoding="utf-8")
        fonts=workspace/"fonts"
        fixture=Path(__file__).resolve().parents[1]/"crates/assemblash-renderer/tests/fonts"
        for name in ["NotoSans-Subset.ttf","NotoSans-Bold-Subset.ttf"]:
            run(binary,"font","add",fixture/name,"--license","OFL-1.1","--font-store",fonts)
        seed=workspace/"seed"
        run(binary,"new",seed,"--width","600","--height","340","--background","#ffffff")
        layer=run(binary,"add-text",seed,"--text",BODY,"--font","Noto Sans","--size","32",
            "--x","24","--y","24","--width","500","--height","260","--paragraph-spacing","3.5").strip()
        raw=json.loads((seed/"document.json").read_text(encoding="utf-8"))
        ensure(raw["layers"][0]["paragraphSpacing"]==3.5,"CLI creation loses spacing")
        raw["layers"][0]["runs"]=RUNS
        raw["layers"][0]["futureLayer"]={"keep":True}
        for flag,target in [("protected","layer_protected"),("locked","layer_locked"),("readOnly","layer_readonly")]:
            guard=json.loads(json.dumps(raw["layers"][0])); guard.update({"id":target,flag:True,"visible":False}); raw["layers"].append(guard)
        raw["layers"].append({"id":"layer_shape","type":"shape","shape":"rect","fill":"#000000","visible":False,"transform":{"x":0,"y":0,"width":10,"height":10}})
        (seed/"document.json").write_text(json.dumps(raw,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        run(binary,"set",seed,"--layer",layer,"--paragraph-spacing","0")
        run(binary,"preset","define",seed,"--name","zero","--properties",'{"paragraphSpacing":0}')
        run(binary,"set",seed,"--layer",layer,"--paragraph-spacing","3")
        run(binary,"preset","apply",seed,"--layer",layer,"--preset","zero")
        ensure(json.loads((seed/"document.json").read_text())["layers"][0].get("paragraphSpacing",0)==0,"Preset zero does not reset")
        outputs=[]
        for kind in ["cli","http","mcp"]:
            project=workspace/"projects"/kind; shutil.copytree(seed,project)
            details=evidence["transports"][kind]={}
            with Client(kind,binary,workspace,kind,fonts) as client:
                outputs.append(scenarios(client,layer,details))
                ensure(client.doc()["layers"][0]["futureLayer"]=={"keep":True},"Spacing loses unknown layer fields")
            with Client(kind,binary,workspace,kind,fonts) as client:
                ensure(client.doc()["layers"][0]["paragraphSpacing"]==17.25,"Reload loses spacing")
                ensure(client.png()==outputs[-1][0],"Reload changes PNG")
                details["reload"]=True
        ensure(outputs[0]==outputs[1]==outputs[2],"PNG bytes differ across transports")
        evidence.update({"ok":True,"pngParity":True,"presetsResetZero":True,"binarySha256":hashlib.sha256(binary.read_bytes()).hexdigest(),"version":run(binary,"--version").strip()})
        print(json.dumps(evidence,separators=(",",":"))); return 0
    except (SmokeFailure,subprocess.TimeoutExpired,OSError,KeyError,TypeError,ValueError) as error:
        print(json.dumps({**evidence,"ok":False,"error":str(error)},separators=(",",":"))); return 1


if __name__=="__main__":
    raise SystemExit(main())
