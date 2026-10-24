import { GigPage } from '../extract/types';
import { valueScores } from '../lib/score';
const f = (v: number | null, s = '') => (v == null ? '–' : v === Infinity ? 'Unlimited' : `${v}${s}`);
export function GigPanel({ gig }: { gig: GigPage }) {
  const scores = valueScores(gig.packages); const best = Math.max(...scores.map((s) => s ?? -1));
  return (<div class="gl"><h2>GigLens · Packages</h2>
    <table><thead><tr><th>Package</th><th>Price</th><th>Delivery</th><th>Revisions</th><th>Value</th></tr></thead>
    <tbody>{gig.packages.map((p, i) => (<tr class={scores[i] === best ? 'best' : ''}><td>{p.name}</td><td>{f(p.price && `$${p.price}` as any)}</td><td>{f(p.deliveryDays, 'd')}</td><td>{f(p.revisions)}</td><td>{f(scores[i])}</td></tr>))}</tbody></table>
    <div class="row"><small>★ {f(gig.rating)} · {f(gig.reviews)} reviews · {f(gig.ordersInQueue)} in queue</small></div>
    <small>Value score is a relative heuristic (revisions and speed per dollar), not a quality rating.</small></div>);
}
