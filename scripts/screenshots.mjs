// Captures 1280x800 store screenshots with the built extension (dist/) on locally saved marketplace pages.
// Pages in tests/fixtures/live/ (gitignored) are served at fiverr.com URLs via request interception.
// No live traffic: page scripts are blocked, stylesheets come from a local cache, images are replaced with a
// placeholder, and seller names/usernames are swapped for "Seller A", "Seller B", … before capture.
import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
const LIVE = 'tests/fixtures/live/';
const ext = path.resolve('dist');
const shots = [
  { url: 'https://www.fiverr.com/search/gigs?query=logo%20design', file: 'search.html', out: '1-search.png', prep: async (p) => { for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 500); await p.waitForTimeout(600); } await p.waitForFunction(() => document.querySelectorAll('.giglens-badges .q').length >= 6, null, { timeout: 20000 }); await p.locator('#giglens-bar button', { hasText: 'Queue' }).click(); await p.waitForTimeout(300); await p.evaluate(() => { const bar = document.getElementById('giglens-bar'); scrollTo(0, bar.getBoundingClientRect().top + scrollY - 12); }); } },
  { url: 'https://www.fiverr.com/sample_seller/sample-logo-gig', file: 'gig.html', out: '2-gig.png' },
  { url: 'https://www.fiverr.com/sample_seller?source=gig_page', file: 'seller.html', out: '3-seller.png' },
];
const placeholder = readFileSync(LIVE + 'cache/placeholder.png');
const ctx = await chromium.launchPersistentContext(mkdtempSync(path.join(tmpdir(), 'gl-')), {
  channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
let current = shots[0];
await ctx.route('**/*', (r) => {
  const req = r.request(); const u = req.url();
  if ((req.resourceType() === 'fetch' || req.resourceType() === 'xhr') && u.startsWith('https://www.fiverr.com/')) {
    const f = `${LIVE}gigs/${new URL(u).pathname.replace(/\//g, '_')}.html`;
    return existsSync(f) ? r.fulfill({ contentType: 'text/html', body: readFileSync(f, 'utf8') }) : r.fulfill({ status: 404, body: '' });
  }
  if (req.resourceType() === 'document' && u.startsWith('https://www.fiverr.com/')) return r.fulfill({ contentType: 'text/html', body: readFileSync(LIVE + current.file, 'utf8') });
  if (req.resourceType() === 'stylesheet') { const f = `${LIVE}cache/${createHash('md5').update(u).digest('hex').slice(0, 16)}.css`; return existsSync(f) ? r.fulfill({ contentType: 'text/css', body: readFileSync(f) }) : r.abort(); }
  if (req.resourceType() === 'image') return r.fulfill({ contentType: 'image/png', body: placeholder });
  if (u.startsWith('chrome-extension://')) return r.continue();
  return r.abort();
});
const ANON = () => {
    const sr = document.getElementById('giglens-bar')?.shadowRoot; if (sr && !sr.getElementById('anon-css')) { const st = document.createElement('style'); st.id = 'anon-css'; st.textContent = '.modal .muted{filter:blur(4px)}'; sr.appendChild(st); }
    // Collect real names from page state and replace them everywhere visible.
    const st = JSON.parse(document.getElementById('perseus-initial-props')?.textContent ?? '{}');
    const names = new Set();
    const KEYS = /^(seller_name|seller_display_name|username|displayName|fullName|seller_username|sellerName)$/;
    (function walk(o, parent) { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) {
      const isName = KEYS.test(k) || (k === 'name' && /^(user|seller)$/.test(parent ?? ''));
      if (typeof v === 'string' && isName && v.length >= 2 && v.length < 40) { names.add(v); v.split(/\s+/).forEach((part) => part.length >= 3 && names.add(part)); } else walk(v, k); } })(st);
    for (const sel of ['figure[title]']) document.querySelectorAll(sel).forEach((e) => e.getAttribute('title') && names.add(e.getAttribute('title')));
    const COMMON = /^(seller|logo|logos|design|designs|designer|brand|branding|studio|graphic|graphics|creative|art|pro|official|the)$/i;
    const list = [...names].filter((n) => /[a-z]/i.test(n) && !COMMON.test(n)).sort((a, b) => b.length - a.length);
    const alias = new Map(list.map((n, i) => [n, `Seller ${String.fromCharCode(65 + (i % 26))}`]));
    const re = list.length ? new RegExp('(?<![\\w])(' + list.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\w])', 'g') : null;
    const fix = (t) => (re ? t.replace(re, (m) => alias.get(m)) : t);
    const roots = [document.body, document.getElementById('giglens-root')?.shadowRoot, document.getElementById('giglens-bar')?.shadowRoot].filter(Boolean);
    for (const root of roots) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) n.nodeValue = fix(n.nodeValue); }
    document.querySelectorAll('[title],[alt]').forEach((e) => { for (const a of ['title', 'alt']) if (e.hasAttribute(a)) e.setAttribute(a, fix(e.getAttribute(a))); });
    document.querySelectorAll('figcaption').forEach((e) => (e.textContent = 'S'));
    // Avatars: hide photos, keep a neutral initial circle; blur everything image-like.
    document.querySelectorAll('figure img, img[alt=""], [class*="avatar"] img').forEach((i) => (i.style.visibility = 'hidden'));
    const st2 = document.createElement('style'); st2.textContent = 'img{filter:blur(6px)} video,iframe{display:none!important}'; document.head.appendChild(st2);
  };
const page = await ctx.newPage();
for (const s of shots) {
  current = s;
  await page.goto(s.url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#giglens-root, #giglens-bar', { state: 'attached', timeout: 15000 });
  await page.evaluate(ANON);

  if (s.prep) await s.prep(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `store/screenshots/${s.out}` });
  console.log('saved', s.out);
  if (s.out === '2-gig.png') { await page.evaluate(() => { const g = document.getElementById('giglens-root').shadowRoot.querySelector('.gl'); g.scrollTop = g.scrollHeight; }); await page.waitForTimeout(300); await page.screenshot({ path: 'store/screenshots/9-review-analyzer.png' }); console.log('saved 9-review-analyzer.png'); }
  if (s.out === '1-search.png') {
    await page.evaluate(() => { const c = document.querySelector('.giglens-badges .q').closest('.giglens-card'); c.querySelector('details').open = true; const card = c.closest('.gig-card-layout') ?? c; scrollTo(0, card.getBoundingClientRect().top + scrollY - 16); });
    await page.waitForTimeout(300); await page.screenshot({ path: 'store/screenshots/4-card-details.png' }); console.log('saved 4-card-details.png');
    await page.locator('#giglens-bar button[title="Settings"]').click();
    const sel = page.locator('#giglens-bar .set select'); await sel.nth(0).selectOption('dark'); await sel.nth(1).selectOption('bn'); await page.waitForTimeout(300);
    await page.evaluate(() => { const bar = document.getElementById('giglens-bar'); scrollTo(0, bar.getBoundingClientRect().top + scrollY - 12); });
    await page.waitForTimeout(300); await page.screenshot({ path: 'store/screenshots/5-dark-bengali.png' }); console.log('saved 5-dark-bengali.png');
    const sel2 = page.locator('#giglens-bar .set select'); await sel2.nth(0).selectOption('light'); await sel2.nth(1).selectOption('en'); await page.waitForTimeout(300);
    await page.locator('#giglens-bar button[title="Settings"]').click();
    // Pin 3 and watch 3 gigs that have details loaded.
    const withQ = page.locator('.giglens-card:has(.q)');
    for (let i = 0; i < 3; i++) { await withQ.nth(i).locator('.giglens-actions button').nth(0).click(); await withQ.nth(i).locator('.giglens-actions button').nth(1).click(); await page.waitForTimeout(250); }
    // Demo history for the watchlist chart (simulated earlier days; today's value is real).
    const sw = ctx.serviceWorkers()[0] ?? await ctx.waitForEvent('serviceworker');
    await sw.evaluate(async () => { const { watch } = await chrome.storage.local.get('watch'); for (const w of Object.values(watch)) { const last = w.snaps.at(-1); if (!last) continue; const base = Date.parse(last.d); const hist = []; for (let i = 13; i >= 1; i--) { const f = 1 - i * 0.03 + ((i * 7) % 5) * 0.01; hist.push({ ...last, d: new Date(base - i * 864e5).toISOString().slice(0, 10), queue: last.queue == null ? null : Math.max(0, Math.round(last.queue * f)), reviews: last.reviews == null ? null : Math.round(last.reviews - i * 3) }); } w.snaps = [...hist, last]; } await chrome.storage.local.set({ watch }); });
    await page.evaluate(() => { const bar = document.getElementById('giglens-bar'); scrollTo(0, bar.getBoundingClientRect().top + scrollY - 12); });
    await page.locator('#giglens-bar button', { hasText: 'Compare' }).click(); await page.waitForTimeout(400);
    await page.evaluate(ANON); await page.screenshot({ path: 'store/screenshots/6-compare.png' }); console.log('saved 6-compare.png');
    await page.locator('#giglens-bar .modal button', { hasText: 'Close' }).click();
    await page.locator('#giglens-bar button', { hasText: 'Watchlist' }).click(); await page.waitForTimeout(400);
    await page.evaluate(ANON); await page.screenshot({ path: 'store/screenshots/7-watchlist.png' }); console.log('saved 7-watchlist.png');
    await page.locator('#giglens-bar .modal button', { hasText: 'Close' }).click();
    await page.locator('#giglens-bar button', { hasText: 'helper' }).click();
    await page.locator('#giglens-bar .helper input').nth(0).fill('I will design a modern minimalist logo for your business');
    await page.locator('#giglens-bar .helper input').nth(1).fill('logo, minimalist logo, logo design');
    await page.waitForTimeout(300); await page.evaluate(ANON); await page.screenshot({ path: 'store/screenshots/8-helper.png' }); console.log('saved 8-helper.png');
    await page.locator('#giglens-bar button', { hasText: 'helper' }).click();
  }
}
await ctx.close();
