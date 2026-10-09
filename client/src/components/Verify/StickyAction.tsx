import React from 'react';

import { ReviewButton } from './ReviewButton';

import { useVerifyStatus } from '../../hooks/useVerifyStatus';

import { formatCurrency } from '../../lib/billMath';

/**
 * Phone and tablet bottom bar for Verify: the running total, what still blocks the split, and the review button.
 * Hidden on `lg+`, where the summary card carries the button instead.
 * @returns The sticky bar
 */
export const StickyAction: React.FC = () => {
  const { isReady, message, total } = useVerifyStatus();

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-surface px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-medium tracking-[-0.03em]">{formatCurrency(total)}</div>
          <div role="status" className={`text-[12.5px] leading-snug ${isReady ? 'text-settled' : 'text-ink-3'}`}>
            {message}
          </div>
        </div>
        <ReviewButton variant="bar" />
      </div>
    </div>
  );
};
