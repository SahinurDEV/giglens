import { extractGig } from '../extract/gig';
import { extractSeller } from '../extract/seller';
import { pageKind } from './router';
import { mountPanel } from './mount';
import { runSearch } from './search';
import { GigPanel } from './GigPanel';
import { SellerPanel } from './SellerPanel';

// Reads the page the user is viewing. On search pages, optionally loads gig pages for cards the user scrolls to (throttled, cached).
function run() {
  const kind = pageKind(location.pathname);
  try {
    if (kind === 'search') { runSearch(); }
    else if (kind === 'gig') { const g = extractGig(document); if (g?.packages.length) mountPanel(<GigPanel gig={g} />); }
    else if (kind === 'seller') { const s = extractSeller(document); if (s) mountPanel(<SellerPanel s={s} />); }
  } catch (e) { console.debug('[GigLens] extraction failed', e); }
}
let last = '';
const tick = () => { if (location.href !== last) { last = location.href; setTimeout(run, 800); } };
tick(); new MutationObserver(tick).observe(document.documentElement, { childList: true, subtree: true });
