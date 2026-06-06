import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { API_URL } from '../constants/config';

/**
 * Hook that posts the current bill to `/api/bills` and copies the resulting share URL to the clipboard.
 * The clipboard copy is best-effort and never throws — failure just leaves the user without an auto-copy.
 * @returns `{ shareBill, isSharing }` — `shareBill()` resolves to the share URL, or `null` if the API rejected the payload or the network failed; `isSharing` is true for the duration of an in-flight request
 */
export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareBill = useCallback(async (): Promise<string | null> => {
    setIsSharing(true);

    const state = useBillStore.getState();
    const payload = {
      receipts: state.receipts,
      people: state.people,
    };

    try {
      const response = await fetch(`${API_URL}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to share (${response.status})`);
      }

      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/b/${id}`;

      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Clipboard may not be available
      }

      setIsSharing(false);
      return shareUrl;
    } catch {
      setIsSharing(false);
      return null;
    }
  }, []);

  return { shareBill, isSharing };
}
