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
  if (splitWith.length <= SPLIT_NAMES_LIMIT) return `SPLIT WITH ${splitWith.join(', ')}`.toUpperCase();
  return `SPLIT ${splitWith.length + 1} WAYS`;
}

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
            className="overflow-hidden border-t border-ink"
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

interface PersonGroupProps {
  group: PersonReceiptGroup;
  variant: 'result' | 'shared';
  /** When true (multi-receipt bills), prefix the group with a merchant header + its receipt total. */
  showMerchant: boolean;
}

/**
 * One receipt's slice of a person's breakdown — item rows plus the receipt's totals. With a merchant header
 * (multi-receipt people) it's an independently collapsible section, collapsed by default; with a single
 * receipt it renders flat (the person card itself is the toggle).
 */
const PersonGroup: React.FC<PersonGroupProps> = ({ group, variant, showMerchant }) => {
  const [collapsed, setCollapsed] = useState(true);
  const receiptTotal = group.subtotal + group.taxShare + group.tipShare;

  const body = (
    <>
      <div className="px-4 py-3.5">
        {group.items.map((item) => (
          <div key={item.itemId} className="mb-2.5 last:mb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.name || 'Unnamed'}</span>
              <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums">{formatCurrency(item.amount)}</span>
            </div>
            {variant === 'shared' && item.splitWith.length > 0 && (
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.03em] text-ink-ghost">{splitLabel(item.splitWith)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-ink px-4 py-3 font-mono text-[11.5px] text-ink-muted">
        {variant === 'shared' && <Line label="SUBTOTAL" value={formatCurrency(group.subtotal)} />}
        <Line label={variant === 'shared' ? 'TAX' : '+ TAX SHARE'} value={formatCurrency(group.taxShare)} />
        <Line label={variant === 'shared' ? 'TIP' : '+ TIP SHARE'} value={formatCurrency(group.tipShare)} />
      </div>
    </>
  );

  // Single receipt: the person card is already the toggle, so render the slice flat.
  if (!showMerchant) return <div>{body}</div>;

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-3 border-b border-line bg-paper px-4 py-2.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <svg
            className={clsx('shrink-0 text-ink-faint transition-transform duration-150', !collapsed && 'rotate-90')}
            width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate font-mono text-[10.5px] font-bold tracking-[0.05em]">
            {(group.merchant || 'Untitled receipt').toUpperCase()}
          </span>
        </span>
        <span className="font-mono text-xs font-bold tabular-nums">{formatCurrency(receiptTotal)}</span>
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
            {body}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LineProps {
  label: string;
  value: string;
}

const Line: React.FC<LineProps> = ({ label, value }) => (
  <div className="flex justify-between py-0.5">
    <span>{label}</span>
    <span className="font-bold tabular-nums">{value}</span>
  </div>
);
