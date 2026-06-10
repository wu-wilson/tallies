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

/** Whether the user agent looks like a mobile browser; iPad/desktop-Safari report as desktop here by design. */
function isMobileDevice(): boolean {
  return /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
}

interface VenmoPaymentParams {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** Dollar amount owed; formatted to two decimals in the link. */
  amount: number;
  /** Note/memo shown on the Venmo payment screen. */
  memo: string;
}

/** A pay-anchor target: the URL plus whether it should open in a new tab. */
interface VenmoLink {
  href: string;
  /** True on desktop (new tab); false on mobile so the OS can route the universal link to the app. */
  openInNewTab: boolean;
}

/**
 * Build the prefilled Venmo payment link for a tapped `<a>` — a `venmo.com` universal/app link that
 * opens the Venmo app when installed and the web page otherwise.
 * @param params - Recipient handle, amount, and memo
 * @returns The `href` and whether to open it in a new tab (desktop only)
 */
export function buildVenmoLink({ username, amount, memo }: VenmoPaymentParams): VenmoLink {
  const recipient = encodeURIComponent(username);
  const amountParam = encodeURIComponent(amount.toFixed(2));
  const note = encodeURIComponent(memo);
  const href = `https://venmo.com/${recipient}?txn=pay&amount=${amountParam}&note=${note}`;
  return { href, openInNewTab: !isMobileDevice() };
}
