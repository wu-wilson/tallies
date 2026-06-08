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
 * Edit-and-assign screen — shared people bar, one card per receipt (each with its own items + tax/tip),
 * an add-receipt control, a combined summary, and the primary CTA (sticky on mobile, inline on `lg+`).
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

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const atReceiptCap = receipts.length >= MAX_RECEIPTS;

  const handleNameBlur = () => {
    setIsEditingName(false);
    setName(nameValue.trim());
  };

  // Surface a partial-scan notice once, then clear it so it doesn't replay on re-render or revisit.
  useEffect(() => {
    if (scanNotice) {
      showToast(scanNotice, 'warning');
      setScanNotice(null);
    }
  }, [scanNotice, showToast, setScanNotice]);

  return (
    <motion.div
      className="mx-auto min-h-dvh max-w-2xl px-6 pt-[calc(32px+env(safe-area-inset-top))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      {/* Back */}
      <button
        onClick={() => setScreen('capture')}
        className="-ml-1 mb-6 flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Bill title (editable; shows "Untitled bill" until named — the breakdown then defaults to "Your bill") */}
      <div className="mb-10">
        {isEditingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            maxLength={MAX_NAME_LENGTH}
            placeholder="e.g. Weekend trip"
            className="-mx-2 w-[calc(100%+1rem)] rounded bg-transparent px-2 text-2xl font-semibold tracking-tight text-text-primary outline-none placeholder:text-text-tertiary"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setNameValue(name);
              setIsEditingName(true);
            }}
            className={`-mx-2 rounded px-2 text-left text-2xl font-semibold tracking-tight transition-colors hover:text-brand ${name ? 'text-text-primary' : 'text-text-tertiary'}`}
          >
            {name || 'Untitled bill'}
          </button>
        )}
      </div>

      {/* People */}
      <div className="mb-10">
        <PeopleBar />
      </div>

      {/* Receipts */}
      <section className="mb-10">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Receipts
        </p>

        <div className="flex flex-col gap-3">
          {receipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} canRemove={receipts.length > 1} />
          ))}

          <motion.button
            onClick={addReceipt}
            disabled={atReceiptCap}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-4 text-[13px] font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            whileTap={atReceiptCap ? undefined : { scale: 0.99 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add receipt
          </motion.button>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-10">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Summary
        </p>
        <SummaryPanel />
      </section>

      {/* Inline CTA on desktop. Mobile uses StickyAction below. */}
      <div className="hidden pb-8 lg:block">
        <PrimaryCta />
      </div>

      {/* Mobile-only sticky-bottom CTA */}
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
