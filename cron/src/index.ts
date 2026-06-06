import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

/**
 * Deletes expired bills from Postgres and exits.
 *
 * Runs as a Railway cron service weekly (Sundays at 09:00 UTC). `DATABASE_URL` defaults to the local
 * dev URL, matching the server's behavior — a misconfigured production env surfaces as a connection
 * error rather than a silent no-op. Exits 1 on any query or connection failure, 0 otherwise.
 */
async function cleanup(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/tallies';

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  let exitCode = 0;

  try {
    const result = await pool.query('DELETE FROM bills WHERE expires_at < NOW()');
    console.log(`Deleted ${result.rowCount ?? 0} expired bill(s)`);
  } catch (err) {
    console.error('Cleanup failed:', err);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

cleanup();
