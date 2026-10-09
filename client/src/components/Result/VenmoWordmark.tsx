import React from 'react';

/** System-font stack matching Venmo's own wordmark, kept off the Hanken Grotesk face. */
const VENMO_FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

interface VenmoWordmarkProps {
  /** Text colour and size utilities. */
  className: string;
}

/**
 * The Venmo wordmark set as styled text (heavy italic system font), used on pay buttons.
 * @param props - Classes carrying the colour and size
 * @returns Inline "venmo" wordmark, hidden from assistive tech
 */
export const VenmoWordmark: React.FC<VenmoWordmarkProps> = ({ className }) => (
  <span aria-hidden="true" className={`font-extrabold italic tracking-[-0.03em] ${className}`} style={{ fontFamily: VENMO_FONT }}>
    venmo
  </span>
);
