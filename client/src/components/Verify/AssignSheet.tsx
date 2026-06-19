import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Avatar } from '../common/Avatar';

import { useBillStore } from '../../store/billStore';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { BillItem } from '../../types/bill';

interface AssignSheetProps {
  /** Receipt the item belongs to — threaded into every assignment mutation. */
  receiptId: string;
  /** The item being assigned, or null when the sheet is closed. */
  item: BillItem | null;
  onClose: () => void;
}

/**
 * Modal sheet for choosing who shares an item — Everyone / Clear quick actions plus a checkable list of
 * people. Slides up from the bottom on mobile, centers on larger screens, over a dimmed backdrop. Rendered
 * through a portal on `document.body` so it isn't clipped or offset by the animated (transformed) item row.
 * Mutations apply live to the store.
 * @param props - Target receipt, the item being assigned (null closes the sheet), and a close handler
 * @returns The portaled assign sheet, or nothing when no item is active
 */
export const AssignSheet: React.FC<AssignSheetProps> = ({ receiptId, item, onClose }) => {
  const { people, toggleAssignment, assignAllToItem, clearItemAssignees } = useBillStore();

  return createPortal(
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          <motion.button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', opacity: 0, transition: { duration: DURATION.normal, ease: 'easeIn' } }}
            transition={{ duration: DURATION.smooth, ease: EASE.out }}
            className="relative max-h-[80dvh] w-full overflow-y-auto border-t border-ink bg-paper sm:max-w-md sm:border"
          >
            <div className="flex items-start justify-between gap-3 border-b border-ink px-5 py-4">
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-bold tracking-[0.04em] text-ink-faint">WHO SHARED THIS?</div>
                <div className="mt-1 truncate text-xl font-black tracking-tight">{item.name || 'Unnamed item'}</div>
              </div>
              <span className="shrink-0 font-mono text-base font-bold">{formatCurrency(item.price)}</span>
            </div>

            <div className="flex gap-2.5 px-5 pb-1.5 pt-4">
              <button
                onClick={() => assignAllToItem(receiptId, item.id)}
                className="border border-ink bg-brand px-4 py-2 text-[13px] font-extrabold text-brand-on transition-[filter] hover:brightness-110"
              >
                Everyone
              </button>
              <button
                onClick={() => clearItemAssignees(receiptId, item.id)}
                className="border border-ink bg-paper-raised px-4 py-2 text-[13px] font-extrabold transition-[filter] hover:brightness-[0.97]"
              >
                Clear
              </button>
            </div>

            <div>
              {people.map((person) => {
                const checked = item.assignees.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => toggleAssignment(receiptId, item.id, person.id)}
                    className="flex w-full items-center gap-3.5 border-b border-ink px-5 py-3 text-left"
                  >
                    <Avatar name={person.name} color={person.color} size="md" />
                    <span className="flex-1 truncate text-[15px] font-bold">{person.name}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border border-ink text-sm font-extrabold ${
                        checked ? 'bg-brand text-brand-on' : 'bg-paper-raised text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
              <button
                onClick={onClose}
                className="w-full bg-brand py-4 text-[15px] font-extrabold text-brand-on transition-[filter] hover:brightness-110"
              >
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
