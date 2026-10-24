// Captures 1280x800 store screenshots by loading dist/ into Chromium and serving offline fixtures
// at fiverr.com URLs via request interception (no live Fiverr traffic).
import { chromium } from 'playwright';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const ext = path.resolve('dist');
const ctx = await chromium.launchPersistentContext(mkdtempSync(path.join(tmpdir(), 'gl-')), {
  channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
const shots = [['search/gigs?query=logo', 'search-json.html', '1-search.png'], ['logoforge/design-a-modern-logo', 'gig-json.html', '2-gig.png'], ['logoforge', 'seller-json.html', '3-seller.png']];
await ctx.route('https://www.fiverr.com/**', (r) => { const u = new URL(r.request().url()); const s = shots.find(([p]) => u.pathname === '/' + p.split('?')[0]); return s ? r.fulfill({ contentType: 'text/html', body: readFileSync(`tests/fixtures/${s[1]}`, 'utf8') }) : r.abort(); });
const page = await ctx.newPage(); page.on('console', (m) => console.log('console:', m.text()));
console.log('sw', ctx.serviceWorkers().length);
for (const [p, , out] of shots) {
  await page.goto('https://www.fiverr.com/' + p);
  await page.waitForSelector('#giglens-root', { state: 'attached', timeout: 10000 });
  if (p.startsWith('search')) await page.locator('#giglens-root select').selectOption('rating');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `store/screenshots/${out}` });
  console.log('saved', out);
}
await ctx.close();
