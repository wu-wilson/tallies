import React from 'react';

import { formatCurrency, formatPercentage, resolveAmount } from '../../lib/billMath';
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
 * Bordered summary card showing the running subtotal, tax, tip, and total for the in-progress bill.
 * Reads the store directly; uses every item (not just assigned ones) so the user sees the full running total while editing.
 * @returns Bordered card with three rows + a divided total
 */
export const SummaryPanel: React.FC = () => {
  const { items, tax, taxIsPercent, tip, tipIsPercent } = useBillStore();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = resolveAmount(tax, taxIsPercent, subtotal);
  const tipAmount = resolveAmount(tip, tipIsPercent, subtotal);
  const total = subtotal + taxAmount + tipAmount;

  const taxPercent = formatPercentage(tax, taxIsPercent, subtotal, taxAmount);
  const tipPercent = formatPercentage(tip, tipIsPercent, subtotal, tipAmount);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
      <div className="space-y-2 px-4 py-3">
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryRow label={`Tax · ${taxPercent}`} value={formatCurrency(taxAmount)} />
        <SummaryRow label={`Tip · ${tipPercent}`} value={formatCurrency(tipAmount)} />
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
