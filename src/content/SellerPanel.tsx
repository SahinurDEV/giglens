import { SellerProfile, Credentials, ReviewStats } from '../extract/types';
import { reviewRows } from '../lib/cardRows';
import { t } from '../lib/i18n';
export function SellerPanel({ s, cred, rs, dark }: { s: SellerProfile; cred: Credentials | null; rs: ReviewStats | null; dark: boolean }) {
  const flags = cred ? [cred.verified && `✓ ${t('verified')}`, cred.highlyResponsive && `⚡ ${t('highlyResponsive')}`, cred.onVacation && `🏖 ${t('onVacation')}`].filter(Boolean).join(' · ') : '';
  const rows: [string, string | null][] = [['Level', s.level], [t('rating'), s.rating != null ? `★ ${s.rating} (${s.reviews ?? '?'} ${t('reviews').toLowerCase()})` : null], [t('responseTime'), s.responseTimeHours != null ? `${s.responseTimeHours} h` : null],
    [t('memberSince'), s.memberSince], [t('lastDelivery'), s.lastDelivery], [t('country'), s.country], [t('languages'), s.languages.join(', ') || null], ['Gigs', s.gigCount != null ? String(s.gigCount) : null], ['Avg. gig price', s.avgGigPrice != null ? `$${s.avgGigPrice}` : null],
    [t('skills'), cred?.skills.join(', ') || null], [t('certifications'), cred?.certifications.join(', ') || null], ['', flags || null], ...reviewRows(rs)];
  return (<div class={'gl' + (dark ? ' dark' : '')}><h2>GigLens · {s.username}</h2><dl>{rows.filter(([k, v]) => k || v).map(([k, v]) => (<><dt>{k}</dt><dd>{v ?? '–'}</dd></>))}</dl></div>);
}
