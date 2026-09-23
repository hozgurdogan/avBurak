import { office, formatAddress } from '@/content/office';
import type { Locale } from '@/i18n/locales';

/**
 * JSON-LD builders (schema.org). Plain objects, not components - kept
 * separate from `JsonLd` (src/components/seo/json-ld.tsx) so the data can be
 * unit-reasoned-about without a React tree. Every one of these is built from
 * data already public elsewhere on the site (footer, contact page); nothing
 * here is a new claim.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * LegalService (a LocalBusiness subtype) with the attorney as `employee` -
 * the audit's "LegalService/Organization, Person" schema (P1). Rendered once
 * per page load, in the root layout, not per-route: a business's own
 * identity does not change page to page.
 */
export function buildLegalServiceSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': `${SITE_URL}/${locale}#business`,
    name: 'Av. Burak Uğur Öztürk',
    url: `${SITE_URL}/${locale}`,
    telephone: office.phone,
    email: office.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: office.address.streetAddress,
      addressLocality: office.address.addressLocality,
      addressRegion: office.address.addressRegion,
      postalCode: office.address.postalCode,
      addressCountry: office.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: office.geo.latitude,
      longitude: office.geo.longitude,
    },
    areaServed: ['Esenyurt', 'Büyükçekmece', 'Beylikdüzü', 'Çatalca', 'Silivri', 'Avcılar'],
    availableLanguage: ['tr', 'en', 'ar'],
    employee: {
      '@type': 'Person',
      name: 'Burak Uğur Öztürk',
      jobTitle: 'Avukat',
      memberOf: {
        '@type': 'Organization',
        name: office.bar.association,
      },
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** BreadcrumbList - the audit's P1 item. `items` are in order, home page
 *  first; `path` follows the same convention as `pageMetadata`'s (Turkish
 *  segment, no locale prefix, no leading slash - `''` for home). */
export function buildBreadcrumbSchema(locale: Locale, items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.path ? `/${item.path}` : ''}`,
    })),
  };
}

/** Article schema for a published article detail page - the audit's fourth
 *  P1 schema. `path` excludes the locale prefix, matching the convention
 *  used everywhere else in this file. */
export function buildArticleSchema({
  locale,
  path,
  title,
  description,
  datePublished,
  dateModified,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  datePublished: Date | null;
  dateModified: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}/${locale}/${path}`,
    inLanguage: locale,
    ...(datePublished ? { datePublished: datePublished.toISOString() } : {}),
    dateModified: dateModified.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Burak Uğur Öztürk',
      url: `${SITE_URL}/${locale}/profil`,
    },
    publisher: {
      '@type': 'LegalService',
      name: 'Av. Burak Uğur Öztürk',
      address: formatAddress(),
    },
  };
}
