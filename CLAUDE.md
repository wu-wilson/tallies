# CLAUDE.md — Tallies

## What This Is

Tallies is a mobile-first web app for splitting bills with an editorial-brutalist visual language. The `/` flow runs through store-driven screens: Landing (marketing front door), Capture (scan one or more receipts with live per-receipt status), Verify & Assign (edit items, assign to people), Result (per-person breakdowns), and Share (the post-create confirmation with the short link). A bill can combine multiple receipts (e.g. dinner + drinks elsewhere) into one breakdown. Bills can be shared via short URLs stored in Postgres. OCR powered by Claude Sonnet.

## Architecture

- **client/** — React 18 + Vite + TypeScript. Tailwind CSS v3. Zustand for state. Framer Motion for animation. React Router for `/` and `/b/:id` (with a catch-all not-found route). All bill math runs client-side. Production build served via `serve -s dist -l $PORT`.
- **server/** — Express + TypeScript. Anthropic SDK for OCR proxy. pg + pg-pool for Postgres. Zod validation at every boundary. Two route files: `/api/ocr` and `/api/bills`. Stateless except for bill sharing.
- **cron/** — TypeScript Node script. Deletes expired bills weekly (Sundays 09:00 UTC). No HTTP surface — connects to Postgres, runs the delete, logs count, exits.

## Key Decisions

- Mobile-first (portrait iPhone primary target), with responsive desktop layouts. Base body 14px; responsive type via Tailwind utilities.
- Editorial-brutalist, light warm-paper aesthetic — palette defined via CSS custom properties on `:root`. No dark mode, no theme toggle. Flat planes, 1.5px solid-ink borders (the default `border` width/color), square corners, no shadows; sectioning via uppercase Space-Mono micro-labels and hairline rules.
- Forest green brand accent (`#2C5545`) on warm paper (`#F6F2E9`), with a rust accent (`#B0573A`); ink is `#1B1A17`. Brand green carries primary CTAs and active states; Venmo blue (`#008CFF`) is reserved for the pay handoff.
- Fonts: Archivo (UI/body, 800–900 weights for display), Space Mono (numbers, currency, micro-labels).
- 8 person colors (sage, gold, plum, slate, rose, taupe, teal, clay) — warm-toned, functional, never used as UI accents.
- A bill is one or more receipts (each with its own merchant, items, and tax/tip) plus a shared set of people; people are referenced by ID in each item's `assignees`, so they span all receipts.
- Proportional tax/tip math, computed **per receipt**: each person's share of a receipt's tax/tip is proportional to their subtotal within that receipt, then summed across receipts. Full precision internally, round to cents only at display.
- In-flow microinteractions ≤300ms via Framer Motion (`DURATION.fast`/`normal`/`smooth` in `constants/animations.ts`); tap response scales to 0.97–0.99. No page-load/entrance animations — screens render immediately.
- Single Zustand store drives the `landing → capture → verify → result → share` flow; it holds the bill as an optional `name`, `receipts[]`, a shared `people[]`, and the created `shareUrl`. Screen state for that flow lives in the store, not separate routes; `SharedView` is the only other route (`/b/:id`), with a catch-all falling through to the not-found screen.
- Item assignment is editable inline (tap an assigned avatar to drop it) and via a modal assign sheet (Everyone / Clear / per-person), reused across viewports.
- OCR via Claude Sonnet (`claude-sonnet-4-6`) with image input and Zod-validated JSON output.
- Sharing: 8-char base62 short IDs via `crypto.randomBytes(8)`. 30-day TTL enforced by weekly cron + on-read expiry check. `/b/` is disallowed in `robots.txt` — shared bills carry names, amounts, and Venmo handles, and a search cache would outlive the TTL.
- Graceful degradation: if Postgres isn't reachable, capture/verify/result still work — only sharing is disabled.

## Do NOT

- Write test files or install testing libraries.
- Use `any`, `as` casts (unless unavoidable), or default exports.
- Hardcode hex colors in component files — use Tailwind semantic tokens from CSS custom properties.
- Use UI component libraries (MUI, Chakra, Radix, shadcn). Build from scratch with Tailwind.
- Allow horizontal overflow on any screen.
- Show blank screens — every state (loading, empty, error) must have designed UI.
- Use `h-screen` / `min-h-screen` — use `min-h-dvh` for full-viewport layouts.
- Go below `text-xs` (12px) for any primary text.
- Use `console.log` in client code — server/cron use `console.*` for operational logging only (see `.claude/rules/server-patterns.md`).
- String-concatenate user input into SQL — use parameterized queries (`$1`, `$2`).
- Log bill payload contents, API keys, or headers.

## Rules (path-scoped — loaded automatically when editing matching files)

- `.claude/rules/code-style.md` — TypeScript, JSDoc, import ordering, naming. Loads for `client/**/*.{ts,tsx}` and `server/**/*.ts`.
- `.claude/rules/component-patterns.md` — React file structure, state management, Framer Motion patterns. Loads for `client/src/**/*.{ts,tsx}`.
- `.claude/rules/styling.md` — Theming, visual language, interactive states, animation. Loads for `client/src/**/*.{tsx,css}` and `client/tailwind.config.js`.
- `.claude/rules/responsive.md` — Mobile-first breakpoints, viewport units, safe area handling. Loads for `client/src/**/*.{tsx,css}`.
- `.claude/rules/server-patterns.md` — Route handlers, Zod validation, service layer, security hardening. Loads for `server/src/**/*.ts`.

## Skills (reference knowledge)

- `.claude/skills/design-tokens/` — Exact color hex values, typography, person colors, animation durations.
- `.claude/skills/bill-math/` — Proportional tax/tip algorithm, edge cases, rounding rules.
- `.claude/skills/ocr-pipeline/` — OCR flow, Claude prompt, Zod schema, error handling.
- `.claude/skills/sharing-strategy/` — Postgres sharing, short ID generation, TTL, cron.
