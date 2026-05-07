import express from 'express';

import { isDev } from '../config.js';
import { getOrCreateRoom } from '../game/room.js';
import { log } from '../log.js';
import {
  channels as channelsRepo,
  fights as fightsRepo,
  monsters as monstersRepo,
} from '../persistence/repos.js';
import { db } from '../persistence/db.js';
import { readSession } from '../twitch/auth.js';

/**
 * @param {{rooms: Map}} ctx
 */
export function buildRoutes(ctx) {
  const router = express.Router();

  router.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
  });

  // ── Channel-scoped read endpoints ─────────────────────────────────────
  router.get('/api/graveyard', requireAuth, (req, res) => {
    const channelId = req.session.channelId;
    const list = monstersRepo.listForChannel(channelId, { status: 'dead', limit: 100 });
    const retired = monstersRepo.listForChannel(channelId, { status: 'retired', limit: 50 });
    res.json({
      monsters: [...list, ...retired].map((m) => ({
        id: m.id, name: m.name, status: m.status,
        appearance: m.appearance, abilityIds: m.abilityIds,
        level: m.level, peakLevel: m.peakLevel, wins: m.wins,
        timesRevived: m.timesRevived,
        diedAt: m.diedAt,
        createdAt: m.createdAt,
      })),
    });
  });

  router.get('/api/fights', requireAuth, (req, res) => {
    res.json({ fights: fightsRepo.listForChannel(req.session.channelId, 50) });
  });

  router.get('/api/me/legacy', requireAuth, (req, res) => {
    const ch = channelsRepo.get(req.session.channelId);
    res.json({ legacyPoints: ch?.legacy_points ?? 0 });
  });

  // ── Balance export — aggregated telemetry for tuning ──────────────────
  router.get('/api/balance/export', requireAuth, (req, res) => {
    const channelId = req.session.channelId;
    const handle = db();
    const fights = handle
      .prepare('SELECT * FROM fights WHERE channel_id = ? ORDER BY ended_at DESC LIMIT 200')
      .all(channelId);
    const abilityAgg = handle
      .prepare(`
        SELECT a.ability_id, COUNT(*) AS fight_count, SUM(a.cast_count) AS casts,
               SUM(a.damage_dealt) AS damage_dealt
        FROM fight_ability_uses a
        JOIN fights f ON f.id = a.fight_id
        WHERE f.channel_id = ?
        GROUP BY a.ability_id
        ORDER BY damage_dealt DESC
      `)
      .all(channelId);
    const winRateByLevel = handle
      .prepare(`
        SELECT monster_level_at_fight AS level,
               SUM(CASE WHEN victory_for = 'chat' THEN 1 ELSE 0 END) AS chat_wins,
               SUM(CASE WHEN victory_for = 'boss' THEN 1 ELSE 0 END) AS boss_wins,
               COUNT(*) AS total
        FROM fights WHERE channel_id = ?
        GROUP BY monster_level_at_fight
        ORDER BY level
      `)
      .all(channelId);
    res.json({ fights, abilityAgg, winRateByLevel });
  });

  router.get('/api/rooms', (_req, res) => {
    const summary = [...ctx.rooms.entries()].map(([id, room]) => ({
      channelId: id,
      phase: room.phase,
      panels: room.panels.size,
      overlays: room.overlays.size,
      chatters: room.chatters.size,
      locale: room.locale,
    }));
    res.json({ rooms: summary });
  });

  // ── Dev-only routes ──────────────────────────────────────────────────────
  if (isDev) {
    /**
     * Inject a synthetic chat message. Intended for the /dev/sim test harness
     * and Vitest specs. Disabled in production.
     */
    router.post('/dev/simulate-chat', express.json(), (req, res) => {
      const { channelId = 'dev', username, message } = req.body || {};
      if (!username || !message) return res.status(400).json({ error: 'username+message required' });
      const room = getOrCreateRoom(ctx.rooms, channelId);
      const handler = ctx.simulateChat;
      if (!handler) return res.status(503).json({ error: 'sim handler not yet wired' });
      try {
        const result = handler({ room, username, message });
        return res.json({ ok: true, result });
      } catch (err) {
        log.warn({ err }, 'simulate-chat failed');
        return res.status(500).json({ error: 'sim failed' });
      }
    });

    router.get('/dev/sim', (_req, res) => {
      res.type('html').send(devSimHtml());
    });
  }

  return router;
}

/** Attach `req.session` if a valid session cookie is present, else 401. */
function requireAuth(req, res, next) {
  const sid = req.cookies?.brm_sid || readCookie(req, 'brm_sid');
  const session = readSession(sid);
  if (!session) return res.status(401).json({ error: 'not_authenticated' });
  req.session = session;
  next();
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const p of raw.split(';')) {
    const [k, ...v] = p.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function devSimHtml() {
  return `<!doctype html>
<meta charset="utf-8">
<title>BossRaid — dev sim</title>
<style>
  body { font: 14px system-ui; max-width: 720px; margin: 24px auto; padding: 0 16px; }
  fieldset { margin-bottom: 12px; }
  button { margin-right: 6px; }
  input { padding: 4px 6px; }
  pre { background: #f4f4f4; padding: 8px; max-height: 240px; overflow: auto; }
</style>
<h1>Dev chat simulator</h1>
<fieldset>
  <label>Channel <input id="ch" value="dev"></label>
  <label>User <input id="user" value="testuser1"></label>
</fieldset>
<fieldset>
  <button data-msg="!join">!join</button>
  <button data-msg="!attack">!attack</button>
  <button data-msg="!heal">!heal</button>
  <button data-msg="!block">!block</button>
  <button id="spam50">spam !attack from 50 fake chatters</button>
  <button id="spam500">spam !attack from 500 fake chatters</button>
</fieldset>
<pre id="log"></pre>
<script>
  const $ = (id) => document.getElementById(id);
  const logEl = $('log');
  function logLine(line) { logEl.textContent = line + '\\n' + logEl.textContent; }
  async function send(username, message) {
    const channelId = $('ch').value;
    const r = await fetch('/dev/simulate-chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channelId, username, message }),
    });
    logLine(\`\${username} \${message} → \${r.status}\`);
  }
  for (const b of document.querySelectorAll('button[data-msg]')) {
    b.addEventListener('click', () => send($('user').value, b.dataset.msg));
  }
  async function spam(n) {
    for (let i = 0; i < n; i++) {
      send('user' + i, '!attack');
      await new Promise((r) => setTimeout(r, 5));
    }
  }
  $('spam50').addEventListener('click', () => spam(50));
  $('spam500').addEventListener('click', () => spam(500));
</script>`;
}
