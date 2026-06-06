import { Request, Response, NextFunction } from 'express';

import { config } from '../config';

/**
 * Express error-handling middleware — the single tail handler for the app.
 * A numeric `.status` on the error becomes the response code (default 500). The raw `err.message` is only
 * echoed to the client when `.isPublic === true`; everything else is genericized to "Internal server error"
 * so upstream wording (pg, multer, SDKs) never leaks. Stack is included in the response only in development.
 * @param err - Error thrown or passed via `next(err)`; may carry `.status` and `.isPublic`
 * @param _req - Express request (unused but required by the 4-arg signature)
 * @param res - Express response, written with the resolved status + body
 * @param _next - Express next (unused but required by the 4-arg signature)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`Error: ${err.message}`);

  const typed = err as Error & { status?: number; isPublic?: boolean };
  const status = typed.status || 500;
  const message = typed.isPublic && err.message ? err.message : 'Internal server error';

  const body: { error: string; stack?: string } = { error: message };

  if (config.nodeEnv === 'development') {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}
