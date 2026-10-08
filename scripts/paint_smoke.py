#!/usr/bin/env python3
"""Compare paint and background-image writes across Assemblash transports.

Run with a fresh workspace and a built Assemblash binary. The script uses only
Python's standard library and emits one JSON object on stdout.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import shutil
import struct
import subprocess
import sys
import urllib.error
import urllib.request
import zlib
from pathlib import Path

from release_smoke import Mcp, Server, SmokeFailure, json_request, request, run


TIMEOUT = 30
PROJECT_ID = "paint"
GRADIENT = {
    "kind": "linear",
    "angle": 0.0,
    "stops": [
        {"offset": 0.0, "color": "#112233", "alpha": 1.0},
        {"offset": 1.0, "color": "#ddeeff", "alpha": 1.0},
    ],
}


def fail_run(binary: Path, *args: str) -> str:
    completed = subprocess.run(
        [str(binary), *map(str, args)],
        capture_output=True,
        text=True,
        timeout=TIMEOUT,
        check=False,
    )
    if completed.returncode == 0:
        raise SmokeFailure(f"command should have failed: {args!r}")
    return completed.stderr.strip()


def json_bytes(data: bytes, label: str) -> object:
    try:
        return json.loads(data)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"{label} returned invalid JSON: {data[:300]!r}") from error


def post_bytes(url: str, body: bytes, content_type: str) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def document_files(project: Path) -> tuple[bytes, bytes]:
    document = (project / "document.json").read_bytes()
    journal = project / "history" / "journal.jsonl"
    return document, journal.read_bytes() if journal.exists() else b""


def png_pixels(data: bytes) -> tuple[int, int, bytes]:
    """Decode the renderer's deterministic 8-bit RGBA PNG into pixel bytes."""
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise SmokeFailure("export is not a PNG")
    position = 8
    compressed = bytearray()
    width = height = None
    while position + 12 <= len(data):
        length = int.from_bytes(data[position : position + 4], "big")
        kind = data[position + 4 : position + 8]
        body = data[position + 8 : position + 8 + length]
        if len(body) != length:
            raise SmokeFailure("PNG contains a truncated chunk")
        if kind == b"IHDR":
            width, height = struct.unpack(">II", body[:8])
            if body[8:10] != b"\x08\x06" or body[12] != 0:
                raise SmokeFailure(f"expected non-interlaced 8-bit RGBA PNG: {body!r}")
        elif kind == b"IDAT":
            compressed.extend(body)
        elif kind == b"IEND":
            break
        position += length + 12
    if width is None or height is None:
        raise SmokeFailure("PNG has no image header")

    raw = zlib.decompress(compressed)
    stride = width * 4
    if len(raw) != height * (stride + 1):
        raise SmokeFailure("PNG scanline data has the wrong length")

    pixels = bytearray(height * stride)
    source = 0
    for y in range(height):
        filter_kind = raw[source]
        source += 1
        row_start = y * stride
        previous_start = row_start - stride
        for x in range(stride):
            value = raw[source]
            source += 1
            left = pixels[row_start + x - 4] if x >= 4 else 0
            above = pixels[previous_start + x] if y else 0
            upper_left = pixels[previous_start + x - 4] if y and x >= 4 else 0
            if filter_kind == 1:
                value += left
            elif filter_kind == 2:
                value += above
            elif filter_kind == 3:
                value += (left + above) // 2
            elif filter_kind == 4:
                base = left + above - upper_left
                distances = (abs(base - left), abs(base - above), abs(base - upper_left))
                predictor = left if distances[0] <= distances[1] and distances[0] <= distances[2] else (
                    above if distances[1] <= distances[2] else upper_left
                )
                value += predictor
            elif filter_kind != 0:
                raise SmokeFailure(f"PNG uses unknown row filter {filter_kind}")
            pixels[row_start + x] = value & 0xFF
    return width, height, bytes(pixels)


def write_test_png(path: Path) -> None:
    """Write a tiny valid PNG asset with no external image library."""
    def chunk(kind: bytes, body: bytes) -> bytes:
        return (
            struct.pack(">I", len(body))
            + kind
            + body
            + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)
        )

    rows = b"\x00" + bytes((255, 0, 0, 255, 0, 255, 0, 255))
    rows += b"\x00" + bytes((0, 0, 255, 255, 255, 255, 0, 255))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", 2, 2, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(rows))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def expected_failure(binary: Path, *args: str) -> dict[str, object]:
    completed = subprocess.run(
        [str(binary), *map(str, args)],
        capture_output=True,
        text=True,
        timeout=TIMEOUT,
        check=False,
    )
    if completed.returncode == 0:
        raise SmokeFailure(f"command should have refused the document: {args!r}")
    return {
        "exitCode": completed.returncode,
        "stderr": completed.stderr.strip(),
    }


def compatibility_checks(
    candidate: Path,
    baseline: Path,
    workspace: Path,
    assets: list[object],
    source_project: Path,
) -> dict[str, object]:
    version = run(baseline, "--version").strip()
    if version != "assemblash 1.10.0":
        raise SmokeFailure(f"baseline binary is {version!r}, expected assemblash 1.10.0")

    root = workspace / "compatibility"
    seed = root / "seed"
    run(candidate, "new", str(seed), "--width", "200", "--height", "120", "--background", "#102030")
    seed_document = json.loads((seed / "document.json").read_text(encoding="utf-8"))
    seed_document["assets"] = assets
    (seed / "document.json").write_text(json.dumps(seed_document, indent=2) + "\n", encoding="utf-8")
    for source in (source_project / "assets").rglob("*"):
        if source.is_file():
            target = seed / "assets" / source.relative_to(source_project / "assets")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)

    image_project = root / "with-background-image"
    solid_project = root / "solid-only"
    shutil.copytree(seed, image_project)
    shutil.copytree(seed, solid_project)
    image_document_path = image_project / "document.json"
    image_document = json.loads(image_document_path.read_text(encoding="utf-8"))
    image_document["canvas"]["backgroundImage"] = {"asset": assets[0]["id"], "fit": "contain"}
    image_document_path.write_text(json.dumps(image_document, indent=2) + "\n", encoding="utf-8")

    gradient_project = root / "gradient-background"
    run(candidate, "new", str(gradient_project), "--width", "200", "--height", "120")
    gradient_document_path = gradient_project / "document.json"
    gradient_document = json.loads(gradient_document_path.read_text(encoding="utf-8"))
    gradient_document["canvas"]["background"] = GRADIENT
    gradient_document_path.write_text(json.dumps(gradient_document, indent=2) + "\n", encoding="utf-8")

    old_show = expected_failure(baseline, "show", str(gradient_project))
    old_export = expected_failure(baseline, "export", str(gradient_project), str(root / "old-gradient.png"))
    old_image_show = json.loads(run(baseline, "show", str(image_project)))
    if old_image_show["canvas"].get("backgroundImage") != image_document["canvas"]["backgroundImage"]:
        raise SmokeFailure("1.10.0 did not preserve backgroundImage as an unknown canvas field")

    old_image_svg_path = root / "old-image.svg"
    old_solid_svg_path = root / "old-solid.svg"
    new_image_svg_path = root / "new-image.svg"
    new_solid_svg_path = root / "new-solid.svg"
    run(baseline, "render", str(image_project), str(old_image_svg_path))
    run(baseline, "render", str(solid_project), str(old_solid_svg_path))
    run(candidate, "render", str(image_project), str(new_image_svg_path))
    run(candidate, "render", str(solid_project), str(new_solid_svg_path))
    old_image_svg = old_image_svg_path.read_bytes()
    old_solid_svg = old_solid_svg_path.read_bytes()
    new_image_svg = new_image_svg_path.read_bytes()
    new_solid_svg = new_solid_svg_path.read_bytes()
    if old_image_svg != old_solid_svg:
        raise SmokeFailure("1.10.0 SVG changed when it saw the unknown backgroundImage field")
    if new_image_svg == new_solid_svg or b"<image" not in new_image_svg:
        raise SmokeFailure("1.11.0 SVG did not draw the background image")
    current_gradient = json.loads(run(candidate, "show", str(gradient_project)))
    if current_gradient["canvas"]["background"] != GRADIENT:
        raise SmokeFailure("1.11.0 did not read the gradient canvas background")

    written_project = root / "candidate-written-image"
    source = root / "candidate-image.png"
    write_test_png(source)
    run(candidate, "new", str(written_project), "--width", "200", "--height", "120")
    run(candidate, "add-image", str(written_project), "--file", str(source))
    prior_document = (written_project / "document.json").read_bytes()
    written_document = json.loads(prior_document)
    background_image = {"asset": written_document["assets"][0]["id"], "fit": "contain"}
    run(candidate, "canvas", "set", str(written_project),
        "--background-image", background_image["asset"], "--background-image-fit", "contain")
    journal = (written_project / "history" / "journal.jsonl").read_text(encoding="utf-8")
    if not any(json.loads(line).get("operation", {}).get("backgroundImage") == background_image
               for line in journal.splitlines()):
        raise SmokeFailure("candidate did not journal the canvas image operation")
    old_written = json.loads(run(baseline, "show", str(written_project)))
    if old_written["canvas"].get("backgroundImage") != background_image:
        raise SmokeFailure("1.10.0 did not open the candidate-written canvas image project")
    run(baseline, "render", str(written_project), str(root / "old-written-image.svg"))

    recovery = {}
    for label, binary in [("old", baseline), ("candidate", candidate)]:
        recovery_project = root / f"{label}-image-recovery"
        shutil.copytree(written_project, recovery_project)
        (recovery_project / "document.json").write_bytes(prior_document)
        recovered = json.loads(run(binary, "show", str(recovery_project)))
        recovery[label] = recovered["canvas"].get("backgroundImage") == background_image
    if not recovery["candidate"]:
        raise SmokeFailure("candidate recovery lost the journaled canvas image")

    return {
        "baselineVersion": version,
        "gradient": {
            "oldShowExitCode": old_show["exitCode"],
            "oldShowRefused": old_show["exitCode"] != 0,
            "oldExportExitCode": old_export["exitCode"],
            "oldExportRefused": old_export["exitCode"] != 0,
            "candidateShowAccepted": True,
        },
        "backgroundImage": {
            "oldShowPreservedUnknownField": True,
            "oldSvgIgnoredImage": hashlib.sha256(old_image_svg).hexdigest()
            == hashlib.sha256(old_solid_svg).hexdigest(),
            "candidateSvgIncludedImage": True,
            "oldOpenedCandidateJournal": True,
            "oldRecoveryPreservedImage": recovery["old"],
            "candidateRecoveryPreservedImage": recovery["candidate"],
        },
    }


def assert_mcp_refused(
    mcp: Mcp,
    name: str,
    arguments: object,
    expected_code: str = "operationRefused",
) -> None:
    try:
        result = mcp.call("tools/call", {"name": name, "arguments": arguments})
    except SmokeFailure as error:
        prefix = "MCP tools/call failed: "
        message = str(error)
        if not message.startswith(prefix):
            raise
        try:
            response_error = ast.literal_eval(message[len(prefix) :])
        except (SyntaxError, ValueError) as parse_error:
            raise SmokeFailure(f"MCP {name} returned an unreadable refusal: {message}") from parse_error
        if not isinstance(response_error, dict) or response_error.get("data", {}).get("code") != expected_code:
            raise SmokeFailure(f"MCP {name} returned an untyped refusal: {response_error!r}") from error
        return
    if not isinstance(result, dict) or not result.get("isError"):
        raise SmokeFailure(f"MCP {name} should have refused: {result!r}")
    if expected_code not in json.dumps(result):
        raise SmokeFailure(f"MCP {name} returned an untyped refusal: {result!r}")


def assert_http_refused(
    server: Server,
    operation: object,
    code: int = 422,
    expected_code: str = "operationRefused",
) -> None:
    status, body = json_request(
        server.base,
        "POST",
        f"/api/projects/{PROJECT_ID}/operations",
        {"operation": operation},
    )
    error = body.get("error") if isinstance(body, dict) else None
    if status != code or not isinstance(error, dict) or error.get("code") != expected_code:
        raise SmokeFailure(
            f"HTTP operation should return {code} with {expected_code}: {status} {body!r}"
        )


def apply_cli(binary: Path, project: Path, layer: str, paint_file: Path, image: str) -> None:
    run(
        binary,
        "canvas",
        "set",
        str(project),
        "--background",
        json.dumps(GRADIENT, separators=(",", ":")),
        "--background-image",
        image,
        "--background-image-fit",
        "contain",
    )
    run(
        binary,
        "set",
        str(project),
        "--layer",
        layer,
        "--fill",
        f"@{paint_file}",
        "--stroke",
        json.dumps(GRADIENT, separators=(",", ":")),
        "--stroke-width",
        "2",
    )


def apply_http(server: Server, layer: str, image: str) -> None:
    for operation in [
        {
            "op": "updateCanvas",
            "background": GRADIENT,
            "backgroundImage": {"asset": image, "fit": "contain"},
        },
        {
            "op": "update",
            "id": layer,
            "fill": GRADIENT,
            "stroke": {"color": GRADIENT, "width": 2.0},
        },
    ]:
        status, body = json_request(
            server.base,
            "POST",
            f"/api/projects/{PROJECT_ID}/operations",
            {"operation": operation},
        )
        if status != 200:
            raise SmokeFailure(f"HTTP paint operation failed: {status} {body!r}")


def apply_mcp(mcp: Mcp, layer: str, image: str) -> None:
    mcp.tool(
        "update_canvas",
        {
            "project": PROJECT_ID,
            "background": GRADIENT,
            "backgroundImage": {"asset": image, "fit": "contain"},
        },
    )
    mcp.tool(
        "update_layer",
        {
            "project": PROJECT_ID,
            "layerId": layer,
            "fill": GRADIENT,
            "stroke": {"color": GRADIENT, "width": 2.0},
        },
    )


def export_cli(binary: Path, project: Path, workspace: Path, label: str) -> tuple[bytes, bytes]:
    svg_path = workspace / f"{label}.svg"
    png_path = workspace / f"{label}.png"
    run(binary, "render", str(project), str(svg_path))
    run(binary, "export", str(project), str(png_path))
    return svg_path.read_bytes(), png_path.read_bytes()


def export_http(server: Server, label: str) -> tuple[bytes, bytes]:
    status, svg = request(
        server.base,
        "GET",
        f"/api/projects/{PROJECT_ID}/preview.svg",
    )
    if status != 200:
        raise SmokeFailure(f"HTTP SVG render failed: {status} {svg[:300]!r}")
    status, export_result = json_request(
        server.base,
        "POST",
        f"/api/projects/{PROJECT_ID}/export",
        {"name": label},
    )
    if status != 200:
        raise SmokeFailure(f"HTTP PNG export failed: {status} {export_result!r}")
    status, png = request(
        server.base,
        "GET",
        f"/api/projects/{PROJECT_ID}/exports/{label}.png",
    )
    if status != 200:
        raise SmokeFailure(f"HTTP PNG download failed: {status}")
    return svg, png


def export_mcp(mcp: Mcp, project: Path, label: str) -> tuple[bytes, bytes]:
    svg = mcp.tool("render_document", {"project": PROJECT_ID})
    if not isinstance(svg, dict) or not isinstance(svg.get("svg"), str):
        raise SmokeFailure(f"MCP SVG render returned no source: {svg!r}")
    result = mcp.tool("export_document", {"project": PROJECT_ID, "name": label})
    relative = result.get("path", f"exports/{label}.png") if isinstance(result, dict) else f"exports/{label}.png"
    path = project / relative
    if not path.is_file():
        raise SmokeFailure(f"MCP PNG export is missing: {path}")
    return svg["svg"].encode("utf-8"), path.read_bytes()


def undo_cli(binary: Path, project: Path) -> None:
    run(binary, "undo", str(project))
    run(binary, "undo", str(project))


def undo_http(server: Server) -> None:
    for _ in range(2):
        status, body = json_request(
            server.base,
            "POST",
            f"/api/projects/{PROJECT_ID}/undo",
            {},
        )
        if status != 200:
            raise SmokeFailure(f"HTTP undo failed: {status} {body!r}")


def undo_mcp(mcp: Mcp) -> None:
    for _ in range(2):
        mcp.tool("undo", {"project": PROJECT_ID})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--font", type=Path, help="accepted for parity with the other smoke scripts")
    parser.add_argument("--baseline-binary", type=Path)
    args = parser.parse_args()
    binary = args.binary.resolve()
    workspace = args.workspace.resolve()
    baseline_binary = args.baseline_binary.resolve() if args.baseline_binary else None
    evidence: dict[str, object] = {"binary": str(binary), "workspace": str(workspace)}
    server = None
    mcp = None
    try:
        if not binary.is_file():
            raise SmokeFailure(f"binary does not exist: {binary}")
        if baseline_binary is not None and not baseline_binary.is_file():
            raise SmokeFailure(f"baseline binary does not exist: {baseline_binary}")
        if workspace.exists() and any(workspace.iterdir()):
            raise SmokeFailure(f"workspace must be fresh and empty: {workspace}")
        workspace.mkdir(parents=True, exist_ok=True)
        run(binary, "workspace", "--workspace", str(workspace))
        project = workspace / "projects" / PROJECT_ID
        run(binary, "new", str(project), "--width", "200", "--height", "120")
        layer = run(
            binary,
            "add-rect",
            str(project),
            "--layer-name",
            "editable",
            "--x",
            "10",
            "--y",
            "10",
            "--width",
            "80",
            "--height",
            "50",
        ).strip()
        guard = run(
            binary,
            "add-rect",
            str(project),
            "--layer-name",
            "protected",
            "--x",
            "110",
            "--y",
            "10",
            "--width",
            "70",
            "--height",
            "50",
        ).strip()

        # Seed one protected layer in the smoke fixture. No transport exposes
        # a command that turns the protection flag off after it is set.
        document_path = project / "document.json"
        fixture = json.loads(document_path.read_text(encoding="utf-8"))
        protected = next(item for item in fixture["layers"] if item["id"] == guard)
        protected["protected"] = True
        document_path.write_text(json.dumps(fixture, indent=2) + "\n", encoding="utf-8")

        server = Server.start(binary, workspace)
        asset_file = workspace / "swatch.png"
        write_test_png(asset_file)
        status, uploaded = post_bytes(
            server.base + f"/api/projects/{PROJECT_ID}/assets?filename=swatch.png",
            asset_file.read_bytes(),
            "image/png",
        )
        if status != 201:
            raise SmokeFailure(f"asset upload failed: {status} {uploaded[:200]!r}")
        uploaded_json = json_bytes(uploaded, "asset upload")
        image_asset = uploaded_json["asset"]["id"]
        server.close()
        server = None
        baseline = document_files(project)

        paint_file = workspace / "paint.json"
        paint_file.write_text(json.dumps(GRADIENT), encoding="utf-8")
        broken_paint_file = workspace / "broken-paint.json"
        broken_paint_file.write_text('{"kind":', encoding="utf-8")

        apply_cli(binary, project, layer, paint_file, image_asset)
        cli_version = json.loads(run(binary, "show", str(project)))["version"]
        current = document_files(project)
        fail_run(binary, "set", str(project), "--layer", layer, "--fill", f"@{broken_paint_file}")
        fail_run(binary, "canvas", "set", str(project), "--background-image", image_asset, "--clear-background-image")
        fail_run(binary, "canvas", "set", str(project), "--background-image", "asset_missing")
        fail_run(binary, "set", str(project), "--layer", guard, "--fill", "#ff0000")
        fail_run(binary, "set", str(project), "--layer", layer, "--fill", "#00ff00", "--expect-version", str(cli_version - 1))
        if document_files(project) != current:
            raise SmokeFailure("a refused CLI paint write changed document or journal bytes")
        cli_svg, cli_png = export_cli(binary, project, workspace, "cli-paint")
        undo_cli(binary, project)
        if (project / "document.json").read_bytes() != baseline[0]:
            raise SmokeFailure("CLI undo did not restore document bytes")

        server = Server.start(binary, workspace)
        apply_http(server, layer, image_asset)
        _, document = json_request(server.base, "GET", f"/api/projects/{PROJECT_ID}/document")
        http_version = document["version"]
        http_current = document_files(project)

        assert_http_refused(
            server,
            {"op": "updateCanvas", "backgroundImage": {"asset": image_asset}, "clearBackgroundImage": True},
        )
        assert_http_refused(server, {"op": "updateCanvas", "backgroundImage": {"asset": "asset_missing"}})
        assert_http_refused(server, {"op": "update", "id": guard, "fill": "#ff0000"})
        dry_status, dry = json_request(
            server.base,
            "POST",
            f"/api/projects/{PROJECT_ID}/operations",
            {
                "operation": {"op": "update", "id": layer, "fill": "#ff0000"},
                "dryRun": True,
                "expectedVersion": http_version,
            },
        )
        if dry_status != 200 or dry.get("dryRun") is not True:
            raise SmokeFailure(f"HTTP dry run failed: {dry_status} {dry!r}")
        stale_status, stale = json_request(
            server.base,
            "POST",
            f"/api/projects/{PROJECT_ID}/operations",
            {
                "operation": {"op": "update", "id": layer, "fill": "#ff0000"},
                "expectedVersion": http_version - 1,
            },
        )
        if (
            stale_status != 409
            or not isinstance(stale, dict)
            or not isinstance(stale.get("error"), dict)
            or stale["error"].get("code") != "versionConflict"
        ):
            raise SmokeFailure(
                f"HTTP stale version should return 409 with versionConflict: {stale_status} {stale!r}"
            )
        if document_files(project) != http_current:
            raise SmokeFailure("a refused or dry-run HTTP paint write changed document or journal bytes")
        http_svg, http_png = export_http(server, "http-paint")
        undo_http(server)
        if (project / "document.json").read_bytes() != baseline[0]:
            raise SmokeFailure("HTTP undo did not restore document bytes")
        server.close()
        server = None

        mcp = Mcp.start(binary, workspace)
        mcp.tool("open_project", {"project": PROJECT_ID})
        mcp_before_image = document_files(project)
        mcp.tool(
            "update_canvas",
            {"project": PROJECT_ID, "backgroundImage": {"asset": image_asset}},
        )
        default_fit = mcp.tool("get_document_state", {"project": PROJECT_ID})
        if default_fit["document"]["canvas"]["backgroundImage"].get("fit") != "fill":
            raise SmokeFailure("MCP background image did not default to fill")
        mcp.tool(
            "update_canvas",
            {"project": PROJECT_ID, "clearBackgroundImage": True},
        )
        cleared = mcp.tool("get_document_state", {"project": PROJECT_ID})
        if cleared["document"]["canvas"].get("backgroundImage") is not None:
            raise SmokeFailure("MCP clearBackgroundImage did not remove the image")
        mcp.tool("undo", {"project": PROJECT_ID})
        restored_image = mcp.tool("get_document_state", {"project": PROJECT_ID})
        if restored_image["document"]["canvas"]["backgroundImage"].get("fit") != "fill":
            raise SmokeFailure("MCP undo did not restore the default-fit image")
        mcp.tool("undo", {"project": PROJECT_ID})
        if document_files(project)[0] != mcp_before_image[0]:
            raise SmokeFailure("MCP background image set and clear undo did not restore document bytes")
        apply_mcp(mcp, layer, image_asset)
        state = mcp.tool("get_document_state", {"project": PROJECT_ID})
        mcp_version = state["version"]
        mcp_current = document_files(project)
        assert_mcp_refused(
            mcp,
            "update_canvas",
            {
                "project": PROJECT_ID,
                "backgroundImage": {"asset": image_asset},
                "clearBackgroundImage": True,
            },
        )
        assert_mcp_refused(
            mcp,
            "update_canvas",
            {"project": PROJECT_ID, "backgroundImage": {"asset": "asset_missing"}},
        )
        assert_mcp_refused(
            mcp,
            "update_layer",
            {"project": PROJECT_ID, "layerId": guard, "fill": "#ff0000"},
        )
        dry = mcp.tool(
            "update_layer",
            {
                "project": PROJECT_ID,
                "layerId": layer,
                "fill": "#ff0000",
                "dryRun": True,
                "expectedVersion": mcp_version,
            },
        )
        if dry.get("dryRun") is not True or dry.get("version") != mcp_version:
            raise SmokeFailure(f"MCP dry run returned an unexpected result: {dry!r}")
        assert_mcp_refused(
            mcp,
            "update_layer",
            {
                "project": PROJECT_ID,
                "layerId": layer,
                "fill": "#ff0000",
                "expectedVersion": mcp_version - 1,
            },
            expected_code="versionConflict",
        )
        if document_files(project) != mcp_current:
            raise SmokeFailure("a refused or dry-run MCP paint write changed document or journal bytes")
        mcp_svg, mcp_png = export_mcp(mcp, project, "mcp-paint")
        undo_mcp(mcp)
        if (project / "document.json").read_bytes() != baseline[0]:
            raise SmokeFailure("MCP undo did not restore document bytes")
        mcp.close()
        mcp = None

        if baseline_binary is not None:
            original_document = json.loads(baseline[0])
            evidence["baselineCompatibility"] = compatibility_checks(
                binary,
                baseline_binary,
                workspace,
                original_document["assets"],
                project,
            )

        if not (cli_svg == http_svg == mcp_svg):
            raise SmokeFailure("CLI, HTTP, and MCP SVG bytes differ")
        if not (cli_png == http_png == mcp_png):
            raise SmokeFailure("CLI, HTTP, and MCP PNG bytes differ")
        dimensions = []
        pixel_hashes = []
        for png in [cli_png, http_png, mcp_png]:
            width, height, pixels = png_pixels(png)
            dimensions.append((width, height))
            pixel_hashes.append(hashlib.sha256(pixels).hexdigest())
        if len(set(dimensions)) != 1 or len(set(pixel_hashes)) != 1:
            raise SmokeFailure(f"raster pixels differ: dimensions={dimensions}, hashes={pixel_hashes}")

        evidence.update(
            {
                "ok": True,
                "svgSha256": hashlib.sha256(cli_svg).hexdigest(),
                "pngSha256": hashlib.sha256(cli_png).hexdigest(),
                "pixelSha256": pixel_hashes[0],
                "dimensions": list(dimensions[0]),
                "equalAcrossTransports": True,
                "undoRestoredBytes": True,
                "mcpBackgroundImageClearUndo": True,
                "refusalsAndDryRunsPreservedBytes": True,
            }
        )
        print(json.dumps(evidence, separators=(",", ":")))
        return 0
    except (SmokeFailure, subprocess.TimeoutExpired, OSError, KeyError, TypeError, ValueError) as error:
        print(json.dumps({**evidence, "ok": False, "error": str(error)}, separators=(",", ":")))
        return 1
    finally:
        errors = []
        if mcp is not None:
            try:
                mcp.close()
            except (SmokeFailure, OSError) as error:
                errors.append(str(error))
                if mcp.process.poll() is None:
                    mcp.process.kill()
        if server is not None:
            try:
                server.close()
            except (SmokeFailure, OSError) as error:
                errors.append(str(error))
                if server.process.poll() is None:
                    server.process.kill()
        if errors:
            print(json.dumps({"ok": False, "teardownError": "; ".join(errors)}, separators=(",", ":")), file=sys.stderr)
            raise SystemExit(1)


if __name__ == "__main__":
    raise SystemExit(main())
