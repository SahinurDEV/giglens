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

On a gig page
- Basic / Standard / Premium side by side: price, delivery time and revisions, plus orders in queue
- A simple value score that compares the packages with each other

On a seller profile
- Level, rating, response time, member since, country, languages, number of gigs and average gig price

Privacy
GigLens has no server and collects no data. To show orders in queue and favorites, it loads the public page of each gig card you scroll to (two at a time, cached for 6 hours). You can turn this off in the panel. Settings stay on your device.

GigLens is an independent tool. It is not affiliated with, endorsed by, or sponsored by Fiverr. The marketplace may change its pages at any time, which can temporarily break some figures.

## Single purpose
Show extra information about gigs and sellers on the marketplace pages the user is viewing.

## Permission justifications
- **storage:** Saves the user's settings, sort and filter choices, and a 6-hour local cache of gig details so the same gig page is not loaded twice. Nothing leaves the device.
- **Host permission `*://*.fiverr.com/*`:** The content script needs to run on marketplace pages to read the information shown on the page, load the public gig pages for search cards the user scrolls to (throttled, can be turned off), and display the GigLens panel. It does not run on or contact any other site.
- **Remote code:** None. All code is bundled in the package.

## Data usage disclosures
- Collects no user data in any category.
- Not sold to third parties; not used for unrelated purposes; not used for creditworthiness.

## Privacy policy URL
https://sahinurdev.github.io/giglens/privacy.html

## Screenshots (1280×800)
store/screenshots/1-search.png, 2-gig.png, 3-seller.png, 4-card-details.png
