"""Builds small, anonymised fixtures in tests/fixtures/real/ from raw pages in tests/fixtures/live/ (gitignored).
Keeps only the fields GigLens reads; replaces usernames, display names, titles and image URLs."""
import json, re, html, os
L = 'tests/fixtures/live/'; O = 'tests/fixtures/real/'; os.makedirs(O, exist_ok=True)
def state(f):
    return json.loads(re.search(r'<script[^>]*id="perseus-initial-props"[^>]*>(.*?)</script>', open(L + f).read(), re.S).group(1))
def page(st, body=''):
    return f'<!doctype html><html><head><meta charset="utf-8"></head><body>{body}<script id="perseus-initial-props" type="application/json">{json.dumps(st)}</script></body></html>\n'
names = {}
def anon(n): return names.setdefault(n, f'seller_{len(names)+1}')
KEEP = ['is_pro', 'is_fiverr_choice', 'seller_country', 'seller_online', 'seller_rating', 'num_of_packages', 'recurring_options', 'gig_id', 'u_id', 'price_i', 'packages', 'buying_review_rating', 'buying_review_rating_count', 'seller_level']
s = state('search.html'); gigs = []
for i, g in enumerate(s['listings'][0]['gigs'][:12]):
    n = anon(g['seller_name']); x = {k: g[k] for k in KEEP if k in g}
    x.update(gig_id=1000 + i, u_id=f'{1000 + i}_0', title=f'Sample logo gig {i+1}', seller_name=n, gig_url=f'/{n}/sample-gig-{i+1}'); gigs.append(x)
cards = ''.join(f'<div class="gig-card-layout"><div class="gig-wrapper basic-gig-card" data-gig-id="{g["u_id"]}"><a href="{g["gig_url"]}?pos={i}"><p role="heading">{g["title"]}</p></a><p data-track-tag="typography">{dict(top_rated_seller="Top Rated",level_two_seller="Level 2",level_one_seller="Level 1").get(g.get("seller_level"),"")}</p><strong class="rating-score">{round(g["buying_review_rating"],1)}</strong><span class="ratings-count">(<span class="rating-count-number">{"1k+" if g["buying_review_rating_count"]>=1000 else g["buying_review_rating_count"]}</span>)</span><a href="{g["gig_url"]}"><span class="text-bold">From <span>${g["price_i"]}</span></span></a></div></div>' for i, g in enumerate(gigs))
open(O + 'search.html', 'w').write(page({'listings': [{'gigs': gigs}]}, f'<div class="gig_listings-package">{cards}</div>'))
open(O + 'search-dom.html', 'w').write(page({}, f'<div class="gig_listings-package">{cards}</div>').replace('<script id="perseus-initial-props" type="application/json">{}</script>', ''))
g = state('gig.html')
pk = [{k: p.get(k) for k in ['title', 'price', 'duration', 'revisions']} for p in g['packages']['packageList']]
for p in pk: p['revisions'] = {k: p['revisions'][k] for k in ['name', 'included', 'value']}
gs = {'general': {'gigId': 1, 'gigTitle': 'Sample logo gig'}, 'overview': {'gig': {k: g['overview']['gig'][k] for k in ['rating', 'ratingsCount', 'ordersInQueue']}, 'seller': {'username': 'seller_1'}}, 'packages': {'packageList': pk},
      'topNav': {'gigCollectedCount': g['topNav']['gigCollectedCount']}, 'tags': {'tagsGigList': [{'name': t['name']} for t in g['tags']['tagsGigList']]},
      'sellerCard': {k: g['sellerCard'][k] for k in ['ratingsCount', 'rating', 'countryCode', 'responseTime', 'recentDelivery', 'memberSince']},
      'seller': {'completedOrdersCount': g['seller']['completedOrdersCount'], 'user': {'languages': g['seller']['user']['languages']}}, 'reviews': {'breakdown': g['reviews']['breakdown'], 'star_summary': g['reviews']['star_summary'], 'filters_counters': g['reviews']['filters_counters'],
        'reviews': [{k: r[k] for k in ['value', 'created_at', 'reviewer_country_code', 'order_price_range_usd', 'repeat_buyer', 'is_business', 'comment']} for r in g['reviews']['reviews']]},
      'aiSummary': {'summary': g['aiSummary']['summary']}, 'outOfOffice': {'isOnVacation': g['outOfOffice']['isOnVacation'], 'endDate': None}}
gs['seller'].update({k: g['seller'][k] for k in ['isVerified', 'isHighlyResponsive', 'certifications', 'activeStructuredSkills']})
gs['packages']['recurringOptions'] = g['packages']['recurringOptions']
for p, src in zip(gs['packages']['packageList'], g['packages']['packageList']):
    p['features'] = [{k: f[k] for k in ['name', 'label', 'included', 'type', 'value', 'price']} for f in src['features']]
    p['extraFast'] = {k: src['extraFast'][k] for k in ['included', 'duration', 'price']} if src.get('extraFast') else None
    p['customExtras'] = [{k: e[k] for k in ['label', 'buyerTooltip', 'price', 'duration']} for e in src.get('customExtras', [])]
import re as _re
for r in gs['reviews']['reviews']:
    r['comment'] = _re.sub(r'\b(' + '|'.join(_re.escape(x) for x in sorted({w for n in [g['seller']['user'].get('name'), g['seller']['user'].get('fullName'), (g['seller']['user'].get('profile') or {}).get('displayName')] if n for w in [n, *n.split()] if len(w) > 2}, key=len, reverse=True)) + r')\b', 'the seller', r['comment'])
gs = gs
open(O + 'gig.html', 'w').write(page(gs, f'<h1>Sample logo gig</h1><p>{g["overview"]["gig"]["ordersInQueue"]} orders in queue</p>'))
s = state('seller.html'); se = s['seller']; u = se['user']
ss = {'seller': {'user': {'name': 'seller_1', 'joinedAt': u['joinedAt'], 'address': {'countryName': u['address']['countryName']}, 'languages': u['languages']},
      **{k: se[k] for k in ['achievementLevel', 'sellerLevel', 'rating', 'responseTime', 'approvedGigsCount']}},
      'gigsData': [{'gig_id': i + 1, 'price_i': x['price_i']} for i, x in enumerate(s['gigsData'])]}
ss['seller'].update({k: se.get(k) for k in ['isVerified', 'isHighlyResponsive', 'isOnVacation', 'certifications', 'activeStructuredSkills']})
br = s['reviewsData']['buying_reviews']
ss['reviewsData'] = {'buying_reviews': {'total_count': br.get('total_count'), 'breakdown': br.get('breakdown', []), 'filters_counters': br.get('filters_counters', {}),
    'reviews': [{k: r.get(k) for k in ['value', 'created_at', 'reviewer_country_code', 'order_price_range_usd', 'repeat_buyer', 'is_business']} | {'comment': ''} for r in br.get('reviews', [])]}}
open(O + 'seller.html', 'w').write(page(ss))
print({f: os.path.getsize(O + f) for f in os.listdir(O)})
