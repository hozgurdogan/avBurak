import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/cn';

/** The contact inbox: every submission, newest first, with its status. */
export default async function AdminMessagesPage() {
  const [t, messages] = await Promise.all([
    getTranslations('admin.messages'),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, subject: true, status: true, createdAt: true, locale: true },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  });

  return (
    <div className="max-w-content">
      <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>

      {messages.length === 0 ? (
        <p className="mt-10 border-t border-rule pt-6 text-sm text-ink-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-8 flex flex-col">
          {messages.map((message) => (
            <li key={message.id} className="border-b border-rule-soft first:border-t">
              <Link
                href={`/admin/panel/mesajlar/${message.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-paper"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'label',
                      message.status === 'NEW'
                        ? 'text-gold-800'
                        : message.status === 'ARCHIVED'
                          ? 'text-ink-faint'
                          : 'text-ink-muted',
                    )}
                  >
                    {message.status === 'NEW'
                      ? t('statusNew')
                      : message.status === 'ARCHIVED'
                        ? t('statusArchived')
                        : t('statusRead')}
                  </span>
                  <span className="text-sm text-ink">{message.name}</span>
                  <span className="text-sm text-ink-muted">{message.subject}</span>
                </div>
                <span className="text-xs text-ink-faint" dir="ltr">
                  {dateFormatter.format(message.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
