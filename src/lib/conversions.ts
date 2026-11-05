import 'server-only';
import { prisma } from '@/lib/prisma';
import { getConsentChoice } from '@/lib/analytics';

export async function recordConversion(name: 'phone_click' | 'whatsapp_click' | 'contact_submit', locale: string, path: string) {
  if (await getConsentChoice() !== 'accepted') return;
  await prisma.conversionEvent.create({ data: { name, locale, path: path.split(/[?#]/)[0]!.slice(0, 191) } });
}
