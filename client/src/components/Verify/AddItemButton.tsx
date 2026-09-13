import React from 'react';
import { motion } from 'framer-motion';

import { Icon } from '../common/Icon';

import { useBillStore } from '../../store/billStore';

interface AddItemButtonProps {
  /** Receipt to append the new blank item to. */
  receiptId: string;
  /** When true, the button is disabled (this receipt has reached `MAX_ITEMS`). */
  disabled: boolean;
}

/**
 * Full-width bar at the foot of a receipt's item list that appends a blank item; disabled once the receipt
 * hits `MAX_ITEMS`.
 * @param props - Target receipt ID and whether the item cap is reached
 * @returns The "Add item" bar
 */
export const AddItemButton: React.FC<AddItemButtonProps> = ({ receiptId, disabled }) => {
  const addItem = useBillStore((s) => s.addItem);

  return (
    <div className="border-b border-line px-3.5 py-3 sm:px-4">
      <motion.button
        onClick={() => addItem(receiptId)}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-1.5 border border-line bg-paper-raised px-4 py-2.5 text-[13px] font-extrabold text-ink transition-colors hover:bg-sand-2 disabled:cursor-not-allowed disabled:opacity-40"
        whileTap={disabled ? undefined : { scale: 0.99 }}
      >
        <Icon name="plus" />
        Add item
      </motion.button>
    </div>
  );
};
