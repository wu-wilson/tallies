import React from 'react';

import { Lockup } from './Lockup';

/**
 * Top bar with only the logo lockup, shared by the landing page, the not-found screen, and the shared bill's
 * load-error screen. Its content sits in the same 1200px column as the landing sections.
 * @returns The brand bar
 */
export const BrandBar: React.FC = () => (
  <header className="border-b border-line bg-surface px-5 pt-[env(safe-area-inset-top)] sm:px-6">
    <div className="mx-auto flex h-16 max-w-[1200px] items-center">
      <Lockup />
    </div>
  </header>
);
