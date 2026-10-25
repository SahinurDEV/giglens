import { describe, expect, it } from 'vitest';
import { dealScore, dealTier } from '../src/lib/dealScore';
import { GigCard } from '../src/extract/types';

const base = (p: Partial<GigCard>): GigCard => ({
  id: '1', url: '/g', title: 't', seller: 's', price: 100, rating: 4.9, reviews: 200, deliveryDays: 3,
  ordersInQueue: 10, favorites: 50, sellerLevel: 'Level 2', isPro: false, isChoice: false, online: false,
  ...p,
} as GigCard);

describe('dealScore', () => {
  it('returns null without rating or price', () => {
    expect(dealScore(base({ rating: null }))).toBeNull();
    expect(dealScore(base({ price: null }))).toBeNull();
  });
  it('scores a strong gig higher than a weak one', () => {
    const strong = dealScore(base({ rating: 5, reviews: 1000, ordersInQueue: 40, price: 50, deliveryDays: 2 }))!;
    const weak = dealScore(base({ rating: 4.2, reviews: 3, ordersInQueue: 0, price: 400, deliveryDays: 14 }))!;
    expect(strong).toBeGreaterThan(weak);
    expect(strong).toBeLessThanOrEqual(100);
  });
  it('tiers scores', () => {
    expect(dealTier(80)).toBe('high');
    expect(dealTier(50)).toBe('mid');
    expect(dealTier(20)).toBe('low');
    expect(dealTier(null)).toBeNull();
  });
});
