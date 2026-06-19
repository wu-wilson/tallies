import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';
import { BillSummary } from './BillSummary';
import { PersonCard } from './PersonCard';
import { VenmoField } from './VenmoField';

import { useShare } from '../../hooks/useShare';
import { useToast } from '../../hooks/useToast';
import { useVenmoUsername } from '../../hooks/useVenmoUsername';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { deriveBillName } from '../../lib/billName';
import { isValidVenmoUsername } from '../../lib/venmo';

import { DURATION, EASE } from '../../constants/animations';

/**
 * Per-person breakdown screen — bill header + total, summary, optional Venmo handle, per-person cards, and a
 * "Create share link" CTA (sticky on mobile, inline on `lg+`) that posts the bill and advances to Share.
 * @returns The result screen with the create-link controls and a transient toast
 */
export const ResultScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);
  const name = useBillStore((s) => s.name);
  const setScreen = useBillStore((s) => s.setScreen);
  const setShareUrl = useBillStore((s) => s.setShareUrl);
  const { createShareLink, isCreating } = useShare();
  const { toast, showToast, dismissToast } = useToast();
  const { username: venmoUsername, setUsername: setVenmoUsername } = useVenmoUsername();

  const activeVenmoUsername = isValidVenmoUsername(venmoUsername) ? venmoUsername : undefined;

  const { subtotal, taxAmount, tipAmount, total, receiptSummaries, receiptCount, itemCount, breakdowns } = useMemo(
    () => deriveAssignedTotals(receipts, people),
    [receipts, people],
  );

  const singleReceipt =
    receiptCount === 1 ? receipts.find((r) => r.id === receiptSummaries[0].receiptId) ?? null : null;
  const title = deriveBillName(name);

  const handleCreate = async () => {
    const result = await createShareLink(activeVenmoUsername);
    if ('error' in result) {
      showToast(result.error, 'error');
      return;
    }
    setShareUrl(result.url);
    setScreen('share');
  };

  const cta = (
    <motion.button
      onClick={handleCreate}
      disabled={isCreating}
      className="flex w-full items-center justify-center gap-2 bg-brand px-4 py-4 text-[15px] font-extrabold text-brand-on transition-[filter] hover:brightness-110 disabled:opacity-70"
      whileTap={{ scale: 0.99 }}
    >
      {isCreating ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin-slow rounded-full border-2 border-white/30 border-t-white" />
          Creating link…
        </>
      ) : (
        <>Create share link &rarr;</>
      )}
    </motion.button>
  );

  return (
    <div className="mx-auto min-h-dvh max-w-xl px-5 pt-[calc(28px+env(safe-area-inset-top))]">
      <button
        onClick={() => setScreen('verify')}
        className="mb-5 font-mono text-sm font-bold text-ink-faint transition-[filter] hover:text-ink"
      >
        &larr; Back
      </button>

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

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out, delay: 0.08 }}
        className="mb-9"
      >
        <VenmoField value={venmoUsername} onChange={setVenmoUsername} />
      </motion.div>

      <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">PER PERSON</p>
      <div className="flex flex-col gap-3">
        {breakdowns.map((breakdown, index) => (
          <PersonCard key={breakdown.personId} breakdown={breakdown} index={index} variant="result" />
        ))}
      </div>

      <div className="mt-9 hidden pb-8 lg:block">{cta}</div>

      <div className="sticky bottom-0 z-30 -mx-5 mt-9 border-t border-ink bg-paper px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        {cta}
      </div>

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
