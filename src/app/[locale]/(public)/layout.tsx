import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

/**
 * The public site's chrome: header, `<main>` (the skip link's target) and
 * footer. Every marketing/content route sits under this group; `/admin` is a
 * sibling of `(public)`, not a child, so it never picks this up - see the
 * note in `[locale]/layout.tsx`.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
