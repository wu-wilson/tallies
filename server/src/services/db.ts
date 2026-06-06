import { Pool, QueryResult } from 'pg';

import { config } from '../config';

let pool: Pool | null = null;
let isConnected = false;

/**
 * Open the pg pool and probe the connection at boot.
 * Logs a warning and continues on probe failure — subsequent `query` calls then throw and share routes degrade to 503.
 * `config.databaseUrl` always carries a value (default localhost), so an unset env only manifests as a probe failure against localhost.
 * @returns Resolves after the probe completes (success or failure)
 */
export async function initDb(): Promise<void> {
  pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
  });

  try {
    const client = await pool.connect();
    client.release();
    isConnected = true;
    console.log('Connected to Postgres');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Postgres not reachable — share endpoints will return 503: ${message}`);
  }
}

/**
 * Run a parameterized query against the pool.
 * Rejects (rather than returns) if `initDb()` hasn't succeeded.
 * @param text - SQL with `$1`, `$2`, ... placeholders; never interpolate user input
 * @param params - Values to bind to the placeholders, in order
 * @returns The raw `pg` `QueryResult`
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  if (!pool || !isConnected) {
    throw new Error('Database not available');
  }
  return pool.query(text, params);
}

/**
 * Health gate for share routes.
 * @returns `true` once `initDb()` has successfully probed the pool, `false` otherwise
 */
export function isDbAvailable(): boolean {
  return isConnected;
}
