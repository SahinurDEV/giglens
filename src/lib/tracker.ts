// Competitor tracker: local daily snapshots of watched gigs (chrome.storage.local, key "watch").
export const MAX_WATCH = 20;
export const MAX_SNAPS = 120;
export interface Snap { d: string; queue: number | null; reviews: number | null; price: number | null; fav: number | null; }
export interface Watched { title: string; added: string; snaps: Snap[]; }
export type WatchMap = Record<string, Watched>;
export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
export const cleanPath = (p: string) => p.split('?')[0];

/** Pure helpers (tested) */
export function addTo(m: WatchMap, path: string, title: string, now = Date.now()): { map: WatchMap; ok: boolean } {
  const k = cleanPath(path); if (m[k]) return { map: m, ok: true };
  if (Object.keys(m).length >= MAX_WATCH) return { map: m, ok: false };
  return { map: { ...m, [k]: { title, added: today(now), snaps: [] } }, ok: true };
}
export function snapInto(m: WatchMap, path: string, s: Omit<Snap, 'd'>, now = Date.now()): WatchMap {
  const k = cleanPath(path); const w = m[k]; if (!w) return m;
  const d = today(now); const snaps = [...w.snaps.filter((x) => x.d !== d), { d, ...s }].sort((a, b) => a.d.localeCompare(b.d)).slice(-MAX_SNAPS);
  return { ...m, [k]: { ...w, snaps } };
}
export const needsRefresh = (w: Watched, now = Date.now()) => w.snaps.at(-1)?.d !== today(now);

/** Storage wrappers */
export async function getWatch(): Promise<WatchMap> { try { return ((await chrome.storage.local.get('watch')).watch as WatchMap) ?? {}; } catch { return {}; } }
export async function setWatch(m: WatchMap) { try { await chrome.storage.local.set({ watch: m }); } catch { /* ignore */ } }
export async function watch(path: string, title: string) { const r = addTo(await getWatch(), path, title); await setWatch(r.map); return r.ok; }
export async function unwatch(path: string) { const m = { ...(await getWatch()) }; delete m[cleanPath(path)]; await setWatch(m); }
export async function recordSnapshot(path: string, s: Omit<Snap, 'd'>) { const m = await getWatch(); if (!m[cleanPath(path)]) return; await setWatch(snapInto(m, path, s)); }

/** Tiny inline SVG sparkline */
export function sparkline(vals: (number | null)[], w = 120, h = 28, color = '#1f883d'): string {
  const v = vals.map((x, i) => [i, x] as const).filter((p): p is readonly [number, number] => p[1] != null);
  if (v.length < 2) return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><text x="2" y="${h - 8}" font-size="10" fill="#8c959f">${v.length ? v[0][1] : '–'}</text></svg>`;
  const xs = v.map((p) => p[0]), ys = v.map((p) => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pts = v.map(([x, y]) => `${(((x - x0) / (x1 - x0 || 1)) * (w - 4) + 2).toFixed(1)},${(h - 2 - ((y - y0) / (y1 - y0 || 1)) * (h - 4)).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="${color}" stroke-width="1.5" points="${pts}"/></svg>`;
}
