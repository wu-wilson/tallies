---
name: bill-math
description: Proportional tax/tip formula, split-item division logic, rounding strategy, and edge cases.
user-invocable: true
---

# Bill Math

Source of truth: `client/src/lib/billMath.ts`.

## Algorithm

For each person:
1. `itemShare = (item.price × item.quantity) / item.assignees.length` for each assigned item
2. `itemsSubtotal = sum of all itemShares`
3. `globalSubtotal = sum of itemsSubtotal across all people` (equivalent to summing `price × quantity` over assigned items only)
4. `taxShare = (itemsSubtotal / globalSubtotal) × resolvedTax`
5. `tipShare = (itemsSubtotal / globalSubtotal) × resolvedTip`
6. `total = itemsSubtotal + taxShare + tipShare`

## Resolution

- `resolveAmount(value, isPercent, subtotal)`: if isPercent, returns `(value / 100) × subtotal`; otherwise returns value as-is.
- Tax and tip can each be either a flat dollar amount or a percentage. The store tracks `taxIsPercent` and `tipIsPercent` booleans.

## Rounding

- Full precision internally (IEEE 754 doubles).
- Round to nearest cent only at display time via `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

## Edge Cases

- **Zero subtotal**: skip division (proportion = 0 for all, no tax/tip distributed).
- **Unassigned items**: excluded from breakdown. They don't contribute to any person's subtotal.
- **Single assignee on an item**: that person bears the item's full cost (no division).
- **Empty assignees**: item is skipped in computation.
- **Split items**: `splitWith` array in the breakdown shows other people sharing the same item.

## Worked Example

Bill: Chicken ($20), Wine ($8 split between Sarah and Mike), Salad ($12)
Tax: $3.20 (flat), Tip: 20%

Sarah assigned: Chicken ($20), Wine ($4 share)
Mike assigned: Wine ($4 share), Salad ($12)

Sarah subtotal: $24.00, Mike subtotal: $16.00, Global: $40.00
Sarah tax: (24/40) × 3.20 = $1.92, Mike tax: (16/40) × 3.20 = $1.28
Tip resolved: 20% of $40 = $8.00
Sarah tip: (24/40) × 8 = $4.80, Mike tip: (16/40) × 8 = $3.20
Sarah total: $30.72, Mike total: $20.48
