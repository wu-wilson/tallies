import React from 'react';

import { Icon } from './Icon';
import { Lockup } from './Lockup';

/** A step of the bill flow, as shown in the app bar. */
export type FlowStep = 'receipts' | 'assign' | 'share';

const STEPS: { key: FlowStep; label: string }[] = [
  { key: 'receipts', label: 'Receipts' },
  { key: 'assign', label: 'Assign' },
  { key: 'share', label: 'Share' },
];

interface AppBarProps {
  /** The current step, shown as progress on the right; omit to show no progress. */
  step?: FlowStep;
  /** Content for the right edge in place of the progress, such as the shared view's link to Tallies. */
  action?: React.ReactNode;
}

/**
 * White top bar for the app screens: the lockup on the left and, on the right, either the flow's progress
 * (Receipts, Assign, Share, with finished steps ticked) or a custom action. Phones show "Step n of 3" instead.
 * @param props - The current step, or an action for the right edge
 * @returns The app bar
 */
export const AppBar: React.FC<AppBarProps> = ({ step, action }) => {
  const current = STEPS.findIndex((s) => s.key === step);

  return (
    <header className="border-b border-line bg-surface px-5 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4">
        <Lockup size="sm" />
        {action}
        {step && (
          <>
            <ol aria-label="Progress" className="hidden items-center gap-3 text-[13px] sm:flex">
              {STEPS.map((s, i) => (
                <li key={s.key} className="flex items-center gap-3">
                  {i > 0 && <Icon name="chevron-right" size={12} className="text-ink-5" />}
                  <span
                    aria-current={i === current ? 'step' : undefined}
                    className={`flex items-center gap-1.5 ${
                      i === current ? 'font-semibold text-ink' : i < current ? 'text-ink-2' : 'text-ink-3'
                    }`}
                  >
                    {i < current && <Icon name="check" size={14} className="text-settled" />}
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
            <span className="text-[13px] text-ink-3 sm:hidden">
              Step {current + 1} of {STEPS.length}
            </span>
          </>
        )}
      </div>
    </header>
  );
};
