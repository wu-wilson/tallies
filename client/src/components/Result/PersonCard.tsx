import React from 'react';
import { motion } from 'framer-motion';

import { DURATION, EASE } from '../../constants/animations';
import { formatCurrency } from '../../lib/billMath';
import { Avatar } from '../common/Avatar';

import type { PersonBreakdown } from '../../lib/billMath';

interface PersonCardProps {
  breakdown: PersonBreakdown;
  /** Position in the per-person list, used to stagger the entrance animation (50 ms per card). */
  index: number;
  /** Pre-formatted percent string (e.g. `"7.5%"`) appended to the tax row label. */
  taxPercent: string;
  /** Pre-formatted percent string (e.g. `"20%"`) appended to the tip row label. */
  tipPercent: string;
}

/**
 * Card showing one person's items, subtotal, tax share, tip share, and total.
 * @param props - Per-person breakdown plus shared display strings
 * @returns Animated card
 */
export const PersonCard: React.FC<PersonCardProps> = ({
  breakdown,
  index,
  taxPercent,
  tipPercent,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.smooth,
        ease: EASE.out,
        delay: 0.08 + index * 0.05,
      }}
      className="overflow-hidden rounded-xl border border-border bg-bg-secondary"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <Avatar
            name={breakdown.personName}
            color={breakdown.personColor}
            size="sm"
          />
          <span className="text-sm font-semibold text-text-primary">
            {breakdown.personName}
          </span>
        </div>
        <span className="font-mono text-base font-semibold tabular-nums text-text-primary">
          {formatCurrency(breakdown.total)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 px-5 pb-4">
        {breakdown.items.map((item) => (
          <div key={item.itemId} className="flex items-baseline justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1 truncate text-text-tertiary">
              <span className="text-text-secondary">{item.name || 'Unnamed'}</span>
              {item.splitWith.length > 0 && (
                <span className="ml-1">
                  · split with {item.splitWith.join(', ')}
                </span>
              )}
            </div>
            <span className="shrink-0 font-mono tabular-nums text-text-secondary">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-1 border-t border-border-subtle px-5 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-text-tertiary">Subtotal</span>
          <span className="font-mono tabular-nums text-text-secondary">
            {formatCurrency(breakdown.itemsSubtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-tertiary">Tax · {taxPercent}</span>
          <span className="font-mono tabular-nums text-text-secondary">
            {formatCurrency(breakdown.taxShare)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-tertiary">Tip · {tipPercent}</span>
          <span className="font-mono tabular-nums text-text-secondary">
            {formatCurrency(breakdown.tipShare)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
