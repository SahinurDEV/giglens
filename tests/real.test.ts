// Tests against trimmed, anonymised copies of real marketplace pages (captured Oct 24, 2026).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractSearch } from '../src/extract/search';
import { extractGig, extractGigDom } from '../src/extract/gig';
import { extractSeller } from '../src/extract/seller';
import { valueScores } from '../src/lib/score';
import { levelName, langName, monthYear } from '../src/extract/levels';
const doc = (f: string) => new DOMParser().parseFromString(readFileSync(`tests/fixtures/real/${f}`, 'utf8'), 'text/html');

describe('real search page', () => {
  const c = extractSearch(doc('search.html'));
  it('reads all gigs from listings[0].gigs', () => expect(c).toHaveLength(12));
  it('maps fields', () => expect(c[0]).toMatchObject({ id: '1000_0', title: 'Sample logo gig 1', seller: 'seller_1', sellerLevel: 'Top Rated', price: 25, deliveryDays: 3, rating: 4.88, reviews: 14320, source: 'json' }));
  it('every gig has price, delivery, rating fields', () => c.forEach((g) => { expect(g.price).toBeGreaterThan(0); expect(g.deliveryDays).toBeGreaterThan(0); expect(g.url).toMatch(/^\//); }));
  it('orders in queue / favorites are absent on search pages', () => c.forEach((g) => { expect(g.ordersInQueue).toBeNull(); expect(g.favorites).toBeNull(); }));
  it('DOM fallback reads price, rating, reviews', () => { const d = extractSearch(doc('search-dom.html')); expect(d).toHaveLength(12); expect(d[0]).toMatchObject({ id: '1000_0', title: 'Sample logo gig 1', sellerLevel: 'Top Rated', price: 25, rating: 4.9, reviews: 1000, url: '/seller_1/sample-gig-1', source: 'dom' }); });  // DOM shows rounded counts like "1k+"
});
describe('real gig page', () => {
  const g = extractGig(doc('gig.html'))!;
  it('converts cents → dollars and hours → days', () => expect(g.packages.map((p) => [p.price, p.deliveryDays])).toEqual([[25, 3], [95, 3], [150, 3]]));
  it('revisions object, -1 = unlimited', () => expect(g.packages.map((p) => p.revisions)).toEqual([3, 5, Infinity]));
  it('overview stats', () => expect(g).toMatchObject({ rating: 4.9, reviews: 14320, ordersInQueue: 81, seller: 'seller_1', source: 'json' }));
  it('value scores computed', () => expect(valueScores(g.packages).every((s) => s != null && s >= 0 && s <= 100)).toBe(true));
  it('DOM fallback needs a package table (absent on real pages)', () => expect(extractGigDom(doc('gig.html'))).toBeNull());
});
describe('real seller page', () => {
  const s = extractSeller(doc('seller.html'))!;
  it('maps fields', () => expect(s).toMatchObject({ username: 'seller_1', level: 'Top Rated', rating: 4.9, reviews: 14453, responseTimeHours: 1, memberSince: 'Oct 2018', country: 'Pakistan', languages: ['English'], gigCount: 4, avgGigPrice: 62.5, source: 'json' }));
  it('last delivery is not on seller pages', () => expect(s.lastDelivery).toBeNull());
});
describe('helpers', () => {
  it('levels', () => { expect(levelName('LEVEL_TRS')).toBe('Top Rated'); expect(levelName('TOP_RATED_SELLER')).toBe('Top Rated'); expect(levelName('level_two_seller')).toBe('Level 2'); expect(levelName(undefined)).toBeNull(); });
  it('lang + date', () => { expect(langName('EN')).toBe('English'); expect(monthYear(1538394513)).toBe('Oct 2018'); });
});
