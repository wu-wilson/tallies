import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { DURATION, EASE } from '../../constants/animations';
import { useBillStore } from '../../store/billStore';

interface SplitEvenlyButtonProps {
  /** Receipt this toggle applies to. */
  receiptId: string;
}

/**
 * Per-receipt toggle that assigns every person to every item in this receipt — or clears them when already
 * in that state. `isSplitEvenly` is derived from current state so the button stays in sync after manual edits.
 * @param props - The receipt the toggle controls
 * @returns Inline text button with crossfade between "Split evenly" and "Splitting evenly"
 */
export const SplitEvenlyButton: React.FC<SplitEvenlyButtonProps> = ({ receiptId }) => {
  const { people, receipts, splitReceiptEvenly, unsplitReceiptEvenly } = useBillStore();
  const receipt = receipts.find((r) => r.id === receiptId);
  const isDisabled = people.length === 0 || (receipt?.items.length ?? 0) === 0;

  const isSplitEvenly = useMemo(() => {
    const items = receipts.find((r) => r.id === receiptId)?.items ?? [];
    if (people.length === 0 || items.length === 0) return false;
    const peopleIds = new Set(people.map((p) => p.id));
    return items.every(
      (item) =>
        item.assignees.length === peopleIds.size &&
        item.assignees.every((id) => peopleIds.has(id)),
    );
  }, [receipts, receiptId, people]);

  const handleClick = () => {
    if (isSplitEvenly) unsplitReceiptEvenly(receiptId);
    else splitReceiptEvenly(receiptId);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        'flex items-center gap-1.5 text-[11px] font-medium transition-colors',
        isSplitEvenly ? 'text-brand' : 'text-text-secondary hover:text-text-primary',
        isDisabled && 'cursor-not-allowed opacity-40',
      )}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSplitEvenly ? (
          <motion.span
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="flex items-center gap-1.5"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Splitting evenly
          </motion.span>
        ) : (
          <motion.span
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
          >
            Split evenly
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
