import type { PersonColorKey } from '../constants/colors';
import type { BillItem, Person } from '../types/bill';

/** One assigned item's per-person amount plus the names of co-assignees. */
export interface ItemBreakdown {
  itemId: string;
  name: string;
  /** Dollar amount this person owes for this item, full-precision (round only at display). */
  amount: number;
  /** Names of other people sharing the same item; empty when this person is the sole assignee. */
  splitWith: string[];
}

/** A single person's full bill breakdown — items, subtotal, tax/tip shares, total. */
export interface PersonBreakdown {
  personId: string;
  personName: string;
  personColor: PersonColorKey;
  items: ItemBreakdown[];
  /** Sum of this person's item amounts, before tax and tip. */
  itemsSubtotal: number;
  /** This person's proportional share of the bill's total tax, in dollars. */
  taxShare: number;
  /** This person's proportional share of the bill's total tip, in dollars. */
  tipShare: number;
  /** `itemsSubtotal + taxShare + tipShare`. */
  total: number;
}

/**
 * Resolve a tax or tip input to a flat dollar amount.
 * @param value - Raw input — interpreted as dollars when `isPercent` is false, else as a percent (e.g. `20` means 20%)
 * @param isPercent - Whether `value` is a percentage of `subtotal` (true) or already in dollars (false)
 * @param subtotal - Items subtotal in dollars; ignored when `isPercent` is false
 * @returns Dollar amount, unrounded — call sites round only at display time
 */
export function resolveAmount(value: number, isPercent: boolean, subtotal: number): number {
  if (isPercent) {
    return (value / 100) * subtotal;
  }
  return value;
}

/**
 * Compute each person's share of the bill — items, subtotal, plus proportional tax and tip.
 * Items with no assignees are excluded; people with no assigned items are omitted from the output.
 * @param items - All bill items
 * @param people - All people on the bill
 * @param tax - Total tax already resolved to dollars (use `resolveAmount`)
 * @param tip - Total tip already resolved to dollars
 * @returns Per-person breakdowns sorted alphabetically by name; math is full-precision, rounding happens at display time only
 */
export function computeBreakdowns(
  items: BillItem[],
  people: Person[],
  tax: number,
  tip: number,
): PersonBreakdown[] {
  const personMap = new Map<string, Person>();
  for (const person of people) {
    personMap.set(person.id, person);
  }

  const breakdowns = new Map<string, { items: ItemBreakdown[]; subtotal: number }>();
  for (const person of people) {
    breakdowns.set(person.id, { items: [], subtotal: 0 });
  }

  for (const item of items) {
    if (item.assignees.length === 0) continue;

    const perPersonAmount = (item.price * item.quantity) / item.assignees.length;

    for (const personId of item.assignees) {
      const breakdown = breakdowns.get(personId);
      if (!breakdown) continue;

      const otherNames = item.assignees
        .filter((id) => id !== personId)
        .map((id) => personMap.get(id)?.name || 'Unknown');

      breakdown.items.push({
        itemId: item.id,
        name: item.name,
        amount: perPersonAmount,
        splitWith: otherNames,
      });
      breakdown.subtotal += perPersonAmount;
    }
  }

  const globalSubtotal = Array.from(breakdowns.values()).reduce(
    (sum, b) => sum + b.subtotal,
    0,
  );

  const result: PersonBreakdown[] = [];

  for (const person of people) {
    const breakdown = breakdowns.get(person.id);
    if (!breakdown || breakdown.items.length === 0) continue;

    const proportion = globalSubtotal > 0 ? breakdown.subtotal / globalSubtotal : 0;
    const taxShare = tax * proportion;
    const tipShare = tip * proportion;

    result.push({
      personId: person.id,
      personName: person.name,
      personColor: person.color,
      items: breakdown.items,
      itemsSubtotal: breakdown.subtotal,
      taxShare,
      tipShare,
      total: breakdown.subtotal + taxShare + tipShare,
    });
  }

  result.sort((a, b) => a.personName.localeCompare(b.personName));
  return result;
}

/**
 * Format a number as USD currency for display.
 * @param amount - Dollar amount; rounded to two decimal places by `Intl.NumberFormat`
 * @returns String like `"$12.34"` — always two fraction digits, with `$` prefix
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a tax/tip value as a percent string for display alongside the dollar amount.
 * @param value - Raw store value (interpreted as percent when `isPercent` is true, else dollars)
 * @param isPercent - Whether `value` is already a percentage
 * @param subtotal - Items subtotal used to convert a dollar amount back into a percent
 * @param dollarAmount - Already-resolved dollar amount, used when `isPercent` is false
 * @returns String like `"20%"`; returns `"0%"` when `subtotal` is zero and `isPercent` is false
 */
export function formatPercentage(
  value: number,
  isPercent: boolean,
  subtotal: number,
  dollarAmount: number,
): string {
  if (isPercent) return `${value}%`;
  if (subtotal <= 0) return '0%';
  return `${((dollarAmount / subtotal) * 100).toFixed(1)}%`;
}

/** Fully derived totals for the assigned slice of a bill — what Result/SharedView need to render. */
export interface AssignedTotals {
  /** Assigned-only items (input items filtered to those with at least one assignee). */
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  /** Pre-formatted percent string like `"7.5%"` ready for direct rendering. */
  taxPercent: string;
  /** Pre-formatted percent string like `"20%"` ready for direct rendering. */
  tipPercent: string;
  breakdowns: PersonBreakdown[];
}

/**
 * Derive the displayed totals for the assigned slice of a bill — filters unassigned items,
 * resolves tax/tip, computes per-person breakdowns, and pre-formats the percent strings.
 * @param items - All bill items; unassigned ones are excluded from every total here
 * @param people - All people on the bill (passed through to `computeBreakdowns`)
 * @param tax - Raw tax value from the store (dollars or percent)
 * @param taxIsPercent - Whether `tax` is a percent of the assigned subtotal
 * @param tip - Raw tip value from the store
 * @param tipIsPercent - Whether `tip` is a percent of the assigned subtotal
 * @returns Single object with the filtered items, all resolved aggregates, pre-formatted percent strings, and per-person breakdowns
 */
export function deriveAssignedTotals(
  items: BillItem[],
  people: Person[],
  tax: number,
  taxIsPercent: boolean,
  tip: number,
  tipIsPercent: boolean,
): AssignedTotals {
  const assigned = items.filter((i) => i.assignees.length > 0);
  const subtotal = assigned.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = resolveAmount(tax, taxIsPercent, subtotal);
  const tipAmount = resolveAmount(tip, tipIsPercent, subtotal);
  return {
    items: assigned,
    subtotal,
    taxAmount,
    tipAmount,
    total: subtotal + taxAmount + tipAmount,
    taxPercent: formatPercentage(tax, taxIsPercent, subtotal, taxAmount),
    tipPercent: formatPercentage(tip, tipIsPercent, subtotal, tipAmount),
    breakdowns: computeBreakdowns(assigned, people, taxAmount, tipAmount),
  };
}
