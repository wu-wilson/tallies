import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';

import { useOcr } from '../../hooks/useOcr';
import { useToast } from '../../hooks/useToast';

import { DURATION, EASE } from '../../constants/animations';

interface ImagePreviewProps {
  /** The picked images; passed to `useOcr().submitReceipts` when the user taps Scan. */
  files: File[];
  /** Object URLs for `files`, used as the `<img>` sources. Caller owns their revoke lifecycle. */
  previewUrls: string[];
  /** Invoked when the user taps Change — should clear the picked files in the parent and return to the picker. */
  onReplace: () => void;
}

/**
 * Receipt preview shown after the user picks one or more images, with Change / Scan buttons.
 * Drives the batch OCR roundtrip via `useOcr` (with per-image progress) and surfaces failures as a Toast.
 * @param props - Image preview configuration
 * @returns Centered preview (single large image or a thumbnail grid) with action buttons and an error toast
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({ files, previewUrls, onReplace }) => {
  const { submitReceipts, isLoading, progress, error } = useOcr();
  const { toast, showToast, dismissToast } = useToast();
  const isMulti = previewUrls.length > 1;

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  const handleScan = () => {
    submitReceipts(files);
  };

  const scanLabel = isLoading
    ? progress && progress.total > 1
      ? `Scanning ${Math.min(progress.done + 1, progress.total)} of ${progress.total}`
      : 'Scanning'
    : isMulti
      ? `Scan ${files.length} receipts`
      : 'Scan';

  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      {isMulti ? (
        <div className="grid w-full max-w-sm grid-cols-3 gap-2">
          {previewUrls.map((url, i) => (
            <div key={url} className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
              <img src={url} alt={`Receipt ${i + 1}`} className="aspect-square h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-bg-secondary">
          <img
            src={previewUrls[0]}
            alt="Receipt preview"
            className="h-auto w-full object-contain"
            style={{ maxHeight: '55vh' }}
          />
        </div>
      )}

      {isMulti && (
        <p className="text-xs text-text-tertiary">
          {files.length} receipts
        </p>
      )}

      <div className="flex w-full max-w-sm gap-2">
        <motion.button
          onClick={onReplace}
          disabled={isLoading}
          className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border px-4 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          Change
        </motion.button>
        <motion.button
          onClick={handleScan}
          disabled={isLoading}
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-brand px-4 text-[13px] font-medium text-white transition-[filter,background-color] hover:bg-brand-light disabled:opacity-70"
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {scanLabel}
            </span>
          ) : (
            scanLabel
          )}
        </motion.button>
      </div>

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
