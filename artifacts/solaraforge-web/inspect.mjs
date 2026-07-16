import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5180';
const MOBILE = { width: 390, height: 844 };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();

async function inspect(route) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 20000 }).catch(e=>console.log('goto err',e.message));
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const offscreen = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left > window.innerWidth + 2) {
        const cs = getComputedStyle(el);
        offscreen.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), left: Math.round(r.left), w: Math.round(r.width), disp: cs.display, pos: cs.position, vis: cs.visibility });
      }
    }
    // tap target samples
    const small = [];
    for (const el of document.querySelectorAll('a, button, [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.width===0&&r.height===0) continue;
      const m = Math.min(r.width, r.height);
      if (m>0 && m<36) small.push({ tag: el.tagName.toLowerCase(), h: Math.round(r.height), w: Math.round(r.width), text:(el.textContent||'').trim().slice(0,15), cls:(el.className||'').toString().slice(0,50) });
    }
    return { offscreen: offscreen.slice(0,12), small: small.slice(0,12), innerW: window.innerWidth };
  });
  console.log('\n=== ROUTE', route, 'innerW=', data.innerW, '===');
  console.log('OFFSCREEN:', JSON.stringify(data.offscreen, null, 0));
  console.log('SMALL TAP:', JSON.stringify(data.small, null, 0));
}

for (const r of ['/', '/workflow', '/projects', '/materials', '/tools', '/studio', '/showcase', '/settings', '/about']) {
  await inspect(r);
}
await browser.close();
