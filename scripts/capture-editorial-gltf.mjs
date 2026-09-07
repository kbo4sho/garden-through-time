// Optional browser harness; pass PLAYWRIGHT_MODULE when using a bundled runtime.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const baseURL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4178';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[], records=[];
const context=await browser.newContext({deviceScaleFactor:1,reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const templates={3:'balanced-year-3',5:'layered-seasons-5',7:'living-framework-7'};
for(const [device,viewport] of Object.entries({phone:{width:390,height:844},desktop:{width:1440,height:900},tablet:{width:834,height:1194}})) {
 await page.setViewportSize(viewport);
 for(const size of [3,5,7]) for(const day of [15,135,200,290]) {
  if(device==='tablet'&&(size!==5||day!==135))continue;
  const requests=[];const track=r=>requests.push(r.url());page.on('request',track);
  const start=Date.now();
  await page.goto(`${baseURL}/?renderer=gltf&template=${templates[size]}&day=${day}&from=Kevin`,{waitUntil:'networkidle'});
  await page.locator('.is-primary.is-ready').waitFor();await page.waitForTimeout(300);
  const path=`docs/evidence/editorial-gltf/${device}-${size}-${day}.png`;
  await page.screenshot({path,animations:'disabled'});
  const record={device,size,day,path,elapsedMs:Date.now()-start,canvases:await page.locator('canvas').count(),models:requests.filter(u=>u.endsWith('.glb')).map(u=>u.split('/').pop()),photoRequests:requests.filter(u=>/textures\/.*webp/.test(u))};records.push(record);console.log(JSON.stringify(record));page.off('request',track);
 }
}
await writeFile('docs/evidence/editorial-gltf/captures.json',JSON.stringify({browser:await browser.version(),emulation:'Desktop Chrome with CSS viewport emulation; reduced motion; local production build. Elapsed time includes network idle and screenshot, not a device performance claim.',records,errors},null,2)+'\n');
await browser.close();if(errors.length)throw Error(JSON.stringify(errors));
