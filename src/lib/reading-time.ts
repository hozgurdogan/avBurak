import type { Locale } from '@/i18n/locales';

/**
 * Words per minute used to estimate reading time.
 *
 * Arabic is set lower than the Latin locales: the same idea takes fewer words
 * in Arabic, so a straight word count would systematically under-report how
 * long an Arabic article takes to read.
 */
const WORDS_PER_MINUTE: Record<Locale, number> = {
  tr: 200,
  en: 220,
  ar: 170,
};

/** Strips Markdown syntax so that link targets and fences are not counted. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their label
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
    .replace(/^\s{0,3}>\s?/gm, '') // block quotes
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '') // list markers
    .replace(/[*_~]/g, '') // emphasis
    .replace(/\|/g, ' ') // table pipes
    .replace(/<[^>]+>/g, ' '); // stray html
}

export function countWords(markdown: string): number {
  const text = toPlainText(markdown).trim();
  if (text.length === 0) return 0;
  return text.split(/\s+/).length;
}

/** Reading time in whole minutes, never less than one. */
export function readingTimeMinutes(markdown: string, locale: Locale): number {
  const words = countWords(markdown);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE[locale]));
}
