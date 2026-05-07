/**
 * Post-fight progression: level-up (stat allocation + ability reroll) and
 * death (revive vs abandon). Streamer-driven; phase advances only when the
 * panel sends an explicit confirm.
 */

import {
  ABILITIES_PER_MONSTER,
  ABILITY_BY_ID,
  PHASE,
  S2C,
  STAT_POINTS_PER_LEVEL,
  reviveCost,
} from '@bossraid/shared';

import { broadcastRoom } from '../ws/server.js';
import { transition } from './combat.js';
import { rollSix, validateAllocation } from './creator.js';
import {
  channels as channelsRepo,
  monsters as monstersRepo,
} from '../persistence/repos.js';

function emitMonsterUpdated(room) {
  broadcastRoom(room, S2C.MONSTER_UPDATED, { monster: room.monster });
}

/** Add the level-up's 3 stat points onto the monster's existing spend. */
export function allocateLevelStats(room, deltaSpent) {
  if (room.phase !== PHASE.LEVEL_UP) return { ok: false, code: 'wrong_phase' };
  if (!room.monster) return { ok: false, code: 'no_monster' };
  const v = validateAllocation(deltaSpent, STAT_POINTS_PER_LEVEL);
  if (!v.ok) return v;
  const next = { ...room.monster.statPointsSpent };
  for (const [k, n] of Object.entries(deltaSpent)) next[k] = (next[k] || 0) + n;
  const updated = monstersRepo.update(room.monster.id, { statPointsSpent: next });
  room.monster = updated;
  emitMonsterUpdated(room);
  return { ok: true };
}

/**
 * Roll 6 fresh abilities targeting one of the monster's 3 ability slots.
 * Costs 1 reroll token. The streamer then sends REPLACE_ABILITY with the
 * chosen new ability id (or doesn't, in which case the original stays).
 */
export function rerollAbility(room, slot) {
  if (room.phase !== PHASE.LEVEL_UP) return { ok: false, code: 'wrong_phase' };
  if (!room.monster) return { ok: false, code: 'no_monster' };
  if (!Number.isInteger(slot) || slot < 0 || slot >= ABILITIES_PER_MONSTER) {
    return { ok: false, code: 'bad_slot' };
  }
  if ((room.monster.rerollTokens || 0) <= 0) return { ok: false, code: 'no_tokens' };
  // Spend a token immediately (replace is optional; if streamer changes their
  // mind, the token still got spent).
  const updated = monstersRepo.update(room.monster.id, {
    rerollTokens: room.monster.rerollTokens - 1,
  });
  room.monster = updated;
  emitMonsterUpdated(room);
  return { ok: true, slot, options: rollSix() };
}

export function replaceAbility(room, slot, abilityId) {
  if (room.phase !== PHASE.LEVEL_UP) return { ok: false, code: 'wrong_phase' };
  if (!room.monster) return { ok: false, code: 'no_monster' };
  if (!Number.isInteger(slot) || slot < 0 || slot >= ABILITIES_PER_MONSTER) {
    return { ok: false, code: 'bad_slot' };
  }
  if (!ABILITY_BY_ID[abilityId]) return { ok: false, code: 'unknown_ability' };
  const ids = [...(room.monster.abilityIds || [])];
  if (ids.includes(abilityId)) return { ok: false, code: 'duplicate_ability' };
  ids[slot] = abilityId;
  const updated = monstersRepo.update(room.monster.id, { abilityIds: ids });
  room.monster = updated;
  emitMonsterUpdated(room);
  return { ok: true };
}

export function reviveMonster(room) {
  if (room.phase !== PHASE.DEATH) return { ok: false, code: 'wrong_phase' };
  if (!room.monster) return { ok: false, code: 'no_monster' };
  const cost = reviveCost(room.monster.timesRevived || 0);
  const ok = channelsRepo.spendLegacyPoints(room.channelId, cost);
  if (!ok) return { ok: false, code: 'insufficient_legacy', cost };
  const revived = monstersRepo.revive(room.monster.id);
  // Set channel.active back to this monster.
  channelsRepo.setActiveMonster(room.channelId, revived.id);
  // Revive returns the monster to half max HP for the next fight, but max HP
  // is computed dynamically so we don't need to track it on the row — the
  // combat module's `resetCombatForFight` will set bossHP=maxBossHP and we
  // override it on the lobby→fight handoff. We mark a flag for the next
  // openLobby → fight transition.
  room._reviveHalfHp = true;
  room.monster = revived;
  emitMonsterUpdated(room);
  transition(room, PHASE.IDLE);
  return { ok: true, cost };
}
