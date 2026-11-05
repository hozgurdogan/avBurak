export function ga4Configuration(env: Record<string, string | undefined> = process.env) {
  const id = env.GA4_MEASUREMENT_ID?.trim();
  const enabled = env.GA4_ENABLED === 'true' && !!id && /^G-[A-Z0-9]+$/.test(id);
  return { enabled, measurementId: enabled ? id! : null };
}
