---
name: design-tokens
description: CSS variables, person colors, fonts, borders, and animation durations used in Tallies.
user-invocable: true
---

# Design Tokens

Editorial-brutalist, light warm-paper system. Source of truth: `client/src/index.css` (CSS custom properties) and `client/src/constants/animations.ts` (durations). Tailwind maps every variable to a semantic token in `client/tailwind.config.js` — never hardcode hex in components.

## Colors (light mode — defined on `:root`)

**Surfaces (warm paper, lightest to deepest)**
- `--paper`: `#F6F2E9` (body background, `bg-paper`)
- `--paper-raised`: `#FBF9F3` (cards, `bg-paper-raised`)
- `--sand`: `#E4E0D4` (`bg-sand`)
- `--sand-2`: `#EDE8DB` (input/field fills, `bg-sand-2`)
- `--sand-3`: `#E3DCC9` (header bands, `bg-sand-3`)

**Ink (text + borders)**
- `--ink`: `#1B1A17` (`text-ink`, default border color)
- `--ink-soft`: `#3a382f` (`text-ink-soft`)
- `--ink-muted`: `#5c5848` (`text-ink-muted`)
- `--ink-faint`: `#6a685c` (`text-ink-faint`)
- `--ink-ghost`: `#8a8675` (`text-ink-ghost`)

**Hairlines**
- `--line`: `#ded8c8` (inner dividers, `border-line`)
- `--line-grid`: `#f0ebdc` (grid-paper backdrop, `border-line-grid`)

**Scrim**
- `--scrim`: `rgba(27,26,23,0.5)` (modal backdrop, `bg-scrim`). Pre-baked alpha — Tailwind `/opacity` modifiers don't work on the hex-valued tokens, so use this for the dim rather than `bg-ink/50`.

**Accents**
- `--brand`: `#2C5545` (`bg-brand` / `text-brand`); `--on-brand`: `#F6F2E9` (`text-brand-on`)
- `--rust`: `#B0573A` (`text-rust` — logo slash, eyebrows, warnings)
- `--venmo`: `#008CFF` (`bg-venmo` / `text-venmo` — pay handoff only)

**Status**
- `--success`: `#2C5545` · `--warning`: `#B0573A` · `--error`: `#9B2C2C` (`text-status-*`)

## Person Colors (8, functional)

Auto-assigned in `PERSON_COLORS` order from `client/src/constants/colors.ts`; warm-toned for the paper palette. Runtime hex values are CSS variables in `index.css`:

| Key | Hex |
|---|---|
| sage | `#2C5545` |
| gold | `#C2912F` |
| plum | `#7E5C86` |
| slate | `#4D6A82` |
| rose | `#B0573A` |
| taupe | `#8A6D43` |
| teal | `#2F7E6E` |
| clay | `#1B1A17` |

`Avatar.tsx` renders a 1.5px ink ring around `var(--person-<key>)` with a cream initial.

## Typography

- Display/headers: Archivo (`font-black tracking-tight`, weights 800–900)
- Body/UI: Archivo (14px base on `body`)
- Numbers/currency/micro-labels: Space Mono (`font-mono tabular-nums`); uppercase tracked labels at `text-[10px]`–`text-[11px]`
- The Venmo wordmark renders as italic system-font text (`VenmoWordmark`), kept off the Archivo face.

## Borders & Radii

- Default `border` is **1.5px solid ink** (set via `borderWidth.DEFAULT` + `borderColor.DEFAULT`). Inner dividers use `border-line`.
- Cards, buttons, fields, and badges are **square** (no radius). Avatars and small dots are `rounded-full`.
- Add/empty states use `border-2 border-dashed` (ink, ink-faint, or brand).
- Depth comes from border + surface-tier shifts (`bg-paper` vs `bg-paper-raised` vs `bg-sand-*`); **no shadows**.

## Animation Durations (`constants/animations.ts`)

- `fast`: 0.15s · `normal`: 0.2s · `smooth`: 0.3s
- `EASE.out = [0.16, 1, 0.3, 1]`; `EASE.spring` = stiffness 400, damping 30.
- Per-list stagger: PersonCard 50ms (80ms base delay), ItemCard 30ms.
- Keyframe utility in `index.css`: `animate-spin-slow` (scan spinners). No page-load/entrance animations — screens render immediately.
