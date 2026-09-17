'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { articleSchema } from '@/lib/validation/article';
import { slugify } from '@/lib/slug';
import { readingTimeMinutes } from '@/lib/reading-time';
import { isLocale } from '@/i18n/locales';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin');
  }
  return user;
}

export type ArticleFormState = {
  status: 'idle' | 'error';
  errorCode?: 'validation' | 'slug-taken' | 'generic';
  fieldErrors?: Partial<Record<'title' | 'slug' | 'summary' | 'contentMd', string>>;
};

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    locale: formData.get('locale'),
    title: formData.get('title'),
    slug: slugify(String(formData.get('slug') ?? '')),
    summary: formData.get('summary'),
    contentMd: formData.get('contentMd'),
    status: formData.get('status'),
    categoryIds: formData.getAll('categoryIds'),
  });
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): ArticleFormState['fieldErrors'] {
  const fieldErrors: ArticleFormState['fieldErrors'] = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (
      (key === 'title' || key === 'slug' || key === 'summary' || key === 'contentMd') &&
      !fieldErrors[key]
    ) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: 'error', errorCode: 'validation', fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const data = parsed.data;
  const readMinutes = readingTimeMinutes(data.contentMd, isLocale(data.locale) ? data.locale : 'tr');

  let articleId: string;
  try {
    const article = await prisma.article.create({
      data: {
        locale: data.locale,
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        contentMd: data.contentMd,
        status: data.status,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        readMinutes,
        group: { create: {} },
        categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
      },
    });
    articleId = article.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'error', errorCode: 'slug-taken', fieldErrors: { slug: 'slug_taken' } };
    }
    return { status: 'error', errorCode: 'generic' };
  }

  // `redirect()` throws internally to interrupt rendering - it must not sit
  // inside the try block above, or this would (incorrectly) report the
  // navigation itself as a failed save.
  revalidatePath('/[locale]/admin/panel/makaleler', 'page');
  redirect(`/admin/panel/makaleler/${articleId}`);
}

export async function updateArticle(
  id: string,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: 'error', errorCode: 'validation', fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const data = parsed.data;
  const readMinutes = readingTimeMinutes(data.contentMd, isLocale(data.locale) ? data.locale : 'tr');

  try {
    const existing = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });

    await prisma.$transaction([
      prisma.articleCategory.deleteMany({ where: { articleId: id } }),
      prisma.article.update({
        where: { id },
        data: {
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          contentMd: data.contentMd,
          status: data.status,
          readMinutes,
          // A first publish stamps the date; re-saving an already-published
          // or still-draft article never moves it.
          publishedAt:
            data.status === 'PUBLISHED' && !existing?.publishedAt ? new Date() : existing?.publishedAt,
          categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        },
      }),
    ]);

    revalidatePath('/[locale]/admin/panel/makaleler', 'page');
    revalidatePath('/[locale]/admin/panel/makaleler/[id]', 'page');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'error', errorCode: 'slug-taken', fieldErrors: { slug: 'slug_taken' } };
    }
    return { status: 'error', errorCode: 'generic' };
  }

  redirect('/admin/panel/makaleler');
}

/**
 * Deletes the article and, if that was the only rendering left in its
 * group, the now-empty `ArticleGroup` too. This editor creates one article
 * per group (see `createArticle` above - `group: { create: {} }`), so
 * without this cleanup every deletion would leave an orphaned, invisible
 * group row behind forever.
 */
export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();

  const article = await prisma.article.findUnique({ where: { id }, select: { groupId: true } });
  if (!article) redirect('/admin/panel/makaleler');

  await prisma.article.delete({ where: { id } });

  const remaining = await prisma.article.count({ where: { groupId: article.groupId } });
  if (remaining === 0) {
    await prisma.articleGroup.delete({ where: { id: article.groupId } }).catch(() => undefined);
  }

  revalidatePath('/[locale]/admin/panel/makaleler', 'page');
  redirect('/admin/panel/makaleler');
}
