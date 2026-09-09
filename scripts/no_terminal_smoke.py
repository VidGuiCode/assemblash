#!/usr/bin/env python3
"""No-terminal smoke for a packaged Assemblash binary (the 1.5.0 rung).

Everything the 1.5.0 exit test asks for that a script can check without a
browser, against one built binary and one fresh workspace:

* **fonts** — `GET /api/fonts` on an empty workspace, `POST /api/fonts` with
  the bytes of a font file, the family coming back in the listing with at
  least one face, and an export that uses it (exit-test item 2, offline half
  of item 1).
* **removal** — `DELETE /api/fonts/{family}`, an export that then refuses
  *typed* rather than drawing nothing, re-import, and an export whose bytes
  are byte-identical to the first one (item 2's determinism claim).
* **svgText** — the DEF-2 typed refusal: an imported SVG asset that draws
  `<text>` with no font loaded refuses over HTTP with `renderFailed`, naming
  the asset and the family, and refuses non-zero on the CLI (item 4).
* **staleLock** — D23: `serve --reclaim-stale-locks` clears a lock left by a
  dead process *on this machine* and reports it once as `reclaimedLock`;
  a lock naming another machine, and a lock naming none, are both left alone
  and answer `409 projectLocked` (item 3).
* **install** — `--online` only: `POST /api/fonts/install {"pack":"default"}`
  brings in the pack's three families. Skipped by default, because a smoke
  test that needs the network is not one a release run can rely on.

The workspace must be fresh. The script uses only Python's standard library
and emits one JSON object on stdout; every failure prints the response body
that caused it.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from release_smoke import TIMEOUT, SmokeFailure, json_request, request, run


LOCK_FILE = ".assemblash-lock"

# An SVG that draws text in a family nothing will ever have installed. The
# markup is inline rather than a fixture file because it is the *subject* of
# the assertion below — a reader should not have to open a second file to see
# what is being refused.
SVG_ASSET_TEXT = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">'
    '<text x="10" y="50" font-family="Nowhere Sans" font-size="32">Hello</text>'
    "</svg>"
)
MISSING_FAMILY = "Nowhere Sans"

# What a font error may be called. Either the store refuses the family before
# the renderer is reached, or the renderer refuses the layer; both are typed
# font errors, and neither is a 500. Anything else is the finding.
FONT_ERROR_CODES = {"missingFont", "unknownFontFamily"}


def expect(status: int, wanted: int | set[int], body: object, action: str) -> None:
    """Fails with the response body when a status is not what was promised."""
    allowed = wanted if isinstance(wanted, set) else {wanted}
    if status not in allowed:
        raise SmokeFailure(
            f"{action} returned {status}, expected {sorted(allowed)}: {body!r}"
        )


def upload(
    base: str,
    path: str,
    content_type: str,
    data: bytes,
    timeout: float = TIMEOUT,
) -> tuple[int, object]:
    """POSTs raw bytes and reads the whole reply, the way a browser upload does."""
    req = urllib.request.Request(base + path, data=data, method="POST")
    req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status, body = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, body = error.code, error.read()
    try:
        return status, json.loads(body)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"POST {path} returned non-JSON: {body[:300]!r}") from error


def error_of(body: object) -> tuple[str, str]:
    """The typed `code` and `message` of an API refusal."""
    if not isinstance(body, dict) or not isinstance(body.get("error"), dict):
        raise SmokeFailure(f"refusal is not a typed error: {body!r}")
    error = body["error"]
    return str(error.get("code", "")), str(error.get("message", ""))


class Serve:
    """One `assemblash serve`, on a free port, with the flags a step needs.

    `release_smoke.Server` always passes `--friendly`, and `--friendly`
    implies `--reclaim-stale-locks` — so the lock steps below, which have to
    run the server both with and without that flag, cannot use it. This is
    the same class with the flags opened up: a free port, a bounded wait on
    `/api/version`, and a stop that asks over HTTP first.
    """

    def __init__(
        self,
        binary: Path,
        workspace: Path,
        flags: tuple[str, ...] = (),
        friendly: bool = False,
        log: Path | None = None,
    ):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            self.port = probe.getsockname()[1]
        argv = [
            str(binary),
            "serve",
            "--workspace",
            str(workspace),
            "--port",
            str(self.port),
            *flags,
        ]
        if friendly:
            argv.append("--friendly")
        self.friendly = friendly
        self.log = log
        self.log_handle = log.open("wb") if log else None
        creation = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        self.process = subprocess.Popen(
            argv,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=self.log_handle or subprocess.DEVNULL,
            creationflags=creation,
        )
        self.base = f"http://127.0.0.1:{self.port}"
        deadline = time.monotonic() + TIMEOUT
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise SmokeFailure(
                    f"server exited during startup ({self.process.returncode}): "
                    f"{self.diagnostic()}"
                )
            try:
                status, _ = request(
                    self.base,
                    "GET",
                    "/api/version",
                    timeout=max(0.1, deadline - time.monotonic()),
                )
                if status == 200:
                    return
            except (urllib.error.URLError, TimeoutError, OSError):
                pass
            time.sleep(0.1)
        raise SmokeFailure(
            f"server did not answer /api/version within {TIMEOUT} seconds: "
            f"{self.diagnostic()}"
        )

    def diagnostic(self) -> str:
        """The tail of what the server said, for a failure message."""
        if self.log_handle:
            self.log_handle.flush()
        if not self.log or not self.log.is_file():
            return "(no server log)"
        return self.log.read_text(encoding="utf-8", errors="replace").strip()[-500:]

    @classmethod
    def start(
        cls,
        binary: Path,
        workspace: Path,
        flags: tuple[str, ...] = (),
        friendly: bool = False,
        log: Path | None = None,
    ) -> "Serve":
        server = cls.__new__(cls)
        try:
            cls.__init__(server, binary, workspace, flags, friendly, log)
        except BaseException:
            try:
                server.close()
            except (SmokeFailure, OSError, AttributeError):
                pass
            raise
        return server

    def close(self) -> None:
        """Stops the server: over HTTP where that is allowed, else by signal.

        `POST /api/shutdown` is refused unless the server was started
        `--friendly`, which is exactly the servers the lock steps must not
        use. Terminating those is not a workaround for a broken shutdown —
        it is the only stop they have, and it is also what step 4 is about.
        """
        try:
            if self.process.poll() is None:
                stopped = False
                try:
                    status, body = json_request(self.base, "POST", "/api/shutdown", {})
                    if status == 200 and body == {"stopping": True}:
                        stopped = True
                    elif not (status == 403 and error_of(body)[0] == "shutdownRefused"):
                        raise SmokeFailure(
                            f"graceful shutdown answered {status}: {body!r}"
                        )
                except (urllib.error.URLError, TimeoutError, OSError):
                    pass
                if not stopped:
                    if self.friendly:
                        raise SmokeFailure(
                            "a --friendly server refused POST /api/shutdown"
                        )
                    self.process.terminate()
                try:
                    self.process.wait(timeout=TIMEOUT)
                except subprocess.TimeoutExpired as error:
                    self.process.kill()
                    raise SmokeFailure("server did not exit when asked to stop") from error
        finally:
            if self.log_handle:
                self.log_handle.close()
                self.log_handle = None


def dead_pid() -> int:
    """A pid that is provably not running: a child spawned only to exit."""
    child = subprocess.Popen(
        [sys.executable, "-c", "pass"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    child.wait(timeout=TIMEOUT)
    return child.pid


def write_lock(project: Path, contents: dict[str, object]) -> None:
    (project / LOCK_FILE).write_text(
        json.dumps(contents, separators=(",", ":")), encoding="utf-8"
    )


def read_lock(project: Path) -> dict[str, object]:
    path = project / LOCK_FILE
    if not path.is_file():
        raise SmokeFailure(f"no lock file at {path}: the server did not hold it open")
    text = path.read_text(encoding="utf-8")
    try:
        contents = json.loads(text)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"lock file is not JSON: {text!r}") from error
    if not isinstance(contents, dict):
        raise SmokeFailure(f"lock file is not a JSON object: {text!r}")
    return contents


def fonts_step(
    server: Serve, workspace: Path, font: Path
) -> tuple[dict[str, object], str, bytes]:
    """Item 2's first half: an empty store, an import, and an export using it."""
    status, listing = json_request(server.base, "GET", "/api/fonts")
    expect(status, 200, listing, "GET /api/fonts on a fresh workspace")
    if listing.get("families") != []:
        raise SmokeFailure(f"a fresh workspace already has fonts: {listing!r}")

    name = urllib.parse.quote(font.name)
    status, imported = upload(
        server.base,
        f"/api/fonts?filename={name}",
        "font/ttf",
        font.read_bytes(),
    )
    expect(status, 201, imported, f"POST /api/fonts?filename={font.name}")
    records = imported.get("imported")
    if not isinstance(records, list) or not records:
        raise SmokeFailure(f"import reported no faces: {imported!r}")
    family = records[0].get("family")
    if not isinstance(family, str) or not family:
        raise SmokeFailure(f"import reported no family: {imported!r}")

    status, listing = json_request(server.base, "GET", "/api/fonts")
    expect(status, 200, listing, "GET /api/fonts after an import")
    if family not in listing.get("families", []):
        raise SmokeFailure(f"{family!r} is not in the listing: {listing!r}")
    faces = [face for face in listing.get("faces", []) if face.get("family") == family]
    if not faces:
        raise SmokeFailure(f"{family!r} is listed with no faces: {listing!r}")

    status, created = json_request(
        server.base,
        "POST",
        "/api/projects",
        {"id": "fonts", "width": 200.0, "height": 100.0, "background": "#ffffff"},
    )
    expect(status, 201, created, "POST /api/projects")

    status, applied = json_request(
        server.base,
        "POST",
        "/api/projects/fonts/operations",
        {
            "operation": {
                "op": "create",
                "position": {"at": "root"},
                "transform": {"x": 10.0, "y": 10.0, "width": 180.0, "height": 60.0},
                "type": "text",
                "text": "No terminal",
                "fontFamily": family,
                "fontSize": 24.0,
            }
        },
    )
    expect(status, 200, applied, "POST /api/projects/fonts/operations (text layer)")

    png = export(server, workspace, "fonts", "first")
    return {
        "status": "passed",
        "family": family,
        "faces": len(faces),
        "export": {"bytes": len(png), "sha256": hashlib.sha256(png).hexdigest()},
    }, family, png


def export(server: Serve, workspace: Path, project: str, name: str) -> bytes:
    """Exports and reads the file back off disk, so "it exists" is checked."""
    status, exported = json_request(
        server.base, "POST", f"/api/projects/{project}/export", {"name": name}
    )
    expect(status, 200, exported, f"POST /api/projects/{project}/export ({name})")
    path = workspace / "projects" / project / "exports" / f"{name}.png"
    if not path.is_file():
        raise SmokeFailure(f"export reported success but wrote no file: {path}")
    png = path.read_bytes()
    if not png:
        raise SmokeFailure(f"export wrote an empty file: {path}")
    if exported.get("bytes") != len(png):
        raise SmokeFailure(
            f"export said {exported.get('bytes')!r} bytes, file has {len(png)}: {path}"
        )
    return png


def removal_step(
    server: Serve, workspace: Path, font: Path, family: str, first: bytes
) -> dict[str, object]:
    """Item 2's second half: remove, refuse typed, re-import, same bytes."""
    quoted = urllib.parse.quote(family, safe="")
    status, removed = json_request(server.base, "DELETE", f"/api/fonts/{quoted}")
    expect(status, 200, removed, f"DELETE /api/fonts/{family}")
    if family in removed.get("families", []):
        raise SmokeFailure(f"{family!r} survived its own removal: {removed!r}")

    refused_status, refused = json_request(
        server.base, "POST", "/api/projects/fonts/export", {"name": "removed"}
    )
    if refused_status == 200:
        raise SmokeFailure(
            "exporting without the font succeeded; a missing font must refuse, "
            f"not draw nothing: {refused!r}"
        )
    if refused_status >= 500:
        raise SmokeFailure(
            f"a missing font is a {refused_status}, not a typed refusal: {refused!r}"
        )
    code, message = error_of(refused)
    if code not in FONT_ERROR_CODES:
        raise SmokeFailure(
            f"a missing font refused as {code!r}, expected one of "
            f"{sorted(FONT_ERROR_CODES)}: {message}"
        )
    if (workspace / "projects" / "fonts" / "exports" / "removed.png").exists():
        raise SmokeFailure("a refused export wrote a PNG")

    name = urllib.parse.quote(font.name)
    reimport_status, reimported = upload(
        server.base,
        f"/api/fonts?filename={name}",
        "font/ttf",
        font.read_bytes(),
    )
    expect(reimport_status, {200, 201}, reimported, "POST /api/fonts (re-import)")
    if family not in reimported.get("families", []):
        raise SmokeFailure(f"{family!r} did not come back: {reimported!r}")

    second = export(server, workspace, "fonts", "second")
    digests = (hashlib.sha256(first).hexdigest(), hashlib.sha256(second).hexdigest())
    if digests[0] != digests[1]:
        raise SmokeFailure(
            "the export after a remove-and-reimport is not byte-identical: "
            f"{digests[0]} then {digests[1]}"
        )
    return {
        "status": "passed",
        "refusal": {"status": refused_status, "code": code, "message": message},
        "reimportStatus": reimport_status,
        "sha256": {"first": digests[0], "second": digests[1], "identical": True},
    }


def svg_text_step(server: Serve, workspace: Path) -> tuple[dict[str, object], str, str]:
    """Item 4 (DEF-2): an SVG asset drawing text with no font loaded refuses."""
    status, created = json_request(
        server.base,
        "POST",
        "/api/projects",
        {"id": "svgtext", "width": 200.0, "height": 80.0},
    )
    expect(status, 201, created, "POST /api/projects (svgtext)")

    status, uploaded = upload(
        server.base,
        "/api/projects/svgtext/assets?filename=label.svg",
        "image/svg+xml",
        SVG_ASSET_TEXT.encode("utf-8"),
    )
    expect(status, 201, uploaded, "POST /api/projects/svgtext/assets")
    asset = uploaded.get("asset", {}).get("id")
    if not isinstance(asset, str) or not asset:
        raise SmokeFailure(f"upload reported no asset id: {uploaded!r}")

    status, applied = json_request(
        server.base,
        "POST",
        "/api/projects/svgtext/operations",
        {
            "operation": {
                "op": "create",
                "position": {"at": "root"},
                "transform": {"x": 0.0, "y": 0.0, "width": 200.0, "height": 80.0},
                "type": "svg",
                "asset": asset,
                "fit": "fill",
            }
        },
    )
    expect(status, 200, applied, "POST /api/projects/svgtext/operations (svg layer)")

    status, refused = json_request(
        server.base, "POST", "/api/projects/svgtext/export", {"name": "svg-refused"}
    )
    expect(status, 422, refused, "POST /api/projects/svgtext/export")
    code, message = error_of(refused)
    if code != "renderFailed":
        raise SmokeFailure(f"the DEF-2 refusal is {code!r}, expected 'renderFailed': {message}")
    for wanted in (asset, MISSING_FAMILY):
        if wanted not in message:
            raise SmokeFailure(f"the refusal does not name {wanted!r}: {message}")
    written = workspace / "projects" / "svgtext" / "exports" / "svg-refused.png"
    if written.exists():
        raise SmokeFailure(f"a refused export wrote a PNG: {written}")

    return (
        {"status": "passed", "asset": asset, "http": {"status": 422, "code": code, "message": message}},
        asset,
        message,
    )


def svg_text_cli_step(binary: Path, workspace: Path, asset: str) -> dict[str, object]:
    """The same refusal on the CLI, run with the HTTP server already stopped."""
    project = workspace / "projects" / "svgtext"
    out = workspace / "cli-svg.png"
    completed = subprocess.run(
        [
            str(binary),
            "export",
            str(project),
            "--out",
            str(out),
            "--font-store",
            str(workspace / "fonts"),
        ],
        capture_output=True,
        text=True,
        timeout=TIMEOUT,
        check=False,
    )
    if completed.returncode == 0:
        raise SmokeFailure(
            f"CLI export succeeded where HTTP refused: {completed.stdout.strip()!r}"
        )
    if asset not in completed.stderr:
        raise SmokeFailure(
            f"CLI refusal does not name the asset {asset!r}: {completed.stderr.strip()!r}"
        )
    if out.exists():
        raise SmokeFailure(f"a refused CLI export wrote a PNG: {out}")
    return {
        "status": "passed",
        "exitCode": completed.returncode,
        "stderr": completed.stderr.strip(),
    }


def stale_lock_step(
    binary: Path, workspace: Path, host: str, logs: Path
) -> dict[str, object]:
    """Item 3 (D23): reclaim this machine's stale lock, refuse anyone else's."""
    project = workspace / "projects" / "fonts"
    pid = dead_pid()
    evidence: dict[str, object] = {"pid": pid, "host": host}

    # Same machine, dead process, flag on: reclaimed, reported once.
    write_lock(project, {"pid": pid, "host": host})
    server = Serve.start(
        binary, workspace, ("--reclaim-stale-locks",), log=logs / "reclaim.log"
    )
    try:
        status, summary = json_request(server.base, "GET", "/api/projects/fonts")
        expect(status, 200, summary, "GET /api/projects/fonts after a stale lock")
        reclaimed = summary.get("reclaimedLock")
        if not isinstance(reclaimed, dict):
            raise SmokeFailure(f"no reclaimedLock on the first summary: {summary!r}")
        if reclaimed.get("pid") != pid:
            raise SmokeFailure(
                f"reclaimedLock names pid {reclaimed.get('pid')!r}, expected {pid}: {summary!r}"
            )
        if reclaimed.get("host") != host:
            raise SmokeFailure(
                f"reclaimedLock names host {reclaimed.get('host')!r}, expected {host!r}"
            )
        evidence["reclaimed"] = reclaimed

        status, again = json_request(server.base, "GET", "/api/projects/fonts")
        expect(status, 200, again, "GET /api/projects/fonts a second time")
        if "reclaimedLock" in again:
            raise SmokeFailure(f"the reclaim notice was delivered twice: {again!r}")
    finally:
        server.close()

    # Another machine, flag on: left alone.
    write_lock(project, {"pid": pid, "host": "another-machine"})
    server = Serve.start(
        binary, workspace, ("--reclaim-stale-locks",), log=logs / "foreign.log"
    )
    try:
        status, body = json_request(server.base, "GET", "/api/projects/fonts")
        expect(status, 409, body, "GET a project locked by another machine")
        code, message = error_of(body)
        if code != "projectLocked":
            raise SmokeFailure(f"a foreign lock refused as {code!r}: {message}")
        evidence["foreignHost"] = {"status": 409, "code": code}
    finally:
        server.close()

    # No host at all (a lock written before 1.5.0), flag off: left alone.
    write_lock(project, {"pid": pid})
    server = Serve.start(binary, workspace, log=logs / "hostless.log")
    try:
        status, body = json_request(server.base, "GET", "/api/projects/fonts")
        expect(status, 409, body, "GET a hostless-locked project without the flag")
        code, message = error_of(body)
        if code != "projectLocked":
            raise SmokeFailure(f"a hostless lock refused as {code!r}: {message}")
        evidence["hostlessWithoutFlag"] = {"status": 409, "code": code}
    finally:
        server.close()

    # And the documented way out, with no flag and no dialog.
    run(binary, "unlock", str(project))
    if (project / LOCK_FILE).exists():
        raise SmokeFailure(f"`unlock` left {LOCK_FILE} in place")
    server = Serve.start(binary, workspace, log=logs / "unlocked.log")
    try:
        status, body = json_request(server.base, "GET", "/api/projects/fonts")
        expect(status, 200, body, "GET after `assemblash unlock`")
        if "reclaimedLock" in body:
            raise SmokeFailure(f"an unlocked project reported a reclaim: {body!r}")
        evidence["afterUnlock"] = {"status": 200}
    finally:
        server.close()

    evidence["status"] = "passed"
    return evidence


def install_step(server: Serve) -> dict[str, object]:
    """`--online` only: the default pack, over HTTP, with nothing seeded silently."""
    status, before = json_request(server.base, "GET", "/api/fonts")
    expect(status, 200, before, "GET /api/fonts before an install")
    had = set(before.get("families", []))

    status, installed = json_request(
        server.base, "POST", "/api/fonts/install", {"pack": "default"}, timeout=300
    )
    expect(status, 201, installed, 'POST /api/fonts/install {"pack":"default"}')
    now = set(installed.get("families", []))
    added = sorted(now - had)
    if len(added) != 3:
        raise SmokeFailure(
            f"the default pack added {len(added)} families, expected 3: {added!r}"
        )
    return {"status": "passed", "families": added}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binary", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument(
        "--font",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "crates"
        / "assemblash-renderer"
        / "tests"
        / "fonts"
        / "NotoSans-Subset.ttf",
        help="font file to import over HTTP; the fixture by default",
    )
    parser.add_argument(
        "--online",
        action="store_true",
        help="also install the default font pack, which reaches the network",
    )
    args = parser.parse_args()

    binary = args.binary.resolve()
    workspace = args.workspace.resolve()
    font = args.font.resolve()
    steps: dict[str, object] = {}
    evidence: dict[str, object] = {
        "binary": str(binary),
        "workspace": str(workspace),
        "font": str(font),
        "steps": steps,
    }
    server = None
    try:
        for label, path in [("binary", binary), ("font", font)]:
            if not path.is_file():
                raise SmokeFailure(f"{label} does not exist: {path}")
        if workspace.exists() and any(workspace.iterdir()):
            raise SmokeFailure(f"workspace must be fresh and empty: {workspace}")
        workspace.mkdir(parents=True, exist_ok=True)

        run(binary, "workspace", "--workspace", str(workspace))
        (workspace / "config.toml").write_text(
            "port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n", encoding="utf-8"
        )
        logs = workspace / "server-logs"
        logs.mkdir()

        # --friendly so the first server can be stopped the way the interface
        # stops it. The lock steps below start their own, without it.
        server = Serve.start(binary, workspace, friendly=True, log=logs / "main.log")

        steps["fonts"], family, first = fonts_step(server, workspace, font)
        steps["removal"] = removal_step(server, workspace, font, family, first)
        steps["svgText"], asset, _ = svg_text_step(server, workspace)

        # Taken while the server still holds the project, because the lock
        # file is gone the moment it stops — and the host it records is the
        # spelling the binary itself uses, not one this script invents.
        lock = read_lock(workspace / "projects" / "fonts")
        host = lock.get("host")

        if args.online:
            steps["install"] = install_step(server)
        else:
            steps["install"] = "skipped (offline)"

        server.close()
        server = None

        # Every CLI call happens with HTTP stopped: two processes holding one
        # project is exactly what the lock exists to prevent.
        steps["svgText"]["cli"] = svg_text_cli_step(binary, workspace, asset)

        if not isinstance(host, str) or not host:
            steps["staleLock"] = {
                "status": "skipped",
                "reason": f"the binary recorded no host in {LOCK_FILE}: {lock!r}",
            }
            raise SmokeFailure(
                "the lock file carries no host, so the D23 reclaim cannot be "
                f"exercised: {lock!r}"
            )
        steps["staleLock"] = stale_lock_step(binary, workspace, host, logs)

        print(json.dumps({"ok": True, **evidence}, separators=(",", ":")))
        return 0
    except (
        SmokeFailure,
        subprocess.TimeoutExpired,
        OSError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        print(json.dumps({"ok": False, **evidence, "error": str(error)}, separators=(",", ":")))
        return 1
    finally:
        if server is not None:
            try:
                server.close()
            except (SmokeFailure, OSError) as error:
                print(
                    json.dumps(
                        {"ok": False, "teardownError": str(error)},
                        separators=(",", ":"),
                    ),
                    file=sys.stderr,
                )
                if server.process.poll() is None:
                    server.process.kill()
                if sys.exc_info()[0] is None:
                    raise SystemExit(1)


if __name__ == "__main__":
    raise SystemExit(main())
