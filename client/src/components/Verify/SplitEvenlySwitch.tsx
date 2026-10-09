import React, { useMemo } from 'react';

import { useBillStore } from '../../store/billStore';

import type { Receipt } from '../../types/bill';

interface SplitEvenlySwitchProps {
  /** Receipt this switch applies to. */
  receipt: Receipt;
}

/**
 * Receipt-level switch that puts everyone on every item of the receipt, or clears them all when it is already on.
 * Its state is read back from the items, so it stays true to manual edits.
 * @param props - The receipt the switch controls
 * @returns The labelled switch
 */
export const SplitEvenlySwitch: React.FC<SplitEvenlySwitchProps> = ({ receipt }) => {
  const people = useBillStore((s) => s.people);
  const splitReceiptEvenly = useBillStore((s) => s.splitReceiptEvenly);
  const unsplitReceiptEvenly = useBillStore((s) => s.unsplitReceiptEvenly);
  const { items } = receipt;
  const isDisabled = people.length === 0 || items.length === 0;

  const isOn = useMemo(() => {
    if (isDisabled) return false;
    const ids = new Set(people.map((p) => p.id));
    return items.every((item) => item.assignees.length === ids.size && item.assignees.every((id) => ids.has(id)));
  }, [isDisabled, items, people]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => (isOn ? unsplitReceiptEvenly(receipt.id) : splitReceiptEvenly(receipt.id))}
      disabled={isDisabled}
      className="flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-ink-2 transition-colors duration-200 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      Split evenly
      {/* Off, an ink-4 edge and knob give the switch 3:1 contrast; on, it's solid green. The outline (transparent
          when on) and the CanvasText knob also keep it drawn in forced-colors mode, which drops backgrounds. */}
      <span
        className={`flex h-5 w-[34px] items-center rounded-full p-0.5 outline outline-1 transition-colors duration-200 ${
          isOn ? 'bg-settled outline-transparent' : 'bg-surface outline-ink-4'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full shadow-card transition-[transform,background-color] duration-200 forced-colors:bg-[color:CanvasText] forced-colors:[forced-color-adjust:none] ${
            isOn ? 'translate-x-3.5 bg-white' : 'bg-ink-4'
          }`}
        />
      </span>
    </button>
  );
};
