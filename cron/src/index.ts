import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

/** Short operational description of a thrown value: the error code (or name) plus its message. */
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const code = 'code' in err && typeof err.code === 'string' ? err.code : undefined;
  return [code ?? err.name, err.message].filter(Boolean).join(': ');
}

/**
 * Delete expired bills from Postgres and exit, run weekly as a Railway cron service (Sundays at 09:00 UTC).
 * Exits 1 on any query or connection failure, 0 otherwise.
 */
async function cleanup(): Promise<void> {
  // Same local default as the server, so a misconfigured production env fails on connect instead of doing nothing.
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/tallies';

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  let exitCode = 0;

  try {
    const result = await pool.query('DELETE FROM bills WHERE expires_at < NOW()');
    console.log(`Deleted ${result.rowCount ?? 0} expired bill(s)`);
  } catch (err) {
    console.error('Cleanup failed:', describeError(err));
    exitCode = 1;
  } finally {
    await pool.end().catch((err: unknown) => {
      console.error('Failed to close pool:', describeError(err));
    });
  }

  process.exit(exitCode);
}

cleanup().catch((err: unknown) => {
  console.error('Cleanup crashed:', describeError(err));
  process.exit(1);
});
