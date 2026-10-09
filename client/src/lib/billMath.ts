import type { PersonColorKey } from '../constants/colors';
import type { Person, Receipt } from '../types/bill';

/** One assigned item's per-person amount plus the names of co-assignees. */
export interface ItemBreakdown {
  itemId: string;
  name: string;
  /** What this person owes for this item, rounded to the cent so the group's lines add up to its `roundedTotal`. */
  amount: number;
  /** Names of other people sharing the same item; empty when this person is the sole assignee. */
  splitWith: string[];
}

/** One person's items and proportional totals within a single receipt, grouped for display. */
export interface PersonReceiptGroup {
  receiptId: string;
  merchant: string;
  items: ItemBreakdown[];
  /** This person's proportional tax share for this receipt, rounded like the item amounts. */
  taxShare: number;
  /** This person's proportional tip share for this receipt, rounded like the item amounts. */
  tipShare: number;
  /** This receipt's share rounded to the cent, so a person's groups add up to their `roundedTotal`. */
  roundedTotal: number;
}

/** A single person's bill breakdown: their items grouped by receipt, plus their total. */
export interface PersonBreakdown {
  personId: string;
  personName: string;
  personColor: PersonColorKey;
  /** This person's items, grouped by the receipt they came from (only receipts they have items in). */
  groups: PersonReceiptGroup[];
  /** This person's share, items plus tax and tip, rounded to the cent so everyone's add up to the bill's total. */
  roundedTotal: number;
}

/**
 * Resolve a tax or tip input to a flat dollar amount.
 * @param value - Raw input — interpreted as dollars when `isPercent` is false, else as a percent (e.g. `20` means 20%)
 * @param isPercent - Whether `value` is a percentage of `subtotal` (true) or already in dollars (false)
 * @param subtotal - Items subtotal in dollars; ignored when `isPercent` is false
 * @returns Dollar amount at full precision; the derive functions allocate it to cents
 */
function resolveAmount(value: number, isPercent: boolean, subtotal: number): number {
  if (isPercent) {
    return (value / 100) * subtotal;
  }
  return value;
}

/**
 * Compute each person's share of the bill: their items grouped by receipt, plus each receipt's tax and tip split
 * among that receipt's people by their share of its subtotal. Unassigned items are left out; someone with none gets an
 * empty $0 breakdown, so everyone on the bill is listed.
 * @param receipts - All receipts on the bill (each carries its own items and tax/tip)
 * @param people - All people on the bill (shared across receipts)
 * @returns Per-person breakdowns sorted by name, with `roundedTotal` and every group line rounded to the cent so each
 * level adds up to the one above it, and everyone's totals add up to the bill
 */
function computeBreakdowns(receipts: Receipt[], people: Person[]): PersonBreakdown[] {
  const personMap = new Map<string, Person>();
  for (const person of people) {
    personMap.set(person.id, person);
  }

  // One breakdown per person, in `people` order, with their full-precision totals alongside.
  const result: PersonBreakdown[] = people.map((p) => ({ personId: p.id, personName: p.name, personColor: p.color, groups: [], roundedTotal: 0 }));
  const exactTotals = people.map(() => 0);

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
    // A receipt whose assigned items are all free still owes any flat tax or tip: split it evenly among its people.
    const participants = people.filter((p) => (slice.get(p.id)?.items.length ?? 0) > 0).length;

    for (const [k, person] of people.entries()) {
      const s = slice.get(person.id);
      if (!s || s.items.length === 0) continue;
      const proportion = receiptSubtotal > 0 ? s.subtotal / receiptSubtotal : 1 / participants;
      const personTax = taxAmount * proportion;
      const personTip = tipAmount * proportion;
      result[k].groups.push({
        receiptId: receipt.id,
        merchant: receipt.merchant,
        items: s.items,
        taxShare: personTax,
        tipShare: personTip,
        roundedTotal: 0,
      });
      exactTotals[k] += s.subtotal + personTax + personTip;
    }
  }

  const cents = allocateCents(exactTotals);
  result.forEach((b, i) => {
    b.roundedTotal = cents[i] / 100;
    const groupCents = allocateCents(b.groups.map(groupTotal), cents[i]);
    b.groups.forEach((g, j) => roundGroup(g, groupCents[j]));
  });

  result.sort((a, b) => a.personName.localeCompare(b.personName));
  return result;
}

/** A receipt group's full-precision total, its items plus its tax and tip shares. */
function groupTotal(group: PersonReceiptGroup): number {
  return group.items.reduce((sum, i) => sum + i.amount, 0) + group.taxShare + group.tipShare;
}

/**
 * Round a receipt group in place: its total to the cents allocated to it, and its item, tax, and tip lines so they
 * add up to that total.
 * @param group - The group, still at full precision
 * @param totalCents - The group's allocated total in cents
 */
function roundGroup(group: PersonReceiptGroup, totalCents: number): void {
  const lines = roundParts([...group.items.map((i) => i.amount), group.taxShare, group.tipShare], totalCents);
  group.items.forEach((item, k) => {
    item.amount = lines[k];
  });
  group.taxShare = lines[lines.length - 2];
  group.tipShare = lines[lines.length - 1];
  group.roundedTotal = totalCents / 100;
}

/**
 * Round amounts to whole cents with the largest-remainder method, so the rounded parts still add up to the
 * rounded whole (rounding each share on its own can leave the shares a cent off the bill total).
 * @param amounts - Dollar amounts at full precision, all non-negative
 * @param targetCents - The whole the parts must add up to; defaults to the rounded sum of `amounts`
 * @returns Whole-cent amounts in the same order, summing to `targetCents`
 */
function allocateCents(amounts: number[], targetCents = toCents(amounts.reduce((sum, a) => sum + a, 0))): number[] {
  const exact = amounts.map((a) => Number((a * 100).toPrecision(15)));
  const cents = exact.map((c) => Math.floor(c));
  let remaining = targetCents - cents.reduce((sum, c) => sum + c, 0);
  const byRemainder = exact.map((c, i) => ({ i, remainder: c - cents[i] })).sort((x, y) => y.remainder - x.remainder);
  for (const { i } of byRemainder) {
    if (remaining <= 0) break;
    cents[i] += 1;
    remaining -= 1;
  }
  return cents;
}

/**
 * Round the parts of a ledger to the cent so they add up to the total shown under them (see `allocateCents`).
 * @param parts - Dollar amounts at full precision, all non-negative
 * @param targetCents - The total in cents; defaults to the rounded sum of `parts`
 * @returns The parts in dollars, each a whole number of cents
 */
function roundParts(parts: number[], targetCents?: number): number[] {
  return allocateCents(parts, targetCents).map((c) => c / 100);
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Convert dollars to whole cents, rounding half up on the amount's decimal value, so 2.295 becomes 230 rather than
 * the 229 its binary approximation would give. Every displayed amount rounds through here, so they all agree.
 * @param amount - Dollar amount at full precision
 * @returns Whole cents
 */
function toCents(amount: number): number {
  return Math.round(Number((amount * 100).toPrecision(15)));
}

/**
 * Round a dollar amount to the cent the same way every display does, for values the UI shows in cents.
 * @param amount - Dollar amount, possibly with stray extra decimals (a typo like 12.505)
 * @returns The amount rounded half up to two decimals
 */
export function roundToCents(amount: number): number {
  return toCents(amount) / 100;
}

/**
 * Format a number as USD currency for display.
 * @param amount - Dollar amount at full precision, rounded to the cent with `toCents`
 * @returns String like `"$12.34"`, always with two fraction digits
 */
export function formatCurrency(amount: number): string {
  return USD.format(toCents(amount) / 100);
}

/**
 * Format a number as a plain two-decimal amount for ledger columns, rounded like `formatCurrency`.
 * @param amount - Dollar amount at full precision
 * @returns String like `"12.34"`, without a currency sign
 */
export function formatAmount(amount: number): string {
  return (toCents(amount) / 100).toFixed(2);
}

/**
 * Format a tax/tip value as a percent string for display alongside the dollar amount.
 * @param value - Raw store value (interpreted as percent when `isPercent` is true, else dollars)
 * @param isPercent - Whether `value` is already a percentage
 * @param subtotal - Items subtotal used to convert a dollar amount back into a percent
 * @returns The percent as entered (`"20%"`) when `isPercent`, otherwise derived to at most one decimal (`"7.5%"`,
 * `"8%"`); `"0%"` when `subtotal` is zero
 */
function formatPercentage(value: number, isPercent: boolean, subtotal: number): string {
  if (isPercent) return `${value}%`;
  if (subtotal <= 0) return '0%';
  return `${Number(((value / subtotal) * 100).toFixed(1))}%`;
}

/**
 * Combined live totals over every receipt's items (assigned or not), rounded to the cent so the parts add up
 * to `total`.
 */
export interface BillTotals {
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
}

/**
 * Combine subtotal, tax, and tip across all receipts using every item (assigned or not), so the Verify screen
 * shows the full running total while editing. Tax/tip are resolved per receipt against that receipt's subtotal.
 * @param receipts - The receipts to total: the whole bill for Verify's summary, or a single receipt for its own ledger
 * @returns Combined `subtotal`, `taxAmount`, `tipAmount`, and `total` in dollars, the three parts rounded so they
 * add up to the rounded total
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
  const [roundedSubtotal, roundedTax, roundedTip] = roundParts([subtotal, taxAmount, tipAmount]);
  return {
    subtotal: roundedSubtotal,
    taxAmount: roundedTax,
    tipAmount: roundedTip,
    total: toCents(subtotal + taxAmount + tipAmount) / 100,
  };
}

/**
 * One receipt's assigned-only total plus its tax and tip rates, for the receipts card on Result and the shared view.
 */
export interface ReceiptSummary {
  receiptId: string;
  merchant: string;
  /** Rounded to the cent so the receipts add up to the bill's total. */
  total: number;
  /** Pre-formatted percent string like `"7.5%"` for this receipt's tax. */
  taxPercent: string;
  /** Pre-formatted percent string like `"20%"` for this receipt's tip. */
  tipPercent: string;
}

/** Fully derived totals for the assigned slice of a bill — what Result/SharedView need to render. */
export interface AssignedTotals {
  /** Combined assigned-only subtotal across receipts; it, `taxAmount`, and `tipAmount` add up to `total`. */
  subtotal: number;
  /** Combined tax across receipts (each resolved against its own subtotal). */
  taxAmount: number;
  /** Combined tip across receipts. */
  tipAmount: number;
  /** The bill's total, rounded to the cent like every amount here. */
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
 * @returns Combined aggregates, per-receipt summaries (only receipts with assigned items), counts, and
 * per-person breakdowns
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
      total: rSub + rTax + rTip,
      taxPercent: formatPercentage(receipt.tax, receipt.taxIsPercent, rSub),
      tipPercent: formatPercentage(receipt.tip, receipt.tipIsPercent, rSub),
    });

    subtotal += rSub;
    taxAmount += rTax;
    tipAmount += rTip;
    itemCount += assigned.length;
  }

  const totalCents = toCents(subtotal + taxAmount + tipAmount);
  const receiptTotals = roundParts(receiptSummaries.map((r) => r.total), totalCents);
  receiptSummaries.forEach((r, i) => {
    r.total = receiptTotals[i];
  });
  const [roundedSubtotal, roundedTax, roundedTip] = roundParts([subtotal, taxAmount, tipAmount], totalCents);

  return {
    subtotal: roundedSubtotal,
    taxAmount: roundedTax,
    tipAmount: roundedTip,
    total: totalCents / 100,
    receiptSummaries,
    receiptCount: receiptSummaries.length,
    itemCount,
    breakdowns: computeBreakdowns(receipts, people),
  };
}
