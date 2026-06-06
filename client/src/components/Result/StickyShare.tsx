import React from 'react';

import { ShareCta } from './ShareCta';

interface StickyShareProps {
  onShare: () => void;
  isSharing: boolean;
  hasShared: boolean;
}

/**
 * Mobile-only sticky-bottom wrapper around `ShareCta` — hidden on `lg+` where the share button lives inline at the end of the column.
 * @param props - Forwarded to `ShareCta`
 * @returns Sticky container hidden on desktop
 */
export const StickyShare: React.FC<StickyShareProps> = ({ onShare, isSharing, hasShared }) => {
  return (
    <div className="sticky bottom-0 z-30 -mx-6 mt-8 bg-bg-primary px-6 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <ShareCta onShare={onShare} isSharing={isSharing} hasShared={hasShared} />
    </div>
  );
};
