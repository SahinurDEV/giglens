# GigLens – Marketplace Insights

A Chrome (Manifest V3) extension that shows more data on freelance gig pages on fiverr.com: search-result badges with sort/filter/CSV export, a package comparison table with a value score, and a seller stats panel.

> **Not affiliated with Fiverr.** GigLens is an independent project and is not endorsed by or connected to Fiverr International Ltd. "Fiverr" is a trademark of its owner and is used here only to describe compatibility.

![Search results](store/screenshots/1-search.png)
![Gig packages](store/screenshots/2-gig.png)
![Seller stats](store/screenshots/3-seller.png)

_Screenshots: the built extension running on locally saved marketplace pages (no live traffic), with seller names replaced and images blurred._

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

## Field coverage (verified on real pages, Oct 24 2026)
| Page | Field | Source |
|---|---|---|
| Search | price, delivery days, seller level, rating, review count | `listings[0].gigs[]` (`price_i`, `packages.recommended.duration`, `seller_level`, `buying_review_rating(_count)`) |
| Search | orders in queue, favorites | **not available** on search pages; shown only if the page ever provides them |
| Gig | package price / delivery / revisions | `packages.packageList[]` (price in cents, duration in hours, revisions `-1` = unlimited) |
| Gig | rating, reviews, orders in queue | `overview.gig` |
| Seller | level, rating, reviews, response time, member since, country, languages, gig count, avg. gig price | `seller`, `seller.user`, `gigsData[]` |
| Seller | last delivery | **not on seller pages** (only on gig pages' seller card) |

Search results are lazy-rendered: page state has ~48 gigs but only ~12 cards exist in the HTML initially; badges and sorting apply to cards present in the page.

## How extraction works
Each page type has an isolated extractor in `src/extract/` that first reads embedded JSON page state (`<script id="perseus-initial-props">` / `__NEXT_DATA__`) and falls back to DOM selectors. Extractors are unit-tested against trimmed, anonymised copies of real pages in `tests/fixtures/real/` (built by `scripts/trim-fixtures.py` from raw pages in the gitignored `tests/fixtures/live/`) plus small synthetic DOM-fallback fixtures. When the marketplace changes its markup, update the relevant extractor and fixture.

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
