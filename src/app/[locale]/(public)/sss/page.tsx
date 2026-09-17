import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/locales';
import { faqContent } from '@/content/faq';
import { SectionHeading } from '@/components/ui/section-heading';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const content = faqContent[locale as Locale];
  return { title: content.meta.title, description: content.meta.description };
}

/**
 * Plain `<details>`/`<summary>` disclosure per question: no client JS, and it
 * degrades to a fully readable page (everything open) if CSS fails to load.
 */
export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const content = faqContent[locale as Locale];

  return (
    <section className="bg-canvas-deep">
      <div className="mx-auto max-w-wide px-gutter py-section">
        <SectionHeading as="h1" label={content.label} title={content.title} lead={content.lead} />

        <div className="mt-14 flex max-w-narrow flex-col gap-14">
          {content.categories.map((category) => (
            <div key={category.heading} className="border-t border-rule pt-6">
              <h2 className="font-display text-2xl font-normal text-ink">{category.heading}</h2>
              <dl className="mt-6 flex flex-col divide-y divide-rule-neutral">
                {category.items.map((item) => (
                  <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-md text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-gold-800 transition-transform duration-base ease-out-editorial group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <dd className="measure mt-3 text-sm leading-prose text-ink-muted">
                      {item.answer}
                    </dd>
                  </details>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-narrow border-t border-rule pt-6 text-xs leading-normal text-ink-faint">
          {content.note}
        </p>
      </div>
    </section>
  );
}
