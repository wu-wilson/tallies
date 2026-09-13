import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { AssignSheet } from './AssignSheet';

import { useBillStore } from '../../store/billStore';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_ITEM_NAME_LENGTH } from '../../constants/config';

import type { BillItem } from '../../types/bill';

interface ItemCardProps {
  /** ID of the receipt this item belongs to — threaded into every store mutation. */
  receiptId: string;
  item: BillItem;
  /** Position in the items list, used to stagger the entrance animation (30 ms per row). */
  index: number;
}

/**
 * Single bill-item row — editable name/price boxes, a remove control, and an assignee row whose avatars
 * toggle a person off on tap; a "+" control (labelled "Assign" while nobody is on it) opens the assign sheet.
 * @param props - Receipt ID, the item, and its list index for stagger timing
 * @returns Item row with editable fields and assignment controls
 */
export const ItemCard: React.FC<ItemCardProps> = ({ receiptId, item, index }) => {
  const { people, removeItem, updateItem, toggleAssignment } = useBillStore();
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(item.price.toString());
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasPeople = people.length > 0;
  const assigned = people.filter((p) => item.assignees.includes(p.id));
  const isUnassigned = assigned.length === 0;

  const commitName = () => updateItem(receiptId, item.id, { name: nameValue.trim() });
  const commitPrice = () => {
    const parsed = parseFloat(priceValue);
    const next = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setPriceValue(next.toString());
    updateItem(receiptId, item.id, { price: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: DURATION.normal, ease: EASE.out, delay: index * 0.03 }}
      className="border-b border-line px-3.5 py-3 sm:px-4"
    >
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          maxLength={MAX_ITEM_NAME_LENGTH}
          placeholder="e.g. Bananas"
          className="min-w-0 flex-1 border border-transparent bg-sand-2 px-3 py-2.5 text-[15px] font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink-ghost"
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={commitPrice}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-[84px] shrink-0 border border-transparent bg-sand-2 px-3 py-2.5 text-right font-mono text-sm font-bold text-ink outline-none"
        />
        <button
          onClick={() => removeItem(receiptId, item.id)}
          aria-label="Remove item"
          className="-mr-[11px] flex h-[38px] w-[38px] shrink-0 items-center justify-center text-ink-faint transition-[filter] hover:text-status-error"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {assigned.map((person) => (
          <Avatar
            key={person.id}
            name={person.name}
            color={person.color}
            size="sm"
            onClick={() => toggleAssignment(receiptId, item.id, person.id)}
          />
        ))}
        <motion.button
          onClick={() => setSheetOpen(true)}
          disabled={!hasPeople}
          className={`flex shrink-0 items-center justify-center border border-line bg-paper-raised text-ink-muted transition-colors hover:bg-sand-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${
            isUnassigned ? 'h-[26px] gap-1.5 px-3 text-xs font-extrabold' : 'h-[26px] w-[26px]'
          }`}
          aria-label="Assign people"
          whileTap={hasPeople ? { scale: 0.97 } : undefined}
        >
          <Icon name="plus" />
          {isUnassigned && <span>Assign</span>}
        </motion.button>
      </div>

      <AssignSheet receiptId={receiptId} item={sheetOpen ? item : null} onClose={() => setSheetOpen(false)} />
    </motion.div>
  );
};
