import { C2S, PHASE, S2C, STARTING_STAT_POINTS } from '@bossraid/shared';

import { log } from '../log.js';
import {
  abandonMonster,
  castAbility,
  confirmLevelUp,
  forceEndFight,
  handleChatCommand,
  openLobby,
} from '../game/combat.js';
import {
  allocateStartingStats,
  confirmMonster,
  pickAbilities,
  pickAppearance,
  rollAbilities,
  startNewMonster,
} from '../game/creator.js';
import {
  allocateLevelStats,
  replaceAbility,
  rerollAbility,
  reviveMonster,
} from '../game/progression.js';
import { getOrCreateRoom } from '../game/room.js';
import { channels as channelsRepo } from '../persistence/repos.js';
import { ensureIrcConnected, getIrcStatus, scheduleAbandon } from '../twitch/irc.js';
import { send } from './server.js';

/** Route an incoming WS message to its handler. */
export async function handleMessage(ws, msg, { rooms }) {
  const { type, payload = {} } = msg;
  switch (type) {
    case C2S.HELLO_PANEL: {
      const room = getOrCreateRoom(rooms, payload.channelId);
      attach(ws, room, 'panel');
      send(ws, S2C.WELCOME, { ...snapshot(room), ircStatus: getIrcStatus(room.channelId) });
      log.info({ channelId: room.channelId, surface: 'panel' }, 'client hello');
      // Best-effort: kick IRC into life. No-op for the 'dev' channel.
      ensureIrcConnected(room).catch((err) => log.warn({ err: err.message }, 'ensureIrcConnected failed'));
      return;
    }
    case C2S.HELLO_OVERLAY: {
      const room = getOrCreateRoom(rooms, payload.channelId);
      attach(ws, room, 'overlay');
      send(ws, S2C.WELCOME, snapshot(room));
      log.info({ channelId: room.channelId, surface: 'overlay' }, 'client hello');
      return;
    }
    case C2S.SET_LOCALE: {
      if (!ws._room) return;
      const locale = payload.locale || 'en';
      ws._room.locale = locale;
      try { channelsRepo.setLocale(ws._room.channelId, locale); } catch { /* ignore */ }
      return;
    }

    // ── Combat / lifecycle ──────────────────────────────────────────────
    case C2S.START_LOBBY: {
      if (!requirePanel(ws)) return;
      const ok = openLobby(ws._room);
      if (!ok) send(ws, S2C.ERROR, { code: 'cannot_open_lobby' });
      return;
    }
    case C2S.CAST_ABILITY: {
      if (!requirePanel(ws)) return;
      const result = castAbility(ws._room, payload.slot);
      if (!result.ok) send(ws, S2C.ERROR, { code: result.code });
      return;
    }
    case C2S.END_FIGHT_FORCE: {
      if (!requirePanel(ws)) return;
      forceEndFight(ws._room);
      return;
    }
    case C2S.CONFIRM_LEVEL_UP: {
      if (!requirePanel(ws)) return;
      confirmLevelUp(ws._room);
      return;
    }
    case C2S.ABANDON_MONSTER: {
      if (!requirePanel(ws)) return;
      abandonMonster(ws._room);
      return;
    }

    // ── Creator ─────────────────────────────────────────────────────────
    case C2S.START_NEW_MONSTER: {
      if (!requirePanel(ws)) return;
      const r = startNewMonster(ws._room);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code });
      return;
    }
    case C2S.PICK_APPEARANCE: {
      if (!requirePanel(ws)) return;
      const r = pickAppearance(ws._room, payload.appearance);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code });
      return;
    }
    case C2S.REQUEST_ABILITY_ROLL: {
      if (!requirePanel(ws)) return;
      const r = rollAbilities(ws._room);
      if (!r.ok) { send(ws, S2C.ERROR, { code: r.code }); return; }
      send(ws, S2C.ABILITY_ROLL, { options: r.options });
      return;
    }
    case C2S.PICK_ABILITIES: {
      if (!requirePanel(ws)) return;
      const r = pickAbilities(ws._room, payload.abilityIds);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code });
      return;
    }
    case C2S.ALLOCATE_STARTING_STATS: {
      if (!requirePanel(ws)) return;
      const r = allocateStartingStats(ws._room, payload.spent);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code, ...r });
      return;
    }
    case C2S.CONFIRM_MONSTER: {
      if (!requirePanel(ws)) return;
      const r = confirmMonster(ws._room, payload.name);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code });
      return;
    }

    // ── Post-fight progression ─────────────────────────────────────────
    case C2S.ALLOCATE_LEVEL_STATS: {
      if (!requirePanel(ws)) return;
      const r = allocateLevelStats(ws._room, payload.spent);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code, ...r });
      return;
    }
    case C2S.REROLL_ABILITY: {
      if (!requirePanel(ws)) return;
      const r = rerollAbility(ws._room, payload.slot);
      if (!r.ok) { send(ws, S2C.ERROR, { code: r.code }); return; }
      send(ws, S2C.ABILITY_ROLL, { slot: r.slot, options: r.options });
      return;
    }
    case C2S.REPLACE_ABILITY: {
      if (!requirePanel(ws)) return;
      const r = replaceAbility(ws._room, payload.slot, payload.abilityId);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code });
      return;
    }
    case C2S.REVIVE_MONSTER: {
      if (!requirePanel(ws)) return;
      const r = reviveMonster(ws._room);
      if (!r.ok) send(ws, S2C.ERROR, { code: r.code, ...r });
      return;
    }

    default: {
      log.debug({ type }, 'unhandled message type');
      return;
    }
  }
}

function requirePanel(ws) {
  if (!ws._room) return false;
  if (ws._surface !== 'panel') return false;
  return true;
}

function attach(ws, room, surface) {
  ws._room = room;
  ws._surface = surface;
  if (surface === 'panel') room.panels.add(ws);
  else room.overlays.add(ws);
}

function snapshot(room) {
  const ch = channelsRepo.get(room.channelId);
  return {
    channelId: room.channelId,
    phase: room.phase,
    locale: room.locale,
    monster: room.monster,
    chatters: [...room.chatters.values()].map((c) => ({
      login: c.login,
      hp: c.hp,
      maxHp: c.maxHp,
      blockedUntilMs: c.blockedUntilMs || 0,
      damageDealt: c.damageDealt || 0,
    })),
    bossHP: room.combat?.bossHP ?? 0,
    maxBossHP: room.combat?.maxBossHP ?? 0,
    cooldowns: {},
    startingStatPoints: STARTING_STAT_POINTS,
    legacyPoints: ch?.legacy_points ?? 0,
  };
}

export { snapshot, attach };
export const _PHASE = PHASE;
