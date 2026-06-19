---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
---

# Responsive Design

## Breakpoints

Mobile-first. Use Tailwind defaults: `sm` (640px), `md` (768px), `lg` (1024px). Base styles target portrait iPhone (375–414px), then layer responsive overrides.

## Typography

- Base body 14px (set on `body` in `index.css`).
- Marketing hero scales up across breakpoints (`text-5xl sm:text-7xl`); in-app headings (bill title, result total) use a fixed large display size (`text-2xl`–`text-5xl`).
- Mono micro-labels stay small (`text-[10px]`–`text-[11px]`); never below `text-xs` for primary text.

## Touch Targets

- In-flow primary CTAs are full-width brand bars at `py-4` (~52px tall); secondary/inline controls at `py-2`–`py-3.5`. Hit area comes from full width plus generous vertical padding.
- Avatars (`Avatar.tsx`): xs=22px, sm=26px, md=34px, lg=40px.

## Viewport

- Never use `h-screen` / `min-h-screen` (`100vh`) — use `min-h-dvh` (dynamic viewport).
- `index.html` viewport: `viewport-fit=cover` (notched devices) + `maximum-scale=1.0` (prevents mobile focus-zoom on sub-16px inputs, so inputs keep the small type scale; manual pinch-zoom still works on iOS).
- Top-edge scroll containers (Capture, Verify, Result, Share, SharedView) clear the notch with `pt-[calc(20–28px+env(safe-area-inset-top))]` — the inset is 0 in a normal browser, non-zero in standalone/landscape.
- Sticky bottom bars: `pb-[calc(12px+env(safe-area-inset-bottom))]`.
- `min-h-dvh` (dynamic) suits Tallies' scrollable screens; reserve `svh` for a fixed, full-height, non-scrolling shell (none exists today) — never swap `min-h-dvh` → `h-svh` on scroll content, it clips overflow.
- Never allow horizontal overflow — `overflow-x: hidden` on html.

## Layout

- App-flow screens (Capture, Verify, Result, Share, SharedView) use a centered single column at `max-w-xl` (`mx-auto`). The marketing screen is full-width with its own inner `max-w-3xl` sections.
- The primary CTA on Verify and Result is inline at the end of the column on `lg+` (`hidden lg:block`) and sticky-bottom on mobile (`lg:hidden`). SharedView has no CTA; Share uses an inline button.

## Scrolling

- `overscroll-behavior: none` on body to prevent pull-to-refresh.
- Avoid `overflow-x-auto` on containers that hold focus-ring-bearing children — the browser also clips `overflow-y`, cropping box-shadow rings.
