import { useEffect, useLayoutEffect, useRef } from 'react';

import type { RefObject } from 'react';

/**
 * Make an open dialog modal: the page behind it goes inert and stops scrolling, focus moves in and Tab wraps between
 * its buttons, Escape closes it, and focus returns to the control that opened it.
 * @param isOpen - Whether the dialog is showing
 * @param dialogRef - The dialog's element, portaled outside `#root`
 * @param onClose - Called on Escape
 * @param returnFocusRef - The control focused again on close (Safari doesn't focus a button when it's tapped)
 */
export function useModal(
  isOpen: boolean,
  dialogRef: RefObject<HTMLElement>,
  onClose: () => void,
  returnFocusRef: RefObject<HTMLElement>,
): void {
  // The caller passes a fresh closure each render; a ref keeps the effect below from re-running (and refocusing).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Make the app behind the dialog inert, so neither Tab nor a screen reader can reach it. A layout effect, so leaving
  // the screen with the dialog open clears it before the next screen focuses its heading.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const app = document.getElementById('root');
    if (app) app.inert = true;
    return () => {
      if (app) app.inert = false;
    };
  }, [isOpen]);

  // Move focus into the dialog, keep Tab inside it, and hand focus back on close. A passive effect, since React
  // restores the pre-commit focus after a layout cleanup.
  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    // Lock the page behind the dialog, so swipes and the wheel move its list rather than the page.
    const page = document.documentElement;
    const previousOverflow = page.style.overflow;
    page.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const buttons = dialogRef.current.querySelectorAll<HTMLElement>('button');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      // Focus outside the dialog (a click on its text drops it to the body) re-enters at the near end.
      const isOutside = !dialogRef.current.contains(document.activeElement);
      if (e.shiftKey && (isOutside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (isOutside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      page.style.overflow = previousOverflow;
      // The locked page kept the control in place, so don't scroll to it: one tapped just above a bottom bar sits
      // inside the scroll padding and would nudge the page.
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);
}
