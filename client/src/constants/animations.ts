/** Framer Motion duration presets in seconds. */
export const DURATION = {
  fast: 0.15,
  normal: 0.2,
  smooth: 0.3,
} as const;

/** Easing curves and spring presets for Framer Motion. */
export const EASE = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
};
