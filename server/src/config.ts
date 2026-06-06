import dotenv from 'dotenv';
dotenv.config();

/** Typed, frozen configuration loaded from environment variables at startup. */
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/tallies',
  writeRateLimitPerHour: parseInt(process.env.WRITE_RATE_LIMIT_PER_HOUR || '30', 10),
  readRateLimitPerHour: parseInt(process.env.READ_RATE_LIMIT_PER_HOUR || '200', 10),
  maxImageSizeBytes: parseInt(process.env.MAX_IMAGE_SIZE_BYTES || '5242880', 10),
  allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;
