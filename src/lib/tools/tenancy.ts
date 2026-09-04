import { num, int, type ToolDefinition, type ToolResult } from './types';

/* ========================================================================== */
/* Kira artış oranı - 6098 s. Türk Borçlar Kanunu m.344                        */
/* ========================================================================== */

/**
 * The statutory cap is "the change in the twelve-month averages of the
 * consumer price index in the previous lease year". That index is published
 * monthly by TÜİK and would be stale in the codebase within weeks, so it is an
 * input the reader supplies from the official series rather than a number
 * baked in here. The tool's job is the cap arithmetic, not the statistics.
 *
 * The 25% ceiling that applied to residential leases was a temporary measure
 * (TBK geçici m.1) and expired on 1 July 2024; it is deliberately not modelled.
 */
export const rentIncreaseTool: ToolDefinition = {
  slug: 'kira-artis-orani',
  fields: [
    { id: 'currentRent', type: 'money', required: true, min: 0 },
    { id: 'cpiRate', type: 'percent', required: true, min: 0, max: 500, hasHint: true },
    { id: 'agreedRate', type: 'percent', min: 0, max: 500, hasHint: true },
  ],
  compute(input, format): ToolResult {
    const currentRent = num(input, 'currentRent');
    const cpiRate = num(input, 'cpiRate');
    const agreedRate = num(input, 'agreedRate');

    if (currentRent === null || cpiRate === null) return { ok: false, errorId: 'missingFields' };
    if (currentRent <= 0 || cpiRate < 0) return { ok: false, errorId: 'invalidAmount' };

    // m.344/1-2: a rate agreed in the contract is valid only so far as it does
    // not exceed the index; above it, the index governs.
    const appliedRate =
      agreedRate === null || agreedRate < 0 ? cpiRate : Math.min(agreedRate, cpiRate);
    const agreedExceedsCap = agreedRate !== null && agreedRate > cpiRate;

    const increase = (currentRent * appliedRate) / 100;
    const newRent = currentRent + increase;
    const capRent = currentRent + (currentRent * cpiRate) / 100;

    return {
      ok: true,
      rows: [
        { id: 'currentRent', value: format.money(currentRent) },
        { id: 'appliedRate', value: format.percent(appliedRate / 100) },
        { id: 'increase', value: format.money(increase) },
        { id: 'newRent', value: format.money(newRent), emphasis: true },
        { id: 'legalMaximum', value: format.money(capRent) },
        { id: 'annualDifference', value: format.money(increase * 12) },
      ],
      noteIds: agreedExceedsCap ? ['agreedRateCapped', 'rentCapBasis'] : ['rentCapBasis'],
    };
  },
};

/* ========================================================================== */
/* Nafaka artırımı - TMK m.176/4 (uyarlama), sözleşme/karar artış kaydı       */
/* ========================================================================== */

export const alimonyIncreaseTool: ToolDefinition = {
  slug: 'nafaka-artirim',
  fields: [
    { id: 'currentAlimony', type: 'money', required: true, min: 0 },
    { id: 'annualRate', type: 'percent', required: true, min: 0, max: 500, hasHint: true },
    { id: 'years', type: 'integer', required: true, min: 1, max: 20, defaultValue: '1' },
  ],
  compute(input, format): ToolResult {
    const current = num(input, 'currentAlimony');
    const rate = num(input, 'annualRate');
    const years = int(input, 'years') ?? 1;

    if (current === null || rate === null) return { ok: false, errorId: 'missingFields' };
    if (current <= 0 || rate < 0) return { ok: false, errorId: 'invalidAmount' };
    if (years < 1 || years > 20) return { ok: false, errorId: 'invalidPeriod' };

    // An increase clause in a judgment compounds: each year's uplift applies to
    // the amount the previous year's uplift produced, not to the original sum.
    const factor = (1 + rate / 100) ** years;
    const updated = current * factor;
    const monthlyIncrease = updated - current;

    return {
      ok: true,
      rows: [
        { id: 'currentAlimony', value: format.money(current) },
        { id: 'appliedRate', value: format.percent(rate / 100) },
        { id: 'years', value: format.number(years) },
        { id: 'updatedAlimony', value: format.money(updated), emphasis: true },
        { id: 'monthlyIncrease', value: format.money(monthlyIncrease) },
        { id: 'annualDifference', value: format.money(monthlyIncrease * 12) },
      ],
      noteIds: ['alimonyCompounding'],
    };
  },
};
