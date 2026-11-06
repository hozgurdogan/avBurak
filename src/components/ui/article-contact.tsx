import { useTranslations } from 'next-intl';
import { office, telHref, whatsappHref } from '@/content/office';
import type { plannedArticle } from '@/content/editorial-plan';

export function ArticleContact({ title, plan }: { title: string; plan?: ReturnType<typeof plannedArticle> }) {
  const t = useTranslations('articleDetail');
  const footer = useTranslations('footer');
  const message = t('whatsappMessage', { title });
  const whatsapp = whatsappHref();
  return <section className="mt-10 border-t border-rule pt-6">
    <h2 className="label text-gold-800">{t('contactTitle')}</h2>
    {plan ? <>
      <h3 className="mt-5 text-lg font-medium text-ink">{t('documentsTitle')}</h3>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-md text-ink-muted">
        {plan.documents.map((document) => <li key={document}>{document}</li>)}
      </ul>
      {plan.checklist ? <a href={`/belgeler/${plan.checklist}-belge-listesi.pdf`} download className="mt-5 inline-block text-sm text-ink-muted underline hover:text-gold-800">{t('downloadChecklist')}</a> : null}
    </> : null}
    <p className="mt-5 text-md text-ink-muted">{t('contactLead')}</p>
    <div className="mt-5 flex flex-wrap gap-4">
      <a href={telHref() ?? undefined} className="inline-flex min-h-11 items-center border border-rule px-4 py-2 text-sm text-ink hover:border-ink"><span dir="ltr">{office.phone}</span></a>
      {whatsapp ? <a href={`${whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center bg-navy-900 px-4 py-2 text-sm text-canvas hover:bg-navy-800">{footer('whatsapp')}</a> : null}
    </div>
  </section>;
}
