import 'server-only';
import bcrypt from 'bcryptjs';

// 12 rounds: noticeably slower than bcryptjs's default 10 (a deliberate cost
// increase against offline brute force of a stolen hash) while staying well
// under a second on the modest CPU a shared-hosting Node app actually gets.
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * A valid bcrypt hash of a value nobody will ever type, computed once at
 * process start. The login action compares against this when the submitted
 * email matches no user, so the response takes roughly the same time either
 * way - an attacker cannot distinguish "no such account" from "wrong
 * password" by timing.
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('no-account-has-this-password', SALT_ROUNDS);
