import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { API_URL } from '../constants/config';

/** Result of a share attempt — the URL plus whether it reached the clipboard, or a user-safe error. */
type ShareResult = { url: string; copied: boolean } | { error: string };

/**
 * Hook that posts the current bill to `/api/bills` and copies the resulting share URL to the clipboard.
 * The clipboard write is kicked off **synchronously** with a pending URL (`ClipboardItem` holding a promise),
 * which keeps the click's user-activation alive across the network round-trip — required for the copy to
 * succeed on iOS Safari, where writing after an `await` is silently blocked.
 * @returns `{ shareBill, isSharing }` — `shareBill()` resolves to `{ url, copied }` on success (`copied` is false if the clipboard write was blocked) or `{ error }` carrying a user-safe message on a rejected payload / network failure; `isSharing` is true while a request is in flight
 */
export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareBill = useCallback(async (): Promise<ShareResult> => {
    setIsSharing(true);

    const state = useBillStore.getState();
    const payload = {
      receipts: state.receipts,
      people: state.people,
    };

    // Resolves to the share URL, or rejects with a user-safe message on failure.
    const urlPromise = (async () => {
      const response = await fetch(`${API_URL}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to share');
      }
      const { id } = await response.json();
      return `${window.location.origin}/b/${id}`;
    })();

    // Started before any `await` below suspends this handler, so the user-activation is still live.
    const copyPromise = copyWhenReady(urlPromise);

    try {
      const url = await urlPromise;
      const copied = await copyPromise;
      setIsSharing(false);
      return { url, copied };
    } catch (err) {
      setIsSharing(false);
      return { error: err instanceof Error ? err.message : 'Failed to share' };
    }
  }, []);

  return { shareBill, isSharing };
}

/**
 * Copy the eventual URL to the clipboard while preserving the user-activation across the wait.
 * Prefers `ClipboardItem` with a pending blob (the only form that survives an `await` on iOS Safari),
 * and falls back to `writeText` when `ClipboardItem` is unavailable, rejects the pending promise, or the
 * write fails. The fallback works wherever writing after an `await` is allowed (e.g. desktop Chrome).
 * @param urlPromise - Promise resolving to the URL to copy
 * @returns `true` if the clipboard write succeeded, `false` if it was blocked or unavailable
 */
function copyWhenReady(urlPromise: Promise<string>): Promise<boolean> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      return navigator.clipboard
        .write([
          new ClipboardItem({ 'text/plain': urlPromise.then((u) => new Blob([u], { type: 'text/plain' })) }),
        ])
        .then(() => true)
        .catch(() => copyText(urlPromise));
    } catch {
      // ClipboardItem rejected the pending promise synchronously (older browsers) — fall back below.
    }
  }
  return copyText(urlPromise);
}

/** Plain-text clipboard fallback — works where writing after an `await` is permitted. */
function copyText(urlPromise: Promise<string>): Promise<boolean> {
  return urlPromise
    .then((u) => navigator.clipboard.writeText(u))
    .then(() => true)
    .catch(() => false);
}
