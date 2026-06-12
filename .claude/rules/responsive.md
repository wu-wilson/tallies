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
- Tagline scales `text-sm sm:text-base` (14→16px) on the landing page.
- Headings use `text-lg`–`text-2xl` without responsive scaling.

## Touch Targets

- In-flow primary CTAs `h-10` (40px) — used by `PrimaryCta`, `StickyAction`, and `ImagePreview`'s Change/Scan; landing "Add receipt" `h-11` (44px). The 40px in-flow buttons live alongside `text-sm`/`text-xs` content where 48px feels oversized — the wider hit area comes from horizontal padding plus generous row spacing.
- Avatars (`Avatar.tsx`): xs=20px, sm=24px, md=32px.

## Viewport

- Never use `h-screen` / `min-h-screen` (`100vh`) — use `min-h-dvh` (dynamic viewport).
- `index.html` viewport: `viewport-fit=cover` (notched devices) + `maximum-scale=1.0` (prevents mobile focus-zoom on sub-16px inputs, so inputs keep the small type scale; manual pinch-zoom still works on iOS).
- Top-edge scroll containers (Verify, Result, SharedView) clear the notch with `pt-[calc(32px+env(safe-area-inset-top))]` — the inset is 0 in a normal browser, non-zero in standalone/landscape. Vertically-centered screens (Capture, ImagePreview) don't need it.
- Sticky bottom bars: `pb-[calc(12px+env(safe-area-inset-bottom))]`.
- `min-h-dvh` (dynamic) suits Tallies' scrollable screens; reserve `svh` for a fixed, full-height, non-scrolling shell (none exists today) — never swap `min-h-dvh` → `h-svh` on scroll content, it clips overflow.
- Never allow horizontal overflow — `overflow-x: hidden` on html.

## Layout

- Flow screens (Verify, Result, SharedView) use a centered single column at `max-w-2xl` (`mx-auto`).
- CTA on Verify is inline at the end of the column on `lg+` (`hidden lg:block`), sticky-bottom on mobile via `StickyAction` (`lg:hidden`). Result and SharedView use inline CTAs only.

## Scrolling

- `overscroll-behavior: none` on body to prevent pull-to-refresh.
- Avoid `overflow-x-auto` on containers that hold focus-ring-bearing children — the browser also clips `overflow-y`, cropping box-shadow rings.
