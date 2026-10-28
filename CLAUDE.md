# CLAUDE.md — Tallies

## What This Is

Tallies is a mobile-first web app for splitting bills, designed to look and feel like a premium paid product (light, restrained, in the family of Stripe and Forge). The `/` flow runs through store-driven screens: Landing (marketing front door with two live CSS demos), Capture (scan one or more receipts with live per-receipt status), Verify & Assign (edit items, assign to people), Result (per-person breakdowns, who paid, Venmo handle), and Share (the post-create confirmation with the short link). A bill can combine multiple receipts (e.g. dinner + drinks elsewhere) into one breakdown. Bills can be shared via short URLs stored in Postgres. OCR powered by Claude Sonnet.

## Architecture

- **client/** — React 18 + Vite + TypeScript. Tailwind CSS v3. Zustand for state. Framer Motion for in-flow animation, plain CSS keyframes for the landing demos. React Router for `/` and `/b/:id` (with a catch-all not-found route). All bill math runs client-side. Hanken Grotesk is self-hosted from `public/fonts/`. Production build served via `serve -s dist` (`npm start`), whose `serve.json` caches the hashed `assets/` for a year and has HTML revalidate, so a deploy reaches the next visit.
- **server/** — Express + TypeScript. Anthropic SDK for OCR proxy. pg (its built-in `Pool`) for Postgres. Zod validation of request bodies and OCR output. Two route files: `/api/ocr` and `/api/bills`. Stateless except for bill sharing.
- **cron/** — TypeScript Node script. Deletes expired bills weekly (Sundays 09:00 UTC). No HTTP surface — connects to Postgres, runs the delete, logs count, exits.

## Key Decisions

- Mobile-first (portrait iPhone primary target), with real two-column layouts from `lg` and a 1200px content column on wide screens. Base body 14px.
- Light, restrained system: white surfaces on a `#FAFAFB` ground (the landing page is pure white), near-black ink (`#0E0F10`), hairline borders, 8px corners on buttons and framed fields (6px on small controls and inline fields) and 12px on cards, faint ink-tinted shadows. Palette lives as RGB channels on `:root` so Tailwind opacity modifiers work. No dark mode, no theme toggle.
- Primary actions are ink buttons. One green (`#0F7B5F`, "settled") marks read, paid, selected, and done things, focused fields, and the capture drop zone; coral appears only in the logo's slash and the hero art; Venmo blue (`#008CFF`) is reserved for the pay handoff.
- One typeface, Hanken Grotesk, with tabular figures everywhere (no monospace). Headlines are light (300) and two-tone: an ink lead-in, then a grey continuation.
- The mark is a tally: four ink bars crossed by a coral slash. The landing hero draws it huge as gradient art; the 16px favicon uses a three-bar cut so it stays legible.
- 8 person colors (slate, gold, plum, sage, rose, teal, taupe, clay) — solid circles with white initials, functional, never used as UI accents.
- A bill is one or more receipts (each with its own merchant, items, and tax/tip) plus a shared set of people; people are referenced by ID in each item's `assignees`, so they span all receipts.
- Proportional tax/tip math, computed **per receipt**: each person's share of a receipt's tax/tip is proportional to their subtotal within that receipt, then summed across receipts. Full precision internally; each receipt's total rounds to the cent on its own, as it was charged, and the bill total is their sum. Wherever amounts are listed above a total (everyone's shares, a person's lines, a receipt's subtotal, tax, and tip), they're rounded to cents with the largest-remainder method so they always add up to it.
- In-flow microinteractions ≤300ms via Framer Motion (`DURATION.fast`/`normal` in `constants/animations.ts`), following the user's reduced-motion setting (`MotionConfig reducedMotion="user"`). No page-load/entrance animations — screens render immediately. The landing's two demo loops rest on a complete still under reduced motion and in print.
- Single Zustand store drives the `landing → capture → verify → result → share` flow; it holds the bill as an optional `name`, `receipts[]`, a shared `people[]`, the optional `payerId` (who paid, chosen on Result), and the created `shareUrl` with the Venmo handle sent alongside it. The system back gesture steps back a screen (a history guard in `BillFlow`) rather than leaving the page and the bill.
- Item assignment happens in the assign sheet (Everyone / Clear / per-person checklist), opened from an item's people or its Assign button; a bottom sheet on phones, a centred dialog from `sm`.
- On a shared bill, each friend taps their own name to see their items; when the payer added a Venmo handle, everyone else who owes something gets a Venmo button addressed to the payer ("Pay Alex $75.84").
- OCR via Claude Sonnet (`claude-sonnet-5-5`) with image input and Zod-validated JSON output.
- Sharing: 8-char base62 short IDs via `crypto.randomInt`. 30-day TTL enforced by weekly cron + on-read expiry check. `/b/` is disallowed in `robots.txt` — shared bills carry names, amounts, and Venmo handles, and a search cache would outlive the TTL. Every route shares one `index.html`, so it carries no canonical link or `og:url`, which would point a shared bill's link preview at the homepage.
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
- Use `console.log` in client code — server/cron use `console.*` for operational logging only (see `.claude/rules/code-style.md`).
- String-concatenate user input into SQL — use parameterized queries (`$1`, `$2`).
- Log bill payload contents, API keys, or headers.

## Rules (path-scoped — loaded automatically when editing matching files)

- `.claude/rules/code-style.md` — TypeScript, JSDoc, import ordering, naming. Loads for `client/**/*.{ts,tsx}`, `server/**/*.ts`, and `cron/**/*.ts`.
- `.claude/rules/component-patterns.md` — React file structure, state management, Framer Motion patterns. Loads for `client/src/**/*.{ts,tsx}`.
- `.claude/rules/styling.md` — Theming, visual language, interactive states, animation. Loads for `client/src/**/*.{tsx,css}` and `client/tailwind.config.js`.
- `.claude/rules/responsive.md` — Mobile-first breakpoints, viewport units, safe area handling. Loads for `client/src/**/*.{tsx,css}`.
- `.claude/rules/server-patterns.md` — Route handlers, Zod validation, service layer, security hardening. Loads for `server/src/**/*.ts`.

## Skills (reference knowledge)

- `.claude/skills/design-tokens/` — Exact color hex values, typography, person colors, animation durations.
- `.claude/skills/bill-math/` — Proportional tax/tip algorithm, edge cases, rounding rules.
- `.claude/skills/ocr-pipeline/` — OCR flow, Claude prompt, Zod schema, error handling.
- `.claude/skills/sharing-strategy/` — Postgres sharing, short ID generation, TTL, cron.
