/**
 * The shape every calculator shares.
 *
 * A tool is a list of fields plus a pure `compute` function. Nothing in here
 * knows about React, the DOM or a locale: labels are message keys resolved by
 * the rendering component, and numbers are handed to formatters supplied by
 * the caller. That keeps the legal arithmetic in files that can be read - and
 * checked by a lawyer - without wading through markup.
 */

export type FieldType = 'money' | 'number' | 'integer' | 'date' | 'select' | 'percent';

export type ToolField = {
  /** Also the message key under `tools.<slug>.fields.<id>`. */
  id: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** `select` only. Option labels come from `tools.<slug>.options.<option>`. */
  options?: readonly string[];
  defaultValue?: string;
  /** Renders an explanatory line under the field, from `…fields.<id>Hint`. */
  hasHint?: boolean;
};

export type ResultRow = {
  /** Message key under `tools.<slug>.results.<id>`. */
  id: string;
  value: string;
  /** The headline figure of the calculation; at most one per result. */
  emphasis?: boolean;
};

export type ToolResult =
  | { ok: true; rows: ResultRow[]; noteIds?: readonly string[] }
  /** `errorId` resolves under `tools.errors.<id>` - shared across all tools. */
  | { ok: false; errorId: string };

/** Locale-aware formatters handed to `compute` so it stays pure. */
export type Formatters = {
  money: (value: number) => string;
  number: (value: number, fractionDigits?: number) => string;
  percent: (ratio: number) => string;
  date: (value: Date) => string;
};

export type ToolDefinition = {
  slug: string;
  fields: readonly ToolField[];
  compute: (input: Record<string, string>, format: Formatters) => ToolResult;
  /**
   * Parameter entries this tool depends on, surfaced under the result so the
   * reader can see which period's figures were used.
   */
  usesParameters?: readonly ('severanceCeilingPerYear' | 'minimumWageGrossMonthly' | 'stampDutyRate')[];
};

/* ------------------------------ input helpers ----------------------------- */

/** Parses a decimal that may have been typed with a comma. */
export function num(input: Record<string, string>, id: string): number | null {
  const raw = (input[id] ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function int(input: Record<string, string>, id: string): number | null {
  const value = num(input, id);
  return value === null ? null : Math.trunc(value);
}

export function date(input: Record<string, string>, id: string): Date | null {
  const raw = (input[id] ?? '').trim();
  if (raw === '') return null;
  // `YYYY-MM-DD` from a native date input, read as UTC midnight so that day
  // arithmetic is never shifted by the visitor's time zone.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(value.getTime()) ? null : value;
}

export const MS_PER_DAY = 86_400_000;

/** Whole days between two UTC midnights. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}
