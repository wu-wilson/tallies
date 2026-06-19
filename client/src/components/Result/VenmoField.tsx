import React from 'react';

import { VenmoWordmark } from './VenmoWordmark';

import { VENMO_USERNAME_MAX_LENGTH } from '../../constants/config';

interface VenmoFieldProps {
  /** Current sanitized username value. */
  value: string;
  /** Called with raw input on every change; the parent sanitizes via `useVenmoUsername`. */
  onChange: (raw: string) => void;
}

/**
 * Optional input for the bill owner's Venmo handle; when set it travels with the shared bill so recipients
 * get a per-person pay button.
 * @param props - Current value and raw-input change handler
 * @returns A labeled field with an ink `@` prefix block and an `OPTIONAL` badge
 */
export const VenmoField: React.FC<VenmoFieldProps> = ({ value, onChange }) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-extrabold tracking-tight">
          Your <VenmoWordmark /> handle
        </span>
        <span className="border border-ink-faint px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.06em] text-ink-faint">
          OPTIONAL
        </span>
      </div>

      <div className="flex items-stretch border border-ink bg-paper-raised focus-within:border-brand">
        <span className="flex items-center bg-ink px-3.5 font-mono text-base font-bold text-brand-on">@</span>
        <input
          id="venmo-handle"
          name="venmo-handle"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={VENMO_USERNAME_MAX_LENGTH}
          placeholder="jane-smith"
          aria-label="Venmo username"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          className="flex-1 bg-transparent px-3.5 py-3 text-base font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink-ghost"
        />
      </div>

      <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-ink-faint">
        Add it and friends get a Pay button on Venmo. Skip it and they'll just see what they owe.
      </p>
    </div>
  );
};
