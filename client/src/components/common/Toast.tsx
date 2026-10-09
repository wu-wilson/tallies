import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Icon } from './Icon';

import { DURATION, EASE } from '../../constants/animations';

const ICONS = {
  success: { name: 'check', className: 'text-settled' },
  error: { name: 'alert', className: 'text-error' },
  warning: { name: 'alert', className: 'text-ink-3' },
} as const;

interface ToastProps {
  message: string;
  /** `'success'` (green tick), `'error'` (red alert), or `'warning'` (grey alert). */
  variant: 'success' | 'error' | 'warning';
  isVisible: boolean;
  /** Increments on every `showToast` so back-to-back shows reset the 3s auto-dismiss timer. */
  showId: number;
  onDismiss: () => void;
  /** The screen has a right-hand rail from `lg`, so the toast centres over the main column instead, clear of it. */
  hasRail?: boolean;
}

/**
 * Bottom-centred transient notification, a white card that auto-dismisses 3s after each new show and is
 * announced politely to screen readers.
 * @param props - Toast configuration
 * @returns Fixed-position live region that holds the toast card while `isVisible`
 */
export const Toast: React.FC<ToastProps> = ({ message, variant, isVisible, showId, onDismiss, hasRail = false }) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, showId, onDismiss]);

  return (
    <div
      role="status"
      // Clears the phone and tablet bottom bars; from `lg` the screens that toast have none.
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-[calc(24px+env(safe-area-inset-bottom))] ${
        hasRail ? 'lg:mx-auto lg:max-w-[1240px] lg:pl-5 lg:pr-[412px]' : ''
      }`}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-lg border border-line bg-surface px-4 py-3 text-[13.5px] font-medium shadow-float"
          >
            <Icon name={ICONS[variant].name} size={16} className={`mt-px ${ICONS[variant].className}`} />
            <span className="line-clamp-2 min-w-0">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
