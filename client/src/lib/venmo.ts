import { VENMO_USERNAME_MAX_LENGTH } from '../constants/config';

/** Matches any character Venmo disallows in a username, for stripping on input. */
const DISALLOWED_PATTERN = /[^A-Za-z0-9_-]/g;

/** A complete, valid username: 1–30 chars of letters, digits, hyphens, or underscores. */
const VALID_PATTERN = /^[A-Za-z0-9_-]{1,30}$/;

/** Store redirects used when the Venmo app isn't installed (deep link never grabs focus). */
const APP_STORE_URL = 'https://apps.apple.com/app/venmo/id351727428';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.venmo';

/** How long to wait for Venmo to take focus before assuming it isn't installed. */
const DEEP_LINK_TIMEOUT_MS = 2000;

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

interface Platform {
  isIOS: boolean;
  isMobile: boolean;
}

/** Detect broad platform from the user agent; iPad/desktop-Safari fall through to the desktop flow by design. */
function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  return { isIOS, isMobile: isIOS || isAndroid };
}

interface VenmoPaymentArgs {
  /** Recipient's sanitized Venmo username (no leading `@`). */
  username: string;
  /** Dollar amount owed; formatted to two decimals in the link. */
  amount: number;
  /** Note/memo text shown on the Venmo payment screen. */
  memo: string;
}

/**
 * Open a prefilled Venmo payment. On mobile, tries the `venmo://` deep link and falls back to the
 * App/Play Store if the app doesn't take focus within the timeout; on desktop, opens `venmo.com` in a new tab.
 * @param args - Recipient handle, amount, and memo
 */
export function openVenmoPayment({ username, amount, memo }: VenmoPaymentArgs): void {
  const recipient = encodeURIComponent(username);
  const amountParam = encodeURIComponent(amount.toFixed(2));
  const note = encodeURIComponent(memo);
  const { isIOS, isMobile } = detectPlatform();

  if (!isMobile) {
    window.open(
      `https://venmo.com/${recipient}?txn=pay&amount=${amountParam}&note=${note}`,
      '_blank',
      'noopener,noreferrer',
    );
    return;
  }

  const deepLink = `venmo://paycharge?txn=pay&recipients=${recipient}&amount=${amountParam}&note=${note}`;
  const fallbackUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL;
  tryDeepLink(deepLink, fallbackUrl);
}

/**
 * Navigate to a deep link, redirecting to a fallback URL if the target app never takes focus.
 * @param deepLink - App URL scheme to attempt
 * @param fallbackUrl - Store URL to open if no focus change is observed within the timeout
 */
function tryDeepLink(deepLink: string, fallbackUrl: string): void {
  let opened = false;
  const onVisibilityChange = () => {
    if (document.hidden) opened = true;
  };
  const onBlur = () => {
    opened = true;
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onBlur);

  window.location.href = deepLink;

  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onBlur);
    if (!opened) window.location.href = fallbackUrl;
  }, DEEP_LINK_TIMEOUT_MS);
}
