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

function applyMockOperation(document, operation) {
  const layer = operation.id ? findLayer(document, operation.id) : null;
  if (operation.op === "update" && layer) Object.assign(layer, operation);
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
  const writes = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const send = (status, body) => json(response, status, body);

    if (request.method === "GET" && url.pathname === "/api/version") {
      return send(200, { name: "assemblash", version: "ui-test", schemaVersion: 1, canShutdown: false });
    }
    if (request.method === "GET" && url.pathname === "/api/projects") {
      return send(200, { projects: [{ id: "demo", name: document.name, documentId: document.id, version: document.version, layers: document.layers.length }] });
    }
    if (request.method === "GET" && url.pathname === "/api/projects/recent") {
      return send(200, { projects: [{ id: "demo", name: document.name, documentId: document.id, version: document.version, layers: document.layers.length }] });
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
    if (request.method === "GET" && url.pathname === "/api/fonts") {
      return send(200, { families: ["Noto Sans"] });
    }
    if (request.method === "GET" && url.pathname.endsWith("/preview.png")) {
      response.writeHead(200, { "content-type": "image/png" });
      return response.end(png);
    }
    if (request.method === "GET" && url.pathname.endsWith("/text-layout")) {
      return send(200, { lineCount: 1, height: 58 });
    }

    if (request.method === "POST" && (url.pathname.endsWith("/operations") || url.pathname.endsWith("/operation-batches"))) {
      let raw = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => { raw += chunk; });
      request.on("end", () => {
        const body = JSON.parse(raw);
        writes.push({ path: url.pathname, body });
        const operations = body.commands ?? [body.operation];
        for (const operation of operations) applyMockOperation(document, operation);
        document.version += 1;
        send(200, url.pathname.endsWith("operation-batches")
          ? { version: document.version, transactionId: `tx_${document.version}`, created: [], changed: [], removed: [] }
          : { version: document.version, dryRun: false, transaction: `tx_${document.version}`, created: [], changed: [], removed: [] });
      });
      return;
    }

    const requested = url.pathname === "/" ? "index.html" : basename(url.pathname);
    const allowed = new Set([
      "index.html", "app.js", "api.js", "export.js", "geometry.js", "templates.js", "token.js",
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
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return {
    url: `http://127.0.0.1:${address.port}`,
    writes,
    reset() {
      document = freshDocument();
      writes.length = 0;
    },
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
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

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
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

  async waitFor(expression, description, timeout = 5000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.evaluate(`Boolean(${expression})`)) return;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    const page = await this.evaluate(`({
      url: location.href,
      ready: document.readyState,
      status: document.querySelector("#status")?.textContent,
      save: document.querySelector("#save-state")?.textContent
    })`);
    throw new Error(`timed out waiting for ${description}: ${JSON.stringify(page)} ${this.events.join(" | ")}`);
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
  const portFile = join(profile, "DevToolsActivePort");
  const deadline = Date.now() + 10000;
  while (!existsSync(portFile) && Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`browser exited with ${child.exitCode}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  if (!existsSync(portFile)) throw new Error("browser did not expose a DevTools port");
  const [port] = readFileSync(portFile, "utf8").trim().split(/\r?\n/);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((one) => one.type === "page");
  assert.ok(target?.webSocketDebuggerUrl, "headless browser did not create a page target");
  let socket;
  const stop = async () => {
    socket?.close();
    if (child.exitCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await exited;
    }
    rmSync(profile, { recursive: true, force: true });
  };
  try {
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    const page = new CdpPage(socket);
    await page.send("Runtime.enable");
    await page.send("Page.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url });
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.includes("ready")`, "editor startup", 10000);
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

async function waitForWrites(fixture, count = 1, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (fixture.writes.length < count && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.ok(fixture.writes.length >= count, `expected ${count} API write${count === 1 ? "" : "s"}`);
}

async function waitForSaved(page) {
  await page.waitFor(`document.querySelector("#save-state")?.textContent?.includes("All changes saved")`, "saved state");
}

test("editor interaction journeys use the real compiled interface", async (t) => {
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
  t.after(async () => {
    await browser.close();
    await fixture.close();
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

  await t.test("zoom and responsive panels expose deterministic states", async () => {
    await page.click("#zoom-100");
    assert.deepEqual(await page.evaluate(`({ value: document.querySelector("#zoom-value").textContent, width: document.querySelector("#canvas").style.width })`), { value: "100%", width: "1000px" });
    await page.click("#zoom-in");
    assert.equal(await page.evaluate(`document.querySelector("#zoom-value").textContent`), "120%");
    await page.click("#zoom-value");
    assert.equal(await page.evaluate(`document.querySelector("#zoom-value").textContent`), "Fit");

    await page.send("Emulation.setDeviceMetricsOverride", { width: 800, height: 900, deviceScaleFactor: 1, mobile: false });
    await page.evaluate(`window.dispatchEvent(new Event("resize"))`);
    assert.deepEqual(await page.evaluate(`({
      addCollapsed: document.querySelector("#add-panel").classList.contains("collapsed"),
      dockExpanded: document.querySelector("#dock-toggle").getAttribute("aria-expanded"),
      mobileOpen: document.querySelector("#structure-panel").classList.contains("mobile-open")
    })`), { addCollapsed: true, dockExpanded: "false", mobileOpen: false });
    await page.click("#dock-toggle");
    assert.equal(await page.evaluate(`document.querySelector("#structure-panel").classList.contains("mobile-open")`), true);
  });
});
