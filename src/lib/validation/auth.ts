import { z } from 'zod';

export const loginSchema = z.object({
  // Lowercased to match how the seed script stores the admin's email -
  // without this, a login typed with different casing than the stored
  // record would fail the lookup and report "wrong credentials".
  email: z
    .string()
    .trim()
    .min(1, 'required')
    .email('invalid_email')
    .max(180, 'too_long')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'required').max(200, 'too_long'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'required'),
    newPassword: z.string().min(12, 'too_short').max(200, 'too_long'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'mismatch',
    path: ['confirmPassword'],
  });
