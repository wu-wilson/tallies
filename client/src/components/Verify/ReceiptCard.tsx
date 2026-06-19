import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { AddItemButton } from './AddItemButton';
import { ItemCard } from './ItemCard';
import { SplitEvenlyButton } from './SplitEvenlyButton';
import { TaxTipRow } from './TaxTipRow';

import { useBillStore } from '../../store/billStore';

import { deriveBillTotals, formatCurrency } from '../../lib/billMath';

import { MAX_ITEMS, MAX_NAME_LENGTH } from '../../constants/config';

import type { Receipt } from '../../types/bill';

interface ReceiptCardProps {
  receipt: Receipt;
  /** When false, the remove-receipt control is hidden (a bill keeps at least one receipt). */
  canRemove: boolean;
}

/**
 * One receipt's editing card on Verify — a header band with editable merchant/date and running total, its
 * own item list, a split-evenly toggle, and its own tax/tip rows.
 * @param props - The receipt to render and whether it may be removed
 * @returns Bordered card containing the receipt's header, items, and tax/tip controls
 */
export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, canRemove }) => {
  const { setReceiptMerchant, setReceiptDate, setTax, setTaxIsPercent, setTip, setTipIsPercent, removeReceipt } =
    useBillStore();

  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [merchantValue, setMerchantValue] = useState(receipt.merchant);
  const [dateValue, setDateValue] = useState(receipt.date);

  const total = deriveBillTotals([receipt]).total;

  const handleMerchantBlur = () => {
    setIsEditingMerchant(false);
    setReceiptMerchant(receipt.id, merchantValue.trim());
  };

  const handleDateBlur = () => {
    setIsEditingDate(false);
    setReceiptDate(receipt.id, dateValue.trim());
  };

  return (
    <div className="border border-ink bg-paper-raised">
      {/* Header band */}
      <div className="flex items-start justify-between gap-3 border-b border-ink bg-sand-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          {isEditingMerchant ? (
            <input
              type="text"
              value={merchantValue}
              onChange={(e) => setMerchantValue(e.target.value)}
              onBlur={handleMerchantBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleMerchantBlur()}
              maxLength={MAX_NAME_LENGTH}
              placeholder="e.g. Costco"
              className="w-full border border-transparent bg-transparent text-base font-black tracking-tight text-ink outline-none placeholder:font-bold placeholder:text-ink-ghost"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setMerchantValue(receipt.merchant);
                setIsEditingMerchant(true);
              }}
              className="block max-w-full truncate text-left text-base font-black tracking-tight text-ink transition-[filter] hover:text-brand"
            >
              {receipt.merchant || <span className="text-ink-ghost">Untitled receipt</span>}
            </button>
          )}

          <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-ink-faint">
            {isEditingDate ? (
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                onBlur={handleDateBlur}
                className="border border-transparent bg-transparent text-ink-faint outline-none"
                autoFocus
              />
            ) : (
              <button onClick={() => { setDateValue(receipt.date); setIsEditingDate(true); }} className="uppercase transition-[filter] hover:text-ink">
                {receipt.date || 'Add date'}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <span className="font-mono text-sm font-bold tabular-nums">{formatCurrency(total)}</span>
          {canRemove && (
            <button
              onClick={() => removeReceipt(receipt.id)}
              aria-label="Remove receipt"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center border border-ink text-ink-faint transition-[filter] hover:text-status-error"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {receipt.items.map((item, index) => (
          <ItemCard key={item.id} receiptId={receipt.id} item={item} index={index} />
        ))}
      </AnimatePresence>

      {/* Add item + split evenly */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3 sm:px-4">
        <AddItemButton receiptId={receipt.id} disabled={receipt.items.length >= MAX_ITEMS} />
        <SplitEvenlyButton receiptId={receipt.id} />
      </div>

      {/* Tax / Tip */}
      <div className="divide-y divide-line">
        <TaxTipRow
          label="Tax"
          value={receipt.tax}
          isPercent={receipt.taxIsPercent}
          onValueChange={(v) => setTax(receipt.id, v)}
          onTogglePercent={(p) => setTaxIsPercent(receipt.id, p)}
        />
        <TaxTipRow
          label="Tip"
          value={receipt.tip}
          isPercent={receipt.tipIsPercent}
          onValueChange={(v) => setTip(receipt.id, v)}
          onTogglePercent={(p) => setTipIsPercent(receipt.id, p)}
          quickButtons={[15, 18, 20, 22]}
        />
      </div>
    </div>
  );
};
