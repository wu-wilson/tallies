import type { NextFunction, Request, Response } from 'express';

/**
 * Express error-handling middleware, the single tail handler for the app: a numeric `.status`/`.statusCode` becomes
 * the response code (default 500). Only `.isPublic` messages reach the client, so upstream wording never leaks.
 * @param err - Error thrown or passed via `next(err)`; may carry `.status`/`.statusCode` and `.isPublic`
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
  const typed = err as Error & { status?: number; statusCode?: number; isPublic?: boolean; type?: string };
  // Log the stack only, never the error object, which can carry a request body. A JSON parse error's message quotes
  // the body itself, so it gets a fixed line instead.
  const isParseError = typed.type === 'entity.parse.failed';
  console.error(isParseError ? 'Malformed JSON body' : (err.stack ?? `${err.name}: ${err.message}`));

  const status = typed.status || typed.statusCode || 500;
  let message: string;
  if (typed.isPublic && err.message) {
    message = err.message;
  } else if (status === 413) {
    message = 'This bill is too large to share.';
  } else {
    message = 'Something went wrong. Try again.';
  }

  res.status(status).json({ error: message });
}
