---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
  - "client/tailwind.config.js"
---

# Styling

No UI component libraries. Build all components from scratch with Tailwind.

## Theming

- All colors via CSS custom properties / Tailwind semantic tokens. Never hardcode hex in components (no `bg-[#ABC]`).
- Dark mode only — palette defined on `:root` in `index.css`. Never use Tailwind `dark:` prefixes.
- Forest green brand accent used sparingly — primary CTAs, focus rings, "splitting evenly" active state.
- Person colors are functional (identify individuals) — never used as UI accents outside that role.

## Visual Language

- Cards: `rounded-xl border border-border bg-bg-secondary`. No shadows.
- Buttons: `rounded-lg`. In-flow primary CTAs `h-10 px-4 text-[13px] font-medium` (see `PrimaryCta`, `StickyAction`, and `ImagePreview`'s Change/Scan); landing-screen "Add receipt" uses `h-11`. No shadows on any.
- Inputs: bare `bg-transparent outline-none`. Focus ring handled by the global `*:focus-visible` rule in `index.css`.
- Avatars: `rounded-full` with `var(--person-<key>)` background, white initial.
- Receipt-style dashed dividers: `border-dashed border-border-subtle`.

## Sectioning

- Section structure comes from uppercase tracked micro-labels (`text-[10px] uppercase tracking-[0.1em] text-text-tertiary`) plus generous whitespace (`mb-10`, `space-y-10`), not horizontal rules.
- Reserve `border-t border-border-subtle` for true functional boundaries (e.g., between a live summary and its CTA in a sidebar). Avoid full-content-width section rules.

## Interactive States

- Every clickable element: hover state, smooth `transition-colors duration-150 ease-out` (or `transition-[filter,background-color]`).
- No instant visual changes — all state transitions animated.
- `whileTap={{ scale: 0.97 }}–{ scale: 0.98 }` on buttons via Framer Motion.

## Animation

- Duration constants from `constants/animations.ts`. All ≤300ms.
- Prefer `transform` and `opacity` (GPU-accelerated).
- Use `AnimatePresence` for mount/unmount, `layout` for position changes.
- The landing entrance uses CSS keyframes (`animate-landing-from-left` / `animate-landing-from-bottom`) so it composites without React overhead during the logo draw.
