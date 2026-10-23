import assert from 'node:assert/strict';
import test from 'node:test';
import {modifierResizedBounds,resizeItemInSelection} from './.test-dist/geometry.js';
import {resizePreviewLayers,resizePreviewMatrix} from './.test-dist/resize-preview.js';

const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-9,`${a} != ${b}`);
const turn=(x,y,r)=>{const a=r*Math.PI/180;return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];};
function anchor(box,handle,r,centre){const x=centre?0:handle.includes('e')?-1:handle.includes('w')?1:0;const y=centre?0:handle.includes('s')?-1:handle.includes('n')?1:0;const [dx,dy]=turn(x*box.width/2,y*box.height/2,r);return [box.x+box.width/2+dx,box.y+box.height/2+dy];}
const start={x:35.5,y:80.25,width:128,height:64};

test('signed corner driver selects before flooring, including exact opposing ties',()=>{
 for(const [dx,dy,centre,w,h] of [[32,-16,false,160,80],[16,-16,false,96,48],[-256,8,false,2,1],[32,-16,true,192,96],[-64,32,false,64,32],[-128,64,false,2,1]]){
  const next=modifierResizedBounds(start,0,'se',dx,dy,{ratio:true,centre});
  assert.ok(next);assert.equal(next.width,w);assert.equal(next.height,h);
 }
});

test('all handles preserve the independent world anchor with rotation and centre mode',()=>{
 for(const handle of ['nw','n','ne','e','se','s','sw','w'])for(const r of [0,90,-33,17.25])for(const centre of [false,true]){
  const sx=handle.includes('w')?-1:1,sy=handle.includes('n')?-1:1;
  const delta=turn(handle.includes('w')||handle.includes('e')?sx*32:0,handle.includes('n')||handle.includes('s')?sy*16:0,r);
  const next=modifierResizedBounds(start,r,handle,...delta,{ratio:true,centre});assert.ok(next);
  close(next.width/start.width,next.height/start.height);
  const before=anchor(start,handle,r,centre),after=anchor(next,handle,r,centre);
  close(before[0],after[0]);close(before[1],after[1]);
  close(next.width,centre?192:160);close(next.height,centre?96:80);
 }
});

test('selection floors are shared and never clamp individual item geometry',()=>{
 const selection={x:0,y:0,width:200,height:100};
 const items=[{x:0,y:0,width:1,height:40},{x:140,y:20,width:20,height:2}];
 const ratio=modifierResizedBounds(selection,0,'se',-180,-80,{ratio:true,centre:false},items);
 assert.deepEqual(ratio,selection);
 const free=modifierResizedBounds(selection,0,'se',-180,-80,{ratio:false,centre:false},items);
 assert.ok(free);assert.equal(free.width,200);assert.equal(free.height,50);
 const mapped=items.map(item=>resizeItemInSelection(item,selection,free,true));
 assert.deepEqual(mapped,[{x:0,y:0,width:1,height:20},{x:140,y:10,width:20,height:1}]);
});

test('zero and positive subpixel starts retain exact no-change and finite boundaries',()=>{
 const small={x:.1,y:.2,width:.5,height:.75};
 for(const ratio of [false,true])for(const centre of [false,true]){
  assert.deepEqual(modifierResizedBounds(small,0,'se',0,0,{ratio,centre}),small);
  assert.deepEqual(modifierResizedBounds(small,0,'se',-100,-100,{ratio,centre}),small);
 }
 const zero={...small,width:0};
 assert.deepEqual(modifierResizedBounds(zero,0,'e',0,0,{ratio:true,centre:true}),zero);
 assert.equal(modifierResizedBounds(zero,0,'e',10,0,{ratio:false,centre:false}),null);
 assert.equal(modifierResizedBounds({...small,width:Number.MIN_VALUE},0,'e',100,0,{ratio:true,centre:false}),null);
 assert.equal(modifierResizedBounds(start,0,'se',Number.MAX_VALUE,Number.MAX_VALUE,{ratio:true,centre:true}),null);
});

test('stationary modifier cycles use the original geometry without accumulation',()=>{
 const baseline=modifierResizedBounds(start,-33,'se',40,10,{ratio:false,centre:false});
 for(let i=0;i<4;i++){
  for(const options of [{ratio:true,centre:false},{ratio:true,centre:true},{ratio:false,centre:true}])assert.ok(modifierResizedBounds(start,-33,'se',40,10,options));
  assert.deepEqual(modifierResizedBounds(start,-33,'se',40,10,{ratio:false,centre:false}),baseline);
 }
});

const shape=id=>({id,type:'shape',visible:true,opacity:1,transform:{x:10,y:20,width:100,height:50,rotation:0},shape:{kind:'rect',cornerRadius:0},fill:'#dd2211'});
test('preview classifier requires independent uppermost paint units and falls back conservatively',()=>{
 const a=shape('a'),b=shape('b'),c=shape('c');
 assert.deepEqual(resizePreviewLayers({layers:[a,b,c]},['b','c']).map(l=>l.id),['b','c']);
 assert.equal(resizePreviewLayers({layers:[a,b,c]},['a','c']),null);
 const text={...a,id:'text',type:'text',text:'Glyph',color:'#9933aa'};
 assert.equal(resizePreviewLayers({layers:[text]},['text']),null);
 assert.equal(resizePreviewLayers({layers:[a,text]},['a','text']),null);
 for(const extra of [{clip:{shape:'rect'}},{effects:[{kind:'blur',radius:3}]},{blendMode:'multiply'}])assert.equal(resizePreviewLayers({layers:[{...a,...extra}]},['a']),null);
 const group={...shape('g'),type:'group',opacity:.5,children:[a,b]};
 assert.equal(resizePreviewLayers({layers:[group]},['g']),null);
 assert.equal(resizePreviewLayers({layers:[group]},['g','a']),null);
 assert.equal(resizePreviewLayers({layers:[group]},['a','b']),null);
});

test('per-item affine transforms follow rotated local dimensions without shearing the item axes',()=>{
 const layer=shape('rotated');layer.transform.rotation=-33;
 const before={x:35,y:80,width:120,height:70},after={x:70,y:40,width:180,height:35};
 const m=resizePreviewMatrix(layer,before,after);assert.ok(m);
 for(const [x,y] of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){
  const p=turn(x*before.width,y*before.height,-33);p[0]+=before.x+before.width/2;p[1]+=before.y+before.height/2;
  const wanted=turn(x*after.width,y*after.height,-33);wanted[0]+=after.x+after.width/2;wanted[1]+=after.y+after.height/2;
  close(m[0]*p[0]+m[2]*p[1]+m[4],wanted[0]);close(m[1]*p[0]+m[3]*p[1]+m[5],wanted[1]);
 }
 const text={...layer,type:'text'};const translation=resizePreviewMatrix(text,before,after);
 assert.deepEqual(translation.slice(0,4),[1,0,0,1]);
});
