import rateLimit from 'express-rate-limit';

import { config } from '../config';

/** Single shared rate limiter mounted on POST /api/bills and POST /api/ocr — `config.writeRateLimitPerHour`/hr/IP combined across both endpoints (default 30). */
export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.writeRateLimitPerHour,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — try again later' },
});

/** Rate limiter for GET /api/bills/:id — `config.readRateLimitPerHour`/hr/IP (default 200). */
export const readLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.readRateLimitPerHour,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — try again later' },
});
