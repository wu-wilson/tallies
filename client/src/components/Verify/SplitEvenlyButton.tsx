import React, { useMemo } from 'react';
import clsx from 'clsx';

import { Icon } from '../common/Icon';

import { useBillStore } from '../../store/billStore';

interface SplitEvenlyButtonProps {
  /** Receipt this toggle applies to. */
  receiptId: string;
}

/**
 * Receipt-scoped toggle row that assigns every person to every item in this receipt, or clears them when
 * already in that state. `isSplitEvenly` is derived from current state so the check box stays in sync after
 * manual edits.
 * @param props - The receipt the toggle controls
 * @returns Full-width switch row with a label, a one-line explanation, and a check box carrying the state
 */
export const SplitEvenlyButton: React.FC<SplitEvenlyButtonProps> = ({ receiptId }) => {
  const { people, receipts, splitReceiptEvenly, unsplitReceiptEvenly } = useBillStore();
  const items = receipts.find((r) => r.id === receiptId)?.items ?? [];
  const isDisabled = people.length === 0 || items.length === 0;

  const isSplitEvenly = useMemo(() => {
    if (isDisabled) return false;
    const peopleIds = new Set(people.map((p) => p.id));
    return items.every(
      (item) =>
        item.assignees.length === peopleIds.size && item.assignees.every((id) => peopleIds.has(id)),
    );
  }, [isDisabled, items, people]);

  const handleClick = () => {
    if (isSplitEvenly) unsplitReceiptEvenly(receiptId);
    else splitReceiptEvenly(receiptId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      role="switch"
      aria-checked={isSplitEvenly}
      className={clsx(
        'flex w-full items-center justify-between gap-3 border-b border-line bg-paper-raised px-3.5 py-3 text-left transition-[filter] hover:brightness-[0.97] sm:px-4',
        isDisabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-extrabold text-ink">Split evenly</span>
        <span className="mt-0.5 block text-xs text-ink-faint">Everyone shares every item on this receipt.</span>
      </span>
      <span
        aria-hidden="true"
        className={clsx(
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center border border-ink transition-colors',
          isSplitEvenly ? 'bg-brand text-brand-on' : 'bg-paper-raised text-transparent',
        )}
      >
        <Icon name="check" size={13} />
      </span>
    </button>
  );
};
