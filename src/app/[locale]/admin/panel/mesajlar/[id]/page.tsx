import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { archiveMessage, deleteMessage } from '@/actions/messages';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMessageDetailPage({ params }: PageProps) {
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    notFound();
  }

  // Opening a message marks it read - the same convention as an email inbox.
  // A direct write here (rather than routing through the `markMessageRead`
  // action) is deliberate: this already runs inside the authenticated admin
  // layout, and there is no form submission to attach the action to.
  if (message.status === 'NEW') {
    await prisma.contactMessage.update({ where: { id }, data: { status: 'READ', readAt: new Date() } });
  }

  const t = await getTranslations('admin.messages');
  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  });

  const archiveWithId = archiveMessage.bind(null, message.id);
  const deleteWithId = deleteMessage.bind(null, message.id);

  return (
    <div className="max-w-narrow">
      <div className="mb-8">
        <Link href="/admin/panel/mesajlar" className="label-lg text-ink-muted hover:text-ink">
          ← {t('back')}
        </Link>
      </div>

      <h1 className="font-display text-2xl font-normal text-ink">{message.subject}</h1>

      <dl className="mt-6 flex flex-col gap-2 border-t border-rule pt-6 text-sm">
        <div className="flex gap-2">
          <dt className="label text-ink-faint">{t('from')}:</dt>
          <dd className="text-ink">
            {message.name} — <a href={`mailto:${message.email}`} className="hover:text-gold-800" dir="ltr">{message.email}</a>
            {message.phone ? <span dir="ltr"> — {message.phone}</span> : null}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="label text-ink-faint">{t('receivedOn')}:</dt>
          <dd className="text-ink" dir="ltr">
            {dateFormatter.format(message.createdAt)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="label text-ink-faint">{t('consentGiven').split(':')[0]}:</dt>
          <dd className="text-ink" dir="ltr">
            {dateFormatter.format(message.consentAt)}
          </dd>
        </div>
      </dl>

      <p className="mt-8 whitespace-pre-wrap border-t border-rule pt-6 text-md leading-prose text-ink-muted">
        {message.message}
      </p>

      <div className="mt-10 flex flex-wrap gap-4 border-t border-rule pt-6">
        {message.status !== 'ARCHIVED' ? (
          <form action={archiveWithId}>
            <button type="submit" className="label-lg text-ink-muted hover:text-ink">
              {t('archive')}
            </button>
          </form>
        ) : null}
        <form action={deleteWithId}>
          <button type="submit" className="label-lg text-danger hover:text-ink">
            {t('delete')}
          </button>
        </form>
      </div>
    </div>
  );
}
