import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGigDetails, stateFromHtml } from '../src/extract/gigDetails';
import { extractSearch } from '../src/extract/search';
import { extractSellerExtras } from '../src/extract/seller';
import { moreRows, reviewRows } from '../src/lib/cardRows';
import { insights, median } from '../src/lib/insights';
import { t, setLang, KEYS, bnKeys } from '../src/lib/i18n';
import { matches, isRising } from '../src/lib/sort';

const gig = parseGigDetails(stateFromHtml(readFileSync('tests/fixtures/real/gig.html', 'utf8')), 0)!;
const doc = (f: string) => new DOMParser().parseFromString(readFileSync(`tests/fixtures/real/${f}`, 'utf8'), 'text/html');
afterEach(() => setLang('en'));

describe('packages detail', () => {
  it('features, add-ons, express per package', () => {
    expect(gig.pkgs).toHaveLength(3);
    expect(gig.pkgs![0].features).toContainEqual({ label: 'Number of concepts included', value: '2' });
    expect(gig.pkgs![0].features).toContainEqual({ label: 'Logo transparency', value: '✓' });
    expect(gig.pkgs![0].addOns).toContainEqual({ label: 'Additional revision', price: 25 });
    expect(gig.pkgs![0].express).toEqual({ price: 25, days: 1 });
  });
  it('paid extras and subscription discounts', () => {
    expect(gig.extras![0]).toEqual({ label: 'Top Notch Service', price: 50, days: 3 });
    expect(gig.extras!.length).toBe(6);
    expect(gig.recurring).toEqual([{ months: 3, pct: 15 }, { months: 6, pct: 20 }]);
  });
  it('AI summary and credentials', () => {
    expect(gig.aiSummary!.length).toBeGreaterThan(0);
    expect(gig.credentials).toMatchObject({ skills: ['Logo design', 'Graphic design', 'Minimalist logo design'], certifications: ['Adobe Certification · Adobe · 2013'], verified: false, highlyResponsive: true, onVacation: false });
  });
});

describe('review stats', () => {
  const r = gig.reviewStats!;
  it('breakdown covers all reviews', () => { expect(r.breakdown).toEqual([45, 45, 108, 590, 13532]); expect(r.total).toBe(14320); });
  it('sample stats from embedded reviews', () => { expect(r.sample).toBe(5); expect(r.countries[0]).toEqual(['US', 3]); expect(r.repeat).toBe(1); expect(r.business).toBe(0); expect(r.priceRanges.map((x) => x[0])).toContain('Up to $50'); });
  it('industries', () => { expect(r.industries[0]).toEqual(['technology', 251]); expect(r.businessTotal).toBeGreaterThan(0); });
  it('rows', () => { const m = Object.fromEntries(reviewRows(r)); expect(m['Star breakdown']).toMatch(/^5★ 94\.5%/); expect(m['Buyer countries']).toContain('🇺🇸 US 3'); expect(m['Repeat buyers']).toBe('1/5'); });
});

describe('seller page extras', () => {
  it('credentials + review stats', () => { const x = extractSellerExtras(doc('seller.html')); expect(x.cred?.skills.length).toBe(3); expect(x.cred?.highlyResponsive).toBe(true); expect(x.rs?.sample).toBe(5); expect(x.rs?.total).toBeGreaterThan(14000); });
});

describe('search extras', () => {
  const cards = extractSearch(doc('search.html'));
  it('subscription discount from search data', () => expect(cards[0].recurringPct).toBe(20));
  it('more rows include subscription, express, extras, AI summary, reviews', () => {
    const keys = moreRows({ ...cards[0], details: gig }).map((x) => x[0]);
    for (const k of ['Subscription', 'Express', 'Paid extras', 'Skills', 'Certifications', 'AI summary', 'Star breakdown', 'Buyer countries', 'Order sizes', 'Repeat buyers', 'Business buyers', 'Top industries']) expect(keys).toContain(k);
  });
  it('price insights', () => {
    const i = insights(cards);
    expect(i.count).toBe(12); expect(i.priceMin).toBe(Math.min(...cards.map((c) => c.price!))); expect(i.priceMedian).toBe(median(cards.map((c) => c.price!))); expect(i.totalQueue).toBeNull();
    const j = insights([{ ...cards[0], details: gig }, { ...cards[1], details: { ...gig, ordersInQueue: 9 } }]); expect(j.totalQueue).toBe(90); expect(j.withDetails).toBe(2);
  });
  it('rising-seller filter', () => {
    const fresh = { ...cards[0], reviews: 12, details: { ...gig, ordersInQueue: 8 } };
    expect(isRising(fresh)).toBe(true); expect(isRising({ ...fresh, reviews: 500 })).toBe(false); expect(isRising({ ...fresh, details: { ...gig, ordersInQueue: 1 } })).toBe(false);
    expect(matches(fresh, { rising: true })).toBe(true);
  });
});

describe('i18n', () => {
  it('english default, bengali switch, fallback', () => { expect(t('sort')).toBe('Sort'); setLang('bn'); expect(t('sort')).toBe('সাজান'); expect(t('csv')).toBe('CSV'); expect(t('detailsLoaded', { n: 3 })).toContain('3'); });
  it('bengali covers every key except brand/format ones', () => { const missing = KEYS.filter((k) => !bnKeys().includes(k)); expect(missing).toEqual(['csv']); });
});
