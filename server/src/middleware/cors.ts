import cors from 'cors';

import { config } from '../config';

import type { CorsOptions } from 'cors';

/**
 * Build the CORS middleware from `config.allowedOrigins` (comma-separated allowlist, or `*`).
 * @returns Configured `cors` middleware — reflects the specific allowlist, or `*` when unset
 */
export const createCorsMiddleware = () => {
  const parsedOrigins = config.allowedOrigins === '*'
    ? ['*']
    : config.allowedOrigins.split(',').map((o) => o.trim());

  const origin = parsedOrigins.length === 1 && parsedOrigins[0] === '*'
    ? '*'
    : parsedOrigins;

  const options: CorsOptions = { origin };
  return cors(options);
};
