import { Pool } from 'pg';

import { config } from '../config';

import { describeError } from '../lib/describeError';

import type { QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Open the pg pool and probe the connection at boot. A failed probe only logs a warning: every query connects on its
 * own, so sharing recovers as soon as Postgres does (an unset `DATABASE_URL` shows up as a failed localhost probe).
 * @returns Resolves after the probe completes (success or failure)
 */
export async function initDb(): Promise<void> {
  pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    // Fail fast when Postgres is unreachable instead of holding the request open.
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
  });

  try {
    const client = await pool.connect();
    client.release();
    console.log('Connected to Postgres');
  } catch (err) {
    console.warn(`Postgres not reachable — share endpoints will return 503 until it is: ${describeError(err)}`);
  }
}

/**
 * Run a parameterized query against the pool.
 * @param text - SQL with `$1`, `$2`, ... placeholders; never interpolate user input
 * @param params - Values to bind to the placeholders, in order
 * @returns The raw `pg` `QueryResult`; rejects before `initDb()` has run or when Postgres can't be reached
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  if (!pool) throw new Error('Database pool not initialized');
  return pool.query(text, params);
}
