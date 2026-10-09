import React from 'react';

import { CARD, CARD_TITLE } from '../common/styles';

import { formatCurrency } from '../../lib/billMath';

import type { ReceiptSummary } from '../../lib/billMath';

interface ReceiptsSummaryProps {
  /** Per-receipt assigned-only summaries (one per contributing receipt). */
  summaries: ReceiptSummary[];
  /** Combined assigned subtotal across receipts. */
  subtotal: number;
  /** Combined tax across receipts, in dollars. */
  tax: number;
  /** Combined tip across receipts, in dollars. */
  tip: number;
}

/**
 * The bill's receipts and its combined subtotal, tax, and tip, beside the per-person list on Result and the shared
 * view. A single receipt shows its own tax and tip rates; several list each receipt's total instead, since their
 * rates differ.
 * @param props - Per-receipt summaries plus the combined dollar amounts
 * @returns The receipts card
 */
export const ReceiptsSummary: React.FC<ReceiptsSummaryProps> = ({ summaries, subtotal, tax, tip }) => {
  const single = summaries.length === 1 ? summaries[0] : null;

  return (
    <section aria-label="Receipts" className={`px-[18px] pb-[18px] pt-4 ${CARD}`}>
      <h2 className={CARD_TITLE}>{single ? single.merchant || 'Receipt' : 'Receipts'}</h2>
      {!single && (
        <div className="mt-2.5 flex flex-col gap-1.5 text-sm">
          {summaries.map((s) => (
            <div key={s.receiptId} className="flex justify-between gap-4">
              <span className="truncate">{s.merchant || 'Receipt'}</span>
              <span>{formatCurrency(s.total)}</span>
            </div>
          ))}
        </div>
      )}
      <dl className={`flex flex-col gap-1.5 text-[13.5px] text-ink-2 ${single ? 'mt-2.5' : 'mt-3 border-t border-line pt-3'}`}>
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Tax{single && <span className="text-ink-3"> {single.taxPercent}</span>}</dt><dd>{formatCurrency(tax)}</dd></div>
        <div className="flex justify-between"><dt>Tip{single && <span className="text-ink-3"> {single.tipPercent}</span>}</dt><dd>{formatCurrency(tip)}</dd></div>
      </dl>
    </section>
  );
};
