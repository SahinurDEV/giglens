import { GigPage, GigPackage } from './types';
import { readPageState, num, txt } from './state';

const revisions = (r: any): number | null => {
  const v = r && typeof r === 'object' ? (r.included === false ? 0 : r.value) : r;
  if (v === -1 || v === 'unlimited') return Infinity;
  return num(v);
};

/** Real gig pages: state.packages.packageList[] with price in cents and duration in hours (verified Oct 2026). */
export function extractGig(doc: Document): GigPage | null {
  const s = readPageState(doc);
  const list = s?.packages?.packageList;
  if (Array.isArray(list) && list.length) {
    const packages: GigPackage[] = list.map((p: any) => ({
      name: String(p.title ?? '').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
      price: p.price != null ? num(p.price)! / 100 : null,
      deliveryDays: p.duration != null ? Math.max(1, Math.round(num(p.duration)! / 24)) : null,
      revisions: revisions(p.revisions ?? p.features?.find((f: any) => /revision|modification/i.test(f.name))),
    }));
    return {
      id: s.general?.gigId != null ? String(s.general.gigId) : null, title: s.general?.gigTitle ?? s.overview?.gig?.title ?? '',
      seller: s.overview?.seller?.username ?? s.seller?.user?.name ?? '', packages,
      rating: num(s.overview?.gig?.rating ?? s.reviews?.average_valuation), reviews: num(s.overview?.gig?.ratingsCount ?? s.reviews?.total_count),
      ordersInQueue: num(s.overview?.gig?.ordersInQueue), source: 'json',
    };
  }
  return extractGigDom(doc);
}

export function extractGigDom(doc: Document): GigPage | null {
  const table = doc.querySelector('table.package-table, [data-testid="packages-table"]');
  if (!table) return null;
  const rows = Array.from(table.querySelectorAll('tr'));
  const cell = (label: RegExp) => rows.find((r) => label.test(r.cells[0]?.textContent ?? ''));
  const heads = Array.from(rows[0]?.cells ?? []).slice(1);
  const packages = heads.map((h, i) => ({
    name: h.textContent?.trim() ?? '', price: num(cell(/price/i)?.cells[i + 1]?.textContent),
    deliveryDays: num(cell(/delivery/i)?.cells[i + 1]?.textContent),
    revisions: (() => { const t = cell(/revision/i)?.cells[i + 1]?.textContent ?? ''; return /unlimited/i.test(t) ? Infinity : num(t); })(),
  }));
  const q = Array.from(doc.querySelectorAll('p')).map((p) => p.textContent ?? '').find((t) => /orders? in queue/i.test(t));
  return { id: null, title: txt(doc, 'h1'), seller: txt(doc, '.seller-name, [data-testid="seller-name"]'), packages,
    rating: num(txt(doc, '.rating-score')), reviews: num(txt(doc, '.ratings-count')), ordersInQueue: num(q ?? txt(doc, '[data-testid="orders-in-queue"]')), source: 'dom' };
}
