// 0.5 search-page tools: niche score, tag/title helper, watchlist, pin & compare.
import { useEffect, useState } from 'preact/hooks';
import { GigCard } from '../extract/types';
import { t } from '../lib/i18n';
import { compact } from '../lib/format';
import { val } from '../lib/sort';
import { nicheScore } from '../lib/niche';
import { tagTitleHelper } from '../lib/helper';
import { getWatch, watch, unwatch, recordSnapshot, sparkline, WatchMap, cleanPath, MAX_WATCH } from '../lib/tracker';
import { moreRows } from '../lib/cardRows';
import { cards, notify, useTick, renderBadges } from './search';

export const MAX_PINS = 4;
let pins: GigCard[] = [];
let watched: WatchMap = {};
const slim = (c: GigCard): GigCard => ({ ...c, details: c.details ? { ...c.details, reviewStats: c.details.reviewStats ? { ...c.details.reviewStats, reviews: [] } : null } : c.details });
async function loadState() { try { pins = ((await chrome.storage.local.get('pins')).pins as GigCard[]) ?? []; } catch { pins = []; } watched = await getWatch(); }
const savePins = () => chrome.storage?.local.set({ pins }).catch(() => {});
loadState().then(() => { cards.forEach(renderBadges); notify(); });

export function onDetails(c: GigCard) {
  if (!c.url || !watched[cleanPath(c.url)] || !c.details) return;
  recordSnapshot(c.url, { queue: c.details.ordersInQueue, reviews: c.details.gigReviews ?? c.reviews, price: c.price, fav: c.details.favorites }).then(async () => { watched = await getWatch(); notify(); });
}

export function cardActions(c: GigCard): HTMLElement | null {
  if (!c.url) return null;
  const row = document.createElement('div'); row.className = 'giglens-actions';
  const pinned = pins.some((p) => p.id === c.id); const isW = !!watched[cleanPath(c.url)];
  const mk = (label: string, title: string, on: boolean, fn: () => void) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.title = title; if (on) b.className = 'on'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); row.appendChild(b); };
  mk(pinned ? `📌 ${t('unpin')}` : `📌 ${t('pin')}`, `${t('compare')} (max ${MAX_PINS})`, pinned, () => {
    if (pinned) pins = pins.filter((p) => p.id !== c.id); else { if (pins.length >= MAX_PINS) pins.shift(); pins.push(slim(c)); }
    savePins(); renderBadges(c); notify();
  });
  mk(isW ? `👁 ${t('unwatch')}` : `👁 ${t('watch')}`, t('watchlist'), isW, async () => {
    if (isW) await unwatch(c.url); else if (!(await watch(c.url, c.title))) { alert(t('watchCap', { n: MAX_WATCH })); return; }
    watched = await getWatch(); onDetails(c); renderBadges(c); notify();
  });
  return row;
}

function Compare({ close }: { close: () => void }) {
  useTick();
  const rows: [string, (c: GigCard) => string][] = [
    [t('price'), (c) => (c.price != null ? `$${c.price}` : '–')], [t('delivery'), (c) => (c.deliveryDays != null ? `${c.deliveryDays}d` : '–')], [t('rating'), (c) => `★ ${c.rating ?? '–'}`], [t('reviews'), (c) => String(c.reviews ?? '–')],
    [t('queue'), (c) => String(val(c, 'ordersInQueue') ?? '–')], [t('favorites'), (c) => String(val(c, 'favorites') ?? '–')], [t('completedOrders'), (c) => String(val(c, 'completedOrders') ?? '–')], ['Level', (c) => [c.sellerLevel, c.isPro && 'Pro', c.isChoice && 'Choice'].filter(Boolean).join(' · ') || '–'],
  ];
  const extraKeys = [...new Set(pins.flatMap((c) => moreRows(c).map((r) => r[0])))].filter((k) => k && ![t('tags'), t('aiSummary'), t('delivery'), t('completedOrders'), ...rows.map((r) => r[0])].includes(k));
  return (<div class="overlay" onClick={close}><div class="modal" onClick={(e) => e.stopPropagation()}>
    <div class="row"><b>{t('compare')} ({pins.length}/{MAX_PINS})</b><span class="sp" /><button class="ghost" onClick={() => { pins = []; savePins(); cards.forEach(renderBadges); notify(); }}>{t('clear')}</button><button onClick={close}>{t('close')}</button></div>
    {pins.length ? <table class="cmp"><thead><tr><th></th>{pins.map((c) => <th><a href={c.url} target="_blank" rel="noopener">{c.title.slice(0, 60)}</a><div class="muted">{c.seller}</div></th>)}</tr></thead>
      <tbody>{rows.map(([k, f]) => <tr><td class="k">{k}</td>{pins.map((c) => <td>{f(c)}</td>)}</tr>)}
        {extraKeys.map((k) => <tr><td class="k">{k}</td>{pins.map((c) => <td>{moreRows(c).find((r) => r[0] === k)?.[1] ?? '–'}</td>)}</tr>)}</tbody></table> : <small>{t('noData')}</small>}
  </div></div>);
}

function Watchlist({ close }: { close: () => void }) {
  useTick();
  const [m, setM] = useState<WatchMap>(watched);
  useEffect(() => { getWatch().then(setM); }, []);
  const entries = Object.entries(m);
  return (<div class="overlay" onClick={close}><div class="modal" onClick={(e) => e.stopPropagation()}>
    <div class="row"><b>👁 {t('watchlist')} ({entries.length}/{MAX_WATCH})</b><span class="sp" /><button onClick={close}>{t('close')}</button></div>
    {entries.length ? <table class="cmp"><thead><tr><th>Gig</th><th>{t('queue')}</th><th>{t('reviews')}</th><th>{t('price')}</th><th>{t('favorites')}</th><th></th></tr></thead><tbody>
      {entries.map(([path, w]) => { const last = w.snaps.at(-1); return <tr>
        <td><a href={path} target="_blank" rel="noopener">{w.title.slice(0, 50)}</a><div class="muted">{w.snaps.length} {t('snapshots')} · {last?.d ?? '–'}</div></td>
        <td><b>{last?.queue ?? '–'}</b><span dangerouslySetInnerHTML={{ __html: sparkline(w.snaps.map((s) => s.queue), 90, 24) }} /></td>
        <td><b>{last?.reviews ?? '–'}</b><span dangerouslySetInnerHTML={{ __html: sparkline(w.snaps.map((s) => s.reviews), 90, 24, '#0969da') }} /></td>
        <td>{last?.price != null ? `$${last.price}` : '–'}</td><td>{last?.fav ?? '–'}</td>
        <td><button class="ghost" onClick={async () => { await unwatch(path); watched = await getWatch(); setM(watched); cards.forEach(renderBadges); }}>✕</button></td></tr>; })}
    </tbody></table> : <small>{t('noData')}</small>}
  </div></div>);
}

function Helper() {
  useTick();
  const [title, setTitle] = useState(''); const [tags, setTags] = useState('');
  useEffect(() => { chrome.storage?.local.get('helperInput').then((r) => { const x = r?.helperInput as any; if (x) { setTitle(x.title ?? ''); setTags(x.tags ?? ''); } }).catch(() => {}); }, []);
  const persist = (a: string, b: string) => chrome.storage?.local.set({ helperInput: { title: a, tags: b } }).catch(() => {});
  const r = tagTitleHelper(cards, title, tags.split(','));
  return (<div class="helper">
    <div class="row"><input style="flex:2;min-width:220px" placeholder={t('yourTitle')} value={title} onInput={(e) => { const v = (e.target as HTMLInputElement).value; setTitle(v); persist(v, tags); }} />
      <input style="flex:1;min-width:180px" placeholder={t('yourTags')} value={tags} onInput={(e) => { const v = (e.target as HTMLInputElement).value; setTags(v); persist(title, v); }} /></div>
    <div class="row"><span class="lbl">{t('titleWords')}</span>{r.titleWords.map((x) => <span class={'tag' + (x.covered ? ' ok' : '')}>{x.covered ? '✓ ' : ''}{x.w} <b>{x.n}</b></span>)}</div>
    <div class="row"><span class="lbl">{t('missingTags')} ({r.tagSample}/{r.top})</span>{r.missingTags.length ? r.missingTags.map(([x, n]) => <span class="tag miss">{x} <b>{n}</b></span>) : <small>{t('noData')}</small>}
      {r.coveredTags.map((x) => <span class="tag ok">✓ {x}</span>)}</div>
  </div>);
}

export function Extras({ numFound }: { numFound: number | null }) {
  useTick();
  const [panel, setPanel] = useState<'' | 'compare' | 'watch' | 'helper'>('');
  const n = nicheScore(cards, numFound);
  const tog = (p: typeof panel) => setPanel(panel === p ? '' : p);
  return (<>
    {n && <span title={`${t('demand')} ${n.demand} · ${t('competition')} ${n.competition} · median queue ${n.medianQueue} · median reviews ${compact(n.medianReviews)} · ${n.results ? compact(n.results) + ' results' : ''} · ${n.sample} gigs`}>🎯 {t('niche')} <b class={'niche ' + n.label.toLowerCase()}>{n.score}</b> ({n.label})</span>}
    <span class="sp" />
    <button class={panel === 'helper' ? 'on' : ''} onClick={() => tog('helper')}>🧩 {t('helper')}</button>
    <button class={panel === 'watch' ? 'on' : ''} onClick={() => tog('watch')}>👁 {t('watchlist')} ({Object.keys(watched).length})</button>
    <button class={panel === 'compare' ? 'on' : ''} disabled={!pins.length} onClick={() => tog('compare')}>📌 {t('compare')} ({pins.length})</button>
    {panel === 'helper' && <div class="full"><Helper /></div>}
    {panel === 'compare' && <Compare close={() => setPanel('')} />}
    {panel === 'watch' && <Watchlist close={() => setPanel('')} />}
  </>);
}
