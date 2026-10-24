import { useEffect, useState } from 'preact/hooks';
import { GigCard } from '../extract/types';
import { extractSearch, extractSearchDom } from '../extract/search';
import { applyView, Filter, SortKey, topKeywords, val } from '../lib/sort';
import { toCsv } from '../lib/csv';
import { compact, flag } from '../lib/format';
import { EnrichQueue, pruneCache } from '../lib/enrich';
import { BADGE_CSS } from './styles';
import { mountPanel } from './mount';
import { loadSettings, saveSettings, Settings } from './settings';

/* ---------- card <-> element mapping ---------- */
const cardEls = () => Array.from(document.querySelectorAll<HTMLElement>('[data-gig-id]'));
const baseId = (id: string) => id.split('_')[0];
const box = (el: HTMLElement) => (el.closest('.gig-card-layout') as HTMLElement) ?? el;
function findEl(c: GigCard, els = cardEls()) { return els.find((e) => e.dataset.gigId === c.id) ?? els.find((e) => baseId(e.dataset.gigId ?? '') === baseId(c.id)); }

/* ---------- shared state ---------- */
let cards: GigCard[] = [];
let settings: Settings;
let queue: EnrichQueue;
let mo: MutationObserver | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

function badge(parent: HTMLElement, text: string, title: string, cls = '') { const s = document.createElement('span'); s.textContent = text; s.title = title; if (cls) s.className = cls; parent.appendChild(s); }
function renderBadges(c: GigCard) {
  const el = findEl(c); if (!el) return;
  const host = el.querySelector<HTMLElement>('.basic-gig-card') ?? el;
  host.querySelector(':scope > .giglens-badges')?.remove();
  const b = document.createElement('div'); b.className = 'giglens-badges';
  const d = c.details; const q = val(c, 'ordersInQueue'); const fav = val(c, 'favorites');
  if (c.price != null) badge(b, `$${c.price}`, 'Starting price');
  if (c.deliveryDays != null) badge(b, `${c.deliveryDays}d`, 'Delivery time (cheapest package)');
  if (c.sellerLevel) badge(b, c.sellerLevel, 'Seller level');
  if (c.isPro) badge(b, 'Pro', 'Vetted Pro');
  if (c.isChoice) badge(b, 'Choice', "Marketplace's Choice");
  if (c.rating != null) badge(b, `★ ${c.rating}`, 'Gig rating');
  if (c.reviews != null) badge(b, `${compact(c.reviews)} reviews`, `${c.reviews} gig reviews`);
  if (q != null) badge(b, `🚚 ${compact(q)} in queue`, `${q} orders in queue (running orders)`, 'q');
  if (fav != null) badge(b, `♥ ${compact(fav)}`, `${fav} times saved to favorites`, 'f');
  if (d?.completedOrders != null) badge(b, `✔ ${compact(d.completedOrders)} done`, `${d.completedOrders} orders completed by the seller`);
  const cc = d?.country ?? c.country; if (settings.showCountry && cc) badge(b, `${flag(cc)} ${cc}`, 'Seller country');
  if (settings.enrich && c.tried && c.details === undefined) badge(b, '…', 'Loading gig details', 'l');
  host.appendChild(b);
  if (settings.showTags && d?.tags.length) { const t = document.createElement('div'); t.className = 'giglens-badges giglens-tags'; d.tags.forEach((x) => badge(t, x, 'Gig tag')); b.after(t); }
}

/* ---------- enrichment of visible cards only ---------- */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting || !settings.enrich) return;
  io.unobserve(e.target);
  const c = cards.find((x) => findEl(x, [e.target as HTMLElement]));
  if (!c || c.details || c.tried || !c.url) return;
  c.tried = true; queue.get(c.url).then((d) => { c.details = d; renderBadges(c); notify(); });
}), { rootMargin: '200px' });

function sync() {
  const els = cardEls();
  // Cards rendered after load (scroll, pagination) that aren't in page state: read them from the DOM.
  els.forEach((el) => { if (!cards.some((c) => findEl(c, [el]))) { const [dc] = extractSearchDom({ querySelectorAll: () => [el] } as unknown as Document); if (dc) cards.push(dc); } });
  cards.forEach((c) => { const el = findEl(c, els); if (!el) return; if (!el.querySelector('.giglens-badges')) renderBadges(c); if (!el.dataset.glObserved) { el.dataset.glObserved = '1'; io.observe(el); } });
  notify();
}

/* ---------- panel ---------- */
const LEVELS = ['New', 'Level 1', 'Level 2', 'Top Rated'];
const SORTS: [SortKey, string][] = [['none', 'Page order'], ['price', 'Price'], ['rating', 'Rating'], ['reviews', 'Reviews'], ['deliveryDays', 'Delivery'], ['ordersInQueue', 'Orders in queue'], ['favorites', 'Favorites'], ['completedOrders', 'Seller orders done'], ['sellerReviews', 'Seller reviews']];

function NumIn({ label, v, set }: { label: string; v?: number; set: (n?: number) => void }) {
  return <label class="f">{label}<input type="number" value={v ?? ''} onInput={(e) => { const t = (e.target as HTMLInputElement).value; set(t === '' ? undefined : +t); }} /></label>;
}

function Panel() {
  const [, tick] = useState(0);
  const [key, setKey] = useState<SortKey>('none'); const [desc, setDesc] = useState(true);
  const [f, setF] = useState<Filter>({}); const [open, setOpen] = useState(true); const [tab, setTab] = useState<'filter' | 'keywords' | 'settings'>('filter');
  const [st, setSt] = useState(settings);
  useEffect(() => { const l = () => tick((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  useEffect(() => { chrome.storage?.local.get('searchView').then((r) => { const v = r?.searchView as any; if (v) { setKey(v.key); setDesc(v.desc); setF(v.f ?? {}); } }).catch(() => {}); }, []);
  useEffect(() => { chrome.storage?.local.set({ searchView: { key, desc, f } }).catch(() => {}); }, [key, desc, f]);
  const view = applyView(cards, key, desc, f);
  useEffect(() => {
    const els = cardEls(); const shown = new Set<HTMLElement>();
    view.forEach((c) => { const el = findEl(c, els); if (!el) return; const b = box(el); shown.add(b); b.parentElement?.appendChild(b); b.style.display = ''; });
    els.map(box).forEach((b) => { if (!shown.has(b)) b.style.display = 'none'; });
  });
  const upd = (p: Partial<Filter>) => setF({ ...f, ...p });
  const setSetting = (p: Partial<Settings>) => { const n = { ...st, ...p }; settings = n; setSt(n); saveSettings(n); cards.forEach(renderBadges); if (p.enrich) sync(); };
  const fetched = cards.filter((c) => c.details).length;
  const exportCsv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCsv(view)], { type: 'text/csv' })); a.download = 'giglens-search.csv'; a.click(); };
  if (!open) return <button class="gl mini" onClick={() => setOpen(true)}>GigLens</button>;
  const kw = topKeywords(cards);
  return (<div class="gl">
    <h2>GigLens · {view.length}/{cards.length} gigs <button class="x" title="Minimize" onClick={() => setOpen(false)}>×</button></h2>
    <div class="tabs">{(['filter', 'keywords', 'settings'] as const).filter((t) => t !== 'keywords' || st.showKeywords).map((t) => <button class={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
    {tab === 'filter' && <>
      <div class="row">Sort <select value={key} onChange={(e) => setKey((e.target as HTMLSelectElement).value as SortKey)}>{SORTS.map(([k, l]) => <option value={k}>{l}</option>)}</select>
        <button onClick={() => setDesc(!desc)}>{desc ? '↓ high first' : '↑ low first'}</button></div>
      <div class="grid">
        <NumIn label="Price ≥ $" v={f.priceMin} set={(n) => upd({ priceMin: n })} /><NumIn label="Price ≤ $" v={f.priceMax} set={(n) => upd({ priceMax: n })} />
        <NumIn label="Rating ≥" v={f.ratingMin} set={(n) => upd({ ratingMin: n })} /><NumIn label="Reviews ≥" v={f.reviewsMin} set={(n) => upd({ reviewsMin: n })} />
        <NumIn label="Delivery ≤ days" v={f.deliveryMax} set={(n) => upd({ deliveryMax: n })} /><NumIn label="Favorites ≥" v={f.favoritesMin} set={(n) => upd({ favoritesMin: n })} />
        <NumIn label="Queue ≥" v={f.queueMin} set={(n) => upd({ queueMin: n })} /><NumIn label="Queue ≤" v={f.queueMax} set={(n) => upd({ queueMax: n })} />
      </div>
      <div class="row">{LEVELS.map((l) => <label class="chk"><input type="checkbox" checked={f.levels?.includes(l)} onChange={(e) => { const on = (e.target as HTMLInputElement).checked; const s = new Set(f.levels ?? []); on ? s.add(l) : s.delete(l); upd({ levels: [...s] }); }} />{l}</label>)}</div>
      <div class="row"><label class="chk"><input type="checkbox" checked={!!f.proOnly} onChange={(e) => upd({ proOnly: (e.target as HTMLInputElement).checked })} />Pro only</label>
        <label class="chk"><input type="checkbox" checked={!!f.choiceOnly} onChange={(e) => upd({ choiceOnly: (e.target as HTMLInputElement).checked })} />Choice only</label>
        <label class="chk"><input type="checkbox" checked={!!f.onlineOnly} onChange={(e) => upd({ onlineOnly: (e.target as HTMLInputElement).checked })} />Online</label>
        <button onClick={() => setF({})}>Clear</button></div>
      <div class="row"><button onClick={exportCsv}>Export CSV</button><small>{st.enrich ? `Details loaded for ${fetched}/${cards.length} (visible cards only)` : 'Gig details off'}</small></div>
    </>}
    {tab === 'keywords' && <div>{kw.length ? <div class="kw">{kw.map((k) => <span title={`${k.count} of ${fetched} loaded gigs use this tag`}>{k.tag} <b>{k.count}</b></span>)}</div> : <small>Scroll through results with gig details on to collect tags.</small>}</div>}
    {tab === 'settings' && <div>
      {([['enrich', 'Load gig details for visible cards (orders in queue, favorites, tags). Opens each gig page in the background, 2 at a time, cached 6 h.'], ['showCountry', 'Show seller country'], ['showTags', 'Show tags on cards'], ['showKeywords', 'Collect top keywords']] as [keyof Settings, string][]).map(([k, l]) =>
        <label class="chk block"><input type="checkbox" checked={st[k]} onChange={(e) => setSetting({ [k]: (e.target as HTMLInputElement).checked })} />{l}</label>)}
    </div>}
  </div>);
}

export async function runSearch() {
  settings = await loadSettings();
  queue ??= new EnrichQueue(2, 400);
  pruneCache();
  cards = extractSearch(document);
  if (!document.getElementById('giglens-badge-css')) { const s = document.createElement('style'); s.id = 'giglens-badge-css'; s.textContent = BADGE_CSS; document.head.appendChild(s); }
  sync();
  mountPanel(<Panel />);
  let t: number | undefined;
  mo?.disconnect();
  mo = new MutationObserver((muts) => { if (muts.every((m) => (m.target as HTMLElement).closest?.('.giglens-badges, #giglens-root'))) return; clearTimeout(t); t = window.setTimeout(sync, 300); });
  mo.observe(document.body, { childList: true, subtree: true });
}
