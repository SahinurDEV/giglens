import { extractSearch } from '../extract/search';
import { extractGig } from '../extract/gig';
import { extractSeller } from '../extract/seller';
import { pageKind } from './router';
import { mountPanel } from './mount';
import { SearchPanel, decorate } from './SearchPanel';
import { GigPanel } from './GigPanel';
import { SellerPanel } from './SellerPanel';

// Reads only the page the user is viewing. No network requests are made.
function run() {
  const kind = pageKind(location.pathname);
  try {
    if (kind === 'search') { const cards = extractSearch(document); if (cards.length) { decorate(cards); mountPanel(<SearchPanel cards={cards} />); } }
    else if (kind === 'gig') { const g = extractGig(document); if (g?.packages.length) mountPanel(<GigPanel gig={g} />); }
    else if (kind === 'seller') { const s = extractSeller(document); if (s) mountPanel(<SellerPanel s={s} />); }
  } catch (e) { console.debug('[GigLens] extraction failed', e); }
}
let last = '';
const tick = () => { if (location.href !== last) { last = location.href; setTimeout(run, 800); } };
tick(); new MutationObserver(tick).observe(document.documentElement, { childList: true, subtree: true });
