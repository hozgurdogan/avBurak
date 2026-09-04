import { NextResponse, type NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { readingTimeMinutes } from '@/lib/reading-time';
import { locales, type Locale } from '@/i18n/locales';
import { seedArticleGroups, seedCategories } from '../../../../prisma/content/manifest';

/**
 * TEMPORARY, one-time operational route.
 *
 * Some shared-hosting accounts (CloudLinux LVE with a near-zero thread/process
 * cap) cannot start a *new* process at all - not `prisma migrate`, not `tsx`,
 * not even a freshly spawned Prisma query engine trying to initialise its own
 * Tokio worker threads panics with "timer has gone away". The one process that
 * *does* work is this Next.js app itself, because its Prisma engine already
 * initialised successfully at boot, before the account's thread budget was
 * this tight. So the seed logic runs here, inside the already-running
 * process, reusing its already-working Prisma Client - instead of as a
 * separate `node prisma/seed.ts` invocation.
 *
 * Remove this file once the database has been seeded. It is not meant to
 * remain part of the deployed app - see the README's "before launch" list.
 */

const BCRYPT_ROUNDS = 12;

const PLACEHOLDER_PASSWORDS = new Set([
  'CHANGE_ME_before_seeding',
  'changeme',
  'password',
  'admin',
]);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value.trim();
}

function readArticleBody(groupKey: string, locale: Locale): string {
  const file = path.join(process.cwd(), 'prisma', 'content', groupKey, `${locale}.md`);
  return readFileSync(file, 'utf8').trim();
}

async function seedAdmin(): Promise<{ id: string; label: string }> {
  const email = requireEnv('SEED_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Administrator';

  if (PLACEHOLDER_PASSWORDS.has(password)) {
    throw new Error('SEED_ADMIN_PASSWORD is still the placeholder value.');
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: 'ADMIN' },
    create: { email, name, role: 'ADMIN', passwordHash },
  });

  return { id: user.id, label: `${user.email} (${user.role})` };
}

async function seedCategoriesAndTranslations(): Promise<Map<string, string>> {
  const idsBySlug = new Map<string, string>();

  for (const category of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { position: category.position },
      create: { slug: category.slug, position: category.position },
    });
    idsBySlug.set(category.slug, record.id);

    for (const locale of locales) {
      await prisma.categoryTr.upsert({
        where: { categoryId_locale: { categoryId: record.id, locale } },
        update: { name: category.names[locale] },
        create: { categoryId: record.id, locale, name: category.names[locale] },
      });
    }
  }

  return idsBySlug;
}

async function seedArticles(authorId: string, categoryIds: Map<string, string>): Promise<string[]> {
  const log: string[] = [];

  for (const group of seedArticleGroups) {
    const existing = await prisma.article.findUnique({
      where: { locale_slug: { locale: 'tr', slug: group.translations.tr.slug } },
      select: { groupId: true },
    });

    const groupId = existing?.groupId ?? (await prisma.articleGroup.create({ data: {} })).id;

    for (const locale of locales) {
      const translation = group.translations[locale];
      const contentMd = readArticleBody(group.key, locale);
      const readMinutes = readingTimeMinutes(contentMd, locale);
      const publishedAt = new Date(group.publishedAt);

      const article = await prisma.article.upsert({
        where: { groupId_locale: { groupId, locale } },
        update: {
          slug: translation.slug,
          title: translation.title,
          summary: translation.summary,
          contentMd,
          readMinutes,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          status: 'PUBLISHED',
          publishedAt,
          authorId,
        },
        create: {
          groupId,
          locale,
          slug: translation.slug,
          title: translation.title,
          summary: translation.summary,
          contentMd,
          readMinutes,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          status: 'PUBLISHED',
          publishedAt,
          authorId,
        },
      });

      await prisma.articleCategory.deleteMany({ where: { articleId: article.id } });
      for (const categorySlug of group.categories) {
        const categoryId = categoryIds.get(categorySlug);
        if (categoryId === undefined) {
          throw new Error(`Article "${group.key}" references unknown category "${categorySlug}".`);
        }
        await prisma.articleCategory.create({ data: { articleId: article.id, categoryId } });
      }

      log.push(`[${locale}] ${translation.slug} (${readMinutes} min)`);
    }
  }

  return log;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token');

  if (!process.env.AUTH_SECRET || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const admin = await seedAdmin();
    const categoryIds = await seedCategoriesAndTranslations();
    const articles = await seedArticles(admin.id, categoryIds);

    return NextResponse.json({
      ok: true,
      admin: admin.label,
      categories: categoryIds.size,
      articles,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
