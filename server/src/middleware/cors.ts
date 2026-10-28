import cors from 'cors';

import { config } from '../config';

import type { NextFunction, Request, Response } from 'express';

/** The origins in `config.allowedOrigins`, or `*` for any. */
const allowedOrigins = config.allowedOrigins === '*'
  ? '*'
  : config.allowedOrigins.split(',').map((o) => o.trim());

/**
 * Build the CORS middleware from `config.allowedOrigins` (comma-separated allowlist, or `*`).
 * @returns Configured `cors` middleware — reflects the specific allowlist, or `*` when unset
 */
export const createCorsMiddleware = () => cors({ origin: allowedOrigins });

/**
 * Refuse a request sent from a page outside the allowlist. CORS only hides the response from that page, and a
 * multipart upload needs no preflight, so another site could otherwise run billed scans through its visitors.
 * @param req - The request; one with no `Origin` header (curl, the health check) passes
 * @param res - Express response, sent a 403 for a foreign origin
 * @param next - Called when the origin is allowed
 */
export function rejectForeignOrigins(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('origin');
  if (allowedOrigins === '*' || origin === undefined || allowedOrigins.includes(origin)) {
    next();
    return;
  }
  res.status(403).json({ error: 'Something went wrong. Try again.' });
}
