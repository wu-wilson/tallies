import React from 'react';

import { PrimaryCta } from './PrimaryCta';

/**
 * Mobile-only sticky-bottom wrapper around `PrimaryCta` — hidden on `lg+` where the CTA lives inline at the end of the column.
 * @returns Sticky container hidden on desktop
 */
export const StickyAction: React.FC = () => {
  return (
    <div className="sticky bottom-0 z-30 -mx-6 mt-8 bg-bg-primary px-6 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <PrimaryCta />
    </div>
  );
};
