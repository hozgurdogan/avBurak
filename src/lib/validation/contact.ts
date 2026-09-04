import { z } from 'zod';
import { locales } from '@/i18n/locales';

/**
 * Shared between the server action and (were it ever needed) client-side
 * pre-validation - one schema, not two copies that can drift.
 *
 * `consent` must be the literal `'yes'`, which is the checkbox's `value`. An
 * unchecked box is simply absent from the FormData, which fails this check
 * the same way an explicit `false` would - there is no default-checked path.
 * `website` is the honeypot: a real submission always leaves it empty.
 */
export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'too_short').max(120, 'too_long'),
  email: z.string().trim().min(1, 'required').email('invalid_email').max(180, 'too_long'),
  phone: z
    .string()
    .trim()
    .max(40, 'too_long')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  subject: z.string().trim().min(2, 'too_short').max(160, 'too_long'),
  message: z.string().trim().min(10, 'too_short').max(4000, 'too_long'),
  consent: z.literal('yes', { message: 'consent_required' }),
  locale: z.enum(locales),
  company: z
    .string()
    .max(0, 'bot_detected')
    .optional()
    .or(z.literal('')),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
