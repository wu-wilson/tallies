import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { PersonReceiptGroup } from '../../lib/billMath';

/** Above this many co-sharers, the "split with" line shows a count ("split N ways") instead of listing names. */
const SPLIT_NAMES_LIMIT = 4;

/** Render the "split with" line: names for small splits, a "split N ways" count once it gets crowded. */
function splitLabel(splitWith: string[]): string {
  if (splitWith.length <= SPLIT_NAMES_LIMIT) return `SPLIT WITH ${splitWith.join(', ')}`.toUpperCase();
  return `SPLIT ${splitWith.length + 1} WAYS`;
}

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
 * @param props - The receipt group, the card variant, and whether to show the merchant header
 * @returns Collapsible or flat receipt section
 */
export const PersonGroup: React.FC<PersonGroupProps> = ({ group, variant, showMerchant }) => {
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

/** One label / value line in a group's totals block. */
const Line: React.FC<LineProps> = ({ label, value }) => (
  <div className="flex justify-between py-0.5">
    <span>{label}</span>
    <span className="font-bold tabular-nums">{value}</span>
  </div>
);
