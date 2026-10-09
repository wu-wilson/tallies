import React from 'react';

import { formatAmount, formatCurrency } from '../../lib/billMath';

import type { PersonReceiptGroup } from '../../lib/billMath';

interface PersonGroupProps {
  group: PersonReceiptGroup;
  /** Everyone on the bill, so a plate shared by the whole table reads "with everyone". */
  peopleCount: number;
}

/**
 * One receipt's slice of a person's share: the merchant and what this person owes on it, then each item they had
 * (noting who they split it with) and their share of the receipt's tax and tip.
 * @param props - The receipt group and the bill's head count
 * @returns The group's lines
 */
export const PersonGroup: React.FC<PersonGroupProps> = ({ group, peopleCount }) => (
  <div>
    <div className="flex justify-between gap-4 border-b border-line pb-1.5 text-[13.5px] font-medium">
      <span className="truncate">{group.merchant || 'Receipt'}</span>
      <span>{formatCurrency(group.roundedTotal)}</span>
    </div>
    <div className="flex flex-col gap-1.5 pt-2 text-[13.5px] text-ink-2">
      {group.items.map((item) => (
        <div key={item.itemId} className="flex justify-between gap-4">
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {item.name || 'Unnamed item'} <span className="text-ink-3">{splitNote(item.splitWith, peopleCount)}</span>
          </span>
          <span className="shrink-0">{formatAmount(item.amount)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 text-ink-3">
        <span>Tax</span>
        <span>{formatAmount(group.taxShare)}</span>
      </div>
      <div className="flex justify-between gap-4 text-ink-3">
        <span>Tip</span>
        <span>{formatAmount(group.tipShare)}</span>
      </div>
    </div>
  </div>
);

/** "with Alex", "with Alex and Sam", "with everyone" for the whole table, else "split 5 ways". */
function splitNote(splitWith: string[], peopleCount: number): string {
  if (splitWith.length === 0) return '';
  if (splitWith.length + 1 === peopleCount && peopleCount > 2) return 'with everyone';
  if (splitWith.length <= 2) return `with ${splitWith.join(' and ')}`;
  return `split ${splitWith.length + 1} ways`;
}
