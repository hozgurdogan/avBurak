import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // An unknown segment falls back to Turkish rather than throwing: the
  // middleware should have rejected it already, so reaching here means a direct
  // render (an error boundary, a metadata pass) and a blank page would be worse.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Formatting defaults so dates and numbers do not have to be configured at
    // every call site. `numberingSystem: 'latn'` is set explicitly rather than
    // left to the runtime default: some ICU builds render `ar` with
    // Arabic-Indic digits (٠١٢...) unless told otherwise, and the brief
    // requires Western digits (0-9) throughout the Arabic edition.
    formats: {
      dateTime: {
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          numberingSystem: 'latn',
        },
        short: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          numberingSystem: 'latn',
        },
      },
    },
  };
});
