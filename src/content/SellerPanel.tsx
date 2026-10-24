import { SellerProfile } from '../extract/types';
export function SellerPanel({ s }: { s: SellerProfile }) {
  const rows: [string, string | null][] = [['Level', s.level], ['Rating', s.rating != null ? `★ ${s.rating} (${s.reviews ?? '?'} reviews)` : null], ['Response time', s.responseTimeHours != null ? `${s.responseTimeHours} h` : null],
    ['Member since', s.memberSince], ['Last delivery', s.lastDelivery], ['Country', s.country], ['Languages', s.languages.join(', ') || null], ['Gigs', s.gigCount != null ? String(s.gigCount) : null], ['Avg. gig price', s.avgGigPrice != null ? `$${s.avgGigPrice}` : null]];
  return (<div class="gl"><h2>GigLens · {s.username}</h2><dl>{rows.map(([k, v]) => (<><dt>{k}</dt><dd>{v ?? '–'}</dd></>))}</dl></div>);
}
