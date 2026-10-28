import React from 'react';

import { Icon } from '../common/Icon';
import { BUTTON_PRIMARY } from '../common/styles';

import { useVerifyStatus } from '../../hooks/useVerifyStatus';
import { useBillStore } from '../../store/billStore';

interface ReviewButtonProps {
  /** `rail` adds the status line under a full-width button; `bar` is the compact button in the phone bar. */
  variant: 'rail' | 'bar';
}

/**
 * "Review the split", enabled once every receipt has an item, the bill has at least two people, and someone is on every
 * item. The rail variant explains what is still missing.
 * @param props - Which placement to render
 * @returns The button, with a status line in the rail
 */
export const ReviewButton: React.FC<ReviewButtonProps> = ({ variant }) => {
  const setScreen = useBillStore((s) => s.setScreen);
  const { isReady, message } = useVerifyStatus();

  const button = (
    <button
      type="button"
      onClick={() => setScreen('result')}
      disabled={!isReady}
      className={`h-[46px] text-[15px] ${variant === 'rail' ? 'w-full' : 'min-w-0 max-w-[60%] px-5 text-center'} ${BUTTON_PRIMARY}`}
    >
      Review the split
    </button>
  );

  if (variant === 'bar') return button;
  return (
    <div>
      {button}
      <p role="status" className={`mt-2.5 flex items-center justify-center gap-1.5 text-[13px] ${isReady ? 'text-settled' : 'text-ink-3'}`}>
        <Icon name={isReady ? 'check' : 'alert'} size={14} />
        <span>{message}</span>
      </p>
    </div>
  );
};
