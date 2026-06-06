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
 * @returns Two-line row (value + toggle on top, quick buttons below when applicable)
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
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">{label}</span>

        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-0.5 font-mono text-sm tabular-nums">
            {!isPercent && <span className="text-text-tertiary">$</span>}
            {isEditing ? (
              <input
                type="number"
                inputMode="decimal"
                step={isPercent ? '1' : '0.01'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                className="w-16 rounded bg-transparent px-2 text-right text-text-primary outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setEditValue(value.toString());
                  setIsEditing(true);
                }}
                className="rounded px-2 text-text-primary transition-colors hover:text-brand"
              >
                {isPercent ? value : value.toFixed(2)}
              </button>
            )}
            {isPercent && <span className="text-text-tertiary">%</span>}
          </div>

          <div className="relative flex h-6 overflow-hidden rounded bg-bg-primary">
            {/* Sliding indicator — pure CSS transform, no Framer Motion */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-6 rounded bg-bg-tertiary transition-transform duration-150 ease-out"
              style={{ transform: isPercent ? 'translateX(100%)' : 'translateX(0)' }}
            />
            <button
              type="button"
              onClick={() => onTogglePercent(false)}
              className={clsx(
                'relative w-6 text-[11px] font-medium transition-colors',
                !isPercent ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              $
            </button>
            <button
              type="button"
              onClick={() => onTogglePercent(true)}
              className={clsx(
                'relative w-6 text-[11px] font-medium transition-colors',
                isPercent ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              %
            </button>
          </div>
        </div>
      </div>

      {quickButtons && isPercent && (
        <div className="flex gap-3">
          {quickButtons.map((pct) => (
            <button
              key={pct}
              onClick={() => onValueChange(pct)}
              className={clsx(
                'text-[11px] font-medium transition-colors',
                value === pct ? 'text-brand' : 'text-text-tertiary hover:text-text-secondary',
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
