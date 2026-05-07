import { describe, expect, it } from 'vitest';

import {
  CHATTER_BASE_ATTACK_DAMAGE,
  CHAT_DMG_LEVEL_SLOPE,
  CRIT_CAP_PCT,
  DEFENSE_CAP_PCT,
  STAT_DEFS,
  bossAttackIntervalMs,
  computeAbilityDamage,
  computeBossBasicDamage,
  computeChatAttackDamage,
  deriveStats,
  effectiveBossMaxHP,
  effectiveCritPct,
  effectiveDefensePct,
} from '@bossraid/shared';

describe('deriveStats', () => {
  it('returns base values with no points spent', () => {
    const s = deriveStats({});
    expect(s.hp).toBe(STAT_DEFS.hp.base);
    expect(s.attack).toBe(STAT_DEFS.attack.base);
    expect(s.defense).toBe(STAT_DEFS.defense.base);
    expect(s.speed).toBe(STAT_DEFS.speed.base);
    expect(s.crit).toBe(STAT_DEFS.crit.base);
    expect(s.abilityPower).toBe(STAT_DEFS.abilityPower.base);
  });

  it('adds perPoint × points to base for each stat', () => {
    const s = deriveStats({ hp: 4, attack: 2, defense: 1, speed: 0, crit: 3, abilityPower: 5 });
    expect(s.hp).toBe(STAT_DEFS.hp.base + 4 * STAT_DEFS.hp.perPoint);
    expect(s.attack).toBe(STAT_DEFS.attack.base + 2 * STAT_DEFS.attack.perPoint);
    expect(s.defense).toBe(STAT_DEFS.defense.base + 1 * STAT_DEFS.defense.perPoint);
    expect(s.speed).toBe(STAT_DEFS.speed.base);
    expect(s.crit).toBe(STAT_DEFS.crit.base + 3 * STAT_DEFS.crit.perPoint);
    expect(s.abilityPower).toBe(STAT_DEFS.abilityPower.base + 5 * STAT_DEFS.abilityPower.perPoint);
  });
});

describe('stat caps', () => {
  it('defense % is capped at DEFENSE_CAP_PCT', () => {
    expect(effectiveDefensePct({ defense: 999 })).toBe(DEFENSE_CAP_PCT);
    expect(effectiveDefensePct({ defense: 30 })).toBe(30);
  });

  it('crit % is capped at CRIT_CAP_PCT', () => {
    expect(effectiveCritPct({ crit: 999 })).toBe(CRIT_CAP_PCT);
    expect(effectiveCritPct({ crit: 12 })).toBe(12);
  });
});

describe('boss attack cadence', () => {
  it('attack interval scales inversely with speed', () => {
    const slow = bossAttackIntervalMs({ speed: 50 });
    const base = bossAttackIntervalMs({ speed: 100 });
    const fast = bossAttackIntervalMs({ speed: 200 });
    expect(slow).toBeGreaterThan(base);
    expect(fast).toBeLessThan(base);
    // 200 speed = 2x faster (attack interval halves)
    expect(fast).toBeCloseTo(base / 2, 0);
  });
});

describe('boss HP crowd scaling', () => {
  it('does not shrink boss HP at low chatter counts', () => {
    const stats = { hp: 3000 };
    expect(effectiveBossMaxHP(stats, 1)).toBe(3000);
    expect(effectiveBossMaxHP(stats, 30)).toBe(3000);
  });

  it('scales sub-linearly with crowd size past the baseline', () => {
    const stats = { hp: 3000 };
    expect(effectiveBossMaxHP(stats, 120)).toBe(6000); // sqrt(120/30)=2
    expect(effectiveBossMaxHP(stats, 480)).toBe(12000); // sqrt(16)=4
    // sqrt scaling — never linear
    expect(effectiveBossMaxHP(stats, 1000)).toBeLessThan(stats.hp * (1000 / 30));
  });
});

describe('chat damage scaling', () => {
  const args = { bossLevel: 1, chatterCount: 1, bossDefensePct: 0 };

  it('starts at base damage at level 1 with no defense', () => {
    expect(computeChatAttackDamage(args)).toBe(CHATTER_BASE_ATTACK_DAMAGE);
  });

  it('scales with boss level via CHAT_DMG_LEVEL_SLOPE', () => {
    const lvl1 = computeChatAttackDamage({ ...args, bossLevel: 1 });
    const lvl5 = computeChatAttackDamage({ ...args, bossLevel: 5 });
    expect(lvl5).toBeGreaterThan(lvl1);
    expect(lvl5).toBe(Math.round(CHATTER_BASE_ATTACK_DAMAGE * (1 + 4 * CHAT_DMG_LEVEL_SLOPE)));
  });

  it('softens past the chatter baseline (sqrt curve)', () => {
    const at60 = computeChatAttackDamage({ ...args, chatterCount: 60 });
    const at240 = computeChatAttackDamage({ ...args, chatterCount: 240 });
    // 240 chatters → softening = sqrt(60/240) = 0.5
    expect(at240).toBeCloseTo(Math.round(at60 * 0.5), 0);
  });

  it('does not soften below the baseline', () => {
    const a = computeChatAttackDamage({ ...args, chatterCount: 1 });
    const b = computeChatAttackDamage({ ...args, chatterCount: 60 });
    expect(a).toBe(b);
  });

  it('reduces by boss defense', () => {
    const noDef = computeChatAttackDamage({ ...args, bossDefensePct: 0 });
    const halfDef = computeChatAttackDamage({ ...args, bossDefensePct: 50 });
    expect(halfDef).toBeCloseTo(Math.round(noDef * 0.5), 0);
  });

  it('caps boss defense at DEFENSE_CAP_PCT', () => {
    const overcapped = computeChatAttackDamage({ ...args, bossDefensePct: 999 });
    const atCap = computeChatAttackDamage({ ...args, bossDefensePct: DEFENSE_CAP_PCT });
    expect(overcapped).toBe(atCap);
  });

  it('always deals at least 1 damage', () => {
    const huge = computeChatAttackDamage({ ...args, bossLevel: 1, chatterCount: 99999, bossDefensePct: 50 });
    expect(huge).toBeGreaterThanOrEqual(1);
  });
});

describe('boss melee damage', () => {
  it('uses attack stat', () => {
    expect(computeBossBasicDamage({ stats: { attack: 25 }, isCrit: false })).toBe(25);
    expect(computeBossBasicDamage({ stats: { attack: 100 }, isCrit: false })).toBe(100);
  });

  it('crits double the damage', () => {
    expect(computeBossBasicDamage({ stats: { attack: 50 }, isCrit: true })).toBe(100);
  });
});

describe('ability damage', () => {
  it('scales by abilityPower (basis 100)', () => {
    expect(computeAbilityDamage({ baseDamage: 80, stats: { abilityPower: 100 }, isCrit: false })).toBe(80);
    expect(computeAbilityDamage({ baseDamage: 80, stats: { abilityPower: 200 }, isCrit: false })).toBe(160);
    expect(computeAbilityDamage({ baseDamage: 80, stats: { abilityPower: 50 }, isCrit: false })).toBe(40);
  });

  it('respects crits', () => {
    expect(computeAbilityDamage({ baseDamage: 80, stats: { abilityPower: 100 }, isCrit: true })).toBe(160);
  });
});
