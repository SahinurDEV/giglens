import { GigCard } from '../extract/types';
import { compact, flag } from './format';
import { relativeAgo, monthYear } from '../extract/levels';
const rangeTxt = (a?: number | null, b?: number | null, pre = '', suf = '') => { const f = (v: number) => (v === Infinity ? '∞' : `${pre}${v}${suf}`); return a == null ? null : a === b || b == null ? f(a) : `${f(a)}–${f(b)}`; };
export function moreRows(c: GigCard): [string, string][] {
  const d = c.details; const rows: [string, string | null | undefined][] = [
    ['Gig rating', d?.gigRating != null ? `★ ${d.gigRating} (${d.gigReviews ?? c.reviews ?? '?'} reviews)` : c.rating != null ? `★ ${c.rating} (${c.reviews ?? '?'})` : null],
    ['Seller rating', (d?.sellerRating ?? c.sellerRating) != null ? `★ ${d?.sellerRating ?? c.sellerRating} (${compact(d?.sellerReviews ?? c.sellerReviews ?? 0)} reviews)` : null],
    ['5★ share', d?.fiveStarShare != null ? `${d.fiveStarShare}%` : null],
    ['Sub-ratings', d?.subRatings ? `comm ${d.subRatings.communication} · quality ${d.subRatings.quality} · value ${d.subRatings.value}` : null],
    ['Price range', rangeTxt(d?.priceMin, d?.priceMax, '$')], ['Delivery', rangeTxt(d?.deliveryMin ?? c.deliveryDays, d?.deliveryMax, '', 'd')],
    ['Revisions', rangeTxt(d?.revisionsMin, d?.revisionsMax)], ['Packages', String(d?.packageCount ?? c.packages ?? '') || null],
    ['Completed orders', d?.completedOrders != null ? d.completedOrders.toLocaleString('en-US') : null],
    ['Response time', d?.responseTimeHours != null ? `${d.responseTimeHours} h` : null],
    ['Last delivery', relativeAgo(d?.lastDeliveryMs ?? undefined)], ['Member since', monthYear(d?.memberSinceSec ?? undefined)],
    ['Country', (d?.country ?? c.country) ? `${flag(d?.country ?? c.country)} ${d?.country ?? c.country}` : null], ['Languages', d?.languages?.join(', ')],
    ['Tags', d?.tags.join(', ')],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}
