import { SellerProfile } from './types';
import { readPageState, num, txt } from './state';
import { levelName } from './search';
export function extractSeller(doc: Document): SellerProfile | null {
  const s = readPageState(doc);
  const u = s?.seller ?? s?.userData;
  if (u) {
    const gigs: any[] = s.gigs?.gigs ?? s.gigs ?? [];
    const prices = gigs.map((g) => num(g.price ?? g.price_i)).filter((p): p is number => p != null);
    return { username: u.username ?? u.user?.name ?? '', level: levelName(u.sellerLevel ?? u.seller_level), rating: num(u.rating?.score ?? u.rating), reviews: num(u.rating?.count ?? u.ratingsCount),
      responseTimeHours: num(u.responseTime), memberSince: u.memberSince ?? null, lastDelivery: u.lastDelivery ?? null, country: u.country ?? null,
      languages: (u.languages ?? []).map((l: any) => (typeof l === 'string' ? l : l.name)), gigCount: Array.isArray(gigs) ? gigs.length : null,
      avgGigPrice: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null, source: 'json' };
  }
  const root = doc.querySelector('.seller-profile, [data-testid="seller-profile"]');
  if (!root) return null;
  const stat = (label: RegExp) => Array.from(root.querySelectorAll('li')).find((li) => label.test(li.textContent ?? ''))?.querySelector('strong')?.textContent?.trim() ?? null;
  const prices = Array.from(doc.querySelectorAll('.gig-card-layout .price')).map((e) => num(e.textContent)).filter((p): p is number => p != null);
  return { username: txt(root, '.username'), level: txt(root, '.level') || null, rating: num(txt(root, '.rating-score')), reviews: num(txt(root, '.ratings-count')),
    responseTimeHours: num(stat(/response/i)), memberSince: stat(/member since/i), lastDelivery: stat(/last delivery/i), country: stat(/from/i),
    languages: (stat(/languages?/i) ?? '').split(',').map((x) => x.trim()).filter(Boolean), gigCount: doc.querySelectorAll('.gig-card-layout').length || null,
    avgGigPrice: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null, source: 'dom' };
}
