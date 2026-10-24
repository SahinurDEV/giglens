import { useState } from 'preact/hooks';
import { GigPage, GigDetails } from '../extract/types';
import { valueScores } from '../lib/score';
import { detailRows, reviewRows } from '../lib/cardRows';
import { t } from '../lib/i18n';
import { GigTools } from './gigTools';
const f = (v: number | null | undefined, s = '') => (v == null ? '–' : v === Infinity ? '∞' : `${v}${s}`);
export function GigPanel({ gig, d, dark }: { gig: GigPage; d: GigDetails | null; dark: boolean }) {
  const [open, setOpen] = useState(true);
  const scores = valueScores(gig.packages); const best = Math.max(...scores.map((s) => s ?? -1));
  if (!open) return <button class={'gl mini' + (dark ? ' dark' : '')} onClick={() => setOpen(true)}>GigLens</button>;
  const pk = d?.pkgs ?? [];
  const feats = [...new Set(pk.flatMap((p) => p.features.map((x) => x.label)))];
  const rows = [...detailRows(d), ...reviewRows(d?.reviewStats)];
  return (<div class={'gl wide' + (dark ? ' dark' : '')}><h2>GigLens · {t('packages')} <button class="x" onClick={() => setOpen(false)}>×</button></h2>
    <table><thead><tr><th>{t('package')}</th>{gig.packages.map((p, i) => <th class={scores[i] === best ? 'best' : ''}>{p.name}</th>)}</tr></thead>
    <tbody>
      <tr><td>{t('price')}</td>{gig.packages.map((p) => <td>{p.price != null ? `$${p.price}` : '–'}</td>)}</tr>
      <tr><td>{t('delivery')}</td>{gig.packages.map((p) => <td>{f(p.deliveryDays, 'd')}</td>)}</tr>
      <tr><td>{t('revisions')}</td>{gig.packages.map((p) => <td>{f(p.revisions)}</td>)}</tr>
      <tr><td>{t('valueScore')}</td>{scores.map((s, i) => <td class={s === best ? 'best' : ''}>{f(s)}</td>)}</tr>
      {pk.some((p) => p.express) && <tr><td>{t('express')}</td>{pk.map((p) => <td>{p.express ? `+$${p.express.price} → ${p.express.days}d` : '–'}</td>)}</tr>}
      {feats.map((name) => <tr class="feat"><td>{name}</td>{pk.map((p) => <td>{p.features.find((x) => x.label === name)?.value ?? (p.addOns.find((a) => a.label === name) ? `+$${p.addOns.find((a) => a.label === name)!.price}` : '–')}</td>)}</tr>)}
    </tbody></table>
    <div class="row"><small>★ {f(gig.rating)} · {f(gig.reviews)} {t('reviews').toLowerCase()} · 🚚 {f(gig.ordersInQueue)} {t('inQueue')}{d?.favorites != null ? ` · ♥ ${d.favorites}` : ''}</small></div>
    {rows.length > 0 && <dl class="kv">{rows.map(([k, v]) => <><dt>{k}</dt><dd>{v}</dd></>)}</dl>}
    <GigTools gig={gig} d={d} />
    <small>Value score is a relative heuristic (revisions and speed per dollar), not a quality rating.</small></div>);
}
