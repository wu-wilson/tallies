---
paths:
  - "server/src/**/*.ts"
---

# Server Patterns

## Routes

- One router per resource under `server/src/routes/` (`ocr.ts`, `bills.ts`).
- Validate request bodies and the model's output with Zod before business logic; the share ID is checked against `ID_PATTERN` and uploads by their leading bytes (`detectImageType`).
- Business logic in `server/src/services/`, not handlers.
- Single error-handling middleware in `middleware/errorHandler.ts`.

## Security

- `app.set('trust proxy', 1)` — Railway is one hop, so `req.ip` resolves to the real client (required for per-IP rate limiting). If the API is ever proxied through Cloudflare, key rate limits off `CF-Connecting-IP` instead.
- CORS allowlist from `config.allowedOrigins`. A request whose `Origin` is outside it gets a 403 (`rejectForeignOrigins`): CORS only hides the response, and a multipart upload skips the preflight, so another site could otherwise run billed scans through its visitors.
- No security-header middleware: this is a JSON API and never serves HTML, so document-oriented headers (CSP, frame options) add little. Set HSTS at the edge if the API is fronted by Cloudflare.
- `express.json({ limit: '100kb' })` — explicit body size limit; the `errorHandler` maps the resulting 413 to a user-safe "too large to share" message.
- Rate limits via `express-rate-limit` (in-memory). One `writeLimiter` instance shared across POST `/api/ocr` and POST `/api/bills` (so `config.writeRateLimitPerHour`, default 30/hr/IP, is a combined bucket — not per-route). Reads use a separate `readLimiter` (`config.readRateLimitPerHour`, default 200/hr/IP). An IPv6 client is counted by its /56 (`ipv6Subnet`), since a provider hands each customer a block of addresses to rotate through.
- Image content validation: magic-byte check (`detectImageType`) for JPEG, PNG, or WebP; multer takes one file and no text fields.
- 5MB image size cap before OCR forwarding.
- **Never leak raw upstream error messages.** The `errorHandler` middleware only echoes `err.message` when the thrown error carries `isPublic: true`; everything else becomes "Something went wrong. Try again." Catch SDK errors (e.g. `Anthropic.APIError`) in the service that calls the SDK, log the real cause server-side, and return a short, user-safe message for the route to send. Don't include Zod issue paths, raw model output, or pg error wording in client responses.

## Database

- Parameterized SQL queries (`$1`, `$2`) — never string-concatenate user input.
- `pg`'s `Pool` (`max: 10`, 5s connect and query timeouts); queries go through `pool.query`, which releases its own client.
- Graceful degradation: if Postgres unreachable, share endpoints return 503.

## Environment

- Env vars read once at startup into typed `config` object; a malformed number stops startup rather than running misconfigured.
- Log bill ID + outcome on each request. Never log payload contents, API keys, or headers.

## Structural Caps

- Max 20 receipts per bill, 200 items per receipt, 50 people per bill. The 100 kB body limit binds first on very large bills: about 650 items with one person each, fewer when items are split (about 110 when 20 people split every item).
- Max 100 chars per bill/person/merchant name, 200 chars per item name.
- Prices, tax, and tip up to $99,999.99, and tax/tip rates up to 100% (the client's `MAX_AMOUNT` and `MAX_RATE`); `quantity` is always 1.
