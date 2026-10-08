import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
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
const JOURNEY_MS = 240000; // the whole browser journey, as a last resort

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
    for (const key of ["width", "height", "background", "backgroundImage"]) {
      if (Object.hasOwn(operation, key)) document.canvas[key] = operation[key];
    }
    if (operation.clearBackgroundImage) delete document.canvas.backgroundImage;
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
  let templateMode = false;
  const variantCalls = [];
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
  let acceptSession = false;
  const sessionCalls = [];
  const sessionRequests = [];
  const sessionCookieReads = [];
  // Documents as they were before each write, so one undo restores one write.
  const undoStack = [];
  // A typed engine refusal for the next write, in the engine's own words.
  let failWrite = null;
  const fontFamilies = () => [...new Set(fontFaces.map((face) => face.family))].sort();
  const writes = [];
  const reads = [];
  const previewRequests = [];
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
      sessionCookieReads.push(request.headers.cookie ?? null);
      return send(200, { name: "assemblash", version: "ui-test", schemaVersion: 1, canShutdown: false });
    }
    if (request.method === "POST" && url.pathname === "/api/browser-session") {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        sessionCalls.push(request.headers.authorization ?? null);
        sessionRequests.push({ authorization: request.headers.authorization ?? null, path: url.pathname + url.search, body });
        if (acceptSession) {
          response.writeHead(204, { "set-cookie": "assemblash-session=fixture; HttpOnly; SameSite=Strict; Path=/" });
          response.end();
        } else {
          send(401, { error: { code: "unauthorized", message: "token was not accepted" } });
        }
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/projects") {
      return send(200, { projects: [
        ...(demoDeleted ? [] : [{ id: demoId, name: demoName, documentId: document.id, version: document.version, layers: document.layers.length }]),
        ...(secondProject ? [{ id: "second", name: "Second project", documentId: "doc_second", version: 1, layers: 0 }] : []),
        ...otherProjects,
      ] });
    }
    if (request.method === "POST" && url.pathname === "/api/projects") {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw);
        projectCalls.push({ kind: "create", ...body });
        demoId = body.id;
        demoName = body.name;
        demoDeleted = false;
        document = freshDocument();
        document.name = demoName;
        document.canvas = { ...document.canvas, width: body.width, height: body.height, background: body.background };
        document.layers = [];
        send(201, { id: demoId, name: demoName, documentId: document.id, version: document.version, layers: 0 });
      });
      return;
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
      return send(200, { projects: [
        ...(demoDeleted ? [] : [{ id: demoId, name: demoName, documentId: document.id, version: document.version, layers: document.layers.length }]),
        ...(secondProject ? [{ id: "second", name: "Second project", documentId: "doc_second", version: 1, layers: 0 }] : []),
        ...otherProjects,
      ] });
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
      return send(200, { isTemplate: templateMode, slots: templateMode ? document.slots : [] });
    }
    if (request.method === "POST" && isDemo && segments[3] === "variants") {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw);
        variantCalls.push(body);
        send(200, { template: demoId, templateVersion: document.version, variants: body.variants.map((variant) => ({
          name: variant.name, path: `${variant.name}.png`, bytes: png.length,
          width: document.canvas.width, height: document.canvas.height, hash: "sha256:fixture",
        })) });
      });
      return;
    }
    if (request.method === "GET" && isDemo && segments[3] === "exports") {
      response.writeHead(200, { "content-type": "image/png" });
      return response.end(png);
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
      previewRequests.push({ project: segments[2] ?? null, version: url.searchParams.get("v"), scale: Number(url.searchParams.get("scale")) });
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

    const requested = url.pathname === "/" ? "index.html"
      : url.pathname === "/login" ? "login.html"
        : decodeURIComponent(url.pathname.slice(1));
    const root = resolve(dist);
    const file = resolve(root, requested);
    const relativeFile = relative(root, file);
    if (!relativeFile || relativeFile.startsWith("..") || isAbsolute(relativeFile)
      || !existsSync(file) || !statSync(file).isFile()) {
      return send(404, { error: { code: "notFound", message: url.pathname } });
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".woff2": "font/woff2",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".txt": "text/plain; charset=utf-8",
      ".png": "image/png",
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
    previewRequests: () => structuredClone(previewRequests),
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
    useTemplate(enabled) { templateMode = enabled; },
    variantCalls: () => structuredClone(variantCalls),
    setUpdate(consent, latest) {
      updateConsent = consent;
      updateLatest = latest;
    },
    consentCalls: () => structuredClone(consentCalls),
    sessionCalls: () => [...sessionCalls],
    sessionRequests: () => structuredClone(sessionRequests),
    sessionCookieReads: () => [...sessionCookieReads],
    setSessionAccepted(value) { acceptSession = value; },
    // The document as the engine holds it, for reading values back.
    documentJson: () => JSON.stringify(document),
    useGroupedLayers() {
      const group = (id, children, locked = false) => ({
        id, name: id, type: "group", children, opacity: 1, visible: true,
        locked, protected: false, readOnly: false, effects: [],
        transform: { x: 0, y: 0, width: 1000, height: 700, rotation: 0 },
      });
      document.layers = [structuredClone(protectedText), group("group_outer", [
        structuredClone(editableText),
        group("group_locked", [{ ...structuredClone(editableText), id: "layer_nested_guarded", name: "Nested guarded" }], true),
      ])];
    },
    version: () => document.version,
    createAsAgent(id) {
      otherProjects.push({ id, name: id, documentId: `doc_${id}`, version: 0, layers: 0 });
    },
    emptyRecentProjects() {
      demoDeleted = true;
      secondProject = false;
      otherProjects = [];
    },
    reset() {
      document = freshDocument();
      fontFaces = defaultFontFaces();
      failInstall = null;
      pendingReclaimedLock = null;
      otherProjects = [];
      refuseWriteNumber = 0;
      failPreviews = 0;
      templateMode = false;
      variantCalls.length = 0;
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
      acceptSession = false;
      consentCalls.length = 0;
      sessionCalls.length = 0;
      sessionRequests.length = 0;
      sessionCookieReads.length = 0;
      undoStack.length = 0;
      projectCalls.length = 0;
      undos.length = 0;
      writes.length = 0;
      reads.length = 0;
      previewRequests.length = 0;
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
    return this.evaluate(`(() => {
      const target = document.activeElement instanceof Element ? document.activeElement : document.body;
      target.dispatchEvent(new KeyboardEvent("keydown", ${JSON.stringify({ key, code: options.code ?? key, bubbles: true, ...options })}));
      return true;
    })()`);
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
  await chooseProject(page, "demo");
  await page.waitFor(`!document.querySelector("#canvas").hidden && document.querySelector("#status")?.textContent?.includes("Opened")`, "project open");
}

async function chooseProject(page, projectId) {
  await page.evaluate(`document.querySelector("#project-picker-toggle").click()`);
  await page.waitFor(
    `[...document.querySelectorAll("#project-options [data-project-id]")].some((one) => one.dataset.projectId === ${JSON.stringify(projectId)})`,
    `project ${projectId} to appear in the picker`,
  );
  await page.click(`#project-options [data-project-id="${projectId}"]`);
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
  if (!await page.evaluate(`document.querySelector("#settings-document").hasAttribute("data-active")`)) {
    await page.click("#settings-document .mantine-Accordion-control");
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

async function setViewport(page, width, height, deviceScaleFactor = 1) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile: false,
  });
  await page.waitFor(
    `window.innerWidth === ${width} && window.innerHeight === ${height} && window.devicePixelRatio === ${deviceScaleFactor}`,
    `${width}x${height} viewport at DPR ${deviceScaleFactor}`,
  );
  await page.waitFor(
    `Array.from(document.querySelectorAll(".workspace, .toolrail, #add-panel, .editor, #stage-viewport, #structure-panel, .zoom-controls"))
      .flatMap((node) => node.getAnimations())
      .every((animation) => animation.playState !== "running")`,
    `layout animations at ${width}x${height} to finish`,
  );
  await page.evaluate(
    `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
  );
}

async function setLayoutLanguage(page, language) {
  await page.evaluate(`(() => {
    const select = document.querySelector("#setting-language");
    select.value = ${JSON.stringify(language)};
    select.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
  await page.waitFor(`document.documentElement.lang === ${JSON.stringify(language)}`, `${language} layout strings`);
  await page.evaluate(
    `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
  );
}

async function waitForSettingsClose(page) {
  await page.waitFor(`(() => {
    const dialog = document.querySelector("#settings-dialog");
    if (!dialog || dialog.open || dialog.dataset.state !== "closed") return false;
    const parts = document.querySelectorAll(".mantine-Modal-overlay, .mantine-Modal-content");
    const running = [...parts].some((node) => node.getAnimations()
      .some((animation) => animation.playState === "running"));
    return !running;
  })()`, "Settings close animation", 10000);
  await page.waitFor(`(() => {
    const modal = document.querySelector("#settings-dialog");
    const content = modal?.querySelector(".mantine-Modal-content");
    return !content || !content.checkVisibility({ visibilityProperty: true });
  })()`, "Settings overlay to leave the pointer surface", 10000);
  await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function closeFirstRunAgentsDialog(page, expectFirstRunOffer) {
  if (expectFirstRunOffer) {
    await page.waitFor(`document.querySelector("#agents-dialog")?.dataset.state === "open"`,
      "the first-run Agents onboarding dialog", 10000);
  } else {
    await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  }
  if (!await page.evaluate(`document.querySelector("#agents-dialog")?.dataset.state === "open"`)) return;
  await page.waitFor(`(() => {
    const dialog = document.querySelector("#agents-dialog");
    const content = dialog?.querySelector(".mantine-Modal-content");
    const button = dialog?.querySelector(".mantine-Modal-close");
    return dialog?.dataset.state === "open" && content?.checkVisibility({ visibilityProperty: true })
      && getComputedStyle(content).opacity === "1" && button?.getClientRects().length > 0
      && content.getAnimations({ subtree: true }).every((animation) => animation.playState !== "running");
  })()`, "the first-run Agents dialog and close button to settle", 10000);
  // Mantine can schedule its entrance animation after the content first mounts.
  const target = await waitFor(() => page.evaluate(`(async () => {
    const content = document.querySelector("#agents-dialog .mantine-Modal-content");
    const button = document.querySelector("#agents-dialog .mantine-Modal-close");
    let bounds = button?.getBoundingClientRect();
    if (!content || !button || !bounds) return false;
    for (let frame = 0; frame < 2; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const current = button.getBoundingClientRect();
      if (["left", "top", "width", "height"].some((key) => Math.abs(current[key] - bounds[key]) > 0.5)) return false;
      bounds = current;
    }
    if (getComputedStyle(content).opacity !== "1"
      || content.getAnimations({ subtree: true }).some((animation) => animation.playState === "running")) return false;
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, width: bounds.width, height: bounds.height, hit: Boolean(hit && button.contains(hit)),
      dialogOpen: document.querySelector("#agents-dialog")?.dataset.state === "open" };
  })()`), "the first-run Agents close button geometry to stay stable", 10000);
  assert.ok(target?.dialogOpen && target.width > 0 && target.height > 0 && target.hit,
    `the first-run Agents close button is not pointer-reachable: ${JSON.stringify(target)}`);
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: target.x, y: target.y });
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed", x: target.x, y: target.y, button: "left", buttons: 1, clickCount: 1,
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased", x: target.x, y: target.y, button: "left", buttons: 0, clickCount: 1,
  });
  await page.waitFor(`document.querySelector("#agents-dialog")?.dataset.state === "closed"`,
    "the first-run Agents dialog to close", 10000);
  await page.waitFor(`([...document.querySelectorAll(".mantine-Modal-content")]
    .filter((node) => node.closest("#agents-dialog"))
    .every((node) => node.getAnimations({ subtree: true }).every((animation) => animation.playState !== "running")))`,
  "the first-run Agents close animation", 10000);
  await page.waitFor(`(() => {
    const content = document.querySelector("#agents-dialog .mantine-Modal-content");
    return !content || !content.checkVisibility({ visibilityProperty: true });
  })()`, "the first-run Agents overlay to leave the pointer surface", 10000);
}

async function clickAppearanceOption(page, value) {
  await page.evaluate(`(() => {
    const value = ${JSON.stringify(value)};
    const radio = [...document.querySelectorAll('#setting-appearance input[type="radio"]')]
      .find((input) => input.value === value);
    const label = radio?.id ? document.querySelector('label[for="' + radio.id + '"]') : null;
    label?.scrollIntoView({ block: "center", behavior: "instant" });
  })()`);
  await waitForAppearanceSection(page);
  const target = await page.evaluate(`(() => {
    const value = ${JSON.stringify(value)};
    const radio = [...document.querySelectorAll('#setting-appearance input[type="radio"]')]
      .find((input) => input.value === value);
    const label = radio?.id ? document.querySelector('label[for="' + radio.id + '"]') : null;
    if (!radio || !label) return null;
    const bounds = label.getBoundingClientRect();
    const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    const box = (node) => {
      const rect = node?.getBoundingClientRect();
      return rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null;
    };
    const ancestors = [];
    for (let node = hit; node && ancestors.length < 8; node = node.parentElement) {
      ancestors.push({ tag: node.tagName, id: node.id, className: node.className?.toString(), box: box(node),
        html: node.outerHTML.slice(0, 180) });
    }
    const modal = document.querySelector("#settings-dialog");
    return { id: radio.id, value: radio.value, checked: radio.checked, labelHit: Boolean(hit && label.contains(hit)),
      hit: hit ? { tag: hit.tagName, id: hit.id, className: hit.className?.toString(), role: hit.getAttribute("role"),
        html: hit.outerHTML.slice(0, 240) } : null, ancestors,
      labelHtml: label.outerHTML.slice(0, 400),
      labelBox: box(label), radioBox: box(radio), modalOpen: modal?.open, modalBox: box(modal),
      viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY, dpr: devicePixelRatio },
      x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2,
      width: bounds.width, height: bounds.height };
  })()`);
  if (target && !target.labelHit) {
    const evidence = join(here, "..", ".ai", "scratch", "layout-final-tests");
    mkdirSync(evidence, { recursive: true });
    const screenshot = await page.send("Page.captureScreenshot", { format: "png", fromSurface: true });
    writeFileSync(join(evidence, `appearance-hit-${value}.png`), Buffer.from(screenshot.data, "base64"));
  }
  assert.ok(target && target.width > 0 && target.height > 0 && target.labelHit,
    `the ${value} appearance radio label is not pointer-reachable: ${JSON.stringify(target)}`);
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: target.x, y: target.y });
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed", x: target.x, y: target.y, button: "left", buttons: 1, clickCount: 1,
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased", x: target.x, y: target.y, button: "left", buttons: 0, clickCount: 1,
  });
  await page.waitFor(
    `document.querySelector('#setting-appearance input[type="radio"]:checked')?.value === ${JSON.stringify(value)}`,
    `the ${value} appearance radio to become selected`,
  );
}

async function waitForAppearanceSection(page) {
  await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  await page.waitFor(
    `(() => {
      const parts = [...document.querySelectorAll(".mantine-Modal-overlay, .mantine-Modal-content, #settings-application")];
      return parts.length > 0 && parts.every((node) => node.getAnimations({ subtree: true })
        .every((animation) => animation.playState !== "running"));
    })()`,
    "Appearance settings section transition",
    10000,
  );
  await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function setLayoutAppearance(page, appearance) {
  await page.click("#settings");
  await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to open for layout");
  if (!await page.evaluate(`document.querySelector("#settings-application").hasAttribute("data-active")`)) {
    await page.click("#settings-application .mantine-Accordion-control");
  }
  await page.waitFor(
    `document.querySelector("#settings-application").hasAttribute("data-active")`,
    "application settings to open for layout",
  );
  await waitForAppearanceSection(page);
  await clickAppearanceOption(page, appearance);
  const scheme = appearance === "system"
    ? `(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`
    : JSON.stringify(appearance);
  await page.waitFor(
    `document.documentElement.getAttribute("data-mantine-color-scheme") === ${scheme}
      && document.querySelector('#setting-appearance input[type="radio"]:checked')?.value === ${JSON.stringify(appearance)}`,
    `${appearance} layout appearance`,
  );
  await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  await waitForSettingsClose(page);
}

async function layoutGeometry(page) {
  return page.evaluate(`(() => {
    const rect = (node) => {
      if (!node) return null;
      const bounds = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const round = (value) => Math.round(value * 100) / 100;
      return {
        left: round(bounds.left), top: round(bounds.top), right: round(bounds.right), bottom: round(bounds.bottom),
        width: round(bounds.width), height: round(bounds.height), display: style.display, visibility: style.visibility,
        overflowX: style.overflowX, overflowY: style.overflowY, clientWidth: node.clientWidth, clientHeight: node.clientHeight,
        scrollWidth: node.scrollWidth, scrollHeight: node.scrollHeight,
      };
    };
    const shown = (node) => Boolean(node && node.getClientRects().length && getComputedStyle(node).visibility !== "hidden");
    const box = (selector) => rect(document.querySelector(selector));
    const shownButtons = (selector) => [...document.querySelectorAll(selector)].filter(shown).map((node) => ({
      id: node.id,
      label: node.getAttribute("aria-label") || node.title || node.textContent.trim(),
      rect: rect(node),
    }));
    const activeTab = document.querySelector('#structure-panel [role="tab"][aria-selected="true"]');
    const activePanel = [...document.querySelectorAll('#structure-panel [role="tabpanel"]')].find(shown);
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      language: document.documentElement.lang,
      scheme: document.documentElement.getAttribute("data-mantine-color-scheme"),
      topbar: box(".topbar"),
      topbarControls: [...document.querySelectorAll(".topbar a, .topbar button, .topbar input, .topbar [role=combobox]")]
        .filter(shown).map((node) => ({
          id: node.id,
          label: node.getAttribute("aria-label") || node.title || node.textContent.trim(),
          rect: rect(node),
        })),
      workspace: box(".workspace"), toolrail: box(".toolrail"), add: box("#add-panel"), editor: box(".editor"),
      contextualToolbar: box("#inspector"), stageViewport: box("#stage-viewport"), stage: box("#stage"), canvas: box("#canvas"),
      projectOpen: Boolean(document.querySelector("#canvas") && shown(document.querySelector("#canvas"))),
      structure: box("#structure-panel"), tablist: box('#structure-panel [role="tablist"]'), activeTab: activeTab?.id ?? null,
      structureMobileOpen: document.querySelector("#structure-panel")?.classList.contains("mobile-open") ?? false,
      activePanel: rect(activePanel),
      recents: box("#recents"), emptyHome: box("#canvas-empty"), zoomControls: box(".zoom-controls"),
      zoomControlsVisible: shown(document.querySelector(".zoom-controls")),
      consentBar: box("#consent-bar"),
      projectOptions: box("#project-options"),
      projectOptionsHidden: document.querySelector("#project-options")?.hidden ?? true,
      projectOptionsItems: [...document.querySelectorAll("#project-options [role=option]")].filter(shown).map((node) => ({
        label: node.querySelector("strong")?.textContent.trim() ?? "",
        name: rect(node.querySelector("strong")),
        count: rect(node.querySelector(".project-option-count")),
        rect: rect(node),
      })),
      toolButtons: [...document.querySelectorAll(".toolrail button")].filter(shown).map((node) => {
        const caption = node.querySelector("span[data-i18n]");
        const inner = node.querySelector(".mantine-Button-inner");
        const labelBox = node.querySelector(".mantine-Button-label");
        return {
          label: node.getAttribute("aria-label") || node.title || node.textContent.trim(),
          rect: rect(node),
          captionText: caption?.textContent.trim() ?? "",
          caption: rect(caption),
          inner: rect(inner),
          labelBox: rect(labelBox),
        };
      }),
      addButtons: shownButtons("#add-panel button"),
      zoomButtons: shownButtons(".zoom-controls button"),
      tabs: shownButtons('#structure-panel [role="tab"]'),
      panelControls: shownButtons('#structure-panel [role="tabpanel"] button, #structure-panel [role="tabpanel"] input, #structure-panel [role="tabpanel"] select, #structure-panel [role="tabpanel"] [role="combobox"]'),
      activePanelOverflowY: activePanel ? getComputedStyle(activePanel).overflowY : null,
      activePanelScrollHeight: activePanel?.scrollHeight ?? 0,
      activePanelClientHeight: activePanel?.clientHeight ?? 0,
      recentButtons: shownButtons("#recents button"),
      recentsHidden: document.querySelector("#recents")?.hidden ?? true,
      recentCards: [...document.querySelectorAll("#recents .recent-card")].filter(shown).map(rect),
      uploadDropzone: box("#add-upload-section .upload-dropzone"),
      uploadTextWrap: getComputedStyle(document.querySelector("#add-upload-section .upload-dropzone") ?? document.body).whiteSpace,
      toolbarControls: shownButtons("#inspector button, #inspector input, #inspector select, #inspector [role=combobox]"),
      toolbarPaintEditors: [...document.querySelectorAll("#inspector [data-paint-editor]")].filter(shown).map(rect),
      paintTriggers: shownButtons("#inspector [data-paint-trigger], #inspector [id$='-color-trigger']"),
      canvasSettings: box("#properties-panel #canvas-settings"),
      canvasApply: box("#properties-panel #canvas-apply"),
      settingsDialog: box("#settings-dialog"),
      status: box("#statusbar"),
    };
  })()`);
}

function rectanglesOverlap(left, right, tolerance = 1) {
  return Boolean(left && right
    && left.right > right.left + tolerance
    && right.right > left.left + tolerance
    && left.bottom > right.top + tolerance
    && right.bottom > left.top + tolerance);
}

function isInside(inner, outer, tolerance = 1) {
  return Boolean(inner && outer
    && inner.left >= outer.left - tolerance
    && inner.top >= outer.top - tolerance
    && inner.right <= outer.right + tolerance
    && inner.bottom <= outer.bottom + tolerance);
}

async function writeLayoutEvidence(page, directory, name, geometry) {
  if (!directory) return;
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `${name}.json`), `${JSON.stringify(geometry, null, 2)}\n`);
  const screenshot = await page.send("Page.captureScreenshot", { format: "png", fromSurface: true });
  writeFileSync(join(directory, `${name}.png`), Buffer.from(screenshot.data, "base64"));
}

// The bounds inside the journey are the ones that name what went wrong; this
// one is the backstop for anything they do not cover, so it is deliberately
// much larger than an individual wait.
const LAYOUT_ONLY = process.env.ASSEMBLASH_LAYOUT_ONLY === "1";
test("editor interaction journeys use the real compiled interface", { timeout: JOURNEY_MS, only: LAYOUT_ONLY }, async (t) => {
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
  if (LAYOUT_ONLY) {
    await t.test("responsive layout keeps recents, panels, toolbar, and canvas reachable", { only: true }, runResponsiveLayoutJourney);
    return;
  }

  await t.test("the Mantine structure panel owns one copy of each controller hook", async () => {
    const duplicateIds = await page.evaluate(`(() => {
      const ids = ["structure-panel", "properties-tab", "layers-tab", "history-tab", "properties-panel",
        "advanced-inspector", "layers-view", "history-view", "layers", "history", "layer-search",
        "group-layers", "delete-layer"];
      return ids.filter((id) => document.querySelectorAll("#" + CSS.escape(id)).length !== 1);
    })()`);
    assert.deepEqual(duplicateIds, []);
  });

  await t.test("the Mantine tree keeps hierarchy, keyboard commands, filtering, and guarded drag states", async (treeTest) => {
    treeTest.after(async () => {
      fixture.reset();
      await page.send("Page.navigate", { url: fixture.url });
      await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`, "empty workspace reset");
    });
    fixture.reset();
    fixture.useGroupedLayers();
    await openProject(page);
    await page.click("#layers-tab");
    await page.waitFor(`document.querySelector('#layers[data-tree-root] [role="group"]') !== null`, "Mantine nested layer hierarchy");
    assert.deepEqual(await page.evaluate(`[...document.querySelectorAll("#layers .layer")].map((row) => ({
      id: row.dataset.id, parent: row.dataset.parent, draggable: row.draggable,
      treeItem: row.parentElement.getAttribute("role"), level: Number(row.parentElement.dataset.level),
    }))`), [
      { id: "group_outer", parent: "", draggable: true, treeItem: "treeitem", level: 1 },
      { id: "group_locked", parent: "group_outer", draggable: false, treeItem: "treeitem", level: 2 },
      { id: "layer_nested_guarded", parent: "group_locked", draggable: false, treeItem: "treeitem", level: 3 },
      { id: "layer_text", parent: "group_outer", draggable: true, treeItem: "treeitem", level: 2 },
      { id: "layer_protected", parent: "", draggable: false, treeItem: "treeitem", level: 1 },
    ]);
    assert.equal(await page.evaluate(`document.querySelector('.layer[data-id="group_locked"] [aria-label="Unlock layer"]').disabled`), false, "a group's own lock can be removed");
    await page.click('.layer[data-id="group_locked"]');
    await page.click("#properties-tab");
    await page.waitFor(`document.querySelector("#layer-locked") !== null`, "locked group Properties");
    assert.equal(await page.evaluate(`document.querySelector("#layer-locked").disabled`), false, "Properties permits an own lock to be removed");
    await page.click("#layers-tab");
    await page.waitFor(`document.querySelector("#layers-view").getClientRects().length > 0`, "Layers is visible for navigation");
    const key = async (name, code = name, virtualKey = 0) => {
      await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: name, code, windowsVirtualKeyCode: virtualKey });
      await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: name, code, windowsVirtualKeyCode: virtualKey });
    };
    await page.evaluate(`document.querySelector('#layers [role="treeitem"][data-value="group_outer"]').focus()`);
    await key("ArrowDown", "ArrowDown", 40);
    assert.equal(await page.evaluate(`document.activeElement.dataset.value`), "group_locked");
    await key("ArrowLeft", "ArrowLeft", 37);
    await page.waitFor(`document.querySelector('.layer[data-id="layer_nested_guarded"]') === null`, "collapsed guarded group");
    await key("ArrowRight", "ArrowRight", 39);
    await page.waitFor(`document.querySelector('.layer[data-id="layer_nested_guarded"]') !== null`, "expanded guarded group");
    await page.click('[data-layer-toggle="group_locked"]');
    await page.waitFor(`document.querySelector('.layer[data-id="layer_nested_guarded"]') === null`, "pointer group collapse");
    await page.click('[data-layer-toggle="group_locked"]');
    await page.waitFor(`document.querySelector('.layer[data-id="layer_nested_guarded"]') !== null`, "pointer group expansion");
    await page.evaluate(`document.querySelector('#layers [role="treeitem"][data-value="group_locked"]').focus()`);
    await key("ArrowRight", "ArrowRight", 39);
    assert.equal(await page.evaluate(`document.activeElement.dataset.value`), "layer_nested_guarded");
    await key(" ", "Space", 32);
    await page.waitFor(`document.querySelector('.layer[data-id="layer_nested_guarded"]').classList.contains("selected")`, "keyboard layer selection");
    assert.equal(await page.evaluate(`document.querySelector('#layers [role="treeitem"][data-value="layer_nested_guarded"]').getAttribute("aria-selected")`), "true");
    await page.waitFor(`document.querySelector("#properties-panel").getClientRects().length > 0`, "text selection opens Properties");
    assert.equal(await page.evaluate(`document.querySelector('[data-paint-trigger="text-color"]').disabled`), true, "Properties inherits the group lock");
    assert.equal(await page.evaluate(`document.querySelector("#layer-locked").disabled`), true, "a child's lock control inherits its group guard");
    assert.equal(await page.evaluate(`document.querySelectorAll(".resize-handle").length`), 0, "locked descendants have no canvas resize grips");
    await page.evaluate(`document.querySelector("#canvas").focus()`);
    for (const [name, code, virtualKey] of [["F2", "F2", 113], ["Enter", "Enter", 13], ["ArrowRight", "ArrowRight", 39], ["Delete", "Delete", 46]]) {
      await key(name, code, virtualKey);
    }
    assert.equal(await page.evaluate(`document.querySelector(".inline-text-editor") === null`), true, "canvas keyboard refuses inherited editing guards");
    assert.equal(fixture.writes.length, 0, "canvas keyboard sends no operation for guarded descendants");
    await page.click("#layers-tab");
    await page.waitFor(`document.querySelector("#layers-view").getClientRects().length > 0`, "Layers is visible after selection");
    await page.evaluate(`document.querySelector('#layers [role="treeitem"][data-value="layer_nested_guarded"]').focus()`);
    await key("F2", "F2", 113);
    assert.equal(await page.evaluate(`document.querySelector(".layer-rename") === null`), true, "inherited lock refuses rename");
    assert.equal(await page.evaluate(`document.querySelector(".inline-text-editor") === null`), true, "refused Tree rename does not reach the canvas text shortcut");
    await key("ArrowDown", "ArrowDown", 40);
    assert.equal(await page.evaluate(`document.activeElement.dataset.value`), "layer_text");
    await key("Enter", "Enter", 13);
    await page.waitFor(`document.querySelector('.layer[data-id="layer_text"]').classList.contains("selected")`, "Enter selects an editable layer");
    await page.click("#layers-tab");
    await page.waitFor(`document.querySelector("#layers-view").getClientRects().length > 0`, "Layers is visible for rename");
    await page.evaluate(`document.querySelector('#layers [role="treeitem"][data-value="layer_text"]').focus()`);
    await key("F2", "F2", 113);
    await page.waitFor(`document.querySelector(".layer-rename") !== null`, "F2 opens the layer name control");
    await key("Escape", "Escape", 27);
    await page.waitFor(`document.querySelector(".layer-rename") === null`, "Escape cancels keyboard rename");
    await page.evaluate(`document.querySelector('.layer[data-id="layer_text"]').dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: true }))`);
    await page.waitFor(`document.querySelector(".layer-rename") !== null`, "the existing row rename command hook");
    await key("Escape", "Escape", 27);
    await page.waitFor(`document.querySelector(".layer-rename") === null`, "Escape cancels the row rename command");
    assert.equal(fixture.writes.length, 0, "tree navigation and cancelled rename send no document operations");

    await page.evaluate(`(() => {
      const input = document.querySelector("#layer-search");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "Nested guarded");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
    await page.waitFor(`document.querySelectorAll("#layers .layer").length === 3`, "filtered layer ancestors");
    assert.deepEqual(await page.evaluate(`[...document.querySelectorAll("#layers .layer")].map((row) => row.dataset.id)`),
      ["group_outer", "group_locked", "layer_nested_guarded"]);
    await page.evaluate(`(() => {
      const input = document.querySelector("#layer-search");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
    await page.waitFor(`document.querySelectorAll("#layers .layer").length === 5`, "unfiltered layer hierarchy");
    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.setData("text/plain", "layer_text");
      document.querySelector('.layer[data-id="group_outer"]').dispatchEvent(new DragEvent("drop", { dataTransfer: transfer, bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "reorder", id: "layer_text", to: { at: "in", parent: "group_outer" } },
    ]);
  });

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
    assert.deepEqual(await page.evaluate(`[
      document.querySelector("#new-project").getAttribute("aria-label"),
      document.querySelector("#undo").getAttribute("aria-label"),
      document.querySelector("#redo").getAttribute("aria-label"),
      document.querySelector("#settings").getAttribute("aria-label"),
      document.querySelector("#add-panel-close").getAttribute("aria-label")
    ]`), ["Nouveau projet", "Annuler", "Rétablir", "Paramètres", "Réduire le panneau Ajouter"]);
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
      legacyPickerAbsent: document.querySelector("#projects") === null
    })`), {
      title: "Text",
      textSection: true,
      shownSections: 1,
      projectList: "project-options",
      legacyPickerAbsent: true,
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
    assert.equal(await page.evaluate(`Array.from(document.querySelectorAll("#inspector .toolbar-action")).every((button) => {
      const icon = button.querySelector("i.ph");
      return button.getAttribute("aria-label")?.trim() && icon && getComputedStyle(icon).display !== "none";
    })`), true, "context toolbar actions keep visible icons and accessible labels");

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
      [...document.querySelectorAll("#advanced-inspector .dock-section")].some((section) =>
        section.querySelector(".dock-section-control")?.textContent?.includes(name)))`), true);
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

  await t.test("file input and Mantine drop each upload and create once at the asset dimensions", async () => {
    fixture.writes.length = 0;
    const assetCount = JSON.parse(fixture.documentJson()).assets.length;
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
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fixture.writes.length, 1, "file selection creates one layer");
    assert.equal(JSON.parse(fixture.documentJson()).assets.length, assetCount + 1, "file selection imports one asset");

    fixture.reset();
    await openProject(page);
    await page.click("#add-image");
    const dropDirectory = mkdtempSync(join(tmpdir(), "assemblash-ui-drop-"));
    const imagePath = join(dropDirectory, "dropped.png");
    const refusedPath = join(dropDirectory, "refused.txt");
    writeFileSync(imagePath, png);
    writeFileSync(refusedPath, "not an image");
    try {
      await page.evaluate(`document.querySelector("#upload-dropzone").scrollIntoView({ block: "center" })`);
      const point = await page.evaluate(`(() => { const r = document.querySelector("#upload-dropzone").getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      const drop = async (file) => {
        for (const type of ["dragEnter", "dragOver", "drop"]) {
          await page.send("Input.dispatchDragEvent", { type, ...point, data: { items: [], files: [file], dragOperationsMask: 1 } });
        }
      };
      await drop(imagePath);
      await waitForWrites(fixture);
      await waitForSaved(page);
      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.equal(fixture.writes.length, 1, "a real browser file drop creates one layer");
      assert.equal(JSON.parse(fixture.documentJson()).assets.length, 1, "a real browser file drop imports one asset");
      assert.deepEqual(fixture.writes[0].body.operation, {
        op: "create", position: { at: "root" }, transform: { x: 100, y: 150, width: 800, height: 400 },
        type: "image", asset: "asset_fixture", fit: "contain",
      });
      await drop(refusedPath);
      await page.waitFor(`document.querySelector("#upload-feedback").textContent.includes("refused.txt")`, "unsupported drop feedback");
      assert.equal(fixture.writes.length, 1, "a refused file drop sends no create operation");
      assert.equal(JSON.parse(fixture.documentJson()).assets.length, 1, "a refused file drop imports no asset");
    } finally {
      rmSync(dropDirectory, { recursive: true, force: true });
    }
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
    await page.waitFor(`document.querySelector('#export-dialog[data-state="open"]') !== null`, "export dialog");
    await page.waitFor(`document.querySelector('#export-formats [data-format="svg"]') !== null`, "export formats");
    await page.click('#export-formats [data-format="svg"]');
    assert.deepEqual(await page.evaluate(`({
      checked: document.querySelector('#export-formats [data-format="svg"]').getAttribute("aria-checked"),
      rowOff: document.querySelector("#export-options").getAttribute("aria-disabled") === "true",
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
    await page.click("#export-cancel");
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
  async function runResponsiveLayoutJourney(layoutTest) {
    const problems = [];
    const evidenceDirectory = process.env.ASSEMBLASH_LAYOUT_EVIDENCE_DIR;
    const check = (condition, message) => { if (!condition) problems.push(message); };
    const navigateFixture = async () => {
      const targetUrl = new URL(`?layout-run=${Date.now()}-${Math.random().toString(16).slice(2)}`, fixture.url).href;
      await page.send("Page.navigate", { url: targetUrl });
      await page.waitFor(
        `location.href === ${JSON.stringify(targetUrl)} && document.readyState === "complete"`,
        "layout fixture navigation",
        10000,
      );
      await page.waitFor(
        `document.querySelector("#status") && document.querySelector("#add-text") && document.querySelector("#project-picker-toggle")`,
        "editor controls for layout coverage",
        10000,
      );
      await page.waitFor(`document.querySelector("#recents") && document.querySelector("#consent-bar")`,
        "recent-project and notice mounts", 10000);
    };
    const pointerClick = async (selector) => {
      const point = await page.evaluate(`(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) throw new Error("missing pointer target: " + ${JSON.stringify(selector)});
        const r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
      })()`);
      assert.ok(point.width > 0 && point.height > 0, `${selector} is not available to a pointer`);
      await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
      await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
    };
    const pointerClickPoint = async (point) => {
      await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
      await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
    };
    const cornersVisible = async (left, top) => page.evaluate(`(() => {
      const viewport = document.querySelector("#stage-viewport");
      viewport.scrollLeft = ${left ? 0 : "viewport.scrollWidth - viewport.clientWidth"};
      viewport.scrollTop = ${top ? 0 : "viewport.scrollHeight - viewport.clientHeight"};
      const view = viewport.getBoundingClientRect();
      const canvas = document.querySelector("#canvas").getBoundingClientRect();
      const x = ${left ? "canvas.left" : "canvas.right"};
      const y = ${top ? "canvas.top" : "canvas.bottom"};
      return {
        x: viewport.scrollLeft, y: viewport.scrollTop,
        maxX: viewport.scrollWidth - viewport.clientWidth,
        maxY: viewport.scrollHeight - viewport.clientHeight,
        visible: x >= view.left - 2 && x <= view.right + 2 && y >= view.top - 2 && y <= view.bottom + 2,
        point: { x, y },
        view: { left: view.left, top: view.top, right: view.right, bottom: view.bottom },
        canvas: { left: canvas.left, top: canvas.top, right: canvas.right, bottom: canvas.bottom },
      };
    })()`);
    const assertNoOverlaps = (items, label) => {
      for (let left = 0; left < items.length; left += 1) {
        for (let right = left + 1; right < items.length; right += 1) {
          check(!rectanglesOverlap(items[left].rect, items[right].rect),
            `${label}: ${items[left].label} overlaps ${items[right].label}`);
        }
      }
    };
    const assertAlignedControls = (items, label, { expectedCount, equalSpacing = false } = {}) => {
      check(items.length === expectedCount,
        `${label}: expected ${expectedCount} visible controls, found ${items.length}`);
      if (items.length < 2) return;
      const reference = items[0].rect;
      const referenceCenter = reference.top + reference.height / 2;
      for (const item of items) {
        check(Math.abs(item.rect.height - reference.height) <= 1,
          `${label}: ${item.id || item.label} height ${item.rect.height}px differs from ${reference.height}px`);
        const center = item.rect.top + item.rect.height / 2;
        check(Math.abs(center - referenceCenter) <= 1,
          `${label}: ${item.id || item.label} center ${center}px differs from ${referenceCenter}px`);
      }
      if (equalSpacing && items.length > 2) {
        const firstGap = items[1].rect.left - items[0].rect.right;
        for (let index = 1; index < items.length - 1; index += 1) {
          const gap = items[index + 1].rect.left - items[index].rect.right;
          check(Math.abs(gap - firstGap) <= 1,
            `${label}: gap ${index} is ${gap}px; expected ${firstGap}px`);
        }
      }
    };
    const assertHeaderAlignment = (geometry, label) => {
      const alignedIds = new Set([
        "project-search", "project-picker-toggle", "new-project", "undo", "redo", "history-shortcut", "settings", "export",
      ]);
      const controls = geometry.topbarControls.filter((control) => alignedIds.has(control.id));
      const width = geometry.viewport.width;
      const expectedCount = width <= 720 ? 4 : width <= 1280 ? 5 : 8;
      assertAlignedControls(controls, `${label} header controls`, { expectedCount });
    };
    const assertPanelGeometry = async (name, collapsed) => {
      const geometry = await layoutGeometry(page);
      const { workspace, toolrail, add, editor, structure } = geometry;
      assertHeaderAlignment(geometry, name);
      check(isInside(toolrail, workspace), `${name}: toolrail is outside the workspace`);
      check(isInside(structure, workspace), `${name}: Structure is outside the workspace`);
      check(structure.width <= 340, `${name}: Structure is ${structure.width}px wide`);
      check(Math.abs(structure.right - workspace.right) <= 2, `${name}: Structure does not reach the workspace edge`);
      if (collapsed) {
        check(add.display === "none" || add.width <= 1, `${name}: collapsed Add still occupies ${add.width}px`);
        check(Math.abs(editor.left - toolrail.right) <= 2, `${name}: editor does not start after the rail`);
        check(Math.abs(editor.right - structure.left) <= 2, `${name}: editor and Structure do not meet`);
        check(editor.width >= workspace.width - toolrail.width - structure.width - 4,
          `${name}: collapsed editor is only ${editor.width}px wide`);
      } else {
        check(add.display !== "none" && add.width >= 180, `${name}: open Add is not usable`);
        check(Math.abs(add.left - toolrail.right) <= 2, `${name}: Add does not start after the rail`);
        check(Math.abs(add.right - editor.left) <= 2, `${name}: Add and editor do not meet`);
        check(Math.abs(editor.right - structure.left) <= 2, `${name}: editor and Structure do not meet`);
        check(editor.width >= workspace.width - toolrail.width - add.width - structure.width - 4,
          `${name}: open editor is only ${editor.width}px wide`);
        for (const [index, button] of geometry.addButtons.entries()) {
          check(isInside(button.rect, add), `${name}: Add button ${index} is clipped by its panel`);
        }
        assertNoOverlaps(geometry.addButtons, `${name} Add controls`);
      }
      for (const [index, button] of geometry.toolButtons.entries()) {
        check(isInside(button.rect, toolrail), `${name}: rail button ${index} is clipped`);
        check(isInside(button.rect, { left: 0, top: 0, right: geometry.viewport.width, bottom: geometry.viewport.height }),
          `${name}: rail button ${index} is outside the viewport`);
        if (geometry.viewport.width <= 720) {
          check(button.caption && button.captionText.length > 0,
            `${name}: rail button ${index} has no visible caption`);
          check(isInside(button.inner, button.rect) && isInside(button.labelBox, button.inner),
            `${name}: rail caption “${button.captionText}” is clipped by its button`);
          check(isInside(button.caption, button.labelBox),
            `${name}: rail caption “${button.captionText}” extends outside its label`);
          check(button.labelBox.scrollHeight <= button.labelBox.clientHeight + 2
            && button.inner.scrollHeight <= button.inner.clientHeight + 2,
            `${name}: rail caption “${button.captionText}” is vertically clipped`);
        }
      }
      assertNoOverlaps(geometry.toolButtons, `${name} rail controls`);
      for (const [index, tab] of geometry.tabs.entries()) {
        check(isInside(tab.rect, geometry.tablist), `${name}: Structure tab ${index} is clipped`);
      }
      assertNoOverlaps(geometry.tabs, `${name} Structure tabs`);
      if (geometry.activePanel) {
        check(geometry.activePanel.left >= structure.left - 2 && geometry.activePanel.right <= structure.right + 2,
          `${name}: active panel extends outside Structure horizontally`);
      }
      for (const [index, control] of geometry.panelControls.entries()) {
        check(control.rect.left >= structure.left - 2 && control.rect.right <= structure.right + 2,
          `${name}: panel control ${index} extends outside Structure horizontally`);
      }
      if (geometry.projectOpen) {
        check(geometry.zoomControlsVisible, `${name}: zoom controls are hidden while a project is open`);
        check(isInside(geometry.zoomControls, geometry.stageViewport), `${name}: zoom controls are outside the canvas viewport`);
        assertAlignedControls(geometry.zoomButtons, `${name} zoom controls`, { expectedCount: 4, equalSpacing: true });
        assertNoOverlaps(geometry.zoomButtons, `${name} zoom controls`);
      } else {
        check(!geometry.zoomControlsVisible, `${name}: zoom controls show while no project is open`);
      }
      if (geometry.contextualToolbar && geometry.toolbarControls.length) {
        for (const control of geometry.toolbarControls) {
          check(control.rect.top >= geometry.contextualToolbar.top - 2
            && control.rect.bottom <= geometry.contextualToolbar.bottom + 2,
          `${name}: toolbar control ${control.label} is clipped vertically`);
        }
      }
      return geometry;
    };
    layoutTest.after(async () => {
      fixture.reset();
      fixture.setUpdate("off", null);
      await page.evaluate(`document.querySelector("#settings-dialog")?.close("cancel")`);
      await setViewport(page, 1400, 900).catch(() => {});
      await navigateFixture();
      await setLayoutLanguage(page, "en");
      await setLayoutAppearance(page, "system");
    });

    fixture.reset();
    fixture.createAsAgent("mobile-picker-name-that-must-stay-inside-the-option");
    await navigateFixture();
    await page.waitFor(`!document.querySelector("#consent-bar").hidden`, "unanswered update consent");
    await setLayoutLanguage(page, "fr");
    for (const viewport of [
      { width: 800, height: 760, dpr: 1, name: "consent-800" },
      { width: 390, height: 760, dpr: 1, name: "consent-390" },
    ]) {
      await setViewport(page, viewport.width, viewport.height, viewport.dpr);
      const consent = await page.evaluate(`(() => {
        const box = (node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
            width: rect.width, height: rect.height, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight };
        };
        const bar = document.querySelector("#consent-bar");
        return { viewport: { width: innerWidth, height: innerHeight }, bar: box(bar), status: box(document.querySelector(".statusbar")),
          text: box(bar.querySelector(".notice-text")), buttons: [box(document.querySelector("#consent-notify")), box(document.querySelector("#consent-off"))] };
      })()`);
      await writeLayoutEvidence(page, evidenceDirectory, viewport.name, consent);
      check(consent.bar.left >= 0 && consent.bar.right <= viewport.width,
        `${viewport.name}: consent bar extends outside the viewport`);
      check(consent.bar.top >= 0 && consent.bar.bottom <= viewport.height,
        `${viewport.name}: consent bar extends outside the viewport vertically`);
      check(consent.bar.scrollHeight <= consent.bar.clientHeight + 1,
        `${viewport.name}: consent bar content is clipped`);
      check(consent.status.top >= consent.bar.bottom - 1,
        `${viewport.name}: consent text overlaps the status bar`);
      check(isInside(consent.text, consent.bar), `${viewport.name}: consent text is clipped`);
      for (const [index, button] of consent.buttons.entries()) {
        check(isInside(button, consent.bar), `${viewport.name}: consent button ${index} is clipped`);
        check(button.left >= 0 && button.right <= viewport.width,
          `${viewport.name}: consent button ${index} is outside the viewport`);
      }
      check(!rectanglesOverlap(consent.buttons[0], consent.buttons[1]),
        `${viewport.name}: consent buttons overlap`);
    }

    for (const language of ["fr", "de"]) {
      await setLayoutLanguage(page, language);
      for (const width of [390, 720, 800]) {
        const name = `topbar-${language}-${width}`;
        await setViewport(page, width, 760);
        const geometry = await layoutGeometry(page);
        await writeLayoutEvidence(page, evidenceDirectory, name, geometry);
        assertHeaderAlignment(geometry, name);
        const windowRect = { left: 0, top: 0, right: width, bottom: 760 };
        check(isInside(geometry.topbar, windowRect), `${name}: top bar extends outside the window`);
        if (width <= 720) {
          for (const [index, button] of geometry.toolButtons.entries()) {
            check(button.caption && button.captionText.length > 0,
              `${name}: rail button ${index} has no visible caption`);
            check(isInside(button.inner, button.rect) && isInside(button.labelBox, button.inner),
              `${name}: rail caption “${button.captionText}” is clipped by its button`);
            check(isInside(button.caption, button.labelBox),
              `${name}: rail caption “${button.captionText}” extends outside its label`);
            check(button.labelBox.scrollHeight <= button.labelBox.clientHeight + 2
              && button.inner.scrollHeight <= button.inner.clientHeight + 2,
              `${name}: rail caption “${button.captionText}” is vertically clipped`);
          }
        }
        for (const control of geometry.topbarControls) {
          check(isInside(control.rect, geometry.topbar), `${name}: ${control.id || control.label} extends outside the top bar`);
          check(isInside(control.rect, windowRect), `${name}: ${control.id || control.label} extends outside the window`);
        }
        for (let left = 0; left < geometry.topbarControls.length; left += 1) {
          for (let right = left + 1; right < geometry.topbarControls.length; right += 1) {
            const pair = [geometry.topbarControls[left].id, geometry.topbarControls[right].id];
            if (pair.includes("project-search") && pair.includes("project-picker-toggle")) continue;
            check(!rectanglesOverlap(geometry.topbarControls[left].rect, geometry.topbarControls[right].rect),
              `${name}: ${geometry.topbarControls[left].id || geometry.topbarControls[left].label} overlaps ${geometry.topbarControls[right].id || geometry.topbarControls[right].label}`);
          }
        }
        if (width === 390 || width === 720) {
          await page.click("#project-picker-toggle");
          await page.waitFor(`!document.querySelector("#project-options").hidden
            && document.querySelectorAll("#project-options [role=option] .project-option-count").length >= 2`,
          "mobile project picker options");
          const picker = await page.evaluate(`(() => {
            const box = (node) => {
              if (!node) return null;
              const r = node.getBoundingClientRect();
              return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
            };
            const options = [...document.querySelectorAll("#project-options [role=option]")].map((option) => ({
              label: option.querySelector("strong")?.textContent.trim() ?? "",
              rect: box(option), name: box(option.querySelector("strong")),
              count: box(option.querySelector(".project-option-count")),
            }));
            return { viewport: { width: innerWidth, height: innerHeight }, menu: box(document.querySelector("#project-options")), options };
          })()`);
          await writeLayoutEvidence(page, evidenceDirectory, `picker-${language}-${width}`, picker);
          check(picker.menu.left >= 0 && picker.menu.right <= width,
            `${name}: project picker menu extends outside the viewport horizontally`);
          for (const option of picker.options) {
            check(option.label.length > 0, `${name}: project option has no project name`);
            check(isInside(option.rect, picker.menu), `${name}: project option extends outside its menu`);
            check(isInside(option.name, option.rect), `${name}: project name is clipped inside its option`);
            check(isInside(option.count, option.rect), `${name}: project count is clipped inside its option`);
            check(!rectanglesOverlap(option.name, option.count), `${name}: project name overlaps its count`);
            check(option.name.bottom <= option.count.top + 1,
              `${name}: project count does not fit below its project name`);
          }
          await page.click("#project-picker-toggle");
          await page.waitFor(`document.querySelector("#project-options").hidden`, "mobile project picker to close");
        }
      }
    }

    await setLayoutLanguage(page, "fr");
    await setViewport(page, 390, 760);
    await page.click("#dock-toggle");
    await page.waitFor(`document.querySelector("#structure-panel").classList.contains("mobile-open")`,
      "mobile Structure panel to open while update consent is visible");
    await page.waitFor(`Array.from(document.querySelector("#structure-panel").getAnimations()).every((animation) => animation.playState !== "running")`,
      "mobile Structure panel transition");
    const mobileStructure = await layoutGeometry(page);
    await writeLayoutEvidence(page, evidenceDirectory, "structure-consent-390", mobileStructure);
    check(isInside(mobileStructure.structure, mobileStructure.workspace),
      "390px Structure panel extends outside the workspace");
    check(mobileStructure.structure.bottom <= mobileStructure.toolrail.top + 2,
      "390px Structure panel overlaps the mobile toolrail");
    check(mobileStructure.consentBar && mobileStructure.structure.bottom <= mobileStructure.consentBar.top + 2,
      "390px Structure panel overlaps the update consent notice");
    await page.click("#dock-toggle");
    await page.waitFor(`!document.querySelector("#structure-panel").classList.contains("mobile-open")`,
      "mobile Structure panel to close");
    await page.waitFor(`Array.from(document.querySelector("#structure-panel").getAnimations()).every((animation) => animation.playState !== "running")`,
      "mobile Structure close transition");

    fixture.reset();
    fixture.emptyRecentProjects();
    fixture.setUpdate("off", null);
    const firstRunHintWasShown = await page.evaluate(`localStorage.getItem("assemblash-agent-hint-v1") !== null`);
    await navigateFixture();
    await closeFirstRunAgentsDialog(page, !firstRunHintWasShown);
    await setLayoutLanguage(page, "de");
    await setLayoutAppearance(page, "system");
    await setViewport(page, 1440, 900);
    await page.waitFor(`!document.querySelector("#canvas-empty").hidden && document.querySelector("#recents").hidden`,
      "empty home with no recent projects");
    let homeGeometry = await layoutGeometry(page);
    await writeLayoutEvidence(page, evidenceDirectory, "home-empty-1440", homeGeometry);
    check(homeGeometry.emptyHome && homeGeometry.emptyHome.display !== "none", "empty home is not visible");
    check(homeGeometry.recentsHidden && homeGeometry.recentButtons.length === 0, "empty recents shows project cards");
    check(!homeGeometry.zoomControlsVisible, "zoom controls show on the empty home page");
    await setViewport(page, 2880, 1520);
    homeGeometry = await layoutGeometry(page);
    await writeLayoutEvidence(page, evidenceDirectory, "home-empty-2880x1520", homeGeometry);
    check(homeGeometry.recentsHidden && homeGeometry.recentButtons.length === 0,
      "empty recents at 2880x1520 shows project cards");
    check(!homeGeometry.zoomControlsVisible, "zoom controls show on the empty home page at 2880x1520");

    fixture.reset();
    fixture.createAsAgent("recent-one");
    fixture.createAsAgent("recent-two");
    fixture.setUpdate("off", null);
    await navigateFixture();
    await setViewport(page, 1440, 900);
    await page.waitFor(`!document.querySelector("#recents").hidden && document.querySelectorAll("#recents .recent-card").length >= 3`,
      "multiple recent projects");
    const recentCards = await page.evaluate(`([...document.querySelectorAll("#recents .recent-card")].map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    }))`);
    for (let left = 0; left < recentCards.length; left += 1) {
      for (let right = left + 1; right < recentCards.length; right += 1) {
        check(!rectanglesOverlap(recentCards[left], recentCards[right]),
          `recent project cards ${left} and ${right} overlap`);
      }
    }
    await page.click("#recents .recent");
    await page.waitFor(`!document.querySelector("#canvas").hidden && document.querySelector("#canvas-empty").hidden`,
      "opening a project from recents");
    await selectLayer(page, "layer_text");

    const viewports = [
      { width: 1280, height: 900, dpr: 1, language: "fr", appearance: "light", name: "project-1280" },
      { width: 1440, height: 760, dpr: 1, language: "de", appearance: "dark", name: "project-1440" },
      { width: 1920, height: 1080, dpr: 1, language: "fr", appearance: "system", name: "project-1920" },
      { width: 2880, height: 1520, dpr: 1, language: "de", appearance: "light", name: "project-2880x1520" },
      { width: 1440, height: 760, dpr: 2, language: "fr", appearance: "dark", name: "project-1440x760-dpr2" },
    ];
    for (const viewport of viewports) {
      await setViewport(page, viewport.width, viewport.height, viewport.dpr);
      await setLayoutLanguage(page, viewport.language);
      await setLayoutAppearance(page, viewport.appearance);
      await page.click("#add-text");
      await page.waitFor(`!document.querySelector("#add-panel").classList.contains("collapsed")`, "Add panel to open");
      await page.click("#add-image");
      await page.waitFor(`!document.querySelector("#add-upload-section").hidden`, "upload dropzone to open");
      let geometry = await assertPanelGeometry(`${viewport.name} Add open`, false);
      check(geometry.uploadDropzone && geometry.uploadTextWrap === "normal",
        `${viewport.name}: upload instructions do not wrap`);
      check(geometry.uploadDropzone.scrollWidth <= geometry.uploadDropzone.clientWidth + 1,
        `${viewport.name}: upload dropzone overflows horizontally`);
      if (viewport.width === 1440 && viewport.dpr === 1) {
        await writeLayoutEvidence(page, evidenceDirectory, "project-open-1440", geometry);
      }
      await page.click("#add-panel-close");
      await page.waitFor(`document.querySelector("#add-panel").classList.contains("collapsed")`, "Add panel to collapse");
      geometry = await assertPanelGeometry(`${viewport.name} Add collapsed`, true);
      await writeLayoutEvidence(page, evidenceDirectory, `${viewport.name}-collapsed`, geometry);

      for (const tabId of ["properties-tab", "layers-tab", "history-tab"]) {
        await page.click(`#${tabId}`);
        await page.waitFor(`document.querySelector("#${tabId}").getAttribute("aria-selected") === "true"`, `${tabId} selection`);
        geometry = await layoutGeometry(page);
        for (const [index, tab] of geometry.tabs.entries()) {
          check(isInside(tab.rect, geometry.tablist), `${viewport.name}: tab ${index} is clipped`);
        }
        assertNoOverlaps(geometry.tabs, `${viewport.name} tab controls`);
        for (const [index, control] of geometry.panelControls.entries()) {
          check(control.rect.left >= geometry.structure.left - 2 && control.rect.right <= geometry.structure.right + 2,
            `${viewport.name}: ${tabId} control ${index} is clipped horizontally`);
        }
        if (geometry.activePanel) {
          check(geometry.activePanel.left >= geometry.structure.left - 2
            && geometry.activePanel.right <= geometry.structure.right + 2,
          `${viewport.name}: ${tabId} content is outside Structure`);
        }
      }
      await page.click("#properties-tab");
      await page.waitFor(`document.querySelector("#properties-tab").getAttribute("aria-selected") === "true"`, "Properties tab selection");

      const toolbar = await layoutGeometry(page);
      const paintTrigger = await page.evaluate(`document.querySelector('[data-paint-trigger="text-color"]')
        ? '[data-paint-trigger="text-color"]'
        : (document.querySelector("#text-color-trigger") ? "#text-color-trigger" : null)`);
      if (paintTrigger) {
        const paintHit = await page.evaluate(`(() => {
          const trigger = document.querySelector(${JSON.stringify(paintTrigger)});
          if (!trigger) return null;
          const rect = trigger.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const hit = document.elementFromPoint(x, y);
          const describe = (node) => {
            const r = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return { tag:node.tagName, id:node.id, className:node.className?.toString(), state:node.dataset.state,
              display:style.display, visibility:style.visibility, opacity:style.opacity, pointerEvents:style.pointerEvents,
              zIndex:style.zIndex, rect:{ left:r.left, top:r.top, right:r.right, bottom:r.bottom } };
          };
          const dialogNodes = ["#settings-dialog", "#settings-dialog .mantine-Modal-content",
            "#settings-dialog .mantine-Modal-overlay", "#agents-dialog", "#agents-dialog .mantine-Modal-content",
            "#agents-dialog .mantine-Modal-overlay"].flatMap((selector) => [...document.querySelectorAll(selector)]);
          const dialogs = dialogNodes.map(describe);
          return { x, y, width: rect.width, height: rect.height, hit: Boolean(hit && trigger.contains(hit)),
            hitElement: hit ? { tag:hit.tagName, id:hit.id, className:hit.className?.toString() } : null,
            dialogs, trigger: { id:trigger.id, className:trigger.className?.toString(), ariaExpanded:trigger.getAttribute("aria-expanded") } };
        })()`);
        if (paintHit && !paintHit.hit) {
          const evidence = join(here, "..", ".ai", "scratch", "layout-final-tests");
          mkdirSync(evidence, { recursive: true });
          const screenshot = await page.send("Page.captureScreenshot", { format: "png", fromSurface: true });
          writeFileSync(join(evidence, `${viewport.name}-paint-hit.png`), Buffer.from(screenshot.data, "base64"));
        }
        assert.ok(paintHit?.hit && paintHit.width > 0 && paintHit.height > 0,
          `${viewport.name}: selected-text color swatch is not pointer-reachable: ${JSON.stringify(paintHit)}`);
        await pointerClick(paintTrigger);
        await page.waitFor(`document.querySelector('[data-paint-popover="text-color"]')?.getClientRects().length
          && document.querySelector('[data-paint-editor="text-color"]')?.getClientRects().length`,
        "selected-text paint popover to open from a real pointer click");
        await page.waitFor(`document.querySelector("#text-color-solid")?.getClientRects().length`,
          "selected-text solid paint control");
        const paintGeometry = await page.evaluate(`(() => {
          const box = (node) => { const r = node.getBoundingClientRect(); return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; };
          const editor = document.querySelector('[data-paint-popover="text-color"] [data-paint-editor="text-color"]');
          const solid = document.querySelector("#text-color-solid");
          const trigger = document.querySelector('[data-paint-trigger="text-color"]');
          const dropdown = document.querySelector('[data-paint-popover="text-color"]');
          return { viewport: { width: innerWidth, height: innerHeight }, editor: box(editor), solid: box(solid),
            trigger: box(trigger), ariaExpanded: trigger.getAttribute("aria-expanded"),
            ariaControls: trigger.getAttribute("aria-controls"), dropdownId: dropdown.id,
            dropdownRole: dropdown.getAttribute("role"), dropdown: box(dropdown) };
        })()`);
        check(paintGeometry.trigger.width > 0 && paintGeometry.trigger.height > 0,
          `${viewport.name}: selected-text color swatch is not visible`);
        check(paintGeometry.editor.width > 0 && paintGeometry.editor.height > 0,
          `${viewport.name}: selected-text paint popover is not visible`);
        check(paintGeometry.ariaExpanded === "true", `${viewport.name}: paint trigger does not expose its open state`);
        check(paintGeometry.ariaControls === paintGeometry.dropdownId && paintGeometry.dropdownId,
          `${viewport.name}: paint trigger does not control its live dropdown`);
        check(paintGeometry.dropdownRole === "dialog", `${viewport.name}: paint dropdown is not exposed as a dialog`);
        for (const [label, rect] of [["paint editor", paintGeometry.editor], ["solid paint control", paintGeometry.solid], ["paint dropdown", paintGeometry.dropdown]]) {
          check(rect.left >= 0 && rect.top >= 0 && rect.right <= paintGeometry.viewport.width
            && rect.bottom <= paintGeometry.viewport.height,
          `${viewport.name}: ${label} is outside the viewport`);
        }
        const jsonSegment = await page.evaluate(`(() => {
          const input = document.querySelector('[data-paint-editor="text-color"] input[value="json"]');
          const target = input?.closest("label") ?? input?.parentElement;
          if (!target) throw new Error("missing JSON paint mode control");
          const r = target.getBoundingClientRect();
          return { x:r.left+r.width/2, y:r.top+r.height/2, width:r.width, height:r.height };
        })()`);
        assert.ok(jsonSegment.width > 0 && jsonSegment.height > 0, "JSON paint mode is not pointer-accessible");
        await pointerClickPoint(jsonSegment);
        await page.waitFor(`document.querySelector("#text-color-json")?.getClientRects().length`,
          "selected-text JSON paint control");
        const jsonRect = await page.evaluate(`(() => { const r = document.querySelector("#text-color-json").getBoundingClientRect();
          return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; })()`);
        check(jsonRect.left >= 0 && jsonRect.top >= 0 && jsonRect.right <= viewport.width
          && jsonRect.bottom <= viewport.height,
        `${viewport.name}: selected-text JSON editor is clipped`);
        const solidSegment = await page.evaluate(`(() => {
          const input = document.querySelector('[data-paint-editor="text-color"] input[value="solid"]');
          const target = input?.closest("label") ?? input?.parentElement;
          if (!target) throw new Error("missing solid paint mode control");
          const r = target.getBoundingClientRect();
          return { x:r.left+r.width/2, y:r.top+r.height/2, width:r.width, height:r.height };
        })()`);
        await pointerClickPoint(solidSegment);
        await page.waitFor(`document.querySelector("#text-color-solid")?.getClientRects().length`,
          "selected-text solid editor after switching modes");
      } else {
        const legacyPaint = toolbar.toolbarPaintEditors[0];
        check(Boolean(legacyPaint && legacyPaint.width > 0 && legacyPaint.height > 0),
          `${viewport.name}: selected-text paint control is not visible`);
      }
      if (viewport.width === 1440 && viewport.dpr === 1) {
        const selected = await layoutGeometry(page);
        await writeLayoutEvidence(page, evidenceDirectory, "project-selected-text-1440", selected);
      }
      if (paintTrigger) {
        await pointerClick(paintTrigger);
        await page.waitFor(`!document.querySelector('[data-paint-popover="text-color"]')?.getClientRects().length`,
          "selected-text paint popover to close");
      }
      await page.evaluate(`document.querySelector("#inspector").scrollLeft = 0`);
      await page.evaluate(`document.querySelector("#inspector").scrollLeft = document.querySelector("#inspector").scrollWidth`);
      const toolbarEnds = await page.evaluate(`(() => {
        const toolbar = document.querySelector("#inspector");
        const controls = [...toolbar.querySelectorAll("button, input, select")].filter((node) => node.getClientRects().length);
        const rect = (node) => { const r = node.getBoundingClientRect(); return { left:r.left, top:r.top, right:r.right, bottom:r.bottom }; };
        return { width: toolbar.clientWidth, scrollWidth: toolbar.scrollWidth, scrollLeft: toolbar.scrollLeft,
          first: controls.length ? rect(controls[0]) : null, last: controls.length ? rect(controls.at(-1)) : null,
          bounds: rect(toolbar) };
      })()`);
      if (toolbarEnds.scrollWidth > toolbarEnds.width + 1) {
        check(toolbarEnds.last && toolbarEnds.last.right <= toolbarEnds.bounds.right + 2,
          `${viewport.name}: last contextual control cannot be reached by horizontal scroll`);
      }
    }

    const beforeFitPreview = fixture.previewRequests().length;
    await setViewport(page, 1280, 760, 1);
    await setViewport(page, 1440, 760, 1);
    await waitFor(
      () => fixture.previewRequests().slice(beforeFitPreview).some((request) => request.scale > 0 && request.scale < 1),
      "fit-scale preview after the viewport changes",
    );
    const fitPreviewScale = fixture.previewRequests().slice(beforeFitPreview).find((request) => request.scale > 0)?.scale;
    check(fitPreviewScale < 1, `fit preview uses scale ${fitPreviewScale} instead of a reduced render`);
    const beforeNativePreview = fixture.previewRequests().length;
    await page.click("#zoom-100");
    await page.waitFor(`document.querySelector("#zoom-value").textContent === "100%"`, "100 percent zoom");
    await waitFor(
      () => fixture.previewRequests().slice(beforeNativePreview).some((request) => Math.abs(request.scale - 1) < 0.001),
      "native-scale authoritative preview after zooming to 100 percent",
    );
    const stablePreviewCount = fixture.previewRequests().length;
    await page.evaluate(`for (let count = 0; count < 3; count += 1) window.dispatchEvent(new Event("resize"))`);
    await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    check(fixture.previewRequests().length === stablePreviewCount,
      "unchanged zoom scale requests a duplicate authoritative preview after resize notifications");
    const nativeSize = await page.evaluate(`(() => {
      const canvas = document.querySelector("#canvas").getBoundingClientRect();
      return { width: canvas.width, height: canvas.height };
    })()`);
    check(Math.abs(nativeSize.width - 1000) <= 2 && Math.abs(nativeSize.height - 700) <= 2,
      `100 percent zoom does not show the 1000 by 700 document at its native size: ${JSON.stringify(nativeSize)}`);
    const zoomAnchor = await page.evaluate(`(() => {
      const view = document.querySelector("#stage-viewport").getBoundingClientRect();
      const canvas = document.querySelector("#canvas").getBoundingClientRect();
      const x = view.left + view.width * 0.65;
      const y = view.top + view.height * 0.38;
      return { x, y, fractionX: (x - canvas.left) / canvas.width, fractionY: (y - canvas.top) / canvas.height };
    })()`);
    await page.send("Input.dispatchMouseEvent", {
      type: "mouseWheel", x: zoomAnchor.x, y: zoomAnchor.y,
      deltaX: 0, deltaY: -100 * Math.log(2) / Math.log(1.1), modifiers: 2,
    });
    await page.waitFor(`document.querySelector("#zoom-value").textContent === "200%"`, "200 percent zoom from Ctrl-wheel");
    const anchoredPoint = await page.evaluate(`(() => {
      const canvas = document.querySelector("#canvas").getBoundingClientRect();
      return { fractionX: (${zoomAnchor.x} - canvas.left) / canvas.width,
        fractionY: (${zoomAnchor.y} - canvas.top) / canvas.height };
    })()`);
    check(Math.abs(anchoredPoint.fractionX - zoomAnchor.fractionX) < 0.01
      && Math.abs(anchoredPoint.fractionY - zoomAnchor.fractionY) < 0.01,
    `Ctrl-wheel moved the document point under the pointer: ${JSON.stringify({ zoomAnchor, anchoredPoint })}`);
    const maxScroll = await page.evaluate(`(() => { const v = document.querySelector("#stage-viewport"); return {
      x: v.scrollWidth - v.clientWidth, y: v.scrollHeight - v.clientHeight,
    }; })()`);
    check(maxScroll.x > 100 && maxScroll.y > 100, "200 percent zoom does not provide scrollable canvas edges");
    for (const corner of [
      { name: "top-left", left: true, top: true },
      { name: "top-right", left: false, top: true },
      { name: "bottom-left", left: true, top: false },
      { name: "bottom-right", left: false, top: false },
    ]) {
      const edge = await cornersVisible(corner.left, corner.top);
      check(edge.visible, `${corner.name} canvas corner is hidden at 200 percent zoom: ${JSON.stringify(edge)}`);
    }
    const panStart = await page.evaluate(`(() => {
      const viewport = document.querySelector("#stage-viewport");
      viewport.scrollLeft = Math.min(400, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollTop = Math.min(300, viewport.scrollHeight - viewport.clientHeight);
      const r = viewport.getBoundingClientRect();
      document.querySelector("#canvas").focus();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop };
    })()`);
    await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: panStart.x, y: panStart.y, button: "left", buttons: 1, clickCount: 1 });
    await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: panStart.x + 80, y: panStart.y + 60, button: "left", buttons: 1 });
    await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: panStart.x + 80, y: panStart.y + 60, button: "left", buttons: 0, clickCount: 1 });
    await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await page.waitFor(`!document.querySelector("#stage-viewport").classList.contains("panning")`, "pointer pan to end");
    const panEnd = await page.evaluate(`(() => { const v = document.querySelector("#stage-viewport"); return { left:v.scrollLeft, top:v.scrollTop }; })()`);
    check(panEnd.left !== panStart.scrollLeft || panEnd.top !== panStart.scrollTop,
      "Space plus pointer drag does not pan the canvas");
    const middleStart = await page.evaluate(`(() => {
      const viewport = document.querySelector("#stage-viewport");
      viewport.scrollLeft = Math.min(500, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollTop = Math.min(400, viewport.scrollHeight - viewport.clientHeight);
      const r = viewport.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2,
        scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop };
    })()`);
    await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: middleStart.x, y: middleStart.y, button: "middle", buttons: 4, clickCount: 1 });
    await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: middleStart.x - 70, y: middleStart.y - 45, button: "middle", buttons: 4 });
    await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: middleStart.x - 70, y: middleStart.y - 45, button: "middle", buttons: 0, clickCount: 1 });
    await page.waitFor(`!document.querySelector("#stage-viewport").classList.contains("panning")`, "middle-button pan to end");
    const middleEnd = await page.evaluate(`(() => { const v = document.querySelector("#stage-viewport"); return { left:v.scrollLeft, top:v.scrollTop }; })()`);
    check(middleEnd.left !== middleStart.scrollLeft || middleEnd.top !== middleStart.scrollTop,
      "middle-button pointer drag does not pan the canvas");
    await page.click("#zoom-value");
    const fitLabel = await page.evaluate(`({ en: "Fit", fr: "Ajuster", de: "Anpassen" }[document.documentElement.lang] ?? "Fit")`);
    await page.waitFor(`document.querySelector("#zoom-value").textContent === ${JSON.stringify(fitLabel)}`, "fit zoom");
    const fit = await page.evaluate(`(() => {
      const view = document.querySelector("#stage-viewport").getBoundingClientRect();
      const canvas = document.querySelector("#canvas").getBoundingClientRect();
      return { visible: canvas.left >= view.left - 2 && canvas.top >= view.top - 2
        && canvas.right <= view.right + 2 && canvas.bottom <= view.bottom + 2,
        canvas: { left:canvas.left, top:canvas.top, right:canvas.right, bottom:canvas.bottom },
        view: { left:view.left, top:view.top, right:view.right, bottom:view.bottom } };
    })()`);
    check(fit.visible, `Fit zoom does not reveal the full canvas: ${JSON.stringify(fit)}`);

    await setViewport(page, 1440, 760, 2);
    await page.click("#edit-canvas");
    await page.waitFor(`document.querySelector("#properties-panel #canvas-settings") !== null`, "canvas background form");
    await page.evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelector("#canvas-apply")?.scrollIntoView({ block: "nearest", behavior: "instant" });
      requestAnimationFrame(resolve);
    })))`);
    let backgroundGeometry = await layoutGeometry(page);
    await writeLayoutEvidence(page, evidenceDirectory, "project-background-properties", backgroundGeometry);
    check(backgroundGeometry.canvasSettings.left >= backgroundGeometry.activePanel.left - 2
      && backgroundGeometry.canvasSettings.right <= backgroundGeometry.activePanel.right + 2,
    "canvas background form extends outside Properties horizontally");
    check(backgroundGeometry.activePanelOverflowY === "auto"
      || backgroundGeometry.activePanelScrollHeight <= backgroundGeometry.activePanelClientHeight + 1,
    "Properties does not provide scrolling for the canvas background form");
    check(isInside(backgroundGeometry.canvasApply, backgroundGeometry.activePanel),
      "canvas Apply control cannot be reached inside Properties");
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "application Settings dialog");
    backgroundGeometry = await layoutGeometry(page);
    await writeLayoutEvidence(page, evidenceDirectory, "settings-dialog-1440x760-dpr2", backgroundGeometry);
    check(isInside(backgroundGeometry.settingsDialog, { left: 0, top: 0, right: 1440, bottom: 760 }),
      "Settings dialog is clipped by the viewport");
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
    await waitForSettingsClose(page);

    assert.deepEqual(problems, [], `layout regressions:\n${problems.join("\n")}`);
  }
  await t.test("responsive layout keeps recents, panels, toolbar, and canvas reachable", { only: LAYOUT_ONLY }, runResponsiveLayoutJourney);
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
      for (const [id, value] of [["canvas-width", "1200"], ["canvas-height", "900"]]) {
        const input = document.getElementById(id);
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const background = document.querySelector("#canvas-background-solid");
      background.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(background, "#102030");
      background.dispatchEvent(new Event("input", { bubbles: true }));
      background.blur();
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
    assert.equal(await page.evaluate(`document.querySelector("#canvas-transparent").checked`), true);
    assert.equal(JSON.parse(fixture.documentJson()).canvas.background, null);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("canvas gradients apply once, remain editable after a refusal, and clear transparently", async () => {
    fixture.reset();
    await openProject(page);
    await page.click("#edit-canvas");
    await page.click('#canvas-background-paint input[type="radio"][value="json"]');
    await page.waitFor(`document.querySelector("#canvas-background-json") !== null`, "the canvas JSON paint editor");
    const firstGradient = {
      kind: "linear",
      angle: 35,
      stops: [
        { offset: 0, color: "#e63946" },
        { offset: 1, color: "#1d3557ff" },
      ],
    };
    const setGradient = async (gradient) => {
      await page.evaluate(`(() => {
        const input = document.querySelector("#canvas-background-json");
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(input, ${JSON.stringify(JSON.stringify(gradient, null, 2))});
        input.dispatchEvent(new Event("input", { bubbles: true }));
      })()`);
    };
    const applyGradient = () => page.click("#canvas-background-apply-json");

    await setGradient(firstGradient);
    await applyGradient();
    assert.equal(fixture.writes.length, 0, "parsing JSON only updates the canvas draft");
    assert.equal(await page.evaluate(`document.querySelector("#canvas-apply").disabled`), false);
    await page.click("#canvas-apply");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "updateCanvas", background: firstGradient });
    assert.deepEqual(JSON.parse(fixture.documentJson()).canvas.background, firstGradient);

    fixture.writes.length = 0;
    await applyGradient();
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fixture.writes.length, 0, "applying identical gradient JSON does not create another history entry");

    fixture.armWriteRefusal("operationRefused", "future gradient refused");
    await setGradient({ kind: "futureGradient", stops: [] });
    await applyGradient();
    await page.click("#canvas-apply");
    await page.waitFor(`document.querySelector("#status").dataset.kind === "error"`, "the typed gradient refusal");
    assert.equal(fixture.writes.length, 0);

    const secondGradient = { kind: "linear", angle: 90, stops: [{ offset: 0, color: "#111111" }, { offset: 1, color: "#eeeeee" }] };
    await setGradient(secondGradient);
    await applyGradient();
    await page.click("#canvas-apply");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1, "a valid edit after refusal still dispatches");
    assert.deepEqual(fixture.writes[0].body.operation, { op: "updateCanvas", background: secondGradient });
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("canvas background image upload, fit, and clear use typed canvas operations", async () => {
    fixture.reset();
    await openProject(page);
    await page.click("#edit-canvas");
    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array([137, 80, 78, 71])], "canvas-photo.png", { type: "image/png" }));
      const input = document.querySelector("#canvas-background-upload-input");
      if (!input) throw new Error("missing Mantine background file input");
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "updateCanvas", backgroundImage: { asset: "asset_fixture", fit: "fill" },
    });
    assert.deepEqual(JSON.parse(fixture.documentJson()).canvas.backgroundImage, { asset: "asset_fixture", fit: "fill" });

    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const fit = document.querySelector("#canvas-background-image-fit");
      fit.value = "contain";
      fit.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, {
      op: "updateCanvas", backgroundImage: { asset: "asset_fixture", fit: "contain" },
    });

    fixture.writes.length = 0;
    await page.click("#canvas-background-image-clear");
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes[0].body.operation, { op: "updateCanvas", clearBackgroundImage: true });
    assert.equal(Object.hasOwn(JSON.parse(fixture.documentJson()).canvas, "backgroundImage"), false);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
  });

  await t.test("text and shape gradients keep typed paint, stroke width, and one-step undo", async () => {
    fixture.reset();
    await openProject(page);
    await selectLayer(page, "layer_text");
    const linear = { kind: "linear", angle: 35, stops: [
      { offset: 0, color: "#e63946" }, { offset: 1, color: "#1d355780" },
    ] };
    const radial = { kind: "radial", center: { x: 0.4, y: 0.6 }, radius: 0.7, stops: [
      { offset: 0, color: "#ffffff" }, { offset: 1, color: "#10203000" },
    ] };
    async function enterPaint(id, value) {
      const trigger = `[data-paint-trigger="${id}"]`;
      if (await page.evaluate(`Boolean(document.querySelector(${JSON.stringify(trigger)}))`)
        && !await page.evaluate(`document.querySelector(${JSON.stringify(trigger)}).getAttribute("aria-expanded") === "true"`)) {
        await page.click(trigger);
      }
      await page.waitFor(`document.querySelector(${JSON.stringify(`[data-paint-editor="${id}"]`)})?.getClientRects().length`, `${id} paint editor`);
      if (!await page.evaluate(`Boolean(document.querySelector(${JSON.stringify(`#${id}-json`)}))`)) {
        await page.click(`[data-paint-editor="${id}"] input[value="json"]`);
      }
      await page.waitFor(`document.querySelector(${JSON.stringify(`#${id}-json`)}) !== null`, `${id} JSON control`);
      await page.evaluate(`(() => {
        const input = document.querySelector(${JSON.stringify(`#${id}-json`)});
        input.focus();
        input.select();
      })()`);
      await page.send("Input.insertText", { text: typeof value === "string" ? value : JSON.stringify(value) });
      await page.click(`#${id}-apply-json`);
    }

    await enterPaint("text-color", "{invalid");
    assert.equal(fixture.writes.length, 0, "invalid JSON does not send an operation");
    await page.waitFor(`document.querySelector('[data-paint-editor="text-color"] [role="alert"]') !== null`, "invalid paint feedback");
    assert.equal(await page.evaluate(`Boolean(document.querySelector('[data-paint-editor="text-color"] [role="alert"]'))`), true);
    await enterPaint("text-color", linear);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "update", id: "layer_text", color: linear },
    ]);
    assert.deepEqual(findLayer(JSON.parse(fixture.documentJson()), "layer_text").color, linear);

    fixture.writes.length = 0;
    await enterPaint("text-color", { stops: linear.stops, angle: linear.angle, kind: linear.kind });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fixture.writes.length, 0, "equivalent gradient JSON adds no history entry");
    await page.click('[data-paint-trigger="text-color"]');

    await enterPaint("text-stroke", radial);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "update", id: "layer_text", stroke: { color: radial, width: 1 } },
    ]);
    assert.deepEqual(findLayer(JSON.parse(fixture.documentJson()), "layer_text").stroke, { color: radial, width: 1 });

    await page.click("#add-shape");
    await page.click('[data-shape="rect"]');
    await waitForSaved(page);
    await selectLayer(page, "layer_made_3");
    fixture.writes.length = 0;
    await enterPaint("shape-fill", radial);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "update", id: "layer_made_3", fill: radial },
    ]);
    fixture.writes.length = 0;
    await enterPaint("shape-stroke", linear);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "update", id: "layer_made_3", stroke: { color: linear, width: 2 } },
    ]);
    fixture.writes.length = 0;
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-stroke-width");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "7");
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.deepEqual(fixture.writes.map((write) => write.body.operation), [
      { op: "update", id: "layer_made_3", stroke: { color: linear, width: 7 } },
    ]);
    const undoCount = fixture.undos.length;
    await page.click("#undo");
    await waitFor(() => Promise.resolve(fixture.undos.length === undoCount + 1), "one undo for gradient stroke width");
    await waitForSaved(page);
    assert.deepEqual(findLayer(JSON.parse(fixture.documentJson()), "layer_made_3").stroke, { color: linear, width: 2 });
    assert.deepEqual(findLayer(JSON.parse(fixture.documentJson()), "layer_made_3").fill, radial);

    await selectLayer(page, "layer_protected");
    assert.equal(await page.evaluate(`document.querySelector('[data-paint-trigger="text-color"]').disabled`), true);
    assert.equal(await page.evaluate(`document.querySelector("#text-fill-solid").disabled`), true);
    assert.equal(await page.evaluate(`document.querySelector("#text-stroke-solid").disabled`), true);
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
      openGroups: [...document.querySelectorAll("#settings-dialog .settings-section[data-active]")].map((one) => one.id)
    })`), {
      canvasInSettings: false,
      follow: true,
      agents: true,
      fonts: true,
      updateToggle: true,
      projectActions: 3,
      openGroups: ["settings-agents"],
    });

    const settingsLayoutReady = `(() => {
      const modal = document.querySelector("#settings-dialog");
      const label = modal.querySelector('label[for="setting-follow"]');
      return modal.scrollWidth <= modal.clientWidth &&
        !!label && label.getBoundingClientRect().width > 0;
    })()`;
    await page.waitFor(settingsLayoutReady, "Settings layout and checkbox label to settle");
    assert.equal(await page.evaluate(settingsLayoutReady), true, "Settings fits and the toggle label stays beside its checkbox");

    // Opening another Settings group sends no document operation.
    fixture.writes.length = 0;
    await page.click("#settings-document .mantine-Accordion-control");
    assert.equal(await page.evaluate(`document.querySelector("#settings-document").hasAttribute("data-active")`), true);
    assert.equal(fixture.writes.length, 0);

    await page.key("Escape", { code: "Escape" });
    await page.waitFor(`!document.querySelector("#settings-dialog").open`, "Escape closes Settings");
    assert.equal(fixture.writes.length, 0, "Escape committed nothing");

  });

  await t.test("appearance defaults to system, persists each choice, and leaves canvas paint unchanged", async () => {
    fixture.reset();
    await openProject(page);
    const originalBackground = JSON.parse(fixture.documentJson()).canvas.background;
    fixture.writes.length = 0;
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to open for appearance");
    await page.click("#settings-application .mantine-Accordion-control");
    await page.waitFor(`document.querySelector("#settings-application").hasAttribute("data-active")`, "application settings to open");
    await waitForAppearanceSection(page);
    const selectedAppearance = `document.querySelector('#setting-appearance input[type="radio"]:checked')?.value`;
    assert.equal(await page.evaluate(selectedAppearance), "system");

    for (const [scheme, stored] of [["dark", "dark"], ["light", "light"], ["system", "auto"]]) {
      await clickAppearanceOption(page, scheme);
      const schemeApplied = scheme === "system"
        ? `document.documentElement.getAttribute("data-mantine-color-scheme") === (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`
        : `document.documentElement.getAttribute("data-mantine-color-scheme") === ${JSON.stringify(scheme)}`;
      await page.waitFor(
        `${schemeApplied} && ${selectedAppearance} === ${JSON.stringify(scheme)}`,
        `the ${scheme} appearance to apply`,
      );
      assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), stored);
    }

    await page.evaluate(`document.querySelector('#setting-appearance input[type="radio"][value="system"]').focus()`);
    await page.send("Input.dispatchKeyEvent", {
      type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
    });
    await page.send("Input.dispatchKeyEvent", {
      type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
    });
    await page.waitFor(
      `${selectedAppearance} === "light" && document.documentElement.getAttribute("data-mantine-color-scheme") === "light"`,
      "ArrowRight to select Light from System",
    );
    await page.send("Input.dispatchKeyEvent", {
      type: "keyDown", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37,
    });
    await page.send("Input.dispatchKeyEvent", {
      type: "keyUp", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37,
    });
    await page.waitFor(
      `${selectedAppearance} === "system" && document.documentElement.getAttribute("data-mantine-color-scheme") === (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`,
      "ArrowLeft to return to System",
    );
    assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), "auto");

    await page.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "dark" }],
    });
    await page.waitFor(
      `matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.getAttribute("data-mantine-color-scheme") === "dark"`,
      "System appearance to follow a dark system preference",
    );
    await page.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "light" }],
    });
    await page.waitFor(
      `!matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.getAttribute("data-mantine-color-scheme") === "light"`,
      "System appearance to follow a light system preference",
    );
    assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), "auto");
    await page.send("Emulation.setEmulatedMedia", { features: [] });
    await page.waitFor(
      `document.documentElement.getAttribute("data-mantine-color-scheme") === (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`,
      "System appearance after restoring the browser preference",
    );

    assert.equal(fixture.writes.length, 0, "appearance changes do not edit the document");
    assert.equal(JSON.parse(fixture.documentJson()).canvas.background, originalBackground);
    await clickAppearanceOption(page, "dark");
    assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), "dark");
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
    await waitForSettingsClose(page);
    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "editor startup after appearance reload",
      10000,
    );
    await page.click("#settings");
    await page.waitFor(`document.querySelector("#settings-dialog").open`, "Settings to reopen for appearance");
    await page.click("#settings-application .mantine-Accordion-control");
    await page.waitFor(`document.querySelector("#settings-application").hasAttribute("data-active")`, "application settings to reopen");
    await waitForAppearanceSection(page);
    assert.equal(await page.evaluate(selectedAppearance), "dark");
    assert.equal(await page.evaluate(`document.documentElement.getAttribute("data-mantine-color-scheme")`), "dark");
    assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), "dark");
    await clickAppearanceOption(page, "system");
    await page.waitFor(
      `document.documentElement.getAttribute("data-mantine-color-scheme") === (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`,
      "System appearance after restoring dark",
    );
    assert.equal(await page.evaluate(`localStorage.getItem("mantine-color-scheme-value")`), "auto");
    assert.equal(JSON.parse(fixture.documentJson()).canvas.background, originalBackground);
    await page.evaluate(`document.querySelector("#settings-dialog").close("cancel")`);
    await waitForSettingsClose(page);
    assert.equal(fixture.writes.length, 0, "appearance changes do not edit the document after reload");
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
      await page.evaluate(`document.querySelector('#advanced-inspector #font-weight')?.tagName`),
      "SELECT",
    );
    assert.deepEqual(
      await page.evaluate(`[...document.querySelectorAll('#advanced-inspector #font-weight option')].map((one) => one.textContent)`),
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
    await page.click("#font-pack-section .mantine-Accordion-control");
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

    const sectionWasOpen = await page.evaluate(`document.querySelector("#advanced-inspector .dock-section-control").getAttribute("aria-expanded") === "true"`);
    await page.evaluate(`document.querySelector("#advanced-inspector .dock-section-control").click()`);
    assert.equal(await page.evaluate(`document.querySelector("#advanced-inspector .dock-section-control").getAttribute("aria-expanded") === "true"`), !sectionWasOpen);

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
    await chooseProject(page, "demo");
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
      rect: document.querySelector('.layer[data-id="layer_made_3"] .layer-icon i').className,
      ellipse: document.querySelector('.layer[data-id="layer_made_4"] .layer-icon i').className,
      line: document.querySelector('.layer[data-id="layer_made_5"] .layer-icon i').className
    })`), {
      rect: "ph ph-square",
      ellipse: "ph ph-circle",
      line: "ph ph-line-segment",
    });
  });

  await t.test("a shape's paint and corners each send exactly one update", async () => {
    await selectLayer(page, "layer_made_3");
    assert.deepEqual(await page.evaluate(`({
      heading: [...document.querySelectorAll("#advanced-inspector .dock-section-heading")].some((one) => one.textContent === "Shape"),
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
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-fill");
      input.focus();
      input.blur();
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(fixture.writes.length, 0, "blurring the unchanged solid paint adds no history entry");

    fixture.armWriteRefusal("operationRefused", "paint edit refused");
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-fill");
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "#445566");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.blur();
    })()`);
    await page.waitFor(`document.querySelector("#status").dataset.kind === "error"`, "the refused paint edit");
    assert.equal(fixture.writes.length, 0, "a refused paint edit does not enter history");

    const undoCount = fixture.undos.length;
    await page.evaluate(`(() => {
      const input = document.querySelector(".shape-fill");
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "#557799");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.blur();
    })()`);
    await waitForWrites(fixture);
    await waitForSaved(page);
    assert.equal(fixture.writes.length, 1, "one accepted paint edit creates one history entry");
    assert.deepEqual(fixture.writes[0].body.operation, { op: "update", id: "layer_made_3", fill: "#557799" });
    await page.click("#undo");
    await waitFor(() => Promise.resolve(fixture.undos.length === undoCount + 1), "one undo for the paint edit");
    await waitFor(() => Promise.resolve(findLayer(JSON.parse(fixture.documentJson()), "layer_made_3")?.fill === "#3366cc"), "the prior paint after undo");

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
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "6");
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
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "12");
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
    await page.evaluate(`(() => {
      const select = document.querySelector(".effect-chooser");
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "dropShadow");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
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
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "10");
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
          const wrapper = [...document.querySelectorAll("#advanced-inspector .field")]
            .find((one) => one.textContent.trim().startsWith(label));
          const input = wrapper && wrapper.querySelector("input");
          if (!input) throw new Error("no " + label + " field");
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
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
        document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", code: "ArrowRight", bubbles: true }));
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
      const wrapper = [...document.querySelectorAll("#advanced-inspector .field")]
        .find((one) => one.textContent.trim().startsWith("Font size"));
      const input = wrapper.querySelector("input");
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "77");
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
    // Discard the uncommitted draft before leaving the field. This keeps the
    // journey about follow resuming, not the ordinary blur commit behavior.
    // The test tab is not focused, so dispatch the browser event directly.
    const writesBeforeDiscard = fixture.writes.length;
    await page.evaluate(`(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(window.__typedInto, "48");
      window.__typedInto.dispatchEvent(new Event("input", { bubbles: true }));
      window.__typedInto.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      return true;
    })()`);
    assert.equal(fixture.writes.length, writesBeforeDiscard, "discarding the uncommitted draft does not write");
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
      `[...document.querySelectorAll("#project-options [data-project-id]")].some((one) => one.dataset.projectId === "second")`,
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
      document.querySelector("#project-picker-toggle").click();
      return true;
    })()`);
    await page.click('#project-options [data-project-id="second"]');
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
    await page.waitFor(
      `document.querySelector("#agents-dialog")?.dataset.state === "open"`,
      "the agent dialog to open",
    );
    await page.waitFor(
      `document.querySelectorAll("#agents-blocks .agent-block code").length === 3`,
      "copy-ready agent configuration",
    );
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
    await page.click("#agents-done");
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
      `[...document.querySelectorAll("#project-options [data-project-id]")].some((one) => one.dataset.projectId === "from-agent")`,
      "the project an agent created to be listed",
      10000,
    );
    assert.equal(await page.evaluate(`document.querySelector("#project-search").dataset.currentProject`), "demo");
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
    await page.evaluate(`(() => {
      const select = document.querySelector(".effect-chooser");
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "dropShadow");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await page.click(".effect-add");
    await waitForSaved(page);
    await waitForWrites(fixture);

    const setField = (field, value) => page.evaluate(`(() => {
      const input = document.querySelector('.effect-row[data-effect="dropShadow"] [data-field="${field}"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
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
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(input, "M 0 0 Q 5 5 10 10 Z");
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
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
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
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "arrow");
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
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "circle");
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
      `[...document.querySelectorAll("#project-options [data-project-id]")].some((one) => one.dataset.projectId === "Renamed project")`,
      "the picker to list the renamed project",
    );
    await page.waitFor(
      `document.querySelector("#project-search").dataset.currentProject === "Renamed project" && !document.querySelector("#canvas").hidden`,
      "the project to reopen under the new id",
    );
    assert.ok(
      fixture.projectCalls().some((call) => call.kind === "rename" && call.name === "Renamed project"),
    );
  });

  await t.test("the Mantine template panel sends filled slots to the variants API", async () => {
    fixture.reset();
    fixture.useTemplate(true);
    await page.evaluate(`location.reload()`);
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`, "editor reload");
    await openProject(page);
    await page.click("#templates-toggle");
    await page.waitFor(`!document.querySelector("#templates").hidden && document.querySelector("#templates").classList.contains("open")`, "template panel");
    await page.waitFor(`document.querySelector('#slot-form [data-slot="headline"] input') !== null`, "headline slot control");
    await page.evaluate(`(() => {
      const input = document.querySelector('#slot-form [data-slot="headline"] input');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "Launch title");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`);
    await page.click("#preview-variant");
    await waitFor(() => fixture.variantCalls().length === 1, "template variants request");
    assert.deepEqual(fixture.variantCalls()[0], {
      variants: [{ name: "preview", values: { headline: "Launch title" } }], scale: 1,
    });
    await page.waitFor(`document.querySelector('#gallery img[src^="blob:"]') !== null`, "rendered template preview");
    await page.click("#templates-close");
    await page.waitFor(`!document.querySelector("#templates").classList.contains("open")`, "template panel to close");
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
      `![...document.querySelectorAll("#project-options [data-project-id]")].some((one) => one.dataset.projectId === "demo")`,
      "the deleted project to leave the picker",
    );
    assert.equal(await page.evaluate(`document.querySelector("#canvas-empty").hidden`), false);
    assert.ok(fixture.projectCalls().some((call) => call.kind === "delete" && call.project === "demo"));
    fixture.useSecondProject(false);
  });

  await t.test("the Mantine project dialog creates the selected canvas through the project API", async () => {
    await page.click("#new-project");
    await page.waitFor(`document.querySelector('#new-project-dialog[data-state="open"]') !== null`, "new project dialog");
    await page.waitFor(`document.querySelector('#canvas-presets [data-size="1920x1080"]') !== null`, "canvas presets");
    await page.click('#canvas-presets [data-size="1920x1080"]');
    assert.deepEqual(await page.evaluate(`({
      width: document.querySelector("#new-project-width").value,
      height: document.querySelector("#new-project-height").value
    })`), { width: "1920", height: "1080" });
    await page.evaluate(`(() => {
      const input = document.querySelector("#new-project-name");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "mantine-project");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`);
    await page.click("#create-project-confirm");
    await page.waitFor(`document.querySelector('#new-project-dialog[data-state="open"]') === null`, "project dialog to close");
    assert.ok(fixture.projectCalls().some((call) => call.kind === "create"
      && call.id === "mantine-project" && call.width === 1920 && call.height === 1080
      && call.background === "#ffffff"));
    await page.waitFor(`document.querySelector("#project-search").dataset.currentProject === "mantine-project"`, "created project to open");
  });

  await t.test("login uses the Mantine token form and keeps the bearer session check", async () => {
    fixture.reset();
    await page.send("Page.navigate", { url: `${fixture.url}/login` });
    await page.waitFor(`document.querySelector("#login-form #token") !== null`, "the login token field");
    assert.equal(await page.evaluate(`document.querySelector("#login-form #token").type`), "password");
    await page.evaluate(`(() => {
      const input = document.querySelector("#login-form #token");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "invalid-test-token");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector("#login-form").requestSubmit();
    })()`);
    await page.waitFor(
      `document.querySelector("#login-status")?.dataset.kind === "error" && document.querySelector("#login-status").textContent.length > 0`,
      "the rejected token status",
    );
    assert.deepEqual(fixture.sessionCalls(), ["Bearer invalid-test-token"]);
    fixture.setSessionAccepted(true);
    await page.evaluate(`(() => {
      const input = document.querySelector("#login-form #token");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "valid-test-token");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector("#login-form").requestSubmit();
    })()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "the authenticated editor after the token check",
      10000,
    );
    assert.deepEqual(fixture.sessionCalls(), ["Bearer invalid-test-token", "Bearer valid-test-token"]);
    assert.deepEqual(fixture.sessionRequests(), [
      { authorization: "Bearer invalid-test-token", path: "/api/browser-session", body: "" },
      { authorization: "Bearer valid-test-token", path: "/api/browser-session", body: "" },
    ], "the token is sent only in the Authorization header");
    assert.equal(await page.evaluate(`!location.href.includes("valid-test-token") && location.search === "" && location.hash === ""`), true);
    assert.ok(fixture.sessionCookieReads().includes("assemblash-session=fixture"), "the browser sends the HttpOnly session cookie to the editor");

    await page.evaluate(`location.reload()`);
    await page.waitFor(
      `document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`,
      "the authenticated editor after reload",
      10000,
    );
    assert.ok(fixture.sessionCookieReads().filter((cookie) => cookie === "assemblash-session=fixture").length >= 2);
    await openProject(page);
    await waitForSaved(page);
  });

});
