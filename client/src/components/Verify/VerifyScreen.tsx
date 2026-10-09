import React, { useEffect, useRef, useState } from 'react';

import { AppBar } from '../common/AppBar';
import { BackLink } from '../common/BackLink';
import { Icon } from '../common/Icon';
import { commitOnEnter } from '../common/keys';
import { Toast } from '../common/Toast';
import { PeopleCard } from './PeopleCard';
import { ReceiptCard } from './ReceiptCard';
import { StickyAction } from './StickyAction';
import { SummaryPanel } from './SummaryPanel';

import { useToast } from '../../hooks/useToast';
import { useBillStore } from '../../store/billStore';

import { MAX_NAME_LENGTH, MAX_RECEIPTS } from '../../constants/config';

/**
 * Assign screen: the bill's name, then on desktop the receipts on the left with people and a sticky summary on
 * the right. Phones stack people, receipts, and summary, with the total and review button in a bottom bar.
 * @returns The verify layout
 */
export const VerifyScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const addReceipt = useBillStore((s) => s.addReceipt);
  const removeReceipt = useBillStore((s) => s.removeReceipt);
  const setScreen = useBillStore((s) => s.setScreen);
  const scanNotice = useBillStore((s) => s.scanNotice);
  const setScanNotice = useBillStore((s) => s.setScanNotice);
  const name = useBillStore((s) => s.name);
  const setName = useBillStore((s) => s.setName);
  const { toast, showToast, dismissToast } = useToast();
  const [nameValue, setNameValue] = useState(name);
  const addReceiptRef = useRef<HTMLButtonElement>(null);

  const itemCount = receipts.reduce((n, r) => n + r.items.length, 0);

  // A removed receipt takes focus with it, so hand it to Add another receipt.
  const handleRemoveReceipt = (receiptId: string) => {
    removeReceipt(receiptId);
    addReceiptRef.current?.focus();
  };

  // Surface a partial-scan notice once, then clear it so it doesn't replay on re-render or revisit.
  useEffect(() => {
    if (scanNotice) {
      showToast(scanNotice, 'warning');
      setScanNotice(null);
    }
  }, [scanNotice, showToast, setScanNotice]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar step="assign" />
      <main className="flex-1 px-5 pb-12 pt-7">
        <div className="mx-auto max-w-[1200px]">
          <BackLink label="Receipts" onClick={() => setScreen('capture')} />
          {/* The editable bill name stands in for the title, so the screen's heading is for screen readers. */}
          <h1 tabIndex={-1} className="sr-only">Assign the items</h1>
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={() => setName(nameValue.trim())}
            onKeyDown={commitOnEnter}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Name this bill"
            aria-label="Bill name"
            className="cell -ml-2 mt-2 block h-[calc(1.25em+8px)] w-full max-w-[640px] px-2 text-[clamp(26px,2.3vw,32px)] leading-tight tracking-[-0.035em] placeholder:text-ink-3"
          />
          <p className="text-sm text-ink-3">
            {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>

          <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-4 [grid-template-areas:'people'_'main'_'summary'] lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:[grid-template-areas:'main_people'_'main_summary'_'main_.']">
            <div className="[grid-area:people]">
              <PeopleCard />
            </div>
            <div className="flex min-w-0 flex-col gap-4 [grid-area:main]">
              {receipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  onRemove={receipts.length > 1 ? () => handleRemoveReceipt(receipt.id) : undefined}
                />
              ))}
              <button
                ref={addReceiptRef}
                type="button"
                onClick={addReceipt}
                aria-disabled={receipts.length >= MAX_RECEIPTS}
                className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm font-medium text-ink-2 transition-colors duration-200 hover:border-ink-4 hover:text-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-line-strong aria-disabled:hover:text-ink-2"
              >
                <Icon name="plus" />
                Add another receipt
              </button>
            </div>
            <div className="self-start [grid-area:summary] lg:sticky lg:top-6">
              <SummaryPanel />
            </div>
          </div>
        </div>
      </main>
      <StickyAction />
      <Toast message={toast.message} variant={toast.variant} isVisible={toast.isVisible} showId={toast.showId} onDismiss={dismissToast} hasRail />
    </div>
  );
};
