/**
 * Practice details shown in the footer, on the contact page and in the JSON-LD.
 *
 * Contact channels come from environment variables so they can be changed
 * without a code edit. The postal address is structured rather than a single
 * string because schema.org's PostalAddress needs the parts separately.
 *
 * REVIEW WITH COUNSEL / CLIENT: every value marked PLACEHOLDER must be replaced
 * with the real registration data before launch. The bar registration line is
 * required by the TBB advertising regulation.
 */
export const office = {
  address: {
    // PLACEHOLDER - replace with the real office address.
    streetAddress: 'PLACEHOLDER Mah. PLACEHOLDER Cad. No: 0 Kat: 0',
    addressLocality: 'PLACEHOLDER',
    addressRegion: 'İstanbul',
    postalCode: '34000',
    addressCountry: 'TR',
  },
  /** Approximate coordinates for the static map link. PLACEHOLDER. */
  geo: { latitude: 41.0082, longitude: 28.9784 },
  bar: {
    association: process.env.NEXT_PUBLIC_BAR_ASSOCIATION ?? 'İstanbul Barosu',
    registryNo: process.env.NEXT_PUBLIC_BAR_REGISTRY_NO ?? 'PLACEHOLDER',
  },
  phone: process.env.NEXT_PUBLIC_OFFICE_PHONE ?? '',
  whatsapp: process.env.NEXT_PUBLIC_OFFICE_WHATSAPP ?? '',
  email: process.env.NEXT_PUBLIC_OFFICE_EMAIL ?? '',
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
