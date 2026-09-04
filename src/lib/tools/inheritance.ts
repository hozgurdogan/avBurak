import { INHERITANCE } from '@/content/tools/parameters';
import { int, num, type ResultRow, type ToolDefinition, type ToolResult } from './types';

/* ========================================================================== */
/* Yasal miras payları ve saklı pay - TMK m.495-501, m.506                     */
/* ========================================================================== */

/**
 * The statutory shares under the "zümre" (parentela) system.
 *
 * First order: the deceased's descendants. Second: the parents and, through
 * them, the siblings. Third: the grandparents. A surviving order excludes
 * every order below it; the spouse inherits alongside whichever order is
 * called, at a fraction that rises as the order gets more remote.
 *
 * Not modelled, because each needs facts a form cannot capture: representation
 * beyond the sibling line, adopted children with their own line, disinherited
 * or disclaiming heirs, gifts subject to abatement (tenkis), and the marital
 * property regime - which is settled BEFORE the estate is divided and is
 * commonly the larger half of what a surviving spouse actually receives.
 */
export const inheritanceTool: ToolDefinition = {
  slug: 'miras-payi',
  fields: [
    { id: 'estateValue', type: 'money', required: true, min: 0, hasHint: true },
    { id: 'spouse', type: 'select', options: ['yes', 'no'], defaultValue: 'yes' },
    { id: 'childCount', type: 'integer', min: 0, max: 20, defaultValue: '0' },
    {
      id: 'parentsAlive',
      type: 'select',
      options: ['0', '1', '2'],
      defaultValue: '0',
      hasHint: true,
    },
    { id: 'siblingCount', type: 'integer', min: 0, max: 20, defaultValue: '0' },
  ],
  compute(input, format): ToolResult {
    const estate = num(input, 'estateValue');
    const hasSpouse = (input.spouse ?? 'yes') === 'yes';
    const children = int(input, 'childCount') ?? 0;
    const parents = Number(input.parentsAlive ?? '0');
    const siblings = int(input, 'siblingCount') ?? 0;

    if (estate === null) return { ok: false, errorId: 'missingFields' };
    if (estate <= 0) return { ok: false, errorId: 'invalidAmount' };
    if (children < 0 || siblings < 0) return { ok: false, errorId: 'invalidAmount' };

    const rows: ResultRow[] = [];
    const notes: string[] = ['inheritanceMaritalRegime', 'inheritanceScopeLimits'];

    /** Legal share of the spouse, as a fraction of the estate. */
    let spouseShare = 0;
    /** Reserved (saklı) portion, as a fraction of the estate. */
    let reservedTotal = 0;

    if (children > 0) {
      /* ---- first order: descendants ---------------------------------- */
      spouseShare = hasSpouse ? INHERITANCE.spouseWithDescendants : 0;
      const descendantsShare = 1 - spouseShare;
      const perChild = descendantsShare / children;

      if (hasSpouse) {
        rows.push({ id: 'spouseShare', value: format.money(estate * spouseShare) });
        // m.506/4: alongside the first or second order the spouse's reserved
        // portion is the whole of the legal share.
        reservedTotal += spouseShare;
      }
      rows.push({ id: 'perChildShare', value: format.money(estate * perChild) });
      rows.push({ id: 'childrenTotal', value: format.money(estate * descendantsShare) });
      reservedTotal += descendantsShare * INHERITANCE.reserved.descendants;
    } else if (parents > 0 || siblings > 0) {
      /* ---- second order: parents and their descendants ---------------- */
      spouseShare = hasSpouse ? INHERITANCE.spouseWithParents : 0;
      const orderShare = 1 - spouseShare;

      if (hasSpouse) {
        rows.push({ id: 'spouseShare', value: format.money(estate * spouseShare) });
        reservedTotal += spouseShare;
      }

      // The order is split in two lines, mother's and father's. A predeceased
      // parent's half passes to that parent's own descendants - the siblings.
      // Where one line is extinct entirely, it accrues to the other.
      const linesWithLivingParent = parents;
      const linesToSiblings = siblings > 0 ? 2 - parents : 0;
      const activeLines = linesWithLivingParent + linesToSiblings;

      if (activeLines === 0) {
        return { ok: false, errorId: 'noHeirsInOrder' };
      }

      const perLine = orderShare / activeLines;

      if (parents > 0) {
        rows.push({ id: 'perParentShare', value: format.money(estate * perLine) });
        rows.push({ id: 'parentsTotal', value: format.money(estate * perLine * parents) });
        reservedTotal += perLine * parents * INHERITANCE.reserved.parents;
      }
      if (linesToSiblings > 0 && siblings > 0) {
        const siblingsShare = perLine * linesToSiblings;
        rows.push({ id: 'perSiblingShare', value: format.money((estate * siblingsShare) / siblings) });
        rows.push({ id: 'siblingsTotal', value: format.money(estate * siblingsShare) });
        // Siblings have had no reserved portion since the 2007 amendment.
        notes.push('inheritanceSiblingsNoReserve');
      }
    } else if (hasSpouse) {
      /* ---- spouse alone ------------------------------------------------ */
      // m.499/3: with the third order the spouse takes 3/4; where no third
      // order survives either, m.499/son gives the spouse the whole estate.
      spouseShare = 1;
      rows.push({ id: 'spouseShare', value: format.money(estate) });
      // m.506/4: outside the first two orders the reserved portion is 3/4.
      reservedTotal = 3 / 4;
      notes.push('inheritanceSpouseAloneAssumption');
    } else {
      // m.501: no heirs in any order and no spouse - the estate escheats.
      return { ok: false, errorId: 'estateEscheats' };
    }

    const disposable = Math.max(0, 1 - reservedTotal);
    rows.push({ id: 'reservedTotal', value: format.money(estate * reservedTotal) });
    rows.push({ id: 'disposable', value: format.money(estate * disposable), emphasis: true });

    return { ok: true, rows, noteIds: notes };
  },
};
