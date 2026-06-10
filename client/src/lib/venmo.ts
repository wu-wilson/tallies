import { VENMO_USERNAME_MAX_LENGTH } from '../constants/config';

/** Matches any character Venmo disallows in a username, for stripping on input. */
const DISALLOWED_PATTERN = /[^A-Za-z0-9_-]/g;

/** A complete, valid username: 1–30 chars of letters, digits, hyphens, or underscores. */
const VALID_PATTERN = /^[A-Za-z0-9_-]{1,30}$/;

/**
 * Strip any character Venmo disallows (including `@` and whitespace) and clamp to the max length.
 * @param raw - Text straight from the input field
 * @returns Sanitized handle; empty if `raw` held no valid characters
 */
export function sanitizeVenmoUsername(raw: string): string {
  return raw.replace(DISALLOWED_PATTERN, '').slice(0, VENMO_USERNAME_MAX_LENGTH);
}

/**
 * Whether a (typically already-sanitized) handle is complete enough to build a payment link.
 * @param username - Candidate handle
 * @returns `true` when it is 1–30 chars of allowed characters, `false` otherwise (including empty)
 */
export function isValidVenmoUsername(username: string): boolean {
  return VALID_PATTERN.test(username);
}

interface VenmoPaymentParams {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** Dollar amount owed; formatted to two decimals in the link. */
  amount: number;
  /** Note/memo shown on the Venmo payment screen. */
  memo: string;
}

/**
 * Build the prefilled Venmo payment URL — a universal/app link that opens the Venmo app when installed
 * and the web payment page otherwise. Most reliable when navigated via a tapped `<a>`, not JS.
 * @param params - Recipient handle, amount, and memo
 * @returns An `https://account.venmo.com/...` URL with encoded `txn`/`amount`/`note` params
 */
export function buildVenmoPaymentUrl({ username, amount, memo }: VenmoPaymentParams): string {
  const recipient = encodeURIComponent(username);
  const amountParam = encodeURIComponent(amount.toFixed(2));
  const note = encodeURIComponent(memo);
  return `https://account.venmo.com/u/${recipient}?txn=pay&amount=${amountParam}&note=${note}`;
}

/** Whether the user agent looks like a mobile browser; iPad/desktop-Safari report as desktop here by design. */
export function isMobileDevice(): boolean {
  return /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
}
