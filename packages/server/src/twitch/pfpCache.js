/**
 * Twitch profile-picture cache. Looks up `profile_image_url` for chatter
 * logins via the Helix `/users` endpoint (batched up to 100 logins per call,
 * coalesced over a ~250ms window). Persists results in-memory with a TTL.
 *
 * For dev / demo channels with no real Twitch credentials, falls back to a
 * deterministic dicebear avatar so chatters still get a stable visual.
 */

import { config } from '../config.js';
import { log } from '../log.js';

const TTL_MS = 24 * 60 * 60_000; // 1 day
const BATCH_WINDOW_MS = 250;
const HELIX_USERS = 'https://api.twitch.tv/helix/users';

const cache = new Map(); // login → { url, expiresAt }
const pending = new Map(); // login → Promise resolver
let batchTimer = null;
let batchQueue = new Set();

/** Stable fallback PFP — same per login, no network calls. */
export function fallbackPfp(login) {
  // Dicebear is OK to inline since it returns SVG and supports a deterministic seed.
  // Keeps the demo + auth-less paths visually populated.
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(login)}&backgroundType=solid&backgroundColor=fdfaf3`;
}

/**
 * Get the PFP URL for a login. Returns the cached URL synchronously if
 * available; otherwise schedules a batched lookup and returns the fallback.
 *
 * @param {string} login
 * @param {(url: string) => void} [onResolve]  optional callback when fresh URL lands
 * @returns {string} URL to render right now (cached real value or fallback)
 */
export function pfpFor(login, onResolve) {
  const lower = String(login || '').toLowerCase();
  if (!lower) return fallbackPfp('');
  const hit = cache.get(lower);
  const now = Date.now();
  if (hit && hit.expiresAt > now) return hit.url;

  // No real Twitch credentials configured → use deterministic fallback.
  if (!config.twitch.clientId || !config.twitch.clientSecret) {
    const url = fallbackPfp(lower);
    cache.set(lower, { url, expiresAt: now + TTL_MS });
    return url;
  }

  // Schedule a real Helix lookup.
  if (onResolve && typeof onResolve === 'function') pending.set(lower, onResolve);
  batchQueue.add(lower);
  if (!batchTimer) batchTimer = setTimeout(flushBatch, BATCH_WINDOW_MS);
  return fallbackPfp(lower);
}

async function flushBatch() {
  batchTimer = null;
  if (!batchQueue.size) return;
  const logins = [...batchQueue].slice(0, 100);
  batchQueue = new Set([...batchQueue].slice(100));
  if (batchQueue.size && !batchTimer) batchTimer = setTimeout(flushBatch, BATCH_WINDOW_MS);

  const token = await getAppAccessToken();
  if (!token) {
    // Fall back for everyone in this batch.
    for (const l of logins) {
      const url = fallbackPfp(l);
      cache.set(l, { url, expiresAt: Date.now() + TTL_MS });
      const cb = pending.get(l);
      if (cb) { cb(url); pending.delete(l); }
    }
    return;
  }

  const params = logins.map((l) => `login=${encodeURIComponent(l)}`).join('&');
  try {
    const r = await fetch(`${HELIX_USERS}?${params}`, {
      headers: { Authorization: `Bearer ${token}`, 'Client-Id': config.twitch.clientId },
    });
    if (!r.ok) throw new Error('helix_status_' + r.status);
    const json = await r.json();
    const found = new Set();
    for (const u of json.data || []) {
      const login = (u.login || '').toLowerCase();
      const url = u.profile_image_url || fallbackPfp(login);
      cache.set(login, { url, expiresAt: Date.now() + TTL_MS });
      found.add(login);
      const cb = pending.get(login);
      if (cb) { cb(url); pending.delete(login); }
    }
    // Logins Helix didn't recognize → cache the fallback so we don't keep retrying.
    for (const l of logins) {
      if (found.has(l)) continue;
      const url = fallbackPfp(l);
      cache.set(l, { url, expiresAt: Date.now() + TTL_MS });
      const cb = pending.get(l);
      if (cb) { cb(url); pending.delete(l); }
    }
  } catch (err) {
    log.warn({ err: err.message }, 'helix pfp lookup failed; using fallback');
    for (const l of logins) {
      const url = fallbackPfp(l);
      cache.set(l, { url, expiresAt: Date.now() + TTL_MS });
      const cb = pending.get(l);
      if (cb) { cb(url); pending.delete(l); }
    }
  }
}

// ─── App-access token (client-credentials) ──────────────────────────────────
let appToken = null;
let appTokenExpiresAt = 0;
async function getAppAccessToken() {
  if (appToken && appTokenExpiresAt > Date.now() + 60_000) return appToken;
  if (!config.twitch.clientId || !config.twitch.clientSecret) return null;
  const body = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials',
  });
  try {
    const r = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST', body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    if (!r.ok) throw new Error('app_token_status_' + r.status);
    const json = await r.json();
    appToken = json.access_token;
    appTokenExpiresAt = Date.now() + (json.expires_in || 3600) * 1000;
    return appToken;
  } catch (err) {
    log.warn({ err: err.message }, 'failed to fetch Twitch app access token');
    return null;
  }
}
