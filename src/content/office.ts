/**
 * Practice details shown in the footer, on the contact page and in the JSON-LD.
 * The postal address is structured rather than a single string because
 * schema.org's PostalAddress needs the parts separately.
 *
 * Everything below is set directly rather than read from a `NEXT_PUBLIC_*`
 * environment variable. That was tried first and does not actually work on
 * this host: `NEXT_PUBLIC_*` values are inlined into the built JavaScript at
 * `next build` time, not read from the server's environment at request time,
 * and this deployment ships a `.next` built on a dev machine rather than
 * building on the server - so editing the server's `.env` and restarting can
 * never change one of these values, only a rebuild-and-redeploy can. None of
 * these are secrets (a public office phone/e-mail is meant to be shown), so
 * shipping them as real values in code is both simpler and actually works.
 */
export const office = {
  address: {
    streetAddress: 'Cumhuriyet Mahallesi, 1991. Sokak, Beycenter Residence, K:10 D:79',
    addressLocality: 'Esenyurt',
    addressRegion: 'İstanbul',
    postalCode: '34515',
    addressCountry: 'TR',
  },
  /** Approximate Esenyurt coordinates - not used by the map embed (that
   *  builds a text-query URL from the address above) or anywhere else yet. */
  geo: { latitude: 41.034, longitude: 28.675 },
  bar: {
    association: 'İstanbul Barosu',
    registryNo: '84442',
  },
  phone: '+90 543 676 65 33',
  whatsapp: '+90 543 676 65 33',
  email: 'burak2504@gmail.com',
} as const;

/** Single-line address for the footer and for `tel:`-style contexts. */
export function formatAddress(): string {
  const { streetAddress, postalCode, addressLocality, addressRegion } = office.address;
  return `${streetAddress}, ${postalCode} ${addressLocality} / ${addressRegion}`;
}

/** `wa.me` accepts digits only - no plus sign, no spaces. */
export function whatsappHref(): string | null {
  const digits = office.whatsapp.replace(/\D/g, '');
  return digits.length > 0 ? `https://wa.me/${digits}` : null;
}

export function telHref(): string | null {
  const digits = office.phone.replace(/[^\d+]/g, '');
  return digits.length > 0 ? `tel:${digits}` : null;
}

/**
 * Key-less Google Maps embed (`/maps?q=...&output=embed`) built from the
 * office address. No API key, no analytics. Rendered eagerly by `OfficeMap`
 * (src/components/contact/office-map.tsx) - a request reaches Google, and
 * Google's own cookie may be set, as soon as the contact page renders, no
 * visitor interaction required. A click-to-load version (no request until
 * the visitor asks to see the map) shipped briefly but was reverted at the
 * client's explicit request (2026-09-18): "yok direkt harita göster kısmı
 * açık olsun kullanıcı tıklamakla uğraşmasın".
 *
 * NOTE ON SCOPE: the Master Build Prompt's absolute constraints list
 * "no third-party embeds (maps, analytics, font CDN, social media)" and
 * "no client testimonials/reviews/ratings" - both directly implicated by
 * this embed and by `src/content/reviews.ts`. The client was told this
 * explicitly and chose to proceed anyway (2026-09-17), so this is a
 * deliberate, informed override of that constraint for this one feature,
 * not an oversight. It has not been reviewed by counsel for TBB Reklam
 * Yasağı Yönetmeliği compliance - that review should happen before launch.
 */
export function mapsEmbedSrc(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(formatAddress())}&output=embed`;
}
