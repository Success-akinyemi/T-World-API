import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'https://tworld.com',
  port: Number(process.env.PORT) || 5000,
  mongoUri: requireEnv('MONGODB_URI'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
};
