import { GigCard } from '../extract/types';
import { dealScore } from './dealScore';
export type SortKey = 'none' | 'price' | 'rating' | 'reviews' | 'deliveryDays' | 'ordersInQueue' | 'favorites' | 'completedOrders' | 'sellerReviews' | 'dealScore';
export interface Filter {
  priceMin?: number; priceMax?: number; ratingMin?: number; reviewsMin?: number; deliveryMax?: number;
  queueMin?: number; queueMax?: number; favoritesMin?: number; levels?: string[]; proOnly?: boolean; choiceOnly?: boolean; onlineOnly?: boolean; rising?: boolean;
}
/** Value of a numeric field, preferring fetched gig-page details over search-card data. */
export function val(c: GigCard, k: Exclude<SortKey, 'none'>): number | null {
  const d = c.details;
  switch (k) {
    case 'ordersInQueue': return d?.ordersInQueue ?? c.ordersInQueue;
    case 'favorites': return d?.favorites ?? c.favorites;
    case 'completedOrders': return d?.completedOrders ?? null;
    case 'sellerReviews': return d?.sellerReviews ?? c.sellerReviews ?? null;
    case 'dealScore': return dealScore(c);
    default: return c[k] as number | null;
  }
}
const ge = (v: number | null, min?: number) => min == null || (v != null && v >= min);
const le = (v: number | null, max?: number) => max == null || (v != null && v <= max);
export function matches(c: GigCard, f: Filter): boolean {
  return ge(c.price, f.priceMin) && le(c.price, f.priceMax) && ge(c.rating, f.ratingMin) && ge(c.reviews, f.reviewsMin) && le(c.deliveryDays, f.deliveryMax)
    && ge(val(c, 'ordersInQueue'), f.queueMin) && le(val(c, 'ordersInQueue'), f.queueMax) && ge(val(c, 'favorites'), f.favoritesMin)
    && (!f.levels?.length || f.levels.includes(c.sellerLevel ?? 'New')) && (!f.proOnly || !!c.isPro) && (!f.choiceOnly || !!c.isChoice) && (!f.onlineOnly || !!c.online) && (!f.rising || isRising(c));
}
export function applyView(cards: GigCard[], key: SortKey, desc: boolean, f: Filter) {
  const keep = cards.filter((c) => matches(c, f));
  if (key === 'none') return keep;
  return [...keep].sort((a, b) => { const x = val(a, key), y = val(b, key); if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1; return desc ? y - x : x - y; });
}
/** Count tag occurrences across fetched gigs, most common first. */
export function topKeywords(cards: GigCard[], limit = 40): { tag: string; count: number }[] {
  const m = new Map<string, number>();
  cards.forEach((c) => new Set(c.details?.tags ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}
/** Rising seller: few reviews but real demand right now. */
export const RISING = { maxReviews: 50, minQueue: 5 };
export function isRising(c: GigCard) { const q = val(c, 'ordersInQueue'); return (c.reviews ?? 0) <= RISING.maxReviews && q != null && q >= RISING.minQueue; }

/** Built-in “Best value” preset: solid rating/reviews, reasonable delivery, sorted by deal score. */
export const BEST_VALUE_VIEW = { key: 'dealScore' as SortKey, desc: true, f: { ratingMin: 4.8, reviewsMin: 20, deliveryMax: 7 } };
