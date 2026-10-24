import { GigPage, GigPackage } from './types';
import { readPageState, num, txt } from './state';
export function extractGig(doc: Document): GigPage | null {
  const s = readPageState(doc);
  if (s?.packages || s?.general) {
    const pk = s.packages?.packageList ?? s.packages ?? [];
    const packages: GigPackage[] = (Array.isArray(pk) ? pk : []).map((p: any) => ({
      name: p.title ?? p.name ?? '', price: num(p.price), deliveryDays: num(p.duration),
      revisions: p.revisions === 'unlimited' ? Infinity : num(p.revisions ?? p.features?.find((f: any) => /revision/i.test(f.name))?.value),
    }));
    return { id: s.general?.gigId != null ? String(s.general.gigId) : null, title: s.general?.gigTitle ?? '', seller: s.seller?.user?.name ?? s.seller?.username ?? '', packages,
      rating: num(s.overview?.gig?.rating ?? s.reviews?.rating), reviews: num(s.overview?.gig?.ratingsCount ?? s.reviews?.total), ordersInQueue: num(s.overview?.gig?.ordersInQueue), source: 'json' };
  }
  const table = doc.querySelector('table.package-table, [data-testid="packages-table"]');
  if (!table) return null;
  const rows = Array.from(table.querySelectorAll('tr'));
  const cell = (label: RegExp) => rows.find((r) => label.test(r.cells[0]?.textContent ?? ''));
  const heads = Array.from(rows[0]?.cells ?? []).slice(1);
  const packages = heads.map((h, i) => ({ name: h.textContent?.trim() ?? '', price: num(cell(/price/i)?.cells[i + 1]?.textContent), deliveryDays: num(cell(/delivery/i)?.cells[i + 1]?.textContent), revisions: (() => { const t = cell(/revision/i)?.cells[i + 1]?.textContent ?? ''; return /unlimited/i.test(t) ? Infinity : num(t); })() }));
  return { id: null, title: txt(doc, 'h1'), seller: txt(doc, '.seller-name, [data-testid="seller-name"]'), packages, rating: num(txt(doc, '.rating-score')), reviews: num(txt(doc, '.ratings-count')), ordersInQueue: num(txt(doc, '[data-testid="orders-in-queue"]')), source: 'dom' };
}
