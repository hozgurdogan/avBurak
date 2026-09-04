import { PrismaClient } from '@prisma/client';

/**
 * A single PrismaClient per process.
 *
 * Next.js' dev server re-evaluates modules on every hot reload; without the
 * global cache each reload would open a new MySQL connection pool and the
 * process would eventually exhaust the database's max-connections limit. In
 * production the module is evaluated once, so the global is simply unused.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [{ emit: 'stdout', level: 'warn' }, { emit: 'stdout', level: 'error' }]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
