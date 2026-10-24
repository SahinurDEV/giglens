# GigLens – Marketplace Insights

A Chrome (Manifest V3) extension that shows more data on freelance gig pages on fiverr.com: search-result badges with sort/filter/CSV export, a package comparison table with a value score, and a seller stats panel.

> **Not affiliated with Fiverr.** GigLens is an independent project and is not endorsed by or connected to Fiverr International Ltd. "Fiverr" is a trademark of its owner and is used here only to describe compatibility.

![Search results](store/screenshots/1-search.png)
![Gig packages](store/screenshots/2-gig.png)
![Seller stats](store/screenshots/3-seller.png)

_Screenshots are captured with Playwright on offline fixture pages, not live marketplace data._

## Features
| Page | What GigLens adds |
|---|---|
| Search / category | Badges: price, delivery days, seller level, rating, reviews, orders in queue, favorites (if present). Sort, filter (min rating, max price, min reviews), CSV export. |
| Gig | Package table (price, delivery, revisions) + relative value score. |
| Seller profile | Level, rating, response time, member since, last delivery, country, languages, gig count, avg. gig price. |

## Privacy and scope
- Permissions: `storage` + host `*://*.fiverr.com/*` only.
- Reads only the page you are viewing. No background requests, crawling, server, analytics or remote code.
- See [PRIVACY.md](PRIVACY.md) / [hosted policy](https://sahinurdev.github.io/giglens/privacy.html).

## How extraction works
Each page type has an isolated extractor in `src/extract/` that first reads embedded JSON page state (`<script id="perseus-initial-props">` / `__NEXT_DATA__`) and falls back to DOM selectors. Extractors are unit-tested against fixture HTML in `tests/fixtures/`. When the marketplace changes its markup, update the relevant extractor and fixture.

**Value score**: for each package, `(min(revisions,10)+1) / sqrt(deliveryDays) / log2(price+1)`, normalised so the best package in the gig is 100. Unlimited revisions count as 10. It is a relative heuristic, not a quality rating.

## Develop
```bash
npm ci
npm test          # vitest + jsdom on fixtures
npm run build     # dist/ – load unpacked in chrome://extensions
npm run zip       # release/giglens-<version>.zip for store upload
npm run screenshots  # 1280x800 store screenshots (needs `npx playwright install chromium`)
```
Stack: TypeScript, Vite, CRXJS, Preact (UI in a shadow root).

## License
[MIT](LICENSE)
