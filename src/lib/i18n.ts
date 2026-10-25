// UI strings. English is the default; Bengali (bn) is a first draft and needs review by a native speaker.
const en = {
  sort: 'Sort', queue: 'Queue', favorites: 'Favorites', rating: 'Rating', reviews: 'Reviews', price: 'Price', delivery: 'Delivery', completed: 'Completed',
  pageOrder: 'Page order', showing: 'Showing', of: 'of', csv: 'CSV', settings: 'Settings', reset: 'Reset', anyLevel: 'Any level', online: 'Online', rising: 'Rising', deal: 'Deal', bestValue: 'Best value', collapse: 'Collapse', expand: 'Expand', showMore: 'Show more', showLess: 'Show less', filters: 'Filters',
  min: 'min', max: 'max', days: 'days', ratingMin: 'Rating ≥', reviewsMin: 'Reviews ≥', deliveryMax: 'Delivery ≤', topKeywords: 'Top focus keywords', collecting: 'Collected from gig tags as cards load…',
  presets: 'Presets', savePreset: 'Save as preset', presetName: 'Preset name', deletePreset: 'Delete preset', theme: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark', language: 'Language',
  loadDetails: 'Load gig details for visible cards (2 at a time, cached 6 h)', country: 'Country', tagsOnCards: 'Tags on cards', detailsOff: 'Gig details off: queue, favorites and tags unavailable', detailsLoaded: 'Details loaded for {n} gigs',
  insights: 'Market', median: 'median', typicalDelivery: 'typical delivery', totalQueue: 'orders in queue (demand)', gigsLoaded: 'gigs with details',
  moreDetails: 'More details', gigRating: 'Gig rating', sellerRating: 'Seller rating', fiveStar: '5★ share', subRatings: 'Sub-ratings', priceRange: 'Price range', revisions: 'Revisions', packages: 'Packages',
  completedOrders: 'Completed orders', responseTime: 'Response time', lastDelivery: 'Last delivery', memberSince: 'Member since', languages: 'Languages', tags: 'Tags',
  subscription: 'Subscription', express: 'Express', extras: 'Paid extras', aiSummary: 'AI summary', skills: 'Skills', certifications: 'Certifications', verified: 'Verified', highlyResponsive: 'Highly responsive', onVacation: 'On vacation',
  buyerCountries: 'Buyer countries', orderSizes: 'Order sizes', repeatBuyers: 'Repeat buyers', businessBuyers: 'Business buyers', industries: 'Top industries', starBreakdown: 'Star breakdown', sampleNote: 'from {n} reviews on the page',
  features: 'Included', addOns: 'Add-ons', valueScore: 'Value', package: 'Package', inQueue: 'in queue', done: 'done',
  watch: 'Watch', unwatch: 'Unwatch', watchlist: 'Watchlist', pin: 'Pin', unpin: 'Unpin', compare: 'Compare', clear: 'Clear', close: 'Close', helper: 'Tag & title helper', niche: 'Niche score',
  demand: 'Demand', competition: 'Competition', reviewAnalyzer: 'Review analyzer', praise: 'Praise', complaints: 'Complaints', reviewsOverTime: 'Reviews over time', yourTitle: 'Your gig title', yourTags: 'Your tags (comma separated)',
  missingTags: 'Popular tags you are missing', titleWords: 'Common title words in the top 10', covered: 'covered', noData: 'No data yet', dailyRefresh: 'Refresh watched gigs once a day in the background',
  watchCap: 'Watchlist is full ({n} gigs)', snapshots: 'snapshots',
};
export type Key = keyof typeof en;
const bn: Partial<Record<Key, string>> = {
  sort: 'সাজান', queue: 'কিউ', favorites: 'পছন্দ', rating: 'রেটিং', reviews: 'রিভিউ', price: 'দাম', delivery: 'ডেলিভারি', completed: 'সম্পন্ন',
  pageOrder: 'পেজের ক্রম', showing: 'দেখানো হচ্ছে', of: 'এর মধ্যে', settings: 'সেটিংস', reset: 'রিসেট', anyLevel: 'যেকোনো লেভেল', online: 'অনলাইন', rising: 'উদীয়মান', deal: 'ডিল', bestValue: 'বেস্ট ভ্যালু', collapse: 'সংকুচিত', expand: 'প্রসারিত', showMore: 'আরও দেখুন', showLess: 'কম দেখুন', filters: 'ফিল্টার',
  min: 'সর্বনিম্ন', max: 'সর্বোচ্চ', days: 'দিন', ratingMin: 'রেটিং ≥', reviewsMin: 'রিভিউ ≥', deliveryMax: 'ডেলিভারি ≤', topKeywords: 'শীর্ষ কীওয়ার্ড', collecting: 'কার্ড লোড হলে গিগ ট্যাগ থেকে সংগ্রহ করা হচ্ছে…',
  presets: 'প্রিসেট', savePreset: 'প্রিসেট হিসেবে সংরক্ষণ', presetName: 'প্রিসেটের নাম', deletePreset: 'প্রিসেট মুছুন', theme: 'থিম', auto: 'স্বয়ংক্রিয়', light: 'লাইট', dark: 'ডার্ক', language: 'ভাষা',
  loadDetails: 'দৃশ্যমান কার্ডের গিগ বিবরণ লোড করুন (একসাথে ২টি, ৬ ঘণ্টা ক্যাশ)', country: 'দেশ', tagsOnCards: 'কার্ডে ট্যাগ', detailsOff: 'গিগ বিবরণ বন্ধ: কিউ, পছন্দ ও ট্যাগ পাওয়া যাবে না', detailsLoaded: '{n}টি গিগের বিবরণ লোড হয়েছে',
  insights: 'বাজার', median: 'মধ্যমা', typicalDelivery: 'সাধারণ ডেলিভারি', totalQueue: 'কিউতে অর্ডার (চাহিদা)', gigsLoaded: 'বিবরণসহ গিগ',
  moreDetails: 'আরও বিবরণ', gigRating: 'গিগ রেটিং', sellerRating: 'সেলার রেটিং', fiveStar: '৫★ অংশ', subRatings: 'উপ-রেটিং', priceRange: 'দামের পরিসর', revisions: 'রিভিশন', packages: 'প্যাকেজ',
  completedOrders: 'সম্পন্ন অর্ডার', responseTime: 'উত্তরের সময়', lastDelivery: 'শেষ ডেলিভারি', memberSince: 'সদস্য হয়েছেন', languages: 'ভাষা', tags: 'ট্যাগ',
  subscription: 'সাবস্ক্রিপশন', express: 'এক্সপ্রেস', extras: 'অতিরিক্ত সেবা', aiSummary: 'AI সারাংশ', skills: 'দক্ষতা', certifications: 'সার্টিফিকেশন', verified: 'যাচাইকৃত', highlyResponsive: 'দ্রুত উত্তরদাতা', onVacation: 'ছুটিতে',
  buyerCountries: 'ক্রেতার দেশ', orderSizes: 'অর্ডারের আকার', repeatBuyers: 'পুনরায় ক্রেতা', businessBuyers: 'ব্যবসায়িক ক্রেতা', industries: 'শীর্ষ শিল্প', starBreakdown: 'স্টার বিভাজন', sampleNote: 'পেজের {n}টি রিভিউ থেকে',
  features: 'অন্তর্ভুক্ত', addOns: 'অ্যাড-অন', valueScore: 'মূল্যমান', package: 'প্যাকেজ', inQueue: 'কিউতে', done: 'সম্পন্ন',
  watch: 'নজরে রাখুন', unwatch: 'নজর সরান', watchlist: 'নজর তালিকা', pin: 'পিন', unpin: 'আনপিন', compare: 'তুলনা', clear: 'মুছুন', close: 'বন্ধ', helper: 'ট্যাগ ও শিরোনাম সহায়ক', niche: 'নিশ স্কোর',
  demand: 'চাহিদা', competition: 'প্রতিযোগিতা', reviewAnalyzer: 'রিভিউ বিশ্লেষণ', praise: 'প্রশংসা', complaints: 'অভিযোগ', reviewsOverTime: 'সময়ের সাথে রিভিউ', yourTitle: 'আপনার গিগ শিরোনাম', yourTags: 'আপনার ট্যাগ (কমা দিয়ে)',
  missingTags: 'জনপ্রিয় ট্যাগ যা আপনার নেই', titleWords: 'শীর্ষ ১০-এর সাধারণ শিরোনাম শব্দ', covered: 'আছে', noData: 'এখনও তথ্য নেই', dailyRefresh: 'নজরে রাখা গিগ দিনে একবার ব্যাকগ্রাউন্ডে রিফ্রেশ করুন',
  watchCap: 'নজর তালিকা পূর্ণ ({n}টি গিগ)', snapshots: 'স্ন্যাপশট',
};
export type Lang = 'en' | 'bn';
let lang: Lang = 'en';
export const setLang = (l: Lang) => { lang = l; };
export const getLang = () => lang;
export function t(k: Key, vars?: Record<string, string | number>): string {
  let s = (lang === 'bn' ? bn[k] : undefined) ?? en[k];
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
  return s;
}
export const KEYS = Object.keys(en) as Key[];
export const bnKeys = () => Object.keys(bn);
