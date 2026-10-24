export interface GigCard { id: string; title: string; url: string; seller: string; sellerLevel: string | null; price: number | null; deliveryDays: number | null; rating: number | null; reviews: number | null; ordersInQueue: number | null; favorites: number | null; source: 'json' | 'dom';
  isPro?: boolean; isChoice?: boolean; country?: string | null; sellerReviews?: number | null; sellerRating?: number | null; packages?: number | null; online?: boolean;
  details?: GigDetails | null; tried?: boolean; recurringPct?: number | null; }
/** Data only available on the gig page itself (fetched on demand). */
export interface GigDetails { ordersInQueue: number | null; favorites: number | null; tags: string[]; sellerReviews: number | null; country: string | null; completedOrders: number | null; responseTimeHours: number | null; lastDeliveryMs: number | null; memberSinceSec: number | null; priceMin: number | null; priceMax: number | null; fiveStarShare: number | null; fetchedAt: number;
  gigRating?: number | null; gigReviews?: number | null; sellerRating?: number | null; deliveryMin?: number | null; deliveryMax?: number | null; revisionsMin?: number | null; revisionsMax?: number | null;
  pkgs?: PkgDetail[]; extras?: { label: string; price: number | null; days: number | null }[]; recurring?: { months: number | null; pct: number | null }[];
  reviewStats?: ReviewStats | null; aiSummary?: string[]; credentials?: Credentials | null;
  languages?: string[]; subRatings?: { communication: number | null; quality: number | null; value: number | null } | null; packageCount?: number | null; }
export interface GigPackage { name: string; price: number | null; deliveryDays: number | null; revisions: number | null; }
export interface GigPage { id: string | null; title: string; seller: string; packages: GigPackage[]; rating: number | null; reviews: number | null; ordersInQueue: number | null; source: 'json' | 'dom'; }
export interface SellerProfile { username: string; level: string | null; rating: number | null; reviews: number | null; responseTimeHours: number | null; memberSince: string | null; lastDelivery: string | null; country: string | null; languages: string[]; gigCount: number | null; avgGigPrice: number | null; source: 'json' | 'dom'; }
export interface PkgFeature { label: string; value: string; }
export interface PkgDetail { name: string; price: number | null; deliveryDays: number | null; revisions: number | null; features: PkgFeature[]; addOns: { label: string; price: number | null }[]; express: { price: number | null; days: number | null } | null; }
export interface ReviewStats { breakdown: number[]; total: number; sample: number; countries: [string, number][]; priceRanges: [string, number][]; repeat: number; business: number; industries: [string, number][]; withSamples: number | null; businessTotal: number | null; reviews: { value: number; date: string; text: string; country: string }[]; }
export interface Credentials { skills: string[]; certifications: string[]; verified: boolean; highlyResponsive: boolean; onVacation: boolean; vacationEnd: string | null; }
