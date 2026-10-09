---
name: inspector
description: Verify end-to-end functionality and codebase conventions.
---

# Inspector

## When to use
Before releases, after major changes, or periodically during development.

## What to check

### Core Flows
- Landing → capture → verify → result → share flow works end-to-end (single receipt)
- Batch scan: each picked image becomes a row with live scanning/done/failed status; Continue commits the done ones
- "Add another receipt" (blank) on Verify works; removing a receipt works (last receipt not removable)
- Manual entry → result flow works
- Assign sheet (Everyone / Clear / per-person) updates assignments, and closes on Escape, the backdrop, or Done
- Per-receipt "Split evenly" assigns all people to that receipt's items (and toggles off)
- Per-person totals sum each person's per-receipt proportional tax/tip correctly, and their rounded totals add up exactly to the bill total
- Who paid (Result) travels with the share link: the payer reads "Paid the bill" on the shared view and everyone else's pay button names them
- Bill sharing roundtrips (POST then GET produces identical state)
- Legacy flat share payloads render as a single-receipt bill
- Expired bills return 404
- Cron script connects, deletes expired rows, logs count, exits cleanly
- OCR errors fall back to manual entry without blocking

### UI/UX
- Every screen renders correctly in the light system (white cards on the ground, hairlines, 8–12px corners, faint shadows, one typeface)
- The landing demos loop smoothly and rest on a complete still frame under reduced motion
- Tap targets are comfortable (46–48px primary buttons, 32px remove controls); flag anything cramped
- No horizontal overflow on any screen
- All states have designed UI (loading, empty, error)
- Animations ≤ 300ms

### Conventions
- No `any`; no `as` casts unless unavoidable (pg row casting and error-shape widening are the existing exceptions)
- No hardcoded hex in component files
- No default exports
- No business logic in route handlers (belongs in services)
- No dead code, unused imports
- JSDoc on all exported functions

### Security
- Body size limits on JSON parser
- Parameterized SQL queries (no string concatenation)
- Image content validation (magic-byte check)
- Rate limits on every `/api` endpoint

## Output format
Markdown report with pass/fail for each check. Details only on failures.
