# GigLens Privacy Policy

_Last updated: October 24, 2026 (v0.5.0)_

GigLens is a browser extension that adds a small information panel to marketplace pages you open on fiverr.com.

**What it reads.** The fiverr.com page you are viewing. On search results, if "Load gig details" is on (default; you can switch it off in the panel), GigLens also loads the public page of each gig card you scroll into view, two at a time, to read orders in queue, favorites and tags. It never crawls beyond the cards you see and never contacts any other site.

**Watchlist.** If you watch a gig, GigLens saves one snapshot per day (orders in queue, review count, price, favorites) on your device when you visit that gig or it appears in your search results. If you turn on "Refresh watched gigs once a day" (off by default), GigLens loads each watched gig page at most once a day in the background, one at a time, using the `alarms` permission. At most 20 gigs can be watched.

**What it stores.** Your settings, sort and filter choices, a 6-hour cache of gig details, saved presets, pinned gigs and the watchlist, all in `chrome.storage.local` on your own device.

**What it sends.** Nothing. GigLens has no server, no analytics, no ads and no tracking. No data is sold or shared with anyone. CSV exports are generated in your browser and saved only where you choose.

**Permissions.** `storage` (settings, cache, watchlist), `alarms` (optional daily watchlist refresh) and access to `fiverr.com` pages (to display the panel).

**Contact.** Open an issue at https://github.com/SahinurDEV/giglens/issues.

GigLens is an independent project and is not affiliated with, endorsed by, or sponsored by Fiverr International Ltd.
