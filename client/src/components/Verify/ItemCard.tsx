import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Avatar } from '../common/Avatar';
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
 * toggle a person off on tap; a dashed "+" opens the assign sheet for adding people or splitting evenly.
 * @param props - Receipt ID, the item, and its list index for stagger timing
 * @returns Item row with editable fields and assignment controls
 */
export const ItemCard: React.FC<ItemCardProps> = ({ receiptId, item, index }) => {
  const { people, removeItem, updateItem, toggleAssignment } = useBillStore();
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(item.price.toString());
  const [sheetOpen, setSheetOpen] = useState(false);

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
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center border border-ink text-ink-faint transition-[filter] hover:text-status-error"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {assigned.map((person) => (
          <Avatar
            key={person.id}
            name={person.name}
            color={person.color}
            size="xs"
            onClick={() => toggleAssignment(receiptId, item.id, person.id)}
          />
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          disabled={people.length === 0}
          className={`flex h-[22px] shrink-0 items-center justify-center rounded-full border border-dashed border-ink-faint font-mono text-[11px] font-bold text-ink-faint transition-[filter] hover:text-ink disabled:opacity-40 ${
            isUnassigned ? 'gap-1 px-2.5' : 'w-[22px]'
          }`}
          aria-label="Assign people"
        >
          <span className="text-[13px] leading-none">+</span>
          {isUnassigned && <span className="text-rust">UNASSIGNED</span>}
        </button>
      </div>

      <AssignSheet receiptId={receiptId} item={sheetOpen ? item : null} onClose={() => setSheetOpen(false)} />
    </motion.div>
  );
};
