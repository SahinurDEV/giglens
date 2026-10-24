// Reads embedded JSON page state. Fiverr pages historically ship state in
// <script id="perseus-initial-props" type="application/json">; other ids are tried too.
const IDS = ['perseus-initial-props', '__NEXT_DATA__'];
export function readPageState(doc: Document): any | null {
  for (const id of IDS) {
    const el = doc.getElementById(id);
    if (el?.textContent) { try { return JSON.parse(el.textContent); } catch { /* ignore */ } }
  }
  return null;
}
export const num = (v: unknown): number | null => {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') { const m = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/); if (m) { let n = parseFloat(m[0]); if (/k\b/i.test(v)) n *= 1000; return n; } }
  return null;
};
export const txt = (root: ParentNode, sel: string) => root.querySelector(sel)?.textContent?.trim() ?? '';
/** Deep-find first array whose items satisfy pred. */
export function findArray(obj: any, pred: (x: any) => boolean, depth = 0): any[] | null {
  if (!obj || typeof obj !== 'object' || depth > 8) return null;
  if (Array.isArray(obj) && obj.length && obj.every(pred)) return obj;
  for (const v of Object.values(obj)) { const r = findArray(v, pred, depth + 1); if (r) return r; }
  return null;
}
