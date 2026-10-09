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
- Zustand store for shared state (bill data, screen, people, items, payer).
- Shared class strings (buttons, cards) live in `components/common/styles.ts`; reuse them instead of re-typing the utility lists.
- `useMemo` for expensive derived values (breakdowns, totals).
- Removing a row takes its focused control with it, so hand focus to that list's Add button (people, items, receipts; Choose files for scans). Add buttons mark their cap with `aria-disabled` rather than `disabled` (the store or handler ignores the press), so they stay focusable and never drop focus.
- The assign sheet locks page scrolling while open (`overflow: hidden` on `html`, with `scrollbar-gutter: stable` so nothing shifts), makes `#root` inert so Tab and screen readers can't reach the page behind it, wraps Tab between its first and last buttons, and returns focus to the item's button through a ref, since Safari doesn't focus a tapped button and `document.activeElement` can't name the opener. Standalone pages (a shared bill, not-found, load error) name the browser tab with `useDocumentTitle`.
- A double-tap's second click (`e.detail > 1`) lands on whatever the first one put under the finger: a new screen, a dialog it opened, or a control that slid into place (the next row's remove, Add another receipt). `BillFlow` lets it through only when the same screen and dialog are up and the first tap's control is still under that point.
- Changing flow screens moves focus to the new screen's `h1`, which takes `tabIndex={-1}`, plus `focus:outline-none` on the visible ones (Verify's is `sr-only`).

## Framer Motion

- `motion.div` with `initial`/`animate`/`exit` for mount/unmount animations.
- `AnimatePresence` wraps conditional renders. Default mode with `initial={false}` for enter/exit lists (items, people, scans); item and people rows animate height so they slide open and closed, and scans fade in.
- No `whileTap` press feedback (see styling.md).
- All in-flow durations from `constants/animations.ts`. Never exceed 300ms. `App` wraps everything in `MotionConfig reducedMotion="user"`.
- Looping marketing motion is CSS keyframes in `index.css`, not Framer Motion, so it runs without JavaScript timers and stops cleanly under reduced motion.
- Prefer pure CSS transforms over shared-layout (`layoutId`) animations for small toggles — `layoutId` writes inline transforms that can intercept clicks if interrupted.

## Limits

- Components under 150 lines. Extract sub-components or hooks beyond that.
- Extract hooks when logic exceeds ~20 lines or is reused.
