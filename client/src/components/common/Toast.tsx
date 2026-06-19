import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { DURATION, EASE } from '../../constants/animations';

interface ToastProps {
  message: string;
  /** Visual treatment — `'success'` (green check), `'error'` (red X), or `'warning'` (rust alert). Defaults to `'success'`. */
  variant?: 'success' | 'error' | 'warning';
  isVisible: boolean;
  /** Increments on every `showToast` so back-to-back shows reset the 3s auto-dismiss timer. */
  showId: number;
  onDismiss: () => void;
}

/**
 * Bottom-centered transient notification — auto-dismisses 3s after each new show.
 * @param props - Toast configuration
 * @returns Fixed-position toast (renders nothing when `isVisible` is false)
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'success',
  isVisible,
  showId,
  onDismiss,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, showId, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
          style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className={clsx(
              'pointer-events-auto flex max-w-sm items-start gap-2 border border-ink bg-paper-raised px-4 py-2.5 font-mono text-xs font-bold',
              variant === 'success' && 'text-brand',
              variant === 'error' && 'text-status-error',
              variant === 'warning' && 'text-rust',
            )}
          >
            {variant === 'success' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : variant === 'warning' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span className="line-clamp-2 min-w-0">{message}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
