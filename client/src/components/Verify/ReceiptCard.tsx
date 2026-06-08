import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { AddItemButton } from './AddItemButton';
import { ItemCard } from './ItemCard';
import { SplitEvenlyButton } from './SplitEvenlyButton';
import { TaxTipRow } from './TaxTipRow';

import { useBillStore } from '../../store/billStore';

import { MAX_ITEMS, MAX_NAME_LENGTH } from '../../constants/config';

import type { Receipt } from '../../types/bill';

interface ReceiptCardProps {
  receipt: Receipt;
  /** When false, the remove-receipt control is hidden (a bill keeps at least one receipt). */
  canRemove: boolean;
}

/**
 * One receipt's editing card on Verify — editable merchant + date header, its own item list, and its own tax/tip rows.
 * @param props - The receipt to render and whether it may be removed
 * @returns Bordered card containing the receipt's header, items, and tax/tip controls
 */
export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, canRemove }) => {
  const {
    setReceiptMerchant,
    setReceiptDate,
    setTax,
    setTaxIsPercent,
    setTip,
    setTipIsPercent,
    removeReceipt,
  } = useBillStore();

  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [merchantValue, setMerchantValue] = useState(receipt.merchant);
  const [dateValue, setDateValue] = useState(receipt.date);

  const handleMerchantBlur = () => {
    setIsEditingMerchant(false);
    setReceiptMerchant(receipt.id, merchantValue.trim());
  };

  const handleDateBlur = () => {
    setIsEditingDate(false);
    setReceiptDate(receipt.id, dateValue.trim());
  };

  return (
    <div className="rounded-xl border border-border bg-bg-secondary px-4 py-4">
      {/* Header: merchant + date, remove on the right */}
      <div className="flex items-start justify-between gap-3">
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
              className="-ml-1 w-[calc(100%+0.5rem)] rounded bg-transparent px-1 text-base font-semibold tracking-tight text-text-primary outline-none placeholder:text-text-tertiary"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setMerchantValue(receipt.merchant);
                setIsEditingMerchant(true);
              }}
              className="-ml-1 max-w-full truncate rounded px-1 text-left text-base font-semibold tracking-tight text-text-primary transition-colors hover:text-brand"
            >
              {receipt.merchant || <span className="text-text-tertiary">Untitled receipt</span>}
            </button>
          )}

          <div className="mt-0.5 text-xs text-text-secondary">
            {isEditingDate ? (
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                onBlur={handleDateBlur}
                className="-ml-1 rounded bg-transparent px-1 text-text-secondary outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setDateValue(receipt.date);
                  setIsEditingDate(true);
                }}
                className="-ml-1 rounded px-1 transition-colors hover:text-text-primary"
              >
                {receipt.date || 'Add date'}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <SplitEvenlyButton receiptId={receipt.id} />
          {canRemove && (
            <button
              onClick={() => removeReceipt(receipt.id)}
              className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:text-status-error"
              aria-label="Remove receipt"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {receipt.items.map((item, index) => (
            <ItemCard key={item.id} receiptId={receipt.id} item={item} index={index} />
          ))}
        </AnimatePresence>
        <AddItemButton receiptId={receipt.id} disabled={receipt.items.length >= MAX_ITEMS} />
      </div>

      {/* Tax / Tip */}
      <div className="mt-4 border-t border-border-subtle">
        <div className="divide-y divide-border-subtle">
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
    </div>
  );
};
