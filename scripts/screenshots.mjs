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
  { url: 'https://www.fiverr.com/search/gigs?query=logo%20design', file: 'search.html', out: '1-search.png', prep: async (p) => { for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 500); await p.waitForTimeout(600); } await p.waitForFunction(() => document.querySelectorAll('.giglens-badges .q').length >= 6, null, { timeout: 20000 }); await p.locator('#giglens-root select').selectOption('ordersInQueue'); await p.waitForTimeout(300); await p.evaluate(() => { const b = document.querySelector('.giglens-badges .q').parentElement; const card = b.closest('.gig-card-layout') ?? b; scrollTo(0, card.getBoundingClientRect().top + scrollY - 16); }); } },
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
const page = await ctx.newPage();
for (const s of shots) {
  current = s;
  await page.goto(s.url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#giglens-root', { state: 'attached', timeout: 15000 });
  await page.evaluate(() => {
    // Collect real names from page state and replace them everywhere visible.
    const st = JSON.parse(document.getElementById('perseus-initial-props')?.textContent ?? '{}');
    const names = new Set();
    const KEYS = /^(seller_name|seller_display_name|username|displayName|fullName|seller_username|sellerName)$/;
    (function walk(o, parent) { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) {
      const isName = KEYS.test(k) || (k === 'name' && /^(user|seller)$/.test(parent ?? ''));
      if (typeof v === 'string' && isName && v.length >= 2 && v.length < 40) { names.add(v); v.split(/\s+/).forEach((part) => part.length >= 3 && names.add(part)); } else walk(v, k); } })(st);
    for (const sel of ['figure[title]']) document.querySelectorAll(sel).forEach((e) => e.getAttribute('title') && names.add(e.getAttribute('title')));
    const COMMON = /^(logo|logos|design|designs|designer|brand|branding|studio|graphic|graphics|creative|art|pro|official|the)$/i;
    const list = [...names].filter((n) => /[a-z]/i.test(n) && !COMMON.test(n)).sort((a, b) => b.length - a.length);
    const alias = new Map(list.map((n, i) => [n, `Seller ${String.fromCharCode(65 + (i % 26))}`]));
    const re = list.length ? new RegExp('(?<![\\w])(' + list.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\w])', 'g') : null;
    const fix = (t) => (re ? t.replace(re, (m) => alias.get(m)) : t);
    const roots = [document.body, document.getElementById('giglens-root')?.shadowRoot].filter(Boolean);
    for (const root of roots) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) n.nodeValue = fix(n.nodeValue); }
    document.querySelectorAll('[title],[alt]').forEach((e) => { for (const a of ['title', 'alt']) if (e.hasAttribute(a)) e.setAttribute(a, fix(e.getAttribute(a))); });
    document.querySelectorAll('figcaption').forEach((e) => (e.textContent = 'S'));
    // Avatars: hide photos, keep a neutral initial circle; blur everything image-like.
    document.querySelectorAll('figure img, img[alt=""], [class*="avatar"] img').forEach((i) => (i.style.visibility = 'hidden'));
    const st2 = document.createElement('style'); st2.textContent = 'img{filter:blur(6px)} video,iframe{display:none!important}'; document.head.appendChild(st2);
  });
  if (s.prep) await s.prep(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `store/screenshots/${s.out}` });
  console.log('saved', s.out);
  if (s.out === '1-search.png') { await page.locator('#giglens-root button', { hasText: 'Keywords' }).click(); await page.waitForTimeout(300); await page.screenshot({ path: 'store/screenshots/4-keywords.png' }); console.log('saved 4-keywords.png'); }
}
await ctx.close();
