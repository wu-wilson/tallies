import React from 'react';
import { motion } from 'framer-motion';

import { MAX_ITEMS } from '../../constants/config';
import { useBillStore } from '../../store/billStore';

/**
 * Dashed-border button that appends a blank item to the bill; disabled once `MAX_ITEMS` is reached.
 * @returns Full-width "Add item" button
 */
export const AddItemButton: React.FC = () => {
  const { items, addItem } = useBillStore();
  const isDisabled = items.length >= MAX_ITEMS;

  return (
    <motion.button
      onClick={addItem}
      disabled={isDisabled}
      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-subtle px-4 text-[13px] font-medium text-text-tertiary transition-colors hover:border-border hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      whileTap={isDisabled ? undefined : { scale: 0.99 }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add item
    </motion.button>
  );
};
