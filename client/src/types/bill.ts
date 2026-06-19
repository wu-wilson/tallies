import type { PersonColorKey } from '../constants/colors';

/** Which flow screen is currently visible. `landing` is the marketing front door; `share` is the post-create confirmation. */
export type Screen = 'landing' | 'capture' | 'verify' | 'result' | 'share';

/** A person on the bill, with an auto-assigned color. */
export interface Person {
  id: string;
  name: string;
  /** One of the 8 person colors, auto-assigned by `nextColor` when added. */
  color: PersonColorKey;
}

/** A single bill line item. */
export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  /** Person IDs sharing this item; empty array means unassigned (excluded from breakdowns). */
  assignees: string[];
}

/** One receipt within a bill — its own merchant, items, and tax/tip. People are shared across all receipts in a bill. */
export interface Receipt {
  id: string;
  merchant: string;
  date: string;
  items: BillItem[];
  tax: number;
  /** When true, `tax` is a percent of this receipt's items subtotal; when false, a flat dollar amount. */
  taxIsPercent: boolean;
  tip: number;
  /** When true, `tip` is a percent of this receipt's items subtotal; when false, a flat dollar amount. */
  tipIsPercent: boolean;
}
