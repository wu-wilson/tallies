import React from 'react';

import { VENMO_USERNAME_MAX_LENGTH } from '../../constants/config';

interface VenmoFieldProps {
  /** Current sanitized username value. */
  value: string;
  /** Called with raw input on every change; the parent sanitizes via `useVenmoUsername`. */
  onChange: (raw: string) => void;
}

/**
 * Optional input for the bill owner's Venmo handle; when set it travels with the shared bill so recipients get a pay button.
 * @param props - Current value and raw-input change handler
 * @returns A labeled input row
 */
export const VenmoField: React.FC<VenmoFieldProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="venmo-handle" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
        Venmo <span className="font-normal normal-case tracking-normal">optional</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-text-tertiary">@</span>
        <input
          id="venmo-handle"
          name="venmo-handle"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={VENMO_USERNAME_MAX_LENGTH}
          placeholder="e.g. jane-smith"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          className="h-10 w-full rounded-lg border border-border bg-bg-secondary pl-7 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>
      <p className="mt-1.5 text-xs text-text-tertiary">So everyone can pay you back.</p>
    </div>
  );
};
