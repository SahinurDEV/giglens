// Hooks for 0.5 features (watchlist, pins, niche score, helper). Kept minimal in 0.4.
import { GigCard } from '../extract/types';
export function Extras(_: { numFound: number | null }) { return null; }
export function onDetails(_c: GigCard) {}
export function cardActions(_c: GigCard): HTMLElement | null { return null; }
