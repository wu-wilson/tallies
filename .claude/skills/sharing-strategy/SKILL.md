---
name: sharing-strategy
description: Single-path Postgres sharing — POST/GET /api/bills, 8-char base62 short IDs, 30-day TTL, weekly cron cleanup.
user-invocable: true
---

# Sharing Strategy

Source of truth: `server/src/routes/bills.ts`, `server/src/schemas/billPayload.ts`, `server/src/services/shortLinks.ts`, `cron/src/index.ts`, `schema.sql`, and the client's `useShare` and `useSharedBill`.

## Flow

1. User taps "Create share link" on the Result screen.
2. `useShare.createShareLink(venmoUsername)` serializes bill state (including `payerId`) → `POST /api/bills` with a Zod-validated payload. The payer and Venmo fields are locked until it returns, so the Share screen describes the bill that was sent.
3. Server generates an 8-char base62 short ID, inserts into the `bills` table.
4. Returns `{ id }`; the client builds `${origin}/b/${id}`, stores it as `shareUrl`, and advances to the **Share screen**.
5. The Share screen surfaces the link with **Copy** (`copyLink`) and **Share link** (`nativeShare`; "Copy and share" without `navigator.share`), then who owes the payer what (everyone's share when no payer is set). Its sentence mentions paying back on Venmo only with both a payer and a handle.

**Two-step by design:** creating the link and handing it off are separate user gestures, so `copyLink`/`nativeShare` each run inside their own activation — no `ClipboardItem` pre-arming needed. `nativeShare` uses `navigator.share` when available and falls back to a clipboard copy (`'shared'`/`'copied'`/`'failed'`).

## Payload Shape

The stored payload is `{ name: string | null, receipts: Receipt[], people: Person[], payerId: string | null, venmoUsername: string | null }` (validated by `BillPayloadSchema`, which also checks that `payerId` names someone in `people`). `name` is the optional bill title — when empty, the display falls back to "Your bill" (`deriveBillName`). `payerId` is who paid, chosen on Result; the shared view marks them "Paid the bill" and gives them no pay button. `venmoUsername` is the payer's optional Venmo handle (the client remembers handles per payer name in `localStorage`, so picking a different payer never prefills someone else's); with it, the expanded row of everyone else who owes something carries a "Pay Alex $X" button for their rounded share. Each receipt carries its own `merchant`, `date`, `items`, and `tax`/`tip`. Aggregates are derived at render time, not persisted. A new field must be optional, since links made before it stay readable for 30 days, and it needs adding to `useShare`'s payload, `BillPayloadSchema` (which drops keys it doesn't list), and `useSharedBill`'s `toSharedBill` (which copies fields by name).

## Short ID Generation

```typescript
8 × crypto.randomInt(62) → index into the base62 alphabet
```

Base62 alphabet: `0-9A-Za-z`. ~218 trillion combinations — effectively unguessable. Retry on unique-constraint collision (up to 3 attempts, then a 500).

## URL Format

`https://tallies.dev/b/x7k9pmwq` (30 chars, fits iMessage previews).

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
