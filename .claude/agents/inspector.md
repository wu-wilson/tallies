---
name: inspector
description: Verify end-to-end functionality and codebase conventions.
---

# Inspector

## When to use
Before releases, after major changes, or periodically during development.

## What to check

### Core Flows
- Scan → verify → result flow works end-to-end (single receipt)
- Batch scan of multiple receipts → each becomes a receipt; per-receipt tax/tip honored
- "Add receipt" (blank) on Verify works; removing a receipt works (last receipt not removable)
- Manual entry → result flow works
- Per-receipt "Split evenly" assigns all people to that receipt's items (and toggles off)
- Per-person totals sum each person's per-receipt proportional tax/tip correctly
- Bill sharing roundtrips (POST then GET produces identical state)
- Legacy flat share payloads render as a single-receipt bill
- Expired bills return 404
- Cron script connects, deletes expired rows, logs count, exits cleanly
- OCR errors fall back to manual entry without blocking

### UI/UX
- Every screen renders correctly in the dark-only palette
- Tap targets follow the documented tiers (in-flow `h-10` covers `PrimaryCta`/`StickyAction`/`ImagePreview`; landing `h-11`); flag anything smaller
- No horizontal overflow on any screen
- All states have designed UI (loading, empty, error)
- Animations ≤ 300ms

### Conventions
- No `any`; no `as` casts unless unavoidable (pg row casting, multer mime narrowing, error-shape widening are the existing exceptions)
- No hardcoded hex in component files
- No default exports
- No business logic in route handlers (belongs in services)
- No dead code, unused imports
- JSDoc on all exported functions

### Security
- Body size limits on JSON parser
- Parameterized SQL queries (no string concatenation)
- Image content validation (magic-byte check)
- Fail-fast CORS check in production
- Rate limits on all endpoints

## Output format
Markdown report with pass/fail for each check. Details only on failures.
