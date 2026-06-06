import crypto from 'crypto';

import { query, isDbAvailable } from './db';

import type { BillPayload } from '../schemas/billPayload';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** Generates a fresh 8-char base62 (`0-9A-Za-z`) share ID from cryptographically random bytes (~218 trillion combinations). */
function generateId(): string {
  const bytes = crypto.randomBytes(8);
  let result = '';
  for (const byte of bytes) {
    result += BASE62[byte % 62];
  }
  return result;
}

/**
 * Persist a validated bill and return its share ID.
 * Rejects with `status: 503` (`isPublic`) when the DB is unavailable, a generic `'Failed to generate unique bill ID'` after three consecutive `23505` collisions, or any non-collision pg error unchanged.
 * @param data - Zod-validated bill payload
 * @returns 8-char base62 ID under which the bill is stored
 */
export async function saveBill(data: BillPayload): Promise<string> {
  if (!isDbAvailable()) {
    throw Object.assign(new Error('Database not available — sharing is disabled'), { status: 503, isPublic: true });
  }

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
      if (pgErr.code === '23505' && attempt < 2) {
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to generate unique bill ID');
}

/** Result of a successful {@link getBill} lookup — the stored payload plus its expiry timestamp. */
export interface StoredBill {
  /** Validated bill payload as it was persisted. */
  data: BillPayload;
  /** UTC timestamp when this share link will be deleted by the cleanup cron. */
  expiresAt: Date;
}

/**
 * Fetch a bill by share ID, applying the on-read expiry check.
 * Rejects with `status: 503` (`isPublic`) when the DB is unavailable.
 * @param id - 8-char base62 share ID
 * @returns The stored payload and its `expires_at` timestamp, or `null` if no row matches `id` or it has already expired
 */
export async function getBill(id: string): Promise<StoredBill | null> {
  if (!isDbAvailable()) {
    throw Object.assign(new Error('Database not available — sharing is disabled'), { status: 503, isPublic: true });
  }

  const result = await query(
    'SELECT data, expires_at FROM bills WHERE id = $1 AND expires_at > NOW()',
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    data: result.rows[0].data as BillPayload,
    expiresAt: result.rows[0].expires_at as Date,
  };
}
