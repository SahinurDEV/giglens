import { useEffect, useState } from 'preact/hooks';
import { GigCard } from '../extract/types';
import { extractSearch, extractSearchDom } from '../extract/search';
import { applyView, Filter, SortKey, topKeywords, val } from '../lib/sort';
import { toCsv } from '../lib/csv';
import { compact, flag } from '../lib/format';
import { moreRows } from '../lib/cardRows';
import { EnrichQueue, pruneCache } from '../lib/enrich';
import { BADGE_CSS, BAR_CSS } from './styles';
import { render } from 'preact';
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
  host.querySelectorAll(':scope > .giglens-card').forEach((x) => x.remove());
  const wrap = document.createElement('div'); wrap.className = 'giglens-card';
  const b = document.createElement('div'); b.className = 'giglens-badges';
  const d = c.details; const q = val(c, 'ordersInQueue'); const fav = val(c, 'favorites');
  if (q != null) badge(b, `🚚 ${compact(q)} in queue`, `${q} orders in queue (running orders)`, 'q');
  if (fav != null) badge(b, `♥ ${compact(fav)}`, `${fav} times saved to favorites`, 'f');
  if (d?.completedOrders != null) badge(b, `✔ ${compact(d.completedOrders)} done`, `${d.completedOrders} orders completed by the seller`, 'o');
  if (c.price != null) badge(b, `$${c.price}`, 'Starting price');
  if (c.deliveryDays != null) badge(b, `${c.deliveryDays}d`, 'Delivery time (starting package)');
  if (c.rating != null) badge(b, `★ ${c.rating} · ${compact(c.reviews ?? 0)}`, `Gig rating ${c.rating} from ${c.reviews ?? '?'} reviews`);
  if (c.sellerLevel) badge(b, c.sellerLevel, 'Seller level');
  if (c.isPro) badge(b, 'Pro', 'Vetted Pro'); if (c.isChoice) badge(b, 'Choice', "Marketplace's Choice"); if (c.online) badge(b, '● online', 'Seller online now', 'on');
  const cc = d?.country ?? c.country; if (settings.showCountry && cc) badge(b, `${flag(cc)} ${cc}`, 'Seller country');
  if (settings.enrich && c.tried && c.details === undefined) badge(b, '…', 'Loading gig details', 'l');
  wrap.appendChild(b);
  if (settings.showTags && d?.tags.length) { const t = document.createElement('div'); t.className = 'giglens-badges giglens-tags'; d.tags.forEach((x) => badge(t, x, 'Gig tag')); wrap.appendChild(t); }
  const rows = moreRows(c);
  if (rows.length) {
    const det = document.createElement('details'); det.className = 'giglens-more';
    const sum = document.createElement('summary'); sum.textContent = 'More details'; det.appendChild(sum);
    const dl = document.createElement('dl'); rows.forEach(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); });
    det.appendChild(dl); det.addEventListener('click', (e) => e.stopPropagation()); wrap.appendChild(det);
  }
  host.appendChild(wrap);
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
  cards.forEach((c) => { const el = findEl(c, els); if (!el) return; if (!el.querySelector('.giglens-card')) renderBadges(c); if (!el.dataset.glObserved) { el.dataset.glObserved = '1'; io.observe(el); } });
  notify();
}

/* ---------- inline top bar ---------- */
const LEVELS = ['New', 'Level 1', 'Level 2', 'Top Rated'];
const SORTS: [SortKey, string][] = [['ordersInQueue', '🚚 Queue'], ['favorites', '♥ Favorites'], ['rating', '★ Rating'], ['reviews', 'Reviews'], ['price', '$ Price'], ['deliveryDays', 'Delivery'], ['completedOrders', '✔ Completed']];
interface View { key: SortKey; desc: boolean; f: Filter; }
const VIEW0: View = { key: 'none', desc: true, f: {} };

function Num({ ph, v, set, w = 62 }: { ph: string; v?: number; set: (n?: number) => void; w?: number }) {
  return <input type="number" placeholder={ph} title={ph} style={`width:${w}px`} value={v ?? ''} onInput={(e) => { const t = (e.target as HTMLInputElement).value; set(t === '' ? undefined : +t); }} />;
}

export function TopBar() {
  const [, tick] = useState(0);
  const [v, setV] = useState<View>(VIEW0); const [st, setSt] = useState(settings); const [showSet, setShowSet] = useState(false);
  useEffect(() => { const l = () => tick((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  useEffect(() => { chrome.storage?.local.get('searchView').then((r) => { const x = r?.searchView as View | undefined; if (x?.f) setV(x); }).catch(() => {}); }, []);
  const save = (n: View) => { setV(n); chrome.storage?.local.set({ searchView: n }).catch(() => {}); };
  const view = applyView(cards, v.key, v.desc, v.f);
  useEffect(() => {
    const els = cardEls(); const shown = new Set<HTMLElement>();
    view.forEach((c) => { const el = findEl(c, els); if (!el) return; const b = box(el); shown.add(b); if (v.key !== 'none') b.parentElement?.appendChild(b); b.style.display = ''; });
    els.map(box).forEach((b) => { if (!shown.has(b)) b.style.display = 'none'; });
  });
  const f = v.f; const upd = (p: Partial<Filter>) => save({ ...v, f: { ...f, ...p } });
  const sortBy = (k: SortKey) => save({ ...v, key: k, desc: v.key === k ? !v.desc : true });
  const setSetting = (p: Partial<Settings>) => { const n = { ...st, ...p }; settings = n; setSt(n); saveSettings(n); cards.forEach(renderBadges); if (p.enrich) sync(); };
  const onPage = cards.filter((c) => findEl(c)).length; const shownOnPage = view.filter((c) => findEl(c)).length;
  const fetched = cards.filter((c) => c.details).length;
  const exportCsv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCsv(view)], { type: 'text/csv' })); a.download = 'giglens-search.csv'; a.click(); };
  const kw = st.showKeywords ? topKeywords(cards, 30) : [];
  const chk = (label: string, k: 'proOnly' | 'choiceOnly' | 'onlineOnly') => <label class="chk"><input type="checkbox" checked={!!f[k]} onChange={(e) => upd({ [k]: (e.target as HTMLInputElement).checked })} />{label}</label>;
  return (<div class="bar">
    <div class="row head"><b class="brand">GigLens</b>
      <span class="lbl">Sort</span>{SORTS.map(([k, l]) => <button class={v.key === k ? 'on' : ''} title="Click again to flip high/low" onClick={() => sortBy(k)}>{l}{v.key === k ? (v.desc ? ' ↓' : ' ↑') : ''}</button>)}
      {v.key !== 'none' && <button class="ghost" onClick={() => save({ ...v, key: 'none' })}>Page order</button>}
      <span class="sp" /><span class="count">Showing <b>{shownOnPage}</b> of {onPage}</span>
      <button onClick={exportCsv}>CSV</button><button class="ghost" title="Settings" onClick={() => setShowSet(!showSet)}>⚙</button></div>
    <div class="row">
      <span class="lbl">Price</span><Num ph="min $" v={f.priceMin} set={(n) => upd({ priceMin: n })} /><Num ph="max $" v={f.priceMax} set={(n) => upd({ priceMax: n })} />
      <span class="lbl">Rating ≥</span><Num ph="4.8" v={f.ratingMin} set={(n) => upd({ ratingMin: n })} w={50} />
      <span class="lbl">Reviews ≥</span><Num ph="0" v={f.reviewsMin} set={(n) => upd({ reviewsMin: n })} />
      <span class="lbl">Delivery ≤</span><Num ph="days" v={f.deliveryMax} set={(n) => upd({ deliveryMax: n })} w={50} />
      <span class="lbl">Queue</span><Num ph="min" v={f.queueMin} set={(n) => upd({ queueMin: n })} w={50} /><Num ph="max" v={f.queueMax} set={(n) => upd({ queueMax: n })} w={50} />
      <select value={f.levels?.[0] ?? ''} onChange={(e) => { const x = (e.target as HTMLSelectElement).value; upd({ levels: x ? [x] : [] }); }}><option value="">Any level</option>{LEVELS.map((l) => <option value={l}>{l}</option>)}</select>
      {chk('Pro', 'proOnly')}{chk('Choice', 'choiceOnly')}{chk('Online', 'onlineOnly')}
      <button class="ghost" onClick={() => save(VIEW0)}>Reset</button></div>
    {showSet && <div class="row set">
      {([['enrich', 'Load gig details for visible cards (2 at a time, cached 6 h)'], ['showCountry', 'Country'], ['showTags', 'Tags on cards'], ['showKeywords', 'Top keywords']] as [keyof Settings, string][]).map(([k, l]) =>
        <label class="chk"><input type="checkbox" checked={st[k]} onChange={(e) => setSetting({ [k]: (e.target as HTMLInputElement).checked })} />{l}</label>)}
      <small>{st.enrich ? `Details loaded for ${fetched} gigs` : 'Gig details off: queue, favorites and tags unavailable'}</small></div>}
    {st.showKeywords && <div class="row kw"><span class="lbl">Top focus keywords</span>{kw.length ? kw.map((k) => <span class="tag" title={`${k.count} of ${fetched} loaded gigs`}>{k.tag} <b>{k.count}</b></span>) : <small>Collected from gig tags as cards load…</small>}</div>}
  </div>);
}

function mountBar() {
  document.getElementById('giglens-bar')?.remove();
  const host = document.createElement('div'); host.id = 'giglens-bar'; host.style.cssText = 'display:block;margin:8px 0 16px';
  const shadow = host.attachShadow({ mode: 'open' }); const style = document.createElement('style'); style.textContent = BAR_CSS; shadow.appendChild(style);
  const mountPt = document.createElement('div'); shadow.appendChild(mountPt);
  const anchor = document.querySelector('#topbar') ?? document.querySelector('.layout-row.modalities-row, .layout-row.content-row');
  if (anchor?.id === 'topbar') anchor.after(host); else if (anchor) anchor.before(host); else document.body.prepend(host);
  render(<TopBar />, mountPt);
}

export async function runSearch() {
  settings = await loadSettings();
  queue ??= new EnrichQueue(2, 400);
  pruneCache();
  cards = extractSearch(document);
  if (!document.getElementById('giglens-badge-css')) { const s = document.createElement('style'); s.id = 'giglens-badge-css'; s.textContent = BADGE_CSS; document.head.appendChild(s); }
  sync();
  document.getElementById('giglens-root')?.remove();
  mountBar();
  let t: number | undefined;
  mo?.disconnect();
  mo = new MutationObserver((muts) => { if (muts.every((m) => (m.target as HTMLElement).closest?.('.giglens-card, #giglens-root, #giglens-bar'))) return; clearTimeout(t); t = window.setTimeout(sync, 300); });
  mo.observe(document.body, { childList: true, subtree: true });
}
