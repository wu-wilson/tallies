import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { AvatarPile } from '../common/AvatarPile';
import { Icon } from '../common/Icon';
import { commitOnEnter, selectOnFocus } from '../common/keys';
import { BUTTON_REMOVE } from '../common/styles';
import { AssignSheet } from './AssignSheet';
import { ITEM_GRID } from './grid';

import { useBillStore } from '../../store/billStore';

import { formatAmount, roundToCents } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_AMOUNT, MAX_ITEM_NAME_LENGTH } from '../../constants/config';

import type { BillItem, Person } from '../../types/bill';

interface ItemRowProps {
  /** ID of the receipt this item belongs to, threaded into every store mutation. */
  receiptId: string;
  item: BillItem;
  onRemove: () => void;
}

/**
 * One line of a receipt's ledger: the item's name and price as fields that read as text until touched, who shared
 * it (tapping opens the assign sheet), and a remove control. An item nobody is on yet shows an "Assign" button.
 * @param props - Receipt ID, the item, and its remove handler
 * @returns The ledger row
 */
export const ItemRow: React.FC<ItemRowProps> = ({ receiptId, item, onRemove }) => {
  const people = useBillStore((s) => s.people);
  const updateItem = useBillStore((s) => s.updateItem);
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(formatAmount(item.price));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Assign and "Shared by" render in the same spot, so React keeps one button and this ref follows it.
  const triggerRef = useRef<HTMLButtonElement>(null);

  const assigned = people.filter((p) => item.assignees.includes(p.id));
  const sharedLabel = assigneeLabel(assigned, people.length);

  const handleNameBlur = () => updateItem(receiptId, item.id, { name: nameValue.trim() });
  const handlePriceBlur = () => {
    const parsed = parseFloat(priceValue);
    // Stored rounded to the cent, as shown, so the rows always add up to the receipt's subtotal.
    const next = Number.isFinite(parsed) ? roundToCents(Math.min(Math.max(0, parsed), MAX_AMOUNT)) : 0;
    setPriceValue(formatAmount(next));
    updateItem(receiptId, item.id, { price: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className="overflow-hidden border-b border-line-soft"
    >
      {/* The grid sits inside, so its padding and minimum height don't hold the row open while it slides. */}
      <div className={ITEM_GRID}>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={commitOnEnter}
          maxLength={MAX_ITEM_NAME_LENGTH}
          placeholder="Item name"
          aria-label="Item name"
          className="cell -ml-2 h-9 min-w-0 text-ellipsis px-2 text-[15px] placeholder:text-ink-3 [grid-area:name]"
        />
        <div className="min-w-0 [grid-area:who]">
          {assigned.length > 0 ? (
            <button
              type="button"
              ref={triggerRef}
              onClick={() => setIsSheetOpen(true)}
              aria-label={`Shared by ${sharedLabel}. Change`}
              className="-ml-2 inline-flex h-8 max-w-full items-center gap-2 rounded-md px-2 text-[13px] text-ink-2 transition-colors duration-200 hover:bg-wash"
            >
              <AvatarPile people={assigned} />
              <span className="truncate">{sharedLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              ref={triggerRef}
              onClick={() => setIsSheetOpen(true)}
              disabled={people.length === 0}
              aria-label={`Assign ${item.name || 'this item'}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-line-strong px-2.5 text-[13px] font-medium text-ink-2 transition-colors duration-200 enabled:hover:border-ink-4 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="plus" size={14} />
              Assign
            </button>
          )}
        </div>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
          onFocus={selectOnFocus}
          onBlur={handlePriceBlur}
          // Chrome steps a focused number field on wheel; blurring first commits what was typed and lets the
          // page scroll.
          onWheel={(e) => e.currentTarget.blur()}
          onKeyDown={commitOnEnter}
          aria-label="Price"
          className="cell -mr-2 h-9 min-w-0 px-2 text-right text-[15px] [grid-area:price]"
        />
        <button type="button" onClick={onRemove} aria-label={`Remove ${item.name || 'this item'}`} className={`${BUTTON_REMOVE} [grid-area:del]`}>
          <Icon name="cross" size={14} />
        </button>
      </div>
      <AssignSheet
        receiptId={receiptId}
        item={isSheetOpen ? item : null}
        onClose={() => setIsSheetOpen(false)}
        returnFocusRef={triggerRef}
      />
    </motion.div>
  );
};

/** "Alex, Jordan" for one or two people, "Everyone" when the whole table shares it, else "Alex, Jordan +2". */
function assigneeLabel(assigned: Person[], peopleCount: number): string {
  if (assigned.length === peopleCount && peopleCount > 2) return 'Everyone';
  const names = assigned.map((p) => p.name);
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}
