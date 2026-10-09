/** Framer Motion duration presets in seconds. */
export const DURATION = {
  fast: 0.15,
  normal: 0.2,
} as const;

/** Easing curves for Framer Motion. */
export const EASE: { out: [number, number, number, number] } = {
  out: [0.16, 1, 0.3, 1],
};
