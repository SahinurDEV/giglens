export type PageKind = 'search' | 'gig' | 'seller' | 'other';
const RESERVED = new Set(['search', 'categories', 'inbox', 'users', 'pro', 'login', 'join', 'support', 'resources', 'stores', 'cp', 'subcategories', 'gigs', 'pages', 'terms_of_service', 'privacy-policy', 'start_selling', 'seller_dashboard', 'manage_orders', 'logo-maker']);
export function pageKind(pathname: string): PageKind {
  const p = pathname.split('/').filter(Boolean);
  if (p[0] === 'search' || p[0] === 'categories') return 'search';
  if (!p.length || RESERVED.has(p[0])) return 'other';
  return p.length === 1 ? 'seller' : p.length === 2 ? 'gig' : 'other';
}
