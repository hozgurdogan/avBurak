/**
 * Turkish-aware slugify, used to normalise whatever the admin types into an
 * article's slug field - see the note in `prisma/content/manifest.ts` about
 * slugs staying Latin in every locale, including Arabic, "matching the
 * transliteration the admin editor applies when an author types a title".
 * This is that transliteration.
 *
 * Arabic script has no single canonical Latin transliteration, so an Arabic
 * title is not auto-converted - the admin types the slug directly for an
 * Arabic article. If that ever comes back empty (nothing a-z/0-9 in it),
 * `fallback` keeps the field from silently becoming an unusable string.
 */
const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

export function slugify(input: string, fallback = 'makale'): string {
  let value = input;
  for (const [from, to] of Object.entries(TURKISH_MAP)) {
    value = value.split(from).join(to);
  }

  const cleaned = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remaining Latin diacritics (é, ñ, ...)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);

  return cleaned.length > 0 ? cleaned : `${fallback}-${Date.now().toString(36)}`;
}
