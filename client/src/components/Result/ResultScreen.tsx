import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';
import { BillSummary } from './BillSummary';
import { PersonCard } from './PersonCard';
import { ShareCta } from './ShareCta';
import { StickyShare } from './StickyShare';

import { useShare } from '../../hooks/useShare';
import { useToast } from '../../hooks/useToast';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

/**
 * Per-person breakdown screen — adaptive hero, bill summary, per-person cards, and a share CTA
 * (sticky on mobile, inline on `lg+`).
 * @returns The result screen with share controls and a transient toast
 */
export const ResultScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);
  const setScreen = useBillStore((s) => s.setScreen);
  const { shareBill, isSharing } = useShare();
  const { toast, showToast, dismissToast } = useToast();
  const [hasShared, setHasShared] = useState(false);

  const { subtotal, taxAmount, tipAmount, total, receiptSummaries, receiptCount, itemCount, breakdowns } = useMemo(
    () => deriveAssignedTotals(receipts, people),
    [receipts, people],
  );

  // For a single contributing receipt, the hero mirrors today's look (merchant + date).
  const singleReceipt = receiptCount === 1
    ? receipts.find((r) => r.id === receiptSummaries[0].receiptId) ?? null
    : null;
  const title = singleReceipt ? (singleReceipt.merchant || 'Untitled bill') : 'Your bill';

  const handleShare = async () => {
    const url = await shareBill();
    if (url) {
      setHasShared(true);
      showToast('Link copied', 'success');
      // Revert "Link copied" back to "Share with group" so a second click reads as a fresh share
      // (each click creates a new short link by design).
      window.setTimeout(() => setHasShared(false), 3000);
    } else {
      showToast('Failed to share', 'error');
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-6 pt-[calc(32px+env(safe-area-inset-top))]">
      <button
        onClick={() => setScreen('verify')}
        className="-ml-1 mb-6 flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
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

      {/* Bill summary */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.05 }}
        className="mb-10"
      >
        <BillSummary summaries={receiptSummaries} subtotal={subtotal} tax={taxAmount} tip={tipAmount} />
      </motion.div>

      {/* Per-person */}
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
        Per person
      </p>
      <div className="flex flex-col gap-2.5">
        {breakdowns.map((breakdown, index) => (
          <PersonCard key={breakdown.personId} breakdown={breakdown} index={index} />
        ))}
      </div>

      {/* Inline share CTA on desktop. Mobile uses StickyShare below. */}
      <div className="mt-10 hidden pb-8 lg:block">
        <ShareCta onShare={handleShare} isSharing={isSharing} hasShared={hasShared} />
      </div>

      <StickyShare onShare={handleShare} isSharing={isSharing} hasShared={hasShared} />

      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        showId={toast.showId}
        onDismiss={dismissToast}
      />
    </div>
  );
};
