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

/**
 * Structured-output schema (`output_config.format`) mirroring `OcrResponseSchema` so the model emits
 * conformant JSON. Keep in sync; value bounds aren't expressible here and stay on the Zod schema.
 */
export const OCR_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['merchant', 'date', 'items', 'subtotal', 'tax', 'tip', 'total'],
  properties: {
    merchant: { type: ['string', 'null'] },
    date: { type: ['string', 'null'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'price', 'quantity'],
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' },
        },
      },
    },
    subtotal: { type: ['number', 'null'] },
    tax: { type: ['number', 'null'] },
    tip: { type: ['number', 'null'] },
    total: { type: ['number', 'null'] },
  },
};
