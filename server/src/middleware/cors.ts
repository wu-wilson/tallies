import cors from 'cors';

import { config } from '../config';

import type { CorsOptions } from 'cors';

/**
 * Build the CORS middleware from `config.allowedOrigins` (comma-separated allowlist, or `*`).
 * Refuses to boot (exits 1) when `NODE_ENV=production` and the allowlist still contains `*`, so a
 * misconfigured production deploy fails fast at startup instead of silently serving open CORS.
 * @returns Configured `cors` middleware — reflects the specific allowlist, or `*` outside production
 */
export const createCorsMiddleware = () => {
  const parsedOrigins = config.allowedOrigins === '*'
    ? ['*']
    : config.allowedOrigins.split(',').map((o) => o.trim());

  if (config.nodeEnv === 'production' && parsedOrigins.includes('*')) {
    console.error('FATAL: ALLOWED_ORIGINS must not contain "*" in production');
    process.exit(1);
  }

  const origin = parsedOrigins.length === 1 && parsedOrigins[0] === '*'
    ? '*'
    : parsedOrigins;

  const options: CorsOptions = { origin };
  return cors(options);
};
