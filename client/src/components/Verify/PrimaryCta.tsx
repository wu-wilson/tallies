import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { deriveBillTotals, formatCurrency } from '../../lib/billMath';
import { useBillStore } from '../../store/billStore';

/**
 * The "See breakdown — $X →" CTA — inline at the end of the column on `lg+`, wrapped by `StickyAction`
 * (sticky-bottom) on mobile. Disabled with a hint until the bill has ≥2 people, ≥1 item, and every item assigned.
 * @returns Full-width brand button (or a muted disabled button with a hint)
 */
export const PrimaryCta: React.FC = () => {
  const { people, receipts, setScreen } = useBillStore();

  const allItems = receipts.flatMap((r) => r.items);
  const unassignedCount = allItems.filter((i) => i.assignees.length === 0).length;
  const hasPeople = people.length >= 2;
  const hasItems = allItems.length > 0;
  const allAssigned = unassignedCount === 0;
  const isReady = hasPeople && hasItems && allAssigned;

  const { total } = deriveBillTotals(receipts);

  let hint = '';
  if (!hasItems) hint = 'Add items to continue';
  else if (!hasPeople) hint = 'Add at least 2 people';
  else if (!allAssigned) hint = `${unassignedCount} item${unassignedCount > 1 ? 's' : ''} unassigned`;

  return (
    <motion.button
      onClick={() => isReady && setScreen('result')}
      disabled={!isReady}
      className={clsx(
        'flex w-full items-center justify-center gap-2 px-4 py-4 text-[15px] font-extrabold transition-[filter]',
        isReady ? 'bg-brand text-brand-on hover:brightness-110' : 'cursor-not-allowed border border-ink bg-sand-2 text-ink-faint',
      )}
      whileTap={isReady ? { scale: 0.99 } : undefined}
    >
      {isReady ? (
        <>
          See breakdown — {formatCurrency(total)} &rarr;
        </>
      ) : (
        hint
      )}
    </motion.button>
  );
};
