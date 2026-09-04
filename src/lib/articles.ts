import 'server-only';
import { prisma } from '@/lib/prisma';
import { isLocale, type Locale } from '@/i18n/locales';

/**
 * Read model for published articles.
 *
 * Every query here filters on both `locale` and `status`, which is what the
 * `[locale, status]` index in the schema exists for. Drafts are never visible
 * to the public site - the admin reads through its own queries.
 */

export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  readMinutes: number;
  publishedAt: Date | null;
  coverImage: string | null;
  categories: { slug: string; name: string }[];
};

export type ArticleDetail = ArticleCard & {
  contentMd: string;
  metaTitle: string | null;
  metaDescription: string | null;
  groupId: string;
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  readMinutes: true,
  publishedAt: true,
  coverImage: true,
  categories: {
    select: {
      category: {
        select: {
          slug: true,
          translations: { select: { name: true, locale: true } },
        },
      },
    },
  },
} as const;

const detailSelect = {
  ...cardSelect,
  contentMd: true,
  metaTitle: true,
  metaDescription: true,
  groupId: true,
} as const;

type RawCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  readMinutes: number;
  publishedAt: Date | null;
  coverImage: string | null;
  categories: {
    category: { slug: string; translations: { name: string; locale: string }[] };
  }[];
};

type RawDetail = RawCard & {
  contentMd: string;
  metaTitle: string | null;
  metaDescription: string | null;
  groupId: string;
};

function toCard(row: RawCard, locale: Locale): ArticleCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    readMinutes: row.readMinutes,
    publishedAt: row.publishedAt,
    coverImage: row.coverImage,
    categories: row.categories.map(({ category }) => ({
      slug: category.slug,
      // A category translation should always exist for a published locale, but
      // falling back to the slug is better than rendering "undefined".
      name: category.translations.find((tr) => tr.locale === locale)?.name ?? category.slug,
    })),
  };
}

export async function getLatestArticles(locale: Locale, take = 3): Promise<ArticleCard[]> {
  const rows = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take,
    select: cardSelect,
  });

  return rows.map((row) => toCard(row, locale));
}

export type ArticlesQuery = {
  category?: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

export type ArticlesResult = {
  items: ArticleCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Paginated, optionally category- and keyword-filtered article list. */
export async function getArticles(locale: Locale, opts: ArticlesQuery = {}): Promise<ArticlesResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 9;
  const q = opts.q?.trim();

  const where = {
    locale,
    status: 'PUBLISHED',
    ...(opts.category ? { categories: { some: { category: { slug: opts.category } } } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { summary: { contains: q } }] } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: cardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: rows.map((row) => toCard(row, locale)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getArticleBySlug(locale: Locale, slug: string): Promise<ArticleDetail | null> {
  const row: RawDetail | null = await prisma.article.findFirst({
    where: { locale, slug, status: 'PUBLISHED' },
    select: detailSelect,
  });
  if (!row) return null;

  return {
    ...toCard(row, locale),
    contentMd: row.contentMd,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    groupId: row.groupId,
  };
}

/** Slug per locale for the sibling renderings of the same article, for hreflang. */
export async function getArticleAlternates(groupId: string): Promise<Partial<Record<Locale, string>>> {
  const rows = await prisma.article.findMany({
    where: { groupId, status: 'PUBLISHED' },
    select: { locale: true, slug: true },
  });

  const result: Partial<Record<Locale, string>> = {};
  for (const row of rows) {
    if (isLocale(row.locale)) result[row.locale] = row.slug;
  }
  return result;
}

export async function getArticlesByCategory(
  locale: Locale,
  categorySlug: string,
  take = 3,
): Promise<ArticleCard[]> {
  const rows = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED', categories: { some: { category: { slug: categorySlug } } } },
    orderBy: { publishedAt: 'desc' },
    take,
    select: cardSelect,
  });
  return rows.map((row) => toCard(row, locale));
}

/** Other published articles sharing at least one category, for "related articles". */
export async function getRelatedArticles(
  locale: Locale,
  categorySlugs: string[],
  excludeId: string,
  take = 3,
): Promise<ArticleCard[]> {
  if (categorySlugs.length === 0) return [];

  const rows = await prisma.article.findMany({
    where: {
      locale,
      status: 'PUBLISHED',
      id: { not: excludeId },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    orderBy: { publishedAt: 'desc' },
    take,
    select: cardSelect,
  });
  return rows.map((row) => toCard(row, locale));
}

export type CategoryOption = { slug: string; name: string };

export async function getCategories(locale: Locale): Promise<CategoryOption[]> {
  const rows = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    select: { slug: true, translations: { select: { locale: true, name: true } } },
  });

  return rows.map((row) => ({
    slug: row.slug,
    name: row.translations.find((tr) => tr.locale === locale)?.name ?? row.slug,
  }));
}
