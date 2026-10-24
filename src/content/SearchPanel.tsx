import { useEffect, useState } from 'preact/hooks';
import { GigCard } from '../extract/types';
import { applyView, SortKey } from '../lib/sort';
import { toCsv } from '../lib/csv';
import { BADGE_CSS } from './styles';

function cardEls(): HTMLElement[] { return Array.from(document.querySelectorAll<HTMLElement>('[data-gig-id]')); }
/** Matches by exact id (u_id like "123_0") or gig-id prefix. Cards not rendered in the DOM yet are skipped. */
function elFor(c: GigCard, _i: number, els: HTMLElement[]) { const base = c.id.split('_')[0]; return els.find((e) => e.dataset.gigId === c.id) ?? els.find((e) => e.dataset.gigId?.split('_')[0] === base); }
const box = (el: HTMLElement) => (el.closest('.gig-card-layout') as HTMLElement) ?? el;

export function decorate(cards: GigCard[]) {
  if (!document.getElementById('giglens-badge-css')) { const s = document.createElement('style'); s.id = 'giglens-badge-css'; s.textContent = BADGE_CSS; document.head.appendChild(s); }
  const els = cardEls();
  cards.forEach((c, i) => {
    const el = elFor(c, i, els); if (!el || el.querySelector('.giglens-badges')) return;
    const b = document.createElement('div'); b.className = 'giglens-badges';
    const add = (t: string) => { const s = document.createElement('span'); s.textContent = t; b.appendChild(s); };
    if (c.price != null) add(`$${c.price}`); if (c.deliveryDays != null) add(`${c.deliveryDays}d delivery`);
    if (c.sellerLevel) add(c.sellerLevel); if (c.rating != null) add(`★ ${c.rating}`); if (c.reviews != null) add(`${c.reviews} review${c.reviews === 1 ? "" : "s"}`);
    if (c.ordersInQueue != null) add(`${c.ordersInQueue} in queue`); if (c.favorites != null) add(`♥ ${c.favorites}`);
    (el.querySelector('.basic-gig-card') ?? el).appendChild(b);
  });
}

export function SearchPanel({ cards }: { cards: GigCard[] }) {
  const [key, setKey] = useState<SortKey>('none'); const [desc, setDesc] = useState(true);
  const [minRating, setMinRating] = useState(''); const [maxPrice, setMaxPrice] = useState(''); const [minReviews, setMinReviews] = useState('');
  const [open, setOpen] = useState(true);
  useEffect(() => { try { chrome.storage?.local.get('searchPrefs', (r) => { const p = (r as any)?.searchPrefs; if (p) { setKey(p.key); setDesc(p.desc); setMinRating(p.minRating ?? ''); setMaxPrice(p.maxPrice ?? ''); setMinReviews(p.minReviews ?? ''); } }); } catch { /* not in extension */ } }, []);
  useEffect(() => { try { chrome.storage?.local.set({ searchPrefs: { key, desc, minRating, maxPrice, minReviews } }); } catch { /* ignore */ } }, [key, desc, minRating, maxPrice, minReviews]);
  const view = applyView(cards, key, desc, { minRating: minRating ? +minRating : undefined, maxPrice: maxPrice ? +maxPrice : undefined, minReviews: minReviews ? +minReviews : undefined });
  useEffect(() => {
    // Reorder within each container separately (search pages have several card sections).
    const raw = cardEls(); const els = raw.map(box); const shown = new Set<HTMLElement>();
    view.forEach((c) => { const r = elFor(c, 0, raw); if (!r) return; const el = box(r); shown.add(el); el.parentElement?.appendChild(el); el.style.display = ''; });
    els.forEach((e) => { if (!shown.has(e)) e.style.display = 'none'; });
  }, [key, desc, minRating, maxPrice, minReviews]);
  const exportCsv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCsv(view)], { type: 'text/csv' })); a.download = 'giglens-search.csv'; a.click(); };
  if (!open) return <button class="gl" style="width:auto" onClick={() => setOpen(true)}>GigLens</button>;
  return (<div class="gl"><h2>GigLens · {view.length}/{cards.length} gigs <button class="x" onClick={() => setOpen(false)}>×</button></h2>
    <div class="row">Sort <select value={key} onChange={(e) => setKey((e.target as HTMLSelectElement).value as SortKey)}>
      <option value="none">Page order</option><option value="price">Price</option><option value="rating">Rating</option><option value="reviews">Reviews</option><option value="deliveryDays">Delivery</option><option value="ordersInQueue">Orders in queue</option></select>
      <button onClick={() => setDesc(!desc)}>{desc ? '↓ desc' : '↑ asc'}</button></div>
    <div class="row">★≥<input value={minRating} onInput={(e) => setMinRating((e.target as HTMLInputElement).value)} /> $≤<input value={maxPrice} onInput={(e) => setMaxPrice((e.target as HTMLInputElement).value)} /> reviews≥<input value={minReviews} onInput={(e) => setMinReviews((e.target as HTMLInputElement).value)} /></div>
    <div class="row"><button onClick={exportCsv}>Export CSV</button><small>Data source: {cards[0]?.source === 'json' ? 'page state' : 'page HTML'}</small></div></div>);
}
