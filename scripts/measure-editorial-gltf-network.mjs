// Diagnostic cold-load measurement; this does not emulate a physical phone CPU/GPU.
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const baseURL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4179';
const output = process.env.EVIDENCE_DIR ?? 'tmp/phone-gauntlet';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const templates = {3: 'balanced-year-3', 5: 'layered-seasons-5', 7: 'living-framework-7'};
const records = [];
try {
  for (const device of ['desktop', 'phone']) for (const size of [3, 5, 7]) {
    const context = await browser.newContext({
      viewport: device === 'phone' ? {width: 390, height: 844} : {width: 1440, height: 900},
      deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block',
    });
    const page = await context.newPage();
    const errors = [], modelRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().endsWith('.glb')) modelRequests.push(request.url()); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 40, downloadThroughput: 10_000_000 / 8,
      uploadThroughput: 10_000_000 / 8, connectionType: 'wifi',
    });
    const start = Date.now();
    await page.goto(`${baseURL}/?renderer=gltf&day=200&template=${templates[size]}&from=Kevin`, {waitUntil: 'domcontentloaded'});
    await page.locator('.is-primary.is-ready').waitFor({timeout: 60000});
    const readyMs = Date.now() - start;
    const path = `${output}/network-${device}-${size}.png`;
    await page.screenshot({path, animations: 'disabled'});
    const record = {device, size, readyMs, meetsThreeSecondTarget: readyMs <= 3000,
      canvases: await page.locator('canvas').count(), modelRequests, errors, path};
    records.push(record); console.log(JSON.stringify(record));
    await context.close();
  }
  await writeFile(`${output}/network-checks.json`, JSON.stringify({
    browser: await browser.version(), downloadMbps: 10, latencyMs: 40,
    method: 'One fresh browser context per case, HTTP cache disabled, service workers blocked, no CPU throttle. Ready means the primary scene has reported two frames drawing geometry. CSS phone emulation is not physical-device certification. One trial per case; diagnostic, not a distribution.',
    records,
  }, null, 2) + '\n');
} finally {
  await browser.close();
}
