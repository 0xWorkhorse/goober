import { CHATTER_ACTION_COOLDOWN_MS, CHATTER_BASE_HP } from '@bossraid/shared';

/**
 * Chatter roster operations. Unbounded — there is no count cap. Per-chatter
 * 3-second cooldown enforced via a Map<login, lastActionMs>; O(1) lookups.
 *
 * @typedef {Object} ChatterState
 * @property {string} login
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} damageDealt
 * @property {number} attacks
 * @property {number} heals
 * @property {number} blocks
 * @property {number} blockedUntilMs
 * @property {number} lastActionMs
 * @property {number} joinedAt
 */

export function createChatter(login) {
  return {
    login,
    hp: CHATTER_BASE_HP,
    maxHp: CHATTER_BASE_HP,
    damageDealt: 0,
    attacks: 0,
    heals: 0,
    blocks: 0,
    blockedUntilMs: 0,
    lastActionMs: 0,
    joinedAt: Date.now(),
  };
}

export function ensureChatter(roster, login) {
  let c = roster.get(login);
  if (!c) {
    c = createChatter(login);
    roster.set(login, c);
  }
  return c;
}

/** Returns true if the chatter is allowed to act now (and updates the cooldown). */
export function tryConsumeCooldown(chatter, now = Date.now()) {
  if (now - chatter.lastActionMs < CHATTER_ACTION_COOLDOWN_MS) return false;
  chatter.lastActionMs = now;
  return true;
}

export function aliveCount(roster) {
  let n = 0;
  for (const c of roster.values()) if (c.hp > 0) n++;
  return n;
}
