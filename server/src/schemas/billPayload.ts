import { z } from 'zod';

// Mirrors `client/src/constants/colors.ts` — keep in sync.
const PERSON_COLOR_KEYS = ['slate', 'gold', 'plum', 'sage', 'rose', 'teal', 'taupe', 'clay'] as const;

/** Characters JSONB can't store: NUL, and either half of an emoji's surrogate pair on its own. */
const UNSTORABLE = /\u0000|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

/** Text up to `maxLength` that Postgres can store, so a bad character fails validation rather than the insert. */
const storableText = (maxLength: number) => z.string().max(maxLength).refine((text) => !UNSTORABLE.test(text));

const PersonSchema = z.object({
  id: storableText(64),
  name: storableText(100),
  color: z.enum(PERSON_COLOR_KEYS),
});

const ItemSchema = z.object({
  id: storableText(64),
  name: storableText(200),
  price: z.number().nonnegative().finite(),
  quantity: z.number().int().positive(),
  assignees: z.array(storableText(64)).max(50),
});

const ReceiptSchema = z.object({
  id: storableText(64),
  merchant: storableText(100),
  date: storableText(50),
  items: z.array(ItemSchema).max(200),
  tax: z.number().nonnegative().finite(),
  taxIsPercent: z.boolean(),
  tip: z.number().nonnegative().finite(),
  tipIsPercent: z.boolean(),
});

/**
 * Validated shape of a bill stored under a share ID: its receipts (each with items and tax/tip) and shared people.
 * Totals are derived from these at render time, never stored, so they can't drift.
 */
export const BillPayloadSchema = z
  .object({
    name: storableText(100).nullable().optional(),
    receipts: z.array(ReceiptSchema).max(20),
    people: z.array(PersonSchema).max(50),
    /** Optional ID of the person who paid; everyone else owes them. Must name someone in `people`. */
    payerId: storableText(64).nullable().optional(),
    /**
     * Optional Venmo handle of whoever fronted the bill, so recipients get a pay button. Sanitized client-side; mirror
     * that here.
     */
    venmoUsername: z.string().regex(/^[A-Za-z0-9_-]{1,30}$/).nullable().optional(),
  })
  .refine((bill) => !bill.payerId || bill.people.some((p) => p.id === bill.payerId), {
    message: 'payerId must match a person on the bill',
    path: ['payerId'],
  });

/** Inferred TypeScript type for a validated bill payload. */
export type BillPayload = z.infer<typeof BillPayloadSchema>;
