import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware replacements for `next/link` and the navigation hooks. Always
 * import `Link` from here rather than from `next/link`: these variants prefix
 * the active locale automatically, so a href of `/makaleler` resolves to
 * `/tr/makaleler` or `/ar/makaleler` without the call site knowing.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
