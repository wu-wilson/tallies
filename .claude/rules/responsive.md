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
- Display type scales with `clamp()`: the landing hero `clamp(38px,3.9vw,56px)`, section headlines `clamp(28px,2.6vw,38px)`, the closing call to action `clamp(32px,3.2vw,46px)`, the not-found and load-error headlines `clamp(30px,4vw,44px)`, screen titles `clamp(26px,2.3vw,32px)`, and big totals `clamp(44px,4.6vw,64px)`.
- Captions and row meta lines sit at 12.5–13.5px, and the meta line under a screen title at 14px (`text-sm`); never below `text-xs` (12px) for primary text.

## Touch Targets

- Primary buttons are 46–48px tall (`h-[46px]`/`h-12`); secondary controls 34–40px; small inline controls (segments, the Split evenly switch, Assign) 28–32px; icon-only remove controls a fixed 32px box.
- Small text links (`BackLink` above screen titles, Split your own bill in the app bar, the GitHub link in the footer) extend their hit area 8px above and below with a `before:` pseudo-element, so a tap lands without the text growing.
- Avatars (`Avatar.tsx`): sm=20px (piles in item rows), md=28px (people lists), lg=32px (per-person rows).

## Viewport

- Never use `h-screen` / `min-h-screen` (`100vh`) — use `min-h-dvh` (dynamic viewport).
- `index.html` viewport: `viewport-fit=cover` (notched devices) + `maximum-scale=1.0` (prevents mobile focus-zoom on sub-16px inputs, so inputs keep the small type scale; manual pinch-zoom still works on iOS).
- The app bar (`AppBar`) and the brand bar (`BrandBar`) clear the notch with `pt-[env(safe-area-inset-top)]`, which is non-zero only in a standalone portrait app. In landscape the notch sits at the side, so `body` pads by `safe-area-inset-left`/`-right`.
- Sticky bottom bars: `pb-[calc(12px+env(safe-area-inset-bottom))]`. `html` carries a matching `scroll-padding-bottom`, so a keyboard-focused control scrolls clear of them, and a 24px `scroll-padding-top` keeps one from landing flush against the top edge. They carry `print:hidden`, since print would otherwise lay them over the content at their stuck position (a printed page is narrower than `lg`).
- `min-h-dvh` (dynamic) suits Tallies' scrollable screens; reserve `svh` for a fixed, full-height, non-scrolling shell (none exists today) — never swap `min-h-dvh` → `h-svh` on scroll content, it clips overflow.
- Never allow horizontal overflow — `overflow-x: hidden` on html.

## Layout

- Every top bar and section aligns to a centred 1200px column (`max-w-[1200px]`), so ultrawide screens keep the content readable and the rest is white or ground.
- Verify, Result, and SharedView are two columns from `lg` (`grid-cols-[minmax(0,1fr)_340–360px]`): the main list on the left and a right column of cards. Verify and Result place them with `grid-template-areas` so phones can reorder them (people above the receipts on Verify). Capture and Share are a single 540–680px column.
- The primary CTA on Verify and Result lives in the right column on `lg+` and in a sticky bottom bar below `lg`; Capture's Continue stays in its bar at every width. SharedView has no CTA; Share uses inline buttons.
- The landing hero puts copy beside the live demo from `lg`; below that the demo stacks under the copy, the art shrinks to fit its width, and the floating cards re-stack (the split card hides on phones, and from 1024 to 1159px where it would cover the receipt).

## Scrolling

- `overscroll-behavior: none` on `html` (browsers ignore it on `body`) to prevent pull-to-refresh, which would reload the page and lose the bill.
- Each flow screen opens at the top (`BillFlow` in `App.tsx` resets scroll when `screen` changes), since the screens share one page.
- Avoid `overflow-x-auto` on containers that hold focus-ring-bearing children — the browser also clips `overflow-y`, cropping box-shadow rings.
