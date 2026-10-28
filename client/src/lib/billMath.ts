import { MAX_AMOUNT } from '../constants/config';

import type { PersonColorKey } from '../constants/colors';
import type { BillItem, Person, Receipt } from '../types/bill';

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
  /** This person's share of the receipt's total, to the cent; their groups add up to their `roundedTotal`. */
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

/** A receipt priced as one charge: its subtotal, tax, and tip at full precision, and its total in whole cents. */
interface Charge {
  subtotal: number;
  tax: number;
  tip: number;
  /** The total rounded to the cent on its own, as the receipt itself was charged. */
  totalCents: number;
}

/**
 * Price some of a receipt's items as one charge, resolving its tax and tip against their subtotal.
 * @param receipt - The receipt, for its tax and tip
 * @param items - The items charged: all of them on Verify, the assigned ones on Result
 * @returns The charge, its total rounded to the cent
 */
function chargeFor(receipt: Receipt, items: BillItem[]): Charge {
  // Summed in whole cents, since prices are stored to the cent and a long float sum can drift off a half cent.
  const subtotal = items.reduce((sum, i) => sum + toCents(i.price) * i.quantity, 0) / 100;
  const tax = resolveAmount(receipt.tax, receipt.taxIsPercent, subtotal);
  const tip = resolveAmount(receipt.tip, receipt.tipIsPercent, subtotal);
  return { subtotal, tax, tip, totalCents: toCents(subtotal + tax + tip) };
}

/**
 * Compute each person's share of the bill: their items grouped by receipt, plus each receipt's tax and tip split
 * among that receipt's people by their share of its subtotal. Unassigned items are left out; someone with none gets an
 * empty $0 breakdown, so everyone on the bill is listed.
 * @param receipts - All receipts on the bill (each carries its own items and tax/tip)
 * @param people - All people on the bill (shared across receipts)
 * @returns Per-person breakdowns sorted by name. Each receipt's total is split to the cent among its people, a person's
 * `roundedTotal` is the sum of their shares, and each group's lines add up to its share, so everyone's totals add up to
 * the bill
 */
function computeBreakdowns(receipts: Receipt[], people: Person[]): PersonBreakdown[] {
  const personMap = new Map<string, Person>();
  for (const person of people) {
    personMap.set(person.id, person);
  }

  // One breakdown per person, in `people` order, with their total in cents alongside, and how far that total runs
  // over their exact share, so each receipt's spare cents go to whoever is furthest behind and nobody's total drifts.
  const result: PersonBreakdown[] = people.map((p) => ({ personId: p.id, personName: p.name, personColor: p.color, groups: [], roundedTotal: 0 }));
  const totalCents = people.map(() => 0);
  const drift = people.map(() => 0);

  for (const receipt of receipts) {
    const assigned = receipt.items.filter((i) => i.assignees.length > 0);
    if (assigned.length === 0) continue;
    const charge = chargeFor(receipt, assigned);

    // Per-person slice of this one receipt.
    const slice = new Map<string, { items: ItemBreakdown[]; subtotal: number }>();
    for (const person of people) {
      slice.set(person.id, { items: [], subtotal: 0 });
    }

    for (const item of assigned) {
      // Priced in whole cents like `chargeFor`, so the shares split the same subtotal the receipt's total comes from.
      const perPersonAmount = (toCents(item.price) * item.quantity) / 100 / item.assignees.length;

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

    // A receipt whose assigned items are all free still owes any flat tax or tip: split it evenly among its people.
    const participants = people.filter((p) => (slice.get(p.id)?.items.length ?? 0) > 0).length;

    const shares: { k: number; group: PersonReceiptGroup }[] = [];
    for (const [k, person] of people.entries()) {
      const s = slice.get(person.id);
      if (!s || s.items.length === 0) continue;
      const proportion = charge.subtotal > 0 ? s.subtotal / charge.subtotal : 1 / participants;
      const group: PersonReceiptGroup = {
        receiptId: receipt.id,
        merchant: receipt.merchant,
        items: s.items,
        taxShare: charge.tax * proportion,
        tipShare: charge.tip * proportion,
        roundedTotal: 0,
      };
      result[k].groups.push(group);
      shares.push({ k, group });
    }

    // Split the receipt's own rounded total among its people, so their shares add up to what it was charged.
    const exactShares = shares.map(({ group }) => groupTotal(group));
    const shareCents = allocateCents(exactShares, charge.totalCents, shares.map(({ k }) => drift[k]));
    shares.forEach(({ k, group }, j) => {
      roundGroup(group, shareCents[j]);
      totalCents[k] += shareCents[j];
      drift[k] += shareCents[j] - exactShares[j] * 100;
    });
  }

  result.forEach((b, i) => {
    b.roundedTotal = totalCents[i] / 100;
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
 * @param targetCents - The whole the parts must add up to
 * @param drift - Cents each part is already over its exact amount elsewhere, which lowers its claim on a spare cent
 * @returns Whole-cent amounts in the same order, summing to `targetCents`
 */
function allocateCents(amounts: number[], targetCents: number, drift?: number[]): number[] {
  const exact = amounts.map((a) => Number((a * 100).toPrecision(15)));
  const cents = exact.map((c) => Math.floor(c));
  let remaining = targetCents - cents.reduce((sum, c) => sum + c, 0);
  // Only a part with a fraction of a cent takes a spare one, so an exact amount is never shown a cent off.
  const byRemainder = exact
    .map((c, i) => ({ i, priority: c > cents[i] ? c - cents[i] - (drift?.[i] ?? 0) : -Infinity }))
    .sort((x, y) => y.priority - x.priority);
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
 * @param targetCents - The total in cents
 * @returns The parts in dollars, each a whole number of cents
 */
function roundParts(parts: number[], targetCents: number): number[] {
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
 * Store a scanned dollar amount the way a typed one is: capped at `MAX_AMOUNT` and rounded to the cent.
 * @param amount - Dollar amount read from a receipt
 * @returns The amount as its field would hold it
 */
export function toFieldAmount(amount: number): number {
  return roundToCents(Math.min(amount, MAX_AMOUNT));
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

/** Combined totals for a set of receipts: each receipt's own rounded total, summed, with the parts adding up to it. */
export interface BillTotals {
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
}

/**
 * Total a set of receipt charges: each one's subtotal, tax, and tip rounded to add up to its total, then summed.
 * @param charges - One charge per receipt
 * @returns The combined totals in dollars
 */
function sumCharges(charges: Charge[]): BillTotals {
  let subtotal = 0;
  let tax = 0;
  let tip = 0;
  let total = 0;
  for (const charge of charges) {
    const [s, t, p] = allocateCents([charge.subtotal, charge.tax, charge.tip], charge.totalCents);
    subtotal += s;
    tax += t;
    tip += p;
    total += charge.totalCents;
  }
  return { subtotal: subtotal / 100, taxAmount: tax / 100, tipAmount: tip / 100, total: total / 100 };
}

/**
 * Total receipts over every item, assigned or not, so the Verify screen shows the full running total while editing.
 * @param receipts - The receipts to total: the whole bill for Verify's summary, or a single receipt for its own ledger
 * @returns Combined `subtotal`, `taxAmount`, `tipAmount`, and `total` in dollars
 */
export function deriveBillTotals(receipts: Receipt[]): BillTotals {
  return sumCharges(receipts.map((receipt) => chargeFor(receipt, receipt.items)));
}

/**
 * One receipt's assigned-only total plus its tax and tip rates, for the receipts card on Result and the shared view.
 */
export interface ReceiptSummary {
  receiptId: string;
  merchant: string;
  /** This receipt's assigned total, rounded to the cent on its own; the receipts add up to the bill's total. */
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
  /** The bill's total: its receipts' totals, each rounded to the cent on its own, added up. */
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
  const charges: Charge[] = [];
  let itemCount = 0;

  for (const receipt of receipts) {
    const assigned = receipt.items.filter((i) => i.assignees.length > 0);
    if (assigned.length === 0) continue;

    const charge = chargeFor(receipt, assigned);
    receiptSummaries.push({
      receiptId: receipt.id,
      merchant: receipt.merchant,
      total: charge.totalCents / 100,
      taxPercent: formatPercentage(receipt.tax, receipt.taxIsPercent, charge.subtotal),
      tipPercent: formatPercentage(receipt.tip, receipt.tipIsPercent, charge.subtotal),
    });
    charges.push(charge);
    itemCount += assigned.length;
  }

  return {
    ...sumCharges(charges),
    receiptSummaries,
    receiptCount: receiptSummaries.length,
    itemCount,
    breakdowns: computeBreakdowns(receipts, people),
  };
}
