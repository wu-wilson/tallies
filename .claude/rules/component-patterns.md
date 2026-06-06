---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.ts"
---

# Component Patterns

## File Structure

1. Imports
2. Props interface (with JSDoc on non-obvious props)
3. Component (with JSDoc above)
4. Helper functions

## State Management

- `useState` for local UI state (hover, open/close, input values).
- Zustand store for shared state (bill data, screen, people, items).
- `useMemo` for expensive derived values (breakdowns, totals).

## Framer Motion

- `motion.div` with `initial`/`animate`/`exit` for mount/unmount animations.
- `AnimatePresence` wraps conditional renders. Use `mode="wait"` for screen transitions. Default mode with `initial={false}` for plain enter/exit lists (e.g., items). Use `mode="popLayout"` + per-item `layout` only when sibling items need to slide as one is added/removed (e.g., PeopleBar).
- `whileTap={{ scale: 0.97 }}–{ scale: 0.98 }` on interactive buttons for tactile feedback.
- All in-flow durations from `constants/animations.ts`. Never exceed 300ms.
- Prefer pure CSS transforms over shared-layout (`layoutId`) animations for small toggles — `layoutId` writes inline transforms that can intercept clicks if interrupted.

## Limits

- Components under 150 lines. Extract sub-components or hooks beyond that.
- Extract hooks when logic exceeds ~20 lines or is reused.
