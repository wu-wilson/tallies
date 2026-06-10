import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import { Avatar } from '../common/Avatar';
import { VenmoButton } from './VenmoButton';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { PersonBreakdown, PersonReceiptGroup } from '../../lib/billMath';

/** Above this many co-sharers, the "split with" line shows a count ("split N ways") instead of listing names. */
const SPLIT_NAMES_LIMIT = 4;

/** Render the "split with" line: names for small splits, a "split N ways" count once it gets crowded. */
function splitLabel(splitWith: string[]): string {
  if (splitWith.length <= SPLIT_NAMES_LIMIT) return `split with ${splitWith.join(', ')}`;
  return `split ${splitWith.length + 1} ways`;
}

interface PersonCardProps {
  breakdown: PersonBreakdown;
  /** Position in the per-person list, used to stagger the entrance animation (50 ms per card). */
  index: number;
  /** When set, appends a "Pay via Venmo" button for this person's total; omit to hide it. */
  venmoUsername?: string;
  /** Note prefilled on the Venmo payment screen; required only when `venmoUsername` is set. */
  venmoMemo?: string;
}

/**
 * Card showing one person's items grouped by receipt, with each receipt's own subtotal, tax, and tip.
 * With multiple receipts, each group is a collapsible section (collapsed by default, showing merchant +
 * that receipt's total); a single receipt renders flat. The person's grand total sits in the card header.
 * When a Venmo handle is supplied (and the person owes a positive amount), a pay button is appended.
 * @param props - Per-person breakdown, list index for stagger timing, and optional Venmo pay details
 * @returns Animated card
 */
export const PersonCard: React.FC<PersonCardProps> = ({ breakdown, index, venmoUsername, venmoMemo }) => {
  const collapsible = breakdown.groups.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.08 + index * 0.05 }}
      className="overflow-hidden rounded-xl border border-border bg-bg-secondary"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={breakdown.personName} color={breakdown.personColor} size="sm" />
          <span className="text-sm font-semibold text-text-primary">{breakdown.personName}</span>
        </div>
        <span className="font-mono text-base font-semibold tabular-nums text-text-primary">
          {formatCurrency(breakdown.total)}
        </span>
      </div>

      {/* Per-receipt groups */}
      <div className="space-y-4 px-5 pb-4 pt-1">
        {breakdown.groups.map((group) => (
          <ReceiptGroup key={group.receiptId} group={group} collapsible={collapsible} />
        ))}
      </div>

      {venmoUsername && breakdown.total > 0 && (
        <div className="border-t border-border-subtle px-5 py-3">
          <VenmoButton username={venmoUsername} amount={breakdown.total} memo={venmoMemo ?? ''} />
        </div>
      )}
    </motion.div>
  );
};

interface ReceiptGroupProps {
  group: PersonReceiptGroup;
  /** When true, render a collapsible merchant header (multi-receipt bills); when false, render flat (single receipt). */
  collapsible: boolean;
}

/** One receipt's slice of a person's breakdown — two-line item rows plus the receipt's subtotal/tax/tip. */
const ReceiptGroup: React.FC<ReceiptGroupProps> = ({ group, collapsible }) => {
  // Multi-receipt groups start collapsed (clean overview); single-receipt renders flat, so the value is moot there.
  const [collapsed, setCollapsed] = useState(collapsible);
  const receiptTotal = group.subtotal + group.taxShare + group.tipShare;

  const details = (
    <>
      <div className="space-y-2">
        {group.items.map((item) => (
          <div key={item.itemId} className="text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-text-secondary">{item.name || 'Unnamed'}</span>
              <span className="shrink-0 font-mono tabular-nums text-text-secondary">{formatCurrency(item.amount)}</span>
            </div>
            {item.splitWith.length > 0 && (
              <p className="mt-0.5 text-text-tertiary">{splitLabel(item.splitWith)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2.5 space-y-1 border-t border-border-subtle pt-2.5 text-xs">
        <SummaryLine label="Subtotal" value={formatCurrency(group.subtotal)} />
        <SummaryLine label="Tax" value={formatCurrency(group.taxShare)} />
        <SummaryLine label="Tip" value={formatCurrency(group.tipShare)} />
      </div>
    </>
  );

  if (!collapsible) {
    return <div>{details}</div>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="group flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <svg
            className={clsx(
              'shrink-0 text-text-tertiary transition-[transform,color] duration-150 group-hover:text-text-secondary',
              !collapsed && 'rotate-90',
            )}
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary transition-colors group-hover:text-text-secondary">
            {group.merchant || 'Untitled receipt'}
          </span>
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-text-secondary">
          {formatCurrency(receiptTotal)}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="overflow-hidden"
          >
            <div className="pt-3">{details}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
