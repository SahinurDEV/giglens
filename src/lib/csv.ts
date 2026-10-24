import { GigCard } from '../extract/types';
import { val } from './sort';
const COLS: [string, (c: GigCard) => unknown][] = [
  ['id', (c) => c.id], ['title', (c) => c.title], ['seller', (c) => c.seller], ['level', (c) => c.sellerLevel], ['pro', (c) => c.isPro], ['choice', (c) => c.isChoice],
  ['country', (c) => c.details?.country ?? c.country], ['price', (c) => c.price], ['deliveryDays', (c) => c.deliveryDays], ['rating', (c) => c.rating], ['reviews', (c) => c.reviews],
  ['ordersInQueue', (c) => val(c, 'ordersInQueue')], ['favorites', (c) => val(c, 'favorites')], ['sellerReviews', (c) => val(c, 'sellerReviews')], ['completedOrders', (c) => val(c, 'completedOrders')],
  ['tags', (c) => c.details?.tags.join('; ')], ['url', (c) => c.url],
];
const esc = (v: unknown) => { const s = v == null ? '' : String(v); const f = /^[=+\-@]/.test(s); return /[",\n]/.test(s) || f ? `"${(f ? "'" : '') + s.replace(/"/g, '""')}"` : s; };
export const toCsv = (rows: GigCard[]) => [COLS.map((c) => c[0]).join(','), ...rows.map((r) => COLS.map(([, g]) => esc(g(r))).join(','))].join('\n');
