---
name: design-tokens
description: CSS variables, person colors, the typeface, radii, shadows, the mark, and animation durations used in Tallies.
user-invocable: true
---

# Design Tokens

A light, restrained system in the family of Stripe and Forge. Source of truth: `client/src/index.css` (CSS custom properties, stored as space-separated RGB channels with the hex in a comment) and `client/src/constants/animations.ts` (durations). `client/tailwind.config.js` maps every UI colour variable to a semantic token through `rgb(var(--token) / <alpha-value>)`, so opacity modifiers like `bg-ink/40` resolve; `--person-*` and `--art-*` are read directly as `rgb(var(--…))`. Never hardcode hex in components.

## Colors (light mode, on `:root`)

**Surfaces**
- `--ground`: `#FAFAFB` (app screen background, `bg-ground`)
- `--surface`: `#FFFFFF` (cards, fields, the landing page, `bg-surface`)
- `--wash`: `#F5F6F7` (hover and selected rows, `bg-wash`)

**Ink, strongest to faintest**
- `--ink`: `#0E0F10` (text, primary buttons, `text-ink`/`bg-ink`)
- `--ink-2`: `#4D5159` (secondary text)
- `--ink-3`: `#6B7079` (labels, captions, meta lines)
- `--ink-4`: `#8A8F98` (the grey half of two-tone headlines, the × and trash of remove controls, and state edges: unchecked boxes, the off switch, hovered fields and dashed frames; 3.2:1 on white, so large text and non-text UI only)
- `--ink-5`: `#A5A9B0` (decorative chevrons only)

**Hairlines**
- `--line`: `#EAEBED` (card borders, section dividers; the default `border` color)
- `--line-soft`: `#F3F4F5` (row dividers, segmented tracks)
- `--line-strong`: `#DADCE0` (fields, outlined buttons, dashed add frames)

**Accents**
- `--settled`: `#0F7B5F` (read, paid, selected, and done states, field focus, and the capture drop zone's upload tile and drag-over frame) and `--settled-wash`: `#ECF5F1`
- `--coral`: `#F0643E` (the logo's slash only)
- `--error`: `#B42318` and `--error-wash`: `#FDF1EF`
- `--venmo`: `#008CFF` (the pay handoff only)

**Hero art** (`--art-*`): deep `#0A5242`, mid `#138C6C`, light `#4DC6A0`, pale `#D3F1DD` for the bars' one continuous gradient; amber `#FFC56E`, coral `#F7774A`, rose `#E2457A` for the slash.

## Person Colors (8, functional)

Auto-assigned in `PERSON_COLORS` order from `client/src/constants/colors.ts`. Each carries a white initial. The keys are stored in shared bills, so keep them stable and change only the values:

| Key | Hex |
|---|---|
| slate | `#3D63A8` |
| gold | `#A65F1A` |
| plum | `#7A55A3` |
| sage | `#2F7D73` |
| rose | `#B4483B` |
| teal | `#1B7894` |
| taupe | `#7A6648` |
| clay | `#4D5159` |

## Typography

- One family, Hanken Grotesk (OFL), self-hosted as a variable woff2 in `client/public/fonts/` (its `@font-face` declares weights 300–700) and preloaded in `index.html`. Fallback: system-ui.
- Tabular numerals on `body`; no monospace anywhere.
- Headlines: weight 300, tracking around -0.035em, two-tone (ink, then `text-ink-4`). Screen titles 400. Labels and card titles 500. Body 14–17px.

## Shape and Depth

- Radii: 6px on small controls and inline `.cell` fields (`rounded-md`), 8px on buttons and framed `.field`s (`rounded-lg`), 12px on cards (`rounded-xl`), 16px on the landing's steps module and the phone assign sheet's top corners.
- Shadows are faint and ink-tinted: `shadow-card` (cards), `shadow-float` (the hero cards, dialogs, toasts), `shadow-segment` (the raised segment), `shadow-sheet` (the phone bottom sheet).

## The Mark

- Four bars crossed by a slash on a 24 grid: `M5 4.5v15M9.5 4.5v15M14 4.5v15M18.5 4.5v15` in `currentColor` and `M21 6.5 3 17.5` in coral, stroke 2.2 with round caps (`components/common/TallyLogo.tsx`).
- `favicon.ico` holds a 16px three-bar cut (four bars blur at that size) and the four-bar mark at 32 and 48px, all white on an ink tile with a lighter coral slash. `apple-touch-icon.png` is the mark on a full-bleed ink square.
- `og.png` (1200×630) is a dark poster whose essentials sit inside the centre 630×630, so a square crop still works.

## Animation Durations (`constants/animations.ts`)

- `fast`: 0.15s · `normal`: 0.2s
- `EASE.out = [0.16, 1, 0.3, 1]`.
- Landing loops in `index.css`: the hero demo runs 6.4s on a 0.45s beat (`demo-*`); the steps module gives each step 2.5s of a 7.5s cycle (`how-*`).
