/**
 * The practice areas, in display order.
 *
 * Only the slugs live here - names and summaries are in `messages/*.json` under
 * `practiceAreas.<slug>`, because they are translated copy rather than data.
 *
 * `sirketler-hukuku`, `tahkim-ve-uyusmazlik-cozumu` and
 * `kisisel-verilerin-korunmasi` still match seeded article categories in the
 * database (`prisma/content/manifest.ts`), so their detail pages can show
 * related articles without a mapping table. The other five are newer
 * additions with no seeded articles yet - their "related articles" section
 * is simply empty until something is published under a matching category.
 * `yabanci-yatirim`, `gayrimenkul-hukuku` and `ticari-sozlesmeler` were
 * dropped from this list (2026-09-18, at the client's request, to move the
 * practice's public focus from corporate/foreign-investment work to labour,
 * enforcement, family and tenancy matters) - their DB categories and any
 * articles under them are untouched, just no longer linked from here.
 */
export const practiceAreaSlugs = [
  'is-hukuku',
  'icra-hukuku',
  'bosanma-aile-hukuku',
  'miras-hukuku',
  'kira-hukuku',
  'sirketler-hukuku',
  'tahkim-ve-uyusmazlik-cozumu',
  'kisisel-verilerin-korunmasi',
] as const;

export type PracticeAreaSlug = (typeof practiceAreaSlugs)[number];

/** Zero-padded ordinal used by the editorial grid ("01 — Şirketler Hukuku"). */
export function practiceAreaNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
