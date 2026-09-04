import type { LegalPageContent } from '@/content/legal/kvkk';

/**
 * Shared renderer for the KVKK notice and the privacy policy - both are the
 * same shape (title, intro, numbered sections), so one component renders
 * both rather than duplicating the layout.
 */
export function LegalPageBody({ content }: { content: LegalPageContent }) {
  return (
    <section className="mx-auto max-w-wide px-gutter py-section">
      <div className="max-w-narrow">
        {/* REVIEW WITH COUNSEL: the text below is a working draft (see
            src/content/legal/kvkk.ts and privacy.ts) and must be reviewed by
            the office's own counsel, in every language, before launch. */}
        <p className="label text-gold-800">{content.updated}</p>
        <h1 className="mt-4 font-display text-display-sm font-normal text-ink">{content.title}</h1>
        <p className="mt-6 text-md leading-prose text-ink-muted">{content.intro}</p>
      </div>

      <div className="mt-14 flex max-w-narrow flex-col gap-10">
        {content.sections.map((section) => (
          <div key={section.heading} className="border-t border-rule pt-6">
            <h2 className="font-display text-xl font-normal text-ink">{section.heading}</h2>
            <p className="mt-3 text-md leading-prose text-ink-muted">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
