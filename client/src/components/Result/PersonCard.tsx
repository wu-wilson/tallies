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
}

/**
 * Card showing one person's items grouped by receipt, with each receipt's own subtotal, tax, and tip.
 * The person's grand total across receipts sits in the card header.
 * @param props - Per-person breakdown plus its list index for stagger timing
 * @returns Animated card
 */
export const PersonCard: React.FC<PersonCardProps> = ({ breakdown, index }) => {
  const showMerchants = breakdown.groups.length > 1;

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
          <Avatar name={breakdown.personName} color={breakdown.personColor} size="sm" />
          <span className="text-sm font-semibold text-text-primary">
            {breakdown.personName}
          </span>
        </div>
        <span className="font-mono text-base font-semibold tabular-nums text-text-primary">
          {formatCurrency(breakdown.total)}
        </span>
      </div>

      {/* Per-receipt: items + that receipt's subtotal/tax/tip */}
      <div className="space-y-5 px-5 pb-4 pt-1">
        {breakdown.groups.map((group) => (
          <div key={group.receiptId}>
            {showMerchants && (
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
                {group.merchant || 'Untitled receipt'}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div key={item.itemId} className="flex items-baseline justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1 truncate text-text-tertiary">
                    <span className="text-text-secondary">{item.name || 'Unnamed'}</span>
                    {item.splitWith.length > 0 && (
                      <span className="ml-1">· split with {item.splitWith.join(', ')}</span>
                    )}
                  </div>
                  <span className="shrink-0 font-mono tabular-nums text-text-secondary">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 space-y-1 border-t border-border-subtle pt-2.5 text-xs">
              <SummaryLine label="Subtotal" value={formatCurrency(group.subtotal)} />
              <SummaryLine label="Tax" value={formatCurrency(group.taxShare)} />
              <SummaryLine label="Tip" value={formatCurrency(group.tipShare)} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

interface SummaryLineProps {
  label: string;
  value: string;
}

const SummaryLine: React.FC<SummaryLineProps> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-text-tertiary">{label}</span>
    <span className="font-mono tabular-nums text-text-secondary">{value}</span>
  </div>
);
