import crypto from 'crypto';

import { query } from './db';

import { describeError } from '../lib/describeError';

import type { BillPayload } from '../schemas/billPayload';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generates a fresh 8-char base62 (`0-9A-Za-z`) share ID, each character drawn uniformly at random
 * (~218 trillion combinations).
 */
function generateId(): string {
  return Array.from({ length: 8 }, () => BASE62[crypto.randomInt(BASE62.length)]).join('');
}

/** Log a database failure and stand in a public 503 for it, so clients hear that sharing is down rather than a 500. */
function unavailable(err: unknown): Error {
  console.error(`Database error: ${describeError(err)}`);
  return Object.assign(new Error('Sharing is unavailable right now. Try again later.'), { status: 503, isPublic: true });
}

/**
 * Persist a validated bill and return its share ID.
 * Rejects with a public 503 on any database failure, or a generic error after three consecutive ID collisions.
 * @param data - Zod-validated bill payload
 * @returns 8-char base62 ID under which the bill is stored
 */
export async function saveBill(data: BillPayload): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = generateId();
    try {
      await query(
        'INSERT INTO bills (id, data) VALUES ($1, $2)',
        [id, JSON.stringify(data)],
      );
      return id;
    } catch (err) {
      const pgErr = err as Error & { code?: string };
      if (pgErr.code !== '23505') throw unavailable(err);
    }
  }

  throw new Error('Failed to generate unique bill ID');
}

/** Result of a successful {@link getBill} lookup — the stored payload plus its expiry timestamp. */
export interface StoredBill {
  /** Validated bill payload as it was persisted. */
  data: BillPayload;
  /** When this share link expires; reads 404 from then on, and the weekly cron deletes the row afterwards. */
  expiresAt: Date;
}

/**
 * Fetch a bill by share ID, applying the on-read expiry check.
 * Rejects with a public 503 on any database failure.
 * @param id - 8-char base62 share ID
 * @returns The stored payload and its `expires_at` timestamp, or `null` if no row matches `id` or it has
 * already expired
 */
export async function getBill(id: string): Promise<StoredBill | null> {
  const result = await query('SELECT data, expires_at FROM bills WHERE id = $1 AND expires_at > NOW()', [id]).catch(
    (err: unknown) => {
      throw unavailable(err);
    },
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    data: result.rows[0].data as BillPayload,
    expiresAt: result.rows[0].expires_at as Date,
  };
}
