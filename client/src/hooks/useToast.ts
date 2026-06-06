import { useCallback, useState } from 'react';

interface ToastState {
  message: string;
  variant: 'success' | 'error' | 'warning';
  isVisible: boolean;
  /** Monotonic counter — incremented on every `showToast` so consecutive shows reset the auto-dismiss timer. */
  showId: number;
}

/**
 * Hook for single-slot toast state with show/dismiss controls.
 * @returns `{ toast, showToast, dismissToast }` — `showToast(message, variant?)` opens with variant defaulting to `'success'`; `dismissToast()` closes; `toast.showId` increments on every show so `<Toast>` can reset its auto-dismiss timer on back-to-back shows
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'success',
    isVisible: false,
    showId: 0,
  });

  const showToast = useCallback((message: string, variant: 'success' | 'error' | 'warning' = 'success') => {
    setToast((prev) => ({ message, variant, isVisible: true, showId: prev.showId + 1 }));
  }, []);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, dismissToast };
}
