import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

import { AppBar } from '../common/AppBar';
import { BackLink } from '../common/BackLink';
import { BUTTON_PRIMARY, CARD, LINK_MUTED } from '../common/styles';
import { DropZone } from './DropZone';
import { ScanRow } from './ScanRow';

import { useOcr } from '../../hooks/useOcr';
import { useBillStore } from '../../store/billStore';

import { MAX_RECEIPTS } from '../../constants/config';

/**
 * Capture screen: pick receipt photos and watch each one get read in a list below, or type the items in by hand
 * while no photo is read or still reading. Once at least one is read and none are still reading, Continue opens Verify.
 * @returns The capture layout
 */
export const CaptureScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const { entries, addFiles, removeEntry, isScanning, doneCount, commit } = useOcr();
  const setScreen = useBillStore((s) => s.setScreen);
  const addReceipt = useBillStore((s) => s.addReceipt);
  const billReceiptCount = useBillStore((s) => s.receipts.length);

  const receiptCount = billReceiptCount + entries.length;
  const isAtCap = receiptCount >= MAX_RECEIPTS;
  const isReadyToContinue = doneCount > 0 && !isScanning;
  const failedCount = entries.filter((e) => e.status === 'failed').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // A removed row takes focus with it, so hand it to Choose files. Only a key press scrolls there: a tap stays put.
  const handleRemoveEntry = (entryId: string, isKeyboard: boolean) => {
    removeEntry(entryId);
    chooseRef.current?.focus({ preventScroll: true });
    if (isKeyboard) chooseRef.current?.scrollIntoView({ block: 'nearest' });
  };

  const handleManualEntry = () => {
    addReceipt();
    setScreen('verify');
  };

  let barNote = 'All set';
  if (isScanning) barNote = 'Reading the rest';
  else if (failedCount > 0) barNote = `${failedCount} couldn't be read`;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar step="receipts" />
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      <main className="flex-1 px-5 pb-10 pt-7">
        <div className="mx-auto max-w-[680px]">
          {billReceiptCount > 0 ? (
            <BackLink label="Assign" onClick={() => setScreen('verify')} />
          ) : (
            <BackLink label="Home" onClick={() => setScreen('landing')} />
          )}
          <h1 tabIndex={-1} className="mt-3 text-[clamp(26px,2.3vw,32px)] leading-tight tracking-[-0.035em] focus:outline-none">Add your receipts</h1>
          <p className="mt-2 text-[15px] text-ink-2 [text-wrap:pretty]">
            Upload photos or screenshots, up to {MAX_RECEIPTS}. Tallies reads every item, plus tax and tip.
          </p>

          <div className="mt-7">
            <DropZone buttonRef={chooseRef} onBrowse={() => fileInputRef.current?.click()} onFiles={addFiles} isDisabled={isAtCap} />
          </div>
          {entries.length === 0 && billReceiptCount > 0 && (
            <p className="mt-3 text-[13px] text-ink-3">
              {isAtCap
                ? `This bill has ${MAX_RECEIPTS} receipts, the most it can hold.`
                : `${billReceiptCount} ${billReceiptCount === 1 ? 'receipt is' : 'receipts are'} already on this bill.`}
            </p>
          )}

          {entries.length > 0 && (
            <>
              <div className="mt-7 flex items-baseline justify-between">
                <h2 className="text-sm font-medium">Receipts</h2>
                <span className="text-[13px] text-ink-3">{`${receiptCount} of ${MAX_RECEIPTS} on this bill`}</span>
              </div>
              <div className={`mt-2.5 overflow-hidden ${CARD}`}>
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <ScanRow key={entry.id} entry={entry} onRemove={(e) => handleRemoveEntry(entry.id, e.detail === 0)} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {doneCount === 0 && !isScanning && !isAtCap && (
            <p className="mt-6 text-sm text-ink-3">
              Prefer typing?{' '}
              <button type="button" onClick={handleManualEntry} className={`underline-offset-4 hover:underline ${LINK_MUTED}`}>
                Enter the items yourself
              </button>
            </p>
          )}
        </div>
      </main>

      {entries.length > 0 && (
        <div className="sticky bottom-0 border-t border-line bg-surface px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 print:hidden">
          <div className="mx-auto flex max-w-[680px] items-center justify-between gap-4">
            <div aria-live="polite" aria-atomic="true" className="min-w-0">
              <div className="text-sm font-medium">{`${doneCount} of ${entries.length} ready`}</div>
              <div className="truncate text-[12.5px] text-ink-3">{barNote}</div>
            </div>
            <button type="button" onClick={commit} disabled={!isReadyToContinue} className={`h-[46px] shrink-0 px-[22px] text-[15px] ${BUTTON_PRIMARY}`}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
