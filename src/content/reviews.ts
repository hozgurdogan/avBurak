import type { Locale } from '@/i18n/locales';

/**
 * Google review excerpts shown on the contact page.
 *
 * These must be REAL reviews, copied verbatim from the office's own Google
 * Business Profile, with the reviewer's own Google display name and the
 * date the review was posted. Nothing here is invented - a fabricated
 * testimonial presented as a genuine client review would be both a
 * professional-conduct problem (Avukatlık Kanunu m.55 / TBB Reklam Yasağı
 * Yönetmeliği) and simply dishonest, so the array below ships empty and the
 * section that reads it renders nothing until real entries are added.
 *
 * To add a review: open the office's Google Business Profile, copy the
 * text and star rating exactly as written, and add one object per locale
 * below - translate the review text for `en`/`ar` but keep the reviewer's
 * name as they wrote it.
 */
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** ISO date the review was posted, e.g. "2026-03-14". */
  date: string;
};

export const reviews: Record<Locale, Review[]> = {
  tr: [],
  en: [],
  ar: [],
};
