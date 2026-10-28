import dotenv from 'dotenv';
dotenv.config();

/** Typed configuration read from environment variables at startup, with local-dev defaults. */
export const config = {
  port: readCount('PORT', 3001),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/tallies',
  writeRateLimitPerHour: readCount('WRITE_RATE_LIMIT_PER_HOUR', 30),
  readRateLimitPerHour: readCount('READ_RATE_LIMIT_PER_HOUR', 200),
  maxImageSizeBytes: readCount('MAX_IMAGE_SIZE_BYTES', 5242880),
  allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
} as const;

/**
 * Read a whole-number env var, stopping startup on a malformed one rather than running misconfigured (a `NaN` rate
 * limit lets every request through).
 * @param name - The variable's name
 * @param fallback - The value when it's unset or empty
 * @returns The parsed value
 */
function readCount(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a whole number, got "${raw}"`);
  return value;
}
