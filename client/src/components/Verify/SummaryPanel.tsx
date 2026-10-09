import React from 'react';

import { CARD, CARD_TITLE } from '../common/styles';
import { ReviewButton } from './ReviewButton';

import { useBillStore } from '../../store/billStore';

import { deriveBillTotals, formatCurrency } from '../../lib/billMath';

/**
 * The bill's running subtotal, tax, tip, and total across every receipt (assigned or not), with the review button
 * below it on `lg+`.
 * @returns The summary card
 */
export const SummaryPanel: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const { subtotal, taxAmount, tipAmount, total } = deriveBillTotals(receipts);

  return (
    <section aria-label="Summary" className={`px-[18px] pb-[18px] pt-4 ${CARD}`}>
      <h2 className={CARD_TITLE}>Summary</h2>
      <dl className="mt-2.5 flex flex-col gap-1.5 text-sm text-ink-2">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Tax</dt><dd>{formatCurrency(taxAmount)}</dd></div>
        <div className="flex justify-between"><dt>Tip</dt><dd>{formatCurrency(tipAmount)}</dd></div>
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-[14.5px] font-medium">Total</span>
        <span className="text-[26px] tracking-[-0.035em]">{formatCurrency(total)}</span>
      </div>
      <div className="mt-4 hidden lg:block">
        <ReviewButton variant="rail" />
      </div>
    </section>
  );
};
