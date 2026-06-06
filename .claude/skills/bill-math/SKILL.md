---
name: bill-math
description: Per-receipt proportional tax/tip formula, split-item division logic, rounding strategy, and edge cases.
user-invocable: true
---

# Bill Math

Source of truth: `client/src/lib/billMath.ts`.

A bill is one or more **receipts**, each with its own items and tax/tip. People are shared across receipts. Tax and tip are resolved and distributed **per receipt**, then summed per person — this keeps each receipt's own rate accurate (you can't collapse differing rates into one global tax/tip).

## Algorithm

For each receipt independently:
1. `itemShare = (item.price × item.quantity) / item.assignees.length` for each assigned item
2. `personReceiptSubtotal = sum of that person's itemShares in this receipt`
3. `receiptSubtotal = sum of personReceiptSubtotals` (assigned items only)
4. `receiptTax = resolveAmount(receipt.tax, receipt.taxIsPercent, receiptSubtotal)` (same for tip)
5. `personTaxShare = receiptTax × (personReceiptSubtotal / receiptSubtotal)` (same for tip)

Then per person, summed across all receipts:
- `itemsSubtotal = Σ personReceiptSubtotal`
- `taxShare = Σ personTaxShare`, `tipShare = Σ personTipShare`
- `total = itemsSubtotal + taxShare + tipShare`

`computeBreakdowns(receipts, people)` returns each person's items grouped by receipt (`PersonReceiptGroup[]`, each carrying that receipt's own subtotal/tax/tip share for the person) plus the summed aggregates. `deriveAssignedTotals(receipts, people)` adds combined totals and per-receipt summaries (`ReceiptSummary[]`); `deriveBillTotals(receipts)` gives the live combined totals over all items for the Verify screen.

## Resolution

- `resolveAmount(value, isPercent, subtotal)`: if isPercent, returns `(value / 100) × subtotal`; otherwise returns value as-is.
- Tax and tip on each receipt can be a flat dollar amount or a percentage (`taxIsPercent` / `tipIsPercent` booleans per receipt).

## Rounding

- Full precision internally (IEEE 754 doubles).
- Round to nearest cent only at display time via `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

## Edge Cases

- **Zero receipt subtotal**: skip division (proportion = 0; no tax/tip distributed for that receipt).
- **Unassigned items**: excluded from breakdown — they don't contribute to any subtotal.
- **Single assignee on an item**: that person bears the item's full cost (no division).
- **Receipt with no assigned items**: omitted from `receiptSummaries` and from everyone's groups.
- **Split items**: `splitWith` in the breakdown lists co-assignees, scoped within the receipt the item came from.
- **Percent label**: per-person cards show each receipt's subtotal/tax/tip in **dollars** (no `· %`, since rates differ per receipt), with the person's grand total in the card header. The `· %` label only appears in the top bill summary for a single-receipt bill.

## Worked Example (two receipts)

Receipt A — Olive Garden, tax 10%, tip 20%:
- Chicken $20 (Sarah), Wine $8 (Sarah + Mike split)

Receipt B — Starbucks, tax 0%, tip 15%:
- Latte $5 (Sarah), Muffin $4 (Mike)

Receipt A: subtotal $28 → tax $2.80, tip $5.60. Sarah sub $24, Mike sub $4.
- Sarah: tax 2.80×24/28 = $2.40, tip 5.60×24/28 = $4.80
- Mike: tax 2.80×4/28 = $0.40, tip 5.60×4/28 = $0.80

Receipt B: subtotal $9 → tax $0, tip $1.35. Sarah sub $5, Mike sub $4.
- Sarah: tip 1.35×5/9 = $0.75
- Mike: tip 1.35×4/9 = $0.60

Totals:
- Sarah: items $29.00 + tax $2.40 + tip $5.55 = **$36.95**
- Mike: items $8.00 + tax $0.40 + tip $1.40 = **$9.80**
- Grand: $46.75 = subtotal $37.00 + tax $2.80 + tip $6.95 ✓
