import React from 'react';
import { motion } from 'framer-motion';

import { useBillStore } from '../../store/billStore';

interface AddItemButtonProps {
  /** Receipt to append the new blank item to. */
  receiptId: string;
  /** When true, the button is disabled (this receipt has reached `MAX_ITEMS`). */
  disabled: boolean;
}

/**
 * Dashed-border button that appends a blank item to a receipt; disabled once the receipt hits `MAX_ITEMS`.
 * @param props - Target receipt ID and whether the item cap is reached
 * @returns Full-width "Add item" button
 */
export const AddItemButton: React.FC<AddItemButtonProps> = ({ receiptId, disabled }) => {
  const addItem = useBillStore((s) => s.addItem);

  return (
    <motion.button
      onClick={() => addItem(receiptId)}
      disabled={disabled}
      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-subtle px-4 text-[13px] font-medium text-text-tertiary transition-colors hover:border-border hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      whileTap={disabled ? undefined : { scale: 0.99 }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add item
    </motion.button>
  );
};
