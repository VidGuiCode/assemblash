// Native acceptance for page sets as tabs and the export formats, against the
// embedded Rust server.
//
// Exit test 11: opening a three-page set opens three tabs in manifest order.
// Also: a page that is already open joins the run and is not opened twice;
// a set with a loop or a missing page shows a readable message and opens no
// tab; the export dialog writes one PDF of the whole set; a JPEG export uses
// the quality control; a refused export shows the readable refusal.
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
const uiDir = options["ui-dir"] ? resolve(options["ui-dir"]) : null;
assert.ok(!existsSync(join(workspace, "projects")), "Use a fresh workspace");
mkdirSync(dirname(output), { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const env = { ...process.env };
for (const key of ["ASSEMBLASH_WORKSPACE", "ASSEMBLASH_FONT_STORE", "ASSEMBLASH_BIND", "ASSEMBLASH_TOKEN"]) delete env[key];
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

function cliOk(...args) {
  const run = spawnSync(binary, args, { env, encoding: "utf8", windowsHide: true, timeout: 30000 });
  assert.equal(run.status, 0, `${args[0]}: ${run.stderr}`);
  return (run.stdout ?? "").trim();
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

const binaryVersion = cliOk("--version");
cliOk("workspace", "--workspace", workspace);
writeFileSync(join(workspace, "config.toml"), "open-browser = false\nbind = '127.0.0.1'\n");
const projects = {
  cover: "#336699", middle: "#993366", back: "#669933", notes: "#999999", extra: "#cc9900", solo: "#0099cc",
};
for (const [id, fill] of Object.entries(projects)) {
  const directory = join(workspace, "projects", id);
  cliOk("new", directory, "--width", "400", "--height", "300", "--background", "#ffffff", "--name", id[0].toUpperCase() + id.slice(1));
  cliOk("add-rect", directory, "--fill", fill, "--x", "40", "--y", "40", "--width", "120", "--height", "80");
}
// The cover has a bleed, so the dialog offers print marks for its PDF.
cliOk("canvas", "set", join(workspace, "projects", "cover"), "--bleed", "9");
const sets = join(workspace, "page-sets");
mkdirSync(sets, { recursive: true });
const writeSet = (name, pages) => writeFileSync(join(sets, `${name}.json`), JSON.stringify({ pages }, null, 2) + "\n");
const deck = [{ project: "cover" }, { project: "middle" }, { project: "back" }];
writeSet("deck", deck);
writeSet("reprise", [{ project: "extra" }, { project: "notes" }]);
writeSet("loopy", [{ project: "cover" }, { set: "loopy-inner" }]);
writeSet("loopy-inner", [{ set: "loopy" }]);
writeSet("holey", [{ project: "solo" }, { project: "ghost" }]);

const result = { check: "pageSets", ok: false, binaryVersion, binarySha256: hash(readFileSync(binary)), uiSource: uiDir ? "directory" : "embedded", checks: {} };
let server;
let base;
let browser;
let page;

async function startServer() {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  const args = ["serve", "--workspace", workspace, "--port", String(port)];
  if (uiDir) args.push("--ui-dir", uiDir);
  server = spawn(binary, args, { env, stdio: "ignore", windowsHide: true });
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

const tabOrder = () => page.evaluate(`[...document.querySelectorAll("[data-tab-id]")].map((tab) => tab.dataset.tabId)`);
const activeTab = () => page.evaluate(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId ?? null`);
const pageNumbers = () => page.evaluate(`[...document.querySelectorAll(".project-tab")].map((tab) => [tab.querySelector("[data-tab-id]").dataset.tabId, tab.dataset.pageSet ?? null, tab.dataset.pageNumber ? Number(tab.dataset.pageNumber) : null])`);
const status = () => page.evaluate(`({ text: document.querySelector("#status")?.textContent ?? "", kind: document.querySelector("#status")?.dataset.kind ?? "" })`);

async function showPicker(selector, what) {
  await page.evaluate(`document.querySelector("#project-picker-toggle").click()`);
  await page.waitFor(`document.querySelector('#project-options ${selector}')`, what);
}
async function openProject(id) {
  await showPicker(`[data-project-id="${id}"]`, `${id} in the picker`);
  await page.click(`#project-options [data-project-id="${id}"]`);
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "${id}"`, `${id} tab visible`);
  await page.waitFor(`document.querySelector("#canvas-image")?.naturalWidth > 0`, `${id} preview`);
}
async function openSet(name) {
  await showPicker(`[data-page-set="${name}"]`, `page set ${name} in the picker`);
  await page.click(`#project-options [data-page-set="${name}"]`);
}
async function switchTo(id) {
  await page.click(`[data-tab-id="${id}"]`);
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "${id}"`, `${id} tab visible`);
  await page.waitFor(`document.querySelector("#canvas-image")?.naturalWidth > 0`, `${id} preview`);
}
async function openExport() {
  await page.click("#export");
  await page.waitFor(`document.querySelector('#export-dialog[data-state="open"]') !== null`, "export dialog");
  await page.waitFor(`document.querySelector('#export-formats [data-format="png"]')?.getAttribute("aria-checked") === "true"`, "PNG is the default format");
}
async function setName(value) {
  await page.evaluate(`(() => {
    const input = document.querySelector("#export-name");
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
}
const dialogState = () => page.evaluate(`({
  quality: Boolean(document.querySelector("#export-quality")),
  print: Boolean(document.querySelector("#export-print")),
  pages: Boolean(document.querySelector("#export-pages")),
  confirm: document.querySelector("#export-confirm").textContent.trim(),
})`);

try {
  await startServer();
  browser = await startBrowser(base);
  assert.ok(browser, "Chrome or Chromium is required");
  page = browser.page;

  // --- exit test 11: a three-page set opens three tabs in manifest order ------
  await openSet("deck");
  await page.waitFor(`document.querySelectorAll("[data-tab-id]").length === 3`, "three tabs for the deck");
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "cover"`, "page 1 visible");
  assert.deepEqual(await tabOrder(), ["cover", "middle", "back"], "manifest order");
  assert.deepEqual(await pageNumbers(), [["cover", "deck", 1], ["middle", "deck", 2], ["back", "deck", 3]]);
  assert.equal(await page.evaluate(`document.querySelectorAll("[data-group-label]").length`), 1, "one group label for the run");
  await page.waitFor(`[...document.querySelectorAll("[data-tab-thumbnail]")].filter((image) => image.complete && image.naturalWidth > 0).length === 3`, "a thumbnail on each page tab", 15000);
  await page.waitFor(`document.querySelector("#canvas-image")?.naturalWidth > 0`, "page 1 preview");
  result.checks.threePageSetOpensThreeTabsInOrder = true;

  // --- a page that is already open joins the run and is not opened twice ------
  await openProject("notes");
  assert.deepEqual(await tabOrder(), ["cover", "middle", "back", "notes"]);
  await openSet("reprise");
  await page.waitFor(`document.querySelectorAll("[data-tab-id]").length === 5`, "one new tab for the reprise");
  await page.waitFor(`document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tabId === "extra"`, "reprise page 1 visible");
  assert.deepEqual(await tabOrder(), ["cover", "middle", "back", "extra", "notes"], "the open page moved into the run");
  assert.deepEqual((await pageNumbers()).slice(3), [["extra", "reprise", 1], ["notes", "reprise", 2]]);
  result.checks.openPageJoinsRunNotTwice = true;
  await page.waitFor(`[...document.querySelectorAll("[data-tab-thumbnail]")].filter((image) => image.complete && image.naturalWidth > 0).length === 5`, "a thumbnail on each page tab", 15000);
  const strip = await page.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(dirname(output), "tabs.png"), Buffer.from(strip.data, "base64"));

  // --- a loop or a missing page: a readable message, and no tab --------------
  const before = await tabOrder();
  await openSet("loopy");
  await page.waitFor(`document.querySelector("#status")?.dataset.kind === "error" && document.querySelector("#status").textContent.includes("contains itself")`, "the loop message");
  assert.match((await status()).text, /^Page set loopy contains itself: loopy → loopy-inner → loopy\.$/);
  assert.deepEqual(await tabOrder(), before, "a loop opens no tab");
  await openSet("holey");
  await page.waitFor(`document.querySelector("#status")?.textContent.includes("do not exist")`, "the missing-page message");
  assert.equal((await status()).text, "Page set holey names pages that do not exist: ghost.");
  assert.deepEqual(await tabOrder(), before, "a missing page opens no tab");
  // The lock file is no evidence here: the start page's recent-project
  // thumbnails already open every project on the server.
  assert.equal(await page.evaluate(`Boolean(document.querySelector('[data-tab-id="solo"]'))`), false, "the page that exists has no tab either");
  result.checks.loopAndMissingPageOpenNothing = true;
  result.messages = { loop: "Page set loopy contains itself: loopy → loopy-inner → loopy.", missing: "Page set holey names pages that do not exist: ghost." };

  // --- the dialog shows each control only with its format --------------------
  await switchTo("cover");
  await openExport();
  assert.deepEqual(await dialogState(), { quality: false, print: false, pages: false, confirm: "Export PNG" });
  await page.click('#export-formats [data-format="jpeg"]');
  assert.deepEqual(await dialogState(), { quality: true, print: false, pages: false, confirm: "Export JPEG" });
  await page.click('#export-formats [data-format="pdf"]');
  assert.deepEqual(await dialogState(), { quality: false, print: true, pages: true, confirm: "Export PDF" });
  result.checks.controlsFollowTheFormat = true;

  // --- one PDF of the whole set ----------------------------------------------
  await page.click('#export-pages [data-pages="set"]');
  await page.click("#export-print");
  await page.waitFor(`document.querySelector("#export-print").checked`, "print marks on");
  await setName("deck-print");
  await page.click("#export-confirm");
  await page.waitFor(`!document.querySelector("#export-download").hidden`, "the PDF download", 60000);
  const pdfSummary = await page.evaluate(`document.querySelector("#export-summary").textContent`);
  assert.match(pdfSummary, /^Export is ready: PDF, 3 pages, /);
  assert.equal(await page.evaluate(`document.querySelector("#export-download").download`), "deck-print.pdf");
  const pdf = readFileSync(join(workspace, "projects", "cover", "exports", "deck-print.pdf"));
  const pdfText = pdf.toString("latin1");
  assert.equal(pdfText.slice(0, 5), "%PDF-");
  assert.match(pdfText, /\/Type \/Pages \/Kids \[[^\]]*\] \/Count 3 /, "three pages");
  assert.match(pdfText, /\/TrimBox/, "print geometry for the page with bleed");
  result.checks.pageSetPdfExport = true;
  result.pdf = { bytes: pdf.length, sha256: hash(pdf), summary: pdfSummary };

  // --- a refused export: the set changed into a loop after it opened ---------
  writeSet("deck", [...deck, { set: "deck" }]);
  await setName("deck-loop");
  await page.click("#export-confirm");
  await page.waitFor(`document.querySelector("#export-error")`, "the refusal in the dialog", 30000);
  const refusal = await page.evaluate(`({ code: document.querySelector("#export-error").dataset.errorCode, text: document.querySelector("#export-error").textContent, download: !document.querySelector("#export-download").hidden })`);
  assert.deepEqual(refusal, { code: "pageSetLoop", text: "Page set deck contains itself: deck → deck.", download: false });
  assert.equal(existsSync(join(workspace, "projects", "cover", "exports", "deck-loop.pdf")), false, "a refused export writes no file");
  writeSet("deck", deck);
  result.checks.refusedExportIsReadable = true;
  result.refusal = refusal;

  // --- a JPEG at a chosen quality --------------------------------------------
  await page.click('#export-formats [data-format="jpeg"]');
  await page.evaluate(`(() => {
    const input = document.querySelector("#export-quality");
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "55");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await page.waitFor(`document.querySelector("#export-quality").value === "55"`, "quality 55");
  await page.click('#export-options [data-resolution="original"]');
  await setName("cover-q55");
  await page.click("#export-confirm");
  await page.waitFor(`!document.querySelector("#export-download").hidden`, "the JPEG download", 30000);
  assert.equal(await page.evaluate(`document.querySelector("#export-download").download`), "cover-q55.jpg");
  const jpeg = readFileSync(join(workspace, "projects", "cover", "exports", "cover-q55.jpg"));
  assert.deepEqual([...jpeg.subarray(0, 3)], [0xff, 0xd8, 0xff], "a JPEG file");
  // The same request without the interface gives the same bytes.
  const direct = await fetch(`${base}/api/projects/cover/export`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "cover-q55-direct", scale: 1, format: "jpeg", quality: 55 }),
  });
  assert.ok(direct.ok, `direct JPEG export: ${await direct.text()}`);
  assert.equal(hash(readFileSync(join(workspace, "projects", "cover", "exports", "cover-q55-direct.jpg"))), hash(jpeg), "the dialog sent quality 55 at scale 1");
  result.checks.jpegQuality = true;
  await page.click("#export-cancel");

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
  try { await browser?.close(); } finally { if (server) await stopServer(); }
}
console.log(JSON.stringify(result));
