// Exercise paragraph spacing against the actual embedded server with local pinned fonts.
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
const id = cli("add-text", project, "--text", "Initial text", "--font", "Noto Sans", "--size", "32", "--x", "24", "--y", "24", "--width", "500", "--height", "150");
const seed = JSON.parse(readFileSync(join(project, "document.json"), "utf8"));
const original = [{ text: '\nA ', future: { keep: [1, 2] } }, { text: 'bold', fontWeight: 700, fontSize: 40, color: '#336699' }, { text: '\n\nLast\n', fontSize: 20 }];
seed.layers[0].runs = original;
seed.layers[0].text = original.map(run => run.text).join("");
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
const result = { check: "paragraphSpacingEditor", executed: true, ok: false, binarySha256: hash(readFileSync(binary)), binaryVersion: cli("--version"), uiSource: "embedded", checks: {} };
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
  const selector = "#field-properties-paragraphSpacing";
  const external=[];
  page.socket.addEventListener("message", event => { const message=JSON.parse(event.data); if(message.method==="Network.requestWillBeSent") { const url=message.params.request.url; if(/^https?:/.test(url)&&!url.startsWith(base+"/")) external.push(url); } });
  await page.send("Network.enable");
  async function open() {
    await page.click("#project-picker-toggle");
    await page.waitFor(`document.querySelector('[data-project-id="runs"]')`, "project listing");
    await page.click('[data-project-id="runs"]');
    await page.waitFor(`document.querySelector('#canvas-image')?.complete && document.querySelector('#canvas-image')?.naturalWidth > 0`, "Rust preview");
    await page.click(`.layer[data-id="${id}"]`);
    await page.waitFor(`document.querySelector('${selector}')`, "paragraph control");
  }
  async function currentView() {
    const current=await doc();
    const version=current.version;
    await page.waitFor(`Number(document.querySelector('#version').textContent.replace(/[^0-9]/g,'')) === ${version}`, "authoritative version");
    const value=String(current.layers.find(layer=>layer.id===id).paragraphSpacing??0);
    await page.waitFor(`document.querySelector('${selector}')?.value === ${JSON.stringify(value)}`,"authoritative spacing control");
  }
  async function commit(value) {
    await page.waitFor(`document.querySelector('${selector}') && !document.querySelector('${selector}').disabled`,"editable spacing control");
    await page.evaluate(`(() => { const input=document.querySelector('${selector}'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(String(value))}); input.dispatchEvent(new Event('input',{bubbles:true})); input.focus(); })()`);
    await page.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
    await page.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  }
  await open();
  for (const flag of ["protected","locked","readOnly"]) {
    await page.click(`.layer[data-id="layer_${flag}"]`);
    await page.waitFor(`document.querySelector('${selector}')?.disabled`, `${flag} guard`);
  }
  await page.click(`.layer[data-id="${id}"]`);
  await commit(9.25);
  await until(async ()=>(await text()).paragraphSpacing===9.25,"keyboard spacing update");
  await currentView();
  assert.deepEqual((await text()).runs,original);
  await page.click("#undo");
  await until(async ()=>(await text()).paragraphSpacing===undefined,"undo zero spacing");
  await currentView();
  await page.waitFor(`!document.querySelector('#redo').disabled`,"redo ready");
  await page.click("#redo");
  await until(async ()=>(await text()).paragraphSpacing===9.25,"redo spacing");
  await currentView();
  result.checks.keyboardGuardsUndoRedoRaw=true;
  const before=readFileSync(join(project,"document.json"));
  await commit(-1);
  await page.waitFor(`document.querySelector('#status').dataset.kind==='error'`,"invalid refusal");
  assert.deepEqual(readFileSync(join(project,"document.json")),before);
  await page.send("Page.reload");
  await page.waitFor(`document.querySelector('#status')?.textContent?.toLowerCase().includes('ready')`,"reload ready");
  await open();
  assert.equal(await page.evaluate(`document.querySelector('${selector}').value`),"9.25");
  // Hold the actual browser write after it captures its version. The other client commits first.
  await page.evaluate(`(() => {
    const originalFetch=window.fetch;
    window.paragraphPendingRequest=null;
    window.fetch=async (...args) => {
      if(!window.paragraphPendingRequest && String(args[0]).includes('/operations?')) {
        window.paragraphPendingRequest=JSON.parse(args[1].body);
        await new Promise(resolve=>window.resumeParagraphWrite=resolve);
        window.fetch=originalFetch;
      }
      return originalFetch(...args);
    };
  })()`);
  await commit(19.5);
  await page.waitFor(`window.paragraphPendingRequest && window.resumeParagraphWrite`,"captured concurrent write");
  result.concurrentRequest=await page.evaluate(`window.paragraphPendingRequest`);
  const current=await doc();
  assert.equal(result.concurrentRequest.expectedVersion,current.version);
  await request("/api/projects/runs/operations",{expectedVersion:current.version,operation:{op:"update",id,opacity:0.8}});
  await page.evaluate(`window.resumeParagraphWrite()`);
  await page.waitFor(`document.querySelector('#status').dataset.kind==='error'`,"concurrent edit refusal");
  assert.equal((await text()).paragraphSpacing,9.25);
  assert.equal((await text()).opacity,0.8);
  await currentView();
  await commit(0);
  await until(async ()=>(await text()).paragraphSpacing===undefined,"explicit zero reset");
  await currentView();
  await commit(12.5);
  await until(async ()=>(await text()).paragraphSpacing===12.5,"spacing retry after conflict");
  await currentView();
  assert.deepEqual((await text()).runs,original);
  result.checks.reloadInvalidConcurrentAndReset=true;
  for (const locale of ["en","fr","de","pseudo"]) {
    await page.evaluate(`import('/i18n.js').then(module=>module.setLocale('${locale}'))`);
    await page.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
    await page.evaluate(`document.querySelector('#structure-panel').classList.add('mobile-open'); document.querySelector('${selector}').scrollIntoView({block:'center'})`);
    await page.waitFor(`document.querySelector('label[for="field-properties-paragraphSpacing"]')?.textContent?.includes(${JSON.stringify({en:"Paragraph spacing",fr:"Espacement des paragraphes",de:"Absatzabstand",pseudo:"⟦"}[locale])})`,"localized spacing label");
    const geometry=await page.evaluate(`(() => { const field=document.querySelector('${selector}').closest('.field'); const box=field.getBoundingClientRect(); return {left:box.left,right:box.right,width:innerWidth,label:field.textContent}; })()`);
    assert.ok(geometry.left>=0&&geometry.right<=geometry.width+1,JSON.stringify(geometry));
    const capture=await page.send("Page.captureScreenshot",{format:"png"});
    writeFileSync(join(dirname(output),`paragraph-${locale}-narrow.png`),Buffer.from(capture.data,"base64"));
  }
  result.checks.localesNarrow=true;
  await page.evaluate(`import('/i18n.js').then(module=>module.setLocale('en'))`);
  await page.send("Emulation.setDeviceMetricsOverride",{width:1400,height:900,deviceScaleFactor:1,mobile:false});
  await page.waitFor(`document.querySelector('#canvas-image')?.complete && document.querySelector('#canvas-image')?.naturalWidth === 600`,"one-to-one preview scale");
  const exported=await request("/api/projects/runs/export",{name:"paragraph-editor",scale:1});
  const exportBytes=readFileSync(join(project,exported.path));
  let preview;
  await until(async ()=>{ preview=await page.evaluate(`fetch(document.querySelector('#canvas-image').src).then(r=>r.arrayBuffer()).then(b=>Array.from(new Uint8Array(b)))`); return hash(Buffer.from(preview))===hash(exportBytes); },"preview export parity");
  result.previewSha256=hash(exportBytes);
  writeFileSync(join(dirname(output),"paragraph-preview.png"),exportBytes);
  result.checks.previewExport=true;
  assert.equal(external.length,0);
  result.externalAssetRequests=external.length;
  result.browser=await page.send("Browser.getVersion");
  result.ok=true;
} catch(error) {
  result.error=String(error.stack??error);
  if(browser) { const capture=await browser.page.send("Page.captureScreenshot",{format:"png"}).catch(()=>null); if(capture) writeFileSync(join(dirname(output),"failure.png"),Buffer.from(capture.data,"base64")); }
  throw error;
} finally {
  writeFileSync(output,JSON.stringify(result,null,2)+"\n");
  try { await browser?.close(); } finally { try { await fetch(base+"/api/shutdown",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}); } finally {server.kill();} }
}
console.log(JSON.stringify(result));
