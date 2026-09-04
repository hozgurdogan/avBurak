import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readingTimeMinutes } from '../src/lib/reading-time';
import { locales, type Locale } from '../src/i18n/locales';
import { seedArticleGroups, seedCategories } from './content/manifest';

const prisma = new PrismaClient();

/** Cost factor for password hashing. 12 is a deliberate compromise between
 *  resistance to offline cracking and the latency of a single admin login. */
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
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value.trim();
}

/** Content is read from disk rather than embedded so the copy can be reviewed
 *  as prose. cwd is used instead of __dirname because the script is run through
 *  npm scripts, which always execute from the project root. */
function readArticleBody(groupKey: string, locale: Locale): string {
  const file = path.join(process.cwd(), 'prisma', 'content', groupKey, `${locale}.md`);
  return readFileSync(file, 'utf8').trim();
}

async function seedAdmin(): Promise<string> {
  const email = requireEnv('SEED_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Administrator';

  if (PLACEHOLDER_PASSWORDS.has(password)) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is still the placeholder value. Set a real password before seeding.',
    );
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Re-running the seed must not silently reset a password that has since been
  // changed from the admin UI, so the hash is only written on creation.
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: 'ADMIN' },
    create: { email, name, role: 'ADMIN', passwordHash },
  });

  console.log(`  admin user: ${user.email} (${user.role})`);
  return user.id;
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

  console.log(`  categories: ${seedCategories.length} x ${locales.length} translations`);
  return idsBySlug;
}

async function seedArticles(authorId: string, categoryIds: Map<string, string>): Promise<void> {
  for (const group of seedArticleGroups) {
    // The group is keyed by the first locale's slug rather than by an id, so a
    // re-run reuses the existing group instead of creating a duplicate.
    const existing = await prisma.article.findUnique({
      where: { locale_slug: { locale: 'tr', slug: group.translations.tr.slug } },
      select: { groupId: true },
    });

    const groupId =
      existing?.groupId ?? (await prisma.articleGroup.create({ data: {} })).id;

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

      // Category links are rebuilt rather than diffed: the join table is tiny
      // and this keeps the seed authoritative over the manifest.
      await prisma.articleCategory.deleteMany({ where: { articleId: article.id } });
      for (const categorySlug of group.categories) {
        const categoryId = categoryIds.get(categorySlug);
        if (categoryId === undefined) {
          throw new Error(
            `Article "${group.key}" references unknown category "${categorySlug}".`,
          );
        }
        await prisma.articleCategory.create({
          data: { articleId: article.id, categoryId },
        });
      }

      console.log(`  article [${locale}] ${translation.slug} (${readMinutes} min)`);
    }
  }
}

async function main(): Promise<void> {
  console.log('Seeding database...');
  const authorId = await seedAdmin();
  const categoryIds = await seedCategoriesAndTranslations();
  await seedArticles(authorId, categoryIds);
  console.log('Seed complete.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
