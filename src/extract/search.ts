import { GigCard } from './types';
import { readPageState, num, txt, findArray } from './state';
const LEVELS: Record<string, string> = { level_one_seller: 'Level 1', level_two_seller: 'Level 2', top_rated_seller: 'Top Rated', new_seller: 'New', na: 'New' };
export const levelName = (l: unknown) => (typeof l === 'string' ? LEVELS[l] ?? l : null);

export function extractSearch(doc: Document): GigCard[] {
  const state = readPageState(doc);
  const gigs = state && findArray(state, (g) => g && typeof g === 'object' && 'gig_id' in g);
  if (gigs) return gigs.map((g: any): GigCard => ({
    id: String(g.gig_id), title: g.title ?? '', url: g.gig_url ?? '', seller: g.seller_name ?? '',
    sellerLevel: levelName(g.seller_level), price: num(g.price_i ?? g.price),
    deliveryDays: num(g.package_i?.duration ?? g.duration), rating: num(g.buying_review_rating),
    reviews: num(g.buying_review_rating_count), ordersInQueue: num(g.orders_in_queue ?? g.num_of_orders_in_queue),
    favorites: num(g.favorites_count ?? g.collected_count), source: 'json',
  }));
  return extractSearchDom(doc);
}

export function extractSearchDom(doc: Document): GigCard[] {
  const cards = Array.from(doc.querySelectorAll<HTMLElement>('[data-gig-id], .gig-card-layout'));
  return cards.map((c, i) => {
    const a = c.querySelector<HTMLAnchorElement>('a[href*="/"]');
    const ratingText = txt(c, '.rating-score, [data-testid="rating"]');
    const countText = txt(c, '.ratings-count, [data-testid="rating-count"]');
    return {
      id: c.dataset.gigId ?? String(i), title: txt(c, 'h3, p[role="heading"], .gig-title') || a?.title || '',
      url: a?.getAttribute('href') ?? '', seller: txt(c, '.seller-name, [data-testid="seller-name"]'),
      sellerLevel: txt(c, '.level, [data-testid="seller-level"]') || null,
      price: num(txt(c, '.price, [data-testid="price"]')), deliveryDays: num(txt(c, '[data-testid="delivery"]')) ,
      rating: num(ratingText), reviews: num(countText), ordersInQueue: null, favorites: num(txt(c, '[data-testid="favorites"]')), source: 'dom' as const,
    };
  });
}
