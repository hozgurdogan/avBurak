import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'required').email('invalid_email').max(180, 'too_long'),
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
