// Exercise Runs against the actual embedded server with local pinned fonts.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startBrowser } from "../ui/browser-harness.mjs";

const options = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, args) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), args[index + 1]]);
  return pairs;
}, []));
for (const key of ["binary", "workspace", "output"]) if (!options[key]) throw new Error(`Require --${key}`);
const binary = resolve(options.binary);
const workspace = resolve(options.workspace);
const output = resolve(options.output);
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const env = { ...process.env };
for (const key of ["ASSEMBLASH_FONT_STORE", "ASSEMBLASH_WORKSPACE", "ASSEMBLASH_BIND", "ASSEMBLASH_TOKEN"]) delete env[key];
function cli(...args) {
  const result = spawnSync(binary, args, { env, encoding: "utf8", windowsHide: true, timeout: 30000 });
  if (result.status !== 0) throw new Error(`${args[0]}: ${result.stderr ?? result.error}`);
  return result.stdout.trim();
}
const project = join(workspace, "projects", "runs");
if (existsSync(project)) throw new Error("Use a fresh workspace");
mkdirSync(dirname(output), { recursive: true });
cli("workspace", "--workspace", workspace);
writeFileSync(join(workspace, "config.toml"), "port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n");
for (const name of ["NotoSans-Subset.ttf", "NotoSans-Bold-Subset.ttf", "NotoSansArabic-Subset.ttf"]) {
  cli("font", "add", join(repo, "crates/assemblash-renderer/tests/fonts", name), "--license", "OFL-1.1", "--font-store", join(workspace, "fonts"));
}
cli("new", project, "--width", "600", "--height", "240", "--background", "#ffffff");
const id = cli("add-text", project, "--text", "A bold ب", "--font", "Noto Sans", "--size", "32", "--x", "24", "--y", "24", "--width", "500", "--height", "150");
const seed = JSON.parse(readFileSync(join(project, "document.json"), "utf8"));
const original = [
  { text: "A ", fontSize: null, future: { keep: [1, 2] } },
  { text: "bold", fontWeight: 700, color: { kind: "linear", angle: 20, futurePaint: { keep: true }, stops: [{ offset: 0, color: "#ff0000", futureStop: 7 }, { offset: 1, color: "#0000ff" }] } },
  { text: " ", color: null },
  { text: "ب", fontFamily: "Noto Sans Arabic", color: "#336699" },
];
seed.layers[0].runs = original;
for (const flag of ["protected", "locked", "readOnly"]) seed.layers.push({ ...structuredClone(seed.layers[0]), id: `layer_${flag}`, name: flag, [flag]: true, visible: false });
writeFileSync(join(project, "document.json"), JSON.stringify(seed, null, 2));
cli("set", project, "--layer", id, "--color", "#000000");
const portProbe = createServer();
await new Promise((done) => portProbe.listen(0, "127.0.0.1", done));
const port = portProbe.address().port;
await new Promise((done) => portProbe.close(done));
const server = spawn(binary, ["serve", "--workspace", workspace, "--port", String(port), "--friendly"], { env, stdio: "ignore", windowsHide: true });
const base = `http://127.0.0.1:${port}`;
let browser;
const result = { check: "styledRunsEditor", executed: true, ok: false, binarySha256: hash(readFileSync(binary)), binaryVersion: cli("--version"), uiSource: "embedded", checks: {} };
const pause = () => new Promise((done) => setTimeout(done, 30));
async function until(probe, name) { const end = Date.now() + 30000; while (Date.now() < end) { if (await probe()) return; await pause(); } throw new Error(`Timeout: ${name}`); }
async function request(path, payload) {
  const response = await fetch(base + path, payload === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const body = await response.json();
  assert.ok(response.ok, JSON.stringify(body));
  return body;
}
const doc = () => request("/api/projects/runs/document");
const text = async () => (await doc()).layers.find((layer) => layer.id === id);
try {
  await until(async () => { if (server.exitCode !== null) throw new Error("Server exited"); try { return (await fetch(base + "/api/version")).ok; } catch { return false; } }, "server startup");
  browser = await startBrowser(base);
  assert.ok(browser, "Installed Chrome or Edge is required");
  const { page } = browser;
  const external = [];
  browser.page.socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); if (message.method === "Network.requestWillBeSent") { const url = message.params.request.url; if (/^https?:/.test(url) && !url.startsWith(base + "/")) external.push(url); } });
  await page.send("Network.enable");
  async function open() {
    await page.click("#project-picker-toggle");
    await page.waitFor(`document.querySelector('[data-project-id="runs"]')`, "project listing");
    await page.click('[data-project-id="runs"]');
    await page.waitFor(`document.querySelector('#canvas-image')?.complete && document.querySelector('#canvas-image')?.naturalWidth > 0`, "Rust preview");
    await page.click(`.layer[data-id="${id}"]`);
    await page.waitFor(`document.querySelector('#runs-edit')`, "Runs controls");
  }
  async function input(selector, value) {
    await page.evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  }
  async function saved() { await page.waitFor(`document.querySelector('#runs-edit')`, "acknowledged Runs Apply"); }
  async function currentView() {
    const version = (await doc()).version;
    await page.waitFor(`Number(document.querySelector('#version').textContent.replace(/[^0-9]/g, '')) === ${version}`, "authoritative document version in UI");
  }
  await open();
  for (const flag of ["protected", "locked", "readOnly"]) {
    await page.click(`.layer[data-id="layer_${flag}"]`);
    await page.waitFor(`document.querySelector('#runs-edit')?.disabled`, `${flag} guard`);
  }
  await page.click(`.layer[data-id="${id}"]`);
  result.checks.guards = true;
  await page.click("#runs-edit");
  await input("textarea[data-run-text]", "New ");
  await page.click('.layer[data-id="layer_protected"]');
  await page.click(`.layer[data-id="${id}"]`);
  assert.equal(await page.evaluate(`document.querySelector('textarea[data-run-text]').value`), "New ");
  const historyBefore = await request("/api/projects/runs/history");
  await page.click("#runs-apply");
  await saved();
  const edited = await text();
  assert.equal(edited.text, "New bold ب");
  assert.deepEqual(edited.runs, [{ ...original[0], text: "New " }, ...original.slice(1)]);
  assert.equal((await request("/api/projects/runs/history")).position, historyBefore.position + 1);
  await page.click("#undo");
  await until(async () => (await text()).text === "A bold ب", "one undo");
  assert.deepEqual((await text()).runs, original);
  await currentView();
  await page.waitFor(`!document.querySelector('#redo').disabled`, "redo available after authoritative undo");
  await page.click("#redo");
  await until(async () => (await text()).text === "New bold ب", "redo");
  result.checks.atomicUndoRedoAndRaw = true;
  await page.send("Page.reload");
  await page.waitFor(`document.querySelector('#status')?.textContent?.toLowerCase().includes('ready')`, "reload");
  await open();
  await page.click("#runs-edit");
  assert.equal(await page.evaluate(`document.querySelector('textarea[data-run-text]').value`), "New ");
  await input("textarea[data-run-text]", "Draft ");
  const current = await doc();
  await request("/api/projects/runs/operations", { expectedVersion: current.version, operation: { op: "update", id, opacity: 0.9 } });
  await page.click("#runs-apply");
  await page.waitFor(`document.querySelector('#runs-error')`, "stale version refusal");
  assert.equal((await text()).text, "New bold ب");
  assert.equal(await page.evaluate(`document.querySelector('textarea[data-run-text]').value`), "Draft ");
  await page.click("#runs-reload");
  await page.waitFor(`!document.querySelector('#runs-error') && document.querySelector('textarea[data-run-text]')?.value === 'New ' && !document.querySelector('#runs-cancel').disabled`, "explicit draft reload");
  result.checks.reloadAndConflict = true;
  const gradient = { kind: "linear", angle: 45, stops: [{ offset: 0, color: "#ff0000" }, { offset: 1, color: "#0000ff" }] };
  await input('[data-run-row]:nth-child(2) textarea[data-paint-json]', JSON.stringify(gradient));
  await page.click('[data-run-row]:nth-child(2) button[id$="-apply-json"]');
  await page.click("#runs-apply");
  await saved();
  const paint = (await text()).runs[1].color;
  assert.equal(paint.angle, 45);
  assert.deepEqual(paint.futurePaint, { keep: true });
  assert.equal(paint.stops[0].futureStop, 7);
  result.checks.paintExtras = true;
  for (const nextPaint of [
    { kind: "radial", center: { x: 0.2, y: 0.3, future: { keep: 1 } }, radius: 0.4, stops: [{ ...gradient.stops[0], removedOnly: 1 }, { ...gradient.stops[1], survivorOnly: 2 }] },
    { kind: "radial", stops: [{ ...gradient.stops[1] }] },
  ]) {
    await page.click("#runs-edit");
    await input('[data-run-row]:nth-child(2) textarea[data-paint-json]', JSON.stringify(nextPaint));
    await page.click('[data-run-row]:nth-child(2) button[id$="-apply-json"]');
    await page.click("#runs-apply");
    await saved();
  }
  const radial = (await text()).runs[1].color;
  assert.deepEqual(radial.center, { x: 0.5, y: 0.5, future: { keep: 1 } });
  assert.equal(Object.hasOwn(radial, "radius"), false);
  assert.equal(radial.stops[0].survivorOnly, 2);
  assert.equal(Object.hasOwn(radial.stops[0], "removedOnly"), false);
  assert.equal(Object.hasOwn(radial.stops[0], "futureStop"), false);
  await page.click("#runs-edit");
  await input('[data-run-row]:nth-child(2) textarea[data-paint-json]', JSON.stringify({ kind: "radial", stops: gradient.stops }));
  await page.click('[data-run-row]:nth-child(2) button[id$="-apply-json"]');
  await page.click("#runs-apply");
  await saved();
  const inserted = (await text()).runs[1].color;
  assert.deepEqual(inserted.center, { x: 0.5, y: 0.5, future: { keep: 1 } });
  assert.equal(inserted.stops[1].survivorOnly, 2);
  assert.equal(Object.hasOwn(inserted.stops[0], "removedOnly"), false);
  assert.equal(Object.hasOwn(inserted.stops[0], "survivorOnly"), false);
  await page.click("#runs-edit");
  await input('[data-run-row]:nth-child(2) textarea[data-paint-json]', JSON.stringify(paint));
  await page.click('[data-run-row]:nth-child(2) button[id$="-apply-json"]');
  await page.click("#runs-apply");
  await saved();
  assert.deepEqual((await text()).runs[1].color, paint);
  result.checks.radialCenterReset = true;
  for (const mode of ["lostResponse", "failedRefresh"]) {
    await page.click("#runs-edit");
    await input("textarea[data-run-text]", mode === "lostResponse" ? "Lost " : "Saved ");
    const before = (await request("/api/projects/runs/history")).position;
    await page.evaluate(`(() => {
      const originalFetch = window.fetch;
      let applied = false;
      window.fetch = async (...args) => {
        const url = String(args[0]);
        if (!applied && url.includes('/operations?')) {
          const response = await originalFetch(...args);
          applied = true;
          if (${JSON.stringify(mode)} === 'lostResponse') { window.fetch = originalFetch; throw new TypeError('simulated response loss after commit'); }
          const body = await response.json();
          delete body.document;
          return new Response(JSON.stringify(body), { status: response.status, headers: { 'content-type': 'application/json' } });
        }
        if (applied && url.endsWith('/document')) { window.fetch = originalFetch; throw new TypeError('simulated refresh loss after acknowledgement'); }
        return originalFetch(...args);
      };
    })()`);
    await page.click("#runs-apply");
    await page.waitFor(`document.querySelector('#runs-error') && document.querySelector('#runs-apply').disabled`, mode + " reconciliation");
    assert.equal((await request("/api/projects/runs/history")).position, before + 1);
    assert.equal((await text()).text, mode === "lostResponse" ? "Lost bold ب" : "Saved bold ب");
    await page.click("#runs-apply");
    assert.equal((await request("/api/projects/runs/history")).position, before + 1);
    await page.click("#runs-reload");
    await page.waitFor(`!document.querySelector('#runs-error') && !document.querySelector('#runs-cancel').disabled && document.querySelector('textarea[data-run-text]')?.value === ${JSON.stringify(mode === "lostResponse" ? "Lost " : "Saved ")}`, "reconciled current runs");
    await page.click("#runs-cancel");
    await saved();
    result.checks[mode] = true;
  }
  await page.click("#runs-edit");
  await page.click('[data-run-row]:first-child [data-run-move="1"]');
  await page.click("#runs-add");
  await page.click('[data-run-row]:last-child [data-run-delete]');
  await page.click("#runs-cancel");
  assert.equal((await text()).text, "Saved bold ب");
  result.checks.rowActionsCancel = true;
  await page.click("#runs-edit");
  await input('[data-run-row]:nth-child(2) input[id$="-fontWeight"]', "900");
  await page.click("#runs-apply");
  await saved();
  assert.equal((await text()).runs[1].fontWeight, 900);
  const missing = await fetch(base + "/api/projects/runs/preview.png");
  assert.equal(missing.status, 422);
  assert.equal((await missing.json()).error.code, "missingFont");
  await page.click("#undo");
  await until(async () => (await text()).runs[1].fontWeight === 700, "restore exact face");
  await currentView();
  await page.waitFor(`document.querySelector('#runs-edit')`, "restored controls");
  await page.click("#runs-edit");
  await input('[data-run-row]:nth-child(1) textarea[data-run-text]', "of");
  await input('[data-run-row]:nth-child(2) textarea[data-run-text]', "fice");
  await page.click('[data-run-row]:last-child [data-run-delete]');
  await page.click('[data-run-row]:last-child [data-run-delete]');
  await page.click("#runs-apply");
  await saved();
  assert.equal((await text()).text, "office");
  const cluster = await fetch(base + "/api/projects/runs/preview.png");
  assert.equal(cluster.status, 422);
  assert.equal((await cluster.json()).error.code, "incompatibleTextCluster");
  await page.click("#undo");
  await until(async () => (await text()).text === "Saved bold ب", "restore compatible runs");
  await currentView();
  await page.waitFor(`document.querySelector('#runs-edit')`, "restored shaping controls");
  result.checks.fontAndClusterRefusals = true;
  await page.click("#runs-edit");
  const evidenceDir = dirname(output);
  for (const locale of ["en", "fr", "de", "pseudo"]) {
    if (locale === "pseudo") {
      // Pseudo is a development locale, not an option in the preferences selector.
      await page.evaluate(`import('/i18n.js').then(module => module.setLocale('pseudo'))`);
    } else {
      await page.click("#settings");
      await page.waitFor(`document.querySelector('#settings-dialog').open`, "settings");
      await page.evaluate(`(() => { const select = document.querySelector('#setting-language'); select.value = ${JSON.stringify(locale)}; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
      await page.click("#settings-close");
      await page.waitFor(`!document.querySelector('#settings-dialog').open`, "settings closed");
    }
    await page.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await page.evaluate(`document.querySelector('#structure-panel').classList.add('mobile-open')`);
    await page.waitFor(`document.querySelector('#runs-apply')`, "localized draft");
    await page.evaluate(`document.querySelector('[data-runs-editor]').scrollIntoView({ block: 'start' })`);
    const geometry = await page.evaluate(`(() => { const node = document.querySelector('[data-runs-editor]'); const box = node.getBoundingClientRect(); return { left: box.left, right: box.right, width: innerWidth, label: node.textContent }; })()`);
    assert.ok(geometry.left >= 0 && geometry.right <= geometry.width + 1, JSON.stringify(geometry));
    assert.ok(geometry.label.includes({ en: "Runs", fr: "Segments", de: "Textabschnitte", pseudo: "⟦" }[locale]), geometry.label);
    const capture = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(evidenceDir, `runs-${locale}-narrow.png`), Buffer.from(capture.data, "base64"));
    await page.evaluate(`document.querySelector('#runs-apply').scrollIntoView({ block: 'center' })`);
    const actions = await page.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(evidenceDir, `runs-${locale}-actions.png`), Buffer.from(actions.data, "base64"));
  }
  result.checks.localesNarrow = true;
  await page.click("#runs-cancel");
  await page.evaluate(`import('/i18n.js').then(module => module.setLocale('en'))`);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.click("#runs-edit");
  await page.click("#runs-clear");
  await page.evaluate(`new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))`);
  await page.evaluate(`document.querySelector('#runs-apply').focus()`);
  result.keyboardTarget = await page.evaluate(`document.activeElement.id`);
  assert.equal(result.keyboardTarget, "runs-apply");
  await page.evaluate(`window.runsKeyEvents = []; ['keydown', 'keypress', 'keyup', 'click'].forEach(type => window.addEventListener(type, event => window.runsKeyEvents.push({ type, target: event.target.id, defaultPrevented: event.defaultPrevented }), { capture: true }))`);
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  result.keyboardEvents = await page.evaluate(`window.runsKeyEvents`);
  await saved();
  assert.deepEqual((await text()).runs, []);
  await page.click("#undo");
  await until(async () => (await text()).runs.length === 4, "restore styled runs");
  await currentView();
  result.checks.clearKeyboardUndo = true;
  const exported = await request("/api/projects/runs/export", { name: "runs-editor", scale: 1 });
  const exportBytes = readFileSync(join(project, exported.path));
  let preview;
  await until(async () => {
    preview = await page.evaluate(`fetch(document.querySelector('#canvas-image').src).then(r=>r.arrayBuffer()).then(b=>Array.from(new Uint8Array(b)))`);
    return hash(Buffer.from(preview)) === hash(exportBytes);
  }, "authoritative preview matches actual export");
  assert.equal(hash(Buffer.from(preview)), hash(exportBytes));
  result.export = exported;
  result.previewSha256 = hash(Buffer.from(preview));
  writeFileSync(join(evidenceDir, "runs-preview.png"), Buffer.from(preview));
  result.checks.previewExport = true;
  result.externalAssetRequests = external.length;
  assert.equal(external.length, 0);
  result.browser = await page.send("Browser.getVersion");
  result.ok = true;
} catch (error) {
  result.error = String(error.stack ?? error);
  if (browser) { const screenshot = await browser.page.send("Page.captureScreenshot", { format: "png" }).catch(() => null); if (screenshot) writeFileSync(join(dirname(output), "failure.png"), Buffer.from(screenshot.data, "base64")); }
  throw error;
} finally {
  writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
  try { await browser?.close(); } finally {
    try { await fetch(base + "/api/shutdown", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); } finally { server.kill(); }
  }
}
console.log(JSON.stringify(result));
