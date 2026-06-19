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
 * @returns Mono list of summary rows
 */
export const BillSummary: React.FC<BillSummaryProps> = ({ summaries, subtotal, tax, tip }) => {
  const single = summaries.length === 1 ? summaries[0] : null;

  if (single) {
    return (
      <div className="font-mono text-[13px]">
        <Row label="SUBTOTAL" value={formatCurrency(subtotal)} />
        <Row label={`TAX · ${single.taxPercent}`} value={formatCurrency(tax)} />
        <Row label={`TIP · ${single.tipPercent}`} value={formatCurrency(tip)} last />
      </div>
    );
  }

  return (
    <div className="font-mono text-[13px]">
      {summaries.map((s) => (
        <Row key={s.receiptId} label={(s.merchant || 'Untitled receipt').toUpperCase()} value={formatCurrency(s.total)} emphasize />
      ))}
      <Row label="SUBTOTAL" value={formatCurrency(subtotal)} />
      <Row label="TAX" value={formatCurrency(tax)} />
      <Row label="TIP" value={formatCurrency(tip)} last />
    </div>
  );
};

interface RowProps {
  label: string;
  value: string;
  /** Drop the bottom hairline on the final row. */
  last?: boolean;
  /** Render the label in full ink (used for per-receipt total rows). */
  emphasize?: boolean;
}

const Row: React.FC<RowProps> = ({ label, value, last, emphasize }) => (
  <div className={`flex items-center justify-between py-2.5 ${last ? '' : 'border-b border-line'}`}>
    <span className={emphasize ? 'font-bold text-ink' : 'text-ink-muted'}>{label}</span>
    <span className="tabular-nums text-ink">{value}</span>
  </div>
);
