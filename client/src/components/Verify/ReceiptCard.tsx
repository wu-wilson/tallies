import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Icon } from '../common/Icon';
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
 * One receipt's editing card on Verify — a header band with editable merchant/date and running total, a
 * receipt-scoped split-evenly row, its own item list with an add-item bar, and its own tax/tip rows.
 * @param props - The receipt to render and whether it may be removed
 * @returns Bordered card containing the receipt's header, items, and tax/tip controls
 */
export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, canRemove }) => {
  const { setReceiptMerchant, setReceiptDate, setTax, setTaxIsPercent, setTip, setTipIsPercent, removeReceipt } =
    useBillStore();

  const [merchantValue, setMerchantValue] = useState(receipt.merchant);
  const [dateValue, setDateValue] = useState(receipt.date);

  const total = deriveBillTotals([receipt]).total;

  return (
    <div className="border border-ink bg-paper-raised">
      {/* Header band */}
      <div className="flex items-start justify-between gap-3 border-b border-ink bg-sand-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={merchantValue}
            onChange={(e) => setMerchantValue(e.target.value)}
            onBlur={() => setReceiptMerchant(receipt.id, merchantValue.trim())}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            maxLength={MAX_NAME_LENGTH}
            placeholder="e.g. Costco"
            className="-ml-px w-full border border-transparent bg-transparent text-base font-black tracking-tight text-ink outline-none placeholder:font-bold placeholder:text-ink-ghost"
          />
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            onBlur={() => setReceiptDate(receipt.id, dateValue.trim())}
            className="-ml-px mt-0.5 block border border-transparent bg-transparent font-mono text-[10px] tracking-[0.04em] text-ink-faint outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <span className="font-mono text-sm font-bold tabular-nums">{formatCurrency(total)}</span>
          {canRemove && (
            <button
              onClick={() => removeReceipt(receipt.id)}
              aria-label="Remove receipt"
              className="-mr-[11px] flex h-[38px] w-[38px] shrink-0 items-center justify-center text-ink-faint transition-[filter] hover:text-status-error"
            >
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Split evenly */}
      <SplitEvenlyButton receiptId={receipt.id} />

      {/* Items */}
      <AnimatePresence initial={false}>
        {receipt.items.map((item, index) => (
          <ItemCard key={item.id} receiptId={receipt.id} item={item} index={index} />
        ))}
      </AnimatePresence>

      <AddItemButton receiptId={receipt.id} disabled={receipt.items.length >= MAX_ITEMS} />

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
