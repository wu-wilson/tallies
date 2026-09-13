import cors from 'cors';

import { config } from '../config';

import type { CorsOptions } from 'cors';

/**
 * Build the CORS middleware from `config.allowedOrigins` (comma-separated allowlist, or `*`).
 * @returns Configured `cors` middleware — reflects the specific allowlist, or `*` when unset
 */
export const createCorsMiddleware = () => {
  const origin = config.allowedOrigins === '*'
    ? '*'
    : config.allowedOrigins.split(',').map((o) => o.trim());

  const options: CorsOptions = { origin };
  return cors(options);
};
