import React from 'react';

import { formatCurrency } from '../../lib/billMath';

interface BillSummaryProps {
  subtotal: number;
  /** Tax in dollars (already resolved from percent if applicable). */
  tax: number;
  /** Tip in dollars (already resolved from percent if applicable). */
  tip: number;
  /** Pre-composed label like `"Tax · 7.5%"` rendered on the tax row. */
  taxLabel: string;
  /** Pre-composed label like `"Tip · 20%"` rendered on the tip row. */
  tipLabel: string;
}

/**
 * Three-row summary (subtotal, tax, tip) shown above the per-person cards on Result and SharedView.
 * @param props - Summary values + pre-composed labels
 * @returns Divided list of three rows
 */
export const BillSummary: React.FC<BillSummaryProps> = ({
  subtotal,
  tax,
  tip,
  taxLabel,
  tipLabel,
}) => {
  return (
    <div className="divide-y divide-border-subtle text-xs">
      <Row label="Subtotal" value={formatCurrency(subtotal)} />
      <Row label={taxLabel} value={formatCurrency(tax)} />
      <Row label={tipLabel} value={formatCurrency(tip)} />
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
