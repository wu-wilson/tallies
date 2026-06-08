import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_ITEM_NAME_LENGTH } from '../../constants/config';
import { formatCurrency } from '../../lib/billMath';
import { useBillStore } from '../../store/billStore';
import { Avatar } from '../common/Avatar';

import type { BillItem } from '../../types/bill';

interface ItemCardProps {
  /** ID of the receipt this item belongs to — threaded into every store mutation. */
  receiptId: string;
  item: BillItem;
  /** Position in the items list, used to stagger the entrance animation (30 ms per card). */
  index: number;
}

/**
 * Single bill-item row with editable name/price, per-person assignee toggles, and quick-assign actions.
 * @param props - Receipt ID, the item, and its list index for stagger timing
 * @returns Card with editable fields and assignment controls
 */
export const ItemCard: React.FC<ItemCardProps> = ({ receiptId, item, index }) => {
  const { people, removeItem, updateItem, toggleAssignment, assignAllToItem } = useBillStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(item.price.toString());

  const isUnassigned = item.assignees.length === 0;
  const isAllAssigned = people.length > 0 && item.assignees.length === people.length;
  const showEveryone = people.length > 0 && !isAllAssigned;
  const showUnassigned = people.length > 0 && isUnassigned;
  const hasQuickActions = showEveryone || showUnassigned;

  const handleNameBlur = () => {
    setIsEditingName(false);
    updateItem(receiptId, item.id, { name: nameValue.trim() });
  };

  const handlePriceBlur = () => {
    setIsEditingPrice(false);
    const parsed = parseFloat(priceValue);
    updateItem(receiptId, item.id, { price: isNaN(parsed) ? 0 : Math.max(0, parsed) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: DURATION.normal, ease: EASE.out, delay: index * 0.03 }}
      className={clsx(
        'rounded-xl border border-border bg-bg-tertiary px-4',
        isUnassigned && 'opacity-90',
      )}
    >
      {/* Top row: name + price (price flush right) */}
      <div className="flex items-center gap-3 pb-2 pt-3">
        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              maxLength={MAX_ITEM_NAME_LENGTH}
              placeholder="e.g. Bananas"
              className="-ml-2 w-[calc(100%+0.5rem)] rounded bg-transparent px-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="-ml-2 w-[calc(100%+0.5rem)] truncate rounded px-2 text-left text-sm text-text-primary transition-colors hover:text-brand"
              title={item.name}
            >
              {item.name || <span className="text-text-tertiary">Unnamed item</span>}
            </button>
          )}
        </div>

        {isEditingPrice ? (
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            onBlur={handlePriceBlur}
            onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
            className="-mr-2 w-[calc(5rem+0.5rem)] rounded bg-transparent px-2 text-right font-mono text-sm text-text-primary outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setPriceValue(item.price.toString());
              setIsEditingPrice(true);
            }}
            className="-mr-2 shrink-0 rounded px-2 font-mono text-sm tabular-nums text-text-primary transition-colors hover:text-brand"
          >
            {formatCurrency(item.price)}
          </button>
        )}
      </div>

      {/* Action row: avatars (left) + Everyone/Unassigned + delete (right, separated) */}
      <div className="flex items-center gap-3 pb-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {people.map((person) => (
            <Avatar
              key={person.id}
              name={person.name}
              color={person.color}
              size="xs"
              isDimmed={!item.assignees.includes(person.id)}
              onClick={() => toggleAssignment(receiptId, item.id, person.id)}
            />
          ))}
        </div>

        {hasQuickActions && (
          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[11px]">
            {showEveryone && (
              <button
                onClick={() => assignAllToItem(receiptId, item.id)}
                className="text-text-tertiary transition-colors hover:text-text-primary"
              >
                Everyone
              </button>
            )}
            {showUnassigned && (
              <span className="text-status-warning">Unassigned</span>
            )}
          </div>
        )}

        {hasQuickActions && (
          <div aria-hidden className="h-4 w-px shrink-0 bg-border-subtle" />
        )}

        <motion.button
          onClick={() => removeItem(receiptId, item.id)}
          className={clsx(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-tertiary transition-colors hover:text-status-error',
            hasQuickActions && '-ml-1.5',
          )}
          whileTap={{ scale: 0.85 }}
          aria-label="Remove item"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};
