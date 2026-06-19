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
 * Dashed-border control that appends a blank item to a receipt; disabled once the receipt hits `MAX_ITEMS`.
 * @param props - Target receipt ID and whether the item cap is reached
 * @returns Inline "Add item" button
 */
export const AddItemButton: React.FC<AddItemButtonProps> = ({ receiptId, disabled }) => {
  const addItem = useBillStore((s) => s.addItem);

  return (
    <motion.button
      onClick={() => addItem(receiptId)}
      disabled={disabled}
      className="flex items-center gap-1.5 border-2 border-dashed border-brand px-3.5 py-1.5 text-[13px] font-extrabold text-brand transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <span className="text-base leading-none">+</span>
      Add item
    </motion.button>
  );
};
