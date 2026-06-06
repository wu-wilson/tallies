---
paths:
  - "server/src/**/*.ts"
---

# Server Patterns

## Routes

- One route handler per file under `server/src/routes/`.
- Validate every input with Zod before business logic.
- Business logic in `server/src/services/`, not handlers.
- Single error-handling middleware in `middleware/errorHandler.ts`.

## Security

- `app.set('trust proxy', 1)` — Railway is one hop, so `req.ip` resolves to the real client (required for per-IP rate limiting). If the API is ever proxied through Cloudflare, key rate limits off `CF-Connecting-IP` instead.
- No security-header middleware: this is a JSON API and never serves HTML, so document-oriented headers (CSP, frame options) add little. Set HSTS at the edge if the API is fronted by Cloudflare.
- Fail-fast CORS check: refuse to boot if `NODE_ENV=production` and `ALLOWED_ORIGINS=*`.
- `express.json({ limit: '50kb' })` — explicit body size limit.
- Rate limits via `express-rate-limit` (in-memory). One `writeLimiter` instance shared across POST `/api/ocr` and POST `/api/bills` (so `config.writeRateLimitPerHour`, default 30/hr/IP, is a combined bucket — not per-route). Reads use a separate `readLimiter` (`config.readRateLimitPerHour`, default 200/hr/IP).
- Image content validation: magic-byte check via `file-type`, reject non-image uploads.
- 5MB image size cap before OCR forwarding.
- **Never leak raw upstream error messages.** The `errorHandler` middleware only echoes `err.message` when the thrown error carries `isPublic: true`; everything else becomes "Internal server error". Catch SDK errors (e.g. `Anthropic.APIError`) at the route boundary, log the real cause server-side, and respond with a short, user-safe message. Don't include Zod issue paths, raw model output, or pg error wording in client responses.

## Database

- Parameterized SQL queries (`$1`, `$2`) — never string-concatenate user input.
- `pg-pool` with `max: 10` connections, release in `finally` blocks.
- Graceful degradation: if Postgres unreachable, share endpoints return 503.

## Environment

- Env vars read once at startup into typed `config` object.
- Log bill ID + outcome on each request. Never log payload contents, API keys, or headers.

## Structural Caps

- Max 50 people per bill, 200 items per bill.
- Max 100 chars per person name, 200 chars per item name.
