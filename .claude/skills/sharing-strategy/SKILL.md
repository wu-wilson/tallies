---
name: sharing-strategy
description: Single-path Postgres sharing — POST/GET /api/bills, 8-char base62 short IDs, 30-day TTL, weekly cron cleanup.
user-invocable: true
---

# Sharing Strategy

Source of truth: `server/src/routes/bills.ts`, `server/src/services/shortLinks.ts`, `cron/src/index.ts`, `schema.sql`.

## Flow

1. User taps "Create share link" on the Result screen.
2. `useShare.createShareLink(venmoUsername?)` serializes bill state → `POST /api/bills` with a Zod-validated payload.
3. Server generates an 8-char base62 short ID, inserts into the `bills` table.
4. Returns `{ id }`; the client builds `${origin}/b/${id}`, stores it as `shareUrl`, and advances to the **Share screen**.
5. The Share screen surfaces the link with **Copy** (`copyLink`) and **Share…** (`nativeShare`) actions, plus a Venmo-pay note when a handle was supplied.

**Two-step by design:** creating the link and handing it off are separate user gestures, so `copyLink`/`nativeShare` each run inside their own activation — no `ClipboardItem` pre-arming needed. `nativeShare` uses `navigator.share` when available and falls back to a clipboard copy (`'shared'`/`'copied'`/`'failed'`).

## Payload Shape

The stored payload is `{ name?: string, receipts: Receipt[], people: Person[], venmoUsername?: string }` (validated by `BillPayloadSchema`). `name` is the optional bill title — when empty, the display falls back to "Your bill" (`deriveBillName`). `venmoUsername` is the bill owner's optional Venmo handle, surfacing a "Pay via Venmo" button per person on the shared view. Each receipt carries its own `merchant`, `date`, `items`, and `tax`/`tip`. Aggregates are derived at render time, not persisted.

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
