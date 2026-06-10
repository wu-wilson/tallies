import { VENMO_USERNAME_MAX_LENGTH } from '../constants/config';

/** Matches any character Venmo disallows in a username, for stripping on input. */
const DISALLOWED_PATTERN = /[^A-Za-z0-9_-]/g;

/** A complete, valid username: 1–30 chars of letters, digits, hyphens, or underscores. */
const VALID_PATTERN = /^[A-Za-z0-9_-]{1,30}$/;

/** Play Store listing, used as the Android `intent://` fallback when the Venmo app isn't installed. */
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.venmo';

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

/** Broad platform buckets; iPad/desktop-Safari report as `desktop` here by design. */
type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
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
  /** True for the desktop web page (new tab); false for the mobile app hand-offs (same tab). */
  openInNewTab: boolean;
}

/**
 * Build the platform-specific pay link for a tapped `<a>`: the `venmo://` app scheme on iOS, an
 * `intent://` link on Android (opens the app, else falls back to the Play Store), and the
 * `account.venmo.com` web page on desktop.
 * @param params - Recipient handle, amount, and memo
 * @returns The `href` and whether to open it in a new tab
 */
export function buildVenmoLink({ username, amount, memo }: VenmoPaymentParams): VenmoLink {
  const recipient = encodeURIComponent(username);
  const amountParam = encodeURIComponent(amount.toFixed(2));
  const note = encodeURIComponent(memo);
  const query = `recipients=${recipient}&txn=pay&amount=${amountParam}&note=${note}`;

  switch (detectPlatform()) {
    case 'ios':
      // Opens the app when installed; iOS shows an "address invalid" alert if it isn't (no clean fallback).
      return { href: `venmo://paycharge?${query}`, openInNewTab: false };
    case 'android': {
      // Chrome opens the app, or natively navigates to browser_fallback_url (the Play Store) when it isn't installed.
      const fallback = encodeURIComponent(PLAY_STORE_URL);
      return {
        href: `intent://paycharge?${query}#Intent;scheme=venmo;package=com.venmo;S.browser_fallback_url=${fallback};end`,
        openInNewTab: false,
      };
    }
    default:
      return {
        href: `https://account.venmo.com/u/${recipient}?txn=pay&amount=${amountParam}&note=${note}`,
        openInNewTab: true,
      };
  }
}
