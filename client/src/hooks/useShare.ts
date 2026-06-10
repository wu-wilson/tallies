import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { API_URL } from '../constants/config';

import type { Person, Receipt } from '../types/bill';

/** Result of a share attempt — whether it reached the native sheet, the clipboard, or failed. */
type ShareResult = { url: string; shared: boolean; copied: boolean } | { error: string };

/**
 * Hook that posts the current bill to `/api/bills` and shares the resulting URL — via the native share
 * sheet (`navigator.share`) when available (the default on mobile), otherwise via a clipboard copy.
 * Share and clipboard each consume the user-activation, so the path is chosen up front; the clipboard
 * fallback starts synchronously with a pending URL (`ClipboardItem`) so it survives the round-trip on iOS Safari.
 * @returns `{ shareBill, isSharing }` — `shareBill(venmoUsername?)` resolves to `{ url, shared, copied }` (which path succeeded) or `{ error }` carrying a user-safe message on a rejected payload / network failure; `isSharing` is true while a request is in flight
 */
export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareBill = useCallback(async (venmoUsername?: string | null): Promise<ShareResult> => {
    setIsSharing(true);

    const state = useBillStore.getState();
    const payload = {
      name: state.name || null,
      receipts: state.receipts,
      people: state.people,
      venmoUsername: venmoUsername || null,
    };
    const urlPromise = createBill(payload);

    // Clipboard path: pre-arm synchronously (preserves iOS activation). Only when we won't use the
    // native sheet, since clipboard.write consumes the activation navigator.share also needs.
    if (typeof navigator.share !== 'function') {
      const copyPromise = copyViaClipboardItem(urlPromise);
      try {
        const url = await urlPromise;
        const copied = await copyPromise;
        setIsSharing(false);
        return { url, shared: false, copied };
      } catch (err) {
        setIsSharing(false);
        return { error: messageFor(err) };
      }
    }

    // Native-share path.
    try {
      const url = await urlPromise;
      try {
        await navigator.share({ title: 'Tallies', url });
        setIsSharing(false);
        return { url, shared: true, copied: false };
      } catch (err) {
        // User dismissed the sheet — treat as done, nothing to recover.
        if (err instanceof DOMException && err.name === 'AbortError') {
          setIsSharing(false);
          return { url, shared: true, copied: false };
        }
        // Share failed — best-effort copy so the user still gets the link.
        const copied = await copyText(url);
        setIsSharing(false);
        return { url, shared: false, copied };
      }
    } catch (err) {
      setIsSharing(false);
      return { error: messageFor(err) };
    }
  }, []);

  return { shareBill, isSharing };
}

/** POST the bill and return its share URL; rejects with a user-safe message on failure. */
async function createBill(payload: { name: string | null; receipts: Receipt[]; people: Person[]; venmoUsername: string | null }): Promise<string> {
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
}

/** Narrow an unknown error to a user-safe message. */
function messageFor(err: unknown): string {
  return err instanceof Error ? err.message : 'Failed to share';
}

/**
 * Copy the eventual URL to the clipboard while preserving the user-activation across the wait.
 * Prefers `ClipboardItem` with a pending blob (the only form that survives an `await` on iOS Safari),
 * and falls back to `writeText` when `ClipboardItem` is unavailable or rejects.
 * @param urlPromise - Promise resolving to the URL to copy
 * @returns `true` if the clipboard write succeeded, `false` otherwise
 */
function copyViaClipboardItem(urlPromise: Promise<string>): Promise<boolean> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      return navigator.clipboard
        .write([new ClipboardItem({ 'text/plain': urlPromise.then((u) => new Blob([u], { type: 'text/plain' })) })])
        .then(() => true)
        .catch(() => urlPromise.then(copyText).catch(() => false));
    } catch {
      // ClipboardItem rejected the pending promise synchronously (older browsers) — fall back below.
    }
  }
  return urlPromise.then(copyText).catch(() => false);
}

/** Plain-text clipboard write of a known URL; resolves `false` if the clipboard is unavailable or blocked. */
function copyText(url: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return Promise.resolve(false);
  return navigator.clipboard.writeText(url).then(() => true).catch(() => false);
}
