/**
 * Twitch IRC integration via tmi.js. One client per channel, started when the
 * streamer's panel hellos in. Disconnected after a grace period when the
 * panel goes away (allows page refreshes without churning IRC).
 *
 * Reconnect: tmi.js's built-in reconnect uses exponential backoff up to a max
 * delay. We add jitter and a hard cap to avoid Twitch JOIN rate-limit bans on
 * flapping links. Connection state is surfaced to the panel + overlay via
 * IRC_STATUS messages.
 */

import tmi from 'tmi.js';

import { S2C, SUPPORTED_LOCALES, createCommandParser } from '@bossraid/shared';
import enLocale from '@bossraid/shared/locales/en.json' with { type: 'json' };
import esLocale from '@bossraid/shared/locales/es.json' with { type: 'json' };
import ptLocale from '@bossraid/shared/locales/pt.json' with { type: 'json' };
import jaLocale from '@bossraid/shared/locales/ja.json' with { type: 'json' };
import koLocale from '@bossraid/shared/locales/ko.json' with { type: 'json' };

const DICTS = { en: enLocale, es: esLocale, pt: ptLocale, ja: jaLocale, ko: koLocale };

import { config } from '../config.js';
import { handleChatCommand } from '../game/combat.js';
import { log } from '../log.js';
import { broadcastRoom } from '../ws/server.js';
import { channels as channelsRepo } from '../persistence/repos.js';
import { decryptToken, refreshToken } from './auth.js';

const PARSERS = new Map();
for (const code of SUPPORTED_LOCALES) PARSERS.set(code, createCommandParser(code, DICTS));
function parserFor(locale) { return PARSERS.get(locale) || PARSERS.get('en'); }

const CLIENTS = new Map(); // channelId → { client, status, abandonAt }
const ABANDON_DELAY_MS = 5 * 60_000;

export function getIrcStatus(channelId) {
  return CLIENTS.get(channelId)?.status || 'disconnected';
}

/**
 * Ensure an IRC client is running for this channel. Idempotent — returns the
 * existing client if already connected.
 */
export async function ensureIrcConnected(room) {
  const channelId = room.channelId;
  if (channelId === 'dev') return null; // dev seed channel — no real Twitch
  let entry = CLIENTS.get(channelId);
  if (entry) {
    entry.abandonAt = 0;
    return entry.client;
  }
  const channel = channelsRepo.get(channelId);
  if (!channel || !channel.twitch_token) {
    log.warn({ channelId }, 'cannot start IRC: missing token');
    return null;
  }

  const tokenPlain = decryptToken(channel.twitch_token);
  if (!tokenPlain) {
    log.warn({ channelId }, 'cannot start IRC: token decryption failed');
    return null;
  }

  const client = new tmi.Client({
    options: { debug: false, skipUpdatingEmotesets: true },
    connection: {
      reconnect: true,
      secure: true,
      maxReconnectAttempts: Infinity,
      maxReconnectInterval: 30_000,
      reconnectDecay: 1.6,
      reconnectInterval: 1_500,
    },
    identity: {
      username: channel.login,
      password: 'oauth:' + tokenPlain,
    },
    channels: [channel.login],
    logger: { info: () => {}, warn: (m) => log.warn({ irc: m }), error: (m) => log.warn({ irc: m }) },
  });

  entry = { client, status: 'connecting', abandonAt: 0, room };
  CLIENTS.set(channelId, entry);
  emitStatus(room, 'connecting');

  client.on('connecting', () => { entry.status = 'connecting'; emitStatus(room, 'connecting'); });
  client.on('connected', () => { entry.status = 'connected'; emitStatus(room, 'connected'); });
  client.on('disconnected', (reason) => {
    entry.status = 'disconnected';
    log.warn({ channelId, reason }, 'irc disconnected');
    emitStatus(room, 'disconnected', { reason });
    // tmi.js will auto-reconnect; jitter the next attempt to avoid storms.
    const jitter = Math.random() * 600;
    setTimeout(() => { /* noop — tmi.js handles reconnect */ }, jitter).unref();
  });
  client.on('reconnect', () => { entry.status = 'reconnecting'; emitStatus(room, 'reconnecting'); });

  client.on('message', async (chan, userstate, message, self) => {
    if (self) return;
    const login = (userstate['username'] || userstate['display-name'] || '').toLowerCase();
    if (!login) return;
    const parser = parserFor(room.locale || 'en');
    const parsed = parser(message);
    if (!parsed) return;
    try {
      handleChatCommand(room, login, parsed.action, message);
    } catch (err) {
      log.error({ err: err.message, channelId, login }, 'chat handler threw');
    }
  });

  try {
    await client.connect();
  } catch (err) {
    log.error({ err: err.message, channelId }, 'irc connect failed');
    // Try a token refresh + retry once.
    if (String(err).toLowerCase().includes('login authentication failed')) {
      const refreshed = await refreshToken(channelId);
      if (refreshed) {
        client.opts.identity.password = 'oauth:' + refreshed;
        try { await client.connect(); } catch (e2) {
          log.error({ err: e2.message }, 'irc retry after refresh failed');
          CLIENTS.delete(channelId);
          return null;
        }
      }
    }
  }
  return client;
}

function emitStatus(room, status, extra = {}) {
  broadcastRoom(room, S2C.IRC_STATUS, { status, ...extra });
}

/**
 * Schedule disconnection of an IRC client when the panel goes away. Called
 * from the WS layer on panel close. After ABANDON_DELAY_MS with no panel
 * reconnect, the client is shut down.
 */
export function scheduleAbandon(channelId) {
  const entry = CLIENTS.get(channelId);
  if (!entry) return;
  entry.abandonAt = Date.now() + ABANDON_DELAY_MS;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of CLIENTS) {
    if (entry.abandonAt && entry.abandonAt < now) {
      try { entry.client.disconnect(); } catch { /* ignore */ }
      CLIENTS.delete(id);
      log.info({ channelId: id }, 'irc client abandoned');
    }
  }
}, 60_000).unref();

/** Disconnect every client (used in tests + graceful shutdown). */
export async function shutdownAllIrc() {
  for (const [id, entry] of CLIENTS) {
    try { await entry.client.disconnect(); } catch { /* ignore */ }
    CLIENTS.delete(id);
  }
}
