/**
 * Every figure in the calculators that changes over time lives here, and only
 * here. No rate, ceiling or threshold is written inline in a calculation.
 *
 * ============================ READ BEFORE PUBLISH ===========================
 *
 * `PARAMETERS_VERIFIED` below is `false`. While it is false every calculator
 * renders a visible notice telling the reader that the statutory figures have
 * not been checked against the current period. Do not flip it to `true` until
 * each value in `parameters` has been confirmed against the official source
 * named in its comment for the period the site is being published in.
 *
 * These figures are re-set by the state at least twice a year (kıdem ceiling
 * and minimum wage on 1 January and 1 July; stamp duty by presidential
 * decree). A calculator quoting last period's ceiling does not produce an
 * approximate answer - it produces a confidently wrong one, on the website of
 * the lawyer whose name is on the page. That is the reason for the flag.
 *
 * `asOf` on each entry is displayed next to the result, so a reader can always
 * see which period the arithmetic used.
 * ===========================================================================
 */

export const PARAMETERS_VERIFIED = false;

export type DatedAmount = {
  /** Value in Turkish lira, or a plain ratio where the name says so. */
  value: number;
  /** Period the value belongs to, ISO date of the day it took effect. */
  asOf: string;
  /** Where to confirm it. */
  source: string;
};

export const parameters = {
  /**
   * Severance ceiling per completed year of service (kıdem tazminatı tavanı).
   * Equals the highest civil-service retirement bonus and is republished with
   * every civil-service pay adjustment.
   * SOURCE: Hazine ve Maliye Bakanlığı, Kamu Mali Yönetimi Genel Tebliği.
   */
  severanceCeilingPerYear: {
    value: 53919.68,
    asOf: '2025-07-01',
    source: 'Hazine ve Maliye Bakanlığı - Mali ve Sosyal Haklara İlişkin Genelge',
  } satisfies DatedAmount,

  /**
   * Gross monthly minimum wage. Drives the unemployment benefit ceiling and
   * the passive-period earnings base in the work-accident calculator.
   * SOURCE: Asgari Ücret Tespit Komisyonu kararı, Resmî Gazete.
   */
  minimumWageGrossMonthly: {
    value: 26005.5,
    asOf: '2025-01-01',
    source: 'Asgari Ücret Tespit Komisyonu Kararı',
  } satisfies DatedAmount,

  /**
   * Stamp duty withheld from severance pay, as a ratio (binde 7,59).
   * Severance is exempt from income tax; stamp duty is the only deduction.
   * SOURCE: 488 sayılı Damga Vergisi Kanunu, (1) sayılı tablo.
   */
  stampDutyRate: {
    value: 0.00759,
    asOf: '2021-01-01',
    source: '488 sayılı Damga Vergisi Kanunu',
  } satisfies DatedAmount,
} as const;

/* -------------------------------------------------------------------------- */
/* Statutory constants - set by primary legislation, not by periodic decree.   */
/* These change only when the statute itself is amended.                       */
/* -------------------------------------------------------------------------- */

/** 4857 s. İş Kanunu m.63 - weekly normal working time. */
export const WEEKLY_NORMAL_HOURS = 45;

/** 4857 s. İş Kanunu m.41 - annual overtime cap. */
export const ANNUAL_OVERTIME_HOUR_CAP = 270;

/** Monthly hours used to derive an hourly rate from a monthly salary (30 x 7,5). */
export const MONTHLY_WORK_HOURS = 225;

/** 4857 s. İş Kanunu m.41 - uplift over the hourly rate. */
export const OVERTIME_UPLIFT = 0.5; // fazla çalışma (> 45 saat)
export const EXTRA_TIME_UPLIFT = 0.25; // fazla sürelerle çalışma (sözleşme < 45)

/** 4857 s. İş Kanunu m.53 - annual paid leave by length of service. */
export const ANNUAL_LEAVE_DAYS = {
  upToFiveYears: 14, // 1 yıldan 5 yıla kadar (5 yıl dahil)
  fiveToFifteenYears: 20, // 5 yıldan fazla 15 yıldan az
  fifteenYearsOrMore: 26, // 15 yıl ve daha fazla
  /** m.53/son - floor for workers under 18 or over 50. */
  minimumForProtectedAges: 20,
} as const;

/** 4447 s. İşsizlik Sigortası Kanunu m.50. */
export const UNEMPLOYMENT = {
  /** Daily benefit = 40% of the average daily gross of the last four months. */
  rate: 0.4,
  /** Capped at 80% of the gross monthly minimum wage. */
  ceilingRatioOfMinimumWage: 0.8,
  /** Premium days in the last three years -> benefit days. */
  schedule: [
    { premiumDays: 600, benefitDays: 180 },
    { premiumDays: 900, benefitDays: 240 },
    { premiumDays: 1080, benefitDays: 300 },
  ],
} as const;

/** 5275 s. Ceza ve Güvenlik Tedbirlerinin İnfazı Hakkında Kanun m.107. */
export const PAROLE_RATIOS = {
  /** m.107/2 - general rule for offences committed on/after 30.03.2020. */
  general: 1 / 2,
  /** m.107/2 - listed offences (murder, sexual offences, drug trafficking, terror). */
  aggravated: 2 / 3,
  /** m.108 - repeat offenders. */
  repeatOffender: 3 / 4,
} as const;

/** Türk Medeni Kanunu m.495-501 (yasal miras payları) ve m.506 (saklı pay). */
export const INHERITANCE = {
  spouseWithDescendants: 1 / 4, // m.499/1
  spouseWithParents: 1 / 2, // m.499/2
  spouseWithGrandparents: 3 / 4, // m.499/3
  reserved: {
    descendants: 1 / 2, // m.506/1 - yasal payın yarısı
    parents: 1 / 4, // m.506/2 - yasal payın dörtte biri
  },
} as const;
