import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';
export default defineManifest({
  manifest_version: 3,
  name: 'GigLens – Marketplace Insights',
  short_name: 'GigLens',
  description: 'Shows price, delivery, rating and seller stats on gig pages you browse. Works locally; no account or server.',
  version: pkg.version,
  icons: { 16: 'icons/16.png', 48: 'icons/48.png', 128: 'icons/128.png' },
  permissions: ['storage'],
  host_permissions: ['*://*.fiverr.com/*'],
  content_scripts: [{ matches: ['*://*.fiverr.com/*'], js: ['src/content/index.tsx'], run_at: 'document_idle' }],
});
