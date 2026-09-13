import { Router } from 'express';

import { readLimiter, writeLimiter } from '../middleware/rateLimiter';
import { BillPayloadSchema } from '../schemas/billPayload';
import { getBill, saveBill } from '../services/shortLinks';

import { formatIssues } from '../lib/formatIssues';

/** Bill sharing routes: `POST /api/bills` stores a validated bill and returns its share ID; `GET /api/bills/:id` reads one (404 when missing or expired). */
export const billsRouter = Router();

billsRouter.post('/bills', writeLimiter, async (req, res, next) => {
  try {
    const validated = BillPayloadSchema.safeParse(req.body);
    if (!validated.success) {
      console.error(`Invalid bill payload: ${formatIssues(validated.error.issues)}`);
      res.status(400).json({ error: 'Invalid bill data' });
      return;
    }

    const id = await saveBill(validated.data);
    console.log(`Bill created: ${id}`);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

const ID_PATTERN = /^[a-zA-Z0-9]{8}$/;

billsRouter.get('/bills/:id', readLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ID_PATTERN.test(id)) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    const stored = await getBill(id);
    if (!stored) {
      console.log(`Bill not found or expired: ${id}`);
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    console.log(`Bill retrieved: ${id}`);
    res.json({ ...stored.data, expiresAt: stored.expiresAt.toISOString() });
  } catch (err) {
    next(err);
  }
});
