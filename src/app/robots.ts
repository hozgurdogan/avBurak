import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * `/robots.txt` and `/sitemap.xml` returned HTTP 404 before this file - the
 * SEO audit's single P0 finding (rapor/, 2026-09-18). Next.js serves this
 * file's return value at the `/robots.txt` route automatically; nothing else
 * needs to change for that URL to start responding.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
