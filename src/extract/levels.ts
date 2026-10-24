const MAP: Record<string, string> = {
  top_rated_seller: 'Top Rated', level_two_seller: 'Level 2', level_one_seller: 'Level 1', new_seller: 'New', na: 'New',
  level_trs: 'Top Rated', level_two: 'Level 2', level_one: 'Level 1', no_level: 'New', level_zero: 'New',
  pro: 'Pro', vetted_pro: 'Pro',
};
export function levelName(l: unknown): string | null {
  if (typeof l !== 'string' || !l) return null;
  return MAP[l.toLowerCase()] ?? l.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
export function langName(code: string): string {
  try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code.toLowerCase()) ?? code; } catch { return code; }
}
export function monthYear(epochSec: unknown): string | null {
  if (typeof epochSec !== 'number') return typeof epochSec === 'string' ? epochSec : null;
  return new Date(epochSec * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
export function relativeAgo(ms: unknown, now = Date.now()): string | null {
  if (typeof ms !== 'number') return typeof ms === 'string' ? ms : null;
  const m = Math.max(0, Math.round((now - ms) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}
