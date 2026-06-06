import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import { config } from './config';
import { initDb } from './services/db';
import { createCorsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { ocrRouter } from './routes/ocr';
import { billsRouter } from './routes/bills';

const app = express();

// Resolves req.ip to the client behind Railway's proxy.
app.set('trust proxy', 1);

// Middleware
app.use(createCorsMiddleware());
app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'tallies-api' });
});

// Routes
app.use('/api', ocrRouter);
app.use('/api', billsRouter);

// Error handler (tail)
app.use(errorHandler);

// Start (after the DB connection probe)
initDb().then(() => {
  app.listen(config.port, () => {
    console.log(`Tallies API running on port ${config.port}`);
  });
});
