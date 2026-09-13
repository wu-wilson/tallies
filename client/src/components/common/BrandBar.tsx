import React from 'react';

import { TallyLogo } from './TallyLogo';

/**
 * Full-width top bar with the logo lockup, shared by the marketing page and the not-found screen. Its content
 * sits in the same centered column the marketing sections use.
 * @returns The brand nav bar
 */
export const BrandBar: React.FC = () => (
  <nav className="border-b border-ink bg-paper px-5 py-4 sm:px-10">
    <div className="mx-auto flex max-w-3xl items-center gap-3">
      <TallyLogo size={22} />
      <span className="text-xl font-black tracking-tight sm:text-[22px]">TALLIES</span>
    </div>
  </nav>
);
