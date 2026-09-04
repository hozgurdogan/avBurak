/**
 * The practice areas, in display order.
 *
 * Only the slugs live here - names and summaries are in `messages/*.json` under
 * `practiceAreas.<slug>`, because they are translated copy rather than data.
 * The slugs intentionally match the seeded article categories so an area can be
 * linked to its writing without a mapping table.
 */
export const practiceAreaSlugs = [
  'sirketler-hukuku',
  'yabanci-yatirim',
  'gayrimenkul-hukuku',
  'ticari-sozlesmeler',
  'tahkim-ve-uyusmazlik-cozumu',
  'kisisel-verilerin-korunmasi',
] as const;

export type PracticeAreaSlug = (typeof practiceAreaSlugs)[number];

/** Zero-padded ordinal used by the editorial grid ("01 — Şirketler Hukuku"). */
export function practiceAreaNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
