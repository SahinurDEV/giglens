export interface Settings { enrich: boolean; showTags: boolean; showKeywords: boolean; showCountry: boolean; theme: 'auto' | 'light' | 'dark'; lang: 'en' | 'bn'; dailyRefresh: boolean; }
export const DEFAULTS: Settings = { enrich: true, showTags: false, showKeywords: true, showCountry: true, theme: 'light', lang: 'en', dailyRefresh: false };
/** Search overlays stay light to match Fiverr; floating panels follow saved theme only when explicitly dark. */
export const isDark = (s: Settings) => s.theme === 'dark';
export async function loadSettings(): Promise<Settings> { try { const r = await chrome.storage.local.get('settings'); return { ...DEFAULTS, ...(r.settings as Partial<Settings>) }; } catch { return DEFAULTS; } }
export function saveSettings(s: Settings) { try { chrome.storage.local.set({ settings: s }); } catch { /* ignore */ } }
