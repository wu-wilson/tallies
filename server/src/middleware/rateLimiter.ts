import rateLimit from 'express-rate-limit';

import { config } from '../config';

/**
 * Single shared rate limiter mounted on POST /api/bills and POST /api/ocr — `config.writeRateLimitPerHour`/hr/IP
 * combined across both endpoints (default 30).
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.writeRateLimitPerHour,
  // A provider hands each IPv6 customer a block of addresses to rotate through, so the whole /56 shares one count.
  ipv6Subnet: 56,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

/** Rate limiter for GET /api/bills/:id — `config.readRateLimitPerHour`/hr/IP (default 200). */
export const readLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.readRateLimitPerHour,
  ipv6Subnet: 56,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});
