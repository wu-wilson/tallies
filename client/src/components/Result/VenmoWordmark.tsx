import React from 'react';

interface VenmoWordmarkProps {
  /** Tailwind text-color (and any sizing) utilities — defaults to the Venmo blue token. */
  className?: string;
}

/** System-font stack matching Venmo's own wordmark, kept off the Archivo display face. */
const VENMO_FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

/**
 * The Venmo wordmark rendered as styled text (italic, system font) — used in the handle field and pay button.
 * @param props - Optional className carrying the text color and size
 * @returns Inline "venmo" wordmark, marked decorative
 */
export const VenmoWordmark: React.FC<VenmoWordmarkProps> = ({ className = 'text-venmo' }) => (
  <span aria-hidden="true" className={`font-extrabold italic tracking-tight ${className}`} style={{ fontFamily: VENMO_FONT }}>
    venmo
  </span>
);
