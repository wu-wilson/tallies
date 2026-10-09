import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Icon } from '../common/Icon';
import { BUTTON_SECONDARY } from '../common/styles';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { ScanEntry } from '../../hooks/useOcr';

interface ScanRowProps {
  entry: ScanEntry;
  onRemove: () => void;
}

/**
 * One receipt in the capture list: its thumbnail, the merchant (or file name until it is read), and its status,
 * which is a spinner while reading, a green "Read" when done, or the reason it failed beside a Remove button.
 * @param props - The scan entry and its remove handler
 * @returns Animated list row
 */
export const ScanRow: React.FC<ScanRowProps> = ({ entry, onRemove }) => {
  const itemLabel = entry.itemCount === 1 ? '1 item' : `${entry.itemCount} items`;
  // A file the browser can't preview (a PDF, or HEIC outside Safari) gets a plain receipt tile instead.
  const [isPreviewBroken, setIsPreviewBroken] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className="flex items-center gap-3.5 border-b border-line-soft px-4 py-3.5 last:border-b-0"
    >
      {isPreviewBroken ? (
        <span className="flex h-12 w-[38px] shrink-0 items-center justify-center rounded-[5px] border border-line bg-line-soft text-ink-3">
          <Icon name="receipt" size={16} />
        </span>
      ) : (
        <img
          src={entry.previewUrl}
          alt=""
          onError={() => setIsPreviewBroken(true)}
          className="h-12 w-[38px] shrink-0 rounded-[5px] border border-line object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium tracking-[-0.01em]">{entry.merchant || entry.fileName}</div>
        {entry.status === 'scanning' && <div className="text-[13px] text-ink-3">Reading the items</div>}
        {entry.status === 'done' && (
          <div className="text-[13px] text-ink-3">
            {itemLabel} · {formatCurrency(entry.subtotal ?? 0)}
          </div>
        )}
        {entry.status === 'failed' && <div className="text-[13px] text-error">{entry.error}</div>}
      </div>
      {entry.status === 'scanning' && (
        <span role="status" aria-label="Reading" className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-ink" />
      )}
      {entry.status === 'done' && (
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-settled">
          <Icon name="check" size={16} />
          Read
        </span>
      )}
      {entry.status === 'failed' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${entry.fileName}`}
          className={`h-[34px] shrink-0 px-3 text-[13px] ${BUTTON_SECONDARY}`}
        >
          Remove
        </button>
      )}
    </motion.div>
  );
};
