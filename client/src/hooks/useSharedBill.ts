import { useCallback, useEffect, useState } from 'react';

import { readErrorMessage } from '../lib/apiError';

import { API_URL } from '../constants/config';

import type { Person, Receipt } from '../types/bill';

/** A shared bill as the shared view reads it. */
export interface SharedBill {
  /** Optional bill title; absent when the bill was shared unnamed (falls back to "Your bill"). */
  name?: string;
  receipts: Receipt[];
  people: Person[];
  /** The person who paid and is owed by everyone else; absent when none was chosen or on older bills. */
  payerId?: string;
  /** The payer's Venmo handle; absent on bills shared without one (no pay button rendered). */
  venmoUsername?: string;
  /** ISO timestamp at which the share link expires, added by the server on every read. */
  expiresAt?: string;
}

/** Raw payload as returned by `/api/bills/:id`, with optional fields stored as null. */
interface RawBill {
  name?: string | null;
  receipts: Receipt[];
  people: Person[];
  payerId?: string | null;
  venmoUsername?: string | null;
  expiresAt?: string;
}

/**
 * Read a fetched payload as a shared bill, turning stored nulls into absent fields.
 * @param data - The parsed response body
 * @returns The bill, or null when the body isn't a bill
 */
function toSharedBill(data: RawBill | null): SharedBill | null {
  if (!data || !Array.isArray(data.receipts) || !Array.isArray(data.people)) return null;
  return {
    name: data.name ?? undefined,
    receipts: data.receipts,
    people: data.people,
    payerId: data.payerId ?? undefined,
    venmoUsername: data.venmoUsername ?? undefined,
    expiresAt: data.expiresAt,
  };
}

/** Shown when the server answers but the bill can't be read. */
const LOAD_FAILED = "Couldn't load this bill. Try again in a moment.";

/**
 * Hook that fetches a shared bill from `/api/bills/:id` and tracks loading and error state. Expired and missing bills
 * both arrive as the same 404.
 * @param id - 8-char base62 share ID from the URL
 * @returns `{ bill, isLoading, isNotFound, error, retry }` — `bill` is null until loaded; `isNotFound` marks a missing
 * or expired link; `error` is a user-safe message for any other failure (null otherwise); `retry()` fetches again
 */
export function useSharedBill(id: string) {
  const [bill, setBill] = useState<SharedBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchBill() {
      setIsLoading(true);
      setIsNotFound(false);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/bills/${encodeURIComponent(id)}`).catch(() => null);
        if (isCancelled) return;
        if (!response) {
          setError("Couldn't reach Tallies. Check your connection and try again.");
          return;
        }
        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (!response.ok) {
          const message = await readErrorMessage(response, LOAD_FAILED);
          if (!isCancelled) setError(message);
          return;
        }
        const data = await response.json().catch(() => null);
        if (isCancelled) return;
        const sharedBill = toSharedBill(data);
        if (sharedBill) setBill(sharedBill);
        else setError(LOAD_FAILED);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchBill();
    return () => {
      isCancelled = true;
    };
  }, [id, attempt]);

  return { bill, isLoading, isNotFound, error, retry };
}
