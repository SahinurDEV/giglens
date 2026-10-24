import { useEffect, useState } from 'preact/hooks';
import { GigPage, GigDetails } from '../extract/types';
import { t } from '../lib/i18n';
import { analyzeReviews } from '../lib/reviewAnalyzer';
import { getWatch, watch, unwatch, recordSnapshot, sparkline, Watched, cleanPath, MAX_WATCH } from '../lib/tracker';

export function GigTools({ gig, d }: { gig: GigPage; d: GigDetails | null }) {
  const path = cleanPath(location.pathname);
  const [w, setW] = useState<Watched | null>(null);
  const snap = { queue: gig.ordersInQueue, reviews: gig.reviews, price: gig.packages[0]?.price ?? null, fav: d?.favorites ?? null };
  const refresh = async () => setW((await getWatch())[path] ?? null);
  useEffect(() => { recordSnapshot(path, snap).then(refresh); }, []);
  const a = d?.reviewStats ? analyzeReviews(d.reviewStats.reviews) : null;
  const toggle = async () => { if (w) await unwatch(path); else if (await watch(path, gig.title)) await recordSnapshot(path, snap); else alert(t('watchCap', { n: MAX_WATCH })); refresh(); };
  return (<div class="tools">
    <div class="row"><button class={w ? 'on' : ''} onClick={toggle}>👁 {w ? t('unwatch') : t('watch')}</button>
      {w && <small>{w.snaps.length} {t('snapshots')} · {t('queue')} <span dangerouslySetInnerHTML={{ __html: sparkline(w.snaps.map((s) => s.queue), 80, 20) }} /> {t('reviews')} <span dangerouslySetInnerHTML={{ __html: sparkline(w.snaps.map((s) => s.reviews), 80, 20, '#0969da') }} /></small>}</div>
    {a && a.sample > 0 && <details class="ra" open><summary>🔎 {t('reviewAnalyzer')} <small>({t('sampleNote', { n: a.sample })})</small></summary>
      <dl class="kv">
        <dt>{t('reviewsOverTime')}</dt><dd>{a.byMonth.map(([m, n]) => <span class="bar-m" title={`${m}: ${n}`}><i style={`height:${6 + n * 6}px`} />{m.slice(2)}</span>)}</dd>
        <dt>{t('praise')}</dt><dd>{a.praise.length ? a.praise.map(([x, n]) => <span class="tag ok">{x} {n}</span>) : '–'}</dd>
        <dt>{t('complaints')}</dt><dd>{a.complaints.length ? a.complaints.map(([x, n]) => <span class="tag miss">{x} {n}</span>) : '–'}</dd>
      </dl></details>}
  </div>);
}
