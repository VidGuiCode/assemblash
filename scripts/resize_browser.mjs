// Targeted native acceptance for modifier resizing against the embedded Rust server.
import assert from "node:assert/strict";
import {spawn,spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {createServer} from "node:net";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {startBrowser} from "../ui/browser-harness.mjs";

const options=Object.fromEntries(process.argv.slice(2).reduce((all,value,index,args)=>{if(value.startsWith("--"))all.push([value.slice(2),args[index+1]]);return all;},[]));
for(const key of ["binary","workspace","output"])assert.ok(options[key],`Require --${key}`);
const binary=resolve(options.binary),workspace=resolve(options.workspace),output=resolve(options.output);
const repo=resolve(dirname(fileURLToPath(import.meta.url)),"..");
assert.ok(!existsSync(join(workspace,"projects")),"Use a fresh workspace");
mkdirSync(dirname(output),{recursive:true});
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const env={...process.env};for(const key of ["ASSEMBLASH_WORKSPACE","ASSEMBLASH_FONT_STORE","ASSEMBLASH_BIND","ASSEMBLASH_TOKEN"])delete env[key];
function cli(...args){const r=spawnSync(binary,args,{env,encoding:"utf8",windowsHide:true,timeout:30000});assert.equal(r.status,0,r.stderr??String(r.error));return r.stdout.trim();}
const binaryVersion=cli("--version");assert.equal(binaryVersion,"assemblash 1.12.0");
cli("workspace","--workspace",workspace);
writeFileSync(join(workspace,"config.toml"),"port = 8787\nopen-browser = false\nbind = '127.0.0.1'\n");
for(const font of ["NotoSans-Subset.ttf","NotoSans-Bold-Subset.ttf"])cli("font","add",join(repo,"crates/assemblash-renderer/tests/fonts",font),"--license","OFL-1.1","--font-store",join(workspace,"fonts"));
const project=join(workspace,"projects/resize");
cli("new",project,"--width","800","--height","600","--background","#ffffff");
const textId=cli("add-text",project,"--text","Glyph","--font","Noto Sans","--size","32","--x","200","--y","100","--width","200","--height","80");
const shapeId="layer_01M5M9X4WJZGZNSNMBKHM21MFR",imageId="layer_01M5M9X4WJZGZNSNMBKHM21MFS",zeroId="layer_01M5M9X4WJZGZNSNMBKHM21MFT",groupId="layer_01M5M9X4WJZGZNSNMBKHM21MFV",childId="layer_01M5M9X4WJZGZNSNMBKHM21MFW",lockedId="layer_01M5M9X4WJZGZNSNMBKHM21MFX";
const assetId="asset_01M5M9X4WJZGZNSNMBKHM21MFY";
const document=JSON.parse(readFileSync(join(project,"document.json"),"utf8"));
const png=readFileSync(join(repo,"crates/assemblash-renderer/examples/fixtures/gradient-background.png"));
mkdirSync(join(project,"assets"),{recursive:true});copyFileSync(join(repo,"crates/assemblash-renderer/examples/fixtures/gradient-background.png"),join(project,"assets/fixture.png"));
document.assets=[{id:assetId,path:"fixture.png",hash:"sha256:"+hash(png),mediaType:"image/png"}];
const common={visible:true,locked:false,protected:false,readOnly:false,opacity:1,effects:[]};
const shape={...common,id:shapeId,name:"Shape",type:"shape",shape:{kind:"rect",cornerRadius:0},fill:"#336699",transform:{x:460,y:100,width:100,height:80,rotation:0}};
const text=document.layers[0];text.name="Glyph text";text.color="#9933aa";text.runs=[{text:"Gly",future:{keep:[1,2]}},{text:"ph",fontWeight:700,fontSize:24}];
const rawRuns=structuredClone(text.runs);
document.layers=[{...common,id:imageId,name:"Image",type:"image",asset:assetId,fit:"fill",transform:{x:80,y:100,width:80,height:80,rotation:0}},text,shape,
 {...shape,id:zeroId,name:"Zero",visible:false,transform:{x:30,y:30,width:0,height:.5,rotation:0}},
 {...common,id:groupId,name:"Flipped parent",type:"group",visible:false,transform:{x:400,y:400,width:200,height:140,rotation:0,flipHorizontal:true},children:[{...shape,id:childId,name:"Child",transform:{x:20,y:35,width:70,height:30,rotation:0}}]},
 {...shape,id:lockedId,name:"Locked",visible:false,locked:true}];
writeFileSync(join(project,"document.json"),JSON.stringify(document,null,2));
cli("set",project,"--layer",textId,"--color","#9933aa");
const probe=createServer();await new Promise(r=>probe.listen(0,"127.0.0.1",r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const server=spawn(binary,["serve","--workspace",workspace,"--port",String(port),"--friendly"],{env,stdio:"ignore",windowsHide:true});
const base=`http://127.0.0.1:${port}`;
const result={check:"modifierResize",ok:false,binaryVersion,binarySha256:hash(readFileSync(binary)),serverPid:server.pid,checks:{}};
let browser;
async function until(fn,name){const end=Date.now()+30000;while(Date.now()<end){if(await fn())return;await new Promise(r=>setTimeout(r,30));}throw Error(`Timeout: ${name}`);}
async function request(path,payload){const r=await fetch(base+path,payload===undefined?{}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const value=await r.json();assert.ok(r.ok,JSON.stringify(value));return value;}
const doc=()=>request("/api/projects/resize/document");
try{
 await until(async()=>{try{return(await fetch(base+"/api/version")).ok;}catch{return false;}},"server");
 browser=await startBrowser(base);assert.ok(browser);result.browserPid=browser.child.pid;
 const {page}=browser;
 await page.send("Emulation.setDeviceMetricsOverride",{width:1800,height:1100,deviceScaleFactor:1,mobile:false});
 const settle=()=>page.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
 async function hit(selector){await page.waitFor(`document.querySelector(${JSON.stringify(selector)})`,"native target");await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',inline:'center'})`);await settle();const p=await page.evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),r=n.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:n.contains(document.elementFromPoint(x,y))};})()`);assert.ok(p.hit,selector);return p;}
 async function click(selector,modifiers=0){const p=await hit(selector);for(const type of ["mouseMoved","mousePressed","mouseReleased"])await page.send("Input.dispatchMouseEvent",{type,x:p.x,y:p.y,button:"left",buttons:type==="mouseReleased"?0:1,clickCount:1,modifiers});}
 async function open(){await click("#project-picker-toggle");await click('[data-project-id="resize"]');await page.waitFor("document.querySelector('#canvas-image').naturalWidth>0","preview");await click("#zoom-100");await page.waitFor("document.querySelector('#canvas-image').naturalWidth===800","natural preview");}
 async function select(ids){await click("#layers-tab");for(let index=0;index<ids.length;index++){const id=ids[index];if(id===childId&&!await page.evaluate(`!!document.querySelector('.layer[data-id="${id}"]')`))await click(`[data-layer-toggle="${groupId}"]`);await click(`.layer[data-id="${id}"]`,index?2:0);}await click("#properties-tab");}
 async function key(name,down,modifiers){await page.send("Input.dispatchKeyEvent",{type:down?"keyDown":"keyUp",key:name,code:name==="Escape"?"Escape":`${name}Left`,windowsVirtualKeyCode:name==="Shift"?16:name==="Alt"?18:27,modifiers});await settle();}
 let pointer;
 async function begin(handle,modifiers=0){pointer=await hit(`[data-resize-handle="${handle}"]`);await page.send("Input.dispatchMouseEvent",{type:"mousePressed",x:pointer.x,y:pointer.y,button:"left",buttons:1,clickCount:1,modifiers});}
 async function move(dx,dy,modifiers=0){pointer={x:pointer.x+dx,y:pointer.y+dy};await page.send("Input.dispatchMouseEvent",{type:"mouseMoved",...pointer,button:"left",buttons:1,modifiers});await settle();}
 async function end(modifiers=0){await page.send("Input.dispatchMouseEvent",{type:"mouseReleased",x:pointer.x,y:pointer.y,button:"left",buttons:0,clickCount:1,modifiers});}
 async function capture(name,region){const box=await page.evaluate("(()=>{const r=document.querySelector('#canvas').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()");const shot=await page.send("Page.captureScreenshot",{format:"png",clip:{...box,scale:1}});writeFileSync(join(dirname(output),name+".png"),Buffer.from(shot.data,"base64"));if(!region)return;
  return page.evaluate(`fetch('data:image/png;base64,${shot.data}').then(r=>r.blob()).then(createImageBitmap).then(image=>{const c=new OffscreenCanvas(image.width,image.height),ctx=c.getContext('2d');ctx.drawImage(image,0,0);const p=ctx.getImageData(0,0,image.width,image.height).data,points=[];const r=${JSON.stringify(region)};for(let y=r.y;y<r.y+r.height;y++)for(let x=r.x;x<r.x+r.width;x++){const i=(y*image.width+x)*4;if(p[i]>140&&p[i]<165&&p[i+1]>40&&p[i+1]<65&&p[i+2]>160&&p[i+2]<180)points.push([x,y]);}const left=Math.min(...points.map(p=>p[0])),top=Math.min(...points.map(p=>p[1]));return {left,top,core:points.map(p=>[p[0]-left,p[1]-top])};})`);
 }
 await open();await select([imageId,textId,shapeId]);
 const before=readFileSync(join(project,"document.json"));const historyBefore=await request("/api/projects/resize/history");
 const glyphBefore=await capture("before",{x:200,y:100,width:200,height:80});assert.ok(glyphBefore.core.length>50);
 await begin("se");await move(240,-20);await key("Shift",true,8);
 await page.waitFor("document.querySelector('#canvas').dataset.resizePreview==='handles-only'","text selection keeps authoritative pixels");
 const glyphAfter=await capture("ratio-preview",{x:200,y:100,width:200,height:80});
 assert.deepEqual(glyphAfter,glyphBefore,"text fallback changes authoritative glyph pixels");
 const src=await page.evaluate("document.querySelector('#canvas-image').src");
 await key("Alt",true,9);await page.waitFor("document.querySelector('#canvas').dataset.resizePreview==='handles-only'","non-composable fallback");
 assert.equal(await page.evaluate("document.querySelectorAll('.drag-preview-image').length"),0);assert.equal(await page.evaluate("document.querySelector('#canvas-image').src"),src);
 const fallback=await capture("fallback",{x:200,y:100,width:200,height:80});assert.deepEqual(fallback,glyphBefore);
 await key("Alt",false,8);await page.waitFor("document.querySelector('#canvas').dataset.resizePreview==='handles-only'","text fallback remains active");
 await end(8);await key("Shift",false,0);
 await until(async()=>{const d=await doc();return d.layers.find(l=>l.id===textId).transform.width===300;},"resize commit");
 const after=await doc();assert.equal(after.layers.find(l=>l.id===textId).fontSize,32);assert.deepEqual(after.layers.find(l=>l.id===textId).runs,rawRuns);
 assert.deepEqual(after.layers.find(l=>l.id===shapeId).transform,{x:650,y:100,width:150,height:120,rotation:0});
 const historyAfter=await request("/api/projects/resize/history");assert.equal(historyAfter.position,historyBefore.position+1);
 const committed=readFileSync(join(project,"document.json"));await click("#undo");await until(()=>readFileSync(join(project,"document.json")).equals(before),"one undo");await page.waitFor("!document.querySelector('#redo').disabled","redo ready");await click("#redo");await until(()=>readFileSync(join(project,"document.json")).equals(committed),"redo");
 result.checks.stationaryMixedGlyphsHistoryAndFallback=true;
 await select([shapeId]);const cancelBefore=readFileSync(join(project,"document.json"));await begin("e");await move(25,0);await key("Escape",true,0);await end();assert.deepEqual(readFileSync(join(project,"document.json")),cancelBefore);result.checks.escape=true;
 await select([textId]);await page.evaluate("(()=>{const original=window.fetch;window.releaseResizeHeight=null;window.fetch=async(...args)=>{const response=await original(...args);if(String(args[0]).includes('/text-layout?')){window.fetch=original;await new Promise(resolve=>window.releaseResizeHeight=resolve);}return response;};})()");
 await begin("e");await move(75,0);await page.waitFor("!!window.releaseResizeHeight","held real height");await key("Shift",true,8);await page.evaluate("window.releaseResizeHeight()");await settle();await end(8);await key("Shift",false,0);
 await until(async()=>{const t=(await doc()).layers.find(l=>l.id===textId);return t.transform.width===375&&t.transform.height===150;},"ratio ignores stale free height");result.checks.staleHeight=true;
 const textBefore=(await doc()).layers.find(l=>l.id===textId).transform;
 const measured=await request(`/api/projects/resize/text-layout?id=${textId}&width=475`);
 await key("Alt",true,1);await begin("e",1);await move(50,0,1);await end(1);await key("Alt",false,0);
 await until(async()=>{const t=(await doc()).layers.find(l=>l.id===textId);return t.transform.width===475&&t.transform.height===Math.ceil(measured.height);},"Alt free text automatic height");
 const textAfter=(await doc()).layers.find(l=>l.id===textId).transform;
 assert.equal(textAfter.x+textAfter.width/2,textBefore.x+textBefore.width/2);assert.equal(textAfter.y+textAfter.height/2,textBefore.y+textBefore.height/2);result.checks.altTextCentre=true;
 await select([imageId]);await begin("se");await move(30,0);
 await page.waitFor("Math.abs(parseFloat(document.querySelector('.handle-box').style.height)*6-150)<.001","image default ratio");
 await key("Shift",true,8);await page.waitFor("Math.abs(parseFloat(document.querySelector('.handle-box').style.height)*6-120)<.001","image Shift free");await end(8);await key("Shift",false,0);
 await until(async()=>{const image=(await doc()).layers.find(l=>l.id===imageId);return image.transform.width===150&&image.transform.height===120;},"image reversed corner mode");result.checks.imageCornerReversal=true;
 await select([zeroId]);assert.equal(await page.evaluate("document.querySelectorAll('.resize-handle').length"),0);
 await select([childId]);assert.equal(await page.evaluate("document.querySelectorAll('.resize-handle').length"),0);
 await click(".position-button");await page.waitFor("document.querySelector('#position-width')&&!document.querySelector('#position-width').disabled","inspector stays usable");await click("#position-close");
 await select([shapeId,childId]);assert.equal(await page.evaluate("document.querySelectorAll('.resize-handle').length"),0);
 await select([groupId,childId]);assert.equal(await page.evaluate("document.querySelectorAll('.resize-handle').length"),0);
 await select([lockedId]);assert.equal(await page.evaluate("document.querySelectorAll('.resize-handle').length"),0);result.checks.coherentBoundariesAndGuards=true;
 await page.send("Page.reload");await page.waitFor("document.querySelector('#status')?.textContent?.toLowerCase().includes('ready')","reload ready");await open();await select([shapeId]);
 for(const locale of ["en","fr","de","pseudo"]){await page.evaluate(`import('/i18n.js').then(m=>m.setLocale('${locale}'))`);await page.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});const title=await page.evaluate("document.querySelector('[data-resize-handle]').title");assert.ok(title.length>20);result[locale]=title;}
 result.checks.reloadLocalizedHelp=true;
 result.glyphCorePixels=glyphBefore.core.length;result.glyphCoreSha256=hash(JSON.stringify(glyphBefore.core));result.ok=true;
}catch(error){result.error=String(error.stack??error);if(browser){const shot=await browser.page.send("Page.captureScreenshot",{format:"png"}).catch(()=>null);if(shot)writeFileSync(join(dirname(output),"failure.png"),Buffer.from(shot.data,"base64"));}throw error;
}finally{writeFileSync(output,JSON.stringify(result,null,2)+"\n");try{await browser?.close();}finally{try{await fetch(base+"/api/shutdown",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});}finally{server.kill();}}}
console.log(JSON.stringify(result));
