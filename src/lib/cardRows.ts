import { GigCard, GigDetails, ReviewStats } from '../extract/types';
import { compact, flag } from './format';
import { relativeAgo, monthYear } from '../extract/levels';
import { t } from './i18n';

export const rangeTxt = (a?: number | null, b?: number | null, pre = '', suf = '') => { const f = (v: number) => (v === Infinity ? '∞' : `${pre}${v}${suf}`); return a == null ? null : a === b || b == null ? f(a) : `${f(a)}–${f(b)}`; };
const pairs = (xs: [string, number][], fmt = (k: string) => k) => (xs.length ? xs.map(([k, n]) => `${fmt(k)} ${n}`).join(' · ') : null);

export function reviewRows(r: ReviewStats | null | undefined): [string, string][] {
  if (!r) return [];
  const note = ` (${t('sampleNote', { n: r.sample })})`;
  const rows: [string, string | null][] = [
    [t('starBreakdown'), r.total ? [5, 4, 3, 2, 1].map((s) => `${s}★ ${Math.round((r.breakdown[s - 1] / r.total) * 1000) / 10}%`).join(' · ') : null],
    [t('buyerCountries'), r.sample ? pairs(r.countries, (c) => `${flag(c)} ${c}`) + note : null],
    [t('orderSizes'), r.sample ? pairs(r.priceRanges) + note : null],
    [t('repeatBuyers'), r.sample ? `${r.repeat}/${r.sample}` : null],
    [t('businessBuyers'), r.businessTotal != null ? `${compact(r.businessTotal)} / ${compact(r.total)}` : r.sample ? `${r.business}/${r.sample}` : null],
    [t('industries'), pairs(r.industries)],
  ];
  return rows.filter((x): x is [string, string] => !!x[1]);
}

export function detailRows(d: GigDetails | null | undefined): [string, string][] {
  if (!d) return [];
  const c = d.credentials;
  const flags = c ? [c.verified && `✓ ${t('verified')}`, c.highlyResponsive && `⚡ ${t('highlyResponsive')}`, c.onVacation && `🏖 ${t('onVacation')}${c.vacationEnd ? ` → ${c.vacationEnd}` : ''}`].filter(Boolean).join(' · ') : '';
  const express = d.pkgs?.filter((p) => p.express).map((p) => `${p.name}: +$${p.express!.price} → ${p.express!.days}d`).join(' · ');
  const rows: [string, string | null | undefined][] = [
    [t('subscription'), d.recurring?.length ? d.recurring.map((r) => `${r.months} mo −${r.pct}%`).join(' · ') : null],
    [t('express'), express || null],
    [t('extras'), d.extras?.length ? d.extras.map((e) => `${e.label} $${e.price}`).join(' · ') : null],
    [t('skills'), c?.skills.join(', ')], [t('certifications'), c?.certifications.join(', ')], ['', flags || null],
    [t('aiSummary'), d.aiSummary?.join(' ')],
  ];
  return rows.filter((x): x is [string, string] => !!x[1]);
}

export function moreRows(c: GigCard): [string, string][] {
  const d = c.details; const rows: [string, string | null | undefined][] = [
    [t('gigRating'), d?.gigRating != null ? `★ ${d.gigRating} (${d.gigReviews ?? c.reviews ?? '?'} ${t('reviews').toLowerCase()})` : c.rating != null ? `★ ${c.rating} (${c.reviews ?? '?'})` : null],
    [t('sellerRating'), (d?.sellerRating ?? c.sellerRating) != null ? `★ ${d?.sellerRating ?? c.sellerRating} (${compact(d?.sellerReviews ?? c.sellerReviews ?? 0)} ${t('reviews').toLowerCase()})` : null],
    [t('fiveStar'), d?.fiveStarShare != null ? `${d.fiveStarShare}%` : null],
    [t('subRatings'), d?.subRatings ? `comm ${d.subRatings.communication} · quality ${d.subRatings.quality} · value ${d.subRatings.value}` : null],
    [t('priceRange'), rangeTxt(d?.priceMin, d?.priceMax, '$')], [t('delivery'), rangeTxt(d?.deliveryMin ?? c.deliveryDays, d?.deliveryMax, '', 'd')],
    [t('revisions'), rangeTxt(d?.revisionsMin, d?.revisionsMax)], [t('packages'), String(d?.packageCount ?? c.packages ?? '') || null],
    [t('subscription'), !d?.recurring?.length && c.recurringPct ? `−${c.recurringPct}%` : null],
    [t('completedOrders'), d?.completedOrders != null ? d.completedOrders.toLocaleString('en-US') : null],
    [t('responseTime'), d?.responseTimeHours != null ? `${d.responseTimeHours} h` : null],
    [t('lastDelivery'), relativeAgo(d?.lastDeliveryMs ?? undefined)], [t('memberSince'), monthYear(d?.memberSinceSec ?? undefined)],
    [t('country'), (d?.country ?? c.country) ? `${flag(d?.country ?? c.country)} ${d?.country ?? c.country}` : null], [t('languages'), d?.languages?.join(', ')],
    [t('tags'), d?.tags.join(', ')],
  ];
  return [...rows.filter((r): r is [string, string] => !!r[1]), ...detailRows(d), ...reviewRows(d?.reviewStats)];
}
