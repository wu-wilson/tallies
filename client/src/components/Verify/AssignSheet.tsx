import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../common/styles';

import { useBillStore } from '../../store/billStore';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { BillItem } from '../../types/bill';

interface AssignSheetProps {
  /** Receipt the item belongs to, threaded into every assignment mutation. */
  receiptId: string;
  /** The item being assigned, or null when the sheet is closed. */
  item: BillItem | null;
  onClose: () => void;
  /** The control that opened the sheet, focused again on close (Safari doesn't focus a button when it's tapped). */
  returnFocusRef: React.RefObject<HTMLElement>;
}

/**
 * Picker for who shared an item: Everyone and Clear shortcuts over a checklist of people, applied to the store live.
 * A bottom sheet on phones and a centred dialog from `sm` up; Escape, the backdrop, or Done close it.
 * @param props - Target receipt, the item (null closes the sheet), a close handler, and the control to refocus
 * @returns The portaled sheet, or nothing while closed
 */
export const AssignSheet: React.FC<AssignSheetProps> = ({ receiptId, item, onClose, returnFocusRef }) => {
  const people = useBillStore((s) => s.people);
  const toggleAssignment = useBillStore((s) => s.toggleAssignment);
  const assignAllToItem = useBillStore((s) => s.assignAllToItem);
  const clearItemAssignees = useBillStore((s) => s.clearItemAssignees);
  const dialogRef = useRef<HTMLDivElement>(null);
  // The parent passes a fresh closure each render; a ref keeps the effect below from re-running (and refocusing).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isOpen = item !== null;

  // Make the app behind the sheet inert, so neither Tab nor a screen reader can reach it (the sheet portals
  // outside `#root`). A layout effect, so leaving Verify with the sheet open clears it before the next screen
  // focuses its heading.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const app = document.getElementById('root');
    if (app) app.inert = true;
    return () => {
      if (app) app.inert = false;
    };
  }, [isOpen]);

  // Move focus into the dialog, keep Tab inside it, and hand focus back to the item's button on close. A passive
  // effect, since React restores the pre-commit focus after a layout cleanup.
  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    // Lock the page behind the sheet, so swipes and the wheel move the list rather than Verify.
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
      // Focus outside the sheet (a click on its text drops it to the body) re-enters at the near end.
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
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);

  // A portal on `document.body`, so the animated row it opens from can't clip or offset it.
  return createPortal(
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          {/* Pointer-only: Escape and Done close it from the keyboard. */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Who had ${item.name || 'this item'}?`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl border border-transparent bg-surface shadow-sheet sm:max-w-[400px] sm:rounded-xl sm:shadow-float"
          >
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
              <div className="min-w-0">
                <div className="text-[13px] text-ink-3">Who had</div>
                <div className="line-clamp-3 text-xl tracking-[-0.03em] [overflow-wrap:anywhere]">{item.name || 'this item'}?</div>
              </div>
              <span className="shrink-0 pt-5 text-[15px] text-ink-2">{formatCurrency(item.price)}</span>
            </div>
            <div className="flex gap-2 px-5 pb-2">
              <button type="button" onClick={() => assignAllToItem(receiptId, item.id)} className={`h-9 px-3.5 text-[13px] ${BUTTON_SECONDARY}`}>
                Everyone
              </button>
              <button type="button" onClick={() => clearItemAssignees(receiptId, item.id)} className={`h-9 px-3.5 text-[13px] ${BUTTON_SECONDARY}`}>
                Clear
              </button>
            </div>
            <div className="px-3 py-1">
              {people.map((person) => {
                const isChecked = item.assignees.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleAssignment(receiptId, item.id, person.id)}
                    className={`flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors duration-200 ${isChecked ? 'bg-wash' : 'hover:bg-wash'}`}
                  >
                    <Avatar name={person.name} color={person.color} />
                    <span className="min-w-0 flex-1 truncate text-[15px]">{person.name}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors duration-200 ${
                        isChecked ? 'border-settled bg-settled' : 'border-ink-4 bg-surface'
                      }`}
                    >
                      {/* Opacity, not a transparent colour, hides the tick, so forced-colors mode can't reveal it. */}
                      <Icon name="check" size={13} className={`transition-opacity duration-200 ${isChecked ? '' : 'opacity-0'}`} />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 sm:pb-5">
              <button type="button" onClick={onClose} className={`h-12 w-full text-[15px] ${BUTTON_PRIMARY}`}>
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
