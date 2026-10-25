import { GigCard } from '../extract/types';

/**
 * 0–100 “deal” score for search cards.
 * Favors high rating, enough reviews, real demand (queue), fair price, and faster delivery.
 * Heuristic only — not a quality rating from Fiverr.
 */
export function dealScore(c: GigCard): number | null {
  if (c.rating == null || c.price == null || c.price <= 0) return null;
  const reviews = c.reviews ?? 0;
  const queue = c.details?.ordersInQueue ?? c.ordersInQueue ?? 0;
  const delivery = c.deliveryDays;

  const ratingPts = Math.min(35, Math.max(0, (c.rating - 4) * 35));
  const reviewPts = Math.min(25, Math.log10(reviews + 1) * 9);
  const queuePts = Math.min(20, Math.log10(queue + 1) * 10);
  const pricePts = Math.min(12, 12 * (80 / (c.price + 80)));
  const deliveryPts = delivery == null ? 4 : Math.min(8, 8 * (4 / (delivery + 3)));

  return Math.max(0, Math.min(100, Math.round(ratingPts + reviewPts + queuePts + pricePts + deliveryPts)));
}

export function dealTier(score: number | null): 'high' | 'mid' | 'low' | null {
  if (score == null) return null;
  if (score >= 70) return 'high';
  if (score >= 45) return 'mid';
  return 'low';
}
