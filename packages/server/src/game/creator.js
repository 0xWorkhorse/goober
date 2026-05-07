/**
 * Monster creator — server side. Owns the lifecycle from `creation` to
 * `idle` for a freshly-built monster.
 *
 * Flow:
 *   START_NEW_MONSTER       → draft row created + broadcast MONSTER_UPDATED
 *   PICK_APPEARANCE         → update draft appearance, broadcast
 *   REQUEST_ABILITY_ROLL    → return 6 candidates (2/2/2 across archetypes)
 *   PICK_ABILITIES          → validate + persist 3-of-6 selection
 *   ALLOCATE_STARTING_STATS → validate 10-point spend, persist
 *   CONFIRM_MONSTER         → validate + name, status=active, transition to idle
 */

import {
  ABILITY_BY_ID,
  ABILITIES_PER_MONSTER,
  ABILITY_POOL,
  ABILITY_ROLL_PER_BUCKET,
  PALETTES,
  PART_SLOTS,
  PHASE,
  PRESET_KEYS,
  S2C,
  STARTING_REROLL_TOKENS,
  STARTING_STAT_POINTS,
  STAT_NAMES,
  STAT_POINT_HARD_CAP,
} from '@bossraid/shared';

import { broadcastRoom, send } from '../ws/server.js';
import { channels as channelsRepo, monsters as monstersRepo } from '../persistence/repos.js';
import { transition } from './combat.js';

const DEFAULT_APPEARANCE = {
  body: 'blob',
  eyes: 'googly',
  mouth: 'fangs',
  horns: 'antennae',
  arms: 'noodle',
  feet: 'tentacles',
  paletteIdx: 0,
};

function emptyStatSpend() {
  return STAT_NAMES.reduce((a, k) => ((a[k] = 0), a), {});
}

function emitMonsterUpdated(room) {
  broadcastRoom(room, S2C.MONSTER_UPDATED, { monster: room.monster });
}

export function startNewMonster(room) {
  if (room.phase === PHASE.LOBBY || room.phase === PHASE.FIGHT || room.phase === PHASE.RESULTS) {
    return { ok: false, code: 'wrong_phase' };
  }
  // If an active monster exists, retire it. (Death-flow already marks dead
  // monsters; this branch handles "scrap a healthy run and start fresh".)
  const existing = monstersRepo.getActive(room.channelId);
  if (existing && existing.status === 'active') {
    monstersRepo.update(existing.id, { status: 'retired' });
    channelsRepo.setActiveMonster(room.channelId, null);
  }
  // Create a fresh draft monster.
  const draft = monstersRepo.create({
    channelId: room.channelId,
    name: 'unnamed',
    appearance: DEFAULT_APPEARANCE,
    abilityIds: [],
    statPointsSpent: emptyStatSpend(),
    status: 'draft',
  });
  room.monster = draft;
  emitMonsterUpdated(room);
  transition(room, PHASE.CREATION);
  return { ok: true };
}

export function pickAppearance(room, appearance) {
  if (!isDraft(room)) return { ok: false, code: 'wrong_phase' };
  if (!isValidAppearance(appearance)) return { ok: false, code: 'bad_appearance' };
  const next = monstersRepo.update(room.monster.id, { appearance });
  room.monster = next;
  emitMonsterUpdated(room);
  return { ok: true };
}

export function rollAbilities(room) {
  if (!isDraft(room) && room.phase !== PHASE.LEVEL_UP) {
    return { ok: false, code: 'wrong_phase' };
  }
  return { ok: true, options: rollSix() };
}

/**
 * Roll 6 abilities for the streamer to pick from: 2 per archetype bucket,
 * sampled without replacement, then shuffled.
 */
export function rollSix() {
  const out = [];
  for (const bucket of Object.keys(ABILITY_POOL)) {
    const pool = [...ABILITY_POOL[bucket]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    out.push(...pool.slice(0, ABILITY_ROLL_PER_BUCKET));
  }
  // Shuffle the final 6 so the order doesn't betray the bucket layout.
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickAbilities(room, abilityIds) {
  if (!isDraft(room)) return { ok: false, code: 'wrong_phase' };
  if (!Array.isArray(abilityIds) || abilityIds.length !== ABILITIES_PER_MONSTER) {
    return { ok: false, code: 'wrong_count' };
  }
  if (new Set(abilityIds).size !== abilityIds.length) return { ok: false, code: 'duplicates' };
  for (const id of abilityIds) if (!ABILITY_BY_ID[id]) return { ok: false, code: 'unknown_ability', id };
  const next = monstersRepo.update(room.monster.id, { abilityIds });
  room.monster = next;
  emitMonsterUpdated(room);
  return { ok: true };
}

export function allocateStartingStats(room, spent) {
  if (!isDraft(room)) return { ok: false, code: 'wrong_phase' };
  const v = validateAllocation(spent, STARTING_STAT_POINTS);
  if (!v.ok) return v;
  const next = monstersRepo.update(room.monster.id, { statPointsSpent: spent });
  room.monster = next;
  emitMonsterUpdated(room);
  return { ok: true };
}

export function confirmMonster(room, name) {
  if (!isDraft(room)) return { ok: false, code: 'wrong_phase' };
  const m = room.monster;
  if (!m.abilityIds || m.abilityIds.length !== ABILITIES_PER_MONSTER) {
    return { ok: false, code: 'abilities_required' };
  }
  const cleanedName = String(name || '').trim().slice(0, 20) || 'unnamed';
  const next = monstersRepo.update(m.id, {
    name: cleanedName,
    status: 'active',
    rerollTokens: STARTING_REROLL_TOKENS,
  });
  channelsRepo.setActiveMonster(room.channelId, next.id);
  room.monster = next;
  emitMonsterUpdated(room);
  transition(room, PHASE.IDLE);
  return { ok: true };
}

// ─── Validation helpers ─────────────────────────────────────────────────────

function isDraft(room) {
  return room.phase === PHASE.CREATION && room.monster?.status === 'draft';
}

function isValidAppearance(a) {
  if (!a || typeof a !== 'object') return false;
  // presetKey, expr, variant are optional metadata. If presetKey is present
  // it must be a known bestiary preset.
  if (a.presetKey != null && !PRESET_KEYS.includes(a.presetKey)) return false;
  if (a.expr != null && !['idle', 'angry', 'happy', 'worry', 'hurt', 'defeated'].includes(a.expr)) return false;
  if (a.variant != null && !['normal', 'poison', 'fire', 'ice', 'shadow'].includes(a.variant)) return false;
  // Slot fields are still required for back-compat (legacy fall-through path).
  for (const slot of Object.keys(PART_SLOTS)) {
    if (!PART_SLOTS[slot].includes(a[slot])) return false;
  }
  if (!Number.isInteger(a.paletteIdx) || a.paletteIdx < 0 || a.paletteIdx >= PALETTES.length) return false;
  return true;
}

/**
 * Verify a stat-point spend object: total = budget, no per-stat overflow,
 * no negatives, only known stats. Used by both creator and level-up flows.
 *
 * @param {Record<string, number>} spent  cumulative spend (not delta)
 * @param {number} budget                 expected total points
 */
export function validateAllocation(spent, budget) {
  if (!spent || typeof spent !== 'object') return { ok: false, code: 'bad_alloc' };
  let total = 0;
  for (const k of Object.keys(spent)) {
    if (!STAT_NAMES.includes(k)) return { ok: false, code: 'unknown_stat', stat: k };
    const v = spent[k];
    if (!Number.isInteger(v) || v < 0) return { ok: false, code: 'bad_value', stat: k };
    if (v > STAT_POINT_HARD_CAP) return { ok: false, code: 'over_cap', stat: k };
    total += v;
  }
  if (total !== budget) return { ok: false, code: 'wrong_total', expected: budget, actual: total };
  return { ok: true };
}

/** Used by reply messages — does NOT broadcast. */
export function ackToSender(ws, type, payload) { send(ws, type, payload); }
