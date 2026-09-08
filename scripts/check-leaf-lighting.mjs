// Actual delivery-organ shader test; run against the Vite development server.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const {default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
const base=process.env.DEV_URL??'http://127.0.0.1:4176';
const output=process.env.EVIDENCE_DIR??'tmp/leaf-lighting/current';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:512,height:512}}),errors=[],results={};
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+(process.env.STUDY_PATH??'/authoring/leaf-lighting.html'));
 await page.waitForFunction(()=>window.probe?.ready);
 for(const mode of ['dark','back-half','back','back-blocked','studio']){
  await page.evaluate(m=>window.probe.render(m),mode);
  const png=await page.screenshot();await writeFile(`${output}/${mode}.png`,png);
  const rgb=await sharp(png).removeAlpha().raw().toBuffer();
  results[mode]={mean:rgb.reduce((a,b)=>a+b,0)/rgb.length,max:rgb.reduce((a,b)=>Math.max(a,b),0)};
 }
 await writeFile(`${output}/results.json`,JSON.stringify({results,errors},null,2)+'\n');
 console.log(JSON.stringify({results,errors},null,2));
 assert.deepEqual(errors,[]);
 assert.equal(results.dark.max,0,'Unlit tissue must not emit a fixed backface glow');
 assert(results.back.mean>results['back-half'].mean*1.15,'Backlighting must track incident intensity');
 assert(results['back-blocked'].mean<results.back.mean*.15,'Opaque occlusion must suppress transmitted light');
 assert(results.studio.mean>0,'Studio tissue must be visible');
} finally {await browser.close();}
