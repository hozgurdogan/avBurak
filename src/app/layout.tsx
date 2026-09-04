import type { ReactNode } from 'react';

/**
 * The real root layout - the one that renders <html> and <body> - is
 * `app/[locale]/layout.tsx`, because `lang` and `dir` cannot be decided until
 * the locale segment has been read.
 *
 * This file exists only so that the top-level `app/not-found.tsx` (served for
 * paths that never reach the locale middleware) has a layout to render inside.
 * It deliberately renders nothing of its own.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
