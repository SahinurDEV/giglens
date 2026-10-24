# Chrome Web Store listing – GigLens

**Name:** GigLens – Marketplace Insights
**Category:** Workflow & Planning
**Language:** English

## Summary (≤132 chars)
See price, delivery time, rating and seller stats at a glance while you browse freelance gig listings.

## Description
GigLens adds a small panel to freelance gig pages on fiverr.com so you can compare options without opening every tab.

On search results
- A sort and filter bar above the results
- A "More details" section on each card: price, delivery and revision ranges, seller rating, response time, member since, languages and tags
- Badges on each card: price, delivery time, seller level, Pro and Choice labels, rating, reviews, orders in queue, favorites, seller's completed orders and country
- Sort by any of these
- Filter by price range, rating, reviews, delivery time, orders in queue, favorites, seller level, Pro, Choice or online sellers
- Top keywords used by the gigs you browse
- Export the visible results to CSV
- Works with results that load as you scroll
- A market summary (price range, typical delivery, orders in queue), saved filter presets and a filter for rising sellers
- Light and dark themes; English and Bengali (beta)

Research tools
- Watch competitor gigs and see daily snapshots of orders in queue, reviews and price as small charts
- A niche score that compares demand with competition for the current search
- A tag and title helper that compares your gig with the top 10 results
- Pin up to four gigs and compare them side by side
- A review analyzer on gig pages

On a gig page
- Every package feature and paid add-on side by side, express delivery prices, paid extras and subscription discounts
- Review statistics, the marketplace's AI summary, and seller skills and certifications
- Basic / Standard / Premium side by side: price, delivery time and revisions, plus orders in queue
- A simple value score that compares the packages with each other

On a seller profile
- Level, rating, response time, member since, country, languages, number of gigs and average gig price

Privacy
GigLens has no server and collects no data. Watched gigs and their daily snapshots stay on your device. To show orders in queue and favorites, it loads the public page of each gig card you scroll to (two at a time, cached for 6 hours). You can turn this off in the panel. Settings stay on your device.

GigLens is an independent tool. It is not affiliated with, endorsed by, or sponsored by Fiverr. The marketplace may change its pages at any time, which can temporarily break some figures.

## Single purpose
Show extra information about gigs and sellers on the marketplace pages the user is viewing.

## Permission justifications
- **storage:** Saves the user's settings, sort and filter choices, and a 6-hour local cache of gig details so the same gig page is not loaded twice. Nothing leaves the device.
- **Host permission `*://*.fiverr.com/*`:** The content script needs to run on marketplace pages to read the information shown on the page, load the public gig pages for search cards the user scrolls to (throttled, can be turned off), and display the GigLens panel. It does not run on or contact any other site.
- **alarms:** Used only when the user turns on "Refresh watched gigs once a day" (off by default). Once a day, it loads the public pages of the gigs the user chose to watch (maximum 20), one at a time, and saves a snapshot locally.
- **Remote code:** None. All code is bundled in the package.

## Data usage disclosures
- Collects no user data in any category.
- Not sold to third parties; not used for unrelated purposes; not used for creditworthiness.

## Privacy policy URL
https://sahinurdev.github.io/giglens/privacy.html

## Screenshots (1280×800)
store/screenshots/1-search.png, 2-gig.png, 3-seller.png, 4-card-details.png, 5-dark-bengali.png, 6-compare.png, 7-watchlist.png, 8-helper.png, 9-review-analyzer.png
