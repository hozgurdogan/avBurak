import {
  ANNUAL_LEAVE_DAYS,
  ANNUAL_OVERTIME_HOUR_CAP,
  EXTRA_TIME_UPLIFT,
  MONTHLY_WORK_HOURS,
  OVERTIME_UPLIFT,
  UNEMPLOYMENT,
  WEEKLY_NORMAL_HOURS,
  parameters,
} from '@/content/tools/parameters';
import { daysBetween, date, int, num, type ToolDefinition, type ToolResult } from './types';

/* ========================================================================== */
/* Kıdem tazminatı - 1475 s. İş Kanunu m.14 (4857 s. Kanun geçici m.6 ile yürürlükte) */
/* ========================================================================== */

export const severanceTool: ToolDefinition = {
  slug: 'kidem-tazminati',
  usesParameters: ['severanceCeilingPerYear', 'stampDutyRate'],
  fields: [
    { id: 'startDate', type: 'date', required: true },
    { id: 'endDate', type: 'date', required: true },
    { id: 'grossMonthlyWage', type: 'money', required: true, min: 0 },
    { id: 'annualBenefits', type: 'money', min: 0, hasHint: true },
  ],
  compute(input, format): ToolResult {
    const start = date(input, 'startDate');
    const end = date(input, 'endDate');
    const wage = num(input, 'grossMonthlyWage');
    const benefits = num(input, 'annualBenefits') ?? 0;

    if (!start || !end || wage === null) return { ok: false, errorId: 'missingFields' };
    if (wage <= 0 || benefits < 0) return { ok: false, errorId: 'invalidAmount' };
    if (end <= start) return { ok: false, errorId: 'endBeforeStart' };

    const serviceDays = daysBetween(start, end);
    // m.14 entitles only an employee with at least one full year of service.
    if (serviceDays < 365) return { ok: false, errorId: 'serviceTooShort' };

    // "Giydirilmiş" wage: the bare wage plus the monthly share of everything
    // paid regularly over a year (bonus, meal, transport, fuel...).
    const dressedMonthly = wage + benefits / 12;

    // The ceiling caps the 30-day payment per completed year, not the wage
    // itself - an employee over the ceiling is paid the ceiling per year.
    const ceiling = parameters.severanceCeilingPerYear.value;
    const base = Math.min(dressedMonthly, ceiling);
    const cappedByCeiling = dressedMonthly > ceiling;

    const fullYears = Math.floor(serviceDays / 365);
    const remainderDays = serviceDays - fullYears * 365;

    const gross = base * fullYears + (base * remainderDays) / 365;
    // Severance is exempt from income tax; stamp duty is the only withholding.
    const stampDuty = gross * parameters.stampDutyRate.value;
    const net = gross - stampDuty;

    return {
      ok: true,
      rows: [
        { id: 'serviceDuration', value: `${fullYears} / ${remainderDays}` },
        { id: 'dressedWage', value: format.money(dressedMonthly) },
        { id: 'appliedBase', value: format.money(base) },
        { id: 'gross', value: format.money(gross) },
        { id: 'stampDuty', value: format.money(stampDuty) },
        { id: 'net', value: format.money(net), emphasis: true },
      ],
      noteIds: cappedByCeiling ? ['ceilingApplied', 'incomeTaxExempt'] : ['incomeTaxExempt'],
    };
  },
};

/* ========================================================================== */
/* Yıllık ücretli izin - 4857 s. İş Kanunu m.53                               */
/* ========================================================================== */

/** Entitlement for the service year that ends at `completedYears` of service. */
function leaveDaysForYear(completedYears: number, protectedAge: boolean): number {
  let days: number;
  if (completedYears <= 5) days = ANNUAL_LEAVE_DAYS.upToFiveYears;
  else if (completedYears < 15) days = ANNUAL_LEAVE_DAYS.fiveToFifteenYears;
  else days = ANNUAL_LEAVE_DAYS.fifteenYearsOrMore;

  // m.53/son: the floor for workers under 18 or over 50 overrides the band.
  return protectedAge ? Math.max(days, ANNUAL_LEAVE_DAYS.minimumForProtectedAges) : days;
}

export const annualLeaveTool: ToolDefinition = {
  slug: 'yillik-izin',
  fields: [
    { id: 'startDate', type: 'date', required: true },
    { id: 'referenceDate', type: 'date', required: true },
    { id: 'usedDays', type: 'integer', min: 0, defaultValue: '0' },
    {
      id: 'ageGroup',
      type: 'select',
      options: ['standard', 'protected'],
      defaultValue: 'standard',
      hasHint: true,
    },
  ],
  compute(input, format): ToolResult {
    const start = date(input, 'startDate');
    const reference = date(input, 'referenceDate');
    const used = int(input, 'usedDays') ?? 0;
    const protectedAge = (input.ageGroup ?? 'standard') === 'protected';

    if (!start || !reference) return { ok: false, errorId: 'missingFields' };
    if (reference <= start) return { ok: false, errorId: 'endBeforeStart' };
    if (used < 0) return { ok: false, errorId: 'invalidAmount' };

    const serviceDays = daysBetween(start, reference);
    const completedYears = Math.floor(serviceDays / 365);

    // m.53: entitlement arises only once a full year of service is complete,
    // and accrues again at each anniversary.
    if (completedYears < 1) {
      return { ok: false, errorId: 'leaveNotYetAccrued' };
    }

    let accrued = 0;
    for (let year = 1; year <= completedYears; year += 1) {
      accrued += leaveDaysForYear(year, protectedAge);
    }

    const currentYearEntitlement = leaveDaysForYear(completedYears, protectedAge);
    const balance = accrued - used;

    return {
      ok: true,
      rows: [
        { id: 'completedYears', value: format.number(completedYears) },
        { id: 'currentEntitlement', value: format.number(currentYearEntitlement) },
        { id: 'accrued', value: format.number(accrued) },
        { id: 'used', value: format.number(used) },
        { id: 'balance', value: format.number(balance), emphasis: true },
      ],
      noteIds: balance < 0 ? ['usedExceedsAccrued', 'leaveIsMinimum'] : ['leaveIsMinimum'],
    };
  },
};

/* ========================================================================== */
/* Fazla çalışma ücreti - 4857 s. İş Kanunu m.41                              */
/* ========================================================================== */

export const overtimeTool: ToolDefinition = {
  slug: 'fazla-mesai',
  fields: [
    { id: 'grossMonthlyWage', type: 'money', required: true, min: 0 },
    {
      id: 'contractWeeklyHours',
      type: 'number',
      min: 1,
      max: 45,
      defaultValue: '45',
      hasHint: true,
    },
    { id: 'actualWeeklyHours', type: 'number', required: true, min: 0, max: 168 },
    { id: 'weeks', type: 'integer', required: true, min: 1, max: 520 },
  ],
  compute(input, format): ToolResult {
    const wage = num(input, 'grossMonthlyWage');
    const contractHours = num(input, 'contractWeeklyHours') ?? WEEKLY_NORMAL_HOURS;
    const actualHours = num(input, 'actualWeeklyHours');
    const weeks = int(input, 'weeks');

    if (wage === null || actualHours === null || weeks === null) {
      return { ok: false, errorId: 'missingFields' };
    }
    if (wage <= 0 || weeks <= 0 || actualHours < 0) return { ok: false, errorId: 'invalidAmount' };
    if (contractHours <= 0 || contractHours > WEEKLY_NORMAL_HOURS) {
      return { ok: false, errorId: 'invalidContractHours' };
    }

    const hourlyRate = wage / MONTHLY_WORK_HOURS;

    // Above 45 hours it is "fazla çalışma", paid at 150%. Between the (shorter)
    // contractual week and 45 it is "fazla sürelerle çalışma", paid at 125%.
    const overtimePerWeek = Math.max(0, actualHours - WEEKLY_NORMAL_HOURS);
    const extraTimePerWeek = Math.max(0, Math.min(actualHours, WEEKLY_NORMAL_HOURS) - contractHours);

    const overtimeHours = overtimePerWeek * weeks;
    const extraTimeHours = extraTimePerWeek * weeks;

    if (overtimeHours === 0 && extraTimeHours === 0) {
      return { ok: false, errorId: 'noOvertime' };
    }

    const overtimePay = overtimeHours * hourlyRate * (1 + OVERTIME_UPLIFT);
    const extraTimePay = extraTimeHours * hourlyRate * (1 + EXTRA_TIME_UPLIFT);
    const total = overtimePay + extraTimePay;

    // m.41/8: overtime may not exceed 270 hours in a year. Exceeding it does
    // not make the hours unpaid - it makes the arrangement unlawful - so this
    // is a note, not an error.
    const overCap = overtimeHours > ANNUAL_OVERTIME_HOUR_CAP;

    return {
      ok: true,
      rows: [
        { id: 'hourlyRate', value: format.money(hourlyRate) },
        { id: 'overtimeHours', value: format.number(overtimeHours, 1) },
        { id: 'overtimePay', value: format.money(overtimePay) },
        { id: 'extraTimeHours', value: format.number(extraTimeHours, 1) },
        { id: 'extraTimePay', value: format.money(extraTimePay) },
        { id: 'total', value: format.money(total), emphasis: true },
      ],
      noteIds: overCap ? ['overtimeCapExceeded', 'grossFigures'] : ['grossFigures'],
    };
  },
};

/* ========================================================================== */
/* İşsizlik ödeneği - 4447 s. İşsizlik Sigortası Kanunu m.50                  */
/* ========================================================================== */

export const unemploymentBenefitTool: ToolDefinition = {
  slug: 'issizlik-maasi',
  usesParameters: ['minimumWageGrossMonthly', 'stampDutyRate'],
  fields: [
    { id: 'averageGrossMonthly', type: 'money', required: true, min: 0, hasHint: true },
    { id: 'premiumDays', type: 'integer', required: true, min: 0, max: 1080, hasHint: true },
  ],
  compute(input, format): ToolResult {
    const averageGross = num(input, 'averageGrossMonthly');
    const premiumDays = int(input, 'premiumDays');

    if (averageGross === null || premiumDays === null) {
      return { ok: false, errorId: 'missingFields' };
    }
    if (averageGross <= 0 || premiumDays < 0) return { ok: false, errorId: 'invalidAmount' };

    // m.50/1: the benefit is 40% of the average daily gross earnings of the
    // last four months, capped at 80% of the gross minimum wage.
    const uncappedMonthly = averageGross * UNEMPLOYMENT.rate;
    const ceilingMonthly =
      parameters.minimumWageGrossMonthly.value * UNEMPLOYMENT.ceilingRatioOfMinimumWage;
    const grossMonthly = Math.min(uncappedMonthly, ceilingMonthly);
    const cappedByCeiling = uncappedMonthly > ceilingMonthly;

    const stampDuty = grossMonthly * parameters.stampDutyRate.value;
    const netMonthly = grossMonthly - stampDuty;

    // m.50/2: entitlement in days, by premium days in the last three years.
    const tier = [...UNEMPLOYMENT.schedule]
      .reverse()
      .find((step) => premiumDays >= step.premiumDays);

    if (!tier) return { ok: false, errorId: 'premiumDaysTooLow' };

    const months = tier.benefitDays / 30;

    return {
      ok: true,
      rows: [
        { id: 'grossMonthly', value: format.money(grossMonthly) },
        { id: 'stampDuty', value: format.money(stampDuty) },
        { id: 'netMonthly', value: format.money(netMonthly), emphasis: true },
        { id: 'benefitDays', value: format.number(tier.benefitDays) },
        { id: 'benefitMonths', value: format.number(months) },
        { id: 'totalBenefit', value: format.money(netMonthly * months) },
      ],
      noteIds: cappedByCeiling ? ['benefitCeilingApplied', 'benefitConditions'] : ['benefitConditions'],
    };
  },
};
