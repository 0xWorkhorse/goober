import {
  ABILITY_BY_ID,
  BROADCAST_MS,
  CHATTER_BASE_HEAL_AMOUNT,
  CHATTER_BLOCK_DR_PCT,
  CHATTER_BLOCK_DURATION_MS,
  EVENTS,
  FIGHT_DURATION_MS,
  HERO_SPOTLIGHT_DURATION_MS,
  LEGACY_DEATH_BONUS,
  LEGACY_PER_WIN,
  LOBBY_DURATION_MS,
  PHASE,
  RESULTS_DURATION_MS,
  S2C,
  STARTING_REROLL_TOKENS,
  STAT_POINTS_PER_LEVEL,
  TICK_MS,
  bossAttackIntervalMs,
  computeAbilityDamage,
  computeBossBasicDamage,
  computeChatAttackDamage,
  deriveStats,
  effectiveBossMaxHP,
  effectiveCritPct,
  effectiveDefensePct,
} from '@bossraid/shared';

import { aliveCount, ensureChatter, tryConsumeCooldown } from './chatters.js';
import { broadcastRoom } from '../ws/server.js';
import { config } from '../config.js';
import { log } from '../log.js';
import { channels as channelsRepo, chatEvents, fights as fightsRepo, monsters as monstersRepo } from '../persistence/repos.js';

const fastFactor = () => Math.max(1, config.fastTimersFactor || 1);
const lobbyMs = () => Math.round(LOBBY_DURATION_MS / fastFactor());
const fightMs = () => Math.round(FIGHT_DURATION_MS / fastFactor());
const resultsMs = () => Math.round(RESULTS_DURATION_MS / fastFactor());

/**
 * Combat state machine + tick loop. The full lifecycle is:
 *   creation → idle → lobby (30s) → fight (120s) → results (8s) → (level_up | death) → idle
 *
 * `creation`, `level_up`, and `death` are streamer-driven (no auto-timeout).
 * The streamer's panel advances them via explicit messages.
 *
 * Server-authoritative: every damage number, every cooldown, every win/loss
 * decision happens here. Clients render the broadcast state and dispatch
 * events to their VFX layers.
 */

/**
 * @param {object} room
 */
export function createCombat(room) {
  const c = {
    room,
    timer: null,             // setInterval handle for the tick
    broadcaster: null,       // setInterval handle for the broadcast
    phaseEndsAt: 0,          // ms timestamp; only used for auto-timed phases
    bossHP: 0,
    maxBossHP: 0,
    bossShield: 0,
    bossBuffs: [],           // [{ kind, expiresAt, amount }]
    abilityCooldowns: new Map(), // abilityId → readyAtMs
    nextBossAttackAt: 0,
    pendingEvents: [],
    abilityUses: new Map(),  // abilityId → { castCount, damageDealt }
    chatterActions: new Map(), // login → { attacks, heals, blocks, damageDealt }
    fightStartedAt: 0,
    fightEndedAt: 0,
    aborted: false,
    bossDOTs: [],            // [{ kind, expiresAt, tickEveryMs, lastTickAt, tickDamage, source: 'chat' }]
  };
  return c;
}

// ─── Phase transitions ──────────────────────────────────────────────────────

export function transition(room, nextPhase, payload = {}) {
  room.phase = nextPhase;
  log.debug({ channelId: room.channelId, phase: nextPhase }, 'phase change');
  broadcastRoom(room, S2C.PHASE_CHANGE, { phase: nextPhase, ...payload });
  // Send a snapshot too so clients refresh derived state.
  broadcastSnapshot(room);
}

export function ensureCombat(room) {
  if (!room.combat) room.combat = createCombat(room);
  return room.combat;
}

/** Streamer opens the lobby. Resets the combat object and starts the timer loop. */
export function openLobby(room) {
  if (!room.monster || room.monster.status !== 'active') return false;
  if (![PHASE.IDLE].includes(room.phase)) return false;
  const c = ensureCombat(room);
  resetCombatForFight(c, room);
  c.phaseEndsAt = Date.now() + lobbyMs();
  startLoops(c);
  transition(room, PHASE.LOBBY, { durationMs: lobbyMs(), timeLeftMs: lobbyMs() });
  return true;
}

function resetCombatForFight(c, room) {
  const stats = deriveStats(room.monster.statPointsSpent);
  const chatterCount = room.chatters.size;
  c.maxBossHP = effectiveBossMaxHP(stats, Math.max(1, chatterCount));
  c.bossHP = c.maxBossHP;
  c.bossShield = 0;
  c.bossBuffs = [];
  c.abilityCooldowns = new Map();
  c.nextBossAttackAt = 0;
  c.pendingEvents = [];
  c.abilityUses = new Map();
  c.chatterActions = new Map();
  c.fightStartedAt = 0;
  c.fightEndedAt = 0;
  c.aborted = false;
  c.bossDOTs = [];
  // Reset chatter state for a new fight.
  for (const ch of room.chatters.values()) {
    ch.hp = ch.maxHp;
    ch.damageDealt = 0;
    ch.attacks = 0;
    ch.heals = 0;
    ch.blocks = 0;
    ch.blockedUntilMs = 0;
  }
}

function startFight(c) {
  const room = c.room;
  if (room.phase !== PHASE.LOBBY) return;
  c.phaseEndsAt = Date.now() + fightMs();
  c.fightStartedAt = Date.now();
  // Schedule first boss attack
  const stats = deriveStats(room.monster.statPointsSpent);
  c.nextBossAttackAt = Date.now() + bossAttackIntervalMs(stats);
  // Recompute boss HP using lobby's final chatter count.
  resetBossHpForChatterCount(c, room);
  // Revive penalty: monster comes back with half max HP for the next fight only.
  if (room._reviveHalfHp) {
    c.bossHP = Math.max(1, Math.round(c.maxBossHP * 0.5));
    room._reviveHalfHp = false;
  }
  transition(room, PHASE.FIGHT, { durationMs: fightMs(), timeLeftMs: fightMs() });
}

function resetBossHpForChatterCount(c, room) {
  const stats = deriveStats(room.monster.statPointsSpent);
  const newMax = effectiveBossMaxHP(stats, Math.max(1, room.chatters.size));
  // Preserve current HP ratio.
  const ratio = c.maxBossHP > 0 ? c.bossHP / c.maxBossHP : 1;
  c.maxBossHP = newMax;
  c.bossHP = Math.round(newMax * ratio);
}

/** End the fight and persist its result + telemetry. */
function endFight(c, victoryFor) {
  const room = c.room;
  c.fightEndedAt = Date.now();
  c.phaseEndsAt = Date.now() + resultsMs();

  const monster = room.monster;
  const monsterLevel = monster.level;
  const totalDamage = [...c.chatterActions.values()].reduce((s, a) => s + (a.damageDealt || 0), 0);

  const abilityUses = [...c.abilityUses.entries()].map(([abilityId, v]) => ({
    abilityId,
    castCount: v.castCount,
    damageDealt: v.damageDealt,
  }));
  const chatterActions = [...c.chatterActions.entries()].map(([login, v]) => ({
    chatterLogin: login,
    attacks: v.attacks,
    heals: v.heals,
    blocks: v.blocks,
    damageDealt: v.damageDealt,
  }));

  let fightId;
  try {
    fightId = fightsRepo.record({
      channelId: room.channelId,
      monsterId: monster.id,
      monsterLevelAtFight: monsterLevel,
      victoryFor,
      durationMs: c.fightEndedAt - c.fightStartedAt,
      chatterCount: room.chatters.size,
      totalDamage,
      startedAt: c.fightStartedAt,
      endedAt: c.fightEndedAt,
      abilityUses,
      chatterActions,
    });
  } catch (err) {
    log.error({ err }, 'failed to persist fight');
  }

  // Update monster + channel based on outcome.
  if (victoryFor === 'chat') {
    // Boss killed → mark dead, award legacy points, run is over.
    monstersRepo.kill(monster.id);
    channelsRepo.addLegacyPoints(room.channelId, LEGACY_DEATH_BONUS);
    room.monster = monstersRepo.get(monster.id);
  } else if (victoryFor === 'boss') {
    // Boss won → level up, award win point, refill reroll budget if due.
    const wins = monster.wins + 1;
    const peakLevel = Math.max(monster.peakLevel || 1, monster.level + 1);
    const updated = monstersRepo.update(monster.id, {
      level: monster.level + 1,
      wins,
      rerollTokens: monster.rerollTokens + (wins % 3 === 0 ? 1 : 0),
      peakLevel,
    });
    channelsRepo.addLegacyPoints(room.channelId, LEGACY_PER_WIN);
    room.monster = updated;
  }

  // Sort chatters by damage to compute MVPs.
  const sorted = [...c.chatterActions.entries()]
    .sort((a, b) => (b[1].damageDealt || 0) - (a[1].damageDealt || 0))
    .slice(0, 5)
    .map(([login, v]) => ({ login, damageDealt: v.damageDealt || 0 }));

  broadcastRoom(room, S2C.RESULTS, {
    fightId,
    victory: victoryFor === 'chat',
    victoryFor,
    mvpChatters: sorted,
    durationMs: c.fightEndedAt - c.fightStartedAt,
    totalDamage,
    monsterLevel,
  });
  transition(room, PHASE.RESULTS, {
    durationMs: resultsMs(),
    timeLeftMs: resultsMs(),
  });
}

function afterResults(c) {
  const room = c.room;
  // After results, transition to level_up (if monster won) or death (if monster lost).
  // The streamer drives further progress from here.
  stopLoops(c);
  if (!room.monster) {
    transition(room, PHASE.CREATION);
    return;
  }
  if (room.monster.status === 'dead') {
    transition(room, PHASE.DEATH);
  } else {
    transition(room, PHASE.LEVEL_UP, { points: STAT_POINTS_PER_LEVEL });
  }
}

// ─── Streamer commands ──────────────────────────────────────────────────────

/** Streamer cast an ability by slot 0/1/2. */
export function castAbility(room, slot) {
  if (room.phase !== PHASE.FIGHT) return { ok: false, code: 'wrong_phase' };
  const c = ensureCombat(room);
  const id = room.monster.abilityIds[slot];
  if (!id) return { ok: false, code: 'no_ability' };
  const def = ABILITY_BY_ID[id];
  if (!def) return { ok: false, code: 'unknown_ability' };
  const now = Date.now();
  const ready = c.abilityCooldowns.get(id) || 0;
  if (now < ready) return { ok: false, code: 'cooldown', readyAt: ready };

  const stats = deriveStats(room.monster.statPointsSpent);
  const isCrit = Math.random() * 100 < effectiveCritPct(stats);

  // Apply effect.
  if (def.targets === 'self' && def.effect) {
    applySelfEffect(c, def.effect, stats);
  }
  let damageDealt = 0;
  if (def.targets === 'all' || typeof def.targets === 'number') {
    damageDealt = applyOffensiveAbility(c, room, def, stats, isCrit);
  }
  // Track telemetry.
  const use = c.abilityUses.get(id) || { castCount: 0, damageDealt: 0 };
  use.castCount++;
  use.damageDealt += damageDealt;
  c.abilityUses.set(id, use);

  c.abilityCooldowns.set(id, now + def.cooldownMs);

  pushEvent(c, {
    kind: EVENTS.BOSS_ABILITY,
    abilityId: id,
    vfx: def.vfx,
    isCrit,
    damageDealt,
    selfEffect: def.targets === 'self' ? def.effect?.kind || null : null,
  });
  return { ok: true, readyAt: now + def.cooldownMs };
}

function applySelfEffect(c, effect, stats) {
  const now = Date.now();
  switch (effect.kind) {
    case 'heal_pct': {
      const healed = Math.round(c.maxBossHP * effect.amount);
      c.bossHP = Math.min(c.maxBossHP, c.bossHP + healed);
      break;
    }
    case 'shield': {
      c.bossShield = Math.max(c.bossShield, effect.amount);
      break;
    }
    case 'attack_buff': {
      c.bossBuffs.push({ kind: 'attack_buff', expiresAt: now + effect.durationMs, amount: effect.amount });
      break;
    }
    case 'speed_buff': {
      c.bossBuffs.push({ kind: 'speed_buff', expiresAt: now + effect.durationMs, amount: effect.amount });
      // Reschedule next attack to be sooner.
      const interval = bossAttackIntervalMs(stats) / (1 + effect.amount);
      c.nextBossAttackAt = Math.min(c.nextBossAttackAt, now + interval);
      break;
    }
  }
}

function applyOffensiveAbility(c, room, def, stats, isCrit) {
  const baseDmg = def.damage || 0;
  const dmg = computeAbilityDamage({ baseDamage: baseDmg, stats, isCrit });
  let totalDealt = 0;
  const targets = pickTargets(room, def);
  for (const ch of targets) {
    const taken = applyDamageToChatter(ch, dmg);
    totalDealt += taken;
    if (def.effect?.kind === 'slow') {
      // Slow chatter actions by extending their cooldown a bit.
      ch.lastActionMs = Math.max(ch.lastActionMs, Date.now() + def.effect.durationMs / 4);
    }
    if (def.effect?.kind === 'dot') {
      ch._dotExpiresAt = Date.now() + def.effect.durationMs;
      ch._dotTickDamage = def.effect.tickDamage;
      ch._dotLastTickAt = Date.now();
    }
    if (ch.hp <= 0) pushEvent(c, { kind: EVENTS.CHATTER_DOWN, chatterId: ch.login });
  }
  return totalDealt;
}

function pickTargets(room, def) {
  const alive = [...room.chatters.values()].filter((c) => c.hp > 0);
  if (def.targets === 'all') return alive;
  const n = typeof def.targets === 'number' ? def.targets : 1;
  // Sample without replacement: shuffle then take n.
  for (let i = alive.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [alive[i], alive[j]] = [alive[j], alive[i]];
  }
  return alive.slice(0, n);
}

function applyDamageToChatter(ch, dmg) {
  let taken = dmg;
  const blocking = ch.blockedUntilMs && ch.blockedUntilMs > Date.now();
  if (blocking) taken = Math.round(taken * (1 - CHATTER_BLOCK_DR_PCT / 100));
  ch.hp = Math.max(0, ch.hp - taken);
  return taken;
}

// ─── Chat commands ──────────────────────────────────────────────────────────

/**
 * Process a parsed chat command. Returns { handled, action } so the caller can
 * decide whether to log to chat_events.
 */
export function handleChatCommand(room, login, action, rawMessage) {
  const c = ensureCombat(room);
  const now = Date.now();
  const ch = ensureChatter(room.chatters, login);
  // Touch idle pruning timestamp.
  ch.lastSeenMs = now;

  if (config.logRawChatEvents) {
    try {
      chatEvents.record({
        channelId: room.channelId,
        fightId: null,
        chatterLogin: login,
        action,
        rawMessage,
      });
    } catch { /* ignore */ }
  }

  switch (action) {
    case 'join': {
      // join is only meaningful in lobby (or fight, where it lets late
      // arrivals participate at full HP).
      if (room.phase !== PHASE.LOBBY && room.phase !== PHASE.FIGHT) return { handled: false };
      pushEvent(c, { kind: EVENTS.CHATTER_JOINED, chatterId: login });
      return { handled: true };
    }
    case 'attack': {
      if (room.phase !== PHASE.FIGHT) return { handled: false };
      if (ch.hp <= 0) return { handled: false };
      if (!tryConsumeCooldown(ch, now)) return { handled: false };
      const stats = deriveStats(room.monster.statPointsSpent);
      const dmg = computeChatAttackDamage({
        bossLevel: room.monster.level,
        chatterCount: room.chatters.size,
        bossDefensePct: effectiveDefensePct(stats),
      });
      // Apply to boss (with shield first).
      let remaining = dmg;
      if (c.bossShield > 0) {
        const absorbed = Math.min(c.bossShield, remaining);
        c.bossShield -= absorbed;
        remaining -= absorbed;
      }
      c.bossHP = Math.max(0, c.bossHP - remaining);
      ch.attacks++;
      ch.damageDealt += dmg;
      bumpChatterAction(c, login, { attacks: 1, damageDealt: dmg });
      pushEvent(c, { kind: EVENTS.CHATTER_ATTACK, chatterId: login, dmg });
      // Hero spotlight on big hits (top-percentile of recent damage).
      if (dmg >= 60) pushEvent(c, { kind: EVENTS.HERO_SPOTLIGHT, chatterId: login, durationMs: HERO_SPOTLIGHT_DURATION_MS });
      if (c.bossHP <= 0) endFight(c, 'chat');
      return { handled: true };
    }
    case 'heal': {
      if (room.phase !== PHASE.FIGHT) return { handled: false };
      if (ch.hp <= 0) return { handled: false };
      if (!tryConsumeCooldown(ch, now)) return { handled: false };
      // Heal lowest-HP ally (could be self).
      const target = pickLowestHpAlly(room.chatters);
      if (!target) return { handled: false };
      target.hp = Math.min(target.maxHp, target.hp + CHATTER_BASE_HEAL_AMOUNT);
      ch.heals++;
      bumpChatterAction(c, login, { heals: 1 });
      pushEvent(c, { kind: EVENTS.CHATTER_HEAL, chatterId: login, target: target.login, amount: CHATTER_BASE_HEAL_AMOUNT });
      return { handled: true };
    }
    case 'block': {
      if (room.phase !== PHASE.FIGHT) return { handled: false };
      if (ch.hp <= 0) return { handled: false };
      if (!tryConsumeCooldown(ch, now)) return { handled: false };
      ch.blockedUntilMs = now + CHATTER_BLOCK_DURATION_MS;
      ch.blocks++;
      bumpChatterAction(c, login, { blocks: 1 });
      pushEvent(c, { kind: EVENTS.CHATTER_BLOCK, chatterId: login });
      return { handled: true };
    }
    default:
      return { handled: false };
  }
}

function pickLowestHpAlly(roster) {
  let best = null;
  for (const ch of roster.values()) {
    if (ch.hp <= 0) continue;
    if (ch.hp >= ch.maxHp) continue;
    if (!best || ch.hp < best.hp) best = ch;
  }
  // Fallback: any alive chatter (means everyone is full HP — heal still costs cooldown though we no-op).
  if (!best) {
    for (const ch of roster.values()) {
      if (ch.hp > 0) { best = ch; break; }
    }
  }
  return best;
}

function bumpChatterAction(c, login, patch) {
  const v = c.chatterActions.get(login) || { attacks: 0, heals: 0, blocks: 0, damageDealt: 0 };
  for (const [k, n] of Object.entries(patch)) v[k] = (v[k] || 0) + n;
  c.chatterActions.set(login, v);
}

// ─── Tick + broadcast loops ─────────────────────────────────────────────────

function startLoops(c) {
  stopLoops(c);
  c.timer = setInterval(() => tick(c), TICK_MS);
  c.broadcaster = setInterval(() => broadcastSnapshot(c.room), BROADCAST_MS);
}

function stopLoops(c) {
  if (c.timer) { clearInterval(c.timer); c.timer = null; }
  if (c.broadcaster) { clearInterval(c.broadcaster); c.broadcaster = null; }
}

function tick(c) {
  const room = c.room;
  const now = Date.now();

  // Phase auto-timing for lobby/fight/results.
  if (room.phase === PHASE.LOBBY && now >= c.phaseEndsAt) {
    if (room.chatters.size === 0) {
      // No one joined — close lobby and bounce to results as 'aborted'.
      c.fightStartedAt = now;
      endFight(c, 'aborted');
      return;
    }
    startFight(c);
    return;
  }
  if (room.phase === PHASE.FIGHT) {
    // Boss DOTs / buffs expiry
    c.bossBuffs = c.bossBuffs.filter((b) => b.expiresAt > now);

    // Chatter DOTs
    for (const ch of room.chatters.values()) {
      if (ch._dotExpiresAt && ch._dotExpiresAt > now && ch.hp > 0) {
        if (now - (ch._dotLastTickAt || 0) >= 1000) {
          const taken = applyDamageToChatter(ch, ch._dotTickDamage || 0);
          ch._dotLastTickAt = now;
          if (ch.hp <= 0) pushEvent(c, { kind: EVENTS.CHATTER_DOWN, chatterId: ch.login });
          // Tick damage doesn't get its own event — folded into next BOSS_HIT visual.
          void taken;
        }
      } else if (ch._dotExpiresAt) {
        ch._dotExpiresAt = 0;
        ch._dotTickDamage = 0;
      }
    }

    // Boss melee tick
    if (now >= c.nextBossAttackAt) {
      const stats = deriveStats(room.monster.statPointsSpent);
      const attackBuff = c.bossBuffs.find((b) => b.kind === 'attack_buff');
      const speedBuff = c.bossBuffs.find((b) => b.kind === 'speed_buff');
      const isCrit = Math.random() * 100 < effectiveCritPct(stats);
      const buffedAttack = (stats.attack || 25) * (1 + (attackBuff?.amount || 0));
      const target = pickRandomAliveChatter(room.chatters);
      if (target) {
        const dmg = Math.max(1, Math.round(computeBossBasicDamage({ stats, isCrit }) * (buffedAttack / (stats.attack || 25))));
        const taken = applyDamageToChatter(target, dmg);
        pushEvent(c, {
          kind: isCrit ? EVENTS.BOSS_CRIT : EVENTS.BOSS_BASIC_ATTACK,
          chatterId: target.login,
          dmg: taken,
        });
        if (target.hp <= 0) pushEvent(c, { kind: EVENTS.CHATTER_DOWN, chatterId: target.login });
      }
      const interval = bossAttackIntervalMs(stats) / (1 + (speedBuff?.amount || 0));
      c.nextBossAttackAt = now + interval;
    }

    // Win/loss conditions
    if (c.bossHP <= 0) { endFight(c, 'chat'); return; }
    if (now >= c.phaseEndsAt) {
      const aliveChatters = aliveCount(room.chatters);
      endFight(c, aliveChatters === 0 ? 'boss' : 'boss'); // time up = boss wins
      return;
    }
    if (room.chatters.size > 0 && aliveCount(room.chatters) === 0) {
      endFight(c, 'boss');
      return;
    }
  }
  if (room.phase === PHASE.RESULTS && now >= c.phaseEndsAt) {
    afterResults(c);
    return;
  }
}

function pickRandomAliveChatter(roster) {
  const alive = [...roster.values()].filter((c) => c.hp > 0);
  if (!alive.length) return null;
  return alive[(Math.random() * alive.length) | 0];
}

// ─── Broadcasting ───────────────────────────────────────────────────────────

function broadcastSnapshot(room) {
  const c = room.combat;
  const now = Date.now();
  const phase = room.phase;
  const events = c?.pendingEvents || [];
  if (c) c.pendingEvents = [];

  const cooldowns = c
    ? Object.fromEntries(
        (room.monster?.abilityIds || []).map((id, slot) => [
          slot,
          {
            abilityId: id,
            readyAt: c.abilityCooldowns.get(id) || 0,
            remainingMs: Math.max(0, (c.abilityCooldowns.get(id) || 0) - now),
          },
        ]),
      )
    : {};

  const ch = channelsRepo.get(room.channelId);
  broadcastRoom(room, S2C.STATE_DELTA, {
    phase,
    timeLeftMs: phase === PHASE.LOBBY || phase === PHASE.FIGHT || phase === PHASE.RESULTS
      ? Math.max(0, (c?.phaseEndsAt || 0) - now)
      : 0,
    bossHP: c?.bossHP ?? 0,
    maxBossHP: c?.maxBossHP ?? 0,
    bossShield: c?.bossShield ?? 0,
    chatters: [...room.chatters.values()].map(serializeChatter),
    cooldowns,
    events,
    legacyPoints: ch?.legacy_points ?? 0,
    monster: room.monster,
  });
}

function serializeChatter(ch) {
  return {
    login: ch.login,
    hp: ch.hp,
    maxHp: ch.maxHp,
    blockedUntilMs: ch.blockedUntilMs || 0,
    damageDealt: ch.damageDealt || 0,
  };
}

export function pushEvent(c, ev) {
  if (!c) return;
  c.pendingEvents.push({ ...ev, t: Date.now() });
}

// ─── Streamer post-fight transitions ────────────────────────────────────────

export function confirmLevelUp(room) {
  if (room.phase !== PHASE.LEVEL_UP) return false;
  transition(room, PHASE.IDLE);
  return true;
}

export function abandonMonster(room) {
  if (room.phase !== PHASE.DEATH) return false;
  transition(room, PHASE.CREATION);
  return true;
}

/** Streamer-issued early end. Used by panel "abort" or for tests. */
export function forceEndFight(room) {
  if (room.phase !== PHASE.FIGHT) return false;
  const c = ensureCombat(room);
  endFight(c, 'aborted');
  return true;
}

/** Stop loops on room destruction. */
export function teardownCombat(room) {
  if (room.combat) stopLoops(room.combat);
}
