import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';
import { PeopleBar } from './PeopleBar';
import { PrimaryCta } from './PrimaryCta';
import { ReceiptCard } from './ReceiptCard';
import { StickyAction } from './StickyAction';
import { SummaryPanel } from './SummaryPanel';

import { useToast } from '../../hooks/useToast';
import { useBillStore } from '../../store/billStore';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_NAME_LENGTH, MAX_RECEIPTS } from '../../constants/config';

/**
 * Edit-and-assign screen — editable bill title, the shared people bar, one card per receipt (each with its
 * own items + tax/tip), an add-receipt control, a combined summary, and the primary CTA (sticky on mobile,
 * inline on `lg+`).
 * @returns The full verify layout
 */
export const VerifyScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const addReceipt = useBillStore((s) => s.addReceipt);
  const setScreen = useBillStore((s) => s.setScreen);
  const scanNotice = useBillStore((s) => s.scanNotice);
  const setScanNotice = useBillStore((s) => s.setScanNotice);
  const name = useBillStore((s) => s.name);
  const setName = useBillStore((s) => s.setName);
  const { toast, showToast, dismissToast } = useToast();

  const [nameValue, setNameValue] = useState(name);

  const atReceiptCap = receipts.length >= MAX_RECEIPTS;

  // Surface a partial-scan notice once, then clear it so it doesn't replay on re-render or revisit.
  useEffect(() => {
    if (scanNotice) {
      showToast(scanNotice, 'warning');
      setScanNotice(null);
    }
  }, [scanNotice, showToast, setScanNotice]);

  return (
    <motion.div
      className="mx-auto min-h-dvh max-w-xl px-5 pt-[calc(28px+env(safe-area-inset-top))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      <button
        onClick={() => setScreen('capture')}
        className="mb-5 font-mono text-sm font-bold text-ink-faint transition-[filter] hover:text-ink"
      >
        &larr; Back
      </button>

      {/* Bill title */}
      <div className="mb-8">
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={() => setName(nameValue.trim())}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Weekend trip"
          className="w-full border border-ink bg-paper-raised px-4 py-3 text-2xl font-black tracking-tight text-ink outline-none placeholder:text-ink-ghost"
        />
        <p className="mt-2 font-mono text-[10px] tracking-[0.04em] text-ink-faint">NAME THIS BILL</p>
      </div>

      {/* People */}
      <div className="mb-9">
        <PeopleBar />
      </div>

      {/* Receipts */}
      <section className="mb-9">
        <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">RECEIPTS</p>
        <div className="flex flex-col gap-4">
          {receipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} canRemove={receipts.length > 1} />
          ))}

          <motion.button
            onClick={addReceipt}
            disabled={atReceiptCap}
            className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-ink-faint bg-paper-raised px-4 py-3 text-sm font-bold text-ink-faint transition-[filter] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            whileTap={atReceiptCap ? undefined : { scale: 0.99 }}
          >
            <span className="text-base leading-none">+</span>
            Add receipt
          </motion.button>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-9">
        <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">SUMMARY</p>
        <SummaryPanel />
      </section>

      {/* Inline CTA on desktop. Mobile uses StickyAction below. */}
      <div className="hidden pb-8 lg:block">
        <PrimaryCta />
      </div>

      <StickyAction />

      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        showId={toast.showId}
        onDismiss={dismissToast}
      />
    </motion.div>
  );
};
