import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import { TallyLogo } from '../common/TallyLogo';
import { NotFound } from '../common/NotFound';
import { BillSummary } from '../Result/BillSummary';
import { PersonCard } from '../Result/PersonCard';

import { useSharedBill } from '../../hooks/useSharedBill';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { deriveBillName, deriveMemoLabel } from '../../lib/billName';
import { isValidVenmoUsername } from '../../lib/venmo';

import { DURATION, EASE } from '../../constants/animations';

/**
 * Read-only view of a shared bill loaded by short ID from the URL (`/b/:id`). Renders loading / not-found
 * states inline; on success, mirrors the result layout (header + summary + itemized per-person cards) with
 * a Venmo pay button per person when the owner supplied a handle.
 * @returns Loading spinner, the not-found screen, or the full shared-bill layout
 */
export const SharedView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bill, isLoading, error } = useSharedBill(id || '');

  const derived = useMemo(() => (bill ? deriveAssignedTotals(bill.receipts, bill.people) : null), [bill]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <div className="h-7 w-7 animate-spin-slow rounded-full border-[2.5px] border-line border-t-brand" />
        <p className="font-mono text-xs text-ink-faint">Loading bill…</p>
      </div>
    );
  }

  if (error || !bill || !derived) {
    return <NotFound />;
  }

  const { subtotal, taxAmount, tipAmount, total, receiptSummaries, receiptCount, itemCount, breakdowns } = derived;
  const singleReceipt =
    receiptCount === 1 ? bill.receipts.find((r) => r.id === receiptSummaries[0].receiptId) ?? null : null;
  const title = deriveBillName(bill.name);
  const expiresLabel = bill.expiresAt ? formatExpiresAt(bill.expiresAt) : null;
  const venmoUsername = bill.venmoUsername && isValidVenmoUsername(bill.venmoUsername) ? bill.venmoUsername : undefined;
  const venmoMemo = `${deriveMemoLabel(bill.name, bill.receipts)} · split via tallies.dev`;

  return (
    <div className="mx-auto min-h-dvh max-w-xl px-5 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[calc(20px+env(safe-area-inset-top))]">
      {/* Brand bar */}
      <div className="-mx-5 mb-6 flex items-center justify-between border-b border-ink px-5 pb-3">
        <div className="flex items-center gap-2">
          <TallyLogo size={16} />
          <span className="text-sm font-black tracking-tight">TALLIES</span>
        </div>
        <span className="font-mono text-[10px] font-bold tracking-[0.06em] text-ink-ghost">SHARED WITH YOU</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out }}
        className="mb-8"
      >
        <h1 className="break-words text-3xl font-black tracking-tight">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
          {singleReceipt?.date && <span>{singleReceipt.date.toUpperCase()}</span>}
          {receiptCount > 1 && <span>· {receiptCount} RECEIPTS</span>}
          <span>· {breakdowns.length} {breakdowns.length === 1 ? 'PERSON' : 'PEOPLE'}</span>
          <span>· {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</span>
        </div>
        <div className="mt-5 font-mono text-5xl font-bold tracking-tight tabular-nums">{formatCurrency(total)}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.05 }}
        className="mb-9"
      >
        <BillSummary summaries={receiptSummaries} subtotal={subtotal} tax={taxAmount} tip={tipAmount} />
      </motion.div>

      <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">PER PERSON · ITEMIZED</p>
      <div className="flex flex-col gap-3">
        {breakdowns.map((breakdown, index) => (
          <PersonCard
            key={breakdown.personId}
            breakdown={breakdown}
            index={index}
            variant="shared"
            venmoUsername={venmoUsername}
            venmoMemo={venmoMemo}
          />
        ))}
      </div>

      {expiresLabel && (
        <p className="mt-9 border-t-2 border-dashed border-line pt-5 text-center font-mono text-[11px] tracking-[0.04em] text-ink-ghost">
          THIS LINK EXPIRES {expiresLabel.toUpperCase()}
        </p>
      )}
    </div>
  );
};

const EXPIRES_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Format an ISO timestamp as a short, human-readable expiration date (e.g. "Jul 5, 2026").
 * @param iso - ISO 8601 timestamp from the server's `expiresAt` field
 * @returns Localized date string, or `null` if the input fails to parse into a valid `Date`
 */
function formatExpiresAt(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return EXPIRES_FORMATTER.format(date);
}
