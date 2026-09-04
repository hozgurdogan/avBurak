import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * TEMPORARY, one-time operational route - same rationale as the (already
 * removed) /api/run-seed: this host cannot start a new process to run a
 * script, so a password reset has to happen inside the already-running app
 * process instead. Remove this file once the admin password is confirmed
 * working.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token');
  const newPassword = request.nextUrl.searchParams.get('password');

  if (!process.env.AUTH_SECRET || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!newPassword || newPassword.length < 12) {
    return NextResponse.json({ error: 'password must be at least 12 characters' }, { status: 400 });
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'SEED_ADMIN_EMAIL not set' }, { status: 500 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
