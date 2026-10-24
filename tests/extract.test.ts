import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractSearch } from '../src/extract/search';
import { extractGig } from '../src/extract/gig';
import { extractSeller } from '../src/extract/seller';
import { valueScores } from '../src/lib/score';
import { toCsv } from '../src/lib/csv';
import { applyView } from '../src/lib/sort';
import { pageKind } from '../src/content/router';
const doc = (f: string) => new DOMParser().parseFromString(readFileSync(`tests/fixtures/${f}`, 'utf8'), 'text/html');

describe('search', () => {
  it('falls back to DOM', () => { const c = extractSearch(doc('search-dom.html')); expect(c).toHaveLength(8); expect(c[3]).toMatchObject({ id: '1003', price: 90, rating: 4.95, reviews: 2310, sellerLevel: 'New', source: 'dom' }); });
  it('sorts and filters', () => { const c = extractSearch(doc('search-dom.html')); expect(applyView(c, 'price', false, {})[0].price).toBe(15); expect(applyView(c, 'none', true, { minRating: 4.9, minReviews: 100 }).every((x) => x.rating! >= 4.9 && x.reviews! >= 100)).toBe(true); });
  it('exports CSV safely', () => { const csv = toCsv([{ ...extractSearch(doc('search-dom.html'))[0], title: '=HYPERLINK("x")' }]); expect(csv.split('\n')).toHaveLength(2); expect(csv).toContain(`"'=HYPERLINK(""x"")"`); });
});
describe('gig', () => {
  it('DOM packages', () => { const g = extractGig(doc('gig-dom.html'))!; expect(g.source).toBe('dom'); expect(g.packages.map((p) => [p.price, p.deliveryDays, p.revisions])).toEqual([[90, 5, 2], [150, 4, 5], [260, 3, Infinity]]); });
  it('value score', () => { const s = valueScores([{ name: 'a', price: 10, deliveryDays: 1, revisions: 1 }, { name: 'b', price: 100, deliveryDays: 10, revisions: 1 }, { name: 'c', price: null, deliveryDays: 1, revisions: 1 }]); expect(s[0]).toBe(100); expect(s[1]!).toBeLessThan(100); expect(s[2]).toBeNull(); });
});
describe('seller', () => {
  for (const f of ['seller-dom.html']) it(f, () => { const s = extractSeller(doc(f))!; expect(s).toMatchObject({ username: 'logoforge', level: 'Top Rated', rating: 4.95, reviews: 2310, responseTimeHours: 1, memberSince: 'Mar 2017', country: 'Bangladesh', languages: ['English', 'Bengali'], gigCount: 3 }); expect(s.avgGigPrice).toBeCloseTo(111.67); });
});
describe('router', () => { it('classifies', () => { expect(pageKind('/search/gigs')).toBe('search'); expect(pageKind('/logoforge/design-a-logo')).toBe('gig'); expect(pageKind('/logoforge')).toBe('seller'); expect(pageKind('/inbox')).toBe('other'); }); });
