import { extractGig } from '../extract/gig';
import { extractSeller, extractSellerExtras } from '../extract/seller';
import { parseGigDetails } from '../extract/gigDetails';
import { readPageState } from '../extract/state';
import { pageKind } from './router';
import { mountPanel } from './mount';
import { runSearch } from './search';
import { GigPanel } from './GigPanel';
import { SellerPanel } from './SellerPanel';
import { loadSettings, isDark } from './settings';
import { setLang } from '../lib/i18n';

// Reads the page the user is viewing. On search pages, optionally loads gig pages for cards the user scrolls to (throttled, cached).
async function run() {
  const kind = pageKind(location.pathname);
  const st = await loadSettings(); setLang(st.lang); const dark = isDark(st);
  try {
    if (kind === 'search') { runSearch(); }
    else if (kind === 'gig') { const g = extractGig(document); if (g?.packages.length) mountPanel(<GigPanel gig={g} d={parseGigDetails(readPageState(document))} dark={dark} />); }
    else if (kind === 'seller') { const s = extractSeller(document); if (s) { const x = extractSellerExtras(document); mountPanel(<SellerPanel s={s} cred={x.cred} rs={x.rs} dark={dark} />); } }
  } catch (e) { console.debug('[GigLens] extraction failed', e); }
}
let last = '';
const tick = () => { if (location.href !== last) { last = location.href; setTimeout(run, 800); } };
tick(); new MutationObserver(tick).observe(document.documentElement, { childList: true, subtree: true });
