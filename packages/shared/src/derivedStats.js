import {
  BOSS_BASE_ATTACK_INTERVAL_MS,
  BOSS_HP_CROWD_SCALE_BASELINE,
  CHATTER_BASE_ATTACK_DAMAGE,
  CHAT_DAMAGE_SOFTEN_BASELINE,
  CHAT_DMG_LEVEL_SLOPE,
  CRIT_CAP_PCT,
  DEFENSE_CAP_PCT,
  STAT_DEFS,
  STAT_NAMES,
} from './constants.js';

/**
 * Convert spent-points to derived stats. Source of truth for the stat formulas.
 *
 * @param {Record<string, number>} spent  e.g. { hp: 4, attack: 2, ... }
 * @returns {Record<string, number>}
 */
export function deriveStats(spent = {}) {
  const out = {};
  for (const name of STAT_NAMES) {
    const def = STAT_DEFS[name];
    const points = spent[name] || 0;
    out[name] = def.base + points * def.perPoint;
  }
  return out;
}

/** Defense % is hard-capped to keep monsters killable. */
export function effectiveDefensePct(stats) {
  return Math.min(DEFENSE_CAP_PCT, stats.defense || 0);
}

/** Crit % is hard-capped so a crit never feels guaranteed. */
export function effectiveCritPct(stats) {
  return Math.min(CRIT_CAP_PCT, stats.crit || 0);
}

/** ms between basic boss attacks at the given speed stat (basis 100). */
export function bossAttackIntervalMs(stats) {
  const speed = Math.max(10, stats.speed || 100);
  return BOSS_BASE_ATTACK_INTERVAL_MS * (100 / speed);
}

/** Total HP including crowd scaling. */
export function effectiveBossMaxHP(stats, chatterCount = 0) {
  const base = stats.hp;
  const scale = Math.sqrt(Math.max(1, chatterCount / BOSS_HP_CROWD_SCALE_BASELINE));
  return Math.round(base * scale);
}

/**
 * Per-chatter attack damage to the boss, including:
 *   - boss-level scaling (chat gets stronger as monster levels up),
 *   - crowd softening (per-hit damage shrinks past the baseline so a 500-chatter
 *     fight isn't trivial),
 *   - boss defense reduction.
 */
export function computeChatAttackDamage({ bossLevel, chatterCount, bossDefensePct }) {
  const base = CHATTER_BASE_ATTACK_DAMAGE;
  const lvlMult = 1 + (Math.max(1, bossLevel) - 1) * CHAT_DMG_LEVEL_SLOPE;
  const softening = Math.min(1, Math.sqrt(CHAT_DAMAGE_SOFTEN_BASELINE / Math.max(1, chatterCount)));
  const dr = 1 - Math.min(DEFENSE_CAP_PCT, bossDefensePct) / 100;
  return Math.max(1, Math.round(base * lvlMult * softening * dr));
}

/** Boss melee damage to a chatter (with crit roll). */
export function computeBossBasicDamage({ stats, isCrit }) {
  const base = stats.attack || 25;
  const mult = isCrit ? 2 : 1;
  return Math.max(1, Math.round(base * mult));
}

/** Ability damage scaled by ability power. */
export function computeAbilityDamage({ baseDamage, stats, isCrit }) {
  const ap = (stats.abilityPower || 100) / 100;
  const critMult = isCrit ? 2 : 1;
  return Math.max(0, Math.round(baseDamage * ap * critMult));
}
