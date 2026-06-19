import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { TallyLogo } from '../common/TallyLogo';

import { useOcr } from '../../hooks/useOcr';
import { useBillStore } from '../../store/billStore';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_RECEIPTS } from '../../constants/config';

import type { ScanEntry } from '../../hooks/useOcr';

/**
 * Capture screen — picks receipt images and scans them inline, showing each as a row with live status.
 * Once at least one receipt has scanned, Continue commits the parsed receipts to the store and advances to
 * Verify. A blank manual entry is offered when nothing has been added yet.
 * @returns The capture layout (logo + drop zone when empty, otherwise the scanning receipt list)
 */
export const CaptureScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { entries, addFiles, removeEntry, isScanning, doneCount, commit } = useOcr();
  const setScreen = useBillStore((s) => s.setScreen);
  const addReceipt = useBillStore((s) => s.addReceipt);

  const atCap = entries.length >= MAX_RECEIPTS;
  const canContinue = doneCount > 0 && !isScanning;
  const isEmpty = entries.length === 0;
  const scanningCount = entries.filter((e) => e.status === 'scanning').length;
  const failedCount = entries.filter((e) => e.status === 'failed').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualEntry = () => {
    addReceipt();
    setScreen('verify');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      {/* App bar */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setScreen('landing')}
          className="font-mono text-sm font-bold text-ink-faint transition-[filter] hover:text-ink"
          aria-label="Back to home"
        >
          &larr; Back
        </button>
        {!isEmpty && (
          <span className="font-mono text-[10px] font-bold tracking-[0.06em] text-ink-faint">
            {doneCount} DONE
            {scanningCount > 0 && ` · ${scanningCount} SCANNING`}
            {failedCount > 0 && ` · ${failedCount} FAILED`}
          </span>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {isEmpty ? (
        // Top-aligned (like the populated receipts list) so it stays put across viewport heights and doesn't
        // jump from center to top once the first receipt is added.
        <div className="flex flex-col items-center pb-16 text-center">
          <div className="flex items-center gap-2.5">
            <TallyLogo size={28} />
            <span className="text-2xl font-black tracking-tight">TALLIES</span>
          </div>
          <p className="mt-3 font-mono text-xs text-ink-faint">Keep tallies on every tab.</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 border-2 border-dashed border-ink bg-paper-raised px-5 py-6 transition-[filter] hover:brightness-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center bg-brand text-xl font-extrabold text-brand-on">+</span>
            <span className="text-[15px] font-extrabold">Add receipts</span>
            <span className="font-mono text-[11px] text-ink-ghost">UP TO {MAX_RECEIPTS}</span>
          </button>

          <button
            onClick={handleManualEntry}
            className="mt-5 font-mono text-xs text-ink-faint underline-offset-4 transition-[filter] hover:text-brand hover:underline"
          >
            or enter manually
          </button>
        </div>
      ) : (
        <>
          <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">
            RECEIPTS · {entries.length}
          </p>
          <div className="flex flex-col gap-3 pb-4">
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <ScanRow key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} />
              ))}
            </AnimatePresence>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={atCap}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-ink-faint bg-paper-raised px-4 py-3 text-sm font-bold text-ink-faint transition-[filter] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-base leading-none">+</span>
              Add more · {entries.length}/{MAX_RECEIPTS}
            </button>

            {/* No usable scans yet (e.g. all failed) — keep manual entry reachable. */}
            {doneCount === 0 && !isScanning && (
              <button
                onClick={handleManualEntry}
                className="mt-1 self-center font-mono text-xs text-ink-faint underline-offset-4 transition-[filter] hover:text-brand hover:underline"
              >
                or enter manually
              </button>
            )}
          </div>

          {/* Sticky bottom bar */}
          <div className="sticky bottom-0 -mx-5 mt-auto flex items-center gap-4 border-t border-ink bg-paper px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">
            <div className="flex-1">
              <div className="font-mono text-[11px] text-ink-faint">
                {doneCount} OF {entries.length} READY
              </div>
              <div className="text-[15px] font-extrabold">{isScanning ? 'Scanning…' : 'Ready to edit'}</div>
            </div>
            <motion.button
              onClick={commit}
              disabled={!canContinue}
              className="bg-brand px-7 py-3.5 text-[15px] font-extrabold text-brand-on transition-[filter] hover:brightness-110 disabled:opacity-40"
              whileTap={canContinue ? { scale: 0.98 } : undefined}
            >
              Continue &rarr;
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

interface ScanRowProps {
  entry: ScanEntry;
  onRemove: () => void;
}

/** One receipt row in the capture list — thumbnail, name/merchant, and a scanning / done / failed status. */
const ScanRow: React.FC<ScanRowProps> = ({ entry, onRemove }) => {
  const title = entry.merchant || entry.fileName;
  const status =
    entry.status === 'scanning' ? (
      <span className="font-mono text-[11px] text-brand">Scanning…</span>
    ) : entry.status === 'failed' ? (
      <span className="font-mono text-[11px] text-status-error">Couldn't scan · remove</span>
    ) : (
      <span className="font-mono text-[11px] text-ink-faint">
        {entry.itemCount} ITEMS · {formatCurrency(entry.subtotal ?? 0)}
      </span>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className="flex items-center gap-3.5 border border-ink bg-paper-raised p-3"
    >
      <img src={entry.previewUrl} alt="" className="h-14 w-11 shrink-0 border border-ink object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-extrabold">{title}</div>
        <div className="mt-1">{status}</div>
      </div>
      {entry.status === 'scanning' ? (
        <span className="h-6 w-6 shrink-0 animate-spin-slow rounded-full border-[2.5px] border-line border-t-brand" />
      ) : entry.status === 'done' ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink bg-brand text-sm font-extrabold text-brand-on">
          ✓
        </span>
      ) : (
        <button
          onClick={onRemove}
          aria-label="Remove receipt"
          className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink text-ink-faint transition-[filter] hover:text-status-error"
        >
          ×
        </button>
      )}
    </motion.div>
  );
};
