import { words, freq } from './text';
type R = { value: number; date: string; text: string };
const NEG = ['late', 'delay', 'delayed', 'slow', 'poor', 'bad', 'worst', 'disappoint', 'disappointed', 'disappointing', 'refund', 'unresponsive', 'rude', 'issue', 'issues', 'problem', 'problems', 'unprofessional', 'cheap', 'copied', 'plagiarism', 'mistake', 'mistakes', 'wrong', 'never', 'waste', 'unhappy', 'missed', 'cancel', 'cancelled'];
const POS = ['great', 'excellent', 'amazing', 'awesome', 'fast', 'quick', 'professional', 'recommend', 'recommended', 'perfect', 'love', 'loved', 'best', 'fantastic', 'responsive', 'helpful', 'creative', 'patient', 'quality', 'beautiful', 'outstanding', 'friendly', 'satisfied', 'happy', 'talented'];
export interface Analysis { byMonth: [string, number][]; praise: [string, number][]; complaints: [string, number][]; avgRecent: number | null; sample: number; }
/** Analyses the reviews embedded in the page (usually ~5, newest/most relevant first). */
export function analyzeReviews(rs: R[]): Analysis {
  const m = new Map<string, number>(); rs.forEach((r) => r.date && m.set(r.date.slice(0, 7), (m.get(r.date.slice(0, 7)) ?? 0) + 1));
  const tok = rs.map((r) => ({ v: r.value, w: words(r.text) }));
  const praise = freq(tok.filter((x) => x.v >= 4.5).map((x) => x.w.filter((w) => POS.includes(w)))).slice(0, 8);
  const complaints = freq(tok.map((x) => x.w.filter((w) => NEG.includes(w) || (x.v < 4 && !POS.includes(w))))).slice(0, 8);
  return { byMonth: [...m].sort((a, b) => a[0].localeCompare(b[0])), praise, complaints, avgRecent: rs.length ? Math.round((rs.reduce((a, r) => a + r.value, 0) / rs.length) * 100) / 100 : null, sample: rs.length };
}
