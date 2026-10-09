import { useBillStore } from '../store/billStore';

import { deriveBillTotals } from '../lib/billMath';

/** Whether the bill can move on to the split, and what to tell the user when it can't. */
export interface VerifyStatus {
  isReady: boolean;
  /** What still blocks the split, or a confirmation once nothing does. */
  message: string;
  /** The bill's running total (every item plus tax and tip), in dollars rounded to the cent. */
  total: number;
}

/**
 * Read the Verify screen's readiness from the store: a split needs an item on every receipt, at least two people,
 * and someone on every item.
 * @returns `{ isReady, message, total }`, recomputed whenever receipts or people change
 */
export function useVerifyStatus(): VerifyStatus {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);

  const items = receipts.flatMap((r) => r.items);
  const unassigned = items.filter((i) => i.assignees.length === 0).length;
  const { total } = deriveBillTotals(receipts);

  if (items.length === 0) return { isReady: false, message: 'Add an item to continue', total };
  // An empty receipt would still add its flat tax or tip to this total but drop out of the split.
  if (receipts.some((r) => r.items.length === 0)) return { isReady: false, message: 'A receipt has no items yet', total };
  if (people.length < 2) return { isReady: false, message: 'Add at least two people', total };
  if (unassigned > 0) {
    return { isReady: false, message: `${unassigned} ${unassigned === 1 ? 'item still needs' : 'items still need'} people`, total };
  }
  return { isReady: true, message: 'Every item has someone on it', total };
}
