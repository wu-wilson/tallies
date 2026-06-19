---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
  - "client/tailwind.config.js"
---

# Styling

Editorial-brutalist, light warm-paper system. No UI component libraries — build all components from scratch with Tailwind.

## Theming

- All colors via CSS custom properties / Tailwind semantic tokens. Never hardcode hex in components (no `bg-[#ABC]`).
- Light mode only — palette defined on `:root` in `index.css`. Never use Tailwind `dark:` prefixes.
- Forest green brand (`text-brand`/`bg-brand`) carries primary CTAs, active toggle states, and focus indication. Rust (`text-rust`) is for eyebrows, the logo slash, and warnings. Venmo blue is reserved for the pay handoff.
- Person colors are functional (identify individuals) — never used as UI accents outside that role.

## Visual Language

- The default `border` is **1.5px solid ink**. Cards: `border bg-paper-raised`, square corners, no shadow. Inner dividers: `border-line` (hairline) or `divide-line`.
- Buttons / CTAs: square. Primary is a solid `bg-brand text-brand-on` bar; secondary is `border bg-paper-raised`. Hover via `transition-[filter] hover:brightness-110` (or `hover:brightness-[0.97]` on light surfaces). No shadows.
- Fields: `bg-sand-2` boxes (inline editors) or `border bg-paper-raised` (framed inputs). Every input carries a 1.5px border — `border-transparent` on the fills — so the focus state is uniform: `index.css` turns the input border `--brand` on `:focus-visible` (and drops the global box-shadow ring for inputs). Wrap a multi-part field (e.g. the Venmo `@`-prefixed input) and use `focus-within:border-brand` on the container. Buttons/links keep the box-shadow ring.
- Add / empty states: `border-2 border-dashed` (ink-faint or brand).
- Avatars: `rounded-full border` ring over `var(--person-<key>)`, cream initial.

## Sectioning

- Section structure comes from uppercase Space-Mono micro-labels (`font-mono text-[10px]–text-[11px] font-bold tracking-[0.06em] text-ink-faint`) plus generous whitespace, and from `border`/`border-line` rules between bands.
- Header bands inside cards use `bg-sand-3` with a `border-b` ink rule; per-person totals dash off with `border-t-2 border-dashed`.

## Interactive States

- Every clickable element: a hover state with a smooth `transition-colors` or `transition-[filter] duration-150`.
- No instant visual changes — all state transitions animated.
- `whileTap={{ scale: 0.97 }}–{ scale: 0.99 }` on interactive buttons via Framer Motion.

## Animation

- Duration constants from `constants/animations.ts`. All in-flow ≤300ms.
- Prefer `transform` and `opacity` (GPU-accelerated). Use `AnimatePresence` for mount/unmount, `layout` for position changes (e.g. PeopleBar `popLayout`).
- No page-load or entrance animations — screens render immediately.
- Keyframe utility: `animate-spin-slow` (scan spinner).
