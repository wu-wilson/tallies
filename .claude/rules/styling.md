---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
  - "client/tailwind.config.js"
---

# Styling

A light, restrained system in the spirit of Stripe and Forge: white surfaces, hairlines, one typeface, light two-tone headlines, and very little colour. No UI component libraries — build all components from scratch with Tailwind.

## Theming

- All colors via CSS custom properties / Tailwind semantic tokens. Never hardcode hex in components (no `bg-[#ABC]`). Tokens are RGB channels on `:root` in `index.css`, mapped through `rgb(var(--token) / <alpha-value>)`, so opacity modifiers work (`bg-ink/40`). SVG art reads them as `rgb(var(--token))`.
- Light mode only. Never use Tailwind `dark:` prefixes.
- Ink (`bg-ink`) carries primary buttons. `settled` green marks things that are read, paid, selected, or done (a ready split, finished steps, success ticks), focused fields, and the capture drop zone (its upload tile and drag-over frame); every other control's keyboard focus is the 2px ink outline from `index.css`. Coral appears only in the logo's slash and the hero art. Venmo blue is reserved for the pay handoff.
- Person colors are functional (identify individuals) — never used as UI accents outside that role.
- Status is always words (with an icon where it helps), never coloured dots or pills.
- Forced-colors mode (Windows contrast themes) drops backgrounds and recolours text, so state never rides on those alone: hidden marks use opacity, edges come from transparent borders or outlines, and the switch knob uses `CanvasText`. Tailwind's `outline-none` is itself a transparent outline, so apply it only on focus (`focus:outline-none`); `.field` and `.cell` add theirs while focused, which is their focus cue in that mode.

## Visual Language

- App screens sit on `bg-ground`; cards are `CARD` from `components/common/styles.ts` (`rounded-xl border border-line bg-surface shadow-card`). The landing page is `bg-surface` throughout.
- Inside cards, rows are divided by `border-line-soft`; card edges and section breaks use `border-line`.
- Buttons come from `styles.ts`: `BUTTON_PRIMARY` (ink), `BUTTON_SECONDARY` (outlined white), `BUTTON_GHOST` (quiet text actions like Add item), and `BUTTON_REMOVE` (fixed-size × or trash that warms to red). Size them with `h-*`/`px-*` at the call site.
- Fields: `.field` for framed inputs (the payer, Venmo, tax and tip, a new person) and `.cell` for inputs that read as text until hovered or focused (item names and prices, merchants, the bill name). Both draw a green focus border and ring, so inputs never show the global outline.
- Segmented controls (`common/Segmented`) for small exclusive choices: tip presets, % or $.
- The capture drop zone, Add another receipt, and an unassigned item's Assign button use a dashed `border-line-strong` frame; the in-card Add item and Add person rows are `BUTTON_GHOST`.
- Avatars: solid `rgb(var(--person-<key>))` circles with a white initial; piles overlap with a white ring (`AvatarPile`).

## Typography

- Hanken Grotesk only, self-hosted. No monospace: figures use tabular numerals (set on `body`).
- Headlines are light (300) with tight tracking and two tones: an ink lead-in and a `text-ink-4` continuation. Screen titles are 400; labels and card titles are 500.

## Interactive States

- Every clickable element: a hover state with `transition-colors` (or `transition-[filter]` on the Venmo button) at 200ms; framed `.field`s darken their border to ink-4. Disabled and `aria-disabled` controls don't react to hover (`enabled:hover:`, or `aria-disabled:hover:` resets).
- State reads at 3:1: unchecked boxes and the off switch draw their edges (and the switch its knob) in ink-4.
- No instant visual changes — all state transitions animated.
- No press-scale feedback; hover and focus states carry the interaction. Hover styles apply only where a pointer can hover (`future.hoverOnlyWhenSupported` for utilities, the same media query around `.cell:hover`), so a tapped row on a phone doesn't stay tinted.

## Animation

- Prefer `transform` and `opacity` (GPU-accelerated), and height for expand/collapse.
- The landing's two demo loops (`demo-*`, `how-*` in `index.css`) are the only ambient motion. Their resting styles form a complete still (the hero fully assigned with the pay button ready, the steps on step 1), which is what reduced motion and print show.
- Spinners use Tailwind's `animate-spin`.
