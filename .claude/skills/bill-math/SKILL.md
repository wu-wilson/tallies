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

Then per person, summed across all receipts: `total = Σ (personReceiptSubtotal + personTaxShare + personTipShare)`.

`computeBreakdowns(receipts, people)` returns each person's items grouped by receipt (`PersonReceiptGroup[]`, each carrying that receipt's item, tax, and tip lines for the person) plus the person's `roundedTotal`. `deriveAssignedTotals(receipts, people)` adds combined totals and per-receipt summaries (`ReceiptSummary[]`); `deriveBillTotals(receipts)` gives the live combined totals over all items for the Verify screen.

## Resolution

- `resolveAmount(value, isPercent, subtotal)`: if isPercent, returns `(value / 100) × subtotal`; otherwise returns value as-is.
- Tax and tip on each receipt can be a flat dollar amount or a percentage (`taxIsPercent` / `tipIsPercent` booleans per receipt).

## Rounding

- Full precision internally (IEEE 754 doubles). Dollar amounts are the exception on the way in: item prices and flat tax or tip are stored rounded to the cent (`roundToCents`, from their fields, from a rate switched to $, and from OCR), since their fields show cents. Percentages keep their decimals (8.875%). A typed amount is capped at `MAX_AMOUNT` ($99,999.99) and a typed rate at `MAX_RATE` (100%), so a mistyped number can't overflow the layout or the cent rounding.
- Round to the cent only at display time, through `formatCurrency` ("$12.34") or `formatAmount` ("12.34" in ledger columns). Both go through `toCents`, which rounds half up on the amount's decimal value (2.295 → 2.30, where `toFixed` would give 2.29 from the binary approximation), so every displayed figure agrees.
- Per-person totals are the exception: rounding each one on its own can leave them a cent off the bill total, so `computeBreakdowns` sets `roundedTotal`, allocated with the largest-remainder method (`allocateCents`) so everyone's rounded totals add up exactly to the displayed bill total. Show `roundedTotal` wherever a person's total appears, and use it as the Venmo amount.
- The same allocation runs at every level a ledger lists parts above a total, so the lines always add up to what's shown:
  - each of a person's receipt groups gets a `roundedTotal` allocated against the person's `roundedTotal`, and the group's item, tax, and tip lines are allocated against that;
  - `deriveAssignedTotals` allocates the receipt totals, and the combined subtotal, tax, and tip, against the rounded bill total;
  - `deriveBillTotals` (Verify's summary and each receipt's ledger) allocates subtotal, tax, and tip against its rounded total.

## Edge Cases

- **Zero receipt subtotal** (every assigned item is free): any flat tax or tip is split evenly among that receipt's people, so it still lands in someone's share.
- **Unassigned items**: excluded from breakdown — they don't contribute to any subtotal.
- **Single assignee on an item**: that person bears the item's full cost (no division).
- **Receipt with no assigned items**: omitted from `receiptSummaries` and from everyone's groups.
- **Split items**: `splitWith` in the breakdown lists co-assignees, scoped within the receipt the item came from.
- **Percent label**: a person's receipt groups (`PersonGroup`) show tax and tip in **dollars** under a merchant line carrying that receipt's total for them. Rates appear only in `ReceiptsSummary`, and only for a single-receipt bill, since rates differ per receipt.

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
