'use server';

import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validation/contact';
import { getClientIp, hashIp } from '@/lib/ip';
import { checkRateLimit } from '@/lib/rate-limit';

// A "use server" file may only export async functions - not a constant, not
// even a type re-exported as a value. `ContactFormState` is a type (erased at
// compile time, so it is exempt), but the `contactFormInitialState` object
// that used to live here has moved to the client component that needs it.
export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  errorCode?: 'validation' | 'consent' | 'rate-limit' | 'generic';
  fieldErrors?: Partial<Record<'name' | 'email' | 'phone' | 'subject' | 'message', string>>;
};

/**
 * Server Action behind the contact form. Order of checks matters: the
 * honeypot is checked before anything else touches the database, validation
 * before the rate limiter (an obviously malformed submission should not burn
 * a visitor's quota), and the rate limiter before the write.
 */
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // A real visitor never fills this field in - it is clipped off-screen and
  // unreachable by keyboard (see the `honeypot` utility in globals.css). A
  // bot that fills every field in the DOM trips it. Reply with a fake success
  // rather than an error, so the bot has no signal to adapt to.
  if (String(formData.get('company') ?? '').length > 0) {
    return { status: 'success' };
  }

  const parsed = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    consent: formData.get('consent'),
    locale: formData.get('locale'),
    company: formData.get('company'),
  });

  if (!parsed.success) {
    const issues = parsed.error.issues;
    if (issues.some((issue) => issue.path[0] === 'consent')) {
      return { status: 'error', errorCode: 'consent' };
    }

    const fieldErrors: ContactFormState['fieldErrors'] = {};
    for (const issue of issues) {
      const key = issue.path[0];
      if (
        (key === 'name' || key === 'email' || key === 'phone' || key === 'subject' || key === 'message') &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: 'error', errorCode: 'validation', fieldErrors };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  // 5 submissions per hour per (hashed) IP address.
  const allowed = await checkRateLimit('contact', ipHash, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return { status: 'error', errorCode: 'rate-limit' };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        locale: parsed.data.locale,
        // The moment the consent checkbox was ticked, recorded server-side at
        // submission time rather than trusted from the client.
        consentAt: new Date(),
        ipHash,
      },
    });
  } catch {
    return { status: 'error', errorCode: 'generic' };
  }

  return { status: 'success' };
}
