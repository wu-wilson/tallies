import React from 'react';

import { deriveBillTotals, formatCurrency, formatPercentage } from '../../lib/billMath';
import { useBillStore } from '../../store/billStore';

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="flex items-baseline justify-between text-xs">
    <span className="text-text-secondary">{label}</span>
    <span className="font-mono tabular-nums text-text-primary">{value}</span>
  </div>
);

/**
 * Bordered summary card showing the running subtotal, tax, tip, and total across all receipts.
 * Uses every item (not just assigned ones) so the user sees the full running total while editing.
 * Tax/tip rows carry a `· %` label only when there's a single receipt; with multiple receipts (mixed
 * rates) they show combined dollar amounts only.
 * @returns Bordered card with three rows + a divided total
 */
export const SummaryPanel: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const { subtotal, taxAmount, tipAmount, total } = deriveBillTotals(receipts);

  const single = receipts.length === 1 ? receipts[0] : null;
  const taxLabel = single
    ? `Tax · ${formatPercentage(single.tax, single.taxIsPercent, subtotal, taxAmount)}`
    : 'Tax';
  const tipLabel = single
    ? `Tip · ${formatPercentage(single.tip, single.tipIsPercent, subtotal, tipAmount)}`
    : 'Tip';

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
      <div className="space-y-2 px-4 py-3">
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryRow label={taxLabel} value={formatCurrency(taxAmount)} />
        <SummaryRow label={tipLabel} value={formatCurrency(tipAmount)} />
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle bg-bg-tertiary/40 px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">
          Total
        </span>
        <span className="font-mono text-base font-semibold tabular-nums text-text-primary">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};
