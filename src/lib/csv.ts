import { GigCard } from '../extract/types';
const COLS: (keyof GigCard)[] = ['id', 'title', 'seller', 'sellerLevel', 'price', 'deliveryDays', 'rating', 'reviews', 'ordersInQueue', 'favorites', 'url'];
const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"` : s; };
export const toCsv = (rows: GigCard[]) => [COLS.join(','), ...rows.map((r) => COLS.map((c) => esc(r[c])).join(','))].join('\n');
