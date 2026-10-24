import { GigDetails } from './types';
import { num } from './state';
import { langName } from './levels';
import { PkgDetail } from './types';
import { reviewStats } from '../lib/reviews';
const cents = (v: unknown) => { const n = num(v); return n == null ? null : n / 100; };
const days = (h: unknown) => { const n = num(h); return n == null ? null : Math.max(1, Math.round(n / 24)); };
const title = (t: unknown) => String(t ?? '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const rng = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? [Math.min(...v), Math.max(...v)] : [null, null]; };

/** Parse the per-gig data block from a gig page's embedded state (perseus-initial-props). Verified Oct 2026. */
export function parseGigDetails(s: any, now = Date.now()): GigDetails | null {
  if (!s || typeof s !== 'object' || !s.overview) return null;
  const pl: any[] = s.packages?.packageList ?? [];
  const [dMin, dMax] = rng(pl.map((p) => (p.duration != null ? Math.max(1, Math.round(num(p.duration)! / 24)) : null)));
  const [rMin, rMax] = rng(pl.map((p) => { const v = p.revisions?.included === false ? 0 : num(p.revisions?.value); return v === -1 ? Infinity : v; }));
  const ss = s.reviews?.star_summary;
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
    gigRating: num(s.overview?.gig?.rating), gigReviews: num(s.overview?.gig?.ratingsCount), sellerRating: num(s.sellerCard?.rating ?? s.seller?.rating?.score),
    deliveryMin: dMin, deliveryMax: dMax, revisionsMin: rMin, revisionsMax: rMax, packageCount: pl.length || null,
    languages: (s.seller?.user?.languages ?? s.overview?.seller?.proficientLanguages ?? []).map((l: any) => langName(String(l.code ?? l.name ?? ''))).filter(Boolean),
    pkgs: pl.map((p): PkgDetail => {
      const feats: any[] = p.features ?? [];
      const rv = p.revisions?.included === false ? 0 : num(p.revisions?.value);
      return { name: title(p.title), price: cents(p.price), deliveryDays: days(p.duration), revisions: rv === -1 ? Infinity : rv,
        features: feats.filter((f) => f.included).map((f) => ({ label: String(f.label ?? f.name), value: f.type === 'NUMERIC' ? String(f.value) : '✓' })),
        addOns: feats.filter((f) => !f.included && num(f.price)).map((f) => ({ label: String(f.label ?? f.name), price: cents(f.price) })),
        express: p.extraFast && num(p.extraFast.price) ? { price: cents(p.extraFast.price), days: days(p.extraFast.duration) } : null };
    }),
    extras: (pl[0]?.customExtras ?? []).map((e: any) => ({ label: String(e.label ?? e.buyerTooltip ?? 'Extra').slice(0, 60), price: cents(e.price), days: days(e.duration) })),
    recurring: (s.packages?.recurringOptions ?? []).map((r: any) => ({ months: num(r.duration), pct: num(r.discountPercentage) })),
    reviewStats: reviewStats(s.reviews), aiSummary: Array.isArray(s.aiSummary?.summary) ? s.aiSummary.summary.map(String) : [],
    credentials: s.seller ? { skills: (s.seller.activeStructuredSkills ?? []).map((x: any) => String(x.label ?? x.name)), certifications: (s.seller.certifications ?? []).map((c: any) => [c.certificationName, c.receivedFrom, c.year].filter(Boolean).join(' · ')),
      verified: !!s.seller.isVerified, highlyResponsive: !!s.seller.isHighlyResponsive, onVacation: !!(s.outOfOffice?.isOnVacation ?? s.seller.isOnVacation), vacationEnd: s.outOfOffice?.endDate ?? null } : null,
    subRatings: ss ? { communication: num(ss.communication_valuation), quality: num(ss.quality_of_delivery_valuation), value: num(ss.value_for_money_valuation) } : null,
  };
}

/** Extract the state JSON from raw gig-page HTML without building a full DOM. */
export function stateFromHtml(html: string): any | null {
  const m = html.match(/<script[^>]*id="perseus-initial-props"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
