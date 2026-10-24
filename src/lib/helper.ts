import { GigCard } from '../extract/types';
import { words, freq } from './text';
export interface HelperResult { missingTags: [string, number][]; coveredTags: string[]; titleWords: { w: string; n: number; covered: boolean }[]; top: number; tagSample: number; }
/** Compare your title/tags with the top N gigs on the page (titles always; tags when gig details are loaded). */
export function tagTitleHelper(cards: GigCard[], myTitle: string, myTags: string[], n = 10): HelperResult {
  const top = cards.slice(0, n);
  const mine = new Set(myTags.map((x) => x.trim().toLowerCase()).filter(Boolean)); const myWords = new Set(words(myTitle));
  const withTags = top.filter((c) => c.details?.tags.length);
  const tagF = freq(withTags.map((c) => c.details!.tags.map((t) => t.toLowerCase())));
  const titleF = freq(top.map((c) => words(c.title.replace(/^i will /i, ''))));
  return {
    missingTags: tagF.filter(([t, k]) => k >= 2 && !mine.has(t)).slice(0, 12), coveredTags: tagF.filter(([t]) => mine.has(t)).map(([t]) => t),
    titleWords: titleF.filter(([, k]) => k >= 2).slice(0, 15).map(([w, k]) => ({ w, n: k, covered: myWords.has(w) })), top: top.length, tagSample: withTags.length,
  };
}
