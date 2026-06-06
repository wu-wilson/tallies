import React from 'react';
import { motion } from 'framer-motion';

interface TallyLogoProps {
  className?: string;
  /** SVG height in px; the width is scaled proportionally. Defaults to 24. */
  size?: number;
  /** When true, plays the stroke draw-in animation on mount; when false, renders at the final state instantly. */
  animate?: boolean;
}

const LINES = [
  { x1: 4, y1: 3, x2: 4, y2: 21 },
  { x1: 9, y1: 3, x2: 9, y2: 21 },
  { x1: 14, y1: 3, x2: 14, y2: 21 },
  { x1: 19, y1: 3, x2: 19, y2: 21 },
  // Slash drawn from top-right down to bottom-left.
  { x1: 21.5, y1: 4.5, x2: 1.5, y2: 19.5 },
] as const;

const TALLY_DELAYS = [0, 0.15, 0.3, 0.45, 0.75];
const TALLY_DURATIONS = [0.28, 0.28, 0.28, 0.28, 0.44];

/** Stroke-draw easing — soft start, gentle deceleration. */
const SMOOTH_EASE = [0.33, 0.33, 0.66, 1] as const;

/** Total time for the logo to finish drawing (last stroke ends), in seconds. */
export const TALLY_DRAW_DURATION =
  TALLY_DELAYS[4] + TALLY_DURATIONS[4];

/**
 * Tally-mark logo — four vertical strokes plus a diagonal slash, optionally drawn on mount.
 * @param props - Logo configuration
 * @returns Inline SVG
 */
export const TallyLogo: React.FC<TallyLogoProps> = ({
  className,
  size = 24,
  animate = false,
}) => {
  return (
    <svg
      width={size * (23 / 24)}
      height={size}
      viewBox="0 0 23 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-label="Tallies logo"
    >
      {LINES.map((line, i) => (
        <motion.line
          key={i}
          {...line}
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            animate
              ? {
                  pathLength: {
                    duration: TALLY_DURATIONS[i],
                    delay: TALLY_DELAYS[i],
                    ease: SMOOTH_EASE,
                  },
                  opacity: {
                    duration: 0.01,
                    delay: TALLY_DELAYS[i],
                  },
                }
              : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
};
