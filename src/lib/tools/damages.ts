import { parameters } from '@/content/tools/parameters';
import { num, type ToolDefinition, type ToolResult } from './types';

/* ========================================================================== */
/* İş kazası - sürekli iş göremezlik (maddi) tazminatı                         */
/* ========================================================================== */

/**
 * Permanent incapacity damages, computed the way the Court of Cassation's
 * settled practice sets it out: the loss is split into the known period (from
 * the accident to the date of calculation), the active period (to the end of
 * working life) and the passive period (to the end of the remaining lifespan
 * from the TRH-2010 table), then reduced by the claimant's own contributory
 * fault and by the capital value of the SGK income already awarded.
 *
 * Two deliberate design decisions:
 *
 * 1. The remaining lifespan is an INPUT, not a lookup. It comes from the
 *    TRH-2010 mortality table, which is a two-hundred-row actuarial table
 *    indexed by age and sex; transcribing it from memory into a lawyer's
 *    website is exactly the kind of thing that produces a plausible-looking
 *    wrong number. The reader takes the figure from the table and enters it.
 *
 * 2. The active period uses the "progressive rent" method with a 10% annual
 *    increase discounted at 10%, which is what the Court applies. Those two
 *    rates cancel, so each active year contributes one year's earnings - the
 *    arithmetic below is the simplification, not an approximation of it.
 *
 * This calculator produces an order of magnitude for a claim. It is not an
 * actuarial report, and a court will appoint an expert to prepare one.
 */
export const workAccidentTool: ToolDefinition = {
  slug: 'is-kazasi-tazminat',
  usesParameters: ['minimumWageGrossMonthly'],
  fields: [
    { id: 'monthlyEarning', type: 'money', required: true, min: 0, hasHint: true },
    { id: 'disabilityRatio', type: 'percent', required: true, min: 0, max: 100, hasHint: true },
    { id: 'faultRatio', type: 'percent', required: true, min: 0, max: 100, hasHint: true },
    { id: 'knownPeriodMonths', type: 'number', required: true, min: 0, max: 600 },
    { id: 'activePeriodYears', type: 'number', required: true, min: 0, max: 60, hasHint: true },
    { id: 'passivePeriodYears', type: 'number', required: true, min: 0, max: 60, hasHint: true },
    { id: 'sgkCapitalValue', type: 'money', min: 0, hasHint: true },
  ],
  compute(input, format): ToolResult {
    const monthlyEarning = num(input, 'monthlyEarning');
    const disabilityRatio = num(input, 'disabilityRatio');
    const faultRatio = num(input, 'faultRatio');
    const knownMonths = num(input, 'knownPeriodMonths');
    const activeYears = num(input, 'activePeriodYears');
    const passiveYears = num(input, 'passivePeriodYears');
    const sgkCapital = num(input, 'sgkCapitalValue') ?? 0;

    if (
      monthlyEarning === null ||
      disabilityRatio === null ||
      faultRatio === null ||
      knownMonths === null ||
      activeYears === null ||
      passiveYears === null
    ) {
      return { ok: false, errorId: 'missingFields' };
    }
    if (monthlyEarning <= 0 || sgkCapital < 0) return { ok: false, errorId: 'invalidAmount' };
    if (disabilityRatio <= 0 || disabilityRatio > 100) {
      return { ok: false, errorId: 'invalidRatio' };
    }
    if (faultRatio < 0 || faultRatio > 100) return { ok: false, errorId: 'invalidRatio' };
    if (knownMonths < 0 || activeYears < 0 || passiveYears < 0) {
      return { ok: false, errorId: 'invalidPeriod' };
    }

    // The share of the loss the defendant answers for: the whole of it, less
    // the claimant's own contribution.
    const liabilityShare = (100 - faultRatio) / 100;
    const disability = disabilityRatio / 100;

    const knownLoss = monthlyEarning * knownMonths;
    const activeLoss = monthlyEarning * 12 * activeYears;
    // After working life ends the base drops to the minimum wage: the claimant
    // is assumed able to earn at that level, so the loss is measured against it.
    const passiveLoss = parameters.minimumWageGrossMonthly.value * 12 * passiveYears;

    const grossLoss = (knownLoss + activeLoss + passiveLoss) * disability;
    const afterFault = grossLoss * liabilityShare;
    const net = Math.max(0, afterFault - sgkCapital);

    return {
      ok: true,
      rows: [
        { id: 'knownLoss', value: format.money(knownLoss * disability * liabilityShare) },
        { id: 'activeLoss', value: format.money(activeLoss * disability * liabilityShare) },
        { id: 'passiveLoss', value: format.money(passiveLoss * disability * liabilityShare) },
        { id: 'grossLoss', value: format.money(grossLoss) },
        { id: 'liabilityShare', value: format.percent(liabilityShare) },
        { id: 'afterFault', value: format.money(afterFault) },
        { id: 'sgkDeduction', value: format.money(sgkCapital) },
        { id: 'net', value: format.money(net), emphasis: true },
      ],
      noteIds: ['trh2010Source', 'progressiveRentMethod', 'expertReportRequired'],
    };
  },
};
