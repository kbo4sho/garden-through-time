const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const { default: sharp } = await import(process.env.SHARP_MODULE ?? 'sharp');
const baseURL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4178';
const baselineURL = process.env.BASELINE_URL ?? 'http://127.0.0.1:4177';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[],results={};
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));
const open=async(url)=>{await page.goto(url,{waitUntil:'networkidle'});await page.locator('.is-primary.is-ready').waitFor();await page.waitForTimeout(300);};
results.photo=[];
for(const day of [15,200]){
 const shots=[];
 for(const origin of [baselineURL,baseURL]){
  const requested=[];const listener=r=>requested.push(r.url());page.on('request',listener);
  await open(`${origin}/?template=layered-seasons-5&day=${day}&from=Kevin`);
  assert.equal(await page.locator('main').getAttribute('data-renderer'),'photographic');
  assert.equal(requested.filter(u=>u.endsWith('.glb')).length,0);
  shots.push(await sharp(await page.screenshot()).raw().toBuffer());page.off('request',listener);
 }
 const changed=shots[0].reduce((n,v,i)=>n+(v!==shots[1][i]?1:0),0);
 results.photo.push({day,changedChannels:changed,channels:shots[0].length});assert.equal(changed,0,'Photo default changed vs main');
}
await page.emulateMedia({reducedMotion:'no-preference'});
await page.addInitScript(()=>{
 window.__writes=0;window.__buffers=0;window.__draws=0;
 const replace=history.replaceState.bind(history);history.replaceState=(...args)=>{window.__writes++;return replace(...args)};
 const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){window.__buffers++;return original.apply(this,args)};
 const draw=WebGL2RenderingContext.prototype.drawElements;WebGL2RenderingContext.prototype.drawElements=function(...args){window.__draws++;return draw.apply(this,args)};
});
await open(baseURL+'/?renderer=gltf&template=living-framework-7&day=15&from=Kevin');
assert.equal(await page.locator('canvas').count(),1);
await page.waitForTimeout(500);
const before=await page.evaluate(()=>({writes:window.__writes,url:location.href}));
await page.getByRole('button',{name:'Play the year',exact:true}).click();
const pacing=await page.evaluate(()=>new Promise(resolve=>{
 const timings=[];let last=performance.now(),draws=window.__draws;
 function frame(now){if(window.__draws>draws){timings.push(now-last);last=now;draws=window.__draws;}if(timings.length<150)requestAnimationFrame(frame);else resolve(timings.sort((a,b)=>a-b));}requestAnimationFrame(frame);
}));
assert.equal(await page.evaluate(()=>window.__writes),before.writes);
assert.equal(page.url(),before.url);
const advanced=Number(await page.locator('.timeline-shell').getAttribute('data-parked-day'));assert(advanced>15);
await page.getByRole('button',{name:'Pause the year',exact:true}).click();
results.play={start:15,advanced,historyWritesDuringPlay:0,canvases:1,renderIntervalP50Ms:pacing[75],renderIntervalP95Ms:pacing[142]};
const slider=page.getByRole('slider',{name:'Day of year'});
async function day(value){await slider.fill(String(value));await page.waitForTimeout(80);}
for(const d of [15,135,200,290,15])await day(d);
const buffers=await page.evaluate(()=>window.__buffers);
for(const d of [15,135,200,290,15])await day(d);
results.repeatCycleBufferUploads=await page.evaluate(()=>window.__buffers)-buffers;
assert.equal(results.repeatCycleBufferUploads,0);
await slider.focus();const old=Number(await slider.inputValue());await page.keyboard.press('ArrowRight');assert.equal(Number(await slider.inputValue()),old+1);results.keyboard=true;
await page.emulateMedia({reducedMotion:'reduce'});await open(baseURL+'/?renderer=gltf&template=living-framework-7&day=200&from=Kevin');await page.waitForTimeout(300);
const canvas=page.locator('canvas');const rect=await canvas.boundingBox();
await day(200);await page.waitForTimeout(300);
const rest=await canvas.screenshot();
await page.mouse.move(rect.x+rect.width*.45,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.85,rect.y+rect.height*.58,{steps:8});await page.waitForTimeout(200);const peek=await canvas.screenshot();assert(!rest.equals(peek));await page.mouse.up();await page.waitForTimeout(1400);const returned=await canvas.screenshot();results.peek={changesView:true,returnsToRest:rest.equals(returned)};
const a=await sharp(rest).raw().toBuffer(),b=await sharp(returned).raw().toBuffer();
results.peek.meanChannelDifference=a.reduce((sum,v,i)=>sum+Math.abs(v-b[i]),0)/a.length;
assert(results.peek.meanChannelDifference<.1);
await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');window.__loss=gl.getExtension('WEBGL_lose_context');window.__loss.loseContext()});
await page.locator('.scene-layer > .canvas-fallback').waitFor();assert(await slider.isVisible());
await page.evaluate(()=>window.__loss.restoreContext());await page.waitForTimeout(700);assert.equal(await page.locator('.scene-layer > .canvas-fallback').count(),0);results.contextLossRestore=true;
// Winterberry continues through the existing photographic fallback in a mixed bed.
const req=[];page.on('request',r=>req.push(r.url()));
await open(baseURL+'/?renderer=gltf&template=balanced-year-3&plants=winterberry,hydrangea,dogwood&day=15&from=Kevin');
results.mixed={renderer:await page.locator('main').getAttribute('data-renderer'),winterberryTextures:req.filter(u=>u.includes('winterberry')&&u.includes('webp')).length};assert(results.mixed.winterberryTextures>0);
results.errors=errors;console.log(JSON.stringify(results,null,2));await writeFile('docs/evidence/editorial-gltf/browser-checks.json',JSON.stringify(results,null,2)+'\n');await browser.close();assert.equal(errors.length,0);
