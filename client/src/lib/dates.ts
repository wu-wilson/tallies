const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Today's date in the user's own time zone, as `YYYY-MM-DD`.
 * @returns The local calendar date (an evening in the US stays on today, unlike `toISOString`)
 */
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Format a date for display, e.g. "Oct 3, 2026".
 * @param date - Any valid date
 * @returns The short US-style date
 */
export function formatDate(date: Date): string {
  return DATE_FORMATTER.format(date);
}

/**
 * Format a receipt's `YYYY-MM-DD` date for display, read as a local calendar date.
 * @param iso - The stored date
 * @returns e.g. "Oct 3, 2026", or null when the input isn't a real `YYYY-MM-DD` date (such as Feb 31)
 */
export function formatReceiptDate(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isReal ? formatDate(date) : null;
}
