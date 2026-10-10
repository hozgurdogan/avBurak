import { z } from 'zod';
import { locales } from '@/i18n/locales';

export const articleSchema = z.object({
  locale: z.enum(locales),
  title: z.string().trim().min(3, 'too_short').max(180, 'too_long'),
  slug: z.string().trim().min(1, 'required').max(180, 'too_long'),
  summary: z.string().trim().min(10, 'too_short').max(400, 'too_long'),
  contentMd: z.string().trim().min(20, 'too_short'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  // FormData.getAll('categoryIds') is always an array, possibly empty - not
  // required, an article with no category is valid, just absent from every
  // "related articles" list.
  categoryIds: z.array(z.string()),
  // Empty string (the form's "standalone article" option) means "start a new
  // ArticleGroup" - only a non-empty id means "join this article's group as
  // its translation". See `createArticle` in `src/actions/articles.ts`.
  translationOfId: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
