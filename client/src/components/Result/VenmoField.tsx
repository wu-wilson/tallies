import React from 'react';

interface VenmoFieldProps {
  /** Whose handle this is, for the label ("Alex's Venmo"); "Your Venmo" when nobody has been chosen. */
  ownerName?: string;
  /** Current sanitized username. */
  value: string;
  /** Called with raw input on every change; the parent sanitizes via `useVenmoUsername`. */
  onChange: (raw: string) => void;
}

/**
 * Optional field for the payer's Venmo handle. When it is set, the shared bill gives anyone who owes the payer a
 * button that pays their exact share.
 * @param props - The owner's name, the current value, and the raw-input change handler
 * @returns The labelled field
 */
export const VenmoField: React.FC<VenmoFieldProps> = ({ ownerName, value, onChange }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor="venmo-handle" className="min-w-0 text-sm font-medium">
        {ownerName ? `${ownerName}'s Venmo` : 'Your Venmo'}
      </label>
      <span className="shrink-0 text-[12.5px] text-ink-3">Optional</span>
    </div>
    <div className="field mt-2 flex h-[46px] items-center px-3">
      <span className="text-[15px] text-ink-3">@</span>
      <input
        id="venmo-handle"
        name="venmo-handle"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="jane-smith"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        data-bwignore
        data-form-type="other"
        className="ml-0.5 min-w-0 flex-1 self-stretch bg-transparent text-[15px] placeholder:text-ink-3"
      />
    </div>
    <p className="mt-2 text-[13px] text-ink-3 [text-wrap:pretty]">
      Friends get a button that pays {ownerName ?? 'you'} their exact share.
    </p>
  </div>
);
