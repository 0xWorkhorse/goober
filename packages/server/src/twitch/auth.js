/**
 * Twitch OAuth — Authorization Code Flow with PKCE.
 *
 * The original spec called for Implicit Flow; that's deprecated and
 * unrefreshable. PKCE gives us refresh tokens and is the right choice for
 * production. Tokens are encrypted-at-rest in production via AES-GCM keyed by
 * TOKEN_ENCRYPTION_KEY (Railway secret) — plain in dev.
 *
 * Public endpoints:
 *   GET  /auth/start               kicks the streamer over to id.twitch.tv
 *   GET  /auth/callback            handles the redirect, exchanges + persists tokens
 *   POST /auth/logout              clears the session cookie (does not revoke the token)
 *
 * The Helix wrapper `helixFetch(channelId, url, init)` auto-refreshes on 401
 * and persists the new token to the channel row.
 */

import crypto from 'node:crypto';
import express from 'express';

import { config, isProd } from '../config.js';
import { log } from '../log.js';
import { channels as channelsRepo } from '../persistence/repos.js';

const TWITCH_AUTH = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN = 'https://id.twitch.tv/oauth2/token';
const HELIX_BASE = 'https://api.twitch.tv/helix';
const SCOPES = ['chat:read'];

// ─── PKCE helpers ───────────────────────────────────────────────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generatePkceVerifier() {
  return base64url(crypto.randomBytes(48));
}

function pkceChallenge(verifier) {
  return base64url(crypto.createHash('sha256').update(verifier).digest());
}

// ─── Token at-rest encryption (AES-GCM) ─────────────────────────────────────

function deriveAesKey() {
  if (!config.tokenEncryptionKey) return null;
  // Hash the env key to a 32-byte AES-256 key.
  return crypto.createHash('sha256').update(config.tokenEncryptionKey).digest();
}

const ENC_PREFIX = 'enc1:';

export function encryptToken(plain) {
  const key = deriveAesKey();
  if (!plain) return plain;
  if (!key) return plain; // dev: plain
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENC_PREFIX + base64url(Buffer.concat([iv, tag, enc]));
}

export function decryptToken(stored) {
  if (!stored) return stored;
  if (!stored.startsWith(ENC_PREFIX)) return stored;
  const key = deriveAesKey();
  if (!key) {
    log.warn('decryptToken called without TOKEN_ENCRYPTION_KEY; returning empty');
    return '';
  }
  try {
    const raw = Buffer.from(stored.slice(ENC_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch (err) {
    log.error({ err: err.message }, 'token decryption failed (key may have rotated)');
    return '';
  }
}

// ─── Session state for the OAuth flow ───────────────────────────────────────
// Keyed by a short opaque cookie; lives in memory. Sufficient for MVP since
// the panel session is short-lived. Production should move this to a signed
// cookie or a server-side store.

const PENDING = new Map(); // sid → { verifier, state, expiresAt }
const PENDING_TTL_MS = 10 * 60_000;

function createPending() {
  const sid = base64url(crypto.randomBytes(18));
  const verifier = generatePkceVerifier();
  const state = base64url(crypto.randomBytes(18));
  PENDING.set(sid, { verifier, state, expiresAt: Date.now() + PENDING_TTL_MS });
  return { sid, verifier, state };
}

function consumePending(sid) {
  const e = PENDING.get(sid);
  if (!e) return null;
  PENDING.delete(sid);
  if (e.expiresAt < Date.now()) return null;
  return e;
}

setInterval(() => {
  const now = Date.now();
  for (const [sid, e] of PENDING) if (e.expiresAt < now) PENDING.delete(sid);
}, 60_000).unref();

// Active session cookies → channel id. Lives in memory; for production this
// should be a signed JWT or persisted server-side.
const SESSIONS = new Map(); // sid → { channelId, expiresAt }
const SESSION_TTL_MS = 7 * 24 * 60 * 60_000;

function createSession(channelId) {
  const sid = base64url(crypto.randomBytes(24));
  SESSIONS.set(sid, { channelId, expiresAt: Date.now() + SESSION_TTL_MS });
  return sid;
}

export function readSession(sid) {
  if (!sid) return null;
  const s = SESSIONS.get(sid);
  if (!s) return null;
  if (s.expiresAt < Date.now()) { SESSIONS.delete(sid); return null; }
  return s;
}

// ─── Helix wrapper with refresh-on-401 ──────────────────────────────────────

export async function refreshToken(channelId) {
  const channel = channelsRepo.get(channelId);
  if (!channel || !channel.twitch_refresh_token) return null;
  const refresh = decryptToken(channel.twitch_refresh_token);
  if (!refresh) return null;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: config.twitch.clientId,
  });
  // Twitch will accept either a public client (no secret) or confidential
  // client (with secret). PKCE clients commonly omit secret; if you set one,
  // include it for stricter validation.
  if (config.twitch.clientSecret) body.set('client_secret', config.twitch.clientSecret);

  const r = await fetch(TWITCH_TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!r.ok) {
    const text = await r.text();
    log.warn({ status: r.status, text }, 'twitch token refresh failed');
    return null;
  }
  const json = await r.json();
  const expiresAt = Date.now() + (json.expires_in || 0) * 1000;
  channelsRepo.setTokens(channelId, {
    token: encryptToken(json.access_token),
    refreshToken: encryptToken(json.refresh_token || refresh),
    expiresAt,
  });
  return json.access_token;
}

export async function helixFetch(channelId, url, init = {}) {
  const channel = channelsRepo.get(channelId);
  if (!channel) throw new Error('channel not found');
  let token = decryptToken(channel.twitch_token);
  const doFetch = (t) => fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      authorization: `Bearer ${t}`,
      'client-id': config.twitch.clientId,
    },
  });
  let r = await doFetch(token);
  if (r.status === 401) {
    const fresh = await refreshToken(channelId);
    if (!fresh) throw new Error('refresh_failed');
    r = await doFetch(fresh);
  }
  return r;
}

// ─── Express routes ─────────────────────────────────────────────────────────

export function buildAuthRoutes() {
  const router = express.Router();

  router.get('/auth/start', (req, res) => {
    if (!config.twitch.clientId) {
      return res.status(503).json({ error: 'twitch_not_configured', hint: 'set TWITCH_CLIENT_ID in .env' });
    }
    const { sid, verifier, state } = createPending();
    res.cookie('brm_oa', sid, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: PENDING_TTL_MS });
    void verifier; // verifier is held server-side under sid
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.twitch.clientId,
      redirect_uri: config.twitch.redirectUri,
      scope: SCOPES.join(' '),
      state,
      code_challenge: pkceChallenge(verifier),
      code_challenge_method: 'S256',
      force_verify: 'true',
    });
    res.redirect(`${TWITCH_AUTH}?${params.toString()}`);
  });

  router.get('/auth/callback', async (req, res) => {
    const sid = req.cookies?.brm_oa || readCookie(req, 'brm_oa');
    const pending = consumePending(sid);
    res.clearCookie('brm_oa');
    if (!pending) return res.status(400).send('OAuth flow expired or invalid; try again.');
    if (req.query.state !== pending.state) return res.status(400).send('OAuth state mismatch.');
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing OAuth code.');

    // Exchange.
    const body = new URLSearchParams({
      client_id: config.twitch.clientId,
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: config.twitch.redirectUri,
      code_verifier: pending.verifier,
    });
    if (config.twitch.clientSecret) body.set('client_secret', config.twitch.clientSecret);

    let json;
    try {
      const r = await fetch(TWITCH_TOKEN, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!r.ok) {
        const text = await r.text();
        log.warn({ status: r.status, text }, 'oauth token exchange failed');
        return res.status(502).send('Twitch token exchange failed.');
      }
      json = await r.json();
    } catch (err) {
      log.error({ err: err.message }, 'oauth fetch error');
      return res.status(502).send('Twitch reachability error.');
    }

    // Resolve user identity via Helix /users using the new token.
    let user;
    try {
      const u = await fetch(`${HELIX_BASE}/users`, {
        headers: { authorization: `Bearer ${json.access_token}`, 'client-id': config.twitch.clientId },
      });
      if (!u.ok) throw new Error('users_failed_' + u.status);
      const data = await u.json();
      user = data?.data?.[0];
      if (!user) throw new Error('no user');
    } catch (err) {
      log.error({ err: err.message }, 'helix users lookup failed');
      return res.status(502).send('Twitch user lookup failed.');
    }

    const expiresAt = Date.now() + (json.expires_in || 0) * 1000;
    channelsRepo.upsert({
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      token: encryptToken(json.access_token),
      refreshToken: encryptToken(json.refresh_token),
      tokenExpiresAt: expiresAt,
    });

    const sessionSid = createSession(user.id);
    res.cookie('brm_sid', sessionSid, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS,
    });
    res.redirect(`/panel?login=ok&channel=${encodeURIComponent(user.id)}`);
  });

  router.post('/auth/logout', (req, res) => {
    const sid = req.cookies?.brm_sid || readCookie(req, 'brm_sid');
    if (sid) SESSIONS.delete(sid);
    res.clearCookie('brm_sid');
    res.json({ ok: true });
  });

  router.get('/auth/me', (req, res) => {
    const sid = req.cookies?.brm_sid || readCookie(req, 'brm_sid');
    const s = readSession(sid);
    if (!s) return res.status(401).json({ error: 'not_authenticated' });
    const ch = channelsRepo.get(s.channelId);
    if (!ch) return res.status(404).json({ error: 'channel_missing' });
    res.json({
      channelId: ch.id,
      login: ch.login,
      displayName: ch.display_name,
      locale: ch.locale,
    });
  });

  return router;
}

/** Manual cookie reader so we don't need cookie-parser as a dep. */
function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';');
  for (const p of parts) {
    const [k, ...v] = p.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
