import React from 'react';

interface TallyLogoProps {
  className?: string;
  /** SVG height in px; the width is scaled proportionally. Defaults to 24. */
  size?: number;
}

/** Four vertical tally bars; the fifth stroke is the diagonal slash, tinted rust. */
const BARS = [4, 9, 14, 19] as const;
const SLASH = { x1: 21.5, y1: 4.5, x2: 1.5, y2: 19.5 } as const;

/**
 * Tally-mark logo — four ink bars crossed by a rust diagonal slash. Colors come from the `--ink` and
 * `--rust` tokens, so `className` is for sizing/layout only.
 * @param props - Logo configuration
 * @returns Inline SVG
 */
export const TallyLogo: React.FC<TallyLogoProps> = ({ className, size = 24 }) => (
  <svg
    width={size * (23 / 24)}
    height={size}
    viewBox="0 0 23 24"
    fill="none"
    strokeWidth="2.6"
    strokeLinecap="round"
    className={className}
    aria-label="Tallies logo"
  >
    {BARS.map((x) => (
      <line key={x} x1={x} y1={3} x2={x} y2={21} stroke="var(--ink)" />
    ))}
    <line x1={SLASH.x1} y1={SLASH.y1} x2={SLASH.x2} y2={SLASH.y2} stroke="var(--rust)" />
  </svg>
);
