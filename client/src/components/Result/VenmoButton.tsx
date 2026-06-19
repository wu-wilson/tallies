import React from 'react';
import { motion } from 'framer-motion';

import { VenmoWordmark } from './VenmoWordmark';

import { buildVenmoLink } from '../../lib/venmo';
import { formatCurrency } from '../../lib/billMath';

interface VenmoButtonProps {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** This person's total owed; prefilled as the payment amount and shown on the button. */
  amount: number;
  /** Note/memo prefilled on the Venmo payment screen. */
  memo: string;
}

/**
 * Per-person pay link — a full-width Venmo-blue bar reading "Pay $X · venmo". Opens the platform-specific
 * Venmo link (deep link on mobile, web on desktop).
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
      aria-label={`Pay ${formatCurrency(amount)} via Venmo`}
      className="flex w-full items-center justify-center gap-2 bg-venmo px-4 py-3.5 transition-[filter] hover:brightness-110"
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-[15px] font-extrabold text-white">Pay {formatCurrency(amount)}</span>
      <span className="text-white/60">·</span>
      <VenmoWordmark className="text-white" />
    </motion.a>
  );
};
