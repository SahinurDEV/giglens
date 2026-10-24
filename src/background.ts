// Optional daily refresh of watched gigs (off by default; Settings → "Refresh watched gigs once a day").
// At most once per day per gig, at most MAX_WATCH gigs, one request at a time with a 3 s gap. Only fiverr.com gig pages.
import { getWatch, setWatch, snapInto, needsRefresh } from './lib/tracker';
import { parseGigDetails, stateFromHtml } from './extract/gigDetails';

const ALARM = 'giglens-daily';
chrome.runtime.onInstalled.addListener(() => chrome.alarms.create(ALARM, { periodInMinutes: 24 * 60, delayInMinutes: 5 }));
chrome.runtime.onStartup.addListener(async () => { if (!(await chrome.alarms.get(ALARM))) chrome.alarms.create(ALARM, { periodInMinutes: 24 * 60, delayInMinutes: 5 }); });

chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name !== ALARM) return;
  const { settings } = await chrome.storage.local.get('settings');
  if (!(settings as { dailyRefresh?: boolean } | undefined)?.dailyRefresh) return;
  let m = await getWatch();
  for (const [path, w] of Object.entries(m)) {
    if (!needsRefresh(w) || !/^\/[\w.-]+\/[\w.-]+$/.test(path)) continue;
    try {
      const html = await (await fetch('https://www.fiverr.com' + path, { credentials: 'omit' })).text();
      const d = parseGigDetails(stateFromHtml(html));
      if (d) m = snapInto(m, path, { queue: d.ordersInQueue, reviews: d.gigReviews ?? null, price: d.priceMin, fav: d.favorites });
    } catch { /* skip */ }
    await new Promise((r) => setTimeout(r, 3000));
  }
  await setWatch(m);
});
