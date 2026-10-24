import { GigPackage } from '../extract/types';
/** 0–100. Rewards low price per day of turnaround and more revisions, relative to siblings. Heuristic, documented in README. */
export function valueScores(pk: GigPackage[]): (number | null)[] {
  const raw = pk.map((p) => {
    if (p.price == null || p.price <= 0) return null;
    const rev = p.revisions == null ? 1 : p.revisions === Infinity ? 10 : Math.min(p.revisions, 10) + 1;
    const speed = p.deliveryDays ? 1 / Math.sqrt(p.deliveryDays) : 0.5;
    return (rev * speed) / Math.log2(p.price + 1);
  });
  const max = Math.max(...raw.filter((x): x is number => x != null), 0);
  return raw.map((r) => (r == null || max === 0 ? null : Math.round((r / max) * 100)));
}
