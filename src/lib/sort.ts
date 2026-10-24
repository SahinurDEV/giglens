import { GigCard } from '../extract/types';
export type SortKey = 'none' | 'price' | 'rating' | 'reviews' | 'deliveryDays' | 'ordersInQueue';
export interface Filter { minRating?: number; maxPrice?: number; minReviews?: number; }
export function applyView(cards: GigCard[], key: SortKey, desc: boolean, f: Filter) {
  const keep = cards.filter((c) => (f.minRating == null || (c.rating ?? 0) >= f.minRating) && (f.maxPrice == null || (c.price ?? Infinity) <= f.maxPrice) && (f.minReviews == null || (c.reviews ?? 0) >= f.minReviews));
  if (key === 'none') return keep;
  return [...keep].sort((a, b) => { const x = a[key] as number | null, y = b[key] as number | null; if (x == null) return 1; if (y == null) return -1; return desc ? y - x : x - y; });
}
