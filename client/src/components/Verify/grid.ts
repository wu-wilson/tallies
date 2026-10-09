/**
 * Item-row grid: name, people, price, and remove in one row from `sm` (people wrap under the name on phones). It
 * shares its price and remove columns with `HEAD_GRID` and `TOTAL_GRID`, so every amount lines up.
 */
export const ITEM_GRID =
  "grid items-center gap-x-3 gap-y-0.5 py-2.5 pl-5 pr-2 grid-cols-[minmax(0,1fr)_84px_32px] [grid-template-areas:'name_price_del'_'who_who_who'] sm:min-h-[52px] sm:grid-cols-[minmax(0,1fr)_200px_96px_32px] sm:py-0 sm:pr-3 sm:[grid-template-areas:'name_who_price_del']";

/** Column heads over the item rows, shown from `sm` up. */
export const HEAD_GRID =
  'hidden h-[34px] items-center gap-x-3 border-b border-line-soft pl-5 pr-3 text-xs font-medium text-ink-3 sm:grid sm:grid-cols-[minmax(0,1fr)_200px_96px_32px]';

/** Subtotal, tax, tip, and total rows: label, controls, then the amount in the price column. */
export const TOTAL_GRID =
  "grid items-center gap-x-3 gap-y-2 py-3 pl-5 pr-2 grid-cols-[minmax(0,1fr)_84px_32px] [grid-template-areas:'lab_amt_.'_'ctl_ctl_ctl'] sm:min-h-[52px] sm:grid-cols-[64px_minmax(0,1fr)_96px_32px] sm:py-2 sm:pr-3 sm:[grid-template-areas:'lab_ctl_amt_.']";
