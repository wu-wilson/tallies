import React from 'react';

import { TallyLogo } from './TallyLogo';

const SIZES = {
  sm: { mark: 20, text: 'text-[16.5px]' },
  md: { mark: 22, text: 'text-lg' },
} as const;

interface LockupProps {
  /**
   * `md` for the brand bar (landing, not-found, load error), `sm` for the app bar and the landing footer. Defaults
   * to `md`.
   */
  size?: 'sm' | 'md';
}

/**
 * The mark beside the "Tallies" wordmark, as it appears in every top bar.
 * @param props - Lockup size
 * @returns The logo lockup
 */
export const Lockup: React.FC<LockupProps> = ({ size = 'md' }) => (
  <span className="flex items-center gap-2.5">
    <TallyLogo size={SIZES[size].mark} />
    <span className={`${SIZES[size].text} font-medium tracking-[-0.035em]`}>Tallies</span>
  </span>
);
