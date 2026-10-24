import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGigDetails, stateFromHtml } from '../src/extract/gigDetails';
import { extractSearch } from '../src/extract/search';
import { addTo, snapInto, needsRefresh, sparkline, MAX_WATCH, MAX_SNAPS, WatchMap } from '../src/lib/tracker';
import { nicheScore } from '../src/lib/niche';
import { analyzeReviews } from '../src/lib/reviewAnalyzer';
import { tagTitleHelper } from '../src/lib/helper';
import { words } from '../src/lib/text';

const gig = parseGigDetails(stateFromHtml(readFileSync('tests/fixtures/real/gig.html', 'utf8')), 0)!;
const cards = extractSearch(new DOMParser().parseFromString(readFileSync('tests/fixtures/real/search.html', 'utf8'), 'text/html'));
const D = (s: string) => Date.parse(s + 'T12:00:00Z');

describe('competitor tracker', () => {
  it('adds, caps at MAX_WATCH, ignores query strings', () => {
    let m: WatchMap = {};
    for (let i = 0; i < MAX_WATCH; i++) m = addTo(m, `/s/g${i}?x=1`, `g${i}`).map;
    expect(Object.keys(m)).toHaveLength(MAX_WATCH); expect(m['/s/g0']).toBeDefined();
    expect(addTo(m, '/s/extra', 'x').ok).toBe(false); expect(addTo(m, '/s/g1', 'dup').ok).toBe(true);
  });
  it('one snapshot per day, sorted, capped', () => {
    let m = addTo({}, '/s/g', 'g').map;
    m = snapInto(m, '/s/g', { queue: 5, reviews: 10, price: 20, fav: 1 }, D('2026-10-01'));
    m = snapInto(m, '/s/g', { queue: 7, reviews: 11, price: 20, fav: 1 }, D('2026-10-01'));
    m = snapInto(m, '/s/g', { queue: 9, reviews: 12, price: 25, fav: 2 }, D('2026-10-02'));
    expect(m['/s/g'].snaps.map((s) => [s.d, s.queue])).toEqual([['2026-10-01', 7], ['2026-10-02', 9]]);
    expect(needsRefresh(m['/s/g'], D('2026-10-02'))).toBe(false); expect(needsRefresh(m['/s/g'], D('2026-10-03'))).toBe(true);
    for (let i = 0; i < MAX_SNAPS + 10; i++) m = snapInto(m, '/s/g', { queue: i, reviews: i, price: 1, fav: 1 }, D('2026-01-01') + i * 864e5);
    expect(m['/s/g'].snaps.length).toBe(MAX_SNAPS);
    expect(snapInto({}, '/not/watched', { queue: 1, reviews: 1, price: 1, fav: 1 })).toEqual({});
  });
  it('sparkline svg', () => { const s = sparkline([1, 3, null, 2]); expect(s).toContain('<polyline'); expect(s.match(/,/g)!.length).toBe(3); expect(sparkline([4])).toContain('>4<'); });
});

describe('niche score', () => {
  it('needs ≥3 gigs with queue data', () => expect(nicheScore(cards, 171791)).toBeNull());
  it('scores demand vs competition', () => {
    const withQ = (q: number[]) => cards.slice(0, q.length).map((c, i) => ({ ...c, details: { ...gig, ordersInQueue: q[i] } }));
    const hot = nicheScore(withQ([40, 60, 80, 90]), 1000)!; const cold = nicheScore(withQ([0, 0, 1, 0]), 171791)!;
    expect(hot.score).toBeGreaterThan(cold.score); expect(hot.label).toBe('High'); expect(cold.label).toBe('Low'); expect(hot.medianQueue).toBe(70);
  });
});

describe('review analyzer', () => {
  const a = analyzeReviews(gig.reviewStats!.reviews);
  it('groups by month', () => expect(a.byMonth).toEqual([['2026-08', 1], ['2026-09', 4]]));
  it('praise keywords from positive reviews', () => { expect(a.praise.length).toBeGreaterThan(0); expect(a.sample).toBe(5); expect(a.avgRecent).toBeCloseTo(4.94); });
  it('complaints from negative words / low ratings', () => {
    const b = analyzeReviews([{ value: 2, date: '2026-01-02', text: 'Delivery was late and the quality was poor' }, { value: 5, date: '2026-01-05', text: 'Great and fast, but one small issue' }]);
    expect(b.complaints.map((x) => x[0])).toEqual(expect.arrayContaining(['late', 'poor', 'issue'])); expect(b.praise.map((x) => x[0])).toEqual(expect.arrayContaining(['great', 'fast']));
  });
});

describe('tag & title helper', () => {
  it('missing tags and title words vs top 10', () => {
    const top = cards.map((c, i) => ({ ...c, title: ['minimalist logo design for brand', 'modern minimalist logo', 'business logo design'][i % 3], details: i < 4 ? gig : c.details }));
    const r = tagTitleHelper(top, 'I will design a minimalist logo', ['logo', 'create logo']);
    expect(r.top).toBe(10); expect(r.tagSample).toBe(4);
    expect(r.coveredTags).toEqual(expect.arrayContaining(['logo', 'create logo'])); expect(r.missingTags.map((x) => x[0])).not.toContain('logo');
    expect(r.titleWords.find((x) => x.w === 'minimalist')).toMatchObject({ covered: true }); expect(r.titleWords.find((x) => x.w === 'business')?.covered).toBe(false);
  });
  it('word tokenizer drops stopwords', () => expect(words('I will design THE best logo, for you!')).toEqual(['design', 'best', 'logo']));
});
