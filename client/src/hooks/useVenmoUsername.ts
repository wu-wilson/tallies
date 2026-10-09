import { useCallback, useEffect, useRef, useState } from 'react';

import { sanitizeVenmoUsername } from '../lib/venmo';

/** `localStorage` key for remembered handles, keyed by lowercased payer name ('' while no payer is chosen). */
const STORAGE_KEY = 'tallies:venmoHandles';

/** Delay before persisting a typed handle, so we don't write to storage on every keystroke. */
const WRITE_DEBOUNCE_MS = 400;

/**
 * Read every remembered handle, or an empty map if storage is unavailable or holds something else. A `Map`, so a
 * payer named like an object built-in ("constructor") finds nothing rather than an inherited member.
 */
function readAll(): Map<string, string> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object') return new Map();
    return new Map(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch {
    return new Map();
  }
}

/** The remembered handle for one owner, sanitized (empty when none). */
function readHandle(ownerKey: string): string {
  return sanitizeVenmoUsername(readAll().get(ownerKey) ?? '');
}

/** Remember one owner's handle, swallowing failures (e.g. Safari private mode throws on write). */
function writeHandle(ownerKey: string, value: string): void {
  try {
    const all = readAll().set(ownerKey, value);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(all)));
  } catch {
    // Storage unavailable — the handle still works for this session via component state.
  }
}

/**
 * Manage the payer's Venmo handle, remembered per payer name so choosing a different payer never prefills someone
 * else's account. Input is sanitized on every change and written back on a short debounce.
 * @param ownerName - Name of the payer the handle belongs to; omit while nobody has been chosen
 * @returns `{ username, setUsername }` — `username` is always sanitized; `setUsername` takes raw input
 */
export function useVenmoUsername(ownerName?: string): { username: string; setUsername: (raw: string) => void } {
  const ownerKey = ownerName?.trim().toLowerCase() ?? '';
  const [username, setUsernameState] = useState(() => readHandle(ownerKey));
  const timerRef = useRef<number | undefined>(undefined);
  // The write awaiting its debounce, so switching payer or unmounting flushes it instead of dropping it.
  const pendingRef = useRef<{ ownerKey: string; value: string } | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    if (pendingRef.current) writeHandle(pendingRef.current.ownerKey, pendingRef.current.value);
    pendingRef.current = null;
  }, []);

  // A handle typed while no payer was chosen, handed to the payer picked next if they have none saved. Remembered
  // handles never carry over, so nobody inherits someone else's.
  const typedForNobodyRef = useRef<string | null>(null);

  // Switching payer shows that payer's remembered handle, else the handle typed while nobody was chosen, else an
  // empty field.
  const prevKeyRef = useRef(ownerKey);
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey === ownerKey) return;
    prevKeyRef.current = ownerKey;
    flush();
    const saved = readHandle(ownerKey);
    const carried = prevKey === '' && !saved ? typedForNobodyRef.current : null;
    typedForNobodyRef.current = null;
    if (carried) writeHandle(ownerKey, carried);
    setUsernameState(saved || carried || '');
  }, [ownerKey, flush]);

  useEffect(() => flush, [flush]);

  const setUsername = useCallback(
    (raw: string) => {
      const clean = sanitizeVenmoUsername(raw);
      setUsernameState(clean);
      if (!ownerKey) typedForNobodyRef.current = clean;
      pendingRef.current = { ownerKey, value: clean };
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, WRITE_DEBOUNCE_MS);
    },
    [ownerKey, flush],
  );

  return { username, setUsername };
}
