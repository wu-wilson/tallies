interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  /** The selected option's value. */
  value: T;
  onChange: (value: T) => void;
  /** Names the group for screen readers. */
  label: string;
}

/**
 * Segmented control: options on a grey track, the selected one raised on white.
 * @param props - Options, the selected value, a change handler, and the group's accessible name
 * @returns The control
 */
export const Segmented = <T extends string | number>({ options, value, onChange, label }: SegmentedProps<T>) => (
  <div role="group" aria-label={label} className="inline-flex flex-wrap gap-0.5 rounded-lg bg-line-soft p-[3px]">
    {options.map((option) => {
      const isOn = option.value === value;
      return (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={isOn}
          onClick={() => onChange(option.value)}
          className={`h-7 min-w-7 rounded-md px-2 text-[13px] sm:px-2.5 transition-colors duration-200 ${
            isOn ? 'bg-surface font-semibold text-ink shadow-segment forced-colors:underline' : 'font-medium text-ink-2 hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
