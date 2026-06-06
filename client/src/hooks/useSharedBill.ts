import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { BillItem, Person, Receipt } from '../types/bill';

/** Normalized shared bill — always in the receipts shape, regardless of payload version. */
export interface SharedBill {
  receipts: Receipt[];
  people: Person[];
  /** ISO timestamp at which the share link expires. Absent on bills shared before the field was added. */
  expiresAt?: string;
}

/** Raw payload as returned by `/api/bills/:id` — either the current receipts shape or the legacy flat shape. */
interface RawBill {
  receipts?: Receipt[];
  people?: Person[];
  merchant?: string | null;
  date?: string | null;
  items?: BillItem[];
  tax?: number;
  taxIsPercent?: boolean;
  tip?: number;
  tipIsPercent?: boolean;
  expiresAt?: string;
}

/** Wrap a legacy flat payload (no `receipts`) as a single-receipt bill so old share links keep rendering. */
function normalizeBill(data: RawBill): SharedBill {
  if (Array.isArray(data.receipts)) {
    return { receipts: data.receipts, people: data.people ?? [], expiresAt: data.expiresAt };
  }
  return {
    receipts: [
      {
        id: 'legacy',
        merchant: data.merchant ?? '',
        date: data.date ?? '',
        items: data.items ?? [],
        tax: data.tax ?? 0,
        taxIsPercent: data.taxIsPercent ?? false,
        tip: data.tip ?? 0,
        tipIsPercent: data.tipIsPercent ?? false,
      },
    ],
    people: data.people ?? [],
    expiresAt: data.expiresAt,
  };
}

/**
 * Hook that fetches a shared bill from `/api/bills/:id`, normalizing legacy flat payloads into the
 * receipts shape. Tracks loading and error state. The server returns the same 404 for both expired and
 * missing bills, so the two cases are indistinguishable to the caller.
 * @param id - 8-char base62 share ID from the URL
 * @returns `{ bill, isLoading, error }` — `bill` is `null` until the fetch resolves; `error` is a message string on any failed fetch (404, non-OK status, or network error) and `null` otherwise
 */
export function useSharedBill(id: string) {
  const [bill, setBill] = useState<SharedBill | null>(null);
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
          setBill(normalizeBill(data));
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
