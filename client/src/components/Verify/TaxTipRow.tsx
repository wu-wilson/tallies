import React, { useState } from 'react';
import clsx from 'clsx';

interface TaxTipRowProps {
  /** Row label like `"Tax"` or `"Tip"`. */
  label: string;
  /** Current amount — dollars when `isPercent` is false, percent when true. */
  value: number;
  /** True when `value` is interpreted as a percent of the items subtotal. */
  isPercent: boolean;
  onValueChange: (value: number) => void;
  onTogglePercent: (isPercent: boolean) => void;
  /** Optional preset percentages (e.g. `[15, 18, 20, 22]`); only rendered when `isPercent` is true. */
  quickButtons?: number[];
}

/**
 * Editable tax or tip amount with a $/% segmented toggle and optional preset percentages.
 * @param props - Row configuration
 * @returns Row with label, editable value, $/% toggle, and (for tip) preset percentages below
 */
export const TaxTipRow: React.FC<TaxTipRowProps> = ({
  label,
  value,
  isPercent,
  onValueChange,
  onTogglePercent,
  quickButtons,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(editValue);
    onValueChange(isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  return (
    <div className="px-3.5 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-bold">{label}</span>

        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-0.5 font-mono text-sm font-bold tabular-nums">
            {!isPercent && <span className="text-ink-faint">$</span>}
            {isEditing ? (
              <input
                type="number"
                inputMode="decimal"
                step={isPercent ? '1' : '0.01'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                className="w-16 border border-transparent bg-sand-2 px-2 py-1 text-right text-ink outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setEditValue(value.toString());
                  setIsEditing(true);
                }}
                className="px-1 transition-[filter] hover:text-brand"
              >
                {isPercent ? value : value.toFixed(2)}
              </button>
            )}
            {isPercent && <span className="text-ink-faint">%</span>}
          </div>

          <div className="flex border border-ink">
            <button
              type="button"
              onClick={() => onTogglePercent(false)}
              className={clsx(
                'w-8 py-1 text-[11px] font-extrabold transition-colors',
                !isPercent ? 'bg-brand text-brand-on' : 'text-ink-faint hover:text-ink',
              )}
            >
              $
            </button>
            <button
              type="button"
              onClick={() => onTogglePercent(true)}
              className={clsx(
                'w-8 border-l border-ink py-1 text-[11px] font-extrabold transition-colors',
                isPercent ? 'bg-brand text-brand-on' : 'text-ink-faint hover:text-ink',
              )}
            >
              %
            </button>
          </div>
        </div>
      </div>

      {quickButtons && isPercent && (
        <div className="mt-2.5 flex gap-4 font-mono text-xs font-bold">
          {quickButtons.map((pct) => (
            <button
              key={pct}
              onClick={() => onValueChange(pct)}
              className={clsx(
                'transition-colors',
                value === pct ? 'text-brand' : 'text-ink-ghost hover:text-ink-faint',
              )}
            >
              {pct}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
