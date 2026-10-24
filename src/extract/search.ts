import { GigCard } from './types';
import { readPageState, num, txt, findArray } from './state';
import { levelName } from './levels';
export { levelName };

/** Real search pages: state.listings[0].gigs[] (verified Oct 2026). */
export function extractSearch(doc: Document): GigCard[] {
  const state = readPageState(doc);
  const gigs = state && (state.listings?.[0]?.gigs ?? findArray(state, (g) => g && typeof g === 'object' && 'gig_id' in g));
  if (gigs?.length) return gigs.map((g: any): GigCard => ({
    id: String(g.u_id ?? g.gig_id), title: g.title ?? '', url: g.gig_url ?? '', seller: g.seller_name ?? '',
    sellerLevel: levelName(g.seller_level), price: num(g.price_i ?? g.packages?.recommended?.price),
    deliveryDays: num(g.packages?.recommended?.duration ?? g.duration),
    rating: num(g.buying_review_rating), reviews: num(g.buying_review_rating_count),
    // Not present in search-page state as of Oct 2026; kept for forward compatibility.
    ordersInQueue: num(g.orders_in_queue), favorites: num(g.favorites_count ?? g.collected_count),
    source: 'json',
    isPro: !!g.is_pro, isChoice: !!g.is_fiverr_choice, country: g.seller_country ?? null, online: !!g.seller_online,
    sellerReviews: num(g.seller_rating?.count), sellerRating: num(g.seller_rating?.score), packages: num(g.num_of_packages),
    recurringPct: Array.isArray(g.recurring_options) && g.recurring_options.length ? Math.max(...g.recurring_options.map((r: any) => num(r.discount_percentage) ?? 0)) : null,
  }));
  return extractSearchDom(doc);
}

export function extractSearchDom(doc: Document): GigCard[] {
  return Array.from(doc.querySelectorAll<HTMLElement>('[data-gig-id]')).map((c, i) => {
    const a = c.querySelector<HTMLAnchorElement>('a[href^="/"]');
    const all = c.textContent ?? '';
    const ratingM = all.match(/\b([1-5]\.\d{1,2})\s*\(([\d.,]+k?\+?)\)/i);
    return {
      id: c.dataset.gigId ?? String(i), title: txt(c, 'h3, p[role="heading"], .gig-title, [aria-label] p') || a?.title || '',
      url: a?.getAttribute('href')?.split('?')[0] ?? '', seller: txt(c, '.seller-name, [data-testid="seller-name"]'),
      sellerLevel: txt(c, '.level, [data-testid="seller-level"]') || (Array.from(c.querySelectorAll('p')).map((p) => p.textContent?.trim() ?? '').find((t) => /^(Top Rated|Level [12]|Pro)$/.test(t)) ?? null),
      price: num(txt(c, '.price, [data-testid="price"]') || all.match(/From\s*\$\s*([\d,.]+)/)?.[1]),
      deliveryDays: num(txt(c, '[data-testid="delivery"]')),
      rating: num(txt(c, '.rating-score, [data-testid="rating"]') || ratingM?.[1]),
      reviews: num(txt(c, '.ratings-count, [data-testid="rating-count"]') || ratingM?.[2]),
      ordersInQueue: null, favorites: null, source: 'dom' as const,
    };
  });
}
