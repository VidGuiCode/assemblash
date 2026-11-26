// Native acceptance for project tabs against the embedded Rust server.
//
// Exit test 9: an agent edits a hidden tab over MCP; the tab shows the change
// marker, and on a switch the person sees the change without a page reload.
// Undo in each tab reverts only that tab's project.
// Exit test 10: closing a tab releases its project lock, so a CLI write to the
// project succeeds; a relaunch restores the same tabs in the same order.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { startBrowser } from "../ui/browser-harness.mjs";

const options = Object.fromEntries(process.argv.slice(2).reduce((all, value, index, args) => {
  if (value.startsWith("--")) all.push([value.slice(2), args[index + 1]]);
  return all;
}, []));
for (const key of ["binary", "workspace", "output"]) assert.ok(options[key], `Require --${key}`);
const binary = resolve(options.binary);
const workspace = resolve(options.workspace);
const output = resolve(options.output);
assert.ok(!existsSync(join(workspace, "projects")), "Use a fresh workspace");
mkdirSync(dirname(output), { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const env = { ...process.env };
for (const key of ["ASSEMBLASH_WORKSPACE", "ASSEMBLASH_FONT_STORE", "ASSEMBLASH_BIND", "ASSEMBLASH_TOKEN"]) delete env[key];
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

function cli(...args) {
  const run = spawnSync(binary, args, { env, encoding: "utf8", windowsHide: true, timeout: 30000 });
  return { status: run.status, stdout: (run.stdout ?? "").trim(), stderr: (run.stderr ?? "").trim() };
}
function cliOk(...args) {
  const run = cli(...args);
  assert.equal(run.status, 0, `${args[0]}: ${run.stderr}`);
  return run.stdout;
}
async function until(probe, name, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await probe()) return;
    await pause(50);
  }
  throw new Error(`Timeout: ${name}`);
}
async function freePort() {
  const probe = createServer();
  await new Promise((done) => probe.listen(0, "127.0.0.1", done));
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  return port;
}

/** A minimal MCP client over the stdio relay, which moves to the running server. */
class Mcp {
  constructor() {
    this.process = spawn(binary, ["mcp", "--workspace", workspace], { env, stdio: ["pipe", "pipe", "ignore"], windowsHide: true });
    this.buffer = "";
    this.waiting = new Map();
    this.nextId = 1;
    this.process.stdout.setEncoding("utf8");
    this.process.stdout.on("data", (chunk) => {
      this.buffer += chunk;
      let newline;
      while ((newline = this.buffer.indexOf("\n")) >= 0) {
        const line = this.buffer.slice(0, newline).trim();
        this.buffer = this.buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        const entry = this.waiting.get(message.id);
        if (!entry) continue;
        this.waiting.delete(message.id);
        message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result);
      }
    });
  }
  send(message) {
    this.process.stdin.write(JSON.stringify(message) + "\n");
  }
  call(method, params) {
    const id = this.nextId++;
    const answer = new Promise((done, fail) => {
      this.waiting.set(id, { resolve: done, reject: fail });
      setTimeout(() => fail(new Error(`MCP ${method} timed out`)), 30000);
    });
    this.send({ jsonrpc: "2.0", id, method, params });
    return answer;
  }
  async start() {
    const answer = await this.call("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "project-tabs-journey", version: "1" },
    });
    assert.equal(answer.serverInfo?.name, "assemblash");
    this.send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
  }
  async tool(name, args) {
    const result = await this.call("tools/call", { name, arguments: args });
    assert.ok(!result.isError, `MCP ${name} refused: ${JSON.stringify(result)}`);
    return result.structuredContent ?? {};
  }
  close() {
    this.process.stdin.end();
    this.process.kill();
  }
}

const binaryVersion = cliOk("--version");
cliOk("workspace", "--workspace", workspace);
writeFileSync(join(workspace, "config.toml"), "open-browser = false\nbind = '127.0.0.1'\n");
const projects = { alpha: "Alpha", beta: "Beta", gamma: "Gamma" };
for (const [id, name] of Object.entries(projects)) {
  cliOk("new", join(workspace, "projects", id), "--width", "400", "--height", "300", "--background", "#ffffff", "--name", name);
  cliOk("add-rect", join(workspace, "projects", id), "--fill", "#336699", "--x", "40", "--y", "40", "--width", "120", "--height", "80");
}

const result = { check: "projectTabs", ok: false, binaryVersion, binarySha256: hash(readFileSync(binary)), checks: {} };
let server;
let base;
let browser;
let mcp;

async function startServer() {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(binary, ["serve", "--workspace", workspace, "--port", String(port), "--reclaim-stale-locks"], { env, stdio: "ignore", windowsHide: true });
  await until(async () => {
    if (server.exitCode !== null) throw new Error(`server exited ${server.exitCode}`);
    try { return (await fetch(`${base}/api/version`)).ok; } catch { return false; }
  }, "server startup");
}
async function stopServer() {
  try {
    await fetch(`${base}/api/shutdown`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  } catch { /* already gone */ }
  await until(() => server.exitCode !== null, "server exit", 15000).catch(() => server.kill());
}
async function api(path, init) {
  const response = await fetch(base + path, init);
  const body = await response.json();
  assert.ok(response.ok, `${path}: ${JSON.stringify(body)}`);
  return body;
}
const version = async (id) => (await api(`/api/projects/${id}/document`)).version;
const lockFile = (id) => join(workspace, "projects", id, ".assemblash-lock");

/**
 * Waits until `read()` gives `expected`, compared as deep-equal JSON values.
 *
 * Every read after a click goes through this. The page applies a click before
 * it paints the next frame, but not always before the next protocol command
 * reads the page. A bounded wait reads the state that a person sees. It fails
 * with the last value it saw.
 */
async function expectState(read, expected, what, ms = 5000) {
  const end = Date.now() + ms;
  let last;
  for (;;) {
    last = await read();
    try {
      assert.deepEqual(last, expected);
      return last;
    } catch {
      if (Date.now() >= end) {
        throw new Error(`Timeout after ${ms} ms: ${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(last)}`);
      }
    }
    await pause(50);
  }
}

let page;
const tabOrder = () => page.evaluate(`[...document.querySelectorAll("[data-tab-id]")].map((tab) => tab.dataset.tabId)`);
const activeTab = () => page.evaluate(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId ?? null`);
async function openFromPicker(id) {
  await page.evaluate(`document.querySelector("#project-picker-toggle").click()`);
  await page.waitFor(`document.querySelector('#project-options [data-project-id="${id}"]')`, `${id} in the picker`);
  await page.click(`#project-options [data-project-id="${id}"]`);
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "${id}"`, `${id} tab visible`);
  // The first render of a project on a slow runner can take more than the
  // default wait (candidate run 45873939709 timed out at 5 s on the third tab).
  await page.waitFor(`document.querySelector("#canvas-image")?.naturalWidth > 0`, `${id} preview`, 15000);
}
async function switchTo(id) {
  await page.click(`[data-tab-id="${id}"]`);
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "${id}"`, `${id} tab visible`);
}
const layerCount = () => page.evaluate(`document.querySelectorAll("#layers .layer[data-id]").length`);
async function undo() {
  await page.waitFor(`!document.querySelector("#undo").disabled`, "undo available");
  await page.click("#undo");
}

try {
  await startServer();
  browser = await startBrowser(base);
  assert.ok(browser, "Chrome or Chromium is required");
  page = browser.page;
  // The page keeps this value only while it is not reloaded.
  await page.evaluate(`window.__tabsJourneyNoReload = true`);

  // --- one tab for each project --------------------------------------------
  await openFromPicker("alpha");
  await openFromPicker("beta");
  await expectState(tabOrder, ["alpha", "beta"], "one tab for each project");
  await openFromPicker("alpha");
  await expectState(tabOrder, ["alpha", "beta"], "a second open focuses the existing tab");
  await switchTo("beta");
  result.checks.secondOpenFocuses = true;

  // --- exit test 9: background change over MCP -------------------------------
  const alphaBefore = await version("alpha");
  const betaBefore = await version("beta");
  mcp = new Mcp();
  await mcp.start();
  await mcp.tool("add_shape_layer", { project: "alpha", shape: "ellipse", x: 200, y: 150, width: 80, height: 60 });
  assert.equal(await version("alpha"), alphaBefore + 1);
  await page.waitFor(`document.querySelector('[data-tab-marker="alpha"]')`, "the change marker on the hidden alpha tab", 10000);
  assert.equal(await page.evaluate(`Boolean(document.querySelector('[data-tab-marker="beta"]'))`), false, "the visible tab has no marker");
  assert.equal(await layerCount(), 1, "beta still shows its own layers");
  await switchTo("alpha");
  await page.waitFor(`document.querySelectorAll("#layers .layer[data-id]").length === 2`, "the MCP layer in alpha's layer list");
  await page.waitFor(`!document.querySelector('[data-tab-marker="alpha"]')`, "the marker clears once alpha is viewed");
  await page.waitFor(`document.querySelector("#version").textContent.trim() === "${alphaBefore + 1}"`, "alpha shows the new version");
  assert.equal(await page.evaluate(`window.__tabsJourneyNoReload`), true, "no page reload happened");
  result.checks.backgroundMarkerAndSwitch = true;

  // Undo in alpha reverts alpha only.
  await undo();
  // Undo moves the version back to the one before the agent's write.
  await until(async () => (await version("alpha")) === alphaBefore && (await api("/api/projects/alpha/document")).layers.length === 1, "alpha undo");
  assert.equal(await version("beta"), betaBefore, "undo in alpha leaves beta alone");
  // Undo in beta reverts beta only: an edit first, then its undo.
  await switchTo("beta");
  await page.evaluate(`document.querySelector("#canvas").focus({ preventScroll: true })`);
  const betaLayer = (await api("/api/projects/beta/document")).layers[0].id;
  await page.click(`#layers .layer[data-id="${betaLayer}"]`);
  await page.waitFor(`document.querySelector('#layers .layer.selected[data-id="${betaLayer}"]')`, "the beta layer selected");
  await page.evaluate(`document.querySelector("#canvas").focus({ preventScroll: true })`);
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await until(async () => (await version("beta")) === betaBefore + 1, "beta nudge");
  const alphaSettled = await version("alpha");
  await undo();
  await until(async () => (await version("beta")) === betaBefore, "beta undo");
  assert.equal((await api("/api/projects/beta/document")).layers[0].transform.x, 40, "beta undo reverts the nudge");
  assert.equal(await version("alpha"), alphaSettled, "undo in beta leaves alpha alone");
  result.checks.undoPerTab = true;

  // --- exit test 10: closing a tab releases the lock ---------------------------
  await openFromPicker("gamma");
  assert.ok(existsSync(lockFile("alpha")), "an open tab holds its project's lock");
  const refused = cli("add-rect", join(workspace, "projects", "alpha"), "--x", "1", "--y", "1", "--width", "5", "--height", "5");
  assert.notEqual(refused.status, 0, "a CLI write to an open tab's project is refused");
  await page.click(`[data-tab-close="alpha"]`);
  await page.waitFor(`!document.querySelector('[data-tab-id="alpha"]')`, "alpha tab closed");
  await until(() => !existsSync(lockFile("alpha")), "alpha lock released", 10000);
  const written = cli("add-rect", join(workspace, "projects", "alpha"), "--x", "1", "--y", "1", "--width", "5", "--height", "5");
  assert.equal(written.status, 0, `a CLI write after the tab closed: ${written.stderr}`);
  result.checks.closeReleasesLock = true;

  // Reorder from the keyboard, then relaunch: the same tabs in the same order.
  await openFromPicker("alpha");
  await expectState(tabOrder, ["beta", "gamma", "alpha"], "alpha opens at the end");
  await page.evaluate(`document.querySelector('[data-tab-id="alpha"]').focus()`);
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37, modifiers: 9 });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37, modifiers: 9 });
  await page.waitFor(`[...document.querySelectorAll("[data-tab-id]")].map((tab) => tab.dataset.tabId).join() === "beta,alpha,gamma"`, "keyboard reorder");
  await switchTo("gamma");
  const before = { order: await tabOrder(), active: await activeTab() };
  await until(async () => JSON.stringify(await api("/api/open-tabs")) === JSON.stringify({ projects: before.order, active: before.active }), "the tab list saved");
  mcp.close();
  mcp = null;
  await browser.close();
  browser = null;
  await stopServer();
  await startServer();
  browser = await startBrowser(base);
  page = browser.page;
  await page.waitFor(`document.querySelectorAll("[data-tab-id]").length === 3`, "restored tabs");
  const after = await expectState(async () => ({ order: await tabOrder(), active: await activeTab() }), before, "a relaunch restores the same tabs in the same order", 15000);
  await page.waitFor(`document.querySelector("#canvas-image")?.naturalWidth > 0`, "the restored active tab renders");
  result.checks.relaunchRestores = true;
  result.restored = after;
  result.ok = true;
} catch (error) {
  result.error = String(error.stack ?? error);
  if (browser) {
    const shot = await browser.page.send("Page.captureScreenshot", { format: "png" }).catch(() => null);
    if (shot) writeFileSync(join(dirname(output), "failure.png"), Buffer.from(shot.data, "base64"));
  }
  throw error;
} finally {
  writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
  mcp?.close();
  try { await browser?.close(); } finally { if (server) await stopServer(); }
}
console.log(JSON.stringify(result));
