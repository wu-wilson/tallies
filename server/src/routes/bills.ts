/** Bill sharing routes: POST /api/bills (create) and GET /api/bills/:id (read). */
import { Router } from 'express';

import { writeLimiter, readLimiter } from '../middleware/rateLimiter';
import { BillPayloadSchema } from '../schemas/billPayload';
import { saveBill, getBill } from '../services/shortLinks';

const router = Router();

router.post('/bills', writeLimiter, async (req, res, next) => {
  try {
    const validated = BillPayloadSchema.safeParse(req.body);
    if (!validated.success) {
      console.error(`Invalid bill payload: ${JSON.stringify(validated.error.issues)}`);
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

router.get('/bills/:id', readLimiter, async (req, res, next) => {
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

export { router as billsRouter };
