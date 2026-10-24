import { GigDetails } from './types';
import { num } from './state';

/** Parse the per-gig data block from a gig page's embedded state (perseus-initial-props). Verified Oct 2026. */
export function parseGigDetails(s: any, now = Date.now()): GigDetails | null {
  if (!s || typeof s !== 'object' || !s.overview) return null;
  const prices = (s.packages?.packageList ?? []).map((p: any) => num(p.price)).filter((x: number | null): x is number => x != null).map((c: number) => c / 100);
  const breakdown: any[] = s.reviews?.breakdown ?? [];
  const total = breakdown.reduce((a, b) => a + (num(b.count) ?? 0), 0);
  const five = num(breakdown.find((b) => b.average_valuation_value === 5)?.count);
  return {
    ordersInQueue: num(s.overview?.gig?.ordersInQueue),
    favorites: num(s.topNav?.gigCollectedCount),
    tags: (s.tags?.tagsGigList ?? []).map((t: any) => String(t.name ?? '')).filter(Boolean),
    sellerReviews: num(s.sellerCard?.ratingsCount ?? s.seller?.rating?.count),
    country: s.sellerCard?.countryCode ?? s.overview?.seller?.countryCode ?? null,
    completedOrders: num(s.seller?.completedOrdersCount),
    responseTimeHours: num(s.sellerCard?.responseTime ?? s.seller?.responseTime?.inHours),
    lastDeliveryMs: num(s.sellerCard?.recentDelivery),
    memberSinceSec: num(s.sellerCard?.memberSince ?? s.seller?.user?.joinedAt),
    priceMin: prices.length ? Math.min(...prices) : null, priceMax: prices.length ? Math.max(...prices) : null,
    fiveStarShare: total && five != null ? Math.round((five / total) * 1000) / 10 : null,
    fetchedAt: now,
  };
}

/** Extract the state JSON from raw gig-page HTML without building a full DOM. */
export function stateFromHtml(html: string): any | null {
  const m = html.match(/<script[^>]*id="perseus-initial-props"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
