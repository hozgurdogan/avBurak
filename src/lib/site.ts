/** The public origin is also needed when building without the server's .env. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://burakugurozturk.av.tr'
).replace(/\/+$/, '');

export const SITE_NAME = 'Av. Burak Uğur Öztürk';

export function languageAlternates(languages: Record<string, string>): Record<string, string> {
  const result = { ...languages };
  const fallback = result.tr ?? result.en ?? result.ar;
  if (fallback) result['x-default'] = fallback;
  return result;
}

export function articleModifiedAt(publishedAt: Date | null, updatedAt: Date): Date {
  return publishedAt && updatedAt < publishedAt ? publishedAt : updatedAt;
}

export function articleExcerpt(text: string, limit = 160): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  const cut = normalized.slice(0, limit - 1);
  const space = cut.lastIndexOf(' ');
  return `${space > limit / 2 ? cut.slice(0, space) : cut}…`;
}
