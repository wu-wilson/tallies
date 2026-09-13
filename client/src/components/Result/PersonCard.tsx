import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import { Avatar } from '../common/Avatar';
import { PersonGroup } from './PersonGroup';
import { VenmoButton } from './VenmoButton';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { PersonBreakdown } from '../../lib/billMath';

interface PersonCardProps {
  breakdown: PersonBreakdown;
  /** Position in the per-person list, used to stagger the entrance animation (50 ms per card). */
  index: number;
  /** `result` is the owner's editing view (tax/tip additions); `shared` adds split-with lines and a pay button. */
  variant: 'result' | 'shared';
  /** When set (shared variant), appends a "Pay" button for this person's total; omit to hide it. */
  venmoUsername?: string;
  /** Note prefilled on the Venmo payment screen; required only when `venmoUsername` is set. */
  venmoMemo?: string;
}

/**
 * Card showing one person's items grouped by receipt, with each receipt's own subtotal/tax/tip and the
 * person's grand total in the header. Starts collapsed; tapping the header expands or collapses the detail.
 * In the shared variant each item notes who it was split with, and a Venmo pay button is appended when a
 * handle is set.
 * @param props - Per-person breakdown, list index, variant, and optional Venmo details
 * @returns Animated, expandable card
 */
export const PersonCard: React.FC<PersonCardProps> = ({
  breakdown,
  index,
  variant,
  venmoUsername,
  venmoMemo,
}) => {
  const [expanded, setExpanded] = useState(false);
  const multiGroup = breakdown.groups.length > 1;
  const itemCount = breakdown.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.08 + index * 0.05 }}
      className="border border-ink bg-paper-raised"
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Avatar name={breakdown.personName} color={breakdown.personColor} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-extrabold">{breakdown.personName}</div>
          <div className="font-mono text-[10px] tracking-[0.04em] text-ink-faint">
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
          </div>
        </div>
        <span className="font-mono text-lg font-bold tabular-nums">{formatCurrency(breakdown.total)}</span>
        <svg
          className={clsx('shrink-0 text-ink-faint transition-transform duration-150', expanded && 'rotate-90')}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="divide-y divide-line overflow-hidden border-t border-ink"
          >
            {breakdown.groups.map((group) => (
              <PersonGroup key={group.receiptId} group={group} variant={variant} showMerchant={multiGroup} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay button stays visible whether or not the breakdown is expanded — paying is the primary action. */}
      {variant === 'shared' && venmoUsername && breakdown.total > 0 && (
        <div className="border-t border-ink p-3.5">
          <VenmoButton username={venmoUsername} amount={breakdown.total} memo={venmoMemo ?? ''} />
        </div>
      )}
    </motion.div>
  );
};
