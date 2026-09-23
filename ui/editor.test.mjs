import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// These journeys deliberately use the browser already installed on the test
// machine instead of adding a large browser automation dependency. Override
// discovery with ASSEMBLASH_TEST_BROWSER=/path/to/chrome when necessary.
const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xj4aAAAAAElFTkSuQmCC",
  "base64",
);
const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"></svg>',
  "utf8",
);

// Every wait in this file is bounded, and every bound names what it was
// waiting for. A journey that hangs reports nothing at all — no failure, no
// output, and on CI no result until somebody cancels the job by hand — so a
// wait that can never be satisfied is turned into an ordinary test failure
// that says which one it was. The two helpers below are the only way this
// file waits for anything; there is no bare `await` on an event or a poll.
const WAIT_MS = 5000; // a condition the page is expected to reach
const COMMAND_MS = 15000; // one DevTools command, including its own awaits
const STARTUP_MS = 30000; // the browser's launch handshake on a loaded CI runner
const JOURNEY_MS = 120000; // the whole browser journey, as a last resort

function withTimeout(promise, what, timeoutMs = WAIT_MS) {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`timed out after ${timeoutMs} ms waiting for ${what}`)),
        timeoutMs,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

// The condition itself is bounded by whatever is left of the budget, so a
// probe that never answers fails the same way a probe that keeps answering
// `false` does.
async function waitFor(condition, what, timeoutMs = WAIT_MS) {
  const deadline = Date.now() + timeoutMs;
  for (let remaining = timeoutMs; remaining > 0; remaining = deadline - Date.now()) {
    const value = await withTimeout(condition(), what, remaining);
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`timed out after ${timeoutMs} ms waiting for ${what}`);
}

const editableText = {
  id: "layer_text",
  name: "Editable text",
  type: "text",
  text: "Edit me",
  fontFamily: "Noto Sans",
  fontSize: 48,
  lineHeight: 1.2,
  color: "#101820",
  align: "left",
  transform: { x: 100, y: 100, width: 400, height: 100, rotation: 0 },
  opacity: 1,
  visible: true,
  locked: false,
  protected: false,
  readOnly: false,
  effects: [],
};

const protectedText = {
  ...structuredClone(editableText),
  id: "layer_protected",
  name: "Protected text",
  text: "Do not edit",
  protected: true,
  transform: { x: 100, y: 300, width: 400, height: 100, rotation: 0 },
};

// The six containers the engine imports; anything else is refused before
// the bytes are looked at, which is what the "not a font" journey exercises.
const FONT_FORMATS = ["ttf", "otf", "ttc", "otc", "woff", "woff2"];

const FONT_CATALOGUE = {
  packs: {
    default: ["Noto Sans", "Noto Serif", "Noto Sans Mono"],
    display: ["Montserrat", "Playfair Display"],
    mono: ["JetBrains Mono"],
    text: ["Inter", "Roboto", "Open Sans", "Lora"],
  },
  families: [
    { family: "Noto Sans", license: "OFL-1.1", bytes: 5 * 1024 * 1024, packs: ["default"] },
    { family: "Noto Serif", license: "OFL-1.1", bytes: 4 * 1024 * 1024, packs: ["default"] },
    { family: "Noto Sans Mono", license: "OFL-1.1", bytes: 3 * 1024 * 1024, packs: ["default"] },
    { family: "Inter", license: "OFL-1.1", bytes: 2 * 1024 * 1024, packs: ["text"] },
    { family: "Roboto", license: "OFL-1.1", bytes: 512 * 1024, packs: ["text"] },
    { family: "Open Sans", license: "OFL-1.1", bytes: 512 * 1024, packs: ["text"] },
    { family: "Lora", license: "OFL-1.1", bytes: 256 * 1024, packs: ["text"] },
    { family: "Montserrat", license: "OFL-1.1", bytes: 768 * 1024, packs: ["display"] },
    { family: "Playfair Display", license: "OFL-1.1", bytes: 320 * 1024, packs: ["display"] },
    { family: "JetBrains Mono", license: "OFL-1.1", bytes: 192 * 1024, packs: ["mono"] },
  ],
};

function defaultFontFaces() {
  return [
    { family: "Noto Sans", style: "normal", weight: 400, file: "a1.ttf", hash: "sha256:a1", faceIndex: 0 },
  ];
}

// A Windows download path with a space in it: the case a person pastes into a
// client, and the one that goes wrong first when escaping is wrong.
const AGENT_EXECUTABLE = String.raw`C:\Users\Person One\Downloads\assemblash-1.9.0-windows-x86_64.exe`;
const AGENT_WORKSPACE = String.raw`C:\Users\Person One\Assemblash`;

function freshDocument() {
  return {
    schemaVersion: 1,
    id: "doc_ui_test",
    version: 1,
    name: "UI test project",
    canvas: { width: 1000, height: 700, background: "#ffffff" },
    assets: [],
    layers: [structuredClone(editableText), structuredClone(protectedText)],
    presets: [],
    slots: [
      { name: "headline", layer: "layer_text", kind: "text", required: true },
    ],
  };
}

function findLayer(document, id) {
  const pending = [...(document.layers ?? [])];
  while (pending.length) {
    const layer = pending.shift();
    if (layer?.id === id) return layer;
    if (layer?.type === "group") pending.unshift(...(layer.children ?? []));
  }
  return null;
}

function applyMockOperation(document, operation, created) {
  if (operation.op === "updateCanvas") {
    for (const key of ["width", "height", "background"]) {
      if (Object.hasOwn(operation, key)) document.canvas[key] = operation[key];
    }
    return;
  }
  if (operation.op === "create") {
    const { op, position, ...rest } = operation;
    const made = {
      id: `layer_made_${document.layers.length + 1}`,
      name: rest.type,
      opacity: 1,
      visible: true,
      locked: false,
      protected: false,
      readOnly: false,
      effects: [],
      ...rest,
    };
    document.layers.push(made);
    created.push(made.id);
    return;
  }
  const layer = operation.id ? findLayer(document, operation.id) : null;
  if (operation.op === "update" && layer) {
    const { op, id, cornerRadius, markerStart, markerEnd, ...rest } = operation;
    Object.assign(layer, rest);
    // A corner radius belongs to the rect geometry, not to the layer: the
    // engine writes it inside `shape`, and the inspector reads it back from
    // there, so the mock has to put it in the same place.
    if (cornerRadius !== undefined && layer.shape) layer.shape.cornerRadius = cornerRadius;
    // Markers belong to the Line payload for the same reason.
    if (markerStart !== undefined && layer.shape) layer.shape.markerStart = markerStart;
    if (markerEnd !== undefined && layer.shape) layer.shape.markerEnd = markerEnd;
  }
  if (operation.op === "rename" && layer) layer.name = operation.name;
  if (operation.op === "move" && layer) {
    layer.transform.x += operation.dx;
    layer.transform.y += operation.dy;
  }
  if (operation.op === "resize" && layer) {
    layer.transform.width = operation.width;
    layer.transform.height = operation.height;
  }
  if (operation.op === "rotate" && layer) layer.transform.rotation = operation.degrees;
  if (operation.op === "updateSlot") {
    const index = (document.slots ?? []).findIndex((one) => one.name === operation.name);
    if (index >= 0) document.slots[index] = structuredClone(operation.slot);
  }
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function startFixtureServer() {
  let document = freshDocument();
  let fontFaces = defaultFontFaces();
  let failInstall = null;
  let pendingReclaimedLock = null;
  // Projects another client (an agent over MCP) created, listed after "demo".
  let otherProjects = [];
  // Which upcoming write the engine refuses (1 = the next one), if any.
  let refuseWriteNumber = 0;
  let failPreviews = 0;
  // A second project, and undo requests recorded by project and held for a
  // while, for the journey about switching projects while actions wait.
  let secondProject = false;
  let agentCount = 0;
  let historyPosition = 0;
  let undoDelayMs = 0;
  const undos = [];
  // The demo project's id IS its directory name, so a rename moves it; the
  // routes below address it through this variable, the way the real engine
  // addresses the directory it moved.
  let demoId = "demo";
  let demoName = "UI test project";
  let demoDeleted = false;
  let projectLocked = false;
  // Rename and delete requests, recorded like the font calls are.
  const projectCalls = [];
  // The update check (D28): the consent recorded in the "workspace config",
  // the latest version the "feed" named, and the consent POSTs the page sent.
  let updateConsent = null;
  let updateLatest = null;
  const consentCalls = [];
  // Documents as they were before each write, so one undo restores one write.
  const undoStack = [];
  // A typed engine refusal for the next write, in the engine's own words.
  let failWrite = null;
  const fontFamilies = () => [...new Set(fontFaces.map((face) => face.family))].sort();
  const writes = [];
  const reads = [];
  const fontCalls = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const send = (status, body) => json(response, status, body);
    if (request.method === "GET" && url.pathname.startsWith("/api/")) reads.push(url.pathname);
    // Which project a /api/projects/... request addresses, and whether it is
    // the demo project under its current (possibly renamed) id.
    const segments = url.pathname.split("/").filter(Boolean);
    const projectId = segments[0] === "api" && segments[1] === "projects" && segments[2]
      ? decodeURIComponent(segments[2])
      : null;
    const isDemo = projectId !== null && projectId === demoId && !demoDeleted;

    if (request.method === "GET" && url.pathname === "/api/version") {
      return send(200, { name: "assemblash", version: "ui-test", schemaVersion: 1, canShutdown: false });
    }
    if (request.method === "GET" && url.pathname === "/api/projects") {
      return send(200, { projects: [
        ...(demoDeleted ? [] : [{ id: demoId, name: demoName, documentId: document.id, version: document.version, layers: document.layers.length }]),
        ...(secondProject ? [{ id: "second", name: "Second project", documentId: "doc_second", version: 1, layers: 0 }] : []),
        ...otherProjects,
      ] });
    }
    if (request.method === "GET" && url.pathname === "/api/agent-sessions") {
      return send(200, { count: agentCount });
    }
    if (request.method === "GET" && url.pathname === "/api/agent-access") {
      return send(200, {
        mcpUrl: "http://127.0.0.1:8787/mcp",
        executable: AGENT_EXECUTABLE,
        workspace: AGENT_WORKSPACE,
        tokenRequired: false,
      });
    }
    if (request.method === "GET" && url.pathname === "/api/update-status") {
      const newer = updateLatest !== null && updateLatest !== "ui-test";
      return send(200, {
        current: "ui-test",
        latest: updateLatest,
        newer,
        notesUrl: updateLatest ? `https://example.com/tag/v${updateLatest}` : null,
        consent: updateConsent,
      });
    }
    if (request.method === "POST" && url.pathname === "/api/update-consent") {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw || "{}");
        updateConsent = body.updateCheck ?? null;
        consentCalls.push(updateConsent);
        const newer = updateLatest !== null && updateLatest !== "ui-test";
        send(200, {
          current: "ui-test",
          latest: updateLatest,
          newer,
          notesUrl: updateLatest ? `https://example.com/tag/v${updateLatest}` : null,
          consent: updateConsent,
        });
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/projects/recent") {
      return send(200, { projects: demoDeleted ? [] : [{ id: demoId, name: demoName, documentId: document.id, version: document.version, layers: document.layers.length }] });
    }
    // A stale lock the server reclaimed on its own is reported exactly once,
    // to the first summary fetched afterward, then drained — the same shape
    // as the real engine's read-and-clear behaviour.
    if (request.method === "GET" && isDemo && segments.length === 3) {
      const summary = { id: demoId, name: demoName, documentId: document.id, version: document.version, layers: document.layers.length };
      if (pendingReclaimedLock) {
        summary.reclaimedLock = pendingReclaimedLock;
        pendingReclaimedLock = null;
      }
      return send(200, summary);
    }
    if (request.method === "GET" && isDemo && segments[3] === "document") {
      return send(200, structuredClone(document));
    }
    if (request.method === "GET" && isDemo && segments[3] === "history") {
      return send(200, { position: historyPosition, head: historyPosition, entries: [] });
    }
    if (request.method === "POST" && /^\/api\/projects\/[^/]+\/undo$/.test(url.pathname)) {
      const project = url.pathname.split("/")[3];
      request.resume();
      request.on("end", () => {
        undos.push(project);
        setTimeout(() => {
          // One undo restores one write, the way the journal does.
          if (decodeURIComponent(project) === demoId && undoStack.length) {
            document = undoStack.pop();
          historyPosition = Math.max(0, historyPosition - 1);
          }
          send(200, { version: document.version, dryRun: false });
        }, undoDelayMs);
      });
      return;
    }
    // Project rename (S4's route): the id is the directory name, so the
    // project answers under the new name from now on. A name that is taken
    // is `projectExists`; a project another process holds is `projectLocked`.
    if (request.method === "POST" && projectId && segments[3] === "rename") {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw || "{}");
        projectCalls.push({ kind: "rename", project: projectId, name: body.name });
        if (projectLocked) {
          projectLocked = false;
          return send(409, { error: { code: "projectLocked", message: "another Assemblash process holds this project open" } });
        }
        if (!isDemo) {
          return send(404, { error: { code: "notFound", message: `no project named "${projectId}"` } });
        }
        const name = String(body.name ?? "").trim();
        if (!name || /[\\/]/.test(name)) {
          return send(400, { error: { code: "invalidName", message: `"${body.name}" is not a name a project directory can carry` } });
        }
        if (name === "second" || otherProjects.some((one) => one.id === name)) {
          return send(409, { error: { code: "projectExists", message: `a project named "${name}" is already in this workspace` } });
        }
        demoId = name;
        demoName = name;
        document.name = name;
        send(200, { project: demoId });
      });
      return;
    }
    // Project delete (S4's route): the directory, document, history, and
    // assets are gone. A project this server holds is closed on the way in;
    // one another process holds is refused.
    if (request.method === "DELETE" && projectId && segments.length === 3) {
      projectCalls.push({ kind: "delete", project: projectId });
      if (projectLocked) {
        projectLocked = false;
        return send(409, { error: { code: "projectLocked", message: "another Assemblash process holds this project open" } });
      }
      if (!isDemo) {
        return send(404, { error: { code: "notFound", message: `no project named "${projectId}"` } });
      }
      demoDeleted = true;
      return send(200, { project: demoId });
    }
    if (secondProject && request.method === "GET" && url.pathname.startsWith("/api/projects/second")) {
      const second = { ...freshDocument(), id: "doc_second", name: "Second project", layers: [] };
      const rest = url.pathname.slice("/api/projects/second".length);
      if (rest === "") {
        return send(200, { id: "second", name: second.name, documentId: second.id, version: second.version, layers: 0 });
      }
      if (rest === "/document") return send(200, second);
      if (rest === "/history") return send(200, { position: 0, head: 0, entries: [] });
      if (rest === "/presets") return send(200, { presets: [] });
      if (rest === "/slots") return send(200, { isTemplate: false, slots: [] });
    }
    if (request.method === "GET" && isDemo && segments[3] === "presets") {
      return send(200, { presets: [] });
    }
    if (request.method === "GET" && isDemo && segments[3] === "slots") {
      return send(200, { isTemplate: false, slots: [] });
    }
    // Every call the font manager can make is recorded, because two of the
    // journeys are about what is *not* sent: nothing is downloaded before the
    // install button is clicked, and nothing is deleted when the confirmation
    // is dismissed.
    if (url.pathname.startsWith("/api/fonts")) {
      fontCalls.push({ method: request.method, path: url.pathname, query: url.search });
    }

    if (request.method === "GET" && url.pathname === "/api/fonts/specimen.png") {
      const face = fontFaces.find((one) =>
        one.family === url.searchParams.get("family")
        && String(one.weight) === url.searchParams.get("weight")
        && one.style === url.searchParams.get("style")
      );
      if (!face) return send(404, { error: { code: "missingFontFace", message: "face not installed" } });
      if (face.hash !== url.searchParams.get("hash")) {
        return send(409, { error: { code: "fontFaceChanged", message: "face hash changed" } });
      }
      response.writeHead(200, { "content-type": "image/png" });
      return response.end(png);
    }    if (request.method === "GET" && url.pathname === "/api/fonts/catalogue") {
      return send(200, structuredClone(FONT_CATALOGUE));
    }
    if (request.method === "POST" && url.pathname === "/api/fonts/install") {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = raw ? JSON.parse(raw) : {};
        if (failInstall) {
          const message = failInstall;
          failInstall = null;
          // The server installs atomically, so a refusal leaves the store as
          // it was — which is what the journey then checks the page says.
          return send(502, { error: { code: "fontInstallFailed", message } });
        }
        const pack = FONT_CATALOGUE.packs[body.pack];
        if (!pack) {
          return send(404, { error: { code: "unknownFontPack", message: `no pack named "${body.pack}"` } });
        }
        const installed = pack.map((family, index) => ({
          family,
          style: "normal",
          weight: 400,
          file: `${body.pack}-pack${index}.ttf`,
          hash: `sha256:${body.pack}-pack${index}`,
          faceIndex: 0,
          license: "OFL-1.1",
        }));
        for (const face of installed) {
          if (!fontFaces.some((one) => one.file === face.file)) fontFaces.push(face);
        }
        send(201, { installed, families: fontFamilies() });
      });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/fonts") {
      const filename = url.searchParams.get("filename") ?? "";
      const extension = filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
      request.resume();
      request.on("end", () => {
        if (!FONT_FORMATS.includes(extension)) {
          return send(400, {
            error: {
              code: "unsupportedFontFormat",
              message: `"${filename}" is not a font format this build can import`,
              details: { filename, accepted: FONT_FORMATS },
            },
          });
        }
        const family = filename.replace(/\.[^.]+$/, "");
        const record = {
          family,
          style: "normal",
          weight: 400,
          file: `${family}.${extension}`,
          hash: `sha256:${family}`,
          faceIndex: 0,
          source: filename,
        };
        const already = fontFaces.some((one) => one.file === record.file);
        if (!already) fontFaces.push(record);
        // Bytes the store already has answer 200 rather than refusing.
        send(already ? 200 : 201, { imported: [record], families: fontFamilies() });
      });
      return;
    }
    if (request.method === "DELETE" && url.pathname.startsWith("/api/fonts/")) {
      const family = decodeURIComponent(url.pathname.slice("/api/fonts/".length));
      const before = fontFaces.length;
      fontFaces = fontFaces.filter((face) => face.family !== family);
      const removed = before - fontFaces.length;
      if (!removed) {
        return send(404, {
          error: { code: "unknownFontFamily", message: `no font family named "${family}" is in the font store` },
        });
      }
      return send(200, { removed, families: fontFamilies() });
    }
    if (request.method === "GET" && url.pathname === "/api/fonts") {
      return send(200, { families: fontFamilies(), faces: structuredClone(fontFaces) });
    }
    if (request.method === "GET" && url.pathname.endsWith("/preview.png")) {
      if (failPreviews > 0) {
        failPreviews -= 1;
        return send(422, { error: { code: "missingFont", message: "the font store has no face for Brand Sans" } });
      }
      response.writeHead(200, { "content-type": "image/png" });
      return response.end(png);
    }
    if (request.method === "GET" && url.pathname.endsWith("/preview.svg")) {
      response.writeHead(200, { "content-type": "image/svg+xml" });
      return response.end(svg);
    }
    if (request.method === "GET" && url.pathname.endsWith("/text-layout")) {
      return send(200, { lineCount: 1, height: 58 });
    }

    // The importer records an asset's own pixel size, which is what the upload
    // path sizes the new layer from.
    if (request.method === "POST" && url.pathname.endsWith("/assets")) {
      request.resume();
      request.on("end", () => {
        document.version += 1;
        const asset = {
          id: "asset_fixture",
          path: "asset_fixture.png",
          hash: "sha256:fixture",
          mediaType: "image/png",
          width: 800,
          height: 400,
        };
        document.assets.push(asset);
        send(201, { asset, version: document.version });
      });
      return;
    }

    if (request.method === "POST" && (url.pathname.endsWith("/operations") || url.pathname.endsWith("/operation-batches"))) {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw);
        if (refuseWriteNumber > 0) {
          refuseWriteNumber -= 1;
          if (refuseWriteNumber === 0) {
            return send(422, { error: { code: "operationRefused", message: "the layer is protected" } });
          }
        }
        if (failWrite) {
          const refusal = failWrite;
          failWrite = null;
          return send(422, { error: { code: refusal.code, message: refusal.message } });
        }
        const operations = body.commands ?? [body.operation];
        const invalidPath = operations.find((operation) =>
          operation.op === "create" &&
          operation.type === "shape" &&
          operation.shape?.kind === "path" &&
          /\bQ\b/.test(operation.shape.d)
        );
        if (invalidPath) {
          return send(422, { error: { code: "invalidPath", message: "unsupported path command 'Q' at byte 6" } });
        }
        // The document as it was, for the one undo that restores one write.
        undoStack.push(structuredClone(document));
        writes.push({ path: url.pathname, body });
        historyPosition += 1;
        const created = [];
        for (const operation of operations) applyMockOperation(document, operation, created);
        document.version += 1;
        send(200, url.pathname.endsWith("operation-batches")
          ? { version: document.version, transactionId: `tx_${document.version}`, created, changed: [], removed: [] }
          : { version: document.version, dryRun: false, transaction: `tx_${document.version}`, created, changed: [], removed: [] });
      });
      return;
    }

    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const allowed = new Set([
      "index.html", "agents.js", "app.js", "api.js", "export.js", "fonts.js", "geometry.js", "queue.js", "templates.js", "token.js", "i18n.js", "locale-en.js", "locale-fr.js", "locale-de.js",
      "studio.css", "style.css", "phosphor.css", "Phosphor.woff2",
      "catalogue-specimens/manifest.json",
      ...["inter", "roboto", "open-sans", "lora", "montserrat", "playfair-display", "jetbrains-mono"]
        .flatMap((name) => [
          "catalogue-specimens/" + name + ".svg",
          "catalogue-specimens/licenses/" + name + "-OFL.txt",
        ]),
    ]);
    if (!allowed.has(requested)) return send(404, { error: { code: "notFound", message: url.pathname } });
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".woff2": "font/woff2",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".txt": "text/plain; charset=utf-8",
    };
    response.writeHead(200, { "content-type": types[extname(requested)] ?? "application/octet-stream" });
    response.end(readFileSync(join(dist, requested)));
  });
  await withTimeout(
    new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
    "the fixture server to start listening",
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return {
    url: `http://127.0.0.1:${address.port}`,
    writes,
    reads,
    fontCalls,
    layers: () => structuredClone(document.layers),
    setFonts(faces) {
      fontFaces = structuredClone(faces);
    },
    failNextInstall(message) {
      failInstall = message;
    },
    armReclaimedLock(lock) {
      pendingReclaimedLock = lock;
    },
    // What an agent connected to the editor's MCP endpoint does: it changes
    // the document without the page asking for anything.
    editAsAgent(dx) {
      const layer = findLayer(document, "layer_text");
      layer.transform.x += dx;
      document.version += 1;
      return document.version;
    },
    setAgentCount(count) {
      agentCount = count;
    },
    useSecondProject(enabled) {
      secondProject = enabled;
    },
    setHistoryPosition(position) {
      historyPosition = position;
    },
    delayUndo(ms) {
      undoDelayMs = ms;
    },
    undos,
    refuseWrite(number) {
      refuseWriteNumber = number;
    },
    failPreviews(count) {
      failPreviews = count;
    },
    // A typed refusal, in the engine's own words, for the next write.
    armWriteRefusal(code, message) {
      failWrite = { code, message };
    },
    // Another process holds the project: rename and delete are refused.
    armProjectLock() {
      projectLocked = true;
    },
    projectCalls: () => structuredClone(projectCalls),
    setUpdate(consent, latest) {
      updateConsent = consent;
      updateLatest = latest;
    },
    consentCalls: () => structuredClone(consentCalls),
    // The document as the engine holds it, for reading values back.
    documentJson: () => JSON.stringify(document),
    version: () => document.version,
    createAsAgent(id) {
      otherProjects.push({ id, name: id, documentId: `doc_${id}`, version: 0, layers: 0 });
    },
    reset() {
      document = freshDocument();
      fontFaces = defaultFontFaces();
      failInstall = null;
      pendingReclaimedLock = null;
      otherProjects = [];
      refuseWriteNumber = 0;
      failPreviews = 0;
      secondProject = false;
      agentCount = 0;
      historyPosition = 0;
      undoDelayMs = 0;
      demoId = "demo";
      demoName = "UI test project";
      demoDeleted = false;
      projectLocked = false;
      failWrite = null;
      updateConsent = null;
      updateLatest = null;
      consentCalls.length = 0;
      undoStack.length = 0;
      projectCalls.length = 0;
      undos.length = 0;
      writes.length = 0;
      reads.length = 0;
      fontCalls.length = 0;
    },
    // A listening server is an open handle, and an open handle keeps node
    // alive after the last test has reported — which is how a finished run
    // becomes a job that never ends. Sockets the browser left open are closed
    // first so `close` has something to complete, and the server is unrefed so
    // that even a `close` that never calls back cannot hold the process.
    close: async () => {
      server.closeAllConnections?.();
      server.unref();
      await withTimeout(
        new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
        "the fixture server to close",
      );
    },
  };
}

function browserExecutable() {
  const configured = process.env.ASSEMBLASH_TEST_BROWSER;
  const candidates = process.platform === "win32"
    ? [
        configured,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      ]
    : process.platform === "darwin"
      ? [configured, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : [configured, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

class CdpPage {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) {
        if (message.method === "Runtime.exceptionThrown") {
          this.events.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
        }
        if (message.method === "Runtime.consoleAPICalled") {
          this.events.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
        }
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  // A command whose answer never arrives — a browser that died, a socket that
  // closed under us, an `awaitPromise` on a promise the page never settles —
  // used to leave an entry in `pending` that nothing would ever resolve.
  send(method, params = {}) {
    const id = this.nextId++;
    const answer = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
    return withTimeout(answer, `the browser to answer ${method}`, COMMAND_MS)
      .catch((error) => {
        this.pending.delete(id);
        throw error;
      });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async waitFor(expression, description, timeoutMs = WAIT_MS) {
    try {
      await waitFor(() => this.evaluate(`Boolean(${expression})`), description, timeoutMs);
    } catch (error) {
      const page = await this.evaluate(`({
        url: location.href,
        ready: document.readyState,
        status: document.querySelector("#status")?.textContent,
        save: document.querySelector("#save-state")?.textContent
      })`).catch((reason) => ({ unreachable: reason.message }));
      throw new Error(`${error.message}: ${JSON.stringify(page)} ${this.events.join(" | ")}`);
    }
  }

  click(selector) {
    return this.evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) throw new Error(${JSON.stringify(`missing ${selector}`)}); node.click(); return true; })()`);
  }



  key(key, options = {}) {
    return this.evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", ${JSON.stringify({ key, code: options.code ?? key, bubbles: true, ...options })}))`);
  }
}

async function startBrowser(url, width = 1400, height = 900) {
  const executable = browserExecutable();
  if (!executable) return null;
  const profile = mkdtempSync(join(tmpdir(), "assemblash-ui-test-"));
  const child = spawn(executable, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });
  let childError;
  child.on("error", (error) => { childError = error; });
  let socket;
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      socket?.close();
    } catch (error) {
      console.warn(`could not close the DevTools socket: ${error.message}`);
    }
    if (child.exitCode === null && child.signalCode === null && !childError) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      try {
        await withTimeout(exited, "the browser to exit", STARTUP_MS);
      } catch {
        child.kill("SIGKILL");
        try {
          await withTimeout(exited, "the browser to exit after forced termination", WAIT_MS);
        } catch (error) {
          // A referenced ChildProcess can keep Node alive even after the test
          // has finished. The job timeout remains the final bound if the OS
          // refuses both termination requests.
          child.unref();
          console.warn(error.message);
        }
      }
    }
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 50 });
    } catch (error) {
      console.warn(`could not remove the browser profile ${profile}: ${error.message}`);
    }
  };

  try {
    const portFile = join(profile, "DevToolsActivePort");
    await waitFor(async () => {
      if (childError) throw new Error(`browser failed to start: ${childError.message}`);
      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error(`browser exited with ${child.exitCode ?? child.signalCode}`);
      }
      return existsSync(portFile);
    }, "the browser to write its DevTools port file", STARTUP_MS);
    const [port] = readFileSync(portFile, "utf8").trim().split(/\r?\n/);
    const targetController = new AbortController();
    let targets;
    try {
      targets = await withTimeout(
        fetch(`http://127.0.0.1:${port}/json/list`, {
          signal: targetController.signal,
        }).then((response) => response.json()),
        "the browser target list to be fetched and read",
        STARTUP_MS,
      );
    } catch (error) {
      targetController.abort();
      throw error;
    }
    const target = targets.find((one) => one.type === "page");
    assert.ok(target?.webSocketDebuggerUrl, "headless browser did not create a page target");
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await withTimeout(
      new Promise((resolve, reject) => {
        socket.addEventListener("open", resolve, { once: true });
        socket.addEventListener("error", reject, { once: true });
      }),
      "the DevTools socket to open",
      STARTUP_MS,
    );
    const page = new CdpPage(socket);
    await page.send("Runtime.enable");
    await page.send("Page.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url });
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`, "editor startup", STARTUP_MS);
    return { page, child, profile, close: stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

async function openProject(page) {
  await page.evaluate(`(() => { const select = document.querySelector("#projects"); select.value = "demo"; select.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  await page.waitFor(`!document.querySelector("#canvas").hidden && document.querySelector("#status")?.textContent?.includes("Opened")`, "project open");
}

async function openFontsPanel(page) {
  await page.click("#settings");
  await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to open for Fonts");
  await page.click("#settings-fonts-open");
  await page.waitFor(`!document.querySelector("#settings-dialog").open && !document.querySelector("#add-fonts-section").hidden`, "Fonts panel to open");
}
async function openDocumentSettings(page) {
  await page.click("#settings");
  await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to open");
  if (!await page.evaluate(`document.querySelector("#settings-document").open`)) {
    await page.click("#settings-document summary");
  }
}

// Opens the inspector's font selector (focus is what opens the list) and
// returns the families it is showing right now.
async function selectorFamilies(page) {
  await page.evaluate(`(() => {
    const input = document.querySelector("#inspector .font-selector input");
    input.dispatchEvent(new FocusEvent("focus"));
    return true;
  })()`);
  await page.waitFor(`!document.querySelector("#inspector .font-selector-list").hidden`, "the font selector list");
  return page.evaluate(`[...document.querySelectorAll("#inspector .font-selector-list li[data-family]")].map((one) => one.dataset.family)`);
}

async function selectLayer(page, id) {
  const selector = `.layer[data-id="${id}"]`;
  await page.click(selector);
  await page.waitFor(`document.querySelector(${JSON.stringify(selector)})?.classList.contains("selected")`, `${id} selection`);
}

async function waitForWrites(fixture, count = 1, timeoutMs = WAIT_MS) {
  await waitFor(
    () => fixture.writes.length >= count,
    `${count} API write${count === 1 ? "" : "s"}`,
    timeoutMs,
  );
}

async function waitForSaved(page) {
  await page.waitFor(`document.querySelector("#save-state")?.textContent?.includes("All changes saved")`, "saved state");
}

// The bounds inside the journey are the ones that name what went wrong; this
// one is the backstop for anything they do not cover, so it is deliberately
// much larger than an individual wait.
test("editor interaction journeys use the real compiled interface", { timeout: JOURNEY_MS }, async (t) => {
  const fixture = await startFixtureServer();
  let browser;
  try {
    browser = await startBrowser(fixture.url);
  } catch (error) {
    await fixture.close();
    throw error;
  }
  if (!browser) {
    await fixture.close();
    if (process.env.CI || process.env.ASSEMBLASH_TEST_BROWSER_REQUIRED === "1") {
      throw new Error("Chrome or Chromium is required for editor journeys; set ASSEMBLASH_TEST_BROWSER");
    }
    t.skip("set ASSEMBLASH_TEST_BROWSER to a Chrome or Chromium executable to run browser journeys");
    return;
  }
  // The fixture is closed even when closing the browser throws. It used to be
  // the second of two awaits, so a failure in the first left the fixture
  // server listening — an open handle that kept node alive after the last
  // assertion had already passed.
  t.after(async () => {
    try {
      await browser.close();
    } finally {
      await fixture.close();
    }
  });
  const { page } = browser;

  await t.test("a language change keeps input, focus, and the open page", async () => {
    const before = await page.evaluate(`(() => {
      const input = document.querySelector("#project-search");
      input.value = "draft";
      input.focus();
      return {
        url: location.href,
        text: document.querySelector('[data-i18n="settings.languageLabel"]').textContent,
        writes: 0
      };
    })()`);
    const writes = fixture.writes.length;
    await page.evaluate(`(() => {
      const select = document.querySelector("#setting-language");
      select.value = "fr";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`document.documentElement.lang === "fr"`, "French language selection");
    assert.notEqual(
      await page.evaluate(`document.querySelector('[data-i18n="settings.languageLabel"]').textContent`),
      before.text,
    );
    assert.deepEqual(await page.evaluate(`({
      value: document.querySelector("#project-search").value,
      focused: document.activeElement?.id,
      url: location.href,
      locale: localStorage.getItem("assemblash.language")
    })`), {
      value: "draft",
      focused: "project-search",
      url: before.url,
      locale: "fr",
    });
    assert.equal(fixture.writes.length, writes);
    await page.evaluate(`(() => {
      const select = document.querySelector("#setting-language");
      select.value = "en";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector("#project-search").value = "";
      return true;
    })()`);
    await page.waitFor(`document.documentElement.lang === "en"`, "English language reset");
  });

  await t.test("side tools keep the empty workspace stable and Select closes creation for a project", async () => {
    assert.deepEqual(await page.evaluate(`({
      title: document.querySelector("#add-panel-title").textContent,
      textSection: !document.querySelector("#add-text-section").hidden,
      shownSections: [...document.querySelectorAll(".add-section")].filter((one) => !one.hidden).length,
      projectList: document.querySelector("#project-search").getAttribute("aria-controls"),
      nativePickerHidden: getComputedStyle(document.querySelector("#projects")).display
    })`), {
      title: "Text",
      textSection: true,
      shownSections: 1,
      projectList: "project-options",
      nativePickerHidden: "none",
    });
    const emptyLayout = await page.evaluate(`(() => {
      const editor = document.querySelector(".editor").getBoundingClientRect();
      const structure = document.querySelector(".structure").getBoundingClientRect();
      document.querySelector("#select-tool").click();
      const nextEditor = document.querySelector(".editor").getBoundingClientRect();
      const nextStructure = document.querySelector(".structure").getBoundingClientRect();
      return {
        addOpen: !document.querySelector("#add-panel").classList.contains("collapsed"),
        selectPressed: document.querySelector("#select-tool").getAttribute("aria-pressed"),
        sameEditor: editor.left === nextEditor.left && editor.width === nextEditor.width,
        sameStructure: structure.left === nextStructure.left && structure.width === nextStructure.width,
      };
    })()`);
    assert.deepEqual(emptyLayout, {
      addOpen: true,
      selectPressed: "false",
      sameEditor: true,
      sameStructure: true,
    });
    for (const [tool, title, visible] of [
      ["#add-text", "Text", "#add-text-section"],
      ["#add-image", "Uploads", "#add-upload-section"],
      ["#add-shape", "Elements", "#add-shape-section"],
      ["#templates-toggle", "Templates", "#add-template-section"],
    ]) {
      await page.click(tool);
      const state = await page.evaluate(`(() => ({
        title: document.querySelector("#add-panel-title").textContent,
        expanded: document.querySelector(${JSON.stringify(tool)}).getAttribute("aria-pressed"),
        visible: !document.querySelector(${JSON.stringify(visible)}).hidden,
        shownSections: [...document.querySelectorAll(".add-section")].filter((one) => !one.hidden).length
      }))()`);
      assert.deepEqual(state, { title, expanded: "true", visible: true, shownSections: 1 });
    }
    await page.click("#project-picker-toggle");
    assert.equal(await page.evaluate(`document.querySelector("#project-options").hidden`), false);
    assert.equal(await page.evaluate(`document.querySelectorAll("#project-options [role='option']").length > 0`), true);
    await page.evaluate(`document.querySelector("#project-search").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    assert.equal(await page.evaluate(`document.querySelector("#project-options").hidden`), true);
    await page.evaluate(`(() => {
      const input = document.querySelector("#project-search");
      input.value = "UI test project";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`!document.querySelector("#canvas").hidden`, "the project combobox to open a project");
    await page.click("#select-tool");
    assert.deepEqual(await page.evaluate(`({
      collapsed: document.querySelector("#add-panel").classList.contains("collapsed"),
      selectPressed: document.querySelector("#select-tool").getAttribute("aria-pressed")
    })`), { collapsed: true, selectPressed: "true" });
  });

  await t.test("selection builds the contextual text toolbar", async () => {
    await selectLayer(page, "layer_text");
    const toolbar = await page.evaluate(`(() => ({
      edit: !!document.querySelector("#advanced-inspector .edit-text-button"),
      horizontal: [...document.querySelectorAll("#inspector button")].some((one) => one.textContent.trim() === "Centre horizontally"),
      vertical: [...document.querySelectorAll("#inspector button")].some((one) => one.textContent.trim() === "Centre vertically"),
      font: document.querySelector('[aria-label="Font family"]')?.value,
      size: document.querySelector('[aria-label="Font size"]')?.value
    }))()`);
    assert.deepEqual(toolbar, { edit: true, horizontal: true, vertical: true, font: "Noto Sans", size: "48" });

  });

  await t.test("inline editing cancels without a write and commits one update", async () => {
    fixture.writes.length = 0;
    await page.click("#advanced-inspector .edit-text-button");
    await page.waitFor(`document.querySelector('.inline-text-editor')?.value === "Edit me"`, "inline editor");
    await page.evaluate(`document.querySelector('.inline-text-editor').value = "Cancelled"`);
    await page.evaluate(`document.querySelector('.inline-text-editor').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await page.waitFor(`!document.querySelector('.inline-text-editor')`, "inline cancel");
    assert.equal(fixture.writes.length, 0);

    await page.click("#advanced-inspector .edit-text-button");
    await page.evaluate(`document.querySelector('.inline-text-editor').value = "Committed text"`);
    await page.evaluate(`document.querySelector('.inline-text-editor').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }))`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "update", id: "layer_text", text: "Committed text" });
  });

  await t.test("context menu exposes commands and disables protected mutations", async () => {
    await selectLayer(page, "layer_text");
    await page.key("F10", { code: "F10", shiftKey: true });
    await page.waitFor(`!document.querySelector("#context-menu").hidden`, "editable context menu");
    const editable = await page.evaluate(`Object.fromEntries([...document.querySelectorAll("#context-menu button")].map((one) => [one.textContent.trim(), one.disabled]))`);
    assert.equal(editable["Edit text"], false);
    assert.equal(editable.Delete, false);
    assert.equal(editable.Paste, true);

    await selectLayer(page, "layer_protected");
    await page.key("F10", { code: "F10", shiftKey: true });
    const guarded = await page.evaluate(`Object.fromEntries([...document.querySelectorAll("#context-menu button")].map((one) => [one.textContent.trim(), one.disabled]))`);
    assert.equal(guarded["Edit text"], true);
    assert.equal(guarded.Cut, true);
    assert.equal(guarded.Delete, true);
    assert.equal(guarded["Rename in Layers"], true);
  });

  await t.test("shortcuts map to clipboard, duplicate, nudge, and paste batches", async () => {
    await selectLayer(page, "layer_text");
    fixture.writes.length = 0;
    await page.key("c", { code: "KeyC", ctrlKey: true });
    assert.equal(await page.evaluate(`JSON.parse(sessionStorage.getItem("assemblash-layer-clipboard-v1")).layers[0].id`), "layer_text");

    await page.key("v", { code: "KeyV", ctrlKey: true });
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes[0].body.commands[0].op, "insertLayerTree");

    fixture.writes.length = 0;
    await page.key("d", { code: "KeyD", ctrlKey: true });
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.commands[0], { op: "duplicate", id: "layer_text" });

    fixture.writes.length = 0;
    await page.key("ArrowRight", { code: "ArrowRight", shiftKey: true });
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.commands[0], { op: "move", id: "layer_text", dx: 10, dy: 0 });
  });

  await t.test("position controls preserve canvas and selection alignment mappings", async () => {
    fixture.writes.length = 0;
    await page.click(".position-button");
    await page.click('[data-layout="align-right"]');
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "align", ids: ["layer_text"], edge: "right" });

    fixture.writes.length = 0;
    await page.click(".position-button");
    await page.click('[data-canvas-anchor="bottom-center"]');
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes[0].body.commands[0].op, "move");
    assert.equal(fixture.writes[0].body.commands[0].id, "layer_text");
    assert.equal(fixture.writes[0].body.commands[0].dx, 190);
    assert.equal(fixture.writes[0].body.commands[0].dy, 500);
  });

  await t.test("the font selector lists the installed families with a visible heading", async () => {
    await selectLayer(page, "layer_text");
    assert.deepEqual(await selectorFamilies(page), ["Noto Sans"]);
    await page.evaluate("new Promise((resolve) => setTimeout(resolve, 200))");
    const listBounds = await page.evaluate(`(() => {
      const input = document.querySelector("#inspector .font-selector input").getBoundingClientRect();
      const list = document.querySelector("#inspector .font-selector-list").getBoundingClientRect();
      const hit = document.elementFromPoint(list.left + 10, list.top + 10);
      return { below: list.top >= input.bottom, visible: !!hit?.closest(".font-selector-list") };
    })()`);
    assert.deepEqual(listBounds, { below: true, visible: true });
    assert.equal(
      await page.evaluate(`document.querySelector("#inspector .font-selector-heading").textContent`),
      "Installed fonts",
    );
    // The Properties section uses the same component, not a second control.
    assert.equal(
      await page.evaluate(`document.querySelector("#advanced-inspector .font-selector input") !== null`),
      true,
    );
  });

  await t.test("installed and catalogue font samples render without a project write or pack install", async () => {
    await selectLayer(page, "layer_text");
    const writesBefore = fixture.writes.length;
    const installsBefore = fixture.fontCalls.filter((call) => call.method === "POST").length;
    await selectorFamilies(page);
    await page.waitFor(`!!document.querySelector('#inspector .font-selector-list [data-family="Noto Sans"] img[data-font-specimen]')?.src?.startsWith("blob:")`, "installed picker specimen");
    assert.ok(
      fixture.fontCalls.some((call) => call.path === "/api/fonts/specimen.png"
        && new URLSearchParams(call.query).get("family") === "Noto Sans"),
      "the picker fetches the exact installed face from the specimen API",
    );

    await openFontsPanel(page);
    await page.waitFor(`!!document.querySelector('#font-list [data-family="Noto Sans"] img[data-font-specimen]')?.src?.startsWith("blob:")`, "installed Fonts panel specimen");
    await page.waitFor(`["Inter", "Roboto", "Open Sans", "Lora", "Montserrat", "Playfair Display", "JetBrains Mono"].every((family) => {
      const row = [...document.querySelectorAll("#font-pack-options .font-pack-family")]
        .find((one) => one.querySelector(".font-pack-family-name")?.textContent === family);
      return row?.querySelector("img[data-font-specimen]")?.src?.startsWith("blob:");
    })`, "seven bundled catalogue specimens");
    assert.equal(fixture.fontCalls.filter((call) => call.method === "POST").length, installsBefore);
    assert.equal(fixture.writes.length, writesBefore);

    await page.evaluate(`(() => {
      const input = document.querySelector(".font-sample-field input");
      input.value = "Custom 123";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
    await page.waitFor(`!!document.querySelector('#font-list [data-family="Noto Sans"] img[data-font-specimen]')?.src?.startsWith("blob:")`, "custom installed specimen");
    await waitFor(
      () => fixture.fontCalls.some((call) => call.path === "/api/fonts/specimen.png"
        && new URLSearchParams(call.query).get("sample") === "Custom 123"),
      "custom sample API request",
    );
    assert.equal(fixture.writes.length, writesBefore);
    await page.waitFor(
      `[...document.querySelectorAll("#add-fonts-section img[data-font-specimen]")]
        .filter((image) => image.getAttribute("src")?.startsWith("blob:")).length >= 8`,
      "the installed face and seven catalogue samples to finish loading",
    );
    const previousSources = await page.evaluate(`(() => {
      const sources = [...document.querySelectorAll("#add-fonts-section img[data-font-specimen]")]
        .map((image) => image.getAttribute("src")).filter((src) => src?.startsWith("blob:"));
      window.__fontOriginalRevoke = URL.revokeObjectURL;
      window.__fontRevocations = [];
      URL.revokeObjectURL = function (url) {
        window.__fontRevocations.push(url);
        return window.__fontOriginalRevoke.call(URL, url);
      };
      return sources;
    })()`);
    assert.ok(previousSources.length >= 8, "the installed face and seven catalogue samples have object URLs");
    try {
      await page.click("#add-shape");
      const released = await page.evaluate(`({
        hidden: document.querySelector("#add-fonts-section").hidden,
        remaining: [...document.querySelectorAll("#add-fonts-section img[data-font-specimen]")]
          .filter((image) => image.hasAttribute("src")).length,
        revoked: window.__fontRevocations,
      })`);
      assert.equal(released.hidden, true);
      assert.equal(released.remaining, 0, "hidden Fonts rows must release their image sources");
      assert.ok(previousSources.every((src) => released.revoked.includes(src)), "every previous object URL is revoked");

      await openFontsPanel(page);
      await page.waitFor(`[...document.querySelectorAll("#add-fonts-section img[data-font-specimen]")].filter((image) => image.src.startsWith("blob:")).length >= 8`, "Fonts samples to reload");
      const reloaded = await page.evaluate(`[...document.querySelectorAll("#add-fonts-section img[data-font-specimen]")]
        .map((image) => image.getAttribute("src")).filter((src) => src?.startsWith("blob:"))`);
      assert.ok(reloaded.length >= 8, "reopened Fonts reloads all installed and catalogue samples");
      assert.ok(reloaded.every((src) => !previousSources.includes(src)), "reopened rows use fresh object URLs");
      assert.equal(fixture.writes.length, writesBefore);
    } finally {
      await page.evaluate(`URL.revokeObjectURL = window.__fontOriginalRevoke`);
    }
  });

  await t.test("effects reorder in place, carrying their numbers with them", async () => {
    await selectLayer(page, "layer_text");
    assert.equal(await page.evaluate(`["Effects", "Presets", "Slots"].every((name) =>
      [...document.querySelectorAll("#advanced-inspector > .dock-section")].some((section) =>
        section.querySelector("summary")?.textContent?.includes(name)))`), true);
    fixture.writes.length = 0;
    for (const type of ["blur", "grain"]) {
      await page.evaluate(`(() => { document.querySelector(".effect-chooser").value = ${JSON.stringify(type)}; })()`);
      await page.click(".effect-add");
      await waitForSaved(page);
    }
    await waitForWrites(fixture, 2);
    assert.deepEqual(fixture.writes[1].body.operation.effects, [
      { type: "blur", radius: 0 },
      { type: "grain", amount: 0, seed: 1, scale: 1 },
    ]);
    fixture.writes.length = 0;
    await page.click('.effect-row[data-effect="grain"] .effect-up');
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation.effects, [
      { type: "grain", amount: 0, seed: 1, scale: 1 },
      { type: "blur", radius: 0 },
    ]);

    fixture.writes.length = 0;
    await page.click('.effect-row[data-effect="grain"] .effect-down');
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation.effects.map((one) => one.type), ["blur", "grain"]);
    // The ends of the stack say so rather than silently doing nothing.
    assert.deepEqual(await page.evaluate(`({
      firstUp: document.querySelector('.effect-row[data-effect="blur"] .effect-up').disabled,
      lastDown: document.querySelector('.effect-row[data-effect="grain"] .effect-down').disabled
    })`), { firstUp: true, lastDown: true });
  });

  await t.test("an upload is sized from the asset's recorded dimensions", async () => {
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array([1, 2, 3])], "wide.png", { type: "image/png" }));
      const input = document.querySelector("#image-file");
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    const create = fixture.writes[0].body.operation;
    assert.equal(create.op, "create");
    assert.equal(create.type, "image");
    // 800x400 fits the 1000x700 canvas, so it arrives at its own size and
    // centred — not at the old fixed 300x200 that squashed it.
    assert.deepEqual(create.transform, { x: 100, y: 150, width: 800, height: 400 });
  });

  await t.test("the fit control sends one update on an image layer", async () => {
    await selectLayer(page, "layer_made_3");
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const select = document.querySelector('[aria-label="Fit"]');
      select.value = "cover";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update",
      id: "layer_made_3",
      fit: "cover",
    });
  });

  await t.test("the export dialog hands over the engine's vector render", async () => {
    fixture.reads.length = 0;
    await page.click("#export");
    await page.waitFor(`document.querySelector("#export-dialog").open`, "export dialog");
    await page.click('#export-formats [data-format="svg"]');
    assert.deepEqual(await page.evaluate(`({
      checked: document.querySelector('#export-formats [data-format="svg"]').getAttribute("aria-checked"),
      rowOff: document.querySelector("#export-resolution-row").classList.contains("disabled"),
      scalesOff: [...document.querySelectorAll("#export-options button")].every((one) => one.disabled),
      confirm: document.querySelector("#export-confirm").textContent.trim()
    })`), { checked: "true", rowOff: true, scalesOff: true, confirm: "Export SVG" });

    await page.click("#export-confirm");
    await page.waitFor(`!document.querySelector("#export-download").hidden`, "svg download offered");
    assert.deepEqual(await page.evaluate(`({
      name: document.querySelector("#export-download").download,
      blob: document.querySelector("#export-download").href.startsWith("blob:")
    })`), { name: "ui-test-project.svg", blob: true });
    assert.ok(
      fixture.reads.some((path) => path.endsWith("/preview.svg")),
      "the vector render was fetched",
    );
    assert.ok(
      !fixture.reads.some((path) => path.includes("/exports/")),
      "an SVG download writes no PNG into the project",
    );
    await page.evaluate(`document.querySelector("#export-dialog").close("cancel")`);
  });

  await t.test("zoom and responsive panels expose deterministic states", async () => {
    await page.click("#zoom-100");
    assert.deepEqual(await page.evaluate(`({ value: document.querySelector("#zoom-value").textContent, width: document.querySelector("#canvas").style.width })`), { value: "100%", width: "1000px" });
    await page.click("#zoom-in");
    assert.equal(await page.evaluate(`document.querySelector("#zoom-value").textContent`), "120%");
    await page.click("#zoom-value");
    assert.equal(await page.evaluate(`document.querySelector("#zoom-value").textContent`), "Fit");

    await page.send("Emulation.setDeviceMetricsOverride", { width: 800, height: 900, deviceScaleFactor: 1, mobile: false });
    // The override's own resize event has to land before anything is asserted:
    // the page syncs its panels on resize, so an event still in flight would
    // undo whatever the next click did. Waiting for the new width and then for
    // two frames is what makes this journey deterministic rather than lucky.
    await page.waitFor(`window.innerWidth === 800`, "the compact viewport");
    await withTimeout(
      page.evaluate(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
      ),
      "two animation frames after the viewport change",
    );
    await page.evaluate(`window.dispatchEvent(new Event("resize"))`);
    assert.deepEqual(await page.evaluate(`({
      addCollapsed: document.querySelector("#add-panel").classList.contains("collapsed"),
      dockExpanded: document.querySelector("#dock-toggle").getAttribute("aria-expanded"),
      mobileOpen: document.querySelector("#structure-panel").classList.contains("mobile-open")
    })`), { addCollapsed: true, dockExpanded: "false", mobileOpen: false });
    await page.click("#dock-toggle");
    assert.equal(await page.evaluate(`document.querySelector("#structure-panel").classList.contains("mobile-open")`), true);
  });
  await t.test("canvas settings in Properties apply one resize", async () => {
    fixture.reset();
    await openProject(page);
    // Canvas data is in Properties when no layer is selected.
    await page.click("#edit-canvas");
    assert.equal(await page.evaluate(`document.querySelector("#settings-dialog").open`), false);
    assert.equal(await page.evaluate(`document.querySelector("#properties-panel").hidden`), false);
    assert.equal(await page.evaluate(`document.querySelector("#properties-panel #canvas-settings") !== null`), true);
    assert.equal(await page.evaluate(`document.querySelector("#canvas-apply").disabled`), true);
    assert.equal(await page.evaluate(`document.querySelectorAll('[name="canvas-anchor"]').length`), 9);
    await page.evaluate(`(() => {
      const width = document.querySelector("#canvas-width");
      width.value = "0";
      width.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector("#canvas-settings").requestSubmit();
    })()`);
    assert.equal(fixture.writes.length, 0);
    assert.equal(await page.evaluate(`document.querySelector("#canvas-width").validity.valid`), false);
    await page.evaluate(`(() => {
      for (const [id, value] of [["canvas-width", "1200"], ["canvas-height", "900"], ["canvas-background", "#102030"]]) {
        const input = document.getElementById(id);
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    })()`);
    await page.click("#canvas-apply");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "updateCanvas", width: 1200, height: 900, anchor: "top-left", background: "#102030",
    });
    assert.equal(await page.evaluate(`document.querySelector("#canvas-width").value`), "1200");
    fixture.writes.length = 0;
    await page.click("#canvas-transparent");
    await page.click("#canvas-apply");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "updateCanvas", background: null });
    assert.equal(await page.evaluate(`document.querySelector("#canvas-background").disabled`), true);
    assert.equal(await page.evaluate(`document.querySelector("#canvas-transparent").checked`), true);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("Settings opens from the toolbar and Escape commits nothing", async () => {
    fixture.reset();
    await openProject(page);
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    assert.deepEqual(await page.evaluate(`({
      canvasInSettings: document.querySelector("#settings-dialog #canvas-settings") !== null,
      follow: document.querySelector("#setting-follow").checked,
      agents: document.querySelector("#settings-dialog #agents") !== null,
      fonts: document.querySelector("#settings-fonts-open") !== null,
      updateToggle: document.querySelector("#setting-update-check") !== null,
      projectActions: [...document.querySelectorAll("#settings-dialog #rename-project, #settings-dialog #reload, #settings-dialog #delete-project")].length,
      openGroups: [...document.querySelectorAll("#settings-dialog .settings-section[open]")].map((one) => one.id)
    })`), {
      canvasInSettings: false,
      follow: true,
      agents: true,
      fonts: true,
      updateToggle: true,
      projectActions: 3,
      openGroups: ["settings-agents"],
    });

    assert.equal(await page.evaluate(`(() => {
      const modal = document.querySelector("#settings-dialog");
      const toggle = document.querySelector("#setting-follow");
      const text = toggle.nextElementSibling;
      return modal.scrollWidth <= modal.clientWidth &&
        Math.abs(toggle.getBoundingClientRect().top - text.getBoundingClientRect().top) < 12;
    })()`), true, "Settings fits and the toggle label stays beside its checkbox");

    // Opening another Settings group sends no document operation.
    fixture.writes.length = 0;
    await page.click("#settings-document summary");
    assert.equal(await page.evaluate(`document.querySelector("#settings-document").open`), true);
    assert.equal(fixture.writes.length, 0);

    await page.key("Escape", { code: "Escape" });
    await page.waitFor(`!document.querySelector("#settings-dialog").open`, "Escape closes Settings");
    assert.equal(fixture.writes.length, 0, "Escape committed nothing");

  });

  await t.test("the follow preference survives a reload and gates the follow poll", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    fixture.setAgentCount(0);
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    await page.click("#setting-follow");
    assert.equal(await page.evaluate(`localStorage.getItem("assemblash-follow-v1")`), "off");
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);

    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup after reload",
      10000,
    );
    await openProject(page);
    await waitForSaved(page);

    // With following off, an agent's edit does not appear on its own.
    const before = await page.evaluate(`document.querySelector("#version").textContent`);
    fixture.editAsAgent(7);
    await new Promise((resolve) => setTimeout(resolve, 3500));
    assert.equal(
      await page.evaluate(`document.querySelector("#version").textContent`),
      before,
      "the page did not follow while the preference is off",
    );

    // Turning it back on resumes following, and the setting persists.
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    assert.equal(await page.evaluate(`document.querySelector("#setting-follow").checked`), false);
    await page.click("#setting-follow");
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
    const version = fixture.version();
    await page.waitFor(
      `document.querySelector("#version").textContent === ${JSON.stringify(String(version))}`,
      "the page to follow once the preference is on",
      10000,
    );
    assert.equal(await page.evaluate(`localStorage.getItem("assemblash-follow-v1")`), "on");
  });

  await t.test("the update consent is asked once, recorded, and the toggle survives a reload", async () => {
    fixture.reset();
    // No answer recorded: the question shows once, at start-up.
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup after reload",
      10000,
    );
    await page.waitFor(`!document.querySelector("#consent-bar").hidden`, "the consent question");
    await page.click("#consent-notify");
    await page.waitFor(`document.querySelector("#consent-bar").hidden`, "the question hides once answered");
    assert.deepEqual(fixture.consentCalls(), ["notify"]);

    // The answer is recorded, so a reload asks no second time, and the
    // Settings toggle reads the same answer.
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup after the second reload",
      10000,
    );
    assert.equal(await page.evaluate(`document.querySelector("#consent-bar").hidden`), true);
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    assert.equal(await page.evaluate(`document.querySelector("#setting-update-check").checked`), true);

    // The toggle writes the same field. Off survives a reload too.
    await page.click("#setting-update-check");
    await waitFor(
      () => Promise.resolve(fixture.consentCalls().length === 2),
      "the toggle's consent POST to land",
    );
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
    assert.deepEqual(fixture.consentCalls(), ["notify", "off"]);
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup after the third reload",
      10000,
    );
    assert.equal(await page.evaluate(`document.querySelector("#consent-bar").hidden`), true);
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal again");
    assert.equal(await page.evaluate(`document.querySelector("#setting-update-check").checked`), false);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("a newer version shows a banner that never blocks work, and off shows none", async () => {
    fixture.reset();
    fixture.setUpdate("notify", "9.9.9");
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup with a newer version armed",
      10000,
    );
    await page.waitFor(`!document.querySelector("#update-banner").hidden`, "the update banner");
    const banner = await page.evaluate(`({
      text: document.querySelector("#update-banner-text").textContent,
      link: document.querySelector("#update-banner-link").href,
      consent: document.querySelector("#consent-bar").hidden
    })`);
    assert.match(banner.text, /9\.9\.9/);
    assert.equal(banner.link, "https://example.com/tag/v9.9.9");
    assert.equal(banner.consent, true, "an answered consent never asks again");

    // The banner never blocks: a project opens and saves while it shows.
    await openProject(page);
    await waitForSaved(page);

    await page.click("#update-banner-dismiss");
    assert.equal(await page.evaluate(`document.querySelector("#update-banner").hidden`), true);
    assert.equal(await page.evaluate(`localStorage.getItem("assemblash-update-banner-v1")`), "9.9.9");

    // Check off, nothing cached: no banner and no question.
    fixture.reset();
    fixture.setUpdate("off", null);
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup with the check off",
      10000,
    );
    assert.equal(await page.evaluate(`document.querySelector("#update-banner").hidden`), true);
    assert.equal(await page.evaluate(`document.querySelector("#consent-bar").hidden`), true);
  });

  await t.test("Settings surfaces the font tools without leaving the modal open", async () => {
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    await page.click("#settings-fonts-open");
    await page.waitFor(`!document.querySelector("#settings-dialog").open`, "the modal closed");
    assert.deepEqual(await page.evaluate(`({
      section: !document.querySelector("#add-fonts-section").hidden,
      title: document.querySelector("#add-panel-title").textContent
    })`), { section: true, title: "Fonts" });
  });

  await t.test("the canvas hint names panning, and Space prevents a marquee inside the canvas", async () => {
    fixture.reset();
    await openProject(page);
    assert.equal(await page.evaluate(`document.querySelector("#canvas-hints").hidden`), false);
    const hint = await page.evaluate(`document.querySelector("#canvas-hints").textContent`);
    assert.match(hint, /Space/);
    assert.doesNotMatch(hint, /Shift|Ctrl/);

    await page.key(" ", { code: "Space" });
    const panning = await page.evaluate(`(() => {
      const overlay = document.querySelector("#overlay");
      const box = overlay.getBoundingClientRect();
      overlay.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 1,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      }));
      return {
        panning: document.querySelector("#stage-viewport").classList.contains("panning"),
        marquee: document.querySelector(".selection-marquee") !== null,
      };
    })()`);
    assert.deepEqual(panning, { panning: true, marquee: false });
    await page.evaluate(`(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
      window.dispatchEvent(new KeyboardEvent("keyup", { key: " ", code: "Space", bubbles: true }));
      return true;
    })()`);

    const bounded = await page.evaluate(`(() => {
      const overlay = document.querySelector("#overlay");
      const box = overlay.getBoundingClientRect();
      overlay.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 2,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      }));
      window.dispatchEvent(new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 2,
        clientX: box.right + box.width,
        clientY: box.bottom + box.height,
      }));
      const marquee = document.querySelector(".selection-marquee");
      const values = {
        left: parseFloat(marquee.style.left),
        top: parseFloat(marquee.style.top),
        width: parseFloat(marquee.style.width),
        height: parseFloat(marquee.style.height),
      };
      window.dispatchEvent(new PointerEvent("pointerup", {
        bubbles: true,
        pointerId: 2,
        clientX: box.right + box.width,
        clientY: box.bottom + box.height,
      }));
      return values;
    })()`);
    for (const value of Object.values(bounded)) {
      assert.ok(value >= 0 && value <= 100, `marquee percentage ${value} stayed inside the canvas`);
    }
    await page.waitFor("document.querySelector('#canvas-hints').hidden", "the canvas hint to close", 6500);
  });

  await t.test("a slot is edited beside its row as one updateSlot operation", async () => {
    fixture.reset();
    await openProject(page);
    await selectLayer(page, "layer_text");
    await page.waitFor(
      `document.querySelector('.slot-edit[data-slot="headline"]') !== null`,
      "the slot edit control",
    );
    fixture.writes.length = 0;
    await page.click('.slot-edit[data-slot="headline"]');
    await page.waitFor(`document.querySelector(".slot-edit-name") !== null`, "the slot editor");
    // Escape inside the editor cancels and writes nothing.
    await page.evaluate(`(() => {
      document.querySelector(".slot-edit-name").dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`document.querySelector(".slot-edit-name") === null`, "the editor closed");
    await page.waitFor(`document.querySelector('.slot-edit[data-slot="headline"]') !== null`, "the slot row to return");
    assert.equal(fixture.writes.length, 0);

    await page.click('.slot-edit[data-slot="headline"]');
    await page.evaluate(`(() => {
      const name = document.querySelector(".slot-edit-name");
      name.value = "title";
      document.querySelector(".slot-edit-kind").value = "text";
      return true;
    })()`);
    await page.click(".slot-edit-save");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "updateSlot",
      name: "headline",
      slot: { name: "title", layer: "layer_text", kind: "text", required: true },
    });
    assert.match(
      await page.evaluate(`document.querySelector("#status").textContent`),
      /Edit complete \(version 2\)/,
    );
  });

  await t.test("an empty font store offers the pack it would download, and text needs no terminal", async () => {
    fixture.reset();
    fixture.setFonts([]);
    await openProject(page);
    await openFontsPanel(page);
    await page.waitFor(`!document.querySelector("#font-empty").hidden`, "the empty font state");
    await waitForSaved(page);

    const empty = await page.evaluate(`({
      detail: document.querySelector("#install-default-detail").textContent,
      installCopy: document.querySelector(".font-install-copy")?.textContent ?? "",
      listed: document.querySelectorAll("#font-list li").length
    })`);
    assert.equal(empty.listed, 0);
    for (const family of FONT_CATALOGUE.packs.default) {
      assert.ok(empty.detail.includes(family), `${family} missing from "${empty.detail}"`);
    }
    assert.match(empty.detail, /12 MB/);
    assert.match(empty.detail, /when you click/);
    // Contents E6: the empty state explains the install before it happens.
    assert.match(empty.installCopy, /manifest built into this program/);
    assert.match(empty.installCopy, /only when you click/);
    assert.match(empty.installCopy, /workspace font store/);
    // Describing the pack reads the catalogue; nothing is fetched until the
    // button is pressed, so no install has been posted yet.
    assert.equal(fixture.fontCalls.filter((call) => call.method === "POST").length, 0);

    // The defect this rung fixes: the text preset used to answer with a
    // command line. It now opens this panel with the install button focused.
    fixture.writes.length = 0;
    await page.click("#add-text");
    await page.click('[data-text-preset="heading"]');
    await page.waitFor(
      `document.activeElement?.id === "install-default"`,
      "the install button focused from a text preset",
    );
    const refusal = await page.evaluate(`document.querySelector("#status").textContent`);
    assert.match(refusal, /no fonts are installed/i);
    assert.ok(!refusal.includes("assemblash font install"), refusal);
    assert.equal(fixture.writes.length, 0);

    // A refused install leaves the store untouched and the button pressable:
    // the server guarantees the first, and the panel must not take away the
    // second — trying again is the whole of the recovery.
    fixture.failNextInstall("the font mirror could not be reached");
    await page.click("#install-default");
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("fontInstallFailed")`,
      "the refused install",
    );
    assert.deepEqual(await page.evaluate(`({
      disabled: document.querySelector("#install-default").disabled,
      label: document.querySelector("#install-default-label").textContent,
      listed: document.querySelectorAll("#font-list li").length,
      status: document.querySelector("#status").textContent
    })`), {
      disabled: false,
      label: "Install the default font pack",
      listed: 0,
      status: "the font mirror could not be reached (fontInstallFailed)",
    });

    await page.click("#install-default");
    // The install is finished when it says so — the list is redrawn earlier,
    // in the middle of the same run, and acting on that would race it.
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("Noto Sans")`,
      "the default pack to be installed",
    );
    assert.deepEqual(await page.evaluate(`({
      empty: document.querySelector("#font-empty").hidden,
      listed: document.querySelectorAll("#font-list li").length,
      faces: document.querySelector("#font-list li .font-faces").textContent
    })`), {
      empty: true,
      listed: 3,
      faces: "1 face of Normal 400",
    });

    // And the thing that could not be done a moment ago now works.
    await page.click("#add-text");
    await page.click('[data-text-preset="heading"]');
    await waitForWrites(fixture);
    await page.waitFor(`document.querySelector('.inline-text-editor')`, "the new heading's inline editor");
    await page.evaluate(`document.querySelector('.inline-text-editor').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    assert.equal(fixture.writes[0].body.operation.op, "create");
    assert.equal(fixture.writes[0].body.operation.type, "text");
    assert.equal(fixture.writes[0].body.operation.fontFamily, "Noto Sans");
  });

  await t.test("a font file is imported, and a file that is not one says why", async () => {
    await openFontsPanel(page);
    await waitForSaved(page);
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 3);

    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array([0, 1, 0, 0])], "Brand Sans.ttf", { type: "font/ttf" }));
      const input = document.querySelector("#font-file");
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("Imported 1 font file")`,
      "the imported family",
    );
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 4);
    assert.equal(
      await page.evaluate(`document.querySelector("#font-feedback").textContent`),
      "Brand Sans.ttf → Brand Sans",
    );

    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array([1, 2, 3])], "notes.txt", { type: "text/plain" }));
      const input = document.querySelector("#font-file");
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("No files imported")`,
      "the refusal for a file that is not a font",
    );
    const refused = await page.evaluate(`({
      feedback: document.querySelector("#font-feedback").textContent,
      listed: document.querySelectorAll("#font-list li").length,
      status: document.querySelector("#status").textContent
    })`);
    assert.match(refused.feedback, /notes\.txt/);
    assert.match(refused.feedback, /is not a font format this build can import/);
    assert.equal(refused.listed, 4);
    assert.match(refused.status, /No files imported/);
  });

  await t.test("removing a family asks first, and sends nothing when dismissed", async () => {
    const deletes = () => fixture.fontCalls.filter((call) => call.method === "DELETE").length;
    await page.evaluate(`(() => { window.confirm = () => false; return true; })()`);
    const before = deletes();
    await page.click('#font-list [data-remove-family="Brand Sans"]');
    assert.equal(deletes(), before);
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 4);

    await page.evaluate(`(() => { window.confirm = () => true; return true; })()`);
    await page.click('#font-list [data-remove-family="Brand Sans"]');
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("Removed Brand Sans")`,
      "the removed family",
    );
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 3);
    assert.equal(deletes(), before + 1);
    assert.ok(fixture.fontCalls.some((call) => call.method === "DELETE" && call.path.endsWith("/Brand%20Sans")));
    assert.match(await page.evaluate(`document.querySelector("#status").textContent`), /Removed Brand Sans/);
  });

  await t.test("the font selector searches, refuses an unknown family at the control, and applies a listed one", async () => {
    fixture.reset();
    await openProject(page);
    await selectLayer(page, "layer_text");

    // Search: typing filters the list the page drew, not a browser datalist.
    await page.evaluate(`(() => {
      const input = document.querySelector("#inspector .font-selector input");
      input.focus();
      input.value = "serif";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`);
    assert.deepEqual(await selectorFamilies(page), ["Noto Serif"]);

    // Keyboard focus names the highlighted row, and Enter uses the same update path.
    fixture.writes.length = 0;
    const keyboardState = await page.evaluate(`(() => {
      const input = document.querySelector("#inspector .font-selector input");
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
      const active = document.getElementById(input.getAttribute("aria-activedescendant"));
      return {
        family: active?.dataset.family,
        selected: active?.getAttribute("aria-selected"),
        visible: active?.classList.contains("active"),
        outline: active ? getComputedStyle(active).outlineStyle : null,
      };
    })()`);
    assert.deepEqual(keyboardState, { family: "Noto Serif", selected: "true", visible: true, outline: "solid" });
    await page.evaluate(`document.querySelector("#inspector .font-selector input")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update", id: "layer_text", fontFamily: "Noto Serif",
    });
    // A value that matches nothing is refused at the control: a visible
    // message, and no operation anywhere. The engine never substitutes.
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector("#inspector .font-selector input");
      input.value = "Brand Sans";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new FocusEvent("blur"));
      return true;
    })()`);
    assert.match(
      await page.evaluate(`document.querySelector("#inspector .font-selector-message").textContent`),
      /not installed/,
    );
    assert.equal(await page.evaluate(`document.querySelector("#inspector .font-selector-message").hidden`), false);
    assert.equal(fixture.writes.length, 0);

    // Choosing a listed family commits one ordinary update through the queue.
    await page.evaluate(`(() => {
      const input = document.querySelector("#inspector .font-selector input");
      input.value = "";
      input.dispatchEvent(new FocusEvent("focus"));
      return true;
    })()`);
    await page.waitFor(`!document.querySelector("#inspector .font-selector-list").hidden`, "the family list again");
    await page.evaluate(`(() => {
      document.querySelector('#inspector .font-selector-list li[data-family="Noto Sans"]')
        .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      return true;
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update",
      id: "layer_text",
      fontFamily: "Noto Sans",
    });

    // With the store recording this family's faces, weight is a select over
    // those faces — not the bare number field a refused weight used to need.
    assert.equal(
      await page.evaluate(`document.querySelector('#advanced-inspector [aria-label="Font weight"]')?.tagName`),
      "SELECT",
    );
    assert.deepEqual(
      await page.evaluate(`[...document.querySelectorAll('#advanced-inspector [aria-label="Font weight"] option')].map((one) => one.textContent)`),
      ["400"],
    );
  });

  await t.test("the install is explained where it is offered", async () => {
    fixture.reset();
    fixture.setFonts([]);
    await openProject(page);
    await openFontsPanel(page);
    await page.waitFor(`!document.querySelector("#font-empty").hidden`, "the empty font state");
    await waitForSaved(page);
    const copy = await page.evaluate(`document.querySelector(".font-install-copy").textContent`);
    assert.match(copy, /installs the default font pack/);
    assert.match(copy, /manifest built into this program/, "the pinned manifest is named");
    assert.match(copy, /download starts only when you click/, "explicit download is named");
    assert.match(copy, /only when you click/, "the silent-fetch refusal is named");
    assert.match(copy, /workspace font store/, "where the files land is named");

    // The Settings entry carries the same explanation.
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "the settings modal");

    const settingsHint = await page.evaluate(
      `document.querySelector("#settings-dialog .settings-section:nth-of-type(3) .hint").textContent`,
    );
    assert.match(settingsHint, /downloads fonts only when you click/);
    assert.match(settingsHint, /manifest built into this program/);
    assert.match(settingsHint, /only when you click/);
    assert.match(settingsHint, /workspace font store/);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("optional font packs name their files before one explicit install", async () => {
    fixture.reset();
    await openProject(page);
    await openFontsPanel(page);
    await page.waitFor(`!document.querySelector("#font-pack-section").hidden`, "optional font packs");
    const before = fixture.fontCalls.filter((call) => call.method === "POST").length;
    const packs = await page.evaluate(`[...document.querySelectorAll("#font-pack-options [data-pack]")].map((button) => ({
      pack: button.dataset.pack,
      detail: button.querySelector("span").textContent,
    }))`);
    assert.deepEqual(packs.map((one) => one.pack), ["text", "display", "mono"]);
    assert.match(packs[0].detail, /Inter, Roboto, Open Sans,? and Lora/);
    assert.match(packs[0].detail, /when you click/);
    assert.equal(fixture.fontCalls.filter((call) => call.method === "POST").length, before);
    await page.click("#font-pack-section summary");
    await page.click('#font-pack-options [data-pack="text"]');
    await page.waitFor(`[...document.querySelectorAll("#font-list [data-family]")].some((one) => one.dataset.family === "Inter")`, "Inter to be installed");
    await page.waitFor(`document.querySelector("#status").textContent.includes("Installed font pack text")`, "font pack install to finish");
    assert.equal(fixture.fontCalls.filter((call) => call.method === "POST").length, before + 1);
    assert.equal(await page.evaluate(`document.querySelector('#font-pack-options [data-pack="text"]').disabled`), true);
  });
  await t.test("at 1280x800 the editor fits, the inspector stays usable, and panels collapse", async () => {
    fixture.reset();
    await openProject(page);
    await selectLayer(page, "layer_text");
    await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await page.waitFor(`window.innerWidth === 1280`, "the 13-inch viewport");
    await withTimeout(
      page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`),
      "two animation frames after the viewport change",
    );
    await page.evaluate(`window.dispatchEvent(new Event("resize"))`);

    // No horizontal scrollbar on the main screen.
    const viewportLayout = await page.evaluate(`(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll("body *")]
        .filter((one) => {
          const box = one.getBoundingClientRect();
          const style = getComputedStyle(one);
          return style.display !== "none" && box.width > 0 && (box.right > window.innerWidth || box.left < 0);
        })
        .map((one) => {
          const box = one.getBoundingClientRect();
          return { tag: one.tagName, id: one.id, className: one.className, left: box.left, right: box.right, width: box.width };
        })
        .slice(0, 12)
    }))()`);
    assert.equal(viewportLayout.overflow, 0, JSON.stringify(viewportLayout.offenders));
    // The inspector stays usable: its controls sit inside the viewport.
    const inspector = await page.evaluate(`(() => {
      const toolbar = document.querySelector("#inspector");
      const box = toolbar.getBoundingClientRect();
      const input = toolbar.querySelector('[aria-label="Font family"]');
      const inputBox = input?.getBoundingClientRect();
      return {
        onScreen: box.right <= window.innerWidth && box.left >= 0,
        inputUsable: !!inputBox && inputBox.width > 0 && inputBox.right <= window.innerWidth,
      };
    })()`);
    assert.deepEqual(inspector, { onScreen: true, inputUsable: true });

    // The content panel closes and reopens from its rail entry.
    await page.click("#add-text");
    await page.click("#add-panel-close");
    assert.equal(
      await page.evaluate(`document.querySelector("#add-panel").classList.contains("collapsed")`),
      true,
    );
    await page.click("#add-text");
    assert.equal(
      await page.evaluate(`document.querySelector("#add-panel").classList.contains("collapsed")`),
      false,
    );
    // …and a Properties section collapses with one click.
    await page.click("#properties-tab");
    assert.equal(
      await page.evaluate(`document.querySelector("#properties-panel").scrollWidth - document.querySelector("#properties-panel").clientWidth`),
      0,
      "Properties has no horizontal scrollbar",
    );

    const sectionWasOpen = await page.evaluate(`document.querySelector("#advanced-inspector details").open`);
    await page.evaluate(`document.querySelector("#advanced-inspector details summary").click()`);
    assert.equal(await page.evaluate(`document.querySelector("#advanced-inspector details").open`), !sectionWasOpen);

    await page.send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
    await page.waitFor(`window.innerWidth === 1400`, "the viewport restored");
  });

  await t.test("the Elements drawer and four shape actions stay on screen at 390px", async () => {
    await page.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 800, deviceScaleFactor: 1, mobile: false });
    await page.waitFor(`window.innerWidth === 390`, "the narrow viewport");
    await withTimeout(
      page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`),
      "two animation frames after the narrow viewport change",
    );
    await page.evaluate(`window.dispatchEvent(new Event("resize"))`);
    await page.click("#add-shape");
    const drawer = await page.evaluate(`(() => {
      const panel = document.querySelector("#add-panel");
      const panelBox = panel.getBoundingClientRect();
      const actions = [...document.querySelectorAll("#add-shape-section [data-shape]")];
      return {
        open: !panel.classList.contains("collapsed") && !document.querySelector("#add-shape-section").hidden,
        intersectsViewport: panelBox.width > 0 && panelBox.height > 0
          && panelBox.left < innerWidth && panelBox.right > 0
          && panelBox.top < innerHeight && panelBox.bottom > 0,
        actions: actions.map((action) => {
          const box = action.getBoundingClientRect();
          return {
            shape: action.dataset.shape,
            visible: box.width > 0 && box.height > 0
              && box.left >= 0 && box.right <= innerWidth
              && box.top >= 0 && box.bottom <= innerHeight,
          };
        }),
      };
    })()`);
    assert.equal(drawer.open, true);
    assert.equal(drawer.intersectsViewport, true, "the Elements drawer must intersect the viewport");
    assert.deepEqual(drawer.actions, ["rect", "ellipse", "line", "path"].map((shape) => ({ shape, visible: true })));
    await page.click("#add-panel-close");
    assert.equal(await page.evaluate(`document.querySelector("#add-panel").classList.contains("collapsed")`), true);
    await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await page.waitFor(`window.innerWidth === 1280`, "the 1280px viewport restored");
  });
  await t.test("a lock the server reclaimed on its own is reported once, on the next open", async () => {
    fixture.reset();
    fixture.armReclaimedLock({ pid: 4242, host: "workstation-7", at: Date.now() });
    await page.evaluate(`(() => { const select = document.querySelector("#projects"); select.value = "demo"; select.dispatchEvent(new Event("change", { bubbles: true })); })()`);
    await page.waitFor(
      `document.querySelector("#status")?.textContent?.includes("Recovered this project automatically")`,
      "the automatic lock-recovery notice",
    );
    assert.match(
      await page.evaluate(`document.querySelector("#status").textContent`),
      /pid 4242 on workstation-7/,
    );

    // The server drains the reclaim on read, so reopening the same project
    // fetches a summary with no `reclaimedLock` and shows the ordinary
    // "Opened" status instead.
    await openProject(page);
    assert.doesNotMatch(
      await page.evaluate(`document.querySelector("#status").textContent`),
      /Recovered this project automatically/,
    );
  });

  await t.test("each shape is added by one create carrying its geometry and paint", async () => {
    fixture.reset();
    await openProject(page);
    // Opening says so before its last read has returned. Waiting for the
    // saved state keeps this journey counting one interaction's writes at a
    // time; a create rushed in before that would queue behind the open and
    // still land, in order.
    await waitForSaved(page);
    await page.click("#add-shape");

    assert.deepEqual(await page.evaluate(`({
      title: document.querySelector("#add-panel-title").textContent,
      visible: !document.querySelector("#add-shape-section").hidden,
      shownSections: [...document.querySelectorAll(".add-section")].filter((one) => !one.hidden).length,
      offered: [...document.querySelectorAll("#add-shape-section [data-shape]")].map((one) => one.dataset.shape)
    })`), {
      title: "Elements",
      visible: true,
      shownSections: 1,
      offered: ["rect", "ellipse", "line", "path"],
    });
    const shapeControls = await page.evaluate(`[...document.querySelectorAll("#add-shape-section [data-shape]")].map((button) => ({
      height: button.getBoundingClientRect().height,
      radius: parseFloat(getComputedStyle(button).borderTopLeftRadius),
      icon: !!button.querySelector(".shape-preset-icon i"),
    }))`);
    assert.equal(shapeControls.length, 4);
    assert.ok(shapeControls.every((control) => control.height >= 48 && control.radius >= 12 && control.icon));

    // Each button is one create: the geometry and the paint arrive together,
    // so there is never a moment when the document holds an unpainted shape.
    const expected = [
      ["rect", {
        op: "create",
        position: { at: "root" },
        transform: { x: 340, y: 230, width: 320, height: 240 },
        type: "shape",
        shape: { kind: "rect", cornerRadius: 0 },
        fill: "#3366cc",
      }],
      ["ellipse", {
        op: "create",
        position: { at: "root" },
        transform: { x: 340, y: 230, width: 320, height: 240 },
        type: "shape",
        shape: { kind: "ellipse" },
        fill: "#3366cc",
      }],
      ["line", {
        op: "create",
        position: { at: "root" },
        // A line's box is 24 tall although the segment it draws is 2: the
        // height is layout only, and a flat box would put the selection
        // handles on top of one another.
        transform: { x: 300, y: 338, width: 400, height: 24 },
        type: "shape",
        shape: { kind: "line" },
        stroke: { color: "#111111", width: 2 },
      }],
    ];
    for (const [kind, operation] of expected) {
      fixture.writes.length = 0;
      await page.click(`[data-shape="${kind}"]`);
      await waitForWrites(fixture);
      await waitForSaved(page);
      assert.equal(fixture.writes.length, 1, `${kind} sent ${fixture.writes.length} operations`);
      assert.deepEqual(fixture.writes[0].body.operation, operation);
    }

    // The tree says which primitive each layer is, rather than showing three
    // identical rows.

    assert.deepEqual(await page.evaluate(`({
      rect: document.querySelector('.layer[data-id="layer_made_3"] .layer-icon').className,
      ellipse: document.querySelector('.layer[data-id="layer_made_4"] .layer-icon').className,
      line: document.querySelector('.layer[data-id="layer_made_5"] .layer-icon').className
    })`), {
      rect: "ph ph-square layer-icon",
      ellipse: "ph ph-circle layer-icon",
      line: "ph ph-line-segment layer-icon",
    });
  });

  await t.test("a shape's paint and corners each send exactly one update", async () => {
    await selectLayer(page, "layer_made_3");
    assert.deepEqual(await page.evaluate(`({
      heading: [...document.querySelectorAll("#advanced-inspector h2")].some((one) => one.textContent === "Shape"),
      fill: document.querySelector(".shape-fill").value,
      clearFill: document.querySelector(".shape-fill-none").disabled,
      stroke: document.querySelector(".shape-stroke").value,
      clearStroke: document.querySelector(".shape-stroke-none").disabled,
      width: document.querySelector(".shape-stroke-width").value,
      corner: document.querySelector(".shape-corner-radius").value
    })`), {
      heading: true,
      fill: "#3366cc",
      clearFill: false,
      // A rect created with a fill has no stroke: the colour offered is the
      // one a stroke would be added with, and there is nothing to clear.
      stroke: "#111111",
      clearStroke: true,
      width: "2",
      corner: "0",
    });

    fixture.writes.length = 0;
    await page.click(".shape-fill-none");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "update", id: "layer_made_3", fill: null });
    assert.equal(await page.evaluate(`document.querySelector(".shape-fill-none").disabled`), true);

    // A stroke is one value: the width carries the colour it is drawn with,
    // so the engine never has to merge two updates to know what to paint.
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-stroke-width");
      input.value = "6";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update",
      id: "layer_made_3",
      stroke: { color: "#111111", width: 6 },
    });

    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-corner-radius");
      input.value = "12";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "update", id: "layer_made_3", cornerRadius: 12 });
    assert.deepEqual(await page.evaluate(`({
      corner: document.querySelector(".shape-corner-radius").value,
      clearStroke: document.querySelector(".shape-stroke-none").disabled
    })`), { corner: "12", clearStroke: false });

    // Only a rect has corners; offering the row on an ellipse would be a form
    // that invites the engine's refusal.
    await selectLayer(page, "layer_made_4");
    assert.deepEqual(await page.evaluate(`({
      corner: Boolean(document.querySelector(".shape-corner-radius")),
      fill: document.querySelector(".shape-fill").value,
      clearFill: document.querySelector(".shape-fill-none").disabled
    })`), { corner: false, fill: "#3366cc", clearFill: false });
  });

  await t.test("a drop shadow joins the effect stack with its four fields", async () => {
    await selectLayer(page, "layer_made_5");
    fixture.writes.length = 0;
    await page.evaluate(`(() => { document.querySelector(".effect-chooser").value = "dropShadow"; })()`);
    await page.click(".effect-add");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation.effects, [
      { type: "dropShadow", dx: 4, dy: 4, blur: 6, color: "#00000080" },
    ]);
    assert.deepEqual(await page.evaluate(`({
      offered: [...document.querySelectorAll(".effect-chooser option")].map((one) => one.value),
      fields: [...document.querySelectorAll('.effect-row[data-effect="dropShadow"] input')]
        .map((one) => [one.dataset.field, one.type, one.value])
    })`), {
      offered: ["brightness", "contrast", "saturation", "blur", "grain", "dropShadow"],
      // The colour is typed rather than picked: a colour input cannot hold the
      // alpha this default carries, and dropping it silently would change the
      // picture on the first edit.
      fields: [["dx", "number", "4"], ["dy", "number", "4"], ["blur", "number", "6"], ["color", "text", "#00000080"]],
    });

    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector('.effect-row[data-effect="dropShadow"] [data-field="dy"]');
      input.value = "10";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation.effects, [
      { type: "dropShadow", dx: 4, dy: 10, blur: 6, color: "#00000080" },
    ]);
  });

  await t.test("a rapid burst of edits is never dropped, and the journal matches", async () => {
    await selectLayer(page, "layer_text");
    const before = await page.evaluate(`document.querySelector(".layer[data-id='layer_text']") !== null`);
    assert.ok(before, "the text layer is on the page");
    const startX = fixture.layers().find((one) => one.id === "layer_text")?.transform.x ?? 0;

    // Twenty nudges with no waiting between them: faster than any round trip
    // can finish. Dropping these was the defect this queue exists to fix —
    // every keypress is an intent, and every intent must reach the journal.
    fixture.writes.length = 0;
    for (let i = 0; i < 20; i++) {
      await page.key("ArrowRight", { code: "ArrowRight" });
    }
    await waitForWrites(fixture, 20);
    await waitForSaved(page);

    assert.equal(fixture.writes.length, 20, "one write per keypress, none dropped");
    const moves = fixture.writes.map((one) => one.body.commands[0]);
    assert.ok(moves.every((move) => move.op === "move" && move.id === "layer_text" && move.dx === 1 && move.dy === 0));
    const finalX = fixture.layers().find((one) => one.id === "layer_text")?.transform.x ?? 0;
    assert.equal(finalX, startX + 20, "the document moved by exactly the nudges sent");
    const status = await page.evaluate(`({
      kind: document.querySelector("#status").dataset["kind"] ?? "",
      saved: document.querySelector("#save-state")?.textContent ?? ""
    })`);
    assert.notEqual(status.kind, "error", "a fast human generated no error");
    assert.match(status.saved, /All changes saved/);
  });

  await t.test("rapid edits on one field coalesce to the newest; different fields never do", async () => {
    await selectLayer(page, "layer_text");
    // Both edits of a pair are dispatched inside one browser task: between
    // two separate evaluates the whole queue could drain, and the journey
    // would measure a coincidence rather than the contract.
    const setFields = async (edits) => {
      await page.evaluate(`(() => {
        const set = (label, value) => {
          const wrapper = [...document.querySelectorAll("#advanced-inspector label.field")]
            .find((one) => one.textContent.trim().startsWith(label));
          const input = wrapper && wrapper.querySelector("input");
          if (!input) throw new Error("no " + label + " field");
          input.value = value;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        };
        ${edits.map(([label, value]) => `set(${JSON.stringify(label)}, ${JSON.stringify(value)});`).join("\n        ")}
      })()`);
    };

    // Coalescing is a statement about a queue that cannot dispatch fast
    // enough, so the journey loads it first: twenty nudges still draining
    // when the field edits land behind them.
    fixture.writes.length = 0;
    for (let i = 0; i < 20; i++) {
      await page.key("ArrowRight", { code: "ArrowRight" });
    }
    // Two changes to the same property before either can dispatch: the newer
    // says everything the older said, so only it is sent.
    await setFields([["Font size", "36"], ["Font size", "40"]]);
    await waitForWrites(fixture, 21);
    await waitForSaved(page);

    assert.equal(fixture.writes.length, 21, "twenty nudges and one — not two — font size write");
    const moves = fixture.writes.slice(0, 20).map((one) => one.body.commands[0].op);
    assert.ok(moves.every((op) => op === "move"));
    assert.deepEqual(fixture.writes[20].body.operation, {
      op: "update",
      id: "layer_text",
      fontSize: 40,
    }, "the coalesced write carries the newest value");

    // Alternating properties say different things; loaded or idle, neither
    // may replace the other, and the journal must match the edits exactly.
    fixture.writes.length = 0;
    for (let i = 0; i < 20; i++) {
      await page.key("ArrowRight", { code: "ArrowRight" });
    }
    await setFields([["Font size", "52"], ["Line height", "1.6"]]);
    await waitForWrites(fixture, 22);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 22, "different properties never replace each other");
    assert.deepEqual(fixture.writes[20].body.operation, { op: "update", id: "layer_text", fontSize: 52 });
    assert.deepEqual(fixture.writes[21].body.operation, { op: "update", id: "layer_text", lineHeight: 1.6 });
  });

  await t.test("a refused edit behind an accepted one leaves the page on the newest version", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    await selectLayer(page, "layer_text");
    // Two nudges before either returns: the second one's snapshot is taken
    // while the first is still on its way. The engine accepts the first and
    // refuses the second. Restoring the second one's snapshot would put the
    // page back on the version before the first edit.
    fixture.refuseWrite(2);
    await page.evaluate(`(() => {
      for (let i = 0; i < 2; i++) {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", code: "ArrowRight", bubbles: true }));
      }
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").dataset.kind === "error"`,
      "the refusal to be reported",
    );
    await page.waitFor(
      `document.querySelector("#version").textContent === ${JSON.stringify(String(fixture.version()))}`,
      "the page to show the newest version after the refusal",
      10000,
    );
    await page.waitFor(
      `!document.querySelector("#save-state").textContent.includes("Working")`,
      "the queue to finish after the refusal",
    );
    // The next edit must be written against the newest version. A restored
    // stale snapshot would send the version from before the accepted edit,
    // and a real engine would refuse it as a version conflict.
    const newest = fixture.version();
    fixture.writes.length = 0;
    await page.key("ArrowRight", { code: "ArrowRight" });
    await waitForWrites(fixture, 1);
    await waitForSaved(page);
    assert.equal(
      fixture.writes[0].body.expectedVersion,
      newest,
      "the edit after a refusal quotes the newest version",
    );
  });

  await t.test("a preview the engine refuses is reported, not only logged", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    // Every preview fails for the moment, so the one this nudge asks for is
    // refused whatever the preview of the open was still doing.
    fixture.failPreviews(1000);
    await selectLayer(page, "layer_text");
    await page.key("ArrowRight", { code: "ArrowRight" });
    await page.waitFor(
      `document.querySelector("#status").dataset.kind === "error" && document.querySelector("#status").textContent.includes("missingFont")`,
      "the refused preview to be reported",
    );
    fixture.failPreviews(0);
  });

  await t.test("following another client waits while the person types in a field", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    await selectLayer(page, "layer_text");
    const before = await page.evaluate(`document.querySelector("#version").textContent`);
    // Typing, not yet committed: an input event and no change event.
    await page.evaluate(`(() => {
      const wrapper = [...document.querySelectorAll("#advanced-inspector label.field")]
        .find((one) => one.textContent.trim().startsWith("Font size"));
      const input = wrapper.querySelector("input");
      input.focus();
      input.value = "77";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      window.__typedInto = input;
      return true;
    })()`);
    const version = fixture.editAsAgent(5);
    await new Promise((resolve) => setTimeout(resolve, 3500));
    assert.equal(
      await page.evaluate(`document.querySelector("#version").textContent`),
      before,
      "the page did not refresh while the person was typing",
    );
    assert.equal(await page.evaluate(`window.__typedInto.value`), "77", "the typed value survived");
    // The person leaves the field without committing; following resumes. The
    // test tab is not the focused window, so focus() and blur() do not fire
    // focus events here: the leave is dispatched as the event it would be.
    await page.evaluate(`(() => {
      window.__typedInto.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#version").textContent === ${JSON.stringify(String(version))}`,
      "the page to follow once the person stopped typing",
      10000,
    );
  });

  await t.test("actions waiting in the queue run on their own project when the person opens another", async () => {
    fixture.reset();
    fixture.useSecondProject(true);
    fixture.setHistoryPosition(2);
    await openProject(page);
    await waitForSaved(page);
    // The page lists the second project by itself (it follows the list).
    await page.waitFor(
      `[...document.querySelector("#projects").options].some((one) => one.value === "second")`,
      "the second project to be listed",
    );
    await page.waitFor(`!document.querySelector("#undo").disabled`, "undo to be available");
    await waitForSaved(page);

    // Two undos, the first held by the engine, and then — before either has
    // finished — the person opens the other project. Both undos were asked
    // for on "demo" and must run there.
    fixture.delayUndo(600);
    await page.evaluate(`(() => {
      document.querySelector("#undo").click();
      document.querySelector("#undo").click();
      import("/i18n.js").then((i18n) => i18n.setLocale("fr"));
      const select = document.querySelector("#projects");
      select.value = "second";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("Second project")`,
      "the second project to open after the waiting undos",
      10000,
    );
    assert.equal(await page.evaluate(`document.documentElement.lang`), "fr");
    assert.deepEqual(fixture.undos, ["demo", "demo"], "every undo ran on the project it was made for");
    await page.evaluate(`import("/i18n.js").then((i18n) => i18n.setLocale("en"))`);
    fixture.useSecondProject(false);
  });

  await t.test("the status bar says when AI agents are connected", async () => {
    fixture.reset();
    await openProject(page);
    assert.equal(await page.evaluate(`document.querySelector("#agents-connected").hidden`), true);

    fixture.setAgentCount(1);
    await page.waitFor(
      `!document.querySelector("#agents-connected").hidden`,
      "the connected-agent chip to appear",
      10000,
    );
    assert.match(
      await page.evaluate(`document.querySelector("#agents-connected").textContent`),
      /1 AI agent connected/,
    );

    fixture.setAgentCount(3);
    await page.waitFor(
      `document.querySelector("#agents-connected").textContent.includes("3 AI agents connected")`,
      "the count to follow",
      10000,
    );

    fixture.setAgentCount(0);
    await page.waitFor(
      `document.querySelector("#agents-connected").hidden`,
      "the chip to go when the agents leave",
      10000,
    );
  });

  await t.test("the agent dialog opens from Settings and shows copy-ready configuration", async () => {
    assert.equal(await page.evaluate(`document.querySelector(".topbar #agents") === null`), true);
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to open");
    await page.click("#agents");
    await page.waitFor(`document.querySelector("#agents-dialog").open`, "the agent dialog to open");
    assert.equal(await page.evaluate(`document.querySelector("#settings-dialog").open`), false);
    const blocks = await page.evaluate(`Object.fromEntries(
      [...document.querySelectorAll("#agents-blocks .agent-block")]
        .map((one) => [one.dataset.block, one.querySelector("code").textContent])
    )`);
    assert.deepEqual(Object.keys(blocks), ["json", "codex", "url"]);
    const json = JSON.parse(blocks.json);
    assert.deepEqual(json.mcpServers.assemblash, {
      command: AGENT_EXECUTABLE,
      args: ["mcp", "--workspace", AGENT_WORKSPACE],
    });
    // A TOML literal string keeps the Windows backslashes exactly as they are.
    const codexLines = blocks.codex.split("\n");
    assert.equal(codexLines[0], "[mcp_servers.assemblash]");
    assert.equal(codexLines[1], `command = '${AGENT_EXECUTABLE}'`);
    assert.equal(codexLines[2], `args = ['mcp', '--workspace', '${AGENT_WORKSPACE}']`);
    assert.equal(blocks.url, "http://127.0.0.1:8787/mcp");
    assert.equal(await page.evaluate(`document.querySelector("#agents-token").hidden`), true);
    await page.evaluate(`document.querySelector("#agents-dialog").close()`);
  });

  await t.test("an agent's edit appears without any action, and a project it creates is listed", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    const startX = fixture.layers().find((one) => one.id === "layer_text").transform.x;
    fixture.writes.length = 0;

    const version = fixture.editAsAgent(33);
    await page.waitFor(
      `document.querySelector("#version").textContent === ${JSON.stringify(String(version))}`,
      "the page to follow the agent's edit",
      10000,
    );
    const shownX = await page.evaluate(`(() => {
      const row = document.querySelector(".layer[data-id='layer_text']");
      return row !== null;
    })()`);
    assert.ok(shownX, "the layer is still listed after the follow");
    assert.equal(fixture.writes.length, 0, "following writes nothing");
    assert.equal(fixture.layers().find((one) => one.id === "layer_text").transform.x, startX + 33);

    // A nudge after the follow is written against the agent's version, so it
    // is not a conflict.
    await selectLayer(page, "layer_text");
    await page.key("ArrowRight", { code: "ArrowRight" });
    await waitForWrites(fixture, 1);
    await waitForSaved(page);
    assert.notEqual(
      await page.evaluate(`document.querySelector("#status").dataset["kind"] ?? ""`),
      "error",
    );

    fixture.createAsAgent("from-agent");
    await page.waitFor(
      `[...document.querySelector("#projects").options].some((one) => one.value === "from-agent")`,
      "the project an agent created to be listed",
      10000,
    );
    assert.equal(await page.evaluate(`document.querySelector("#projects").value`), "demo");
  });

  await t.test("inline rename commits one rename with Enter, cancels with Escape, and shows in the tree", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);

    // Enter commits exactly one rename operation.
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      document.querySelector('.layer[data-id="layer_text"] .name')
        .dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`document.querySelector(".layer-rename") !== null`, "the rename editor");
    await page.evaluate(`(() => {
      const input = document.querySelector(".layer-rename");
      input.value = "Renamed layer";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return true;
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "rename",
      id: "layer_text",
      name: "Renamed layer",
    });
    await page.waitFor(
      `document.querySelector('.layer[data-id="layer_text"] .name')?.textContent === "Renamed layer"`,
      "the tree to show the new name",
    );

    // Escape cancels: the editor closes, nothing is written, the name stays.
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      document.querySelector('.layer[data-id="layer_text"] .name')
        .dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`document.querySelector(".layer-rename") !== null`, "the rename editor again");
    await page.evaluate(`(() => {
      const input = document.querySelector(".layer-rename");
      input.value = "Cancelled name";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return true;
    })()`);
    await page.waitFor(`document.querySelector(".layer-rename") === null`, "the editor to close");
    assert.equal(fixture.writes.length, 0);
    assert.equal(
      await page.evaluate(`document.querySelector('.layer[data-id="layer_text"] .name')?.textContent`),
      "Renamed layer",
    );
  });

  await t.test("effect reorder is one update, and one undo returns the byte-identical document", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    await selectLayer(page, "layer_text");

    // Two order-sensitive effects: blur written first, brightness second.
    fixture.writes.length = 0;
    await page.evaluate(`(() => { document.querySelector(".effect-chooser").value = "blur"; })()`);
    await page.click(".effect-add");
    await waitForSaved(page);
    await page.evaluate(`(() => { document.querySelector(".effect-chooser").value = "brightness"; })()`);
    await page.click(".effect-add");
    await waitForSaved(page);
    await waitForWrites(fixture, 2);
    assert.deepEqual(fixture.writes[1].body.operation.effects, [
      { type: "blur", radius: 0 },
      { type: "brightness", amount: 1 },
    ]);

    // Swapping is one update of the whole stack.
    const beforeSwap = fixture.documentJson();
    fixture.writes.length = 0;
    await page.click('.effect-row[data-effect="brightness"] .effect-up');
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation.effects, [
      { type: "brightness", amount: 1 },
      { type: "blur", radius: 0 },
    ]);
    assert.deepEqual(JSON.parse(fixture.documentJson()).layers[0].effects, [
      { type: "brightness", amount: 1 },
      { type: "blur", radius: 0 },
    ]);

    // One undo: the document reads back byte-identical to before the swap.
    await page.click("#undo");
    await page.waitFor(
      `document.querySelector("#status").textContent.toLowerCase().includes("undone")`,
      "the undo to be reported",
    );
    assert.equal(fixture.documentJson(), beforeSwap);
  });

  await t.test("every parameter of one effect is set and read back from the document", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    await selectLayer(page, "layer_text");

    fixture.writes.length = 0;
    await page.evaluate(`(() => { document.querySelector(".effect-chooser").value = "dropShadow"; })()`);
    await page.click(".effect-add");
    await waitForSaved(page);
    await waitForWrites(fixture);

    const setField = (field, value) => page.evaluate(`(() => {
      const input = document.querySelector('.effect-row[data-effect="dropShadow"] [data-field="${field}"]');
      input.value = ${JSON.stringify(value)};
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    for (const [field, value] of [["dx", "10"], ["dy", "20"], ["blur", "3"], ["color", "#10203040"]]) {
      await setField(field, value);
      await waitForSaved(page);
    }
    const stored = JSON.parse(fixture.documentJson()).layers[0].effects[0];
    assert.deepEqual(stored, { type: "dropShadow", dx: 10, dy: 20, blur: 3, color: "#10203040" });
  });

  await t.test("a path layer is added by one create, and a bad d is refused writing nothing", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);

    // An invalid d: the engine's typed refusal, nothing written, nothing created.
    await page.click("#add-shape");

    await page.click('[data-shape="path"]');
    await page.waitFor(`document.querySelector("#name-dialog").open`, "the path dialog");
    await page.evaluate(`(() => {
      document.querySelector("#name-dialog-input").value = "M 0 0 Q 5 5 10 10 Z";
      document.querySelector("#name-dialog-confirm").click();
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").dataset.kind === "error"`,
      "the refusal of the invalid d",
    );
    const refusal = await page.evaluate(`document.querySelector("#status").textContent`);
    assert.match(refusal, /invalidPath/);
    assert.match(refusal, /Q/);
    assert.equal(fixture.writes.length, 0);

    // A valid d is one create carrying geometry and paint together.
    await page.click('[data-shape="path"]');
    await page.waitFor(`document.querySelector("#name-dialog").open`, "the path dialog again");
    await page.evaluate(`(() => {
      document.querySelector("#name-dialog-input").value = "M 0 0 L 100 0 L 100 100 Z";
      document.querySelector("#name-dialog-confirm").click();
      return true;
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "create",
      position: { at: "root" },
      transform: { x: 340, y: 230, width: 320, height: 240 },
      type: "shape",
      shape: { kind: "path", d: "M 0 0 L 100 0 L 100 100 Z" },
      fill: "#3366cc",
    });

    // The Properties field shows the stored d. An invalid edit there is
    // refused at the control, in the engine's words, and writes nothing.
    await selectLayer(page, "layer_made_3");
    assert.equal(
      await page.evaluate(`document.querySelector(".shape-path-d")?.value`),
      "M 0 0 L 100 0 L 100 100 Z",
    );
    fixture.armWriteRefusal("invalidPath", "unsupported path command 'Q' at byte 5");
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-path-d");
      input.value = "M 0 0 Q 5 5 10 10 Z";
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector(".path-d-note") !== null`,
      "the refusal at the path control",
    );
    assert.match(
      await page.evaluate(`document.querySelector(".path-d-note").textContent`),
      /unsupported path command 'Q' at byte 5/,
    );
    assert.equal(fixture.writes.length, 0, "a refused d writes nothing");
  });

  await t.test("a dash pattern is checked at the control, and both marker ends land on a line", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);
    await page.click("#add-shape");

    await page.click('[data-shape="line"]');
    await waitForWrites(fixture);
    await waitForSaved(page);
    await selectLayer(page, "layer_made_3");

    // A zero entry is refused before anything is sent.
    fixture.writes.length = 0;
    const setDash = (value) => page.evaluate(`(() => {
      const input = document.querySelector(".shape-dash");
      input.value = ${JSON.stringify(value)};
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await setDash("4, 0");
    await page.waitFor(`document.querySelector(".dash-note") !== null`, "the zero-entry refusal");
    assert.equal(fixture.writes.length, 0);
    // More than the engine's eight entries is refused too.
    await setDash("1, 2, 3, 4, 5, 6, 7, 8, 9");
    await page.waitFor(
      `document.querySelector(".dash-note")?.textContent.includes("8")`,
      "the entry-count refusal",
    );
    assert.equal(fixture.writes.length, 0);

    // A valid pattern is one update carrying the whole stroke.
    await setDash("4, 8");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update",
      id: "layer_made_3",
      stroke: { color: "#111111", width: 2, dashArray: [4, 8] },
    });

    // Both marker ends, one update each.
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const select = document.querySelector(".shape-marker-start");
      select.value = "arrow";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "update",
      id: "layer_made_3",
      markerStart: "arrow",
    });
    await page.evaluate(`(() => {
      const select = document.querySelector(".shape-marker-end");
      select.value = "circle";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[1].body.operation, {
      op: "update",
      id: "layer_made_3",
      markerEnd: "circle",
    });
    assert.deepEqual(fixture.layers().find((one) => one.id === "layer_made_3").shape, {
      kind: "line",
      markerStart: "arrow",
      markerEnd: "circle",
    });
  });

  await t.test("rename asks for a name, refuses a taken one, and the picker reloads under the new id", async () => {
    fixture.reset();
    await openProject(page);
    await waitForSaved(page);

    // A name that is taken is refused in the engine's words; the project
    // keeps its id.
    await openDocumentSettings(page);
    await page.click("#rename-project");
    await page.waitFor(`document.querySelector("#name-dialog").open`, "the rename dialog");
    await page.evaluate(`(() => {
      document.querySelector("#name-dialog-input").value = "second";
      document.querySelector("#name-dialog-confirm").click();
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").dataset.kind === "error"`,
      "the taken-name refusal",
    );
    assert.match(
      await page.evaluate(`document.querySelector("#status").textContent`),
      /A project with this name exists\./,
    );

    // A free name: the id is the directory name, so the picker reloads and
    // the project reopens under the new id.
    await openDocumentSettings(page);
    await page.click("#rename-project");
    await page.waitFor(`document.querySelector("#name-dialog").open`, "the rename dialog again");
    await page.evaluate(`(() => {
      const input = document.querySelector("#name-dialog-input");
      input.value = "Renamed project";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `[...document.querySelector("#projects").options].some((one) => one.value === "Renamed project")`,
      "the picker to list the renamed project",
    );
    await page.waitFor(
      `document.querySelector("#projects").value === "Renamed project" && !document.querySelector("#canvas").hidden`,
      "the project to reopen under the new id",
    );
    assert.ok(
      fixture.projectCalls().some((call) => call.kind === "rename" && call.name === "Renamed project"),
    );
  });

  await t.test("delete names the project, refuses a locked one, and closes before the files go", async () => {
    fixture.reset();
    fixture.useSecondProject(true);
    await page.evaluate(`location.reload()`);
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`, "editor reload");
    await openProject(page);
    await waitForSaved(page);

    // The confirmation names the project and says the files are gone; a
    // dismissal sends nothing.
    await page.evaluate(`(() => {
      window.__deleteQuestion = null;
      window.confirm = (message) => { window.__deleteQuestion = message; return false; };
      return true;
    })()`);
    await openDocumentSettings(page);
    await page.click("#delete-project");
    const question = await page.evaluate(`window.__deleteQuestion`);
    assert.match(question, /UI test project/);
    assert.match(question, /project folder/);
    assert.match(question, /cannot undo/i);
    assert.equal(fixture.projectCalls().filter((call) => call.kind === "delete").length, 0);
    assert.equal(await page.evaluate(`document.querySelector("#canvas").hidden`), false);

    // A project another process holds is refused with projectLocked, and
    // stays open here.
    fixture.armProjectLock();
    await page.evaluate(`(() => { window.confirm = () => true; return true; })()`);
    await openDocumentSettings(page);
    await page.click("#delete-project");
    await page.waitFor(
      `document.querySelector("#status").dataset.kind === "error"`,
      "the locked-project refusal",
    );
    assert.match(
      await page.evaluate(`document.querySelector("#status").textContent`),
      /Another process has this project open\./,
    );
    assert.equal(await page.evaluate(`document.querySelector("#canvas").hidden`), false);

    // The delete goes through: the project closes, then the picker reloads
    // without it.
    await openDocumentSettings(page);
    await page.click("#delete-project");
    await page.waitFor(`document.querySelector("#canvas").hidden`, "the project to close");
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("Deleted project UI test project")`,
      "the deletion to be reported",
    );
    await page.waitFor(
      `![...document.querySelector("#projects").options].some((one) => one.value === "demo")`,
      "the deleted project to leave the picker",
    );
    assert.equal(await page.evaluate(`document.querySelector("#canvas-empty").hidden`), false);
    assert.ok(fixture.projectCalls().some((call) => call.kind === "delete" && call.project === "demo"));
    fixture.useSecondProject(false);
  });

});
