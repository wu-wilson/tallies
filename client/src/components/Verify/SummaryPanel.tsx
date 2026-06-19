import React from 'react';

import { deriveBillTotals, formatCurrency, formatPercentage } from '../../lib/billMath';
import { useBillStore } from '../../store/billStore';

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="flex items-baseline justify-between py-1 text-ink-muted">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

/**
 * Bordered summary card showing the running subtotal, tax, tip, and total across all receipts.
 * Uses every item (not just assigned ones) so the user sees the full running total while editing.
 * Tax/tip rows carry a `· %` label only when there's a single receipt; with multiple receipts (mixed
 * rates) they show combined dollar amounts only.
 * @returns Bordered mono card with subtotal/tax/tip rows and a ruled total
 */
export const SummaryPanel: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const { subtotal, taxAmount, tipAmount, total } = deriveBillTotals(receipts);

  const single = receipts.length === 1 ? receipts[0] : null;
  const taxLabel = single
    ? `TAX · ${formatPercentage(single.tax, single.taxIsPercent, subtotal, taxAmount)}`
    : 'TAX';
  const tipLabel = single
    ? `TIP · ${formatPercentage(single.tip, single.tipIsPercent, subtotal, tipAmount)}`
    : 'TIP';

  return (
    <div className="border border-ink bg-paper-raised px-4 py-3.5 font-mono text-sm">
      <SummaryRow label="SUBTOTAL" value={formatCurrency(subtotal)} />
      <SummaryRow label={taxLabel} value={formatCurrency(taxAmount)} />
      <SummaryRow label={tipLabel} value={formatCurrency(tipAmount)} />
      <div className="mt-2 flex items-baseline justify-between border-t border-ink pt-2.5 text-base font-bold text-ink">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
