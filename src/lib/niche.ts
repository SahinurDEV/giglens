import { GigCard } from '../extract/types';
import { val } from './sort';
import { median } from './insights';
export interface Niche { score: number; label: 'Low' | 'Medium' | 'High'; demand: number; competition: number; medianQueue: number; medianReviews: number; results: number | null; sample: number; }
/** Demand vs competition for the current search (0–100, higher = more demand per competitor).
 *  demand: median orders in queue of loaded gigs (log scale, 100 ≈ max)
 *  competition: total results (log, 1M ≈ max) and median reviews of top gigs (log, 10k ≈ max). Heuristic. */
export function nicheScore(cards: GigCard[], numFound: number | null): Niche | null {
  const q = cards.map((c) => val(c, 'ordersInQueue')).filter((x): x is number => x != null);
  if (q.length < 3) return null;
  const mq = median(q)!; const mr = median(cards.map((c) => c.reviews).filter((x): x is number => x != null)) ?? 0;
  const demand = Math.min(1, Math.log10(1 + mq) / 2);
  const comp = Math.min(1, 0.5 * (numFound ? Math.log10(1 + numFound) / 6 : 0.5) + 0.5 * (Math.log10(1 + mr) / 4));
  const score = Math.round((100 * demand) / (demand + comp || 1));
  return { score, label: score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low', demand: Math.round(demand * 100), competition: Math.round(comp * 100), medianQueue: mq, medianReviews: mr, results: numFound, sample: q.length };
}
