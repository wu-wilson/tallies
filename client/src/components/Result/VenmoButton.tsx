import React from 'react';

import { VenmoWordmark } from './VenmoWordmark';

import { formatCurrency } from '../../lib/billMath';
import { buildVenmoLink } from '../../lib/venmo';

interface VenmoButtonProps {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** Whoever the money goes to, named on the button when known. */
  payeeName?: string;
  /** This person's share, prefilled as the payment amount and shown on the button. */
  amount: number;
  /** Note prefilled on the Venmo payment screen. */
  memo: string;
}

/**
 * Full-width Venmo-blue pay link, "Pay Alex $75.84 venmo", that opens the platform's Venmo hand-off (the app on
 * phones, the website on desktop) with the amount and note filled in.
 * @param props - Recipient handle, their name, the amount, and the memo
 * @returns The pay link styled as a button
 */
export const VenmoButton: React.FC<VenmoButtonProps> = ({ username, payeeName, amount, memo }) => {
  const { href, shouldOpenInNewTab } = buildVenmoLink({ username, amount, memo });
  // The name is bidi-isolated (FSI…PDI), so a right-to-left name can't pull the amount into its run.
  const label = payeeName ? `Pay \u2068${payeeName}\u2069 ${formatCurrency(amount)}` : `Pay ${formatCurrency(amount)}`;

  return (
    <a
      href={href}
      target={shouldOpenInNewTab ? '_blank' : undefined}
      rel="noopener noreferrer"
      aria-label={`${label} on Venmo`}
      className="flex min-h-12 w-full flex-wrap items-center justify-center gap-x-2 rounded-lg border border-transparent bg-venmo px-4 py-2.5 text-center text-white transition-[filter] duration-200 hover:brightness-95"
    >
      <span className="min-w-0 max-w-full text-[15px] font-medium [overflow-wrap:anywhere]">{label}</span>
      <VenmoWordmark className="text-[15px] text-white" />
    </a>
  );
};
