import http from 'node:http';

import express from 'express';

import { SUPPORTED_LOCALES, createCommandParser } from '@bossraid/shared';
import enLocale from '@bossraid/shared/locales/en.json' with { type: 'json' };
import esLocale from '@bossraid/shared/locales/es.json' with { type: 'json' };
import ptLocale from '@bossraid/shared/locales/pt.json' with { type: 'json' };
import jaLocale from '@bossraid/shared/locales/ja.json' with { type: 'json' };
import koLocale from '@bossraid/shared/locales/ko.json' with { type: 'json' };

const dictionaries = { en: enLocale, es: esLocale, pt: ptLocale, ja: jaLocale, ko: koLocale };

import { config } from './config.js';
import { log } from './log.js';
import { db, checkpointAndClose } from './persistence/db.js';
import { buildRoutes } from './http/routes.js';
import { buildStaticRoutes } from './http/static.js';
import { attachWsServer } from './ws/server.js';
import { pruneIdleRooms } from './game/room.js';
import { handleChatCommand } from './game/combat.js';
import { buildAuthRoutes } from './twitch/auth.js';
import { shutdownAllIrc } from './twitch/irc.js';

const rooms = new Map();

// Per-locale command parsers cached for efficiency.
const parsers = new Map();
for (const code of SUPPORTED_LOCALES) parsers.set(code, createCommandParser(code, dictionaries));

function parserFor(locale) {
  return parsers.get(locale) || parsers.get('en');
}

const ctx = {
  rooms,
  /**
   * Inject a chat message into a room. Used by /dev/simulate-chat and (in
   * step 12) by the live tmi.js IRC client.
   */
  simulateChat({ room, username, message }) {
    const parser = parserFor(room.locale);
    const parsed = parser(message);
    if (!parsed) return { parsed: false };
    const result = handleChatCommand(room, username.toLowerCase(), parsed.action, message);
    return { parsed: true, action: parsed.action, ...result };
  },
};

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(buildAuthRoutes());
app.use(buildRoutes(ctx));
app.use(buildStaticRoutes());

const server = http.createServer(app);
attachWsServer(server, { rooms });

// Initialize DB (migrations apply on first call).
db();

server.listen(config.port, () => {
  log.info({ port: config.port, env: config.env }, 'BossRaid server listening');
});

setInterval(() => pruneIdleRooms(rooms), 60_000);

// ─── Graceful shutdown ──────────────────────────────────────────────────────
function shutdown(signal) {
  log.info({ signal }, 'shutdown requested');
  // Close IRC clients first so Twitch sees a clean PART before we drop the process.
  shutdownAllIrc().catch(() => {});
  server.close(() => {
    checkpointAndClose();
    log.info('shutdown complete');
    process.exit(0);
  });
  // Hard exit if anything stalls.
  setTimeout(() => process.exit(1), 5_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => log.error({ err }, 'unhandledRejection'));
process.on('uncaughtException', (err) => {
  log.fatal({ err }, 'uncaughtException');
  setTimeout(() => process.exit(1), 100).unref();
});
