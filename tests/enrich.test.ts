import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGigDetails, stateFromHtml } from '../src/extract/gigDetails';
import { EnrichQueue } from '../src/lib/enrich';
import { applyView, matches, topKeywords, val } from '../src/lib/sort';
import { extractSearch } from '../src/extract/search';
import { toCsv } from '../src/lib/csv';
import { flag, compact } from '../src/lib/format';

const gigHtml = readFileSync('tests/fixtures/real/gig.html', 'utf8');
const searchDoc = () => new DOMParser().parseFromString(readFileSync('tests/fixtures/real/search.html', 'utf8'), 'text/html');

describe('gig details (real gig page state)', () => {
  const d = parseGigDetails(stateFromHtml(gigHtml), 0)!;
  it('orders in queue, favorites, seller reviews, country', () => expect(d).toMatchObject({ ordersInQueue: 81, favorites: 19487, sellerReviews: 14453, country: 'PK' }));
  it('extra fields', () => expect(d).toMatchObject({ completedOrders: 25344, responseTimeHours: 1, priceMin: 25, priceMax: 150, fiveStarShare: 94.5 }));
  it('tags', () => { expect(d.tags.length).toBeGreaterThan(2); expect(d.tags[0]).toBe('create logo'); });
  it('returns null for non-gig html', () => expect(parseGigDetails(stateFromHtml('<html></html>'))).toBeNull());
});

describe('enrich queue', () => {
  it('limits concurrency to 2, dedupes, rejects non-gig paths', async () => {
    let active = 0, peak = 0, calls = 0;
    const fetcher = async () => { calls++; active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 15)); active--; return gigHtml; };
    const q = new EnrichQueue(2, 0, fetcher);
    const paths = ['/a/one', '/b/two', '/c/three', '/d/four', '/e/five', '/a/one?x=1'];
    const res = await Promise.all(paths.map((p) => q.get(p)));
    expect(peak).toBe(2); expect(calls).toBe(5); expect(res.every((r) => r?.ordersInQueue === 81)).toBe(true);
    expect(await q.get('https://evil.example/x')).toBeNull(); expect(await q.get('/search/gigs?query=x')).toBeNull();
  });
  it('survives fetch errors', async () => { const q = new EnrichQueue(2, 0, async () => { throw new Error('403'); }); expect(await q.get('/x/y')).toBeNull(); });
});

describe('filters on real search data', () => {
  const cards = extractSearch(searchDoc());
  it('search cards carry pro/choice/country/seller reviews', () => { expect(cards[0]).toMatchObject({ country: expect.any(String), sellerReviews: expect.any(Number) }); expect(cards.some((c) => c.isChoice || c.isPro) || cards.every((c) => c.isPro === false)).toBe(true); });
  it('every numeric filter', () => {
    const d = { ...parseGigDetails(stateFromHtml(gigHtml), 0)! };
    const c = { ...cards[0], details: d };
    expect(matches(c, { priceMin: 20, priceMax: 30, ratingMin: 4.8, reviewsMin: 1000, deliveryMax: 3, queueMin: 50, queueMax: 100, favoritesMin: 1000, levels: ['Top Rated'] })).toBe(true);
    for (const f of [{ priceMax: 10 }, { ratingMin: 5 }, { reviewsMin: 1e6 }, { deliveryMax: 1 }, { queueMax: 10 }, { favoritesMin: 1e6 }, { levels: ['Level 1'] }, { proOnly: true }])
      expect(matches(c, f)).toBe(false);
    expect(matches(cards[0], { queueMin: 1 })).toBe(false); // unknown queue fails a min filter
  });
  it('sorts by fetched queue with unknowns last', () => {
    const d = parseGigDetails(stateFromHtml(gigHtml), 0)!;
    const withQ = cards.map((c, i) => (i === 3 ? { ...c, details: { ...d, ordersInQueue: 500 } } : i === 5 ? { ...c, details: d } : c));
    const v = applyView(withQ, 'ordersInQueue', true, {});
    expect(val(v[0], 'ordersInQueue')).toBe(500); expect(val(v[1], 'ordersInQueue')).toBe(81); expect(val(v[2], 'ordersInQueue')).toBeNull();
  });
  it('top keywords count each gig once', () => { const d = parseGigDetails(stateFromHtml(gigHtml), 0)!; const k = topKeywords([{ ...cards[0], details: d }, { ...cards[1], details: d }, cards[2]]); expect(k[0].count).toBe(2); });
  it('CSV has queue/favorites/tags columns', () => { const csv = toCsv([{ ...cards[0], details: parseGigDetails(stateFromHtml(gigHtml), 0)! }]); expect(csv.split('\n')[0]).toContain('ordersInQueue,favorites'); expect(csv).toContain(',81,19487,'); });
});
it('format helpers', () => { expect(flag('PK')).toBe('🇵🇰'); expect(flag(null)).toBe(''); expect(compact(19487)).toBe('19.5k'); expect(compact(81)).toBe('81'); });
