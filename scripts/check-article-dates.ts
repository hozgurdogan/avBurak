import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
try {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    select: { id: true, slug: true, publishedAt: true, updatedAt: true },
  });
  const invalid = articles.filter((a) => a.publishedAt && a.updatedAt < a.publishedAt);
  console.table(invalid);
  // Inspect and back up first; the default invocation never writes.
  if (process.argv.includes('--apply')) {
    await prisma.$transaction(invalid.map((a) => prisma.article.update({
      where: { id: a.id }, data: { updatedAt: a.publishedAt! },
    })));
    console.log(`Corrected ${invalid.length} date inconsistencies.`);
  }
} finally {
  await prisma.$disconnect();
}
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
