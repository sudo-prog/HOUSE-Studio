import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5180';
const routes = [
  '/', '/workflow', '/projects', '/materials', '/tools',
  '/studio', '/showcase', '/settings', '/about', '/nonexistent-xyz'
];
const MOBILE = { width: 390, height: 844 };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();

const results = [];

for (const route of routes) {
  const consoleErrors = [];
  const pageErrors = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  let status = 'NA';
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
    status = resp ? resp.status() : 'NA';
  } catch (e) {
    status = 'ERR:' + e.message.split('\n')[0];
  }

  // PIN gate: click digits 1-2-3-4-5-6 if present
  let pinGateFound = false;
  try {
    for (const d of ['1','2','3','4','5','6']) {
      const btn = page.locator(`button:has-text("${d}")`).first();
      if (await btn.count() > 0) { pinGateFound = true; await btn.click({ timeout: 1000 }).catch(()=>{}); }
    }
  } catch {}

  // wait for layout
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const de = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(0, de.scrollWidth - de.clientWidth);
    // tap targets
    const interactive = Array.from(document.querySelectorAll('a, button, [role="button"], input, select, textarea, label'));
    const small = [];
    for (const el of interactive) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (Math.min(r.width, r.height) > 0 && Math.min(r.width, r.height) < 36) {
        small.push({ tag: el.tagName.toLowerCase(), h: Math.round(r.height), w: Math.round(r.width), text: (el.textContent||'').trim().slice(0,20) });
      }
    }
    // off-screen (right of viewport)
    const offscreen = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.left > window.innerWidth + 2 && r.left < 100000) {
        offscreen.push({ tag: el.tagName.toLowerCase(), left: Math.round(r.left), w: Math.round(r.width) });
      }
    }
    // tables overflow
    const tables = Array.from(document.querySelectorAll('table'));
    const tableOverflow = [];
    for (const t of tables) {
      const r = t.getBoundingClientRect();
      if (r.right > window.innerWidth + 2) {
        tableOverflow.push({ right: Math.round(r.right), w: Math.round(r.width) });
      }
    }
    return {
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      overflowX,
      smallCount: small.length,
      smallSample: small.slice(0,15),
      offscreenCount: offscreen.length,
      offscreenSample: offscreen.slice(0,10),
      tableCount: tables.length,
      tableOverflow,
    };
  });

  results.push({ route, status, consoleErrors, pageErrors, pinGateFound, ...metrics });
  console.log(JSON.stringify({ route, status, overflowX: metrics.overflowX, consoleErrors, pageErrors, pinGateFound, smallCount: metrics.smallCount, offscreenCount: metrics.offscreenCount, tableCount: metrics.tableCount, tableOverflow: metrics.tableOverflow }, null, 0));
}

await browser.close();
// summary
const totalOverflow = results.reduce((a,r)=>a+ (r.overflowX>1?1:0),0);
console.log('\n=== SUMMARY ===');
console.log('Routes audited:', results.length);
console.log('Routes with horizontal overflow(>1px):', totalOverflow);
console.log('Routes with console errors:', results.filter(r=>r.consoleErrors.length).length);
console.log('Routes with page errors:', results.filter(r=>r.pageErrors.length).length);
console.log('PIN gate found on:', results.filter(r=>r.pinGateFound).map(r=>r.route).join(', ')||'none');
