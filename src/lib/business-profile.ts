const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export type BusinessHours = { days: string[]; opens: string; closes: string };

function officialUrl(value: string | undefined, hosts: string[]) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : null;
  } catch { return null; }
}

export function businessProfile(env: Record<string, string | undefined> = process.env) {
  const googleUrl = officialUrl(env.GOOGLE_BUSINESS_PROFILE_URL, ['google.com', 'google.com.tr', 'maps.app.goo.gl']);
  const barUrl = officialUrl(env.BAR_PROFILE_URL, ['istanbulbarosu.org.tr']);
  const latitude = Number(env.BUSINESS_LATITUDE);
  const longitude = Number(env.BUSINESS_LONGITUDE);
  const geo = env.BUSINESS_LATITUDE && env.BUSINESS_LONGITUDE && Number.isFinite(latitude) && Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 ? { latitude, longitude } : null;
  let hours: BusinessHours[] = [];
  try {
    const parsed: unknown = JSON.parse(env.BUSINESS_HOURS_JSON ?? '[]');
    if (Array.isArray(parsed)) hours = parsed.filter((row): row is BusinessHours => {
      if (!row || typeof row !== 'object') return false;
      const item = row as BusinessHours;
      const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
      return Array.isArray(item.days) && item.days.length > 0 && item.days.every((day) => days.includes(day)) &&
        time.test(item.opens) && time.test(item.closes) && item.opens !== item.closes;
    });
  } catch { /* Unverified or malformed values are omitted, never invented. */ }
  return { googleUrl, barUrl, geo, hours, sameAs: [googleUrl, barUrl].filter((url): url is string => !!url) };
}

export function localizedBusinessDays(dayNames: string[], locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  return dayNames.map((day) => formatter.format(new Date(Date.UTC(2024, 0, 1 + days.indexOf(day))))).join(', ');
}
