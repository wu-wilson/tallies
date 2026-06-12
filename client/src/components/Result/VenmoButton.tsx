import React from 'react';
import { motion } from 'framer-motion';

import { VenmoWordmark } from './VenmoWordmark';

import { buildVenmoLink } from '../../lib/venmo';

interface VenmoButtonProps {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** This person's total owed; prefilled as the payment amount. */
  amount: number;
  /** Note/memo prefilled on the Venmo payment screen. */
  memo: string;
}

/**
 * Per-person pay link showing the white Venmo wordmark on the brand blue. A tapped anchor to the
 * platform-specific Venmo link (deep link on mobile, web on desktop); lightens on hover.
 * @param props - Recipient handle, amount, and memo for the payment
 * @returns Full-width Venmo link styled as a button
 */
export const VenmoButton: React.FC<VenmoButtonProps> = ({ username, amount, memo }) => {
  const { href, openInNewTab } = buildVenmoLink({ username, amount, memo });

  return (
    <motion.a
      href={href}
      target={openInNewTab ? '_blank' : undefined}
      rel="noopener noreferrer"
      aria-label="Pay via Venmo"
      className="flex h-10 w-full items-center justify-center rounded-lg bg-venmo px-4 text-white transition-[filter,background-color] hover:bg-venmo-light"
      whileTap={{ scale: 0.98 }}
    >
      <VenmoWordmark />
    </motion.a>
  );
};
