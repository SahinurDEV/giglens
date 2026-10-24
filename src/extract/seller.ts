import { SellerProfile } from './types';
import { readPageState, num, txt } from './state';
import { levelName, langName, monthYear, relativeAgo } from './levels';

/** Real seller pages: state.seller (+ state.gigsData[]). Gig pages also carry state.sellerCard. Verified Oct 2026. */
export function extractSeller(doc: Document): SellerProfile | null {
  const s = readPageState(doc);
  const sel = s?.seller;
  if (sel?.user) {
    const u = sel.user;
    const gigs: any[] = Array.isArray(s.gigsData) ? s.gigsData : [];
    const prices = gigs.map((g) => num(g.price_i)).filter((p): p is number => p != null);
    return {
      username: u.name ?? '', level: levelName(sel.achievementLevel ?? sel.sellerLevel),
      rating: num(sel.rating?.score), reviews: num(sel.rating?.count ?? s.reviewsData?.buying_reviews?.total_count),
      responseTimeHours: num(sel.responseTime?.inHours ?? s.sellerCard?.responseTime),
      memberSince: monthYear(u.joinedAt), lastDelivery: relativeAgo(s.sellerCard?.recentDelivery) ?? domStat(doc, /last delivery/i),
      country: u.address?.countryName ?? u.address?.countryCode ?? null,
      languages: (u.languages ?? []).map((l: any) => (typeof l === 'string' ? l : langName(l.code ?? l.name))),
      gigCount: num(sel.approvedGigsCount) ?? (gigs.length || null),
      avgGigPrice: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null, source: 'json',
    };
  }
  return extractSellerDom(doc);
}

function domStat(doc: Document, label: RegExp): string | null {
  return Array.from(doc.querySelectorAll('ul.user-stats li, .seller-profile li')).find((li) => label.test(li.textContent ?? ''))?.querySelector('strong')?.textContent?.trim() ?? null;
}

export function extractSellerDom(doc: Document): SellerProfile | null {
  const root = doc.querySelector('.seller-profile, [data-testid="seller-profile"]');
  if (!root) return null;
  const prices = Array.from(doc.querySelectorAll('.gig-card-layout .price')).map((e) => num(e.textContent)).filter((p): p is number => p != null);
  return { username: txt(root, '.username'), level: txt(root, '.level') || null, rating: num(txt(root, '.rating-score')), reviews: num(txt(root, '.ratings-count')),
    responseTimeHours: num(domStat(doc, /response/i)), memberSince: domStat(doc, /member since/i), lastDelivery: domStat(doc, /last delivery/i), country: domStat(doc, /from/i),
    languages: (domStat(doc, /languages?/i) ?? '').split(',').map((x) => x.trim()).filter(Boolean), gigCount: doc.querySelectorAll('.gig-card-layout').length || null,
    avgGigPrice: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null, source: 'dom' };
}
