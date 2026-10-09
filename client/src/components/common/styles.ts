/** Ink primary button: the one main action on a screen. Size it with `h-*`/`px-*` at the call site. */
export const BUTTON_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-ink font-medium text-white transition-colors duration-200 hover:bg-ink/85 aria-disabled:hover:bg-ink disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-3';

/** Outlined secondary button on white. */
export const BUTTON_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface font-medium text-ink transition-colors duration-200 hover:bg-wash aria-disabled:hover:bg-surface';

/** Borderless text button for quiet actions (Add item, Add person). */
export const BUTTON_GHOST =
  'inline-flex items-center gap-2 rounded-lg font-medium text-ink-2 transition-colors duration-200 hover:bg-wash hover:text-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-2';

/** Fixed-size icon-only remove control (×, trash) that warms to red on hover. Pair it with an `aria-label`. */
export const BUTTON_REMOVE =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-4 transition-colors duration-200 hover:bg-error-wash hover:text-error focus-visible:outline-offset-[-2px]';

/** White card with a hairline border and a faint shadow. */
export const CARD = 'rounded-xl border border-line bg-surface shadow-card';

/** Card heading row label. */
export const CARD_TITLE = 'text-sm font-medium';

/** Muted text link that darkens on hover. */
export const LINK_MUTED = 'font-medium text-ink-3 transition-colors duration-200 hover:text-ink';
