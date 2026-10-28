import React, { useEffect, useState } from 'react';

import { commitOnEnter, selectOnFocus } from '../common/keys';
import { Segmented } from '../common/Segmented';
import { TOTAL_GRID } from './grid';

import { formatAmount, roundToCents } from '../../lib/billMath';

import { MAX_AMOUNT, MAX_RATE } from '../../constants/config';

interface AmountRowProps {
  /** Row label, "Tax" or "Tip". */
  label: string;
  /** Dollars when `isPercent` is false, a percent of the receipt subtotal when true. */
  value: number;
  isPercent: boolean;
  /** What the row resolves to in dollars, shown in the price column. */
  amount: number;
  onValueChange: (value: number) => void;
  onTogglePercent: (isPercent: boolean) => void;
  /** One-tap percentages (tip). Without them the row shows only the field and its % or $ switch (tax). */
  presets?: number[];
}

/**
 * A tax or tip line in the receipt's ledger, its resolved dollars in the price column. Tax is a field with a % or $
 * switch; tip offers preset percentages plus Custom, which opens the same field and switch.
 * @param props - Row configuration
 * @returns The ledger row
 */
export const AmountRow: React.FC<AmountRowProps> = ({ label, value, isPercent, amount, onValueChange, onTogglePercent, presets }) => {
  // A local draft lets the field type freely; it resyncs when the value changes elsewhere (a preset).
  const [draft, setDraft] = useState(fieldText(value, isPercent));
  useEffect(() => setDraft(fieldText(value, isPercent)), [value, isPercent]);
  // Custom stays open until a preset is picked, so typing a preset's value or switching % and $ never removes the field
  // (and the focus in it).
  const [isCustomOpen, setIsCustomOpen] = useState(() => !(isPercent && (presets?.includes(value) ?? false)));
  const shouldShowField = !presets || isCustomOpen;

  const handlePreset = (pct: number | 'custom') => {
    if (pct === 'custom') {
      setIsCustomOpen(true);
      return;
    }
    setIsCustomOpen(false);
    if (!isPercent) onTogglePercent(true);
    onValueChange(pct);
  };

  const handleBlur = () => {
    const parsed = parseFloat(draft);
    const clean = Number.isFinite(parsed) ? Math.min(Math.max(0, parsed), isPercent ? MAX_RATE : MAX_AMOUNT) : 0;
    // Dollars are kept to the cent, as the field shows them; a rate keeps its decimals (8.875%).
    const next = isPercent ? clean : roundToCents(clean);
    setDraft(fieldText(next, isPercent));
    onValueChange(next);
  };

  return (
    <div className={`${TOTAL_GRID} border-b border-line-soft`}>
      <span className="text-sm text-ink-2 [grid-area:lab]">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-2 [grid-area:ctl]">
        {presets && (
          <Segmented
            label={`${label} presets`}
            options={[...presets.map((p) => ({ value: p, label: `${p}%` })), { value: 'custom' as const, label: 'Custom' }]}
            value={shouldShowField ? 'custom' : value}
            onChange={handlePreset}
          />
        )}
        {shouldShowField && (
          // One unit, so the % or $ switch never wraps away from its field.
          <div className="flex items-center gap-2">
            <span className="field flex h-[34px] w-24 items-center px-2.5 text-sm">
              {!isPercent && <span className="mr-0.5 text-ink-3">$</span>}
              <input
                type="number"
                inputMode="decimal"
                step={isPercent ? '1' : '0.01'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={selectOnFocus}
                onBlur={handleBlur}
                // Chrome steps a focused number field on wheel; blurring first commits what was typed and lets the
                // page scroll.
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={commitOnEnter}
                aria-label={`${label} ${isPercent ? 'percent' : 'amount'}`}
                className="w-full min-w-0 self-stretch bg-transparent text-right"
              />
              {isPercent && <span className="ml-0.5 text-ink-3">%</span>}
            </span>
            <Segmented
              label={`${label} as a percent or an amount`}
              options={[
                { value: 'percent', label: '%' },
                { value: 'dollars', label: '$' },
              ]}
              value={isPercent ? 'percent' : 'dollars'}
              onChange={(v) => {
                // A rate turned into dollars is kept to the cent, like any dollar amount, and dollars turned into a rate
                // stay within the rate cap.
                onValueChange(v === 'dollars' ? roundToCents(value) : Math.min(value, MAX_RATE));
                onTogglePercent(v === 'percent');
              }}
            />
          </div>
        )}
      </div>
      <span className="text-right text-[15px] [grid-area:amt]">{formatAmount(amount)}</span>
    </div>
  );
};

/** The field's text for a value: dollars to the cent, a rate as entered. */
function fieldText(value: number, isPercent: boolean): string {
  return isPercent ? String(value) : formatAmount(value);
}
