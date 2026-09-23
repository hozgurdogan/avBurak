import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';
import { practiceAreaSlugs } from '@/content/practice-areas';
import { serviceRegionSlugs } from '@/content/service-regions';
import { toolSlugs } from '@/lib/tools/registry';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Static paths that exist, identically, under every locale. `''` is the
 *  home page. */
const staticPaths = [
  '',
  'calisma-alanlari',
  'profil',
  'makaleler',
  'hesaplama-araclari',
  'bolgeler',
  'sss',
  'iletisim',
  'kvkk',
  'gizlilik',
];

function url(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path ? `/${path}` : ''}`;
}

/**
 * `/sitemap.xml` returned HTTP 404 before this file - the SEO audit's other
 * P0 finding, alongside robots.ts. Not statically generated: articles are
 * edited through the admin panel and read live from the database (same
 * reasoning as `makaleler/[slug]/page.tsx`), so a newly published article
 * appears here on its next request rather than waiting for a
 * rebuild-and-redeploy of this whole site.
 */
// Without this, Next tries to execute the DB query below at build time to
// produce a static file - which both fails on a build machine with no DB
// access and would bake in stale article data. `force-dynamic` defers
// execution to each request on the server instead.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: url(locale, path),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
      });
    }
    for (const slug of practiceAreaSlugs) {
      entries.push({ url: url(locale, `calisma-alanlari/${slug}`), changeFrequency: 'monthly', priority: 0.8 });
    }
    for (const slug of serviceRegionSlugs) {
      entries.push({ url: url(locale, `bolgeler/${slug}`), changeFrequency: 'monthly', priority: 0.75 });
    }
    for (const slug of toolSlugs) {
      entries.push({ url: url(locale, `hesaplama-araclari/${slug}`), changeFrequency: 'monthly', priority: 0.6 });
    }
  }

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { locale: true, slug: true, updatedAt: true },
  });

  for (const article of articles) {
    entries.push({
      url: url(article.locale, `makaleler/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.65,
    });
  }

  return entries;
}
