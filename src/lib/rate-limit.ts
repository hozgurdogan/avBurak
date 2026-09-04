import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * A fixed-window limiter backed by the `RateLimit` table rather than an
 * in-memory map: this app runs as a single container with no external cache,
 * and a table survives a restart while a `Map` would not.
 *
 * Returns `true` if the call is allowed (and records it), `false` once the
 * window's quota is spent.
 */
export async function checkRateLimit(
  scope: string,
  key: string,
  opts: { max: number; windowMs: number },
): Promise<boolean> {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({
    where: { scope_key: { scope, key } },
  });

  if (!existing || existing.windowEnd < now) {
    await prisma.rateLimit.upsert({
      where: { scope_key: { scope, key } },
      update: { count: 1, windowEnd: new Date(now.getTime() + opts.windowMs) },
      create: { scope, key, count: 1, windowEnd: new Date(now.getTime() + opts.windowMs) },
    });
    return true;
  }

  if (existing.count >= opts.max) {
    return false;
  }

  await prisma.rateLimit.update({
    where: { scope_key: { scope, key } },
    data: { count: { increment: 1 } },
  });
  return true;
}
