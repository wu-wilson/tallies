import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { TallyLogo } from '../common/TallyLogo';
import { BillSummary } from '../Result/BillSummary';
import { PersonCard } from '../Result/PersonCard';

import { useSharedBill } from '../../hooks/useSharedBill';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { deriveBillName, deriveMemoLabel } from '../../lib/billName';
import { isValidVenmoUsername } from '../../lib/venmo';

import { DURATION, EASE } from '../../constants/animations';

/**
 * Read-only view of a shared bill loaded by short ID from the URL (`/b/:id`).
 * Renders loading / not-found states inline; on success, mirrors the Result layout (hero + summary + per-person cards).
 * @returns Loading spinner, not-found message, or the full shared-bill layout
 */
export const SharedView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bill, isLoading, error } = useSharedBill(id || '');

  const derived = useMemo(
    () => (bill ? deriveAssignedTotals(bill.receipts, bill.people) : null),
    [bill],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        <p className="text-xs text-text-secondary">Loading bill</p>
      </div>
    );
  }

  if (error || !bill || !derived) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          Bill not found
        </h2>
        <p className="max-w-xs text-sm text-text-secondary">
          This link may be invalid, or the bill may have expired (shared bills last 30 days).
        </p>
      </div>
    );
  }

  const { subtotal, taxAmount, tipAmount, total, receiptSummaries, receiptCount, itemCount, breakdowns } = derived;
  const singleReceipt = receiptCount === 1
    ? bill.receipts.find((r) => r.id === receiptSummaries[0].receiptId) ?? null
    : null;
  const title = deriveBillName(bill.name);
  const expiresLabel = bill.expiresAt ? formatExpiresAt(bill.expiresAt) : null;
  const venmoUsername = bill.venmoUsername && isValidVenmoUsername(bill.venmoUsername) ? bill.venmoUsername : undefined;
  const venmoMemo = `${deriveMemoLabel(bill.name, bill.receipts)} · split via tallies.dev`;

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-6 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[calc(32px+env(safe-area-inset-top))]">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <TallyLogo size={14} className="text-brand" />
        Tallies
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out }}
        className="mb-8"
      >
        <h1 className="break-words text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
          {singleReceipt?.date && (
            <>
              <span>{singleReceipt.date}</span>
              <span className="text-text-tertiary">·</span>
            </>
          )}
          {receiptCount > 1 && (
            <>
              <span>{receiptCount} receipts</span>
              <span className="text-text-tertiary">·</span>
            </>
          )}
          <span>
            {breakdowns.length} {breakdowns.length === 1 ? 'person' : 'people'}
          </span>
          <span className="text-text-tertiary">·</span>
          <span>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-semibold tabular-nums text-text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.05 }}
        className="mb-10"
      >
        <BillSummary summaries={receiptSummaries} subtotal={subtotal} tax={taxAmount} tip={tipAmount} />
      </motion.div>

      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
        Per person
      </p>
      <div className="flex flex-col gap-2.5">
        {breakdowns.map((breakdown, index) => (
          <PersonCard
            key={breakdown.personId}
            breakdown={breakdown}
            index={index}
            venmoUsername={venmoUsername}
            venmoMemo={venmoMemo}
          />
        ))}
      </div>

      {expiresLabel && (
        <p className="mt-10 text-center text-xs text-text-tertiary">
          This link expires on {expiresLabel}
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
