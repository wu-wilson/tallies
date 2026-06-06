---
name: sharing-strategy
description: Single-path Postgres sharing — POST/GET /api/bills, 8-char base62 short IDs, 30-day TTL, weekly cron cleanup.
user-invocable: true
---

# Sharing Strategy

Source of truth: `server/src/routes/bills.ts`, `server/src/services/shortLinks.ts`, `cron/src/index.ts`, `schema.sql`.

## Flow

1. User taps "Share with group" on Result screen.
2. Client serializes bill state → `POST /api/bills` with Zod-validated payload.
3. Server generates 8-char base62 short ID, inserts into `bills` table.
4. Returns `{ id }` to client.
5. Client constructs share URL: `${origin}/b/${id}`.
6. Copies URL to clipboard, shows toast.

## Payload Shape

The stored payload is `{ receipts: Receipt[], people: Person[] }` (validated by `BillPayloadSchema`). Each receipt carries its own `merchant`, `date`, `items`, and `tax`/`tip`. Aggregates are derived at render time, not persisted.

**Back-compat:** bills shared before multi-receipt used a flat shape (`{ merchant, date, items, tax, … }`). The server stores `data` as `JSONB` and returns it untouched, so the client normalizes on read — `useSharedBill`'s `normalizeBill()` wraps a legacy flat payload as a single-receipt bill. No SQL migration; old links keep rendering and age out via the 30-day TTL.

## Short ID Generation

```typescript
crypto.randomBytes(8) → map each byte to base62 alphabet
```

Base62 alphabet: `0-9A-Za-z`. ~218 trillion combinations — effectively unguessable. Retry on unique-constraint collision (up to 3 attempts).

## URL Format

`https://tallies.dev/b/x7k9pmwq` (~26 chars, fits iMessage previews).

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);
CREATE INDEX IF NOT EXISTS idx_bills_expires_at ON bills(expires_at);
```

## Expiry (Two Tiers)

1. **On-read check**: `GET /api/bills/:id` filters by `expires_at > NOW()`. Expired rows return 404 even if cron hasn't cleaned them.
2. **Weekly cron**: `DELETE FROM bills WHERE expires_at < NOW()`. Runs Sundays at 09:00 UTC via Railway cron schedule. Logs row count and exits.

## Re-sharing

Editing a previously shared bill and re-sharing creates a **new** short ID. The original URL remains immutable.

## Graceful Degradation

If Postgres is unreachable, share endpoints return 503. The capture/verify/result flow still works in-memory.
