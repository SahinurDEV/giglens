import { GigCard } from '../extract/types';
import { val } from './sort';
export const median = (xs: number[]) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export interface Insights { count: number; priceMin: number | null; priceMedian: number | null; priceMax: number | null; deliveryMedian: number | null; totalQueue: number | null; withDetails: number; reviewsMedian: number | null; }
export function insights(cards: GigCard[]): Insights {
  const p = cards.map((c) => c.price).filter((x): x is number => x != null);
  const d = cards.map((c) => c.deliveryDays).filter((x): x is number => x != null);
  const q = cards.map((c) => val(c, 'ordersInQueue')).filter((x): x is number => x != null);
  const r = cards.map((c) => c.reviews).filter((x): x is number => x != null);
  return { count: cards.length, priceMin: p.length ? Math.min(...p) : null, priceMedian: median(p), priceMax: p.length ? Math.max(...p) : null, deliveryMedian: median(d), totalQueue: q.length ? q.reduce((a, b) => a + b, 0) : null, withDetails: q.length, reviewsMedian: median(r) };
}
