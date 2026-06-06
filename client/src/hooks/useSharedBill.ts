import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { PersonColorKey } from '../constants/colors';

interface SharedBillData {
  merchant?: string | null;
  date?: string | null;
  people: { id: string; name: string; color: PersonColorKey }[];
  items: { id: string; name: string; price: number; quantity: number; assignees: string[] }[];
  tax: number;
  taxIsPercent: boolean;
  tip: number;
  tipIsPercent: boolean;
  /** ISO timestamp at which the share link expires. Absent on bills shared before the field was added. */
  expiresAt?: string;
}

/**
 * Hook that fetches a shared bill from `/api/bills/:id`, tracking loading and error state.
 * The server returns the same 404 for both expired and missing bills, so the two cases are indistinguishable to the caller.
 * @param id - 8-char base62 share ID from the URL
 * @returns `{ bill, isLoading, error }` — `bill` is `null` until the fetch resolves; `error` is a message string on any failed fetch (404, non-OK status, or network error) and `null` otherwise
 */
export function useSharedBill(id: string) {
  const [bill, setBill] = useState<SharedBillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBill() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/bills/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Bill not found');
          }
          throw new Error(`Failed to load bill (${response.status})`);
        }

        const data = await response.json();
        if (!cancelled) {
          setBill(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bill');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchBill();
    return () => { cancelled = true; };
  }, [id]);

  return { bill, isLoading, error };
}
