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
 * @returns A card with the Venmo wordmark, an `@`-prefixed input, and a helper line
 */
export const VenmoField: React.FC<VenmoFieldProps> = ({ value, onChange }) => {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <VenmoWordmark width={48} height={12} className="text-venmo" />
        <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Optional
        </span>
      </div>

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
          aria-label="Venmo username"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          className="h-10 w-full rounded-lg border border-border bg-bg-tertiary pl-7 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>

      <p className="mt-2 text-xs text-text-tertiary">Add your handle so the group can pay you back.</p>
    </div>
  );
};
