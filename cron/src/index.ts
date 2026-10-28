import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

/** Short operational description of a thrown value: the error code (or name) plus its message. */
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const code = 'code' in err && typeof err.code === 'string' ? err.code : undefined;
  // A host with several addresses (`localhost` is ::1 and 127.0.0.1) fails to connect with an empty message and one
  // error per address, so describe the first of those.
  const attempts = 'errors' in err && Array.isArray(err.errors) ? err.errors : [];
  const message = err.message || (attempts[0] instanceof Error ? attempts[0].message : '');
  return [code ?? err.name, message].filter(Boolean).join(': ');
}

/**
 * Delete expired bills from Postgres and exit, run weekly as a Railway cron service (Sundays at 09:00 UTC).
 * Exits 1 on any query or connection failure, 0 otherwise.
 */
async function cleanup(): Promise<void> {
  // Same local default as the server, so a misconfigured production env fails on connect instead of doing nothing.
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/tallies';

  // Timeouts make an unresponsive Postgres fail the run rather than hang it, which would block later scheduled runs.
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 10_000,
    query_timeout: 60_000,
  });

  try {
    const result = await pool.query('DELETE FROM bills WHERE expires_at < NOW()');
    console.log(`Deleted ${result.rowCount ?? 0} expired bill(s)`);
  } catch (err) {
    console.error('Cleanup failed:', describeError(err));
    // Set now, not at exit: a connect that throws synchronously (a bad `?port=`) leaves `pool.end()` unsettled, and the
    // process then exits on its own.
    process.exitCode = 1;
  } finally {
    await pool.end().catch((err: unknown) => {
      console.error('Failed to close pool:', describeError(err));
    });
  }

  process.exit();
}

cleanup().catch((err: unknown) => {
  console.error('Cleanup crashed:', describeError(err));
  process.exit(1);
});
