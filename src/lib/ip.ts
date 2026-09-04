import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

const salt = process.env.IP_HASH_SALT ?? '';

/**
 * Best-effort client IP behind a reverse proxy (cPanel's Apache/Passenger
 * front end sets `x-forwarded-for`; `x-real-ip` covers the rest). There is no raw socket
 * address available to a Next.js Server Action, and that is fine - the value
 * is only ever hashed before use, never displayed or stored as-is.
 */
export async function getClientIp(): Promise<string> {
  const list = await headers();
  const forwarded = list.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return list.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Salted, one-way hash. KVKK data minimisation: the raw IP address is never
 * written to disk anywhere in this codebase, only this digest - used for rate
 * limiting and abuse review, and not reversible back to the address.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}
