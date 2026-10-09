import type React from 'react';

/**
 * Whether a keydown belongs to an IME composition, whose Enter confirms the composed text rather than the field.
 * Safari reports that closing Enter after the composition ends, as key code 229.
 * @param e - The keydown event
 * @returns True while composing
 */
export function isComposing(e: React.KeyboardEvent): boolean {
  return e.nativeEvent.isComposing || e.keyCode === 229;
}

/**
 * Key handler that commits a field on Enter by blurring it, leaving an IME's own Enter alone. With a mouse it then
 * refocuses the field, since Safari would restart Tab from the top of the page; on touch the blur closes the keyboard.
 * @param e - The field's keydown event
 */
export function commitOnEnter(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (e.key !== 'Enter' || isComposing(e)) return;
  const field = e.currentTarget;
  field.blur();
  if (window.matchMedia('(pointer: fine)').matches) field.focus({ preventScroll: true });
}

/** Elements a Tab can land on, before filtering out disabled, hidden, and tabindex -1 ones. */
const TABBABLE = 'a[href], button, input, select, textarea, [tabindex]';

/**
 * Move focus to the control a Tab (or Shift+Tab) would reach next, for a field that would otherwise step through its
 * own inner stops, like a native date input's month, day, and year.
 * @param from - The element focus is leaving
 * @param isBackwards - True for Shift+Tab
 */
export function focusAdjacent(from: HTMLElement, isBackwards: boolean): void {
  const stops = [...document.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0,
  );
  stops[stops.indexOf(from) + (isBackwards ? -1 : 1)]?.focus();
}

/**
 * Focus handler that selects a field's text so typing replaces it, a frame later so Safari still scrolls the field
 * into view first (selecting during focus stops it).
 * @param e - The field's focus event
 */
export function selectOnFocus(e: React.FocusEvent<HTMLInputElement>): void {
  const field = e.currentTarget;
  requestAnimationFrame(() => field.select());
}
