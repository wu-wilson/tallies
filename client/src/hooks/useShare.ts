import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { API_URL } from '../constants/config';

import type { Person, Receipt } from '../types/bill';

/** Result of creating a share link — the URL on success, or a user-safe message on failure. */
type CreateResult = { url: string } | { error: string };

/**
 * Hook for the two-step share flow: create the link, then hand it off. `createShareLink` posts the current
 * bill to `/api/bills` and returns its short URL; the dedicated Share screen then copies or opens it via the
 * native sheet. Splitting create from share means each copy/share runs inside its own user gesture, so no
 * clipboard pre-arming is needed.
 * @returns `{ createShareLink, copyLink, nativeShare, hasNativeShare, isCreating }` — `createShareLink(venmoUsername?)`
 * resolves to `{ url }` or `{ error }`; `copyLink(url)` resolves `true` when the clipboard write succeeds;
 * `nativeShare(url)` resolves `'shared'`/`'copied'`/`'failed'`; `hasNativeShare` reflects share-sheet support;
 * `isCreating` is true while the POST is in flight
 */
export function useShare() {
  const [isCreating, setIsCreating] = useState(false);

  const createShareLink = useCallback(async (venmoUsername?: string | null): Promise<CreateResult> => {
    setIsCreating(true);
    const state = useBillStore.getState();
    const payload = {
      name: state.name || null,
      receipts: state.receipts,
      people: state.people,
      venmoUsername: venmoUsername || null,
    };
    try {
      const url = await createBill(payload);
      return { url };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to share' };
    } finally {
      setIsCreating(false);
    }
  }, []);

  const copyLink = useCallback(async (url: string): Promise<boolean> => {
    if (!navigator.clipboard?.writeText) return false;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const nativeShare = useCallback(
    async (url: string): Promise<'shared' | 'copied' | 'failed'> => {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: 'Tallies', url });
          return 'shared';
        } catch (err) {
          // User dismissed the sheet — treat as done, nothing to recover.
          if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
        }
      }
      return (await copyLink(url)) ? 'copied' : 'failed';
    },
    [copyLink],
  );

  return { createShareLink, copyLink, nativeShare, hasNativeShare: typeof navigator.share === 'function', isCreating };
}

/** POST the bill and return its share URL; rejects with a user-safe message on failure. */
async function createBill(payload: {
  name: string | null;
  receipts: Receipt[];
  people: Person[];
  venmoUsername: string | null;
}): Promise<string> {
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
