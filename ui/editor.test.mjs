import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
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
const STARTUP_MS = 10000; // the browser's launch handshake
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
  packs: { default: ["Noto Sans", "Noto Serif", "Noto Sans Mono"] },
  families: [
    { family: "Noto Sans", license: "OFL-1.1", bytes: 5 * 1024 * 1024, packs: ["default"] },
    { family: "Noto Serif", license: "OFL-1.1", bytes: 4 * 1024 * 1024, packs: ["default"] },
    { family: "Noto Sans Mono", license: "OFL-1.1", bytes: 3 * 1024 * 1024, packs: ["default"] },
    { family: "Inter", license: "OFL-1.1", bytes: 2 * 1024 * 1024, packs: ["ui"] },
  ],
};

function defaultFontFaces() {
  return [
    { family: "Noto Sans", style: "normal", weight: 400, file: "a1.ttf", hash: "sha256:a1", faceIndex: 0 },
  ];
}

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
    slots: [],
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
    const { op, id, cornerRadius, ...rest } = operation;
    Object.assign(layer, rest);
    // A corner radius belongs to the rect geometry, not to the layer: the
    // engine writes it inside `shape`, and the inspector reads it back from
    // there, so the mock has to put it in the same place.
    if (cornerRadius !== undefined && layer.shape) layer.shape.cornerRadius = cornerRadius;
  }
  if (operation.op === "move" && layer) {
    layer.transform.x += operation.dx;
    layer.transform.y += operation.dy;
  }
  if (operation.op === "resize" && layer) {
    layer.transform.width = operation.width;
    layer.transform.height = operation.height;
  }
  if (operation.op === "rotate" && layer) layer.transform.rotation = operation.degrees;
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
  const fontFamilies = () => [...new Set(fontFaces.map((face) => face.family))].sort();
  const writes = [];
  const reads = [];
  const fontCalls = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const send = (status, body) => json(response, status, body);
    if (request.method === "GET" && url.pathname.startsWith("/api/")) reads.push(url.pathname);

    if (request.method === "GET" && url.pathname === "/api/version") {
      return send(200, { name: "assemblash", version: "ui-test", schemaVersion: 1, canShutdown: false });
    }
    if (request.method === "GET" && url.pathname === "/api/projects") {
      return send(200, { projects: [{ id: "demo", name: document.name, documentId: document.id, version: document.version, layers: document.layers.length }] });
    }
    if (request.method === "GET" && url.pathname === "/api/projects/recent") {
      return send(200, { projects: [{ id: "demo", name: document.name, documentId: document.id, version: document.version, layers: document.layers.length }] });
    }
    // A stale lock the server reclaimed on its own is reported exactly once,
    // to the first summary fetched afterward, then drained — the same shape
    // as the real engine's read-and-clear behaviour.
    if (request.method === "GET" && url.pathname === "/api/projects/demo") {
      const summary = { id: "demo", name: document.name, documentId: document.id, version: document.version, layers: document.layers.length };
      if (pendingReclaimedLock) {
        summary.reclaimedLock = pendingReclaimedLock;
        pendingReclaimedLock = null;
      }
      return send(200, summary);
    }
    if (request.method === "GET" && url.pathname === "/api/projects/demo/document") {
      return send(200, structuredClone(document));
    }
    if (request.method === "GET" && url.pathname === "/api/projects/demo/history") {
      return send(200, { position: 0, head: 0, entries: [] });
    }
    if (request.method === "GET" && url.pathname === "/api/projects/demo/presets") {
      return send(200, { presets: [] });
    }
    if (request.method === "GET" && url.pathname === "/api/projects/demo/slots") {
      return send(200, { isTemplate: false, slots: [] });
    }
    // Every call the font manager can make is recorded, because two of the
    // journeys are about what is *not* sent: nothing is downloaded before the
    // install button is clicked, and nothing is deleted when the confirmation
    // is dismissed.
    if (url.pathname.startsWith("/api/fonts")) {
      fontCalls.push({ method: request.method, path: url.pathname, query: url.search });
    }

    if (request.method === "GET" && url.pathname === "/api/fonts/catalogue") {
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
        if (body.pack !== "default") {
          return send(404, { error: { code: "unknownFontPack", message: `no pack named "${body.pack}"` } });
        }
        const installed = FONT_CATALOGUE.packs.default.map((family, index) => ({
          family,
          style: "normal",
          weight: 400,
          file: `pack${index}.ttf`,
          hash: `sha256:pack${index}`,
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
        writes.push({ path: url.pathname, body });
        const operations = body.commands ?? [body.operation];
        const created = [];
        for (const operation of operations) applyMockOperation(document, operation, created);
        document.version += 1;
        send(200, url.pathname.endsWith("operation-batches")
          ? { version: document.version, transactionId: `tx_${document.version}`, created, changed: [], removed: [] }
          : { version: document.version, dryRun: false, transaction: `tx_${document.version}`, created, changed: [], removed: [] });
      });
      return;
    }

    const requested = url.pathname === "/" ? "index.html" : basename(url.pathname);
    const allowed = new Set([
      "index.html", "app.js", "api.js", "export.js", "fonts.js", "geometry.js", "templates.js", "token.js",
      "studio.css", "style.css", "phosphor.css", "Phosphor.woff2",
    ]);
    if (!allowed.has(requested)) return send(404, { error: { code: "notFound", message: url.pathname } });
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".woff2": "font/woff2",
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
    reset() {
      document = freshDocument();
      fontFaces = defaultFontFaces();
      failInstall = null;
      pendingReclaimedLock = null;
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
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.includes("ready")`, "editor startup", STARTUP_MS);
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

  await t.test("side tools expose one clear mode and Select closes creation", async () => {
    for (const [tool, title, visible] of [
      ["#add-text", "Text", "#add-text-section"],
      ["#add-image", "Uploads", "#add-upload-section"],
      ["#add-vector", "Vector", "#add-vector-section"],
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
    await page.click("#select-tool");
    assert.deepEqual(await page.evaluate(`({
      collapsed: document.querySelector("#add-panel").classList.contains("collapsed"),
      selectPressed: document.querySelector("#select-tool").getAttribute("aria-pressed")
    })`), { collapsed: true, selectPressed: "true" });
  });

  await openProject(page);

  await t.test("selection builds the contextual text toolbar", async () => {
    await selectLayer(page, "layer_text");
    const toolbar = await page.evaluate(`(() => ({
      edit: [...document.querySelectorAll("#inspector button")].some((one) => one.textContent.trim() === "Edit text"),
      horizontal: [...document.querySelectorAll("#inspector button")].some((one) => one.textContent.trim() === "Centre horizontally"),
      vertical: [...document.querySelectorAll("#inspector button")].some((one) => one.textContent.trim() === "Centre vertically"),
      font: document.querySelector('[aria-label="Font family"]')?.value,
      size: document.querySelector('[aria-label="Font size"]')?.value
    }))()`);
    assert.deepEqual(toolbar, { edit: true, horizontal: true, vertical: true, font: "Noto Sans", size: "48" });
  });

  await t.test("inline editing cancels without a write and commits one update", async () => {
    fixture.writes.length = 0;
    await page.click(".edit-text-button");
    await page.waitFor(`document.querySelector('.inline-text-editor')?.value === "Edit me"`, "inline editor");
    await page.evaluate(`document.querySelector('.inline-text-editor').value = "Cancelled"`);
    await page.evaluate(`document.querySelector('.inline-text-editor').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await page.waitFor(`!document.querySelector('.inline-text-editor')`, "inline cancel");
    assert.equal(fixture.writes.length, 0);

    await page.click(".edit-text-button");
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

  await t.test("the font field offers the families the engine reported", async () => {
    await selectLayer(page, "layer_text");
    assert.deepEqual(await page.evaluate(`({
      tag: document.querySelector('[aria-label="Font family"]').tagName,
      list: document.querySelector('[aria-label="Font family"]').getAttribute("list"),
      families: [...document.querySelector("#font-families").options].map((one) => one.value)
    })`), { tag: "INPUT", list: "font-families", families: ["Noto Sans"] });
  });

  await t.test("effects reorder in place, carrying their numbers with them", async () => {
    await selectLayer(page, "layer_text");
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
  await t.test("canvas settings apply one resize and can clear the background", async () => {
    fixture.reset();
    await openProject(page);
    await page.click("#edit-canvas");
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
  });

  await t.test("an empty font store offers the pack it would download, and text needs no terminal", async () => {
    fixture.reset();
    fixture.setFonts([]);
    await openProject(page);
    await page.click("#fonts-toggle");
    await page.waitFor(`!document.querySelector("#font-empty").hidden`, "the empty font state");
    await waitForSaved(page);

    const empty = await page.evaluate(`({
      detail: document.querySelector("#install-default-detail").textContent,
      suggestions: [...document.querySelector("#font-families").options].length,
      listed: document.querySelectorAll("#font-list li").length
    })`);
    assert.equal(empty.suggestions, 0);
    assert.equal(empty.listed, 0);
    for (const family of FONT_CATALOGUE.packs.default) {
      assert.ok(empty.detail.includes(family), `${family} missing from "${empty.detail}"`);
    }
    assert.match(empty.detail, /12 MB/);
    assert.match(empty.detail, /when you click/);
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
    assert.match(refusal, /no fonts are installed/);
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
      status: "install fonts: the font mirror could not be reached (fontInstallFailed)",
    });

    await page.click("#install-default");
    // The install is finished when it says so — the list is redrawn earlier,
    // in the middle of the same run, and acting on that would race it.
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("installed Noto Sans")`,
      "the default pack to be installed",
    );
    assert.deepEqual(await page.evaluate(`({
      empty: document.querySelector("#font-empty").hidden,
      listed: document.querySelectorAll("#font-list li").length,
      faces: document.querySelector("#font-list li .font-faces").textContent,
      families: [...document.querySelector("#font-families").options].map((one) => one.value)
    })`), {
      empty: true,
      listed: 3,
      faces: "1 face · normal 400",
      families: ["Noto Sans", "Noto Sans Mono", "Noto Serif"],
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
    await page.click("#fonts-toggle");
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
      `document.querySelector("#status").textContent.includes("imported 1 font file")`,
      "the imported family",
    );
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 4);
    assert.deepEqual(await page.evaluate(`({
      feedback: document.querySelector("#font-feedback").textContent,
      suggested: [...document.querySelector("#font-families").options].some((one) => one.value === "Brand Sans")
    })`), { feedback: "Brand Sans.ttf → Brand Sans", suggested: true });

    await page.evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array([1, 2, 3])], "notes.txt", { type: "text/plain" }));
      const input = document.querySelector("#font-file");
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    await page.waitFor(
      `document.querySelector("#status").textContent.includes("no fonts imported")`,
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
    assert.match(refused.status, /no fonts imported/);
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
      `document.querySelector("#status").textContent.includes("Brand Sans removed")`,
      "the removed family",
    );
    assert.equal(await page.evaluate(`document.querySelectorAll("#font-list li").length`), 3);
    assert.equal(deletes(), before + 1);
    assert.ok(fixture.fontCalls.some((call) => call.method === "DELETE" && call.path.endsWith("/Brand%20Sans")));
    assert.equal(
      await page.evaluate(`[...document.querySelector("#font-families").options].some((one) => one.value === "Brand Sans")`),
      false,
    );
    assert.match(await page.evaluate(`document.querySelector("#status").textContent`), /Brand Sans removed/);
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
    // Opening says so before its last read has returned, and a create sent
    // while the page is still busy is dropped rather than queued.
    await waitForSaved(page);
    await page.click("#add-shape");
    assert.deepEqual(await page.evaluate(`({
      title: document.querySelector("#add-panel-title").textContent,
      visible: !document.querySelector("#add-shape-section").hidden,
      shownSections: [...document.querySelectorAll(".add-section")].filter((one) => !one.hidden).length,
      offered: [...document.querySelectorAll("#add-shape-section [data-shape]")].map((one) => one.dataset.shape)
    })`), {
      title: "Shapes",
      visible: true,
      shownSections: 1,
      offered: ["rect", "ellipse", "line"],
    });

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

});
