import { z } from 'zod';

const OcrItemSchema = z.object({
  name: z.string().max(200),
  price: z.number().nonnegative(),
  quantity: z.number().positive().default(1),
});

/** Validated shape of the JSON returned by the OCR model. */
export const OcrResponseSchema = z.object({
  merchant: z.string().max(100).nullable().optional(),
  date: z.string().max(50).nullable().optional(),
  items: z.array(OcrItemSchema).max(200),
  subtotal: z.number().nonnegative().nullable().optional(),
  tax: z.number().nonnegative().nullable().optional(),
  tip: z.number().nonnegative().nullable().optional(),
  total: z.number().nonnegative().nullable().optional(),
});
