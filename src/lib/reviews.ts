import { ReviewStats } from '../extract/types';
import { num } from '../extract/state';

const tally = (xs: string[]) => { const m = new Map<string, number>(); xs.filter(Boolean).forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };

/** Review statistics from a reviews block (gig page `reviews` or seller page `reviewsData.buying_reviews`).
 *  breakdown/industries cover all reviews; countries/price ranges/repeat/business use only the reviews embedded in the page (usually 5). */
export function reviewStats(r: any): ReviewStats | null {
  if (!r || typeof r !== 'object') return null;
  const list: any[] = Array.isArray(r.reviews) ? r.reviews : [];
  const breakdown = [1, 2, 3, 4, 5].map((v) => num((r.breakdown ?? []).find((b: any) => b.average_valuation_value === v)?.count) ?? 0);
  const fc = r.filters_counters ?? {};
  const industries = Object.entries(fc.most_common_industries ?? {}).filter(([k]) => k !== 'other').map(([k, v]) => [k.replace(/_/g, ' '), num(v) ?? 0] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    breakdown, total: breakdown.reduce((a, b) => a + b, 0) || (num(r.total_count) ?? 0), sample: list.length,
    countries: tally(list.map((x) => x.reviewer_country_code ?? '')).slice(0, 6),
    priceRanges: tally(list.map((x) => x.order_price_range_usd ?? x.order_price_range ?? '')),
    repeat: list.filter((x) => x.repeat_buyer).length, business: list.filter((x) => x.is_business).length,
    industries, withSamples: num(fc.work_sample), businessTotal: num(fc.business),
    reviews: list.map((x) => ({ value: num(x.value) ?? 0, date: String(x.created_at ?? '').slice(0, 10), text: String(x.comment ?? ''), country: x.reviewer_country_code ?? '' })),
  };
}
