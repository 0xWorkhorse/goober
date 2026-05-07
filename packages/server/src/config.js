import 'dotenv/config';
import path from 'node:path';

function bool(v, fallback = false) {
  if (v == null) return fallback;
  return /^(1|true|yes|on)$/i.test(String(v));
}

function int(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 3000),
  databasePath: process.env.DATABASE_PATH || path.resolve('./data/bossraid.db'),
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    redirectUri: process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  },
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  logRawChatEvents: bool(process.env.LOG_RAW_CHAT_EVENTS, false),
  /** When > 1, divides phase durations for fast smoke tests. Dev-only. */
  fastTimersFactor: Math.max(1, int(process.env.FAST_TIMERS_FACTOR, 1)),
});

export const isDev = config.env !== 'production';
export const isProd = config.env === 'production';
