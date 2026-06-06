---
name: design-tokens
description: CSS variables, person colors, fonts, radii, and animation durations used in Tallies.
user-invocable: true
---

# Design Tokens

Source of truth: `client/src/index.css` (CSS custom properties) and `client/src/constants/animations.ts` (durations).

## Colors (dark mode only — defined on `:root`)

**Background tiers**
- `--bg-primary`: `#111114`
- `--bg-secondary`: `#1a1a1e`
- `--bg-tertiary`: `#232328`

**Borders**
- `--border-color`: `#2e2e34`
- `--border-subtle`: `#232328`

**Text**
- `--text-primary`: `#ececee`
- `--text-secondary`: `#8b8b96`
- `--text-tertiary`: `#5c5c66`

**Surface**
- `--surface-hover`: `#232328`

**Brand (forest green)**
- `--brand`: `#2D7D5A`
- `--brand-light`: `#3A9069`
- `--brand-subtle`: `rgba(45, 125, 90, 0.12)`

**Status**
- `--success`: `#4ADE80`
- `--warning`: `#FACC15`
- `--error`: `#F87171`

## Person Colors (8, functional)

Auto-assigned in `PERSON_COLORS` order from `client/src/constants/colors.ts`. Runtime hex values are CSS variables in `index.css`:

| Key | Hex | Label |
|---|---|---|
| sage | `#8FAA82` | Sage |
| gold | `#D4B175` | Gold |
| plum | `#B398C2` | Plum |
| slate | `#7E9EBA` | Slate |
| rose | `#D88FA6` | Rose |
| taupe | `#B8A595` | Taupe |
| teal | `#74C0AE` | Teal |
| clay | `#D17A5E` | Clay |

`Avatar.tsx` renders via `style={{ backgroundColor: 'var(--person-${color})' }}`.

## Typography

- Display/headers: Inter (`text-2xl font-semibold tracking-tight`)
- Body: Inter (14px base on `body`; landing tagline scales `text-sm sm:text-base`)
- Numbers/currency: JetBrains Mono (`font-mono tabular-nums`, right-aligned in totals)

Font feature settings on body: `font-feature-settings: 'cv11', 'ss01'`.

## Border Radii

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Avatars / pills: `rounded-full`
- Small inline buttons (e.g. landing "Enter manually"): `rounded` (4px)

## Surfaces

- Borders define edges (`border border-border` or `border-border-subtle` for inner dividers).
- No card shadows in the current design — depth comes from bg tier shifts (`bg-bg-secondary` vs `bg-bg-tertiary/30/40`).

## Animation Durations (`constants/animations.ts`)

- `fast`: 0.15s
- `normal`: 0.2s
- `smooth`: 0.3s

`EASE.out = [0.16, 1, 0.3, 1]`. `EASE.spring` = stiffness 400, damping 30.

Per-list stagger: PersonCard 50ms (with 80ms base delay), ItemCard 30ms.

## Landing Entrance

Tally logo draws via Framer Motion `pathLength` over `TALLY_DRAW_DURATION` (~1.19s). Content (wordmark + tagline + CTAs + OR + Enter manually) reveals together via CSS `landing-from-left` / `landing-from-bottom` keyframes (1000ms ease) at `animationDelay = TALLY_DRAW_DURATION + 50ms`.

Gated by a module-level `hasPlayedEntrance` flag in `CaptureScreen.tsx` — entrance plays once per page load. Subsequent paints of the landing (verify-screen Back button, ImagePreview Change, anything that re-mounts the landing JSX) read the flag at render time and skip the animation classes. Flows that bypass or interrupt the landing (image capture, Enter manually) mark the flag eagerly so even mid-animation departures don't leave it unset.
