-- Tallies — canonical Postgres schema.
-- Run once locally (psql tallies -f schema.sql) and once against Railway Postgres.
-- Re-running is safe and idempotent (IF NOT EXISTS on both statements).

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_bills_expires_at ON bills(expires_at);
