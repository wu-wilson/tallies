import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Icon } from '../common/Icon';
import { commitOnEnter } from '../common/keys';
import { BUTTON_GHOST, BUTTON_REMOVE, CARD } from '../common/styles';
import { AmountRow } from './AmountRow';
import { HEAD_GRID, TOTAL_GRID } from './grid';
import { ItemRow } from './ItemRow';
import { ReceiptDate } from './ReceiptDate';
import { SplitEvenlySwitch } from './SplitEvenlySwitch';

import { useBillStore } from '../../store/billStore';

import { deriveBillTotals, formatAmount, formatCurrency } from '../../lib/billMath';

import { MAX_ITEMS, MAX_NAME_LENGTH } from '../../constants/config';

import type { Receipt } from '../../types/bill';

interface ReceiptCardProps {
  receipt: Receipt;
  /** Removes the receipt; omitted when it's the bill's only one, which hides the control. */
  onRemove?: () => void;
}

/**
 * One receipt as a ledger card: the merchant and date, a split-evenly switch, its items with who shared each, an
 * Add item row, then subtotal, tax, tip, and total with every amount in the price column.
 * @param props - The receipt and its remove handler, if it may be removed
 * @returns The receipt card
 */
export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onRemove }) => {
  const setReceiptMerchant = useBillStore((s) => s.setReceiptMerchant);
  const setReceiptDate = useBillStore((s) => s.setReceiptDate);
  const setTax = useBillStore((s) => s.setTax);
  const setTaxIsPercent = useBillStore((s) => s.setTaxIsPercent);
  const setTip = useBillStore((s) => s.setTip);
  const setTipIsPercent = useBillStore((s) => s.setTipIsPercent);
  const removeItem = useBillStore((s) => s.removeItem);
  const addItem = useBillStore((s) => s.addItem);
  const [merchantValue, setMerchantValue] = useState(receipt.merchant);
  const addItemRef = useRef<HTMLButtonElement>(null);

  // A removed row takes focus with it, so hand it to Add item.
  const handleRemoveItem = (itemId: string) => {
    removeItem(receipt.id, itemId);
    addItemRef.current?.focus();
  };

  const { subtotal, taxAmount, tipAmount, total } = deriveBillTotals([receipt]);
  const itemCount = receipt.items.length;

  return (
    <section aria-label={receipt.merchant || 'Receipt'} className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line py-3 pl-5 pr-3">
        <div className="min-w-0 flex-[1_1_128px]">
          <input
            type="text"
            value={merchantValue}
            onChange={(e) => setMerchantValue(e.target.value)}
            onBlur={() => setReceiptMerchant(receipt.id, merchantValue.trim())}
            onKeyDown={commitOnEnter}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Store name"
            aria-label="Store name"
            className="cell -ml-2 h-8 w-full px-2 text-[17px] font-medium tracking-[-0.02em] placeholder:font-normal placeholder:text-ink-3"
          />
          <div className="flex flex-wrap items-center whitespace-nowrap text-[13px] text-ink-3">
            <ReceiptDate value={receipt.date} onChange={(next) => setReceiptDate(receipt.id, next)} />
            <span>
              &nbsp;· {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
        <div className="-ml-2 flex shrink-0 items-center gap-1">
          <SplitEvenlySwitch receipt={receipt} />
          {onRemove && (
            <button type="button" onClick={onRemove} aria-label={`Remove ${receipt.merchant ? `the ${receipt.merchant} receipt` : 'this receipt'}`} className={BUTTON_REMOVE}>
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={HEAD_GRID}>
        <span>Item</span>
        <span>Shared by</span>
        <span className="text-right">Price</span>
        <span />
      </div>
      <AnimatePresence initial={false}>
        {receipt.items.map((item) => (
          <ItemRow key={item.id} receiptId={receipt.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
        ))}
      </AnimatePresence>
      <div className="border-b border-line px-3 py-1.5">
        <button ref={addItemRef} type="button" onClick={() => addItem(receipt.id)} aria-disabled={itemCount >= MAX_ITEMS} className={`h-[38px] px-2 text-sm ${BUTTON_GHOST}`}>
          <Icon name="plus" />
          Add item
        </button>
      </div>

      <div className="rounded-b-xl bg-ground">
        <div className={`${TOTAL_GRID} border-b border-line-soft`}>
          <span className="text-sm text-ink-2 [grid-area:lab]">Subtotal</span>
          <span className="text-right text-[15px] [grid-area:amt]">{formatAmount(subtotal)}</span>
        </div>
        <AmountRow
          label="Tax"
          value={receipt.tax}
          isPercent={receipt.taxIsPercent}
          amount={taxAmount}
          onValueChange={(v) => setTax(receipt.id, v)}
          onTogglePercent={(p) => setTaxIsPercent(receipt.id, p)}
        />
        <AmountRow
          label="Tip"
          value={receipt.tip}
          isPercent={receipt.tipIsPercent}
          amount={tipAmount}
          onValueChange={(v) => setTip(receipt.id, v)}
          onTogglePercent={(p) => setTipIsPercent(receipt.id, p)}
          presets={[15, 18, 20, 22]}
        />
        <div className={TOTAL_GRID}>
          <span className="text-[14.5px] font-medium [grid-area:lab]">Total</span>
          <span className="text-right text-base font-medium [grid-area:amt]">{formatCurrency(total)}</span>
        </div>
      </div>
    </section>
  );
};
