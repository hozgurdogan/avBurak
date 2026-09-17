import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/locales';

/**
 * Admin-facing article queries. Unlike `src/lib/articles.ts` (the public read
 * model), these never filter by `status` - a draft has to be visible to the
 * person editing it.
 */

export type AdminArticleRow = {
  id: string;
  slug: string;
  title: string;
  locale: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  categories: string[];
};

export async function getAdminArticles(): Promise<AdminArticleRow[]> {
  const rows = await prisma.article.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      locale: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      categories: { select: { category: { select: { slug: true } } } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    locale: row.locale,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    categories: row.categories.map((c) => c.category.slug),
  }));
}

export type AdminArticleDetail = {
  id: string;
  groupId: string;
  locale: string;
  slug: string;
  title: string;
  summary: string;
  contentMd: string;
  status: string;
  categoryIds: string[];
};

export async function getAdminArticleById(id: string): Promise<AdminArticleDetail | null> {
  const row = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      groupId: true,
      locale: true,
      slug: true,
      title: true,
      summary: true,
      contentMd: true,
      status: true,
      categories: { select: { categoryId: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    groupId: row.groupId,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    contentMd: row.contentMd,
    status: row.status,
    categoryIds: row.categories.map((c) => c.categoryId),
  };
}

export type CategoryOption = { id: string; name: string };

/** All categories, labelled in the admin's current locale - for the
 *  article form's checkbox list. Unlike the public `getCategories`, this
 *  returns the database id (what `ArticleCategory.categoryId` needs), not
 *  the slug. */
export async function getCategoryOptions(locale: Locale): Promise<CategoryOption[]> {
  const rows = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    select: { id: true, slug: true, translations: { select: { locale: true, name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.translations.find((tr) => tr.locale === locale)?.name ?? row.slug,
  }));
}
