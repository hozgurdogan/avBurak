import 'server-only';
import { prisma } from '@/lib/prisma';
import { locales, type Locale } from '@/i18n/locales';

export type DashboardStats = {
  unreadMessages: number;
  publishedArticles: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [unreadMessages, publishedArticles] = await Promise.all([
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
  ]);
  return { unreadMessages, publishedArticles };
}

export type ArticleStatus = 'PUBLISHED' | 'DRAFT';

export type TranslationMatrixRow = {
  groupId: string;
  /** The clearest available title for the row label - TR first since it is
   * the site's default locale, falling back across languages so a group
   * missing its Turkish rendering still gets a readable label. */
  label: string;
  status: Record<Locale, ArticleStatus | null>;
};

/** One row per `ArticleGroup`, showing which locales it has been published
 * in - the dashboard feature the brief calls "translation-completeness". */
export async function getTranslationMatrix(): Promise<TranslationMatrixRow[]> {
  const groups = await prisma.articleGroup.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      articles: { select: { locale: true, title: true, status: true } },
    },
  });

  return groups.map((group) => {
    const byLocale = new Map(group.articles.map((article) => [article.locale, article]));
    const label =
      byLocale.get('tr')?.title ?? byLocale.get('en')?.title ?? byLocale.get('ar')?.title ?? group.id;

    const status = {} as Record<Locale, ArticleStatus | null>;
    for (const locale of locales) {
      const article = byLocale.get(locale);
      status[locale] = article ? (article.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') : null;
    }

    return { groupId: group.id, label, status };
  });
}
