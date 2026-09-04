import { PAROLE_RATIOS } from '@/content/tools/parameters';
import { int, type ToolDefinition, type ToolResult } from './types';

/* ========================================================================== */
/* Koşullu salıverilme ve denetimli serbestlik - 5275 s. Kanun m.105/A, m.107  */
/* ========================================================================== */

/** Expresses a duration in days as years / months / days (30-day months). */
function breakdown(totalDays: number): { years: number; months: number; days: number } {
  const years = Math.floor(totalDays / 365);
  const afterYears = totalDays - years * 365;
  const months = Math.floor(afterYears / 30);
  const days = Math.round(afterYears - months * 30);
  return { years, months, days };
}

/**
 * Estimated time to serve.
 *
 * SCOPE - what this does NOT model, and why the result is an estimate:
 *   - remand time already served (mahsup) and any pre-trial detention
 *   - aggravated life and life sentences, which are not a number of days
 *   - juvenile execution regimes and the special reductions for offenders
 *     over 65, for illness, and for mothers of small children
 *   - the separate regimes for terror and organised-crime offences under
 *     3713 s. Kanun, which have their own ratios and exclusions
 *   - consecutive sentences (içtima), which change the base the ratio applies to
 *   - conduct-based loss of the supervised-release period inside prison
 *
 * Those are the ordinary reasons a real figure differs from this one, which is
 * why the tool prints them as notes rather than hiding them in a comment.
 */
export const paroleTool: ToolDefinition = {
  slug: 'infaz-hesaplama',
  fields: [
    { id: 'sentenceYears', type: 'integer', min: 0, max: 100, defaultValue: '0' },
    { id: 'sentenceMonths', type: 'integer', min: 0, max: 11, defaultValue: '0' },
    { id: 'sentenceDays', type: 'integer', min: 0, max: 29, defaultValue: '0' },
    {
      id: 'offencePeriod',
      type: 'select',
      options: ['before2020', 'after2020'],
      defaultValue: 'after2020',
      hasHint: true,
    },
    {
      id: 'offenceType',
      type: 'select',
      options: ['general', 'aggravated'],
      defaultValue: 'general',
      hasHint: true,
    },
    {
      id: 'repeatOffender',
      type: 'select',
      options: ['no', 'yes'],
      defaultValue: 'no',
    },
  ],
  compute(input, format): ToolResult {
    const years = int(input, 'sentenceYears') ?? 0;
    const months = int(input, 'sentenceMonths') ?? 0;
    const days = int(input, 'sentenceDays') ?? 0;

    if (years < 0 || months < 0 || days < 0) return { ok: false, errorId: 'invalidPeriod' };
    if (months > 11 || days > 29) return { ok: false, errorId: 'invalidPeriod' };

    const totalDays = years * 365 + months * 30 + days;
    if (totalDays <= 0) return { ok: false, errorId: 'missingFields' };

    const isRepeat = (input.repeatOffender ?? 'no') === 'yes';
    const isAggravated = (input.offenceType ?? 'general') === 'aggravated';
    const isPre2020 = (input.offencePeriod ?? 'after2020') === 'before2020';

    // m.108 overrides m.107 for repeat offenders; otherwise the listed
    // offences take 2/3 and everything else takes the general 1/2.
    let ratio: number;
    if (isRepeat) ratio = PAROLE_RATIOS.repeatOffender;
    else if (isAggravated) ratio = PAROLE_RATIOS.aggravated;
    else ratio = PAROLE_RATIOS.general;

    const paroleDays = totalDays * ratio;

    // Supervised release: three years for offences committed before
    // 30.03.2020 (geçici m.6), one year under the standing rule (m.105/A).
    const supervisedDays = isPre2020 ? 3 * 365 : 365;
    const servedDays = Math.max(0, paroleDays - supervisedDays);

    const total = breakdown(totalDays);
    const parole = breakdown(paroleDays);
    const served = breakdown(servedDays);
    const asText = (b: { years: number; months: number; days: number }) =>
      `${format.number(b.years)} / ${format.number(b.months)} / ${format.number(b.days)}`;

    return {
      ok: true,
      rows: [
        { id: 'totalSentence', value: asText(total) },
        { id: 'appliedRatio', value: format.percent(ratio) },
        { id: 'paroleDuration', value: asText(parole) },
        { id: 'supervisedRelease', value: format.number(supervisedDays / 365) },
        { id: 'estimatedTimeServed', value: asText(served), emphasis: true },
      ],
      noteIds: ['paroleScopeLimits', 'paroleNoRemandCredit', 'paroleSeekCounsel'],
    };
  },
};
