import type { PersonColorKey } from '../constants/colors';
import type { Person, Receipt } from '../types/bill';

/** One assigned item's per-person amount plus the names of co-assignees. */
export interface ItemBreakdown {
  itemId: string;
  name: string;
  /** Dollar amount this person owes for this item, full-precision (round only at display). */
  amount: number;
  /** Names of other people sharing the same item; empty when this person is the sole assignee. */
  splitWith: string[];
}

/** One person's items within a single receipt, grouped for display. */
export interface PersonReceiptGroup {
  receiptId: string;
  merchant: string;
  items: ItemBreakdown[];
  /** This person's items subtotal within this receipt (before tax/tip). */
  subtotal: number;
}

/** A single person's full bill breakdown — items grouped by receipt, plus aggregate subtotal, tax/tip, and total. */
export interface PersonBreakdown {
  personId: string;
  personName: string;
  personColor: PersonColorKey;
  /** This person's items, grouped by the receipt they came from (only receipts they have items in). */
  groups: PersonReceiptGroup[];
  /** Sum of this person's item amounts across all receipts, before tax and tip. */
  itemsSubtotal: number;
  /** This person's proportional share of tax, summed across receipts (each receipt's tax split by that receipt's subtotals). */
  taxShare: number;
  /** This person's proportional share of tip, summed across receipts. */
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
 * Compute each person's share of the bill across all receipts — items grouped by receipt, plus aggregate
 * subtotal and proportional tax/tip. Tax and tip are resolved and distributed **per receipt** (each receipt's
 * tax/tip split among its own assignees by their share of that receipt's subtotal), then summed per person.
 * Unassigned items are excluded; people with no assigned items are omitted from the output.
 * @param receipts - All receipts on the bill (each carries its own items and tax/tip)
 * @param people - All people on the bill (shared across receipts)
 * @returns Per-person breakdowns sorted alphabetically by name; math is full-precision, rounding happens at display time only
 */
export function computeBreakdowns(receipts: Receipt[], people: Person[]): PersonBreakdown[] {
  const personMap = new Map<string, Person>();
  for (const person of people) {
    personMap.set(person.id, person);
  }

  const acc = new Map<string, { groups: PersonReceiptGroup[]; itemsSubtotal: number; taxShare: number; tipShare: number }>();
  for (const person of people) {
    acc.set(person.id, { groups: [], itemsSubtotal: 0, taxShare: 0, tipShare: 0 });
  }

  for (const receipt of receipts) {
    // Per-person slice of this one receipt.
    const slice = new Map<string, { items: ItemBreakdown[]; subtotal: number }>();
    for (const person of people) {
      slice.set(person.id, { items: [], subtotal: 0 });
    }

    for (const item of receipt.items) {
      if (item.assignees.length === 0) continue;
      const perPersonAmount = (item.price * item.quantity) / item.assignees.length;

      for (const personId of item.assignees) {
        const s = slice.get(personId);
        if (!s) continue;
        const otherNames = item.assignees
          .filter((id) => id !== personId)
          .map((id) => personMap.get(id)?.name || 'Unknown');
        s.items.push({ itemId: item.id, name: item.name, amount: perPersonAmount, splitWith: otherNames });
        s.subtotal += perPersonAmount;
      }
    }

    const receiptSubtotal = Array.from(slice.values()).reduce((sum, s) => sum + s.subtotal, 0);
    const taxAmount = resolveAmount(receipt.tax, receipt.taxIsPercent, receiptSubtotal);
    const tipAmount = resolveAmount(receipt.tip, receipt.tipIsPercent, receiptSubtotal);

    for (const person of people) {
      const s = slice.get(person.id);
      if (!s || s.items.length === 0) continue;
      const a = acc.get(person.id);
      if (!a) continue;
      const proportion = receiptSubtotal > 0 ? s.subtotal / receiptSubtotal : 0;
      a.groups.push({ receiptId: receipt.id, merchant: receipt.merchant, items: s.items, subtotal: s.subtotal });
      a.itemsSubtotal += s.subtotal;
      a.taxShare += taxAmount * proportion;
      a.tipShare += tipAmount * proportion;
    }
  }

  const result: PersonBreakdown[] = [];
  for (const person of people) {
    const a = acc.get(person.id);
    if (!a || a.groups.length === 0) continue;
    result.push({
      personId: person.id,
      personName: person.name,
      personColor: person.color,
      groups: a.groups,
      itemsSubtotal: a.itemsSubtotal,
      taxShare: a.taxShare,
      tipShare: a.tipShare,
      total: a.itemsSubtotal + a.taxShare + a.tipShare,
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

/** Combined live totals over every receipt's items (assigned or not) — what the Verify summary and CTA need. */
export interface BillTotals {
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
}

/**
 * Combine subtotal, tax, and tip across all receipts using every item (assigned or not), so the Verify screen
 * shows the full running total while editing. Tax/tip are resolved per receipt against that receipt's subtotal.
 * @param receipts - All receipts on the bill
 * @returns Combined `subtotal`, `taxAmount`, `tipAmount`, and `total` in dollars (unrounded)
 */
export function deriveBillTotals(receipts: Receipt[]): BillTotals {
  let subtotal = 0;
  let taxAmount = 0;
  let tipAmount = 0;
  for (const receipt of receipts) {
    const rSub = receipt.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    subtotal += rSub;
    taxAmount += resolveAmount(receipt.tax, receipt.taxIsPercent, rSub);
    tipAmount += resolveAmount(receipt.tip, receipt.tipIsPercent, rSub);
  }
  return { subtotal, taxAmount, tipAmount, total: subtotal + taxAmount + tipAmount };
}

/** One receipt's assigned-only totals plus pre-formatted percent strings — a row in the Result bill summary. */
export interface ReceiptSummary {
  receiptId: string;
  merchant: string;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  /** Pre-formatted percent string like `"7.5%"` for this receipt's tax. */
  taxPercent: string;
  /** Pre-formatted percent string like `"20%"` for this receipt's tip. */
  tipPercent: string;
}

/** Fully derived totals for the assigned slice of a bill — what Result/SharedView need to render. */
export interface AssignedTotals {
  /** Combined assigned-only subtotal across receipts. */
  subtotal: number;
  /** Combined tax across receipts (each resolved against its own subtotal). */
  taxAmount: number;
  /** Combined tip across receipts. */
  tipAmount: number;
  total: number;
  /** Per-receipt assigned-only summaries — only receipts that have at least one assigned item. */
  receiptSummaries: ReceiptSummary[];
  /** Number of receipts contributing to the bill (i.e. `receiptSummaries.length`). */
  receiptCount: number;
  /** Total assigned items across all receipts. */
  itemCount: number;
  breakdowns: PersonBreakdown[];
}

/**
 * Derive the displayed totals for the assigned slice of a bill — filters unassigned items, resolves each
 * receipt's tax/tip, builds per-receipt summaries, and computes per-person breakdowns.
 * @param receipts - All receipts on the bill; unassigned items are excluded from every total here
 * @param people - All people on the bill (passed through to `computeBreakdowns`)
 * @returns Combined aggregates, per-receipt summaries (only receipts with assigned items), counts, and per-person breakdowns
 */
export function deriveAssignedTotals(receipts: Receipt[], people: Person[]): AssignedTotals {
  const receiptSummaries: ReceiptSummary[] = [];
  let subtotal = 0;
  let taxAmount = 0;
  let tipAmount = 0;
  let itemCount = 0;

  for (const receipt of receipts) {
    const assigned = receipt.items.filter((i) => i.assignees.length > 0);
    if (assigned.length === 0) continue;

    const rSub = assigned.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const rTax = resolveAmount(receipt.tax, receipt.taxIsPercent, rSub);
    const rTip = resolveAmount(receipt.tip, receipt.tipIsPercent, rSub);

    receiptSummaries.push({
      receiptId: receipt.id,
      merchant: receipt.merchant,
      subtotal: rSub,
      taxAmount: rTax,
      tipAmount: rTip,
      total: rSub + rTax + rTip,
      taxPercent: formatPercentage(receipt.tax, receipt.taxIsPercent, rSub, rTax),
      tipPercent: formatPercentage(receipt.tip, receipt.tipIsPercent, rSub, rTip),
    });

    subtotal += rSub;
    taxAmount += rTax;
    tipAmount += rTip;
    itemCount += assigned.length;
  }

  return {
    subtotal,
    taxAmount,
    tipAmount,
    total: subtotal + taxAmount + tipAmount,
    receiptSummaries,
    receiptCount: receiptSummaries.length,
    itemCount,
    breakdowns: computeBreakdowns(receipts, people),
  };
}
