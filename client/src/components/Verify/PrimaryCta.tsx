import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { formatCurrency, resolveAmount } from '../../lib/billMath';
import { useBillStore } from '../../store/billStore';

/**
 * The "See breakdown $X.XX →" CTA — inline at the end of the column on `lg+`, wrapped by `StickyAction` (sticky-bottom) on mobile.
 * Disabled with a hint string until the bill has ≥2 people, ≥1 item, and every item is assigned.
 * @returns Full-width brand button (or muted disabled button with hint)
 */
export const PrimaryCta: React.FC = () => {
  const { people, items, tax, taxIsPercent, tip, tipIsPercent, setScreen } = useBillStore();

  const unassignedCount = items.filter((i) => i.assignees.length === 0).length;
  const hasPeople = people.length >= 2;
  const hasItems = items.length > 0;
  const allAssigned = unassignedCount === 0;
  const isReady = hasPeople && hasItems && allAssigned;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = resolveAmount(tax, taxIsPercent, subtotal);
  const tipAmount = resolveAmount(tip, tipIsPercent, subtotal);
  const total = subtotal + taxAmount + tipAmount;

  let hint = '';
  if (!hasItems) hint = 'Add items to continue';
  else if (!hasPeople) hint = 'Add at least 2 people';
  else if (!allAssigned) hint = `${unassignedCount} item${unassignedCount > 1 ? 's' : ''} unassigned`;

  return (
    <motion.button
      onClick={() => isReady && setScreen('result')}
      disabled={!isReady}
      className={clsx(
        'flex h-10 w-full items-center justify-between rounded-lg px-4 text-[13px] font-medium transition-[filter,background-color]',
        isReady
          ? 'bg-brand text-white hover:bg-brand-light'
          : 'cursor-not-allowed bg-bg-secondary text-text-tertiary',
      )}
      whileTap={isReady ? { scale: 0.98 } : undefined}
    >
      <span>{isReady ? 'See breakdown' : hint}</span>
      {isReady && (
        <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-white/80">
          {formatCurrency(total)}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      )}
    </motion.button>
  );
};
