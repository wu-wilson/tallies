import React from 'react';

interface TallyLogoProps {
  /** Rendered width and height in px. */
  size: number;
}

/**
 * The Tallies mark: four bars crossed by a coral slash, the same tally the landing hero draws large.
 * The bars draw in `currentColor`; decorative, since it always sits beside the "Tallies" wordmark.
 * @param props - Pixel size
 * @returns Inline SVG
 */
export const TallyLogo: React.FC<TallyLogoProps> = ({ size }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={2.2}
    strokeLinecap="round"
    className="shrink-0"
  >
    <path d="M5 4.5v15M9.5 4.5v15M14 4.5v15M18.5 4.5v15" stroke="currentColor" />
    <path d="M21 6.5 3 17.5" className="stroke-coral" />
  </svg>
);
