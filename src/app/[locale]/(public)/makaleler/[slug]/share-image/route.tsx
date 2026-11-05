import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { getArticleBySlug } from '@/lib/articles';
import { SITE_NAME } from '@/lib/site';

const size = { width: 1200, height: 630 };
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getArticleBySlug(locale, slug);
  if (!article) notFound();
  const font = await readFile(join(process.cwd(), 'src/assets/fonts/og/ibm-plex-sans-arabic-600.ttf'));
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: 80, background: '#0a1128', color: '#f4f1ea',
      direction: locale === 'ar' ? 'rtl' : 'ltr', textAlign: locale === 'ar' ? 'right' : 'left' }}>
      <div style={{ display: 'flex', color: '#c5a059', fontSize: 28 }}>{SITE_NAME}</div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: article.title.length > 100 ? 44 : 56, lineHeight: 1.3 }}>{article.title}</div>
      <div style={{ display: 'flex', marginTop: 36, fontSize: 22, color: '#c9d0dc' }}>burakugurozturk.av.tr</div>
    </div>,
    { ...size, fonts: [{ name: 'IBM Plex Sans Arabic', data: font, style: 'normal', weight: 600 }] },
  );
}
