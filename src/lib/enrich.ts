import { GigDetails } from '../extract/types';
import { parseGigDetails, stateFromHtml } from '../extract/gigDetails';
import { pageKind } from '../content/router';

export const TTL_MS = 6 * 60 * 60 * 1000;
const PREFIX = 'gig:';
const mem = new Map<string, GigDetails>();

type Fetcher = (url: string) => Promise<string>;
const defaultFetch: Fetcher = (url) => fetch(url, { credentials: 'include' }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });

async function cacheGet(key: string): Promise<GigDetails | null> {
  if (mem.has(key)) return mem.get(key)!;
  try { const r = await chrome.storage.local.get(PREFIX + key); const v = r[PREFIX + key] as GigDetails | undefined; if (v && Date.now() - v.fetchedAt < TTL_MS) { mem.set(key, v); return v; } } catch { /* not in extension */ }
  return null;
}
async function cacheSet(key: string, v: GigDetails) {
  mem.set(key, v);
  try { await chrome.storage.local.set({ [PREFIX + key]: v }); } catch { /* ignore */ }
}
/** Drop expired cache entries (called once per page). */
export async function pruneCache() {
  try { const all = await chrome.storage.local.get(null); const old = Object.keys(all).filter((k) => k.startsWith(PREFIX) && Date.now() - (all[k] as GigDetails).fetchedAt > TTL_MS); if (old.length) await chrome.storage.local.remove(old); } catch { /* ignore */ }
}

/** Throttled queue: at most `concurrency` gig pages in flight, `gapMs` between starts. Only same-origin gig URLs. */
export class EnrichQueue {
  private q: { path: string; resolve: (d: GigDetails | null) => void }[] = [];
  private active = 0; private pending = new Map<string, Promise<GigDetails | null>>();
  constructor(private concurrency = 2, private gapMs = 400, private fetcher: Fetcher = defaultFetch, private origin = 'https://www.fiverr.com') {}
  get(path: string): Promise<GigDetails | null> {
    const clean = path.split('?')[0];
    if (!/^\/[\w.-]+\/[\w.-]+$/.test(clean) || pageKind(clean) !== 'gig') return Promise.resolve(null);
    if (this.pending.has(clean)) return this.pending.get(clean)!;
    const p = cacheGet(clean).then((hit) => hit ?? new Promise<GigDetails | null>((resolve) => { this.q.push({ path: clean, resolve }); this.pump(); }));
    this.pending.set(clean, p);
    return p;
  }
  private pump() {
    while (this.active < this.concurrency && this.q.length) {
      const job = this.q.shift()!; this.active++;
      this.fetcher(this.origin + job.path)
        .then((html) => parseGigDetails(stateFromHtml(html)))
        .then(async (d) => { if (d) await cacheSet(job.path, d); job.resolve(d); })
        .catch(() => { this.pending.delete(job.path); job.resolve(null); })
        .finally(() => setTimeout(() => { this.active--; this.pump(); }, this.gapMs));
    }
  }
}
