// Exercise justified alignment against the actual embedded server with local pinned fonts.
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
const original = [{ text: '  A ', future: { keep: [1, 2] } }, { text: 'bo', fontWeight: 700, color: '#336699' }, { text: 'ld C D ', fontWeight: 700, color: '#336699', future: { wordBoundary: false } }, { text: 'E F G H I J\n\nLast words\n', fontSize: 24 }];
seed.layers[0].runs = original;
seed.layers[0].text = original.map(run => run.text).join("");
seed.layers[0].transform.width=220;
seed.layers[0].transform.height=200;
seed.layers[0].paragraphSpacing=9.25;
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
const result = { check: "justificationEditor", executed: true, ok: false, binarySha256: hash(readFileSync(binary)), binaryVersion: cli("--version"), uiSource: "embedded", serverPid: server.pid, checks: {} };
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
  result.browserPid=browser.child.pid;
  result.browserProfile=browser.profile;
  const {page}=browser;
  const selector='button[data-text-align="justify"]';
  const external=[];
  page.socket.addEventListener("message",event=>{const message=JSON.parse(event.data);if(message.method==="Network.requestWillBeSent"){const url=message.params.request.url;if(/^https?:/.test(url)&&!url.startsWith(base+"/"))external.push(url);}});
  await page.send("Network.enable");
  async function click(selector) {
    await page.waitFor(`document.querySelector(${JSON.stringify(selector)})`,"native click target");
    await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',inline:'center'})`);
    await page.evaluate(`new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))`);
    await page.waitFor(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});const rect=node.getBoundingClientRect();const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);return rect.width>0&&rect.height>0&&(hit===node||node.contains(hit));})()`,"uncovered native click target");
    const point=await page.evaluate(`(()=>{const rect=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};})()`);
    await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...point});
    await page.send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...point});
    await page.send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...point});
  }
  async function select(layer) {
    await click("#layers-tab");
    await page.waitFor(`document.querySelector('#layers-view').getClientRects().length>0`,"visible Layers view");
    await click(`.layer[data-id="${layer}"]`);
    await click("#properties-tab");
  }
  async function open() {
    await click("#project-picker-toggle");
    await page.waitFor(`document.querySelector('[data-project-id="runs"]')`,"project listing");
    await click('[data-project-id="runs"]');
    await page.waitFor(`document.querySelector('#canvas-image')?.complete && document.querySelector('#canvas-image')?.naturalWidth>0`,"Rust preview");
    await select(id);
    await page.waitFor(`document.querySelector('${selector}')`,"justify control");
  }
  async function currentView() {
    const current=await doc();
    await page.waitFor(`Number(document.querySelector('#version').textContent.replace(/[^0-9]/g,''))===${current.version}`,"authoritative version");
    const align=current.layers.find(layer=>layer.id===id).align??"left";
    await page.waitFor(`document.querySelector('button[data-text-align="${align}"]')?.getAttribute('aria-pressed')==='true'`,"authoritative alignment control");
  }
  async function keyboard(align, key="Enter") {
    const target=`button[data-text-align="${align}"]`;
    await page.waitFor(`document.querySelector('${target}')&&!document.querySelector('${target}').disabled`,"editable alignment control");
    await page.evaluate(`document.querySelector('${target}').scrollIntoView({block:'center',inline:'center'})`);
    await page.evaluate(`new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))`);
    await page.evaluate(`document.querySelector('${target}').focus()`);
    assert.equal(await page.evaluate(`document.activeElement===document.querySelector('${target}')`),true,"alignment button receives focus");
    const space=key===" ";
    const event={key,code:space?"Space":"Enter",windowsVirtualKeyCode:space?32:13};
    await page.send("Input.dispatchKeyEvent",{type:"keyDown",...event,text:space?" ":"\r",unmodifiedText:space?" ":"\r"});
    if(space) assert.equal(await page.evaluate(`document.querySelector('#stage-viewport').classList.contains('pan-ready')`),false);
    await page.send("Input.dispatchKeyEvent",{type:"keyUp",...event});
    assert.equal(await page.evaluate(`!!document.querySelector('.inline-text-editor')`),false);
    assert.equal(await page.evaluate(`document.querySelector('#stage-viewport').classList.contains('pan-ready')`),false);
  }
  await open();
  for(const flag of ["protected","locked","readOnly"]){
    await select(`layer_${flag}`);
    await page.waitFor(`document.querySelector('${selector}')?.disabled`,`${flag} guard`);
  }
  await select(id);
  await keyboard("justify");
  await until(async ()=>(await text()).align==="justify","keyboard justification");
  await currentView();
  assert.deepEqual((await text()).runs,original);
  assert.equal((await text()).paragraphSpacing,9.25);
  const justified=readFileSync(join(project,"document.json"));
  await click("#undo");
  await until(async ()=>(await text()).align==="left","alignment undo");
  await currentView();
  await page.waitFor(`!document.querySelector('#redo').disabled`,"redo ready");
  await click("#redo");
  await until(async ()=>(await text()).align==="justify","alignment redo");
  await currentView();
  assert.deepEqual(readFileSync(join(project,"document.json")),justified);
  result.checks.keyboardGuardsUndoRedoRaw=true;
  result.checks.nativePointer=true;
  await click('button[data-text-align="left"] i');
  await until(async ()=>(await text()).align==="left","nested icon alignment");
  await currentView();
  await keyboard("justify"," ");
  await until(async ()=>(await text()).align==="justify","native Space justification");
  await currentView();
  assert.deepEqual((await text()).runs,original);
  result.checks.nativeIconAndSpace=true;
  await page.send("Page.reload");
  await page.waitFor(`document.querySelector('#status')?.textContent?.toLowerCase().includes('ready')`,"reload ready");
  await open();
  await currentView();
  await page.evaluate(`(() => {const originalFetch=window.fetch;window.justifyPendingRequest=null;window.fetch=async(...args)=>{if(!window.justifyPendingRequest&&String(args[0]).includes('/operations?')){window.justifyPendingRequest=JSON.parse(args[1].body);await new Promise(resolve=>window.resumeJustifyWrite=resolve);window.fetch=originalFetch;}return originalFetch(...args);};})()`);
  await keyboard("right");
  await page.waitFor(`window.justifyPendingRequest&&window.resumeJustifyWrite`,"captured concurrent write");
  result.concurrentRequest=await page.evaluate(`window.justifyPendingRequest`);
  const current=await doc();
  assert.equal(result.concurrentRequest.expectedVersion,current.version);
  await request("/api/projects/runs/operations",{expectedVersion:current.version,operation:{op:"update",id,opacity:0.8}});
  await page.evaluate(`window.resumeJustifyWrite()`);
  await page.waitFor(`document.querySelector('#status').dataset.kind==='error'`,"concurrent alignment refusal");
  assert.equal((await text()).align,"justify");
  assert.equal((await text()).opacity,0.8);
  await currentView();
  await keyboard("left");
  await until(async ()=>(await text()).align==="left","left retry");
  await currentView();
  await keyboard("justify");
  await until(async ()=>(await text()).align==="justify","justify retry");
  await currentView();
  assert.deepEqual((await text()).runs,original);
  result.checks.reloadConcurrentAndRetry=true;
  const beforeResize=readFileSync(join(project,"document.json"));
  const measured=await request(`/api/projects/runs/text-layout?id=${encodeURIComponent(id)}&width=180`);
  assert.deepEqual(Object.keys(measured).sort(),["height","lineCount"]);
  await click(".position-button");
  await page.waitFor(`document.querySelector('#position-width')&&!document.querySelector('#position-width').disabled`,"editable width control");
  await page.evaluate(`(()=>{const input=document.querySelector('#position-width');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'180');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();})()`);
  await page.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r",unmodifiedText:"\r"});
  await page.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await until(async()=>{const layer=await text();return layer.transform.width===180&&layer.transform.height===Math.ceil(measured.height);},"shared automatic text height");
  assert.deepEqual((await text()).runs,original);
  assert.equal((await text()).fontSize,32);
  await currentView();
  if(await page.evaluate(`!document.querySelector('#position-popover').hidden`))await click("#position-close");
  await click("#undo");
  await until(async()=>readFileSync(join(project,"document.json")).equals(beforeResize),"one-transaction resize undo");
  await currentView();
  result.checks.sharedAutomaticHeight=true;
  result.autoHeight=measured;

  for(const locale of ["en","fr","de","pseudo"]){
    await page.evaluate(`import('/i18n.js').then(module=>module.setLocale('${locale}'))`);
    await page.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
    if(!await page.evaluate(`document.querySelector('#structure-panel').classList.contains('mobile-open')`))await click('#dock-toggle');
    const label={en:"Justify text",fr:"Justifier le texte",de:"Text im Blocksatz",pseudo:"⟦"}[locale];
    await page.waitFor(`document.querySelector('${selector}')?.getAttribute('aria-label')?.includes(${JSON.stringify(label)})`,"localized justify control");
    await page.evaluate(`document.querySelector('${selector}').scrollIntoView({block:'center',inline:'center'})`);
    await page.waitFor(`(()=>{const element=document.querySelector('${selector}');const box=element.getBoundingClientRect();const hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);return box.width>0&&box.height>0&&(hit===element||element.contains(hit));})()`,"visible localized justify control");
    const geometry=await page.evaluate(`(()=>{const element=document.querySelector('${selector}');const box=element.getBoundingClientRect();return {left:box.left,right:box.right,height:box.height,width:innerWidth,label:element.getAttribute('aria-label'),pressed:element.getAttribute('aria-pressed')};})()`);
    assert.ok(geometry.left>=0&&geometry.right<=geometry.width+1,JSON.stringify(geometry));
    assert.equal(geometry.pressed,"true");
    result[locale]=geometry;
    const capture=await page.send("Page.captureScreenshot",{format:"png"});
    writeFileSync(join(dirname(output),`justify-${locale}-narrow.png`),Buffer.from(capture.data,"base64"));
  }
  result.checks.localesNarrow=true;
  await page.evaluate(`import('/i18n.js').then(module=>module.setLocale('en'))`);
  await page.send("Emulation.setDeviceMetricsOverride",{width:1400,height:900,deviceScaleFactor:1,mobile:false});
  await page.waitFor(`document.querySelector('#canvas-image')?.complete&&document.querySelector('#canvas-image')?.naturalWidth===600`,"one-to-one preview scale");
  const exported=await request("/api/projects/runs/export",{name:"justify-editor",scale:1});
  const exportBytes=readFileSync(join(project,exported.path));
  await until(async()=>{const preview=await page.evaluate(`fetch(document.querySelector('#canvas-image').src).then(r=>r.arrayBuffer()).then(b=>Array.from(new Uint8Array(b)))`);return hash(Buffer.from(preview))===hash(exportBytes);},"preview export parity");
  result.previewSha256=hash(exportBytes);
  writeFileSync(join(dirname(output),"justify-preview.png"),exportBytes);
  result.checks.previewExport=true;
  assert.equal(external.length,0);
  result.externalAssetRequests=external.length;
  result.browser=await page.send("Browser.getVersion");
  result.ok=true;
} catch(error) {
  result.error=String(error.stack??error);
  if(browser){const capture=await browser.page.send("Page.captureScreenshot",{format:"png"}).catch(()=>null);if(capture)writeFileSync(join(dirname(output),"failure.png"),Buffer.from(capture.data,"base64"));}
  throw error;
} finally {
  writeFileSync(output,JSON.stringify(result,null,2)+"\n");
  try{await browser?.close();}finally{try{await fetch(base+"/api/shutdown",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});}finally{server.kill();}}
}
console.log(JSON.stringify(result));
