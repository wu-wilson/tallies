import React from 'react';
import { motion } from 'framer-motion';

import { Icon } from '../common/Icon';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { ScanEntry } from '../../hooks/useOcr';

interface ScanRowProps {
  entry: ScanEntry;
  onRemove: () => void;
}

/**
 * One receipt row in the capture list — thumbnail, merchant or file name, and a scanning / done / failed status
 * with a remove control once a scan has failed.
 * @param props - The scan entry to render and its remove handler
 * @returns Animated list row
 */
export const ScanRow: React.FC<ScanRowProps> = ({ entry, onRemove }) => {
  const title = entry.merchant || entry.fileName;
  const status =
    entry.status === 'scanning' ? (
      <span className="font-mono text-[11px] text-brand">Scanning…</span>
    ) : entry.status === 'failed' ? (
      <span className="font-mono text-[11px] text-status-error">{entry.error ?? "Couldn't scan"} · remove</span>
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
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink bg-brand text-brand-on">
          <Icon name="check" size={15} />
        </span>
      ) : (
        <button
          onClick={onRemove}
          aria-label="Remove receipt"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint transition-[filter] hover:text-status-error"
        >
          <Icon name="cross" size={14} />
        </button>
      )}
    </motion.div>
  );
};
