import { z } from 'zod';

// Mirrors `client/src/constants/colors.ts` — keep in sync.
const PERSON_COLOR_KEYS = ['sage', 'gold', 'plum', 'slate', 'rose', 'taupe', 'teal', 'clay'] as const;

const PersonSchema = z.object({
  id: z.string().max(64),
  name: z.string().max(100),
  color: z.enum(PERSON_COLOR_KEYS),
});

const ItemSchema = z.object({
  id: z.string().max(64),
  name: z.string().max(200),
  price: z.number(),
  quantity: z.number().int().positive(),
  assignees: z.array(z.string().max(64)).max(50),
});

const ReceiptSchema = z.object({
  id: z.string().max(64),
  merchant: z.string().max(100).nullable().optional(),
  date: z.string().max(50).nullable().optional(),
  items: z.array(ItemSchema).max(200),
  tax: z.number().nonnegative(),
  taxIsPercent: z.boolean(),
  tip: z.number().nonnegative(),
  tipIsPercent: z.boolean(),
});

/** Validated shape of a serialized bill stored under a share ID. A bill is one or more receipts (each with its
 *  own items + tax/tip) plus a shared set of people. Aggregates (subtotals/total) are derived from items + tax/tip
 *  at render time — not persisted, to avoid drift. */
export const BillPayloadSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  receipts: z.array(ReceiptSchema).max(20),
  people: z.array(PersonSchema).max(50),
  /** Optional Venmo handle of whoever fronted the bill, so recipients get a pay button. Sanitized client-side; mirror that here. */
  venmoUsername: z.string().regex(/^[A-Za-z0-9_-]{1,30}$/).nullable().optional(),
});

/** Inferred TypeScript type for a validated bill payload. */
export type BillPayload = z.infer<typeof BillPayloadSchema>;
