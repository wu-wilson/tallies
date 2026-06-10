import { useCallback, useEffect, useRef, useState } from 'react';

import { sanitizeVenmoUsername } from '../lib/venmo';

/** `localStorage` key under which the user's Venmo handle is remembered across bills. */
const STORAGE_KEY = 'tallies:venmoUsername';

/** Delay before persisting a typed handle, so we don't write to storage on every keystroke. */
const WRITE_DEBOUNCE_MS = 400;

/** Read the saved handle, returning a sanitized value (or empty string if absent/unavailable). */
function readStored(): string {
  try {
    return sanitizeVenmoUsername(window.localStorage.getItem(STORAGE_KEY) ?? '');
  } catch {
    return '';
  }
}

/** Persist the handle, swallowing failures (e.g. Safari private mode throws on write). */
function writeStored(value: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable — the handle still works for this session via component state.
  }
}

/**
 * Manage the user's Venmo handle: seeded from `localStorage`, sanitized on every change, and written
 * back on a short debounce so it persists across bills without thrashing storage per keystroke.
 * @returns `{ username, setUsername }` — `username` is always sanitized; `setUsername` takes raw input
 */
export function useVenmoUsername(): { username: string; setUsername: (raw: string) => void } {
  const [username, setUsernameState] = useState<string>(readStored);
  const timerRef = useRef<number | undefined>(undefined);

  const setUsername = useCallback((raw: string) => {
    const clean = sanitizeVenmoUsername(raw);
    setUsernameState(clean);
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => writeStored(clean), WRITE_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return { username, setUsername };
}
