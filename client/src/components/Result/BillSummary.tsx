import React from 'react';

import { formatCurrency } from '../../lib/billMath';

import type { ReceiptSummary } from '../../lib/billMath';

interface BillSummaryProps {
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
 * Summary shown above the per-person cards on Result and SharedView. With a single receipt it shows
 * Subtotal / Tax·% / Tip·% (its actual rates); with multiple receipts it lists each receipt's total, then
 * the combined Subtotal / Tax / Tip (rates omitted since they differ per receipt).
 * @param props - Per-receipt summaries plus combined subtotal/tax/tip dollar amounts
 * @returns Divided list of summary rows
 */
export const BillSummary: React.FC<BillSummaryProps> = ({ summaries, subtotal, tax, tip }) => {
  const single = summaries.length === 1 ? summaries[0] : null;

  if (single) {
    return (
      <div className="divide-y divide-border-subtle text-xs">
        <Row label="Subtotal" value={formatCurrency(subtotal)} />
        <Row label={`Tax · ${single.taxPercent}`} value={formatCurrency(tax)} />
        <Row label={`Tip · ${single.tipPercent}`} value={formatCurrency(tip)} />
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className="divide-y divide-border-subtle">
        {summaries.map((s) => (
          <Row key={s.receiptId} label={s.merchant || 'Untitled receipt'} value={formatCurrency(s.total)} />
        ))}
      </div>
      <div className="mt-1 divide-y divide-border-subtle border-t border-border-subtle">
        <Row label="Subtotal" value={formatCurrency(subtotal)} />
        <Row label="Tax" value={formatCurrency(tax)} />
        <Row label="Tip" value={formatCurrency(tip)} />
      </div>
    </div>
  );
};

interface RowProps {
  label: string;
  value: string;
}

const Row: React.FC<RowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-text-secondary">{label}</span>
    <span className="font-mono tabular-nums text-text-primary">{value}</span>
  </div>
);
