import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';

import { useOcr } from '../../hooks/useOcr';
import { useToast } from '../../hooks/useToast';

import { DURATION, EASE } from '../../constants/animations';

interface ImagePreviewProps {
  /** The picked image; passed to `useOcr().submitReceipt` when the user taps Scan. */
  file: File;
  /** Object URL for `file`, used as the `<img>` source. Caller owns its revoke lifecycle. */
  previewUrl: string;
  /** Invoked when the user taps Change — should clear the picked file in the parent and return to the picker. */
  onReplace: () => void;
}

/**
 * Receipt preview shown after the user picks an image, with Change / Scan buttons.
 * Drives the OCR roundtrip via `useOcr` and surfaces failures as a Toast on this screen.
 * @param props - Image preview configuration
 * @returns Centered preview card with action buttons and a transient error toast
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, previewUrl, onReplace }) => {
  const { submitReceipt, isLoading, error } = useOcr();
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  const handleUse = () => {
    submitReceipt(file);
  };

  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-bg-secondary">
        <img
          src={previewUrl}
          alt="Receipt preview"
          className="h-auto w-full object-contain"
          style={{ maxHeight: '55vh' }}
        />
      </div>

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
          onClick={handleUse}
          disabled={isLoading}
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-brand px-4 text-[13px] font-medium text-white transition-[filter,background-color] hover:bg-brand-light disabled:opacity-70"
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Scanning
            </span>
          ) : (
            'Scan'
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
