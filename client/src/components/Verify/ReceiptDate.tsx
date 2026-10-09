import React from 'react';

import { focusAdjacent } from '../common/keys';

import { formatReceiptDate } from '../../lib/dates';

interface ReceiptDateProps {
  /** `YYYY-MM-DD`, or empty when the receipt has no date. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * A receipt's date as quiet text over an invisible native date input, so a tap opens the system picker on phones and
 * screen readers reach a real date field. On desktop it's one tab stop; a click, Enter, or Space opens the calendar.
 * @param props - The date and its change handler
 * @returns The date control
 */
export const ReceiptDate: React.FC<ReceiptDateProps> = ({ value, onChange }) => {
  const label = formatReceiptDate(value);
  const openPicker = (e: React.SyntheticEvent<HTMLInputElement>) => e.currentTarget.showPicker?.();

  return (
    <span className="relative -my-0.5 flex h-6 items-center rounded transition-colors duration-200 hover:text-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
      <span aria-hidden="true">{label ?? 'Add a date'}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        onKeyDown={(e) => {
          // One stop: Tab leaves instead of visiting the hidden month, day, and year, and no key edits a date nobody
          // can see. Enter or Space opens the calendar.
          if (e.key === 'Escape') return;
          e.preventDefault();
          if (e.key === 'Tab') focusAdjacent(e.currentTarget, e.shiftKey);
          else if (e.key === 'Enter' || e.key === ' ') openPicker(e);
        }}
        aria-label={label ? `Receipt date, ${label}` : 'Add a date'}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </span>
  );
};
